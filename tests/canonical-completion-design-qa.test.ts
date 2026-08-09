import { beforeEach, describe, expect, it } from "vitest";
import { applyCanonicalCompletionVisualState } from "@/application/design-qa/canonical-five-day-plan-fixture";
import { projectCanonicalCompletionSummary } from "@/application/training/canonical-completion-summary-presentation";
import { canonicalRecordedSessionLedger } from "@/data/local/canonical-recorded-session-ledger";
import { jsonStore } from "@/data/local/json-store";

describe("canonical completion Design QA states", () => {
  beforeEach(() => { jsonStore.clearByPrefix("iron-logic."); jsonStore.resetCache(); });

  it.each([
    ["ordinary", 0, "complete"],
    ["missing_history", 0, "complete"],
    ["pr", 1, "complete"],
    ["multiple", 2, "complete"],
    ["partial", 1, "partial"],
    ["long_accessibility", 2, "complete"],
    ["sharing", 1, "complete"],
  ] as const)("projects truthful %s state", (state, minimumAchievements, completion) => {
    const result = applyCanonicalCompletionVisualState(state);
    const aggregate = canonicalRecordedSessionLedger.get(result.recordedSessionId);
    expect(aggregate.status).toBe("found");
    if (aggregate.status !== "found") return;
    const summary = projectCanonicalCompletionSummary({
      session: aggregate.session,
      events: aggregate.events,
      history: canonicalRecordedSessionLedger.exportPlan(aggregate.session.planId),
      displayUnit: "lb",
      programmePosition: "Accumulation · week 2",
      nextWorkoutLabel: "Lower strength",
      nextPrescription: "Back Squat · 220 lb · 3 × 5",
    });
    expect(summary.completion).toBe(completion);
    expect(summary.achievements.length).toBeGreaterThanOrEqual(minimumAchievements);
    expect(summary.achievements.length).toBeLessThanOrEqual(4);
    expect(summary.programmePosition).toBe("Accumulation · week 2");
    expect(summary.nextPrescription).toContain("220 lb");
    if (minimumAchievements === 0) expect(summary.achievements).toEqual([]);
    for (const achievement of summary.achievements) if (achievement.unit) expect(achievement.unit).toBe("lb");
  });
});
