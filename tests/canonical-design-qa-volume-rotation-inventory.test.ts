import { describe, expect, it } from "vitest";
import { designQaFixtures } from "@/application/design-qa/design-qa-fixtures";

const volume = ["progress_volume_large_low", "progress_volume_ladder_apply", "progress_volume_large_high_fatigue", "progress_volume_small_progressing"] as const;
const rotation = ["progress_rotation_stalled_tier_a", "progress_rotation_action", "progress_rotation_progressing_tier_a", "progress_rotation_tier_c"] as const;
const load = ["train_load_regression_reduce", "train_load_escalation", "train_load_escalation_modal", "train_load_average_next", "train_productive_below_min", "train_productive_target_zone", "train_productive_soft_cap", "train_productive_over_soft_cap"] as const;

describe("Design-QA volume/rotation inventory", () => {
  it("contains exactly the independent eight IDs", () => {
    const ids = new Set(designQaFixtures.map((fixture) => fixture.id));
    for (const id of [...volume, ...rotation]) expect(ids.has(id)).toBe(true);
    expect(new Set([...volume, ...rotation]).size).toBe(8);
    expect([...volume, ...rotation].some((id) => (load as readonly string[]).includes(id))).toBe(false);
  });
});
