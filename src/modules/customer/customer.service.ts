"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface CustomerProfile {
  id: string;
  email: string;
  full_name: string | null;
  first_name: string | null;
  last_name: string | null;
  phone_number: string | null;
  role: string;
  avatar_url: string | null;
  affiliate_badge: string | null;
  is_affiliate: boolean;
  referral_code: string | null;
  referred_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CustomerOrder {
  id: string;
  order_number: string;
  total_amount: number;
  status: string;
  payment_status: string;
  created_at: string;
  shipping_address?: string;
  payment_method?: string | null;
  shipping_city: string | null;
  shipping_courier: string | null;
  shipping_postal_code: string | null;
  shipping_province: string | null;
  shipping_service: string | null;
  shipping_tracking_number: string | null;
}

// Mengambil data profil customer berdasarkan ID
export async function getCustomerProfile(userId: string): Promise<CustomerProfile | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Error fetching customer profile:", error.message);
    return null;
  }

  return data;
}

// Mengambil daftar pesanan customer berdasarkan ID
export async function getCustomerOrders(userId: string): Promise<CustomerOrder[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("customer_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching customer orders:", error.message);
    return [];
  }

  return data || [];
}

// Server Action untuk memperbarui data profil customer
export async function updateCustomerProfileAction(userId: string, formData: {
  first_name?: string;
  last_name?: string;
  full_name?: string;
  phone_number?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.id !== userId) throw new Error("Unauthorized.");

  const { error } = await supabase
    .from("profiles")
    .update({
      ...formData,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) {
    throw new Error(error.message);
  }

  // Revalidate halaman account agar data terbaru langsung termuat
  revalidatePath("/account");
  return { success: true };
}

export interface CustomerAddress {
  id: string;
  label: string;
  recipient_name: string;
  phone_number: string;
  street_address: string;
  city: string;
  province: string;
  postal_code: string;
  is_default: boolean;
}

export interface CustomerWallet {
  id: string;
  balance: number;
  cashback_balance: number;
}

export interface CustomerWalletTransaction {
  id: string;
  amount: number;
  type: string;
  description: string;
  created_at: string;
}

export interface CustomerWithdrawal {
  id: string;
  amount: number;
  bank_name: string;
  bank_account_number: string;
  bank_account_name: string;
  status: string;
  created_at: string;
}

export async function createCustomerAddressAction(input: Omit<CustomerAddress, "id">) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Silakan login kembali.");

  const clean = {
    label: input.label.trim(),
    recipient_name: input.recipient_name.trim(),
    phone_number: input.phone_number.replace(/[^0-9+]/g, ""),
    street_address: input.street_address.trim(),
    city: input.city.trim(),
    province: input.province.trim(),
    postal_code: input.postal_code.trim(),
    is_default: input.is_default,
  };
  if (Object.values(clean).some((value) => typeof value === "string" && !value)) {
    throw new Error("Semua kolom alamat wajib diisi.");
  }

  const { count } = await supabase.from("user_addresses").select("id", { count: "exact", head: true }).eq("user_id", user.id);
  const shouldBeDefault = clean.is_default || count === 0;
  if (shouldBeDefault) {
    const { error } = await supabase.from("user_addresses").update({ is_default: false }).eq("user_id", user.id);
    if (error) throw new Error(error.message);
  }

  const { data, error } = await supabase.from("user_addresses").insert({ ...clean, is_default: shouldBeDefault, user_id: user.id })
    .select("id, label, recipient_name, phone_number, street_address, city, province, postal_code, is_default").single();
  if (error) throw new Error(error.message);
  revalidatePath("/account");
  return data;
}

export async function createWithdrawalRequestAction(input: {
  amount: number;
  bank_name: string;
  bank_account_number: string;
  bank_account_name: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Silakan login kembali.");
  if (!Number.isFinite(input.amount) || input.amount <= 0) throw new Error("Nominal penarikan tidak valid.");

  const [{ data: wallet }, { data: pending }] = await Promise.all([
    supabase.from("wallets").select("balance").eq("user_id", user.id).maybeSingle(),
    supabase.from("withdrawal_requests").select("amount").eq("user_id", user.id).eq("status", "pending"),
  ]);
  const available = Number(wallet?.balance || 0) - (pending || []).reduce((sum, row) => sum + Number(row.amount), 0);
  if (input.amount > available) throw new Error("Saldo tersedia tidak mencukupi.");

  const { data, error } = await supabase.from("withdrawal_requests").insert({
    user_id: user.id,
    amount: input.amount,
    bank_name: input.bank_name.trim(),
    bank_account_number: input.bank_account_number.replace(/\D/g, ""),
    bank_account_name: input.bank_account_name.trim(),
    status: "pending",
  }).select("id, amount, bank_name, bank_account_number, bank_account_name, status, created_at").single();
  if (error) throw new Error(error.message);
  revalidatePath("/account");
  return data;
}
