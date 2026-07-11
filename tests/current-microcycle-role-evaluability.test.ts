import { describe, expect, it } from "vitest";
import { createActiveTrainingPlan } from "@/domain/training/plan-setup";
import { deriveRequiredPlannedRoles, evaluateMicrocycleRoles, matchPlannedRoles } from "@/domain/training/current-microcycle-role-evaluability";

const plan = createActiveTrainingPlan({ goal: "build_muscle", planningChoice: "recommended_12_month", equipmentPreset: "full_gym", daysPerWeek: 3, preferredSplit: "push_pull_legs", experienceLevel: "intermediate" }, "2026-07-11T00:00:00.000Z");
const requirement = deriveRequiredPlannedRoles(plan);
if (requirement.status !== "ready") throw new Error("fixture needs current roles");
const fact = (index: number, overrides = {}) => ({ workoutId: `w-${index}`, planId: plan.id, mesocycleId: plan.currentMesocycleId!, microcycleNumber: plan.currentMicrocycle!.sequenceNumber, planSessionIndex: index, sessionKind: "planned" as const, completion: "completed" as const, validPerformance: true, ...overrides });

describe("current microcycle role evaluability", () => {
  it("derives ordered current roles, including duplicate occurrences, without block state", () => { expect(requirement.input.roles.map((r) => r.planSessionIndex)).toEqual([0, 1, 2]); expect(requirement.input.roles[0]?.occurrenceId).toContain(plan.id); });
  it("matches planned identities once and excludes custom/extra work", () => { const match = matchPlannedRoles(requirement.input, [fact(0), fact(0, { workoutId: "duplicate" }), fact(1, { workoutId: "custom", sessionKind: "custom" })]); expect(match.completed).toHaveLength(1); expect(match.ignoredNonPlanned).toContain("custom"); expect(match.unresolved).toHaveLength(2); });
  it("keeps blocked, disrupted, invalid, and minimum-exposure states explicit", () => { expect(evaluateMicrocycleRoles(matchPlannedRoles(requirement.input, [fact(0, { constructionBlocked: true })]), true).status).toBe("blocked"); expect(evaluateMicrocycleRoles(matchPlannedRoles(requirement.input, [fact(0, { completion: "skipped" })]), true).status).toBe("disrupted"); expect(evaluateMicrocycleRoles(matchPlannedRoles(requirement.input, [fact(99)]), true).status).toBe("invalid"); const all = matchPlannedRoles(requirement.input, [fact(0), fact(1), fact(2)]); expect(evaluateMicrocycleRoles(all, false).status).toBe("in_progress"); expect(evaluateMicrocycleRoles(all, true).status).toBe("evaluable"); });
});
