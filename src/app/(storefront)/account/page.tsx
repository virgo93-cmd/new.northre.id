import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { AccountView } from "@/components/storefront/account/AccountView";
import { getCustomerProfile, getCustomerOrders } from "@/modules/customer/customer.service";

export const metadata = {
  title: "My Account | NORTHRE®",
};

export default async function AccountPage() {
  const cookieStore = await cookies();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  // Cek apakah user sudah login[cite: 1]
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Ambil data profil dan pesanan dari database secara paralel
  const [profile, orders] = await Promise.all([
    getCustomerProfile(user.id),
    getCustomerOrders(user.id),
  ]);

  return (
    <div className="w-full bg-neutral-50 min-h-[calc(100vh-5rem)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight uppercase">Customer Portal</h1>
          <p className="text-sm text-neutral-500 tracking-wide mt-1">Manage your orders and account details.</p>
        </div>

        {/* Kirim data user, profile database, dan orders ke komponen AccountView */}
        <AccountView user={user} profile={profile} initialOrders={orders} />

      </div>
    </div>
  );
}