import { describe, expect, it, beforeEach } from "vitest";
import { applyDesignQaFixture, clearDesignQaFixtures } from "@/application/design-qa/design-qa-fixtures";
import { readCanonicalTrainProjection } from "@/application/design-qa/canonical-train-projection";
import { jsonStore } from "@/data/local/json-store";

const canonicalSessionFixtures = ["train_overview_fresh", "train_first_set", "train_work_sets", "train_warmups", "train_near_threshold", "train_shutdown", "train_swapped", "train_added_exercise", "train_load_no_history", "train_load_strength_unknown", "train_load_exact_progressed", "train_load_exact_held", "train_load_same_family_estimate", "train_load_same_family_low_confidence", "train_load_lb_known", "train_load_bodyweight", "train_end_workout_confirm", "train_increment_barbell_1", "train_increment_barbell_2_5", "train_increment_barbell_5", "train_increment_machine_1", "train_increment_cable_1", "train_increment_exercise_override", "train_prep_not_started", "train_prep_completed", "train_prep_skipped", "train_prep_active_workout", "train_review_prs", "train_rotation_accepted"] as const;

describe("canonical Design-QA session family", () => {
  beforeEach(() => { jsonStore.clearByPrefix("iron-logic."); jsonStore.resetCache(); });
  it("projects every session fixture through canonical v3/ledger state", () => {
    for (const fixtureId of canonicalSessionFixtures) {
      applyDesignQaFixture(fixtureId, "development");
      const projection = readCanonicalTrainProjection();
      expect(projection?.fixtureId).toBe(fixtureId);
      expect(projection?.snapshotVersion).toBe("canonical_session_snapshot_v3");
    }
    expect(canonicalSessionFixtures).toHaveLength(29);
  });
  it("does not leave a session fixture in the legacy family bridge", () => {
    expect(canonicalSessionFixtures.every((id) => id.startsWith("train_"))).toBe(true);
    clearDesignQaFixtures("development");
  });
});
