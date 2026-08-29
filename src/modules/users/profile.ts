import { createClient } from "@/lib/supabase/client";
import { Profile } from "@/types";

export interface UpdateProfileInput {
  first_name: string;
  last_name: string;
  phone_number: string;
}

export interface UpdateProfileResult {
  data: Profile | null;
  error: string | null;
}

export async function updateUserProfile(
  userId: string,
  input: UpdateProfileInput
): Promise<UpdateProfileResult> {
  const supabase = createClient();

  const fullName = `${input.first_name.trim()} ${input.last_name.trim()}`.trim();

  const { data, error } = await supabase
    .from("profiles")
    .update({
      first_name: input.first_name.trim() || null,
      last_name: input.last_name.trim() || null,
      full_name: fullName || null,
      phone_number: input.phone_number.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .select()
    .maybeSingle();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: data as Profile, error: null };
}