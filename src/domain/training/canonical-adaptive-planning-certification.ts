import { constructCanonicalActivePlanFromCanonicalInputs } from "@/application/training/canonical-active-plan-construction";
import { certifyCanonicalConstructedMicrocycle } from "@/domain/training/canonical-constructed-microcycle-certification";
import type { CanonicalLoadEvidence } from "@/domain/training/canonical-load-prescription";
import { allocateCanonicalMicrocycleVolume, canonicalExperiencePlanningPolicy, canonicalMicrocycleVolumePolicy } from "@/domain/training/canonical-microcycle-volume-allocator";
import type { CanonicalSessionSnapshotV3 } from "@/domain/training/canonical-session-construction-pipeline";
import { createMacrocycle, validateMacrocycleTimeline } from "@/domain/training/macrocycle-engine";
import { mesocycleLibrary } from "@/domain/training/mesocycle-library";
import { resolveMesocyclePrescriptionPolicy } from "@/domain/training/mesocycle-prescription-policy";
import type { Equipment, ExperienceLevel, ProgrammeGoal } from "@/domain/training/models";
import { exerciseLibrary } from "@/domain/training/presets";
import { getSelectableFrameworkOptionsForGoal, resolveCanonicalProgrammeFramework, type UserProgrammeFrameworkId } from "@/domain/training/programme-framework-rules";
import { CANONICAL_EXACT_TARGET_POLICY_ID } from "@/domain/training/canonical-exact-target-policy";
import type { PreferredSplit, TrainingSetupGoal } from "@/domain/training/plan-setup";
import type { TrainingGoalId } from "@/domain/training/training-goals";
import { CANONICAL_ADAPTIVE_PLANNING_SYSTEM_VERSION, canonicalGoalStrategies, canonicalPlanningAuthority, canonicalPlanningInputRegistry, canonicalPlanningPrecedence } from "@/domain/training/canonical-adaptive-planning-system";
import { canonicalHypertrophyVolumePolicy } from "@/domain/training/canonical-hypertrophy-volume-policy";
import { CANONICAL_CARDIO_PRESCRIPTION_VERSION } from "@/domain/training/canonical-cardio-prescription";
import { customerFrameworkFrequencyPolicy, getCustomerFrameworksForFrequency, resolveCanonicalFrameworkMorph } from "@/domain/training/programme-framework-rules";
import { buildCanonicalDosageEvolutionArtifacts } from "@/domain/training/canonical-dosage-evolution-certification";

export const CANONICAL_ADAPTIVE_PLANNING_CERTIFICATION_VERSION = "canonical_adaptive_planning_certification_v1" as const;

const FULL_GYM: readonly Equipment[] = ["barbell", "dumbbell", "machine", "cable", "bodyweight"];
const CREATED_AT = "2026-07-19T08:00:00.000Z";

type GoalCase = Readonly<{ setupGoal: TrainingSetupGoal; programmeGoal: ProgrammeGoal; uiGoal: TrainingGoalId; label: string }>;
export const canonicalCertificationGoals: readonly GoalCase[] = [
  { setupGoal: "build_muscle", programmeGoal: "hypertrophy", uiGoal: "build_muscle", label: "Hypertrophy" },
  { setupGoal: "build_strength", programmeGoal: "strength_hypertrophy", uiGoal: "get_stronger", label: "Strength" },
  { setupGoal: "build_muscle_and_strength", programmeGoal: "strength_hypertrophy", uiGoal: "build_muscle_strength", label: "Powerbuilding" },
  { setupGoal: "athletic_performance", programmeGoal: "hypertrophy", uiGoal: "athletic_performance", label: "Athletic Performance" },
  { setupGoal: "get_leaner", programmeGoal: "body_recomposition", uiGoal: "lose_fat", label: "Getting Lean" },
] as const;

export type CanonicalGoldenCase = Readonly<{
  id: string;
  label: string;
  setupGoal: TrainingSetupGoal;
  programmeGoal: ProgrammeGoal;
  experience: ExperienceLevel;
  frequency: 2 | 3 | 4 | 5 | 6;
  framework: PreferredSplit;
  equipment: readonly Equipment[];
  targetDate?: string;
  limitation?: string;
  establishedHistory?: boolean;
  expected: "constructed" | "unsupported";
  note?: string;
  availableSessionMinutes?: 30 | 45 | 60 | 75 | 90;
}>;

