import type { CanonicalMicrocycleVolumeAllocation } from "@/domain/training/canonical-microcycle-volume-allocator";
import type { CanonicalSessionSnapshotV3 } from "@/domain/training/canonical-session-construction-pipeline";
import type { CanonicalStimulusRegion, Exercise } from "@/domain/training/models";

export const CANONICAL_CONSTRUCTED_MICROCYCLE_CERTIFICATION_VERSION = "canonical_constructed_microcycle_certification_v1" as const;

export type CanonicalConstructedExerciseAccounting = Readonly<{
  sessionIndex: number;
  slotIndex: number;
  exerciseId: string;
  workingSets: number;
  directStimulus: readonly CanonicalStimulusRegion[];
  meaningfulSecondaryStimulus: readonly CanonicalStimulusRegion[];
  fatigueClass: "low" | "moderate" | "high";
  fatigueUnits: number;
  suitability: string;
  repeatReason: string;
}>;

export type CanonicalConstructedMicrocycleCertification = Readonly<{
  schemaVersion: typeof CANONICAL_CONSTRUCTED_MICROCYCLE_CERTIFICATION_VERSION;
  status: "passed" | "failed";
  exercises: readonly CanonicalConstructedExerciseAccounting[];
  directStimulusSets: Readonly<Partial<Record<CanonicalStimulusRegion, number>>>;
  meaningfulSecondaryStimulusSets: Readonly<Partial<Record<CanonicalStimulusRegion, number>>>;
  fatigueUnits: Readonly<{ perSession: readonly number[]; weekly: number }>;
  repeatedExercises: readonly Readonly<{ exerciseId: string; count: number; reason: string }> [];
  checks: readonly string[];
  failures: readonly string[];
}>;

