import { describe, expect, it } from "vitest";
import { factualExerciseMetadata, matchExerciseToMesocyclePolicy } from "@/domain/training/canonical-exercise-suitability";
import { resolveMesocyclePrescriptionPolicy } from "@/domain/training/mesocycle-prescription-policy";
import { exerciseLibrary } from "@/domain/training/presets";

describe("canonical exercise suitability", () => {
  it("uses factual exercise traits rather than phase labels", () => {
    const exercise = exerciseLibrary[0]!;
    const policy = resolveMesocyclePrescriptionPolicy("powerbuilding_hypertrophy");
    expect(policy.status).toBe("resolved");
    if (policy.status === "resolved") expect(matchExerciseToMesocyclePolicy(factualExerciseMetadata(exercise), policy.policy, "primary_compound", ["barbell", "dumbbell", "machine", "cable", "smith", "bodyweight", "bands", "other"]).status).not.toBe("ineligible");
  });
});
