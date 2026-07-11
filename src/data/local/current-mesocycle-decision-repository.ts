import { jsonStore } from "@/data/local/json-store";
import {
  CURRENT_MESOCYCLE_DECISION_SCHEMA,
  type CurrentMesocycleDecisionRecord,
  type DecisionEvidenceSummary,
} from "@/domain/training/current-progression-transition-decision-record";
import type { MesocycleDecision } from "@/domain/training/current-progression-transition-decision";

export const currentMesocycleDecisionStorageKey = "iron-logic.current-mesocycle-decisions";

export type CurrentDecisionHydration =
  | { status: "ready"; record: CurrentMesocycleDecisionRecord }
  | { status: "invalid"; reason: "unknown_schema" | "malformed" }
  | { status: "missing" };

export type CurrentDecisionSaveResult =
  | { status: "saved"; record: CurrentMesocycleDecisionRecord }
  | { status: "applied_decision_retained"; record: CurrentMesocycleDecisionRecord };

type DecisionIndex = Record<string, unknown>;

export const currentMesocycleDecisionRepository = {
  get(planId: string): CurrentDecisionHydration {
    const value = jsonStore.get<DecisionIndex>(currentMesocycleDecisionStorageKey, {})[planId];
    return hydrateCurrentMesocycleDecision(value);
  },

  save(record: CurrentMesocycleDecisionRecord): CurrentDecisionSaveResult {
    const all = jsonStore.get<DecisionIndex>(currentMesocycleDecisionStorageKey, {});
    const existing = hydrateCurrentMesocycleDecision(all[record.planId]);

    if (existing.status === "ready" && existing.record.lifecycle === "applied") {
      return { status: "applied_decision_retained", record: existing.record };
    }

    const next: DecisionIndex = { ...all, [record.planId]: record };
    if (existing.status === "ready" && existing.record.lifecycle !== "applied") {
      next[`${record.planId}:superseded:${existing.record.id}`] = {
        ...existing.record,
        lifecycle: "superseded",
      };
    }
    jsonStore.set(currentMesocycleDecisionStorageKey, next);
    return { status: "saved", record };
  },

  subscribe(listener: () => void): () => void {
    return jsonStore.subscribe(currentMesocycleDecisionStorageKey, listener);
  },
};

export function hydrateCurrentMesocycleDecision(value: unknown): CurrentDecisionHydration {
  if (value === undefined || value === null) return { status: "missing" };
  if (!isObject(value)) return { status: "invalid", reason: "malformed" };
  if (value.schemaVersion !== CURRENT_MESOCYCLE_DECISION_SCHEMA) {
    return { status: "invalid", reason: "unknown_schema" };
  }
  if (!isCurrentDecisionRecord(value)) return { status: "invalid", reason: "malformed" };

  return {
    status: "ready",
    record: {
      ...value,
      evidence: { ...value.evidence },
    },
  };
}

function isCurrentDecisionRecord(value: Record<string, unknown>): value is CurrentMesocycleDecisionRecord {
  return (
    !("blockId" in value) &&
    !("activeBlockId" in value) &&
    !("nextBlockId" in value) &&
    typeof value.id === "string" &&
    typeof value.planId === "string" &&
    typeof value.mesocycleId === "string" &&
    typeof value.microcycleNumber === "number" &&
    Number.isInteger(value.microcycleNumber) &&
    value.microcycleNumber >= 0 &&
    typeof value.createdAt === "string" &&
    (value.lifecycle === "proposed" || value.lifecycle === "ready" || value.lifecycle === "applied" || value.lifecycle === "superseded") &&
    (value.appliedAt === undefined || typeof value.appliedAt === "string") &&
    isDecisionEvidenceSummary(value.evidence) &&
    isMesocycleDecision(value)
  );
}

function isDecisionEvidenceSummary(value: unknown): value is DecisionEvidenceSummary {
  if (!isObject(value)) return false;
  return (
    (value.microcycleState === "unresolved" || value.microcycleState === "evaluable" || value.microcycleState === "disrupted" || value.microcycleState === "construction_blocked") &&
    typeof value.completedMicrocycles === "number" &&
    Number.isInteger(value.completedMicrocycles) &&
    value.completedMicrocycles >= 0 &&
    (value.fatigue === "normal" || value.fatigue === "watch" || value.fatigue === "deload_eligible" || value.fatigue === "deload_required") &&
    typeof value.minimumExposureMet === "boolean" &&
    typeof value.maximumExposureReached === "boolean"
  );
}

function isMesocycleDecision(value: Record<string, unknown>): value is MesocycleDecision {
  switch (value.outcome) {
    case "delay":
      return (
        ["incomplete_compatibility", "unresolved_work", "insufficient_evidence", "construction_blocked", "no_approved_successor"].includes(String(value.reason)) &&
        !("targetMesocycleId" in value) &&
        !("prerequisite" in value)
      );
    case "continue":
      return !("reason" in value) && !("targetMesocycleId" in value) && !("prerequisite" in value);
    case "deload":
      return (
        (value.fatigue === "deload_eligible" || value.fatigue === "deload_required") &&
        !("reason" in value) &&
        !("targetMesocycleId" in value) &&
        !("prerequisite" in value)
      );
    case "advance":
      return typeof value.targetMesocycleId === "string" && !("reason" in value) && !("prerequisite" in value);
    case "review_required":
      return (
        ["maximum_exposure", "unsupported_compatibility", "no_safe_transition"].includes(String(value.reason)) &&
        !("targetMesocycleId" in value) &&
        !("prerequisite" in value)
      );
    default:
      return false;
  }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}