export function certifyCanonicalConstructedMicrocycle(input: Readonly<{
  allocation: CanonicalMicrocycleVolumeAllocation;
  sessions: readonly CanonicalSessionSnapshotV3[];
  exercises: readonly Exercise[];
}>): CanonicalConstructedMicrocycleCertification {
  const exerciseById = new Map(input.exercises.map((exercise) => [exercise.id, exercise]));
  const accounting: CanonicalConstructedExerciseAccounting[] = [];
  const direct: Partial<Record<CanonicalStimulusRegion, number>> = {};
  const secondary: Partial<Record<CanonicalStimulusRegion, number>> = {};
  const fatigueBySession = input.sessions.map(() => 0);
  const useCount: Record<string, number> = {};
  const repeatReasons: Record<string, string> = {};
  const failures: string[] = [];
  const checks: string[] = [];

  for (const [sessionIndex, session] of input.sessions.entries()) {
    for (const slot of session.slots) {
      const exercise = exerciseById.get(slot.exerciseId);
      if (!exercise?.stimulusProfile) { failures.push(`missing_stimulus_metadata:${slot.exerciseId}`); continue; }
      const workingSets = slot.settings.requiredSets ?? slot.settings.requiredWorkSets;
      const allocatedSlot = input.allocation.slots.find((candidate) => candidate.sessionIndex === sessionIndex && candidate.order === slot.index);
      if (!allocatedSlot) failures.push(`unallocated_constructed_slot:${sessionIndex}:${slot.index}`);
      else {
        if (!allocatedSlot.movementPatterns.includes(exercise.movementPattern)) failures.push(`slot_movement_mismatch:${exercise.id}:${allocatedSlot.purpose}`);
        if (!allocatedSlot.requiredStimuli.every((region) => exercise.stimulusProfile?.direct.includes(region))) failures.push(`slot_stimulus_mismatch:${exercise.id}:${allocatedSlot.purpose}`);
        if (!exercise.roles.includes(allocatedSlot.exerciseRole)) failures.push(`slot_role_mismatch:${exercise.id}:${allocatedSlot.purpose}`);
      }
      const fatigueUnits = workingSets * (exercise.fatigueCost === "high" ? 3 : exercise.fatigueCost === "moderate" ? 2 : 1);
      const exactTargets = slot.exactTargets ?? Array.from({ length: workingSets }, () => slot.targetReps);
      if (exercise.fatigueCost === "high" && (exactTargets.some((target) => target > 8) || slot.rest.seconds < 150)) failures.push(`high_fatigue_prescription_inappropriate:${exercise.id}`);
      for (const region of exercise.stimulusProfile.direct) direct[region] = (direct[region] ?? 0) + workingSets;
      for (const region of exercise.stimulusProfile.meaningfulSecondary) secondary[region] = (secondary[region] ?? 0) + workingSets;
      fatigueBySession[sessionIndex] += fatigueUnits;
      useCount[exercise.id] = (useCount[exercise.id] ?? 0) + 1;
      repeatReasons[exercise.id] = slot.selection?.repeatReason ?? "not_recorded";
      accounting.push({ sessionIndex, slotIndex: slot.index, exerciseId: exercise.id, workingSets, directStimulus: exercise.stimulusProfile.direct, meaningfulSecondaryStimulus: exercise.stimulusProfile.meaningfulSecondary, fatigueClass: exercise.fatigueCost, fatigueUnits, suitability: slot.selection?.suitability ?? "not_recorded", repeatReason: slot.selection?.repeatReason ?? "not_recorded" });
    }
  }

  const requirements = Object.fromEntries(
    Object.entries(input.allocation.directSetTargets).map(([region, target]) => [region, target.min]),
  ) as Readonly<Partial<Record<CanonicalStimulusRegion, number>>>;
  for (const [region, minimum] of Object.entries(requirements) as [CanonicalStimulusRegion, number][]) {
    if ((direct[region] ?? 0) >= minimum) checks.push(`${region}_direct_coverage`);
    else failures.push(`${region}_direct_coverage_missing`);
  }
  if (input.allocation.profile !== "powerbuilding_five_day_v1") checks.push("secondary_stimulus_reported_separately");
  else if ((secondary.anterior_delts ?? 0) >= 6) checks.push("anterior_delts_meaningful_secondary_coverage");
  else failures.push("anterior_delts_meaningful_secondary_coverage_missing");
  if (accounting.some((entry) => exerciseById.get(entry.exerciseId)?.selectionProfile === "strength_specialist" && !input.allocation.slots.find((slot) => slot.sessionIndex === entry.sessionIndex && slot.order === entry.slotIndex)?.specialistsPermitted)) failures.push("unauthorised_specialist_selection");
  else checks.push("no_unauthorised_specialist_selection");

  const repeatedExercises = Object.entries(useCount).filter(([, count]) => count > 1).sort(([a], [b]) => a.localeCompare(b)).map(([exerciseId, count]) => ({ exerciseId, count, reason: repeatReasons[exerciseId] ?? "not_recorded" }));
  for (const repeated of repeatedExercises) {
    if (["stable_primary_practice", "only_equivalent_available"].includes(repeated.reason)) checks.push(`repeat_authorised:${repeated.exerciseId}`);
    else failures.push(`repeat_without_programme_reason:${repeated.exerciseId}`);
  }
  // This arithmetic score is useful for relative comparisons, but it is not an
  // owned universal safety threshold. Prescription safety is enforced above
  // from exercise fatigue, exact rep targets and the rest prescription.
  checks.push("session_systemic_fatigue_reported_for_comparison");
  const sameRoleFamilies = ["Push", "Pull", "Legs", "Upper", "Lower"];
  for (const family of sameRoleFamilies) {
    const matching = input.sessions.filter((session) => session.role.startsWith(family));
    if (matching.length < 2) continue;
    const signatures = matching.map((session) => session.slots.map((slot) => slot.exerciseId).join("|"));
    if (new Set(signatures).size !== signatures.length) failures.push(`same_role_sessions_accidentally_identical:${family.toLowerCase()}`);
    else checks.push(`same_role_sessions_complementary:${family.toLowerCase()}`);
  }
  if (!failures.some((failure) => failure.startsWith("high_fatigue_prescription_inappropriate"))) checks.push("high_fatigue_reps_and_rest_appropriate");

  return { schemaVersion: CANONICAL_CONSTRUCTED_MICROCYCLE_CERTIFICATION_VERSION, status: failures.length ? "failed" : "passed", exercises: accounting, directStimulusSets: direct, meaningfulSecondaryStimulusSets: secondary, fatigueUnits: { perSession: fatigueBySession, weekly: fatigueBySession.reduce((sum, value) => sum + value, 0) }, repeatedExercises, checks, failures };
}
