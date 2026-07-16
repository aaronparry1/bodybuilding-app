import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { buildCanonicalProductionSwitchEvidence } from "@/../qa-reports/legacy-migration-change-control/canonical-production-switch-evidence";

const root = resolve(process.cwd());

describe("canonical production switch completion audit", () => {
  it("publishes a typed, fail-closed result with the first live blocker", () => {
    const result = buildCanonicalProductionSwitchEvidence("6041ed8");
    expect(result.schemaVersion).toBe("canonical_production_switch_evidence_v1");
    expect(result.pipelineReadyForSwitch).toBe(true);
    expect(result.productionSwitchCompleted).toBe(false);
    expect(result.firstFalsePredicate).toBe("no_legacy_workout_constructor");
    expect(result.predicates).toHaveLength(24);
  });

  it("keeps the retained compatibility allowlist explicit", () => {
    const allowlist = JSON.parse(readFileSync(resolve(root, "qa-reports/legacy-migration-change-control/canonical-retained-compatibility-allowlist.json"), "utf8"));
    expect(allowlist.entries.every((entry: { classification: string }) => ["archive_only", "migration_only", "rejection_only", "transport_only"].includes(entry.classification))).toBe(true);
  });

  it("proves the first blocker is a real Train/history caller, not Design-QA", () => {
    const source = readFileSync(resolve(root, "app/(protected)/history/exercise/[id].tsx"), "utf8");
    expect(source).toContain("workoutSessionRepository");
    const fixtureSource = readFileSync(resolve(root, "src/application/design-qa/design-qa-fixtures.ts"), "utf8");
    expect(fixtureSource).toContain("canonicalActivePlanState");
    expect(fixtureSource).not.toContain("applyDesignQaFixtureMatrix");
  });

  it("records the mounted Train route as canonical while retaining the old hook outside its graph", () => {
    const train = readFileSync(resolve(root, "app/(protected)/(tabs)/train.tsx"), "utf8");
    expect(train).not.toContain("useWorkoutLogger");
    expect(train).toContain("startCanonicalSession");
    expect(train).toContain("recordCanonicalPerformedWork");
    const result = buildCanonicalProductionSwitchEvidence("6041ed8");
    expect(result.predicates.find((predicate) => predicate.id === "no_production_active_training_plan_authority")?.passed).toBe(true);
  });

  it("does not hardcode completion in the final artifact", () => {
    const artifact = JSON.parse(readFileSync(resolve(root, "qa-reports/legacy-migration-change-control/canonical-production-switch-final-result.json"), "utf8"));
    expect(artifact.productionSwitchCompleted).toBe(false);
    expect(artifact.firstFalsePredicate).toBe("no_legacy_workout_constructor");
  });
});
