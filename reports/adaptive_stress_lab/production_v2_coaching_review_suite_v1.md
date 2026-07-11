# Production V2 Coaching Review Suite v1

Status: isolated production-pipeline review. No global workout-generation wiring.

## Summary

- Total scenarios: 76
- Expected behaviour checks passed: 13/13
- Flagged for Aaron review: 1
- Ready for Adaptive Load Prescription: yes

## Top Questionable Decisions

- sit_unsupported_fallback: Unsupported mystery lift (low_evidence_confidence, unsupported_fallback)

## Before / After

- Before hardening: 22 Aaron-review flags.
- After hardening: 1 Aaron-review flag.
- Non-blocking low-evidence notes remaining: 13.
- Expected behaviour checks remain green: 13/13.

## Missing Context

- Adaptive Load Prescription is not implemented, so load strategy cannot yet be audited end-to-end.
- Cycle context uses compact scalar recovery/performance inputs, not full Coaching State.
- Set allocation preview uses synthetic completed sets, not full workout state.
- Exercise metadata is archetype-level; production exercise database mapping still needs review before global wiring.

## Scenario Groups

### Strength

- core_deload_deadlift: Deload deadlift always recovery
  - Cycle: recover, conserve
  - Session: recovery/recovery
  - Rep: recovery_reps, Recovery set.
  - Review: recover -> recovery/recovery -> recovery_reps -> move_on
  - Flags: none
- core_safety_peak_bench: Safety blocks peak bench performance
  - Cycle: express_strength, conserve
  - Session: recovery/recovery
  - Rep: recovery_reps, Recovery set.
  - Review: safety correctly overrides peak expression
  - Flags: none
- core_deadlift_calibration: Deadlift calibration stays capped
  - Cycle: build_strength_capacity, maintain
  - Session: calibration/skill
  - Rep: capped_amrap, AMRAP cap 4
  - Review: conservative deadlift calibration; rep engine intentionally uses tension bias for safety
  - Flags: low_evidence_confidence
- core_strength_peak_owned: Owned peak squat expression
  - Cycle: express_strength, conserve
  - Session: performance/peak
  - Rep: fixed_reps, 1 rep
  - Review: safe owned peak work expresses performance
  - Flags: none
- sit_introduced_squat: Introduced squat load
  - Cycle: increase_specificity, maintain
  - Session: verification/tension
  - Rep: top_range_check
  - Review: verifies ownership before pushing
  - Flags: none
- sit_peak_deadlift_owned: Peak deadlift owned
  - Cycle: express_strength, conserve
  - Session: performance/peak
  - Rep: fixed_reps, 1 rep
  - Review: specific and low volume
  - Flags: none

### Hypertrophy

- core_hypertrophy_isolation_good: Hypertrophy isolation high recovery
  - Cycle: build_quality_volume, spend
  - Session: productive/metabolic
  - Rep: fixed_reps, 12 reps
  - Review: good recovery permits metabolic isolation work
  - Flags: none
- core_hypertrophy_compound_limited: Hypertrophy compound limited recovery
  - Cycle: build_quality_volume, maintain
  - Session: productive/tension
  - Rep: fixed_reps, 8 reps
  - Review: avoids aggressive metabolic fatigue on a compound
  - Flags: none
- core_underloaded_chest_press: Underloaded chest press verification
  - Cycle: build_quality_volume, maintain
  - Session: verification/balanced
  - Rep: top_range_check
  - Review: verifies underload without open AMRAP
  - Flags: none
- matrix_07: Hypertrophy peak leg extension
  - Cycle: progress_quality_work, conserve
  - Session: verification/tension
  - Rep: top_range_check
  - Review: now verifies the existing moderate/higher-rep isolation range instead of forcing low-rep peak work
  - Flags: none
- sit_underloaded_leg_ext: Underloaded leg extension
  - Cycle: build_quality_volume, spend
  - Session: verification/metabolic
  - Rep: top_range_check
  - Review: sensible verification for high-recovery isolation work
  - Flags: none

### Build Muscle + Strength

- core_low_exposure_press: Low exposure overhead press calibration
  - Cycle: build_muscle_and_strength, maintain
  - Session: calibration/tension
  - Rep: top_range_check
  - Review: conservative load-finding check
  - Flags: low_evidence_confidence
- sit_stabilising_rdl: Stabilising RDL
  - Cycle: build_muscle_and_strength, maintain
  - Session: verification/tension
  - Rep: top_range_check
  - Review: verifies a stabilising hinge load before progressing
  - Flags: none
- sit_bms_peak_bench: Build muscle strength peak bench
  - Cycle: express_strength, conserve
  - Session: performance/peak
  - Rep: fixed_reps, 1 rep
  - Review: strength expression with conservative volume
  - Flags: none
