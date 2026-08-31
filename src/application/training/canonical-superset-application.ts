import { canonicalActivePlanV2Repository } from "@/data/local/canonical-active-plan-v2-repository";
import { canonicalSupersetApplicationRepository } from "@/data/local/canonical-superset-application-repository";
import { canonicalDeterministicFingerprint, canonicalDeterministicFingerprintId } from "@/domain/training/canonical-deterministic-fingerprint";
import type { CanonicalSupersetApplicationReceipt } from "@/domain/training/canonical-superset-application";
import type { CanonicalSupersetFutureMutationProposal } from "@/domain/training/canonical-superset-future-mutation";
import { exerciseDisplayName } from "@/application/training/display-labels";

export type CanonicalSupersetApplicationResult = Readonly<{ status: "applied" | "unchanged" | "held" | "rejected" | "retryable"; reason: string; receipt?: CanonicalSupersetApplicationReceipt }>;

/** Persists the exact proposal evaluated by the mounted production path while
 * preserving the hard shadow boundary: this function never writes a plan. */
export function recordCanonicalSupersetShadowEvaluation(proposal: CanonicalSupersetFutureMutationProposal, evaluatedAt: string): CanonicalSupersetApplicationResult {
  const proposalFingerprint = canonicalDeterministicFingerprint(proposal);
  const intendedPrescriptionFingerprint = canonicalDeterministicFingerprint(proposal.proposedSessions);
  const prepared = canonicalSupersetApplicationRepository.prepare({ schemaVersion: "canonical_superset_application_v1", decisionId: proposal.originatingDecisionId, proposal, proposalFingerprint, intendedPrescriptionFingerprint, status: "prepared", preparedAt: evaluatedAt });
  if (prepared.status === "conflict" || prepared.status === "invalid") return { status: "rejected", reason: prepared.reason };
  if (prepared.record.status === "held" || prepared.record.status === "rejected") return { status: prepared.record.status, reason: prepared.record.terminalReason ?? proposal.reason };
  const reason = proposal.applicationEligibility === "eligible" ? "shadow_authority_no_plan_write" : proposal.reason;
  const status = proposal.applicationEligibility === "rejected" ? "rejected" as const : "held" as const;
  const terminal = canonicalSupersetApplicationRepository.terminal(proposal.originatingDecisionId, status, reason);
  return terminal.status === "saved" ? { status, reason } : { status: "retryable", reason: "shadow_evaluation_persistence_failed" };
}

export function recordCanonicalSupersetDisabledEvaluation(proposal: CanonicalSupersetFutureMutationProposal, evaluatedAt: string): CanonicalSupersetApplicationResult {
  const proposalFingerprint = canonicalDeterministicFingerprint(proposal);
  const intendedPrescriptionFingerprint = canonicalDeterministicFingerprint(proposal.proposedSessions);
  const prepared = canonicalSupersetApplicationRepository.prepare({ schemaVersion: "canonical_superset_application_v1", decisionId: proposal.originatingDecisionId, proposal, proposalFingerprint, intendedPrescriptionFingerprint, status: "prepared", preparedAt: evaluatedAt });
  if (prepared.status === "conflict" || prepared.status === "invalid") return { status: "rejected", reason: prepared.reason };
  if (prepared.record.receipt) return { status: "unchanged", reason: "existing_application_receipt", receipt: prepared.record.receipt };
  if (prepared.record.status === "held" || prepared.record.status === "rejected") return { status: prepared.record.status, reason: prepared.record.terminalReason ?? "superset_production_authority_disabled" };
  const terminal = canonicalSupersetApplicationRepository.terminal(proposal.originatingDecisionId, "held", "superset_production_authority_disabled");
  return terminal.status === "saved" ? { status: "held", reason: "superset_production_authority_disabled" } : { status: "retryable", reason: "disabled_evaluation_persistence_failed" };
}

