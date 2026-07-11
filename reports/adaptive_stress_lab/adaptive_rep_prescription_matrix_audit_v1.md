# Adaptive Rep Prescription Matrix Audit v1

Status: research/audit output.  
Date: 2026-06-28

Production app untouched. No EAS build started.

## Files Created

- `docs/adaptive-rep-prescription-matrix-v1.md`
- `reports/adaptive_stress_lab/adaptive_rep_prescription_matrix_audit_v1.md`

## Purpose

This audit compares the current isolated production module:

- `src/domain/training/adaptive-rep-prescription.ts`

against the new research-backed matrix:

- `docs/adaptive-rep-prescription-matrix-v1.md`

The goal is not to rewrite the engine today. The goal is to identify whether the current v1 module is:

- safe enough to remain internal
- aligned with the intended programming model
- missing important decision boundaries
- overconfident in any category
- ready for a future implementation patch

## Summary Verdict

The current engine is safe as an isolated internal module, but incomplete as a production-wide prescription authority.

It should remain internal/test-backed until the next patch separates:

1. Competition squat vs competition bench vs competition deadlift
2. Athletic Performance power prescriptions vs strength-support prescriptions
3. Maintenance category-specific prescriptions
4. Duration targets from rep targets
5. AMRAP calibration policy by goal and exercise risk

No obvious unsafe issue was found that requires changing engine logic in this audit.

## Current Engine Snapshot

The engine currently supports:

- Goals: strength, hypertrophy, build_muscle_strength, athletic_performance, get_lean, maintenance
- Phases: accumulation, intensification, peak, deload, maintenance
- Set objectives: calibration, productive, verification, performance, recovery
- Coaching biases: tension, balanced, metabolic, speed_power, skill, recovery, peak
- Prescription types: fixed_reps, top_range_check, amrap, capped_amrap, recovery_reps
- Exercise archetypes: competition_lift, primary_compound, machine_compound, isolation, power, duration_bodyweight, unsupported

Relevant code references:

- Public context/output types: `src/domain/training/adaptive-rep-prescription.ts:25`
- Main decision order: `src/domain/training/adaptive-rep-prescription.ts:63`
- Exercise archetype mapping: `src/domain/training/adaptive-rep-prescription.ts:158`
- Strength logic: `src/domain/training/adaptive-rep-prescription.ts:197`
- Build Muscle + Strength logic: `src/domain/training/adaptive-rep-prescription.ts:234`
- Get Lean logic: `src/domain/training/adaptive-rep-prescription.ts:270`
- Calibration / AMRAP logic: `src/domain/training/adaptive-rep-prescription.ts:292`
- Peak logic: `src/domain/training/adaptive-rep-prescription.ts:314`
- Power logic: `src/domain/training/adaptive-rep-prescription.ts:338`
- Objective/bias resolution: `src/domain/training/adaptive-rep-prescription.ts:353`
- Confidence scoring: `src/domain/training/adaptive-rep-prescription.ts:418`

Adaptive Set Allocation also has a rep-intent safeguard:

- Optional `repPrescription` input: `src/domain/training/adaptive-set-allocation.ts:24`
- Verification/top-range continuation guard: `src/domain/training/adaptive-set-allocation.ts:116`

## Alignment Findings

### Strong Alignment

1. The engine prescribes by intent, not by rep range alone.
   - It exposes set objective and coaching bias directly.
   - This matches the Adaptive Programming Framework.

2. Productive hypertrophy defaults to fixed reps.
   - Tension -> 8, balanced -> 10, metabolic -> 12.
   - This matches the matrix principle that fixed reps are often better than vague ranges for productive work.

3. Verification uses top-range checks.
   - `top_range_check` is used for verification rather than immediate AMRAP.
   - This aligns with the lower-fatigue evidence-gathering policy.

4. AMRAP is separated from capped AMRAP.
   - High-risk movements and competition lifts use `capped_amrap`.
   - This aligns with the "AMRAP is data, not default training" policy.

5. Deload/recovery suppresses aggressive checks.
   - Recovery context returns `recovery_reps` and `recovery_load`.
   - This aligns with the matrix.

