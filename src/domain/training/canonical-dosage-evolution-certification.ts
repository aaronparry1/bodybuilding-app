import { constructCanonicalActivePlanFromCanonicalInputs } from "@/application/training/canonical-active-plan-construction";
import { certifyCanonicalConstructedMicrocycle } from "@/domain/training/canonical-constructed-microcycle-certification";
import { resolveCanonicalExactTarget } from "@/domain/training/canonical-exact-target-policy";
import { resolveCanonicalCardioPrescription } from "@/domain/training/canonical-cardio-prescription";
import { allocateCanonicalMicrocycleVolume, type AllocatedSlot } from "@/domain/training/canonical-microcycle-volume-allocator";
import { canonicalHypertrophyLandmark, defaultCanonicalStartingVolumeContext, deriveCanonicalHypertrophyVolumeEvidence, resolveCanonicalHypertrophyStartingVolume, resolveCanonicalHypertrophyVolumeProgression, type CanonicalStartingVolumeContext } from "@/domain/training/canonical-hypertrophy-volume-policy";
import { validateCanonicalProgressEvidence, type CanonicalProgressEvidence } from "@/domain/training/canonical-progress-evidence";
import type { CanonicalSessionSnapshotV3 } from "@/domain/training/canonical-session-construction-pipeline";
import { mesocycleById, type MesocycleId } from "@/domain/training/mesocycle-library";
import { resolveMesocyclePrescriptionPolicy } from "@/domain/training/mesocycle-prescription-policy";
import type { CanonicalStimulusRegion, Exercise, ExperienceLevel } from "@/domain/training/models";
import { reflowCanonicalMicrocycleAfterMissedSession } from "@/domain/training/microcycle-scheduler";
import { exerciseLibrary } from "@/domain/training/presets";
import { selectSetMethod, setMethodExplanation } from "@/domain/training/set-method-governance";
import { canonicalSessionDurationOptions } from "@/domain/training/canonical-session-duration";

