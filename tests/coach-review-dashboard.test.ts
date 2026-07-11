import { existsSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  buildCoachReviewDashboardData,
  COACH_REVIEW_DASHBOARD_PATH,
  generateCoachReviewDashboardHtml,
  writeCoachReviewDashboard,
} from "@/domain/training/run-coach-review-dashboard";
import { V2_QA_PREVIEW_CASES } from "@/domain/training/run-v2-qa-preview";

describe("coach review dashboard", () => {
  it("builds summary counts from the V2 QA preview records", () => {
    const data = buildCoachReviewDashboardData("2026-06-29T12:00:00.000Z");

    expect(data.summary.totalScenarios).toBe(V2_QA_PREVIEW_CASES.length);
    expect(data.summary.flaggedScenarios).toBe(2);
    expect(data.summary.unsupportedFallbackCount).toBe(1);
    expect(data.summary.lowConfidenceCount).toBe(2);
    expect(data.records).toHaveLength(V2_QA_PREVIEW_CASES.length);
  });

  it("renders every scenario as a browser-openable static HTML card", () => {
    const html = generateCoachReviewDashboardHtml(buildCoachReviewDashboardData("2026-06-29T12:00:00.000Z"));

    expect(html).toContain("<!doctype html>");
    expect(html).toContain("Open this file in your browser.");
    expect(html).toContain("Review each card and mark your verdict manually.");
    expect(html).toContain("Coach Review Dashboard");
    expect(html).toContain("Hypertrophy isolation");
    expect(html).toContain("Deadlift calibration");
    expect(html).toContain("Unsupported fallback");
    expect(html).toContain("Cycle");
    expect(html).toContain("Intent");
    expect(html).toContain("Reps");
    expect(html).toContain("Load");
    expect(html).toContain("Sets");
    expect(html).toContain("Confidence");
    expect(html).toContain("Flags");
  });

  it("includes manual Aaron verdict placeholders without persistence", () => {
    const html = generateCoachReviewDashboardHtml(buildCoachReviewDashboardData("2026-06-29T12:00:00.000Z"));

    expect(html).toContain("Aaron verdict");
    expect(html).toContain("✅ Looks right");
    expect(html).toContain("⚠️ Needs tweak");
    expect(html).toContain("❌ Wrong");
    expect(html).toContain("Notes: ________________________________");
    expect(html).not.toContain("localStorage");
    expect(html).not.toContain("<script");
  });

  it("highlights flags and low-confidence cases clearly", () => {
    const html = generateCoachReviewDashboardHtml(buildCoachReviewDashboardData("2026-06-29T12:00:00.000Z"));

    expect(html).toContain("Flagged scenarios");
    expect(html).toContain("Unsupported fallback");
    expect(html).toContain("Low confidence");
    expect(html).toContain("low_confidence");
    expect(html).toContain("unsupported_fallback");
  });

  it("writes the dashboard report file without app, Expo, server, or network dependencies", () => {
    const path = join("/tmp", "coach_review_dashboard.test.html");
    rmSync(path, { force: true });

    expect(writeCoachReviewDashboard(path)).toBe(path);
    expect(existsSync(path)).toBe(true);

    const html = readFileSync(path, "utf8");
    const source = readFileSync("src/domain/training/run-coach-review-dashboard.ts", "utf8");

    expect(html).toContain("No server, network, Expo, app build, or production UI required.");
    expect(COACH_REVIEW_DASHBOARD_PATH).toBe("reports/adaptive_stress_lab/coach_review_dashboard.html");
    expect(source).not.toMatch(/from ["']expo/);
    expect(source).not.toMatch(/\bfetch\s*\(/);
    expect(source).not.toContain("expo-router");
    expect(source).not.toContain("router.push");
  });
});
