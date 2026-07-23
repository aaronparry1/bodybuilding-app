import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const report = JSON.parse(
  readFileSync("qa-reports/release-candidate/canonical-release-candidate-certification.json", "utf8"),
) as Record<string, any>;
const payloadScan = JSON.parse(
  readFileSync("qa-reports/release-candidate/production-payload-scan.json", "utf8"),
) as Record<string, any>;
const nativeJourney = JSON.parse(
  readFileSync("qa-reports/release-candidate/native-journey-certification.json", "utf8"),
) as Record<string, any>;
const performanceSmoke = JSON.parse(
  readFileSync("qa-reports/release-candidate/native-performance-smoke.json", "utf8"),
) as Record<string, any>;

describe("canonical release-candidate certification", () => {
  it("opens TestFlight upload only after every native, payload, duration, and suite gate passes", () => {
    expect(report.automatedGates.fullSuite).toMatchObject({
      status: "passed",
      files: 356,
      tests: 2114,
      failedFiles: 0,
      failedTests: 0,
    });
    expect(report.nativeBuild).toMatchObject({
      configuration: "Release",
      compileStatus: "passed",
      storeValidationStatus: "passed",
      archiveStatus: "passed",
      appStoreArchiveCreated: true,
    });
    expect(report.preUploadBlockers).toEqual([]);
    expect(report.productionPayloadIsolation).toMatchObject({
      productionRouterRoot: "app-production",
      archivedPayloadFindings: 0,
      webPayloadFindings: 0,
      exDevLauncherBundlePresent: false,
      exDevMenuBundlePresent: false,
      expoDevClientMarkerPresent: false,
    });
    expect(report.decision).toMatchObject({
      allPreUploadGatesPassed: true,
      releaseCandidateCertified: true,
      versionIncremented: true,
      testFlightBuildCreated: true,
      uploadAttempted: true,
      uploadSucceeded: true,
      releaseCandidateUploadAuthorized: true,
      publicReleaseAuthorized: false,
      appReviewSubmissionAuthorized: false,
    });
    expect(report.testFlightUpload).toMatchObject({
      easBuildId: "0810f076-c114-4737-92cc-379675043889",
      easBuildStatus: "finished",
      easSubmissionId: "7d39f089-0fd6-4973-91c4-30143e0aa8cc",
      appStoreConnectAppId: "6762462649",
      appStoreConnectStatus: "uploaded_processing",
      internalTestingStatus: "pending_apple_processing",
      appReviewSubmitted: false,
      publicReleasePerformed: false,
    });
    expect(payloadScan.web).toMatchObject({ status: "passed", scannedFiles: 27, findings: [] });
    expect(payloadScan.nativeArchive).toMatchObject({ status: "passed", scannedFiles: 104, findings: [] });
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
    expect(report.nativeVisualEvidence).toMatchObject({
      modernScreenshots: 15,
      narrowScreenshots: 15,
      recoveryScreenshots: 3,
      screensNotInteractivelyCertified: [],
    });
    expect(report.durationCoverage).toMatchObject({
      "30": "fail_closed_with_actionable_customer_guidance",
      "45": "fail_closed_with_actionable_customer_guidance",
      "60": "viable_with_authorised_rotation_redistribution",
      "75": "viable_full_prescription",
      "90": "viable_full_prescription",
    });
    expect(nativeJourney).toMatchObject({
      modern: { status: "passed", screenshots: 15 },
      narrowAccessibility: { status: "passed", screenshots: 15 },
      automation: { manualClicks: 0, productionFixtureBackdoor: false, productionPayloadContainsTestBundle: false },
    });
    expect(nativeJourney.persistenceRecovery.every((entry: { status: string }) => entry.status === "passed")).toBe(true);
    expect(performanceSmoke.obviousRegressionGate).toMatchObject({
      visibleStallsCausingAutomationTimeout: false,
      status: "passed",
    });
    expect(performanceSmoke.evidence).toMatchObject({ nativeExceptions: 0, uncaughtApplicationErrors: 0 });
    expect(performanceSmoke.limitations.length).toBeGreaterThan(0);
  });
});
