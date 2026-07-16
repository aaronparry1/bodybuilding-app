export function displayWorkoutName(name: string): string {
  return name.replace(/^AI\s+/i, "").replace(/\s+•\s+.+$/i, "").trim();
}

/**
 * Projects a current planning-context session role to the stable workout label
 * used by generated-session consumers. The role remains the authority; this
 * only removes descriptive phase wording and occurrence suffixes from the
 * presentation label.
 */
export function canonicalWorkoutLabel(name: string): string {
  const cleaned = displayWorkoutName(name).trim();
  const label = cleaned
    .replace(/\s+(?:hypertrophy|strength|support|and back|and hypertrophy|quality|capacity|movement)$/i, "")
    .replace(/\s+\d+$/i, "")
    .trim() || cleaned;
  return label.toLowerCase() === "full body" ? "Full Body" : label;
}

export function workoutTypeForName(name: string): "chest" | "back" | "shoulders" | "push" | "pull" | "legs" | "upper" | "lower" | "full_body" | "arms" | null {
  const normalized = name.toLowerCase();
  if (normalized.includes("chest")) return "chest";
  if (normalized.includes("back")) return "back";
  if (normalized.includes("shoulder")) return "shoulders";
  if (normalized.includes("push")) return "push";
  if (normalized.includes("pull")) return "pull";
  if (normalized.includes("legs")) return "legs";
  if (normalized.includes("upper")) return "upper";
  if (normalized.includes("lower")) return "lower";
  if (normalized.includes("full")) return "full_body";
  if (normalized.includes("arms")) return "arms";
  return null;
}
