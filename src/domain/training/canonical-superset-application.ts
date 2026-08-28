import type { CanonicalSupersetFutureMutationProposal } from "@/domain/training/canonical-superset-future-mutation";

export const CANONICAL_SUPERSET_APPLICATION_SCHEMA = "canonical_superset_application_v1" as const;
export type CanonicalSupersetApplicationReceipt = Readonly<{
  schemaVersion: "canonical_superset_application_receipt_v1";
  receiptId: string;
  idempotencyKey: string;
  originatingDecisionId: string;
  decisionVersion: string;
  policyVersion: string;
  evidenceIds: readonly string[];
  pairIdentity: string;
  targetPrescriptionIdentity: string;
  targetSessionId: string;
  targetSlotIds: readonly string[];
  exactMutations: CanonicalSupersetFutureMutationProposal["mutations"];
  priorRevision: number;
  resultingRevision: number;
  resultingPrescriptionFingerprint: string;
  durationDeltaMinutes: number;
  appliedAuthority: "shadow_certification" | "production";
  explanationId: string;
  explanation: string;
  appliedAt: string;
  reconstructionIdentity: string;
}>;

export type CanonicalSupersetApplicationRecord = Readonly<{
  schemaVersion: typeof CANONICAL_SUPERSET_APPLICATION_SCHEMA;
  decisionId: string;
  proposal: CanonicalSupersetFutureMutationProposal;
  proposalFingerprint: string;
  intendedPrescriptionFingerprint: string;
  status: "prepared" | "applied" | "held" | "rejected";
  preparedAt: string;
  terminalReason?: string;
  receipt?: CanonicalSupersetApplicationReceipt;
}>;
