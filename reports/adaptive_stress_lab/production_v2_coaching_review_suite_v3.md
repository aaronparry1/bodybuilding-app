# Production V2 Coaching Review Suite v3

Status: complete-session isolated review. No global workout-generation wiring.

## Summary

- Complete sessions: 25
- Exercises reviewed: 128
- Gold Standard Sessions: 25
- Questionable sessions: 12
- Repeated exercise bias: 2
- Unnecessary fatigue: 4
- Poor specificity: 0
- Lack of variety: 8
- Unnecessary complexity: 0

## Best Coaching Sessions

- hypertrophy_05_deload: Hypertrophy Deload (clean, confidence 85%)
- athletic_04_poor_recovery: Athletic Poor Recovery (clean, confidence 84%)
- lean_02_poor_recovery: Get Lean Poor Recovery (clean, confidence 84%)
- hypertrophy_01_push: Hypertrophy Push Quality (clean, confidence 82%)
- bms_01_upper_anchor: Build Muscle + Strength Upper Anchor (clean, confidence 82%)
- bms_02_lower_anchor: Build Muscle + Strength Lower Anchor (clean, confidence 82%)
- bms_04_peak_bench: Build Muscle + Strength Peak Bench (clean, confidence 81%)
- bms_05_time_limited: Build Muscle + Strength Time Limited (clean, confidence 81%)

## Questionable Sessions

- strength_01_peak_sbd: Strength Peak SBD (unnecessary_fatigue, confidence 85%)
- strength_02_accum_lower: Strength Accumulation Lower (unnecessary_fatigue, confidence 83%)
- strength_03_intensity_upper: Strength Intensification Upper (unnecessary_fatigue, confidence 84%)
- strength_04_deadlift_calibration: Strength Deadlift Calibration (unnecessary_fatigue, low_confidence_session, confidence 73%)
- strength_05_low_back_management: Strength Low Back Managed (repeated_exercise_bias, lack_of_variety, confidence 80%)
- hypertrophy_02_pull: Hypertrophy Pull Quality (repeated_exercise_bias, lack_of_variety, confidence 82%)
- hypertrophy_03_legs: Hypertrophy Legs Quality (lack_of_variety, confidence 82%)
- hypertrophy_04_limited_recovery: Hypertrophy Limited Recovery (lack_of_variety, confidence 78%)
- bms_03_intensification: Build Muscle + Strength Intensification (lack_of_variety, confidence 84%)
- athletic_01_power: Athletic Power Session (lack_of_variety, confidence 81%)
- lean_01_full_body: Get Lean Full Body (lack_of_variety, confidence 80%)
- lean_05_maintenance: Get Lean Maintenance Week (lack_of_variety, confidence 81%)

## Gold Standard Sessions

These sessions are regression benchmarks. Future engine changes should compare complete exercise selection, rep intent, load strategy, set guidance, flags, and confidence against this section.

### strength

#### Strength Peak SBD

- Session: full_body, peak
- Cycle: express_strength; conserve
- Stimulus: Conserve stress while preserving key stimulus.
- Delivery: Protect specificity and adapt support work.
- Confidence: 85%
- Flags: unnecessary_fatigue

| Exercise | Stimulus | Delivery | Reps | Load | Sets | Why selected | Why reps | Why load | Why sets |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Competition Squat | competition_squat_strength | competition_lift | 1 reps. | Small load increase. | Stimulus achieved. Save energy for the next lift. | Competition Squat delivers competition_squat_strength via competition lift: Deliver competition_squat_strength through competition lift. Specificity is protected. | fixed reps because performance/peak: 1 reps. | increase load using small progression: Small load increase. | 2-3 set range; Stimulus achieved. Save energy for the next lift. |
| Competition Bench Press | competition_bench_strength | competition_lift | 1 reps. | Small load increase. | One more productive set. | Competition Bench Press delivers competition_bench_strength via competition lift: Deliver competition_bench_strength through competition lift. Specificity is protected. | fixed reps because performance/peak: 1 reps. | increase load using small progression: Small load increase. | 2-3 set range; One more productive set. |
| Competition Deadlift | competition_deadlift_strength | competition_lift | 1 reps. | Small conservative increase. | Stimulus achieved. Save energy for the next lift. | Competition Deadlift delivers competition_deadlift_strength via competition lift: Deliver competition_deadlift_strength through competition lift. Specificity is protected. | fixed reps because performance/peak: 1 reps. | increase load using conservative progression: Small conservative increase. | 2-3 set range; Stimulus achieved. Save energy for the next lift. |
| Technique Practice | technical_practice | skill_movement | Hold the target time. | Use bodyweight or duration. | One more productive set. | Technique Practice delivers technical_practice via skill movement: Deliver technical_practice through skill movement. | duration hold because performance/peak: Hold the target time. | no external load using bodyweight or duration: Use bodyweight or duration. | 2-4 set range; One more productive set. |

#### Strength Accumulation Lower

- Session: lower, accumulation
- Cycle: build_strength_capacity; maintain
- Stimulus: Prioritise strength-specific stimulus.
- Delivery: Protect specificity and adapt support work.
- Confidence: 83%
- Flags: unnecessary_fatigue

| Exercise | Stimulus | Delivery | Reps | Load | Sets | Why selected | Why reps | Why load | Why sets |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Competition Squat | competition_squat_strength | competition_lift | 5 reps. | Keep the load. | Stimulus achieved. Save energy for the next lift. | Competition Squat delivers competition_squat_strength via competition lift: Deliver competition_squat_strength through competition lift. Specificity is protected. | fixed reps because productive/skill: 5 reps. | keep load using owned load: Keep the load. | 2-3 set range; Stimulus achieved. Save energy for the next lift. |
| Competition Deadlift | competition_deadlift_strength | competition_lift | 3 reps. | Keep the load. | Stimulus achieved. Save energy for the next lift. | Competition Deadlift delivers competition_deadlift_strength via competition lift: Deliver competition_deadlift_strength through competition lift. Specificity is protected. | fixed reps because productive/skill: 3 reps. | keep load using owned load: Keep the load. | 2-3 set range; Stimulus achieved. Save energy for the next lift. |
| Standing Overhead Press | overhead_press_strength | heavy_free_weight_compound | 6 reps. | Keep the load. | Stimulus achieved. Move on. | Standing Overhead Press delivers overhead_press_strength via heavy free weight compound: Deliver overhead_press_strength through heavy free weight compound. | fixed reps because productive/tension: 6 reps. | keep load using owned load: Keep the load. | 2-3 set range; Stimulus achieved. Move on. |
| Barbell Row | horizontal_pull_strength | heavy_free_weight_compound | 6 reps. | Keep the load. | One more productive set. | Barbell Row delivers horizontal_pull_strength via heavy free weight compound: Deliver horizontal_pull_strength through heavy free weight compound. | fixed reps because productive/tension: 6 reps. | keep load using owned load: Keep the load. | 2-3 set range; One more productive set. |
| Chest Supported Row | upper_back_hypertrophy | machine_compound | 8 reps. | Keep the load. | One more productive set. | Chest Supported Row delivers upper_back_hypertrophy via machine compound: Deliver upper_back_hypertrophy through machine compound. Stimulus quality matters more than exercise novelty. | fixed reps because productive/tension: 8 reps. | keep load using owned load: Keep the load. | 2-4 set range; One more productive set. |
| Triceps Pushdown | triceps_hypertrophy | machine_compound | 12 reps. | Keep the load. | One more productive set. | Triceps Pushdown delivers triceps_hypertrophy via machine compound: Deliver triceps_hypertrophy through machine compound. Stimulus quality matters more than exercise novelty. | fixed reps because productive/balanced: 12 reps. | keep load using owned load: Keep the load. | 2-5 set range; One more productive set. |

#### Strength Intensification Upper

- Session: upper, intensification
- Cycle: increase_specificity; spend
- Stimulus: Prioritise strength-specific stimulus.
- Delivery: Protect specificity and adapt support work.
- Confidence: 84%
- Flags: unnecessary_fatigue

