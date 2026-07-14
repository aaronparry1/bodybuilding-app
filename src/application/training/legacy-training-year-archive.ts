import { trainingYearRepository } from "@/data/local/training-year-repository";

/** Inert compatibility transport for archived legacy payloads. It cannot make planning decisions. */
export const legacyTrainingYearArchive = {
  read(): unknown { return trainingYearRepository.getActiveYear(); },
  write(source: unknown): void { trainingYearRepository.save(source as Parameters<typeof trainingYearRepository.save>[0]); },
};
