import type { CurrentDecisionHydration } from "@/data/local/current-mesocycle-decision-repository";
import type { LegacyBlockDecisionShadow } from "@/domain/training/current-progression-transition-legacy-shadow";

export type CurrentFirstDecisionResolution =
  | { status: "current"; record: Extract<CurrentDecisionHydration, { status: "ready" }>["record"] }
  | { status: "legacy_compatibility"; shadow: LegacyBlockDecisionShadow }
  | { status: "missing" }
  | { status: "invalid_current"; reason: "unknown_schema" | "malformed" };

/** Compatibility boundary only: current state is never merged with legacy shadow state. */
export function resolveCurrentDecisionFirst(
  current: CurrentDecisionHydration,
  legacyShadow?: LegacyBlockDecisionShadow,
): CurrentFirstDecisionResolution {
  if (current.status === "ready") return { status: "current", record: current.record };
  if (current.status === "invalid") return { status: "invalid_current", reason: current.reason };
  if (legacyShadow) return { status: "legacy_compatibility", shadow: legacyShadow };
  return { status: "missing" };
}
