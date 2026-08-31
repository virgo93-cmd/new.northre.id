import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { verifyShippingQuoteToken } from "@/lib/shipping-quote";
import type { Json } from "../../../../types/database.types";

interface CheckoutItem {
  id: string;
  quantity: number;
  selectedAttributes?: Record<string, string>;
}

interface CheckoutCustomer {
  address: string;
  email: string;
  firstName: string;
  lastName?: string;
  phone: string;
}

function stringAttributes(value: Json): string[] {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return [];
  return Object.values(value)
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.toUpperCase());
}

function matchesVariant(attributes: Json, selected: Record<string, string> | undefined) {
  if (!selected || Object.keys(selected).length === 0) return false;
  const values = stringAttributes(attributes);
  return Object.values(selected).every((selectedValue) =>
    values.some((value) => value.includes(selectedValue.toUpperCase())),
  );
}

function cleanText(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export async function POST(request: Request) {
  const admin = createAdminClient();
  let createdOrderId: string | null = null;

  try {
    const body = (await request.json()) as {
      customer?: CheckoutCustomer;
      items?: CheckoutItem[];
      shippingQuoteToken?: string;
    };
    const customer = body.customer;
    const quote = body.shippingQuoteToken ? verifyShippingQuoteToken(body.shippingQuoteToken) : null;
    if (!customer || !quote || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ message: "Checkout data or shipping quote is invalid." }, { status: 400 });
    }

    const email = cleanText(customer.email, 254).toLowerCase();
    const firstName = cleanText(customer.firstName, 80);
    const lastName = cleanText(customer.lastName, 80);
    const phone = cleanText(customer.phone, 30);
    const address = cleanText(customer.address, 500);
    if (!email.includes("@") || !firstName || !phone || !address) {
      return NextResponse.json({ message: "Customer information is incomplete." }, { status: 400 });
    }

    const quantities = new Map<string, number>();
    for (const item of body.items) {
      if (!item.id || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 100) {
        return NextResponse.json({ message: "Cart contains an invalid item." }, { status: 400 });
      }
      quantities.set(item.id, (quantities.get(item.id) ?? 0) + item.quantity);
    }

    const { data: products, error: productError } = await admin
      .from("products")
      .select("id, name, image_url, regular_price, sale_price, sku, status, stock_status, stock_quantity, weight, variants:product_variants(*)")
      .in("id", [...quantities.keys()]);
    if (productError || !products || products.length !== quantities.size) {
      return NextResponse.json({ message: "One or more products are unavailable." }, { status: 400 });
    }

    let calculatedWeightKg = 0;
    const orderItems = products.map((product) => {
      const requestItem = body.items!.find((item) => item.id === product.id)!;
      const quantity = quantities.get(product.id)!;
      if (product.status !== "publish" || product.stock_status === "outofstock") {
        throw new Error(`${product.name} is currently unavailable.`);
      }
      if (product.stock_quantity !== null && product.stock_quantity < quantity) {
        throw new Error(`Insufficient stock for ${product.name}.`);
      }

      const variant = product.variants.find((candidate) => matchesVariant(candidate.attributes, requestItem.selectedAttributes));
      if (requestItem.selectedAttributes && Object.keys(requestItem.selectedAttributes).length > 0 && !variant) {
        throw new Error(`The selected variant for ${product.name} is unavailable.`);
      }
      if (variant?.stock_status === "outofstock" ||
        (variant?.stock_quantity !== null && variant?.stock_quantity !== undefined && variant.stock_quantity < quantity)) {
        throw new Error(`Insufficient variant stock for ${product.name}.`);
      }

      const regularPrice = Number(variant?.regular_price ?? product.regular_price);
      const salePrice = Number(variant?.sale_price ?? product.sale_price ?? 0);
      const unitPrice = salePrice > 0 && salePrice < regularPrice ? salePrice : regularPrice;
      calculatedWeightKg += Math.max(Number(product.weight) || 0, 1) * quantity / 1000;
      return {
        product_id: product.id,
        product_image: product.image_url,
        product_name: product.name,
        product_sku: variant?.sku ?? product.sku,
        quantity,
        subtotal: unitPrice * quantity,
        unit_price: unitPrice,
      };
    });

    if (Math.abs(Math.max(calculatedWeightKg, 0.001) - quote.weightKg) > 0.0001) {
      return NextResponse.json({ message: "Cart changed after shipping was calculated. Please select shipping again." }, { status: 409 });
    }

    const subtotal = orderItems.reduce((sum, item) => sum + item.subtotal, 0);
    const totalAmount = subtotal + quote.price;
    if (!Number.isSafeInteger(totalAmount) || totalAmount <= 0) {
      return NextResponse.json({ message: "Order total is invalid." }, { status: 400 });
    }

    const authClient = await createClient();
    const { data: { user } } = await authClient.auth.getUser();
    const orderNumber = `NR-${Date.now().toString(36).toUpperCase()}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;
    const { data: order, error: orderError } = await admin.from("orders").insert({
      customer_email: email,
      customer_id: user?.id ?? null,
      customer_name: `${firstName} ${lastName}`.trim(),
      customer_phone: phone,
      order_number: orderNumber,
      payment_method: "midtrans",
      payment_status: "unpaid",
      shipping_address: address,
      shipping_city: quote.city,
      shipping_cost: quote.price,
      shipping_courier: quote.courier,
      shipping_postal_code: quote.postalCode,
      shipping_province: quote.province,
      shipping_service: quote.service,
      status: "pending",
      subtotal,
      total_amount: totalAmount,
    }).select("id").single();
    if (orderError || !order) throw new Error("Unable to create the order.");
    createdOrderId = order.id;

    const { error: itemError } = await admin.from("order_items").insert(
      orderItems.map((item) => ({ ...item, order_id: order.id })),
    );
    if (itemError) throw new Error("Unable to save order items.");

    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    if (!serverKey) throw new Error("Midtrans is not configured.");
    const midtransBaseUrl = serverKey.startsWith("SB-")
      ? "https://app.sandbox.midtrans.com"
      : "https://app.midtrans.com";
    const authorization = Buffer.from(`${serverKey}:`).toString("base64");
    const midtransResponse = await fetch(`${midtransBaseUrl}/snap/v1/transactions`, {
      method: "POST",
      headers: { Authorization: `Basic ${authorization}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        transaction_details: { order_id: orderNumber, gross_amount: totalAmount },
        customer_details: {
          email,
          first_name: firstName,
          last_name: lastName,
          phone,
          shipping_address: {
            address,
            city: quote.city,
            country_code: "IDN",
            first_name: firstName,
            last_name: lastName,
            phone,
            postal_code: quote.postalCode,
          },
        },
        item_details: [
          ...orderItems.map((item) => ({
            id: item.product_id,
            name: item.product_name.slice(0, 50),
            price: item.unit_price,
            quantity: item.quantity,
          })),
          { id: "shipping", name: `${quote.courier} ${quote.service}`.slice(0, 50), price: quote.price, quantity: 1 },
        ],
      }),
      signal: AbortSignal.timeout(15_000),
    });
    const midtransResult = (await midtransResponse.json()) as {
      token?: string;
      error_messages?: string[];
    };
    if (!midtransResponse.ok || !midtransResult.token) {
      throw new Error(midtransResult.error_messages?.join(", ") || "Midtrans rejected the transaction.");
    }

    return NextResponse.json({ token: midtransResult.token, orderId: orderNumber });
  } catch (error: unknown) {
    console.error("Checkout API error:", error);
    if (createdOrderId) {
      await admin.from("orders").update({
        admin_notes: "Checkout initialization failed before payment.",
        status: "cancelled",
        updated_at: new Date().toISOString(),
      }).eq("id", createdOrderId);
    }
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Checkout could not be completed." },
      { status: 500 },
    );
  }
}
