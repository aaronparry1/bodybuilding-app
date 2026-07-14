export const CANONICAL_PLAN_AUTHORITY_VERSION = "canonical_plan_v1" as const;
export const LEGACY_PLAN_AUTHORITY_VERSION = "legacy_training_year_v1" as const;
export type PlanAuthorityProvenance = Readonly<{ kind: "canonical_modern"; version: typeof CANONICAL_PLAN_AUTHORITY_VERSION }> | Readonly<{ kind: "legacy_compatibility"; version: typeof LEGACY_PLAN_AUTHORITY_VERSION }> | Readonly<{ kind: "ambiguous_unversioned"; reason: "insufficient_evidence" | "conflicting_evidence" | "unsupported_version" | "invalid_marker" }>;
export type PlanMutationEligibility = "canonical_mutation_permitted" | "legacy_compatibility_mutation_permitted" | "mutation_prohibited";
export type PlanAuthorityInput = Readonly<{ authority?: unknown; currentMesocycleId?: unknown; currentMicrocycle?: unknown; blocks?: unknown; activeBlockId?: unknown }>;
export function classifyPlanAuthority(input: PlanAuthorityInput): PlanAuthorityProvenance {
  const marker = input.authority;
  if (marker !== undefined) {
    if (isCanonicalMarker(marker)) return hasCanonicalState(input) ? { kind: "canonical_modern", version: CANONICAL_PLAN_AUTHORITY_VERSION } : { kind: "ambiguous_unversioned", reason: "invalid_marker" };
    if (isLegacyMarker(marker)) return hasLegacyState(input) ? { kind: "legacy_compatibility", version: LEGACY_PLAN_AUTHORITY_VERSION } : { kind: "ambiguous_unversioned", reason: "invalid_marker" };
    return { kind: "ambiguous_unversioned", reason: "unsupported_version" };
  }
  const canonical = hasCanonicalState(input); const legacy = hasLegacyState(input);
  if (canonical && !legacy) return { kind: "canonical_modern", version: CANONICAL_PLAN_AUTHORITY_VERSION };
  if (legacy && !canonical) return { kind: "legacy_compatibility", version: LEGACY_PLAN_AUTHORITY_VERSION };
  return { kind: "ambiguous_unversioned", reason: canonical ? "conflicting_evidence" : "insufficient_evidence" };
}
export function mutationEligibility(provenance: PlanAuthorityProvenance, operation: "canonical_transition" | "legacy_compatibility"): PlanMutationEligibility {
  if (provenance.kind === "canonical_modern") return operation === "canonical_transition" ? "canonical_mutation_permitted" : "mutation_prohibited";
  if (provenance.kind === "legacy_compatibility") return operation === "legacy_compatibility" ? "legacy_compatibility_mutation_permitted" : "mutation_prohibited";
  return "mutation_prohibited";
}
function isCanonicalMarker(value: unknown): boolean { return Boolean(value && typeof value === "object" && (value as any).kind === "canonical_modern" && (value as any).version === CANONICAL_PLAN_AUTHORITY_VERSION); }
function isLegacyMarker(value: unknown): boolean { return Boolean(value && typeof value === "object" && (value as any).kind === "legacy_compatibility" && (value as any).version === LEGACY_PLAN_AUTHORITY_VERSION); }
function hasCanonicalState(input: PlanAuthorityInput): boolean { return typeof input.currentMesocycleId === "string" && Boolean(input.currentMicrocycle && typeof input.currentMicrocycle === "object"); }
function hasLegacyState(input: PlanAuthorityInput): boolean { return Array.isArray(input.blocks) && typeof input.activeBlockId === "string" && input.blocks.length > 0; }
