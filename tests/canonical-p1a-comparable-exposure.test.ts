import { describe, expect, it } from "vitest";
import { constructCanonicalActivePlanFromCanonicalInputs } from "@/application/training/canonical-active-plan-construction";
import {
  applyCanonicalNumericDecisionsToPlannedSessions,
  canonicalComparableExposureKey,
  comparableExposureObservationFacts,
  deriveCanonicalNumericPrescriptionDecisions,
} from "@/domain/training/canonical-comparable-exposure-policy";
import type { CanonicalLoadEvidence } from "@/domain/training/canonical-load-prescription";
import type { CanonicalProgressEvidence } from "@/domain/training/canonical-progress-evidence";
import type { CanonicalRecordedSession } from "@/domain/training/canonical-recorded-session-ledger";
import { resolveMesocyclePrescriptionPolicy } from "@/domain/training/mesocycle-prescription-policy";
import { exerciseLibrary } from "@/domain/training/presets";

describe("P1A comparable exposure and bounded numeric policy", () => {
  it("progresses exact repetitions after three comparable successful completed exposures", () => {
    const fixture = fixtureForStraightSets();
    const evidence = exposureHistory(fixture, [
      { id: "one", repsOffset: 0 },
      { id: "two", repsOffset: 0 },
      { id: "three", repsOffset: 0 },
    ]);
    const decisions = derive(fixture, evidence, "three");
    const decision = decisions.find((item) => item.exerciseId === fixture.slot.exerciseId);
    expect(decision).toMatchObject({
      outcome: "progress_repetitions",
      exposureCount: 3,
      successfulExposureCount: 3,
      reasonCode: "three_comparable_successful_exposures_progress_repetitions",
    });
    expect(decision?.after?.prescribedBaseLoad).toBe(decision?.before.prescribedBaseLoad);
    expect(decision?.after?.exactTargets).toEqual(decision?.before.exactTargets.map((value) => value + 1));
  });

  it("requires three completed comparable exposures and treats two as insufficient", () => {
    const fixture = fixtureForStraightSets();
    const evidence = exposureHistory(fixture, [
      { id: "one", repsOffset: 0 },
      { id: "two", repsOffset: 0 },
    ]);
    expect(derive(fixture, evidence, "two").find((item) => item.exerciseId === fixture.slot.exerciseId)).toMatchObject({
      outcome: "insufficient_evidence",
      exposureCount: 2,
    });
  });

  it("regresses exact repetitions only after repeated comparable underperformance", () => {
    const fixture = fixtureForStraightSets();
    const evidence = exposureHistory(fixture, [
      { id: "one", repsOffset: 0 },
      { id: "two", repsOffset: -1 },
      { id: "three", repsOffset: -1 },
    ]);
    const decision = derive(fixture, evidence, "three").find((item) => item.exerciseId === fixture.slot.exerciseId);
    expect(decision?.outcome).toBe("regress_repetitions");
    expect(decision?.after?.exactTargets).toEqual(decision?.before.exactTargets.map((value) => Math.max(fixture.envelopeMin, value - 1)));
  });

  it("progresses load by the exercise increment and resets repetitions only after the repetition ceiling is earned", () => {
    const base = fixtureForStraightSets();
    const fixture = fixtureWithExactTarget(base, base.envelopeMax);
    const evidence = exposureHistory(fixture, [
      { id: "one", repsOffset: 0 },
      { id: "two", repsOffset: 0 },
      { id: "three", repsOffset: 0 },
    ]);
    const decision = derive(fixture, evidence, "three").find((item) => item.exerciseId === fixture.slot.exerciseId);
    const increment = Number(((fixture.slot.loadPrescription as Record<string, unknown>).rounding as Record<string, unknown>).increment);
    expect(decision).toMatchObject({
      outcome: "progress_load",
      after: {
        prescribedBaseLoad: decision!.before.prescribedBaseLoad + increment,
        exactTargets: decision!.before.exactTargets.map(() => fixture.envelopeMin),
      },
    });
  });

  it("regresses load by one available increment only after repeated failures at the repetition floor", () => {
    const base = fixtureForStraightSets();
    const fixture = fixtureWithExactTarget(base, base.envelopeMin);
    const evidence = exposureHistory(fixture, [
      { id: "one", repsOffset: 0 },
      { id: "two", repsOffset: -1 },
      { id: "three", repsOffset: -1 },
    ]);
    const decision = derive(fixture, evidence, "three").find((item) => item.exerciseId === fixture.slot.exerciseId);
    const increment = Number(((fixture.slot.loadPrescription as Record<string, unknown>).rounding as Record<string, unknown>).increment);
    expect(decision).toMatchObject({
      outcome: "regress_load",
      after: {
        prescribedBaseLoad: decision!.before.prescribedBaseLoad - increment,
        exactTargets: decision!.before.exactTargets,
      },
    });
  });

  it("holds after one anomalous underperformance", () => {
    const fixture = fixtureForStraightSets();
    const evidence = exposureHistory(fixture, [
      { id: "one", repsOffset: 0 },
      { id: "two", repsOffset: 0 },
      { id: "three", repsOffset: -1 },
    ]);
    expect(derive(fixture, evidence, "three").find((item) => item.exerciseId === fixture.slot.exerciseId)).toMatchObject({
      outcome: "hold",
      reasonCode: "single_or_nonconsecutive_underperformance",
    });
  });

  it("keeps generated persistence identity out of comparable exposure identity", () => {
    const fixture = fixtureForStraightSets();
    const input = semanticKeyInput(fixture);
    const original = canonicalComparableExposureKey(input);
    for (const churn of [
      { sessionId: "new-session" },
      { slotId: "new-slot" },
      { exerciseInstanceId: "new-instance" },
      { groupId: "new-group" },
      { revision: 99 },
      { timestamp: "2099-01-01T00:00:00.000Z" },
      { unit: "lb" },
    ]) {
      expect(canonicalComparableExposureKey({ ...input, ...churn })).toBe(original);
    }
  });

  it.each([
    ["exercise identity", { exerciseId: "different-exercise" }],
    ["plan session index", { planSessionIndex: 99 }],
    ["session role", { sessionRole: "different-role" }],
    ["construction role", { constructionRole: "secondary" }],
    ["exercise role", { exerciseRole: "isolation" }],
    ["lane", { lane: "strength" }],
    ["method", { method: "back_off_sets" }],
    ["method semantics", { methodSemantic: "{\"kind\":\"rest_pause\"}" }],
    ["progression rule", { progressionRule: "load_progression" }],
    ["working-set count", { prescribedSets: 99 }],
    ["load state", { loadState: "weighted_bodyweight" }],
    ["loading mode", { loadingMode: "bodyweight_plus_external" }],
    ["substitution constraints", { substitutionConstraints: ["shoulder"] }],
    ["mesocycle", { mesocycleId: "different-mesocycle" }],
  ])("treats %s as semantic comparability", (_label, mutation) => {
    const fixture = fixtureForStraightSets();
    const input = semanticKeyInput(fixture);
    expect(canonicalComparableExposureKey({ ...input, ...mutation })).not.toBe(canonicalComparableExposureKey(input));
  });

  it.each([
    ["incomplete set", { completion: "partial" }],
    ["discard-like missing completion", { omitCompletion: true }],
    ["pounds stored as base evidence", { unit: "lb" }],
    ["zero load", { load: 0 }],
    ["substitution", { substitutionId: "substitution" }],
    ["duplicate set order", { duplicateSetOrder: true }],
  ])("fails closed for %s", (_label, mutation) => {
    const fixture = fixtureForStraightSets();
    const evidence = exposureHistory(fixture, [
      { id: "one", repsOffset: 0 },
      { id: "two", repsOffset: 0 },
      { id: "three", repsOffset: 0, ...mutation },
    ]);
    expect(derive(fixture, evidence, "three").find((item) => item.exerciseId === fixture.slot.exerciseId)?.outcome).toBe("factual_review_required");
  });

  it("does not apply an adjustment unless one unambiguous future semantic slot exists", () => {
    const fixture = fixtureForStraightSets();
    const evidence = exposureHistory(fixture, [
      { id: "one", repsOffset: 0 },
      { id: "two", repsOffset: 0 },
      { id: "three", repsOffset: 0 },
    ]);
    const decision = derive(fixture, evidence, "three").find((item) => item.exerciseId === fixture.slot.exerciseId)!;
    const applied = applyCanonicalNumericDecisionsToPlannedSessions(fixture.plan.plannedSessions, [decision]);
    expect(applied.applied).toHaveLength(1);
    expect(applied.unresolved).toHaveLength(0);
    const session = applied.sessions.find((item) => item.planSessionIndex === decision.planSessionIndex)!;
    const slot = slots(session.prescriptionSnapshot).find((item) => item.exerciseId === decision.exerciseId)!;
    expect(slot.exactTargets).toEqual(decision.after?.exactTargets);
    expect((slot.loadPrescription as Record<string, unknown>).prescribedBaseLoad).toBe(decision.after?.prescribedBaseLoad);

    const missing = applyCanonicalNumericDecisionsToPlannedSessions(
      fixture.plan.plannedSessions,
      [{ ...decision, exerciseId: "missing-exercise" }],
    );
    expect(missing.applied).toHaveLength(0);
    expect(missing.unresolved).toHaveLength(1);

    const duplicate = applyCanonicalNumericDecisionsToPlannedSessions(
      [...fixture.plan.plannedSessions, fixture.planned],
      [decision],
    );
    expect(duplicate.applied).toHaveLength(0);
    expect(duplicate.unresolved).toEqual([decision]);
  });

  it("does not treat repetitions performed at a different load as comparable success or failure", () => {
    const fixture = fixtureForStraightSets();
    const prescribed = Number((fixture.slot.loadPrescription as Record<string, unknown>).prescribedBaseLoad);
    const evidence = exposureHistory(fixture, [
      { id: "one", repsOffset: 0 },
      { id: "two", repsOffset: 0 },
      { id: "three", repsOffset: 0, load: prescribed - 5 },
    ]);
    expect(derive(fixture, evidence, "three").find((item) => item.exerciseId === fixture.slot.exerciseId)).toMatchObject({
      outcome: "factual_review_required",
      reasonCode: "completed_exposure_facts_invalid",
    });
  });

  it("treats a swallowed or rounded numeric request as a semantic no-op", () => {
    const fixture = fixtureForStraightSets();
    const evidence = exposureHistory(fixture, [
      { id: "one", repsOffset: 0 },
      { id: "two", repsOffset: 0 },
      { id: "three", repsOffset: 0 },
    ]);
    const decision = derive(fixture, evidence, "three").find((item) => item.exerciseId === fixture.slot.exerciseId)!;
    const noOp = { ...decision, after: decision.before };
    const result = applyCanonicalNumericDecisionsToPlannedSessions(fixture.plan.plannedSessions, [noOp]);
    expect(result.applied).toEqual([]);
    expect(result.unresolved).toEqual([]);
    expect(result.sessions).toEqual(fixture.plan.plannedSessions);
  });

  it("prohibits automatic numeric change in deload, taper, peak and grouped methods", () => {
    const fixture = fixtureForStraightSets();
    const evidence = exposureHistory(fixture, [
      { id: "one", repsOffset: 0 },
      { id: "two", repsOffset: 0 },
      { id: "three", repsOffset: 0 },
    ]);
    for (const specialState of ["deload", "taper", "peak", "transition"] as const) {
      const policy = { ...fixture.policy, specialState };
      const session = sessionFor(fixture, "three");
      const result = deriveCanonicalNumericPrescriptionDecisions({ session, evidence, policy });
      expect(result.find((item) => item.exerciseId === fixture.slot.exerciseId)?.outcome).toBe("phase_prohibited");
    }
    const groupedSnapshot = {
      ...fixture.snapshot,
      slots: slots(fixture.snapshot).map((slot) => slot.exerciseId === fixture.slot.exerciseId
        ? { ...slot, method: "antagonist_superset", methodStructure: { kind: "linked_rounds", groupSize: 2, position: 1, rounds: 3, policyId: "canonical_training_method_policy_v1" } }
        : slot),
    };
    const groupedSession = { ...sessionFor(fixture, "three"), prescriptionSnapshot: groupedSnapshot };
    expect(deriveCanonicalNumericPrescriptionDecisions({ session: groupedSession, evidence, policy: fixture.policy }).find((item) => item.exerciseId === fixture.slot.exerciseId)?.outcome).toBe("phase_prohibited");
  });

  it("treats generated-id churn combined with a genuine performance trend as one genuine semantic adjustment", () => {
    const fixture = fixtureForStraightSets();
    const evidence = exposureHistory(fixture, [
      { id: "one", repsOffset: 0, generatedId: "a" },
      { id: "two", repsOffset: 0, generatedId: "b" },
      { id: "three", repsOffset: 0, generatedId: "c" },
    ]);
    const decision = derive(fixture, evidence, "three").find((item) => item.exerciseId === fixture.slot.exerciseId);
    expect(decision?.outcome).toMatch(/^progress_/);
    expect(decision?.evidenceIds).toHaveLength(Number((fixture.slot.settings as Record<string, unknown>).requiredSets) * 3);
  });
});

