import type { MesocycleId } from "@/domain/training/mesocycle-library";

export type ProgressionAction = "advance_repetitions" | "advance_load" | "advance_volume" | "advance_specificity_output" | "hold" | "regress";
export type ProgressionConfidence = "high" | "moderate" | "low" | "invalid";

export function exactTargets(input: { sets: number; repMin: number; repMax: number; mesocycleId?: MesocycleId; previousTargets?: number[] }): number[] {
  const base = input.previousTargets?.length === input.sets ? [...input.previousTargets] : Array.from({ length: input.sets }, () => input.repMin);
  if (input.mesocycleId?.includes("transition") || input.mesocycleId?.includes("taper")) return base;
  // The next available repetition is deliberately assigned from the final set backwards.
  for (let index = base.length - 1; index >= 0; index -= 1) {
    if (base[index]! < input.repMax) { base[index]! += 1; break; }
  }
  return base;
}

export function decideNextPrescription(input: { prescribed: number[]; achieved: number[]; pain?: boolean; validTechnique?: boolean; mesocycleId?: MesocycleId }): { action: ProgressionAction; confidence: ProgressionConfidence; nextTargets: number[] } {
  if (input.pain || input.validTechnique === false) return { action: "hold", confidence: "invalid", nextTargets: input.prescribed };
  const missed = input.prescribed.reduce((total, target, index) => total + Math.max(0, target - (input.achieved[index] ?? 0)), 0);
  if (missed >= 2) return { action: "regress", confidence: "moderate", nextTargets: input.prescribed.map((target) => Math.max(1, target - 1)) };
  if (missed === 1) return { action: "hold", confidence: "moderate", nextTargets: input.prescribed };
  if (input.mesocycleId?.includes("transition") || input.mesocycleId?.includes("taper")) return { action: "hold", confidence: "high", nextTargets: input.prescribed };
  return { action: "advance_repetitions", confidence: "moderate", nextTargets: exactTargets({ sets: input.prescribed.length, repMin: Math.min(...input.prescribed), repMax: Math.max(...input.prescribed) + 1, previousTargets: input.prescribed }) };
}
