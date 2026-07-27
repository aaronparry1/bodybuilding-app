import type { MacrocycleSpec } from "@/domain/training/macrocycle-engine";
import type { Equipment, Exercise, ExerciseRole, ExperienceLevel, MuscleGroup, Programme, ProgressionSettings, TrainingLane, UnitSystem, WorkoutHistorySummary } from "@/domain/training/models";
import { factualExerciseMetadata, matchExerciseToMesocyclePolicy } from "@/domain/training/canonical-exercise-suitability";
import { type ConstructionRole, type MesocyclePrescriptionPolicy, type PrescriptionMethodFamily } from "@/domain/training/mesocycle-prescription-policy";
import { resolveCanonicalLaneEnvelope, resolveCanonicalTargetEnvelope } from "@/domain/training/mesocycle-construction-input-resolvers";
import type { MicrocyclePlan } from "@/domain/training/microcycle-scheduler";
import { withSetPrescription } from "@/domain/training/set-prescription";
import { resolveCanonicalProgression, resolveCanonicalRest, resolveCanonicalStopRule, type CanonicalProgressionRule, type CanonicalRestInstruction, type CanonicalStopRule } from "@/domain/training/canonical-prescription-components";
import { resolveCanonicalLoadPrescription } from "@/domain/training/canonical-load-resolution";
import { validateCanonicalLoadPrescription, type CanonicalLoadEvidence, type CanonicalLoadPrescription } from "@/domain/training/canonical-load-prescription";
import { withCanonicalCalibrationProtocol } from "@/domain/training/canonical-load-prescription";
import { isStrictCanonicalAllocation, type AllocatedSlot, type CanonicalMicrocycleVolumeAllocation } from "@/domain/training/canonical-microcycle-volume-allocator";
import { assessCanonicalExerciseRoleSuitability, type CanonicalExerciseRoleSuitabilityResult } from "@/domain/training/canonical-exercise-role-suitability";
import { resolveCanonicalExactTarget } from "@/domain/training/canonical-exact-target-policy";
import { parseCanonicalLimitation } from "@/domain/training/canonical-adaptive-planning-system";
import { scoreExercisePreference, type ExercisePreferenceRecord } from "@/domain/training/exercise-preferences";
import {
  applyCanonicalSessionMethodStructures,
  resolveCanonicalTrainingMethod,
  type CanonicalMethodStructure,
} from "@/domain/training/canonical-training-method-policy";

export type CanonicalSessionConstructionInput = Readonly<{
  schemaVersion: "canonical_session_construction_input_v1";
  macrocycle: Readonly<Pick<MacrocycleSpec, "goal" | "targetDate" | "rolling">>;
  mesocycle: Readonly<{ id: MesocyclePrescriptionPolicy["mesocycleId"]; policy: MesocyclePrescriptionPolicy; position: number }>;
  microcycle: Readonly<{ id: string; output: MicrocyclePlan; sessionId: string; planSessionIndex: number; sessionRole: string; sessionOrder: number; stressIntent: string; recoveryDays: number; kind: "planned" | "extra" | "custom" }>;
  athlete: Readonly<{ experienceLevel: ExperienceLevel; preferredSplit: string; equipment: readonly Equipment[]; limitations: readonly string[]; exercisePreferences?: Readonly<Record<string, ExercisePreferenceRecord>>; units: UnitSystem; exercises: readonly Exercise[] }>;
  progress: Readonly<{ evidenceVersion: string; readiness?: "ready" | "restricted"; recoveryConstraint?: string; history: readonly WorkoutHistorySummary[]; establishedLoads?: Readonly<Record<string, number>>; loadEvidence?: Readonly<Record<string, CanonicalLoadEvidence>>; calibration?: Readonly<Record<string, { confidence: "low" | "moderate" | "high"; fresh: boolean }>>; fatigueEvidence?: readonly string[] }>;
  operational: Readonly<{ constructionVersion: string; seed: string; identity: string; revision: string }>;
  allocation?: CanonicalMicrocycleVolumeAllocation;
  selectionContext?: Readonly<{ weeklyExerciseUsage: Readonly<Record<string, number>> }>;
}>;

