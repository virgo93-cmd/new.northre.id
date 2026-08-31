"use client";

import Link from "next/link";
import { ArrowRight, Box, CircleCheck, Clock3, MapPin, PackageCheck, Truck } from "lucide-react";
import { CustomerOrder } from "@/modules/customer/customer.service";

interface OrderHistoryTabProps { orders: CustomerOrder[] }

const money = (value: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);

const statusMeta = (status: string) => {
  switch (status) {
    case "delivered": return { label: "Terkirim", icon: CircleCheck, className: "bg-emerald-50 text-emerald-700" };
    case "shipped": return { label: "Dalam pengiriman", icon: Truck, className: "bg-blue-50 text-blue-700" };
    case "processing": return { label: "Sedang diproses", icon: PackageCheck, className: "bg-violet-50 text-violet-700" };
    case "cancelled": return { label: "Dibatalkan", icon: Box, className: "bg-red-50 text-red-700" };
    case "refunded": return { label: "Dikembalikan", icon: Box, className: "bg-orange-50 text-orange-700" };
    default: return { label: "Menunggu pembayaran", icon: Clock3, className: "bg-amber-50 text-amber-700" };
  }
};

export function OrderHistoryTab({ orders }: OrderHistoryTabProps) {
  const paidTotal = orders.filter((order) => order.payment_status === "paid").reduce((sum, order) => sum + Number(order.total_amount), 0);

  return (
    <div>
      <div className="flex flex-col justify-between gap-4 border-b border-neutral-100 pb-6 sm:flex-row sm:items-end">
        <div><h2 className="text-2xl font-semibold tracking-tight">Pesanan saya</h2><p className="mt-1 text-sm text-neutral-500">Pantau pembayaran dan status pengiriman.</p></div>
        <div className="flex gap-6"><div><p className="text-xs text-neutral-400">Total pesanan</p><p className="mt-1 text-lg font-semibold">{orders.length}</p></div><div><p className="text-xs text-neutral-400">Total transaksi berhasil</p><p className="mt-1 text-lg font-semibold">{money(paidTotal)}</p></div></div>
      </div>

      {!orders.length ? (
        <div className="py-16 text-center sm:py-24"><div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-neutral-100"><Box className="h-6 w-6" /></div><h3 className="mt-5 text-lg font-semibold">Belum ada pesanan</h3><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-neutral-500">Produk yang kamu checkout akan muncul di sini lengkap dengan status pengirimannya.</p><Link href="/shop" className="mt-6 inline-flex items-center gap-2 rounded-full bg-black px-6 py-3 text-xs font-semibold uppercase tracking-widest text-white">Mulai belanja <ArrowRight className="h-4 w-4" /></Link></div>
      ) : (
        <div className="mt-6 space-y-4">
          {orders.map((order) => {
            const meta = statusMeta(order.status);
            const StatusIcon = meta.icon;
            return <article key={order.id} className="overflow-hidden rounded-[24px] border border-neutral-200 transition hover:border-neutral-300 hover:shadow-[0_14px_40px_rgba(0,0,0,.05)]">
              <div className="flex flex-col gap-3 border-b border-neutral-100 bg-neutral-50/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div><p className="text-sm font-semibold">#{order.order_number}</p><p className="mt-1 text-xs text-neutral-400">{new Date(order.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p></div>
                <div className="flex flex-wrap gap-2"><span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold ${meta.className}`}><StatusIcon className="h-3.5 w-3.5" />{meta.label}</span><span className={`rounded-full px-3 py-1.5 text-[11px] font-semibold ${order.payment_status === "paid" ? "bg-emerald-50 text-emerald-700" : "bg-neutral-200 text-neutral-600"}`}>{order.payment_status === "paid" ? "Lunas" : "Belum dibayar"}</span></div>
              </div>
              <div className="grid gap-5 p-5 sm:grid-cols-[1fr_1.2fr_auto] sm:items-center">
                <div><p className="text-xs text-neutral-400">Total</p><p className="mt-1 text-lg font-semibold">{money(Number(order.total_amount))}</p><p className="mt-1 text-xs text-neutral-400">{order.payment_method || "Midtrans"}</p></div>
                <div className="flex gap-3"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400" /><div><p className="line-clamp-1 text-sm font-medium">{order.shipping_address}</p><p className="mt-1 text-xs text-neutral-400">{[order.shipping_city, order.shipping_province, order.shipping_postal_code].filter(Boolean).join(", ")}</p></div></div>
                <div className="sm:text-right"><p className="text-xs font-semibold uppercase text-neutral-700">{order.shipping_courier || "Kurir belum dipilih"}</p><p className="mt-1 text-xs text-neutral-400">{order.shipping_tracking_number || "Resi belum tersedia"}</p></div>
              </div>
            </article>;
          })}
        </div>
      )}
    </div>
  );
}
