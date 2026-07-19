import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  buildWeeklySessionSequence,
  getAllowedProgrammeFrameworks,
  getFrameworkOptionsForGoal,
  type ProgrammeFrameworkGoal,
  type ProgrammeFrameworkId,
} from "@/domain/training/programme-framework-rules";

const hypertrophyFrameworks = ["push_pull_legs", "upper_lower", "full_body", "chest_back_shoulders_arms_legs"];
const strengthFrameworks = ["bench_squat_deadlift", "push_pull_legs", "upper_lower", "full_body"];
const allFrameworks: ProgrammeFrameworkId[] = [
  "push_pull_legs",
  "upper_lower",
  "full_body",
  "chest_back_shoulders_arms_legs",
  "bench_squat_deadlift",
];

describe("programme framework rules", () => {
  it("returns every user-facing framework option for each approved goal", () => {
    const expectedIds = ["asc_recommended", "push_pull_legs", "upper_lower", "full_body", "body_part_split", "bench_squat_deadlift"];

    for (const goal of ["build_muscle", "get_stronger", "build_muscle_strength", "athletic_performance", "lose_fat"] as const) {
      const options = getFrameworkOptionsForGoal(goal);

      expect(options.map((option) => option.id)).toEqual(expectedIds);
      expect(options.every((option) => option.displayName && option.shortDescription && option.coachingReason)).toBe(true);
    }
  });

  it("marks ASC Recommended as default for every goal", () => {
    for (const goal of ["build_muscle", "get_stronger", "build_muscle_strength", "athletic_performance", "lose_fat"] as const) {
      const options = getFrameworkOptionsForGoal(goal);
      const defaults = options.filter((option) => option.isDefaultRecommendation);

      expect(defaults).toHaveLength(1);
      expect(defaults[0]).toMatchObject({ id: "asc_recommended", suitability: "best" });
    }
  });

  it("applies goal-aware suitability rules", () => {
    expect(optionFor("build_muscle", "push_pull_legs").suitability).toBe("best");
    expect(optionFor("build_muscle", "bench_squat_deadlift").suitability).toBe("not_recommended");

    expect(optionFor("get_stronger", "bench_squat_deadlift").suitability).toBe("best");
    expect(optionFor("get_stronger", "body_part_split").suitability).toBe("not_recommended");

    expect(optionFor("athletic_performance", "full_body").suitability).toBe("best");
    expect(optionFor("athletic_performance", "body_part_split").suitability).toBe("not_recommended");

    expect(optionFor("lose_fat", "upper_lower").suitability).toBe("best");
    expect(optionFor("lose_fat", "full_body").suitability).toBe("best");
    expect(optionFor("lose_fat", "bench_squat_deadlift").suitability).toBe("not_recommended");

    expect(optionFor("build_muscle_strength", "upper_lower").suitability).toBe("best");
    expect(optionFor("build_muscle_strength", "body_part_split").suitability).toBe("not_recommended");
  });

  it("keeps user override available even when a framework is not recommended", () => {
    const buildMuscleOptions = getFrameworkOptionsForGoal("build_muscle");
    const strengthOptions = getFrameworkOptionsForGoal("get_stronger");

    expect(buildMuscleOptions.some((option) => option.id === "bench_squat_deadlift" && option.suitability === "not_recommended")).toBe(true);
    expect(strengthOptions.some((option) => option.id === "body_part_split" && option.suitability === "not_recommended")).toBe(true);
  });

  it("surfaces goal-aware framework wording in onboarding", () => {
    const source = [
      readFileSync("app/(protected)/onboarding.tsx", "utf8"),
      readFileSync("src/domain/training/programme-framework-rules.ts", "utf8"),
    ].join("\n");

    expect(source).toContain("getFrameworkOptionsForGoal");
    expect(source).toContain("ASC Recommended");
    expect(source).toContain("Best fit");
    expect(source).toContain("Not recommended");
    expect(source).toContain("Bench/Squat/Deadlift");
    expect(source).toContain("ASC chooses the best structure for your goal, schedule and progress.");
  });

  it.each([
    ["hypertrophy", hypertrophyFrameworks],
    ["get_lean", hypertrophyFrameworks],
    ["strength", strengthFrameworks],
    ["athletic_performance", strengthFrameworks],
    ["build_muscle_strength", strengthFrameworks],
  ] as const)("returns correct allowed frameworks for %s", (goal, expected) => {
    expect(getAllowedProgrammeFrameworks(goal)).toEqual(expected);
  });

  it("supports every allowed framework from 2 to 6 sessions per week", () => {
    const goals: ProgrammeFrameworkGoal[] = ["hypertrophy", "get_lean", "strength", "athletic_performance", "build_muscle_strength"];

    for (const goal of goals) {
      for (const framework of getAllowedProgrammeFrameworks(goal)) {
        for (const sessionsPerWeek of [2, 3, 4, 5, 6]) {
          const sequence = buildWeeklySessionSequence({ goal, framework, sessionsPerWeek });
          expect(sequence).toHaveLength(sessionsPerWeek);
        }
      }
    }
  });

  it("does not allow hypertrophy or get lean to use bench/squat/deadlift", () => {
    expect(getAllowedProgrammeFrameworks("hypertrophy")).not.toContain("bench_squat_deadlift");
    expect(getAllowedProgrammeFrameworks("get_lean")).not.toContain("bench_squat_deadlift");
    expect(() => buildWeeklySessionSequence({ goal: "hypertrophy", framework: "bench_squat_deadlift", sessionsPerWeek: 3 })).toThrow(
      /not supported/,
    );
    expect(() => buildWeeklySessionSequence({ goal: "get_lean", framework: "bench_squat_deadlift", sessionsPerWeek: 3 })).toThrow(
      /not supported/,
    );
  });

  it("does not allow strength-oriented goals to use chest/back/shoulders/arms/legs", () => {
    for (const goal of ["strength", "athletic_performance", "build_muscle_strength"] as const) {
      expect(getAllowedProgrammeFrameworks(goal)).not.toContain("chest_back_shoulders_arms_legs");
      expect(() =>
        buildWeeklySessionSequence({
          goal,
          framework: "chest_back_shoulders_arms_legs",
          sessionsPerWeek: 5,
        }),
      ).toThrow(/not supported/);
    }
  });

  it("returns the approved PPL sequences for 4 and 5 days", () => {
    expect(buildWeeklySessionSequence({ goal: "hypertrophy", framework: "push_pull_legs", sessionsPerWeek: 4 })).toEqual([
      "push",
      "pull",
      "legs",
      "full_body",
    ]);
    expect(buildWeeklySessionSequence({ goal: "hypertrophy", framework: "push_pull_legs", sessionsPerWeek: 5 })).toEqual([
      "push",
      "pull",
      "legs",
      "upper",
      "lower",
    ]);
  });

  it("returns the approved 4-day chest/back/shoulders/arms/legs sequence", () => {
    expect(buildWeeklySessionSequence({ goal: "hypertrophy", framework: "chest_back_shoulders_arms_legs", sessionsPerWeek: 4 })).toEqual([
      "chest_back",
      "shoulders_arms",
      "legs",
      "full_body",
    ]);
  });

  it("returns approved strength framework sequences", () => {
    expect(buildWeeklySessionSequence({ goal: "strength", framework: "bench_squat_deadlift", sessionsPerWeek: 2 })).toEqual([
      "upper_strength",
      "lower_strength",
    ]);
    expect(buildWeeklySessionSequence({ goal: "strength", framework: "bench_squat_deadlift", sessionsPerWeek: 6 })).toEqual([
      "bench",
      "squat",
      "deadlift",
      "bench",
      "squat",
      "deadlift",
    ]);
  });

  it("rejects session counts outside 2 to 6", () => {
    expect(() => buildWeeklySessionSequence({ goal: "hypertrophy", framework: "push_pull_legs", sessionsPerWeek: 1 })).toThrow(/2-6/);
    expect(() => buildWeeklySessionSequence({ goal: "hypertrophy", framework: "push_pull_legs", sessionsPerWeek: 7 })).toThrow(/2-6/);
    expect(() => buildWeeklySessionSequence({ goal: "hypertrophy", framework: "push_pull_legs", sessionsPerWeek: 3.5 })).toThrow(/2-6/);
  });

  it("returns deterministic copies that callers cannot mutate globally", () => {
    const first = buildWeeklySessionSequence({ goal: "hypertrophy", framework: "upper_lower", sessionsPerWeek: 4 });
    const second = buildWeeklySessionSequence({ goal: "hypertrophy", framework: "upper_lower", sessionsPerWeek: 4 });

    expect(first).toEqual(["upper", "lower", "upper", "lower"]);
    expect(second).toEqual(first);
    first[0] = "full_body";
    expect(buildWeeklySessionSequence({ goal: "hypertrophy", framework: "upper_lower", sessionsPerWeek: 4 })).toEqual([
      "upper",
      "lower",
      "upper",
      "lower",
    ]);
  });

  it("keeps every framework sequence deterministic for 2 to 6 days", () => {
    for (const framework of allFrameworks) {
      const goal = framework === "bench_squat_deadlift" ? "strength" : framework === "chest_back_shoulders_arms_legs" ? "hypertrophy" : "strength";
      for (const sessionsPerWeek of [2, 3, 4, 5, 6]) {
        const first = buildWeeklySessionSequence({ goal, framework, sessionsPerWeek });
        const second = buildWeeklySessionSequence({ goal, framework, sessionsPerWeek });
        expect(second).toEqual(first);
      }
    }
  });
});

function optionFor(
  goal: Parameters<typeof getFrameworkOptionsForGoal>[0],
  id: ReturnType<typeof getFrameworkOptionsForGoal>[number]["id"],
) {
  const option = getFrameworkOptionsForGoal(goal).find((item) => item.id === id);
  if (!option) throw new Error(`Missing option ${id} for ${goal}`);
  return option;
}
