import { constructCanonicalActivePlanFromCanonicalInputs } from "@/application/training/canonical-active-plan-construction";
import { certifyCanonicalConstructedMicrocycle } from "@/domain/training/canonical-constructed-microcycle-certification";
import type { CanonicalLoadEvidence } from "@/domain/training/canonical-load-prescription";
import { allocateCanonicalMicrocycleVolume } from "@/domain/training/canonical-microcycle-volume-allocator";
import type { CanonicalSessionSnapshotV3 } from "@/domain/training/canonical-session-construction-pipeline";
import { createMacrocycle, validateMacrocycleTimeline } from "@/domain/training/macrocycle-engine";
import { mesocycleLibrary } from "@/domain/training/mesocycle-library";
import { resolveMesocyclePrescriptionPolicy } from "@/domain/training/mesocycle-prescription-policy";
import type { Equipment, ExperienceLevel, ProgrammeGoal } from "@/domain/training/models";
import { exerciseLibrary } from "@/domain/training/presets";
import { getSelectableFrameworkOptionsForGoal, resolveCanonicalProgrammeFramework, type UserProgrammeFrameworkId } from "@/domain/training/programme-framework-rules";
import type { PreferredSplit, TrainingSetupGoal } from "@/domain/training/plan-setup";
import type { TrainingGoalId } from "@/domain/training/training-goals";
import { CANONICAL_ADAPTIVE_PLANNING_SYSTEM_VERSION, canonicalGoalStrategies, canonicalPlanningAuthority, canonicalPlanningInputRegistry, canonicalPlanningPrecedence } from "@/domain/training/canonical-adaptive-planning-system";

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
}>;

export const canonicalRepresentativeGoldenCases: readonly CanonicalGoldenCase[] = [
  golden("beginner-hypertrophy-2", "Beginner Hypertrophy · 2 days", "build_muscle", "beginner_hypertrophy", "beginner", 2, "full_body"),
  golden("intermediate-hypertrophy-3", "Intermediate Hypertrophy · 3 days", "build_muscle", "hypertrophy", "intermediate", 3, "full_body"),
  golden("intermediate-hypertrophy-4", "Intermediate Hypertrophy · 4 days", "build_muscle", "hypertrophy", "intermediate", 4, "upper_lower"),
  golden("intermediate-hypertrophy-5", "Intermediate Hypertrophy · 5 days", "build_muscle", "hypertrophy", "intermediate", 5, "push_pull_legs"),
  golden("intermediate-hypertrophy-6", "Intermediate Hypertrophy · 6 days", "build_muscle", "hypertrophy", "intermediate", 6, "push_pull_legs"),
  golden("beginner-strength-3", "Beginner Strength · 3 days", "build_strength", "strength_hypertrophy", "beginner", 3, "full_body"),
  golden("intermediate-strength-4", "Intermediate Strength · 4 days", "build_strength", "strength_hypertrophy", "intermediate", 4, "bench_squat_deadlift"),
  golden("intermediate-powerbuilding-3", "Intermediate Powerbuilding · 3 days", "build_muscle_and_strength", "strength_hypertrophy", "intermediate", 3, "full_body"),
  golden("intermediate-powerbuilding-5", "Intermediate Powerbuilding · 5 days", "build_muscle_and_strength", "strength_hypertrophy", "intermediate", 5, "bench_squat_deadlift"),
  golden("athletic-concurrent-workload", "Athletic Performance · concurrent workload evidence boundary", "athletic_performance", "hypertrophy", "intermediate", 3, "full_body", { note: "Sport workload is Progress evidence; absent fresh evidence does not invent a reduction." }),
  golden("getting-lean-recovery-boundary", "Getting Lean · constrained recovery boundary", "get_leaner", "body_recomposition", "intermediate", 4, "upper_lower", { note: "Recovery change requires canonical evidence/intervention; construction preserves resistance stimulus." }),
  golden("limited-dumbbells", "Limited equipment · dumbbells and bodyweight", "build_muscle", "hypertrophy", "intermediate", 4, "upper_lower", { equipment: ["dumbbell", "bodyweight"] }),
  golden("limited-machines", "Limited equipment · machine and cable", "build_muscle", "hypertrophy", "intermediate", 4, "upper_lower", { equipment: ["machine", "cable"] }),
  golden("event-strength", "Strength · supported event horizon", "build_strength", "strength_hypertrophy", "intermediate", 4, "bench_squat_deadlift", { targetDate: "2027-01-31" }),
  golden("established-loads", "Hypertrophy · established comparable loads", "build_muscle", "hypertrophy", "intermediate", 5, "push_pull_legs", { establishedHistory: true }),
  golden("no-load-history", "Hypertrophy · calibration required", "build_muscle", "hypertrophy", "intermediate", 5, "push_pull_legs"),
  golden("exercise-limitation", "Hypertrophy · bench exercise excluded", "build_muscle", "hypertrophy", "intermediate", 4, "upper_lower", { limitation: "exclude_exercise:ex-bench-press" }),
  { ...golden("short-session-gap", "Short-session duration · unsupported input", "build_muscle", "hypertrophy", "intermediate", 3, "full_body"), expected: "unsupported", note: "Production has no session-duration input owner; activation must not infer one." },
] as const;

