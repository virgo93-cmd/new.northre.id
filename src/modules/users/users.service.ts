import { createClient } from "@/lib/supabase/client";
import type { Database } from "../../../types/database.types";

export type UserRole = Database["public"]["Enums"]["user_role"];

export interface UserAddress {
  id?: string;
  user_id: string;
  label: string;
  recipient_name: string;
  phone_number: string;
  street_address: string;
  city: string;
  province: string;
  postal_code: string;
  is_default: boolean;
  created_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  first_name: string | null;
  last_name: string | null;
  phone_number: string | null;
  role: UserRole;
  avatar_url: string | null;
  referral_code: string | null;
  referred_by: string | null;
  is_affiliate: boolean;
  affiliate_badge: string | null;
  created_at: string;
  updated_at: string;
  user_addresses?: UserAddress[];
}

export interface GetUsersParams {
  search?: string;
  role?: UserRole | "all";
  is_affiliate?: boolean | "all";
  page?: number;
  limit?: number;
}

export async function getUsers({
  search = "",
  role = "all",
  is_affiliate = "all",
  page = 1,
  limit = 10,
}: GetUsersParams = {}) {
  const supabase = createClient();
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("profiles")
    .select("*, user_addresses(*)", { count: "exact" })
    .order("created_at", { ascending: false });

  if (role && role !== "all") {
    query = query.eq("role", role);
  }

  if (is_affiliate !== "all") {
    query = query.eq("is_affiliate", is_affiliate);
  }

  if (search.trim()) {
    query = query.or(
      `email.ilike.%${search.trim()}%,full_name.ilike.%${search.trim()}%,phone_number.ilike.%${search.trim()}%`
    );
  }

  const { data, error, count } = await query.range(from, to);

  if (error) {
    console.error("Error fetching users:", error.message);
    return { data: [] as UserProfile[], count: 0, totalPages: 0 };
  }

  return {
    data: (data || []) as UserProfile[],
    count: count || 0,
    totalPages: Math.ceil((count || 0) / limit),
  };
}

export async function updateUserRole(userId: string, role: UserRole) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("profiles")
    .update({ role, updated_at: new Date().toISOString() })
    .eq("id", userId)
    .select()
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as UserProfile;
}

export async function toggleAffiliateStatus(
  userId: string,
  is_affiliate: boolean,
  affiliate_badge: string = "bronze"
) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("profiles")
    .update({
      is_affiliate,
      affiliate_badge: is_affiliate ? affiliate_badge : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .select()
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as UserProfile;
}
