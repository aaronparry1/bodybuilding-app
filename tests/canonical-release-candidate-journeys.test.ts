import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

describe("canonical release candidate journey evidence", () => {
  it("accounts for the five requested journeys without overstating unsupported mutation", () => {
    const artifact = JSON.parse(readFileSync("qa-reports/release-candidate/canonical-release-journeys.json", "utf8")) as {
      schemaVersion: string;
      journeys: Array<{ id: string; status: string; testFiles: string[]; assertions: string[] }>;
    };
    expect(artifact.schemaVersion).toBe("canonical_release_candidate_journeys_v1");
    expect(artifact.journeys.map((journey) => journey.id)).toEqual([
      "A_fresh_install_training_lifecycle",
      "B_existing_user_reconciliation",
      "C_session_duration_change",
      "D_recovery_and_adaptation",
      "E_failure_and_retry",
    ]);
    expect(new Set(artifact.journeys.map((journey) => journey.id)).size).toBe(5);
    expect(artifact.journeys.every((journey) => journey.testFiles.length > 0 && journey.assertions.length > 0)).toBe(true);
    expect(artifact.journeys.find((journey) => journey.id === "C_session_duration_change")).toMatchObject({ status: "safety_deviation_from_requested_application" });
    expect(artifact.journeys.find((journey) => journey.id === "D_recovery_and_adaptation")?.assertions).toContain("automatic numeric load adjustment remains manual-review-required because no approved numeric policy authority exists");
  });
});
