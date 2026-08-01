import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  shouldAutoEnterCanonicalActiveWorkout,
  type CanonicalExistingUserRouteDecision,
  type CanonicalRetainedTrainingPresence,
} from "@/application/training/canonical-existing-user-routing";
import {
  canonicalTrainWorkoutActions,
  resolveCanonicalTrainCompletionAffordance,
} from "@/application/training/canonical-train-interaction";

const train = readFileSync("app/(protected)/(tabs)/train.tsx", "utf8");
const tabs = readFileSync("app/(protected)/(tabs)/_layout.tsx", "utf8");
const protectedLayout = readFileSync("src/application/shell/production-protected-layout.tsx", "utf8");
const productionTrain = readFileSync("app-production/(protected)/(tabs)/train.tsx", "utf8");
const productionTabs = readFileSync("app-production/(protected)/(tabs)/_layout.tsx", "utf8");

describe("active Train navigation and focus repair", () => {
  it("mounts the repaired shared Train and tab routes in production", () => {
    expect(productionTrain).toContain('export { default } from "../../../app/(protected)/(tabs)/train"');
    expect(productionTabs).toContain('export { default } from "../../../app/(protected)/(tabs)/_layout"');
    expect(protectedLayout).toContain("shouldAutoEnterCanonicalActiveWorkout");
  });

  it("auto-enters a live started attempt at startup but leaves a deliberately minimised attempt on tabs", () => {
    const routeDecision: CanonicalExistingUserRouteDecision = { status: "authenticated", destination: "active_workout", reason: "resumable_active_workout_outranks_onboarding" };
    const presence = (status: "started" | "paused"): CanonicalRetainedTrainingPresence => ({ localPlanStatus: "saved", status: "plan_with_active_workout", reason: "retained_plan_and_active_workout_found", planId: "plan", activeRecordedSessionId: "recorded", activeRecordedSessionStatus: status });
    expect(shouldAutoEnterCanonicalActiveWorkout({ routeDecision, retainedTraining: presence("started"), isTrainRoute: false })).toBe(true);
    expect(shouldAutoEnterCanonicalActiveWorkout({ routeDecision, retainedTraining: presence("paused"), isTrainRoute: false })).toBe(false);
    expect(shouldAutoEnterCanonicalActiveWorkout({ routeDecision, retainedTraining: presence("started"), isTrainRoute: true })).toBe(false);
  });

  it("keeps the normal tab bar mounted and persists before every tab departure", () => {
    expect(tabs).toContain("minimiseBeforeLeavingTrain");
    expect(tabs).toContain("minimiseCanonicalActiveWorkout");
    expect(tabs).toContain("onBeforeNavigate={minimiseBeforeLeavingTrain}");
    expect(tabs).not.toMatch(/tabBar=.*\? null/);
  });

  it("uses a direct minimise control and a separate explicit action menu", () => {
    expect(canonicalTrainWorkoutActions.map((action) => action.id)).toEqual(["minimise", "finish_early", "discard"]);
    expect(train).toContain('testID="train-minimise"');
    expect(train).toContain('accessibilityLabel="Minimise workout and return to Home"');
    expect(train).toContain('testID="train-actions"');
    expect(train).toContain('accessibilityLabel="Workout actions"');
    expect(train).not.toContain('accessibilityLabel="Close workout"');
  });

  it("does not expose normal completion until every prescribed working set is complete", () => {
    expect(resolveCanonicalTrainCompletionAffordance(0, 22, false)).toEqual({ normalFinishAvailable: false, earlyFinishAvailable: false, completedSets: 0, remainingSets: 22 });
    expect(resolveCanonicalTrainCompletionAffordance(1, 22, true)).toEqual({ normalFinishAvailable: false, earlyFinishAvailable: true, completedSets: 1, remainingSets: 21 });
    expect(resolveCanonicalTrainCompletionAffordance(21, 22, true)).toEqual({ normalFinishAvailable: false, earlyFinishAvailable: true, completedSets: 21, remainingSets: 1 });
    expect(resolveCanonicalTrainCompletionAffordance(22, 22, true)).toEqual({ normalFinishAvailable: true, earlyFinishAvailable: false, completedSets: 22, remainingSets: 0 });
    expect(train).toContain("completion.normalFinishAvailable ? <FinishPanel");
    expect(train).toContain("does not count the remaining sets as performed");
  });

  it("keeps only one exercise and one current set expanded by default", () => {
    expect(train).toContain("function ExerciseNavigator");
    expect(train).toContain("function ExerciseSwitcherModal");
    expect(train).toContain("firstIncomplete ? [firstIncomplete] : exercise.sets.slice(-1)");
    expect(train).toContain("All sets ·");
    expect(train).toContain("Method and coaching details");
    expect(train).not.toContain("function ExerciseRail");
  });

  it("retains grouped-method context in the on-demand exercise switcher", () => {
    expect(train).toContain("exercise.methodExecution.sequenceLabel ?? exercise.method");
    expect(train).toContain("without changing its prescription or method order");
  });

  it("uses accessible non-blocking completion feedback instead of a loose page-bottom message", () => {
    expect(train).toContain('AccessibilityInfo.announceForAccessibility("Set completed")');
    expect(train).toContain('setMessage(result.status === "applied" || result.status === "idempotent" ? null');
    const activeContent = train.slice(train.indexOf("return <TrainShell\n    insets={insets}"), train.indexOf("function TrainShell"));
    expect(activeContent).toContain('testID="train-feedback"');
    expect(activeContent).not.toContain('<Text accessibilityLiveRegion="polite" style={styles.message}>{message}</Text>');
  });
});