| Exercise | Stimulus | Delivery | Reps | Load | Sets | Why selected | Why reps | Why load | Why sets |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Competition Bench Press | competition_bench_strength | competition_lift | Top-range check. | Small load increase. | Stimulus achieved. Move on. | Competition Bench Press delivers competition_bench_strength via competition lift: Deliver competition_bench_strength through competition lift. Specificity is protected. | top range check because verification/tension: Top-range check. | increase load using small progression: Small load increase. | 2-3 set range; Stimulus achieved. Move on. |
| Standing Overhead Press | overhead_press_strength | heavy_free_weight_compound | Top-range check. | Small load increase. | Stimulus achieved. Move on. | Standing Overhead Press delivers overhead_press_strength via heavy free weight compound: Deliver overhead_press_strength through heavy free weight compound. | top range check because verification/tension: Top-range check. | increase load using small progression: Small load increase. | 2-3 set range; Stimulus achieved. Move on. |
| Barbell Row | horizontal_pull_strength | heavy_free_weight_compound | Top-range check. | Small load increase. | Stimulus achieved. Move on. | Barbell Row delivers horizontal_pull_strength via heavy free weight compound: Deliver horizontal_pull_strength through heavy free weight compound. | top range check because verification/tension: Top-range check. | increase load using small progression: Small load increase. | 2-3 set range; Stimulus achieved. Move on. |
| Chest Supported Row | upper_back_hypertrophy | machine_compound | Top-range check. | Small load increase. | One more productive set. | Chest Supported Row delivers upper_back_hypertrophy via machine compound: Deliver upper_back_hypertrophy through machine compound. Stimulus quality matters more than exercise novelty. | top range check because verification/tension: Top-range check. | increase load using small progression: Small load increase. | 2-4 set range; One more productive set. |
| Triceps Pushdown | triceps_hypertrophy | machine_compound | Top-range check. | Small load increase. | One more productive set. | Triceps Pushdown delivers triceps_hypertrophy via machine compound: Deliver triceps_hypertrophy through machine compound. Stimulus quality matters more than exercise novelty. | top range check because verification/tension: Top-range check. | increase load using small progression: Small load increase. | 2-5 set range; One more productive set. |
| Hamstring Curl | hamstring_hypertrophy | machine_compound | Top-range check. | Small load increase. | One more productive set. | Hamstring Curl delivers hamstring_hypertrophy via machine compound: Deliver hamstring_hypertrophy through machine compound. Stimulus quality matters more than exercise novelty. | top range check because verification/tension: Top-range check. | increase load using small progression: Small load increase. | 2-5 set range; One more productive set. |

#### Strength Deadlift Calibration

- Session: lower, accumulation
- Cycle: build_strength_capacity; maintain
- Stimulus: Prioritise strength-specific stimulus.
- Delivery: Protect specificity and adapt support work.
- Confidence: 73%
- Flags: unnecessary_fatigue, low_confidence_session

| Exercise | Stimulus | Delivery | Reps | Load | Sets | Why selected | Why reps | Why load | Why sets |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Competition Squat | competition_squat_strength | competition_lift | AMRAP, cap 5. | Use a conservative calibration load. | Stimulus achieved. Save energy for the next lift. | Competition Squat delivers competition_squat_strength via competition lift: Deliver competition_squat_strength through competition lift. Specificity is protected. | capped amrap because calibration/skill: AMRAP, cap 5. | conservative start using calibration load: Use a conservative calibration load. | 2-3 set range; Stimulus achieved. Save energy for the next lift. |
| Competition Deadlift | competition_deadlift_strength | competition_lift | AMRAP, cap 4. | Use a conservative calibration load. | Stimulus achieved. Save energy for the next lift. | Competition Deadlift delivers competition_deadlift_strength via competition lift: Deliver competition_deadlift_strength through competition lift. Specificity is protected. | capped amrap because calibration/skill: AMRAP, cap 4. | conservative start using calibration load: Use a conservative calibration load. | 2-3 set range; Stimulus achieved. Save energy for the next lift. |
| Standing Overhead Press | overhead_press_strength | heavy_free_weight_compound | Load-finding check. | Estimate from the calibration set. | Stimulus achieved. Move on. | Standing Overhead Press delivers overhead_press_strength via heavy free weight compound: Deliver overhead_press_strength through heavy free weight compound. | top range check because calibration/tension: Load-finding check. | estimate from amrap using calibration load: Estimate from the calibration set. | 2-3 set range; Stimulus achieved. Move on. |
| Barbell Row | horizontal_pull_strength | heavy_free_weight_compound | Load-finding check. | Estimate from the calibration set. | One more productive set. | Barbell Row delivers horizontal_pull_strength via heavy free weight compound: Deliver horizontal_pull_strength through heavy free weight compound. | top range check because calibration/tension: Load-finding check. | estimate from amrap using calibration load: Estimate from the calibration set. | 2-3 set range; One more productive set. |
| Chest Supported Row | upper_back_hypertrophy | machine_compound | Load-finding check. | Estimate from the calibration set. | One more productive set. | Chest Supported Row delivers upper_back_hypertrophy via machine compound: Deliver upper_back_hypertrophy through machine compound. Stimulus quality matters more than exercise novelty. | top range check because calibration/tension: Load-finding check. | estimate from amrap using calibration load: Estimate from the calibration set. | 2-4 set range; One more productive set. |
| Triceps Pushdown | triceps_hypertrophy | machine_compound | Load-finding check. | Estimate from the calibration set. | One more productive set. | Triceps Pushdown delivers triceps_hypertrophy via machine compound: Deliver triceps_hypertrophy through machine compound. Stimulus quality matters more than exercise novelty. | top range check because calibration/balanced: Load-finding check. | estimate from amrap using calibration load: Estimate from the calibration set. | 2-5 set range; One more productive set. |

#### Strength Low Back Managed

- Session: full_body, accumulation
- Cycle: build_strength_capacity; maintain
- Stimulus: Prioritise strength-specific stimulus.
- Delivery: Deliver required stimulus with lower-risk options.
- Confidence: 80%
- Flags: repeated_exercise_bias, lack_of_variety

| Exercise | Stimulus | Delivery | Reps | Load | Sets | Why selected | Why reps | Why load | Why sets |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Competition Squat | competition_squat_strength | competition_lift | 5 reps. | Keep the load. | Stimulus achieved. Save energy for the next lift. | Competition Squat delivers competition_squat_strength via competition lift: Deliver competition_squat_strength through competition lift. Specificity is protected. Known limitations constrain delivery choice. | fixed reps because productive/skill: 5 reps. | keep load using owned load: Keep the load. | 2-4 set range; Stimulus achieved. Save energy for the next lift. |
| Competition Bench Press | competition_bench_strength | competition_lift | 5 reps. | Keep the load. | Stimulus achieved. Move on. | Competition Bench Press delivers competition_bench_strength via competition lift: Deliver competition_bench_strength through competition lift. Specificity is protected. Known limitations constrain delivery choice. | fixed reps because productive/skill: 5 reps. | keep load using owned load: Keep the load. | 2-3 set range; Stimulus achieved. Move on. |
| Competition Deadlift | competition_deadlift_strength | machine_compound | 3 reps. | Keep the load. | Stimulus achieved. Save energy for the next lift. | Competition Deadlift delivers competition_deadlift_strength via machine compound: Deliver competition_deadlift_strength through machine compound. Specificity is protected. Known limitations constrain delivery choice. | fixed reps because productive/skill: 3 reps. | keep load using owned load: Keep the load. | 2-3 set range; Stimulus achieved. Save energy for the next lift. |
| Standing Overhead Press | overhead_press_strength | machine_compound | 6 reps. | Keep the load. | One more productive set. | Standing Overhead Press delivers overhead_press_strength via machine compound: Deliver overhead_press_strength through machine compound. Known limitations constrain delivery choice. | fixed reps because productive/tension: 6 reps. | keep load using owned load: Keep the load. | 2-4 set range; One more productive set. |
| Chest Supported Row | horizontal_pull_strength | machine_compound | 8 reps. | Keep the load. | One more productive set. | Chest Supported Row delivers horizontal_pull_strength via machine compound: Deliver horizontal_pull_strength through machine compound. Known limitations constrain delivery choice. | fixed reps because productive/tension: 8 reps. | keep load using owned load: Keep the load. | 2-4 set range; One more productive set. |
| Chest Supported Row | upper_back_hypertrophy | machine_compound | 8 reps. | Keep the load. | One more productive set. | Chest Supported Row delivers upper_back_hypertrophy via machine compound: Deliver upper_back_hypertrophy through machine compound. Stimulus quality matters more than exercise novelty. Known limitations constrain delivery choice. | fixed reps because productive/tension: 8 reps. | keep load using owned load: Keep the load. | 2-4 set range; One more productive set. |

### hypertrophy

#### Hypertrophy Push Quality

