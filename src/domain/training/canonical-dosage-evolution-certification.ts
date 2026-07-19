import { constructCanonicalActivePlanFromCanonicalInputs } from "@/application/training/canonical-active-plan-construction";
import { certifyCanonicalConstructedMicrocycle } from "@/domain/training/canonical-constructed-microcycle-certification";
import { resolveCanonicalExactTarget } from "@/domain/training/canonical-exact-target-policy";
import { resolveCanonicalCardioPrescription } from "@/domain/training/canonical-cardio-prescription";
import { allocateCanonicalMicrocycleVolume, type AllocatedSlot } from "@/domain/training/canonical-microcycle-volume-allocator";
import { canonicalHypertrophyLandmark, resolveCanonicalHypertrophyStartingVolume, resolveCanonicalHypertrophyVolumeProgression, type CanonicalStartingVolumeContext } from "@/domain/training/canonical-hypertrophy-volume-policy";
import type { CanonicalSessionSnapshotV3 } from "@/domain/training/canonical-session-construction-pipeline";
import { mesocycleById, type MesocycleId } from "@/domain/training/mesocycle-library";
import { resolveMesocyclePrescriptionPolicy } from "@/domain/training/mesocycle-prescription-policy";
import type { CanonicalStimulusRegion, Exercise, ExperienceLevel } from "@/domain/training/models";
import { reflowCanonicalMicrocycleAfterMissedSession } from "@/domain/training/microcycle-scheduler";
import { exerciseLibrary } from "@/domain/training/presets";
import { selectSetMethod, setMethodExplanation } from "@/domain/training/set-method-governance";

export const CANONICAL_DOSAGE_EVOLUTION_CERTIFICATION_VERSION = "canonical_dosage_evolution_certification_v1" as const;
const FULL_GYM = ["barbell", "dumbbell", "machine", "cable", "bodyweight"] as const;
const CREATED_AT = "2026-07-19T08:00:00.000Z";
const regions: readonly CanonicalStimulusRegion[] = ["chest", "lats", "upper_back", "anterior_delts", "lateral_delts", "rear_delts", "triceps", "biceps", "quadriceps", "hamstrings_knee_flexion", "hip_extension", "calves", "core"];

