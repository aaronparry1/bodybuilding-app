import type { WorkoutHistorySummary } from "@/domain/training/models";

export function resolveCanonicalLoadEvidence(history: WorkoutHistorySummary[], exerciseId: string) {
  const entries = history
    .filter((session) => Boolean(session.completedAt) && !session.cardioLog)
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
    .flatMap((session) => session.exerciseSummaries.map((entry) => ({ session, entry })))
    .filter(({ entry }) => entry.exerciseId === exerciseId && entry.setsCompleted > 0)
    .filter(({ entry }) => Number.isFinite(entry.load) && entry.load >= 0);
  const latest = entries[0];
  if (!latest) return null;
  return { ...latest.entry, completedAt: latest.session.completedAt, load: latest.entry.nextLoadApprovalStatus === "approved" ? latest.entry.nextRecommendedLoad : latest.entry.nextRecommendedLoad || latest.entry.load, known: true, confidence: entries.length >= 3 ? "high" as const : "moderate" as const, source: "completed_exercise_history" as const };
}