- sit_bms_accessory_good: Build muscle strength accessory
  - Cycle: build_muscle_and_strength, spend
  - Session: productive/metabolic
  - Rep: fixed_reps, 12 reps
  - Review: accessory stimulus is allowed when recovery is strong
  - Flags: none

### Athletic Performance

- core_athletic_power: Athletic power movement
  - Cycle: build_strength_capacity, maintain
  - Session: verification/speed_power
  - Rep: fixed_reps, 3 fast reps
  - Review: power prescription preserves verification objective while keeping true speed/power bias
  - Flags: none
- core_athletic_accessory: Athletic accessory support
  - Cycle: build_strength_capacity, maintain
  - Session: productive/balanced
  - Rep: fixed_reps, 12 support reps
  - Review: accessory does not become speed/power work
  - Flags: none
- matrix_16: Athletic performance maintenance leg extension
  - Cycle: build_strength_capacity, maintain
  - Session: productive/recovery
  - Rep: fixed_reps, 12 support reps
  - Review: limited-recovery accessory no longer inherits speed_power
  - Flags: none
- sit_power_speed_bench: Speed bench athletic
  - Cycle: increase_specificity, spend
  - Session: productive/speed_power
  - Rep: fixed_reps, 2 fast reps
  - Review: appropriate power prescription
  - Flags: none
- sit_athletic_peak_throw: Athletic peak medicine ball throw
  - Cycle: express_power, conserve
  - Session: performance/peak
  - Rep: fixed_reps, 3 fast reps
  - Review: sensible low-fatigue power expression; rep engine intentionally keeps speed_power bias
  - Flags: none

### Get Lean

- core_get_lean_poor: Get lean poor recovery
  - Cycle: recover, conserve
  - Session: recovery/recovery
  - Rep: recovery_reps
  - Review: conserves stress correctly
  - Flags: none
- sit_get_lean_good_bench: Get lean good recovery bench
  - Cycle: preserve_performance, maintain
  - Session: productive/tension
  - Rep: fixed_reps, 6 controlled reps
  - Review: preserves strength without adding unnecessary fatigue
  - Flags: none
- sit_get_lean_limited_leg_press: Get lean limited leg press
  - Cycle: preserve_performance, conserve
  - Session: productive/recovery
  - Rep: fixed_reps, 6 controlled reps
  - Review: conservative but still productive
  - Flags: none
- matrix_17: Get lean accumulation box jump
  - Cycle: preserve_performance, conserve
  - Session: calibration/balanced
  - Rep: fixed_reps, 3 fast reps
  - Review: low evidence remains visible, but power bias override is intentional for a true power movement
  - Flags: low_evidence_confidence

### Maintenance

- core_maintenance_normal: Maintenance normal row
  - Cycle: maintain_training, maintain
  - Session: productive/balanced
  - Rep: fixed_reps, controlled work
  - Review: simple controlled maintenance
  - Flags: none
- sit_duration_plank: Plank duration support
  - Cycle: maintain_training, maintain
  - Session: productive/balanced
  - Rep: duration_hold
  - Review: duration work stays duration-based
  - Flags: none
- sit_unsupported_fallback: Unsupported mystery lift
  - Cycle: maintain_training, maintain
  - Session: productive/balanced
  - Rep: fixed_reps, controlled work
  - Review: safe fallback, but mapping needs review
  - Flags: low_evidence_confidence, unsupported_fallback
- sit_maintenance_overreached: Maintenance overreached
  - Cycle: recover, conserve
  - Session: recovery/recovery
  - Rep: recovery_reps
  - Review: recovery override works
  - Flags: none

## Flag Summary

- unsupported_fallback: One unsupported exercise remains safe but needs mapping review before global wiring.
- low_evidence_confidence: Low-exposure/low-load-confidence scenarios remain visible but are not Aaron-review blockers when metadata is supplied.
- rep_intent_mismatch: Cleared for unintentional cases. Intentional power/deadlift safety overrides now include debug reasons.
- isolation_too_heavy: Cleared. Hypertrophy isolation peak contexts use top-range verification instead of low-rep peak work.
- questionable_power_bias: Cleared. Athletic accessories no longer inherit speed_power unless they are true power movements.

## Recommendation

The isolated intent pipeline is coherent enough to proceed to Adaptive Load Prescription design, but not to global workout-generation wiring.

Before global wiring, Aaron should review:

- Unsupported exercise fallback handling.
- Whether low-evidence scenarios should remain advisory-only until Adaptive Load Prescription has its own confidence gate.
- Whether intentional power/deadlift bias overrides should be surfaced in future developer diagnostics.

Recommended next module: Adaptive Load Prescription.
