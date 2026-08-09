import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { validateCanonicalTrainSetEntry } from "@/application/training/canonical-train-interaction";
import {
  canonicalComparableExposureKey,
  comparableExposureObservationFacts,
  deriveCanonicalNumericPrescriptionDecisions,
} from "@/domain/training/canonical-comparable-exposure-policy";
import type { CanonicalProgressEvidence } from "@/domain/training/canonical-progress-evidence";
import type { CanonicalRecordedSession } from "@/domain/training/canonical-recorded-session-ledger";
import { macrocycleEngineForGoal } from "@/domain/training/macrocycle-engine";
import {
  allMesocyclePrescriptionPolicies,
  resolveMesocyclePrescriptionPolicy,
} from "@/domain/training/mesocycle-prescription-policy";

const reportRoot = join(
  process.cwd(),
  "qa-reports/coaching-loop-p1a-policy-quality-closure",
);

describe("P1A policy-quality certification", () => {
  it("reconciles evaluator, application, CAS, target and field-delta counts without conflating them", () => {
    const counts = readJson<{
      successfulComparableJourney: Record<string, unknown>;
      repeatedUnderperformanceJourney: Record<string, unknown>;
      aggregateTargetedExecutions: Record<string, unknown>;
    }>("numeric-count-results.json");
    expect(counts.successfulComparableJourney).toEqual({
      evaluatorDecisions: 9,
      progressionDecisionRecords: 24,
      regressionDecisionRecords: 0,
      holdDecisionRecords: 0,
      applicationIntents: 3,
      successfulCasApplications: 3,
      affectedExercises: 13,
      affectedFuturePrescriptions: 13,
      affectedFutureSessions: 3,
      materialFieldDeltas: 13,
      progressionFieldDeltas: 13,
      regressionFieldDeltas: 0,
      receipts: 9,
      duplicateOrReplayedDecisions: 0,
    });
    expect(counts.repeatedUnderperformanceJourney).toEqual({
      evaluatorDecisions: 21,
      progressionDecisionRecords: 76,
      regressionDecisionRecords: 24,
      holdDecisionRecords: 22,
      applicationIntents: 7,
      successfulCasApplications: 7,
      affectedExercises: 17,
      affectedFuturePrescriptions: 17,
      affectedFutureSessions: 3,
      materialFieldDeltas: 56,
      progressionFieldDeltas: 43,
      regressionFieldDeltas: 13,
      receipts: 21,
      duplicateOrReplayedDecisions: 0,
    });
    expect(counts.aggregateTargetedExecutions).toEqual({
      evaluatorDecisions: 30,
      progressionDecisionRecords: 100,
      regressionDecisionRecords: 24,
      holdDecisionRecords: 22,
      applicationIntents: 10,
      successfulCasApplications: 10,
      affectedExerciseObservationsAcrossIndependentRuns: 30,
      affectedFuturePrescriptionObservationsAcrossIndependentRuns: 30,
      materialFieldDeltas: 69,
      progressionFieldDeltas: 56,
      regressionFieldDeltas: 13,
      receipts: 30,
      duplicateOrReplayedDecisions: 0,
    });
  });

  it("keeps the exposure threshold independent of persistence identity and prohibits automatic numeric changes in special phases", () => {
    const policies = allMesocyclePrescriptionPolicies();
    const stateCounts = Object.fromEntries(
      [...new Set(policies.map((policy) => policy.specialState))]
        .sort()
        .map((state) => [state, policies.filter((policy) => policy.specialState === state).length]),
    );
    expect(stateCounts).toEqual({
      deload: 5,
      peak: 1,
      speed_power: 1,
      standard: 14,
      taper: 1,
    });
    expect(macrocycleEngineForGoal("get_leaner")).toBe("hypertrophy");

    const original = comparableKey("hypertrophy_base");
    const identityChurn = {
      ...comparableInput("hypertrophy_base"),
      sessionId: "regenerated-session",
      slotId: "regenerated-slot",
      revision: 99,
      displayUnit: "lb",
    } as unknown as Parameters<typeof canonicalComparableExposureKey>[0];
    expect(canonicalComparableExposureKey(identityChurn)).toBe(original);
  });

  it("proves the currently mounted bodyweight recording semantics and fails closed for numeric coaching", () => {
    expect(validateCanonicalTrainSetEntry({
      repsText: "8",
      loadText: "",
      loadSemantic: "bodyweight",
      displayUnit: "kg",
    })).toEqual({ status: "valid", reps: 8, baseLoadKg: 0 });
    expect(validateCanonicalTrainSetEntry({
      repsText: "8",
      loadText: "10",
      loadSemantic: "added_load",
      displayUnit: "kg",
    })).toEqual({ status: "valid", reps: 8, baseLoadKg: 10 });
    expect(validateCanonicalTrainSetEntry({
      repsText: "8",
      loadText: "44.0925",
      loadSemantic: "assistance",
      displayUnit: "lb",
    })).toEqual({ status: "valid", reps: 8, baseLoadKg: 20 });
    for (const semantic of ["added_load", "assistance"] as const) {
      expect(validateCanonicalTrainSetEntry({
        repsText: "8",
        loadText: "0",
        loadSemantic: semantic,
        displayUnit: "kg",
      })).toMatchObject({ status: "invalid", field: "load" });
    }

    for (const loadingMode of ["bodyweight", "weighted_bodyweight", "assisted_bodyweight"]) {
      const fixture = numericFixture({
        mesocycleId: "hypertrophy_base",
        loadState: "bodyweight",
        loadingMode,
        prescribedBaseLoad: 0,
      });
      const evidence = exposureHistory(fixture, [
        { id: "one", repsOffset: 0, load: loadingMode === "bodyweight" ? 0 : 10 },
        { id: "two", repsOffset: 0, load: loadingMode === "bodyweight" ? 0 : 10 },
        { id: "three", repsOffset: 0, load: loadingMode === "bodyweight" ? 0 : 10 },
      ]);
      expect(derive(fixture, evidence, "three")).toMatchObject({
        outcome: "hold",
        reasonCode: "bodyweight_numeric_state_not_mounted",
      });
    }
  });

  it("preserves history across Mesocycles while excluding a different Mesocycle from the current streak", () => {
    expect(comparableKey("hypertrophy_base")).not.toBe(comparableKey("hypertrophy_volume"));

    const current = numericFixture({
      mesocycleId: "hypertrophy_volume",
      loadState: "established",
      loadingMode: "rep_progression",
      prescribedBaseLoad: 60,
    });
    const prior = numericFixture({
      mesocycleId: "hypertrophy_base",
      loadState: "established",
      loadingMode: "rep_progression",
      prescribedBaseLoad: 60,
    });
    const evidence = [
      ...exposureHistory(prior, [
        { id: "old-one", repsOffset: 0, load: 60 },
        { id: "old-two", repsOffset: 0, load: 60 },
      ]),
      ...exposureHistory(current, [{ id: "current", repsOffset: 0, load: 60 }]),
    ];
    expect(derive(current, evidence, "current")).toMatchObject({
      outcome: "insufficient_evidence",
      exposureCount: 1,
    });
  });

  it("exposes that returning to the same Mesocycle identity currently reuses an old success streak without recency qualification", () => {
    const fixture = numericFixture({
      mesocycleId: "hypertrophy_base",
      loadState: "established",
      loadingMode: "rep_progression",
      prescribedBaseLoad: 60,
    });
    const evidence = exposureHistory(fixture, [
      { id: "old-one", repsOffset: 0, load: 60, day: 1 },
      { id: "old-two", repsOffset: 0, load: 60, day: 2 },
      { id: "return", repsOffset: 0, load: 60, day: 200 },
    ]);
    expect(derive(fixture, evidence, "return")).toMatchObject({
      outcome: "progress_repetitions",
      exposureCount: 3,
      reasonCode: "three_comparable_successful_exposures_progress_repetitions",
    });
  });

  it("publishes every required closure artifact and keeps verdicts within the certification vocabulary", () => {
    const required = [
      "executive-summary.md",
      "numeric-count-reconciliation.md",
      "numeric-count-results.json",
      "threshold-policy-audit.md",
      "literature-evidence-map.md",
      "bodyweight-semantic-contract.md",
      "bodyweight-results.json",
      "cross-mesocycle-evidence-contract.md",
      "cross-mesocycle-results.json",
      "historical-452-evidence-limit.md",
      "continuous-lifecycle-status.md",
      "production-reachability.md",
      "receipt-and-cas-results.md",
      "screen-consistency-results.md",
      "protected-regressions.md",
      "remaining-findings.md",
    ];
    for (const name of required) expect(existsSync(join(reportRoot, name)), name).toBe(true);
    const combined = required
      .filter((name) => name.endsWith(".md"))
      .map((name) => readFileSync(join(reportRoot, name), "utf8"))
      .join("\n");
    const verdicts = combined.match(/\b(?:PROVEN|PARTIALLY PROVEN|NOT PROVEN|CONTRADICTED|UNREACHABLE|UNSAFE)\b/g) ?? [];
    expect(verdicts.length).toBeGreaterThan(10);
  });
});

