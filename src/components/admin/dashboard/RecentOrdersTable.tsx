"use client";

import { useState } from "react";
import Link from "next/link";
import { formatRupiah } from "@/lib/utils";
import { ArrowUpRight, ArrowUpDown, Inbox } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

export interface RecentOrderItem {
  id: string;
  order_number: string;
  total_amount: number;
  status: string;
  payment_status: string;
  created_at: string;
}

interface RecentOrdersProps {
  orders: RecentOrderItem[];
}

type SortField = "created_at" | "total_amount";

export default function RecentOrdersTable({ orders }: RecentOrdersProps) {
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const sortedOrders = [...orders].sort((a, b) => {
    if (sortField === "created_at") {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    }
    if (sortField === "total_amount") {
      const amountA = Number(a.total_amount) || 0;
      const amountB = Number(b.total_amount) || 0;
      return sortOrder === "asc" ? amountA - amountB : amountB - amountA;
    }
    return 0;
  });

  return (
    <div className="bg-white rounded-xl border border-neutral-100 shadow-xs overflow-hidden">
      {/* Header Card */}
      <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-neutral-900">Recent Orders</h3>
          <p className="text-xs text-neutral-500">
            Latest customer transactions (Shadcn UI)
          </p>
        </div>
        <Link
          href="/orders"
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
        >
          View All <ArrowUpRight size={14} />
        </Link>
      </div>

      {/* Table Content */}
      {orders.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center text-center space-y-2">
          <Inbox className="h-8 w-8 text-neutral-300" />
          <p className="text-xs font-medium text-neutral-500">
            No orders placed yet
          </p>
          <p className="text-[11px] text-neutral-400 max-w-xs">
            Transactions made by customers will appear here in real-time.
          </p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>
                <button
                  onClick={() => handleSort("created_at")}
                  className="flex items-center gap-1 hover:text-neutral-900 transition-colors"
                >
                  Date
                  <ArrowUpDown size={12} className="text-neutral-400" />
                </button>
              </TableHead>
              <TableHead>
                <button
                  onClick={() => handleSort("total_amount")}
                  className="flex items-center gap-1 hover:text-neutral-900 transition-colors"
                >
                  Total
                  <ArrowUpDown size={12} className="text-neutral-400" />
                </button>
              </TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Fulfillment</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedOrders.map((order) => {
              const payStatus = (order.payment_status || "pending").toLowerCase();
              const fulStatus = (order.status || "pending").toLowerCase();

              const payBadge =
                payStatus === "paid"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : payStatus === "failed"
                  ? "bg-rose-50 text-rose-700 border-rose-200"
                  : "bg-amber-50 text-amber-700 border-amber-200";

              const fulBadge =
                fulStatus === "delivered"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : fulStatus === "shipped"
                  ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                  : fulStatus === "cancelled"
                  ? "bg-rose-50 text-rose-700 border-rose-200"
                  : "bg-neutral-100 text-neutral-700 border-neutral-200";

              return (
                <TableRow key={order.id}>
                  <TableCell className="font-mono font-medium text-neutral-900">
                    <span className="bg-neutral-100 px-2 py-0.5 rounded text-[11px]">
                      #{order.order_number}
                    </span>
                  </TableCell>
                  <TableCell className="text-neutral-600">
                    {new Date(order.created_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell className="font-semibold text-neutral-900 tabular-nums">
                    {formatRupiah(order.total_amount)}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${payBadge}`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                          payStatus === "paid"
                            ? "bg-emerald-500"
                            : payStatus === "failed"
                            ? "bg-rose-500"
                            : "bg-amber-500"
                        }`}
                      />
                      {payStatus.toUpperCase()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex px-2 py-0.5 rounded text-[10px] font-medium border ${fulBadge}`}
                    >
                      {fulStatus.toUpperCase()}
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}