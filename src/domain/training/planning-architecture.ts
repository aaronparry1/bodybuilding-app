export type PlanningArchitectureId =
  | "continuous_development"
  | "performance_peak"
  | "appearance_peak"
  | "unknown_architecture";

export type PlanningArchitectureEventType =
  | "powerlifting_meet"
  | "strongman_competition"
  | "weightlifting_competition"
  | "bodybuilding_show"
  | "photoshoot"
  | "wedding"
  | "holiday"
  | "custom";

export interface PlanningArchitectureInput {
  eventType?: PlanningArchitectureEventType;
  targetDate?: string;
}

export interface PlanningArchitectureDecision {
  architectureId: PlanningArchitectureId;
  displayName: string;
  objective: string;
  hasFixedDate: boolean;
  mandatoryPhasesRequired: boolean;
  adaptiveBlockSelectionAllowed: boolean;
  adaptiveExecutionAllowed: boolean;
  eventType?: PlanningArchitectureEventType;
  targetDate?: string;
  requiresManualPlanning: boolean;
  rationale: string;
  confidence: number;
}

const performancePeakEvents: PlanningArchitectureEventType[] = [
  "powerlifting_meet",
  "strongman_competition",
  "weightlifting_competition",
];

const appearancePeakEvents: PlanningArchitectureEventType[] = [
  "bodybuilding_show",
  "photoshoot",
  "wedding",
  "holiday",
];

export function decidePlanningArchitecture(input: PlanningArchitectureInput = {}): PlanningArchitectureDecision {
  const eventType = input.eventType;
  const targetDate = normaliseTargetDate(input.targetDate);

  if (!eventType && !targetDate) {
    return {
      architectureId: "continuous_development",
      displayName: "Continuous Development",
      objective: "Maximise long-term Athlete Lifetime Progress.",
      hasFixedDate: false,
      mandatoryPhasesRequired: false,
      adaptiveBlockSelectionAllowed: true,
      adaptiveExecutionAllowed: true,
      requiresManualPlanning: false,
      rationale: "No fixed end date exists, so block reviews remain evidence-driven checkpoints rather than calendar-forced transitions.",
      confidence: 94,
    };
  }

  if (eventType && performancePeakEvents.includes(eventType)) {
    return {
      architectureId: "performance_peak",
      displayName: "Performance Peak",
      objective: "Maximise performance on event day.",
      hasFixedDate: true,
      mandatoryPhasesRequired: true,
      adaptiveBlockSelectionAllowed: false,
      adaptiveExecutionAllowed: true,
      eventType,
      targetDate,
      requiresManualPlanning: false,
      rationale: "Performance events need a fixed-date phase skeleton; execution can adapt, but required phases cannot be skipped when time allows.",
      confidence: targetDate ? 90 : 76,
    };
  }

  if (eventType && appearancePeakEvents.includes(eventType)) {
    return {
      architectureId: "appearance_peak",
      displayName: "Appearance Peak",
      objective: "Maximise appearance and body composition while preserving muscle, strength, and recovery.",
      hasFixedDate: true,
      mandatoryPhasesRequired: true,
      adaptiveBlockSelectionAllowed: false,
      adaptiveExecutionAllowed: true,
      eventType,
      targetDate,
      requiresManualPlanning: false,
      rationale: "Appearance endpoints need fixed-date planning, but execution should adapt to performance, fatigue, and preservation evidence.",
      confidence: targetDate ? 86 : 72,
    };
  }

  return {
    architectureId: "unknown_architecture",
    displayName: "Unknown Planning Architecture",
    objective: "Classify the target before creating a planning skeleton.",
    hasFixedDate: Boolean(targetDate),
    mandatoryPhasesRequired: false,
    adaptiveBlockSelectionAllowed: false,
    adaptiveExecutionAllowed: false,
    eventType,
    targetDate,
    requiresManualPlanning: true,
    rationale: "ASC should not guess a bespoke planning engine for an unclassified or custom target.",
    confidence: 62,
  };
}

function normaliseTargetDate(targetDate: string | undefined): string | undefined {
  const trimmed = targetDate?.trim();
  return trimmed ? trimmed : undefined;
}