export function applyCanonicalSupersetMutation(input: Readonly<{
  proposal: CanonicalSupersetFutureMutationProposal;
  appliedAt: string;
  authority: "disabled" | "shadow_certification" | "production";
  crashPoint?: "after_prepare" | "after_cas";
}>): CanonicalSupersetApplicationResult {
  const prior = canonicalSupersetApplicationRepository.get(input.proposal.originatingDecisionId);
  if (prior.status === "found" && prior.record.receipt) return { status: "unchanged", reason: "existing_application_receipt", receipt: prior.record.receipt };
  if (input.authority === "disabled" || (input.authority === "production" && input.proposal.applicationAuthority !== "production")) return { status: "held", reason: "superset_production_authority_disabled" };
  if (input.proposal.applicationEligibility !== "eligible" || !input.proposal.targetSessionId || !input.proposal.targetComparableExposureIdentity || !input.proposal.mutations.length) return { status: input.proposal.applicationEligibility === "rejected" ? "rejected" : "held", reason: input.proposal.reason };
  const loaded = canonicalActivePlanV2Repository.get();
  if (loaded.status !== "saved" || loaded.carrier.planId !== input.proposal.planId) return { status: "retryable", reason: "canonical_plan_unavailable" };
  const intendedFingerprint = canonicalDeterministicFingerprint(input.proposal.proposedSessions);
  const proposalFingerprint = canonicalDeterministicFingerprint(input.proposal);
  const prepared = canonicalSupersetApplicationRepository.prepare({ schemaVersion: "canonical_superset_application_v1", decisionId: input.proposal.originatingDecisionId, proposal: input.proposal, proposalFingerprint, intendedPrescriptionFingerprint: intendedFingerprint, status: "prepared", preparedAt: input.appliedAt });
  if (prepared.status === "conflict" || prepared.status === "invalid") return { status: "rejected", reason: prepared.reason };
  const durable = prepared.record;
  if (durable.status === "held" || durable.status === "rejected") return { status: durable.status, reason: durable.terminalReason ?? "application_terminal" };
  if (input.crashPoint === "after_prepare") return { status: "retryable", reason: "simulated_interruption_after_prepare" };
  const currentFingerprint = canonicalDeterministicFingerprint(loaded.carrier.plannedSessions);
  if (currentFingerprint === durable.intendedPrescriptionFingerprint) return persistReceipt(durable.proposal, loaded.carrier.revision, input.appliedAt, input.authority);
  if (loaded.carrier.revision !== input.proposal.expectedPlanRevision) {
    canonicalSupersetApplicationRepository.terminal(input.proposal.originatingDecisionId, "held", "stale_plan_revision_before_application");
    return { status: "held", reason: "stale_plan_revision_before_application" };
  }
  const nextRevision = loaded.carrier.revision + 1;
  const intended = { ...loaded.carrier, revision: nextRevision, updatedAt: input.appliedAt, plannedSessions: input.proposal.proposedSessions, progress: { ...loaded.carrier.progress, revision: nextRevision, decisionReference: input.proposal.originatingDecisionId }, planningRationale: loaded.carrier.planningRationale ? { ...loaded.carrier.planningRationale, changeReasons: [...loaded.carrier.planningRationale.changeReasons, `superset-decision:${input.proposal.originatingDecisionId}`] } : loaded.carrier.planningRationale };
  const saved = canonicalActivePlanV2Repository.saveAtomically(intended, loaded.carrier.revision);
  if (saved.status === "conflict") return { status: "retryable", reason: "compare_and_swap_conflict" };
  if (saved.status !== "saved") return { status: "retryable", reason: "canonical_plan_write_failed" };
  if (input.crashPoint === "after_cas") return { status: "retryable", reason: "simulated_interruption_after_cas" };
  return persistReceipt(input.proposal, saved.carrier.revision, input.appliedAt, input.authority);
}