export type SessionBlueprint = Readonly<{ sessionId: string; role: string; purpose: string; slots: readonly Readonly<{ role: ExerciseRole; constructionRole: ConstructionRole; muscles: readonly MuscleGroup[]; index: number; reason: string }>[]; strengthAnchorRequired: boolean; specialState: string }>;
export type PlannedSessionSlot = Readonly<{ id: string; index: number; role: ExerciseRole; constructionRole: ConstructionRole; muscles: readonly MuscleGroup[]; laneCandidates: readonly TrainingLane[]; preferredLane: TrainingLane; methods: readonly PrescriptionMethodFamily[]; reason: string }>;
type CanonicalSessionSnapshotBase = Readonly<{ sessionId: string; operationalIdentity: string; role: string; planSessionIndex: number; estimatedDurationMinutes?: number; slots: readonly Readonly<{ id: string; index: number; exerciseId: string; exerciseRole: ExerciseRole; constructionRole: ConstructionRole; lane: TrainingLane; method: PrescriptionMethodFamily; methodStructure?: CanonicalMethodStructure; settings: ProgressionSettings; targetReps: number; exactTargets?: readonly number[]; exactTargetKinds?: readonly ("reps" | "amrap")[]; rest: CanonicalRestInstruction; progression: CanonicalProgressionRule; stopRule: CanonicalStopRule; loadingMode: string; prescribedLoad?: number; substitutionConstraints: readonly string[]; reason: string; selection?: Pick<CanonicalExerciseRoleSuitabilityResult, "policyId" | "suitability" | "reasons" | "repeatReason"> }>[]; provenance: Readonly<{ inputVersion: string; policyVersion: string; constructionVersion: string; evidenceVersion: string }> }>;
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
  const allocated = input.allocation?.slots.filter((slot) => slot.sessionIndex === input.microcycle.planSessionIndex).map((slot) => ({ role: slot.exerciseRole, constructionRole: slot.constructionRole, muscles: slot.muscles, index: slot.order, reason: slot.purpose }));
  const slots = allocated?.length ? allocated : role.includes("recovery") || specialState === "recovery"
    ? [{ role: "recovery" as const, constructionRole: "accessory" as const, muscles: [primaryMuscle], index: 0, reason: "recovery capacity" }]
    : role.includes("primary") || role.includes("strength")
      ? [{ role: "primary_compound" as const, constructionRole: "primary" as const, muscles: [primaryMuscle], index: 0, reason: "primary strength anchor" }, { role: "secondary_compound" as const, constructionRole: "secondary" as const, muscles: [primaryMuscle], index: 1, reason: "secondary support" }]
      : role.includes("bench")
        ? [
          { role: "primary_compound" as const, constructionRole: "primary" as const, muscles: ["chest"] as MuscleGroup[], index: 0, reason: "bench strength anchor" },
          { role: "secondary_compound" as const, constructionRole: "secondary" as const, muscles: ["chest", "shoulders"] as MuscleGroup[], index: 1, reason: "pressing hypertrophy support" },
          { role: "accessory" as const, constructionRole: "accessory" as const, muscles: ["triceps", "shoulders"] as MuscleGroup[], index: 2, reason: "upper pressing support" },
          { role: "isolation" as const, constructionRole: "accessory" as const, muscles: ["triceps"] as MuscleGroup[], index: 3, reason: "triceps support" },
        ]
        : role.includes("squat") || role.includes("lower")
          ? [
            { role: "primary_compound" as const, constructionRole: "primary" as const, muscles: ["quads"] as MuscleGroup[], index: 0, reason: "squat strength anchor" },
            { role: "secondary_compound" as const, constructionRole: "secondary" as const, muscles: ["quads", "glutes"] as MuscleGroup[], index: 1, reason: "lower-body support" },
            { role: "accessory" as const, constructionRole: "accessory" as const, muscles: ["hamstrings", "glutes"] as MuscleGroup[], index: 2, reason: "posterior-chain support" },
            { role: "isolation" as const, constructionRole: "accessory" as const, muscles: ["calves", "abs"] as MuscleGroup[], index: 3, reason: "lower-body completion" },
          ]
          : role.includes("deadlift") || role.includes("back")
            ? [
              { role: "primary_compound" as const, constructionRole: "primary" as const, muscles: ["back", "hamstrings"] as MuscleGroup[], index: 0, reason: "hinge/pull anchor" },
              { role: "secondary_compound" as const, constructionRole: "secondary" as const, muscles: ["back"] as MuscleGroup[], index: 1, reason: "back volume support" },
              { role: "accessory" as const, constructionRole: "accessory" as const, muscles: ["hamstrings", "glutes"] as MuscleGroup[], index: 2, reason: "posterior-chain support" },
              { role: "isolation" as const, constructionRole: "accessory" as const, muscles: ["biceps"] as MuscleGroup[], index: 3, reason: "pulling support" },
            ]
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
  const usedExerciseIds = new Set<string>();
  let sessionHighFatigueSets = 0;
  for (const slot of slotPlan) {
    const allocatedSlot = input.allocation?.slots.find((candidate) => candidate.sessionIndex === input.microcycle.planSessionIndex && candidate.order === slot.index);
    const preferredPatterns = allocatedSlot?.movementPatterns ?? movementPatternsForSlot(input.microcycle.sessionRole, slot);
    const allRoleExercises = input.athlete.exercises
      .filter((candidate) => candidate.roles.includes(slot.role))
      .filter((candidate) => exercisePermittedByLimitations(candidate, input.athlete.limitations))
      .filter((candidate) => matchExerciseToMesocyclePolicy(factualExerciseMetadata(candidate), input.mesocycle.policy, slot.role, input.athlete.equipment).status !== "ineligible");
    const strictAllocation = isStrictCanonicalAllocation(input.allocation);
    const qualityAwareAllocation = Boolean(allocatedSlot && allRoleExercises.some((candidate) => candidate.stimulusProfile));
    const ranked = allocatedSlot && qualityAwareAllocation ? allRoleExercises.map((exercise) => ({
      exercise,
      result: withPreferenceScore(assessCanonicalExerciseRoleSuitability({ exercise, slot: allocatedSlot, macrocycleGoal: input.macrocycle.goal, mesocycleId: input.mesocycle.id, experience: input.athlete.experienceLevel, sessionExerciseIds: [...usedExerciseIds], weeklyExerciseUsage: input.selectionContext?.weeklyExerciseUsage ?? {}, sessionHighFatigueSets, recoveryRestricted: input.allocation?.recoveryRestricted }), scoreExercisePreference(exercise, input.athlete.exercisePreferences)),
    })).filter((candidate) => candidate.result.suitability !== "unsuitable") : [];
    const selected = ranked.sort((a, b) => b.result.score - a.result.score || a.exercise.id.localeCompare(b.exercise.id))[0];
    const selectedResult = selected?.result.repeatReason === "variation_preferred"
      && !ranked.some((candidate) => (input.selectionContext?.weeklyExerciseUsage[candidate.exercise.id] ?? 0) === 0)
      ? { ...selected.result, repeatReason: "only_equivalent_available" as const, reasons: [...selected.result.reasons, "repeat:no_unused_equivalent_available"] }
      : selected?.result;
    const unusedLegacyExercises = allRoleExercises.filter((candidate) => !usedExerciseIds.has(candidate.id));
    const legacyPool = unusedLegacyExercises.length ? unusedLegacyExercises : allRoleExercises;
    const legacyExercise = !strictAllocation && !selected ? legacyPool.slice().sort((a, b) => exerciseCompatibilityScore(b, slot, preferredPatterns) - exerciseCompatibilityScore(a, slot, preferredPatterns) || a.id.localeCompare(b.id))[0] : undefined;
    const exercise = selected?.exercise ?? legacyExercise;
    if (!exercise) return { status: "blocked", reason: "no_suitable_exercise" };
    usedExerciseIds.add(exercise.id);
    const hasEstablishedLoad = Number.isFinite(input.progress.establishedLoads?.[exercise.id]);
    const method = chooseCanonicalMethod(input, slot, allocatedSlot, exercise, hasEstablishedLoad);
    const lane = slot.laneCandidates.find((candidate) => resolveCanonicalTargetEnvelope(input.mesocycle.policy, slot.constructionRole, candidate, hasEstablishedLoad, method).status === "resolved");
    if (!lane) return { status: "blocked", reason: hasEstablishedLoad ? "no_valid_lane" : "established_load_required" };
    const target = resolveCanonicalTargetEnvelope(input.mesocycle.policy, slot.constructionRole, lane, hasEstablishedLoad, method);
    if (target.status === "blocked") return { status: "blocked", reason: target.reason === "established_load_required" ? target.reason : "no_valid_method" };
    const allocatedSets = allocatedSlot?.workingSets;
    const exactResolution = allocatedSlot && selected ? resolveCanonicalExactTarget({ exercise, slot: allocatedSlot, envelope: target.envelope, policy: input.mesocycle.policy, lane, method, experience: input.athlete.experienceLevel }) : undefined;
    if (exactResolution?.status === "blocked") return { status: "blocked", reason: "no_valid_method" };
    const exact = exactResolution?.status === "resolved" ? exactResolution : undefined;
    const targetReps = exact?.targets[0] ?? Math.max(1, Math.round((target.envelope.minReps + target.envelope.maxReps) / 2));
    const settings = withSetPrescription({ ...exercise.defaultSettings, repRange: { min: targetReps, max: targetReps }, trainingLane: lane, unit: input.athlete.units, requiredWorkSets: allocatedSets ?? exercise.defaultSettings.requiredWorkSets }, { exerciseRole: slot.role, exerciseFamily: exercise.family, primaryMuscles: exercise.primaryMuscles }, { requiredSets: allocatedSets, recommendedMinSets: allocatedSets, recommendedMaxSets: allocatedSets, source: "generated" });
    if (!settings.requiredSets || settings.repRange.min < 1 || settings.repRange.max < settings.repRange.min) return { status: "blocked", reason: "incomplete_prescription" };
    const baseRest = resolveCanonicalRest(input.mesocycle.policy, lane, method, slot.role);
    const rest = exact ? { ...baseRest, seconds: exact.restSeconds, reason: `canonical_exact_target_rest:${exact.policyId}`, provenance: [...baseRest.provenance, exact.policyId] } : baseRest;
    const progression = resolveCanonicalProgression(input.mesocycle.policy, lane, method, input.operational.revision);
    const stopRule = resolveCanonicalStopRule(input.mesocycle.policy, lane, slot.role, target.envelope.minReps);
    const loadPrescription = withCanonicalCalibrationProtocol(resolveCanonicalLoadPrescription({ exercise, equipment: input.athlete.equipment, lane, loadingMode: target.envelope.loadingMode, establishedLoad: input.progress.establishedLoads?.[exercise.id], evidence: input.progress.loadEvidence?.[exercise.id], increment: exercise.defaultLoadJump || 1, calibrationSupported: true }), targetReps, settings.requiredSets ?? settings.requiredWorkSets);
    if (validateCanonicalLoadPrescription(loadPrescription).status !== "valid") return { status: "blocked", reason: "incomplete_prescription" };
    slots.push({ id: slot.id, index: slot.index, exerciseId: exercise.id, exerciseRole: slot.role, constructionRole: slot.constructionRole, lane, method, settings, targetReps, exactTargets: exact?.targets, exactTargetKinds: exact?.targetKinds, rest, progression, stopRule, loadingMode: target.envelope.loadingMode, prescribedLoad: input.progress.establishedLoads?.[exercise.id], substitutionConstraints: [...input.athlete.limitations], reason: slot.reason, selection: selectedResult ? { policyId: selectedResult.policyId, suitability: selectedResult.suitability, reasons: selectedResult.reasons, repeatReason: selectedResult.repeatReason } : undefined, loadPrescription } as CanonicalSessionSnapshotV3["slots"][number]);
    if (exercise.fatigueCost === "high") sessionHighFatigueSets += settings.requiredSets ?? settings.requiredWorkSets;
  }
  const exerciseById = new Map(input.athlete.exercises.map((exercise) => [exercise.id, exercise]));
  const methodStructures = applyCanonicalSessionMethodStructures({
    goal: input.macrocycle.goal,
    mesocycleId: input.mesocycle.id,
    specialState: input.mesocycle.policy.specialState,
    experience: input.athlete.experienceLevel,
    readiness: input.progress.readiness,
    slots: slots.map((slot) => ({
      id: slot.id,
      index: slot.index,
      exercise: exerciseById.get(slot.exerciseId)!,
      method: slot.method,
      requiredSets: slot.settings.requiredSets ?? slot.settings.requiredWorkSets,
      targetReps: slot.targetReps,
      restSeconds: slot.rest.seconds,
      loadState: slot.loadPrescription.state,
    })),
  });
  const methodBySlot = new Map(methodStructures.map((item) => [item.id, item]));
  const structuredSlots = slots.map((slot) => {
    const resolved = methodBySlot.get(slot.id);
    if (!resolved) return slot;
    const structure = resolved.structure;
    const restSeconds = structure.kind === "linked_rounds"
      ? structure.position === 1 ? structure.intraMethodRestSeconds : structure.interRoundRestSeconds
      : structure.interRoundRestSeconds;
    const rest = restSeconds === slot.rest.seconds ? slot.rest : {
      ...slot.rest,
      seconds: restSeconds,
      reason: `canonical_method_rest:${structure.kind}:${resolved.method}`,
      provenance: [...slot.rest.provenance, structure.policyId],
    };
    return {
      ...slot,
      method: resolved.method,
      methodStructure: structure,
      rest,
      ...(structure.kind === "rest_pause" ? {
        targetReps: structure.segmentsPerRound,
        exactTargets: Array.from({ length: structure.rounds }, () => structure.segmentsPerRound),
        exactTargetKinds: Array.from({ length: structure.rounds }, () => "reps" as const),
      } : {}),
    };
  });
  const estimatedDurationMinutes = input.allocation?.durationEstimates[input.microcycle.planSessionIndex]?.minutes;
  const snapshot: CanonicalSessionSnapshotV3 = { schemaVersion: "canonical_session_snapshot_v3", sessionId: blueprint.sessionId, operationalIdentity: input.operational.identity, role: blueprint.role, planSessionIndex: input.microcycle.planSessionIndex, ...(estimatedDurationMinutes ? { estimatedDurationMinutes } : {}), slots: structuredSlots, provenance: { inputVersion: input.schemaVersion, policyVersion: input.mesocycle.policy.schemaVersion, constructionVersion: input.operational.constructionVersion, evidenceVersion: input.progress.evidenceVersion } };
  return { status: "constructed", blueprint, slotPlan, snapshot };
}

