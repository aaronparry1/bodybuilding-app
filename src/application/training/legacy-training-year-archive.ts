import { legacyTrainingYearSourceRepository } from "@/data/local/legacy-training-year-source-repository";

/** Inert compatibility transport for archived legacy payloads. It cannot make planning decisions. */
export const legacyTrainingYearArchive = {
  read(): unknown { return legacyTrainingYearSourceRepository.read(); },
  write(source: unknown): void { legacyTrainingYearSourceRepository.write(source); },
};
