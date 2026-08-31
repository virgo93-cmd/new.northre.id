import { createHmac, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const MAX_WEBHOOK_AGE_MS = 5 * 60 * 1000;

type MengantarWebhookPayload = {
  cnote_no?: string;
  order_id?: string;
  status_category?: string;
};

function signaturesMatch(expected: string, received: string) {
  const expectedBuffer = Buffer.from(expected, "hex");
  const receivedBuffer = Buffer.from(received, "hex");
  return expectedBuffer.length > 0 && expectedBuffer.length === receivedBuffer.length &&
    timingSafeEqual(expectedBuffer, receivedBuffer);
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createAdminClient();
    const { data: settingData } = await supabase
      .from("system_settings")
      .select("value")
      .eq("key", "mengantar_config")
      .maybeSingle();

    const storedConfig = settingData?.value && typeof settingData.value === "object" &&
      !Array.isArray(settingData.value) ? settingData.value : null;
    const storedSecret = storedConfig && "webhook_secret" in storedConfig &&
      typeof storedConfig.webhook_secret === "string" ? storedConfig.webhook_secret : "";
    const secret = process.env.MENGANTAR_WEBHOOK_SECRET || storedSecret;

    if (!secret) {
      console.error("Mengantar webhook secret is not configured.");
      return NextResponse.json({ error: "Webhook is not configured." }, { status: 503 });
    }

    const timestamp = req.headers.get("x-timestamp") || "";
    const receivedSignature = req.headers.get("x-signature") || "";
    const timestampMs = Number(timestamp);
    const rawBody = await req.text();
    const expectedSignature = createHmac("sha256", secret)
      .update(`${timestamp}.${rawBody}`)
      .digest("hex");

    if (!Number.isFinite(timestampMs) || Math.abs(Date.now() - timestampMs) > MAX_WEBHOOK_AGE_MS ||
      !signaturesMatch(expectedSignature, receivedSignature)) {
      return NextResponse.json({ error: "Invalid webhook signature." }, { status: 401 });
    }

    let body: MengantarWebhookPayload;
    try {
      body = JSON.parse(rawBody) as MengantarWebhookPayload;
    } catch {
      return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
    }

    const trackingNumber = body.cnote_no?.trim();
    const mengantarOrderNumber = body.order_id?.trim();
    const rawStatus = body.status_category?.trim().toUpperCase().replaceAll("_", " ") || "";

    if (!trackingNumber && !mengantarOrderNumber) {
      return NextResponse.json({ error: "Missing cnote_no or order_id." }, { status: 400 });
    }

    // AWB is the reliable key until the Mengantar order ID is persisted at fulfilment time.
    let orderQuery = supabase.from("orders").select("*");
    if (trackingNumber) {
      orderQuery = orderQuery.eq("shipping_tracking_number", trackingNumber);
    } else {
      orderQuery = orderQuery.eq("order_number", mengantarOrderNumber!);
    }

    const { data: order, error: orderError } = await orderQuery.maybeSingle();
    if (orderError || !order) {
      return NextResponse.json({ error: "Order not found for this shipment." }, { status: 404 });
    }

    let newOrderStatus: "pending" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded" =
      order.status;
    if (["PICKED UP", "IN TRANSIT", "ON DELIVERY", "SHIPPED"].includes(rawStatus)) {
      newOrderStatus = "shipped";
    } else if (rawStatus === "DELIVERED") {
      newOrderStatus = "delivered";
    } else if (["CANCELED", "CANCELLED", "RTS"].includes(rawStatus)) {
      newOrderStatus = "cancelled";
    }

    const updatePayload: {
      status: typeof newOrderStatus;
      updated_at: string;
      shipping_tracking_number?: string;
    } = { status: newOrderStatus, updated_at: new Date().toISOString() };
    if (trackingNumber && !order.shipping_tracking_number) {
      updatePayload.shipping_tracking_number = trackingNumber;
    }

    const { error: updateError } = await supabase.from("orders").update(updatePayload).eq("id", order.id);
    if (updateError) {
      return NextResponse.json({ error: "Failed to update shipment status." }, { status: 500 });
    }

    if (newOrderStatus === "delivered" && order.status !== "delivered" && order.customer_id) {
      const { data: userProfile } = await supabase.from("profiles").select("id, referred_by")
        .eq("id", order.customer_id).maybeSingle();
      if (userProfile?.referred_by) {
        const commissionAmount = Math.round(Number(order.total_amount) * 0.05);
        if (commissionAmount > 0) {
          const { error: commissionError } = await supabase.rpc("credit_affiliate_commission", {
            p_order_id: order.id,
            p_referrer_id: userProfile.referred_by,
            p_amount: commissionAmount,
            p_description: `Affiliate referral reward for Order #${order.order_number}`,
          });
          if (commissionError) {
            console.error("Failed to credit affiliate commission:", commissionError.message);
            return NextResponse.json({ error: "Failed to credit affiliate commission." }, { status: 500 });
          }
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Mengantar webhook error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error." },
      { status: 500 },
    );
  }
}