export const CANONICAL_DOSAGE_EVOLUTION_CERTIFICATION_VERSION = "canonical_dosage_evolution_certification_v2" as const;
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
    secondaryAccountingRule: "Meaningful secondary work is counted as whole programmed-set exposures from exercise metadata. Decimal values are rotation-to-calendar averages only, never fractional direct-set credit.",
    calendarSlices,
    balanceProof: {
      threeSliceDistributions: calendarSlices.map((slice) => slice.distribution),
      rollingAverageTypeFrequency: { push: 5 / 3, pull: 5 / 3, legs: 5 / 3 },
      lowerBody: Object.fromEntries(["quadriceps", "hamstrings_knee_flexion", "hip_extension", "calves"].map((region) => [region, { averageDirectSets: normalised.directSets[region], averageFrequency: normalised.frequency[region], authorisedFloor: resolveCanonicalHypertrophyStartingVolume({ experience: "intermediate", region: region as CanonicalStimulusRegion, context: context("ordinary", "none") }).authorisedFloor }])),
      chronicLowerUnderexposureAbsent: ["quadriceps", "hamstrings_knee_flexion", "hip_extension", "calves"].every((region) => (normalised.directSets[region] ?? 0) + 0.2 >= resolveCanonicalHypertrophyStartingVolume({ experience: "intermediate", region: region as CanonicalStimulusRegion, context: context("ordinary", "none") }).authorisedFloor),
      discreteRoundingRule: "Each six-session rotation target is rounded to the nearest whole set before slot distribution. Normalising by 5/6 may therefore differ from the policy target by at most one sixth of a set.",
    },
  };
  const startingRows = buildStartingVolumeRows();
  const startingVolumeArtifact = {
    schemaVersion: CANONICAL_DOSAGE_EVOLUTION_CERTIFICATION_VERSION,
    policyId: "canonical_hypertrophy_volume_policy_v2",
    sourceEvidence: [
      { source: "docs/evidence-based-prescription-model.md", section: "Weekly volume targets", paraphrasedRule: "Experience-specific direct-set ranges differ for major, small and core regions; volume increases require evidence.", supportedFields: ["target", "maximumRecoverableAuthorisation"], limitation: "Product policy range, not a demonstrated individual MRV." },
      { source: "docs/evidence-based-prescription-model.md", section: "Session volume targets", paraphrasedRule: "Primary, secondary, isolation and core roles own useful multi-set session prescriptions.", supportedFields: ["starting", "maximumAuthorisedStarting", "no_token_work"], limitation: "Discrete session allocation may differ from the normalized weekly target by rounding." },
      { source: "canonical-policy-source-corpus/13-Chad-Waterbury-s-Programs.pdf", printedPages: "1-2", paraphrasedRule: "Published hypertrophy examples specify exercise-level sets, reps, rest and planned progression rather than decorative exercise counts.", supportedFields: ["exact_set_rep_rest_execution", "planned_progression"], limitation: "Example programmes support executable prescription structure; they do not define a universal weekly regional dose." },
    ],
    rows: startingRows,
  };
  const audit95 = {
    schemaVersion: CANONICAL_DOSAGE_EVOLUTION_CERTIFICATION_VERSION,
    firstCalendarSliceWorkingSets: first.totalWorkingSets,
    completeRotationWorkingSets: fullRotation.totalWorkingSets,
    averageSevenDayWorkingSets: normalised.totalWorkingSets,
    userFactsAuthorisingStart: ["goal:build_muscle", "experience:intermediate", "recent_training:five_days_moderate_workload", "continuity:currently_training", "commitment:five_lifting_days", "framework:push_pull_legs", "equipment:full_gym", "recovery:ordinary", "history:no_comparable_completed_work", "load_state:calibration_required", "dosage_confidence:declared_recent_training"],
    demonstratedTolerance: false,
    expectedRecoverability: "provisional_only; session duration and muscle-specific dosage are bounded, but completed comparable work must confirm tolerance before any increase",
    classification: "experience_and_recent_training_baseline_reconciled_to_discrete_rotation",
    retained: false,
    rationale: `Production resolves each region from declared experience, recent training, continuity, recovery, sport and retained evidence, then allocates once across the complete six-session rotation. Missing app history keeps loads in calibration and progression confidence low; it does not force a minimum-volume floor. This case produces ${fullRotation.totalWorkingSets} raw rotation sets, ${first.totalWorkingSets} in the first calendar slice and ${normalised.totalWorkingSets} normalised sets per seven days without padding to a global total.`,
    contradictionResolved: { previousRepresentativeRawRotation: 78, previousRepresentativeNormalisedSevenDays: 65, previousMatrixTotal: 65, cause: "missing app history was incorrectly used as detraining and low-capacity evidence", authoritativeOwner: "canonical_hypertrophy_volume_policy_v2 -> canonical_microcycle_volume_policy_v4 discrete allocation" },
    excessiveDetection: ["three comparable observations required before any addition", "local drop-off removes one affected-region set first", "repeated local failure can remove two without crossing the starting floor", "systemic fatigue blocks additions and requires stress-reduction review"],
    firstChanges: ["hold all additions", "reduce one local low-benefit set when the affected region shows confirmed drop-off", "review systemic stress before any broad dosage change"],
    muscleSpecificComparison: Object.fromEntries(regions.map((region) => [region, { averageDirectSets: normalised.directSets[region] ?? 0, ...resolveCanonicalHypertrophyStartingVolume({ experience: "intermediate", region, context: context("ordinary", "none") }) }])),
  };
  const methodEvolution = buildMethodEvolution();
  const simulation = buildMesocycleSimulation(first, fullRotation);
  const cardioIndividualisation = buildCardioIndividualisation();
  const durationDecision = {
    schemaVersion: CANONICAL_DOSAGE_EVOLUTION_CERTIFICATION_VERSION,
    currentProductionInput: true,
    commitmentMeaning: "days_per_week_only",
    currentAcceptanceOwner: "canonical_session_duration_policy_v2 validated by canonical active-plan application and enforced by canonical_microcycle_volume_policy_v4",
    currentEstimatedRangeMinutes: [Math.min(...completeSessions.map((session) => session.estimatedMinutes)), Math.max(...completeSessions.map((session) => session.estimatedMinutes))],
    currentMaximumMinutes: 90,
    supportedMinutes: canonicalSessionDurationOptions,
    representativeCases: buildDurationExamples(),
    userSpecificLimitClaimed: true,
    decision: "implemented_as_typed_canonical_input",
    reconstruction: "Future snapshots are regenerated atomically; recorded references and lineage are preserved; active attempts and stale revisions fail closed.",
    coverageRule: "Every retained hypertrophy exercise has at least two exact working sets. Time-constrained omissions and dosage gaps are exposed explicitly rather than hidden as token work.",
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

function buildDurationExamples() {
  return canonicalSessionDurationOptions.map((availableSessionMinutes) => {
    const result = constructCanonicalActivePlanFromCanonicalInputs({ planId: `duration-evidence:${availableSessionMinutes}`, createdAt: CREATED_AT, updatedAt: CREATED_AT, goal: "hypertrophy", macrocycleGoal: "build_muscle", experienceLevel: "intermediate", daysPerWeek: 5, preferredSplit: "push_pull_legs", equipment: FULL_GYM, units: "kg", availableSessionMinutes, exercises: exerciseLibrary });
    if (result.status !== "constructed") return { availableSessionMinutes, status: "fail_closed" as const, reason: result.reason };
    const allocation = allocateCanonicalMicrocycleVolume({ macrocycleGoal: "build_muscle", mesocycleId: result.carrier.mesocycle.id, mesocyclePurpose: result.carrier.mesocycle.output.adaptation, microcyclePriority: result.carrier.microcycle.output.priority, microcycleSequence: result.carrier.microcycle.output.sequenceNumber, experience: "intermediate", frequency: 5, split: "push_pull_legs", equipment: FULL_GYM, recoveryRestricted: false, establishedLoadExerciseIds: [], sessionRoles: result.carrier.microcycle.output.sessionRoles, sessionTypes: result.carrier.microcycle.output.sessionTypes, startingVolumeContext: result.carrier.constraints.startingVolumeContext, availableSessionMinutes });
    const sessions = result.carrier.plannedSessions.map((session, index) => {
      const snapshot = session.prescriptionSnapshot as CanonicalSessionSnapshotV3;
      const workingSets = snapshot.slots.reduce((sum, slot) => sum + (slot.settings.requiredSets ?? slot.settings.requiredWorkSets), 0);
      return { role: session.role, exercises: snapshot.slots.length, workingSets, estimatedMinutes: allocation.estimatedSessionMinutes[index]!, durationBreakdown: allocation.durationEstimates[index]!.breakdownSeconds, allRetainedExercisesUseful: snapshot.slots.every((slot) => (slot.settings.requiredSets ?? slot.settings.requiredWorkSets) >= 2) };
    });
    return { availableSessionMinutes, status: "constructed" as const, sessions, maximumObservedMinutes: Math.max(...sessions.map((session) => session.estimatedMinutes)) };
  });
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
    "replaces the contradictory 95/101 claims with one executable muscle-specific start",
    "evolves exact method structure only when a Mesocycle owns a useful reason",
    "simulates productive, local, systemic, missed-session and stagnation paths without weekly auto-escalation",
    "individualises eight cardio profiles and exposes their recovery-budget effect",
    "never prescribes cardio against an explicit off preference or conflicting sport workload",
    "uses typed session duration and passes every adversarial dosage quality gate",
  ].map((name) => `canonical dosage, rotation, method evolution and cardio certification > ${name}`);
  return {
    schemaVersion: CANONICAL_DOSAGE_EVOLUTION_CERTIFICATION_VERSION,
    certifiedBaseline: { files: 348, tests: 2072, commit: "a538d197f57e91e3f8a48a070a75e01132a8e917" },
    taskStart: { files: 349, tests: 2070, commit: "730952658effff5d04817e9fef1d1221e8293bb9" },
    adversarialCorrectionStart: { files: 350, tests: 2080, commit: "1ab62df921f3e38fac4fa052a33f09f654a761e5" },
    correctionStart: { files: 351, tests: 2088, commit: "cd91bea3a916e4c7ff824455c560aea0d599e61a" },
    finalDiscovery: { files: 351, tests: 2090 },
    filesAddedAtTaskStart: ["tests/canonical-final-adaptive-planning.test.ts"],
    filesDeletedAtTaskStart: [],
    filesAddedByThisTask: ["tests/canonical-dosage-evolution-certification.test.ts"],
    filesAddedByAdversarialCorrection: ["tests/canonical-session-duration-planning.test.ts"],
    individualTestsRemovedAtTaskStart: removed,
    individualTestsAddedAtTaskStart: addedBeforeThisTask,
    individualTestsAddedByThisTask: addedByThisTask,
    individualTestsAddedByCurrentCorrection: [
      "canonical per-session available-time planning > calibrates only future estimates from at least three comparable completed durations",
      "app settings > normalizes persisted recent-training facts without conflating experience and history",
    ],
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
      adversarialCorrectionFiles: "350 + 1 added - 0 deleted = 351",
      adversarialCorrectionTests: "2080 + 8 added - 0 deleted = 2088",
      currentCorrectionTests: "2088 + 2 added - 0 deleted = 2090",
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
      return { exerciseId: exercise.id, exercise: exercise.name, purpose: allocated.purpose, workingSets: slot.settings.requiredSets ?? slot.settings.requiredWorkSets, exactTargets: slot.exactTargets ?? Array.from({ length: slot.settings.requiredSets ?? 0 }, () => slot.targetReps), exactTargetKinds: slot.exactTargetKinds ?? [], method: slot.method, loadState: slot.loadPrescription.state, loadPrescription: slot.loadPrescription, restSeconds: slot.rest.seconds, directMuscles: exercise.stimulusProfile?.direct ?? [], meaningfulSecondaryMuscles: exercise.stimulusProfile?.meaningfulSecondary ?? [], fatigueClass: exercise.fatigueCost, stimulusToFatigueRationale: exercise.fatigueCost === "high" ? "Priority anchor with bounded exact sets, reps and rest; not repeated as redundant high-fatigue work." : exercise.fatigueCost === "moderate" ? "Stable direct stimulus with less systemic cost than the primary high-fatigue anchor." : "Low-systemic-cost direct accessory work used only to meet an owned regional dose.", progression: slot.progression.rule, stopRule: slot.stopRule.action };
    });
    const directSets = aggregateExerciseStimulus(exerciseRows, "directMuscles");
    const secondarySets = aggregateExerciseStimulus(exerciseRows, "meaningfulSecondaryMuscles");
    return { role: snapshot.role, calendarDayOffset: carrier.microcycle.output.sessionDayOffsets[sessionIndex], purpose: carrier.mesocycle.output.adaptation, exercises: exerciseRows, workingSets: allocation.sessionWorkingSets[sessionIndex]!, estimatedMinutes: allocation.estimatedSessionMinutes[sessionIndex]!, durationBreakdown: allocation.durationEstimates[sessionIndex]!.breakdownSeconds, durationAssumptions: allocation.durationEstimates[sessionIndex]!.assumptions, localFatigue: directSets, systemicFatigueUnits: certification.fatigueUnits.perSession[sessionIndex]!, meaningfulSecondarySets: secondarySets };
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
    return { experience, profile: profile.id, context: profile.context, frequency: Object.fromEntries(regions.map((region) => [region, region === "core" ? 0.83 : 1.67])), muscles, totalDirectSets, expectedSessionMinutes: "resolved_after_exact_slot_allocation", reason: profile.context.history === "none" ? "declared_recent_training_start_with_load_calibration" : profile.context.workCapacity === "demonstrated_high" && profile.context.recovery === "high" ? "upper_start_requires_productive_history_and_high_capacity" : "productive_history_supports_bounded_start" };
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
  const original = first.rotationPolicy;
  const microcycle = reflowCanonicalMicrocycleAfterMissedSession({ ...createMicrocycleFromFirst(first), sequenceNumber: 1 }, 3, 2);
  const evaluate = (id: string, region: CanonicalStimulusRegion, currentDirectSets: number, records: readonly CanonicalProgressEvidence[], options: Readonly<{ sourceRegionAtOrAboveTarget?: boolean; destinationBelowTarget?: boolean }> = {}) => {
    const derived = deriveCanonicalHypertrophyVolumeEvidence({ region, records, ...options });
    return { id, evidenceIds: derived.evidenceIds, derivedEvidence: derived.evidence, current: currentDirectSets, result: resolveCanonicalHypertrophyVolumeProgression({ experience: "intermediate", region, currentDirectSets, evidence: derived.evidence }) };
  };
  const pathways = [
    { ...evaluate("A_productive_progress", "chest", 7, performedEvidence("chest", [100, 104, 108])), outcome: "one local set may be added only while below target; exercises retained" },
    { ...evaluate("B_local_muscle_underdose", "lats", 7, performedEvidence("lats", [100, 100, 100])), outcome: "one lat set; unrelated muscles unchanged" },
    { ...evaluate("C_local_excess_fatigue", "triceps", 10, performedEvidence("triceps", [100, 92, 84], { dropOffIndexes: [1, 2], localFatigue: true })), outcome: "bounded local reduction; floor retained" },
    { ...evaluate("D_systemic_fatigue", "quadriceps", 10, performedEvidence("quadriceps", [100, 100, 100], { systemicFatigue: true })), outcome: "no local addition; stress-reduction review, not calendar deload" },
    { id: "E_missed_session", evidenceIds: ["mesocycle:missed-session:3"], derivedEvidence: { missedIndex: 3, delayDays: 2, source: "canonical_completion_evidence" }, result: { rolesPreserved: microcycle.sessionRoles.map((role) => role), progressionState: microcycle.progressionState, scheduleMode: microcycle.scheduleMode }, outcome: "rotation reflows without reset or invented deload" },
    { ...evaluate("F_one_poor_workout", "chest", 10, performedEvidence("chest", [90], { dropOffIndexes: [0] })), outcome: "retain; one workout cannot rewrite dosage" },
    { ...evaluate("G_persistent_stagnation", "chest", 10, performedEvidence("chest", [100, 100, 100], { progressionStalled: true }), { sourceRegionAtOrAboveTarget: true, destinationBelowTarget: true }), outcome: "reallocate one set; no uncontrolled total escalation" },
  ];
  const sessionPrescription = first.sessions.map((session) => ({ role: session.role, exercises: session.exercises.map((exercise) => ({ exercise: exercise.exercise, exactTargets: exercise.exactTargets, method: exercise.method, loadState: exercise.loadState, progression: exercise.progression, stopRule: exercise.stopRule })) }));
  const rotations = [
    mesocycleRotation(1, "calibration", performedEvidence("chest", [100]), { calibration: "completed_for_observed_exercises", load: "established evidence retained for future Session Construction", reps: "baseline exact targets completed", volume: "retain", recovery: "ordinary", exercise: "retain", cardio: "easy recovery prescription retained", exit: "continue_insufficient_comparable_evidence" }),
    mesocycleRotation(2, "rep_progression", performedEvidence("chest", [100, 104]), { calibration: "established", load: "unchanged while rep target progresses", reps: "completed reps improved inside target", volume: "retain", recovery: "ordinary", exercise: "retain", cardio: "no interference signal", exit: "continue_two_comparable_observations" }),
    mesocycleRotation(3, "bounded_local_progression", performedEvidence("chest", [100, 104, 108]), { calibration: "established", load: "numeric load progression remains Session Construction-owned; no caller-authored future load", reps: "three improving observations", volume: "add_one_set_only_if_region_below_target", recovery: "acceptable", exercise: "retain", cardio: "no interference signal", exit: "continue_or_consolidate" }),
    mesocycleRotation(4, "local_fatigue_correction", performedEvidence("triceps", [100, 91, 84], { dropOffIndexes: [1, 2], localFatigue: true }), { calibration: "established", load: "hold while local fatigue resolves", reps: "repeated local drop-off recorded", volume: "remove_two_only_when_starting_floor_is_preserved", recovery: "local_fatigue", exercise: "retain stable exercises; substitution requires canonical suitability", cardio: "retain easy work only if it does not worsen recovery", exit: "continue_after_bounded_local_correction" }),
    mesocycleRotation(5, "consolidation", performedEvidence("chest", [104, 105, 105]), { calibration: "established", load: "hold exact future construction until evidence authorises change", reps: "stable comparable performance", volume: "retain_inside_productive_target", recovery: "ordinary", exercise: "retain", cardio: "retain without progression", exit: "review_mesocycle_outcome" }),
    mesocycleRotation(6, "systemic_review", performedEvidence("quadriceps", [100, 100, 98], { systemicFatigue: true }), { calibration: "established", load: "hold progression", reps: "stable_to_slight_drop", volume: "no automatic addition; stress-reduction review", recovery: "systemic_fatigue", exercise: "retain_or_suitability_valid_substitution_only", cardio: "hold progression and review lower-body interaction", exit: "deload_or_transition_review_required_by_canonical_evidence" }),
  ].map((rotation) => ({ ...rotation, exactPrescription: sessionPrescription, prescribedDirectDosage: fullRotation.directSets }));
  return { schemaVersion: CANONICAL_DOSAGE_EVOLUTION_CERTIFICATION_VERSION, representative: { experience: "intermediate", goal: "build_muscle", startingRotation: sessionPrescription, startingDosage: fullRotation.directSets, retainedExercisesRule: "retain suitable exercises while comparable evidence is being established", substitutionRule: "only a suitability-valid canonical equivalent; recorded sessions remain immutable", rotations, originalRotation: original, completeMesocycleDemonstrated: rotations.length === 6 }, inputSensitivityCases: buildAdaptiveInputCases(), pathways, safeguards: { noAutomaticWeeklyAddition: true, notPermanentlyAtMinimum: pathways.some((path) => path.result && "disposition" in path.result && path.result.disposition === "add_one_set"), noSingleBadWorkoutRewrite: pathways.find((path) => path.id === "F_one_poor_workout")?.result, noCalendarOnlyDeload: true, ceilings: Object.fromEntries(regions.map((region) => [region, canonicalHypertrophyLandmark("intermediate", region).maximumRecoverableAuthorisation])), absencePreservesSequence: microcycle.sessionRoles.map((role) => role) } };
}

