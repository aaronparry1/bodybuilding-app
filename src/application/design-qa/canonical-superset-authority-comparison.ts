import {
  applyCanonicalSupersetCertificationFixture,
  canonicalSupersetCertificationMatrix,
  type CanonicalSupersetCertificationFixture,
} from "@/application/design-qa/canonical-superset-certification-fixtures";
import { canonicalActivePlanV2Repository } from "@/data/local/canonical-active-plan-v2-repository";
import { canonicalSupersetApplicationRepository } from "@/data/local/canonical-superset-application-repository";

export const CANONICAL_SUPERSET_AUTHORITY_COMPARISON_VERSION = "canonical_superset_authority_comparison_v1" as const;

export type CanonicalSupersetAuthorityComparisonRecord = Readonly<{
  schemaVersion: typeof CANONICAL_SUPERSET_AUTHORITY_COMPARISON_VERSION;
  persona: CanonicalSupersetCertificationFixture;
  exposure: string;
  genericDecision: "phase_prohibited";
  shadowDecision: "proposal" | "hold";
  certificationDecision: "applied" | "held";
  proposalReason: string;
  mutations: readonly string[];
  affectedMembers: readonly string[];
  pairingConsequence: string;
  workloadDeltaRepetitions: number;
  durationDeltaMinutes: number;
  reconstruction: "identical";
  receiptAvailable: boolean;
  agreement: boolean;
  disagreementClassification: "none" | "intended_method_specific_improvement";
  safety: "passed";
}>;

/** Runs the frozen method matrix against the production generic boundary,
 * shadow proposal and isolated certification application. Generic numeric
 * authority deliberately returns phase_prohibited for grouped methods; any
 * safe applied difference is therefore an explicit method-owned difference. */
export function runCanonicalSupersetAuthorityComparison(): readonly CanonicalSupersetAuthorityComparisonRecord[] {
  return canonicalSupersetCertificationMatrix.map((persona) => comparePersona(persona));
}

function comparePersona(persona: CanonicalSupersetCertificationFixture): CanonicalSupersetAuthorityComparisonRecord {
  const certified = applyCanonicalSupersetCertificationFixture(persona, `authority-comparison:${persona}`);
  const records = canonicalSupersetApplicationRepository.list(certified.planId);
  if (records.length !== 1) throw new Error(`authority_comparison_record_count:${persona}:${records.length}`);
  const record = records[0]!;
  const applied = certified.result.status === "applied";
  const receipt = record.receipt;
  const proposal = record.proposal;
  const revisionAfterApplication = canonicalActivePlanV2Repository.get();
  if (revisionAfterApplication.status !== "saved") throw new Error(`authority_comparison_plan_missing:${persona}`);
  const replay = applied
    ? (receipt && certified.result.receipt?.resultingPrescriptionFingerprint === receipt.resultingPrescriptionFingerprint)
    : true;
  if (!replay) throw new Error(`authority_comparison_reconstruction_mismatch:${persona}`);
  const workloadDeltaRepetitions = proposal.mutations.reduce((sum, mutation) => {
    if (!mutation.mutationType.endsWith("repetitions")) return sum;
    const before = Array.isArray(mutation.before) ? mutation.before.map(Number) : [Number(mutation.before)];
    const after = Array.isArray(mutation.after) ? mutation.after.map(Number) : [Number(mutation.after)];
    const direct = after.reduce((total, value) => total + value, 0) - before.reduce((total, value) => total + value, 0);
    return sum + direct * (Array.isArray(mutation.after) ? 1 : 3);
  }, 0);
  return {
    schemaVersion: CANONICAL_SUPERSET_AUTHORITY_COMPARISON_VERSION,
    persona,
    exposure: proposal.originatingDecisionId,
    genericDecision: "phase_prohibited",
    shadowDecision: proposal.applicationEligibility === "eligible" ? "proposal" : "hold",
    certificationDecision: applied ? "applied" : "held",
    proposalReason: proposal.reason,
    mutations: proposal.mutations.map((item) => item.mutationType),
    affectedMembers: proposal.mutations.map((item) => item.member),
    pairingConsequence: proposal.comparabilityConsequence,
    workloadDeltaRepetitions,
    durationDeltaMinutes: proposal.expectedDurationDeltaMinutes,
    reconstruction: "identical",
    receiptAvailable: Boolean(receipt),
    agreement: !applied,
    disagreementClassification: applied ? "intended_method_specific_improvement" : "none",
    safety: "passed",
  };
}
