import { classifyRecommendedSetGuidanceMutationScope, type RecommendedSetGuidanceMutationTarget } from "@/domain/training/recommended-set-guidance-mutation-scope";
import { guardRecommendedSetGuidanceMutation, type RecommendedSetGuidanceLifecycleFacts } from "@/domain/training/recommended-set-guidance-lifecycle-guard";

export type ApplyRecommendedSetGuidanceAdjustmentCommand = Readonly<{
  schemaVersion: "v1";
  adjustmentRecordId: string;
  adjustmentKind: "raise_range" | "lower_range";
  expectedActivePlanId: string;
  target: RecommendedSetGuidanceTargetIdentity;
  requestedAt: string;
  policyVersion: string;
}>;

export type RecommendedSetGuidanceTargetIdentity = Readonly<{
  planId: string;
  programmeId: string;
  mesocycleId?: string;
  microcycleNumber?: number;
  sessionIdentity?: string;
  guidanceField: "recommended_set_count";
}>;

export type PlannedWorkoutReference = Readonly<{
  workoutId: string;
  planId: string;
  mesocycleId?: string;
  microcycleNumber?: number;
  sessionIdentity?: string;
  lifecycle: "open" | "completed";
  hasExactTargetCoverage: boolean;
}>;

export type ResolvedGuidanceTarget = Readonly<{ identity: RecommendedSetGuidanceTargetIdentity; kind: RecommendedSetGuidanceMutationTarget["kind"] }>;
export type RecommendedSetGuidanceResolverReads = Readonly<{
  findAdjustment: (id: string) => Readonly<{ id: string; action: string; status: "applied" | "ignored" }> | null;
  findActivePlan: (id: string) => Readonly<{ id: string }> | null;
  findGuidanceTarget: (identity: RecommendedSetGuidanceTargetIdentity) => readonly ResolvedGuidanceTarget[];
  findPlannedWorkoutReferences: (identity: RecommendedSetGuidanceTargetIdentity) => readonly PlannedWorkoutReference[];
}>;

export type RecommendedSetGuidanceTargetResolution =
  | Readonly<{ status: "adjustment_not_found" | "active_plan_not_found" | "stale_active_plan" | "target_not_found" | "incomplete_target_identity" | "target_identity_mismatch" | "ambiguous_planned_reference" | "invalid_command"; reason: string }>
  | Readonly<{ status: "resolved_future_guidance_target"; target: ResolvedGuidanceTarget; references: readonly PlannedWorkoutReference[]; scope: ReturnType<typeof classifyRecommendedSetGuidanceMutationScope>; lifecycle: ReturnType<typeof guardRecommendedSetGuidanceMutation>; nextRequiredBoundary: "timing_policy" }>;

/** Read-only fact resolver for a later guidance-application service. It never normalizes or writes. */
export function resolveRecommendedSetGuidanceTarget(command: ApplyRecommendedSetGuidanceAdjustmentCommand, reads: RecommendedSetGuidanceResolverReads): RecommendedSetGuidanceTargetResolution {
  if (command.schemaVersion !== "v1" || !command.adjustmentRecordId || !command.expectedActivePlanId || !isCompleteIdentity(command.target)) return { status: "incomplete_target_identity", reason: "command_identity_incomplete" };
  const adjustment = reads.findAdjustment(command.adjustmentRecordId);
  if (!adjustment) return { status: "adjustment_not_found", reason: "adjustment_record_missing" };
  if (adjustment.action !== command.adjustmentKind || adjustment.status !== "applied") return { status: "invalid_command", reason: "adjustment_kind_or_lifecycle_mismatch" };
  const plan = reads.findActivePlan(command.expectedActivePlanId);
  if (!plan) return { status: "active_plan_not_found", reason: "active_plan_missing" };
  if (plan.id !== command.target.planId) return { status: "stale_active_plan", reason: "plan_identity_mismatch" };
  const targets = reads.findGuidanceTarget(command.target);
  if (targets.length === 0) return { status: "target_not_found", reason: "guidance_target_missing" };
  if (targets.length !== 1 || !sameIdentity(targets[0]!.identity, command.target)) return { status: "target_identity_mismatch", reason: "guidance_target_ambiguous_or_mismatched" };
  const references = reads.findPlannedWorkoutReferences(command.target).filter((reference) => sameReferenceIdentity(reference, command.target));
  if (references.some((reference) => !reference.workoutId || !reference.planId)) return { status: "ambiguous_planned_reference", reason: "planned_reference_identity_incomplete" };
  const target = targets[0]!;
  const scope = classifyRecommendedSetGuidanceMutationScope({ kind: target.kind });
  const relevant = references[0];
  const facts: RecommendedSetGuidanceLifecycleFacts = relevant
    ? { kind: relevant.lifecycle === "completed" ? "completed_planned_workout" : "open_planned_workout", lifecycle: relevant.lifecycle, workoutId: relevant.workoutId, planId: command.target.planId, workoutPlanId: relevant.planId, hasExactTargetCoverage: relevant.hasExactTargetCoverage }
    : { kind: target.kind, lifecycle: "not_created", planId: command.target.planId };
  const lifecycle = guardRecommendedSetGuidanceMutation(facts);
  return { status: "resolved_future_guidance_target", target, references, scope, lifecycle, nextRequiredBoundary: "timing_policy" };
}

function isCompleteIdentity(identity: RecommendedSetGuidanceTargetIdentity): boolean { return Boolean(identity.planId && identity.programmeId && identity.guidanceField === "recommended_set_count"); }
function sameIdentity(a: RecommendedSetGuidanceTargetIdentity, b: RecommendedSetGuidanceTargetIdentity): boolean { return a.planId === b.planId && a.programmeId === b.programmeId && a.mesocycleId === b.mesocycleId && a.microcycleNumber === b.microcycleNumber && a.sessionIdentity === b.sessionIdentity && a.guidanceField === b.guidanceField; }
function sameReferenceIdentity(reference: PlannedWorkoutReference, target: RecommendedSetGuidanceTargetIdentity): boolean { return reference.planId === target.planId && (target.mesocycleId === undefined || reference.mesocycleId === target.mesocycleId) && (target.microcycleNumber === undefined || reference.microcycleNumber === target.microcycleNumber) && (target.sessionIdentity === undefined || reference.sessionIdentity === target.sessionIdentity); }
