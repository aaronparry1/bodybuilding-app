import type { CurrentMesocycleDecisionRecord } from "@/domain/training/current-progression-transition-decision-record";
import {
  evaluateAndPersistMesocycleDecision,
  type PersistMesocycleDecisionInput,
} from "@/domain/training/current-progression-transition-decision-writer";
import type { CurrentDecisionSaveResult } from "@/data/local/current-mesocycle-decision-repository";

/**
 * Temporary Stage 1 compatibility representation. It deliberately keeps legacy
 * decision vocabulary out of the current record and is not a current resolver.
 */
export type LegacyBlockDecisionShadow =
  | { kind: "defer" }
  | { kind: "repeat" }
  | { kind: "deload" }
  | { kind: "advance" };

export type LegacyShadowResult =
  | { status: "shadowed"; shadow: LegacyBlockDecisionShadow }
  | { status: "unsupported_shadow"; outcome: "regress" | "review_required" };

export type LegacyShadowWriter = (shadow: LegacyBlockDecisionShadow) => void;

/** Compatibility-only bridge: current persistence always precedes shadowing. */
export function persistCurrentDecisionThenWriteLegacyShadow(
  input: PersistMesocycleDecisionInput,
  writeShadow: LegacyShadowWriter,
): { current: CurrentDecisionSaveResult; shadow: LegacyShadowResult } {
  const current = evaluateAndPersistMesocycleDecision(input);
  return {
    current,
    shadow: writeLegacyDecisionShadowAfterCurrentPersistence(current.record, writeShadow),
  };
}

export function writeLegacyDecisionShadowAfterCurrentPersistence(
  record: CurrentMesocycleDecisionRecord,
  writeShadow: LegacyShadowWriter,
): LegacyShadowResult {
  const result = toLegacyBlockDecisionShadow(record);
  if (result.status === "shadowed") writeShadow(result.shadow);
  return result;
}

export function toLegacyBlockDecisionShadow(
  record: CurrentMesocycleDecisionRecord,
): LegacyShadowResult {
  switch (record.outcome) {
    case "delay":
      return { status: "shadowed", shadow: { kind: "defer" } };
    case "continue":
      return { status: "shadowed", shadow: { kind: "repeat" } };
    case "deload":
      return { status: "shadowed", shadow: { kind: "deload" } };
    case "advance":
      return { status: "shadowed", shadow: { kind: "advance" } };
    case "regress":
    case "review_required":
      return { status: "unsupported_shadow", outcome: record.outcome };
  }
}
