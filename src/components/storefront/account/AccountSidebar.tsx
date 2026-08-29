"use client";

import { User, Package } from "lucide-react";
import { LogoutButton } from "./LogoutButton";

interface AccountSidebarProps {
  email: string;
  activeTab: "profile" | "orders";
  onTabChange: (tab: "profile" | "orders") => void;
}

export function AccountSidebar({ email, activeTab, onTabChange }: AccountSidebarProps) {
  return (
    <aside className="w-full md:w-64 shrink-0">
      <div className="bg-white p-5 rounded-2xl border border-neutral-200/70 shadow-sm space-y-6">
        
        {/* Info User */}
        <div className="pb-4 border-b border-neutral-100">
          <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
            Logged in as
          </p>
          <p className="text-sm font-bold text-neutral-900 truncate">
            {email}
          </p>
        </div>

        {/* Menu Navigasi */}
        <nav className="space-y-1.5">
          <button
            type="button"
            onClick={() => onTabChange("profile")}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeTab === "profile"
                ? "bg-black text-white shadow-sm"
                : "text-neutral-600 hover:bg-neutral-100 hover:text-black"
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile</span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange("orders")}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeTab === "orders"
                ? "bg-black text-white shadow-sm"
                : "text-neutral-600 hover:bg-neutral-100 hover:text-black"
            }`}
          >
            <Package className="w-4 h-4" />
            <span>My Orders</span>
          </button>
        </nav>

        {/* Area Logout */}
        <div className="pt-4 border-t border-neutral-100">
          <LogoutButton />
        </div>

      </div>
    </aside>
  );
}