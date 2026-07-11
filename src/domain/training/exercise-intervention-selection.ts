import { isExerciseInterventionActive } from "@/domain/training/exercise-intervention-record";
import type { Exercise } from "@/domain/training/models";
import type { ExerciseInterventionRecord } from "@/domain/training/plan-setup";

export type InterventionCandidate = { exercise: Exercise; score: number; interventionKey?: string };
export type InterventionCandidateResolution =
  | { status: "candidates"; candidates: InterventionCandidate[] }
  | { status: "blocked_by_intervention"; excludedExerciseIds: string[]; interventionKeys: string[] }
  | { status: "no_eligible_candidate" };

export function resolveInterventionCandidateResolution(input: {
  candidates: Exercise[];
  interventions: ExerciseInterventionRecord[];
  currentMesocycleId: string;
}): InterventionCandidateResolution {
  if (input.candidates.length === 0) return { status: "no_eligible_candidate" };
  const candidates = resolveInterventionCandidates(input);
  if (candidates.length > 0) return { status: "candidates", candidates };
  const active = input.interventions.filter((record) => isExerciseInterventionActive(record, { currentMesocycleId: input.currentMesocycleId, comparableExposuresSinceDecision: 0 }));
  return { status: "blocked_by_intervention", excludedExerciseIds: input.candidates.map((candidate) => candidate.id).sort(), interventionKeys: active.filter(isHardExclusion).map(keyFor).sort() };
}

export function resolveInterventionCandidates(input: {
  candidates: Exercise[];
  interventions: ExerciseInterventionRecord[];
  currentMesocycleId: string;
}): InterventionCandidate[] {
  const active = input.interventions
    .filter((record) => isExerciseInterventionActive(record, { currentMesocycleId: input.currentMesocycleId, comparableExposuresSinceDecision: 0 }))
    .sort(compareInterventions);
  const excluded = new Set(active.filter(isHardExclusion).map((record) => record.exerciseId));
  return input.candidates
    .filter((exercise) => !excluded.has(exercise.id))
    .map((exercise) => {
      const relevant = active.filter((record) => record.exerciseId === exercise.id || record.replacementExerciseId === exercise.id);
      const score = relevant.reduce((total, record) => total + modifierFor(record, exercise.id), 0);
      const applied = relevant.find((record) => modifierFor(record, exercise.id) !== 0);
      return { exercise, score, interventionKey: applied ? keyFor(applied) : undefined };
    });
}

function isHardExclusion(record: ExerciseInterventionRecord): boolean {
  return record.decision === "replace" || record.reason === "unavailable";
}

function modifierFor(record: ExerciseInterventionRecord, exerciseId: string): number {
  if (record.replacementExerciseId === exerciseId && (record.decision === "substitute" || record.decision === "replace" || record.decision === "rotate_at_phase_boundary")) return 100;
  if (record.exerciseId === exerciseId && (record.decision === "substitute" || record.decision === "rotate_at_phase_boundary")) return -25;
  return 0;
}

function compareInterventions(left: ExerciseInterventionRecord, right: ExerciseInterventionRecord): number {
  return keyFor(left).localeCompare(keyFor(right));
}

export function keyFor(record: ExerciseInterventionRecord): string {
  return `${record.exerciseId}:${record.decidedAt}:${record.decision}`;
}
