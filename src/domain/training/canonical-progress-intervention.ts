export const CANONICAL_PROGRESS_INTERVENTION_VERSION = "canonical_progress_intervention_v1" as const;
type Common = Readonly<{ schemaVersion: typeof CANONICAL_PROGRESS_INTERVENTION_VERSION; decisionId: string; evaluationId: string; planId: string; planRevision: number; macrocycleId: string; mesocycleId: string; microcycleId: string; evidenceIds: readonly string[]; evidenceVersions: Readonly<Record<string, string>>; reason: string; policyVersion: string; applicationOwner: "Mesocycle" | "Microcycle" | "Progress" | "Macrocycle"; provenance: readonly string[] }>;
export type CanonicalProgressIntervention =
  | (Common & Readonly<{ family: "load_adjustment"; disposition: "reduce" | "maintain" | "increase" | "calibration_required" | "review_required" }>)
  | (Common & Readonly<{ family: "volume_adjustment"; disposition: "reduce" | "maintain" | "increase" | "review" }>)
  | (Common & Readonly<{ family: "microcycle_rotation"; disposition: "retain" | "advance" | "reduce_stress" | "review" }>)
  | (Common & Readonly<{ family: "recovery_action"; disposition: "continue" | "reduce_stress" | "deload" | "pause_review" | "insufficient_evidence" }>)
  | (Common & Readonly<{ family: "goal_or_phase_review"; disposition: "remain_on_route" | "review_route_compatibility" | "transition" | "insufficient_evidence" }>);

const forbidden = ["exactLoad", "prescribedLoad", "sets", "reps", "exerciseId", "sessionOrder", "roles", "slotVolume"];
export function validateCanonicalProgressIntervention(value: unknown): { status: "valid"; intervention: CanonicalProgressIntervention } | { status: "invalid"; reason: string } {
  if (!value || typeof value !== "object") return { status: "invalid", reason: "not_object" };
  const c = value as Record<string, unknown>;
  if (c.schemaVersion !== CANONICAL_PROGRESS_INTERVENTION_VERSION) return { status: "invalid", reason: "unsupported_version" };
  for (const key of ["decisionId", "evaluationId", "planId", "macrocycleId", "mesocycleId", "microcycleId", "reason", "policyVersion", "applicationOwner"]) if (typeof c[key] !== "string" || !c[key]) return { status: "invalid", reason: `missing_${key}` };
  if (!Number.isInteger(c.planRevision) || Number(c.planRevision) < 0 || !Array.isArray(c.evidenceIds) || !c.evidenceIds.every((id) => typeof id === "string") || !c.evidenceVersions || typeof c.evidenceVersions !== "object" || !Array.isArray(c.provenance)) return { status: "invalid", reason: "invalid_provenance" };
  if (!["load_adjustment", "volume_adjustment", "microcycle_rotation", "recovery_action", "goal_or_phase_review"].includes(String(c.family))) return { status: "invalid", reason: "unsupported_family" };
  if (typeof c.disposition !== "string") return { status: "invalid", reason: "missing_disposition" };
  if (forbidden.some((key) => key in c)) return { status: "invalid", reason: "exact_prescription_forbidden" };
  return { status: "valid", intervention: value as CanonicalProgressIntervention };
}
