import { createClient } from "@/lib/supabase/client";
import { Tag } from "@/types";

export async function getTags() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("tags")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching tags:", error.message);
    return [];
  }

  return data as Tag[];
}

export async function createTag(tagData: Partial<Tag>) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("tags")
    .insert([tagData])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Tag;
}

export async function deleteTag(id: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("tags")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}