type NumericFixture = ReturnType<typeof numericFixture>;

function numericFixture(input: Readonly<{
  mesocycleId: "hypertrophy_base" | "hypertrophy_volume";
  loadState: "established" | "bodyweight";
  loadingMode: string;
  prescribedBaseLoad: number;
}>) {
  const loadPrescription = input.loadState === "established"
    ? {
      schemaVersion: "canonical_load_prescription_v1",
      state: "established",
      loadingMode: input.loadingMode,
      prescribedBaseLoad: input.prescribedBaseLoad,
      baseUnit: "kg",
      evidence: {
        evidenceId: "load",
        evidenceVersion: "v1",
        athleteId: "athlete",
        exerciseId: "pull-up",
        observedLoad: input.prescribedBaseLoad,
        observedReps: 8,
        baseUnit: "kg",
        freshnessVersion: 1,
        calibrationStatus: "established",
      },
      rounding: { increment: 2.5, rule: "nearest" },
    }
    : {
      schemaVersion: "canonical_load_prescription_v1",
      state: "bodyweight",
      loadingMode: input.loadingMode,
      instruction: "Use the recorded bodyweight loading mode.",
    };
  const slot = {
    id: "slot-pull-up",
    index: 0,
    exerciseId: "pull-up",
    exerciseRole: "primary_compound",
    constructionRole: "primary",
    lane: "hypertrophy",
    method: "straight_sets",
    methodStructure: {
      kind: "standalone",
      rounds: 3,
      policyId: "canonical_training_method_policy_v1",
    },
    settings: { requiredSets: 3, repRange: { min: 6, max: 12 } },
    targetReps: 8,
    exactTargets: [8, 8, 8],
    rest: { seconds: 120 },
    progression: { rule: "rep_progression" },
    stopRule: { kind: "rep_dropoff" },
    loadingMode: input.loadingMode,
    prescribedLoad: input.prescribedBaseLoad,
    substitutionConstraints: [],
    loadPrescription,
  };
  const snapshot = {
    schemaVersion: "canonical_session_snapshot_v3",
    sessionId: "planned",
    role: "Upper A",
    planSessionIndex: 0,
    mesocycleId: input.mesocycleId,
    slots: [slot],
    provenance: {
      inputVersion: "test",
      policyVersion: "test",
      constructionVersion: "test",
      evidenceVersion: "test",
    },
  };
  const policy = resolveMesocyclePrescriptionPolicy(input.mesocycleId);
  if (policy.status !== "resolved") throw new Error(policy.reason);
  return { ...input, slot, snapshot, policy: policy.policy };
}

