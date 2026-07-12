export type CurrentVolumeSetAdjustmentInput = Readonly<{ currentSetCount: number; direction: "increase" | "reduce" | "maintain"; magnitude: number; minimumSetCount: number; maximumSetCount: number }>;
export type CurrentVolumeSetAdjustmentResult =
  | Readonly<{ status: "adjusted"; originalSetCount: number; resultingSetCount: number; requestedDelta: number; appliedDelta: number; direction: "increase" | "reduce"; minimumClamped: boolean; maximumClamped: boolean; reason: "adjusted" }>
  | Readonly<{ status: "unchanged"; originalSetCount: number; resultingSetCount: number; reason: "maintain" | "zero_magnitude" | "already_at_minimum" | "already_at_maximum" }>
  | Readonly<{ status: "invalid_input"; reason: "non_integer" | "negative" | "invalid_bounds" }>;

/** Pure set-count mechanics for an already-authorised volume transformation. */
export function calculateCurrentVolumeSetAdjustment(input: CurrentVolumeSetAdjustmentInput): CurrentVolumeSetAdjustmentResult {
  const values = [input.currentSetCount, input.magnitude, input.minimumSetCount, input.maximumSetCount];
  if (values.some((value) => !Number.isInteger(value))) return { status: "invalid_input", reason: "non_integer" };
  if (values.some((value) => value < 0)) return { status: "invalid_input", reason: "negative" };
  if (input.minimumSetCount > input.maximumSetCount) return { status: "invalid_input", reason: "invalid_bounds" };
  if (input.direction === "maintain") return { status: "unchanged", originalSetCount: input.currentSetCount, resultingSetCount: input.currentSetCount, reason: "maintain" };
  if (input.magnitude === 0) return { status: "unchanged", originalSetCount: input.currentSetCount, resultingSetCount: input.currentSetCount, reason: "zero_magnitude" };
  const requestedDelta = input.direction === "increase" ? input.magnitude : -input.magnitude;
  const resultingSetCount = Math.max(input.minimumSetCount, Math.min(input.maximumSetCount, input.currentSetCount + requestedDelta));
  const appliedDelta = resultingSetCount - input.currentSetCount;
  if (appliedDelta === 0) return { status: "unchanged", originalSetCount: input.currentSetCount, resultingSetCount, reason: input.direction === "increase" ? "already_at_maximum" : "already_at_minimum" };
  return { status: "adjusted", originalSetCount: input.currentSetCount, resultingSetCount, requestedDelta, appliedDelta, direction: input.direction, minimumClamped: resultingSetCount === input.minimumSetCount && requestedDelta < appliedDelta, maximumClamped: resultingSetCount === input.maximumSetCount && requestedDelta > appliedDelta, reason: "adjusted" };
}
