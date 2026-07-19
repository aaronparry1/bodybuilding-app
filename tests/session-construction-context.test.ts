import { describe, expect, it } from "vitest";
import { resolveMesocyclePrescriptionPolicy } from "@/domain/training/mesocycle-prescription-policy";
import { createMicrocycle } from "@/domain/training/microcycle-scheduler";
import { createMacrocycle } from "@/domain/training/macrocycle-engine";
import { exerciseLibrary } from "@/domain/training/presets";
import { validateSessionConstructionContext, type SessionConstructionContext } from "@/domain/training/session-construction-context";

function context(): SessionConstructionContext {
  const policy = resolveMesocyclePrescriptionPolicy("powerbuilding_hypertrophy");
  if (policy.status !== "resolved") throw new Error("fixture policy failed");
  const microcycle = createMicrocycle({ parentMesocycleId: "powerbuilding_hypertrophy", trainingDays: 5, split: "push_pull_legs" });
  return { schemaVersion: "session_construction_context_v1", macrocycle: createMacrocycle("build_muscle_and_strength", "intermediate"), mesocycle: { id: "powerbuilding_hypertrophy", policy: policy.policy, position: 0 }, microcycle: { id: "context:microcycle:1", output: microcycle, currentRole: microcycle.sessionRoles[0]!, sessionIndex: 0, stressContext: "normal", recoveryDays: microcycle.recoveryDays }, athlete: { experienceLevel: "intermediate", daysPerWeek: 5, preferredSplit: "push_pull_legs", equipment: ["barbell", "dumbbell"], limitations: [], units: "kg", exercises: exerciseLibrary }, progress: { history: [] }, operational: { kind: "planned", identity: "context-fixture", version: "session_construction_v1" } };
}

describe("canonical SessionConstructionContext", () => {
  it("accepts canonical owner outputs", () => expect(validateSessionConstructionContext(context()).status).toBe("valid"));
  it("rejects legacy authority fields", () => expect(validateSessionConstructionContext({ ...context(), blocks: [] }).status).toBe("invalid"));
});
