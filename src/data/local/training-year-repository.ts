import { jsonStore } from "@/data/local/json-store";
import type { BlockType, TrainingYear } from "@/domain/training/annual-models";
import { createAnnualPlan, createTrainingBlock, getCurrentBlock, naturalLifterAnnualPlan } from "@/domain/training/annual-planner";

const trainingYearKey = "iron-logic.training-year";

export class LocalTrainingYearRepository {
  getActiveYear(): TrainingYear {
    return jsonStore.get<TrainingYear>(trainingYearKey, createAnnualPlan(naturalLifterAnnualPlan));
  }

  getCurrentBlock() {
    return getCurrentBlock(this.getActiveYear());
  }

  save(year: TrainingYear): void {
    jsonStore.set(trainingYearKey, year);
  }

  startBlock(type: BlockType): TrainingYear {
    const timestamp = new Date().toISOString();
    const currentYear = this.getActiveYear();
    const block = createTrainingBlock(
      type,
      {
        id: `${currentYear.id}-manual-${type}-${timestamp}`,
        status: "active",
        startedAt: timestamp,
      },
      timestamp,
    );
    const nextYear: TrainingYear = {
      ...currentYear,
      status: "active",
      currentBlockId: block.id,
      blocks: [block, ...currentYear.blocks.map((candidate) => (candidate.status === "active" ? { ...candidate, status: "planned" as const } : candidate))],
    };
    this.save(nextYear);
    return nextYear;
  }

  subscribe(listener: () => void): () => void {
    return jsonStore.subscribe(trainingYearKey, listener);
  }
}

export const trainingYearRepository = new LocalTrainingYearRepository();
