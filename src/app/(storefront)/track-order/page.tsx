"use client";

import { useState } from "react";
import Link from "next/link";

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

interface OrderDetails {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  created_at: string;
  customer_name: string;
  customer_email: string;
  shipping_courier: string | null;
  shipping_service: string | null;
  shipping_tracking_number: string | null;
  order_items: OrderItem[];
}

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [error, setError] = useState("");

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setOrder(null);

    try {
      const res = await fetch(`/api/track-order?id=${encodeURIComponent(orderId)}&email=${encodeURIComponent(email)}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Order not found or email does not match.");
      }

      setOrder(data);
    } catch (err: any) {
      setError(err.message || "Failed to load order details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[480px] mx-auto p-6 my-16 sm:my-24">
      
      {/* Header Title */}
      <div className="text-center space-y-2 mb-10">
        <h1 className="text-xl font-bold tracking-tight uppercase">Track Your Order</h1>
        <p className="text-xs text-neutral-500 uppercase tracking-wider">
          Enter your Order Number and email address used during checkout.
        </p>
      </div>

      {/* Info Box */}
      <div className="border border-neutral-200 bg-neutral-50 p-4 mb-8 text-xs text-neutral-600 space-y-1">
        <p className="font-bold uppercase tracking-widest text-black">Where to find your Order Number?</p>
        <p className="leading-relaxed">
          Your Order Number (e.g., ORD-...) is sent to your email confirmation right after checkout completion.
        </p>
      </div>

      {/* Form Input */}
      <form onSubmit={handleTrack} className="space-y-5">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-neutral-500">
            Order Number
          </label>
          <input
            type="text"
            required
            placeholder="e.g. ORD-20260830-XXXX"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            className="w-full border border-neutral-300 bg-white p-3.5 text-sm text-black focus:border-black focus:outline-none transition-colors"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-neutral-500">
            Email Address
          </label>
          <input
            type="email"
            required
            placeholder="e.g. customer@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-neutral-300 bg-white p-3.5 text-sm text-black focus:border-black focus:outline-none transition-colors"
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3 text-xs text-center font-medium">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white py-4 mt-2 text-[11px] font-bold uppercase tracking-[0.25em] hover:bg-[#222] transition-colors disabled:opacity-50"
        >
          {loading ? "CHECKING STATUS..." : "TRACK ORDER"}
        </button>
      </form>

      {/* Hasil Tracking / Order Result */}
      {order && (
        <div className="mt-10 border border-neutral-200 bg-white p-6 space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
            <div>
              <span className="text-[10px] text-neutral-400 block uppercase tracking-widest">Order Number</span>
              <span className="text-base font-mono font-bold text-black">{order.order_number}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-neutral-400 block uppercase tracking-widest">Status</span>
              <span className="inline-block rounded-full bg-neutral-100 border border-neutral-300 px-3 py-1 text-[10px] font-bold text-black uppercase tracking-wider">
                {order.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-neutral-400 uppercase tracking-wider block text-[10px]">Date Created</span>
              <span className="text-black font-medium">{new Date(order.created_at).toLocaleDateString("id-ID")}</span>
            </div>
            <div>
              <span className="text-neutral-400 uppercase tracking-wider block text-[10px]">Total Amount</span>
              <span className="text-black font-mono font-bold">Rp {Number(order.total_amount).toLocaleString("id-ID")}</span>
            </div>
            <div>
              <span className="text-neutral-400 uppercase tracking-wider block text-[10px]">Recipient</span>
              <span className="text-black font-medium">{order.customer_name}</span>
            </div>
            <div>
              <span className="text-neutral-400 uppercase tracking-wider block text-[10px]">Courier</span>
              <span className="text-black font-medium uppercase">{order.shipping_courier || "Regular"} {order.shipping_service ? `(${order.shipping_service})` : ""}</span>
            </div>
          </div>

          {order.shipping_tracking_number && (
            <div className="border-t border-neutral-200 pt-4">
              <span className="text-[10px] text-neutral-400 block uppercase tracking-widest">Tracking Number (Resi)</span>
              <span className="text-sm font-mono font-bold text-black">{order.shipping_tracking_number}</span>
            </div>
          )}
        </div>
      )}

      <div className="mt-10 text-center">
        <Link href="/" className="text-xs uppercase tracking-widest text-neutral-500 hover:text-black transition-colors">
          &larr; Return to Storefront
        </Link>
      </div>

    </div>
  );
}