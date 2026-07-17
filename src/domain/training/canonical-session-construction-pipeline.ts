import type { MacrocycleSpec } from "@/domain/training/macrocycle-engine";
import type { Equipment, Exercise, ExerciseRole, ExperienceLevel, MuscleGroup, Programme, ProgressionSettings, TrainingLane, UnitSystem, WorkoutHistorySummary } from "@/domain/training/models";
import { factualExerciseMetadata, matchExerciseToMesocyclePolicy } from "@/domain/training/canonical-exercise-suitability";
import { type ConstructionRole, type MesocyclePrescriptionPolicy, type PrescriptionMethodFamily } from "@/domain/training/mesocycle-prescription-policy";
import { resolveCanonicalLaneEnvelope, resolveCanonicalTargetEnvelope } from "@/domain/training/mesocycle-construction-input-resolvers";
import type { MicrocyclePlan } from "@/domain/training/microcycle-scheduler";
import { withSetPrescription } from "@/domain/training/set-prescription";
import { resolveCanonicalProgression, resolveCanonicalRest, resolveCanonicalStopRule, type CanonicalProgressionRule, type CanonicalRestInstruction, type CanonicalStopRule } from "@/domain/training/canonical-prescription-components";
import { resolveCanonicalLoadPrescription } from "@/domain/training/canonical-load-resolution";
import type { CanonicalLoadEvidence, CanonicalLoadPrescription } from "@/domain/training/canonical-load-prescription";

export type CanonicalSessionConstructionInput = Readonly<{
  schemaVersion: "canonical_session_construction_input_v1";
  macrocycle: Readonly<Pick<MacrocycleSpec, "goal" | "targetDate" | "rolling">>;
  mesocycle: Readonly<{ id: MesocyclePrescriptionPolicy["mesocycleId"]; policy: MesocyclePrescriptionPolicy; position: number }>;
  microcycle: Readonly<{ id: string; output: MicrocyclePlan; sessionId: string; planSessionIndex: number; sessionRole: string; sessionOrder: number; stressIntent: string; recoveryDays: number; kind: "planned" | "extra" | "custom" }>;
  athlete: Readonly<{ experienceLevel: ExperienceLevel; preferredSplit: string; equipment: readonly Equipment[]; limitations: readonly string[]; exercisePreferences?: Readonly<Record<string, unknown>>; units: UnitSystem; exercises: readonly Exercise[] }>;
  progress: Readonly<{ evidenceVersion: string; readiness?: "ready" | "restricted"; recoveryConstraint?: string; history: readonly WorkoutHistorySummary[]; establishedLoads?: Readonly<Record<string, number>>; loadEvidence?: Readonly<Record<string, CanonicalLoadEvidence>>; calibration?: Readonly<Record<string, { confidence: "low" | "moderate" | "high"; fresh: boolean }>>; fatigueEvidence?: readonly string[] }>;
  operational: Readonly<{ constructionVersion: string; seed: string; identity: string; revision: string }>;
}>;

