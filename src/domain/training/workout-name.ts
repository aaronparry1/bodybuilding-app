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
