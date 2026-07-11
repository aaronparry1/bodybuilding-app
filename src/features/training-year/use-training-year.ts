import { useEffect, useState } from "react";
import { trainingYearRepository } from "@/data/local/training-year-repository";
import type { BlockType } from "@/domain/training/annual-models";
import { getCurrentBlock, recommendNextBlock } from "@/domain/training/annual-planner";

export function useTrainingYear() {
  const [year, setYear] = useState(() => trainingYearRepository.getActiveYear());

  useEffect(() => trainingYearRepository.subscribe(() => setYear(trainingYearRepository.getActiveYear())), []);

  const currentBlock = getCurrentBlock(year);
  const nextBlockType = currentBlock ? recommendNextBlock(currentBlock) : "hypertrophy";

  return {
    year,
    currentBlock,
    nextBlockType,
    startBlock: (type: BlockType) => setYear(trainingYearRepository.startBlock(type)),
  };
}
