export function displayWorkoutName(name: string): string {
  return name.replace(/^AI\s+/i, "").replace(/\s+•\s+.+$/i, "").trim();
}