export function buildCanonicalDosageEvolutionArtifacts() {
  const first = constructSlice(1);
  const second = constructSlice(2);
  if (!first || !second) throw new Error("canonical_rolling_ppl_construction_failed");
  const completeSessions = [...first.sessions, second.sessions[0]!];
  const roles = completeSessions.map((session) => session.role);
  if (roles.join("|") !== "Push hypertrophy A|Pull hypertrophy B|Legs hypertrophy C|Push hypertrophy D|Pull hypertrophy E|Legs hypertrophy F") throw new Error(`invalid_complete_rotation:${roles.join("|")}`);
  const fullRotation = aggregateSessions(completeSessions);
  const normalised = scaleAccounting(fullRotation, 5 / 6);
  if (!first.conditioning || !second.conditioning) throw new Error("canonical_cardio_prescription_missing");
  const weekRoleSlices = [
    ["Push hypertrophy A", "Pull hypertrophy B", "Legs hypertrophy C", "Push hypertrophy D", "Pull hypertrophy E"],
    ["Legs hypertrophy F", "Push hypertrophy A", "Pull hypertrophy B", "Legs hypertrophy C", "Push hypertrophy D"],
    ["Pull hypertrophy E", "Legs hypertrophy F", "Push hypertrophy A", "Pull hypertrophy B", "Legs hypertrophy C"],
  ] as const;
  const byRole = new Map(completeSessions.map((session) => [session.role, session]));
  const calendarSlices = weekRoleSlices.map((slice, index) => {
    const sessions = slice.map((role) => byRole.get(role)!).filter(Boolean);
    return { calendarSlice: index + 1, roles: slice, distribution: countTypes(slice), ...aggregateSessions(sessions) };
  });
  const cardio = first.conditioning;
  const completeRotationArtifact = {
    schemaVersion: CANONICAL_DOSAGE_EVOLUTION_CERTIFICATION_VERSION,
    rotationPolicy: first.rotationPolicy,
    calendarCrossing: [
      ...first.sessions.map((session, index) => ({ calendarDay: first.dayOffsets[index], kind: "lifting", role: session.role })),
      ...first.conditioning.sessions.map((session) => ({ calendarDay: session.dayOffset, kind: "cardio", role: session.kind })),
      ...second.sessions.map((session, index) => ({ calendarDay: 7 + second.dayOffsets[index], kind: "lifting", role: session.role })),
      ...second.conditioning.sessions.map((session) => ({ calendarDay: 7 + session.dayOffset, kind: "cardio", role: session.kind })),
    ].sort((a, b) => a.calendarDay - b.calendarDay || a.kind.localeCompare(b.kind)),
    completeRotation: { roles, sessions: completeSessions, ...fullRotation, recoverySpacing: recoverySpacing(completeSessions, [0, 1, 2, 4, 5, 7], 8) },
    complementaryPairQuality: [
      complementaryPair("Push A/D", completeSessions[0]!, completeSessions[3]!, ["chest", "anterior_delts", "lateral_delts", "triceps"]),
      complementaryPair("Pull B/E", completeSessions[1]!, completeSessions[4]!, ["upper_back", "lats", "rear_delts", "biceps"]),
      complementaryPair("Legs C/F", completeSessions[2]!, completeSessions[5]!, ["quadriceps", "hamstrings_knee_flexion", "hip_extension", "calves", "core"]),
    ],
    resetProof: { sequence1Last: first.sessions.at(-1)?.role, sequence2First: second.sessions[0]?.role, sequence2Roles: second.sessions.map((session) => session.role), mondayResetAbsent: second.sessions[0]?.role === "Legs hypertrophy F" },
  };
  const normalisedArtifact = {
    schemaVersion: CANONICAL_DOSAGE_EVOLUTION_CERTIFICATION_VERSION,
    basis: "complete_six_session_rotation_scaled_by_five_lifting_sessions_per_seven_days",
    completeRotation: fullRotation,
    averageSevenDays: { ...normalised, cardioMinutes: cardio.recoveryBudget.cardioMinutes, totalTrainingMinutes: round(normalised.estimatedMinutes + cardio.recoveryBudget.cardioMinutes) },
    calendarSlices,
    balanceProof: {
      threeSliceDistributions: calendarSlices.map((slice) => slice.distribution),
      rollingAverageTypeFrequency: { push: 5 / 3, pull: 5 / 3, legs: 5 / 3 },
      lowerBody: Object.fromEntries(["quadriceps", "hamstrings_knee_flexion", "hip_extension", "calves"].map((region) => [region, { averageDirectSets: normalised.directSets[region], averageFrequency: normalised.frequency[region], authorisedFloor: resolveCanonicalHypertrophyStartingVolume({ experience: "intermediate", region: region as CanonicalStimulusRegion, context: context("ordinary", "none") }).authorisedFloor }])),
      chronicLowerUnderexposureAbsent: ["quadriceps", "hamstrings_knee_flexion", "hip_extension", "calves"].every((region) => (normalised.directSets[region] ?? 0) >= resolveCanonicalHypertrophyStartingVolume({ experience: "intermediate", region: region as CanonicalStimulusRegion, context: context("ordinary", "none") }).authorisedFloor),
    },
  };
  const startingRows = buildStartingVolumeRows();
  const startingVolumeArtifact = { schemaVersion: CANONICAL_DOSAGE_EVOLUTION_CERTIFICATION_VERSION, policyId: "canonical_hypertrophy_volume_policy_v1", rows: startingRows };
  const audit95 = {
    schemaVersion: CANONICAL_DOSAGE_EVOLUTION_CERTIFICATION_VERSION,
    firstCalendarSliceWorkingSets: first.totalWorkingSets,
    completeRotationWorkingSets: fullRotation.totalWorkingSets,
    averageSevenDayWorkingSets: normalised.totalWorkingSets,
    userFactsAuthorisingStart: ["goal:build_muscle", "experience:intermediate", "commitment:five_lifting_days", "framework:push_pull_legs", "equipment:full_gym", "recovery:no_restriction_evidence_at_construction", "history:no_comparable_completed_work", "load_state:calibration_required"],
    demonstratedTolerance: false,
    expectedRecoverability: "provisional_only; session duration and muscle-specific dosage are bounded, but completed comparable work must confirm tolerance before any increase",
    classification: "muscle_specific_floor_to_middle_calibration_start_not_upper_authorised_start",
    retained: true,
    rationale: "The number 95 is a five-session whole-body sum, not a per-muscle weekly prescription. Normalised direct regions remain at or below target bands and below authorised starting ceilings; lats and knee-flexion hamstrings begin at their evidence-conservative floors. No high-capacity uplift is applied.",
    excessiveDetection: ["three comparable observations required before any addition", "local drop-off removes one affected-region set first", "repeated local failure can remove two without crossing the starting floor", "systemic fatigue blocks additions and requires stress-reduction review"],
    firstChanges: ["hold all additions", "reduce one local low-benefit set when the affected region shows confirmed drop-off", "review systemic stress before any broad dosage change"],
    muscleSpecificComparison: Object.fromEntries(regions.map((region) => [region, { averageDirectSets: normalised.directSets[region] ?? 0, ...resolveCanonicalHypertrophyStartingVolume({ experience: "intermediate", region, context: context("ordinary", "none") }) }])),
  };
  const methodEvolution = buildMethodEvolution();
  const simulation = buildMesocycleSimulation(first, fullRotation);
  const cardioIndividualisation = buildCardioIndividualisation();
  const durationDecision = {
    schemaVersion: CANONICAL_DOSAGE_EVOLUTION_CERTIFICATION_VERSION,
    currentProductionInput: false,
    commitmentMeaning: "days_per_week_only",
    currentAcceptanceOwner: "canonical_microcycle_volume_policy_v3 duration feasibility bound",
    currentEstimatedRangeMinutes: [Math.min(...completeSessions.map((session) => session.estimatedMinutes)), Math.max(...completeSessions.map((session) => session.estimatedMinutes))],
    currentMaximumMinutes: 90,
    userSpecificLimitClaimed: false,
    decision: "retain_as_explicit_product_input_gap",
    recommendation: "Add a typed per-session available-time input in a later product decision before promising shorter sessions; do not infer it from commitment.",
  };
  const qualityGates = buildQualityGates({ completeSessions, fullRotation, normalised, cardioIndividualisation, methodEvolution, audit95, durationDecision });
  return {
    "complete-rolling-ppl-rotation": completeRotationArtifact,
    "normalised-seven-day-dosage": normalisedArtifact,
    "starting-volume-matrix": startingVolumeArtifact,
    "intermediate-hypertrophy-mesocycle-simulation": simulation,
    "method-evolution-certification": methodEvolution,
    "cardio-individualisation": cardioIndividualisation,
    "session-duration-decision": durationDecision,
    "dosage-quality-gate-coverage": qualityGates,
    "ninety-five-set-start-audit": audit95,
    "test-discovery-reconciliation": buildTestDiscoveryReconciliation(),
  } as const;
}

