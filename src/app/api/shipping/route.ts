import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createShippingQuoteToken } from "@/lib/shipping-quote";

const MENGANTAR_BASE_URL = "https://api-public.mengantar.com";
const DISCONTINUED_COURIERS = new Set(["ninja"]);

interface CartItemInput {
  id: string;
  quantity: number;
}

interface LocationInput {
  _id: string;
  CITY_NAME?: string;
  DISTRICT_NAME?: string;
  PROVINCE_NAME?: string;
  SUBDISTRICT_NAME?: string;
  ZIP_CODE?: string;
}

interface MengantarRate {
  estimate_delivery?: string;
  estimatedDate?: string;
  estimatedPrice?: number;
  estimatedSpecialPrice?: number;
  price?: number;
  unsupported?: boolean;
}

async function getProductWeightKg(items: CartItemInput[]) {
  const quantities = new Map<string, number>();
  for (const item of items) {
    if (!item.id || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 100) {
      throw new Error("Invalid cart item.");
    }
    quantities.set(item.id, (quantities.get(item.id) ?? 0) + item.quantity);
  }

  const ids = [...quantities.keys()];
  if (ids.length === 0) throw new Error("Cart is empty.");

  const supabase = createAdminClient();
  const { data: products, error } = await supabase.from("products").select("id, weight").in("id", ids);
  if (error || !products || products.length !== ids.length) throw new Error("Some products could not be found.");

  const grams = products.reduce(
    (total, product) => total + Math.max(Number(product.weight) || 0, 1) * (quantities.get(product.id) ?? 0),
    0,
  );
  return Math.max(grams / 1000, 0.001);
}

function apiUrl(apiKey: string, path: string) {
  return `${MENGANTAR_BASE_URL}/api/public/${encodeURIComponent(apiKey)}${path}`;
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.MENGANTAR_API_KEY;
    if (!apiKey) return NextResponse.json({ message: "Shipping integration is not configured." }, { status: 503 });

    const body = (await request.json()) as {
      action?: string;
      destination_id?: string;
      items?: CartItemInput[];
      keyword?: string;
      location?: LocationInput;
    };

    if (body.action === "searchLocation") {
      const keyword = body.keyword?.trim() ?? "";
      if (keyword.length < 3 || keyword.length > 100) {
        return NextResponse.json({ message: "Location keyword must contain 3-100 characters." }, { status: 400 });
      }
      const response = await fetch(apiUrl(apiKey, `/address/search?keyword=${encodeURIComponent(keyword)}`), {
        signal: AbortSignal.timeout(10_000),
      });
      const result = await response.json();
      return NextResponse.json(result, { status: response.ok ? 200 : 502 });
    }

    if (body.action === "getRates") {
      const originId = process.env.MENGANTAR_PICKUP_ADDRESS_ID;
      if (!originId) {
        return NextResponse.json({ message: "Pickup address has not been selected." }, { status: 503 });
      }
      if (!body.destination_id || !Array.isArray(body.items) || body.location?._id !== body.destination_id) {
        return NextResponse.json({ message: "Destination and cart items are required." }, { status: 400 });
      }
      const location = body.location;

      const weightKg = await getProductWeightKg(body.items);
      const query = new URLSearchParams({
        origin_id: originId,
        destination_id: body.destination_id,
        courier: "all",
        weight: String(weightKg),
        COD_AMOUNT: "0",
      });
      const response = await fetch(apiUrl(apiKey, `/order/estimate?${query}`), {
        signal: AbortSignal.timeout(15_000),
      });
      const result = (await response.json()) as { success?: boolean; data?: Record<string, MengantarRate> };
      if (!response.ok || !result.success || !result.data) {
        return NextResponse.json({ message: "Mengantar could not calculate shipping rates." }, { status: 502 });
      }

      const data = Object.fromEntries(
        Object.entries(result.data).flatMap(([courier, rate]) => {
          if (DISCONTINUED_COURIERS.has(courier.toLowerCase()) || rate.unsupported) return [];
          const price = Number(rate.estimatedSpecialPrice ?? rate.estimatedPrice ?? rate.price ?? 0);
          if (!Number.isFinite(price) || price <= 0) return [];
          const service = rate.estimate_delivery ?? rate.estimatedDate ?? "Regular";
          return [[courier, {
            courier,
            estimatedDate: service,
            price,
            quoteToken: createShippingQuoteToken({
              city: location.CITY_NAME ?? "",
              courier,
              destinationId: body.destination_id!,
              district: location.SUBDISTRICT_NAME ?? location.DISTRICT_NAME ?? "",
              expiresAt: Date.now() + 10 * 60 * 1000,
              price,
              province: location.PROVINCE_NAME ?? "",
              postalCode: location.ZIP_CODE ?? "",
              service,
              weightKg,
            }),
          }]];
        }),
      );
      return NextResponse.json({ success: true, data });
    }

    return NextResponse.json({ message: "Unknown shipping action." }, { status: 400 });
  } catch (error: unknown) {
    console.error("Shipping API error:", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unable to calculate shipping." },
      { status: 500 },
    );
  }
}
