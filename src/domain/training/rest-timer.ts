import type { BlockCompatibility, ExerciseRole, MovementPattern } from "@/domain/training/models";

export interface RestTimerDefaultInput {
  blockType?: BlockCompatibility | null;
  roles?: ExerciseRole[];
  movementPattern?: MovementPattern;
}

export interface RestTimerPreset {
  seconds: number;
  reason: string;
}

export interface RestCompleteMessageInput {
  exerciseName?: string;
  previousMessage?: string | null;
  seed?: number;
  category?: "strength_power" | "hypertrophy" | "general";
}

const compoundPatterns: MovementPattern[] = [
  "horizontal_push",
  "vertical_push",
  "horizontal_pull",
  "vertical_pull",
  "squat",
  "hinge",
  "lunge",
  "hip_thrust",
];

export const restCompleteMessageBank = [
  "Rest's over. Go earn it.",
  "Back to work.",
  "Set's ready. So are you.",
  "Time to move some metal.",
  "Enough scrolling. Lift.",
  "Your next set is waiting.",
  "Clock's done. Your turn.",
  "Go make the logbook nervous.",
  "Rest complete. No dramatic speeches.",
  "The weights missed you.",
  "Hydrated? Good. Go.",
  "Set's ready. Don't negotiate with it.",
  "Rest complete. Resume violence, respectfully.",
  "Your excuses had 90 seconds. They're done.",
  "Next set. Same mission.",
  "Go on then. Make it count.",
] as const;

const strengthPowerRestCompleteMessages = [
  "Heavy work. Clean reps.",
  "Move it sharp.",
  "No grinders. Do the job.",
] as const;

const hypertrophyRestCompleteMessages = [
  "Useful reps only.",
  "Make the set count.",
  "Chase the stimulus, not chaos.",
] as const;

export function getRestTimerDefault(input: RestTimerDefaultInput): RestTimerPreset {
  const roles = input.roles ?? [];
  const isCompound =
    roles.includes("primary_compound") ||
    roles.includes("secondary_compound") ||
    (input.movementPattern ? compoundPatterns.includes(input.movementPattern) : false);

  if (input.blockType === "power" || roles.includes("power")) {
    return { seconds: 180, reason: "Power work gets longer rests so speed stays honest." };
  }

  if ((input.blockType === "strength" || input.blockType === "powerbuilding" || input.blockType === "strength_hypertrophy") && isCompound) {
    return { seconds: 180, reason: "Heavy compounds need enough rest to keep the next set useful." };
  }

  if (isCompound) {
    return { seconds: 120, reason: "Hypertrophy compounds get a clean reset without turning the workout into a picnic." };
  }

  if (roles.includes("isolation")) {
    return { seconds: 75, reason: "Isolation work needs recovery, not a full committee meeting." };
  }

  return { seconds: 90, reason: "Default hypertrophy rest." };
}

export function getRestCompleteMessage(input: RestCompleteMessageInput = {}): string {
  const bank = messageBankForCategory(input.category);
  const contextual = input.exerciseName ? [`${input.exerciseName} is ready. Try not to overthink it.`] : [];
  const options = [...bank, ...contextual].filter((message) => isSafeRestCompleteMessage(message));
  if (options.length === 0) return "Rest complete.";

  const index = Math.abs(Math.floor(input.seed ?? Date.now())) % options.length;
  const selected = options[index] ?? "Rest complete.";
  if (selected !== input.previousMessage || options.length === 1) return selected;
  return options[(index + 1) % options.length] ?? "Rest complete.";
}

export function clampRestSeconds(seconds: number): number {
  if (!Number.isFinite(seconds)) return 0;
  return Math.max(0, Math.min(600, Math.round(seconds)));
}

export function formatRestTime(seconds: number): string {
  const safeSeconds = clampRestSeconds(seconds);
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;
  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

function messageBankForCategory(category: RestCompleteMessageInput["category"]): readonly string[] {
  if (category === "strength_power") return [...strengthPowerRestCompleteMessages, ...restCompleteMessageBank];
  if (category === "hypertrophy") return [...hypertrophyRestCompleteMessages, ...restCompleteMessageBank];
  return restCompleteMessageBank;
}

function isSafeRestCompleteMessage(message: string): boolean {
  return (
    message.length <= 72 &&
    !/\b(injury|injured|pain|rehab|therapy|cure|fixes|fix|guaranteed|kill|die|dead|hate|fat|lazy)\b/i.test(message)
  );
}
