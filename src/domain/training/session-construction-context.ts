import type { MacrocycleSpec } from "@/domain/training/macrocycle-engine";
import type { MicrocyclePlan } from "@/domain/training/microcycle-scheduler";
import type { MesocyclePrescriptionPolicy } from "@/domain/training/mesocycle-prescription-policy";
import type { Equipment, Exercise, ExperienceLevel, MuscleGroup, UnitSystem, WorkoutHistorySummary } from "@/domain/training/models";

export type SessionConstructionKind = "planned" | "extra" | "custom";

export type SessionConstructionContext = Readonly<{
  schemaVersion: "session_construction_context_v1";
  macrocycle: Readonly<Pick<MacrocycleSpec, "goal" | "targetDate" | "rolling">>;
  mesocycle: Readonly<{ id: MesocyclePrescriptionPolicy["mesocycleId"]; policy: MesocyclePrescriptionPolicy; position: number }>;
  microcycle: Readonly<{ id: string; output: MicrocyclePlan; currentRole: string; sessionIndex: number; stressContext: string; recoveryDays: number }>;
  athlete: Readonly<{ experienceLevel: ExperienceLevel; daysPerWeek: number; preferredSplit: string; equipment: readonly Equipment[]; limitations: readonly string[]; exercisePreferences?: Readonly<Record<string, unknown>>; units: UnitSystem; exercises: readonly Exercise[] }>;
  progress: Readonly<{ readiness?: string; recoveryConstraint?: string; history: readonly WorkoutHistorySummary[]; establishedLoads?: Readonly<Record<string, number>>; fatigueEvidence?: readonly string[] }>;
  operational: Readonly<{ kind: SessionConstructionKind; identity: string; version: string }>;
}>;

export type SessionConstructionContextResult = Readonly<{ status: "valid"; context: SessionConstructionContext } | { status: "invalid"; reason: "missing_policy" | "missing_microcycle_role" | "invalid_session_index" | "missing_exercise_catalogue" | "legacy_field_present" | "invalid_identity" }>;

export function validateSessionConstructionContext(value: unknown): SessionConstructionContextResult {
  if (!value || typeof value !== "object") return { status: "invalid", reason: "invalid_identity" };
  const candidate = value as Record<string, unknown>;
  for (const field of ["blocks", "activeBlockId", "currentBlock", "nextBlock", "blockType", "trainingYear", "annualWeek"]) if (field in candidate) return { status: "invalid", reason: "legacy_field_present" };
  if (!candidate.mesocycle || typeof candidate.mesocycle !== "object") return { status: "invalid", reason: "missing_policy" };
  const mesocycle = candidate.mesocycle as { policy?: MesocyclePrescriptionPolicy };
  if (!mesocycle.policy || mesocycle.policy.schemaVersion !== "mesocycle_prescription_policy_v1") return { status: "invalid", reason: "missing_policy" };
  const microcycle = candidate.microcycle as { currentRole?: unknown; sessionIndex?: unknown } | undefined;
  if (!microcycle?.currentRole) return { status: "invalid", reason: "missing_microcycle_role" };
  if (typeof microcycle.sessionIndex !== "number" || microcycle.sessionIndex < 0) return { status: "invalid", reason: "invalid_session_index" };
  const athlete = candidate.athlete as { exercises?: unknown } | undefined;
  if (!athlete || !Array.isArray(athlete.exercises)) return { status: "invalid", reason: "missing_exercise_catalogue" };
  const operational = candidate.operational as { identity?: unknown; version?: unknown } | undefined;
  if (!operational?.identity || !operational.version) return { status: "invalid", reason: "invalid_identity" };
  return { status: "valid", context: value as SessionConstructionContext };
}
