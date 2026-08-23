import { describe, expect, it } from "vitest";
import { buildCanonicalGeneratorPersonaCertification, canonicalGeneratorPersonas } from "@/domain/training/canonical-generator-persona-certification";

describe("canonical generator adversarial persona certification", () => {
  it("covers the declared input boundaries and is deterministic", () => {
    const first = buildCanonicalGeneratorPersonaCertification();
    const second = buildCanonicalGeneratorPersonaCertification();
    expect(first).toEqual(second);
    expect(first.coverage).toMatchObject({ personas: 30, goals: 5, equipmentProfiles: 4, historyScenarios: 5 });
    expect(new Set(canonicalGeneratorPersonas().map((persona) => persona.daysPerWeek))).toEqual(new Set([2, 3, 4, 5, 6]));
    expect(new Set(canonicalGeneratorPersonas().map((persona) => persona.durationMinutes))).toEqual(new Set([30, 45, 60, 90]));
  });

  it("either constructs within hard runtime invariants or fails closed with a reason", () => {
    const report = buildCanonicalGeneratorPersonaCertification();
    expect(report.summary.criticalViolations).toBe(0);
    expect(report.rows.every((row) => row.status === "constructed" ? row.metrics !== null && row.violations.length === 0 : Boolean(row.reason))).toBe(true);
    expect(report.rows.some((row) => row.status === "constructed")).toBe(true);
    expect(report.rows.find((row) => row.input.declaredExperience === "novice")?.input.resolvedExperience).toBe("beginner");
  });
});
