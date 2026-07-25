import { describe, expect, it } from "vitest";
import { createMacrocycle } from "@/domain/training/macrocycle-engine";
import { allMesocyclePrescriptionPolicies } from "@/domain/training/mesocycle-prescription-policy";
import { createMicrocycle } from "@/domain/training/microcycle-scheduler";
import { allocateCanonicalMicrocycleVolume } from "@/domain/training/canonical-microcycle-volume-allocator";
import {
  constructCanonicalSession,
  resolveCanonicalSessionIdentity,
  type CanonicalSessionConstructionInput,
} from "@/domain/training/canonical-session-construction-pipeline";
import { exerciseLibrary } from "@/domain/training/presets";

describe("production Session Construction method reachability", () => {
  it("keeps the first calibration exposure deliberately straight", () => {
    const result = construct("hypertrophy_calibration", 0, false);
    expect(result.status).toBe("constructed");
    if (result.status !== "constructed" || result.snapshot.schemaVersion !== "canonical_session_snapshot_v3") return;
    expect(new Set(result.snapshot.slots.map((slot) => slot.method))).toEqual(new Set(["straight_sets"]));
    expect(result.snapshot.slots.every((slot) => slot.methodStructure?.kind === "standalone")).toBe(true);
    expect(result.snapshot.slots.every((slot) => slot.loadPrescription.state === "calibration_required" || slot.loadPrescription.state === "bodyweight")).toBe(true);
  });

  it("emits an executable antagonist structure in an established later hypertrophy phase", () => {
    const result = construct("hypertrophy_volume", 0, true);
    expect(result.status).toBe("constructed");
    if (result.status !== "constructed" || result.snapshot.schemaVersion !== "canonical_session_snapshot_v3") return;
    const linked = result.snapshot.slots.filter((slot) => slot.methodStructure?.kind === "linked_rounds");
    expect(linked).toHaveLength(2);
    expect(linked.map((slot) => slot.method)).toEqual(["antagonist_superset", "antagonist_superset"]);
    expect(linked.map((slot) => slot.methodStructure?.kind === "linked_rounds" ? slot.methodStructure.position : null)).toEqual([1, 2]);
    expect(linked.map((slot) => slot.settings.requiredSets)).toEqual(linked.map((slot) => slot.methodStructure?.rounds));
  });

  it("emits the source-bounded rest-pause row in an established powerbuilding hypertrophy session", () => {
    const result = construct("powerbuilding_hypertrophy", 1, true);
    expect(result.status).toBe("constructed");
    if (result.status !== "constructed" || result.snapshot.schemaVersion !== "canonical_session_snapshot_v3") return;
    const restPause = result.snapshot.slots.filter((slot) => slot.methodStructure?.kind === "rest_pause");
    expect(restPause).toHaveLength(1);
    expect(restPause[0]).toMatchObject({
      method: "rest_pause",
      targetReps: 10,
      exactTargets: [10, 10, 10],
      methodStructure: { kind: "rest_pause", rounds: 3, segmentsPerRound: 10, intraMethodRestSeconds: 1 },
      loadPrescription: { state: "established" },
    });
  });

  it("does not introduce random method rotation for deep-equivalent inputs", () => {
    const first = construct("hypertrophy_volume", 0, true);
    const second = construct("hypertrophy_volume", 0, true);
    expect(first).toEqual(second);
  });
});

function construct(mesocycleId: "hypertrophy_calibration" | "hypertrophy_volume" | "powerbuilding_hypertrophy", planSessionIndex: number, established: boolean) {
  const policy = allMesocyclePrescriptionPolicies().find((candidate) => candidate.mesocycleId === mesocycleId);
  if (!policy) throw new Error(`missing policy ${mesocycleId}`);
  const powerbuilding = mesocycleId === "powerbuilding_hypertrophy";
  const macrocycleGoal = powerbuilding ? "build_muscle_and_strength" as const : "build_muscle" as const;
  const macrocycle = createMacrocycle(macrocycleGoal, "intermediate");
  const split = powerbuilding ? "let_app_choose" as const : "upper_lower" as const;
  const microcycle = createMicrocycle({ parentMesocycleId: mesocycleId, trainingDays: powerbuilding ? 5 : 4, split });
  const sessionRoles = microcycle.sessionRoles;
  const sessionTypes = microcycle.sessionTypes;
  const establishedLoads = Object.fromEntries(exerciseLibrary.map((exercise) => [exercise.id, 50]));
  const loadEvidence = Object.fromEntries(exerciseLibrary.map((exercise) => [exercise.id, {
    evidenceId: `evidence:${exercise.id}`,
    evidenceVersion: "load-evidence-v1",
    athleteId: "method-athlete",
    exerciseId: exercise.id,
    sourceSessionId: "prior-session",
    sourceSlotId: `prior-slot:${exercise.id}`,
    observedLoad: 50,
    observedReps: 10,
    baseUnit: "kg" as const,
    freshnessVersion: 1,
    calibrationStatus: "established" as const,
  }]));
  const allocation = allocateCanonicalMicrocycleVolume({
    macrocycleGoal,
    mesocycleId,
    mesocyclePurpose: policy.purpose,
    microcyclePriority: "productive hypertrophy",
    microcycleSequence: 1,
    experience: "intermediate",
    frequency: powerbuilding ? 5 : 4,
    split,
    equipment: ["barbell", "dumbbell", "machine", "cable", "bodyweight"],
    recoveryRestricted: false,
    establishedLoadExerciseIds: established ? exerciseLibrary.map((exercise) => exercise.id) : [],
    sessionRoles,
    sessionTypes,
  });
  const provisional: CanonicalSessionConstructionInput = {
    schemaVersion: "canonical_session_construction_input_v1",
    macrocycle,
    mesocycle: { id: mesocycleId, policy, position: mesocycleId === "hypertrophy_calibration" ? 0 : 1 },
    microcycle: {
      id: `method-microcycle:${mesocycleId}`,
      output: microcycle,
      sessionId: "",
      planSessionIndex,
      sessionRole: sessionRoles[planSessionIndex]!,
      sessionOrder: planSessionIndex,
      stressIntent: "productive",
      recoveryDays: 1,
      kind: "planned",
    },
    athlete: {
      experienceLevel: "intermediate",
      preferredSplit: split,
      equipment: ["barbell", "dumbbell", "machine", "cable", "bodyweight"],
      limitations: [],
      units: "kg",
      exercises: exerciseLibrary,
    },
    progress: {
      evidenceVersion: established ? "established-evidence-v1" : "first-exposure-v1",
      readiness: "ready",
      history: [],
      establishedLoads: established ? establishedLoads : {},
      loadEvidence: established ? loadEvidence : {},
    },
    operational: {
      constructionVersion: "canonical_plan_v3",
      seed: `method-seed:${mesocycleId}`,
      identity: "",
      revision: "method-revision-v1",
    },
    allocation,
    selectionContext: { weeklyExerciseUsage: {} },
  };
  const identity = resolveCanonicalSessionIdentity(provisional);
  return constructCanonicalSession({
    ...provisional,
    microcycle: { ...provisional.microcycle, sessionId: identity },
    operational: { ...provisional.operational, identity },
  });
}
