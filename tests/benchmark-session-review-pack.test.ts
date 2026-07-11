import { existsSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  BENCHMARK_SESSION_REVIEW_PACK_PATH,
  buildBenchmarkSessionReviewPackData,
  generateBenchmarkSessionReviewPackHtml,
  writeBenchmarkSessionReviewPack,
} from "@/domain/training/run-benchmark-session-review-pack";

describe("benchmark session review pack", () => {
  it("builds the summary from all complete V2 benchmark sessions", () => {
    const data = buildBenchmarkSessionReviewPackData("2026-06-30T12:00:00.000Z");

    expect(data.summary.totalSessions).toBe(25);
    expect(data.summary.questionableSessions).toBe(12);
    expect(data.summary.repeatedExerciseBiasCount).toBe(2);
    expect(data.summary.unnecessaryFatigueCount).toBe(4);
    expect(data.summary.poorSpecificityCount).toBe(0);
    expect(data.summary.lackOfVarietyCount).toBe(8);
    expect(data.summary.unnecessaryComplexityCount).toBe(0);
    expect(data.sessions).toHaveLength(25);
  });

  it("renders every session as a browser-openable static review card", () => {
    const html = generateBenchmarkSessionReviewPackHtml(buildBenchmarkSessionReviewPackData("2026-06-30T12:00:00.000Z"));

    expect(html).toContain("<!doctype html>");
    expect(html).toContain("Benchmark Session Review Pack");
    expect(html).toContain("Open this file in your browser.");
    expect(html).toContain("Gold status is earned after Aaron review.");
    expect(html).not.toContain("Gold Standard Sessions");
    expect(html.match(/<article class="session/g)?.length).toBe(25);
    expect(html).toContain("Strength Peak SBD");
    expect(html).toContain("Hypertrophy Push Quality");
    expect(html).toContain("Build Muscle + Strength Upper Anchor");
    expect(html).toContain("Athletic Power Session");
    expect(html).toContain("Get Lean Full Body");
  });

  it("shows session header, coach intent, stimuli, delivery, prescription, and review fields", () => {
    const html = generateBenchmarkSessionReviewPackHtml(buildBenchmarkSessionReviewPackData("2026-06-30T12:00:00.000Z"));

    expect(html).toContain("Coach Intent");
    expect(html).toContain("Macro intent");
    expect(html).toContain("Meso focus");
    expect(html).toContain("Micro emphasis");
    expect(html).toContain("Required Stimuli");
    expect(html).toContain("Exercise Delivery");
    expect(html).toContain("Prescription");
    expect(html).toContain("Aaron score: ___ / 10");
    expect(html).toContain("✅ Approve");
    expect(html).toContain("⚠️ Needs tweak");
    expect(html).toContain("❌ Reject");
    expect(html).toContain("Notes:");
  });

  it("highlights all requested flag categories", () => {
    const html = generateBenchmarkSessionReviewPackHtml(buildBenchmarkSessionReviewPackData("2026-06-30T12:00:00.000Z"));

    expect(html).toContain("Repeated exercise bias");
    expect(html).toContain("Unnecessary fatigue");
    expect(html).toContain("Poor specificity");
    expect(html).toContain("Lack of variety");
    expect(html).toContain("Unnecessary complexity");
    expect(html).toContain("low_confidence_session");
    expect(html).toContain("questionable_exercise");
    expect(html).toContain("repeated_exercise_bias: yes");
    expect(html).toContain("unnecessary_fatigue: yes");
    expect(html).toContain("lack_of_variety: yes");
  });

  it("writes the review pack without app, Expo, server, or network dependencies", () => {
    const path = join("/tmp", "benchmark_session_review_pack.test.html");
    rmSync(path, { force: true });

    expect(writeBenchmarkSessionReviewPack(path)).toBe(path);
    expect(existsSync(path)).toBe(true);

    const html = readFileSync(path, "utf8");
    const source = readFileSync("src/domain/training/run-benchmark-session-review-pack.ts", "utf8");

    expect(html).toContain("No server, network, Expo, simulator, app build, or production UI required.");
    expect(BENCHMARK_SESSION_REVIEW_PACK_PATH).toBe("reports/adaptive_stress_lab/benchmark_session_review_pack.html");
    expect(source).not.toMatch(/from ["']expo/);
    expect(source).not.toMatch(/\bfetch\s*\(/);
    expect(source).not.toContain("expo-router");
    expect(source).not.toContain("router.push");
    expect(html).not.toContain("<script");
    expect(html).not.toContain("localStorage");
  });
});
