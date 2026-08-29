import { createClient } from "@/lib/supabase/client";

export interface StorePage {
  id?: string;
  title: string;
  slug: string;
  content: string;
  meta_description?: string;
  is_published: boolean;
  created_at?: string;
  updated_at?: string;
}

export async function getStorePages(): Promise<StorePage[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("store_pages")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching store pages:", error.message);
    return [];
  }

  return data as StorePage[];
}

export async function getStorePageById(id: string): Promise<StorePage | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("store_pages")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching page details:", error.message);
    return null;
  }

  return data as StorePage;
}

export async function createStorePage(page: Omit<StorePage, "id" | "created_at" | "updated_at">) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("store_pages")
    .insert([page])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as StorePage;
}

export async function updateStorePage(id: string, page: Partial<StorePage>) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("store_pages")
    .update({
      ...page,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as StorePage;
}

export async function deleteStorePage(id: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("store_pages")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  return true;
}