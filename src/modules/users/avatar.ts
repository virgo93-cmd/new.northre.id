import { createClient } from "@/lib/supabase/client";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export interface UploadAvatarResult {
  url: string | null;
  error: string | null;
}

export async function uploadUserAvatar(
  userId: string,
  file: File
): Promise<UploadAvatarResult> {
  const supabase = createClient();

  // 1. File type validation
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      url: null,
      error: "Unsupported file format. Please upload JPG, PNG, or WebP.",
    };
  }

  // 2. File size validation
  if (file.size > MAX_FILE_SIZE) {
    return {
      url: null,
      error: "File size exceeds the 2MB limit.",
    };
  }

  const fileExt = file.name.split(".").pop();
  const filePath = `${userId}/avatar-${Date.now()}.${fileExt}`;

  // 3. Upload file to 'avatars' storage bucket
  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(filePath, file, {
      upsert: true,
      cacheControl: "3600",
    });

  if (uploadError) {
    return {
      url: null,
      error: uploadError.message,
    };
  }

  // 4. Retrieve public URL
  const { data: publicUrlData } = supabase.storage
    .from("avatars")
    .getPublicUrl(filePath);

  const avatarUrl = publicUrlData.publicUrl;

  // 5. Update avatar_url in profiles table
  const { error: updateProfileError } = await supabase
    .from("profiles")
    .update({
      avatar_url: avatarUrl,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (updateProfileError) {
    return {
      url: null,
      error: updateProfileError.message,
    };
  }

  return {
    url: avatarUrl,
    error: null,
  };
}