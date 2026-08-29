import { createClient } from "@/lib/supabase/client";

export interface TopProductItem {
  id: string;
  name: string;
  thumbnail_url: string | null;
  price: number;
  total_sold: number;
  total_revenue: number;
}

export interface RecentCustomerItem {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface RevenueChartItem {
  date: string;
  dayLabel: string;
  amount: number;
}

export interface DashboardOverviewData {
  metrics: {
    totalRevenue: number;
    totalOrders: number;
    totalCustomers: number;
    lowStockCount: number;
  };
  recentOrders: Array<{
    id: string;
    order_number: string;
    total_amount: number;
    status: string;
    payment_status: string;
    created_at: string;
  }>;
  orderStats: {
    pending: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  };
  topProducts: TopProductItem[];
  recentCustomers: RecentCustomerItem[];
  revenueChart: RevenueChartItem[];
}

export async function getDashboardOverviewData(
  dateRange: "today" | "7d" | "30d" | "all" | "custom" = "7d",
  customStart?: string,
  customEnd?: string
): Promise<DashboardOverviewData> {
  const supabase = createClient();

  let startDate: Date | null = null;
  let endDate: Date | null = null;
  const now = new Date();

  if (dateRange === "today") {
    startDate = new Date(now.setHours(0, 0, 0, 0));
  } else if (dateRange === "7d") {
    startDate = new Date(now.setDate(now.getDate() - 6));
    startDate.setHours(0, 0, 0, 0);
  } else if (dateRange === "30d") {
    startDate = new Date(now.setDate(now.getDate() - 29));
    startDate.setHours(0, 0, 0, 0);
  } else if (dateRange === "custom" && customStart && customEnd) {
    startDate = new Date(customStart);
    startDate.setHours(0, 0, 0, 0);
    endDate = new Date(customEnd);
    endDate.setHours(23, 59, 59, 999);
  }

  let ordersQuery = supabase
    .from("orders")
    .select("id, order_number, total_amount, status, payment_status, created_at")
    .order("created_at", { ascending: false });

  if (startDate) ordersQuery = ordersQuery.gte("created_at", startDate.toISOString());
  if (endDate) ordersQuery = ordersQuery.lte("created_at", endDate.toISOString());

  const { data: orders } = await ordersQuery;
  const allOrders = orders || [];

  const totalRevenue = allOrders
    .filter((o) => o.payment_status === "paid")
    .reduce((sum, o) => sum + Number(o.total_amount || 0), 0);

  const orderStats = {
    pending: allOrders.filter((o) => o.status === "pending").length,
    processing: allOrders.filter((o) => o.status === "processing").length,
    shipped: allOrders.filter((o) => o.status === "shipped").length,
    delivered: allOrders.filter((o) => o.status === "delivered").length,
    cancelled: allOrders.filter((o) => o.status === "cancelled").length,
  };

  let customersQuery = supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("role", "customer");

  if (startDate) customersQuery = customersQuery.gte("created_at", startDate.toISOString());
  if (endDate) customersQuery = customersQuery.lte("created_at", endDate.toISOString());
  
  const { count: customerCount } = await customersQuery;

  let recentProfilesQuery = supabase
    .from("profiles")
    .select("id, full_name, email, avatar_url, created_at")
    .eq("role", "customer")
    .order("created_at", { ascending: false })
    .limit(5);
    
  if (startDate) recentProfilesQuery = recentProfilesQuery.gte("created_at", startDate.toISOString());
  if (endDate) recentProfilesQuery = recentProfilesQuery.lte("created_at", endDate.toISOString());
  
  const { data: recentProfiles } = await recentProfilesQuery;
  const recentCustomers: RecentCustomerItem[] = recentProfiles || [];

  const { count: lowStock } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .lte("stock_quantity", 5);

  const recentOrders = allOrders.slice(0, 5);

  const orderIds = allOrders.map((o) => o.id);
  let orderItems: any[] = [];

  if (orderIds.length > 0) {
    const { data } = await supabase
      .from("order_items")
      .select("product_id, quantity, unit_price, products(id, name, thumbnail_url, base_price)")
      .in("order_id", orderIds);
    orderItems = data || [];
  }

  const productAggregator: Record<string, TopProductItem> = {};

  orderItems.forEach((item: any) => {
    if (!item.product_id || !item.products) return;
    const pid = item.product_id;
    const qty = Number(item.quantity) || 0;
    const price = Number(item.unit_price || item.products.base_price) || 0;

    if (!productAggregator[pid]) {
      productAggregator[pid] = {
        id: pid,
        name: item.products.name,
        thumbnail_url: item.products.thumbnail_url || null,
        price: price,
        total_sold: 0,
        total_revenue: 0,
      };
    }
    productAggregator[pid].total_sold += qty;
    productAggregator[pid].total_revenue += qty * price;
  });

  const topProducts = Object.values(productAggregator)
    .sort((a, b) => b.total_sold - a.total_sold)
    .slice(0, 5);

  // Kalkulasi Rentang Chart
  let chartDays = 7;
  let chartEndDate = new Date();
  
  if (dateRange === "today") {
    chartDays = 1;
  } else if (dateRange === "30d" || dateRange === "all") {
    chartDays = 30;
  } else if (dateRange === "custom" && startDate && endDate) {
    // Hitung selisih hari manual
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    chartDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    chartEndDate = new Date(endDate); // Patokan mundur dari endDate
  }

  const days: RevenueChartItem[] = [];
  for (let i = chartDays - 1; i >= 0; i--) {
    const d = new Date(chartEndDate);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    let dayLabel = d.toLocaleDateString("id-ID", { weekday: "short", day: "numeric" });
    
    if (chartDays > 14) {
      dayLabel = d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
    }

    days.push({ date: dateStr, dayLabel, amount: 0 });
  }

  allOrders
    .filter((o) => o.payment_status === "paid")
    .forEach((o) => {
      const orderDate = new Date(o.created_at).toISOString().split("T")[0];
      const targetDay = days.find((d) => d.date === orderDate);
      if (targetDay) {
        targetDay.amount += Number(o.total_amount || 0);
      }
    });

  return {
    metrics: {
      totalRevenue,
      totalOrders: allOrders.length,
      totalCustomers: customerCount || 0,
      lowStockCount: lowStock || 0,
    },
    recentOrders,
    orderStats,
    topProducts,
    recentCustomers,
    revenueChart: days,
  };
}