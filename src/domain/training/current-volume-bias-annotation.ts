export type VolumeBiasAnnotationInput = Readonly<{ annotation?: string; direction: "bias_high" | "bias_low" }>;
export type VolumeBiasAnnotationResult = Readonly<{ status: "transformed" | "unchanged"; direction: "bias_high" | "bias_low"; originalAnnotation?: string; resultingAnnotation: string; reason: "appended" | "already_present" }>;
const note = { bias_high: "Aim for the top of the range if performance holds.", bias_low: "Stay near the low end this week." } as const;
/** Pure legacy-compatible annotation formatting only. */
export function transformVolumeBiasAnnotation(input: VolumeBiasAnnotationInput): VolumeBiasAnnotationResult {
  const next = note[input.direction];
  if (input.annotation?.includes(next)) return { status: "unchanged", direction: input.direction, originalAnnotation: input.annotation, resultingAnnotation: input.annotation, reason: "already_present" };
  return { status: "transformed", direction: input.direction, ...(input.annotation ? { originalAnnotation: input.annotation } : {}), resultingAnnotation: input.annotation ? `${input.annotation} ${next}` : next, reason: "appended" };
}
