import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  forbiddenProductionPayloadMarkers,
  scanPackagedReleaseApplication,
  scanProductionPayload,
} from "../scripts/scan-production-payload.mjs";

const temporaryDirectories: string[] = [];

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

describe("production payload isolation", () => {
  it("fails closed when fixture, preview, or development-client payload is present", () => {
    for (const marker of forbiddenProductionPayloadMarkers) {
      const directory = mkdtempSync(join(tmpdir(), "asc-payload-scan-"));
      temporaryDirectories.push(directory);
      writeFileSync(join(directory, "main.jsbundle"), `safe-prefix:${marker}:safe-suffix`);

      expect(scanProductionPayload(directory)).toMatchObject({
        status: "failed",
        findings: [{ marker: marker.toLowerCase() }],
      });
    }
  });

  it("accepts a payload containing only canonical production identifiers", () => {
    const directory = mkdtempSync(join(tmpdir(), "asc-payload-scan-"));
    temporaryDirectories.push(directory);
    writeFileSync(
      join(directory, "main.jsbundle"),
      "canonical_session_snapshot_v3 canonical_progress_intervention_v1",
    );

    expect(scanProductionPayload(directory)).toMatchObject({
      status: "passed",
      findings: [],
      scannedFiles: 1,
    });
  });

  it("requires the command-facing scan to target a packaged Release application", () => {
    const directory = mkdtempSync(join(tmpdir(), "asc-payload-scan-"));
    temporaryDirectories.push(directory);
    writeFileSync(join(directory, "main.jsbundle"), "canonical_session_snapshot_v3");

    expect(() => scanPackagedReleaseApplication(directory)).toThrow(
      `production_release_app_required:${directory}`,
    );

    const app = join(directory, "AdaptiveStrengthCoach.app");
    mkdirSync(app);
    writeFileSync(join(app, "main.jsbundle"), "canonical_session_snapshot_v3");
    expect(scanPackagedReleaseApplication(app)).toMatchObject({
      root: app,
      status: "passed",
      findings: [],
    });
  });
});
