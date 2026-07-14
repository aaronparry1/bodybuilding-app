import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import type { BlockType, TrainingBlock } from "@/domain/training/annual-models";
import { createActiveTrainingPlan, type ActiveTrainingPlan, type TrainingSetupGoal } from "@/domain/training/plan-setup";
import type { Exercise, SetLog, WorkoutExerciseLog, WorkoutSession } from "@/domain/training/models";
import { exerciseLibrary } from "@/domain/training/presets";
import { buildV2CoachingQaOutput, type V2CoachingQaOutput } from "@/domain/training/v2-coaching-qa";

export interface V2QaPreviewCase {
  id: string;
  name: string;
  goal: TrainingSetupGoal;
  blockType: BlockType;
  exerciseId?: string;
  exerciseName?: string;
  load?: number;
  loadKnown?: boolean;
  reps?: number[];
  repRange?: { min: number; max: number };
  status?: WorkoutExerciseLog["status"];
  expectedNoIncrease?: boolean;
}

export interface V2QaPreviewRecord {
  id: string;
  name: string;
  output: V2CoachingQaOutput | null;
  flags: string[];
}

export const V2_QA_PREVIEW_REPORT_PATH = "reports/adaptive_stress_lab/v2_qa_preview.md";

export const V2_QA_PREVIEW_CASES: V2QaPreviewCase[] = [
  { id: "hypertrophy_isolation", name: "Hypertrophy isolation", goal: "build_muscle", blockType: "hypertrophy", exerciseId: "ex-dumbbell-lateral-raise", load: 12, reps: [15, 14] },
  { id: "hypertrophy_compound", name: "Hypertrophy compound", goal: "build_muscle", blockType: "hypertrophy", exerciseId: "ex-leg-press", load: 140, reps: [12, 11] },
  { id: "strength_squat", name: "Strength squat", goal: "build_strength", blockType: "strength", exerciseId: "ex-barbell-back-squat", exerciseName: "Competition Squat", load: 150, reps: [5, 5], repRange: { min: 3, max: 5 } },
  { id: "strength_bench", name: "Strength bench", goal: "build_strength", blockType: "strength", exerciseId: "ex-bench-press", exerciseName: "Competition Bench Press", load: 100, reps: [5, 5, 5], repRange: { min: 3, max: 5 } },
  { id: "deadlift_calibration", name: "Deadlift calibration", goal: "build_strength", blockType: "strength", exerciseId: "ex-deadlift", exerciseName: "Competition Deadlift", load: 180, reps: [], loadKnown: false, repRange: { min: 1, max: 4 }, expectedNoIncrease: true },
  { id: "athletic_power", name: "Athletic power movement", goal: "athletic_performance", blockType: "power", exerciseId: "ex-box-jump", load: 0, reps: [3, 3], repRange: { min: 2, max: 4 } },
  { id: "athletic_accessory", name: "Athletic accessory", goal: "athletic_performance", blockType: "power", exerciseId: "ex-triceps-pushdown", load: 35, reps: [12, 11] },
  { id: "get_lean_poor_recovery", name: "Get lean poor recovery", goal: "get_leaner", blockType: "deload", exerciseId: "ex-leg-press", load: 120, reps: [10, 9], expectedNoIncrease: true },
  { id: "deload", name: "Deload", goal: "build_muscle_and_strength", blockType: "deload", exerciseId: "ex-machine-chest-press", load: 80, reps: [10, 10], expectedNoIncrease: true },
  { id: "duration_plank", name: "Duration plank", goal: "build_muscle_and_strength", blockType: "hypertrophy", exerciseId: "ex-plank", load: 0, reps: [45, 40], expectedNoIncrease: true },
  { id: "underloaded_top_range", name: "Underloaded / top-range", goal: "build_muscle", blockType: "hypertrophy", exerciseId: "ex-machine-chest-press", load: 80, reps: [12, 12] },
  { id: "unsupported_fallback", name: "Unsupported fallback", goal: "build_muscle_and_strength", blockType: "hypertrophy", exerciseName: "Mystery Lift", load: 0, loadKnown: false, reps: [], expectedNoIncrease: true },
];

export function buildV2QaPreviewRecords(cases: V2QaPreviewCase[] = V2_QA_PREVIEW_CASES): V2QaPreviewRecord[] {
  return cases.map((previewCase) => {
    const metadata = previewCase.exerciseId ? exerciseLibrary.find((candidate) => candidate.id === previewCase.exerciseId) : undefined;
    const exercise = exerciseLogForCase(previewCase, metadata);
    const session = sessionForCase(previewCase, exercise);
    const canonicalPlan = activePlanForCase(previewCase);
    const output = buildV2CoachingQaOutput({
      enabled: true,
      session,
      exercise,
      exerciseIndex: 0,
      metadata,
      activePlan: canonicalPlan,
      currentMesocycleId: canonicalPlan.currentMesocycleId,
      currentMicrocycle: canonicalPlan.currentMicrocycle,
    });

    return {
      id: previewCase.id,
      name: previewCase.name,
      output,
      flags: flagsForCase(previewCase, output, metadata),
    };
  });
}

