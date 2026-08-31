"use client";

import { Award, CircleUserRound, LayoutDashboard, LogOut, MapPin, Package, Wallet } from "lucide-react";
import Image from "next/image";
import { CustomerProfile } from "@/modules/customer/customer.service";

export type AccountTab = "overview" | "orders" | "addresses" | "wallet" | "profile";

interface AccountSidebarProps {
  email: string;
  profile: CustomerProfile | null;
  activeTab: AccountTab;
  onTabChange: (tab: AccountTab) => void;
  onLogout: () => void;
  isLoggingOut: boolean;
}

const items = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "orders", label: "Pesanan", icon: Package },
  { id: "addresses", label: "Alamat", icon: MapPin },
  { id: "wallet", label: "Wallet", icon: Wallet },
  { id: "profile", label: "Profil", icon: CircleUserRound },
] as const;

export function AccountSidebar({ email, profile, activeTab, onTabChange, onLogout, isLoggingOut }: AccountSidebarProps) {
  const name = profile?.full_name || profile?.first_name || "Customer";
  const initial = name.charAt(0).toUpperCase();

  return (
    <aside className="w-full lg:w-[260px] lg:shrink-0">
      <div className="overflow-hidden rounded-[28px] border border-black/5 bg-white shadow-[0_18px_60px_rgba(0,0,0,0.06)] lg:sticky lg:top-24">
        <div className="flex items-center gap-3 border-b border-neutral-100 p-5">
          <div className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full bg-black text-sm font-bold text-white">
            {profile?.avatar_url ? <Image src={profile.avatar_url} alt="" width={44} height={44} unoptimized className="h-full w-full object-cover" /> : initial}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-neutral-950">{name}</p>
            <p className="truncate text-xs text-neutral-500">{profile?.email || email}</p>
          </div>
        </div>

        <nav className="flex gap-2 overflow-x-auto p-3 lg:block lg:space-y-1 lg:overflow-visible" aria-label="Menu akun">
          {items.map(({ id, label, icon: Icon }) => (
            <button key={id} type="button" onClick={() => onTabChange(id)}
              className={`flex shrink-0 items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition lg:w-full ${activeTab === id ? "bg-black text-white" : "text-neutral-600 hover:bg-neutral-100 hover:text-black"}`}>
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        {profile?.is_affiliate && (
          <div className="mx-3 mb-3 flex items-center gap-3 rounded-2xl bg-amber-50 px-4 py-3 text-amber-900">
            <Award className="h-4 w-4" />
            <div><p className="text-[10px] font-bold uppercase tracking-widest">Affiliate</p><p className="text-xs capitalize">{profile.affiliate_badge || "Member"}</p></div>
          </div>
        )}

        <div className="border-t border-neutral-100 p-3">
          <button type="button" onClick={onLogout} disabled={isLoggingOut}
            className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-neutral-500 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50">
            <LogOut className="h-4 w-4" /> {isLoggingOut ? "Keluar..." : "Keluar"}
          </button>
        </div>
      </div>
    </aside>
  );
}
