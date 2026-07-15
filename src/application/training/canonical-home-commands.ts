import { canonicalActivePlanState } from "@/application/training/canonical-active-plan-state";
import type { CanonicalProgressDecisionApplicationCommand, CanonicalProgressDecisionApplicationResult } from "@/application/training/canonical-progress-decision-application";
import { produceCanonicalProgressDecision, type CanonicalProgressDecisionProductionCommand, type CanonicalProgressDecisionProductionResult } from "@/application/training/canonical-progress-decision-production";

export function hydrateCanonicalHome() { return canonicalActivePlanState.hydrate(); }
export function applyCanonicalHomeProgressAction(command: CanonicalProgressDecisionApplicationCommand): CanonicalProgressDecisionApplicationResult {
  return canonicalActivePlanState.applyProgressDecision(command);
}

export function produceCanonicalHomeProgressDecision(command: CanonicalProgressDecisionProductionCommand): CanonicalProgressDecisionProductionResult {
  return produceCanonicalProgressDecision(command);
}
