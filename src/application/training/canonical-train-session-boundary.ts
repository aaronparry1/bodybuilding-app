import { canonicalActivePlanV2Repository } from "@/data/local/canonical-active-plan-v2-repository";
import { canonicalRecordedSessionLedger } from "@/data/local/canonical-recorded-session-ledger";
import { canonicalProgressEvidenceRepository } from "@/data/local/canonical-progress-evidence-repository";
import { deriveCanonicalCompletionSummary } from "@/domain/training/canonical-completion-summary";
import { completeCanonicalSession, pauseCanonicalSession, recordCanonicalPerformedWork, resumeCanonicalSession, restoreCanonicalRecordedSessionFromLedger, startCanonicalSession, type CanonicalPerformedWorkCommand, type CanonicalRecordedLifecycleCommand, type CanonicalStartSessionCommand } from "@/application/training/canonical-recorded-session-application";

export const CANONICAL_TRAIN_SESSION_PROJECTION_VERSION = "canonical_train_session_projection_v1" as const;

export type CanonicalTrainProjectionResult = Readonly<{ status: "projected"; projection: CanonicalTrainSessionProjection } | { status: "rejected"; reason: string }>;
export type CanonicalTrainSessionProjection = Readonly<{
  contractVersion: typeof CANONICAL_TRAIN_SESSION_PROJECTION_VERSION;
  planId: string; planRevision: number; recordedSessionId: string; plannedSessionId: string;
  lineage: Readonly<{ macrocycleId: string; mesocycleId: string; microcycleId: string }>;
  lifecycle: string; ledgerVersion: number; prescriptionHash: string; role: string;
  slots: readonly CanonicalTrainSlotProjection[]; completionSummary?: ReturnType<typeof deriveCanonicalCompletionSummary>;
  progressEvidence: "pending" | "complete"; reconciliation: "consistent" | "required";
  allowedActions: readonly ("pause" | "resume" | "record_performed_work" | "complete")[];
}>;
export type CanonicalTrainSlotProjection = Readonly<{ slotId: string; exerciseId: string; index: number; prescription: Readonly<Record<string, unknown>>; performed: readonly Readonly<Record<string, unknown>>[]; substitutionIds: readonly string[]; status: "pending" | "performed" | "substituted" }>;

function hasLegacyFields(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  if (Array.isArray(value)) return value.some(hasLegacyFields);
  const object = value as Record<string, unknown>;
  if (["blocks", "activeBlockId", "blockType", "currentBlock", "trainingYear", "annualWeek", "WorkoutSession", "WorkoutExerciseLog"].some((key) => key in object)) return true;
  return Object.values(object).some(hasLegacyFields);
}

export function projectCanonicalTrainSession(planId: string, recordedSessionId: string): CanonicalTrainProjectionResult {
  const loaded = canonicalActivePlanV2Repository.get();
  const aggregate = canonicalRecordedSessionLedger.get(recordedSessionId);
  if (loaded.status !== "saved") return { status: "rejected", reason: "canonical_plan_unavailable" };
  if (aggregate.status !== "found") return { status: "rejected", reason: "recorded_session_not_found" };
  const session = aggregate.session;
  if (session.planId !== planId || hasLegacyFields(session) || session.prescriptionHash !== JSON.stringify(session.prescriptionSnapshot)) return { status: "rejected", reason: "canonical_session_integrity_mismatch" };
  const reference = loaded.carrier.recordedSessionReferences?.find((item) => item.sessionId === recordedSessionId);
  const isExtraSession = session.role.startsWith("extra:");
  if ((!reference && !isExtraSession) || (reference && (reference.status !== session.status || reference.revision > loaded.carrier.revision))) return { status: "rejected", reason: "carrier_reconciliation_required" };
  const snapshot = session.prescriptionSnapshot as Record<string, unknown>;
  const slots = Array.isArray(snapshot.slots) ? snapshot.slots as Array<Record<string, unknown>> : [];
  if (slots.some((slot) => typeof slot.id !== "string" || typeof slot.exerciseId !== "string") || hasLegacyFields(snapshot)) return { status: "rejected", reason: "invalid_prescription_snapshot" };
  const events = aggregate.events.filter((event) => event.type === "performance");
  const slotProjections = slots.slice().sort((a, b) => Number(a.index) - Number(b.index)).map((slot) => {
    const performed: readonly Readonly<Record<string, unknown>>[] = events.filter((event) => String((event.payload as Record<string, unknown>).slotId) === slot.id).map((event) => ({ ...(event.payload as Record<string, unknown>), eventId: event.eventId }));
    const substitutionIds = performed.flatMap((event) => event.substitutionId ? [String(event.substitutionId)] : []);
    return { slotId: String(slot.id), exerciseId: String(slot.exerciseId), index: Number(slot.index), prescription: { ...slot }, performed, substitutionIds: [...new Set(substitutionIds)].sort(), status: substitutionIds.length ? "substituted" as const : performed.length ? "performed" as const : "pending" as const };
  });
  const summary = session.status === "completed" ? deriveCanonicalCompletionSummary(session, aggregate.events) : undefined;
  const evidence = canonicalProgressEvidenceRepository.list(planId).some((item) => item.sessionId === recordedSessionId);
  const allowedActions = session.status === "paused" ? ["resume", "record_performed_work", "complete"] as const : session.status === "started" ? ["pause", "record_performed_work", "complete"] as const : [] as const;
  return { status: "projected", projection: { contractVersion: CANONICAL_TRAIN_SESSION_PROJECTION_VERSION, planId, planRevision: loaded.carrier.revision, recordedSessionId, plannedSessionId: session.plannedSessionId, lineage: { macrocycleId: session.macrocycleId, mesocycleId: session.mesocycleId, microcycleId: session.microcycleId }, lifecycle: session.status, ledgerVersion: session.version, prescriptionHash: session.prescriptionHash, role: session.role, slots: slotProjections, ...(summary ? { completionSummary: summary } : {}), progressEvidence: evidence ? "complete" : "pending", reconciliation: "consistent", allowedActions } };
}

export const canonicalTrainCommands = {
  start: (command: CanonicalStartSessionCommand) => startCanonicalSession(command),
  restore: (planId: string, recordedSessionId: string) => restoreCanonicalRecordedSessionFromLedger(planId, recordedSessionId),
  performedWork: (command: CanonicalPerformedWorkCommand) => recordCanonicalPerformedWork(command),
  pause: (command: CanonicalRecordedLifecycleCommand) => pauseCanonicalSession(command),
  resume: (command: CanonicalRecordedLifecycleCommand) => resumeCanonicalSession(command),
  complete: (command: CanonicalRecordedLifecycleCommand) => completeCanonicalSession(command),
};