export type SessionBlueprint = Readonly<{ sessionId: string; role: string; purpose: string; slots: readonly Readonly<{ role: ExerciseRole; constructionRole: ConstructionRole; muscles: readonly MuscleGroup[]; index: number; reason: string }>[]; strengthAnchorRequired: boolean; specialState: string }>;
export type PlannedSessionSlot = Readonly<{ id: string; index: number; role: ExerciseRole; constructionRole: ConstructionRole; muscles: readonly MuscleGroup[]; laneCandidates: readonly TrainingLane[]; preferredLane: TrainingLane; methods: readonly PrescriptionMethodFamily[]; reason: string }>;
type CanonicalSessionSnapshotBase = Readonly<{ sessionId: string; operationalIdentity: string; role: string; planSessionIndex: number; slots: readonly Readonly<{ id: string; index: number; exerciseId: string; lane: TrainingLane; method: PrescriptionMethodFamily; settings: ProgressionSettings; rest: CanonicalRestInstruction; progression: CanonicalProgressionRule; stopRule: CanonicalStopRule; loadingMode: string; prescribedLoad?: number; substitutionConstraints: readonly string[]; reason: string }>[]; provenance: Readonly<{ inputVersion: string; policyVersion: string; constructionVersion: string; evidenceVersion: string }> }>;
export type CanonicalSessionSnapshotV2 = CanonicalSessionSnapshotBase & Readonly<{ schemaVersion: "canonical_session_snapshot_v2" }>;
export type CanonicalSessionSnapshotV3 = Omit<CanonicalSessionSnapshotBase, "slots"> & Readonly<{ schemaVersion: "canonical_session_snapshot_v3"; slots: readonly (CanonicalSessionSnapshotBase["slots"][number] & Readonly<{ loadPrescription: CanonicalLoadPrescription }>)[] }>;
export type CanonicalSessionSnapshot = CanonicalSessionSnapshotV2 | CanonicalSessionSnapshotV3;

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
  const slots: Array<CanonicalSessionSnapshotV3["slots"][number]> = [];
  for (const slot of slotPlan) {
    const preferredPatterns = movementPatternsForSessionRole(input.microcycle.sessionRole, slot.role);
    const roleExercises = input.athlete.exercises
      .filter((candidate) => candidate.roles.includes(slot.role))
      .filter((candidate) => matchExerciseToMesocyclePolicy(factualExerciseMetadata(candidate), input.mesocycle.policy, slot.role, input.athlete.equipment).status !== "ineligible");
    const preferredExercises = roleExercises.filter((candidate) => preferredPatterns.length === 0 || preferredPatterns.includes(candidate.movementPattern));
    const eligibleExercises = preferredPatterns.length > 0 && preferredExercises.length > 0 ? preferredExercises : roleExercises;
    const exercise = eligibleExercises.slice().sort((a, b) => a.id.localeCompare(b.id))[0];
    if (!exercise) return { status: "blocked", reason: "no_suitable_exercise" };
    const hasEstablishedLoad = Number.isFinite(input.progress.establishedLoads?.[exercise.id]);
    const lane = slot.laneCandidates.find((candidate) => resolveCanonicalTargetEnvelope(input.mesocycle.policy, slot.constructionRole, candidate, hasEstablishedLoad, slot.methods[0]).status === "resolved");
    if (!lane) return { status: "blocked", reason: hasEstablishedLoad ? "no_valid_lane" : "established_load_required" };
    const target = resolveCanonicalTargetEnvelope(input.mesocycle.policy, slot.constructionRole, lane, hasEstablishedLoad, slot.methods[0]);
    if (target.status === "blocked") return { status: "blocked", reason: target.reason === "established_load_required" ? target.reason : "no_valid_method" };
    const settings = withSetPrescription({ ...exercise.defaultSettings, repRange: { min: target.envelope.minReps, max: target.envelope.maxReps }, trainingLane: lane, unit: input.athlete.units, requiredWorkSets: exercise.defaultSettings.requiredWorkSets }, { exerciseRole: slot.role, exerciseFamily: exercise.family, primaryMuscles: exercise.primaryMuscles }, { source: "generated" });
    if (!settings.requiredSets || settings.repRange.min < 1 || settings.repRange.max < settings.repRange.min) return { status: "blocked", reason: "incomplete_prescription" };
    const method = slot.methods[0]!;
    const rest = resolveCanonicalRest(input.mesocycle.policy, lane, method, slot.role);
    const progression = resolveCanonicalProgression(input.mesocycle.policy, lane, method, input.operational.revision);
    const stopRule = resolveCanonicalStopRule(input.mesocycle.policy, lane, slot.role, target.envelope.minReps);
    const loadPrescription = resolveCanonicalLoadPrescription({ exercise, equipment: input.athlete.equipment, lane, loadingMode: target.envelope.loadingMode, establishedLoad: input.progress.establishedLoads?.[exercise.id], evidence: input.progress.loadEvidence?.[exercise.id], increment: exercise.defaultLoadJump || 1, calibrationSupported: true });
    slots.push({ id: slot.id, index: slot.index, exerciseId: exercise.id, lane, method, settings, rest, progression, stopRule, loadingMode: target.envelope.loadingMode, prescribedLoad: input.progress.establishedLoads?.[exercise.id], substitutionConstraints: [...input.athlete.limitations], reason: slot.reason, loadPrescription } as CanonicalSessionSnapshotV3["slots"][number]);
  }
  const snapshot: CanonicalSessionSnapshotV3 = { schemaVersion: "canonical_session_snapshot_v3", sessionId: blueprint.sessionId, operationalIdentity: input.operational.identity, role: blueprint.role, planSessionIndex: input.microcycle.planSessionIndex, slots, provenance: { inputVersion: input.schemaVersion, policyVersion: input.mesocycle.policy.schemaVersion, constructionVersion: input.operational.constructionVersion, evidenceVersion: input.progress.evidenceVersion } };
  return { status: "constructed", blueprint, slotPlan, snapshot };
}

function movementPatternsForSessionRole(sessionRole: string, exerciseRole: ExerciseRole): readonly import("@/domain/training/models").MovementPattern[] {
  if (exerciseRole !== "primary_compound") return [];
  const role = sessionRole.toLowerCase();
  if (role.includes("bench") || role.includes("upper")) return ["horizontal_push", "vertical_push"];
  if (role.includes("squat") || role.includes("lower") || role.includes("leg")) return ["squat", "lunge", "hip_thrust"];
  if (role.includes("deadlift") || role.includes("back")) return ["hinge", "horizontal_pull", "vertical_pull"];
  return [];
}
