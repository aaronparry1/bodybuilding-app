import { canonicalActivePlanState } from "@/application/training/canonical-active-plan-state";
import type { CanonicalProgressDecisionApplicationCommand, CanonicalProgressDecisionApplicationResult } from "@/application/training/canonical-progress-decision-application";

export function hydrateCanonicalHome() { return canonicalActivePlanState.hydrate(); }
export function applyCanonicalHomeProgressAction(command: CanonicalProgressDecisionApplicationCommand): CanonicalProgressDecisionApplicationResult {
  return canonicalActivePlanState.applyProgressDecision(command);
}
