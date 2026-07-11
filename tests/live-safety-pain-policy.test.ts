import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  evaluateLiveSafetyPain,
  liveSafetyPainPolicyArchitectureNotes,
} from "../src/domain/training/live-safety-pain-policy";

describe("Live Safety & Pain Policy", () => {
  it("vetoes progression when pain risk is present", () => {
    const output = evaluateLiveSafetyPain({
      pain_category: "joint_pain",
      severity: "moderate",
      affected_movement_pattern: "horizontal_press",
      planned_live_action: "increase_next_set_load",
    });

    expect(output.pain_category).toBe("joint_pain");
    expect(output.blocked_live_actions).toContain("increase_next_set_load");
    expect(output.reason_codes).toContain("pain_vetoes_progression");
    expect(output.reason_codes).toContain("safety_overrides_progression_density_method_objective");
    expect(output.affected_movement_pattern).toBe("horizontal_press");
  });

  it("stops the exercise for sharp pain", () => {
    const output = evaluateLiveSafetyPain({
      pain_category: "sharp_pain",
      severity: "high",
      affected_movement_pattern: "squat",
    });

    expect(output.safety_decision).toBe("stop_exercise");
    expect(output.recommended_constraint_solution.preferred_action).toBe("terminate_exercise");
    expect(output.reason_codes).toContain("sharp_radiating_worsening_pain_stops_exercise");
    expect(output.evidence_for_9J[0].signal).toBe("pain_reported");
  });

  it("stops the exercise for radiating or worsening pain", () => {
    const radiating = evaluateLiveSafetyPain({
      pain_category: "radiating_pain",
    });
    const worsening = evaluateLiveSafetyPain({
      pain_category: "worsening_pain",
    });

    expect(radiating.safety_decision).toBe("stop_exercise");
    expect(worsening.safety_decision).toBe("stop_exercise");
  });

  it("stops the workout for medical red flags", () => {
    const output = evaluateLiveSafetyPain({
      pain_category: "dizziness_or_medical_concern",
      medical_red_flag: true,
    });

    expect(output.severity).toBe("critical");
    expect(output.safety_decision).toBe("stop_workout");
    expect(output.recommended_constraint_solution.constraint_signal).toBe("medical_concern");
    expect(output.recommended_constraint_solution.preferred_action).toBe("terminate_workout");
    expect(output.reason_codes).toContain("medical_red_flag_stops_workout");
  });

  it("allows expected local muscular discomfort to continue with monitoring", () => {
    const output = evaluateLiveSafetyPain({
      pain_category: "local_muscle_burn",
      severity: "low",
    });

    expect(output.safety_decision).toBe("monitor");
    expect(output.allowed_live_actions).toContain("continue");
    expect(output.allowed_live_actions).toContain("monitor");
    expect(output.reason_codes).toContain("muscle_discomfort_can_monitor");
  });

  it("uses conservative modification for warm-up pain before working sets", () => {
    const output = evaluateLiveSafetyPain({
      pain_category: "joint_pain",
      severity: "low",
      during_warmup: true,
    });

    expect(output.safety_decision).toBe("reduce_load");
    expect(output.recommended_constraint_solution.preferred_action).toBe("modify_load");
    expect(output.reason_codes).toContain("warmup_pain_conservative_modification");
  });

  it("allows low-severity range-specific pain to reduce ROM only", () => {
    const output = evaluateLiveSafetyPain({
      pain_category: "joint_pain",
      severity: "low",
      pain_only_at_specific_range_of_motion: true,
    });

    expect(output.safety_decision).toBe("reduce_range_of_motion");
    expect(output.recommended_constraint_solution.preferred_action).toBe("modify_rom");
    expect(output.reason_codes).toContain("rom_specific_low_severity_can_reduce_rom");
  });

  it("stops or substitutes when pain persists after modification", () => {
    const output = evaluateLiveSafetyPain({
      pain_category: "joint_pain",
      severity: "moderate",
      persists_after_load_rom_or_grip_modification: true,
    });

    expect(output.safety_decision).toBe("stop_exercise");
    expect(output.allowed_live_actions).toContain("substitute_lower_stress_variation");
    expect(output.reason_codes).toContain("persistent_pain_requires_stop_or_substitute");
  });

  it("blocks high-risk methods when pain risk is present", () => {
    const output = evaluateLiveSafetyPain({
      pain_category: "joint_pain",
      severity: "moderate",
      high_risk_method_planned: true,
    });

    expect(output.safety_decision).toBe("substitute_lower_stress_variation");
    expect(output.blocked_live_actions).toContain("no_change");
    expect(output.blocked_live_actions).toContain("increase_next_set_load");
    expect(output.reason_codes).toContain("high_risk_method_blocked_or_downgraded");
  });

  it("passes immediate safety evidence to 9J without assuming permanent injury", () => {
    const output = evaluateLiveSafetyPain({
      pain_category: "joint_pain",
      severity: "moderate",
    });

    expect(output.evidence_for_9J[0].safety_related).toBe(true);
    expect(output.evidence_for_9J[0].update_safety_history).toBe(true);
    expect(output.reason_codes).toContain("pain_evidence_routes_to_9j");
    expect(output.reason_codes).toContain("not_permanent_injury_assumption");
  });

  it("does not generate medical diagnosis language", () => {
    const outputs = [
      evaluateLiveSafetyPain({ pain_category: "sharp_pain" }),
      evaluateLiveSafetyPain({ pain_category: "dizziness_or_medical_concern" }),
      evaluateLiveSafetyPain({ pain_category: "joint_pain", severity: "low" }),
    ];

    for (const output of outputs) {
      expect(output.user_facing_message).not.toMatch(/diagnos|fracture|tear|torn|sprain|strain|herniat|tendinitis|arthritis/i);
    }
  });

  it("keeps safety architecture notes explicit", () => {
    expect(liveSafetyPainPolicyArchitectureNotes.decision_id).toBe("10C");
    expect(liveSafetyPainPolicyArchitectureNotes.hard_safety_gate).toBe(true);
    expect(liveSafetyPainPolicyArchitectureNotes.live_engines_must_obey_safety_flags).toBe(true);
    expect(liveSafetyPainPolicyArchitectureNotes.evidence_routes_to_9j).toBe(true);
  });

  it("does not contain storage, network, or mutation behavior", () => {
    const source = readFileSync("src/domain/training/live-safety-pain-policy.ts", "utf8");

    expect(source).not.toMatch(/\b(fetch|XMLHttpRequest|localStorage|AsyncStorage|setItem|getItem)\b/);
    expect(source).not.toMatch(/\b(mutateProgramme|replaceProgramme|transitionProgramme|writeWorkout|startWorkout)\s*\(/i);
    expect(source).not.toMatch(/\b(diagnose|diagnosis)\b/i);
  });
});
