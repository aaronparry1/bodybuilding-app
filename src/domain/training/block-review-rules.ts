import type { EventPlanSkeleton } from "@/domain/training/event-planning";
import type { InitialBlockStrategyId } from "@/domain/training/block-strategy";
import type { TrainingCommitmentType, TrainingEventType } from "@/domain/training/training-commitment";
import type { TrainingGoalId } from "@/domain/training/training-goals";

export type BlockReviewMode = "evidence_driven" | "event_constrained";
export type BlockReviewOutcome =
  | "continue"
  | "extend"
  | "transition"
  | "recovery_block_required"
  | "phase_required_by_event"
  | "manual_planning_required";

export interface BlockReviewPlanningRulesInput {
  commitmentType: TrainingCommitmentType;
  eventType?: TrainingEventType;
  blockStrategyId?: InitialBlockStrategyId;
  trainingGoal: TrainingGoalId;
  currentWeek: number;
  reviewWeek: number;
  plannedDurationWeeks: number;
  eventPlanSkeleton?: EventPlanSkeleton;
}

export interface BlockReviewPlanningRules {
  reviewMode: BlockReviewMode;
  calendarCanForceTransition: boolean;
  mandatoryPhasesProtected: boolean;
  allowedReviewOutcomes: BlockReviewOutcome[];
  highestOrderObjective: string;
  ruleSummary: string;
  rationale: string;
  confidence: number;
}

const continuousDevelopmentOutcomes: BlockReviewOutcome[] = [
  "continue",
  "extend",
  "transition",
  "recovery_block_required",
];

const powerliftingEventOutcomes: BlockReviewOutcome[] = [
  "phase_required_by_event",
  "transition",
  "recovery_block_required",
  "manual_planning_required",
];

const manualPlanningOnly: BlockReviewOutcome[] = ["manual_planning_required"];

export function getBlockReviewPlanningRules(input: BlockReviewPlanningRulesInput): BlockReviewPlanningRules {
  if (input.commitmentType === "continuous_development") {
    return {
      reviewMode: "evidence_driven",
      calendarCanForceTransition: false,
      mandatoryPhasesProtected: false,
      allowedReviewOutcomes: [...continuousDevelopmentOutcomes],
      highestOrderObjective: "long_term_progress",
      ruleSummary: "Review is evidence-driven; the calendar does not force a block change.",
      rationale: "The planned review week is a checkpoint for evidence, not an automatic block transition trigger.",
      confidence: 90,
    };
  }

  if (eventTypeOf(input) === "powerlifting_meet") {
    return {
      reviewMode: "event_constrained",
      calendarCanForceTransition: true,
      mandatoryPhasesProtected: true,
      allowedReviewOutcomes: [...powerliftingEventOutcomes],
      highestOrderObjective: "event_readiness",
      ruleSummary: "Event phases are mandatory; execution can adapt but required meet-prep phases cannot be skipped.",
      rationale: "A powerlifting meet has a fixed date, so required preparation phases protect specificity and peak readiness when time allows.",
      confidence: eventPlanIsReady(input.eventPlanSkeleton) ? 88 : 78,
    };
  }

  return {
    reviewMode: "event_constrained",
    calendarCanForceTransition: true,
    mandatoryPhasesProtected: true,
    allowedReviewOutcomes: [...manualPlanningOnly],
    highestOrderObjective: "manual_event_planning",
    ruleSummary: "Unsupported event type requires manual planning before block review rules can be applied.",
    rationale: "ASC should not guess event phase transitions for an unsupported event target.",
    confidence: 70,
  };
}

function eventTypeOf(input: BlockReviewPlanningRulesInput): TrainingEventType | undefined {
  return input.eventType ?? input.eventPlanSkeleton?.eventType;
}

function eventPlanIsReady(eventPlanSkeleton: EventPlanSkeleton | undefined): boolean {
  return eventPlanSkeleton?.status === "ready";
}