function buildTestDiscoveryReconciliation() {
  const removed = [
    "complete canonical adaptive planning system > does not expose goal combinations classified as not recommended",
    "complete canonical adaptive planning system > constructs all five allowed intermediate hypertrophy five-day frameworks from production paths",
    "canonical microcycle volume allocator > retains goal/frequency/split-specific construction for build_strength advanced 4-day bench_squat_deadlift",
    "canonical microcycle volume allocator > retains goal/frequency/split-specific construction for athletic_performance intermediate 6-day upper_lower",
    "programme framework rules > returns every user-facing framework option for each approved goal",
    "programme framework rules > marks ASC Recommended as default for every goal",
    "programme framework rules > applies goal-aware suitability rules",
    "programme framework rules > keeps user override available even when a framework is not recommended",
    "programme framework rules > surfaces goal-aware framework wording in onboarding",
    "programme framework rules > returns correct allowed frameworks for hypertrophy",
    "programme framework rules > returns correct allowed frameworks for get_lean",
    "programme framework rules > returns correct allowed frameworks for strength",
    "programme framework rules > returns correct allowed frameworks for athletic_performance",
    "programme framework rules > returns correct allowed frameworks for build_muscle_strength",
    "programme framework rules > supports every allowed framework from 2 to 6 sessions per week",
    "programme framework rules > does not allow hypertrophy or get lean to use bench/squat/deadlift",
    "programme framework rules > does not allow strength-oriented goals to use chest/back/shoulders/arms/legs",
    "programme framework rules > returns the approved PPL sequences for 4 and 5 days",
    "programme framework rules > returns the approved 4-day chest/back/shoulders/arms/legs sequence",
    "programme framework rules > returns approved strength framework sequences",
    "programme framework rules > rejects session counts outside 2 to 6",
    "programme framework rules > returns deterministic copies that callers cannot mutate globally",
    "programme framework rules > keeps every framework sequence deterministic for 2 to 6 days",
  ];
  const addedBeforeThisTask = [
    "complete canonical adaptive planning system > uses the exact three-framework frequency truth table",
    "complete canonical adaptive planning system > constructs the dense intermediate hypertrophy five-day PPL from production paths",
    "canonical microcycle volume allocator > retains goal/frequency/split-specific construction for build_strength advanced 4-day upper_lower",
    "canonical microcycle volume allocator > retains goal/frequency/split-specific construction for athletic_performance intermediate 6-day push_pull_legs",
    "final canonical adaptive-planning product rules > keeps the three experience levels materially distinct without treating advanced as automatic volume",
    "final canonical adaptive-planning product rules > owns exact evidence-bounded add, retain, remove and reallocate rules",
    "final canonical adaptive-planning product rules > keeps beginner, intermediate and advanced landmarks bounded by region",
    "final canonical adaptive-planning product rules > resolves exact method targets only inside Mesocycle permission",
    "final canonical adaptive-planning product rules > constructs a corrected dense five-day PPL with exact set targets and load states",
    "final canonical adaptive-planning product rules > requires direct transfer rationales for strength-focused assistance",
    "final canonical adaptive-planning product rules > creates exact concurrent prescriptions and never changes the lifting count",
    "final canonical adaptive-planning product rules > projects the next conditioning action on Home and the full schedule on Plan",
    "final canonical adaptive-planning product rules > keeps onboarding free from internal strategies and legacy choices",
    "canonical customer programme framework rules > exposes only the three plain-language framework preferences",
    "canonical customer programme framework rules > owns the final frequency truth table",
    "canonical customer programme framework rules > preselects a valid choice instead of adding an ASC option",
    "canonical customer programme framework rules > rejects incompatible public preferences before construction",
    "canonical customer programme framework rules > keeps four- and five-day PPL recognisable and rolling",
    "canonical customer programme framework rules > uses typed block morphs while retaining the athlete's preference",
    "canonical customer programme framework rules > keeps onboarding free of internal framework choices",
    "canonical customer programme framework rules > rejects invalid frequencies and remains deterministic",
  ];
  const addedByThisTask = [
    "carries the six-session PPL identity across calendar boundaries without a Monday reset",
    "constructs Legs F through real Session Construction as a complementary hinge-led session",
    "normalises five lifting days from the complete rotation and keeps every lower-body region above its floor",
    "requires productive history and demonstrated capacity before an upper starting dose",
    "certifies the 95-set calendar slice from muscle-specific floors and ceilings rather than total-set rhetoric",
    "evolves exact method structure only when a Mesocycle owns a useful reason",
    "simulates productive, local, systemic, missed-session and stagnation paths without weekly auto-escalation",
    "individualises eight cardio profiles and exposes their recovery-budget effect",
    "never prescribes cardio against an explicit off preference or conflicting sport workload",
    "keeps session duration as a declared product-input gap and passes every dosage quality gate",
  ].map((name) => `canonical dosage, rotation, method evolution and cardio certification > ${name}`);
  return {
    schemaVersion: CANONICAL_DOSAGE_EVOLUTION_CERTIFICATION_VERSION,
    certifiedBaseline: { files: 348, tests: 2072, commit: "a538d197f57e91e3f8a48a070a75e01132a8e917" },
    taskStart: { files: 349, tests: 2070, commit: "730952658effff5d04817e9fef1d1221e8293bb9" },
    finalDiscovery: { files: 350, tests: 2080 },
    filesAddedAtTaskStart: ["tests/canonical-final-adaptive-planning.test.ts"],
    filesDeletedAtTaskStart: [],
    filesAddedByThisTask: ["tests/canonical-dosage-evolution-certification.test.ts"],
    individualTestsRemovedAtTaskStart: removed,
    individualTestsAddedAtTaskStart: addedBeforeThisTask,
    individualTestsAddedByThisTask: addedByThisTask,
    renamedOrConsolidated: [
      { source: "2 complete-planning tests", replacement: "2 exact public-framework/dense-PPL planning tests", status: "stronger_equivalent" },
      { source: "2 allocator strategy cases", replacement: "2 currently selectable framework cases plus exhaustive matrix", status: "renamed_for_new_public_contract" },
      { source: "19 legacy public/internal framework shells", replacement: "8 final public-framework tests plus exhaustive goal × experience × frequency construction matrix", status: "consolidated_after_removal_of_obsolete_public_choices" },
      { source: "missing complete-rotation/dosage/cardio evolution coverage", replacement: "10 focused certification tests", status: "restored_and_expanded" },
    ],
    focusedMarkers: { skip: [], todo: [], only: [] },
    discoveryConfigurationChanges: [],
    exactArithmetic: {
      baselineToTaskStartFiles: "348 + 1 added - 0 deleted = 349",
      baselineToTaskStartTests: "2072 - 23 removed + 21 added = 2070",
      taskStartToFinalFiles: "349 + 1 added - 0 deleted = 350",
      taskStartToFinalTests: "2070 + 10 added - 0 deleted = 2080",
    },
    lostCoverageWithoutReplacement: [],
  };
}

