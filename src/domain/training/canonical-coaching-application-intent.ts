import type { CanonicalActivePlanCarrier } from "@/domain/training/canonical-active-plan-carrier";
import type { CanonicalMaterialPrescriptionDelta } from "@/domain/training/canonical-material-prescription-delta";
import type { CanonicalPhaseOneApplicationReceiptV2 } from "@/domain/training/canonical-progress-decision";

export const CANONICAL_COACHING_APPLICATION_INTENT_VERSION = "canonical_coaching_application_intent_v1" as const;

export type CanonicalCoachingApplicationIntent = Readonly<{
  schemaVersion: typeof CANONICAL_COACHING_APPLICATION_INTENT_VERSION;
  applicationAttemptId: string;
  coachingWorkItemId: string;
  decisionId: string;
  planId: string;
  expectedPreRevision: number;
  expectedPreStateFingerprint: string;
  resultingRevision: number;
  resultingStateFingerprint: string;
  affectedFuturePrescriptionIdentities: readonly string[];
  exactIntendedMaterialDelta: readonly CanonicalMaterialPrescriptionDelta[];
  materialDeltaFingerprint: string;
  expectedPreCarrier: CanonicalActivePlanCarrier;
  intendedResultCarrier: CanonicalActivePlanCarrier;
  truthfulReceipt: CanonicalPhaseOneApplicationReceiptV2;
  status: "prepared" | "receipt_persisted" | "terminal_blocked";
  terminalReason?: string;
  preparedAt: string;
  resolvedAt?: string;
}>;

export function validateCanonicalCoachingApplicationIntent(value: unknown): value is CanonicalCoachingApplicationIntent {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<CanonicalCoachingApplicationIntent>;
  return item.schemaVersion === CANONICAL_COACHING_APPLICATION_INTENT_VERSION
    && typeof item.applicationAttemptId === "string" && Boolean(item.applicationAttemptId)
    && item.applicationAttemptId === item.decisionId
    && item.coachingWorkItemId === item.decisionId
    && typeof item.planId === "string" && Boolean(item.planId)
    && Number.isInteger(item.expectedPreRevision) && Number(item.expectedPreRevision) >= 0
    && Number.isInteger(item.resultingRevision) && Number(item.resultingRevision) === Number(item.expectedPreRevision) + 1
    && typeof item.expectedPreStateFingerprint === "string" && item.expectedPreStateFingerprint.startsWith("canonical_fingerprint_v1|")
    && typeof item.resultingStateFingerprint === "string" && item.resultingStateFingerprint.startsWith("canonical_fingerprint_v1|")
    && Array.isArray(item.affectedFuturePrescriptionIdentities)
    && Array.isArray(item.exactIntendedMaterialDelta) && item.exactIntendedMaterialDelta.length > 0
    && typeof item.materialDeltaFingerprint === "string" && item.materialDeltaFingerprint.startsWith("canonical_fingerprint_v1|")
    && Boolean(item.expectedPreCarrier) && Boolean(item.intendedResultCarrier)
    && item.truthfulReceipt?.schemaVersion === "canonical_coaching_application_receipt_v2"
    && item.truthfulReceipt.status === "applied"
    && item.truthfulReceipt.actualResult === "future_prescription_change"
    && ["prepared", "receipt_persisted", "terminal_blocked"].includes(String(item.status))
    && typeof item.preparedAt === "string" && !Number.isNaN(Date.parse(item.preparedAt));
}
