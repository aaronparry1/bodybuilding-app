import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("recovery and cardio onboarding copy", () => {
  it("renders supportive conditioning copy without changing stored values", () => {
    const source = readFileSync("app/(protected)/onboarding.tsx", "utf8");

    expect(source).toContain('value: "recommended", label: "Recommended", detail: "ASC adds recovery and capacity work where it supports your lifting."');
    expect(source).toContain('value: "minimal", label: "Minimal", detail: "Only add recovery/capacity work when there is a clear reason."');
    expect(source).toContain('value: "off", label: "No Added Cardio", detail: "No planned cardio. Recovery and fatigue coaching still stays active."');
    expect(source).toContain("Recovery & Cardio");
  });

  it("keeps existing preference ids compatible with saved users", () => {
    const source = readFileSync("app/(protected)/onboarding.tsx", "utf8");

    expect(source).toContain('value: "recommended"');
    expect(source).toContain('value: "minimal"');
    expect(source).toContain('value: "off"');
    expect(source).not.toContain('value: "no_added_cardio"');
  });

  it("does not change cardio or recovery logic", () => {
    const source = readFileSync("app/(protected)/onboarding.tsx", "utf8");

    expect(source).toContain("setRecoveryCardioPreference");
    expect(source).not.toContain("resolveCardioDose");
    expect(source).not.toContain("buildRecoveryCapacityRecommendation");
  });
});
