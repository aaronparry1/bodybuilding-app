import { describe, expect, it } from "vitest";
import { createMacrocycle } from "@/domain/training/macrocycle-engine";
import { allMesocyclePrescriptionPolicies } from "@/domain/training/mesocycle-prescription-policy";
import { createMicrocycle } from "@/domain/training/microcycle-scheduler";
import { constructCanonicalSession, resolveCanonicalSessionIdentity, type CanonicalSessionConstructionInput } from "@/domain/training/canonical-session-construction-pipeline";

const policy = allMesocyclePrescriptionPolicies()[0]!;
const macrocycle = createMacrocycle("build_muscle", "intermediate");
const microcycle = createMicrocycle({ parentMesocycleId: policy.mesocycleId, trainingDays: 3, split: "push_pull_legs" });
const exercise = {
  id: "canonical-test-press", name: "Canonical test press", category: "chest", primaryMuscles: ["chest"], secondaryMuscles: [], equipment: ["barbell"], movementPattern: "horizontal_push", defaultRepRange: { min: 6, max: 12 }, defaultLoadJump: 2.5, unitCompatibility: ["kg"], kind: "barbell", role: "primary_compound", roles: ["primary_compound", "secondary_compound", "accessory", "isolation"], family: "horizontal_press", tier: "A", fatigueCost: "low", jointStress: "low", suitability: ["beginner", "intermediate", "advanced"], isBeginnerFriendly: true, isAdvanced: false, notes: [], suitableBlocks: [], swapTags: [], isCustom: false, defaultSettings: { repRange: { min: 6, max: 12 }, dropOffPercent: 0, loadIncrease: 2.5, unit: "kg", requiredWorkSets: 3 },
} as any;

function input(overrides: Partial<CanonicalSessionConstructionInput["progress"]> = {}): CanonicalSessionConstructionInput {
  const base = { evidenceVersion: "e1", history: [], establishedLoads: { [exercise.id]: 80 }, ...overrides };
  const provisional = { schemaVersion: "canonical_session_construction_input_v1" as const, macrocycle, mesocycle: { id: policy.mesocycleId, policy, position: 0 }, microcycle: { id: "micro-1", output: microcycle, sessionId: "", planSessionIndex: 0, sessionRole: "Push hypertrophy", sessionOrder: 0, stressIntent: "productive", recoveryDays: 2, kind: "planned" as const }, athlete: { experienceLevel: "intermediate" as const, preferredSplit: "push_pull_legs", equipment: ["barbell" as const], limitations: [], units: "kg" as const, exercises: [exercise] }, progress: base, operational: { constructionVersion: "v1", seed: "seed", identity: "", revision: "r1" } };
  const identity = resolveCanonicalSessionIdentity(provisional);
  return { ...provisional, microcycle: { ...provisional.microcycle, sessionId: identity }, operational: { ...provisional.operational, identity } };
}

describe("canonical session construction pipeline", () => {
  it("constructs without block or annual inputs", () => {
    const result = constructCanonicalSession(input());
    expect(result.status).toBe("constructed");
    if (result.status === "constructed") {
      expect(result.snapshot.schemaVersion).toBe("canonical_session_snapshot_v3");
      expect(result.snapshot.slots.length).toBeGreaterThan(0);
      expect(result.snapshot.slots[0]?.loadPrescription.state).toBe("calibration_required");
    }
  });

  it("fails closed when the exercise catalogue is empty", () => {
    const value = input();
    expect(constructCanonicalSession({ ...value, athlete: { ...value.athlete, exercises: [] } })).toEqual({ status: "blocked", reason: "invalid_input" });
  });

  it("keeps identity deterministic and microcycle-bound", () => {
    const value = input();
    expect(resolveCanonicalSessionIdentity(value)).toBe(resolveCanonicalSessionIdentity(value));
    expect(resolveCanonicalSessionIdentity({ ...value, microcycle: { ...value.microcycle, id: "micro-2" } })).not.toBe(resolveCanonicalSessionIdentity(value));
  });
});
