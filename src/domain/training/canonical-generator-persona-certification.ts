import { constructCanonicalActivePlanFromCanonicalInputs } from "@/application/training/canonical-active-plan-construction";
import { defaultCanonicalStartingVolumeContext, type CanonicalStartingVolumeContext } from "@/domain/training/canonical-hypertrophy-volume-policy";
import type { Equipment, ExperienceLevel } from "@/domain/training/models";
import type { TrainingSetupGoal, PreferredSplit } from "@/domain/training/plan-setup";
import { exerciseLibrary } from "@/domain/training/presets";
import type { CanonicalSessionSnapshotV3 } from "@/domain/training/canonical-session-construction-pipeline";

export const CANONICAL_GENERATOR_PERSONA_CERTIFICATION_VERSION = "canonical_generator_persona_certification_v1" as const;
const CREATED_AT = "2026-08-23T08:00:00.000Z";
const goals: readonly TrainingSetupGoal[] = ["build_muscle", "build_muscle_and_strength", "build_strength", "get_leaner", "athletic_performance"];
const experiences: readonly ExperienceLevel[] = ["beginner", "intermediate", "advanced"];
const splits: readonly PreferredSplit[] = ["full_body", "upper_lower", "push_pull_legs", "body_part_split", "bench_squat_deadlift", "let_app_choose"];
const durations = [30, 45, 60, 90] as const;
const equipmentProfiles: readonly (readonly Equipment[])[] = [
  ["barbell", "dumbbell", "machine", "cable", "bodyweight"],
  ["dumbbell", "bodyweight", "bands"],
  ["barbell", "bodyweight"],
  ["bodyweight", "bands"],
];

export type GeneratorPersona = Readonly<{
  id: string;
  goal: TrainingSetupGoal;
  declaredExperience: "novice" | ExperienceLevel;
  resolvedExperience: ExperienceLevel;
  daysPerWeek: 2 | 3 | 4 | 5 | 6;
  split: PreferredSplit;
  equipment: readonly Equipment[];
  durationMinutes: 30 | 45 | 60 | 90;
  context: CanonicalStartingVolumeContext;
  limitations: readonly string[];
  historyScenario: "new_app" | "productive_history" | "layoff" | "poor_recovery" | "concurrent_sport";
}>;

export function canonicalGeneratorPersonas(): readonly GeneratorPersona[] {
  return Array.from({ length: 30 }, (_, index) => {
    const daysPerWeek = (2 + index % 5) as GeneratorPersona["daysPerWeek"];
    const scenario = (["new_app", "productive_history", "layoff", "poor_recovery", "concurrent_sport"] as const)[index % 5]!;
    const declaredExperience = index === 0 ? "novice" as const : experiences[index % experiences.length]!;
    const base = defaultCanonicalStartingVolumeContext(daysPerWeek);
    const context: CanonicalStartingVolumeContext = scenario === "productive_history"
      ? { ...base, history: "established_productive", loadConfidence: "established", dosageConfidence: "canonical_productive_history", workCapacity: "demonstrated_high" }
      : scenario === "layoff"
        ? { ...base, continuity: "extended_layoff", recentTrainingDaysPerWeek: 0, dosageConfidence: "low_after_layoff" }
        : scenario === "poor_recovery"
          ? { ...base, recovery: "low_acceptable" }
          : scenario === "concurrent_sport"
            ? { ...base, concurrentSport: "lower_body_loading" }
            : base;
    return {
      id: `persona-${String(index + 1).padStart(2, "0")}`,
      goal: goals[index % goals.length]!,
      declaredExperience,
      resolvedExperience: declaredExperience === "novice" ? "beginner" : declaredExperience,
      daysPerWeek,
      split: index >= 24
        ? splits[index % splits.length]!
        : daysPerWeek === 2 ? (index % 2 ? "upper_lower" : "full_body")
          : daysPerWeek === 3 ? (index % 2 ? "push_pull_legs" : "full_body")
            : daysPerWeek === 4 ? (index % 2 ? "push_pull_legs" : "upper_lower")
              : daysPerWeek === 5 ? (["push_pull_legs", "upper_lower", "full_body", "body_part_split"] as const)[index % 4]!
                : "push_pull_legs",
      equipment: index < 24 ? equipmentProfiles[0]! : equipmentProfiles[index % equipmentProfiles.length]!,
      durationMinutes: durations[index % durations.length]!,
      context,
      limitations: index === 28 ? ["exclude_equipment:bodyweight"] : [],
      historyScenario: scenario,
    };
  });
}

