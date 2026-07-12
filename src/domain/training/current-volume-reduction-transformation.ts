import { calculateCurrentVolumeSetAdjustment } from "@/domain/training/current-volume-set-adjustment";
import { orderCurrentVolumeSlots, type CurrentVolumeSlotFact } from "@/domain/training/current-volume-slot-ordering";
export type CurrentVolumeReductionSlot = CurrentVolumeSlotFact & Readonly<{ removable: boolean; minimumSetCount: number }>;
export type CurrentVolumeReductionTransformationInput = Readonly<{ slots: readonly CurrentVolumeReductionSlot[]; magnitude: number; maximumSetCount: number }>;
export type CurrentVolumeReductionTransformationResult = Readonly<{ status: "transformed" | "partially_transformed" | "unchanged" | "invalid_input"; slots: readonly CurrentVolumeReductionSlot[]; appliedMagnitude: number; unappliedMagnitude: number; affectedSlotIds: readonly string[]; removedSlotIds: readonly string[] }>;
/** Pure reduction/removal mechanics over caller-approved facts. */
export function transformCurrentVolumeReduction(input: CurrentVolumeReductionTransformationInput): CurrentVolumeReductionTransformationResult {
  if (!Number.isInteger(input.magnitude) || input.magnitude < 0) return { status: "invalid_input", slots: input.slots, appliedMagnitude: 0, unappliedMagnitude: input.magnitude, affectedSlotIds: [], removedSlotIds: [] };
  const ordered = orderCurrentVolumeSlots(input.slots, "reduction");
  if (ordered.status !== "classified") return { status: "invalid_input", slots: input.slots, appliedMagnitude: 0, unappliedMagnitude: input.magnitude, affectedSlotIds: [], removedSlotIds: [] };
  let remaining = input.magnitude; const affected: string[] = []; const removed: string[] = [];
  const byId = new Map(input.slots.map((slot) => [slot.slotId, slot]));
  const changed = new Map<string, CurrentVolumeReductionSlot>();
  for (const fact of ordered.slots) { if (!remaining) break; const slot = byId.get(fact.slotId)!; const r = calculateCurrentVolumeSetAdjustment({ currentSetCount: slot.currentSetCount, direction: "reduce", magnitude: remaining, minimumSetCount: slot.minimumSetCount, maximumSetCount: input.maximumSetCount }); if (r.status !== "adjusted") continue; remaining -= -r.appliedDelta; affected.push(slot.slotId); if (r.resultingSetCount === 0 && slot.removable) removed.push(slot.slotId); else changed.set(slot.slotId, { ...slot, currentSetCount: r.resultingSetCount }); }
  const slots = input.slots.filter((slot) => !removed.includes(slot.slotId)).map((slot) => changed.get(slot.slotId) ?? slot);
  const appliedMagnitude = input.magnitude - remaining;
  return { status: appliedMagnitude === 0 ? "unchanged" : remaining ? "partially_transformed" : "transformed", slots, appliedMagnitude, unappliedMagnitude: remaining, affectedSlotIds: affected, removedSlotIds: removed };
}