- Session: push, accumulation
- Cycle: build_quality_volume; spend
- Stimulus: Prioritise quality muscle stimulus.
- Delivery: Deliver high-quality stimulus efficiently.
- Confidence: 82%
- Flags: none

| Exercise | Stimulus | Delivery | Reps | Load | Sets | Why selected | Why reps | Why load | Why sets |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Chest Press | chest_hypertrophy | machine_compound | 10 reps. | Keep the load. | Stimulus achieved. Move on. | Chest Press delivers chest_hypertrophy via machine compound: Deliver chest_hypertrophy through machine compound. Stimulus quality matters more than exercise novelty. | fixed reps because productive/balanced: 10 reps. | keep load using owned load: Keep the load. | 2-4 set range; Stimulus achieved. Move on. |
| Triceps Pushdown | triceps_hypertrophy | cable | 12 reps. | Keep the load. | One more productive set. | Triceps Pushdown delivers triceps_hypertrophy via cable: Deliver triceps_hypertrophy through cable. Stimulus quality matters more than exercise novelty. | fixed reps because productive/metabolic: 12 reps. | keep load using owned load: Keep the load. | 2-5 set range; One more productive set. |
| Lateral Raise | lateral_delt_hypertrophy | cable | 12 reps. | Keep the load. | One more productive set. | Lateral Raise delivers lateral_delt_hypertrophy via cable: Deliver lateral_delt_hypertrophy through cable. Stimulus quality matters more than exercise novelty. | fixed reps because productive/metabolic: 12 reps. | keep load using owned load: Keep the load. | 2-5 set range; One more productive set. |
| Incline Dumbbell Press | upper_chest_hypertrophy | machine_compound | 10 reps. | Keep the load. | One more productive set. | Incline Dumbbell Press delivers upper_chest_hypertrophy via machine compound: Deliver upper_chest_hypertrophy through machine compound. Stimulus quality matters more than exercise novelty. | fixed reps because productive/balanced: 10 reps. | keep load using owned load: Keep the load. | 2-4 set range; One more productive set. |
| Machine Shoulder Press | front_delt_hypertrophy | machine_compound | 10 reps. | Keep the load. | One more productive set. | Machine Shoulder Press delivers front_delt_hypertrophy via machine compound: Deliver front_delt_hypertrophy through machine compound. Stimulus quality matters more than exercise novelty. | fixed reps because productive/balanced: 10 reps. | keep load using owned load: Keep the load. | 2-4 set range; One more productive set. |
| Technique Practice | technical_practice | skill_movement | Hold the target time. | Use bodyweight or duration. | One more productive set. | Technique Practice delivers technical_practice via skill movement: Deliver technical_practice through skill movement. | duration hold because productive/balanced: Hold the target time. | no external load using bodyweight or duration: Use bodyweight or duration. | 2-4 set range; One more productive set. |

#### Hypertrophy Pull Quality

- Session: pull, accumulation
- Cycle: build_quality_volume; maintain
- Stimulus: Prioritise quality muscle stimulus.
- Delivery: Deliver high-quality stimulus efficiently.
- Confidence: 82%
- Flags: repeated_exercise_bias, lack_of_variety

| Exercise | Stimulus | Delivery | Reps | Load | Sets | Why selected | Why reps | Why load | Why sets |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Chest Supported Row | upper_back_hypertrophy | machine_compound | 10 reps. | Keep the load. | Stimulus achieved. Move on. | Chest Supported Row delivers upper_back_hypertrophy via machine compound: Deliver upper_back_hypertrophy through machine compound. Stimulus quality matters more than exercise novelty. | fixed reps because productive/balanced: 10 reps. | keep load using owned load: Keep the load. | 2-4 set range; Stimulus achieved. Move on. |
| Lat Pulldown | lat_hypertrophy | machine_compound | 10 reps. | Keep the load. | Stimulus achieved. Move on. | Lat Pulldown delivers lat_hypertrophy via machine compound: Deliver lat_hypertrophy through machine compound. Stimulus quality matters more than exercise novelty. | fixed reps because productive/balanced: 10 reps. | keep load using owned load: Keep the load. | 2-4 set range; Stimulus achieved. Move on. |
| Cable Curl | biceps_hypertrophy | cable | 10 reps. | Keep the load. | One more productive set. | Cable Curl delivers biceps_hypertrophy via cable: Deliver biceps_hypertrophy through cable. Stimulus quality matters more than exercise novelty. | fixed reps because productive/balanced: 10 reps. | keep load using owned load: Keep the load. | 2-5 set range; One more productive set. |
| Chest Supported Row | horizontal_pull_strength | machine_compound | 10 reps. | Keep the load. | One more productive set. | Chest Supported Row delivers horizontal_pull_strength via machine compound: Deliver horizontal_pull_strength through machine compound. | fixed reps because productive/balanced: 10 reps. | keep load using owned load: Keep the load. | 2-4 set range; One more productive set. |
| Cable Crunch | abdominal_hypertrophy | machine_compound | 10 reps. | Keep the load. | One more productive set. | Cable Crunch delivers abdominal_hypertrophy via machine compound: Deliver abdominal_hypertrophy through machine compound. Stimulus quality matters more than exercise novelty. | fixed reps because productive/balanced: 10 reps. | keep load using owned load: Keep the load. | 2-5 set range; One more productive set. |

#### Hypertrophy Legs Quality

- Session: legs, accumulation
- Cycle: build_quality_volume; maintain
- Stimulus: Prioritise quality muscle stimulus.
- Delivery: Deliver high-quality stimulus efficiently.
- Confidence: 82%
- Flags: lack_of_variety

| Exercise | Stimulus | Delivery | Reps | Load | Sets | Why selected | Why reps | Why load | Why sets |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Leg Press | quad_hypertrophy | machine_compound | 10 reps. | Keep the load. | Stimulus achieved. Move on. | Leg Press delivers quad_hypertrophy via machine compound: Deliver quad_hypertrophy through machine compound. Stimulus quality matters more than exercise novelty. | fixed reps because productive/balanced: 10 reps. | keep load using owned load: Keep the load. | 2-4 set range; Stimulus achieved. Move on. |
| Hamstring Curl | hamstring_hypertrophy | machine_compound | 10 reps. | Keep the load. | One more productive set. | Hamstring Curl delivers hamstring_hypertrophy via machine compound: Deliver hamstring_hypertrophy through machine compound. Stimulus quality matters more than exercise novelty. | fixed reps because productive/balanced: 10 reps. | keep load using owned load: Keep the load. | 2-5 set range; One more productive set. |
| Hip Thrust | glute_hypertrophy | machine_compound | 8 controlled reps. | Keep the load. | One more productive set. | Hip Thrust delivers glute_hypertrophy via machine compound: Deliver glute_hypertrophy through machine compound. Stimulus quality matters more than exercise novelty. | fixed reps because productive/balanced: 8 controlled reps. | keep load using owned load: Keep the load. | 2-4 set range; One more productive set. |
| Calf Raise | calf_hypertrophy | machine_compound | 10 reps. | Keep the load. | One more productive set. | Calf Raise delivers calf_hypertrophy via machine compound: Deliver calf_hypertrophy through machine compound. Stimulus quality matters more than exercise novelty. | fixed reps because productive/balanced: 10 reps. | keep load using owned load: Keep the load. | 2-5 set range; One more productive set. |
| Cable Crunch | abdominal_hypertrophy | machine_compound | 10 reps. | Keep the load. | One more productive set. | Cable Crunch delivers abdominal_hypertrophy via machine compound: Deliver abdominal_hypertrophy through machine compound. Stimulus quality matters more than exercise novelty. | fixed reps because productive/balanced: 10 reps. | keep load using owned load: Keep the load. | 2-5 set range; One more productive set. |

#### Hypertrophy Limited Recovery

- Session: upper, intensification
- Cycle: progress_quality_work; maintain
- Stimulus: Prioritise quality muscle stimulus.
- Delivery: Deliver required stimulus with lower-risk options.
- Confidence: 78%
- Flags: lack_of_variety