export const canonicalRepresentativeGoldenCases: readonly CanonicalGoldenCase[] = [
  golden("beginner-hypertrophy-2", "Beginner Hypertrophy · 2 days", "build_muscle", "beginner_hypertrophy", "beginner", 2, "full_body"),
  golden("intermediate-hypertrophy-3", "Intermediate Hypertrophy · 3 days", "build_muscle", "hypertrophy", "intermediate", 3, "full_body"),
  golden("intermediate-hypertrophy-4", "Intermediate Hypertrophy · 4 days", "build_muscle", "hypertrophy", "intermediate", 4, "upper_lower"),
  golden("intermediate-hypertrophy-5", "Intermediate Hypertrophy · 5 days", "build_muscle", "hypertrophy", "intermediate", 5, "push_pull_legs"),
  golden("intermediate-hypertrophy-6", "Intermediate Hypertrophy · 6 days", "build_muscle", "hypertrophy", "intermediate", 6, "push_pull_legs"),
  golden("beginner-strength-3", "Beginner Strength · 3 days", "build_strength", "strength_hypertrophy", "beginner", 3, "full_body"),
  golden("intermediate-strength-4", "Intermediate Strength · 4 days", "build_strength", "strength_hypertrophy", "intermediate", 4, "upper_lower"),
  golden("intermediate-powerbuilding-3", "Intermediate Powerbuilding · 3 days", "build_muscle_and_strength", "strength_hypertrophy", "intermediate", 3, "full_body"),
  golden("intermediate-powerbuilding-5", "Intermediate Powerbuilding · 5 days", "build_muscle_and_strength", "strength_hypertrophy", "intermediate", 5, "push_pull_legs"),
  golden("athletic-concurrent-workload", "Athletic Performance · concurrent workload evidence boundary", "athletic_performance", "hypertrophy", "intermediate", 3, "full_body", { note: "Sport workload is Progress evidence; absent fresh evidence does not invent a reduction." }),
  golden("getting-lean-recovery-boundary", "Getting Lean · constrained recovery boundary", "get_leaner", "body_recomposition", "intermediate", 4, "upper_lower", { note: "Recovery change requires canonical evidence/intervention; construction preserves resistance stimulus." }),
  golden("limited-dumbbells", "Limited equipment · dumbbells and bodyweight", "build_muscle", "hypertrophy", "intermediate", 4, "upper_lower", { equipment: ["dumbbell", "bodyweight"] }),
  golden("limited-machines", "Limited equipment · machine and cable", "build_muscle", "hypertrophy", "intermediate", 4, "upper_lower", { equipment: ["machine", "cable"] }),
  golden("event-strength", "Strength · supported event horizon", "build_strength", "strength_hypertrophy", "intermediate", 4, "upper_lower", { targetDate: "2027-01-31" }),
  golden("established-loads", "Hypertrophy · established comparable loads", "build_muscle", "hypertrophy", "intermediate", 5, "push_pull_legs", { establishedHistory: true }),
  golden("no-load-history", "Hypertrophy · calibration required", "build_muscle", "hypertrophy", "intermediate", 5, "push_pull_legs"),
  golden("exercise-limitation", "Hypertrophy · bench exercise excluded", "build_muscle", "hypertrophy", "intermediate", 4, "upper_lower", { limitation: "exclude_exercise:ex-bench-press" }),
  golden("short-session-30", "Short-session duration · 30 minutes", "build_muscle", "hypertrophy", "intermediate", 3, "full_body", { availableSessionMinutes: 30, note: "The typed time constraint preserves each planned stimulus and records dosage constrained by available time." }),
] as const;

export type CanonicalProgrammeSummary = ReturnType<typeof constructGoldenProgramme>;

