// src/components/storefront/account/AccountView.tsx
"use client";

import { useState } from "react";
import { AccountSidebar } from "./AccountSidebar";
import { ProfileTab } from "./ProfileTab";
import { OrderHistoryTab } from "./OrderHistoryTab";
import { AddressesTab } from "./AddressesTab";
import { WalletTab } from "./WalletTab";
import { CustomerProfile, CustomerOrder } from "@/modules/customer/customer.service";
import type { Address } from "./AddressesTab";
import type { WalletData, WalletTransaction, WithdrawalRequest } from "./WalletTab";

interface AccountViewProps {
  user: {
    id: string;
    email?: string;
  };
  profile: CustomerProfile | null;
  initialOrders: CustomerOrder[];
  initialAddresses?: Address[];
  wallet?: WalletData | null;
  transactions?: WalletTransaction[];
  withdrawals?: WithdrawalRequest[];
}

export function AccountView({
  user,
  profile,
  initialOrders,
  initialAddresses = [],
  wallet = null,
  transactions = [],
  withdrawals = []
}: AccountViewProps) {
  const [activeTab, setActiveTab] = useState<"profile" | "orders" | "addresses" | "wallet">("profile");

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start w-full max-w-7xl mx-auto">
      <AccountSidebar
        email={user.email || "Customer"}
        profile={profile}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <main className="flex-1 w-full bg-white p-6 sm:p-10 rounded-3xl border border-neutral-200/80 shadow-[0_10px_40px_rgb(0,0,0,0.03)] min-h-[500px]">
        {activeTab === "profile" && (
          <div className="animate-in fade-in duration-300">
            <ProfileTab user={user} profile={profile} />
          </div>
        )}
        {activeTab === "orders" && (
          <div className="animate-in fade-in duration-300">
            <OrderHistoryTab orders={initialOrders} />
          </div>
        )}
        {activeTab === "addresses" && (
          <div className="animate-in fade-in duration-300">
            <AddressesTab userId={user.id} initialAddresses={initialAddresses} />
          </div>
        )}
        {activeTab === "wallet" && (
          <div className="animate-in fade-in duration-300">
            <WalletTab userId={user.id} wallet={wallet} transactions={transactions} withdrawals={withdrawals} />
          </div>
        )}
      </main>
    </div>
  );
}
