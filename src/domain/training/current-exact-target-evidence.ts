import type { WorkoutSession } from "@/domain/training/models";

export type ExactTargetSetFact = { workoutId: string; mesocycleId: string; microcycleNumber: number; planSessionIndex: number; exerciseId: string; setOrdinal: number; targetReps: number; actualReps?: number; completion: "exceeded" | "met" | "missed" | "incomplete" | "stopped" | "invalid"; stoppedByDropOff: boolean };
export type ExactTargetExtraction = { facts: ExactTargetSetFact[]; incompleteWorkoutIds: string[]; invalidWorkoutIds: string[]; ignoredNonPlannedIds: string[] };

export function extractExactTargetFacts(sessions: WorkoutSession[], identity: { mesocycleId: string; microcycleNumber: number }): ExactTargetExtraction {
  const facts: ExactTargetSetFact[] = []; const incompleteWorkoutIds: string[] = []; const invalidWorkoutIds: string[] = []; const ignoredNonPlannedIds: string[] = []; const seen = new Map<string, ExactTargetSetFact>();
  for (const session of [...sessions].sort((a, b) => a.id.localeCompare(b.id))) {
    if (session.sessionKind !== "planned") { ignoredNonPlannedIds.push(session.id); continue; }
    if (session.planMesocycleId !== identity.mesocycleId || session.planMicrocycleNumber !== identity.microcycleNumber || session.planSessionIndex == null) { invalidWorkoutIds.push(session.id); continue; }
    if (!session.completedAt) { incompleteWorkoutIds.push(session.id); continue; }
    for (const exercise of session.exercises) {
      const targets = exercise.prescribedSetTargets;
      if (!targets?.length) { invalidWorkoutIds.push(session.id); continue; }
      for (let index = 0; index < targets.length; index += 1) {
        const set = exercise.sets.filter((candidate) => candidate.type !== "warmup")[index]; const targetReps = targets[index]!;
        const completion: ExactTargetSetFact["completion"] = exercise.status === "shutdown" ? "stopped" : !set ? "incomplete" : !Number.isFinite(set.reps) || !Number.isFinite(targetReps) ? "invalid" : set.reps > targetReps ? "exceeded" : set.reps === targetReps ? "met" : "missed";
        const fact = { workoutId: session.id, mesocycleId: identity.mesocycleId, microcycleNumber: identity.microcycleNumber, planSessionIndex: session.planSessionIndex, exerciseId: exercise.exerciseId, setOrdinal: index, targetReps, actualReps: set?.reps, completion, stoppedByDropOff: exercise.status === "shutdown" };
        const key = `${session.id}:${exercise.id}:${index}`; const existing = seen.get(key); if (existing && JSON.stringify(existing) !== JSON.stringify(fact)) { invalidWorkoutIds.push(session.id); continue; } if (!existing) { seen.set(key, fact); facts.push(fact); }
      }
    }
  }
  return { facts, incompleteWorkoutIds, invalidWorkoutIds, ignoredNonPlannedIds };
}