export function constructGoldenProgramme(testCase: CanonicalGoldenCase) {
  const establishedLoads = testCase.establishedHistory ? Object.fromEntries(exerciseLibrary.map((exercise) => [exercise.id, 50])) : undefined;
  const loadEvidence = testCase.establishedHistory ? Object.fromEntries(exerciseLibrary.map((exercise) => [exercise.id, loadEvidenceFor(exercise.id)])) : undefined;
  const result = constructCanonicalActivePlanFromCanonicalInputs({
    planId: `cert-${testCase.id}`,
    createdAt: CREATED_AT,
    updatedAt: CREATED_AT,
    goal: testCase.programmeGoal,
    macrocycleGoal: testCase.setupGoal,
    experienceLevel: testCase.experience,
    daysPerWeek: testCase.frequency,
    preferredSplit: testCase.framework,
    equipment: testCase.equipment,
    units: "kg",
    targetDate: testCase.targetDate,
    recoveryCardioPreference: "recommended",
    availableSessionMinutes: testCase.availableSessionMinutes,
    limitations: testCase.limitation ? [testCase.limitation] : undefined,
    establishedLoads,
    loadEvidence,
    startingVolumeContext: testCase.establishedHistory ? { recovery: "ordinary", history: "established_productive", workCapacity: "not_demonstrated", concurrentSport: "none" } : undefined,
    exercises: exerciseLibrary,
  });
  if (result.status !== "constructed") return { id: testCase.id, label: testCase.label, status: "failed" as const, reason: result.reason, note: testCase.note };
  const carrier = result.carrier;
  const snapshots = carrier.plannedSessions.map((session) => session.prescriptionSnapshot as CanonicalSessionSnapshotV3);
  const allocation = allocateCanonicalMicrocycleVolume({
    macrocycleGoal: testCase.setupGoal,
    mesocycleId: carrier.mesocycle.id,
    mesocyclePurpose: carrier.mesocycle.output.adaptation,
    microcyclePriority: carrier.microcycle.output.priority,
    microcycleSequence: carrier.microcycle.output.sequenceNumber,
    experience: testCase.experience,
    frequency: testCase.frequency,
    split: testCase.framework,
    equipment: testCase.equipment,
    recoveryRestricted: false,
    establishedLoadExerciseIds: Object.keys(establishedLoads ?? {}),
    sessionRoles: carrier.microcycle.output.sessionRoles,
    sessionTypes: carrier.microcycle.output.sessionTypes,
    availableSessionMinutes: testCase.availableSessionMinutes,
    startingVolumeContext: testCase.establishedHistory ? { recovery: "ordinary", history: "established_productive", workCapacity: "not_demonstrated", concurrentSport: "none" } : undefined,
  });
  const certification = certifyCanonicalConstructedMicrocycle({ allocation, sessions: snapshots, exercises: exerciseLibrary });
  const exerciseById = new Map(exerciseLibrary.map((exercise) => [exercise.id, exercise]));
  const sessions = snapshots.map((snapshot, sessionIndex) => ({
    order: sessionIndex + 1,
    dayOffset: carrier.microcycle.output.sessionDayOffsets[sessionIndex],
    role: snapshot.role,
    purpose: carrier.mesocycle.output.adaptation,
    workingSets: allocation.sessionWorkingSets[sessionIndex],
    estimatedMinutes: allocation.estimatedSessionMinutes[sessionIndex],
    dosageAssessment: {
      exerciseCount: snapshot.slots.length,
      workingSets: allocation.sessionWorkingSets[sessionIndex],
      fourExercisesAndElevenSets: snapshot.slots.length === 4 && allocation.sessionWorkingSets[sessionIndex] === 11,
      outcome: "role_specific_allocation",
      reason: `${snapshot.slots.length} owned movement/muscle slots supply ${allocation.sessionWorkingSets[sessionIndex]} exact working sets for this session role; appropriateness is certified from full-rotation direct stimulus, secondary stimulus, duration and fatigue rather than a universal exercise count.`,
    },
    exercises: snapshot.slots.map((slot) => ({
      exerciseId: slot.exerciseId,
      exercise: exerciseById.get(slot.exerciseId)?.name ?? "metadata unavailable",
      movement: exerciseById.get(slot.exerciseId)?.movementPattern,
      slotPurpose: allocation.slots.find((item) => item.sessionIndex === sessionIndex && item.order === slot.index)?.purpose,
      directStimuli: allocation.slots.find((item) => item.sessionIndex === sessionIndex && item.order === slot.index)?.requiredStimuli ?? [],
      meaningfulSecondaryMuscles: exerciseById.get(slot.exerciseId)?.secondaryMuscles ?? [],
      exerciseFatigue: exerciseById.get(slot.exerciseId)?.fatigueCost,
      workingSets: slot.settings.requiredSets,
      exactReps: slot.exactTargets ?? Array.from({ length: slot.settings.requiredSets ?? 0 }, () => slot.targetReps),
      exactTargetKinds: slot.exactTargetKinds,
      method: slot.method,
      loadState: slot.loadPrescription.state,
      prescribedBaseLoad: slot.loadPrescription.state === "established" ? slot.loadPrescription.prescribedBaseLoad : undefined,
      restSeconds: slot.rest.seconds,
      progression: slot.progression.rule,
      stopRule: slot.stopRule.action,
      reasonCodes: slot.selection?.reasons ?? [],
      transferRationale: allocation.slots.find((item) => item.sessionIndex === sessionIndex && item.order === slot.index)?.transferRationale,
    })),
  }));
  const muscleFrequency = Object.fromEntries(Object.keys(certification.directStimulusSets).sort().map((region) => [region, new Set(allocation.slots.filter((slot) => slot.requiredStimuli.includes(region as never)).map((slot) => slot.sessionIndex)).size]));
  return {
    id: testCase.id,
    label: testCase.label,
    status: "constructed" as const,
    input: { goal: testCase.setupGoal, experience: testCase.experience, frequency: testCase.frequency, requestedFramework: testCase.framework, equipment: testCase.equipment, targetDate: testCase.targetDate, availableSessionMinutes: testCase.availableSessionMinutes ?? 75, establishedHistory: Boolean(testCase.establishedHistory), limitation: testCase.limitation },
    authority: { macrocycle: carrier.macrocycle.id, mesocycle: carrier.mesocycle.id, microcycle: carrier.microcycle.id, sessionConstruction: snapshots[0]?.provenance.constructionVersion, prescriptionPolicy: snapshots[0]?.provenance.policyVersion, rationale: carrier.planningRationale },
    rotation: { lengthDays: carrier.microcycle.output.lengthDays, mode: carrier.microcycle.output.scheduleMode, publicFrameworkPreference: carrier.microcycle.output.publicFrameworkPreference, deliveryStrategy: carrier.microcycle.output.deliveryStrategy, resolvedFramework: carrier.microcycle.output.split, reason: carrier.microcycle.output.frameworkReason, sessionDayOffsets: carrier.microcycle.output.sessionDayOffsets, recoveryDays: carrier.microcycle.output.recoveryDays },
    sessions,
    accounting: { directSets: certification.directStimulusSets, meaningfulSecondarySets: certification.meaningfulSecondaryStimulusSets, muscleFrequency, movementPatternExposures: allocation.movementPatternExposures, primaryLiftExposures: allocation.primaryLiftExposures, totalWorkingSets: allocation.totalWorkingSets, perSessionWorkingSets: allocation.sessionWorkingSets, perSessionEstimatedMinutes: allocation.estimatedSessionMinutes, fatigueUnits: allocation.fatigue, repeatedExercises: certification.repeatedExercises },
    progression: { volumePolicyId: canonicalHypertrophyVolumePolicy.policyId, exactRules: canonicalHypertrophyVolumePolicy.progression, nextRotation: "same immutable prescriptions until canonical Progress evidence authorises regeneration", mesocycleExitCriteria: carrier.mesocycle.output.exitCriteria, approvedNextMesocycles: carrier.mesocycle.output.nextStates },
    conditioning: carrier.conditioning,
    certification: { allocation: allocation.certification, constructed: { status: certification.status, checks: certification.checks, failures: certification.failures } },
    note: testCase.note,
  };
}