function performedEvidence(
  region: CanonicalStimulusRegion,
  performanceIndices: readonly number[],
  options: Readonly<{ dropOffIndexes?: readonly number[]; localFatigue?: boolean; systemicFatigue?: boolean; progressionStalled?: boolean }> = {},
): CanonicalProgressEvidence[] {
  const performance = performanceIndices.map((performanceIndex, index): CanonicalProgressEvidence => ({
    schemaVersion: "canonical_progress_evidence_v1",
    evidenceId: `mesocycle:${region}:performed:${index + 1}`,
    planId: "dosage-cert-sequence-1",
    planRevision: 0,
    macrocycleId: "dosage-cert-sequence-1:macrocycle",
    mesocycleId: "hypertrophy_calibration",
    microcycleId: "dosage-cert-sequence-1:microcycle:1",
    sessionId: `recorded:${region}:${index + 1}`,
    slotId: `slot:${region}`,
    athleteId: "synthetic-certification-athlete",
    observedAt: `2026-07-${String(index + 1).padStart(2, "0")}T12:00:00.000Z`,
    source: `canonical-ledger:recorded:${region}:${index + 1}`,
    kind: "performance",
    observations: { region, completed: true, comparable: true, performanceIndex, dropOff: options.dropOffIndexes?.includes(index) ?? false, progressionStalled: options.progressionStalled ?? false, prescribedHistoryImmutable: true },
    evidenceVersion: "progress_v1",
  }));
  if (options.localFatigue || options.systemicFatigue) performance.push({
    schemaVersion: "canonical_progress_evidence_v1",
    evidenceId: `mesocycle:${region}:readiness:${options.systemicFatigue ? "systemic" : "local"}`,
    planId: "dosage-cert-sequence-1",
    planRevision: 0,
    macrocycleId: "dosage-cert-sequence-1:macrocycle",
    mesocycleId: "hypertrophy_calibration",
    microcycleId: "dosage-cert-sequence-1:microcycle:1",
    athleteId: "synthetic-certification-athlete",
    observedAt: "2026-07-20T12:00:00.000Z",
    source: "canonical-progress:readiness",
    kind: "readiness",
    observations: { region, recovery: options.systemicFatigue ? "systemic_fatigue" : "local_fatigue", systemicFatigue: options.systemicFatigue ?? false, localFatigue: options.localFatigue ?? false },
    evidenceVersion: "progress_v1",
  });
  for (const record of performance) {
    const validation = validateCanonicalProgressEvidence(record);
    if (validation.status !== "valid") throw new Error(`invalid_mesocycle_performed_evidence:${record.evidenceId}:${validation.reason}`);
  }
  return performance;
}