6. Peak phase supports singles/doubles/triples.
   - Competition lifts use 1-3 reps.
   - This aligns with powerlifting peaking literature and coaching consensus.

7. Power movements stay low rep.
   - Jumps/throws use 2-4; speed work uses 1-3.
   - This aligns with ACSM/NSCA-style power principles and Westside-style dynamic-effort constraints.

8. Get Lean avoids AMRAP from low confidence.
   - The recent rule explicitly keeps low-confidence Get Lean in productive/conservative mode.
   - This aligns with the matrix.

9. Unsupported exercises fall back conservatively.
   - Unsupported hypertrophy returns fixed reps and lower confidence.
   - This is a safe v1 behaviour.

10. Set allocation no longer treats easy top-range verification as automatically finished.
   - This aligns with the matrix view that top-range success can mean underload, not "stimulus achieved."

## Questionable Decisions

### 1. Athletic Performance Goal Overrides Exercise Category

Current behaviour:

- `context.goal === "athletic_performance"` routes to `powerPrescription`, even for non-power exercises.

Code:

- `src/domain/training/adaptive-rep-prescription.ts:104`
- `src/domain/training/adaptive-rep-prescription.ts:338`

Why questionable:

- Athletic Performance should use power prescriptions for power movements.
- It should use strength-support prescriptions for squat, bench, deadlift, overhead press, and heavy compounds.
- A Romanian deadlift, lat pulldown, or lateral raise should not automatically become 1-3 or 2-4 "fast reps" simply because the goal is athletic performance.

Risk:

- Medium if globally wired.
- Low today because the engine is internal/isolated.

Recommendation:

- Next patch should make `archetype === "power"` the hard trigger for power prescriptions.
- Athletic Performance should then branch non-power categories into strength-support or low-fatigue support prescriptions.

### 2. Competition Squat, Bench, and Deadlift Are One Bucket

Current behaviour:

- All three competition lifts map to `competition_lift`.

Code:

- `src/domain/training/adaptive-rep-prescription.ts:56`
- `src/domain/training/adaptive-rep-prescription.ts:204`

Why questionable:

- Squat, bench, and deadlift do not have identical fatigue costs or AMRAP tolerance.
- Deadlift usually needs stricter caps and less repeated heavy-volume exposure.
- Bench usually tolerates more frequent specific exposure than deadlift.

Risk:

- Medium if used globally.
- Low while internal.

Recommendation:

- Add a second-level `competitionLiftKind`: squat, bench, deadlift.
- Keep shared competition-lift defaults, then apply lift-specific overrides.

### 3. Strength Accessories Are Too Low-Rep By Default

Current behaviour:

- Non-primary strength work returns 5-8.
- Isolation exercises under strength can also fall into 5-8.

Code:

- `src/domain/training/adaptive-rep-prescription.ts:220`

Why questionable:

- Strength accessories often benefit from 8-15, especially isolation and tissue-support work.
- Using 5-8 for leg extension, cable curl, triceps pushdown, or lateral raise is not unsafe, but it is not the best default for support work.

Risk:

- Low-to-medium.

Recommendation:

- Strength should split:
  - secondary compounds: 5-8 or 6-10
  - machine compounds: 6-10
  - isolation: 8-15

### 4. Build Muscle + Strength Deadlift Can Drift Too High

Current behaviour:

- Competition lifts and primary compounds in Build Muscle + Strength use 5-10 in accumulation, target 8.

Code:

- `src/domain/training/adaptive-rep-prescription.ts:241`

Why questionable:

- This is reasonable for bench, overhead press, leg press, and some heavy compounds.
- It may be too fatiguing for competition deadlift.

Risk:

- Medium if globally wired.

Recommendation:

- Add a deadlift-specific accumulation range such as 3-6 or 4-8.

### 5. Maintenance Is Too Generic

Current behaviour:

- Maintenance uses midpoint of the supplied range, clamped 6-12, for every category.

Code:

- `src/domain/training/adaptive-rep-prescription.ts:141`

Why questionable:

- Maintenance should still respect category.
- Deadlift maintenance should not look like lateral raise maintenance.
- Power movement maintenance should still be low-rep/high-quality.

