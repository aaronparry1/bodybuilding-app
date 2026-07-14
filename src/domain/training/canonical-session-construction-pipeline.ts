import type { MacrocycleSpec } from "@/domain/training/macrocycle-engine";
import type { Equipment, Exercise, ExerciseRole, ExperienceLevel, MuscleGroup, Programme, ProgressionSettings, TrainingLane, UnitSystem, WorkoutHistorySummary } from "@/domain/training/models";
import { factualExerciseMetadata, matchExerciseToMesocyclePolicy } from "@/domain/training/canonical-exercise-suitability";
import { type ConstructionRole, type MesocyclePrescriptionPolicy, type PrescriptionMethodFamily } from "@/domain/training/mesocycle-prescription-policy";
import { resolveCanonicalLaneEnvelope, resolveCanonicalTargetEnvelope } from "@/domain/training/mesocycle-construction-input-resolvers";
import type { MicrocyclePlan } from "@/domain/training/microcycle-scheduler";
import { withSetPrescription } from "@/domain/training/set-prescription";

export type CanonicalSessionConstructionInput = Readonly<{
  schemaVersion: "canonical_session_construction_input_v1";
  macrocycle: Readonly<Pick<MacrocycleSpec, "goal" | "targetDate" | "rolling">>;
  mesocycle: Readonly<{ id: MesocyclePrescriptionPolicy["mesocycleId"]; policy: MesocyclePrescriptionPolicy; position: number }>;
  microcycle: Readonly<{ id: string; output: MicrocyclePlan; sessionId: string; planSessionIndex: number; sessionRole: string; sessionOrder: number; stressIntent: string; recoveryDays: number; kind: "planned" | "extra" | "custom" }>;
  athlete: Readonly<{ experienceLevel: ExperienceLevel; preferredSplit: string; equipment: readonly Equipment[]; limitations: readonly string[]; exercisePreferences?: Readonly<Record<string, unknown>>; units: UnitSystem; exercises: readonly Exercise[] }>;
  progress: Readonly<{ evidenceVersion: string; readiness?: "ready" | "restricted"; recoveryConstraint?: string; history: readonly WorkoutHistorySummary[]; establishedLoads?: Readonly<Record<string, number>>; calibration?: Readonly<Record<string, { confidence: "low" | "moderate" | "high"; fresh: boolean }>>; fatigueEvidence?: readonly string[] }>;
  operational: Readonly<{ constructionVersion: string; seed: string; identity: string; revision: string }>;
}>;

export type SessionBlueprint = Readonly<{ sessionId: string; role: string; purpose: string; slots: readonly Readonly<{ role: ExerciseRole; constructionRole: ConstructionRole; muscles: readonly MuscleGroup[]; index: number; reason: string }>[]; strengthAnchorRequired: boolean; specialState: string }>;
export type PlannedSessionSlot = Readonly<{ id: string; index: number; role: ExerciseRole; constructionRole: ConstructionRole; muscles: readonly MuscleGroup[]; laneCandidates: readonly TrainingLane[]; preferredLane: TrainingLane; methods: readonly PrescriptionMethodFamily[]; reason: string }>;
export type CanonicalSessionSnapshot = Readonly<{ schemaVersion: "canonical_session_snapshot_v1"; sessionId: string; operationalIdentity: string; role: string; planSessionIndex: number; slots: readonly Readonly<{ id: string; index: number; exerciseId: string; lane: TrainingLane; method: PrescriptionMethodFamily; settings: ProgressionSettings; reason: string }>[]; provenance: Readonly<{ inputVersion: string; policyVersion: string; constructionVersion: string }> }>;

export type CanonicalConstructionResult = Readonly<{ status: "constructed"; blueprint: SessionBlueprint; slotPlan: readonly PlannedSessionSlot[]; snapshot: CanonicalSessionSnapshot } | { status: "blocked"; reason: "invalid_input" | "duplicate_session_identity" | "no_valid_blueprint" | "no_suitable_exercise" | "no_valid_lane" | "no_valid_method" | "established_load_required" | "incomplete_prescription" | "invalid_linkage" }>;

export function resolveCanonicalSessionIdentity(input: Pick<CanonicalSessionConstructionInput, "microcycle" | "mesocycle" | "operational">): string {
  return ["canonical-session", input.mesocycle.id, input.microcycle.id, input.microcycle.sessionRole, input.microcycle.planSessionIndex, input.operational.constructionVersion, input.operational.revision].join(":");
}

