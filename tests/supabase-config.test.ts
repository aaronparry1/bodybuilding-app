import { describe, expect, it } from "vitest";
import { getSupabaseConfig, getSupabaseConfigResult, SupabaseConfigError } from "@/lib/supabase/config";

describe("Supabase config", () => {
  it("accepts Expo public Supabase config", () => {
    expect(
      getSupabaseConfig({
        EXPO_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
        EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_test",
      }),
    ).toEqual({
      url: "https://example.supabase.co",
      publishableKey: "sb_publishable_test",
    });
  });

  it("supports legacy anon key naming while preferring publishable key", () => {
    expect(
      getSupabaseConfig({
        EXPO_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
        EXPO_PUBLIC_SUPABASE_ANON_KEY: "anon_test",
      }).publishableKey,
    ).toBe("anon_test");
  });

  it("returns clear missing env errors", () => {
    expect(() => getSupabaseConfig({})).toThrow(SupabaseConfigError);
    expect(getSupabaseConfigResult({}).error).toContain("EXPO_PUBLIC_SUPABASE_URL");
  });
});
