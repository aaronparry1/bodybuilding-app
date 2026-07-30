import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const tabs = readFileSync("app/(protected)/(tabs)/_layout.tsx", "utf8");
const home = readFileSync("app/(protected)/(tabs)/index.tsx", "utf8");
const homeUi = readFileSync("src/ui/home-dashboard.tsx", "utf8");
const protectedLayout = readFileSync("app/(protected)/_layout.tsx", "utf8");

describe("global application shell and Home boundary", () => {
  it("uses one compact accessible five-tab shell with settings access", () => {
    for (const label of ["Home", "Train", "Plan", "Progress", "Library"]) expect(tabs).toContain(`title: "${label}"`);
    expect(tabs).toContain("AppShellHeader");
    expect(tabs).toContain('accessibilityRole="tab"');
    expect(tabs).toContain("AppShellIcon");
    expect(tabs).not.toContain(">Settings</Text>");
    expect(readFileSync("src/ui/app-shell.tsx", "utf8")).toContain('accessibilityLabel="Open settings"');
  });

  it("hides tabs only while the focused canonical workout is active", () => {
    expect(tabs).toContain('const trainFocused = segments.includes("train")');
    expect(tabs).toContain("trainFocused && Boolean(planState.model?.activeRecordedSession)");
    expect(tabs).toContain("focusedWorkoutActive ? null : <CompactTabBar");
    expect(tabs).not.toContain("workoutRoute ? null");
  });

  it("keeps Home projection-only and lifecycle-mutation free", () => {
    expect(home).toContain("readCanonicalHomeProjection");
    expect(home).toContain("projectCanonicalHome");
    expect(home).toContain("HomeDashboard");
    expect(home).not.toMatch(/startCanonicalSession|pauseCanonicalSession|resumeCanonicalSession|completeCanonicalSession|discardCanonicalSessionAttempt|recordCanonicalPerformedWork/);
    for (const owner of ["HomeGreeting", "HomeNextAction", "HomeProgrammePosition", "HomeZeroHistory", "HomeProgressSnapshot", "HomeAttention", "HomeRecentWork"]) expect(homeUi).toContain(`function ${owner}`);
    expect(home).not.toMatch(/design-qa|isDesignQaModeAvailable|isDesignQaModeRequested/);
    expect(protectedLayout).toContain("isDesignQaModeAvailable(getAppEnvironment()) && isDesignQaModeRequested()");
    expect(readFileSync("app-production/(protected)/_layout.tsx", "utf8")).toContain("production-protected-layout");
    expect(homeUi).not.toContain("projection.greeting.eyebrow");
  });

  it("keeps protected navigation behind reconciled programme or genuine onboarding state", () => {
    expect(protectedLayout).toContain("resolveCanonicalExistingUserRoute");
    expect(protectedLayout).toContain("inspectCanonicalRetainedTrainingPresence");
    expect(protectedLayout).toContain('<Redirect href="/(protected)/onboarding"');
    expect(protectedLayout).toContain('routeDecision.status === "authenticated" && isOnboardingRoute');
    expect(protectedLayout).toContain('routeDecision.destination === "active_workout"');
    expect(protectedLayout).toContain('<Redirect href="/(protected)/(tabs)"');
    expect(protectedLayout).toContain("canonicalActivePlanState.hydrate");
  });

  it("excludes legacy plan and workout authority from the rebuilt shell", () => {
    for (const source of [tabs, home, homeUi]) expect(source).not.toMatch(/ActiveTrainingPlan|activeTrainingPlanRepository|TrainingBlock|TrainingYear|currentBlock|activeBlockId|progressionState|workoutSessionRepository/);
  });
});
