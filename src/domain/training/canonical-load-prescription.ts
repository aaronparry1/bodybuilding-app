export const CANONICAL_LOAD_PRESCRIPTION_VERSION = "canonical_load_prescription_v1" as const;

export type CanonicalLoadEvidence = Readonly<{
  evidenceId: string;
  evidenceVersion: string;
  athleteId: string;
  exerciseId: string;
  sourceSessionId?: string;
  sourceSlotId?: string;
  observedLoad: number;
  observedReps: number;
  baseUnit: "kg";
  freshnessVersion: number;
  calibrationStatus: "established" | "sparse" | "stale";
}>;

export type CanonicalLoadPrescription =
  | Readonly<{ schemaVersion: typeof CANONICAL_LOAD_PRESCRIPTION_VERSION; state: "established"; prescribedBaseLoad: number; baseUnit: "kg"; loadingMode: string; evidence: CanonicalLoadEvidence; rounding: Readonly<{ increment: number; rule: string }> }>
  | Readonly<{ schemaVersion: typeof CANONICAL_LOAD_PRESCRIPTION_VERSION; state: "calibration_required"; loadingMode: string; instruction: string; reason: string; evidenceStatus: "missing" | "stale" | "incompatible" }>
  | Readonly<{ schemaVersion: typeof CANONICAL_LOAD_PRESCRIPTION_VERSION; state: "autoregulated"; loadingMode: string; instruction: string; evidenceStatus: "available" | "missing" }>
  | Readonly<{ schemaVersion: typeof CANONICAL_LOAD_PRESCRIPTION_VERSION; state: "bodyweight"; loadingMode: string; instruction: string }>
  | Readonly<{ schemaVersion: typeof CANONICAL_LOAD_PRESCRIPTION_VERSION; state: "unavailable"; reason: string; evidenceStatus: "missing" | "stale" | "incompatible" | "invalid" }>;

export function validateCanonicalLoadPrescription(value: unknown): Readonly<{ status: "valid" } | { status: "invalid"; reason: string }> {
  if (!value || typeof value !== "object") return { status: "invalid", reason: "load_prescription_not_object" };
  const candidate = value as Record<string, unknown>;
  if (candidate.schemaVersion !== CANONICAL_LOAD_PRESCRIPTION_VERSION || typeof candidate.state !== "string") return { status: "invalid", reason: "unsupported_load_prescription_version" };
  if (candidate.state === "established" && (!Number.isFinite(candidate.prescribedBaseLoad) || Number(candidate.prescribedBaseLoad) <= 0 || candidate.baseUnit !== "kg" || !candidate.evidence)) return { status: "invalid", reason: "invalid_established_load" };
  if (candidate.state === "calibration_required" && typeof candidate.instruction !== "string") return { status: "invalid", reason: "invalid_calibration_load" };
  if (candidate.state === "unavailable" && typeof candidate.reason !== "string") return { status: "invalid", reason: "invalid_unavailable_load" };
  if (!["established", "calibration_required", "autoregulated", "bodyweight", "unavailable"].includes(candidate.state)) return { status: "invalid", reason: "unsupported_loading_state" };
  return { status: "valid" };
}
