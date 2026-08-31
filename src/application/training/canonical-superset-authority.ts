import { jsonStore } from "@/data/local/json-store";

export const CANONICAL_ANTAGONIST_SUPERSET_AUTHORITY_VERSION = "canonical_antagonist_superset_authority_v1" as const;
export type CanonicalSupersetAuthorityMode = "shadow_only" | "certification_authority" | "production_authority" | "disabled";

// Promotion changes this one versioned production default. Profiling overrides
// are persisted separately and are ignored by production builds.
export const CANONICAL_ANTAGONIST_SUPERSET_PRODUCTION_AUTHORITY: CanonicalSupersetAuthorityMode = "production_authority";
const QA_KEY = "iron-logic.qa-antagonist-superset-authority-v1";

export type CanonicalSupersetAuthorityState = Readonly<{
  version: typeof CANONICAL_ANTAGONIST_SUPERSET_AUTHORITY_VERSION;
  mode: CanonicalSupersetAuthorityMode;
  source: "production_default" | "profiling_override";
}>;

export function isCanonicalSupersetProfilingAuthorityEligible(): boolean {
  return process.env.APP_ENV !== "production"
    && process.env.EXPO_PUBLIC_DESIGN_QA_MODE === "1"
    && process.env.EXPO_PUBLIC_QA_PREMIUM_FIXTURE === "1"
    && String(process.env.EXPO_PUBLIC_SUPABASE_URL ?? "").includes("invalid.local");
}

export function resolveCanonicalSupersetAuthority(): CanonicalSupersetAuthorityState {
  if (isCanonicalSupersetProfilingAuthorityEligible()) {
    const stored = jsonStore.get<CanonicalSupersetAuthorityState | null>(QA_KEY, null);
    if (stored?.version === CANONICAL_ANTAGONIST_SUPERSET_AUTHORITY_VERSION
      && ["shadow_only", "certification_authority", "disabled"].includes(stored.mode)) {
      return { ...stored, source: "profiling_override" };
    }
  }
  return { version: CANONICAL_ANTAGONIST_SUPERSET_AUTHORITY_VERSION, mode: CANONICAL_ANTAGONIST_SUPERSET_PRODUCTION_AUTHORITY, source: "production_default" };
}

export function setCanonicalSupersetProfilingAuthority(mode: "shadow_only" | "certification_authority" | "disabled") {
  if (!isCanonicalSupersetProfilingAuthorityEligible()) return { status: "rejected" as const, reason: "profiling_authority_context_required" };
  const state: CanonicalSupersetAuthorityState = { version: CANONICAL_ANTAGONIST_SUPERSET_AUTHORITY_VERSION, mode, source: "profiling_override" };
  jsonStore.set(QA_KEY, state);
  return { status: "saved" as const, state };
}

export function resetCanonicalSupersetProfilingAuthority() {
  if (!isCanonicalSupersetProfilingAuthorityEligible()) return { status: "rejected" as const, reason: "profiling_authority_context_required" };
  jsonStore.remove(QA_KEY);
  return { status: "removed" as const };
}