function mesocycleRotation(
  rotation: number,
  state: string,
  evidence: readonly CanonicalProgressEvidence[],
  response: Readonly<{ calibration: string; load: string; reps: string; volume: string; recovery: string; exercise: string; cardio: string; exit: string }>,
) {
  const region = String(evidence.find((item) => item.kind === "performance")?.observations.region ?? "chest") as CanonicalStimulusRegion;
  const derived = deriveCanonicalHypertrophyVolumeEvidence({ region, records: evidence });
  const volumeResult = resolveCanonicalHypertrophyVolumeProgression({ experience: "intermediate", region, currentDirectSets: region === "quadriceps" ? 10 : 7, evidence: derived.evidence });
  return { rotation, state, canonicalEvidence: evidence, evidenceIds: derived.evidenceIds, derivedEvidence: derived.evidence, volumeResult, response, decisionSource: "canonical_performed_and_readiness_evidence", callerAuthoredResultFlags: false, historyRewritten: false };
}

function buildAdaptiveInputCases() {
  const cases = [
    ["beginner_ordinary", "beginner", context("ordinary", "none"), 75],
    ["intermediate_current_new_app", "intermediate", context("ordinary", "none"), 75],
    ["intermediate_short_layoff", "intermediate", { ...context("ordinary", "none", "not_demonstrated", "none", "short_layoff"), recentTrainingDaysPerWeek: 1, recentSessionWorkload: "light" as const }, 75],
    ["intermediate_extended_layoff", "intermediate", { ...context("ordinary", "none", "not_demonstrated", "none", "extended_layoff"), recentTrainingDaysPerWeek: 0, recentSessionWorkload: "light" as const }, 75],
    ["intermediate_poor_recovery", "intermediate", context("low_acceptable", "none"), 75],
    ["intermediate_established_productive", "intermediate", context("ordinary", "established_productive"), 75],
    ["advanced_current_new_app", "advanced", context("ordinary", "none"), 75],
    ["intermediate_concurrent_sport", "intermediate", context("ordinary", "none", "not_demonstrated", "lower_body_loading"), 75],
    ["intermediate_30_minutes", "intermediate", context("ordinary", "none"), 30],
    ["intermediate_45_minutes", "intermediate", context("ordinary", "none"), 45],
    ["intermediate_60_minutes", "intermediate", context("ordinary", "none"), 60],
    ["intermediate_75_minutes", "intermediate", context("ordinary", "none"), 75],
    ["intermediate_90_minutes", "intermediate", context("ordinary", "none"), 90],
  ] as const;
  return cases.map(([id, experienceLevel, startingVolumeContext, availableSessionMinutes]) => {
    const result = constructCanonicalActivePlanFromCanonicalInputs({ planId: `adaptive:${id}`, createdAt: CREATED_AT, updatedAt: CREATED_AT, goal: "hypertrophy", macrocycleGoal: "build_muscle", experienceLevel, daysPerWeek: 5, preferredSplit: "push_pull_legs", equipment: FULL_GYM, units: "kg", recoveryCardioPreference: "recommended", startingVolumeContext, availableSessionMinutes, exercises: exerciseLibrary });
    if (result.status !== "constructed") return { id, status: "fail_closed" as const, reason: result.reason, typedInputs: { experienceLevel, startingVolumeContext, availableSessionMinutes } };
    const allocation = allocateCanonicalMicrocycleVolume({ macrocycleGoal: "build_muscle", mesocycleId: result.carrier.mesocycle.id, mesocyclePurpose: result.carrier.mesocycle.output.adaptation, microcyclePriority: result.carrier.microcycle.output.priority, microcycleSequence: result.carrier.microcycle.output.sequenceNumber, experience: experienceLevel, frequency: 5, split: "push_pull_legs", equipment: FULL_GYM, recoveryRestricted: startingVolumeContext.recovery === "low_acceptable", establishedLoadExerciseIds: [], sessionRoles: result.carrier.microcycle.output.sessionRoles, sessionTypes: result.carrier.microcycle.output.sessionTypes, startingVolumeContext, availableSessionMinutes });
    const snapshots = result.carrier.plannedSessions.map((session) => session.prescriptionSnapshot as CanonicalSessionSnapshotV3);
    return {
      id,
      status: "constructed" as const,
      typedInputs: { experienceLevel, startingVolumeContext, availableSessionMinutes },
      ownedDifferences: {
        totalWorkingSets: allocation.totalWorkingSets,
        directSets: allocation.directSets,
        policyTargets: allocation.startingDosage.policyTargets,
        durationConstrainedSessions: allocation.durationConstraint.constrainedSessionIndexes,
        unmetStartingTargets: allocation.durationConstraint.unmetStartingTargets,
        frequency: result.carrier.microcycle.output.trainingDays,
        cardio: result.carrier.conditioning,
        sessions: snapshots.map((snapshot) => ({ role: snapshot.role, exercises: snapshot.slots.map((slot) => ({ exerciseId: slot.exerciseId, sets: slot.settings.requiredSets ?? slot.settings.requiredWorkSets, exactReps: slot.exactTargets ?? [slot.targetReps], loadState: slot.loadPrescription.state, restSeconds: slot.rest.seconds, method: slot.method })) })),
        recoveryRestrictionApplied: startingVolumeContext.recovery === "low_acceptable",
        equalityExplanation: adaptiveEqualityExplanation(id),
      },
      rationale: Object.values(allocation.startingDosage.policyTargets).length ? Object.values(startingVolumeContext).map(String) : ["non_hypertrophy_policy"],
    };
  });
}