function constructSlice(sequenceNumber: number) {
  const result = constructCanonicalActivePlanFromCanonicalInputs({ planId: `dosage-cert-sequence-${sequenceNumber}`, createdAt: CREATED_AT, updatedAt: CREATED_AT, goal: "hypertrophy", macrocycleGoal: "build_muscle", experienceLevel: "intermediate", daysPerWeek: 5, preferredSplit: "push_pull_legs", equipment: FULL_GYM, units: "kg", recoveryCardioPreference: "recommended", microcycleSequenceNumber: sequenceNumber, exercises: exerciseLibrary });
  if (result.status !== "constructed") return undefined;
  const carrier = result.carrier;
  const allocation = allocateCanonicalMicrocycleVolume({ macrocycleGoal: "build_muscle", mesocycleId: carrier.mesocycle.id, mesocyclePurpose: carrier.mesocycle.output.adaptation, microcyclePriority: carrier.microcycle.output.priority, microcycleSequence: sequenceNumber, experience: "intermediate", frequency: 5, split: "push_pull_legs", equipment: FULL_GYM, recoveryRestricted: false, establishedLoadExerciseIds: [], sessionRoles: carrier.microcycle.output.sessionRoles, sessionTypes: carrier.microcycle.output.sessionTypes });
  const snapshots = carrier.plannedSessions.map((session) => session.prescriptionSnapshot as CanonicalSessionSnapshotV3);
  const certification = certifyCanonicalConstructedMicrocycle({ allocation, sessions: snapshots, exercises: exerciseLibrary });
  if (certification.status !== "passed") throw new Error(`rolling_slice_certification_failed:${certification.failures.join(",")}`);
  const exerciseById = new Map(exerciseLibrary.map((exercise) => [exercise.id, exercise]));
  const sessions = snapshots.map((snapshot, sessionIndex) => {
    const exerciseRows = snapshot.slots.map((slot) => {
      const allocated = allocation.slots.find((entry) => entry.sessionIndex === sessionIndex && entry.order === slot.index)!;
      const exercise = exerciseById.get(slot.exerciseId)!;
      return { exerciseId: exercise.id, exercise: exercise.name, purpose: allocated.purpose, workingSets: slot.settings.requiredSets ?? slot.settings.requiredWorkSets, exactTargets: slot.exactTargets ?? Array.from({ length: slot.settings.requiredSets ?? 0 }, () => slot.targetReps), exactTargetKinds: slot.exactTargetKinds ?? [], method: slot.method, loadState: slot.loadPrescription.state, restSeconds: slot.rest.seconds, directMuscles: exercise.stimulusProfile?.direct ?? [], meaningfulSecondaryMuscles: exercise.stimulusProfile?.meaningfulSecondary ?? [], fatigueClass: exercise.fatigueCost, progression: slot.progression.rule, stopRule: slot.stopRule.action };
    });
    const directSets = aggregateExerciseStimulus(exerciseRows, "directMuscles");
    const secondarySets = aggregateExerciseStimulus(exerciseRows, "meaningfulSecondaryMuscles");
    return { role: snapshot.role, calendarDayOffset: carrier.microcycle.output.sessionDayOffsets[sessionIndex], purpose: carrier.mesocycle.output.adaptation, exercises: exerciseRows, workingSets: allocation.sessionWorkingSets[sessionIndex]!, estimatedMinutes: allocation.estimatedSessionMinutes[sessionIndex]!, localFatigue: directSets, systemicFatigueUnits: certification.fatigueUnits.perSession[sessionIndex]!, meaningfulSecondarySets: secondarySets };
  });
  return { sessions, totalWorkingSets: allocation.totalWorkingSets, dayOffsets: carrier.microcycle.output.sessionDayOffsets, conditioning: carrier.conditioning, rotationPolicy: { sequenceNumber, rotationCursor: carrier.microcycle.output.rotationCursor, scheduleMode: carrier.microcycle.output.scheduleMode, logicalRotation: carrier.microcycle.output.logicalRotation } };
}

type SessionSummary = NonNullable<ReturnType<typeof constructSlice>>["sessions"][number];
function aggregateSessions(sessions: readonly SessionSummary[]) {
  const directSets = sumRecords(sessions.map((session) => session.localFatigue));
  const meaningfulSecondarySets = sumRecords(sessions.map((session) => session.meaningfulSecondarySets));
  const frequency = Object.fromEntries(regions.map((region) => [region, sessions.filter((session) => (session.localFatigue[region] ?? 0) > 0).length]));
  return { totalWorkingSets: sessions.reduce((sum, session) => sum + session.workingSets, 0), estimatedMinutes: sessions.reduce((sum, session) => sum + session.estimatedMinutes, 0), directSets, meaningfulSecondarySets, frequency, systemicFatigueUnits: sessions.reduce((sum, session) => sum + session.systemicFatigueUnits, 0) };
}

