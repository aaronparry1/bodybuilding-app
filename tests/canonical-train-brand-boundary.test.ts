import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { colors, workoutColors } from "@/ui/theme";

const trainPath = "app/(protected)/(tabs)/train.tsx";
const productionTrainPath = "app-production/(protected)/(tabs)/train.tsx";
const completionSummaryPath = "app/(protected)/completion-summary.tsx";
const source = readFileSync(trainPath, "utf8");
const productionSource = readFileSync(productionTrainPath, "utf8");
const completionSummarySource = readFileSync(completionSummaryPath, "utf8");
const homeSource = readFileSync("src/ui/home-dashboard.tsx", "utf8");
const workoutVisualsSource = readFileSync("src/ui/workout-visuals.tsx", "utf8");

describe("canonical Train brand boundary", () => {
  it("uses the shared semantic workout palette without raw colour literals or a duplicate local theme", () => {
    expect(source).toContain('import { type, workoutColors } from "@/ui/theme"');
    expect(source).toContain("const TRAIN = workoutColors");
    expect(source).not.toMatch(/#[\da-f]{3,8}\b|rgba?\(|hsla?\(/i);
    expect(source).not.toMatch(/const\s+TRAIN\s*=\s*\{/);
    expect(productionSource).toContain('export { default } from "../../../app/(protected)/(tabs)/train"');
    expect(completionSummarySource).toContain('import { spacing, type, workoutColors } from "@/ui/theme"');
    expect(completionSummarySource).toContain("const TRAIN = workoutColors");
    expect(completionSummarySource).not.toMatch(/#[\da-f]{3,8}\b|rgba?\(|hsla?\(/i);
  });

  it("keeps distinct active, completed, warning, destructive, disabled and rest semantics", () => {
    expect(workoutColors.accent).toBe(colors.accent);
    expect(workoutColors.success).toBe(colors.success);
    expect(workoutColors.warning).toBe(colors.warning);
    expect(workoutColors.danger).toBe(colors.danger);
    expect(new Set([
      workoutColors.accent,
      workoutColors.success,
      workoutColors.warning,
      workoutColors.danger,
      workoutColors.surfaceRaised,
    ]).size).toBe(5);
    for (const token of ["TRAIN.accent", "TRAIN.success", "TRAIN.danger", "TRAIN.surfaceRaised", "styles.disabled"]) {
      expect(source).toContain(token);
    }
  });

  it("keeps a zero-rest linked transition visible instead of silently hiding the next exercise", () => {
    expect(source).toContain('testID="train-next-instruction"');
    expect(source).toContain('lastInstruction?.startsWith("Move directly")');
    expect(source).toContain("styles.nextInstruction");
  });

  it("keeps a timed method instruction visible while its canonical rest timer is running", () => {
    expect(source).toContain('{nextInstruction ? <Text testID="train-next-instruction"');
    expect(source).not.toContain("{expired && nextInstruction ?");
  });

  it("keeps branded workout foreground/background pairs above normal-text contrast", () => {
    const pairs = [
      [workoutColors.text, workoutColors.background],
      [workoutColors.text, workoutColors.surface],
      [workoutColors.muted, workoutColors.background],
      [workoutColors.accent, workoutColors.accentSoft],
      [workoutColors.success, workoutColors.successSoft],
      [workoutColors.warning, workoutColors.warningSoft],
      [workoutColors.danger, workoutColors.dangerSoft],
      [workoutColors.background, workoutColors.accent],
      [workoutColors.background, workoutColors.danger],
    ] as const;
    for (const [foreground, background] of pairs) {
      expect(contrastRatio(foreground, background)).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("carries one workout identity and metric hierarchy through Home, preview and completion", () => {
    expect(workoutVisualsSource).toContain("export function WorkoutStage");
    expect(workoutVisualsSource).toContain("export function WorkoutMetricStrip");
    expect(homeSource).toContain("<WorkoutStage");
    expect(homeSource).toContain("<WorkoutMetricStrip");
    expect(source).toContain("<WorkoutStage");
    expect(source).toContain("<WorkoutMetricStrip");
    expect(completionSummarySource).toContain("<WorkoutMetricStrip centered");
    expect(source).toContain("styles.exerciseEditAction");
    expect(source).not.toContain('<SecondaryButton label="Swap or add exercise"');
  });
});

function contrastRatio(foreground: string, background: string): number {
  const foregroundLuminance = relativeLuminance(foreground);
  const backgroundLuminance = relativeLuminance(background);
  return (Math.max(foregroundLuminance, backgroundLuminance) + 0.05)
    / (Math.min(foregroundLuminance, backgroundLuminance) + 0.05);
}

function relativeLuminance(hex: string): number {
  const channels = [1, 3, 5].map((offset) => Number.parseInt(hex.slice(offset, offset + 2), 16) / 255)
    .map((channel) => channel <= 0.03928
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4);
  return (0.2126 * channels[0]!) + (0.7152 * channels[1]!) + (0.0722 * channels[2]!);
}
