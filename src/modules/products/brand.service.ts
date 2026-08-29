import { createClient } from "@/lib/supabase/client";
import { Brand } from "@/types";

export async function getBrands() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("brands")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching brands:", error.message);
    return [];
  }

  return data as Brand[];
}

export async function createBrand(brandData: Partial<Brand>) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("brands")
    .insert([brandData])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Brand;
}

export async function deleteBrand(id: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("brands")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}