function chooseCanonicalMethod(input: CanonicalSessionConstructionInput, slot: PlannedSessionSlot, allocated: AllocatedSlot | undefined, exercise: Exercise, hasEstablishedLoad: boolean): PrescriptionMethodFamily {
  const result = resolveCanonicalTrainingMethod({
    goal: input.macrocycle.goal,
    mesocycleId: input.mesocycle.id,
    specialState: input.mesocycle.policy.specialState,
    experience: input.athlete.experienceLevel,
    exercise,
    exerciseRole: slot.role,
    sessionRole: input.microcycle.sessionRole,
    requiredSets: allocated?.workingSets ?? exercise.defaultSettings.requiredWorkSets,
    targetReps: exercise.defaultRepRange.min,
    loadState: hasEstablishedLoad ? "established" : "calibration_required",
    readiness: input.progress.readiness,
    permittedMethods: slot.methods,
  });
  return result.method;
}

function exercisePermittedByLimitations(exercise: Exercise, limitations: readonly string[]): boolean {
  return limitations.every((value) => {
    const limitation = parseCanonicalLimitation(value);
    if (!limitation) return false;
    if (limitation.kind === "exercise") return exercise.id !== limitation.value;
    if (limitation.kind === "movement") return exercise.movementPattern !== limitation.value;
    return !exercise.equipment.includes(limitation.value);
  });
}