type Fixture = ReturnType<typeof fixtureForStraightSets>;

function fixtureForStraightSets() {
  const establishedLoads = Object.fromEntries(exerciseLibrary.map((exercise) => [exercise.id, 60]));
  const loadEvidence = Object.fromEntries(exerciseLibrary.map((exercise) => [exercise.id, initialEvidence(exercise.id, 60)]));
  const result = constructCanonicalActivePlanFromCanonicalInputs({
    planId: "p1a-plan",
    createdAt: "2026-07-27T08:00:00.000Z",
    updatedAt: "2026-07-27T08:00:00.000Z",
    goal: "hypertrophy",
    macrocycleGoal: "build_muscle",
    experienceLevel: "intermediate",
    daysPerWeek: 3,
    preferredSplit: "let_app_choose",
    equipment: ["barbell", "dumbbell", "machine", "cable", "bodyweight"],
    units: "kg",
    exercises: exerciseLibrary,
    establishedLoads,
    loadEvidence,
  });
  if (result.status !== "constructed") throw new Error(result.reason);
  const session = result.carrier.plannedSessions.find((candidate) =>
    slots(candidate.prescriptionSnapshot).some((slot) => slot.method === "straight_sets"
      && (slot.progression as Record<string, unknown>).rule === "rep_progression"
      && (slot.loadPrescription as Record<string, unknown>).state === "established")
  );
  if (!session) throw new Error("canonical construction produced no eligible straight-set exposure");
  const snapshot = session.prescriptionSnapshot;
  const slot = slots(snapshot).find((candidate) => candidate.method === "straight_sets"
    && (candidate.progression as Record<string, unknown>).rule === "rep_progression"
    && (candidate.loadPrescription as Record<string, unknown>).state === "established")!;
  const policyResult = resolveMesocyclePrescriptionPolicy(result.carrier.mesocycle.id);
  if (policyResult.status !== "resolved") throw new Error(policyResult.reason);
  const envelope = (policyResult.policy.targetEnvelopes[
    String(slot.constructionRole) as "primary" | "secondary" | "accessory"
  ] as Readonly<Record<string, Readonly<{ minReps: number; maxReps: number }> | undefined>>)[String(slot.lane)];
  if (!envelope) throw new Error("envelope missing");
  return {
    plan: result.carrier,
    planned: session,
    snapshot,
    slot,
    policy: policyResult.policy,
    envelopeMin: envelope.minReps,
    envelopeMax: envelope.maxReps,
  };
}