| Exercise | Stimulus | Delivery | Reps | Load | Sets | Why selected | Why reps | Why load | Why sets |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Cable Fly | chest_hypertrophy | cable | 10 reps. | Keep the load. | Stimulus achieved. Move on. | Cable Fly delivers chest_hypertrophy via cable: Deliver chest_hypertrophy through cable. Stimulus quality matters more than exercise novelty. Known limitations constrain delivery choice. | fixed reps because productive/balanced: 10 reps. | keep load using owned load: Keep the load. | 2-5 set range; Stimulus achieved. Move on. |
| Triceps Pushdown | triceps_hypertrophy | cable | 10 reps. | Keep the load. | One more productive set. | Triceps Pushdown delivers triceps_hypertrophy via cable: Deliver triceps_hypertrophy through cable. Stimulus quality matters more than exercise novelty. Known limitations constrain delivery choice. | fixed reps because productive/balanced: 10 reps. | keep load using owned load: Keep the load. | 2-5 set range; One more productive set. |
| Lateral Raise | lateral_delt_hypertrophy | cable | 10 reps. | Keep the load. | One more productive set. | Lateral Raise delivers lateral_delt_hypertrophy via cable: Deliver lateral_delt_hypertrophy through cable. Stimulus quality matters more than exercise novelty. Known limitations constrain delivery choice. | fixed reps because productive/balanced: 10 reps. | keep load using owned load: Keep the load. | 2-5 set range; One more productive set. |
| Incline Dumbbell Press | upper_chest_hypertrophy | cable | 8 reps. | Keep the load. | One more productive set. | Incline Dumbbell Press delivers upper_chest_hypertrophy via cable: Deliver upper_chest_hypertrophy through cable. Stimulus quality matters more than exercise novelty. Known limitations constrain delivery choice. | fixed reps because productive/tension: 8 reps. | keep load using owned load: Keep the load. | 2-4 set range; One more productive set. |
| Machine Shoulder Press | front_delt_hypertrophy | cable | 8 reps. | Keep the load. | One more productive set. | Machine Shoulder Press delivers front_delt_hypertrophy via cable: Deliver front_delt_hypertrophy through cable. Stimulus quality matters more than exercise novelty. Known limitations constrain delivery choice. | fixed reps because productive/tension: 8 reps. | keep load using owned load: Keep the load. | 2-4 set range; One more productive set. |
| Technique Practice | technical_practice | skill_movement | Hold the target time. | Use bodyweight or duration. | One more productive set. | Technique Practice delivers technical_practice via skill movement: Deliver technical_practice through skill movement. Known limitations constrain delivery choice. | duration hold because productive/tension: Hold the target time. | no external load using bodyweight or duration: Use bodyweight or duration. | 2-4 set range; One more productive set. |

#### Hypertrophy Deload

- Session: full_body, deload
- Cycle: recover; conserve
- Stimulus: Recovery and movement quality.
- Delivery: Deliver high-quality stimulus efficiently.
- Confidence: 85%
- Flags: none

| Exercise | Stimulus | Delivery | Reps | Load | Sets | Why selected | Why reps | Why load | Why sets |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Recovery Movement | recovery_stimulus | bodyweight | Hold the target time. | Use bodyweight or duration. | Max sets reached. | Recovery Movement delivers recovery_stimulus via bodyweight: Deliver recovery_stimulus through bodyweight. | duration hold because recovery/recovery: Hold the target time. | no external load using bodyweight or duration: Use bodyweight or duration. | 2-2 set range; Max sets reached. |
| Technique Practice | technical_practice | skill_movement | Hold the target time. | Use bodyweight or duration. | Max sets reached. | Technique Practice delivers technical_practice via skill movement: Deliver technical_practice through skill movement. | duration hold because recovery/recovery: Hold the target time. | no external load using bodyweight or duration: Use bodyweight or duration. | 2-2 set range; Max sets reached. |
| Low Stress Circuit | low_stress_movement | machine_compound | Hold the target time. | Use bodyweight or duration. | Max sets reached. | Low Stress Circuit delivers low_stress_movement via machine compound: Deliver low_stress_movement through machine compound. | duration hold because recovery/recovery: Hold the target time. | no external load using bodyweight or duration: Use bodyweight or duration. | 2-2 set range; Max sets reached. |

### build_muscle_strength

#### Build Muscle + Strength Upper Anchor

- Session: upper, accumulation
- Cycle: build_muscle_and_strength; maintain
- Stimulus: Blend heavy anchors with quality volume.
- Delivery: Preserve anchors and control fatigue.
- Confidence: 82%
- Flags: none

| Exercise | Stimulus | Delivery | Reps | Load | Sets | Why selected | Why reps | Why load | Why sets |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Competition Bench Press | competition_bench_strength | competition_lift | 8 reps. | Keep the load. | Stimulus achieved. Move on. | Competition Bench Press delivers competition_bench_strength via competition lift: Deliver competition_bench_strength through competition lift. Specificity is protected. | fixed reps because productive/tension: 8 reps. | keep load using owned load: Keep the load. | 2-3 set range; Stimulus achieved. Move on. |
| Chest Press | chest_hypertrophy | machine_compound | 10 reps. | Keep the load. | Stimulus achieved. Move on. | Chest Press delivers chest_hypertrophy via machine compound: Deliver chest_hypertrophy through machine compound. Stimulus quality matters more than exercise novelty. | fixed reps because productive/balanced: 10 reps. | keep load using owned load: Keep the load. | 2-4 set range; Stimulus achieved. Move on. |
| Triceps Pushdown | triceps_hypertrophy | cable | 10 reps. | Keep the load. | One more productive set. | Triceps Pushdown delivers triceps_hypertrophy via cable: Deliver triceps_hypertrophy through cable. Stimulus quality matters more than exercise novelty. | fixed reps because productive/balanced: 10 reps. | keep load using owned load: Keep the load. | 2-5 set range; One more productive set. |
| Chest Supported Row | upper_back_hypertrophy | machine_compound | 10 reps. | Keep the load. | One more productive set. | Chest Supported Row delivers upper_back_hypertrophy via machine compound: Deliver upper_back_hypertrophy through machine compound. Stimulus quality matters more than exercise novelty. | fixed reps because productive/balanced: 10 reps. | keep load using owned load: Keep the load. | 2-4 set range; One more productive set. |
| Lateral Raise | lateral_delt_hypertrophy | cable | 10 reps. | Keep the load. | One more productive set. | Lateral Raise delivers lateral_delt_hypertrophy via cable: Deliver lateral_delt_hypertrophy through cable. Stimulus quality matters more than exercise novelty. | fixed reps because productive/balanced: 10 reps. | keep load using owned load: Keep the load. | 2-5 set range; One more productive set. |
| Cable Crunch | abdominal_hypertrophy | cable | 10 reps. | Keep the load. | One more productive set. | Cable Crunch delivers abdominal_hypertrophy via cable: Deliver abdominal_hypertrophy through cable. Stimulus quality matters more than exercise novelty. | fixed reps because productive/balanced: 10 reps. | keep load using owned load: Keep the load. | 2-5 set range; One more productive set. |

#### Build Muscle + Strength Lower Anchor

- Session: lower, accumulation
- Cycle: build_muscle_and_strength; maintain
- Stimulus: Blend heavy anchors with quality volume.
- Delivery: Preserve anchors and control fatigue.
- Confidence: 82%
- Flags: none

| Exercise | Stimulus | Delivery | Reps | Load | Sets | Why selected | Why reps | Why load | Why sets |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Competition Squat | competition_squat_strength | competition_lift | 8 reps. | Keep the load. | Stimulus achieved. Save energy for the next lift. | Competition Squat delivers competition_squat_strength via competition lift: Deliver competition_squat_strength through competition lift. Specificity is protected. | fixed reps because productive/tension: 8 reps. | keep load using owned load: Keep the load. | 2-3 set range; Stimulus achieved. Save energy for the next lift. |
| Competition Deadlift | competition_deadlift_strength | competition_lift | 5 reps. | Keep the load. | Stimulus achieved. Save energy for the next lift. | Competition Deadlift delivers competition_deadlift_strength via competition lift: Deliver competition_deadlift_strength through competition lift. Specificity is protected. | fixed reps because productive/tension: 5 reps. | keep load using owned load: Keep the load. | 2-3 set range; Stimulus achieved. Save energy for the next lift. |
| Leg Press | quad_hypertrophy | machine_compound | 8 reps. | Keep the load. | Stimulus achieved. Move on. | Leg Press delivers quad_hypertrophy via machine compound: Deliver quad_hypertrophy through machine compound. Stimulus quality matters more than exercise novelty. | fixed reps because productive/tension: 8 reps. | keep load using owned load: Keep the load. | 2-4 set range; Stimulus achieved. Move on. |
| Hamstring Curl | hamstring_hypertrophy | machine_compound | 10 reps. | Keep the load. | One more productive set. | Hamstring Curl delivers hamstring_hypertrophy via machine compound: Deliver hamstring_hypertrophy through machine compound. Stimulus quality matters more than exercise novelty. | fixed reps because productive/balanced: 10 reps. | keep load using owned load: Keep the load. | 2-5 set range; One more productive set. |
| Hip Thrust | glute_hypertrophy | machine_compound | 5 reps. | Keep the load. | One more productive set. | Hip Thrust delivers glute_hypertrophy via machine compound: Deliver glute_hypertrophy through machine compound. Stimulus quality matters more than exercise novelty. | fixed reps because productive/tension: 5 reps. | keep load using owned load: Keep the load. | 2-4 set range; One more productive set. |
| Lateral Raise | lateral_delt_hypertrophy | cable | 10 reps. | Keep the load. | One more productive set. | Lateral Raise delivers lateral_delt_hypertrophy via cable: Deliver lateral_delt_hypertrophy through cable. Stimulus quality matters more than exercise novelty. | fixed reps because productive/balanced: 10 reps. | keep load using owned load: Keep the load. | 2-5 set range; One more productive set. |

