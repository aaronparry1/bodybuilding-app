import { describe, expect, it } from "vitest";
import {
  applyCanonicalSessionMethodStructures,
  CANONICAL_TRAINING_METHOD_CONTRACT_VERSION,
  canonicalTrainingMethodDefinitions,
  resolveCanonicalTrainingMethod,
} from "@/domain/training/canonical-training-method-policy";
import { projectCanonicalWorkoutPresentation } from "@/application/training/canonical-workout-presentation";
import { deriveCanonicalNextSetInstruction } from "@/application/training/canonical-recorded-session-application";
import { exerciseLibrary } from "@/domain/training/presets";

describe("canonical training-method policy", () => {
  it("accounts for every requested method and fails unsupported contracts closed", () => {
    expect(canonicalTrainingMethodDefinitions.map((definition) => definition.method)).toEqual([
      "straight_sets", "back_off_sets", "amrap", "five_three_one", "eight_across", "pyramid", "ladder",
      "cluster", "bbb", "dynamic_effort", "max_effort", "heavy_single_triple_five_backoffs",
      "antagonist_superset", "rest_pause", "same_region_superset", "triset", "myo_reps", "drop_set",
      "capped_amrap", "ten_by_ten", "high_rep_finisher",
    ]);
    for (const definition of canonicalTrainingMethodDefinitions) {
      expect(definition.fatigueBoundary).toBeTruthy();
      expect(definition.maximumFrequency).toBeTruthy();
      expect(definition.exitRule).toBeTruthy();
      expect(definition.durationEffect).toBeTruthy();
      expect(definition.provenance.length).toBeGreaterThan(0);
      if (definition.status === "supported") {
        expect(definition.eligibleExperience.length).toBeGreaterThan(0);
        expect(definition.exactConstructionOwner).toBeTruthy();
        expect(definition.restOwner).toBeTruthy();
        expect(definition.progressionOwner).toBeTruthy();
        expect(definition.stopRuleOwner).toBeTruthy();
      } else {
        expect(definition.maximumFrequency).toBe("zero");
        expect(definition.exactConstructionOwner).toBeNull();
      }
    }
  });

  it("keeps first-exposure and recovery-restricted work repeatable, while selecting approved later-phase methods", () => {
    const bench = exercise("ex-bench-press");
    expect(resolveCanonicalTrainingMethod(selection(bench, {
      mesocycleId: "hypertrophy_calibration",
      exerciseRole: "primary_compound",
      loadState: "calibration_required",
      permittedMethods: ["straight_sets"],
    }))).toMatchObject({ method: "straight_sets" });
    expect(resolveCanonicalTrainingMethod(selection(bench, {
      mesocycleId: "strength_accumulation",
      exerciseRole: "primary_compound",
      requiredSets: 3,
      permittedMethods: ["straight_sets", "five_three_one"],
    }))).toMatchObject({ method: "five_three_one" });
    expect(resolveCanonicalTrainingMethod(selection(bench, {
      mesocycleId: "strength_accumulation",
      exerciseRole: "primary_compound",
      requiredSets: 3,
      permittedMethods: ["straight_sets", "five_three_one"],
      readiness: "restricted",
    }))).toMatchObject({ method: "straight_sets", reasonCodes: ["fatigue_or_recovery_requires_repeatable_straight_sets"] });
  });

  it("links exactly one safe antagonist pair without changing either exercise dose", () => {
    const press = exercise("ex-incline-dumbbell-press");
    const row = exercise("ex-chest-supported-row");
    const structures = applyCanonicalSessionMethodStructures({
      goal: "build_muscle",
      mesocycleId: "hypertrophy_volume",
      specialState: "none",
      experience: "intermediate",
      readiness: "ready",
      slots: [
        sessionSlot("press", 0, press, "straight_sets", 3, 10, 90, "established"),
        sessionSlot("row", 1, row, "straight_sets", 3, 10, 90, "established"),
      ],
    });
    expect(structures.map((slot) => [slot.method, slot.structure.kind, slot.structure.rounds])).toEqual([
      ["antagonist_superset", "linked_rounds", 3],
      ["antagonist_superset", "linked_rounds", 3],
    ]);
    expect(structures[0]?.structure).toMatchObject({ position: 1, intraMethodRestSeconds: 0, interRoundRestSeconds: 60, pairedExerciseName: "Chest Supported Row" });
    expect(structures[1]?.structure).toMatchObject({ position: 2, intraMethodRestSeconds: 0, interRoundRestSeconds: 60, pairedExerciseName: "Incline Dumbbell Press" });
    expect(structures[0]?.structure.contract).toMatchObject({ contractVersion: CANONICAL_TRAINING_METHOD_CONTRACT_VERSION, progressionRule: "progress each paired exercise independently", setRoles: ["standard", "standard", "standard"] });
  });

  it("uses the source-bounded rest-pause structure only with compatible established-load accessory work", () => {
    const row = exercise("ex-one-arm-cable-row");
    const eligible = applyCanonicalSessionMethodStructures({
      goal: "build_muscle",
      mesocycleId: "hypertrophy_volume",
      specialState: "none",
      experience: "intermediate",
      readiness: "ready",
      slots: [sessionSlot("row", 0, row, "amrap", 3, 10, 90, "established")],
    });
    expect(eligible[0]).toMatchObject({
      method: "rest_pause",
      structure: { kind: "rest_pause", rounds: 3, activationReps: 10, miniSetTargetReps: 4, minimumMiniSetReps: 3, maximumMiniSets: 2, intraMethodRestSeconds: 20, interRoundRestSeconds: 90 },
    });
    const missingLoad = applyCanonicalSessionMethodStructures({
      goal: "build_muscle",
      mesocycleId: "hypertrophy_volume",
      specialState: "none",
      experience: "intermediate",
      readiness: "ready",
      slots: [sessionSlot("row", 0, row, "amrap", 3, 10, 90, "calibration_required")],
    });
    expect(missingLoad[0]).toMatchObject({ method: "amrap", structure: { kind: "standalone" } });
    expect(eligible[0]?.structure.contract).toMatchObject({ setRoles: ["activation", "mini_set", "mini_set"], evidenceAuthorityVersion: "canonical_progress_evidence_v1" });
  });

  it("distinguishes one top set from its back-offs in the additive method contract", () => {
    const bench = exercise("ex-bench-press");
    const [structured] = applyCanonicalSessionMethodStructures({ goal: "build_muscle_and_strength", mesocycleId: "powerbuilding_strength", specialState: "none", experience: "intermediate", readiness: "ready", slots: [sessionSlot("bench", 0, bench, "back_off_sets", 4, 5, 150, "established")] });
    expect(structured).toMatchObject({ method: "back_off_sets", structure: { executionLabel: "1 top set · 3 back-off sets", contract: { setRoles: ["top_set", "back_off", "back_off", "back_off"], loadMultipliers: [1, 0.9, 0.9, 0.9], progressionRule: "evaluate the top set and back-offs separately; change the smallest supported variable" } } });
    const projected = projectCanonicalWorkoutPresentation({ session: null, snapshot: { schemaVersion: "canonical_session_snapshot_v3", sessionId: "top-backoff", role: "Strength", slots: [{ id: "bench", index: 0, exerciseId: bench.id, method: "back_off_sets", prescribedLoad: 100, loadingMode: "external_load", settings: { requiredSets: 4, repRange: { min: 5, max: 8 } }, exactTargets: [5, 7, 7, 7], rest: { seconds: 150 }, loadPrescription: { state: "established", loadingMode: "external_load", prescribedBaseLoad: 100, rounding: { increment: 2.5 } }, methodStructure: structured!.structure }] } });
    expect(projected.exercises[0]?.sets.map((set) => [set.role, set.prescribedLoad])).toEqual([["top_set", 100], ["back_off", 90], ["back_off", 90], ["back_off", 90]]);
  });

  it("projects linked rounds in executable A1/B1/A2/B2 order and rest-pause rounds explicitly", () => {
    const linked = linkedSnapshot();
    const first = projectCanonicalWorkoutPresentation({ session: null, snapshot: linked });
    expect(first.exercises[0]?.sets[0]?.state).toBe("current");
    expect(first.exercises[1]?.sets[0]?.state).toBe("upcoming");
    const session = recordedSession(linked);
    const afterA1 = projectCanonicalWorkoutPresentation({
      session,
      snapshot: linked,
      events: [performanceEvent(session.recordedSessionId, "press:set:1", "press", 1)],
    });
    expect(afterA1.exercises[1]?.sets[0]?.state).toBe("current");
    expect(afterA1.exercises[0]?.sets[1]?.state).toBe("upcoming");
    expect(afterA1.exercises[0]?.methodExecution).toMatchObject({ kind: "linked_rounds", sequenceLabel: "A", intraMethodRestSeconds: 0, interRoundRestSeconds: 60 });

    const restPause = projectCanonicalWorkoutPresentation({ session: null, snapshot: restPauseSnapshot() });
    expect(restPause.exercises[0]?.method).toBe("Rest-pause");
    expect(restPause.exercises[0]?.sets.map((set) => set.target)).toEqual([
      "Activation · 10 reps",
      "Mini-set 1 · 4 reps · 20 sec",
      "Mini-set 2 · 4 reps · 20 sec",
    ]);
  });

  it("drives intra-pair, inter-round, and rest-pause timer instructions from the immutable structure", () => {
    const linked = linkedSnapshot();
    expect(deriveCanonicalNextSetInstruction(linked, "press", 1, 10, 30)).toEqual({
      text: "Move directly to Chest Supported Row · round 1",
      restSeconds: 0,
    });
    expect(deriveCanonicalNextSetInstruction(linked, "row", 1, 10, 30)).toEqual({
      text: "Rest 60 sec, then start paired round 2",
      restSeconds: 60,
    });
    expect(deriveCanonicalNextSetInstruction(restPauseSnapshot(), "row", 1, 10, 30)).toEqual({
      text: "Rest 20 sec, then complete mini-set 1 for 4 clean reps",
      restSeconds: 20,
    });
  });
});

