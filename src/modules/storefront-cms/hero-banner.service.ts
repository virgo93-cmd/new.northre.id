import { createClient } from "@/lib/supabase/client";

export interface HeroBanner {
  id?: string;
  title?: string;
  subtitle?: string;
  desktop_image_url: string; // 3780 x 1890 px / 1920 x 960 px
  mobile_image_url: string;  // 1080 x 1350 px
  show_button?: boolean;     // Toggle untuk menampilkan / menyembunyikan tombol CTA
  button_text?: string;
  button_link?: string;
  sort_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

// 1. Digunakan untuk Dashboard Admin (mengambil semua banner termasuk yang inactive)
export async function getHeroBanners(): Promise<HeroBanner[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("hero_banners")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Error fetching hero banners:", error.message);
    return [];
  }

  return data as HeroBanner[];
}

// 2. Digunakan khusus untuk Storefront Depan (hanya banner yang is_active = true)
export async function getActiveHeroBanners(): Promise<HeroBanner[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("hero_banners")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Error fetching active hero banners:", error.message);
    return [];
  }

  return data as HeroBanner[];
}

// 3. Simpan satu banner (Single Insert)
export async function createHeroBanner(banner: Omit<HeroBanner, "id">) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("hero_banners")
    .insert([
      {
        ...banner,
        show_button: banner.show_button ?? true,
      },
    ])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as HeroBanner;
}

// 4. Simpan banyak banner sekaligus (Batch/Bulk Insert) - BARU
export async function createMultipleHeroBanners(banners: Omit<HeroBanner, "id">[]) {
  const supabase = createClient();
  
  // Pastikan show_button punya nilai default true jika tidak diset
  const payload = banners.map(banner => ({
    ...banner,
    show_button: banner.show_button ?? true,
  }));

  const { data, error } = await supabase
    .from("hero_banners")
    .insert(payload)
    .select();

  if (error) {
    throw new Error(error.message);
  }

  return data as HeroBanner[];
}

export async function updateHeroBanner(id: string, banner: Partial<HeroBanner>) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("hero_banners")
    .update({
      ...banner,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as HeroBanner;
}

export async function deleteHeroBanner(id: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("hero_banners")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  return true;
}