import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { decidePlanningArchitecture, type PlanningArchitectureEventType } from "@/domain/training/planning-architecture";

const targetDate = "2026-12-01";

describe("planning architecture", () => {
  it("maps no target date to continuous development", () => {
    const decision = decidePlanningArchitecture();

    expect(decision).toMatchObject({
      architectureId: "continuous_development",
      displayName: "Continuous Development",
      hasFixedDate: false,
      mandatoryPhasesRequired: false,
      adaptiveBlockSelectionAllowed: true,
      adaptiveExecutionAllowed: true,
      requiresManualPlanning: false,
    });
    expect(decision.objective).toContain("Athlete Lifetime Progress");
    expect(decision.rationale).toContain("evidence-driven checkpoints");
  });

  it("maps performance events to performance peak", () => {
    for (const eventType of ["powerlifting_meet", "strongman_competition", "weightlifting_competition"] as const) {
      const decision = decidePlanningArchitecture({ eventType, targetDate });

      expect(decision).toMatchObject({
        architectureId: "performance_peak",
        displayName: "Performance Peak",
        hasFixedDate: true,
        mandatoryPhasesRequired: true,
        adaptiveBlockSelectionAllowed: false,
        adaptiveExecutionAllowed: true,
        eventType,
        targetDate,
        requiresManualPlanning: false,
      });
      expect(decision.objective).toBe("Maximise performance on event day.");
      expect(decision.rationale).toContain("required phases cannot be skipped");
    }
  });

  it("maps appearance events to appearance peak", () => {
    for (const eventType of ["bodybuilding_show", "photoshoot", "wedding", "holiday"] as const) {
      const decision = decidePlanningArchitecture({ eventType, targetDate });

      expect(decision).toMatchObject({
        architectureId: "appearance_peak",
        displayName: "Appearance Peak",
        hasFixedDate: true,
        mandatoryPhasesRequired: true,
        adaptiveBlockSelectionAllowed: false,
        adaptiveExecutionAllowed: true,
        eventType,
        targetDate,
        requiresManualPlanning: false,
      });
      expect(decision.objective).toContain("appearance and body composition");
      expect(decision.rationale).toContain("performance, fatigue, and preservation evidence");
    }
  });

  it("returns manual planning for custom targets", () => {
    const decision = decidePlanningArchitecture({ eventType: "custom", targetDate });

    expect(decision).toMatchObject({
      architectureId: "unknown_architecture",
      displayName: "Unknown Planning Architecture",
      hasFixedDate: true,
      mandatoryPhasesRequired: false,
      adaptiveBlockSelectionAllowed: false,
      adaptiveExecutionAllowed: false,
      eventType: "custom",
      targetDate,
      requiresManualPlanning: true,
    });
    expect(decision.rationale).toContain("should not guess");
  });

  it("does not implement phase skeletons", () => {
    const source = readFileSync("src/domain/training/planning-architecture.ts", "utf8");

    expect(source).not.toMatch(/phaseId|startWeek|endWeek|durationWeeks|peak_taper|strength_development/);
  });

  it("is deterministic and does not use network, storage, or async work", () => {
    const input = { eventType: "powerlifting_meet" as PlanningArchitectureEventType, targetDate };

    expect(decidePlanningArchitecture(input)).toEqual(decidePlanningArchitecture(input));

    const source = readFileSync("src/domain/training/planning-architecture.ts", "utf8");
    expect(source).not.toMatch(/\bfetch\s*\(/);
    expect(source).not.toMatch(/\bawait\b/);
    expect(source).not.toMatch(/AsyncStorage|localStorage|jsonStore|repository|supabase/i);
  });
});