Risk:

- Low today; medium if exposed globally.

Recommendation:

- Add category-specific maintenance defaults.

### 6. Duration Uses `target_reps` Semantically

Current behaviour:

- Duration/bodyweight exercises use `target_reps` to hold seconds.

Code:

- `src/domain/training/adaptive-rep-prescription.ts:76`

Why questionable:

- Tests and debug copy make clear this is seconds, not fake reps.
- But the output type is semantically wrong for future UI and load/duration progression.

Risk:

- Low today, because visible UI wiring is not global.
- Medium later if UI reads `target_reps` literally.

Recommendation:

- Add a future output shape with `measurement_type`, `target_seconds`, and `duration_range`.

### 7. Calibration From `exerciseExposureCount <= 0` Is Too Broad

Current behaviour:

- Missing/zero exposure count triggers calibration for most goals.

Code:

- `src/domain/training/adaptive-rep-prescription.ts:361`

Why questionable:

- New exercise uncertainty often needs calibration, but calibration does not always mean AMRAP.
- For high-risk compounds the engine caps AMRAP, which is good.
- For low-risk exercises, open AMRAP to range max may still be too eager depending on goal and phase.

Risk:

- Low-to-medium.

Recommendation:

- Split calibration into:
  - fixed discovery set
  - top-range check
  - capped AMRAP
  - open AMRAP only for low-risk isolation/machine contexts.

### 8. Confidence Scores Are Broad, Not Evidence-Derived

Current behaviour:

- Confidence starts from a base and changes with exposure count, load confidence, and recovery flag.

Code:

- `src/domain/training/adaptive-rep-prescription.ts:418`

Why questionable:

- This is fine for v1.
- It is not enough for production authority because it ignores exercise risk, goal phase, pain/safety context, recent shutdowns, and same-exercise exposure quality.

Risk:

- Low while internal.
- Medium if UI starts displaying confidence or other modules trust it strongly.

Recommendation:

- Borrow from V2 evidence quality derivation before using confidence to drive production decisions.

### 9. Peak Branch Can Apply Outside True Meet/Performance Context

Current behaviour:

- `trainingPhase === "peak"`, `setObjective === "performance"`, or `coachingBias === "peak"` routes to peak prescription.

Code:

- `src/domain/training/adaptive-rep-prescription.ts:108`

Why questionable:

- This is correct if phase/objective are set deliberately.
- It could become too aggressive if upstream code marks peak casually.

Risk:

- Low today.

Recommendation:

- Future wiring should require an explicit peak/performance context, not just a loosely inferred label.

### 10. Exercise Archetype Coverage Is Initial, Not Production-Complete

Current behaviour:

- The supported list is intentionally small.

Code:

- `src/domain/training/adaptive-rep-prescription.ts:56`

Why questionable:

- Real app exercise names may include variants, abbreviations, or custom substitutions.
- A broad unsupported fallback is safe, but may under-prescribe specificity.

Risk:

- Low because fallback is conservative.

Recommendation:

- Use existing exercise metadata before relying on name matching.
- Keep custom exercises conservative until the user assigns type/metric metadata.

## Missing Decisions

The matrix defines the following decisions that the current engine does not yet express fully:

1. Competition-lift-specific subtypes:
   - squat
   - bench
   - deadlift

2. Athletic Performance non-power prescriptions:
   - strength-support work
   - low-fatigue support work
   - isolation/tissue support work

3. Duration semantics:
   - target seconds
   - duration range
   - carry distance/time distinction

4. Maintenance by category:
   - deadlift low-rep maintenance
   - power crisp-exposure maintenance
   - isolation 10-15 maintenance

5. AMRAP policy by:
   - goal
   - phase
   - exercise fatigue cost
   - same-exercise history
   - recent shutdown/missed-range state

6. Top-range check cadence:
   - when to verify
   - how often to verify
   - how to interpret repeated checks

7. Load strategy semantics:
   - `conservative_load` vs `use_current_load` vs `heavier_specific_load` exist, but there is no load prescription engine yet.

8. Performance set policy:
   - peak singles exist
   - performance checks outside peak are not yet governed.

