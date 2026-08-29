import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { MENGANTAR_CONFIG } from "@/lib/constants";

export async function POST(req: NextRequest) {
  try {
    // 1. Inisialisasi Supabase Client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseServiceKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 2. Ambil Secret Token dari database (fallback ke constants / env)
    const { data: settingData } = await supabase
      .from("system_settings")
      .select("value")
      .eq("key", "mengantar_config")
      .maybeSingle();

    const configuredSecret =
      settingData?.value?.webhook_secret ||
      MENGANTAR_CONFIG.webhookSecret ||
      process.env.MENGANTAR_WEBHOOK_SECRET ||
      "";

    // 3. Verifikasi Secret Token jika diatur
    const incomingSecret =
      req.headers.get("x-mengantar-secret") || req.headers.get("authorization");

    if (
      configuredSecret &&
      incomingSecret !== configuredSecret &&
      incomingSecret !== `Bearer ${configuredSecret}`
    ) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid webhook secret token." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const trackingNumber = body.tracking_number || body.awb || body.resi;
    const orderNumber = body.order_id || body.reference_id;
    const rawStatus = (body.status || body.shipping_status || "").toUpperCase();

    if (!trackingNumber && !orderNumber) {
      return NextResponse.json(
        { error: "Missing tracking_number or order_id in webhook payload." },
        { status: 400 }
      );
    }

    // 4. Cari pesanan berdasarkan tracking number atau order number
    let orderQuery = supabase.from("orders").select("*");
    if (orderNumber) {
      orderQuery = orderQuery.eq("order_number", orderNumber);
    } else if (trackingNumber) {
      orderQuery = orderQuery.eq("tracking_number", trackingNumber);
    }

    const { data: order, error: orderError } = await orderQuery.maybeSingle();

    if (orderError || !order) {
      return NextResponse.json(
        { error: "Order not found for the provided shipment data." },
        { status: 404 }
      );
    }

    // 5. Mapping status ekspedisi
    let newOrderStatus: "pending" | "processing" | "shipped" | "delivered" | "cancelled" =
      order.status;

    if (["PICKED_UP", "IN_TRANSIT", "ON_PROCESS", "SHIPPED"].includes(rawStatus)) {
      newOrderStatus = "shipped";
    } else if (["DELIVERED", "COMPLETED", "SUCCESS"].includes(rawStatus)) {
      newOrderStatus = "delivered";
    } else if (["RETURNED", "CANCELLED", "FAILED"].includes(rawStatus)) {
      newOrderStatus = "cancelled";
    }

    // 6. Update database order & resi
    const updatePayload: Record<string, any> = {
      status: newOrderStatus,
      updated_at: new Date().toISOString(),
    };

    if (trackingNumber && !order.tracking_number) {
      updatePayload.tracking_number = trackingNumber;
    }

    const { error: updateError } = await supabase
      .from("orders")
      .update(updatePayload)
      .eq("id", order.id);

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to update shipment status." },
        { status: 500 }
      );
    }

    // 7. Trigger komisi afiliasi saat pesanan sampai (DELIVERED)
    if (newOrderStatus === "delivered" && order.status !== "delivered" && order.user_id) {
      const { data: userProfile } = await supabase
        .from("profiles")
        .select("id, referred_by")
        .eq("id", order.user_id)
        .maybeSingle();

      if (userProfile?.referred_by) {
        const { data: referrerWallet } = await supabase
          .from("wallets")
          .select("id, balance, total_earned")
          .eq("user_id", userProfile.referred_by)
          .maybeSingle();

        if (referrerWallet) {
          const commissionAmount = Math.round(Number(order.total_amount) * 0.05);

          if (commissionAmount > 0) {
            await supabase
              .from("wallets")
              .update({
                balance: Number(referrerWallet.balance) + commissionAmount,
                total_earned: Number(referrerWallet.total_earned) + commissionAmount,
                updated_at: new Date().toISOString(),
              })
              .eq("id", referrerWallet.id);

            await supabase.from("wallet_transactions").insert({
              wallet_id: referrerWallet.id,
              user_id: userProfile.referred_by,
              amount: commissionAmount,
              type: "affiliate_commission",
              description: `Affiliate referral reward for Order #${order.order_number}`,
              reference_id: order.id,
            });
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Mengantar webhook processed: Order #${order.order_number} status updated to ${newOrderStatus}.`,
    });
  } catch (error: any) {
    console.error("Mengantar Webhook Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error." },
      { status: 500 }
    );
  }
}