import { calculateCurrentVolumeSetAdjustment } from "@/domain/training/current-volume-set-adjustment";
import { orderCurrentVolumeSlots, type CurrentVolumeSlotFact } from "@/domain/training/current-volume-slot-ordering";
export type CurrentVolumeIncreaseTransformationInput = Readonly<{ slots: readonly CurrentVolumeSlotFact[]; magnitude: number; minimumSetCount: number; maximumSetCount: number }>;
export type CurrentVolumeIncreaseTransformationResult = Readonly<{ status: "transformed" | "unchanged" | "insufficient_capacity" | "invalid_input"; slots: readonly CurrentVolumeSlotFact[]; appliedMagnitude: number; unappliedMagnitude: number; affectedSlotIds: readonly string[] }>;
/** Pure increase mechanics over caller-approved slots; it neither selects exercises nor applies a programme change. */
export function transformCurrentVolumeIncrease(input: CurrentVolumeIncreaseTransformationInput): CurrentVolumeIncreaseTransformationResult {
  if (!Number.isInteger(input.magnitude) || input.magnitude < 0) return { status: "invalid_input", slots: input.slots, appliedMagnitude: 0, unappliedMagnitude: input.magnitude, affectedSlotIds: [] };
  const ordered = orderCurrentVolumeSlots(input.slots, "increase");
  if (ordered.status !== "classified") return { status: "invalid_input", slots: input.slots, appliedMagnitude: 0, unappliedMagnitude: input.magnitude, affectedSlotIds: [] };
  let remaining = input.magnitude; const affected: string[] = [];
  const slots = ordered.slots.map((slot) => {
    if (remaining === 0) return slot;
    const result = calculateCurrentVolumeSetAdjustment({ currentSetCount: slot.currentSetCount, direction: "increase", magnitude: remaining, minimumSetCount: input.minimumSetCount, maximumSetCount: input.maximumSetCount });
    if (result.status !== "adjusted") return slot;
    remaining -= result.appliedDelta; affected.push(slot.slotId); return { ...slot, currentSetCount: result.resultingSetCount };
  });
  const appliedMagnitude = input.magnitude - remaining;
  return { status: appliedMagnitude ? "transformed" : ordered.slots.length ? "unchanged" : "insufficient_capacity", slots, appliedMagnitude, unappliedMagnitude: remaining, affectedSlotIds: affected };
}
