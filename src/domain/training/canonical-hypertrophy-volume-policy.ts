import type { CanonicalStimulusRegion, ExperienceLevel } from "@/domain/training/models";
import type { CanonicalProgressEvidence } from "@/domain/training/canonical-progress-evidence";

export const canonicalHypertrophyVolumePolicy = {
  policyId: "canonical_hypertrophy_volume_policy_v2",
  sourceReferences: [
    "docs/evidence-based-prescription-model.md#weekly-volume-targets",
    "docs/evidence-based-prescription-model.md#session-volume-targets",
    "src/domain/training/volume-landmarks.ts#getStartingVolumeLandmarks",
    "canonical-policy-source-corpus/13-Chad-Waterbury-s-Programs.pdf#printed-pages-1-2",
  ],
  accounting: "Direct working sets are counted by explicitly programmed stimulus region. Secondary stimulus is reported separately and never silently promoted to a direct set.",
  limitations: "Population ranges are product-policy authorisations, not a measured personal maximum. Missing app history lowers evidence confidence; only canonical comparable performed work can authorise later changes.",
  progression: {
    add: "Add one direct set to one local stimulus region only after at least three comparable completed observations show productive performance, recovery is acceptable, the region remains below target, and no rep drop-off or technique contraindication is present.",
    retain: "Retain dosage when comparable performance is improving or stable inside the target range, or when evidence is not yet sufficient for a safe change.",
    remove: "Remove one direct set from the affected region after confirmed local rep drop-off or local recovery failure; remove two only when the same fresh signal is repeated and the resulting dose remains above the starting floor.",
    reallocate: "Reallocate one low-benefit accessory set to a lagging region only when systemic recovery is acceptable, the source region is at or above target, the destination is below target, and both regions have comparable evidence.",
    systemic: "Systemic fatigue never triggers an automatic local increase. Hold all additions and require stress-reduction review; deload remains a separate Mesocycle decision.",
  },
} as const;

export type CanonicalHypertrophyVolumeLandmark = Readonly<{
  starting: number;
  target: Readonly<{ min: number; max: number }>;
  maximumAuthorisedStarting: number;
  /** Population-policy ceiling for this region/experience. It is not a claim
   * that an individual athlete has demonstrated a personal MRV. */
  maximumRecoverableAuthorisation: number;
}>;

export type CanonicalHypertrophyVolumeDisposition =
  | "add_one_set"
  | "retain"
  | "remove_one_set"
  | "remove_two_sets"
  | "reallocate_one_set"
  | "review_systemic_fatigue";

export type CanonicalHypertrophyVolumeEvidence = Readonly<{
  comparableObservations: number;
  performance: "improving" | "stable" | "stagnating" | "drop_off" | "conflicting";
  recovery: "acceptable" | "local_fatigue" | "systemic_fatigue";
  repeatedSignal: boolean;
  sourceRegionAtOrAboveTarget?: boolean;
  destinationBelowTarget?: boolean;
}>;

