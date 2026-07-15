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
    expect(home).toContain("canonicalActivePlanState");
    expect(home).toContain("projectCanonicalHome");
    expect(home).toContain("View Progress");
    expect(home).not.toContain("Recovery target evidence");
    expect(home).not.toContain('{ value: "capacity", label: "Capacity" }');
    expect(home).not.toContain('{ value: "recovery_cardio", label: "Recovery Cardio" }');
    expect(home).not.toContain('{ value: "capacity_cardio", label: "Capacity Cardio" }');
    expect(home).not.toContain('{ value: "performance_conditioning", label: "Performance Conditioning" }');
    expect(home).toContain('router.push("/(protected)/(tabs)/analytics")');
    expect(home).not.toContain('{ value: "hips", label: "Hips" }');
    expect(home).not.toContain('{ value: "ankles", label: "Ankles" }');
    expect(home).not.toContain('{ value: "shoulders", label: "Shoulders" }');
    expect(home).not.toContain('{ value: "neck", label: "Neck" }');
  });

  it("does not expose raw drop-off or load jump controls in normal settings", () => {
    const source = settingsSource();

    expect(source).not.toContain('label="Drop-off %"');
    expect(source).not.toContain('label="Load jump"');
    expect(source).toContain("canonicalActivePlanState");
    expect(source).toContain("Changes to training facts are reviewed by canonical planning owners");
  });

  it("keeps live Settings customer-facing", () => {
    const source = settingsSource();

    expect(source).toContain("buildDataSafetyStatus");
    expect(source).toContain("buildDataSafetyStatus");
    expect(source).toContain('SectionHeader title="Canonical training plan"');
    expect(source).toContain("plan.macrocycle.goal");
    expect(source).toContain("plan.mesocycle.purpose");
    expect(source).not.toContain("activeTrainingPlanRepository");
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
    expect(source).toContain("showDevTools");
    expect(source).toContain('href="/(protected)/diagnostics"');
    expect(source).toContain('href="/(protected)/design-qa"');
  });
});
