import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, expect, it } from "vitest";

type Evidence = Readonly<{
  renderEnvironment: Readonly<{
    native: boolean;
    primaryViewport: Readonly<{ width: number; height: number }>;
    narrowViewport: Readonly<{ width: number; height: number; documentScrollWidth: number; horizontalOverflow: boolean }>;
    consoleErrors: number;
    consoleWarnings: number;
  }>;
  captures: readonly Readonly<{ state: string; file: string; sha256: string }>[];
  programmePreconditions: Readonly<{ purposefulRepeatRemainsAvailable: boolean; unservedRequiredVerticalPressSlot: boolean }>;
  externalBuildOrUploadPerformed: boolean;
}>;

const evidencePath = "qa-reports/train-active-experience/canonical-train-active-experience.json";
const evidence = JSON.parse(readFileSync(evidencePath, "utf8")) as Evidence;

describe("canonical Train rendered evidence", () => {
  it("accounts for every required state with deterministic non-native renders", () => {
    expect(evidence.renderEnvironment).toMatchObject({
      native: false,
      primaryViewport: { width: 390, height: 844 },
      narrowViewport: { width: 320, height: 568, documentScrollWidth: 320, horizontalOverflow: false },
      consoleErrors: 0,
      consoleWarnings: 0,
    });
    expect(evidence.captures.map((capture) => capture.state)).toEqual([
      "workout_preview",
      "first_exposure_calibration",
      "active_prescribed_workout_and_finish_disabled",
      "rest_timer_with_current_completed_upcoming_sets",
      "completed_set_editing",
      "close_pause_discard_menu",
      "workout_complete",
      "narrowest_phone_preview",
    ]);
    for (const capture of evidence.captures) {
      const bytes = readFileSync(join(dirname(evidencePath), capture.file));
      expect(createHash("sha256").update(bytes).digest("hex"), capture.state).toBe(capture.sha256);
    }
  });

  it("keeps the certified programme and release boundaries explicit", () => {
    expect(evidence.programmePreconditions).toMatchObject({
      purposefulRepeatRemainsAvailable: true,
      unservedRequiredVerticalPressSlot: false,
    });
    expect(evidence.externalBuildOrUploadPerformed).toBe(false);
  });
});
