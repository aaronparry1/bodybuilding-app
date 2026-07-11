import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  coachLiveWorkout,
  type LiveWorkoutCoachingInput,
} from "@/domain/training/live-workout-coaching-engine";

function input(overrides: Partial<LiveWorkoutCoachingInput> = {}): LiveWorkoutCoachingInput {
  return {
    generatedWorkoutPlan: {
      workout_id: "workout-1",
      session_name: "Bench Strength",
      planned_exercise_ids: ["bench", "row", "triceps"],
    },
    finalCoachingDecisionPayload: {
      action: "no_change",
      scope: "exercise",
      safety_flags: [],
    },
    warmupPlan: {
      safety_flags: [],
      warmup_complete: true,
    },
    loadingPrescription: {
      prescribed_load: 100,
      prescribed_sets: 4,
      prescribed_reps_or_rep_range: "5 reps",
      backoff_loads: [90, 90],
      minimum_load_increment: 2.5,
    },
    methodPrescription: {
      method_id: "straight_sets",
      effort_cap: "controlled",
      allows_live_load_increase: true,
      has_backoff_work: false,
    },
    recoveryBetweenEffortsGuidance: {
      recovery_objective: "substantial_recovery",
      suggested_rest_range: {
        min_seconds: 120,
        max_seconds: 240,
      },
    },
    densityPlan: {
      session_density_level: "moderate_density",
      time_compression_options: [
        { action: "pair_accessories", target_layers: ["structural_balance", "weakness_development"] },
        { action: "reduce_lower_priority_layers", target_layers: ["recovery_mobility_optional", "structural_balance"] },
      ],
    },
    sessionCompositionLayers: [
      { layer_id: "mission_critical", exercise_ids: ["bench"], required: true },
      { layer_id: "primary_support", exercise_ids: ["row"], required: true },
      { layer_id: "weakness_development", exercise_ids: ["triceps"], required: false },
      { layer_id: "structural_balance", exercise_ids: ["face_pull"], required: false },
    ],
    timeAvailableMinutes: 60,
    actualCompletedSets: [
      {
        exercise_id: "bench",
        set_number: 1,
        reps: 5,
        load: 100,
        completed: true,
        failed: false,
        exceeded_target: false,
        user_difficulty: "normal",
      },
    ],
    failedSets: 0,
    userReportedDifficulty: "normal",
    painIssueFlag: "none",
    skippedSets: 0,
    skippedExercises: [],
    substitutions: [],
    restActuallyTakenSeconds: [180],
    sessionDurationMinutes: 20,
    liveTimeRemainingMinutes: 40,
    activeExerciseId: "bench",
    currentSetNumber: 1,
    ...overrides,
  };
}

