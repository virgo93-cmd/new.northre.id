import { createClient } from "@/lib/supabase/client";

// Interface khusus untuk format link navigasi
export interface FooterLink {
  label: string;
  url: string;
}

export interface FooterSettings {
  id?: string;
  description: string;
  trademark_text?: string;
  operational_hours?: string;
  information_links?: FooterLink[];
  copyright_text: string;
  contact_email: string;
  contact_phone: string;
  contact_address: string;
  instagram_url: string;
  tiktok_url: string;
  facebook_url: string;
  twitter_url: string;
  youtube_url: string;
}

// Interface ringkas untuk opsi dropdown halaman
export interface PageOption {
  title: string;
  slug: string;
}

const DEFAULT_FOOTER_ID = "00000000-0000-0000-0000-000000000001";

export async function getFooterSettings(): Promise<FooterSettings> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("store_footer_settings")
    .select("*")
    .eq("id", DEFAULT_FOOTER_ID)
    .maybeSingle();

  if (error || !data) {
    if (error) {
      console.error("Error fetching footer settings:", error.message);
    }
    return {
      id: DEFAULT_FOOTER_ID,
      description: "NORTHRE® is an Indonesian streetwear apparel brand focusing on modern aesthetic, functional precision, and timeless culture.",
      trademark_text: "NORTHRE® is registered trademark and protected under Indonesian Law.",
      operational_hours: "Mon – Sun / 08.00 – 22.00 WIB",
      information_links: [
        { label: "About Us", url: "/pages/about-us" },
        { label: "FAQs", url: "/pages/faqs" }
      ],
      copyright_text: "© 2026 NORTHRE.ID",
      contact_email: "northre26@gmail.com",
      contact_phone: "085147356083",
      contact_address: "Perum Puri Sumelap Indah, Blok B.11, Kel. Sumelap, Kec. Tamansari, Kota Tasikmalaya, Jawa Barat, 46196",
      instagram_url: "https://www.instagram.com/northreofficial/",
      tiktok_url: "https://www.tiktok.com/@northreofficial",
      facebook_url: "https://www.facebook.com/profile.php?id=61568480603408",
      twitter_url: "",
      youtube_url: "https://www.youtube.com/@Northre-Official",
    };
  }

  return data as FooterSettings;
}

export async function updateFooterSettings(settings: FooterSettings) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("store_footer_settings")
    .upsert({
      id: DEFAULT_FOOTER_ID,
      ...settings,
      updated_at: new Date().toISOString(),
    })
    .select()
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as FooterSettings;
}

// BARU: Fungsi untuk mengambil daftar halaman dari tabel store_pages untuk pilihan dropdown footer
export async function getAvailablePages(): Promise<PageOption[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("store_pages")
    .select("title, slug")
    .eq("is_published", true)
    .order("title", { ascending: true });

  if (error) {
    console.error("Error fetching available pages:", error.message);
    return [];
  }

  return data as PageOption[];
}