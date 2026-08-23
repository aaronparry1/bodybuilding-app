import type { CanonicalNumericPrescriptionDecision } from "@/domain/training/canonical-comparable-exposure-policy";

export const CANONICAL_ADAPTATION_AUDIT_VERSION = "canonical_adaptation_audit_v1" as const;
export const CANONICAL_ADAPTATION_POLICY_VERSION = "canonical_adaptation_policy_v1" as const;

export type CanonicalAdaptationAudit = Readonly<{
  schemaVersion: typeof CANONICAL_ADAPTATION_AUDIT_VERSION;
  athleteId: string;
  scope: Readonly<{ kind: "programme" | "exercise"; exerciseIds: readonly string[] }>;
  evidenceWindow: Readonly<{ evidenceIds: readonly string[]; comparableExposureCount: number }>;
  signals: readonly string[];
  evidenceState: "sufficient" | "insufficient" | "conflicting" | "safety_blocked";
  changes: readonly Readonly<{
    exerciseId: string;
    variable: "load" | "repetitions" | "calibration" | "phase" | "none";
    before?: Readonly<{ prescribedBaseLoad: number; exactTargets: readonly number[] }>;
    after?: Readonly<{ prescribedBaseLoad: number; exactTargets: readonly number[] }>;
  }>[];
  bounds: readonly string[];
  authorityVersion: typeof CANONICAL_ADAPTATION_POLICY_VERSION;
  explanation: Readonly<{ observation: string; decision: string; nextAction: string }>;
}>;

export function adaptationAuditFromNumericDecisions(input: Readonly<{
  athleteId: string;
  evidenceIds: readonly string[];
  comparableExposureCount: number;
  reasonCodes: readonly string[];
  explanation: string;
  exerciseIds: readonly string[];
  numericDecisions: readonly CanonicalNumericPrescriptionDecision[];
  decisionType: string;
  recoveryEvidence: string;
}>): CanonicalAdaptationAudit {
  const actionable = input.numericDecisions.filter((item) => item.after);
  const changes = actionable.length
    ? actionable.map((item) => ({
      exerciseId: item.exerciseId,
      variable: item.outcome.includes("load") ? "load" as const : "repetitions" as const,
      before: item.before,
      after: item.after!,
    }))
    : input.exerciseIds.map((exerciseId) => ({
      exerciseId,
      variable: input.decisionType.includes("calibrat") ? "calibration" as const : "none" as const,
    }));
  return {
    schemaVersion: CANONICAL_ADAPTATION_AUDIT_VERSION,
    athleteId: input.athleteId,
    scope: { kind: input.exerciseIds.length ? "exercise" : "programme", exerciseIds: [...input.exerciseIds].sort() },
    evidenceWindow: { evidenceIds: [...input.evidenceIds].sort(), comparableExposureCount: input.comparableExposureCount },
    signals: [...input.reasonCodes],
    evidenceState: input.recoveryEvidence === "conflicting" ? "conflicting"
      : input.decisionType === "blocked" ? "safety_blocked"
        : actionable.length || input.comparableExposureCount > 0 ? "sufficient" : "insufficient",
    changes,
    bounds: ["one_numeric_variable_per_exercise", "equipment_increment_respected", "historical_prescription_immutable"],
    authorityVersion: CANONICAL_ADAPTATION_POLICY_VERSION,
    explanation: {
      observation: observationFor(input.reasonCodes),
      decision: input.explanation,
      nextAction: input.decisionType === "maintain" ? "Repeat the current target at the next comparable session." : "Follow the next canonical prescription shown in the programme.",
    },
  };
}

function observationFor(reasonCodes: readonly string[]): string {
  if (reasonCodes.some((reason) => reason.includes("successful"))) return "Comparable completed sets met the prescribed targets.";
  if (reasonCodes.some((reason) => reason.includes("failed") || reason.includes("failure"))) return "Comparable completed sets remained below the prescribed targets.";
  if (reasonCodes.some((reason) => reason.includes("incomplete") || reason.includes("partial"))) return "The workout did not provide a complete comparable result.";
  return "The completed workout and its available context were reviewed.";
}

export function validateCanonicalAdaptationAudit(value: unknown): value is CanonicalAdaptationAudit {
  if (!value || typeof value !== "object") return false;
  const audit = value as Partial<CanonicalAdaptationAudit>;
  return audit.schemaVersion === CANONICAL_ADAPTATION_AUDIT_VERSION
    && typeof audit.athleteId === "string" && Boolean(audit.athleteId)
    && Boolean(audit.scope) && ["programme", "exercise"].includes(String(audit.scope?.kind))
    && Array.isArray(audit.scope?.exerciseIds)
    && Boolean(audit.evidenceWindow) && Array.isArray(audit.evidenceWindow?.evidenceIds)
    && Number.isInteger(audit.evidenceWindow?.comparableExposureCount)
    && Array.isArray(audit.signals) && audit.signals.length > 0
    && ["sufficient", "insufficient", "conflicting", "safety_blocked"].includes(String(audit.evidenceState))
    && Array.isArray(audit.changes)
    && Array.isArray(audit.bounds) && audit.bounds.length > 0
    && audit.authorityVersion === CANONICAL_ADAPTATION_POLICY_VERSION
    && Boolean(audit.explanation?.observation && audit.explanation?.decision && audit.explanation?.nextAction);
}
