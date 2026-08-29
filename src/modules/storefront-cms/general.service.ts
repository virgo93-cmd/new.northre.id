import { createClient } from "@/lib/supabase/client";

export interface StoreSettings {
  id?: string;
  site_name: string;
  site_tagline: string;
  support_email: string;
  support_phone: string;
  logo_url: string;
  favicon_url?: string;
  address: string;
  slider_delay_ms?: number; // <-- Tambahan kolom durasi
}

export async function getStoreSettings(): Promise<StoreSettings | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("store_settings")
    .select("*")
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Error fetching store settings:", error.message);
    return null;
  }

  return data as StoreSettings | null;
}

export async function updateStoreSettings(settings: Partial<StoreSettings>) {
  const supabase = createClient();

  // Cari record pertama jika sudah ada
  const { data: existing } = await supabase
    .from("store_settings")
    .select("id")
    .limit(1)
    .maybeSingle();

  let query;

  if (existing?.id) {
    query = supabase
      .from("store_settings")
      .update({
        ...settings,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id)
      .select()
      .maybeSingle();
  } else {
    query = supabase
      .from("store_settings")
      .insert([
        {
          site_name: settings.site_name || "NORTHRE®",
          site_tagline: settings.site_tagline || "Official Online Store",
          support_email: settings.support_email || "",
          support_phone: settings.support_phone || "",
          logo_url: settings.logo_url || "",
          favicon_url: settings.favicon_url || "",
          address: settings.address || "",
          slider_delay_ms: settings.slider_delay_ms || 5000, // <-- Tambahan simpan durasi
        },
      ])
      .select()
      .maybeSingle();
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return data as StoreSettings;
}