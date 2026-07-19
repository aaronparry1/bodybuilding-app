import { describe, expect, it } from "vitest";
import type { WorkoutSession } from "@/domain/training/models";
import { buildPlanPageViewModel } from "@/domain/training/plan-page-view-model";
import { createActiveTrainingPlan } from "@/domain/training/plan-setup";

function plan() {
  return createActiveTrainingPlan({
    goal: "build_muscle_and_strength",
    planningChoice: "recommended_12_month",
    equipmentPreset: "full_gym",
    daysPerWeek: 4,
    preferredSplit: "upper_lower",
    experienceLevel: "intermediate",
  }, "2026-07-11T09:00:00.000Z");
}

function workout(id: string, index: number, targets?: number[], patch: Partial<WorkoutSession> = {}): WorkoutSession {
  return {
    id,
    name: `Workout ${id}`,
    planSessionIndex: index,
    sessionKind: "planned",
    startedAt: "2026-07-11T09:00:00.000Z",
    updatedAt: "2026-07-11T09:00:00.000Z",
    syncState: "local",
    exercises: [{
      id: `${id}-exercise`,
      exerciseId: "barbell-back-squat",
      exerciseName: "Barbell Back Squat",
      settings: { repRange: { min: 5, max: 8 }, dropOffPercent: 15, loadIncrease: 2.5, unit: "kg", requiredWorkSets: 3 },
      load: 80,
      ...(targets ? { prescribedSetTargets: targets } : {}),
      sets: [],
      status: "active",
      origin: "planned",
    }],
    ...patch,
  };
}

describe("Plan page view model", () => {
  it("returns a safe no-plan state", () => {
    const viewModel = buildPlanPageViewModel({ activePlan: null });

    expect(viewModel.status).toBe("no_plan");
    expect(viewModel.hasActivePlan).toBe(false);
    expect(viewModel.currentMesocyclePurpose).toBeNull();
    expect(viewModel.approvedNextMesocycles).toEqual([]);
  });

  it("uses current mesocycle, microcycle and role instead of conflicting block data", () => {
    const activePlan = plan();
    const conflicting = { ...activePlan, blocks: activePlan.blocks.map((block) => ({ ...block, type: "deload" as const })) };
    const viewModel = buildPlanPageViewModel({ activePlan: conflicting });

    expect(viewModel.status).toBe("ready");
    expect(viewModel.summary.macrocycle).toBe("Powerbuilding");
    expect(viewModel.currentMesocyclePurpose).toBe("Establish repeatable squat, bench and deadlift");
    expect(viewModel.currentMicrocycle).toEqual({ number: 1, priority: "Main lifts plus muscle development" });
    expect(viewModel.currentSessionRole).toBe("Upper strength and hypertrophy");
    expect("roadmap" in viewModel).toBe(false);
    expect("nextBlock" in viewModel).toBe(false);
  });

  it("selects only the deterministic open planned workout and its stored exact targets", () => {
    const activePlan = plan();
    const next = workout("next", 1, [6, 6, 7]);
    const later = workout("later", 2, [8, 8, 8]);
    const completed = workout("completed", 0, [8, 8, 8], { completedAt: "2026-07-11T10:00:00.000Z" });
    const extra = workout("extra", 0, [8, 8, 8], { sessionKind: "extra_full" });
    const viewModel = buildPlanPageViewModel({ activePlan, workouts: [later, completed, extra, next] });

    expect(viewModel.openPlannedWorkout?.id).toBe("next");
    expect(viewModel.exactTargetSummary).toEqual([{ exerciseName: "Barbell Back Squat", load: 80, unit: "kg", targets: [6, 6, 7] }]);
  });

  it("does not reconstruct an exact target from range metadata", () => {
    const activePlan = plan();
    const open = workout("open", 0, [5, 5, 6]);
    open.exercises[0]!.settings.repRange = { min: 12, max: 20 };
    const viewModel = buildPlanPageViewModel({ activePlan, workouts: [open] });

    expect(viewModel.exactTargetSummary[0]?.targets).toEqual([5, 5, 6]);
  });

  it("exposes only domain-approved next mesocycles", () => {
    const viewModel = buildPlanPageViewModel({ activePlan: plan() });

    expect(viewModel.approvedNextMesocycles).toEqual([{ id: "powerbuilding_hypertrophy", purpose: "Add muscle while retaining S/B/D" }]);
  });

  it("marks incomplete current planning explicitly rather than inventing a block", () => {
    const activePlan = { ...plan(), currentMesocycleId: undefined };
    const viewModel = buildPlanPageViewModel({ activePlan });

    expect(viewModel.status).toBe("incomplete");
    expect(viewModel.currentMesocyclePurpose).toBeNull();
    expect(viewModel.thisWeek).toEqual([]);
  });
});