#### Build Muscle + Strength Intensification

- Session: full_body, intensification
- Cycle: build_muscle_and_strength; spend
- Stimulus: Blend heavy anchors with quality volume.
- Delivery: Preserve anchors and control fatigue.
- Confidence: 84%
- Flags: lack_of_variety

| Exercise | Stimulus | Delivery | Reps | Load | Sets | Why selected | Why reps | Why load | Why sets |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Competition Squat | competition_squat_strength | competition_lift | 5 reps. | Small load increase. | Stimulus achieved. Save energy for the next lift. | Competition Squat delivers competition_squat_strength via competition lift: Deliver competition_squat_strength through competition lift. Specificity is protected. | fixed reps because productive/tension: 5 reps. | increase load using small progression: Small load increase. | 2-3 set range; Stimulus achieved. Save energy for the next lift. |
| Competition Bench Press | competition_bench_strength | competition_lift | 5 reps. | Small load increase. | Stimulus achieved. Move on. | Competition Bench Press delivers competition_bench_strength via competition lift: Deliver competition_bench_strength through competition lift. Specificity is protected. | fixed reps because productive/tension: 5 reps. | increase load using small progression: Small load increase. | 2-3 set range; Stimulus achieved. Move on. |
| Chest Press | chest_hypertrophy | machine_compound | 10 reps. | Small load increase. | Stimulus achieved. Move on. | Chest Press delivers chest_hypertrophy via machine compound: Deliver chest_hypertrophy through machine compound. Stimulus quality matters more than exercise novelty. | fixed reps because productive/balanced: 10 reps. | increase load using small progression: Small load increase. | 2-4 set range; Stimulus achieved. Move on. |
| Chest Supported Row | upper_back_hypertrophy | machine_compound | 10 reps. | Small load increase. | One more productive set. | Chest Supported Row delivers upper_back_hypertrophy via machine compound: Deliver upper_back_hypertrophy through machine compound. Stimulus quality matters more than exercise novelty. | fixed reps because productive/balanced: 10 reps. | increase load using small progression: Small load increase. | 2-4 set range; One more productive set. |
| Leg Press | quad_hypertrophy | machine_compound | 5 reps. | Small load increase. | One more productive set. | Leg Press delivers quad_hypertrophy via machine compound: Deliver quad_hypertrophy through machine compound. Stimulus quality matters more than exercise novelty. | fixed reps because productive/tension: 5 reps. | increase load using small progression: Small load increase. | 2-4 set range; One more productive set. |
| Hamstring Curl | hamstring_hypertrophy | machine_compound | 10 reps. | Small load increase. | One more productive set. | Hamstring Curl delivers hamstring_hypertrophy via machine compound: Deliver hamstring_hypertrophy through machine compound. Stimulus quality matters more than exercise novelty. | fixed reps because productive/tension: 10 reps. | increase load using small progression: Small load increase. | 2-5 set range; One more productive set. |

#### Build Muscle + Strength Peak Bench

- Session: upper, peak
- Cycle: express_strength; conserve
- Stimulus: Conserve stress while preserving key stimulus.
- Delivery: Preserve anchors and control fatigue.
- Confidence: 81%
- Flags: none

| Exercise | Stimulus | Delivery | Reps | Load | Sets | Why selected | Why reps | Why load | Why sets |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Competition Bench Press | competition_bench_strength | competition_lift | 2 reps. | Keep the load. | Stimulus achieved. Move on. | Competition Bench Press delivers competition_bench_strength via competition lift: Deliver competition_bench_strength through competition lift. Specificity is protected. | fixed reps because performance/peak: 2 reps. | keep load using peak specific load: Keep the load. | 2-4 set range; Stimulus achieved. Move on. |
| Cable Fly | chest_hypertrophy | cable | 3 reps. | Keep the load. | One more productive set. | Cable Fly delivers chest_hypertrophy via cable: Deliver chest_hypertrophy through cable. Stimulus quality matters more than exercise novelty. | fixed reps because performance/peak: 3 reps. | keep load using peak specific load: Keep the load. | 2-5 set range; One more productive set. |
| Triceps Pushdown | triceps_hypertrophy | cable | 3 reps. | Keep the load. | One more productive set. | Triceps Pushdown delivers triceps_hypertrophy via cable: Deliver triceps_hypertrophy through cable. Stimulus quality matters more than exercise novelty. | fixed reps because performance/peak: 3 reps. | keep load using peak specific load: Keep the load. | 2-5 set range; One more productive set. |
| Cable Row | upper_back_hypertrophy | cable | 3 reps. | Keep the load. | One more productive set. | Cable Row delivers upper_back_hypertrophy via cable: Deliver upper_back_hypertrophy through cable. Stimulus quality matters more than exercise novelty. | fixed reps because performance/peak: 3 reps. | keep load using peak specific load: Keep the load. | 2-4 set range; One more productive set. |

#### Build Muscle + Strength Time Limited

- Session: full_body, accumulation
- Cycle: build_muscle_and_strength; maintain
- Stimulus: Blend heavy anchors with quality volume.
- Delivery: Deliver required stimulus with lower-risk options.
- Confidence: 81%
- Flags: none

| Exercise | Stimulus | Delivery | Reps | Load | Sets | Why selected | Why reps | Why load | Why sets |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Competition Squat | competition_squat_strength | competition_lift | 8 reps. | Keep the load. | Stimulus achieved. Save energy for the next lift. | Competition Squat delivers competition_squat_strength via competition lift: Deliver competition_squat_strength through competition lift. Specificity is protected. Known limitations constrain delivery choice. | fixed reps because productive/tension: 8 reps. | keep load using owned load: Keep the load. | 2-3 set range; Stimulus achieved. Save energy for the next lift. |
| Competition Bench Press | competition_bench_strength | competition_lift | 8 reps. | Keep the load. | One more productive set. | Competition Bench Press delivers competition_bench_strength via competition lift: Deliver competition_bench_strength through competition lift. Specificity is protected. Known limitations constrain delivery choice. | fixed reps because productive/tension: 8 reps. | keep load using owned load: Keep the load. | 2-3 set range; One more productive set. |
| Chest Press | chest_hypertrophy | machine_compound | 10 reps. | Keep the load. | One more productive set. | Chest Press delivers chest_hypertrophy via machine compound: Deliver chest_hypertrophy through machine compound. Stimulus quality matters more than exercise novelty. Known limitations constrain delivery choice. | fixed reps because productive/balanced: 10 reps. | keep load using owned load: Keep the load. | 2-4 set range; One more productive set. |
| Chest Supported Row | upper_back_hypertrophy | machine_compound | 10 reps. | Keep the load. | One more productive set. | Chest Supported Row delivers upper_back_hypertrophy via machine compound: Deliver upper_back_hypertrophy through machine compound. Stimulus quality matters more than exercise novelty. Known limitations constrain delivery choice. | fixed reps because productive/balanced: 10 reps. | keep load using owned load: Keep the load. | 2-4 set range; One more productive set. |

### athletic_performance

#### Athletic Power Session

- Session: power, accumulation
- Cycle: build_strength_capacity; spend
- Stimulus: Prioritise power and movement quality.
- Delivery: Protect power and movement quality.
- Confidence: 81%
- Flags: lack_of_variety