function fixtureWithExactTarget(fixture: Fixture, target: number): Fixture {
  const requiredSets = Number((fixture.slot.settings as Record<string, unknown>).requiredSets);
  const changedSlot = {
    ...fixture.slot,
    targetReps: target,
    exactTargets: Array.from({ length: requiredSets }, () => target),
  };
  const changedSnapshot = {
    ...fixture.snapshot,
    slots: slots(fixture.snapshot).map((slot) =>
      slot.id === fixture.slot.id ? changedSlot : slot),
  };
  const changedPlanned = {
    ...fixture.planned,
    prescriptionSnapshot: changedSnapshot,
  };
  return {
    ...fixture,
    slot: changedSlot,
    snapshot: changedSnapshot,
    planned: changedPlanned,
    plan: {
      ...fixture.plan,
      plannedSessions: fixture.plan.plannedSessions.map((session) =>
        session.id === fixture.planned.id ? changedPlanned : session),
    },
  } as Fixture;
}

function exposureHistory(
  fixture: Fixture,
  inputs: readonly Readonly<{
    id: string;
    repsOffset: number;
    completion?: string;
    omitCompletion?: boolean;
    unit?: string;
    load?: number;
    substitutionId?: string;
    duplicateSetOrder?: boolean;
    generatedId?: string;
  }>[],
): CanonicalProgressEvidence[] {
  return inputs.flatMap((input, exposureIndex) => {
    const sessionId = `recorded-${input.id}`;
    const requiredSets = Number((fixture.slot.settings as Record<string, unknown>).requiredSets);
    const targets = Array.isArray(fixture.slot.exactTargets) ? fixture.slot.exactTargets as number[] : [];
    const facts = comparableExposureObservationFacts({
      ...(fixture.snapshot as Record<string, unknown>),
      mesocycleId: fixture.plan.mesocycle.id,
    }, fixture.slot);
    const performed = Array.from({ length: requiredSets }, (_, index): CanonicalProgressEvidence => ({
      schemaVersion: "canonical_progress_evidence_v1",
      evidenceId: `${sessionId}:set:${index + 1}`,
      planId: fixture.plan.planId,
      planRevision: exposureIndex,
      macrocycleId: fixture.plan.macrocycle.id,
      mesocycleId: fixture.plan.mesocycle.id,
      microcycleId: `microcycle-${exposureIndex + 1}`,
      sessionId,
      slotId: input.generatedId ?? String(fixture.slot.id),
      athleteId: "p1a-athlete",
      observedAt: `2026-07-${String(10 + exposureIndex).padStart(2, "0")}T09:${String(index).padStart(2, "0")}:00.000Z`,
      source: `synthetic-ledger:${sessionId}`,
      kind: "performance",
      observations: {
        ...facts,
        exerciseId: String(fixture.slot.exerciseId),
        slotId: input.generatedId ?? String(fixture.slot.id),
        loadingMode: String((fixture.slot.loadPrescription as Record<string, unknown>).loadingMode),
        method: String(fixture.slot.method),
        methodExecutionKind: "standalone",
        methodPolicyId: "canonical_training_method_policy_v1",
        loadState: "established",
        progressionRule: String((fixture.slot.progression as Record<string, unknown>).rule),
        prescribedSets: requiredSets,
        prescribedTargetReps: Number(targets[index] ?? fixture.slot.targetReps),
        stopThreshold: null,
        setOrder: input.duplicateSetOrder && index === requiredSets - 1 ? 1 : index + 1,
        reps: Number(targets[index] ?? fixture.slot.targetReps) + input.repsOffset,
        load: input.load ?? Number((fixture.slot.loadPrescription as Record<string, unknown>).prescribedBaseLoad),
        unit: input.unit ?? "kg",
        completion: input.completion ?? "complete",
        substitutionId: input.substitutionId ?? null,
      },
      evidenceVersion: "progress_v1",
    }));
    const completion: CanonicalProgressEvidence[] = input.omitCompletion ? [] : [{
      schemaVersion: "canonical_progress_evidence_v1",
      evidenceId: `${sessionId}:completion`,
      planId: fixture.plan.planId,
      planRevision: exposureIndex,
      macrocycleId: fixture.plan.macrocycle.id,
      mesocycleId: fixture.plan.mesocycle.id,
      microcycleId: `microcycle-${exposureIndex + 1}`,
      sessionId,
      athleteId: "p1a-athlete",
      observedAt: `2026-07-${String(10 + exposureIndex).padStart(2, "0")}T10:00:00.000Z`,
      source: `synthetic-ledger:${sessionId}`,
      kind: "completion",
      observations: { completion: "complete" },
      evidenceVersion: "progress_v1",
    }];
    return [...performed, ...completion];
  });
}

