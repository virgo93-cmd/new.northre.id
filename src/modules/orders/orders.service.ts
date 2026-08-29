import { createClient } from "@/lib/supabase/client";

export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded";
export type PaymentStatus = "unpaid" | "paid" | "failed" | "refunded";

export interface OrderItem {
  id?: string;
  order_id?: string;
  product_id?: string | null;
  product_name: string;
  product_sku?: string | null;
  product_image?: string | null;
  unit_price: number;
  quantity: number;
  subtotal: number;
  created_at?: string;
}

export interface Order {
  id?: string;
  order_number: string;
  customer_id?: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  shipping_city?: string | null;
  shipping_province?: string | null;
  shipping_postal_code?: string | null;
  shipping_courier?: string | null;
  shipping_service?: string | null;
  shipping_tracking_number?: string | null;
  subtotal: number;
  shipping_cost: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method?: string | null;
  payment_reference?: string | null;
  customer_notes?: string | null;
  admin_notes?: string | null;
  created_at?: string;
  updated_at?: string;
  order_items?: OrderItem[];
}

export interface GetOrdersParams {
  search?: string;
  status?: OrderStatus | "all";
  payment_status?: PaymentStatus | "all";
  page?: number;
  limit?: number;
}

export async function getOrders({
  search = "",
  status = "all",
  payment_status = "all",
  page = 1,
  limit = 10,
}: GetOrdersParams = {}) {
  const supabase = createClient();
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("orders")
    .select("*, order_items(*)", { count: "exact" })
    .order("created_at", { ascending: false });

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  if (payment_status && payment_status !== "all") {
    query = query.eq("payment_status", payment_status);
  }

  if (search.trim()) {
    query = query.or(
      `order_number.ilike.%${search.trim()}%,customer_name.ilike.%${search.trim()}%,customer_email.ilike.%${search.trim()}%`
    );
  }

  const { data, error, count } = await query.range(from, to);

  if (error) {
    console.error("Error fetching orders:", error.message);
    return { data: [] as Order[], count: 0, totalPages: 0 };
  }

  return {
    data: (data || []) as Order[],
    count: count || 0,
    totalPages: Math.ceil((count || 0) / limit),
  };
}

export async function getOrderById(id: string): Promise<Order | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Error fetching order details:", error.message);
    return null;
  }

  return data as Order | null;
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as Order;
}

export async function updatePaymentStatus(id: string, payment_status: PaymentStatus) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("orders")
    .update({ payment_status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as Order;
}

export async function updateShippingTracking(
  id: string,
  payload: { shipping_courier?: string; shipping_tracking_number?: string }
) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("orders")
    .update({
      ...payload,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as Order;
}