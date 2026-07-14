import { trainingYearRepository } from "@/data/local/training-year-repository";
import type { TrainingYear } from "@/domain/training/annual-models";

/** Inert compatibility transport for archived legacy payloads. It cannot make planning decisions. */
export const legacyTrainingYearArchive = {
  read(): TrainingYear | null { return trainingYearRepository.getActiveYear(); },
  write(source: TrainingYear): void { trainingYearRepository.save(source); },
};
