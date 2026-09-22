import { readFileSync } from "node:fs";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { canonicalMethodOutcomeRepository } from "@/data/local/canonical-method-outcome-repository";
import { getLocalStorage } from "@/data/local/local-storage";
import { methodOutcomeFromPerformanceEvidence } from "@/domain/training/canonical-method-outcome";
import type { CanonicalProgressEvidence } from "@/domain/training/canonical-progress-evidence";

describe("user-action performance regressions", () => {
  beforeEach(() => canonicalMethodOutcomeRepository.clear());

  it("collapses a 500-record post-workout replay from 500 storage rewrites to one", () => {
    const outcomes = Array.from({ length: 500 }, (_, index) => methodOutcomeFromPerformanceEvidence(evidence(index))!);
    const storage = getLocalStorage();
    const legacyWrites = vi.spyOn(storage, "setItem");
    for (const outcome of outcomes) canonicalMethodOutcomeRepository.saveEffective(outcome);
    expect(legacyWrites).toHaveBeenCalledTimes(500);
    legacyWrites.mockRestore();

    canonicalMethodOutcomeRepository.clear();
    const batchWrites = vi.spyOn(storage, "setItem");
    expect(canonicalMethodOutcomeRepository.saveEffectiveBatch(outcomes).status).toBe("saved");
    expect(batchWrites).toHaveBeenCalledTimes(1);
    batchWrites.mockRestore();
  });

  it("does not trigger a second full hydration after successful Train commands", () => {
    const source = readFileSync("app/(protected)/(tabs)/train.tsx", "utf8");
    expect(source.match(/canonicalActivePlanState\.refresh\(\)/g)).toHaveLength(1);
    expect(source).toContain('const finish = () =>');
    expect(source).toContain('canonicalActivePlanState.refresh();\n  };');
  });
});

function evidence(index: number): CanonicalProgressEvidence {
  return {
    schemaVersion: "canonical_progress_evidence_v1",
    evidenceId: `session:evidence:set-${index}`,
    planId: "plan",
    planRevision: 1,
    macrocycleId: "macro",
    mesocycleId: "hypertrophy_accumulation" as never,
    microcycleId: "micro-1",
    sessionId: "session",
    slotId: `slot-${index}`,
    athleteId: "athlete",
    observedAt: "2026-08-27T10:00:00.000Z",
    source: `ledger-reconciliation:performance-${index}`,
    kind: "performance",
    observations: {
      exerciseId: `exercise-${index}`,
      comparableExposureKey: `exercise-${index}:primary`,
      method: "antagonist_superset",
      methodContractVersion: "antagonist_superset_v1",
      methodGroupIdentity: `pair-${index}`,
      methodGroupPosition: 1,
      pairedExerciseId: `paired-${index}`,
      setRole: "paired_round",
      setOrder: 1,
      prescribedSetLoad: 80,
      prescribedTargetReps: 8,
      prescribedRestSeconds: 120,
      actualRestSeconds: null,
      reps: 9,
      load: 80,
      completion: "complete",
      correctionProvenance: "original",
      substitutionId: null,
      executionEventId: `performance-${index}`,
    },
    evidenceVersion: "progress_v1",
  };
}
