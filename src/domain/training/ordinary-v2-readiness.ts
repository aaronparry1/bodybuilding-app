export const ORDINARY_V2_TELEMETRY_SCHEMA = "ordinary-v2-boundary-event.v1" as const;
export const ORDINARY_V2_TRANSLATION_VERSION = "ordinary-v2-translation.v1" as const;
export type OrdinaryV2BoundaryOutcome = "production_default" | "ineligible_family" | "uncertified_role" | "rollout_disabled" | "certification_mismatch" | "v2_resolution_failed" | "translation_failed" | "rollback_identity_mismatch" | "invalid_v2_output" | "safety_predicate_failed" | "v2_canary_selected" | "exception_fallback" | "production_fallback";
export type OrdinaryV2BoundaryEvent = Readonly<{ schemaVersion: typeof ORDINARY_V2_TELEMETRY_SCHEMA; boundaryVersion: string; certificationId: string; translationVersion: typeof ORDINARY_V2_TRANSLATION_VERSION; rollbackBoundary: string; family: string; role: string; authority: "production" | "v2_ordinary_canary"; outcome: OrdinaryV2BoundaryOutcome; reasonCode: string }>;

export function encodeOrdinaryV2BoundaryEvent(input: Partial<OrdinaryV2BoundaryEvent> & Record<string, unknown>): OrdinaryV2BoundaryEvent {
  const allowed: OrdinaryV2BoundaryEvent = { schemaVersion: ORDINARY_V2_TELEMETRY_SCHEMA, boundaryVersion: String(input.boundaryVersion ?? "ordinary-v2-boundary.v1"), certificationId: String(input.certificationId ?? "ordinary-v2-certified.v1"), translationVersion: ORDINARY_V2_TRANSLATION_VERSION, rollbackBoundary: String(input.rollbackBoundary ?? "ordinary-v2-authority-boundary.v1"), family: String(input.family ?? "unknown"), role: String(input.role ?? "unknown"), authority: input.authority === "v2_ordinary_canary" ? "v2_ordinary_canary" : "production", outcome: (input.outcome as OrdinaryV2BoundaryOutcome) ?? "production_default", reasonCode: String(input.reasonCode ?? "unspecified") };
  return Object.freeze(allowed);
}

export const READINESS_THRESHOLDS = Object.freeze({ minEvidencePerRole: 1, maxFallbackRate: 0, maxTranslationFailureRate: 0, maxExceptionRate: 0, maxRiskyDifferenceRate: 0, maxBlockedDifferenceRate: 0, maxAgeDays: 30 });
export type OrdinaryV2ReadinessEvidence = Readonly<{ certificationId: string; roles: readonly string[]; evidenceCountByRole: Readonly<Record<string, number>>; missingRequiredFields: number; invariantViolations: number; partialAuthorityDecisions: number; generatedOutputViolations: number; rollbackFailures: number; fallbackRate: number; translationFailureRate: number; exceptionRate: number; riskyDifferenceRate: number; blockedDifferenceRate: number; ageDays: number; supportedBuild: boolean; rollbackAvailable: boolean; realUserEvidence: boolean }>;
export type OrdinaryV2Readiness = Readonly<{ status: "ready" | "not_ready" | "insufficient_evidence"; reasonCodes: readonly string[] }>;

export function evaluateOrdinaryV2Readiness(evidence: OrdinaryV2ReadinessEvidence | null): OrdinaryV2Readiness {
  if (!evidence || !evidence.supportedBuild || !evidence.realUserEvidence || evidence.ageDays > READINESS_THRESHOLDS.maxAgeDays || evidence.roles.length < 3 || evidence.roles.some((role) => (evidence.evidenceCountByRole[role] ?? 0) < READINESS_THRESHOLDS.minEvidencePerRole)) return { status: "insufficient_evidence", reasonCodes: ["evidence_window_incomplete"] };
  const hard = evidence.certificationId !== "ordinary-v2-certified.v1" || evidence.missingRequiredFields > 0 || evidence.invariantViolations > 0 || evidence.partialAuthorityDecisions > 0 || evidence.generatedOutputViolations > 0 || evidence.rollbackFailures > 0 || !evidence.rollbackAvailable;
  if (hard) return { status: "not_ready", reasonCodes: ["safety_invariant_failed"] };
  if (evidence.fallbackRate > READINESS_THRESHOLDS.maxFallbackRate || evidence.translationFailureRate > 0 || evidence.exceptionRate > 0 || evidence.riskyDifferenceRate > 0 || evidence.blockedDifferenceRate > 0) return { status: "not_ready", reasonCodes: ["threshold_exceeded"] };
  return { status: "ready", reasonCodes: [] };
}
