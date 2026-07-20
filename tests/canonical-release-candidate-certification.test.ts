import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const report = JSON.parse(
  readFileSync("qa-reports/release-candidate/canonical-release-candidate-certification.json", "utf8"),
) as Record<string, any>;

describe("canonical release-candidate certification", () => {
  it("keeps upload closed whenever a required native or payload gate is unresolved", () => {
    expect(report.automatedGates.fullSuite).toMatchObject({
      status: "passed",
      files: 355,
      tests: 2110,
      failedFiles: 0,
      failedTests: 0,
    });
    expect(report.nativeBuild).toMatchObject({
      configuration: "Release",
      compileStatus: "passed",
      installStatus: "passed",
      launchStatus: "passed",
      appStoreArchiveCreated: false,
    });
    expect(report.preUploadBlockers.map((item: { id: string }) => item.id)).toEqual([
      "native_interaction_unavailable",
      "qa_fixture_payload_embedded",
    ]);
    expect(report.decision).toMatchObject({
      allPreUploadGatesPassed: false,
      releaseCandidateCertified: false,
      versionIncremented: false,
      testFlightBuildCreated: false,
      uploadAttempted: false,
      releaseCandidateUploadAuthorized: false,
      publicReleaseAuthorized: false,
    });
  });

  it("preserves the certified canonical production boundary", () => {
    expect(report.productionFlags).toEqual({
      canonicalCoachingEngineV3: true,
      canonicalActiveWorkout: true,
      canonicalQualityGateStrict: true,
      shadowMode: false,
      ordinaryV2Authority: false,
      designQaMode: false,
    });
    expect(report.nativeVisualEvidence.screensActuallyObserved).toEqual([
      "onboarding_goal_selection",
    ]);
    expect(report.nativeVisualEvidence.screensNotInteractivelyCertified.length).toBeGreaterThan(0);
  });
});
