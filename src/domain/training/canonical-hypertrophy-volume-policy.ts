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

const smallRegions = new Set<CanonicalStimulusRegion>(["anterior_delts", "lateral_delts", "rear_delts", "triceps", "biceps", "calves", "core"]);

export function canonicalHypertrophyLandmark(experience: ExperienceLevel, region: CanonicalStimulusRegion): CanonicalHypertrophyVolumeLandmark {
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
