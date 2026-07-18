import type { CanonicalRecordedSessionEvent } from "@/domain/training/canonical-recorded-session-ledger";

export type CanonicalEffectivePerformedWork = Readonly<{
  eventId: string;
  originalEventId: string;
  occurredAt: string;
  payload: Readonly<Record<string, unknown>>;
}>;

/**
 * Projects the effective performed-work facts without rewriting immutable ledger events.
 * A repair replaces one exact set fact; it never creates a second performed set.
 */
export function effectiveCanonicalPerformedWork(
  events: readonly CanonicalRecordedSessionEvent[],
): readonly CanonicalEffectivePerformedWork[] {
  const bySetId = new Map<string, CanonicalEffectivePerformedWork>();
  const setIdByEventId = new Map<string, string>();
  let legacyPerformanceOrdinal = 0;

  for (const event of events) {
    if (event.type === "performance") {
      legacyPerformanceOrdinal += 1;
      const canonicalSetId = event.payload.setId
        ?? (event.payload.slotId && event.payload.setOrder ? `${String(event.payload.slotId)}:set:${Number(event.payload.setOrder)}` : "");
      const setId = String(canonicalSetId || `historical-performance:${String(event.eventId ?? legacyPerformanceOrdinal)}`);
      if (bySetId.has(setId)) continue;
      bySetId.set(setId, {
        eventId: event.eventId,
        originalEventId: event.eventId,
        occurredAt: event.occurredAt,
        payload: { ...event.payload },
      });
      setIdByEventId.set(event.eventId, setId);
      continue;
    }

    if (event.type !== "repair") continue;
    const replacedEventId = String(event.payload.replacesEventId ?? "");
    const setId = String(event.payload.editedSetId ?? event.payload.setId ?? setIdByEventId.get(replacedEventId) ?? "");
    const existing = bySetId.get(setId);
    if (!existing || existing.originalEventId !== replacedEventId) continue;
    bySetId.set(setId, {
      eventId: event.eventId,
      originalEventId: existing.originalEventId,
      occurredAt: event.occurredAt,
      payload: {
        ...existing.payload,
        setId,
        slotId: event.payload.slotId,
        exerciseId: event.payload.exerciseId,
        setOrder: event.payload.setOrder,
        reps: event.payload.reps,
        load: event.payload.load,
        unit: event.payload.unit,
        effort: event.payload.effort,
        substitutionId: event.payload.substitutionId,
        completion: event.payload.completion,
        provenance: event.payload.provenance,
      },
    });
  }

  return [...bySetId.values()].sort((left, right) => {
    const leftSlot = String(left.payload.slotId ?? "");
    const rightSlot = String(right.payload.slotId ?? "");
    return leftSlot.localeCompare(rightSlot)
      || Number(left.payload.setOrder ?? 0) - Number(right.payload.setOrder ?? 0)
      || left.originalEventId.localeCompare(right.originalEventId);
  });
}
