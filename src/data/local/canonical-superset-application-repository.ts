import { jsonStore } from "@/data/local/json-store";
import { CANONICAL_SUPERSET_APPLICATION_SCHEMA, type CanonicalSupersetApplicationRecord, type CanonicalSupersetApplicationReceipt } from "@/domain/training/canonical-superset-application";

const KEY = "iron-logic.canonical-superset-applications-v1";
type Records = Record<string, CanonicalSupersetApplicationRecord>;

export const canonicalSupersetApplicationRepository = {
  prepare(record: CanonicalSupersetApplicationRecord) {
    if (record.schemaVersion !== CANONICAL_SUPERSET_APPLICATION_SCHEMA || record.status !== "prepared" || record.decisionId !== record.proposal.originatingDecisionId) return { status: "invalid" as const, reason: "invalid_superset_application_record" };
    const all = jsonStore.get<Records>(KEY, {});
    const existing = all[record.decisionId];
    if (existing) return existing.proposalFingerprint === record.proposalFingerprint && existing.intendedPrescriptionFingerprint === record.intendedPrescriptionFingerprint ? { status: "existing" as const, record: existing } : { status: "conflict" as const, reason: "decision_application_identity_conflict" };
    jsonStore.set(KEY, { ...all, [record.decisionId]: record });
    return { status: "saved" as const, record };
  },
  finalize(decisionId: string, receipt: CanonicalSupersetApplicationReceipt) {
    const all = jsonStore.get<Records>(KEY, {});
    const existing = all[decisionId];
    if (!existing) return { status: "not_found" as const };
    if (existing.receipt) return JSON.stringify(existing.receipt) === JSON.stringify(receipt) ? { status: "duplicate" as const, record: existing } : { status: "conflict" as const, reason: "application_receipt_conflict" };
    const next = { ...existing, status: "applied" as const, receipt };
    jsonStore.set(KEY, { ...all, [decisionId]: next });
    return { status: "saved" as const, record: next };
  },
  terminal(decisionId: string, status: "held" | "rejected", reason: string) {
    const all = jsonStore.get<Records>(KEY, {});
    const existing = all[decisionId];
    if (!existing || existing.status === "applied") return { status: existing ? "conflict" as const : "not_found" as const };
    const next = { ...existing, status, terminalReason: reason };
    jsonStore.set(KEY, { ...all, [decisionId]: next });
    return { status: "saved" as const, record: next };
  },
  get(decisionId: string) { const value = jsonStore.get<Records>(KEY, {})[decisionId]; return value ? { status: "found" as const, record: value } : { status: "not_found" as const }; },
  clear() { jsonStore.remove(KEY); },
};
