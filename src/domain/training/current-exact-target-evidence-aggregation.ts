import type { ExactTargetExtraction, ExactTargetSetFact } from "@/domain/training/current-exact-target-evidence";

type Counts = Record<ExactTargetSetFact["completion"], number>;
export type ExactTargetExerciseAggregate = { workoutId: string; planSessionIndex: number; exerciseId: string; facts: readonly ExactTargetSetFact[]; counts: Counts };
export type ExactTargetSessionAggregate = { workoutId: string; planSessionIndex: number; exercises: readonly ExactTargetExerciseAggregate[]; counts: Counts };
export type ExactTargetWindowAggregate = { status: "valid" | "valid_with_incomplete" | "valid_with_invalid" | "invalid" | "empty"; sessions: readonly ExactTargetSessionAggregate[]; counts: Counts; breadth: { sets: number; exercises: number; sessions: number }; conflicts: readonly string[] };
const empty = (): Counts => ({ exceeded: 0, met: 0, missed: 0, incomplete: 0, stopped: 0, invalid: 0 });
const count = (facts: readonly ExactTargetSetFact[]) => facts.reduce((counts, fact) => ({ ...counts, [fact.completion]: counts[fact.completion] + 1 }), empty());
export function aggregateExactTargetExtraction(extraction: ExactTargetExtraction): ExactTargetWindowAggregate {
  const byKey = new Map<string, ExactTargetSetFact>(); const conflicts: string[] = [];
  for (const fact of extraction.facts) { const key = `${fact.workoutId}:${fact.exerciseId}:${fact.setOrdinal}`; const prior = byKey.get(key); if (prior && JSON.stringify(prior) !== JSON.stringify(fact)) conflicts.push(key); else byKey.set(key, fact); }
  const facts = [...byKey.values()].sort((a,b) => a.workoutId.localeCompare(b.workoutId) || a.planSessionIndex - b.planSessionIndex || a.exerciseId.localeCompare(b.exerciseId) || a.setOrdinal - b.setOrdinal);
  const exerciseGroups = new Map<string, ExactTargetSetFact[]>(); for (const fact of facts) { const key = `${fact.workoutId}:${fact.planSessionIndex}:${fact.exerciseId}`; exerciseGroups.set(key, [...(exerciseGroups.get(key) ?? []), fact]); }
  const exercises = [...exerciseGroups.values()].map((group) => ({ workoutId: group[0]!.workoutId, planSessionIndex: group[0]!.planSessionIndex, exerciseId: group[0]!.exerciseId, facts: group, counts: count(group) }));
  const sessionGroups = new Map<string, ExactTargetExerciseAggregate[]>(); for (const exercise of exercises) { const key = `${exercise.workoutId}:${exercise.planSessionIndex}`; sessionGroups.set(key, [...(sessionGroups.get(key) ?? []), exercise]); }
  const sessions = [...sessionGroups.values()].map((group) => ({ workoutId: group[0]!.workoutId, planSessionIndex: group[0]!.planSessionIndex, exercises: group, counts: group.reduce((total, item) => add(total, item.counts), empty()) }));
  const counts = count(facts); const status: ExactTargetWindowAggregate["status"] = conflicts.length ? "invalid" : facts.length === 0 ? "empty" : counts.invalid ? "valid_with_invalid" : counts.incomplete ? "valid_with_incomplete" : "valid";
  return { status, sessions, counts, breadth: { sets: facts.length, exercises: exercises.length, sessions: sessions.length }, conflicts };
}
function add(left: Counts, right: Counts): Counts { return { exceeded: left.exceeded + right.exceeded, met: left.met + right.met, missed: left.missed + right.missed, incomplete: left.incomplete + right.incomplete, stopped: left.stopped + right.stopped, invalid: left.invalid + right.invalid }; }
