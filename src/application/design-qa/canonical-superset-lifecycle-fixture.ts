import { seedCanonicalSupersetCertificationPlan } from "@/application/design-qa/canonical-superset-certification-fixtures";
import { reconcileCanonicalSupersetAuthority } from "@/application/training/canonical-post-workout-orchestrator";
import { resolveCanonicalSupersetAuthority, setCanonicalSupersetProfilingAuthority } from "@/application/training/canonical-superset-authority";
import { canonicalActivePlanV2Repository } from "@/data/local/canonical-active-plan-v2-repository";
import { canonicalMethodOutcomeRepository } from "@/data/local/canonical-method-outcome-repository";
import { canonicalSupersetApplicationRepository } from "@/data/local/canonical-superset-application-repository";
import { canonicalSupersetShadowDecisionRepository } from "@/data/local/canonical-superset-shadow-decision-repository";
import { jsonStore } from "@/data/local/json-store";
import type { CanonicalMethodOutcome } from "@/domain/training/canonical-method-outcome";

export const CANONICAL_SUPERSET_LIFECYCLE_FIXTURE = "qa_antagonist_superset_offline_lifecycle_v1" as const;
const STATE_KEY = "iron-logic.qa-antagonist-superset-lifecycle-v1";
const PLAN_ID = "design-qa:superset-offline-lifecycle-v1";

export type CanonicalSupersetLifecycleState = Readonly<{
  fixture: typeof CANONICAL_SUPERSET_LIFECYCLE_FIXTURE;
  phase: "reset" | "offline_pending" | "reconciled" | "disabled_pending";
  planId: string;
  baselineRevision: number;
  authority: ReturnType<typeof resolveCanonicalSupersetAuthority>;
  evidenceFingerprint: string;
  evaluationCount: number;
  mutationCount: number;
  receiptCount: number;
  progressCount: number;
  connection: "certified_offline" | "reconnected";
  billingDisabled: true;
}>;

export function resetCanonicalSupersetLifecycleFixture(): CanonicalSupersetLifecycleState {
  canonicalMethodOutcomeRepository.clear();
  canonicalSupersetShadowDecisionRepository.clear();
  canonicalSupersetApplicationRepository.clear();
  setCanonicalSupersetProfilingAuthority("shadow_only");
  const carrier = seedCanonicalSupersetCertificationPlan(PLAN_ID);
  const state = snapshot("reset", carrier.revision, "", "certified_offline");
  jsonStore.set(STATE_KEY, state);
  return state;
}

export function seedCanonicalSupersetOfflineCompletion(): CanonicalSupersetLifecycleState {
  const loaded = canonicalActivePlanV2Repository.get();
  const carrier = loaded.status === "saved" && loaded.carrier.planId === PLAN_ID ? loaded.carrier : seedCanonicalSupersetCertificationPlan(PLAN_ID);
  const slots = ((carrier.plannedSessions[0]!.prescriptionSnapshot as Record<string, unknown>).slots as Record<string, unknown>[]).slice(0, 2);
  const pair = [String(slots[0]!.exerciseId), String(slots[1]!.exerciseId)].sort().join("::");
  for (let exposure = 1; exposure <= 3; exposure += 1) {
    canonicalMethodOutcomeRepository.saveEffective(outcome(carrier, slots[0]!, pair, exposure, 1, "met"));
    canonicalMethodOutcomeRepository.saveEffective(outcome(carrier, slots[1]!, pair, exposure, 2, exposure === 3 ? "missed" : "met"));
  }
  const evidenceFingerprint = canonicalMethodOutcomeRepository.list(PLAN_ID).map((item) => item.evidenceId).sort().join("|");
  const state = snapshot("offline_pending", carrier.revision, evidenceFingerprint, "certified_offline");
  jsonStore.set(STATE_KEY, state);
  return state;
}

export function reconcileCanonicalSupersetLifecycleFixture(): CanonicalSupersetLifecycleState {
  const prior = getCanonicalSupersetLifecycleState();
  const result = reconcileCanonicalSupersetAuthority({ planId: PLAN_ID, occurredAt: "2026-08-31T16:30:00.000Z" });
  if (!["applied", "unchanged", "held", "shadowed"].includes(result.status)) throw new Error(`qa_lifecycle_reconciliation_failed:${result.reason}`);
  const loaded = canonicalActivePlanV2Repository.get();
  const state = snapshot(resolveCanonicalSupersetAuthority().mode === "disabled" ? "disabled_pending" : "reconciled", loaded.status === "saved" ? loaded.carrier.revision : prior.baselineRevision, prior.evidenceFingerprint, "reconnected");
  jsonStore.set(STATE_KEY, state);
  return state;
}