function persistReceipt(proposal: CanonicalSupersetFutureMutationProposal, resultingRevision: number, appliedAt: string, authority: "disabled" | "shadow_certification" | "production"): CanonicalSupersetApplicationResult {
  const fingerprint = canonicalDeterministicFingerprint(proposal.proposedSessions);
  const explanation = explanationFor(proposal);
  const idempotencyKey = `superset-application:${proposal.originatingDecisionId}:${proposal.targetComparableExposureIdentity}`;
  const receipt: CanonicalSupersetApplicationReceipt = { schemaVersion: "canonical_superset_application_receipt_v1", receiptId: `${idempotencyKey}:receipt`, idempotencyKey, originatingDecisionId: proposal.originatingDecisionId, decisionVersion: proposal.decisionVersion, policyVersion: proposal.policyVersion, evidenceIds: proposal.evidenceIds, pairIdentity: proposal.pairIdentity, targetPrescriptionIdentity: proposal.targetComparableExposureIdentity!, targetSessionId: proposal.targetSessionId!, targetSlotIds: proposal.mutations.flatMap((item) => item.slotId ? [item.slotId] : []), exactMutations: proposal.mutations, priorRevision: proposal.expectedPlanRevision, resultingRevision, resultingPrescriptionFingerprint: fingerprint, durationDeltaMinutes: proposal.expectedDurationDeltaMinutes, appliedAuthority: authority === "production" ? "production" : "shadow_certification", explanationId: `superset-explanation:${canonicalDeterministicFingerprintId({ decisionId: proposal.originatingDecisionId, mutations: proposal.mutations })}`, explanation, appliedAt, reconstructionIdentity: canonicalDeterministicFingerprint({ proposal: proposal.originatingDecisionId, fingerprint, resultingRevision }) };
  const saved = canonicalSupersetApplicationRepository.finalize(proposal.originatingDecisionId, receipt);
  return saved.status === "saved" || saved.status === "duplicate" ? { status: saved.status === "saved" ? "applied" : "unchanged", reason: saved.status === "saved" ? "superset_mutation_applied" : "existing_application_receipt", receipt: saved.record.receipt } : { status: "retryable", reason: "application_receipt_persistence_failed" };
}

function explanationFor(proposal: CanonicalSupersetFutureMutationProposal): string {
  const mutations = proposal.mutations;
  const [firstName, secondName] = pairExerciseNames(proposal);
  if (mutations.some((item) => item.mutationType === "remove_pairing")) return `${firstName} and ${secondName} continued to lose performance despite enough recovery. Both remain in your workout as straight sets next time.`;
  if (mutations.some((item) => item.mutationType === "increase_round_rest")) return `${firstName} and ${secondName} dropped off when recovery was short, so you’ll get ${Number(proposal.restAfterSeconds) - Number(proposal.restBeforeSeconds)} seconds more between rounds next time.`;
  const a = mutations.find((item) => item.member === "a");
  const b = mutations.find((item) => item.member === "b");
  if (a && b) return `${exerciseDisplayName(String(a.exerciseId))} and ${exerciseDisplayName(String(b.exerciseId))} are ready to progress independently next time.`;
  const changed = a ?? b;
  if (changed) {
    const changedId = String(changed.exerciseId);
    const partnerId = proposal.pairIdentity.split("::").find((exerciseId) => exerciseId !== changedId);
    return `${exerciseDisplayName(changedId)} is ready to progress next time. ${partnerId ? exerciseDisplayName(partnerId) : "The paired exercise"} stays unchanged.`;
  }
  return "The next comparable pairing stays unchanged while more reliable evidence is gathered.";
}

function pairExerciseNames(proposal: CanonicalSupersetFutureMutationProposal): readonly [string, string] {
  const [first = "First exercise", second = "Second exercise"] = proposal.pairIdentity.split("::");
  return [exerciseDisplayName(first), exerciseDisplayName(second)];
}
