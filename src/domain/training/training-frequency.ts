export type TrainingDaysPerWeek = 2 | 3 | 4 | 5 | 6;

export interface TrainingFrequency {
  daysPerWeek: TrainingDaysPerWeek;
  userFacingSummary: string;
  internalMeaning: string;
  canChangeDuringCycle: true;
  coachingSummary: string;
}

export const trainingFrequencyOptions = [2, 3, 4, 5, 6] as const satisfies readonly TrainingDaysPerWeek[];

export function deriveTrainingFrequency(daysPerWeek: number): TrainingFrequency {
  if (!isTrainingDaysPerWeek(daysPerWeek)) {
    throw new Error("Weekly training days must be between 2 and 6.");
  }

  return {
    daysPerWeek,
    userFacingSummary: `${daysPerWeek} days per week`,
    internalMeaning: "Weekly session budget for programme distribution and structure.",
    canChangeDuringCycle: true,
    coachingSummary: "Use this as the realistic weekly session budget. It is not a measure of ambition.",
  };
}

export function isTrainingDaysPerWeek(value: number): value is TrainingDaysPerWeek {
  return Number.isInteger(value) && (value === 2 || value === 3 || value === 4 || value === 5 || value === 6);
}