export function generateV2QaPreviewMarkdown(records: V2QaPreviewRecord[] = buildV2QaPreviewRecords()) {
  const questionable = records.filter((record) => record.flags.length > 0);
  const lines = [
    "# V2 QA Preview",
    "",
    "Status: dev/test-only report. No simulator, network, Expo, Metro, or production navigation required.",
    "",
    "## Summary",
    "",
    `- Cases generated: ${records.length}`,
    `- Questionable outputs: ${questionable.length}`,
    "",
    "## Preview Rows",
    "",
    "| Case | Cycle | Intent | Reps | Load | Sets | Confidence | Flags |",
    "| --- | --- | --- | --- | --- | --- | --- | --- |",
    ...records.map((record) => {
      const chips = record.output?.chips;
      return [
        record.name,
        chips?.cycle ?? "No output",
        chips?.intent ?? "No output",
        chips?.reps ?? "No output",
        chips?.load ?? "No output",
        chips?.sets ?? "No output",
        record.output ? `${record.output.confidence}%` : "0%",
        record.flags.length ? record.flags.join(", ") : "none",
      ].map(tableCell).join(" | ");
    }).map((row) => `| ${row} |`),
    "",
    "## Questionable Outputs",
    "",
    ...(questionable.length
      ? questionable.map((record) => `- ${record.id}: ${record.name} (${record.flags.join(", ")})`)
      : ["- None flagged."]),
    "",
  ];

  return `${lines.join("\n")}\n`;
}

export function writeV2QaPreviewReport(path = V2_QA_PREVIEW_REPORT_PATH) {
  mkdirSync(dirname(path), { recursive: true });
  const markdown = generateV2QaPreviewMarkdown();
  writeFileSync(path, markdown);
  return path;
}

function exerciseLogForCase(previewCase: V2QaPreviewCase, metadata: Exercise | undefined): WorkoutExerciseLog {
  const exerciseName = previewCase.exerciseName ?? metadata?.name ?? "Mystery Lift";
  const settings = {
    ...(metadata?.defaultSettings ?? {
      repRange: { min: 8, max: 12 },
      dropOffPercent: 15,
      loadIncrease: 2.5,
      unit: "kg" as const,
      requiredWorkSets: 2,
    }),
    ...(previewCase.repRange ? { repRange: previewCase.repRange } : {}),
  };
  return {
    id: `preview-${previewCase.id}`,
    exerciseId: metadata?.id ?? `unsupported-${previewCase.id}`,
    exerciseName,
    settings,
    load: previewCase.load ?? 0,
    loadKnown: previewCase.loadKnown ?? true,
    sets: (previewCase.reps ?? []).map((reps, index) => workSet(index + 1, previewCase.load ?? 0, reps)),
    status: previewCase.status ?? "active",
    origin: "planned",
  };
}

function sessionForCase(previewCase: V2QaPreviewCase, exercise: WorkoutExerciseLog): WorkoutSession {
  return {
    id: `preview-session-${previewCase.id}`,
    userId: "v2-qa-preview",
    sessionKind: "planned",
    name: previewCase.name,
    startedAt: "2026-06-29T10:00:00.000Z",
    updatedAt: "2026-06-29T10:00:00.000Z",
    syncState: "local",
    exercises: [exercise],
  };
}

function activePlanForCase(previewCase: V2QaPreviewCase): ActiveTrainingPlan {
  return createActiveTrainingPlan({ goal: previewCase.goal, planningChoice: "recommended_12_month", equipmentPreset: "full_gym", daysPerWeek: 4, preferredSplit: "upper_lower", experienceLevel: "intermediate" }, "2026-06-01T00:00:00.000Z");
}

function flagsForCase(previewCase: V2QaPreviewCase, output: V2CoachingQaOutput | null, metadata: Exercise | undefined) {
  const flags: string[] = [];
  if (!output) flags.push("no_output");
  if (!metadata) flags.push("unsupported_fallback");
  if (output && output.confidence < 65) flags.push("low_confidence");
  if (previewCase.expectedNoIncrease && output?.loadPrescription.load_action === "increase_load") flags.push("unexpected_load_increase");
  if (previewCase.id === "duration_plank" && output?.loadPrescription.load_action !== "no_external_load") flags.push("duration_load_invalid");
  if (previewCase.id === "deadlift_calibration" && output?.sessionStrategy.set_objective !== "calibration") flags.push("deadlift_calibration_intent_review");
  return flags;
}

function workSet(setNumber: number, load: number, reps: number): SetLog {
  return {
    id: `preview-set-${setNumber}`,
    setNumber,
    type: "work",
    load,
    reps,
    loggedAt: `2026-06-29T10:0${setNumber}:00.000Z`,
  };
}

function tableCell(value: string) {
  return value.replace(/\|/g, "\\|");
}