export function deriveCanonicalHypertrophyVolumeEvidence(input: Readonly<{
  region: CanonicalStimulusRegion;
  records: readonly CanonicalProgressEvidence[];
  sourceRegionAtOrAboveTarget?: boolean;
  destinationBelowTarget?: boolean;
}>): Readonly<{ evidenceIds: readonly string[]; evidence: CanonicalHypertrophyVolumeEvidence }> {
  const relevant = input.records.filter((record) => record.kind === "performance" && record.observations.region === input.region && record.observations.completed === true && record.observations.comparable === true).sort((a, b) => a.observedAt.localeCompare(b.observedAt) || a.evidenceId.localeCompare(b.evidenceId));
  const recoveryRecords = input.records.filter((record) => record.kind === "readiness" || record.kind === "pain");
  const systemic = recoveryRecords.some((record) => record.observations.recovery === "systemic_fatigue" || record.observations.systemicFatigue === true);
  const local = recoveryRecords.some((record) => record.observations.region === input.region && (record.observations.recovery === "local_fatigue" || record.observations.localFatigue === true));
  const dropOffCount = relevant.filter((record) => record.observations.dropOff === true).length;
  const indices = relevant.map((record) => Number(record.observations.performanceIndex)).filter(Number.isFinite);
  const conflicting = relevant.some((record) => record.observations.conflicting === true);
  const stalled = relevant.some((record) => record.observations.progressionStalled === true);
  const performance: CanonicalHypertrophyVolumeEvidence["performance"] = conflicting
    ? "conflicting"
    : dropOffCount > 0
      ? "drop_off"
      : stalled
        ? "stagnating"
        : indices.length >= 2 && indices.at(-1)! > indices[0]!
          ? "improving"
          : "stable";
  return {
    evidenceIds: [...new Set([...relevant, ...recoveryRecords].map((record) => record.evidenceId))].sort(),
    evidence: {
      comparableObservations: relevant.length,
      performance,
      recovery: systemic ? "systemic_fatigue" : local ? "local_fatigue" : "acceptable",
      repeatedSignal: dropOffCount >= 2,
      sourceRegionAtOrAboveTarget: input.sourceRegionAtOrAboveTarget,
      destinationBelowTarget: input.destinationBelowTarget,
    },
  };
}

export type CanonicalStartingVolumeContext = Readonly<{
  continuity: "currently_training" | "short_layoff" | "extended_layoff";
  recentTrainingDaysPerWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
  recentSessionWorkload: "light" | "moderate" | "high";
  recentSessionDurationMinutes: 30 | 45 | 60 | 75 | 90;
  recovery: "low_acceptable" | "ordinary" | "high";
  history: "none" | "established_productive";
  workCapacity: "not_demonstrated" | "demonstrated_high";
  concurrentSport: "none" | "lower_body_loading";
  loadConfidence: "calibration_required" | "established";
  dosageConfidence: "declared_recent_training" | "canonical_productive_history" | "low_after_layoff";
}>;

export type CanonicalStartingVolumeResolution = Readonly<{
  policyId: typeof canonicalHypertrophyVolumePolicy.policyId;
  startingDirectSets: number;
  authorisedFloor: number;
  authorisedCeiling: number;
  target: Readonly<{ min: number; max: number }>;
  calibrationRequired: boolean;
  retainedHistoryEffect: "declared_training_baseline" | "layoff_reentry" | "productive_baseline" | "demonstrated_upper_start";
  reasonCodes: readonly string[];
}>;

const smallRegions = new Set<CanonicalStimulusRegion>(["anterior_delts", "lateral_delts", "rear_delts", "triceps", "biceps", "hamstrings_knee_flexion", "calves"]);
const lowerBody = new Set<CanonicalStimulusRegion>(["quadriceps", "hamstrings_knee_flexion", "hip_extension", "calves"]);

const regionBands: Readonly<Record<ExperienceLevel, Readonly<Record<CanonicalStimulusRegion, CanonicalHypertrophyVolumeLandmark>>>> = {
  beginner: regionTable({ starting: 6, target: { min: 5, max: 10 }, maximumAuthorisedStarting: 8, maximumRecoverableAuthorisation: 10 }, { starting: 4, target: { min: 3, max: 8 }, maximumAuthorisedStarting: 6, maximumRecoverableAuthorisation: 8 }, { starting: 1, target: { min: 1, max: 4 }, maximumAuthorisedStarting: 2, maximumRecoverableAuthorisation: 4 }),
  intermediate: regionTable({ starting: 8, target: { min: 8, max: 16 }, maximumAuthorisedStarting: 12, maximumRecoverableAuthorisation: 16 }, { starting: 6, target: { min: 6, max: 14 }, maximumAuthorisedStarting: 10, maximumRecoverableAuthorisation: 14 }, { starting: 2, target: { min: 2, max: 6 }, maximumAuthorisedStarting: 3, maximumRecoverableAuthorisation: 6 }),
  advanced: regionTable({ starting: 10, target: { min: 10, max: 20 }, maximumAuthorisedStarting: 14, maximumRecoverableAuthorisation: 20 }, { starting: 8, target: { min: 8, max: 16 }, maximumAuthorisedStarting: 12, maximumRecoverableAuthorisation: 16 }, { starting: 2, target: { min: 2, max: 8 }, maximumAuthorisedStarting: 4, maximumRecoverableAuthorisation: 8 }),
};

