"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Clock3 } from "lucide-react";
import { Suspense } from "react";

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");

  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-neutral-50 px-4 py-16">
      <section className="w-full max-w-xl rounded-3xl border border-neutral-200 bg-white p-8 text-center shadow-sm sm:p-12">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <CheckCircle2 className="h-9 w-9" />
        </div>
        <h1 className="mt-6 text-2xl font-black uppercase tracking-tight text-neutral-900">
          Order Received
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-neutral-600">
          Your payment result is being verified. We will update the order automatically after receiving confirmation from Midtrans.
        </p>

        {orderId && (
          <div className="mt-6 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Order Number</p>
            <p className="mt-1 break-all font-mono text-sm font-black text-neutral-900">{orderId}</p>
          </div>
        )}

        <div className="mt-5 flex items-center justify-center gap-2 text-xs font-medium text-amber-700">
          <Clock3 className="h-4 w-4" />
          Payment confirmation may take a few moments.
        </div>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/account" className="rounded-xl bg-neutral-900 px-5 py-3 text-xs font-bold uppercase tracking-wider text-white">
            View My Orders
          </Link>
          <Link href="/shop" className="rounded-xl border border-neutral-200 px-5 py-3 text-xs font-bold uppercase tracking-wider text-neutral-700">
            Continue Shopping
          </Link>
        </div>
      </section>
    </main>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<main className="min-h-[70vh] bg-neutral-50" />}>
      <OrderSuccessContent />
    </Suspense>
  );
}
