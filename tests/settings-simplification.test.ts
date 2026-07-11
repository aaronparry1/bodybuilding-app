import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { isDesignQaModeAvailable } from "@/application/runtime/app-environment-core";

const settingsSource = () => readFileSync("app/(protected)/settings.tsx", "utf8");
const capacityFocusSource = () => readFileSync("app/(protected)/capacity-focus.tsx", "utf8");
const homeSource = () => readFileSync("app/(protected)/(tabs)/index.tsx", "utf8");

describe("settings simplification", () => {
  it("hides rep strategy and global rep min and max from normal settings", () => {
    const source = settingsSource();

    expect(source).not.toContain("Rep strategy");
    expect(source).not.toContain('label="Rep min"');
    expect(source).not.toContain('label="Rep max"');
  });

  it("does not show unfinished future feature placeholders", () => {
    const source = [settingsSource(), capacityFocusSource(), homeSource()].join("\n");

    expect(source).not.toContain("Custom plan builder placeholder");
    expect(source).not.toContain("Advanced plan editing will plug into this structure");
    expect(source).not.toContain("Coming later");
    expect(source).not.toContain("Advanced Custom");
    expect(source).not.toContain("onPress={() => updateSettings({ repStrategy:");
  });

  it("only promotes Low Back as a live capacity track", () => {
    const settings = settingsSource();
    const capacity = capacityFocusSource();
    const home = homeSource();

    expect(settings).not.toContain("Capacity Focus");
    expect(settings).not.toContain("View capacity tracks");
    expect(settings).not.toContain("Toggle ${capacityLabel(area)} capacity focus");
    expect(capacity).toContain("Low Back Capacity");
    expect(capacity).toContain("Why Low Back Capacity?");
    expect(capacity).toContain("What it builds");
    expect(capacity).toContain("Progression guidance");
    expect(capacity).toContain('label="Start Low Back Capacity Session"');
    expect(capacity).toContain('params: { extraSession: "capacity" }');
    expect(capacity).not.toContain('label="Mark complete"');
    expect(capacity).not.toContain("capacityFocusRepository.save");
    expect(home).toContain("Low Back Capacity");
    expect(home).toContain("Start Capacity Session");
    expect(home).toContain("Learn More");
    expect(home).toContain("openLowBackCapacitySession");
    expect(home).toContain('startExtraSession("capacity")');
    expect(home).toContain("Cardio & Conditioning");
    expect(home).toContain("Optional conditioning outside your main lifting plan.");
    expect(home).toContain('label={recoveryCapacityTarget?.actionLabel ?? "Start Cardio Session"}');
    expect(home).toContain("startCardioSession");
    expect(home).toContain("{recoveryCapacityTarget.completedSessions} / {recoveryCapacityTarget.targetSessions} completed");
    expect(home).not.toContain("Recovery target evidence");
    expect(home).not.toContain('{ value: "capacity", label: "Capacity" }');
    expect(home).not.toContain('{ value: "recovery_cardio", label: "Recovery Cardio" }');
    expect(home).not.toContain('{ value: "capacity_cardio", label: "Capacity Cardio" }');
    expect(home).not.toContain('{ value: "performance_conditioning", label: "Performance Conditioning" }');
    expect(home).toContain('router.push("/(protected)/capacity-focus")');
    expect(home).not.toContain('{ value: "hips", label: "Hips" }');
    expect(home).not.toContain('{ value: "ankles", label: "Ankles" }');
    expect(home).not.toContain('{ value: "shoulders", label: "Shoulders" }');
    expect(home).not.toContain('{ value: "neck", label: "Neck" }');
  });

  it("does not expose raw drop-off or load jump controls in normal settings", () => {
    const source = settingsSource();

    expect(source).not.toContain('label="Drop-off %"');
    expect(source).not.toContain('label="Load jump"');
    expect(source).toContain("Coaching Style");
    expect(source).toContain("Adaptive coaching is on.");
    expect(source).toContain("The app adjusts load, sets, warm-ups, and recovery guidance from your logged performance.");
    expect(source).toContain('<CoachingStyleRow label="Stop point" value="Performance-based" />');
    expect(source).toContain('<CoachingStyleRow label="Progression" value="Rounded to available load jumps" />');
    expect(source).toContain('<CoachingStyleRow label="Recovery" value="Guided by training feedback" />');
    expect(source).not.toContain("Rounded to your equipment");
    expect(source).not.toContain('label="Stop Rule"');
    expect(source).not.toContain("The app tells you when performance has dropped enough to move on.");
    expect(source).not.toContain('value="Adaptive"');
    expect(source).not.toContain("Recommendations round to the loads you can actually use.");
    expect(source).not.toContain("Recovery & Cardio");
    expect(source).toContain("Available weight jumps");
    expect(source).toContain("Load Jumps");
    expect(source).not.toContain("Equipment Jumps");
    expect(source).toContain("values={[1, 2.5, 5]}");
    expect(source).toContain("values={[1, 2, 2.5, 5]}");
    expect(source).toContain("Used to round progressions to the weights you can actually use.");
  });

  it("keeps live Settings customer-facing", () => {
    const source = settingsSource();

    expect(source).toContain("AccountDataSafetyCard");
    expect(source).toContain("buildDataSafetyStatus");
    expect(source).toContain("status.primaryActionLabel");
    expect(source).toContain("status.secondaryActionLabel");
    expect(source).toContain("status.retryActionLabel");
    expect(source).toContain("Account backup is unavailable right now. Your workouts stay saved on this device.");
    expect(source).toContain("ServiceNotice");
    expect(source).toContain("Manage your training plan and restart setup if needed.");
    expect(source).toContain('label="Training Plan"');
    expect(source).toContain('label="Training Split"');
    expect(source).not.toContain('label="Equipment"');
    expect(source).toContain("12-Month Strength & Physique Plan");
    expect(source).toContain("function trainingSplitLabel");
    expect(source).toContain('${activePlan.daysPerWeek}-Day ${splitLabel(activePlan.preferredSplit)}');
    expect(source).toContain('if (value === "full_body") return "Full Body";');
    expect(source).toContain('label="Plan"');
    expect(source).toContain('label="Upgrade"');
    expect(source).toContain('restoreStatus === "restoring" ? "Restoring..." : "Restore Purchases"');
    expect(source).not.toContain("Local account");
    expect(source).not.toContain("Training data is available on this device.");
    expect(source).not.toContain("Training data is saved on this device and will sync when online.");
    expect(source).not.toContain('label="Entitlement"');
    expect(source).not.toContain('label="Plan style"');
    expect(source).not.toContain('label="Active plan"');
    expect(source).not.toContain("Recommended 12 Month");
    expect(source).not.toContain("Recommended 12-month plan");
    expect(source).not.toContain('value="Recommended"');
    expect(source).not.toContain('label="Recommended"');
    expect(source).not.toContain("week.map");
    expect(source).not.toContain("Plan architecture");
    expect(source).not.toContain("We couldn’t connect to subscription services right now.");
  });

  it("gates diagnostics and Design QA behind dev or staging tools", () => {
    const source = settingsSource();

    expect(isDesignQaModeAvailable("production")).toBe(false);
    expect(source).toContain("Dev & Staging Tools");
    expect(source).toContain("Diagnostics and Design QA fixtures are hidden from production builds.");
    expect(source).toContain("showDevTools ? (");
    expect(source).toContain('href="/(protected)/diagnostics"');
    expect(source).toContain('href="/(protected)/design-qa"');
  });
});