function exposureHistory(
  fixture: NumericFixture,
  inputs: readonly Readonly<{ id: string; repsOffset: number; load: number; day?: number }>[],
): CanonicalProgressEvidence[] {
  return inputs.flatMap((input, exposureIndex) => {
    const sessionId = `recorded-${input.id}`;
    const facts = comparableExposureObservationFacts({
      ...fixture.snapshot,
      mesocycleId: fixture.mesocycleId,
    }, fixture.slot);
    const day = input.day ?? exposureIndex + 1;
    const performed = [1, 2, 3].map((setOrder): CanonicalProgressEvidence => ({
      schemaVersion: "canonical_progress_evidence_v1",
      evidenceId: `${sessionId}:set:${setOrder}`,
      planId: "plan",
      planRevision: exposureIndex,
      macrocycleId: "macrocycle",
      mesocycleId: fixture.mesocycleId,
      microcycleId: `microcycle-${day}`,
      sessionId,
      slotId: fixture.slot.id,
      athleteId: "athlete",
      observedAt: date(day, setOrder),
      source: `ledger:${sessionId}`,
      kind: "performance",
      observations: {
        ...facts,
        exerciseId: fixture.slot.exerciseId,
        slotId: fixture.slot.id,
        loadingMode: fixture.loadingMode,
        method: fixture.slot.method,
        methodExecutionKind: "standalone",
        methodPolicyId: "canonical_training_method_policy_v1",
        loadState: fixture.loadState,
        progressionRule: "rep_progression",
        prescribedSets: 3,
        prescribedTargetReps: 8,
        stopThreshold: null,
        setOrder,
        reps: 8 + input.repsOffset,
        load: input.load,
        unit: "kg",
        completion: "complete",
        substitutionId: null,
      },
      evidenceVersion: "progress_v1",
    }));
    const completion: CanonicalProgressEvidence = {
      schemaVersion: "canonical_progress_evidence_v1",
      evidenceId: `${sessionId}:completion`,
      planId: "plan",
      planRevision: exposureIndex,
      macrocycleId: "macrocycle",
      mesocycleId: fixture.mesocycleId,
      microcycleId: `microcycle-${day}`,
      sessionId,
      athleteId: "athlete",
      observedAt: date(day, 59),
      source: `ledger:${sessionId}`,
      kind: "completion",
      observations: { completion: "complete" },
      evidenceVersion: "progress_v1",
    };
    return [...performed, completion];
  });
}