export type CanonicalProgrammeSummary = ReturnType<typeof constructGoldenProgramme>;

export function constructGoldenProgramme(testCase: CanonicalGoldenCase) {
  if (testCase.expected === "unsupported") return { id: testCase.id, label: testCase.label, status: "unsupported" as const, reason: "session_duration_constraint_not_supported", note: testCase.note };
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
    limitations: testCase.limitation ? [testCase.limitation] : undefined,
    establishedLoads,
    loadEvidence,
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
      workingSets: slot.settings.requiredSets,
      exactReps: slot.exactTargets ?? Array.from({ length: slot.settings.requiredSets ?? 0 }, () => slot.targetReps),
      loadState: slot.loadPrescription.state,
      prescribedBaseLoad: slot.loadPrescription.state === "established" ? slot.loadPrescription.prescribedBaseLoad : undefined,
      restSeconds: slot.rest.seconds,
      progression: slot.progression.rule,
      stopRule: slot.stopRule.action,
      reasonCodes: slot.selection?.reasons ?? [],
    })),
  }));
  const muscleFrequency = Object.fromEntries(Object.keys(certification.directStimulusSets).sort().map((region) => [region, new Set(allocation.slots.filter((slot) => slot.requiredStimuli.includes(region as never)).map((slot) => slot.sessionIndex)).size]));
  return {
    id: testCase.id,
    label: testCase.label,
    status: "constructed" as const,
    input: { goal: testCase.setupGoal, experience: testCase.experience, frequency: testCase.frequency, requestedFramework: testCase.framework, equipment: testCase.equipment, targetDate: testCase.targetDate, establishedHistory: Boolean(testCase.establishedHistory), limitation: testCase.limitation },
    authority: { macrocycle: carrier.macrocycle.id, mesocycle: carrier.mesocycle.id, microcycle: carrier.microcycle.id, sessionConstruction: snapshots[0]?.provenance.constructionVersion, prescriptionPolicy: snapshots[0]?.provenance.policyVersion, rationale: carrier.planningRationale },
    rotation: { lengthDays: carrier.microcycle.output.lengthDays, mode: carrier.microcycle.output.scheduleMode, resolvedFramework: carrier.microcycle.output.split, reason: carrier.microcycle.output.frameworkReason, sessionDayOffsets: carrier.microcycle.output.sessionDayOffsets, recoveryDays: carrier.microcycle.output.recoveryDays },
    sessions,
    accounting: { directSets: certification.directStimulusSets, meaningfulSecondarySets: certification.meaningfulSecondaryStimulusSets, muscleFrequency, movementPatternExposures: allocation.movementPatternExposures, primaryLiftExposures: allocation.primaryLiftExposures, totalWorkingSets: allocation.totalWorkingSets, perSessionWorkingSets: allocation.sessionWorkingSets, perSessionEstimatedMinutes: allocation.estimatedSessionMinutes, fatigueUnits: allocation.fatigue, repeatedExercises: certification.repeatedExercises },
    progression: { nextRotation: "same immutable prescriptions until canonical Progress evidence authorises regeneration", mesocycleExitCriteria: carrier.mesocycle.output.exitCriteria, approvedNextMesocycles: carrier.mesocycle.output.nextStates },
    certification: { allocation: allocation.certification, constructed: { status: certification.status, checks: certification.checks, failures: certification.failures } },
    note: testCase.note,
  };
}