function exercise(id: string) {
  const item = exerciseLibrary.find((candidate) => candidate.id === id);
  if (!item) throw new Error(`missing exercise ${id}`);
  return item;
}

function selection(item: ReturnType<typeof exercise>, overrides: Partial<Parameters<typeof resolveCanonicalTrainingMethod>[0]>) {
  return {
    goal: "build_muscle",
    mesocycleId: "hypertrophy_volume" as const,
    specialState: "none",
    experience: "intermediate" as const,
    exercise: item,
    exerciseRole: item.role,
    sessionRole: "Upper",
    requiredSets: 3,
    targetReps: 10,
    loadState: "established",
    readiness: "ready" as const,
    permittedMethods: ["straight_sets", "amrap"] as const,
    ...overrides,
  };
}

function sessionSlot(id: string, index: number, item: ReturnType<typeof exercise>, method: "straight_sets" | "amrap" | "back_off_sets", requiredSets: number, targetReps: number, restSeconds: number, loadState: string) {
  return { id, index, exercise: item, method, requiredSets, targetReps, restSeconds, loadState };
}

function baseSlot(id: string, index: number, exerciseId: string, methodStructure: Record<string, unknown>) {
  return {
    id,
    index,
    exerciseId,
    method: "antagonist_superset",
    loadingMode: "rep_progression",
    prescribedLoad: 30,
    settings: { requiredSets: 3, repRange: { min: 10, max: 10 } },
    exactTargets: [10, 10, 10],
    rest: { seconds: methodStructure.position === 1 ? 0 : 60 },
    methodStructure,
  };
}

