import { createClient } from "@/lib/supabase/client";
import type { Database, Json } from "../../../types/database.types";

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

function parseFooterLinks(value: Json): FooterLink[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item) => {
    if (typeof item !== "object" || item === null || Array.isArray(item)) return [];
    const label = item.label;
    const url = item.url;
    return typeof label === "string" && typeof url === "string" ? [{ label, url }] : [];
  });
}

function mapFooterSettings(data: DatabaseFooterSettings): FooterSettings {
  return {
    id: data.id,
    description: data.description ?? "",
    trademark_text: data.trademark_text ?? "",
    operational_hours: data.operational_hours ?? "",
    information_links: parseFooterLinks(data.information_links),
    copyright_text: data.copyright_text ?? "",
    contact_email: data.contact_email ?? "",
    contact_phone: data.contact_phone ?? "",
    contact_address: data.contact_address ?? "",
    instagram_url: data.instagram_url ?? "",
    tiktok_url: data.tiktok_url ?? "",
    facebook_url: data.facebook_url ?? "",
    twitter_url: data.twitter_url ?? "",
    youtube_url: data.youtube_url ?? "",
  };
}

type DatabaseFooterSettings = Database["public"]["Tables"]["store_footer_settings"]["Row"];

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

  return mapFooterSettings(data);
}

export async function updateFooterSettings(settings: FooterSettings) {
  const supabase = createClient();
  const { information_links, ...scalarSettings } = settings;
  const { data, error } = await supabase
    .from("store_footer_settings")
    .upsert({
      id: DEFAULT_FOOTER_ID,
      ...scalarSettings,
      information_links: (information_links ?? []).map(({ label, url }) => ({ label, url })),
      updated_at: new Date().toISOString(),
    })
    .select()
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? mapFooterSettings(data) : null;
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
