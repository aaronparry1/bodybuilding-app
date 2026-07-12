export type RecommendedSetCountGuidanceRange = Readonly<{ minimumSets: number; maximumSets: number }>;
export type RecommendedSetCountRangeTransformationInput = Readonly<{ range: RecommendedSetCountGuidanceRange; direction: "raise" | "lower"; shiftMagnitude: number; absoluteMinimum: number; absoluteMaximum: number; normalizationPolicy: "legacy_programme_guidance_v1" }>;
export type RecommendedSetCountRangeTransformationResult = Readonly<{ status: "transformed" | "unchanged" | "invalid_input" | "unsupported_policy"; range?: RecommendedSetCountGuidanceRange; reason: string }>;
/** Pure future-guidance normalization; never an exact planned target. */
export function transformRecommendedSetCountGuidance(input: RecommendedSetCountRangeTransformationInput): RecommendedSetCountRangeTransformationResult {
  if (input.normalizationPolicy !== "legacy_programme_guidance_v1") return { status: "unsupported_policy", reason: "unknown_policy" };
  const values = [input.range.minimumSets, input.range.maximumSets, input.shiftMagnitude, input.absoluteMinimum, input.absoluteMaximum];
  if (values.some((value) => !Number.isInteger(value)) || values.some((value) => value < 0) || input.absoluteMinimum > input.absoluteMaximum || input.range.minimumSets > input.range.maximumSets) return { status: "invalid_input", reason: "invalid_range" };
  if (input.shiftMagnitude === 0) return { status: "unchanged", range: input.range, reason: "zero_shift" };
  const delta = input.direction === "raise" ? input.shiftMagnitude : -input.shiftMagnitude;
  const minimumSets = Math.max(input.absoluteMinimum, Math.min(input.absoluteMaximum, input.range.minimumSets + delta));
  const maximumSets = Math.max(minimumSets, Math.max(input.absoluteMinimum, Math.min(input.absoluteMaximum, input.range.maximumSets + delta)));
  const range = { minimumSets, maximumSets };
  return minimumSets === input.range.minimumSets && maximumSets === input.range.maximumSets ? { status: "unchanged", range, reason: input.direction === "raise" ? "upper_clamp" : "lower_clamp" } : { status: "transformed", range, reason: "shifted" };
}
