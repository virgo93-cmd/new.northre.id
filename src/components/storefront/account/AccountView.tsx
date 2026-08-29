"use client";

import { useState } from "react";
import { AccountSidebar } from "./AccountSidebar";
import { CustomerProfile, CustomerOrder, updateCustomerProfileAction } from "@/modules/customer/customer.service";

interface AccountViewProps {
  user: {
    id: string;
    email?: string;
    user_metadata?: {
      full_name?: string;
      avatar_url?: string;
    };
  };
  profile: CustomerProfile | null;
  initialOrders: CustomerOrder[];
}

export function AccountView({ user, profile, initialOrders }: AccountViewProps) {
  const [activeTab, setActiveTab] = useState<"profile" | "orders">("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name || user.user_metadata?.full_name || "");
  const [phoneNumber, setPhoneNumber] = useState(profile?.phone_number || "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      await updateCustomerProfileAction(user.id, {
        full_name: fullName,
        phone_number: phoneNumber,
      });
      setMessage({ type: "success", text: "Profile updated successfully!" });
      setIsEditing(false);
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to update profile." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start w-full">
      <AccountSidebar
        email={user.email || "Customer"}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <main className="flex-1 w-full bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] min-h-[420px]">
        {activeTab === "profile" ? (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-neutral-900 uppercase">Profile Details</h2>
                <p className="text-xs text-neutral-500 tracking-wide mt-1">
                  Managed securely from your database profile.
                </p>
              </div>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all"
                >
                  Edit Profile
                </button>
              )}
            </div>

            {message && (
              <div className={`p-4 rounded-xl text-xs font-bold ${message.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"}`}>
                {message.text}
              </div>
            )}

            {isEditing ? (
              <form onSubmit={handleUpdateProfile} className="space-y-4 pt-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-neutral-900 focus:outline-none focus:border-neutral-900 font-medium"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Phone Number</label>
                  <input
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="e.g. 08123456789"
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-neutral-900 focus:outline-none focus:border-neutral-900 font-medium"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all disabled:opacity-50"
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-5 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold uppercase tracking-wider rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-5 bg-neutral-50 rounded-2xl border border-neutral-200/60">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-2">Full Name</p>
                  <p className="text-sm font-bold text-neutral-900">
                    {profile?.full_name || user.user_metadata?.full_name || "Customer"}
                  </p>
                </div>

                <div className="p-5 bg-neutral-50 rounded-2xl border border-neutral-200/60">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-2">Email Address</p>
                  <p className="text-sm font-bold text-neutral-900 truncate">
                    {profile?.email || user.email}
                  </p>
                </div>

                <div className="p-5 bg-neutral-50 rounded-2xl border border-neutral-200/60">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-2">Phone Number</p>
                  <p className="text-sm font-bold text-neutral-900">
                    {profile?.phone_number || "Not set"}
                  </p>
                </div>

                <div className="p-5 bg-neutral-50 rounded-2xl border border-neutral-200/60">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-2">Affiliate Status</p>
                  <p className="text-sm font-bold text-neutral-900">
                    {profile?.is_affiliate ? `Active (${profile.affiliate_badge || "Standard"})` : "Not an Affiliate"}
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-neutral-900 uppercase">Order History</h2>
              <p className="text-xs text-neutral-500 tracking-wide mt-1">
                Track and manage your previous store orders.
              </p>
            </div>

            {initialOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-20 border border-dashed border-neutral-300 rounded-2xl bg-neutral-50/50">
                <p className="text-sm font-bold text-neutral-900 uppercase tracking-wide">No orders found</p>
                <p className="text-xs text-neutral-500 mt-2 max-w-[250px]">
                  You haven't placed any orders with this account yet.
                </p>
              </div>
            ) : (
              <div className="space-y-4 pt-2">
                {initialOrders.map((order) => (
                  <div key={order.id} className="p-5 bg-neutral-50 rounded-2xl border border-neutral-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Order ID: #{order.id.slice(0, 8)}</p>
                      <p className="text-sm font-bold text-neutral-900 mt-1">
                        Rp {order.total_amount?.toLocaleString("id-ID")}
                      </p>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        {new Date(order.created_at).toLocaleDateString("id-ID", { dateStyle: "medium" })}
                      </p>
                    </div>
                    <div>
                      <span className="px-3 py-1 bg-neutral-200 text-neutral-800 text-xs font-bold uppercase tracking-wider rounded-full">
                        {order.status || "Pending"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}