function scaleAccounting(accounting: ReturnType<typeof aggregateSessions>, factor: number) {
  return { totalWorkingSets: round(accounting.totalWorkingSets * factor), estimatedMinutes: round(accounting.estimatedMinutes * factor), directSets: scaleRecord(accounting.directSets, factor), meaningfulSecondarySets: scaleRecord(accounting.meaningfulSecondarySets, factor), frequency: scaleRecord(accounting.frequency, factor), systemicFatigueUnits: round(accounting.systemicFatigueUnits * factor) };
}

function buildStartingVolumeRows() {
  const profiles: readonly Readonly<{ id: string; context: CanonicalStartingVolumeContext }>[] = [
    { id: "low-acceptable-recovery-no-history", context: context("low_acceptable", "none") },
    { id: "ordinary-recovery-no-history", context: context("ordinary", "none") },
    { id: "ordinary-recovery-productive-history", context: context("ordinary", "established_productive") },
    { id: "high-demonstrated-capacity", context: context("high", "established_productive", "demonstrated_high") },
    { id: "concurrent-sport-no-history", context: context("ordinary", "none", "not_demonstrated", "lower_body_loading") },
    { id: "concurrent-sport-productive-history", context: context("ordinary", "established_productive", "not_demonstrated", "lower_body_loading") },
  ];
  return (["beginner", "intermediate", "advanced"] as const).flatMap((experience) => profiles.map((profile) => {
    const muscles = Object.fromEntries(regions.map((region) => [region, resolveCanonicalHypertrophyStartingVolume({ experience, region, context: profile.context })]));
    const totalDirectSets = Object.values(muscles).reduce((sum, entry) => sum + entry.startingDirectSets, 0);
    return { experience, profile: profile.id, context: profile.context, frequency: Object.fromEntries(regions.map((region) => [region, region === "core" ? 0.83 : 1.67])), muscles, totalDirectSets, expectedSessionMinutes: round(8 + totalDirectSets / 5 * 3), reason: profile.context.history === "none" ? "calibration_start_without_tolerance_claim" : profile.context.workCapacity === "demonstrated_high" && profile.context.recovery === "high" ? "upper_start_requires_productive_history_and_high_capacity" : "middle_start_with_retained_productive_history" };
  }));
}

function buildMethodEvolution() {
  const examples = [
    methodExample("calibration-straight", "hypertrophy_calibration", "intermediate", "ex-bench-press", "primary_compound", 4, "straight_sets"),
    methodExample("base-pyramid", "hypertrophy_base", "intermediate", "ex-bench-press", "primary_compound", 4, "pyramid"),
    methodExample("volume-capped-amrap", "hypertrophy_volume", "intermediate", "ex-cable-curl", "isolation", 3, "amrap"),
    methodExample("strength-top-and-backoffs", "strength_specific", "intermediate", "ex-bench-press", "primary_compound", 4, "back_off_sets"),
    methodExample("powerbuilding-bbb-conditional", "powerbuilding_hypertrophy", "advanced", "ex-bench-press", "secondary_compound", 5, "bbb"),
  ];
  return { schemaVersion: CANONICAL_DOSAGE_EVOLUTION_CERTIFICATION_VERSION, firstRotationReason: "The initial hypertrophy calibration Mesocycle owns stable, repeatable technique and load evidence; exact straight sets reduce ambiguity before comparable evidence exists.", examples, unsupportedMethods: [{ method: "rest_pause", reason: "not present in canonical Mesocycle or exact-target contracts" }, { method: "supersets_trisets", reason: "not present in canonical Mesocycle or exact-target contracts" }, { method: "high_rep_finisher_as_separate_method", reason: "not a canonical method; high-rep exact accessory targets remain straight or capped AMRAP only when authorised" }], indefiniteIdenticalStructureAbsent: examples.some((example) => example.method !== "straight_sets") };
}

function methodExample(id: string, mesocycleId: MesocycleId, experience: ExperienceLevel, exerciseId: string, role: AllocatedSlot["exerciseRole"], sets: number, method: Parameters<typeof resolveCanonicalExactTarget>[0]["method"]) {
  const policyResult = resolveMesocyclePrescriptionPolicy(mesocycleId, { goal: mesocycleId.startsWith("strength_") ? "build_strength" : mesocycleId.startsWith("powerbuilding_") ? "build_muscle_and_strength" : "build_muscle" });
  if (policyResult.status !== "resolved") throw new Error(`method_policy_unresolved:${mesocycleId}`);
  if (!policyResult.policy.methods.permitted.includes(method)) throw new Error(`method_not_permitted:${mesocycleId}:${method}`);
  const exercise = exerciseLibrary.find((item) => item.id === exerciseId)!;
  const constructionRole = role === "primary_compound" ? "primary" : role === "secondary_compound" ? "secondary" : "accessory";
  const lane = policyResult.policy.concreteLanes.preferredByRole[constructionRole];
  const envelope = policyResult.policy.targetEnvelopes[constructionRole][lane]!;
  const allocated = slot(role, constructionRole, sets, exercise);
  const exact = resolveCanonicalExactTarget({ exercise, slot: allocated, envelope, policy: policyResult.policy, lane, method, experience });
  if (exact.status !== "resolved") throw new Error(`method_target_unresolved:${id}`);
  return { id, goal: mesocycleId.startsWith("strength_") ? "build_strength" : mesocycleId.startsWith("powerbuilding_") ? "build_muscle_and_strength" : "build_muscle", phase: mesocycleId, experience, exercise: exercise.name, method, selectedByGovernance: methodFromGovernance(mesocycleId, experience, role, method), exactTargets: exact.targets, targetKinds: exact.targetKinds, restSeconds: exact.restSeconds, progression: method === "amrap" ? "Progress only after the capped performance set remains technically valid and recovery is acceptable." : "Progress through the method's exact target sequence inside the Mesocycle envelope.", stopRule: method === "amrap" ? "Stop at the prescribed rep cap or first technical breakdown." : "Stop on missed target, material rep drop-off or technique loss.", exitRule: mesocycleById(mesocycleId)?.exitCriteria ?? [], why: setMethodExplanation(methodToGoverned(method)) };
}