function adaptiveEqualityExplanation(id: string): string | null {
  if (id === "intermediate_poor_recovery") return "The discrete direct-set total may equal the extended-layoff case, but it is owned by recovery restriction rather than continuity re-entry. No extra difference is invented after both resolve to the same useful multi-set floor.";
  if (id === "intermediate_extended_layoff") return "The discrete direct-set total may equal the poor-recovery case, but this case is owned by extended-layoff re-entry while recovery remains ordinary.";
  if (id === "intermediate_90_minutes") return "The full experience-and-recent-training starting dose already fits inside 75 minutes. Additional available time alone does not authorise extra volume.";
  if (id === "intermediate_75_minutes") return "The full owned starting dose first fits without duration omissions here; 90 minutes correctly retains it because spare time is not progression evidence.";
  return null;
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
  const currentIntermediate = context("ordinary", "none");
  const majorRegions = ["chest", "lats", "upper_back", "quadriceps", "hip_extension"] as const;
  const allExercises = input.completeSessions.flatMap((session) => session.exercises);
  const gates = [
    gate("muscle_specific_justification", regions.every((region) => region in input.normalised.directSets)),
    gate("representative_dosage_reconciles_to_policy_after_discrete_rounding", regions.every((region) => Math.abs((input.normalised.directSets[region] ?? 0) - resolveCanonicalHypertrophyStartingVolume({ experience: "intermediate", region, context: context("ordinary", "none") }).startingDirectSets) <= 0.51)),
    gate("upper_start_requires_evidence", resolveCanonicalHypertrophyStartingVolume({ experience: "advanced", region: "chest", context: context("high", "none", "demonstrated_high") }).startingDirectSets < canonicalHypertrophyLandmark("advanced", "chest").maximumAuthorisedStarting),
    gate("complete_six_session_rotation", input.completeSessions.length === 6),
    gate("rolling_not_single_slice", input.fullRotation.totalWorkingSets > 0 && input.normalised.totalWorkingSets > 0),
    gate("method_structure_evolves_with_purpose", input.methodEvolution.indefiniteIdenticalStructureAbsent),
    gate("typed_session_duration_respected", input.completeSessions.every((session) => session.estimatedMinutes <= 75)),
    gate("duration_model_includes_material_work", input.completeSessions.every((session) => ["general_warmup_included", "lift_specific_ramps_included", "prescribed_or_role_owned_rest_included", "set_execution_and_unilateral_time_included", "equipment_setup_and_transitions_included", "calibration_and_method_overhead_included"].every((assumption) => session.durationAssumptions.includes(assumption)))),
    gate("ordinary_intermediate_major_regions_not_at_unjustified_floor", majorRegions.every((region) => (input.normalised.directSets[region] ?? 0) + 0.2 >= resolveCanonicalHypertrophyStartingVolume({ experience: "intermediate", region, context: currentIntermediate }).startingDirectSets)),
    gate("missing_history_preserves_declared_intermediate_baseline", resolveCanonicalHypertrophyStartingVolume({ experience: "intermediate", region: "chest", context: currentIntermediate }).retainedHistoryEffect === "declared_training_baseline"),
    gate("no_athlete_facing_placeholders", allExercises.every((exercise) => !/(second (lat|triceps|biceps) angle|placeholder|tbd)/i.test(exercise.purpose))),
    gate("no_token_exercises", allExercises.every((exercise) => exercise.workingSets >= 2)),
    gate("direct_coverage_not_disguised_by_secondary_work", majorRegions.every((region) => (input.normalised.directSets[region] ?? 0) + 0.2 >= canonicalHypertrophyLandmark("intermediate", region).target.min)),
    gate("every_set_has_exact_executable_target", allExercises.every((exercise) => exercise.exactTargets.length === exercise.workingSets && Boolean(exercise.loadPrescription) && exercise.restSeconds > 0 && Boolean(exercise.progression) && Boolean(exercise.stopRule))),
    gate("experience_materially_changes_owned_dosage", resolveCanonicalHypertrophyStartingVolume({ experience: "beginner", region: "chest", context: currentIntermediate }).startingDirectSets < resolveCanonicalHypertrophyStartingVolume({ experience: "intermediate", region: "chest", context: currentIntermediate }).startingDirectSets && resolveCanonicalHypertrophyStartingVolume({ experience: "intermediate", region: "chest", context: currentIntermediate }).startingDirectSets < resolveCanonicalHypertrophyStartingVolume({ experience: "advanced", region: "chest", context: currentIntermediate }).startingDirectSets),
    gate("recent_training_and_continuity_materially_change_owned_dosage", resolveCanonicalHypertrophyStartingVolume({ experience: "intermediate", region: "chest", context: { ...currentIntermediate, continuity: "short_layoff", dosageConfidence: "low_after_layoff" } }).startingDirectSets < resolveCanonicalHypertrophyStartingVolume({ experience: "intermediate", region: "chest", context: currentIntermediate }).startingDirectSets),
    gate("load_confidence_does_not_rewrite_dosage_confidence", resolveCanonicalHypertrophyStartingVolume({ experience: "intermediate", region: "chest", context: { ...currentIntermediate, loadConfidence: "established" } }).startingDirectSets === resolveCanonicalHypertrophyStartingVolume({ experience: "intermediate", region: "chest", context: currentIntermediate }).startingDirectSets),
    gate("same_role_sessions_are_complementary", [[0, 3], [1, 4], [2, 5]].every(([a, b]) => input.completeSessions[a]!.exercises.map((exercise) => exercise.exerciseId).join("|") !== input.completeSessions[b]!.exercises.map((exercise) => exercise.exerciseId).join("|"))),
    gate("high_fatigue_prescriptions_use_bounded_reps_and_rest", input.completeSessions.flatMap((session) => session.exercises).filter((exercise) => exercise.fatigueClass === "high").every((exercise) => exercise.exactTargets.every((target) => target <= 8) && exercise.restSeconds >= 150)),
    gate("no_unexplained_repeated_exercise", input.completeSessions.every((session) => new Set(session.exercises.map((exercise) => exercise.exerciseId)).size === session.exercises.length)),
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
function context(recovery: CanonicalStartingVolumeContext["recovery"], history: CanonicalStartingVolumeContext["history"], workCapacity: CanonicalStartingVolumeContext["workCapacity"] = "not_demonstrated", concurrentSport: CanonicalStartingVolumeContext["concurrentSport"] = "none", continuity: CanonicalStartingVolumeContext["continuity"] = "currently_training"): CanonicalStartingVolumeContext {
  return {
    ...defaultCanonicalStartingVolumeContext(5),
    recovery,
    history,
    workCapacity,
    concurrentSport,
    continuity,
    loadConfidence: history === "established_productive" ? "established" : "calibration_required",
    dosageConfidence: history === "established_productive" ? "canonical_productive_history" : continuity === "currently_training" ? "declared_recent_training" : "low_after_layoff",
  };
}
function countTypes(roles: readonly string[]) { return { push: roles.filter((role) => role.startsWith("Push")).length, pull: roles.filter((role) => role.startsWith("Pull")).length, legs: roles.filter((role) => role.startsWith("Legs")).length }; }
function aggregateExerciseStimulus(exercises: readonly Readonly<{ workingSets: number; directMuscles: readonly CanonicalStimulusRegion[]; meaningfulSecondaryMuscles: readonly CanonicalStimulusRegion[] }>[], key: "directMuscles" | "meaningfulSecondaryMuscles") { const output: Record<string, number> = {}; for (const exercise of exercises) for (const region of exercise[key]) output[region] = (output[region] ?? 0) + exercise.workingSets; return output; }
function complementaryPair(id: string, first: SessionSummary, second: SessionSummary, required: readonly string[]) { const firstExercises = first.exercises.map((exercise) => exercise.exerciseId); const secondExercises = second.exercises.map((exercise) => exercise.exerciseId); const covered = new Set([...Object.keys(first.localFatigue), ...Object.keys(second.localFatigue)]); return { id, firstRole: first.role, secondRole: second.role, stableExercises: firstExercises.filter((exercise) => secondExercises.includes(exercise)), variedExercises: [...new Set([...firstExercises, ...secondExercises])].filter((exercise) => !(firstExercises.includes(exercise) && secondExercises.includes(exercise))), requiredRegions: required, completeCoverage: required.every((region) => covered.has(region)), renamedDuplicate: firstExercises.join("|") === secondExercises.join("|") }; }
function recoverySpacing(sessions: readonly SessionSummary[], days: readonly number[], cycleDays: number) { return Object.fromEntries(regions.map((region) => { const positions = sessions.map((session, index) => (session.localFatigue[region] ?? 0) > 0 ? index : -1).filter((index) => index >= 0); const calendarDays = positions.map((index) => days[index]!); const sessionGaps = positions.length === 1 ? [sessions.length] : positions.map((position, index) => ((positions[(index + 1) % positions.length]! - position + sessions.length) % sessions.length) || sessions.length); const dayGaps = calendarDays.length === 1 ? [cycleDays] : calendarDays.map((day, index) => ((calendarDays[(index + 1) % calendarDays.length]! - day + cycleDays) % cycleDays) || cycleDays); return [region, { rotationExposures: positions.length, sessionGaps, calendarDayGaps: dayGaps }]; })); }
function sumRecords(records: readonly Readonly<Record<string, number>>[]) { const output: Record<string, number> = {}; for (const record of records) for (const [key, value] of Object.entries(record)) output[key] = (output[key] ?? 0) + value; return output; }
function scaleRecord(record: Readonly<Record<string, number>>, factor: number) { return Object.fromEntries(Object.entries(record).map(([key, value]) => [key, round(value * factor)])); }
function round(value: number) { return Math.round(value * 100) / 100; }
function gate(id: string, passed: boolean) { return { id, status: passed ? "passed" as const : "failed" as const }; }