function regionTable(
  major: CanonicalHypertrophyVolumeLandmark,
  small: CanonicalHypertrophyVolumeLandmark,
  core: CanonicalHypertrophyVolumeLandmark,
): Record<CanonicalStimulusRegion, CanonicalHypertrophyVolumeLandmark> {
  return {
    chest: major, lats: major, upper_back: major, quadriceps: major, hip_extension: major,
    anterior_delts: small, lateral_delts: small, rear_delts: small, triceps: small, biceps: small,
    hamstrings_knee_flexion: small, calves: small, core,
  };
}

export function canonicalHypertrophyLandmark(experience: ExperienceLevel, region: CanonicalStimulusRegion): CanonicalHypertrophyVolumeLandmark {
  return regionBands[experience][region];
}

/** Used only when an older caller has no recent-training intake yet. It does
 * not treat missing app history as detraining: the provisional dose comes
 * from declared experience and ordinary recent training, while load remains
 * calibration-required and Progress confidence remains low. */
export function defaultCanonicalStartingVolumeContext(recentTrainingDaysPerWeek: CanonicalStartingVolumeContext["recentTrainingDaysPerWeek"] = 3): CanonicalStartingVolumeContext {
  return {
    continuity: "currently_training",
    recentTrainingDaysPerWeek,
    recentSessionWorkload: "moderate",
    recentSessionDurationMinutes: 60,
    recovery: "ordinary",
    history: "none",
    workCapacity: "not_demonstrated",
    concurrentSport: "none",
    loadConfidence: "calibration_required",
    dosageConfidence: "declared_recent_training",
  };
}

export function isCanonicalStartingVolumeContext(value: unknown): value is CanonicalStartingVolumeContext {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return ["currently_training", "short_layoff", "extended_layoff"].includes(String(candidate.continuity))
    && Number.isInteger(candidate.recentTrainingDaysPerWeek)
    && Number(candidate.recentTrainingDaysPerWeek) >= 0
    && Number(candidate.recentTrainingDaysPerWeek) <= 7
    && ["light", "moderate", "high"].includes(String(candidate.recentSessionWorkload))
    && [30, 45, 60, 75, 90].includes(Number(candidate.recentSessionDurationMinutes))
    && ["low_acceptable", "ordinary", "high"].includes(String(candidate.recovery))
    && ["none", "established_productive"].includes(String(candidate.history))
    && ["not_demonstrated", "demonstrated_high"].includes(String(candidate.workCapacity))
    && ["none", "lower_body_loading"].includes(String(candidate.concurrentSport))
    && ["calibration_required", "established"].includes(String(candidate.loadConfidence))
    && ["declared_recent_training", "canonical_productive_history", "low_after_layoff"].includes(String(candidate.dosageConfidence));
}

/** Persisted settings from before this intake existed are completed from a
 * declared-current provisional baseline. Invalid individual fields are never
 * allowed to become policy inputs. */