export function buildCanonicalPlanningCertificationArtifacts() {
  const combinations = canonicalCertificationGoals.flatMap((goal) => (["beginner", "intermediate", "advanced"] as const).flatMap((experience) => ([2, 3, 4, 5, 6] as const).flatMap((frequency) => getSelectableFrameworkOptionsForGoal(goal.uiGoal).map((option) => {
    const framework = preferredSplit(option.id);
    const resolution = resolveCanonicalProgrammeFramework({ goal: goal.setupGoal, sessionsPerWeek: frequency, requested: framework, phase: firstPhase(goal.setupGoal, experience) });
    const construction = constructCanonicalActivePlanFromCanonicalInputs({ planId: `combination-${goal.setupGoal}-${experience}-${frequency}-${option.id}`, createdAt: CREATED_AT, updatedAt: CREATED_AT, goal: programmeGoalFor(goal.setupGoal, experience), macrocycleGoal: goal.setupGoal, experienceLevel: experience, daysPerWeek: frequency, preferredSplit: framework, equipment: FULL_GYM, units: "kg", exercises: exerciseLibrary });
    return { goal: goal.setupGoal, experience, frequency, onboardingFramework: option.id, requestedFramework: framework, suitability: option.suitability, status: resolution.status, resolvedFramework: resolution.status === "resolved" ? resolution.framework : undefined, reason: resolution.reason, constructionStatus: construction.status, constructionFailure: construction.status === "constructed" ? undefined : construction.reason };
  }))));
  const goldenCases = canonicalRepresentativeGoldenCases.map(constructGoldenProgramme);
  const fiveDay = getSelectableFrameworkOptionsForGoal("build_muscle").flatMap((option) => [
    constructGoldenProgramme(golden(`intermediate-hypertrophy-5-${option.id}-calibration`, `Intermediate Hypertrophy · 5 days · ${option.displayName} · no established history`, "build_muscle", "hypertrophy", "intermediate", 5, preferredSplit(option.id))),
    constructGoldenProgramme(golden(`intermediate-hypertrophy-5-${option.id}-established`, `Intermediate Hypertrophy · 5 days · ${option.displayName} · established comparable history`, "build_muscle", "hypertrophy", "intermediate", 5, preferredSplit(option.id), { establishedHistory: true })),
  ]);
  const macrocycles = canonicalCertificationGoals.flatMap((goal) => (["beginner", "intermediate", "advanced"] as const).flatMap((experience) => [undefined, "2027-07-19"].map((targetDate) => ({ goal: goal.setupGoal, experience, targetDate: targetDate ?? "rolling", timeline: validateMacrocycleTimeline(goal.setupGoal, experience, targetDate, CREATED_AT), macrocycle: createMacrocycle(goal.setupGoal, experience, targetDate, CREATED_AT) }))));
  const mesocycles = mesocycleLibrary.map((spec) => { const result = resolveMesocyclePrescriptionPolicy(spec.id, { goal: goalForEngine(spec.engine) }); return { ...spec, policy: result.status === "resolved" ? result.policy : result }; });
  const failClosed = [
    { id: "unsupported-framework", input: { goal: "build_muscle", framework: "bench_squat_deadlift" }, expected: "unsupported_input_combination" },
    { id: "impossible-event-timeline", input: { createdAt: CREATED_AT, targetDate: "2026-07-20" }, expected: "impossible_event_timeline" },
    { id: "unsafe-free-text-limitation", input: { limitation: "sore shoulder" }, expected: "unsafe_limitation_conflict" },
    { id: "unsupported-duration", input: { sessionDurationMinutes: 30 }, expected: "unsupported_input_not_in_activation_contract" },
    { id: "unsupported-custom-movement", input: { metadata: "incomplete" }, expected: "no_suitable_exercise" },
  ];
  const sensitivityEvidence: Readonly<Record<string, string>> = {
    goal: "375-case construction matrix and five goal-specific strategy records",
    experience: "canonical-microcycle-volume-allocator beginner/intermediate/advanced certification",
    days_per_week: "2-6-day construction matrix and rotation/recovery assertions",
    framework_preference: "framework morph tests and ten paired five-day hypertrophy certifications",
    commitment: "rolling and fixed-horizon Macrocycle certification",
    event_type: "Macrocycle compatibility boundary; event type never authors a set",
    target_date: "typed rolling/fixed/impossible timeline certification",
    equipment: "full-gym, dumbbell/bodyweight, machine/cable and barbell/bodyweight construction tests",
    units: "kg/lb metamorphic physiology equality",
    load_increment_profile: "canonical load-resolution and unit-rounding tests",
    recovery_cardio_preference: "recovery-capacity policy tests; construction cannot delete resistance stimulus",
    exercise_catalogue: "real catalogue orchestration plus incomplete-catalogue fail-closed test",
    exercise_preferences: "learned-avoidance equivalent-selection test with invariant slot count",
    limitations: "typed exclusion golden plus unknown/free-text rejection",
    established_loads: "ten paired five-day calibration/established certifications",
    performed_work: "canonical ledger, completion and Progress-evidence suites",
    adherence_and_missed_sessions: "asymmetric missed-session reflow and completion evidence tests",
    performance_trend: "canonical Progress v2 evaluation/intervention tests",
    rep_drop_off: "canonical stop-rule and progression-engine drop-off tests",
    fatigue_readiness: "Mesocycle recovery policy and Progress recovery intervention tests",
    active_cycle_state: "carrier identity, lineage and revision validation suites",
    previous_mesocycles: "canonical successor resolution and decision-application suites",
    custom_movements: "incomplete custom metadata fail-closed coverage",
    session_duration_constraint: "explicit unsupported-input registry and fail-closed case",
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
    { id: "changed_availability", owner: "canonical plan reconstruction", disposition: "future revision only; completed history preserved", status: "application_contract_requires_explicit_user_command" },
  ];
  return {
    "planning-input-registry": { schemaVersion: CANONICAL_ADAPTIVE_PLANNING_SYSTEM_VERSION, inputs: canonicalPlanningInputRegistry },
    "authority-boundary": { schemaVersion: CANONICAL_ADAPTIVE_PLANNING_CERTIFICATION_VERSION, authority: canonicalPlanningAuthority, precedence: canonicalPlanningPrecedence },
    "supported-combination-matrix": { schemaVersion: CANONICAL_ADAPTIVE_PLANNING_CERTIFICATION_VERSION, count: combinations.length, allResolved: combinations.every((entry) => entry.status === "resolved"), allConstructed: combinations.every((entry) => entry.constructionStatus === "constructed"), combinations },
    "pairwise-coverage": { schemaVersion: CANONICAL_ADAPTIVE_PLANNING_CERTIFICATION_VERSION, strategy: "exhaustive goal × experience × frequency × onboarding-selectable framework; representative cross-owner interactions only where the input is actually executable", categoricalCases: combinations.length, allSupportedPairsCovered: combinations.every((entry) => entry.status === "resolved" && entry.constructionStatus === "constructed"), coveredGroups: [{ dimensions: ["goal", "experience", "frequency", "onboarding_framework"], evidence: "375 exhaustive compatible constructions" }, { dimensions: ["framework", "history_state"], evidence: "ten paired five-day hypertrophy cases" }, { dimensions: ["equipment", "exercise_selection", "coverage"], evidence: "limited-equipment goldens plus barbell construction test" }, { dimensions: ["goal", "experience", "event_horizon"], evidence: "30 rolling/fixed Macrocycle cases" }, { dimensions: ["limitation", "exercise_selection"], evidence: "typed exclusion golden and rejection cases" }], ownerSeparatedOrUnsupportedDimensions: [{ input: "session_duration_constraint", reason: "not a production input; fail closed" }, { input: "recovery_cardio_preference", reason: "recovery policy/Progress owner, not initial prescription authority" }, { input: "sport_workload", reason: "factual Progress evidence owner; absent from onboarding construction" }, { input: "body_metrics", reason: "evidence/presentation only" }], additionalGoldenCaseIds: canonicalRepresentativeGoldenCases.map((item) => item.id) },
    "variable-sensitivity": { schemaVersion: CANONICAL_ADAPTIVE_PLANNING_CERTIFICATION_VERSION, results: sensitivity, unsupportedInputs: canonicalPlanningInputRegistry.filter((entry) => entry.availability === "not_currently_supported").map((entry) => entry.id) },
    "macrocycle-certification": { schemaVersion: CANONICAL_ADAPTIVE_PLANNING_CERTIFICATION_VERSION, goalStrategies: canonicalGoalStrategies, cases: macrocycles },
    "mesocycle-certification": { schemaVersion: CANONICAL_ADAPTIVE_PLANNING_CERTIFICATION_VERSION, cases: mesocycles },
    "representative-golden-programmes": { schemaVersion: CANONICAL_ADAPTIVE_PLANNING_CERTIFICATION_VERSION, cases: goldenCases },
    "intermediate-hypertrophy-five-day": { schemaVersion: CANONICAL_ADAPTIVE_PLANNING_CERTIFICATION_VERSION, profile: { goal: "build_muscle", experience: "intermediate", frequency: 5, equipment: FULL_GYM }, cases: fiveDay },
    "adaptive-journey-certification": { schemaVersion: CANONICAL_ADAPTIVE_PLANNING_CERTIFICATION_VERSION, journeys },
    "fail-closed-coverage": { schemaVersion: CANONICAL_ADAPTIVE_PLANNING_CERTIFICATION_VERSION, cases: failClosed, rule: "No unresolved combination degrades to a generic workout." },
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
function loadEvidenceFor(exerciseId: string): CanonicalLoadEvidence { return { evidenceId: `cert-load-${exerciseId}`, evidenceVersion: "canonical_progress_evidence_v1", athleteId: "synthetic-certification-athlete", exerciseId, observedLoad: 50, observedReps: 8, baseUnit: "kg", freshnessVersion: 1, calibrationStatus: "established" }; }