function derive(
  fixture: NumericFixture,
  evidence: readonly CanonicalProgressEvidence[],
  currentId: string,
) {
  const session: CanonicalRecordedSession = {
    schemaVersion: "canonical_recorded_session_v1",
    recordedSessionId: `recorded-${currentId}`,
    plannedSessionId: "planned",
    planId: "plan",
    startRevision: 0,
    macrocycleId: "macrocycle",
    mesocycleId: fixture.mesocycleId,
    microcycleId: `microcycle-${currentId}`,
    role: "Upper A",
    prescriptionSnapshot: fixture.snapshot,
    prescriptionHash: JSON.stringify(fixture.snapshot),
    provenance: { constructionVersion: "test" },
    athleteId: "athlete",
    version: 1,
    status: "completed",
    createdAt: "2026-01-01T08:00:00.000Z",
  };
  return deriveCanonicalNumericPrescriptionDecisions({
    session,
    evidence,
    policy: fixture.policy,
  })[0]!;
}

function comparableInput(mesocycleId: string) {
  return {
    mesocycleId,
    exerciseId: "pull-up",
    planSessionIndex: 0,
    sessionRole: "Upper",
    constructionRole: "primary",
    exerciseRole: "primary_compound",
    lane: "hypertrophy",
    method: "straight_sets",
    methodSemantic: "{\"kind\":\"standalone\"}",
    progressionRule: "rep_progression",
    prescribedSets: 3,
    loadState: "established",
    loadingMode: "rep_progression",
    substitutionConstraints: [],
  };
}

function comparableKey(mesocycleId: string): string {
  return canonicalComparableExposureKey(comparableInput(mesocycleId));
}

function date(day: number, minute: number): string {
  return new Date(Date.UTC(2026, 0, day, 8, minute)).toISOString();
}

function readJson<T>(name: string): T {
  return JSON.parse(readFileSync(join(reportRoot, name), "utf8")) as T;
}