export function buildSessionBlueprint(input: CanonicalSessionConstructionInput): SessionBlueprint | null {
  const role = input.microcycle.sessionRole.toLowerCase();
  const specialState = input.mesocycle.policy.specialStateScoring.velocityRequired ? "velocity" : input.mesocycle.policy.mesocycleId.includes("deload") ? "recovery" : "ordinary";
  const primaryMuscle = input.athlete.exercises.find((exercise) => exercise.roles.includes("primary_compound"))?.primaryMuscles[0] ?? "chest";
  const slots = role.includes("recovery") || specialState === "recovery"
    ? [{ role: "recovery" as const, constructionRole: "accessory" as const, muscles: [primaryMuscle], index: 0, reason: "recovery capacity" }]
    : role.includes("primary") || role.includes("strength")
      ? [{ role: "primary_compound" as const, constructionRole: "primary" as const, muscles: [primaryMuscle], index: 0, reason: "primary strength anchor" }, { role: "secondary_compound" as const, constructionRole: "secondary" as const, muscles: [primaryMuscle], index: 1, reason: "secondary support" }]
      : [{ role: "primary_compound" as const, constructionRole: "primary" as const, muscles: [primaryMuscle], index: 0, reason: "primary session anchor" }, { role: "accessory" as const, constructionRole: "accessory" as const, muscles: [primaryMuscle], index: 1, reason: "productive accessory" }, { role: "isolation" as const, constructionRole: "accessory" as const, muscles: [primaryMuscle], index: 2, reason: "local fatigue allocation" }];
  return slots.length ? { sessionId: resolveCanonicalSessionIdentity(input), role: input.microcycle.sessionRole, purpose: input.macrocycle.goal, slots, strengthAnchorRequired: slots.some((slot) => slot.role === "primary_compound"), specialState } : null;
}

export function planSessionSlots(input: CanonicalSessionConstructionInput, blueprint: SessionBlueprint): PlannedSessionSlot[] | null {
  const planned = blueprint.slots.map((slot) => {
    const lane = resolveCanonicalLaneEnvelope(input.mesocycle.policy, slot.constructionRole, slot.role, input.progress.readiness);
    if (lane.status === "blocked") return null;
    const methods = input.mesocycle.policy.methods.permitted.filter((method) => !input.mesocycle.policy.methods.prohibited.includes(method));
    if (!methods.length) return null;
    return { id: `${blueprint.sessionId}:slot:${slot.index}`, index: slot.index, role: slot.role, constructionRole: slot.constructionRole, muscles: slot.muscles, laneCandidates: lane.candidates, preferredLane: lane.preferred, methods, reason: slot.reason };
  });
  return planned.every(Boolean) ? planned as PlannedSessionSlot[] : null;
}

export function constructCanonicalSession(input: CanonicalSessionConstructionInput): CanonicalConstructionResult {
  if (!input.mesocycle.policy || input.microcycle.planSessionIndex < 0 || !input.athlete.exercises.length) return { status: "blocked", reason: "invalid_input" };
  const identity = resolveCanonicalSessionIdentity(input);
  if (identity !== input.microcycle.sessionId) return { status: "blocked", reason: "invalid_linkage" };
  const blueprint = buildSessionBlueprint(input);
  if (!blueprint) return { status: "blocked", reason: "no_valid_blueprint" };
  const slotPlan = planSessionSlots(input, blueprint);
  if (!slotPlan) return { status: "blocked", reason: "no_valid_lane" };
  const slots: Array<CanonicalSessionSnapshot["slots"][number]> = [];
  for (const slot of slotPlan) {
    const exercise = input.athlete.exercises
      .filter((candidate) => candidate.roles.includes(slot.role))
      .filter((candidate) => matchExerciseToMesocyclePolicy(factualExerciseMetadata(candidate), input.mesocycle.policy, slot.role, input.athlete.equipment).status !== "ineligible")
      .sort((a, b) => a.id.localeCompare(b.id))[0];
    if (!exercise) return { status: "blocked", reason: "no_suitable_exercise" };
    const hasEstablishedLoad = Number.isFinite(input.progress.establishedLoads?.[exercise.id]);
    const lane = slot.laneCandidates.find((candidate) => resolveCanonicalTargetEnvelope(input.mesocycle.policy, slot.constructionRole, candidate, hasEstablishedLoad, slot.methods[0]).status === "resolved");
    if (!lane) return { status: "blocked", reason: hasEstablishedLoad ? "no_valid_lane" : "established_load_required" };
    const target = resolveCanonicalTargetEnvelope(input.mesocycle.policy, slot.constructionRole, lane, hasEstablishedLoad, slot.methods[0]);
    if (target.status === "blocked") return { status: "blocked", reason: target.reason === "established_load_required" ? target.reason : "no_valid_method" };
    const settings = withSetPrescription({ ...exercise.defaultSettings, repRange: { min: target.envelope.minReps, max: target.envelope.maxReps }, trainingLane: lane, unit: input.athlete.units, requiredWorkSets: exercise.defaultSettings.requiredWorkSets }, { exerciseRole: slot.role, exerciseFamily: exercise.family, primaryMuscles: exercise.primaryMuscles }, { source: "generated" });
    if (!settings.requiredSets || settings.repRange.min < 1 || settings.repRange.max < settings.repRange.min) return { status: "blocked", reason: "incomplete_prescription" };
    slots.push({ id: slot.id, index: slot.index, exerciseId: exercise.id, lane, method: slot.methods[0], settings, reason: slot.reason });
  }
  const snapshot: CanonicalSessionSnapshot = { schemaVersion: "canonical_session_snapshot_v1", sessionId: blueprint.sessionId, operationalIdentity: input.operational.identity, role: blueprint.role, planSessionIndex: input.microcycle.planSessionIndex, slots, provenance: { inputVersion: input.schemaVersion, policyVersion: input.mesocycle.policy.schemaVersion, constructionVersion: input.operational.constructionVersion } };
  return { status: "constructed", blueprint, slotPlan, snapshot };
}
