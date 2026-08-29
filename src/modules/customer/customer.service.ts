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
  created_at: string;
  updated_at: string;
}

export interface CustomerOrder {
  id: string;
  total_amount: number;
  status: string;
  created_at: string;
  shipping_address?: string;
  payment_method?: string;
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
    .eq("user_id", userId)
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