export function buildCanonicalGeneratorPersonaCertification() {
  const rows = canonicalGeneratorPersonas().map((persona) => {
    const result = constructCanonicalActivePlanFromCanonicalInputs({
      planId: `generator-cert:${persona.id}`, createdAt: CREATED_AT, updatedAt: CREATED_AT,
      goal: persona.goal === "build_strength" ? "strength_hypertrophy" : persona.goal === "get_leaner" ? "body_recomposition" : persona.resolvedExperience === "beginner" ? "beginner_hypertrophy" : "hypertrophy",
      macrocycleGoal: persona.goal, experienceLevel: persona.resolvedExperience, daysPerWeek: persona.daysPerWeek,
      preferredSplit: persona.split, equipment: persona.equipment, units: "kg", availableSessionMinutes: persona.durationMinutes,
      startingVolumeContext: persona.context, limitations: persona.limitations, exercises: exerciseLibrary,
    });
    if (result.status !== "constructed") return { input: persona, programmeIdentity: null, status: "fail_closed" as const, severity: "acceptable_guard" as const, confidence: "high" as const, reason: result.reason, metrics: null, violations: [] };
    const sessions = result.carrier.plannedSessions.map((item) => item.prescriptionSnapshot as CanonicalSessionSnapshotV3);
    const slots = sessions.flatMap((session) => session.slots);
    const exerciseById = new Map(exerciseLibrary.map((exercise) => [exercise.id, exercise]));
    const workingSets = slots.reduce((sum, slot) => sum + (slot.settings.requiredSets ?? slot.settings.requiredWorkSets), 0);
    const durationExceeded = sessions.some((session) => (session.estimatedDurationMinutes ?? 0) > persona.durationMinutes);
    const missingExercise = slots.some((slot) => !exerciseById.has(slot.exerciseId));
    const count = (values: readonly string[]) => Object.fromEntries([...new Set(values)].sort().map((value) => [value, values.filter((candidate) => candidate === value).length]));
    const directRegions = slots.flatMap((slot) => Array.from({ length: slot.settings.requiredSets ?? slot.settings.requiredWorkSets }, () => exerciseById.get(slot.exerciseId)?.stimulusProfile?.direct ?? []).flat());
    const secondaryRegions = slots.flatMap((slot) => Array.from({ length: slot.settings.requiredSets ?? slot.settings.requiredWorkSets }, () => exerciseById.get(slot.exerciseId)?.stimulusProfile?.meaningfulSecondary ?? []).flat());
    const movementPatterns = slots.flatMap((slot) => exerciseById.get(slot.exerciseId)?.movementPattern ?? []);
    const exerciseFatigue = slots.flatMap((slot) => exerciseById.get(slot.exerciseId)?.fatigueCost ?? []);
    const jointStress = slots.flatMap((slot) => exerciseById.get(slot.exerciseId)?.jointStress ?? []);
    const stability = slots.flatMap((slot) => exerciseById.get(slot.exerciseId)?.stability ?? []);
    const primaryLifts = slots.flatMap((slot) => exerciseById.get(slot.exerciseId)?.primaryLift ?? []);
    const directBySession = sessions.map((session) => new Set(session.slots.flatMap((slot) => exerciseById.get(slot.exerciseId)?.stimulusProfile?.direct ?? [])));
    const metrics = {
      sessions: sessions.length, workingSets, estimatedMinutes: sessions.map((session) => session.estimatedDurationMinutes ?? null),
      compoundSlots: slots.filter((slot) => ["primary_compound", "secondary_compound", "power"].includes(slot.exerciseRole)).length,
      isolationSlots: slots.filter((slot) => slot.exerciseRole === "isolation").length,
      calibrationSlots: slots.filter((slot) => slot.loadPrescription.state === "calibration_required").length,
      repRange: slots.length ? [Math.min(...slots.map((slot) => slot.targetReps)), Math.max(...slots.map((slot) => slot.targetReps))] : null,
      restSecondsRange: slots.length ? [Math.min(...slots.map((slot) => slot.rest.seconds)), Math.max(...slots.map((slot) => slot.rest.seconds))] : null,
      uniqueExercises: new Set(slots.map((slot) => slot.exerciseId)).size,
      directStimulusExposures: count(directRegions), meaningfulSecondaryExposures: count(secondaryRegions), movementPatternExposures: count(movementPatterns),
      fatigueClassSlots: count(exerciseFatigue), jointStressClassSlots: count(jointStress), stabilityClassSlots: count(stability),
      mainLiftSpecificity: count(primaryLifts), methodExposure: count(slots.map((slot) => slot.method)),
      progressionOpportunities: slots.filter((slot) => slot.progression && slot.stopRule).length,
      adjacentSessionSharedDirectRegions: directBySession.slice(1).map((regions, index) => [...regions].filter((region) => directBySession[index]!.has(region)).sort()),
      pushPullBalance: { push: movementPatterns.filter((item) => item.includes("push") || item === "vertical_push").length, pull: movementPatterns.filter((item) => item.includes("pull") || item === "vertical_pull").length },
      unavailableOrLowConfidence: ["hard_sets_by_region: proximity cannot be reduced to a defensible binary from the snapshot", "relative_intensity_distribution: unavailable until established loads exist", "week_to_week_and_block_change: requires multiple immutable generations", "deload_behaviour: Mesocycle policy, not an initial-week property"],
    };
    const violations = [durationExceeded ? "critical:duration_constraint_exceeded" : null, missingExercise ? "critical:unknown_exercise" : null, slots.length === 0 ? "critical:empty_programme" : null].filter((item): item is string => Boolean(item));
    return { input: persona, programmeIdentity: { planId: result.carrier.planId, macrocycleId: result.carrier.macrocycle.id, mesocycleId: result.carrier.mesocycle.id, microcycleId: result.carrier.microcycle.id, revision: result.carrier.revision }, status: "constructed" as const, severity: violations.length ? "invalid" as const : "acceptable" as const, confidence: "high_for_structural_metrics_low_for_outcomes" as const, reason: null, metrics, violations };
  });
  const repeat = canonicalGeneratorPersonas().map((persona) => persona.id);
  return {
    schemaVersion: CANONICAL_GENERATOR_PERSONA_CERTIFICATION_VERSION,
    generatedAt: CREATED_AT,
    authorityPath: "completeCanonicalOnboardingSetup -> constructCanonicalActivePlanFromCanonicalInputs -> allocateCanonicalMicrocycleVolume -> constructCanonicalSession -> certifyCanonicalConstructedMicrocycle",
    coverage: { personas: rows.length, goals: goals.length, experienceCategories: ["novice(mapped_to_beginner)", ...experiences], daysPerWeek: [2, 3, 4, 5, 6], splits, durations, equipmentProfiles: equipmentProfiles.length, historyScenarios: 5 },
    confidenceLimits: ["RIR is governed by stop rules rather than exported as one scalar metric.", "Relative intensity is calibration-dependent until loads are established.", "Weak-point priority and adherence trend are not canonical onboarding construction inputs; no sensitivity claim is made."],
    deterministicPersonaOrder: repeat,
    summary: { constructed: rows.filter((row) => row.status === "constructed").length, failClosed: rows.filter((row) => row.status === "fail_closed").length, criticalViolations: rows.flatMap((row) => row.violations).filter((item) => item.startsWith("critical:")).length },
    rows,
  } as const;
}
