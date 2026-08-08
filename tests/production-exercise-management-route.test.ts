import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("production exercise-management route", () => {
  it("exposes real Plan and Train entry points and plain-language scope controls", () => {
    const plan = readFileSync(resolve("app/(protected)/(tabs)/programmes.tsx"), "utf8");
    const train = readFileSync(resolve("app/(protected)/(tabs)/train.tsx"), "utf8");
    const productionRoute = readFileSync(resolve("app-production/(protected)/programmes/manage.tsx"), "utf8");
    const screen = readFileSync(resolve("src/application/shell/production-programme-management-screen.tsx"), "utf8");
    expect(plan).toContain("Manage programme exercises");
    expect(train).toContain("Swap or add exercise");
    expect(productionRoute).toContain("production-programme-management-screen");
    expect(screen).toContain("This workout only");
    expect(screen).toContain("Future planned workouts");
    expect(screen).toContain("Cancel without saving");
    expect(screen).toContain("Completed workouts and recorded performance are never changed");
    expect(screen).toContain("Return to active workout");
    expect(screen).toContain('pathname: "/(protected)/(tabs)/train"');
    expect(screen).toContain("exerciseEditMessage: resultMessage");
    expect(train).toContain("params.exerciseEditMessage");
    expect(screen).toContain('testID="exercise-change-review"');
    expect(screen).toContain('label={saving ? "Saving…" : "Save change"}');
    expect(screen).not.toContain("Alert.alert");
  });
});
