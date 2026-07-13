import { describe, expect, it } from "vitest";

import { resolveCurrentHypertrophyCalibrationProgrammeGuidance } from "@/domain/training/current-hypertrophy-calibration-programme-guidance-policy";

const input = {
  schemaVersion: "v1" as const,
  goal: "build_muscle",
  experienceLevel: "intermediate" as const,
  trainingDays: 4,
  split: "upper_lower",
  mesocyclePurpose: "hypertrophy_calibration" as const,
  microcyclePriority: "normal_productive",
  equipmentCapabilities: ["full_gym"],
  constructionPolicyVersion: "v1",
  guidancePolicyVersion: "v1",
};

const sessions = [
  ["upper-a", "Upper"],
  ["lower-a", "Lower"],
  ["upper-b", "Upper"],
  ["lower-b", "Lower"],
] as const;

function resolveSession(sessionIdentity: (typeof sessions)[number][0]) {
  const [, sessionRole] = sessions.find(([identity]) => identity === sessionIdentity)!;
  return resolveCurrentHypertrophyCalibrationProgrammeGuidance({
    ...input,
    sessionRole,
    sessionIdentity,
  });
}

function numericGuidanceTotal(definitions: readonly { recommendedMinSets: number; recommendedMaxSets: number }[]) {
  return definitions.reduce(
    (total, slot) => ({
      minimum: total.minimum + slot.recommendedMinSets,
      maximum: total.maximum + slot.recommendedMaxSets,
    }),
    { minimum: 0, maximum: 0 },
  );
}

describe("hypertrophy-calibration programme guidance", () => {
  it("locks numeric conservative guidance, including useful Lower-B knee-dominant repeat exposure", () => {
    const results = sessions.map(([sessionIdentity]) => resolveSession(sessionIdentity));
    expect(results.every((result) => result.status === "resolved")).toBe(true);

    const totals = results.map((result) => {
      if (result.status !== "resolved") throw new Error("expected calibration policy");
      return numericGuidanceTotal(result.definitions);
    });

    expect(totals).toEqual([
      { minimum: 7, maximum: 12 },
      { minimum: 6, maximum: 10 },
      { minimum: 7, maximum: 12 },
      { minimum: 6, maximum: 10 },
    ]);

    const lowerB = results[3];
    if (lowerB.status !== "resolved") throw new Error("expected Lower-B calibration policy");
    expect(lowerB.definitions.find((slot) => slot.ordinal === "02-knee-dominant")).toMatchObject({
      recommendedMinSets: 2,
      recommendedMaxSets: 3,
    });

    const fourSessionTotal = totals.reduce(
      (total, session) => ({
        minimum: total.minimum + session.minimum,
        maximum: total.maximum + session.maximum,
      }),
      { minimum: 0, maximum: 0 },
    );
    expect(fourSessionTotal).toEqual({ minimum: 26, maximum: 44 });
    expect(fourSessionTotal.maximum).toBeLessThan(58);
  });

  it("omits nonessential accessories without hidden set guidance or policy-generated identity", () => {
    const results = sessions.map(([sessionIdentity]) => resolveSession(sessionIdentity));
    const definitions = results.flatMap((result) => result.status === "resolved" ? result.definitions : []);
    const targetIds = definitions.map((definition) => definition.target.id);

    expect(targetIds).not.toContain("elbow_flexion");
    expect(targetIds).not.toContain("elbow_extension");
    expect(targetIds).not.toContain("trunk_stability");
    expect(targetIds).not.toContain("unilateral_knee_dominant");
    expect(targetIds).not.toContain("knee_extension");
    expect(definitions.every((definition) => !("id" in definition))).toBe(true);
    expect(definitions.every((definition) => !("selectedExerciseId" in definition))).toBe(true);
  });

  it("uses exact purpose dispatch", () => {
    expect(resolveCurrentHypertrophyCalibrationProgrammeGuidance({
      ...input,
      mesocyclePurpose: "hypertrophy",
      sessionRole: "Upper",
      sessionIdentity: "upper-a",
    })).toMatchObject({ status: "unsupported_mesocycle_purpose" });
  });
});