function derive(fixture: Fixture, evidence: readonly CanonicalProgressEvidence[], currentId: string) {
  return deriveCanonicalNumericPrescriptionDecisions({
    session: sessionFor(fixture, currentId),
    evidence,
    policy: fixture.policy,
  });
}

function sessionFor(fixture: Fixture, id: string): CanonicalRecordedSession {
  return {
    schemaVersion: "canonical_recorded_session_v1",
    recordedSessionId: `recorded-${id}`,
    plannedSessionId: fixture.planned.id,
    planId: fixture.plan.planId,
    startRevision: 0,
    macrocycleId: fixture.plan.macrocycle.id,
    mesocycleId: fixture.plan.mesocycle.id,
    microcycleId: `microcycle-${id}`,
    role: fixture.planned.role,
    prescriptionSnapshot: fixture.snapshot,
    prescriptionHash: JSON.stringify(fixture.snapshot),
    provenance: { constructionVersion: fixture.planned.constructionVersion },
    athleteId: "p1a-athlete",
    version: 1,
    status: "completed",
    createdAt: "2026-07-10T08:00:00.000Z",
  };
}

function semanticKeyInput(fixture: Fixture) {
  const facts = comparableExposureObservationFacts({
    ...(fixture.snapshot as Record<string, unknown>),
    mesocycleId: fixture.plan.mesocycle.id,
  }, fixture.slot);
  return {
    mesocycleId: fixture.plan.mesocycle.id,
    exerciseId: String(fixture.slot.exerciseId),
    planSessionIndex: Number(facts.planSessionIndex),
    sessionRole: String(facts.sessionRole),
    constructionRole: String(facts.constructionRole),
    exerciseRole: String(facts.exerciseRole),
    lane: String(facts.lane),
    method: String(fixture.slot.method),
    methodSemantic: String(facts.methodSemantic),
    progressionRule: String((fixture.slot.progression as Record<string, unknown>).rule),
    prescribedSets: Number((fixture.slot.settings as Record<string, unknown>).requiredSets),
    loadState: String((fixture.slot.loadPrescription as Record<string, unknown>).state),
    loadingMode: String((fixture.slot.loadPrescription as Record<string, unknown>).loadingMode),
    substitutionConstraints: [...fixture.slot.substitutionConstraints as string[]],
  };
}

function initialEvidence(exerciseId: string, load: number): CanonicalLoadEvidence {
  return {
    evidenceId: `initial:${exerciseId}`,
    evidenceVersion: "initial_v1",
    athleteId: "p1a-athlete",
    exerciseId,
    observedLoad: load,
    observedReps: 8,
    baseUnit: "kg",
    freshnessVersion: 1,
    calibrationStatus: "established",
  };
}

function slots(snapshot: Readonly<Record<string, unknown>>): Record<string, unknown>[] {
  return Array.isArray(snapshot.slots) ? snapshot.slots as Record<string, unknown>[] : [];
}
