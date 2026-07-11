import "react-native-url-polyfill/auto";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/data/supabase/database.types";
import { getLocalStorage } from "@/data/local/local-storage";
import { getSupabaseConfigResult } from "@/lib/supabase/config";

export type AppSupabaseClient = SupabaseClient<Database>;

let cachedClient: AppSupabaseClient | null = null;

export function getSupabaseClient(): AppSupabaseClient {
  if (cachedClient) return cachedClient;

  const { config, error } = getSupabaseConfigResult();
  if (!config) {
    throw new Error(error ?? "Supabase configuration failed.");
  }

  cachedClient = createClient<Database>(config.url, config.publishableKey, {
    auth: {
      storage: getLocalStorage(),
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });

  return cachedClient;
}

export function getOptionalSupabaseClient(): { client: AppSupabaseClient | null; error: string | null } {
  try {
    return { client: getSupabaseClient(), error: null };
  } catch (error) {
    return { client: null, error: error instanceof Error ? error.message : "Supabase unavailable." };
  }
}
