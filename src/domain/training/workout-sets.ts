import type { SetLog } from "@/domain/training/models";

export function isWarmupSet(set: Pick<SetLog, "type">): boolean {
  return set.type === "warmup";
}

export function getWorkSets<T extends Pick<SetLog, "type">>(sets: T[]): T[] {
  return sets.filter((set) => !isWarmupSet(set));
}

export function getWarmupSets<T extends Pick<SetLog, "type">>(sets: T[]): T[] {
  return sets.filter(isWarmupSet);
}
