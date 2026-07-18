import type { AllocatedSlot } from "@/domain/training/canonical-microcycle-volume-allocator";
import type { CanonicalTargetEnvelope, MesocyclePrescriptionPolicy, PrescriptionMethodFamily } from "@/domain/training/mesocycle-prescription-policy";
import type { Exercise, ExperienceLevel, TrainingLane } from "@/domain/training/models";

export const CANONICAL_EXACT_TARGET_POLICY_ID = "canonical_exact_target_policy_v1" as const;

export type CanonicalExactTarget = Readonly<{
  status: "resolved";
  policyId: typeof CANONICAL_EXACT_TARGET_POLICY_ID;
  targets: readonly number[];
  restSeconds: number;
  reasonCodes: readonly string[];
}>;
export type CanonicalExactTargetResolution = CanonicalExactTarget | Readonly<{ status: "blocked"; policyId: typeof CANONICAL_EXACT_TARGET_POLICY_ID; reason: "exercise_and_mesocycle_targets_do_not_overlap" }>;

export function resolveCanonicalExactTarget(input: Readonly<{
  exercise: Exercise;
  slot: AllocatedSlot;
  envelope: CanonicalTargetEnvelope;
  policy: MesocyclePrescriptionPolicy;
  lane: TrainingLane;
  method: PrescriptionMethodFamily;
  experience: ExperienceLevel;
}>): CanonicalExactTargetResolution {
  const ideal = idealReps(input.exercise, input.slot, input.lane);
  // Primary-lift exact work is owned by the Mesocycle envelope plus this
  // versioned target policy. The catalogue default remains a general-use
  // default for legacy/generic consumers and must not override that policy.
  const minimum = input.slot.liftExposure === "primary" ? input.envelope.minReps : Math.max(input.envelope.minReps, input.exercise.defaultRepRange.min);
  const maximum = input.slot.liftExposure === "primary" ? input.envelope.maxReps : Math.min(input.envelope.maxReps, input.exercise.defaultRepRange.max);
  if (minimum > maximum) return { status: "blocked", policyId: CANONICAL_EXACT_TARGET_POLICY_ID, reason: "exercise_and_mesocycle_targets_do_not_overlap" };
  const reps = Math.max(minimum, Math.min(maximum, ideal));
  const targets = Array.from({ length: input.slot.workingSets }, () => reps);
  const restSeconds = fatigueAwareRest(input.exercise, input.slot, input.lane);
  return {
    status: "resolved",
    policyId: CANONICAL_EXACT_TARGET_POLICY_ID,
    targets,
    restSeconds,
    reasonCodes: [
      `lift:${input.slot.primaryLift ?? "none"}`,
      `exposure:${input.slot.liftExposure ?? "none"}`,
      `role:${input.slot.constructionRole}`,
      `fatigue:${input.exercise.fatigueCost}`,
      `lane:${input.lane}`,
      `mesocycle:${input.policy.mesocycleId}`,
      `method:${input.method}`,
      `experience:${input.experience}`,
    ],
  };
}

function idealReps(exercise: Exercise, slot: AllocatedSlot, lane: TrainingLane): number {
  if (slot.liftExposure === "primary") {
    if (slot.primaryLift === "deadlift") return 5;
    return lane === "strength" || lane === "strength_support" ? 5 : 6;
  }
  if (slot.liftExposure === "secondary_variation") return 8;
  if (slot.requiredStimuli.includes("lateral_delts") || slot.requiredStimuli.includes("rear_delts") || slot.requiredStimuli.includes("calves")) return 15;
  if (slot.requiredStimuli.includes("triceps") || slot.requiredStimuli.includes("biceps") || slot.requiredStimuli.includes("hamstrings_knee_flexion") || slot.requiredStimuli.includes("core")) return 12;
  if (exercise.fatigueCost === "high") return 6;
  if (slot.constructionRole === "secondary") return 10;
  return 12;
}

function fatigueAwareRest(exercise: Exercise, slot: AllocatedSlot, lane: TrainingLane): number {
  if (slot.primaryLift === "deadlift" && slot.liftExposure === "primary") return 240;
  if (slot.primaryLift === "squat" && slot.liftExposure === "primary") return 210;
  if (slot.primaryLift === "bench" && slot.liftExposure === "primary") return 180;
  if (slot.liftExposure === "secondary_variation" || exercise.fatigueCost === "high" || lane === "strength") return 150;
  if (slot.constructionRole === "secondary" || exercise.fatigueCost === "moderate") return 120;
  return 75;
}
