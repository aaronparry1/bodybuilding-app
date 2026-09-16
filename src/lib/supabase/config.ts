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

const defaultSupabaseEnv: SupabaseEnv = {
  EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
  EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
};

/**
 * The default parameter deliberately spells out each EXPO_PUBLIC_ variable as
 * its own direct `process.env.X` member expression (defaultSupabaseEnv,
 * above), matching the one other place in this codebase confirmed to
 * correctly read an inlined Expo env var (canonical-superset-authority.ts).
 * Do not simplify this back to `process.env as SupabaseEnv` — casting the
 * whole process.env object, then reading a property off the cast result
 * later, is a different expression shape than `process.env.EXPO_PUBLIC_X`
 * and was the root cause of a real "missing EXPO_PUBLIC_SUPABASE_URL at
 * runtime despite being present at build time" bug: Expo/Metro's static env
 * inlining matches the literal `process.env.EXPO_PUBLIC_X` pattern
 * specifically, not indirect access through a locally-scoped reference.
 */
export function getSupabaseConfig(env: SupabaseEnv = defaultSupabaseEnv): SupabaseConfig {
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

export function getSupabaseConfigResult(env: SupabaseEnv = defaultSupabaseEnv) {
  try {
    return { config: getSupabaseConfig(env), error: null };
  } catch (error) {
    return {
      config: null,
      error: error instanceof Error ? error.message : "Supabase configuration failed.",
    };
  }
}