| Exercise | Stimulus | Delivery | Reps | Load | Sets | Why selected | Why reps | Why load | Why sets |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Box Jump | lower_body_power | power_movement | 3 fast reps. | Preserve speed and quality. | Stimulus achieved. Move on. | Box Jump delivers lower_body_power via power movement: Deliver lower_body_power through power movement. Power stimulus requires explosive, low-fatigue delivery. | fixed reps because productive/speed_power: 3 fast reps. | keep load using power quality load: Preserve speed and quality. | 2-4 set range; Stimulus achieved. Move on. |
| Speed Squat | speed_strength | power_movement | 2 fast reps. | Preserve speed and quality. | Stimulus achieved. Move on. | Speed Squat delivers speed_strength via power movement: Deliver speed_strength through power movement. Power stimulus requires explosive, low-fatigue delivery. | fixed reps because productive/speed_power: 2 fast reps. | keep load using power quality load: Preserve speed and quality. | 2-4 set range; Stimulus achieved. Move on. |
| Medicine Ball Throw | upper_body_power | power_movement | 3 fast reps. | Preserve speed and quality. | One more productive set. | Medicine Ball Throw delivers upper_body_power via power movement: Deliver upper_body_power through power movement. Power stimulus requires explosive, low-fatigue delivery. | fixed reps because productive/speed_power: 3 fast reps. | keep load using power quality load: Preserve speed and quality. | 2-4 set range; One more productive set. |
| Landing Skill Drill | landing_skill | skill_movement | Hold the target time. | Use bodyweight or duration. | One more productive set. | Landing Skill Drill delivers landing_skill via skill movement: Deliver landing_skill through skill movement. | duration hold because productive/balanced: Hold the target time. | no external load using bodyweight or duration: Use bodyweight or duration. | 2-4 set range; One more productive set. |
| Farmer Carry | trunk_stiffness | skill_movement | Carry for time. | Keep the load. | One more productive set. | Farmer Carry delivers trunk_stiffness via skill movement: Deliver trunk_stiffness through skill movement. | duration carry because productive/balanced: Carry for time. | keep load using owned load: Keep the load. | 2-4 set range; One more productive set. |

#### Athletic Peak Power

- Session: power, peak
- Cycle: express_power; conserve
- Stimulus: Conserve stress while preserving key stimulus.
- Delivery: Protect power and movement quality.
- Confidence: 81%
- Flags: none

| Exercise | Stimulus | Delivery | Reps | Load | Sets | Why selected | Why reps | Why load | Why sets |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Box Jump | lower_body_power | power_movement | 3 fast reps. | Preserve speed and quality. | Stimulus achieved. Move on. | Box Jump delivers lower_body_power via power movement: Deliver lower_body_power through power movement. Power stimulus requires explosive, low-fatigue delivery. | fixed reps because performance/peak: 3 fast reps. | keep load using power quality load: Preserve speed and quality. | 2-4 set range; Stimulus achieved. Move on. |
| Speed Squat | speed_strength | power_movement | 2 fast reps. | Preserve speed and quality. | Stimulus achieved. Move on. | Speed Squat delivers speed_strength via power movement: Deliver speed_strength through power movement. Power stimulus requires explosive, low-fatigue delivery. | fixed reps because performance/peak: 2 fast reps. | keep load using power quality load: Preserve speed and quality. | 2-4 set range; Stimulus achieved. Move on. |
| Medicine Ball Throw | upper_body_power | power_movement | 3 fast reps. | Preserve speed and quality. | One more productive set. | Medicine Ball Throw delivers upper_body_power via power movement: Deliver upper_body_power through power movement. Power stimulus requires explosive, low-fatigue delivery. | fixed reps because performance/peak: 3 fast reps. | keep load using power quality load: Preserve speed and quality. | 2-4 set range; One more productive set. |
| Landing Skill Drill | landing_skill | skill_movement | Hold the target time. | Use bodyweight or duration. | One more productive set. | Landing Skill Drill delivers landing_skill via skill movement: Deliver landing_skill through skill movement. | duration hold because performance/peak: Hold the target time. | no external load using bodyweight or duration: Use bodyweight or duration. | 2-4 set range; One more productive set. |
| Farmer Carry | trunk_stiffness | skill_movement | Carry for time. | Keep the load. | One more productive set. | Farmer Carry delivers trunk_stiffness via skill movement: Deliver trunk_stiffness through skill movement. | duration carry because performance/peak: Carry for time. | keep load using peak specific load: Keep the load. | 2-4 set range; One more productive set. |

#### Athletic Strength Support

- Session: full_body, intensification
- Cycle: increase_specificity; maintain
- Stimulus: Prioritise power and movement quality.
- Delivery: Protect power and movement quality.
- Confidence: 80%
- Flags: none

| Exercise | Stimulus | Delivery | Reps | Load | Sets | Why selected | Why reps | Why load | Why sets |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Speed Squat | speed_strength | power_movement | 2 fast reps. | Preserve speed and quality. | Stimulus achieved. Move on. | Speed Squat delivers speed_strength via power movement: Deliver speed_strength through power movement. Power stimulus requires explosive, low-fatigue delivery. | fixed reps because productive/speed_power: 2 fast reps. | keep load using power quality load: Preserve speed and quality. | 2-4 set range; Stimulus achieved. Move on. |
| Medicine Ball Throw | upper_body_power | power_movement | 3 fast reps. | Preserve speed and quality. | Stimulus achieved. Move on. | Medicine Ball Throw delivers upper_body_power via power movement: Deliver upper_body_power through power movement. Power stimulus requires explosive, low-fatigue delivery. | fixed reps because productive/speed_power: 3 fast reps. | keep load using power quality load: Preserve speed and quality. | 2-4 set range; Stimulus achieved. Move on. |
| Technique Practice | technical_practice | skill_movement | Hold the target time. | Use bodyweight or duration. | One more productive set. | Technique Practice delivers technical_practice via skill movement: Deliver technical_practice through skill movement. | duration hold because productive/balanced: Hold the target time. | no external load using bodyweight or duration: Use bodyweight or duration. | 2-4 set range; One more productive set. |
| Farmer Carry | trunk_stiffness | skill_movement | Carry for time. | Keep the load. | One more productive set. | Farmer Carry delivers trunk_stiffness via skill movement: Deliver trunk_stiffness through skill movement. | duration carry because productive/balanced: Carry for time. | keep load using owned load: Keep the load. | 2-4 set range; One more productive set. |
| Barbell Row | horizontal_pull_strength | heavy_free_weight_compound | 6 quality reps. | Keep the load. | One more productive set. | Barbell Row delivers horizontal_pull_strength via heavy free weight compound: Deliver horizontal_pull_strength through heavy free weight compound. | fixed reps because productive/skill: 6 quality reps. | keep load using owned load: Keep the load. | 2-3 set range; One more productive set. |
| Hip Thrust | glute_hypertrophy | machine_compound | 4 quality reps. | Keep the load. | One more productive set. | Hip Thrust delivers glute_hypertrophy via machine compound: Deliver glute_hypertrophy through machine compound. Stimulus quality matters more than exercise novelty. | fixed reps because productive/skill: 4 quality reps. | keep load using owned load: Keep the load. | 2-4 set range; One more productive set. |

#### Athletic Poor Recovery

- Session: power, accumulation
- Cycle: recover; conserve
- Stimulus: Recovery and movement quality.
- Delivery: Protect power and movement quality.
- Confidence: 84%
- Flags: none

| Exercise | Stimulus | Delivery | Reps | Load | Sets | Why selected | Why reps | Why load | Why sets |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Recovery Movement | recovery_stimulus | bodyweight | Hold the target time. | Use bodyweight or duration. | Max sets reached. | Recovery Movement delivers recovery_stimulus via bodyweight: Deliver recovery_stimulus through bodyweight. | duration hold because recovery/recovery: Hold the target time. | no external load using bodyweight or duration: Use bodyweight or duration. | 2-2 set range; Max sets reached. |
| Technique Practice | technical_practice | bodyweight | Hold the target time. | Use bodyweight or duration. | Max sets reached. | Technique Practice delivers technical_practice via bodyweight: Deliver technical_practice through bodyweight. | duration hold because recovery/recovery: Hold the target time. | no external load using bodyweight or duration: Use bodyweight or duration. | 2-2 set range; Max sets reached. |
| Low Stress Circuit | low_stress_movement | machine_compound | Hold the target time. | Use bodyweight or duration. | Max sets reached. | Low Stress Circuit delivers low_stress_movement via machine compound: Deliver low_stress_movement through machine compound. | duration hold because recovery/recovery: Hold the target time. | no external load using bodyweight or duration: Use bodyweight or duration. | 2-2 set range; Max sets reached. |

