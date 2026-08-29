import { createClient } from "@/lib/supabase/client";

export interface PromoBanner {
  id?: string;
  title?: string;
  subtitle?: string;
  image_url: string;         // 3780 x 1890 px (Rasio 2:1)
  button_text?: string;
  button_link?: string;
  show_button?: boolean;
  sort_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

// 1. Mengambil semua promo banner untuk Admin CMS
export async function getPromoBanners(): Promise<PromoBanner[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("promo_banners")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Error fetching promo banners:", error.message);
    return [];
  }

  return data as PromoBanner[];
}

// 2. Mengambil promo banner aktif untuk Storefront Depan
export async function getActivePromoBanners(): Promise<PromoBanner[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("promo_banners")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Error fetching active promo banners:", error.message);
    return [];
  }

  return data as PromoBanner[];
}

// 3. Tambah satu promo banner
export async function createPromoBanner(banner: Omit<PromoBanner, "id">) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("promo_banners")
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

  return data as PromoBanner;
}

// 4. Tambah banyak promo banner sekaligus (Batch)
export async function createMultiplePromoBanners(banners: Omit<PromoBanner, "id">[]) {
  const supabase = createClient();
  
  const payload = banners.map(banner => ({
    ...banner,
    show_button: banner.show_button ?? true,
  }));

  const { data, error } = await supabase
    .from("promo_banners")
    .insert(payload)
    .select();

  if (error) {
    throw new Error(error.message);
  }

  return data as PromoBanner[];
}

// 5. Update promo banner
export async function updatePromoBanner(id: string, banner: Partial<PromoBanner>) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("promo_banners")
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

  return data as PromoBanner;
}

// 6. Hapus promo banner
export async function deletePromoBanner(id: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("promo_banners")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  return true;
}