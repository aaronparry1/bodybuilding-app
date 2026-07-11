import type { BlockType, TrainingBlock } from "@/domain/training/annual-models";
import type { ActiveTrainingPlan } from "@/domain/training/plan-setup";

export function displayBlockType(type: BlockType | string): string {
  if (type === "strength_hypertrophy") return "Powerbuilding";
  if (type === "deload") return "Recovery Window";
  return titleValue(type);
}

export function displayBlockName(block: Pick<TrainingBlock, "name" | "type">): string {
  if (block.type === "deload") return "Recovery Window";
  const stripped = block.name.replace(/\s+\d+\s+weeks?$/i, "");
  return stripped || displayBlockType(block.type);
}

export function displayPlanStyle(plan: Pick<ActiveTrainingPlan, "mode" | "goal" | "eventType">): string {
  if (plan.mode === "recommended_12_month") return "Recommended 12-month plan";
  if (plan.mode === "custom_date_event") {
    return plan.eventType === "powerlifting_meet" || plan.goal === "powerlifting_meet" ? "Powerlifting Meet Date Plan" : "Event Date Plan";
  }
  if (plan.mode === "single_block") return "Single Block";
  return "Custom Training Sequence";
}

export function totalPlanWeeks(plan: Pick<ActiveTrainingPlan, "blocks">): number {
  return plan.blocks.reduce((total, block) => total + block.durationWeeks, 0);
}

function titleValue(value: string): string {
  return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}