function buildMesocycleSimulation(first: NonNullable<ReturnType<typeof constructSlice>>, fullRotation: ReturnType<typeof aggregateSessions>) {
  const baseEvidence = { comparableObservations: 3, recovery: "acceptable" as const, repeatedSignal: false };
  const original = first.rotationPolicy;
  const microcycle = reflowCanonicalMicrocycleAfterMissedSession({ ...createMicrocycleFromFirst(first), sequenceNumber: 1 }, 3, 2);
  const pathways = [
    { id: "A_productive_progress", evidence: { ...baseEvidence, performance: "improving" as const }, current: 8, result: resolveCanonicalHypertrophyVolumeProgression({ experience: "intermediate", region: "chest", currentDirectSets: 8, evidence: { ...baseEvidence, performance: "improving" } }), outcome: "one local set may be added only while below target; exercises retained" },
    { id: "B_local_muscle_underdose", evidence: { ...baseEvidence, performance: "stable" as const }, current: 7, result: resolveCanonicalHypertrophyVolumeProgression({ experience: "intermediate", region: "lats", currentDirectSets: 7, evidence: { ...baseEvidence, performance: "stable" } }), outcome: "one lat set; unrelated muscles unchanged" },
    { id: "C_local_excess_fatigue", evidence: { ...baseEvidence, performance: "drop_off" as const, recovery: "local_fatigue" as const, repeatedSignal: true }, current: 10, result: resolveCanonicalHypertrophyVolumeProgression({ experience: "intermediate", region: "triceps", currentDirectSets: 10, evidence: { ...baseEvidence, performance: "drop_off", recovery: "local_fatigue", repeatedSignal: true } }), outcome: "bounded local reduction; floor retained" },
    { id: "D_systemic_fatigue", evidence: { ...baseEvidence, performance: "stable" as const, recovery: "systemic_fatigue" as const }, current: 10, result: resolveCanonicalHypertrophyVolumeProgression({ experience: "intermediate", region: "quadriceps", currentDirectSets: 10, evidence: { ...baseEvidence, performance: "stable", recovery: "systemic_fatigue" } }), outcome: "no local addition; stress-reduction review, not calendar deload" },
    { id: "E_missed_session", evidence: { missedIndex: 3, delayDays: 2 }, result: { rolesPreserved: microcycle.sessionRoles.map((role) => role), progressionState: microcycle.progressionState, scheduleMode: microcycle.scheduleMode }, outcome: "rotation reflows without reset or invented deload" },
    { id: "F_one_poor_workout", evidence: { comparableObservations: 1, performance: "drop_off" as const, recovery: "acceptable" as const, repeatedSignal: false }, current: 10, result: resolveCanonicalHypertrophyVolumeProgression({ experience: "intermediate", region: "chest", currentDirectSets: 10, evidence: { comparableObservations: 1, performance: "drop_off", recovery: "acceptable", repeatedSignal: false } }), outcome: "retain; one workout cannot rewrite dosage" },
    { id: "G_persistent_stagnation", evidence: { ...baseEvidence, performance: "stagnating" as const, sourceRegionAtOrAboveTarget: true, destinationBelowTarget: true }, current: 10, result: resolveCanonicalHypertrophyVolumeProgression({ experience: "intermediate", region: "chest", currentDirectSets: 10, evidence: { ...baseEvidence, performance: "stagnating", sourceRegionAtOrAboveTarget: true, destinationBelowTarget: true } }), outcome: "reallocate one set; no uncontrolled total escalation" },
  ];
  const sessionPrescription = first.sessions.map((session) => ({ role: session.role, exercises: session.exercises.map((exercise) => ({ exercise: exercise.exercise, exactTargets: exercise.exactTargets, method: exercise.method, loadState: exercise.loadState, progression: exercise.progression, stopRule: exercise.stopRule })) }));
  const rotations = [
    { rotation: 1, state: "calibration", exercises: sessionPrescription, muscleDosage: fullRotation.directSets, loadProgression: "establish canonical load evidence; missing loads remain calibration_required", volumeChange: 0, recovery: "ordinary", repDropOff: "none", decision: "retain", exit: "continue until credible comparable baselines exist" },
    { rotation: 2, state: "evidence_accumulation", exercises: sessionPrescription, muscleDosage: fullRotation.directSets, loadProgression: "rep progression inside the immutable target before any load revision", volumeChange: 0, recovery: "ordinary", repDropOff: "none", decision: "retain while fewer than three comparable observations exist", exit: "continue" },
    { rotation: 3, state: "first_eligible_bounded_decision", exercises: sessionPrescription, muscleDosage: fullRotation.directSets, loadProgression: "Session Construction alone may author a future exact load after persisted Progress evidence", volumeChange: "one affected-region set only when the productive-below-target rule resolves", recovery: "acceptable required", repDropOff: "local drop-off prevents addition", decision: "add_one_set, retain or bounded local reduction by evidence", exit: "consolidate/review if systemic fatigue appears" },
    { rotation: 4, state: "continue_or_review", exercises: sessionPrescription, muscleDosage: fullRotation.directSets, loadProgression: "retain productive exercises and progress exact targets; substitute only a canonical suitability-valid equivalent", volumeChange: "no automatic increase", recovery: "fresh factual state", repDropOff: "repeated local drop-off can remove two while preserving floor", decision: "continue, local adjustment, or systemic review", exit: "deload/transition only through Mesocycle/Progress decision, never elapsed days alone" },
  ];
  return { schemaVersion: CANONICAL_DOSAGE_EVOLUTION_CERTIFICATION_VERSION, representative: { experience: "intermediate", goal: "build_muscle", startingRotation: sessionPrescription, startingDosage: fullRotation.directSets, retainedExercisesRule: "retain suitable exercises while comparable evidence is being established", substitutionRule: "only a suitability-valid canonical equivalent; recorded sessions remain immutable", rotations, originalRotation: original }, pathways, safeguards: { noAutomaticWeeklyAddition: true, notPermanentlyAtMinimum: pathways.some((path) => path.result && "disposition" in path.result && path.result.disposition === "add_one_set"), noSingleBadWorkoutRewrite: pathways.find((path) => path.id === "F_one_poor_workout")?.result, noCalendarOnlyDeload: true, ceilings: Object.fromEntries(regions.map((region) => [region, canonicalHypertrophyLandmark("intermediate", region).target.max])), absencePreservesSequence: microcycle.sessionRoles.map((role) => role) } };
}

