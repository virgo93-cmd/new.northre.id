import Link from "next/link";
import { formatRupiah } from "@/lib/utils";
import { ArrowUpRight, Package, Flame } from "lucide-react";
import { TopProductItem } from "@/modules/dashboard/dashboard.service";

interface TopProductsProps {
  products: TopProductItem[];
}

export default function TopProductsList({ products }: TopProductsProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden">
      <div className="p-5 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
            <Flame className="h-4 w-4 text-amber-500" /> Top Selling Products
          </h3>
          <p className="text-xs text-gray-500">Best performing items by units sold</p>
        </div>
        <Link
          href="/products"
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          View All <ArrowUpRight size={14} />
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="py-10 flex flex-col items-center justify-center text-center space-y-2">
          <Package className="h-8 w-8 text-gray-300" />
          <p className="text-xs font-medium text-gray-500">No sales data recorded yet</p>
          <p className="text-[11px] text-gray-400 max-w-xs">
            Product sales performance will be ranked here once orders are processed.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {products.map((item, idx) => (
            <div
              key={item.id}
              className="p-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-xs font-bold text-gray-400 w-4 text-center">
                  #{idx + 1}
                </span>
                <div className="h-10 w-10 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center">
                  {item.thumbnail_url ? (
                    <img
                      src={item.thumbnail_url}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Package className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-900 truncate">
                    {item.name}
                  </p>
                  <p className="text-[11px] text-gray-500">
                    {formatRupiah(item.price)}
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0 pl-3">
                <p className="text-xs font-bold text-gray-900">
                  {item.total_sold} sold
                </p>
                <p className="text-[11px] font-medium text-emerald-600">
                  {formatRupiah(item.total_revenue)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}