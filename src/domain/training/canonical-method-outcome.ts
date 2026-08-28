import type { CanonicalProgressEvidence } from "@/domain/training/canonical-progress-evidence";

export const CANONICAL_METHOD_OUTCOME_SCHEMA = "canonical_method_outcome_v1" as const;
export const CANONICAL_METHOD_OUTCOME_POLICY = "canonical_method_outcome_policy_v1" as const;

export type CanonicalAdaptiveMethod = "antagonist_superset" | "top_set_backoff" | "rest_pause";
export type CanonicalMethodOutcome = Readonly<{
  schemaVersion: typeof CANONICAL_METHOD_OUTCOME_SCHEMA;
  policyVersion: typeof CANONICAL_METHOD_OUTCOME_POLICY;
  outcomeId: string;
  evidenceId: string;
  planId: string;
  planRevision: number;
  macrocycleId: string;
  mesocycleId: string;
  microcycleId: string;
  sessionId: string;
  slotId: string;
  exerciseId: string;
  comparableExposureIdentity: string;
  method: CanonicalAdaptiveMethod;
  methodPrescriptionVersion: string;
  groupIdentity: string | null;
  groupPosition: number | null;
  pairComparableIdentity: string | null;
  setRole: string;
  setOrder: number;
  prescribedLoad: number | null;
  prescribedRepetitions: number | null;
  performedLoad: number;
  performedRepetitions: number;
  prescribedRestSeconds: number | null;
  actualRestSeconds: number | null;
  observedTransitionSeconds: number | null;
  recoveryTimingConfidence: "reliable" | "unreliable";
  recoveryTimingReason: string;
  completion: "complete" | "partial" | "missed";
  correctionProvenance: "original" | "corrected" | "unknown";
  substitutionId: string | null;
  executionEventId: string | null;
  originalExecutionEventId: string | null;
  replayProvenance: string;
  exercisePerformance: "met" | "exceeded" | "missed" | "partial";
  setRolePerformance: "met" | "exceeded" | "missed" | "partial";
  methodExecution: "observed" | "incomplete" | "unknown";
  methodSuitability: "not_evaluated";
  sessionDisruption: "not_observed" | "unknown";
  userContextChange: "not_observed" | "unknown";
  evidenceConfidence: "sufficient_set_fact" | "incomplete";
  adaptationEligible: boolean;
  affectsNextComparableExposure: boolean;
  affectsFutureMethodAssignment: boolean;
  decisionAuthority: "shadow_only";
  outcomeClassification: string;
  applicableFutureSlot: string;
  boundaryBehaviour: "retain_until_resolved";
  observedAt: string;
}>;

const METHODS = new Set<CanonicalAdaptiveMethod>(["antagonist_superset", "top_set_backoff", "rest_pause"]);

