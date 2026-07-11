export interface SupabaseConfig {
  url: string;
  publishableKey: string;
}

export interface SupabaseEnv {
  EXPO_PUBLIC_SUPABASE_URL?: string;
  EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY?: string;
  EXPO_PUBLIC_SUPABASE_ANON_KEY?: string;
}

export class SupabaseConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SupabaseConfigError";
  }
}

export function getSupabaseConfig(env: SupabaseEnv = process.env as SupabaseEnv): SupabaseConfig {
  const url = env.EXPO_PUBLIC_SUPABASE_URL?.trim();
  const publishableKey =
    env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ?? env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url) {
    throw new SupabaseConfigError("Missing EXPO_PUBLIC_SUPABASE_URL.");
  }

  if (!publishableKey) {
    throw new SupabaseConfigError(
      "Missing EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY. The Supabase public publishable/anon key is safe in a client app when Row Level Security is enabled.",
    );
  }

  return { url, publishableKey };
}

export function getSupabaseConfigResult(env: SupabaseEnv = process.env as SupabaseEnv) {
  try {
    return { config: getSupabaseConfig(env), error: null };
  } catch (error) {
    return {
      config: null,
      error: error instanceof Error ? error.message : "Supabase configuration failed.",
    };
  }
}
