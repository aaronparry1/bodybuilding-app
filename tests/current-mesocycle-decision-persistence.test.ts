import { readFileSync } from "node:fs";
import { beforeEach, describe, expect, it } from "vitest";
import { jsonStore } from "@/data/local/json-store";
import {
  currentMesocycleDecisionRepository,
  currentMesocycleDecisionStorageKey,
  hydrateCurrentMesocycleDecision,
} from "@/data/local/current-mesocycle-decision-repository";
import { resolveCurrentDecisionFirst } from "@/domain/training/current-progression-transition-decision-compatibility-resolver";
import {
  persistCurrentDecisionThenWriteLegacyShadow,
  toLegacyBlockDecisionShadow,
  writeLegacyDecisionShadowAfterCurrentPersistence,
} from "@/domain/training/current-progression-transition-legacy-shadow";
import {
  evaluateAndPersistMesocycleDecision,
  markCurrentMesocycleDecisionApplied,
} from "@/domain/training/current-progression-transition-decision-writer";

const input = {
  id: "decision-1",
  planId: "plan-1",
  mesocycleId: "hypertrophy_calibration" as const,
  microcycleNumber: 3,
  createdAt: "2026-07-11T10:00:00.000Z",
  compatibility: "ready" as const,
  microcycleState: "evaluable" as const,
  completedMicrocycles: 3,
  mesocycle: {
    minimumWeeks: 3,
    maximumWeeks: 5,
    nextStates: ["hypertrophy_consolidation" as const],
    successCriteria: [],
    failureRoute: "consolidate" as const,
  },
  purposeConcluded: false,
  currentStimulusProductive: true,
  fatigue: "normal" as const,
  approvedSuccessors: ["hypertrophy_consolidation" as const],
  approvedPrerequisites: [],
};

describe("current mesocycle decision persistence", () => {
  beforeEach(() => jsonStore.remove(currentMesocycleDecisionStorageKey));

  it("persists one block-free current record and hydrates it without evaluating or mutating a plan", () => {
    const saved = evaluateAndPersistMesocycleDecision(input);

    expect(saved.status).toBe("saved");
    if (saved.status !== "saved") return;
    expect(saved.record).toMatchObject({
      schemaVersion: 1,
      id: "decision-1",
      planId: "plan-1",
      mesocycleId: "hypertrophy_calibration",
      microcycleNumber: 3,
      outcome: "continue",
      lifecycle: "ready",
    });
    expect(saved.record).not.toHaveProperty("blockId");
    expect(saved.record).not.toHaveProperty("activeBlockId");
    expect(currentMesocycleDecisionRepository.get("plan-1")).toEqual({ status: "ready", record: saved.record });
  });

  it("supersedes an unresolved decision but never silently overwrites an applied decision", () => {
    const first = evaluateAndPersistMesocycleDecision(input);
    expect(first.status).toBe("saved");
    if (first.status !== "saved") return;

    const second = evaluateAndPersistMesocycleDecision({ ...input, id: "decision-2" });
    expect(second.status).toBe("saved");
    expect(currentMesocycleDecisionRepository.get("plan-1")).toMatchObject({ status: "ready", record: { id: "decision-2" } });

    const applied = markCurrentMesocycleDecisionApplied(second.record, "2026-07-11T11:00:00.000Z");
    expect(applied.status).toBe("saved");
    const retained = evaluateAndPersistMesocycleDecision({ ...input, id: "decision-3" });
    expect(retained).toMatchObject({ status: "applied_decision_retained", record: { id: "decision-2", lifecycle: "applied" } });
  });

  it("rejects malformed and unknown current decision records without fabricating values", () => {
    expect(hydrateCurrentMesocycleDecision({ schemaVersion: 99 })).toEqual({ status: "invalid", reason: "unknown_schema" });
    expect(hydrateCurrentMesocycleDecision({ schemaVersion: 1, outcome: "advance" })).toEqual({ status: "invalid", reason: "malformed" });
    expect(hydrateCurrentMesocycleDecision({ schemaVersion: 1, blockId: "legacy-block" })).toEqual({ status: "invalid", reason: "malformed" });
  });

  it("gives persisted current state precedence over a conflicting legacy shadow", () => {
    const saved = evaluateAndPersistMesocycleDecision(input);
    expect(saved.status).toBe("saved");
    const resolved = resolveCurrentDecisionFirst(currentMesocycleDecisionRepository.get("plan-1"), { kind: "advance" });
    expect(resolved).toMatchObject({ status: "current", record: { outcome: "continue" } });
    expect(resolveCurrentDecisionFirst({ status: "missing" }, { kind: "advance" })).toEqual({ status: "legacy_compatibility", shadow: { kind: "advance" } });
  });

  it("maps only safe outcomes to the isolated legacy shadow after current persistence", () => {
    const saved = evaluateAndPersistMesocycleDecision(input);
    expect(saved.status).toBe("saved");
    if (saved.status !== "saved") return;

    const calls: string[] = [];
    const shadow = writeLegacyDecisionShadowAfterCurrentPersistence(saved.record, (value) => calls.push(value.kind));
    expect(shadow).toEqual({ status: "shadowed", shadow: { kind: "repeat" } });
    expect(calls).toEqual(["repeat"]);
    expect(toLegacyBlockDecisionShadow({ ...saved.record, outcome: "review_required", reason: "maximum_exposure" })).toEqual({ status: "unsupported_shadow", outcome: "review_required" });
  });

  it("writes current state before a temporary legacy shadow and retains it if the shadow fails", () => {
    const observedCurrentStatuses: string[] = [];
    expect(() =>
      persistCurrentDecisionThenWriteLegacyShadow(input, () => {
        observedCurrentStatuses.push(currentMesocycleDecisionRepository.get("plan-1").status);
        throw new Error("legacy storage unavailable");
      }),
    ).toThrow("legacy storage unavailable");

    expect(observedCurrentStatuses).toEqual(["ready"]);
    expect(currentMesocycleDecisionRepository.get("plan-1")).toMatchObject({ status: "ready", record: { id: "decision-1" } });
  });

  it("persists informational decisions without creating a workout or applying a plan change", () => {
    const delay = evaluateAndPersistMesocycleDecision({ ...input, microcycleState: "construction_blocked", id: "decision-delay" });
    expect(delay).toMatchObject({ status: "saved", record: { outcome: "delay", lifecycle: "proposed", reason: "construction_blocked" } });
  });

  it("keeps persistence out of the pure evaluator and legacy shadowing out of the current writer", () => {
    const evaluatorSource = readFileSync("src/domain/training/current-progression-transition-decision.ts", "utf8");
    const writerSource = readFileSync("src/domain/training/current-progression-transition-decision-writer.ts", "utf8");
    const shadowSource = readFileSync("src/domain/training/current-progression-transition-legacy-shadow.ts", "utf8");

    expect(evaluatorSource).not.toContain("current-mesocycle-decision-repository");
    expect(writerSource).not.toContain("legacy-shadow");
    expect(shadowSource).not.toContain("activeBlockId");
    expect(shadowSource).not.toContain("blockId");
  });
});
