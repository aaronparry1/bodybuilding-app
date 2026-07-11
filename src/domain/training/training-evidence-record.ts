/** Narrow, auditable evidence derived from completed workouts. The active plan remains programme authority. */
export interface TrainingEvidenceRecord {
  id: string;
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
    { id: `${input.sessionId}-completion`, sessionId: input.sessionId, occurredAt: input.occurredAt, kind: "adherence", value: input.completedSets, confidence: "high", notes: ["Completed workout evidence."] },
    ...(input.pain ? [{ id: `${input.sessionId}-pain`, sessionId: input.sessionId, occurredAt: input.occurredAt, kind: "pain" as const, confidence: "high" as const, notes: ["Pain reported during completed workout."] }] : []),
  ];
}
