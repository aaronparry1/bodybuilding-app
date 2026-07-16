import { describe, expect, it } from "vitest";
import { createTrainingBlock } from "@/domain/training/annual-planner";
import { resolveHeavyExposureBudget } from "@/domain/training/block-training-lanes";
import { resolveEventTaper } from "@/domain/training/event-taper";
import { createActiveTrainingPlan } from "@/domain/training/plan-setup";
import { resolveProgressionThrottle } from "@/domain/training/progression-throttle";
import { approveVolumeAdjustment } from "@/domain/training/volume-adjustments";
import type { PersonalisedVolumeResult } from "@/domain/training/personalised-volume";

function volumeRecommendation(action: PersonalisedVolumeResult["recommendedLadderAction"]): PersonalisedVolumeResult {
  return {
    muscleGroup: "chest",
    status: "underdosed",
    confidence: "medium",
    currentProductiveSetsPerWeek: 8,
    trend: "stable",
    recommendedLadderAction: action,
    reason: "Chest needs more useful work.",
    userCopy: "Chest needs another slot.",
    evidence: {
      weeksObserved: 3,
      exposures: 3,
      extraSessionExposures: 0,
      shutdownRate: 0,
      progressionRate: 0,
      averageProductiveSetsPerWeek: 8,
      recentProductiveSetsPerWeek: 8,
      previousProductiveSetsPerWeek: 8,
      productiveRange: { low: 10, high: 16 },
      summary: ["3 weeks of evidence."],
    },
  };
}

describe("event countdown and taper model", () => {
  it("classifies long, medium, taper, event-week, and post-event phases", () => {
    expect(resolveEventTaper({ weeksUntilEvent: 16 }).eventPhase).toBe("base");
    expect(resolveEventTaper({ weeksUntilEvent: 10 }).eventPhase).toBe("build");
    expect(resolveEventTaper({ weeksUntilEvent: 6 }).eventPhase).toBe("specificity");
    expect(resolveEventTaper({ weeksUntilEvent: 3 }).eventPhase).toBe("taper");
    expect(resolveEventTaper({ weeksUntilEvent: 1 }).eventPhase).toBe("event_week");
    expect(resolveEventTaper({ weeksUntilEvent: -1 }).eventPhase).toBe("post_event");
  });

  it("short timelines create a sensible short plan and long timelines create a fuller runway", () => {
    const short = createActiveTrainingPlan(
      {
        goal: "powerlifting_meet",
        planningChoice: "custom_date_event",
        eventType: "powerlifting_meet",
        targetDate: "2026-06-20",
        equipmentPreset: "full_gym",
        daysPerWeek: 4,
        preferredSplit: "upper_lower",
        experienceLevel: "intermediate",
      },
      "2026-06-01T00:00:00.000Z",
    );
    const long = createActiveTrainingPlan(
      {
        goal: "powerlifting_meet",
        planningChoice: "custom_date_event",
        eventType: "powerlifting_meet",
        targetDate: "2026-12-01",
        equipmentPreset: "full_gym",
        daysPerWeek: 4,
        preferredSplit: "upper_lower",
        experienceLevel: "intermediate",
      },
      "2026-06-01T00:00:00.000Z",
    );

    expect(short.blocks.map((block) => block.type)).toEqual(["powerbuilding", "strength", "strength", "power", "peak", "deload"]);
    expect(long.blocks.map((block) => block.type)).toEqual(["powerbuilding", "strength", "strength", "power", "peak", "deload"]);
    expect(long.blocks.length).toBe(short.blocks.length);
  });

  it("powerlifting events favour peak/specificity and photoshoot events favour fatigue management", () => {
    const meet = resolveEventTaper({ eventType: "powerlifting_meet", weeksUntilEvent: 6 });
    const photoshoot = resolveEventTaper({ eventType: "photoshoot", weeksUntilEvent: 1 });

    expect(meet.eventPhase).toBe("specificity");
    expect(meet.intensityGuidance).toBe("specific");
    expect(meet.readinessNote).toContain("event-relevant lifts");
    expect(photoshoot.volumeGuidance).toBe("minimal");
    expect(photoshoot.readinessNote).toContain("fatigue low");
  });

  it("final week suppresses volume additions and taper suppresses novelty", () => {
    const plan = createActiveTrainingPlan(
      {
        goal: "powerlifting_meet",
        planningChoice: "custom_date_event",
        eventType: "photoshoot",
        targetDate: "2026-06-08",
        equipmentPreset: "full_gym",
        daysPerWeek: 4,
        preferredSplit: "upper_lower",
        experienceLevel: "intermediate",
      },
      "2026-06-01T00:00:00.000Z",
    );
    const next = approveVolumeAdjustment(plan, volumeRecommendation("add_exercise"), "2026-06-04T10:00:00.000Z");
    const taper = resolveEventTaper({ eventType: "photoshoot", weeksUntilEvent: 3 });

    expect(next).toBe(plan);
    expect(taper.noveltyAllowance).toBe("none");
  });

  it("event taper suppresses aggressive progression", () => {
    const decision = resolveProgressionThrottle({
      exerciseRole: "primary_compound",
      exerciseFamily: "horizontal_press",
      goal: "powerlifting_meet",
      experienceLevel: "intermediate",
      currentBlock: "peak",
      targetRepRange: { min: 3, max: 5 },
      progressionEarned: true,
      eventTaper: resolveEventTaper({ eventType: "powerlifting_meet", weeksUntilEvent: 2 }),
    });

    expect(decision.decision).toBe("hold");
    expect(decision.reason).toContain("Readiness");
  });

  it("event taper tightens heavy exposure budgets", () => {
    const normal = resolveHeavyExposureBudget({ blockType: "strength", experienceLevel: "intermediate" });
    const taper = resolveHeavyExposureBudget({
      blockType: "strength",
      experienceLevel: "intermediate",
      eventTaper: resolveEventTaper({ eventType: "powerlifting_meet", weeksUntilEvent: 2 }),
    });

    expect(taper.hardCompoundSetsPerWeek).toBeLessThan(normal.hardCompoundSetsPerWeek);
    expect(taper.reason).toContain("Event taper");
  });

  it("post-event reset appears without fake claims", () => {
    const result = resolveEventTaper({ eventType: "sport_season", weeksUntilEvent: -1, currentBlock: createTrainingBlock("power").type });
    const copy = `${result.readinessNote} ${result.evidence.join(" ")}`;

    expect(result.eventPhase).toBe("post_event");
    expect(result.progressionAggressiveness).toBe("reset");
    expect(copy).not.toMatch(/guaranteed|injury|cure|therapy|rehab|velocity/i);
  });
});