export function seedCanonicalSupersetDisabledExposure(): CanonicalSupersetLifecycleState {
  const loaded = canonicalActivePlanV2Repository.get();
  if (loaded.status !== "saved" || loaded.carrier.planId !== PLAN_ID) throw new Error("qa_lifecycle_plan_unavailable");
  const slots = ((loaded.carrier.plannedSessions[0]!.prescriptionSnapshot as Record<string, unknown>).slots as Record<string, unknown>[]).slice(0, 2);
  const pair = [String(slots[0]!.exerciseId), String(slots[1]!.exerciseId)].sort().join("::");
  canonicalMethodOutcomeRepository.saveEffective(outcome(loaded.carrier, slots[0]!, pair, 4, 1, "met"));
  canonicalMethodOutcomeRepository.saveEffective(outcome(loaded.carrier, slots[1]!, pair, 4, 2, "missed"));
  const state = reconcileCanonicalSupersetLifecycleFixture();
  return { ...state, phase: "disabled_pending" };
}

export function getCanonicalSupersetLifecycleState(): CanonicalSupersetLifecycleState {
  const loaded = canonicalActivePlanV2Repository.get();
  return jsonStore.get(STATE_KEY, snapshot("reset", loaded.status === "saved" ? loaded.carrier.revision : 0, "", "certified_offline"));
}

function snapshot(phase: CanonicalSupersetLifecycleState["phase"], baselineRevision: number, evidenceFingerprint: string, connection: CanonicalSupersetLifecycleState["connection"]): CanonicalSupersetLifecycleState {
  const records = canonicalSupersetApplicationRepository.list(PLAN_ID);
  const receipts = records.filter((item) => item.receipt);
  return { fixture: CANONICAL_SUPERSET_LIFECYCLE_FIXTURE, phase, planId: PLAN_ID, baselineRevision, authority: resolveCanonicalSupersetAuthority(), evidenceFingerprint, evaluationCount: records.length, mutationCount: receipts.length, receiptCount: receipts.length, progressCount: receipts.length, connection, billingDisabled: true };
}

function outcome(carrier: Extract<ReturnType<typeof canonicalActivePlanV2Repository.get>, { status: "saved" }>["carrier"], slot: Record<string, unknown>, pairIdentity: string, exposure: number, position: 1 | 2, performance: "met" | "missed"): CanonicalMethodOutcome {
  const structure = slot.methodStructure as Record<string, unknown>;
  const exerciseId = String(slot.exerciseId);
  const target = Number(slot.targetReps ?? 8);
  const evidenceId = `qa-offline:${exposure}:${position}`;
  return { schemaVersion: "canonical_method_outcome_v1", policyVersion: "canonical_method_outcome_policy_v1", outcomeId: `${evidenceId}:method-outcome`, evidenceId, planId: carrier.planId, planRevision: carrier.revision, macrocycleId: carrier.macrocycle.id, mesocycleId: carrier.mesocycle.id, microcycleId: carrier.microcycle.id, sessionId: `qa-offline-session:${exposure}`, slotId: String(slot.id), exerciseId, comparableExposureIdentity: `${pairIdentity}:${exerciseId}`, method: "antagonist_superset", methodPrescriptionVersion: String(structure.policyId), groupIdentity: String(structure.groupId), groupPosition: position, pairComparableIdentity: pairIdentity, setRole: "paired_round", setOrder: 1, prescribedLoad: 50, prescribedRepetitions: target, performedLoad: 50, performedRepetitions: performance === "met" ? target : Math.max(1, target - 2), prescribedRestSeconds: 60, actualRestSeconds: 60, observedTransitionSeconds: 5, recoveryTimingConfidence: "reliable", recoveryTimingReason: "qa_certified_offline_fixture", completion: "complete", correctionProvenance: "original", substitutionId: null, substitutionComparability: "not_substituted", executionEventId: evidenceId, originalExecutionEventId: null, replayProvenance: exposure === 3 ? "offline_queue" : "qa_prior_comparable_evidence", exercisePerformance: performance, setRolePerformance: performance, methodExecution: "observed", methodSuitability: "not_evaluated", sessionDisruption: "not_observed", userContextChange: "not_observed", evidenceConfidence: "sufficient_set_fact", adaptationEligible: true, affectsNextComparableExposure: true, affectsFutureMethodAssignment: false, decisionAuthority: "shadow_only", outcomeClassification: `antagonist_superset:${performance}`, applicableFutureSlot: `${exerciseId}:qa`, boundaryBehaviour: "retain_until_resolved", observedAt: `2026-08-${String(20 + exposure).padStart(2, "0")}T10:00:00.000Z` };
}
