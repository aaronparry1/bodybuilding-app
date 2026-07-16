import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const architecturePath = "docs/adaptive-strength-coach-master-architecture.md";

const lockedDecisions = [
  "8D: Adaptive Training State Architecture",
  "8E: Adaptation Detection Engine",
  "8F: Intervention Decision Engine",
  "8G: Exercise Rotation & Variation Policy",
  "8H: Method Selection Engine",
  "8I: Loading & Progression Policy",
  "8J: Recovery Management Engine",
  "8K: Coaching Decision Resolver",
  "9A: Warm-up Policy",
  "9B: Session Composition Policy",
  "9C: Training Resource Allocation Policy",
  "9D: Support Function Policy",
  "9E: Exercise Matching Engine",
  "9F: Recovery Between Efforts Policy",
  "9G: Session Density Policy",
  "9H: Energy System Development Policy",
  "9I: Living Athlete Model",
  "9J: Coaching Evidence Engine",
  "10A: Live Workout Coaching Engine",
  "10B: Live Constraint Resolution Engine",
  "10C: Live Safety & Pain Policy",
  "10D: Quality of Execution Engine",
  "10E: Productive Training Exposure Policy",
  "10F: Post-Workout Review Flow",
  "10G: Runtime Architecture",
  "10H: Session PR Opportunity Policy",
  "11A: Goal Translation Engine",
  "12C: Development Track Learning Engine",
  "12A: ResolvedWorkoutIntent / CoachingPacket Contract",
  "12B: CoachingPacket Production Pipeline",
  "12C: Builder Purge / Legacy Decision Quarantine",
  "12D: End-to-End Coaching Loop Smoke Test",
  "13A: First Shippable Coaching Loop",
] as const;

const requiredGlobalRules = [
  "Codex must not invent coaching logic outside the appropriate engine or policy.",
  "Workout Builder must assemble outputs, not make coaching decisions.",
  "Only Coaching Decision Resolver emits final programme-changing decisions.",
  "Only Coaching Evidence Engine updates learned athlete traits.",
  "Living Athlete Model stores athlete truth but never makes decisions.",
  "Every workout element must trace back to a coaching decision.",
  "Every engine must return reason codes where applicable.",
  "Safety, pain, and recovery vetoes must be respected.",
  "Lower-level policies must not directly mutate programme state.",
  "Future features must be added to this document before implementation.",
] as const;

const policyFiles = [
  "src/domain/training/adaptive-training-state.ts",
  "src/domain/training/adaptation-detection-engine.ts",
  "src/domain/training/exercise-rotation-policy.ts",
  "src/domain/training/coaching-evidence-engine.ts",
  "src/domain/training/live-workout-coaching-engine.ts",
  "src/domain/training/live-constraint-resolution-engine.ts",
  "src/domain/training/live-safety-pain-policy.ts",
  "src/domain/training/quality-of-execution-engine.ts",
  "src/domain/training/productive-training-exposure-policy.ts",
  "src/domain/training/post-workout-review-flow.ts",
  "src/domain/training/runtime-architecture.ts",
  "src/domain/training/session-pr-opportunity-policy.ts",
  "src/domain/training/goal-translation-engine.ts",
  "src/domain/training/development-track-learning-engine.ts",
  "src/domain/training/first-shippable-coaching-loop.ts",
] as const;

describe("Adaptive Strength Coach master architecture", () => {
  it("documents every locked coaching decision from 8D onward", () => {
    const doc = readFileSync(architecturePath, "utf8");

    for (const decision of lockedDecisions) {
      expect(doc).toContain(decision);
    }
    for (const rule of requiredGlobalRules) {
      expect(doc).toContain(rule);
    }
  });

  it("documents required fields for every decision section", () => {
    const doc = readFileSync(architecturePath, "utf8");
    const requiredFields = [
      "Purpose:",
      "Responsibility:",
      "Inputs:",
      "Outputs:",
      "Allowed to decide:",
      "Not allowed to decide:",
      "Upstream dependencies:",
      "Downstream consumers:",
      "Conflict rules:",
      "Regression protections:",
    ];

    for (const decision of lockedDecisions) {
      const start = doc.indexOf(`### ${decision}`);
      expect(start, `Missing section ${decision}`).toBeGreaterThan(-1);
      const next = doc.indexOf("\n### ", start + 1);
      const section = doc.slice(start, next === -1 ? undefined : next);
      for (const field of requiredFields) {
        expect(section, `${decision} missing ${field}`).toContain(field);
      }
    }
  });

  it("keeps programme mutation authority out of lower-level policies", () => {
    const forbiddenMutation = /\b(mutateProgramme|replaceProgramme|transitionProgramme|writeWorkout|startWorkout)\s*\(/i;
    for (const file of policyFiles) {
      const source = readFileSync(file, "utf8");
      expect(source, `${file} must not mutate programmes or start workouts`).not.toMatch(forbiddenMutation);
    }
  });

  it("keeps learned-athlete-trait writes behind the Coaching Evidence Engine", () => {
    const filesThatMayCallLivingModelUpdateHelpers = [
      "src/domain/training/coaching-evidence-engine.ts",
    ];
    const forbiddenDirectLearningWrite = /\b(applyValidatedEvidenceToLearnedCharacteristic|addValidatedCoachingMemory)\s*\(/;
    for (const file of policyFiles.filter((path) => !filesThatMayCallLivingModelUpdateHelpers.includes(path))) {
      const source = readFileSync(file, "utf8");
      expect(source, `${file} must not directly update Living Athlete Model learning`).not.toMatch(forbiddenDirectLearningWrite);
    }
  });

  it("keeps random exercise, method, and conditioning selection out of builder-facing policies", () => {
    const noRandomSelection = /\b(Math\.random|randomExercise|randomMethod|randomConditioning|for variety|generic cardio|random finisher)\b/i;
    for (const file of policyFiles) {
      const source = readFileSync(file, "utf8");
      expect(source, `${file} must not contain random coaching selection`).not.toMatch(noRandomSelection);
    }
  });

  it("requires reason-code architecture across locked engine outputs", () => {
    const rationaleBasedFiles = [
      "src/domain/training/adaptive-training-state.ts",
    ];
    const filesWithReasonCodes = policyFiles.filter((path) => !rationaleBasedFiles.includes(path));
    for (const file of filesWithReasonCodes) {
      const source = readFileSync(file, "utf8");
      expect(source, `${file} should expose reason codes`).toMatch(/reason_codes|reasonCodes/);
    }
  });
});