#### Athletic Shoulder Managed

- Session: upper, accumulation
- Cycle: build_strength_capacity; maintain
- Stimulus: Prioritise power and movement quality.
- Delivery: Deliver required stimulus with lower-risk options.
- Confidence: 77%
- Flags: none

| Exercise | Stimulus | Delivery | Reps | Load | Sets | Why selected | Why reps | Why load | Why sets |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Speed Squat | speed_strength | power_movement | 2 fast reps. | Preserve speed and quality. | Stimulus achieved. Move on. | Speed Squat delivers speed_strength via power movement: Deliver speed_strength through power movement. Power stimulus requires explosive, low-fatigue delivery. Known limitations constrain delivery choice. | fixed reps because productive/speed_power: 2 fast reps. | keep load using power quality load: Preserve speed and quality. | 2-4 set range; Stimulus achieved. Move on. |
| Medicine Ball Throw | upper_body_power | machine_compound | 3 fast reps. | Preserve speed and quality. | Stimulus achieved. Move on. | Medicine Ball Throw delivers upper_body_power via machine compound: Deliver upper_body_power through machine compound. Power stimulus requires explosive, low-fatigue delivery. Known limitations constrain delivery choice. | fixed reps because productive/speed_power: 3 fast reps. | keep load using power quality load: Preserve speed and quality. | 2-4 set range; Stimulus achieved. Move on. |
| Technique Practice | technical_practice | skill_movement | Hold the target time. | Use bodyweight or duration. | One more productive set. | Technique Practice delivers technical_practice via skill movement: Deliver technical_practice through skill movement. Known limitations constrain delivery choice. | duration hold because productive/balanced: Hold the target time. | no external load using bodyweight or duration: Use bodyweight or duration. | 2-4 set range; One more productive set. |
| Farmer Carry | trunk_stiffness | skill_movement | Carry for time. | Keep the load. | One more productive set. | Farmer Carry delivers trunk_stiffness via skill movement: Deliver trunk_stiffness through skill movement. Known limitations constrain delivery choice. | duration carry because productive/balanced: Carry for time. | keep load using owned load: Keep the load. | 2-4 set range; One more productive set. |
| Barbell Row | horizontal_pull_strength | heavy_free_weight_compound | 6 quality reps. | Keep the load. | One more productive set. | Barbell Row delivers horizontal_pull_strength via heavy free weight compound: Deliver horizontal_pull_strength through heavy free weight compound. Known limitations constrain delivery choice. | fixed reps because productive/skill: 6 quality reps. | keep load using owned load: Keep the load. | 2-3 set range; One more productive set. |
| Hip Thrust | glute_hypertrophy | machine_compound | 4 quality reps. | Keep the load. | One more productive set. | Hip Thrust delivers glute_hypertrophy via machine compound: Deliver glute_hypertrophy through machine compound. Stimulus quality matters more than exercise novelty. Known limitations constrain delivery choice. | fixed reps because productive/skill: 4 quality reps. | keep load using owned load: Keep the load. | 2-4 set range; One more productive set. |

### get_lean

#### Get Lean Full Body

- Session: full_body, accumulation
- Cycle: preserve_performance; conserve
- Stimulus: Conserve stress while preserving key stimulus.
- Delivery: Preserve anchors and control fatigue.
- Confidence: 80%
- Flags: lack_of_variety

| Exercise | Stimulus | Delivery | Reps | Load | Sets | Why selected | Why reps | Why load | Why sets |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Competition Bench Press | competition_bench_strength | competition_lift | 6 controlled reps. | Keep the load. | Stimulus achieved. Move on. | Competition Bench Press delivers competition_bench_strength via competition lift: Deliver competition_bench_strength through competition lift. Specificity is protected. | fixed reps because productive/tension: 6 controlled reps. | keep load using owned load: Keep the load. | 2-4 set range; Stimulus achieved. Move on. |
| Competition Squat | competition_squat_strength | competition_lift | 6 controlled reps. | Keep the load. | Stimulus achieved. Save energy for the next lift. | Competition Squat delivers competition_squat_strength via competition lift: Deliver competition_squat_strength through competition lift. Specificity is protected. | fixed reps because productive/tension: 6 controlled reps. | keep load using owned load: Keep the load. | 2-4 set range; Stimulus achieved. Save energy for the next lift. |
| Cable Row | upper_back_hypertrophy | cable | 10 controlled reps. | Keep the load. | One more productive set. | Cable Row delivers upper_back_hypertrophy via cable: Deliver upper_back_hypertrophy through cable. Stimulus quality matters more than exercise novelty. | fixed reps because productive/balanced: 10 controlled reps. | keep load using owned load: Keep the load. | 2-4 set range; One more productive set. |
| Cable Fly | chest_hypertrophy | cable | 10 controlled reps. | Keep the load. | One more productive set. | Cable Fly delivers chest_hypertrophy via cable: Deliver chest_hypertrophy through cable. Stimulus quality matters more than exercise novelty. | fixed reps because productive/balanced: 10 controlled reps. | keep load using owned load: Keep the load. | 2-5 set range; One more productive set. |
| Leg Press | quad_hypertrophy | cable | 6 controlled reps. | Keep the load. | One more productive set. | Leg Press delivers quad_hypertrophy via cable: Deliver quad_hypertrophy through cable. Stimulus quality matters more than exercise novelty. | fixed reps because productive/tension: 6 controlled reps. | keep load using owned load: Keep the load. | 2-4 set range; One more productive set. |

#### Get Lean Poor Recovery

- Session: full_body, accumulation
- Cycle: recover; conserve
- Stimulus: Recovery and movement quality.
- Delivery: Deliver planned stimuli economically.
- Confidence: 84%
- Flags: none

| Exercise | Stimulus | Delivery | Reps | Load | Sets | Why selected | Why reps | Why load | Why sets |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Recovery Movement | recovery_stimulus | bodyweight | Hold the target time. | Use bodyweight or duration. | Max sets reached. | Recovery Movement delivers recovery_stimulus via bodyweight: Deliver recovery_stimulus through bodyweight. | duration hold because recovery/recovery: Hold the target time. | no external load using bodyweight or duration: Use bodyweight or duration. | 2-2 set range; Max sets reached. |
| Technique Practice | technical_practice | bodyweight | Hold the target time. | Use bodyweight or duration. | Max sets reached. | Technique Practice delivers technical_practice via bodyweight: Deliver technical_practice through bodyweight. | duration hold because recovery/recovery: Hold the target time. | no external load using bodyweight or duration: Use bodyweight or duration. | 2-2 set range; Max sets reached. |
| Low Stress Circuit | low_stress_movement | cable | Hold the target time. | Use bodyweight or duration. | Max sets reached. | Low Stress Circuit delivers low_stress_movement via cable: Deliver low_stress_movement through cable. | duration hold because recovery/recovery: Hold the target time. | no external load using bodyweight or duration: Use bodyweight or duration. | 2-2 set range; Max sets reached. |

#### Get Lean Upper Preserve

- Session: upper, intensification
- Cycle: preserve_performance; maintain
- Stimulus: Preserve performance with recoverable work.
- Delivery: Preserve anchors and control fatigue.
- Confidence: 81%
- Flags: none

