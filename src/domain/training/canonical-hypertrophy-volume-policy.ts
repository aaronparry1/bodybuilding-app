import type { CanonicalStimulusRegion, ExperienceLevel } from "@/domain/training/models";

export const canonicalHypertrophyVolumePolicy = {
  policyId: "canonical_hypertrophy_volume_policy_v1",
  sourceReferences: [
    "docs/evidence-based-prescription-model.md#weekly-volume-targets",
    "docs/evidence-based-prescription-model.md#session-volume-targets",
    "src/domain/training/volume-landmarks.ts#getStartingVolumeLandmarks",
  ],
  accounting: "Direct working sets are counted by explicitly programmed stimulus region. Secondary stimulus is reported separately and never silently promoted to a direct set.",
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

export type CanonicalStartingVolumeContext = Readonly<{
  recovery: "low_acceptable" | "ordinary" | "high";
  history: "none" | "established_productive";
  workCapacity: "not_demonstrated" | "demonstrated_high";
  concurrentSport: "none" | "lower_body_loading";
}>;

export type CanonicalStartingVolumeResolution = Readonly<{
  policyId: typeof canonicalHypertrophyVolumePolicy.policyId;
  startingDirectSets: number;
  authorisedFloor: number;
  authorisedCeiling: number;
  target: Readonly<{ min: number; max: number }>;
  calibrationRequired: boolean;
  retainedHistoryEffect: "calibration_floor" | "productive_baseline" | "demonstrated_upper_start";
  reasonCodes: readonly string[];
}>;

const smallRegions = new Set<CanonicalStimulusRegion>(["anterior_delts", "lateral_delts", "rear_delts", "triceps", "biceps", "hamstrings_knee_flexion", "calves", "core"]);

export function canonicalHypertrophyLandmark(experience: ExperienceLevel, region: CanonicalStimulusRegion): CanonicalHypertrophyVolumeLandmark {
  if (region === "core") return experience === "beginner"
    ? { starting: 1, target: { min: 1, max: 4 }, maximumAuthorisedStarting: 2 }
    : { starting: 2, target: { min: 1, max: 6 }, maximumAuthorisedStarting: experience === "advanced" ? 4 : 3 };
  const small = smallRegions.has(region);
  if (experience === "beginner") return small
    ? { starting: 4, target: { min: 4, max: 8 }, maximumAuthorisedStarting: 6 }
    : { starting: 6, target: { min: 6, max: 10 }, maximumAuthorisedStarting: 8 };
  if (experience === "advanced") return small
    ? { starting: 8, target: { min: 8, max: 16 }, maximumAuthorisedStarting: 12 }
    : { starting: 10, target: { min: 10, max: 20 }, maximumAuthorisedStarting: 14 };
  return small
    ? { starting: 7, target: { min: 6, max: 14 }, maximumAuthorisedStarting: 10 }
    : { starting: 10, target: { min: 8, max: 16 }, maximumAuthorisedStarting: 12 };
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
  const lowerBody = new Set<CanonicalStimulusRegion>(["quadriceps", "hamstrings_knee_flexion", "hip_extension", "calves"]);
  const authorisedFloor = Math.max(1, landmark.target.min - (small ? 1 : 2));
  // Without retained comparable work, the policy starts at its authorised
  // muscle-specific floor. Experience changes exercise complexity and the
  // width of the safe band; it is never evidence that the athlete tolerates
  // the middle or top of that band.
  let starting = input.context.history === "none" ? authorisedFloor : landmark.starting;
  const reasons = [`experience:${input.experience}`, `region:${input.region}`];
  if (input.context.history === "none") reasons.push("absent_productive_history_uses_calibration_floor");
  else reasons.push("retained_productive_history_authorises_productive_baseline");
  if (input.context.recovery === "low_acceptable") {
    starting = authorisedFloor;
    reasons.push("low_acceptable_recovery_uses_starting_floor");
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
  if (input.context.history === "none") reasons.push("calibration_from_absent_comparable_history");
  if (input.context.recovery === "ordinary") reasons.push(input.context.history === "none" ? "ordinary_recovery_does_not_replace_missing_tolerance_evidence" : "ordinary_recovery_supports_productive_baseline");
  return {
    policyId: canonicalHypertrophyVolumePolicy.policyId,
    startingDirectSets: starting,
    authorisedFloor,
    authorisedCeiling: landmark.maximumAuthorisedStarting,
    target: landmark.target,
    calibrationRequired: input.context.history === "none",
    retainedHistoryEffect: highCapacityAuthorised ? "demonstrated_upper_start" : input.context.history === "established_productive" ? "productive_baseline" : "calibration_floor",
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