function linkedSnapshot() {
  const policyId = "canonical_training_method_policy_v1";
  const groupId = "method-group:press:row";
  return {
    schemaVersion: "canonical_session_snapshot_v3",
    sessionId: "planned:linked",
    role: "Upper",
    slots: [
      baseSlot("press", 0, "ex-incline-dumbbell-press", { kind: "linked_rounds", policyId, method: "antagonist_superset", groupId, position: 1, groupSize: 2, rounds: 3, intraMethodRestSeconds: 0, interRoundRestSeconds: 60, pairedExerciseName: "Chest Supported Row", executionLabel: "A · 3 rounds · Incline Dumbbell Press + Chest Supported Row" }),
      baseSlot("row", 1, "ex-chest-supported-row", { kind: "linked_rounds", policyId, method: "antagonist_superset", groupId, position: 2, groupSize: 2, rounds: 3, intraMethodRestSeconds: 0, interRoundRestSeconds: 60, pairedExerciseName: "Incline Dumbbell Press", executionLabel: "B · 3 rounds · Incline Dumbbell Press + Chest Supported Row" }),
    ],
  };
}

function restPauseSnapshot() {
  return {
    schemaVersion: "canonical_session_snapshot_v3",
    sessionId: "planned:rest-pause",
    role: "Pull",
    slots: [{
      id: "row",
      index: 0,
      exerciseId: "ex-one-arm-cable-row",
      method: "rest_pause",
      loadingMode: "rep_progression",
      prescribedLoad: 30,
      settings: { requiredSets: 3, repRange: { min: 10, max: 10 } },
      exactTargets: [10, 4, 4],
      rest: { seconds: 90 },
      methodStructure: { kind: "rest_pause", policyId: "canonical_training_method_policy_v1", method: "rest_pause", rounds: 3, activationReps: 10, miniSetTargetReps: 4, minimumMiniSetReps: 3, maximumMiniSets: 2, intraMethodRestSeconds: 20, interRoundRestSeconds: 90, executionLabel: "10-rep activation · up to 2 × 4 mini-sets · 20 sec" },
    }],
  };
}

function recordedSession(snapshot: ReturnType<typeof linkedSnapshot>) {
  return {
    schemaVersion: "canonical_recorded_session_v1" as const,
    recordedSessionId: "recorded:linked",
    plannedSessionId: snapshot.sessionId,
    planId: "plan",
    startRevision: 1,
    macrocycleId: "macro",
    mesocycleId: "hypertrophy_volume",
    microcycleId: "micro",
    role: snapshot.role,
    prescriptionSnapshot: snapshot,
    prescriptionHash: JSON.stringify(snapshot),
    provenance: {},
    athleteId: "athlete",
    version: 2,
    status: "started" as const,
    createdAt: "2026-07-24T10:00:00.000Z",
  };
}

function performanceEvent(aggregateId: string, setId: string, slotId: string, setOrder: number) {
  return {
    eventId: `performance:${setId}`,
    aggregateId,
    expectedVersion: 1,
    type: "performance" as const,
    occurredAt: "2026-07-24T10:01:00.000Z",
    operationId: `operation:${setId}`,
    payload: { setId, slotId, setOrder, reps: 10, load: 30, unit: "kg", completion: "complete" },
  };
}
