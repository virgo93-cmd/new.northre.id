import { DollarSign, ShoppingBag, Users, AlertTriangle } from "lucide-react";
import { formatRupiah } from "@/lib/utils";

interface MetricsProps {
  metrics: {
    totalRevenue: number;
    totalOrders: number;
    totalCustomers: number;
    lowStockCount: number;
  };
}

export default function DashboardMetrics({ metrics }: MetricsProps) {
  const cards = [
    {
      title: "Total Revenue",
      value: formatRupiah(metrics.totalRevenue),
      desc: "Gross settled earnings",
      icon: DollarSign,
      color: "text-emerald-600 bg-emerald-50",
    },
    {
      title: "Total Orders",
      value: metrics.totalOrders.toLocaleString(),
      desc: "All-time transactions",
      icon: ShoppingBag,
      color: "text-blue-600 bg-blue-50",
    },
    {
      title: "Customers",
      value: metrics.totalCustomers.toLocaleString(),
      desc: "Registered buyers",
      icon: Users,
      color: "text-indigo-600 bg-indigo-50",
    },
    {
      title: "Low Stock Alert",
      value: metrics.lowStockCount.toLocaleString(),
      desc: "Items with <= 5 stock",
      icon: AlertTriangle,
      color:
        metrics.lowStockCount > 0
          ? "text-amber-600 bg-amber-50"
          : "text-gray-600 bg-gray-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <div
            key={i}
            className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500">
                {card.title}
              </span>
              <div className={`p-2 rounded-lg ${card.color}`}>
                <Icon size={16} />
              </div>
            </div>
            <div className="text-xl font-bold text-gray-900">{card.value}</div>
            <p className="text-[11px] text-gray-400">{card.desc}</p>
          </div>
        );
      })}
    </div>
  );
}