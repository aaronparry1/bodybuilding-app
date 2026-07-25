import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { colors, workoutColors } from "@/ui/theme";

const trainPath = "app/(protected)/(tabs)/train.tsx";
const productionTrainPath = "app-production/(protected)/(tabs)/train.tsx";
const source = readFileSync(trainPath, "utf8");
const productionSource = readFileSync(productionTrainPath, "utf8");

describe("canonical Train brand boundary", () => {
  it("uses the shared semantic workout palette without raw colour literals or a duplicate local theme", () => {
    expect(source).toContain('import { colors, type, workoutColors } from "@/ui/theme"');
    expect(source).toContain("const TRAIN = workoutColors");
    expect(source).not.toMatch(/#[\da-f]{3,8}\b|rgba?\(|hsla?\(/i);
    expect(source).not.toMatch(/const\s+TRAIN\s*=\s*\{/);
    expect(productionSource).toContain('export { default } from "../../../app/(protected)/(tabs)/train"');
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
});