export function normalizeCanonicalStartingVolumeContext(value: unknown, fallbackDays: CanonicalStartingVolumeContext["recentTrainingDaysPerWeek"] = 3): CanonicalStartingVolumeContext {
  const fallback = defaultCanonicalStartingVolumeContext(fallbackDays);
  if (!value || typeof value !== "object") return fallback;
  const candidate = value as Partial<Record<keyof CanonicalStartingVolumeContext, unknown>>;
  const normalized = {
    continuity: ["currently_training", "short_layoff", "extended_layoff"].includes(String(candidate.continuity)) ? candidate.continuity : fallback.continuity,
    recentTrainingDaysPerWeek: Number.isInteger(candidate.recentTrainingDaysPerWeek) && Number(candidate.recentTrainingDaysPerWeek) >= 0 && Number(candidate.recentTrainingDaysPerWeek) <= 7 ? candidate.recentTrainingDaysPerWeek : fallback.recentTrainingDaysPerWeek,
    recentSessionWorkload: ["light", "moderate", "high"].includes(String(candidate.recentSessionWorkload)) ? candidate.recentSessionWorkload : fallback.recentSessionWorkload,
    recentSessionDurationMinutes: [30, 45, 60, 75, 90].includes(Number(candidate.recentSessionDurationMinutes)) ? candidate.recentSessionDurationMinutes : fallback.recentSessionDurationMinutes,
    recovery: ["low_acceptable", "ordinary", "high"].includes(String(candidate.recovery)) ? candidate.recovery : fallback.recovery,
    history: ["none", "established_productive"].includes(String(candidate.history)) ? candidate.history : fallback.history,
    workCapacity: ["not_demonstrated", "demonstrated_high"].includes(String(candidate.workCapacity)) ? candidate.workCapacity : fallback.workCapacity,
    concurrentSport: ["none", "lower_body_loading"].includes(String(candidate.concurrentSport)) ? candidate.concurrentSport : fallback.concurrentSport,
    loadConfidence: ["calibration_required", "established"].includes(String(candidate.loadConfidence)) ? candidate.loadConfidence : fallback.loadConfidence,
    dosageConfidence: ["declared_recent_training", "canonical_productive_history", "low_after_layoff"].includes(String(candidate.dosageConfidence)) ? candidate.dosageConfidence : fallback.dosageConfidence,
  };
  return normalized as CanonicalStartingVolumeContext;
}

/** Resolves an initial *muscle-specific* dosage. Experience selects the
 * policy band; only retained productive history plus demonstrated work
 * capacity can authorise the top of that starting band. */
export function resolveCanonicalHypertrophyStartingVolume(input: Readonly<{
  experience: ExperienceLevel;
  region: CanonicalStimulusRegion;
  context: CanonicalStartingVolumeContext;
}>): CanonicalStartingVolumeResolution {
  const landmark = canonicalHypertrophyLandmark(input.experience, input.region);
  const small = smallRegions.has(input.region);
  const authorisedFloor = Math.max(1, landmark.target.min - (input.region === "core" ? 1 : small ? 1 : 2));
  // Declared experience selects the policy band. Recent continuity/workload,
  // recovery, sport and retained comparable evidence then adjust within it.
  // Missing local app history changes confidence and load calibration, not the
  // athlete's declared training status.
  let starting = landmark.starting;
  const reasons = [`experience:${input.experience}`, `region:${input.region}`];
  if (input.context.continuity === "extended_layoff") {
    starting = authorisedFloor;
    reasons.push("extended_layoff_uses_reentry_floor");
  } else if (input.context.continuity === "short_layoff") {
    starting -= 1;
    reasons.push("short_layoff_reduces_start_without_erasing_experience");
  } else {
    reasons.push("current_training_preserves_experience_baseline");
  }
  if (input.context.continuity === "currently_training" && (input.context.recentTrainingDaysPerWeek <= 2 || input.context.recentSessionWorkload === "light")) {
    starting -= 1;
    reasons.push("recent_low_workload_reduces_provisional_start");
  }
  if (input.context.recentTrainingDaysPerWeek >= 4 && input.context.recentSessionWorkload === "high" && input.context.recovery !== "low_acceptable") {
    starting += 1;
    reasons.push("recent_high_workload_supports_bounded_provisional_start");
  }
  if (input.context.history === "established_productive" && input.context.dosageConfidence === "canonical_productive_history") {
    starting += 1;
    reasons.push("retained_productive_history_supports_one_set_above_provisional_start");
  } else {
    reasons.push("missing_app_history_lowers_dosage_confidence_not_experience");
  }
  if (input.context.recovery === "low_acceptable") {
    starting -= small || input.region === "core" ? 1 : 2;
    reasons.push("low_acceptable_recovery_reduces_start");
  }
  const highCapacityAuthorised = input.context.recovery === "high"
    && input.context.history === "established_productive"
    && input.context.workCapacity === "demonstrated_high";
  if (highCapacityAuthorised) {
    starting = landmark.maximumAuthorisedStarting;
    reasons.push("productive_history_and_high_capacity_authorise_upper_start");
  } else if (input.context.workCapacity === "demonstrated_high") {
    reasons.push("work_capacity_without_complete_supporting_evidence_does_not_raise_volume");
  }
  if (input.context.concurrentSport === "lower_body_loading" && lowerBody.has(input.region)) {
    starting -= small ? 1 : 2;
    reasons.push("concurrent_lower_body_workload_reduces_starting_resistance_dose");
  }
  starting = Math.max(authorisedFloor, Math.min(landmark.maximumAuthorisedStarting, starting));
  if (input.context.loadConfidence === "calibration_required") reasons.push("load_calibration_required_independent_of_dosage");
  if (input.context.recovery === "ordinary") reasons.push("ordinary_recovery_supports_resolved_start");
  const retainedHistoryEffect = highCapacityAuthorised
    ? "demonstrated_upper_start"
    : input.context.history === "established_productive"
      ? "productive_baseline"
      : input.context.continuity === "currently_training"
        ? "declared_training_baseline"
        : "layoff_reentry";
  return {
    policyId: canonicalHypertrophyVolumePolicy.policyId,
    startingDirectSets: starting,
    authorisedFloor,
    authorisedCeiling: landmark.maximumAuthorisedStarting,
    target: landmark.target,
    calibrationRequired: input.context.loadConfidence === "calibration_required",
    retainedHistoryEffect,
    reasonCodes: reasons,
  };
}

