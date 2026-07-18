import type { CanonicalRecordedSession, CanonicalRecordedSessionEvent } from "@/domain/training/canonical-recorded-session-ledger";
import { effectiveCanonicalPerformedWork } from "@/domain/training/canonical-performed-work";
export type CanonicalCompletionSummary = Readonly<{ schemaVersion: "canonical_completion_summary_v1"; summaryId: string; recordedSessionId: string; prescribedSlots: number; performedSets: number; performedReps: number; performedLoad: number; completedSlots: readonly string[]; partialSlots: readonly string[]; skippedSlots: readonly string[]; substitutions: readonly string[]; eventVersion: number; completion: "complete" | "partial" | "missed" }>;
export function deriveCanonicalCompletionSummary(session: CanonicalRecordedSession, events: readonly CanonicalRecordedSessionEvent[]): CanonicalCompletionSummary {
  const performances = effectiveCanonicalPerformedWork(events);
  const slots = Array.isArray((session.prescriptionSnapshot as Record<string, unknown>).slots) ? ((session.prescriptionSnapshot as Record<string, unknown>).slots as Array<Record<string, unknown>>) : [];
  const completed = [...new Set(performances.filter((event) => event.payload.completion === "complete").map((event) => String(event.payload.slotId)))].sort();
  const partial = [...new Set(performances.filter((event) => event.payload.completion === "partial").map((event) => String(event.payload.slotId)))].sort();
  const substitutions = [...new Set(performances.flatMap((event) => event.payload.substitutionId ? [String(event.payload.substitutionId)] : []))].sort();
  const reps = performances.reduce((sum, event) => sum + Number(event.payload.reps ?? 0), 0);
  const load = performances.reduce((sum, event) => sum + Number(event.payload.load ?? 0), 0);
  const skipped = slots.map((slot) => String(slot.id)).filter((id) => !completed.includes(id) && !partial.includes(id)).sort();
  const completion = completed.length === slots.length && slots.length > 0 ? "complete" : performances.length ? "partial" : "missed";
  return { schemaVersion: "canonical_completion_summary_v1", summaryId: `${session.recordedSessionId}:completion:${events.length}`, recordedSessionId: session.recordedSessionId, prescribedSlots: slots.length, performedSets: performances.length, performedReps: reps, performedLoad: load, completedSlots: completed, partialSlots: partial, skippedSlots: skipped, substitutions, eventVersion: session.version, completion };
}
