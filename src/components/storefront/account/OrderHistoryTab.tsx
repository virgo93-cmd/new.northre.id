"use client";

import { CustomerOrder } from "@/modules/customer/customer.service";
import { ShoppingBag } from "lucide-react";

interface OrderHistoryTabProps {
  orders: CustomerOrder[];
}

export function OrderHistoryTab({ orders }: OrderHistoryTabProps) {
  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return "bg-emerald-50 text-emerald-800 border-emerald-200";
      case "processing":
      case "shipped":
        return "bg-blue-50 text-blue-800 border-blue-200";
      case "cancelled":
      case "refunded":
        return "bg-rose-50 text-rose-800 border-rose-200";
      default:
        return "bg-amber-50 text-amber-800 border-amber-200";
    }
  };

  const getPaymentBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return "bg-emerald-50 text-emerald-800 border-emerald-200";
      case "failed":
      case "refunded":
        return "bg-rose-50 text-rose-800 border-rose-200";
      default:
        return "bg-amber-50 text-amber-800 border-amber-200";
    }
  };

  const totalSpent = orders.reduce((acc, order) => acc + (Number(order.total_amount) || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header & Overview Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-100">
        <div>
          <h2 className="text-xl font-black tracking-tight text-neutral-900 uppercase">Order History</h2>
          <p className="text-xs text-neutral-500 font-medium mt-1">
            Track fulfillment statuses, shipping details, and transaction records.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2.5 bg-neutral-50 rounded-2xl border border-neutral-200/75 text-right">
            <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">Total Orders</p>
            <p className="text-sm font-black text-neutral-900">{orders.length}</p>
          </div>
          <div className="px-4 py-2.5 bg-neutral-50 rounded-2xl border border-neutral-200/75 text-right">
            <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">Lifetime Spending</p>
            <p className="text-sm font-black text-neutral-900">Rp {totalSpent.toLocaleString("id-ID")}</p>
          </div>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-24 border border-dashed border-neutral-300 rounded-3xl bg-neutral-50/50 shadow-inner">
          <div className="w-16 h-16 rounded-3xl bg-neutral-900 text-white flex items-center justify-center mb-4 shadow-lg">
            <ShoppingBag className="w-7 h-7" />
          </div>
          <p className="text-sm font-black text-neutral-900 uppercase tracking-wide">No Transactions Recorded</p>
          <p className="text-xs text-neutral-500 mt-1 max-w-[280px]">
            You haven&apos;t completed any orders yet. Once you place an order, items and shipment tracking will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            return (
              <div
                key={order.id}
                className="p-6 bg-white hover:border-neutral-400 rounded-3xl border border-neutral-200/80 shadow-[0_4px_24px_rgb(0,0,0,0.03)] transition-all space-y-4"
              >
                {/* Order Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-neutral-100">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-black uppercase tracking-wider text-neutral-900 bg-neutral-100 px-3 py-1 rounded-xl">
                      {order.order_number || `#${order.id.slice(0, 8).toUpperCase()}`}
                    </span>
                    <span className="text-neutral-300">•</span>
                    <span className="text-xs font-semibold text-neutral-500">
                      {new Date(order.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusBadge(order.status)}`}>
                      Status: {order.status}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getPaymentBadge(order.payment_status)}`}>
                      Payment: {order.payment_status}
                    </span>
                  </div>
                </div>

                {/* Order Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1">Total Amount</p>
                    <p className="text-base font-black text-neutral-900">
                      Rp {order.total_amount?.toLocaleString("id-ID")}
                    </p>
                    <p className="text-neutral-500 mt-0.5">Method: {order.payment_method || "Direct Transfer"}</p>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1">Shipping Destination</p>
                    <p className="font-bold text-neutral-800 truncate">{order.shipping_address}</p>
                    <p className="text-neutral-500 mt-0.5">
                      {order.shipping_city || ""}, {order.shipping_province || ""} {order.shipping_postal_code || ""}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1">Courier & Tracking</p>
                    <p className="font-bold text-neutral-800 uppercase">
                      {order.shipping_courier || "Standard"} ({order.shipping_service || "Regular"})
                    </p>
                    <p className="text-neutral-500 font-mono mt-0.5 truncate">
                      Receipt: {order.shipping_tracking_number || "Awaiting shipment"}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