## Overconfident Decisions

No dangerous overconfidence was found, but these areas should not be trusted as production-authoritative yet:

| Area | Current confidence tendency | Audit concern |
|---|---:|---|
| Athletic Performance non-power exercise | Often around 80 | Wrong category can still be confident |
| Competition deadlift accumulation | Often around 80+ | Same as squat/bench despite higher fatigue |
| Maintenance generic prescriptions | Around 76 | Too generic for category-specific authority |
| Low-risk AMRAP calibration | Around 78 | May be too high without recent recovery/safety context |
| Peak prescriptions | 72-82 | Reasonable only if upstream phase is truly deliberate |

## Top 10 Mismatches

1. Athletic Performance routes every exercise to power-style reps.
   - Severity: Medium
   - Fix: only power archetypes use powerPrescription; non-power gets strength/support prescriptions.

2. Competition deadlift is not separated from squat/bench.
   - Severity: Medium
   - Fix: add competition lift subtype.

3. Strength isolation work can default to 5-8.
   - Severity: Medium-low
   - Fix: isolation support should use 8-15 unless explicitly tension-heavy.

4. Build Muscle + Strength deadlift accumulation can target 8 in a 5-10 range.
   - Severity: Medium
   - Fix: deadlift-specific lower range.

5. Maintenance is generic instead of category-specific.
   - Severity: Low-medium
   - Fix: add maintenance matrix branch.

6. Duration prescriptions use `target_reps` for seconds.
   - Severity: Low now, medium before UI wiring
   - Fix: add semantic duration fields.

7. Calibration is too tightly coupled to AMRAP.
   - Severity: Low-medium
   - Fix: add calibration subtypes.

8. Confidence is base-score driven, not evidence-quality derived.
   - Severity: Low now, medium later
   - Fix: incorporate V2 evidence confidence before broad use.

9. Peak/performance branch relies on upstream labels being correct.
   - Severity: Low
   - Fix: require explicit performance context when wired.

10. Exercise mapping is name-based.
   - Severity: Low
   - Fix: prefer exercise metadata and use name matching only as fallback.

## Rules Needing Aaron Review

1. Deadlift cap strictness:
   - Should competition deadlift always use stricter caps than squat and bench?

2. Athletic Performance scope:
   - Should Athletic Performance include strength-support prescriptions now, or wait until the goal model is rebuilt?

3. Duration output:
   - Should we introduce `target_seconds` / `duration_range` before any UI display?

4. Maintenance:
   - Should Maintenance remain a simple mode, or become category-specific like the other goals?

5. AMRAP cadence:
   - How often should low-risk isolation AMRAP calibration be allowed?

6. Top-range check language:
   - Should users ever see "top-range check", or should this remain internal coaching language?

7. Peak access:
   - Should peak prescriptions be restricted to meet prep / explicit performance blocks?

## Recommendation For Next Implementation Patch

Do not globally wire the engine yet.

Recommended next patch:

1. Add `competitionLiftKind` inference:
   - squat
   - bench
   - deadlift

2. Fix Athletic Performance branching:
   - power archetype -> power prescription
   - competition/heavy compound -> strength-support prescription
   - machine/isolation -> low-fatigue support prescription

3. Add category-specific Maintenance logic.

4. Add duration semantic fields while preserving backward compatibility:
   - `measurement_type`
   - `target_seconds`
   - `duration_range`

5. Split calibration output into safer subtypes:
   - discovery_fixed_reps or fixed_reps with estimate_load
   - top_range_check
   - capped_amrap
   - amrap only in low-risk contexts

6. Keep Adaptive Set Allocation advisory until load intent exists.

## Verification Notes

This sprint only added documentation and reports.

Recommended verification:

- `npm test`
- `npx tsc --noEmit --pretty false` if local tooling permits
- touched-file transpile smoke if full `tsc` hangs
- `CI=1 npx expo export --platform web` if local tooling permits

## Production Touch Status

Production app code was not changed in this audit.

No subscription/paywall logic changed.  
No recovery-week logic changed.  
No workout generation changed.  
No UI changed.  
No EAS build started.