function withPreferenceScore(result: CanonicalExerciseRoleSuitabilityResult, preferenceScore: number): CanonicalExerciseRoleSuitabilityResult {
  return { ...result, score: result.score + preferenceScore, reasons: [...result.reasons, `preference_score:${preferenceScore}`] };
}

function movementPatternsForSlot(sessionRole: string, slot: PlannedSessionSlot): readonly import("@/domain/training/models").MovementPattern[] {
  if (slot.muscles.includes("back")) return ["horizontal_pull", "vertical_pull"];
  if (slot.muscles.includes("glutes") && !slot.muscles.includes("hamstrings")) return ["hip_thrust"];
  if (slot.muscles.includes("chest")) return ["horizontal_push"];
  if (slot.muscles.includes("shoulders")) return ["vertical_push", "isolation"];
  if (slot.muscles.includes("quads")) return ["squat", "lunge"];
  if (slot.role !== "primary_compound") return [];
  const role = sessionRole.toLowerCase();
  if (role.includes("bench") || role.includes("upper")) return ["horizontal_push", "vertical_push"];
  if (role.includes("squat") || role.includes("lower") || role.includes("leg")) return ["squat", "lunge", "hip_thrust"];
  if (role.includes("deadlift") || role.includes("back")) return ["hinge", "horizontal_pull", "vertical_pull"];
  return [];
}

function exerciseCompatibilityScore(exercise: Exercise, slot: PlannedSessionSlot, preferredPatterns: readonly import("@/domain/training/models").MovementPattern[]): number {
  let score = 0;
  if (exercise.primaryMuscles.length === slot.muscles.length && exercise.primaryMuscles.every((muscle) => slot.muscles.includes(muscle))) score += 30;
  score += exercise.primaryMuscles.filter((muscle) => slot.muscles.includes(muscle)).length * 10;
  if (exercise.roles[0] === slot.role) score += 5;
  const patternIndex = preferredPatterns.indexOf(exercise.movementPattern);
  if (patternIndex >= 0) score += Math.max(1, 5 - patternIndex);
  return score;
}
