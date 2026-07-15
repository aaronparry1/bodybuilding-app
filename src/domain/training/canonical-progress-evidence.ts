import type { MesocycleId } from "@/domain/training/mesocycle-library";

export const CANONICAL_PROGRESS_EVIDENCE_SCHEMA = "canonical_progress_evidence_v1" as const;
export type CanonicalProgressEvidence = Readonly<{
  schemaVersion: typeof CANONICAL_PROGRESS_EVIDENCE_SCHEMA;
  evidenceId: string;
  planId: string;
  planRevision: number;
  macrocycleId: string;
  mesocycleId: MesocycleId;
  microcycleId: string;
  sessionId?: string;
  slotId?: string;
  athleteId: string;
  observedAt: string;
  source: string;
  kind: "performance" | "completion" | "readiness" | "pain" | "capacity" | "review_request";
  observations: Readonly<Record<string, string | number | boolean | null>>;
  evidenceVersion: string;
}>;

export type CanonicalProgressEvidenceValidation = Readonly<{ status: "valid"; evidence: CanonicalProgressEvidence } | { status: "invalid"; reason: string }>;

export function validateCanonicalProgressEvidence(value: unknown): CanonicalProgressEvidenceValidation {
  if (!value || typeof value !== "object") return { status: "invalid", reason: "malformed_evidence" };
  const candidate = value as Record<string, unknown>;
  for (const key of ["evidenceId", "planId", "macrocycleId", "mesocycleId", "microcycleId", "athleteId", "observedAt", "source", "evidenceVersion"]) if (typeof candidate[key] !== "string" || !candidate[key]) return { status: "invalid", reason: `missing_${key}` };
  if (candidate.schemaVersion !== CANONICAL_PROGRESS_EVIDENCE_SCHEMA) return { status: "invalid", reason: "unsupported_evidence_schema" };
  if (!Number.isInteger(candidate.planRevision) || Number(candidate.planRevision) < 0) return { status: "invalid", reason: "invalid_plan_revision" };
  if (!["performance", "completion", "readiness", "pain", "capacity", "review_request"].includes(String(candidate.kind))) return { status: "invalid", reason: "invalid_evidence_kind" };
  if (!candidate.observations || typeof candidate.observations !== "object" || Array.isArray(candidate.observations)) return { status: "invalid", reason: "invalid_observations" };
  return { status: "valid", evidence: { ...(candidate as CanonicalProgressEvidence), observations: { ...(candidate.observations as Record<string, string | number | boolean | null>) } } };
}