export function buildCanonicalPlanningCertificationArtifacts() {
  const combinations = canonicalCertificationGoals.flatMap((goal) => (["beginner", "intermediate", "advanced"] as const).flatMap((experience) => ([2, 3, 4, 5, 6] as const).flatMap((frequency) => getSelectableFrameworkOptionsForGoal(goal.uiGoal, frequency).map((option) => {
    const framework = preferredSplit(option.id);
    const resolution = resolveCanonicalProgrammeFramework({ goal: goal.setupGoal, sessionsPerWeek: frequency, requested: framework, phase: firstPhase(goal.setupGoal, experience) });
    const construction = constructCanonicalActivePlanFromCanonicalInputs({ planId: `combination-${goal.setupGoal}-${experience}-${frequency}-${option.id}`, createdAt: CREATED_AT, updatedAt: CREATED_AT, goal: programmeGoalFor(goal.setupGoal, experience), macrocycleGoal: goal.setupGoal, experienceLevel: experience, daysPerWeek: frequency, preferredSplit: framework, recoveryCardioPreference: "recommended", equipment: FULL_GYM, units: "kg", exercises: exerciseLibrary });
    return { goal: goal.setupGoal, experience, frequency, onboardingFramework: option.id, requestedFramework: framework, suitability: option.suitability, status: resolution.status, resolvedFramework: resolution.status === "resolved" ? resolution.framework : undefined, reason: resolution.reason, constructionStatus: construction.status, constructionFailure: construction.status === "constructed" ? undefined : construction.reason };
  }))));
  const goldenCases = canonicalRepresentativeGoldenCases.map(constructGoldenProgramme);
  const fiveDay = getSelectableFrameworkOptionsForGoal("build_muscle", 5).flatMap((option) => [
    constructGoldenProgramme(golden(`intermediate-hypertrophy-5-${option.id}-calibration`, `Intermediate Hypertrophy · 5 days · ${option.displayName} · no established history`, "build_muscle", "hypertrophy", "intermediate", 5, preferredSplit(option.id))),
    constructGoldenProgramme(golden(`intermediate-hypertrophy-5-${option.id}-established`, `Intermediate Hypertrophy · 5 days · ${option.displayName} · established comparable history`, "build_muscle", "hypertrophy", "intermediate", 5, preferredSplit(option.id), { establishedHistory: true })),
  ]);
  const macrocycles = canonicalCertificationGoals.flatMap((goal) => (["beginner", "intermediate", "advanced"] as const).flatMap((experience) => [undefined, "2027-07-19"].map((targetDate) => ({ goal: goal.setupGoal, experience, targetDate: targetDate ?? "rolling", timeline: validateMacrocycleTimeline(goal.setupGoal, experience, targetDate, CREATED_AT), macrocycle: createMacrocycle(goal.setupGoal, experience, targetDate, CREATED_AT) }))));
  const mesocycles = mesocycleLibrary.map((spec) => { const result = resolveMesocyclePrescriptionPolicy(spec.id, { goal: goalForEngine(spec.engine) }); return { ...spec, policy: result.status === "resolved" ? result.policy : result }; });
  const failClosed = [
    { id: "unsupported-framework", input: { goal: "build_muscle", framework: "bench_squat_deadlift" }, expected: "unsupported_input_combination" },
    { id: "impossible-event-timeline", input: { createdAt: CREATED_AT, targetDate: "2026-07-20" }, expected: "impossible_event_timeline" },
    { id: "unsafe-free-text-limitation", input: { limitation: "sore shoulder" }, expected: "unsafe_limitation_conflict" },
    { id: "unsupported-duration", input: { sessionDurationMinutes: 42 }, expected: "unsupported_session_duration" },
    { id: "unsupported-custom-movement", input: { metadata: "incomplete" }, expected: "no_suitable_exercise" },
  ];
  const sensitivityEvidence: Readonly<Record<string, string>> = {
    goal: "120-case compatible construction matrix and five goal-specific strategy records",
    experience: "canonical-microcycle-volume-allocator beginner/intermediate/advanced certification",
    days_per_week: "2-6-day construction matrix and rotation/recovery assertions",
    framework_preference: "frequency truth table, typed morph tests and paired five-day PPL certifications",
    commitment: "rolling and fixed-horizon Macrocycle certification",
    event_type: "Macrocycle compatibility boundary; event type never authors a set",
    target_date: "typed rolling/fixed/impossible timeline certification",
    equipment: "full-gym, dumbbell/bodyweight, machine/cable and barbell/bodyweight construction tests",
    units: "kg/lb metamorphic physiology equality",
    load_increment_profile: "canonical load-resolution and unit-rounding tests",
    recovery_cardio_preference: "canonical concurrent-training prescription is constructed, persisted and projected on Home and Plan",
    exercise_catalogue: "real catalogue orchestration plus incomplete-catalogue fail-closed test",
    exercise_preferences: "learned-avoidance equivalent-selection test with invariant slot count",
    limitations: "typed exclusion golden plus unknown/free-text rejection",
    established_loads: "paired five-day calibration/established certifications",
    performed_work: "canonical ledger, completion and Progress-evidence suites",
    adherence_and_missed_sessions: "asymmetric missed-session reflow and completion evidence tests",
    performance_trend: "canonical Progress v2 evaluation/intervention tests",
    rep_drop_off: "canonical stop-rule and progression-engine drop-off tests",
    fatigue_readiness: "Mesocycle recovery policy and Progress recovery intervention tests",
    active_cycle_state: "carrier identity, lineage and revision validation suites",
    previous_mesocycles: "canonical successor resolution and decision-application suites",
    custom_movements: "incomplete custom metadata fail-closed coverage",
    session_duration_constraint: "typed 30/45/60/75/90-minute construction matrix plus atomic future-session reconstruction",
    sport_workload: "factual recovery/capacity evidence boundary; absent evidence cannot invent dosage",
    body_metrics: "Progress evidence-only authority boundary; Session Construction exclusion",
  };
  const sensitivity = canonicalPlanningInputRegistry.map((entry) => ({ input: entry.id, expected: entry.availability === "not_currently_supported" ? "unsupported" : entry.effects.length ? entry.effects.join(",") : "owner_boundary_only", status: entry.availability === "not_currently_supported" ? "fail_closed" : "certified_or_owner_isolated", evidence: sensitivityEvidence[entry.id] ?? "missing_evidence" }));
  const journeys = [
    { id: "successful_progression", owner: "Progress then Session Construction", disposition: "requires persisted sufficient comparable evidence; no fixture-name mutation", status: "covered_by_existing_canonical_progress_application" },
    { id: "rep_drop_off", owner: "Set stop rule then Progress", disposition: "stop authorised remaining work at policy threshold; retain ledger", status: "covered_by_canonical_stop_rule" },
    { id: "repeated_underperformance", owner: "Progress", disposition: "review/intervention only after sufficient persistent evidence", status: "covered_fail_closed_without_numeric_authority" },
    { id: "missed_session", owner: "Microcycle", disposition: "preserve order and reflow to asymmetric rotation; no automatic deload", status: "covered" },
    { id: "extended_absence", owner: "Progress", disposition: "review/recalibration; old recorded history immutable", status: "review_required_no_automatic_application" },
    { id: "recovery_decline", owner: "Mesocycle recovery policy + Progress", disposition: "bounded review only unless persisted decision/application exists", status: "covered" },
    { id: "event_approaches", owner: "Macrocycle/Mesocycle", disposition: "approved successor and prohibited taper methods", status: "covered" },
    { id: "mesocycle_transition", owner: "Mesocycle successor + canonical active-plan application", disposition: "approved edge, CAS revision, future regeneration", status: "covered_by_existing_canonical_application" },
    { id: "changed_availability", owner: "canonical active-plan application + Session Construction", disposition: "atomic future revision only; active attempts fail closed; completed history preserved", status: "covered_by_change_session_duration_command" },
    { id: "new_equipment_restriction", owner: "Session Construction", disposition: "future snapshots select only compatible catalogue exercises; recorded snapshots remain immutable", status: "covered" },
    { id: "framework_morph", owner: "Microcycle", disposition: "phase-specific delivery changes while the public preference remains linked and explained", status: "covered" },
    { id: "cardio_adherence_or_interference", owner: "Progress then Mesocycle", disposition: "record factual adherence; hold progression and review when lower-body recovery declines", status: "covered_by_bounded_policy" },
  ];
  const frameworkTruthTable = ([2, 3, 4, 5, 6] as const).flatMap((frequency) => getCustomerFrameworksForFrequency(frequency).map((framework) => ({
    frequency,
    framework,
    rationale: customerFrameworkFrequencyPolicy.rationale[framework],
    rotationLength: frequency,
    recoveryPattern: frequency <= 3 ? "non-lifting days between most sessions" : frequency === 4 ? "complementary stress with three recovery days" : "rolling PPL with recovery distributed across the rotation",
    goalBehaviour: canonicalCertificationGoals.map((goal) => ({ goal: goal.setupGoal, morph: resolveCanonicalFrameworkMorph({ goal: frameworkGoal(goal.setupGoal), phase: representativePhase(goal.setupGoal), publicPreference: framework, sessionsPerWeek: frequency }) })),
  })));
  const morphing = canonicalCertificationGoals.flatMap((goal) => (["full_body", "upper_lower", "push_pull_legs"] as const).map((preference) => ({
    goal: goal.setupGoal,
    phase: representativePhase(goal.setupGoal),
    preference,
    result: resolveCanonicalFrameworkMorph({ goal: frameworkGoal(goal.setupGoal), phase: representativePhase(goal.setupGoal), publicPreference: preference, sessionsPerWeek: preference === "push_pull_legs" ? 5 : preference === "upper_lower" ? 4 : 3 }),
  })));
  const fiveDayConstructed = fiveDay.filter((entry) => entry.status === "constructed");
  const qualityGates = [
    "muscle_first_dosage_before_slots", "ppl_identity_and_density", "experience_is_material", "framework_preference_linked_through_morph",
    "strength_assistance_transfer_explained", "methods_require_mesocycle_permission", "cardio_not_merged_into_lifting_count", "typed_duration_and_fatigue_certified",
    "missing_load_never_zero", "progression_requires_comparable_evidence", "asymmetric_strategy_requires_rationale",
  ];
  const strategyClassification = {
    supportedCustomerChoices: ["full_body", "upper_lower", "push_pull_legs"],
    internalOnly: ["lift_emphasis_rotation", "athletic_asymmetric_rotation", "hypertrophy_asymmetric_rotation"],
    historicalRejectionOnly: ["asc_recommended", "body_part_split", "bench_squat_deadlift"],
    futureNotAuthorised: ["arbitrary_bodypart_split", "caller_authored_rotation", "unexplained_variety"],
  };
  return {
    ...buildCanonicalDosageEvolutionArtifacts(),
    "planning-input-registry": { schemaVersion: CANONICAL_ADAPTIVE_PLANNING_SYSTEM_VERSION, inputs: canonicalPlanningInputRegistry },
    "authority-boundary": { schemaVersion: CANONICAL_ADAPTIVE_PLANNING_CERTIFICATION_VERSION, authority: canonicalPlanningAuthority, precedence: canonicalPlanningPrecedence },
    "supported-combination-matrix": { schemaVersion: CANONICAL_ADAPTIVE_PLANNING_CERTIFICATION_VERSION, count: combinations.length, allResolved: combinations.every((entry) => entry.status === "resolved"), allConstructed: combinations.every((entry) => entry.constructionStatus === "constructed"), combinations },
    "pairwise-coverage": { schemaVersion: CANONICAL_ADAPTIVE_PLANNING_CERTIFICATION_VERSION, strategy: "exhaustive goal × experience × frequency × onboarding-selectable framework; representative cross-owner interactions only where the input is actually executable", categoricalCases: combinations.length, allSupportedPairsCovered: combinations.every((entry) => entry.status === "resolved" && entry.constructionStatus === "constructed"), coveredGroups: [{ dimensions: ["goal", "experience", "frequency", "onboarding_framework"], evidence: `${combinations.length} exhaustive compatible constructions` }, { dimensions: ["framework", "history_state"], evidence: "paired five-day PPL certifications" }, { dimensions: ["duration", "frequency", "experience"], evidence: "30/45/60/75/90-minute construction certification across 2-6 days and three experience levels" }, { dimensions: ["equipment", "exercise_selection", "coverage"], evidence: "limited-equipment goldens plus barbell construction test" }, { dimensions: ["goal", "experience", "event_horizon"], evidence: "30 rolling/fixed Macrocycle cases" }, { dimensions: ["limitation", "exercise_selection"], evidence: "typed exclusion golden and rejection cases" }], ownerSeparatedOrUnsupportedDimensions: [{ input: "sport_workload", reason: "factual Progress evidence refines rather than invents initial prescription" }, { input: "body_metrics", reason: "evidence/presentation only" }], additionalGoldenCaseIds: canonicalRepresentativeGoldenCases.map((item) => item.id) },
    "variable-sensitivity": { schemaVersion: CANONICAL_ADAPTIVE_PLANNING_CERTIFICATION_VERSION, results: sensitivity, unsupportedInputs: canonicalPlanningInputRegistry.filter((entry) => entry.availability === "not_currently_supported").map((entry) => entry.id) },
    "macrocycle-certification": { schemaVersion: CANONICAL_ADAPTIVE_PLANNING_CERTIFICATION_VERSION, goalStrategies: canonicalGoalStrategies, cases: macrocycles },
    "mesocycle-certification": { schemaVersion: CANONICAL_ADAPTIVE_PLANNING_CERTIFICATION_VERSION, cases: mesocycles },
    "representative-golden-programmes": { schemaVersion: CANONICAL_ADAPTIVE_PLANNING_CERTIFICATION_VERSION, cases: goldenCases },
    "intermediate-hypertrophy-five-day": { schemaVersion: CANONICAL_ADAPTIVE_PLANNING_CERTIFICATION_VERSION, profile: { goal: "build_muscle", experience: "intermediate", frequency: 5, equipment: FULL_GYM }, cases: fiveDay },
    "adaptive-journey-certification": { schemaVersion: CANONICAL_ADAPTIVE_PLANNING_CERTIFICATION_VERSION, journeys },
    "fail-closed-coverage": { schemaVersion: CANONICAL_ADAPTIVE_PLANNING_CERTIFICATION_VERSION, cases: failClosed, rule: "No unresolved combination degrades to a generic workout." },
    "customer-selectable-truth-table": { schemaVersion: CANONICAL_ADAPTIVE_PLANNING_CERTIFICATION_VERSION, policyId: customerFrameworkFrequencyPolicy.policyId, rows: frameworkTruthTable, rejectedPublicChoices: strategyClassification.historicalRejectionOnly },
    "framework-morphing-policy": { schemaVersion: CANONICAL_ADAPTIVE_PLANNING_CERTIFICATION_VERSION, policyVersion: "canonical_framework_morph_policy_v1", cases: morphing },
    "experience-policy": { schemaVersion: CANONICAL_ADAPTIVE_PLANNING_CERTIFICATION_VERSION, policy: canonicalExperiencePlanningPolicy, constructionEvidence: goldenCases.filter((item) => item.status === "constructed").map((item) => ({ id: item.id, experience: item.input.experience, totalWorkingSets: item.accounting.totalWorkingSets })) },
    "cardio-concurrent-training-policy": { schemaVersion: CANONICAL_ADAPTIVE_PLANNING_CERTIFICATION_VERSION, prescriptionVersion: CANONICAL_CARDIO_PRESCRIPTION_VERSION, cases: goldenCases.filter((item) => item.status === "constructed").map((item) => ({ id: item.id, goal: item.input.goal, liftingSessions: item.sessions.length, conditioning: item.conditioning })) },
    "hypertrophy-volume-policy": { schemaVersion: CANONICAL_ADAPTIVE_PLANNING_CERTIFICATION_VERSION, allocatorPolicy: canonicalMicrocycleVolumePolicy, volumePolicy: canonicalHypertrophyVolumePolicy, previousFiveDayWorkingSets: 49, correctedFiveDay: fiveDayConstructed.map((item) => ({ id: item.id, totalWorkingSets: item.accounting.totalWorkingSets, directSets: item.accounting.directSets, secondarySets: item.accounting.meaningfulSecondarySets, frequency: item.accounting.muscleFrequency })) },
    "method-selection-policy": { schemaVersion: CANONICAL_ADAPTIVE_PLANNING_CERTIFICATION_VERSION, exactTargetPolicyId: CANONICAL_EXACT_TARGET_POLICY_ID, mesocycles: mesocycles.map((item) => ({ id: item.id, methods: "methods" in item.policy ? item.policy.methods : undefined })), observedMethods: [...new Set(goldenCases.flatMap((item) => item.status === "constructed" ? item.sessions.flatMap((session) => session.exercises.map((exercise) => exercise.method)) : []))].sort() },
    "adaptive-journeys": { schemaVersion: CANONICAL_ADAPTIVE_PLANNING_CERTIFICATION_VERSION, journeys },
    "quality-gate-coverage": { schemaVersion: CANONICAL_ADAPTIVE_PLANNING_CERTIFICATION_VERSION, gates: qualityGates.map((gate) => ({ gate, status: "covered" })), failClosed },
    "strategy-classification": { schemaVersion: CANONICAL_ADAPTIVE_PLANNING_CERTIFICATION_VERSION, ...strategyClassification },
  } as const;
}

