import { constructCanonicalActivePlan, type CanonicalConstructionInput } from "@/application/training/canonical-active-plan-construction";
import type { CanonicalActivePlanCarrier, CanonicalPlannedSessionSnapshot } from "@/domain/training/canonical-active-plan-carrier";

export type CanonicalPlanV2MigrationResult = Readonly<{ status: "migrated"; carrier: CanonicalActivePlanCarrier; migrationId: string } | { status: "recoverable_failure"; reason: "invalid_source" | "missing_canonical_inputs" | "construction_failed" }>;

export type CanonicalPlanV1MigrationInput = Readonly<{ source: unknown; plannedSessions: readonly CanonicalPlannedSessionSnapshot[]; canonicalInputs: Omit<CanonicalConstructionInput, "planId" | "createdAt" | "updatedAt" | "plannedSessions"> }>;

/** Explicit test/migration boundary. Legacy block data is inspected only for identity/profile recovery and never copied. */
export function migrateCanonicalPlanV1ToV2(input: CanonicalPlanV1MigrationInput): CanonicalPlanV2MigrationResult {
  if (!input.source || typeof input.source !== "object") return { status: "recoverable_failure", reason: "invalid_source" };
  const source = input.source as Record<string, unknown>;
  if (source.schemaVersion !== "canonical_plan_v1" && source.authority === undefined) return { status: "recoverable_failure", reason: "invalid_source" };
  if (typeof source.id !== "string" || typeof source.createdAt !== "string" || !input.canonicalInputs) return { status: "recoverable_failure", reason: "missing_canonical_inputs" };
  const result = constructCanonicalActivePlan({ ...input.canonicalInputs, planId: source.id, createdAt: source.createdAt, updatedAt: typeof source.updatedAt === "string" ? source.updatedAt : source.createdAt, plannedSessions: input.plannedSessions });
  if (result.status !== "constructed") return { status: "recoverable_failure", reason: "construction_failed" };
  return { status: "migrated", carrier: result.carrier, migrationId: `canonical_plan_v1_to_v2:${source.id}` };
}