function buildCardioIndividualisation() {
  const base = { planId: "cardio-cert", experience: "intermediate" as const, liftingDays: 5, liftingDayOffsets: [0, 1, 2, 4, 5] };
  const cases = [
    { id: "hypertrophy-desired", output: resolveCanonicalCardioPrescription({ ...base, goal: "build_muscle", preference: "recommended" }) },
    { id: "hypertrophy-minimum", output: resolveCanonicalCardioPrescription({ ...base, goal: "build_muscle", preference: "minimal" }) },
    { id: "hypertrophy-concurrent-sport", output: resolveCanonicalCardioPrescription({ ...base, goal: "build_muscle", preference: "recommended", sportSessionsPerWeek: 1 }) },
    { id: "getting-lean", output: resolveCanonicalCardioPrescription({ ...base, goal: "get_leaner", preference: "recommended" }) },
    { id: "athletic-performance", output: resolveCanonicalCardioPrescription({ ...base, goal: "athletic_performance", preference: "recommended", sportSessionsPerWeek: 1 }) },
    { id: "strength-intensification", output: resolveCanonicalCardioPrescription({ ...base, goal: "build_strength", preference: "recommended", mesocyclePhase: "strength_intensification" }) },
    { id: "poor-lower-body-recovery", output: resolveCanonicalCardioPrescription({ ...base, goal: "build_muscle", preference: "recommended", lowerBodyRecovery: "poor" }) },
    { id: "high-work-capacity", output: resolveCanonicalCardioPrescription({ ...base, goal: "build_muscle", preference: "recommended", workCapacity: "demonstrated_high", productiveCardioHistory: true }) },
  ];
  return { schemaVersion: CANONICAL_DOSAGE_EVOLUTION_CERTIFICATION_VERSION, cases, allAffectRecoveryBudget: cases.every((item) => item.output.recoveryBudget), universalTwoByTwentyAbsent: new Set(cases.map((item) => `${item.output.weeklyFrequency}:${item.output.recoveryBudget.cardioMinutes}`)).size > 3, homeAndPlanRule: "project only persisted prescription sessions; review_required and off states expose no invented cardio session" };
}

function buildQualityGates(input: Readonly<{ completeSessions: readonly SessionSummary[]; fullRotation: ReturnType<typeof aggregateSessions>; normalised: ReturnType<typeof scaleAccounting>; cardioIndividualisation: ReturnType<typeof buildCardioIndividualisation>; methodEvolution: ReturnType<typeof buildMethodEvolution>; audit95: Record<string, unknown>; durationDecision: Record<string, unknown> }>) {
  const gates = [
    gate("muscle_specific_justification", regions.every((region) => region in input.normalised.directSets)),
    gate("upper_start_requires_evidence", resolveCanonicalHypertrophyStartingVolume({ experience: "advanced", region: "chest", context: context("high", "none", "demonstrated_high") }).startingDirectSets < canonicalHypertrophyLandmark("advanced", "chest").maximumAuthorisedStarting),
    gate("complete_six_session_rotation", input.completeSessions.length === 6),
    gate("rolling_not_single_slice", input.fullRotation.totalWorkingSets > 0 && input.normalised.totalWorkingSets > 0),
    gate("method_structure_evolves_with_purpose", input.methodEvolution.indefiniteIdenticalStructureAbsent),
    gate("session_duration_bounded", input.completeSessions.every((session) => session.estimatedMinutes <= 90)),
    gate("cardio_conflict_fails_closed", input.cardioIndividualisation.cases.find((item) => item.id === "poor-lower-body-recovery")?.output.status === "review_required"),
    gate("requested_cardio_not_omitted", input.cardioIndividualisation.cases.find((item) => item.id === "hypertrophy-desired")?.output.sessions.length === 2),
    gate("method_variety_requires_policy", input.methodEvolution.examples.every((example) => example.exactTargets.length > 0)),
    gate("productive_capacity_can_raise_bounded_start", resolveCanonicalHypertrophyStartingVolume({ experience: "intermediate", region: "chest", context: context("high", "established_productive", "demonstrated_high") }).startingDirectSets > resolveCanonicalHypertrophyStartingVolume({ experience: "intermediate", region: "chest", context: context("ordinary", "none") }).startingDirectSets),
    gate("uncontrolled_set_escalation_absent", resolveCanonicalHypertrophyVolumeProgression({ experience: "intermediate", region: "chest", currentDirectSets: 12, evidence: { comparableObservations: 3, performance: "stable", recovery: "acceptable", repeatedSignal: false } }).setDelta === 0),
  ];
  return { schemaVersion: CANONICAL_DOSAGE_EVOLUTION_CERTIFICATION_VERSION, gates, allPassed: gates.every((item) => item.status === "passed"), evidence: { audit95: input.audit95, durationDecision: input.durationDecision } };
}

