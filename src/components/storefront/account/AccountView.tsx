"use client";

import { useState } from "react";
import { AccountSidebar } from "./AccountSidebar";

interface AccountViewProps {
  user: {
    id: string;
    email?: string;
    user_metadata?: {
      full_name?: string;
      avatar_url?: string;
    };
  };
}

export function AccountView({ user }: AccountViewProps) {
  const [activeTab, setActiveTab] = useState<"profile" | "orders">("profile");

  return (
    // Responsif: flex-col untuk mobile, md:flex-row untuk desktop
    <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start w-full">
      <AccountSidebar
        email={user.email || "Customer"}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Area Konten Dinamis */}
      <main className="flex-1 w-full bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] min-h-[420px]">
        {activeTab === "profile" ? (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-neutral-900 uppercase">Profile Details</h2>
              <p className="text-xs text-neutral-500 tracking-wide mt-1">
                Securely synced with your Google account.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-5 bg-neutral-50 rounded-2xl border border-neutral-200/60">
                <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-2">Full Name</p>
                <p className="text-sm font-bold text-neutral-900">
                  {user.user_metadata?.full_name || "Customer"}
                </p>
              </div>

              <div className="p-5 bg-neutral-50 rounded-2xl border border-neutral-200/60">
                <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-2">Email Address</p>
                <p className="text-sm font-bold text-neutral-900 truncate">
                  {user.email}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-neutral-900 uppercase">Order History</h2>
              <p className="text-xs text-neutral-500 tracking-wide mt-1">
                Track and manage your previous store orders.
              </p>
            </div>

            {/* Empty State Order */}
            <div className="flex flex-col items-center justify-center text-center py-20 border border-dashed border-neutral-300 rounded-2xl bg-neutral-50/50">
              <p className="text-sm font-bold text-neutral-900 uppercase tracking-wide">No orders found</p>
              <p className="text-xs text-neutral-500 mt-2 max-w-[250px]">
                You haven't placed any orders with this account yet.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}