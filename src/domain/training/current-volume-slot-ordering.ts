export type CurrentVolumeSlotFact = Readonly<{ slotId: string; originalIndex: number; exerciseId: string; structuralCategory: "accessory" | "core" | "other"; currentSetCount: number; protected: boolean; approvedEligible: boolean; priority?: number }>;
export type CurrentVolumeOrderingMode = "increase" | "reduction" | "removal";
export type CurrentVolumeSlotOrderingResult = Readonly<{ status: "classified"; slots: readonly CurrentVolumeSlotFact[] }> | Readonly<{ status: "invalid_slot"; reason: "duplicate_slot_id" | "invalid_index" | "invalid_set_count" }>;

/** Pure structural classification/order mechanics; callers supply policy-derived protection and eligibility. */
export function orderCurrentVolumeSlots(slots: readonly CurrentVolumeSlotFact[], mode: CurrentVolumeOrderingMode): CurrentVolumeSlotOrderingResult {
  const ids = new Set<string>();
  for (const slot of slots) {
    if (ids.has(slot.slotId)) return { status: "invalid_slot", reason: "duplicate_slot_id" };
    ids.add(slot.slotId);
    if (!Number.isInteger(slot.originalIndex) || slot.originalIndex < 0) return { status: "invalid_slot", reason: "invalid_index" };
    if (!Number.isInteger(slot.currentSetCount) || slot.currentSetCount < 0) return { status: "invalid_slot", reason: "invalid_set_count" };
  }
  const direction = mode === "increase" ? 1 : -1;
  return { status: "classified", slots: slots.filter((slot) => slot.approvedEligible).slice().sort((a, b) => {
    const category = rank(a, mode) - rank(b, mode);
    if (category !== 0) return category;
    const sets = direction * (a.currentSetCount - b.currentSetCount);
    if (sets !== 0) return sets;
    const priority = (a.priority ?? 0) - (b.priority ?? 0);
    if (priority !== 0) return priority;
    return a.originalIndex - b.originalIndex || a.slotId.localeCompare(b.slotId);
  }) };
}
function rank(slot: CurrentVolumeSlotFact, mode: CurrentVolumeOrderingMode): number {
  if (slot.protected) return 3;
  if (mode === "increase") return slot.structuralCategory === "accessory" ? 0 : slot.structuralCategory === "other" ? 1 : 2;
  return slot.structuralCategory === "accessory" ? 0 : slot.structuralCategory === "other" ? 1 : 2;
}
