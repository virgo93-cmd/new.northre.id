"use client";

import { User, Package, MapPin, Wallet, Award } from "lucide-react";
import { LogoutButton } from "./LogoutButton";
import { CustomerProfile } from "@/modules/customer/customer.service";

interface AccountSidebarProps {
  email: string;
  profile: CustomerProfile | null;
  activeTab: "profile" | "orders" | "addresses" | "wallet";
  onTabChange: (tab: "profile" | "orders" | "addresses" | "wallet") => void;
}

export function AccountSidebar({ email, profile, activeTab, onTabChange }: AccountSidebarProps) {
  const displayName = profile?.full_name || profile?.email || email;
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <aside className="w-full lg:w-72 shrink-0">
      <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-[0_4px_24px_rgb(0,0,0,0.03)] space-y-6">
        
        {/* Identitas Profil (avatar_url, full_name, email) */}
        <div className="flex items-center gap-3.5 pb-5 border-b border-neutral-100">
          <div className="w-12 h-12 rounded-2xl bg-neutral-900 text-white flex items-center justify-center font-black text-base uppercase shrink-0 shadow-md overflow-hidden">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt={displayName} className="w-full h-full object-cover" />
            ) : (
              initial
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest truncate">
              {profile?.email || email}
            </p>
            <p className="text-sm font-black text-neutral-900 truncate tracking-tight mt-0.5">
              {profile?.full_name || "Customer"}
            </p>
          </div>
        </div>

        {/* Menu Navigasi Utama */}
        <nav className="space-y-1.5">
          <button
            type="button"
            onClick={() => onTabChange("profile")}
            className={`w-full flex items-center gap-3 px-4.5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === "profile"
                ? "bg-neutral-900 text-white shadow-md"
                : "text-neutral-600 hover:bg-neutral-100 hover:text-black"
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile Details</span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange("orders")}
            className={`w-full flex items-center gap-3 px-4.5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === "orders"
                ? "bg-neutral-900 text-white shadow-md"
                : "text-neutral-600 hover:bg-neutral-100 hover:text-black"
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Order History</span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange("addresses")}
            className={`w-full flex items-center gap-3 px-4.5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === "addresses"
                ? "bg-neutral-900 text-white shadow-md"
                : "text-neutral-600 hover:bg-neutral-100 hover:text-black"
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Saved Addresses</span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange("wallet")}
            className={`w-full flex items-center gap-3 px-4.5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === "wallet"
                ? "bg-neutral-900 text-white shadow-md"
                : "text-neutral-600 hover:bg-neutral-100 hover:text-black"
            }`}
          >
            <Wallet className="w-4 h-4" />
            <span>Wallet & Commissions</span>
          </button>
        </nav>

        {/* Indikator Status Afiliasi (is_affiliate & affiliate_badge) */}
        <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200/60 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Affiliate Status</span>
            <Award className="w-3.5 h-3.5 text-neutral-500" />
          </div>
          <p className="text-xs font-bold text-neutral-900">
            {profile?.is_affiliate ? `Active (${profile.affiliate_badge || 'bronze'})` : "Standard Customer"}
          </p>
        </div>

        {/* Tombol Logout */}
        <div className="pt-2 border-t border-neutral-100">
          <LogoutButton />
        </div>

      </div>
    </aside>
  );
}