import { describe, expect, it } from "vitest";
import { designQaFixtures } from "@/application/design-qa/design-qa-fixtures";

const remaining = ["progress_low", "progress_healthy", "progress_strength_dashboard", "progress_fatigue", "progress_slowing", "progress_recent_clean", "phase1_load_one_bad_session", "phase1_low_history_no_deload", "phase1_deload_mild", "phase1_deload_clear", "phase1_deload_severe", "home_recovery_capacity", "phase1_goal_strength", "phase1_goal_muscle", "phase1_goal_muscle_strength", "phase1_goal_athletic", "phase1_goal_event", "phase1_goal_general", "progress_deload_action"] as const;
const migrated = ["train_load_regression_reduce", "train_load_escalation", "train_load_escalation_modal", "train_load_average_next", "train_productive_below_min", "train_productive_target_zone", "train_productive_soft_cap", "train_productive_over_soft_cap", "progress_volume_large_low", "progress_volume_ladder_apply", "progress_volume_large_high_fatigue", "progress_volume_small_progressing", "progress_rotation_stalled_tier_a", "progress_rotation_action", "progress_rotation_progressing_tier_a", "progress_rotation_tier_c"] as const;

describe("Design-QA Progress remainder inventory", () => {
  it("accounts for all 35 Progress IDs exactly once", () => {
    const ids = new Set(designQaFixtures.map((fixture) => fixture.id));
    expect(remaining.every((id) => ids.has(id))).toBe(true);
    expect(new Set([...remaining, ...migrated]).size).toBe(35);
    expect(new Set(remaining).size).toBe(19);
  });
});