| Exercise | Stimulus | Delivery | Reps | Load | Sets | Why selected | Why reps | Why load | Why sets |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Competition Bench Press | competition_bench_strength | competition_lift | 6 controlled reps. | Keep the load. | Stimulus achieved. Move on. | Competition Bench Press delivers competition_bench_strength via competition lift: Deliver competition_bench_strength through competition lift. Specificity is protected. | fixed reps because productive/tension: 6 controlled reps. | keep load using owned load: Keep the load. | 2-3 set range; Stimulus achieved. Move on. |
| Competition Squat | competition_squat_strength | competition_lift | 6 controlled reps. | Keep the load. | Stimulus achieved. Save energy for the next lift. | Competition Squat delivers competition_squat_strength via competition lift: Deliver competition_squat_strength through competition lift. Specificity is protected. | fixed reps because productive/tension: 6 controlled reps. | keep load using owned load: Keep the load. | 2-3 set range; Stimulus achieved. Save energy for the next lift. |
| Chest Supported Row | upper_back_hypertrophy | machine_compound | 10 controlled reps. | Keep the load. | Stimulus achieved. Move on. | Chest Supported Row delivers upper_back_hypertrophy via machine compound: Deliver upper_back_hypertrophy through machine compound. Stimulus quality matters more than exercise novelty. | fixed reps because productive/balanced: 10 controlled reps. | keep load using owned load: Keep the load. | 2-4 set range; Stimulus achieved. Move on. |
| Chest Press | chest_hypertrophy | machine_compound | 10 controlled reps. | Keep the load. | One more productive set. | Chest Press delivers chest_hypertrophy via machine compound: Deliver chest_hypertrophy through machine compound. Stimulus quality matters more than exercise novelty. | fixed reps because productive/balanced: 10 controlled reps. | keep load using owned load: Keep the load. | 2-4 set range; One more productive set. |
| Leg Press | quad_hypertrophy | machine_compound | 6 controlled reps. | Keep the load. | One more productive set. | Leg Press delivers quad_hypertrophy via machine compound: Deliver quad_hypertrophy through machine compound. Stimulus quality matters more than exercise novelty. | fixed reps because productive/tension: 6 controlled reps. | keep load using owned load: Keep the load. | 2-4 set range; One more productive set. |
| Lateral Raise | lateral_delt_hypertrophy | cable | 10 controlled reps. | Keep the load. | One more productive set. | Lateral Raise delivers lateral_delt_hypertrophy via cable: Deliver lateral_delt_hypertrophy through cable. Stimulus quality matters more than exercise novelty. | fixed reps because productive/balanced: 10 controlled reps. | keep load using owned load: Keep the load. | 2-5 set range; One more productive set. |

#### Get Lean Lower Limited

- Session: lower, accumulation
- Cycle: preserve_performance; conserve
- Stimulus: Conserve stress while preserving key stimulus.
- Delivery: Deliver required stimulus with lower-risk options.
- Confidence: 77%
- Flags: none

| Exercise | Stimulus | Delivery | Reps | Load | Sets | Why selected | Why reps | Why load | Why sets |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Competition Bench Press | competition_bench_strength | competition_lift | 6 controlled reps. | Keep the load. | Stimulus achieved. Move on. | Competition Bench Press delivers competition_bench_strength via competition lift: Deliver competition_bench_strength through competition lift. Specificity is protected. Known limitations constrain delivery choice. | fixed reps because productive/recovery: 6 controlled reps. | keep load using owned load: Keep the load. | 2-4 set range; Stimulus achieved. Move on. |
| Competition Squat | competition_squat_strength | machine_compound | 6 controlled reps. | Keep the load. | Stimulus achieved. Save energy for the next lift. | Competition Squat delivers competition_squat_strength via machine compound: Deliver competition_squat_strength through machine compound. Specificity is protected. Known limitations constrain delivery choice. | fixed reps because productive/recovery: 6 controlled reps. | keep load using owned load: Keep the load. | 2-4 set range; Stimulus achieved. Save energy for the next lift. |
| Cable Row | upper_back_hypertrophy | cable | 10 controlled reps. | Keep the load. | One more productive set. | Cable Row delivers upper_back_hypertrophy via cable: Deliver upper_back_hypertrophy through cable. Stimulus quality matters more than exercise novelty. Known limitations constrain delivery choice. | fixed reps because productive/recovery: 10 controlled reps. | keep load using owned load: Keep the load. | 2-4 set range; One more productive set. |
| Cable Fly | chest_hypertrophy | cable | 10 controlled reps. | Keep the load. | One more productive set. | Cable Fly delivers chest_hypertrophy via cable: Deliver chest_hypertrophy through cable. Stimulus quality matters more than exercise novelty. Known limitations constrain delivery choice. | fixed reps because productive/recovery: 10 controlled reps. | keep load using owned load: Keep the load. | 2-5 set range; One more productive set. |
| Leg Press | quad_hypertrophy | cable | 6 controlled reps. | Keep the load. | One more productive set. | Leg Press delivers quad_hypertrophy via cable: Deliver quad_hypertrophy through cable. Stimulus quality matters more than exercise novelty. Known limitations constrain delivery choice. | fixed reps because productive/recovery: 6 controlled reps. | keep load using owned load: Keep the load. | 2-4 set range; One more productive set. |

#### Get Lean Maintenance Week

- Session: full_body, maintenance
- Cycle: preserve_performance; conserve
- Stimulus: Conserve stress while preserving key stimulus.
- Delivery: Preserve anchors and control fatigue.
- Confidence: 81%
- Flags: lack_of_variety

| Exercise | Stimulus | Delivery | Reps | Load | Sets | Why selected | Why reps | Why load | Why sets |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Competition Bench Press | competition_bench_strength | competition_lift | 6 controlled reps. | Keep the load. | Stimulus achieved. Move on. | Competition Bench Press delivers competition_bench_strength via competition lift: Deliver competition_bench_strength through competition lift. Specificity is protected. | fixed reps because productive/tension: 6 controlled reps. | keep load using owned load: Keep the load. | 2-4 set range; Stimulus achieved. Move on. |
| Competition Squat | competition_squat_strength | competition_lift | 6 controlled reps. | Keep the load. | Stimulus achieved. Save energy for the next lift. | Competition Squat delivers competition_squat_strength via competition lift: Deliver competition_squat_strength through competition lift. Specificity is protected. | fixed reps because productive/tension: 6 controlled reps. | keep load using owned load: Keep the load. | 2-4 set range; Stimulus achieved. Save energy for the next lift. |
| Cable Row | upper_back_hypertrophy | cable | 10 controlled reps. | Keep the load. | One more productive set. | Cable Row delivers upper_back_hypertrophy via cable: Deliver upper_back_hypertrophy through cable. Stimulus quality matters more than exercise novelty. | fixed reps because productive/balanced: 10 controlled reps. | keep load using owned load: Keep the load. | 2-4 set range; One more productive set. |
| Cable Fly | chest_hypertrophy | cable | 10 controlled reps. | Keep the load. | One more productive set. | Cable Fly delivers chest_hypertrophy via cable: Deliver chest_hypertrophy through cable. Stimulus quality matters more than exercise novelty. | fixed reps because productive/balanced: 10 controlled reps. | keep load using owned load: Keep the load. | 2-5 set range; One more productive set. |
| Leg Press | quad_hypertrophy | cable | 6 controlled reps. | Keep the load. | One more productive set. | Leg Press delivers quad_hypertrophy via cable: Deliver quad_hypertrophy through cable. Stimulus quality matters more than exercise novelty. | fixed reps because productive/tension: 6 controlled reps. | keep load using owned load: Keep the load. | 2-4 set range; One more productive set. |


## Repeated Exercise Bias

- strength_05_low_back_management: Strength Low Back Managed (repeated_exercise_bias, lack_of_variety, confidence 80%)
- hypertrophy_02_pull: Hypertrophy Pull Quality (repeated_exercise_bias, lack_of_variety, confidence 82%)

## Unnecessary Fatigue

- strength_01_peak_sbd: Strength Peak SBD (unnecessary_fatigue, confidence 85%)
- strength_02_accum_lower: Strength Accumulation Lower (unnecessary_fatigue, confidence 83%)
- strength_03_intensity_upper: Strength Intensification Upper (unnecessary_fatigue, confidence 84%)
- strength_04_deadlift_calibration: Strength Deadlift Calibration (unnecessary_fatigue, low_confidence_session, confidence 73%)

## Poor Specificity

- None flagged.

## Lack of Variety

- strength_05_low_back_management: Strength Low Back Managed (repeated_exercise_bias, lack_of_variety, confidence 80%)
- hypertrophy_02_pull: Hypertrophy Pull Quality (repeated_exercise_bias, lack_of_variety, confidence 82%)
- hypertrophy_03_legs: Hypertrophy Legs Quality (lack_of_variety, confidence 82%)
- hypertrophy_04_limited_recovery: Hypertrophy Limited Recovery (lack_of_variety, confidence 78%)
- bms_03_intensification: Build Muscle + Strength Intensification (lack_of_variety, confidence 84%)
- athletic_01_power: Athletic Power Session (lack_of_variety, confidence 81%)
- lean_01_full_body: Get Lean Full Body (lack_of_variety, confidence 80%)
- lean_05_maintenance: Get Lean Maintenance Week (lack_of_variety, confidence 81%)

## Unnecessary Complexity

- None flagged.

## Verdict

Keep these sessions in review before any production workout-generation wiring.

