import { createClient } from "@/lib/supabase/client";

export interface MidtransConfigValue {
  is_production: boolean;
  client_key: string;
  server_key: string;
  merchant_id: string;
}

export interface MengantarConfigValue {
  api_key: string;
  webhook_secret: string;
  base_url: string;
}

export async function getSystemSetting<T>(key: string, defaultValue: T): Promise<T> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("system_settings")
    .select("value")
    .eq("key", key)
    .maybeSingle();

  if (error || !data) {
    return defaultValue;
  }

  return { ...defaultValue, ...data.value };
}

export async function updateSystemSetting(key: string, value: Record<string, any>) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("system_settings")
    .upsert(
      {
        key,
        value,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "key" }
    )
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}