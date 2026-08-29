interface AnalyticsProps {
  orderStats: {
    pending: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  };
}

export default function QuickAnalytics({ orderStats }: AnalyticsProps) {
  const statuses = [
    { label: "Pending Payment", count: orderStats.pending, color: "bg-amber-500" },
    { label: "Processing", count: orderStats.processing, color: "bg-blue-500" },
    { label: "Shipped", count: orderStats.shipped, color: "bg-indigo-500" },
    { label: "Delivered", count: orderStats.delivered, color: "bg-emerald-500" },
    { label: "Cancelled", count: orderStats.cancelled, color: "bg-rose-500" },
  ];

  const total = Object.values(orderStats).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs space-y-4">
      <h3 className="text-sm font-bold text-gray-900">Order Fulfillment Status</h3>

      <div className="space-y-3">
        {statuses.map((item, idx) => {
          const percentage = Math.round((item.count / total) * 100);
          return (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600 font-medium">{item.label}</span>
                <span className="font-bold text-gray-900">{item.count}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-1.5 rounded-full ${item.color}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}