describe("live workout coaching engine", () => {
  it("only adapts the active session and exposes evidence for 9J", () => {
    const result = coachLiveWorkout(input());

    expect(result.active_session_adjustment).toBe("no_change");
    expect(result.active_session_only).toBe(true);
    expect(result.permanent_mutation_allowed).toBe(false);
    expect(result.reason_codes).toEqual(expect.arrayContaining([
      "live_engine_active_session_only",
      "permanent_learning_routes_to_9j",
      "no_permanent_programme_mutation",
    ]));
    expect(result.evidence_flags_for_9J[0]!.evidence_flags).toContain("completed_sets_reps_load");
  });

  it("stops the workout for unsafe pain or technical breakdown", () => {
    const result = coachLiveWorkout(input({ painIssueFlag: "unsafe" }));

    expect(result.active_session_adjustment).toBe("stop_workout");
    expect(result.safety_flags).toEqual(expect.arrayContaining(["pain_stop_required", "unsafe_movement_stop_workout"]));
    expect(result.reason_codes).toContain("safety_pain_overrides");
    expect(result.evidence_flags_for_9J[0]).toMatchObject({
      signal: "pain_reported",
      safety_related: true,
    });
  });

  it("stops the affected exercise when pain appears", () => {
    const result = coachLiveWorkout(input({ painIssueFlag: "pain" }));

    expect(result.active_session_adjustment).toBe("stop_exercise");
    expect(result.adjusted_prescription.substitute_exercise).toEqual({
      from_exercise_id: "bench",
      instruction: "defer_to_existing_substitution_flow",
    });
    expect(result.user_facing_coaching_message).toBe("Stop this exercise.");
    expect(result.evidence_flags_for_9J[0]!.evidence_flags).toContain("exercise_stopped");
  });

  it("does not make drastic changes from one poor set", () => {
    const result = coachLiveWorkout(input({
      failedSets: 1,
      userReportedDifficulty: "grind",
      actualCompletedSets: [
        {
          exercise_id: "bench",
          set_number: 1,
          reps: 3,
          load: 100,
          completed: false,
          failed: true,
          user_difficulty: "grind",
        },
      ],
    }));

    expect(result.active_session_adjustment).toBe("extend_rest");
    expect(result.adjusted_prescription.rest_seconds).toBe(240);
    expect(result.reason_codes).toEqual(expect.arrayContaining([
      "single_poor_set_no_drastic_change",
      "rest_extended_for_recovery_between_efforts",
    ]));
  });

  it("reduces load and volume after repeated failed sets", () => {
    const result = coachLiveWorkout(input({
      failedSets: 2,
      currentSetNumber: 2,
    }));

    expect(result.active_session_adjustment).toBe("decrease_next_set_load");
    expect(result.adjusted_prescription.load).toBe(97.5);
    expect(result.adjusted_prescription.sets_remaining_delta).toBe(-1);
    expect(result.reason_codes).toContain("repeated_failed_sets_reduce_or_stop");
    expect(result.evidence_flags_for_9J[0]!.evidence_flags).toEqual(expect.arrayContaining(["failed_sets", "load_modified"]));
  });

  it("stops the exercise after repeated failed sets escalate", () => {
    const result = coachLiveWorkout(input({
      failedSets: 3,
      currentSetNumber: 2,
    }));

    expect(result.active_session_adjustment).toBe("stop_exercise");
    expect(result.adjusted_prescription.sets_remaining_delta).toBe(-2);
    expect(result.safety_flags).toContain("repeated_failure");
  });

  it("allows only conservative live load increases after strong safe performance", () => {
    const result = coachLiveWorkout(input({
      actualCompletedSets: [
        {
          exercise_id: "bench",
          set_number: 1,
          reps: 7,
          load: 100,
          completed: true,
          failed: false,
          exceeded_target: true,
          user_difficulty: "easy",
        },
      ],
      userReportedDifficulty: "easy",
    }));

    expect(result.active_session_adjustment).toBe("increase_next_set_load");
    expect(result.adjusted_prescription.load).toBe(102.5);
    expect(result.reason_codes).toContain("strong_performance_conservative_increase");
  });

  it("blocks live increases for capped AMRAP or no-grind method safety rules", () => {
    const result = coachLiveWorkout(input({
      methodPrescription: {
        method_id: "last_set_amrap",
        effort_cap: "capped_amrap",
        allows_live_load_increase: true,
        has_backoff_work: false,
      },
      actualCompletedSets: [
        {
          exercise_id: "bench",
          set_number: 3,
          reps: 12,
          load: 100,
          completed: true,
          failed: false,
          is_amrap: true,
          exceeded_target: true,
          user_difficulty: "easy",
        },
      ],
      userReportedDifficulty: "easy",
    }));

    expect(result.active_session_adjustment).toBe("no_change");
    expect(result.adjusted_prescription.load).toBe(100);
  });

  it("respects AMRAP effort caps by stopping the exercise when cap is reached", () => {
    const result = coachLiveWorkout(input({
      methodPrescription: {
        method_id: "last_set_amrap",
        effort_cap: "capped_amrap",
        allows_live_load_increase: false,
        has_backoff_work: false,
      },
      actualCompletedSets: [
        {
          exercise_id: "bench",
          set_number: 3,
          reps: 12,
          load: 100,
          completed: true,
          failed: false,
          is_amrap: true,
          hit_cap: true,
        },
      ],
      currentSetNumber: 3,
    }));

    expect(result.active_session_adjustment).toBe("stop_exercise");
    expect(result.safety_flags).toContain("amrap_cap_reached");
    expect(result.reason_codes).toContain("amrap_effort_cap_respected");
  });

  it("compresses lower-priority layers when time runs short away from mission-critical work", () => {
    const result = coachLiveWorkout(input({
      activeExerciseId: "triceps",
      liveTimeRemainingMinutes: 6,
    }));

    expect(result.active_session_adjustment).toBe("compress_lower_priority_layers");
    expect(result.adjusted_prescription.compressed_layers).toEqual(expect.arrayContaining([
      "structural_balance",
      "weakness_development",
      "recovery_mobility_optional",
    ]));
    expect(result.adjusted_prescription.compressed_layers).not.toContain("mission_critical");
    expect(result.reason_codes).toEqual(expect.arrayContaining([
      "density_and_resource_rules_used_for_time",
      "lower_priority_layers_compressed_first",
    ]));
  });

  it("removes backoff work before compromising mission-critical work under time pressure", () => {
    const result = coachLiveWorkout(input({
      methodPrescription: {
        method_id: "top_set_backoffs",
        effort_cap: "no_grind",
        allows_live_load_increase: false,
        has_backoff_work: true,
      },
      liveTimeRemainingMinutes: 10,
      activeExerciseId: "bench",
    }));

    expect(result.active_session_adjustment).toBe("remove_backoff_sets");
    expect(result.adjusted_prescription.remove_backoff_sets).toBe(true);
    expect(result.reason_codes).toContain("backoffs_reduced_before_mission_critical");
  });

  it("does not contain permanent mutation, storage, network, or athlete-model update logic", () => {
    const source = readFileSync("src/domain/training/live-workout-coaching-engine.ts", "utf8");
    expect(source).not.toMatch(/\b(mutateProgramme|replaceProgramme|transitionProgramme|writeWorkout|startWorkout|saveWorkout)\s*\(/i);
    expect(source).not.toMatch(/\b(applyValidatedEvidenceToLearnedCharacteristic|addValidatedCoachingMemory|processCoachingEvidence)\s*\(/);
    expect(source).not.toMatch(/AsyncStorage|localStorage|supabase|\brepository\b|\bpersist\s*\(|\bsave\s*\(/i);
    expect(source).not.toMatch(/\bfetch\s*\(|\bawait\b|Promise</);
  });
});
