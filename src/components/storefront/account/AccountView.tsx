"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, MapPin, Package, ShoppingBag, Sparkles, Wallet } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { AccountSidebar, type AccountTab } from "./AccountSidebar";
import { ProfileTab } from "./ProfileTab";
import { OrderHistoryTab } from "./OrderHistoryTab";
import { AddressesTab, type Address } from "./AddressesTab";
import { WalletTab, type WalletData, type WalletTransaction, type WithdrawalRequest } from "./WalletTab";
import { CustomerProfile, CustomerOrder } from "@/modules/customer/customer.service";

interface AccountViewProps {
  user: { id: string; email?: string };
  profile: CustomerProfile | null;
  initialOrders: CustomerOrder[];
  initialAddresses?: Address[];
  wallet?: WalletData | null;
  transactions?: WalletTransaction[];
  withdrawals?: WithdrawalRequest[];
}

const rupiah = (value: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);

export function AccountView({ user, profile, initialOrders, initialAddresses = [], wallet = null, transactions = [], withdrawals = [] }: AccountViewProps) {
  const [activeTab, setActiveTab] = useState<AccountTab>("overview");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();
  const name = profile?.first_name || profile?.full_name?.split(" ")[0] || "there";
  const totalSpent = initialOrders.filter((order) => order.payment_status === "paid").reduce((sum, order) => sum + Number(order.total_amount || 0), 0);
  const activeOrders = initialOrders.filter((order) => ["pending", "processing", "shipped"].includes(order.status)).length;

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await createClient().auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="mx-auto w-full max-w-[1380px]">
      <section className="relative mb-6 overflow-hidden rounded-[32px] bg-neutral-950 px-6 py-8 text-white sm:px-10 sm:py-10">
        <div className="absolute -right-16 -top-24 h-72 w-72 rounded-full border border-white/10" />
        <div className="absolute -right-4 -top-12 h-44 w-44 rounded-full border border-white/10" />
        <div className="relative flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <div className="mb-4 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-white/50"><Sparkles className="h-3.5 w-3.5" /> Northre member space</div>
            <h1 className="max-w-xl text-3xl font-semibold tracking-[-0.04em] sm:text-5xl">Welcome back, {name}.</h1>
            <p className="mt-3 max-w-lg text-sm leading-6 text-white/55">Semua pesanan, alamat pengiriman, dan benefit member kamu ada di satu tempat.</p>
          </div>
          <Link href="/shop" className="inline-flex w-fit items-center gap-3 rounded-full bg-white px-5 py-3 text-xs font-semibold uppercase tracking-widest text-black transition hover:bg-neutral-200">Shop new arrivals <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </section>

      <div className="flex flex-col items-start gap-6 lg:flex-row">
        <AccountSidebar email={user.email || "Customer"} profile={profile} activeTab={activeTab} onTabChange={setActiveTab} onLogout={handleLogout} isLoggingOut={isLoggingOut} />
        <main className="min-w-0 flex-1">
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                {[
                  { label: "Total pesanan", value: initialOrders.length.toString(), icon: ShoppingBag },
                  { label: "Sedang diproses", value: activeOrders.toString(), icon: Package },
                  { label: "Total belanja", value: rupiah(totalSpent), icon: Wallet },
                  { label: "Alamat tersimpan", value: initialAddresses.length.toString(), icon: MapPin },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className="rounded-[24px] border border-black/5 bg-white p-5 shadow-[0_12px_40px_rgba(0,0,0,0.04)]">
                    <div className="mb-6 grid h-9 w-9 place-items-center rounded-full bg-neutral-100"><Icon className="h-4 w-4" /></div>
                    <p className="truncate text-xl font-semibold tracking-tight text-neutral-950">{value}</p>
                    <p className="mt-1 text-xs text-neutral-500">{label}</p>
                  </div>
                ))}
              </div>

              <div className="grid gap-6 xl:grid-cols-[1.45fr_.75fr]">
                <section className="rounded-[28px] border border-black/5 bg-white p-6 shadow-[0_12px_40px_rgba(0,0,0,0.04)] sm:p-8">
                  <div className="mb-6 flex items-center justify-between"><div><p className="text-lg font-semibold">Pesanan terbaru</p><p className="mt-1 text-xs text-neutral-500">Pantau perjalanan pesanan kamu.</p></div><button onClick={() => setActiveTab("orders")} className="text-xs font-semibold underline underline-offset-4">Lihat semua</button></div>
                  {initialOrders.length ? <div className="space-y-3">{initialOrders.slice(0, 3).map((order) => (
                    <button key={order.id} onClick={() => setActiveTab("orders")} className="flex w-full items-center gap-4 rounded-2xl border border-neutral-100 p-4 text-left transition hover:bg-neutral-50">
                      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-black text-white"><Package className="h-4 w-4" /></div>
                      <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">#{order.order_number}</p><p className="mt-1 text-xs capitalize text-neutral-500">{order.status} · {new Date(order.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</p></div>
                      <p className="text-sm font-semibold">{rupiah(Number(order.total_amount))}</p>
                    </button>
                  ))}</div> : <div className="rounded-2xl bg-neutral-50 px-6 py-12 text-center"><ShoppingBag className="mx-auto mb-3 h-7 w-7 text-neutral-400" /><p className="text-sm font-medium">Belum ada pesanan</p><Link href="/shop" className="mt-3 inline-block text-xs font-semibold underline underline-offset-4">Mulai belanja</Link></div>}
                </section>

                <section className="rounded-[28px] bg-[#e9ff70] p-6 sm:p-8">
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-black/50">Member benefit</p>
                  <h2 className="mt-4 text-2xl font-semibold tracking-tight">{profile?.is_affiliate ? "Affiliate aktif" : "Unlock more rewards"}</h2>
                  <p className="mt-3 text-sm leading-6 text-black/60">{profile?.is_affiliate ? `Bagikan kode ${profile.referral_code || "referral"} dan pantau komisi dari wallet.` : "Lengkapi profil dan terus berbelanja untuk menikmati benefit eksklusif NORTHRE."}</p>
                  <button onClick={() => setActiveTab(profile?.is_affiliate ? "wallet" : "profile")} className="mt-8 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest">Explore benefit <ArrowRight className="h-4 w-4" /></button>
                </section>
              </div>
            </div>
          )}
          {activeTab !== "overview" && <div className="rounded-[28px] border border-black/5 bg-white p-5 shadow-[0_12px_40px_rgba(0,0,0,0.04)] sm:p-8">
            {activeTab === "profile" && <ProfileTab user={user} profile={profile} />}
            {activeTab === "orders" && <OrderHistoryTab orders={initialOrders} />}
            {activeTab === "addresses" && <AddressesTab userId={user.id} initialAddresses={initialAddresses} />}
            {activeTab === "wallet" && <WalletTab userId={user.id} wallet={wallet} transactions={transactions} withdrawals={withdrawals} />}
          </div>}
        </main>
      </div>
    </div>
  );
}
