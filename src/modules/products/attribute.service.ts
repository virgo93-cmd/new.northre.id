import { createClient } from "@/lib/supabase/client";
import { Attribute, AttributeTerm } from "@/types";

export async function getAttributes() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("attributes")
    .select("*, terms:attribute_terms(*)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching attributes:", error.message);
    return [];
  }

  return data as Attribute[];
}

export async function createAttribute(name: string, slug: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("attributes")
    .insert([{ name, slug }])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Attribute;
}

export async function deleteAttribute(id: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("attributes")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}

export async function addAttributeTerm(attributeId: string, name: string, slug: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("attribute_terms")
    .insert([{ attribute_id: attributeId, name, slug }])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as AttributeTerm;
}

export async function deleteAttributeTerm(id: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("attribute_terms")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}