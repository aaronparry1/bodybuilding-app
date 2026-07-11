import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  buildV2QaPreviewRecords,
  generateV2QaPreviewMarkdown,
  V2_QA_PREVIEW_CASES,
  V2_QA_PREVIEW_REPORT_PATH,
} from "@/domain/training/run-v2-qa-preview";

describe("V2 QA preview harness", () => {
  it("generates the required Train-screen-style preview cases", () => {
    const records = buildV2QaPreviewRecords();
    const ids = records.map((record) => record.id);

    expect(records).toHaveLength(12);
    expect(ids).toEqual([
      "hypertrophy_isolation",
      "hypertrophy_compound",
      "strength_squat",
      "strength_bench",
      "deadlift_calibration",
      "athletic_power",
      "athletic_accessory",
      "get_lean_poor_recovery",
      "deload",
      "duration_plank",
      "underloaded_top_range",
      "unsupported_fallback",
    ]);
    expect(V2_QA_PREVIEW_CASES.length).toBe(records.length);
  });

  it("renders compact QA-card rows for every supported case", () => {
    const records = buildV2QaPreviewRecords();

    expect(records.every((record) => record.output?.chips.cycle)).toBe(true);
    expect(records.every((record) => record.output?.chips.intent.includes("/"))).toBe(true);
    expect(records.every((record) => record.output?.chips.reps)).toBe(true);
    expect(records.every((record) => record.output?.chips.load)).toBe(true);
    expect(records.every((record) => record.output?.chips.sets)).toBe(true);
    expect(records.every((record) => typeof record.output?.confidence === "number")).toBe(true);
  });

  it("keeps risky preview cases conservative or clearly flagged", () => {
    const records = buildV2QaPreviewRecords();
    const squat = records.find((record) => record.id === "strength_squat");
    const bench = records.find((record) => record.id === "strength_bench");
    const deadlift = records.find((record) => record.id === "deadlift_calibration");
    const deload = records.find((record) => record.id === "deload");
    const plank = records.find((record) => record.id === "duration_plank");
    const fallback = records.find((record) => record.id === "unsupported_fallback");

    expect(squat?.output?.sessionStrategy.set_objective).not.toBe("recovery");
    expect(bench?.output?.sessionStrategy.set_objective).not.toBe("recovery");
    expect(deadlift?.output?.loadPrescription.load_action).not.toBe("increase_load");
    expect(deadlift?.output?.sessionStrategy.set_objective).toBe("calibration");
    expect(deadlift?.flags).not.toContain("deadlift_calibration_intent_review");
    expect(deload?.output?.loadPrescription.load_action).not.toBe("increase_load");
    expect(plank?.output?.loadPrescription.load_action).toBe("no_external_load");
    expect(plank?.flags).not.toContain("duration_load_invalid");
    expect(fallback?.flags).toContain("unsupported_fallback");
    expect(fallback?.output?.loadPrescription.load_action).not.toBe("increase_load");
  });

  it("produces a readable markdown report with the compact row table", () => {
    const markdown = generateV2QaPreviewMarkdown();

    expect(markdown).toContain("# V2 QA Preview");
    expect(markdown).toContain(`- Cases generated: ${V2_QA_PREVIEW_CASES.length}`);
    expect(markdown).toContain("| Case | Cycle | Intent | Reps | Load | Sets | Confidence | Flags |");
    expect(markdown).toContain("Hypertrophy isolation");
    expect(markdown).toContain("Unsupported fallback");
    expect(V2_QA_PREVIEW_REPORT_PATH).toBe("reports/adaptive_stress_lab/v2_qa_preview.md");
  });

  it("does not depend on Expo, Metro, network APIs, or production navigation", () => {
    const source = readFileSync("src/domain/training/run-v2-qa-preview.ts", "utf8");

    expect(source).not.toMatch(/from ["']expo/);
    expect(source).not.toMatch(/from ["']expo-router/);
    expect(source).not.toMatch(/npx expo|expo run|expo start/);
    expect(source).not.toMatch(/\bfetch\s*\(/);
    expect(source).not.toContain("expo-router");
    expect(source).not.toContain("router.push");
    expect(source).not.toContain("V2CoachingQaPanel");
  });
});
