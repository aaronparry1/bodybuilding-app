import type { MesocycleId } from "@/domain/training/mesocycle-library";
import type { PreferredSplit } from "@/domain/training/plan-setup";
import { buildWeeklySessionSequence, preferredSplitForProgrammeFramework, resolveCanonicalProgrammeFramework, type CustomerProgrammeFrameworkId, type InternalProgrammeDeliveryStrategy, type ProgrammeFrameworkSessionType } from "@/domain/training/programme-framework-rules";

export type MicrocycleProgressionState = "build" | "hold" | "repeat" | "reduce" | "deload" | "exit_mesocycle";
export interface MicrocyclePlan { parentMesocycleId: MesocycleId; sequenceNumber: number; lengthDays: number; trainingDays: number; requestedSplit: PreferredSplit; publicFrameworkPreference: CustomerProgrammeFrameworkId; split: PreferredSplit; frameworkReason: "explicit_supported_preference" | "asc_recommended_for_frequency" | "phase_specific_morph"; deliveryStrategy: InternalProgrammeDeliveryStrategy; morphRationaleCodes: readonly string[]; logicalRotation: readonly ProgrammeFrameworkSessionType[]; rotationCursor: number; scheduleMode: "calendar_week" | "asymmetric_rotation"; sessionDayOffsets: number[]; sessionTypes: ProgrammeFrameworkSessionType[]; sessionRoles: string[]; priority: string; progressionState: MicrocycleProgressionState; requiredExposures: string[]; recoveryDays: number; missedSessionPriority: string; }

export type CanonicalTrainingDaysPerWeek = 2 | 3 | 4 | 5 | 6;

export function createMicrocycle(input: { parentMesocycleId: MesocycleId; trainingDays: CanonicalTrainingDaysPerWeek; split: PreferredSplit; sequenceNumber?: number; progressionState?: MicrocycleProgressionState }): MicrocyclePlan {
  const resolution = resolveCanonicalProgrammeFramework({ goal: setupGoalForMesocycle(input.parentMesocycleId), sessionsPerWeek: input.trainingDays, requested: input.split, phase: input.parentMesocycleId });
  if (resolution.status !== "resolved") throw new Error(`unsupported_microcycle_framework:${resolution.reason}`);
  const sequenceNumber = input.sequenceNumber ?? 1;
  const sessionTypes = buildWeeklySessionSequence({ goal: resolution.goal, framework: resolution.framework, sessionsPerWeek: input.trainingDays, sequenceNumber });
  const roles = sessionTypes.map((type, index) => roleFor(input.parentMesocycleId, type, index, {
    publicFrameworkPreference: resolution.publicPreference,
    trainingDays: input.trainingDays,
    sequenceNumber,
  }));
  const sessionDayOffsets = defaultDayOffsets(input.trainingDays);
  const rollingPpl = resolution.publicPreference === "push_pull_legs" && input.trainingDays !== 3 && input.trainingDays !== 6 && resolution.framework === "push_pull_legs";
  return { parentMesocycleId: input.parentMesocycleId, sequenceNumber, lengthDays: 7, trainingDays: input.trainingDays, requestedSplit: input.split, publicFrameworkPreference: resolution.publicPreference, split: preferredSplitForProgrammeFramework(resolution.framework), frameworkReason: resolution.reason, deliveryStrategy: resolution.morphPolicy.deliveryStrategy, morphRationaleCodes: resolution.morphPolicy.rationaleCodes, logicalRotation: resolution.framework === "push_pull_legs" ? ["push", "pull", "legs"] : [...sessionTypes], rotationCursor: rollingPpl ? ((sequenceNumber - 1) * input.trainingDays) % 3 : 0, scheduleMode: rollingPpl || resolution.morphPolicy.deliveryStrategy === "athletic_asymmetric_rotation" ? "asymmetric_rotation" : "calendar_week", sessionDayOffsets, sessionTypes, sessionRoles: roles, priority: priorityFor(input.parentMesocycleId), progressionState: input.progressionState ?? "build", requiredExposures: roles, recoveryDays: 7 - input.trainingDays, missedSessionPriority: missedPriorityFor(input.parentMesocycleId) };
}

/** Preserves the owned session sequence after missed calendar time. It never
 * changes phase, dosage, or session prescriptions. */
