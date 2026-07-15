import type { Exercise, Equipment, TrainingLane } from "@/domain/training/models";
import type { CanonicalLoadEvidence, CanonicalLoadPrescription } from "@/domain/training/canonical-load-prescription";

export type CanonicalLoadResolutionInput = Readonly<{ exercise: Exercise; equipment: readonly Equipment[]; lane: TrainingLane; loadingMode: string; establishedLoad?: number; evidence?: CanonicalLoadEvidence; increment: number; calibrationSupported: boolean }>;

export function resolveCanonicalLoadPrescription(input: CanonicalLoadResolutionInput): CanonicalLoadPrescription {
  if (input.loadingMode === "bodyweight" || input.exercise.kind === "bodyweight") return { schemaVersion: "canonical_load_prescription_v1", state: "bodyweight", loadingMode: input.loadingMode, instruction: "bodyweight" };
  if (["autoregulated", "rpe", "rir"].includes(input.loadingMode)) return { schemaVersion: "canonical_load_prescription_v1", state: "autoregulated", loadingMode: input.loadingMode, instruction: "select a safe starting load from today's performance", evidenceStatus: input.evidence ? "available" : "missing" };
  const load = input.establishedLoad;
  if (Number.isFinite(load) && Number(load) > 0 && input.evidence && input.evidence.exerciseId === input.exercise.id && input.evidence.calibrationStatus !== "stale") {
    const rounded = Math.round(Number(load) / input.increment) * input.increment;
    return { schemaVersion: "canonical_load_prescription_v1", state: "established", prescribedBaseLoad: rounded, baseUnit: "kg", loadingMode: input.loadingMode, evidence: input.evidence, rounding: { increment: input.increment, rule: "nearest_available_increment" } };
  }
  if (input.calibrationSupported) return { schemaVersion: "canonical_load_prescription_v1", state: "calibration_required", loadingMode: input.loadingMode, instruction: "calibrate a reproducible starting load", reason: input.evidence?.calibrationStatus === "stale" ? "stale_load_evidence" : "load_evidence_unavailable", evidenceStatus: input.evidence?.calibrationStatus === "stale" ? "stale" : "missing" };
  return { schemaVersion: "canonical_load_prescription_v1", state: "unavailable", reason: "load_evidence_unavailable", evidenceStatus: input.evidence?.calibrationStatus === "stale" ? "stale" : "missing" };
}
