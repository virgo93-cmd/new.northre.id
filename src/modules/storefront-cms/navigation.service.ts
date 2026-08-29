import { createClient } from "@/lib/supabase/client";

export interface NavigationItem {
  id?: string;
  label: string;
  url: string;
  location: "header" | "footer";
  sort_order: number;
  is_active: boolean;
  parent_id?: string | null; // Tambahan untuk mendukung menu bertingkat
}

export async function getNavigationItems(): Promise<NavigationItem[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("store_navigation")
    .select("*")
    .order("location", { ascending: true })
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Error fetching navigation items:", error.message);
    return [];
  }

  return data as NavigationItem[];
}

export async function createNavigationItem(item: Omit<NavigationItem, "id">) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("store_navigation")
    .insert([item])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as NavigationItem;
}

export async function updateNavigationItem(id: string, item: Partial<NavigationItem>) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("store_navigation")
    .update({
      ...item,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as NavigationItem;
}

export async function deleteNavigationItem(id: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("store_navigation")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  return true;
}