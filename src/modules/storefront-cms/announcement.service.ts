import { createClient } from "@/lib/supabase/client";

export interface Announcement {
  id?: string;
  content: string;
  link_url?: string;
  is_active: boolean;
  background_color?: string;
  text_color?: string;
}

export async function getAnnouncement(): Promise<Announcement | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("announcements")
    .select("*")
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Error fetching announcement:", error.message);
    return null;
  }

  return data as Announcement | null;
}

export async function updateAnnouncement(announcement: Partial<Announcement>) {
  const supabase = createClient();

  // Cari record pertama jika ada
  const { data: existing } = await supabase
    .from("announcements")
    .select("id")
    .limit(1)
    .maybeSingle();

  let query;

  if (existing?.id) {
    query = supabase
      .from("announcements")
      .update({
        ...announcement,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id)
      .select()
      .maybeSingle();
  } else {
    query = supabase
      .from("announcements")
      .insert([
        {
          content: announcement.content || "",
          link_url: announcement.link_url || "",
          is_active: announcement.is_active ?? true,
          background_color: announcement.background_color || "#2563eb",
          text_color: announcement.text_color || "#ffffff",
        },
      ])
      .select()
      .maybeSingle();
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return data as Announcement;
}