export function resolveCanonicalHypertrophyVolumeProgression(input: Readonly<{
  experience: ExperienceLevel;
  region: CanonicalStimulusRegion;
  currentDirectSets: number;
  evidence: CanonicalHypertrophyVolumeEvidence;
}>): Readonly<{ policyId: typeof canonicalHypertrophyVolumePolicy.policyId; disposition: CanonicalHypertrophyVolumeDisposition; setDelta: -2 | -1 | 0 | 1; reasonCodes: readonly string[] }> {
  const landmark = canonicalHypertrophyLandmark(input.experience, input.region);
  const evidence = input.evidence;
  if (evidence.recovery === "systemic_fatigue") return result("review_systemic_fatigue", 0, ["systemic_fatigue", "automatic_change_prohibited"]);
  if (evidence.comparableObservations < 3 || evidence.performance === "conflicting") return result("retain", 0, ["insufficient_or_conflicting_comparable_evidence"]);
  if (evidence.recovery === "local_fatigue" || evidence.performance === "drop_off") {
    const canRemoveTwo = evidence.repeatedSignal && input.currentDirectSets - 2 >= landmark.starting;
    return canRemoveTwo ? result("remove_two_sets", -2, ["repeated_local_drop_off", "starting_floor_preserved"]) : result("remove_one_set", -1, ["local_drop_off_or_recovery_failure", "bounded_reduction"]);
  }
  if (evidence.performance === "stagnating" && evidence.sourceRegionAtOrAboveTarget && evidence.destinationBelowTarget) return result("reallocate_one_set", 0, ["source_at_target", "destination_below_target", "systemic_recovery_acceptable"]);
  if ((evidence.performance === "improving" || evidence.performance === "stable") && input.currentDirectSets < landmark.target.min) return result("add_one_set", 1, ["productive_comparable_evidence", "below_target", "bounded_local_increase"]);
  return result("retain", 0, [input.currentDirectSets >= landmark.target.min ? "inside_productive_target" : "no_authorised_change"]);
}

function result(disposition: CanonicalHypertrophyVolumeDisposition, setDelta: -2 | -1 | 0 | 1, reasonCodes: readonly string[]) {
  return { policyId: canonicalHypertrophyVolumePolicy.policyId, disposition, setDelta, reasonCodes } as const;
}