export function methodOutcomeFromPerformanceEvidence(evidence: CanonicalProgressEvidence): CanonicalMethodOutcome | null {
  if (evidence.kind !== "performance") return null;
  const facts = evidence.observations;
  const method = String(facts.method ?? "") as CanonicalAdaptiveMethod;
  if (!METHODS.has(method) || !evidence.sessionId || !evidence.slotId) return null;
  const completion = normalCompletion(facts.completion);
  const prescribedRepetitions = finiteOrNull(facts.prescribedTargetReps);
  const performedRepetitions = Number(facts.reps ?? 0);
  const performedLoad = Number(facts.load ?? 0);
  const performance = completion !== "complete"
    ? completion
    : prescribedRepetitions !== null && performedRepetitions > prescribedRepetitions ? "exceeded"
      : prescribedRepetitions !== null && performedRepetitions < prescribedRepetitions ? "missed"
        : "met";
  const comparableExposureIdentity = String(facts.comparableExposureKey ?? "");
  return {
    schemaVersion: CANONICAL_METHOD_OUTCOME_SCHEMA,
    policyVersion: CANONICAL_METHOD_OUTCOME_POLICY,
    outcomeId: `${evidence.evidenceId}:method-outcome`,
    evidenceId: evidence.evidenceId,
    planId: evidence.planId,
    planRevision: evidence.planRevision,
    macrocycleId: evidence.macrocycleId,
    mesocycleId: evidence.mesocycleId,
    microcycleId: evidence.microcycleId,
    sessionId: evidence.sessionId,
    slotId: evidence.slotId,
    exerciseId: String(facts.exerciseId ?? ""),
    comparableExposureIdentity,
    method,
    methodPrescriptionVersion: String(facts.methodContractVersion ?? "legacy_or_unversioned"),
    groupIdentity: facts.methodGroupIdentity ? String(facts.methodGroupIdentity) : null,
    groupPosition: finiteOrNull(facts.methodGroupPosition),
    pairComparableIdentity: facts.pairedExerciseId
      ? [String(facts.exerciseId ?? ""), String(facts.pairedExerciseId)].sort().join("::")
      : null,
    setRole: String(facts.setRole ?? "unknown"),
    setOrder: Number(facts.setOrder ?? 0),
    prescribedLoad: finiteOrNull(facts.prescribedSetLoad),
    prescribedRepetitions,
    performedLoad,
    performedRepetitions,
    prescribedRestSeconds: finiteOrNull(facts.prescribedRestSeconds),
    actualRestSeconds: finiteOrNull(facts.actualRestSeconds),
    observedTransitionSeconds: finiteOrNull(facts.observedTransitionSeconds),
    recoveryTimingConfidence: facts.recoveryTimingConfidence === "reliable" ? "reliable" : "unreliable",
    recoveryTimingReason: String(facts.recoveryTimingReason ?? "recovery_timing_not_started"),
    completion,
    correctionProvenance: facts.correctionProvenance === "corrected" ? "corrected" : facts.correctionProvenance === "original" ? "original" : "unknown",
    substitutionId: facts.substitutionId ? String(facts.substitutionId) : null,
    executionEventId: facts.executionEventId ? String(facts.executionEventId) : null,
    originalExecutionEventId: facts.originalExecutionEventId ? String(facts.originalExecutionEventId) : null,
    replayProvenance: evidence.source,
    exercisePerformance: performance,
    setRolePerformance: performance,
    methodExecution: completion === "complete" ? "observed" : "incomplete",
    methodSuitability: "not_evaluated",
    sessionDisruption: "unknown",
    userContextChange: "unknown",
    evidenceConfidence: comparableExposureIdentity && Number.isInteger(Number(facts.setOrder)) ? "sufficient_set_fact" : "incomplete",
    adaptationEligible: completion === "complete" && Boolean(comparableExposureIdentity),
    affectsNextComparableExposure: completion === "complete" && Boolean(comparableExposureIdentity),
    affectsFutureMethodAssignment: false,
    decisionAuthority: "shadow_only",
    outcomeClassification: `${method}:${performance}`,
    applicableFutureSlot: comparableExposureIdentity,
    boundaryBehaviour: "retain_until_resolved",
    observedAt: evidence.observedAt,
  };
}

export function validateCanonicalMethodOutcome(value: unknown): Readonly<{ status: "valid"; outcome: CanonicalMethodOutcome } | { status: "invalid"; reason: string }> {
  if (!value || typeof value !== "object") return { status: "invalid", reason: "malformed_method_outcome" };
  const item = value as Record<string, unknown>;
  if (item.schemaVersion !== CANONICAL_METHOD_OUTCOME_SCHEMA || item.policyVersion !== CANONICAL_METHOD_OUTCOME_POLICY) return { status: "invalid", reason: "unsupported_method_outcome_version" };
  for (const key of ["outcomeId", "evidenceId", "planId", "sessionId", "slotId", "exerciseId", "method", "observedAt"]) if (!item[key]) return { status: "invalid", reason: `missing_${key}` };
  if (!METHODS.has(item.method as CanonicalAdaptiveMethod)) return { status: "invalid", reason: "unsupported_method" };
  if (item.decisionAuthority !== "shadow_only") return { status: "invalid", reason: "method_outcome_authority_not_certified" };
  return { status: "valid", outcome: value as CanonicalMethodOutcome };
}

function finiteOrNull(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function normalCompletion(value: unknown): CanonicalMethodOutcome["completion"] {
  return value === "complete" || value === "partial" || value === "missed" ? value : "missed";
}
