import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { projectCanonicalProgress } from "@/application/training/canonical-progress-projection";

const source = readFileSync("app/(protected)/(tabs)/analytics.tsx", "utf8");
const presentationSource = readFileSync("src/application/training/canonical-progress-presentation.ts", "utf8");
const dashboardSource = readFileSync("src/ui/progress-dashboard.tsx", "utf8");

describe("canonical Progress production boundary", () => {
  it("uses the athlete presentation boundary while keeping repositories and evaluation out of the screen", () => {
    expect(source).toContain("useCanonicalProgressPresentation");
    expect(source).toContain("ProgressDashboard");
    expect(source).not.toMatch(/canonicalProgressEvidenceRepository|canonicalProgressDecisionRepository|evaluateCanonicalProgress|projectCanonicalProgress|applyProgressDecision/);
    expect(presentationSource).toContain("canonicalProgressEvidenceRepository");
    expect(presentationSource).toContain("canonicalProgressDecisionRepository");
    expect(source).not.toMatch(/activeTrainingPlanRepository|workoutHistoryRepository|summarizeWorkoutHistory|currentBlock|activeBlockId|TrainingYear|annual-planner|volumeAdjustment|applyRecommendation/);
  });

  it("keeps projection pure and explicit when evidence is absent", () => {
    const result = projectCanonicalProgress({ status: "empty", plan: null, evidence: [], evaluation: null, decision: null });
    expect(result.status).toBe("empty");
    expect(result.decision).toBeNull();
    expect(result.evidenceCount).toBe(0);
  });

  it("does not expose legacy fields or direct prescription controls", () => {
    expect(source).not.toMatch(/TrainingYear|currentBlock|activeBlockId|volumeAdjustment|nextBlock|setPrescription/);
    expect(source).not.toContain("generatedWorkout");
  });

  it("keeps evidence rules disclosed and athlete summaries explicit", () => {
    expect(dashboardSource).toContain('DetailToggle label="How this is calculated"');
    expect(dashboardSource).toContain("View workout");
    expect(dashboardSource).not.toMatch(/statusExplanation|\/ 4 wk|Metric label=\"Completed\"|>Open</);
    expect(presentationSource).toContain("Trained ${weeks.size} of the last 4 weeks");
  });
});
