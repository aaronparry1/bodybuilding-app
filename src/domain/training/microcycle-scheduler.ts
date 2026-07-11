import type { MesocycleId } from "@/domain/training/mesocycle-library";
import type { PreferredSplit } from "@/domain/training/plan-setup";

export type MicrocycleProgressionState = "build" | "hold" | "repeat" | "reduce" | "deload" | "exit_mesocycle";
export interface MicrocyclePlan { parentMesocycleId: MesocycleId; sequenceNumber: number; lengthDays: number; trainingDays: number; split: PreferredSplit; sessionRoles: string[]; priority: string; progressionState: MicrocycleProgressionState; requiredExposures: string[]; recoveryDays: number; missedSessionPriority: string; }

export function createMicrocycle(input: { parentMesocycleId: MesocycleId; trainingDays: 3 | 4 | 5 | 6; split: PreferredSplit; sequenceNumber?: number; progressionState?: MicrocycleProgressionState }): MicrocyclePlan {
  const role = rolesFor(input.parentMesocycleId, input.trainingDays, input.split);
  return { parentMesocycleId: input.parentMesocycleId, sequenceNumber: input.sequenceNumber ?? 1, lengthDays: 7, trainingDays: input.trainingDays, split: input.split, sessionRoles: role, priority: priorityFor(input.parentMesocycleId), progressionState: input.progressionState ?? "build", requiredExposures: role, recoveryDays: Math.max(1, 7 - input.trainingDays), missedSessionPriority: missedPriorityFor(input.parentMesocycleId) };
}

function rolesFor(mesocycle: MesocycleId, days: number, split: PreferredSplit): string[] {
  if (mesocycle.startsWith("strength_")) return split === "bench_squat_deadlift" ? ["Bench strength", "Squat strength", "Deadlift strength", "Technical support"].slice(0, days) : Array.from({ length: days }, (_, i) => ["Squat emphasis", "Bench emphasis", "Deadlift emphasis", "Technical support"][i % 4]!);
  if (mesocycle.startsWith("powerbuilding_")) return Array.from({ length: days }, (_, i) => ["Bench and hypertrophy", "Squat and hypertrophy", "Deadlift and back", "Upper support", "Lower support", "Low-cost assistance"][i]!);
  if (mesocycle.startsWith("athletic_")) return Array.from({ length: days }, (_, i) => ["General strength", "Power quality", "General conditioning", "Strength support", "Recovery capacity", "Low-cost movement"][i]!);
  if (split === "full_body") return Array.from({ length: days }, (_, i) => `Full body ${i + 1}`);
  if (split === "upper_lower") return Array.from({ length: days }, (_, i) => i % 2 === 0 ? "Upper hypertrophy" : "Lower hypertrophy");
  return Array.from({ length: days }, (_, i) => ["Push hypertrophy", "Pull hypertrophy", "Legs hypertrophy", "Upper support", "Lower support", "Priority isolation"][i]!);
}

function priorityFor(mesocycle: MesocycleId): string { if (mesocycle.startsWith("strength_")) return "Competition-lift performance"; if (mesocycle.startsWith("powerbuilding_")) return "Main lifts plus muscle development"; if (mesocycle.startsWith("athletic_")) return "General athletic preparation"; return "Priority-muscle productive stimulus"; }
function missedPriorityFor(mesocycle: MesocycleId): string { if (mesocycle.startsWith("strength_") || mesocycle.startsWith("powerbuilding_")) return "Current-phase main-lift exposure"; if (mesocycle.startsWith("athletic_")) return "High-quality power exposure"; return "Priority-muscle exposure"; }
