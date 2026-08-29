import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
import { MIDTRANS_CONFIG } from "@/lib/constants";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      fraud_status,
    } = body;

    // 1. Inisialisasi Supabase Admin Client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseServiceKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 2. Ambil Server Key dari database (fallback ke constants / env)
    const { data: settingData } = await supabase
      .from("system_settings")
      .select("value")
      .eq("key", "midtrans_config")
      .maybeSingle();

    const serverKey =
      settingData?.value?.server_key ||
      MIDTRANS_CONFIG.serverKey ||
      process.env.MIDTRANS_SERVER_KEY ||
      "";

    // 3. Verifikasi Keamanan Signature Key (SHA512)
    const payloadToHash = `${order_id}${status_code}${gross_amount}${serverKey}`;
    const calculatedSignature = crypto
      .createHash("sha512")
      .update(payloadToHash)
      .digest("hex");

    if (calculatedSignature !== signature_key) {
      return NextResponse.json(
        { error: "Invalid signature key." },
        { status: 403 }
      );
    }

    // 4. Cari pesanan berdasarkan nomor order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, status, payment_status, total_amount, user_id")
      .eq("order_number", order_id)
      .maybeSingle();

    if (orderError || !order) {
      return NextResponse.json(
        { error: "Order not found." },
        { status: 404 }
      );
    }

    // 5. Tentukan status pembayaran baru
    let newPaymentStatus: "paid" | "unpaid" | "failed" = "unpaid";
    let newOrderStatus: "processing" | "pending" | "cancelled" = "pending";

    if (transaction_status === "capture") {
      if (fraud_status === "accept") {
        newPaymentStatus = "paid";
        newOrderStatus = "processing";
      }
    } else if (transaction_status === "settlement") {
      newPaymentStatus = "paid";
      newOrderStatus = "processing";
    } else if (
      transaction_status === "cancel" ||
      transaction_status === "deny" ||
      transaction_status === "expire"
    ) {
      newPaymentStatus = "failed";
      newOrderStatus = "cancelled";
    } else if (transaction_status === "pending") {
      newPaymentStatus = "unpaid";
      newOrderStatus = "pending";
    }

    // 6. Update status order di database
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        payment_status: newPaymentStatus,
        status: newOrderStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", order.id);

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to update order status." },
        { status: 500 }
      );
    }

    // 7. Catat mutasi ledger jika order lunas dan ada akun user
    if (newPaymentStatus === "paid" && order.user_id) {
      const { data: wallet } = await supabase
        .from("wallets")
        .select("id")
        .eq("user_id", order.user_id)
        .maybeSingle();

      if (wallet) {
        await supabase.from("wallet_transactions").insert({
          wallet_id: wallet.id,
          user_id: order.user_id,
          amount: Number(order.total_amount),
          type: "order_payment",
          description: `Settled payment for order #${order_id}`,
          reference_id: order.id,
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Webhook processed: Order #${order_id} is now ${newPaymentStatus}.`,
    });
  } catch (error: any) {
    console.error("Midtrans Webhook Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error." },
      { status: 500 }
    );
  }
}