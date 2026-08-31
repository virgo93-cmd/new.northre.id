import { redirect } from "next/navigation";
import { AccountView } from "@/components/storefront/account/AccountView";
import { getCustomerProfile, getCustomerOrders } from "@/modules/customer/customer.service";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "My Account | NORTHRE®",
};

export default async function AccountPage() {
  const supabase = await createClient();

  // Cek apakah user sudah login[cite: 1]
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Ambil data profil dan pesanan dari database secara paralel
  const [profile, orders, addressesResult, walletResult, transactionsResult, withdrawalsResult] = await Promise.all([
    getCustomerProfile(user.id),
    getCustomerOrders(user.id),
    supabase.from("user_addresses").select("id, label, recipient_name, phone_number, street_address, city, province, postal_code, is_default").eq("user_id", user.id).order("is_default", { ascending: false }),
    supabase.from("wallets").select("id, balance, cashback_balance").eq("user_id", user.id).maybeSingle(),
    supabase.from("wallet_transactions").select("id, amount, type, description, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20),
    supabase.from("withdrawal_requests").select("id, amount, bank_name, bank_account_number, bank_account_name, status, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20),
  ]);

  return (
    <div className="min-h-[calc(100vh-5rem)] w-full bg-[#f4f4f1]">
      <div className="px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
        <AccountView
          user={user}
          profile={profile}
          initialOrders={orders}
          initialAddresses={addressesResult.data || []}
          wallet={walletResult.data}
          transactions={transactionsResult.data || []}
          withdrawals={withdrawalsResult.data || []}
        />
      </div>
    </div>
  );
}
