/** Narrow, auditable evidence derived from completed workouts. The active plan remains programme authority. */
export const TRAINING_EVIDENCE_SCHEMA_VERSION = 1 as const;

export type TrainingEvidenceSource = "completed_workout_loop";

export interface TrainingEvidenceRecord {
  id: string;
  schemaVersion: typeof TRAINING_EVIDENCE_SCHEMA_VERSION;
  source: TrainingEvidenceSource;
  ruleIds: string[];
  sessionId: string;
  occurredAt: string;
  kind: "performance" | "recovery" | "pain" | "adherence" | "exercise_fit" | "calibration";
  exerciseId?: string;
  value?: number;
  confidence: "low" | "moderate" | "high";
  notes: string[];
}

export function trainingEvidenceFromCompletedSession(input: { sessionId: string; occurredAt: string; completedSets: number; pain?: boolean }): TrainingEvidenceRecord[] {
  return [
    {
      id: `${input.sessionId}-completion`,
      schemaVersion: TRAINING_EVIDENCE_SCHEMA_VERSION,
      source: "completed_workout_loop",
      ruleIds: ["13a_first_shippable_coaching_loop"],
      sessionId: input.sessionId,
      occurredAt: input.occurredAt,
      kind: "adherence",
      value: input.completedSets,
      confidence: "high",
      notes: ["Completed workout evidence."],
    },
    ...(input.pain
      ? [{
          id: `${input.sessionId}-pain`,
          schemaVersion: TRAINING_EVIDENCE_SCHEMA_VERSION,
          source: "completed_workout_loop" as const,
          ruleIds: ["13a_first_shippable_coaching_loop"],
          sessionId: input.sessionId,
          occurredAt: input.occurredAt,
          kind: "pain" as const,
          confidence: "high" as const,
          notes: ["Pain reported during completed workout."],
        }]
      : []),
  ];
}
