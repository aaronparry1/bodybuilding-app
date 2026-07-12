import { describe, expect, it } from "vitest";
import { resolveRecommendedSetGuidanceTargetFromRepositories } from "@/application/training/recommended-set-guidance-repository-resolution";
import type { ApplyRecommendedSetGuidanceAdjustmentCommand } from "@/application/training/recommended-set-guidance-target-resolver";
const command: ApplyRecommendedSetGuidanceAdjustmentCommand = { schemaVersion: "v1", adjustmentRecordId: "r", adjustmentKind: "raise_range", expectedActivePlanId: "p", target: { planId: "p", programmeId: "g", mesocycleId: "m", microcycleNumber: 1, sessionIdentity: "0", guidanceField: "recommended_set_count" }, requestedAt: "x", policyVersion: "legacy_programme_guidance_v1" };
const plan: any = { id: "p", recommendationState: { volumeAdjustments: [{ id: "r", action: "raise_range", status: "applied" }] } };
const workout = (id: string, completed = false, exact = true): any => ({ id, sessionKind: "planned", planMesocycleId: "m", planMicrocycleNumber: 1, planSessionIndex: 0, completedAt: completed ? "x" : undefined, exercises: [{ prescribedSetTargets: exact ? [8] : undefined }] });
describe("recommended set guidance repository resolution", () => {
  it("uses persisted planning identity and stable identity ordering", () => { const result = resolveRecommendedSetGuidanceTargetFromRepositories(command, { getActivePlan: () => plan, listWorkoutSessions: () => [workout("z"), workout("a")], findGuidanceTargets: () => [{ identity: command.target, kind: "future_active_plan_guidance" }] }); expect(result.status).toBe("resolved_future_guidance_target"); if (result.status === "resolved_future_guidance_target") expect(result.references.map((x) => x.workoutId)).toEqual(["a", "z"]); });
  it("keeps missing persisted guidance identity explicit", () => { expect(resolveRecommendedSetGuidanceTargetFromRepositories(command, { getActivePlan: () => plan, listWorkoutSessions: () => [], findGuidanceTargets: () => [] }).status).toBe("target_not_found"); });
});