export function reflowCanonicalMicrocycleAfterMissedSession(plan: MicrocyclePlan, missedSessionIndex: number, delayDays = 1): MicrocyclePlan {
  if (!Number.isInteger(missedSessionIndex) || missedSessionIndex < 0 || missedSessionIndex >= plan.sessionRoles.length || !Number.isInteger(delayDays) || delayDays < 1) throw new Error("invalid_missed_session_reflow");
  const sessionDayOffsets = plan.sessionDayOffsets.map((day, index) => index >= missedSessionIndex ? day + delayDays : day);
  const lengthDays = Math.max(plan.lengthDays, sessionDayOffsets.at(-1)! + 2);
  return { ...plan, lengthDays, scheduleMode: lengthDays === 7 ? plan.scheduleMode : "asymmetric_rotation", sessionDayOffsets, recoveryDays: Math.max(0, lengthDays - plan.trainingDays), progressionState: "repeat" };
}

function roleFor(mesocycle: MesocycleId, type: ProgrammeFrameworkSessionType, index: number, rotation: Readonly<{ publicFrameworkPreference: CustomerProgrammeFrameworkId; trainingDays: CanonicalTrainingDaysPerWeek; sequenceNumber: number }>): string {
  if (mesocycle.startsWith("hypertrophy_") && rotation.publicFrameworkPreference === "push_pull_legs" && (type === "push" || type === "pull" || type === "legs")) {
    const position = ((rotation.sequenceNumber - 1) * rotation.trainingDays + index) % 6;
    return `${displayType(type)} hypertrophy ${String.fromCharCode(65 + position)}`;
  }
  const letter = String.fromCharCode(65 + index);
  if (mesocycle.startsWith("powerbuilding_")) {
    const roles: Partial<Record<ProgrammeFrameworkSessionType, string>> = { bench: "Bench and hypertrophy", squat: "Squat and hypertrophy", deadlift: "Deadlift and back", upper_strength: "Upper support", lower_strength: "Lower support", push: "Push strength and hypertrophy", pull: "Pull strength and hypertrophy", legs: "Legs strength and hypertrophy", upper: "Upper strength and hypertrophy", lower: "Lower strength and hypertrophy", full_body: `Full body powerbuilding ${letter}`, full_body_strength: "Technical support" };
    return roles[type] ?? `Powerbuilding support ${letter}`;
  }
  if (mesocycle.startsWith("strength_")) {
    const roles: Partial<Record<ProgrammeFrameworkSessionType, string>> = { bench: "Bench strength", squat: "Squat strength", deadlift: "Deadlift strength", upper_strength: "Upper strength", lower_strength: "Lower strength", full_body_strength: "Technical strength support", full_body: `Full body strength ${letter}`, push: "Press strength", pull: "Pull strength", legs: "Leg strength", upper: "Upper strength", lower: "Lower strength" };
    return roles[type] ?? `Strength support ${letter}`;
  }
  if (mesocycle.startsWith("athletic_")) return type === "full_body" || type === "full_body_strength" ? `Full body strength and power ${letter}` : `${displayType(type)} athletic support`;
  return `${displayType(type)} hypertrophy${repeatedTypeSuffix(type, index)}`;
}

function setupGoalForMesocycle(mesocycle: MesocycleId): "build_muscle" | "build_muscle_and_strength" | "build_strength" | "athletic_performance" {
  if (mesocycle.startsWith("powerbuilding_")) return "build_muscle_and_strength";
  if (mesocycle.startsWith("strength_")) return "build_strength";
  if (mesocycle.startsWith("athletic_")) return "athletic_performance";
  return "build_muscle";
}

function defaultDayOffsets(days: CanonicalTrainingDaysPerWeek): number[] {
  if (days === 2) return [0, 3];
  if (days === 3) return [0, 2, 4];
  if (days === 4) return [0, 1, 3, 4];
  if (days === 5) return [0, 1, 2, 4, 5];
  return [0, 1, 2, 3, 4, 5];
}

function displayType(type: ProgrammeFrameworkSessionType): string { return type.split("_").map((part) => part[0]!.toUpperCase() + part.slice(1)).join(" "); }
function repeatedTypeSuffix(type: ProgrammeFrameworkSessionType, index: number): string { return ["full_body", "push", "pull", "legs"].includes(type) ? ` ${String.fromCharCode(65 + index)}` : ""; }

function priorityFor(mesocycle: MesocycleId): string { if (mesocycle.startsWith("strength_")) return "Competition-lift performance"; if (mesocycle.startsWith("powerbuilding_")) return "Main lifts plus muscle development"; if (mesocycle.startsWith("athletic_")) return "General athletic preparation"; return "Priority-muscle productive stimulus"; }
function missedPriorityFor(mesocycle: MesocycleId): string { if (mesocycle.startsWith("strength_") || mesocycle.startsWith("powerbuilding_")) return "Current-phase main-lift exposure"; if (mesocycle.startsWith("athletic_")) return "High-quality power exposure"; return "Priority-muscle exposure"; }
