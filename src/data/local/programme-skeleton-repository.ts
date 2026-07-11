import { jsonStore } from "@/data/local/json-store";
import type { ProgrammeSkeleton } from "@/domain/training/programme-skeleton";

const programmeSkeletonKey = "iron-logic.programme-skeleton";

export class LocalProgrammeSkeletonRepository {
  getOptional(): ProgrammeSkeleton | null {
    return jsonStore.get<ProgrammeSkeleton | null>(programmeSkeletonKey, null);
  }

  save(skeleton: ProgrammeSkeleton): void {
    jsonStore.set(programmeSkeletonKey, skeleton);
  }

  subscribe(listener: () => void): () => void {
    return jsonStore.subscribe(programmeSkeletonKey, listener);
  }
}

export const programmeSkeletonRepository = new LocalProgrammeSkeletonRepository();
