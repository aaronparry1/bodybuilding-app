import { jsonStore } from "@/data/local/json-store";
import { validateCanonicalProgressEvidence, type CanonicalProgressEvidence } from "@/domain/training/canonical-progress-evidence";

const key = "iron-logic.canonical-progress-evidence-v1";
type Records = Record<string, unknown>;

export const canonicalProgressEvidenceRepository = {
  record(input: CanonicalProgressEvidence) {
    const validated = validateCanonicalProgressEvidence(input);
    if (validated.status !== "valid") return validated;
    const records = jsonStore.get<Records>(key, {});
    const existing = records[input.evidenceId];
    if (existing) {
      const prior = validateCanonicalProgressEvidence(existing);
      if (prior.status === "valid" && JSON.stringify(prior.evidence) === JSON.stringify(validated.evidence)) return { status: "duplicate" as const, evidence: prior.evidence };
      return { status: "conflict" as const, reason: "evidence_id_conflict" };
    }
    jsonStore.set(key, { ...records, [input.evidenceId]: validated.evidence });
    return { status: "saved" as const, evidence: validated.evidence };
  },
  get(evidenceId: string) {
    const value = jsonStore.get<Records>(key, {})[evidenceId];
    if (!value) return { status: "not_found" as const };
    const validated = validateCanonicalProgressEvidence(value);
    return validated.status === "valid" ? { status: "found" as const, evidence: validated.evidence } : { status: "invalid" as const, reason: validated.reason };
  },
  replace(input: CanonicalProgressEvidence) {
    const validated = validateCanonicalProgressEvidence(input);
    if (validated.status !== "valid") return validated;
    const records = jsonStore.get<Records>(key, {});
    const existing = records[input.evidenceId];
    if (!existing) return { status: "not_found" as const, reason: "evidence_not_found" };
    const prior = validateCanonicalProgressEvidence(existing);
    if (prior.status !== "valid") return { status: "invalid" as const, reason: prior.reason };
    if (prior.evidence.planId !== input.planId || prior.evidence.sessionId !== input.sessionId || prior.evidence.slotId !== input.slotId || prior.evidence.kind !== input.kind) return { status: "conflict" as const, reason: "evidence_identity_mismatch" };
    jsonStore.set(key, { ...records, [input.evidenceId]: validated.evidence });
    return { status: "saved" as const, evidence: validated.evidence };
  },
  list(planId: string, microcycleId?: string) {
    return Object.values(jsonStore.get<Records>(key, {})).flatMap((value) => {
      const validated = validateCanonicalProgressEvidence(value);
      return validated.status === "valid" && validated.evidence.planId === planId && (!microcycleId || validated.evidence.microcycleId === microcycleId) ? [validated.evidence] : [];
    }).sort((a, b) => a.observedAt.localeCompare(b.observedAt) || a.evidenceId.localeCompare(b.evidenceId));
  },
  removeSession(planId: string, sessionId: string) {
    const records = jsonStore.get<Records>(key, {});
    const retained = Object.fromEntries(Object.entries(records).filter(([, value]) => {
      const validated = validateCanonicalProgressEvidence(value);
      return validated.status !== "valid" || validated.evidence.planId !== planId || validated.evidence.sessionId !== sessionId;
    }));
    const removed = Object.keys(records).length - Object.keys(retained).length;
    if (removed) jsonStore.set(key, retained);
    return { status: "removed" as const, count: removed };
  },
  clear() { jsonStore.remove(key); },
};
