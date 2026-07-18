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
  | Readonly<{ schemaVersion: typeof CANONICAL_LOAD_PRESCRIPTION_VERSION; state: "calibration_required"; loadingMode: string; instruction: string; reason: string; evidenceStatus: "missing" | "stale" | "incompatible"; protocol?: CanonicalCalibrationProtocol }>
  | Readonly<{ schemaVersion: typeof CANONICAL_LOAD_PRESCRIPTION_VERSION; state: "autoregulated"; loadingMode: string; instruction: string; evidenceStatus: "available" | "missing" }>
  | Readonly<{ schemaVersion: typeof CANONICAL_LOAD_PRESCRIPTION_VERSION; state: "bodyweight"; loadingMode: string; instruction: string }>
  | Readonly<{ schemaVersion: typeof CANONICAL_LOAD_PRESCRIPTION_VERSION; state: "unavailable"; reason: string; evidenceStatus: "missing" | "stale" | "incompatible" | "invalid" }>;

export function validateCanonicalLoadPrescription(value: unknown): Readonly<{ status: "valid" } | { status: "invalid"; reason: string }> {
  if (!value || typeof value !== "object") return { status: "invalid", reason: "load_prescription_not_object" };
  const candidate = value as Record<string, unknown>;
  if (candidate.schemaVersion !== CANONICAL_LOAD_PRESCRIPTION_VERSION || typeof candidate.state !== "string") return { status: "invalid", reason: "unsupported_load_prescription_version" };
  if (candidate.state === "established" && (!Number.isFinite(candidate.prescribedBaseLoad) || Number(candidate.prescribedBaseLoad) <= 0 || candidate.baseUnit !== "kg" || !candidate.evidence)) return { status: "invalid", reason: "invalid_established_load" };
  if (candidate.state === "calibration_required" && (typeof candidate.instruction !== "string" || (candidate.protocol !== undefined && !validateCalibrationProtocol(candidate.protocol)))) return { status: "invalid", reason: "invalid_calibration_load" };
  if (candidate.state === "unavailable" && typeof candidate.reason !== "string") return { status: "invalid", reason: "invalid_unavailable_load" };
  if (!["established", "calibration_required", "autoregulated", "bodyweight", "unavailable"].includes(candidate.state)) return { status: "invalid", reason: "unsupported_loading_state" };
  return { status: "valid" };
}

export type CanonicalCalibrationProtocol = Readonly<{
  schemaVersion: "canonical_load_calibration_protocol_v1";
  targetReps: number;
  workingSets: number;
  warmupAndRampExcludedFromWorkingVolume: true;
  startingInstruction: string;
  safeAdjustment: string;
  successCriteria: string;
  laterWorkingSets: string;
  evidenceRetention: Readonly<{ persistCompletedWorkingSetEvidence: true; reuseWhileFreshAndCompatible: true; recalibrateOnlyWhen: readonly ["missing", "stale", "incompatible"] }>;
}>;

export function withCanonicalCalibrationProtocol(prescription: CanonicalLoadPrescription, targetReps: number, workingSets: number): CanonicalLoadPrescription {
  if (prescription.state !== "calibration_required") return prescription;
  return {
    ...prescription,
    protocol: {
      schemaVersion: "canonical_load_calibration_protocol_v1",
      targetReps,
      workingSets,
      warmupAndRampExcludedFromWorkingVolume: true,
      startingInstruction: "Before working sets, begin with the lightest load you can control confidently for the exact target and leave at least three good reps in reserve.",
      safeAdjustment: "Use warm-up/ramp attempts to increase by one available equipment increment; stop increasing if technique, range or rep speed becomes inconsistent.",
      successCriteria: `Use the first load that permits ${targetReps} controlled reps with stable technique and at least two good reps in reserve.`,
      laterWorkingSets: "Use that provisional load for the prescribed working sets; reduce by one increment if the stop rule triggers. Warm-up/ramp attempts do not count as working sets.",
      evidenceRetention: { persistCompletedWorkingSetEvidence: true, reuseWhileFreshAndCompatible: true, recalibrateOnlyWhen: ["missing", "stale", "incompatible"] },
    },
  };
}

function validateCalibrationProtocol(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return candidate.schemaVersion === "canonical_load_calibration_protocol_v1"
    && Number.isInteger(candidate.targetReps) && Number(candidate.targetReps) > 0
    && Number.isInteger(candidate.workingSets) && Number(candidate.workingSets) > 0
    && candidate.warmupAndRampExcludedFromWorkingVolume === true
    && typeof candidate.startingInstruction === "string"
    && typeof candidate.safeAdjustment === "string"
    && typeof candidate.successCriteria === "string"
    && typeof candidate.laterWorkingSets === "string";
}
