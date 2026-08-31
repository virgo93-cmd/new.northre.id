"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, subtotal } = useCart();
  const [orderNote, setOrderNote] = useState("");

  const formatRupiah = (amount: number | string) => {
    const num = typeof amount === "string" ? parseFloat(amount.replace(/[^0-9.-]+/g, "")) || 0 : amount;
    return "RP " + new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(num);
  };

  const getItemPrice = (priceStr: string | number) => {
    if (typeof priceStr === "number") return priceStr;
    return parseFloat(priceStr.replace(/[^0-9.-]+/g, "")) || 0;
  };

  return (
    <div className="min-h-[75vh] bg-white px-4 py-8 sm:px-6 sm:py-16 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {cart.length === 0 ? (
          /* Empty Cart State */
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <h1 className="text-xs sm:text-sm font-bold tracking-[0.35em] text-[#111] uppercase">
              YOUR CART IS EMPTY
            </h1>
            <div className="mt-8">
              <Link
                href="/"
                className="inline-flex items-center justify-center bg-black px-8 py-3.5 text-[11px] font-bold tracking-[0.25em] text-white uppercase transition-colors hover:bg-neutral-800"
              >
                SHOP OUR PRODUCTS
              </Link>
            </div>
          </div>
        ) : (
          /* Cart Layout */
          <div className="flex flex-col">
            {/* Page Title */}
            <div className="mb-8 text-center sm:mb-12">
              <h1 className="text-xs sm:text-sm font-bold tracking-[0.35em] text-[#111] uppercase">
                CART
              </h1>
            </div>

            {/* Table Header */}
            <div className="hidden grid-cols-12 border-b border-neutral-200 pb-3 text-[10px] sm:text-[11px] font-bold tracking-[0.2em] text-neutral-400 uppercase sm:grid">
              <div className="col-span-6">PRODUCT</div>
              <div className="col-span-3 text-center">QUANTITY</div>
              <div className="col-span-3 text-right">TOTAL</div>
            </div>

            {/* Cart Item List */}
            <div className="divide-y divide-neutral-100 sm:border-b sm:border-neutral-200">
              {cart.map((item) => {
                const itemPriceNum = getItemPrice(item.price);
                const itemTotalNum = itemPriceNum * item.quantity;
                const itemImage = item.image || item.image_url || "/placeholder.jpg";

                return (
                  <div key={item.id} className="flex flex-col py-6 sm:grid sm:grid-cols-12 sm:items-center sm:py-8">
                    <div className="flex items-start gap-4 sm:col-span-6 sm:items-center sm:gap-5">
                      <div className="relative h-20 w-16 shrink-0 overflow-hidden bg-[#f4f4f4] sm:h-24 sm:w-20">
                        <Image src={itemImage} alt={item.name} fill sizes="80px" className="object-cover object-center" />
                      </div>

                      <div className="flex flex-1 flex-col">
                        <Link href={`/products/${item.slug || ""}`} className="text-[10px] sm:text-[11px] font-bold tracking-[0.12em] text-[#111] uppercase hover:opacity-70 transition-opacity">
                          {item.name}
                        </Link>

                        {item.selectedAttributes && (
                          <div className="mt-0.5 flex flex-wrap gap-1 text-[9px] text-neutral-500 uppercase tracking-wider">
                            {Object.entries(item.selectedAttributes).map(([key, val]) => (
                              <span key={key}>{val}</span>
                            ))}
                          </div>
                        )}

                        <span className="mt-1 text-[9px] sm:text-[10px] text-neutral-500 tracking-wider">
                          {formatRupiah(itemPriceNum)}
                        </span>

                        <div className="mt-3 flex items-center justify-between sm:hidden">
                          <div className="flex items-center">
                            <div className="flex items-center border border-neutral-300">
                              <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="flex h-6 w-6 items-center justify-center text-xs text-neutral-600 hover:bg-neutral-100">-</button>
                              <span className="flex h-6 w-7 items-center justify-center text-[10px] font-semibold text-[#111]">{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="flex h-6 w-6 items-center justify-center text-xs text-neutral-600 hover:bg-neutral-100">+</button>
                            </div>
                            <button onClick={() => removeFromCart(item.id)} className="ml-3 text-[9px] font-bold tracking-[0.15em] text-neutral-400 uppercase underline hover:text-black">REMOVE</button>
                          </div>
                          <span className="text-[10px] font-bold tracking-wider text-[#111]">{formatRupiah(itemTotalNum)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="hidden sm:col-span-3 sm:flex sm:flex-col sm:items-center sm:justify-center">
                      <div className="flex items-center border border-neutral-300">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="flex h-7 w-7 items-center justify-center text-xs text-neutral-600 hover:bg-neutral-100">-</button>
                        <span className="flex h-7 w-8 items-center justify-center text-[10px] font-semibold text-[#111]">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="flex h-7 w-7 items-center justify-center text-xs text-neutral-600 hover:bg-neutral-100">+</button>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="mt-2 text-[9px] font-bold tracking-[0.15em] text-neutral-400 uppercase underline hover:text-black">REMOVE</button>
                    </div>

                    <div className="hidden sm:col-span-3 sm:block sm:text-right">
                      <span className="text-[11px] font-bold tracking-wider text-[#111]">{formatRupiah(itemTotalNum)}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 border-t border-neutral-200 pt-6">
              <div className="flex flex-col">
                <label className="text-[10px] font-bold tracking-[0.15em] text-neutral-800 uppercase mb-2">Add Special Instructions</label>
                <textarea rows={3} value={orderNote} onChange={(e) => setOrderNote(e.target.value)} placeholder="Is there anything specific we should pay attention to?" className="w-full border border-neutral-200 p-3 text-[10px] text-neutral-800 placeholder-neutral-400 focus:border-black focus:outline-none" />
              </div>
              <div className="mt-6 flex flex-col items-center text-center sm:items-end sm:text-right">
                <div className="text-xs font-bold tracking-[0.2em] text-[#111] uppercase">TOTAL: {formatRupiah(subtotal)}</div>
                <p className="mt-2 text-[8.5px] sm:text-[9px] text-neutral-500 uppercase tracking-widest leading-relaxed max-w-sm sm:max-w-none">
                  SHIPPING COSTS WILL BE CALCULATED AT CHECKOUT.
                </p>
                <div className="mt-5 w-full sm:w-auto">
                  <Link href="/checkout" className="flex w-full items-center justify-center bg-black py-3 sm:px-12 text-[10px] font-bold tracking-[0.25em] text-white uppercase transition-colors hover:bg-neutral-800">CHECKOUT</Link>
                </div>
              </div>
              <div className="mt-4">
                <Link href="/" className="flex w-full items-center justify-center bg-black py-3 text-[10px] font-bold tracking-[0.25em] text-white uppercase transition-colors hover:bg-neutral-800">CONTINUE SHOPPING</Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