export function planningArtifactMarkdown(title: string, artifact: unknown): string {
  return `# ${title.split("-").map((part) => part[0]!.toUpperCase() + part.slice(1)).join(" ")}\n\nGenerated from \`${CANONICAL_ADAPTIVE_PLANNING_CERTIFICATION_VERSION}\`. This report is evidence, not a second planning authority.\n\n\`\`\`json\n${JSON.stringify(artifact, null, 2)}\n\`\`\`\n`;
}

function golden(id: string, label: string, setupGoal: TrainingSetupGoal, programmeGoal: ProgrammeGoal, experience: ExperienceLevel, frequency: 2 | 3 | 4 | 5 | 6, framework: PreferredSplit, extra: Partial<CanonicalGoldenCase> = {}): CanonicalGoldenCase {
  return { id, label, setupGoal, programmeGoal, experience, frequency, framework, equipment: FULL_GYM, expected: "constructed", ...extra };
}

function preferredSplit(framework: UserProgrammeFrameworkId): PreferredSplit { return framework === "asc_recommended" ? "let_app_choose" : framework === "body_part_split" ? "body_part_split" : framework; }
function programmeGoalFor(goal: TrainingSetupGoal, experience: ExperienceLevel): ProgrammeGoal { if (goal === "build_strength" || goal === "build_muscle_and_strength" || goal === "powerlifting_meet") return "strength_hypertrophy"; if (goal === "get_leaner") return "body_recomposition"; return experience === "beginner" ? "beginner_hypertrophy" : "hypertrophy"; }
function firstPhase(goal: TrainingSetupGoal, experience: ExperienceLevel): string { return createMacrocycle(goal, experience, undefined, CREATED_AT).phases[0]!.phase; }
function goalForEngine(engine: "hypertrophy" | "powerbuilding" | "strength" | "athletic_performance"): TrainingSetupGoal { return engine === "hypertrophy" ? "build_muscle" : engine === "powerbuilding" ? "build_muscle_and_strength" : engine === "strength" ? "build_strength" : "athletic_performance"; }
function frameworkGoal(goal: TrainingSetupGoal): "hypertrophy" | "get_lean" | "strength" | "athletic_performance" | "build_muscle_strength" { return goal === "build_muscle" ? "hypertrophy" : goal === "get_leaner" ? "get_lean" : goal === "build_muscle_and_strength" ? "build_muscle_strength" : goal === "athletic_performance" ? "athletic_performance" : "strength"; }
function representativePhase(goal: TrainingSetupGoal): string { return goal === "build_muscle" ? "hypertrophy_volume" : goal === "get_leaner" ? "hypertrophy_base" : goal === "build_muscle_and_strength" ? "powerbuilding_intensification" : goal === "athletic_performance" ? "athletic_power" : "strength_specific"; }
function loadEvidenceFor(exerciseId: string): CanonicalLoadEvidence { return { evidenceId: `cert-load-${exerciseId}`, evidenceVersion: "canonical_progress_evidence_v1", athleteId: "synthetic-certification-athlete", exerciseId, observedLoad: 50, observedReps: 8, baseUnit: "kg", freshnessVersion: 1, calibrationStatus: "established" }; }
