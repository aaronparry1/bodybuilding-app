import { canonicalActivePlanV2Repository } from "@/data/local/canonical-active-plan-v2-repository";
import { resolveCanonicalConstructionFacts } from "@/application/training/canonical-construction-facts";
import { constructCanonicalSession, resolveCanonicalSessionIdentity } from "@/domain/training/canonical-session-construction-pipeline";
import { resolveMesocyclePrescriptionPolicy } from "@/domain/training/mesocycle-prescription-policy";
import { canonicalRecordedSessionLedger } from "@/data/local/canonical-recorded-session-ledger";

export type CanonicalExtraSessionCommand = Readonly<{ planId: string; expectedPlanRevision: number; requestId: string; focus: string; availableMinutes: number; occurredAt: string }>;
export const CANONICAL_EXTRA_SESSION_LEDGER_LINK_VERSION = "canonical_extra_session_ledger_link_command_v1" as const;
export type CanonicalExtraSessionLedgerLinkResult = Readonly<{ status: "linked_and_started" | "idempotent" | "rejected"; reason: string; sessionId?: string; ledgerVersion?: number }>;
export type CanonicalExtraSessionResult = Readonly<{ status: "constructed"; sessionId: string; planId: string; revision: number; role: string; kind: "extra"; prescriptionSnapshot: Readonly<Record<string, unknown>>; provenance: Readonly<Record<string, string>> }> | Readonly<{ status: "rejected"; reason: string }>;

/** Constructs a non-planned session from current canonical facts without mutating the plan. */
export function constructCanonicalExtraSession(command: CanonicalExtraSessionCommand): CanonicalExtraSessionResult {
  const loaded = canonicalActivePlanV2Repository.get();
  if (loaded.status !== "saved" || loaded.carrier.planId !== command.planId) return { status: "rejected", reason: "canonical_plan_unavailable" };
  if (loaded.carrier.revision !== command.expectedPlanRevision) return { status: "rejected", reason: "stale_plan_revision" };
  if (!command.requestId || command.availableMinutes < 15) return { status: "rejected", reason: "invalid_extra_session_request" };
  const facts = resolveCanonicalConstructionFacts(loaded.carrier);
  if (facts.status !== "ready") return { status: "rejected", reason: facts.reason };
  const policy = resolveMesocyclePrescriptionPolicy(loaded.carrier.mesocycle.id, { goal: loaded.carrier.constraints.goal === "strength_hypertrophy" ? "build_muscle_and_strength" : "build_muscle" });
  if (policy.status !== "resolved") return { status: "rejected", reason: policy.reason };
  const role = `extra:${command.focus || "general"}`;
  const identityInput = { schemaVersion: "canonical_session_construction_input_v1" as const, macrocycle: { goal: loaded.carrier.macrocycle.output.goal, targetDate: loaded.carrier.macrocycle.output.targetDate, rolling: loaded.carrier.macrocycle.output.rolling }, mesocycle: { id: loaded.carrier.mesocycle.id, policy: policy.policy, position: loaded.carrier.mesocycle.position }, microcycle: { id: `${loaded.carrier.planId}:extra:${command.requestId}`, output: loaded.carrier.microcycle.output, sessionId: "", planSessionIndex: 0, sessionRole: role, sessionOrder: 0, stressIntent: loaded.carrier.microcycle.output.priority, recoveryDays: loaded.carrier.microcycle.output.recoveryDays, kind: "extra" as const }, athlete: { experienceLevel: loaded.carrier.constraints.experienceLevel, preferredSplit: loaded.carrier.constraints.preferredSplit, equipment: facts.facts.equipment, limitations: facts.facts.limitations, units: loaded.carrier.constraints.units, exercises: facts.facts.exercises }, progress: { evidenceVersion: "progress_v1", history: facts.facts.history, establishedLoads: facts.facts.establishedLoads }, operational: { constructionVersion: "canonical_extra_session_v1", seed: command.requestId, identity: "", revision: command.occurredAt } };
  const identity = resolveCanonicalSessionIdentity(identityInput);
  const constructed = constructCanonicalSession({ ...identityInput, microcycle: { ...identityInput.microcycle, sessionId: identity }, operational: { ...identityInput.operational, identity } });
  if (constructed.status !== "constructed") return { status: "rejected", reason: constructed.reason };
  return { status: "constructed", sessionId: identity, planId: command.planId, revision: loaded.carrier.revision, role, kind: "extra", prescriptionSnapshot: constructed.snapshot, provenance: { constructionVersion: "canonical_extra_session_v1", requestId: command.requestId, focus: command.focus } };
}

export function startCanonicalExtraSession(command: CanonicalExtraSessionCommand & { prescriptionSnapshot: Readonly<Record<string, unknown>>; role: string; startedAt: string; provenance: string }) {
  const built = constructCanonicalExtraSession(command);
  if (built.status !== "constructed") return built;
  if (JSON.stringify(built.prescriptionSnapshot) !== JSON.stringify(command.prescriptionSnapshot)) return { status: "rejected" as const, reason: "prescription_identity_mismatch" };
  const hash = JSON.stringify(built.prescriptionSnapshot);
  const created = canonicalRecordedSessionLedger.create({ schemaVersion: "canonical_recorded_session_v1", recordedSessionId: built.sessionId, plannedSessionId: `extra:${command.requestId}`, planId: command.planId, startRevision: built.revision, macrocycleId: "canonical", mesocycleId: "canonical", microcycleId: "canonical", role: command.role, prescriptionSnapshot: built.prescriptionSnapshot, prescriptionHash: hash, provenance: { source: command.provenance, constructionVersion: "canonical_extra_session_v1" }, athleteId: "local-athlete", version: 0, status: "pending", createdAt: command.startedAt }, `${built.sessionId}:create`);
  if (created.status !== "saved" && created.status !== "duplicate") return { status: "rejected" as const, reason: "extra_session_ledger_create_failed" };
  const existing = canonicalRecordedSessionLedger.get(built.sessionId);
  if (existing.status !== "found") return { status: "rejected" as const, reason: "extra_session_ledger_missing_after_create" };
  if (existing.session.prescriptionHash !== hash || existing.session.role !== command.role) return { status: "rejected" as const, reason: "conflicting_extra_session_identity" };
  if (existing.session.status === "started" || existing.session.status === "paused" || existing.session.status === "completed") return { status: "idempotent" as const, reason: "extra_session_already_started", sessionId: built.sessionId, ledgerVersion: existing.session.version };
  const started = canonicalRecordedSessionLedger.append(built.sessionId, { eventId: `${built.sessionId}:started:${command.requestId}`, aggregateId: built.sessionId, expectedVersion: existing.session.version, type: "started", occurredAt: command.startedAt, operationId: command.requestId, payload: { provenance: command.provenance, commandVersion: CANONICAL_EXTRA_SESSION_LEDGER_LINK_VERSION } });
  if (started.status !== "saved") return { status: "rejected" as const, reason: started.status === "stale" ? "stale_ledger_revision" : "extra_session_start_conflict" };
  return { status: "linked_and_started" as const, reason: "canonical_extra_session_linked_and_started", sessionId: built.sessionId, ledgerVersion: started.session?.version };
}