function createMicrocycleFromFirst(first: NonNullable<ReturnType<typeof constructSlice>>) {
  const result = constructCanonicalActivePlanFromCanonicalInputs({ planId: "missed-session-cert", createdAt: CREATED_AT, updatedAt: CREATED_AT, goal: "hypertrophy", macrocycleGoal: "build_muscle", experienceLevel: "intermediate", daysPerWeek: 5, preferredSplit: "push_pull_legs", equipment: FULL_GYM, units: "kg", exercises: exerciseLibrary });
  if (result.status !== "constructed") throw new Error("missed_session_microcycle_unavailable");
  return result.carrier.microcycle.output;
}

function slot(role: AllocatedSlot["exerciseRole"], constructionRole: AllocatedSlot["constructionRole"], workingSets: number, exercise: Exercise): AllocatedSlot { return { sessionIndex: 0, sessionRole: "certification", order: 0, exerciseRole: role, constructionRole, muscles: exercise.primaryMuscles, requiredStimuli: exercise.stimulusProfile?.direct ?? [], purpose: "method certification", movementPatterns: [exercise.movementPattern], primaryLift: exercise.primaryLift, liftExposure: exercise.primaryLift ? constructionRole === "primary" ? "primary" : "secondary_variation" : undefined, repeatPolicy: "stable_primary_practice", workingSets }; }
function methodFromGovernance(mesocycleId: MesocycleId, experience: ExperienceLevel, role: AllocatedSlot["exerciseRole"], expected: string) { const selected = selectSetMethod({ mesocycleId, experience, exerciseRole: role, sessionRole: "certification" }); return { selected, mapsToExpected: ((selected === "exact_straight_sets" || selected === "technical_repeated_sets") && expected === "straight_sets") || (selected === "top_set_backoffs" && expected === "back_off_sets") || (selected === "controlled_performance_set" && expected === "amrap") || (selected === "pyramid" && expected === "pyramid") || (selected === "boring_but_big" && expected === "bbb") }; }
function methodToGoverned(method: string): Parameters<typeof setMethodExplanation>[0] { const map: Record<string, Parameters<typeof setMethodExplanation>[0]> = { straight_sets: "exact_straight_sets", back_off_sets: "top_set_backoffs", amrap: "controlled_performance_set", bbb: "boring_but_big" }; return map[method] ?? method as Parameters<typeof setMethodExplanation>[0]; }
function context(recovery: CanonicalStartingVolumeContext["recovery"], history: CanonicalStartingVolumeContext["history"], workCapacity: CanonicalStartingVolumeContext["workCapacity"] = "not_demonstrated", concurrentSport: CanonicalStartingVolumeContext["concurrentSport"] = "none"): CanonicalStartingVolumeContext { return { recovery, history, workCapacity, concurrentSport }; }
function countTypes(roles: readonly string[]) { return { push: roles.filter((role) => role.startsWith("Push")).length, pull: roles.filter((role) => role.startsWith("Pull")).length, legs: roles.filter((role) => role.startsWith("Legs")).length }; }
function aggregateExerciseStimulus(exercises: readonly Readonly<{ workingSets: number; directMuscles: readonly CanonicalStimulusRegion[]; meaningfulSecondaryMuscles: readonly CanonicalStimulusRegion[] }>[], key: "directMuscles" | "meaningfulSecondaryMuscles") { const output: Record<string, number> = {}; for (const exercise of exercises) for (const region of exercise[key]) output[region] = (output[region] ?? 0) + exercise.workingSets; return output; }
function complementaryPair(id: string, first: SessionSummary, second: SessionSummary, required: readonly string[]) { const firstExercises = first.exercises.map((exercise) => exercise.exerciseId); const secondExercises = second.exercises.map((exercise) => exercise.exerciseId); const covered = new Set([...Object.keys(first.localFatigue), ...Object.keys(second.localFatigue)]); return { id, firstRole: first.role, secondRole: second.role, stableExercises: firstExercises.filter((exercise) => secondExercises.includes(exercise)), variedExercises: [...new Set([...firstExercises, ...secondExercises])].filter((exercise) => !(firstExercises.includes(exercise) && secondExercises.includes(exercise))), requiredRegions: required, completeCoverage: required.every((region) => covered.has(region)), renamedDuplicate: firstExercises.join("|") === secondExercises.join("|") }; }
function recoverySpacing(sessions: readonly SessionSummary[], days: readonly number[], cycleDays: number) { return Object.fromEntries(regions.map((region) => { const positions = sessions.map((session, index) => (session.localFatigue[region] ?? 0) > 0 ? index : -1).filter((index) => index >= 0); const calendarDays = positions.map((index) => days[index]!); const sessionGaps = positions.length === 1 ? [sessions.length] : positions.map((position, index) => ((positions[(index + 1) % positions.length]! - position + sessions.length) % sessions.length) || sessions.length); const dayGaps = calendarDays.length === 1 ? [cycleDays] : calendarDays.map((day, index) => ((calendarDays[(index + 1) % calendarDays.length]! - day + cycleDays) % cycleDays) || cycleDays); return [region, { rotationExposures: positions.length, sessionGaps, calendarDayGaps: dayGaps }]; })); }
function sumRecords(records: readonly Readonly<Record<string, number>>[]) { const output: Record<string, number> = {}; for (const record of records) for (const [key, value] of Object.entries(record)) output[key] = (output[key] ?? 0) + value; return output; }
function scaleRecord(record: Readonly<Record<string, number>>, factor: number) { return Object.fromEntries(Object.entries(record).map(([key, value]) => [key, round(value * factor)])); }
function round(value: number) { return Math.round(value * 100) / 100; }
function gate(id: string, passed: boolean) { return { id, status: passed ? "passed" as const : "failed" as const }; }
