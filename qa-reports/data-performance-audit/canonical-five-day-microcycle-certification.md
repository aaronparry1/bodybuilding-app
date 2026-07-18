# Canonical five-day microcycle certification

- Schema: `canonical_five_day_microcycle_certification_v1`
- Profile: Build muscle and strength · intermediate · 5 days · let app choose
- Equipment: barbell, dumbbell, machine, cable, bodyweight
- Accounting: Direct working sets are divided equally across the allocator's explicit direct target muscles. Secondary exercise muscles are listed but are not converted into set equivalents.
- Supported indirect contribution: none quantified without an explicit canonical policy.

## Week

- Direct-set target bands: chest 6-16 · back 6-16 · quads 6-16 · hamstrings 6-16 · glutes 6-16 · shoulders 4-14 · triceps 4-14 · biceps 4-14 · calves 4-14 · abs 2-6
- Direct sets: chest 10 · shoulders 5 · triceps 4 · quads 8.5 · glutes 6.5 · hamstrings 6 · calves 4 · back 9 · biceps 4 · abs 2
- Movement exposures: horizontal_push 3 · vertical_push 1 · isolation 9 · squat 3 · hinge 1 · horizontal_pull 2 · vertical_pull 1 · hip_thrust 1 · core 1
- Primary lifts: bench 1 · squat 1 · deadlift 1
- Session working sets: 12 / 11 / 12 / 12 / 12 (total 59)
- Estimated minutes: 44 / 41 / 44 / 44 / 44
- Fatigue units: 26 / 22 / 23 / 18 / 18 (total 107); overlap flags: none
- Certification checks: exact_working_sets_resolved · session_volume_bounded · session_duration_bounded · slot_targets_resolved · bench_exposure_present · squat_exposure_present · deadlift_exposure_present · weekly_overlap_bounded · chest_volume_authorised · back_volume_authorised · quads_volume_authorised · hamstrings_volume_authorised · glutes_volume_authorised · shoulders_volume_authorised · triceps_volume_authorised · biceps_volume_authorised · calves_volume_authorised · abs_volume_authorised · frequency_matches_profile
- Certification failures: none

## 1. Bench and hypertrophy

Purpose: Establish repeatable squat, bench and deadlift. Estimated duration: 44 minutes.

| # | Exercise | Slot / compatibility | Movement | Primary / secondary | Sets | Exact targets | Load | Rest | Est. min | Fatigue |
|---:|---|---|---|---|---:|---|---|---:|---:|---|
| 1 | Bench Press (`ex-bench-press`) | bench strength exposure; horizontal_push serves chest | horizontal_push | chest / triceps, shoulders | 4 | 10 reps / 10 reps / 10 reps / 10 reps | calibration_required | 180s | 12 | high |
| 2 | Decline Barbell Bench (`ex-decline-barbell-bench`) | chest hypertrophy; horizontal_push serves chest | horizontal_push | chest / triceps, shoulders | 3 | 10 reps / 10 reps / 10 reps | calibration_required | 105s | 9 | moderate |
| 3 | Arnold Press (`ex-arnold-press`) | shoulder support; vertical_push serves shoulders | vertical_push | shoulders / triceps | 3 | 10 reps / 10 reps / 10 reps | calibration_required | 105s | 9 | moderate |
| 4 | Rope Overhead Triceps Extension (`ex-cable-rope-overhead-extension`) | triceps support; isolation serves triceps | isolation | triceps / none | 2 | 14 reps / 14 reps | calibration_required | 75s | 6 | low |

## 2. Squat and hypertrophy

Purpose: Establish repeatable squat, bench and deadlift. Estimated duration: 41 minutes.

| # | Exercise | Slot / compatibility | Movement | Primary / secondary | Sets | Exact targets | Load | Rest | Est. min | Fatigue |
|---:|---|---|---|---|---:|---|---|---:|---:|---|
| 1 | Barbell Back Squat (`ex-barbell-back-squat`) | squat strength exposure; squat serves quads | squat | quads, glutes / hamstrings, adductors | 4 | 10 reps / 10 reps / 10 reps / 10 reps | calibration_required | 180s | 12 | high |
| 2 | Anderson Squat (`ex-anderson-squat`) | quadriceps hypertrophy; squat serves quads+glutes | squat | quads, glutes / hamstrings, adductors, abs | 3 | 10 reps / 10 reps / 10 reps | calibration_required | 105s | 9 | moderate |
| 3 | Nordic Curl (`ex-nordic-curl`) | hamstring support; isolation serves hamstrings | isolation | hamstrings / glutes | 2 | 14 reps / 14 reps | bodyweight | 105s | 6 | moderate |
| 4 | Donkey Calf Raise (`ex-donkey-calf-raise`) | calf work; isolation serves calves | isolation | calves / none | 2 | 14 reps / 14 reps | calibration_required | 75s | 6 | low |

## 3. Deadlift and back

Purpose: Establish repeatable squat, bench and deadlift. Estimated duration: 44 minutes.

| # | Exercise | Slot / compatibility | Movement | Primary / secondary | Sets | Exact targets | Load | Rest | Est. min | Fatigue |
|---:|---|---|---|---|---:|---|---|---:|---:|---|
| 1 | Deadlift (`ex-deadlift`) | deadlift/hinge exposure; hinge serves hamstrings+glutes | hinge | hamstrings, glutes, back / quads, traps, forearms | 4 | 10 reps / 10 reps / 10 reps / 10 reps | calibration_required | 180s | 12 | high |
| 2 | Chest Supported Row (`ex-chest-supported-row`) | back thickness; horizontal_pull serves back | horizontal_pull | back / biceps | 3 | 10 reps / 10 reps / 10 reps | calibration_required | 105s | 9 | moderate |
| 3 | Dumbbell Pullover (`ex-dumbbell-pullover`) | lat volume; vertical_pull serves back | vertical_pull | back / chest, triceps | 3 | 14 reps / 14 reps / 14 reps | calibration_required | 105s | 9 | moderate |
| 4 | Barbell Curl (`ex-barbell-curl`) | elbow-flexor support; isolation serves biceps | isolation | biceps / forearms | 2 | 14 reps / 14 reps | calibration_required | 75s | 6 | low |

## 4. Upper support

Purpose: Establish repeatable squat, bench and deadlift. Estimated duration: 44 minutes.

| # | Exercise | Slot / compatibility | Movement | Primary / secondary | Sets | Exact targets | Load | Rest | Est. min | Fatigue |
|---:|---|---|---|---|---:|---|---|---:|---:|---|
| 1 | Decline Barbell Bench (`ex-decline-barbell-bench`) | second press exposure; horizontal_push serves chest | horizontal_push | chest / triceps, shoulders | 3 | 10 reps / 10 reps / 10 reps | calibration_required | 105s | 9 | moderate |
| 2 | Chest Supported Row (`ex-chest-supported-row`) | second pull exposure; horizontal_pull serves back | horizontal_pull | back / biceps | 3 | 10 reps / 10 reps / 10 reps | calibration_required | 105s | 9 | moderate |
| 3 | Cable Front Raise (`ex-cable-front-raise`) | side/rear delt work; isolation serves shoulders | isolation | shoulders / none | 2 | 14 reps / 14 reps | calibration_required | 75s | 6 | low |
| 4 | Rope Overhead Triceps Extension (`ex-cable-rope-overhead-extension`) | triceps volume; isolation serves triceps | isolation | triceps / none | 2 | 14 reps / 14 reps | calibration_required | 75s | 6 | low |
| 5 | Barbell Curl (`ex-barbell-curl`) | biceps volume; isolation serves biceps | isolation | biceps / forearms | 2 | 14 reps / 14 reps | calibration_required | 75s | 6 | low |

## 5. Lower support

Purpose: Establish repeatable squat, bench and deadlift. Estimated duration: 44 minutes.

| # | Exercise | Slot / compatibility | Movement | Primary / secondary | Sets | Exact targets | Load | Rest | Est. min | Fatigue |
|---:|---|---|---|---|---:|---|---|---:|---:|---|
| 1 | Hack Squat Machine (`ex-hack-squat-machine`) | second knee-dominant exposure; squat serves quads | squat | quads / glutes | 3 | 10 reps / 10 reps / 10 reps | calibration_required | 105s | 9 | moderate |
| 2 | Nordic Curl (`ex-nordic-curl`) | second hamstring exposure; isolation serves hamstrings | isolation | hamstrings / glutes | 2 | 14 reps / 14 reps | bodyweight | 105s | 6 | moderate |
| 3 | Hip Thrust Machine (`ex-hip-thrust-machine`) | glute volume; hip_thrust serves glutes | hip_thrust | glutes / hamstrings | 3 | 10 reps / 10 reps / 10 reps | calibration_required | 105s | 9 | moderate |
| 4 | Donkey Calf Raise (`ex-donkey-calf-raise`) | calf volume; isolation serves calves | isolation | calves / none | 2 | 14 reps / 14 reps | calibration_required | 75s | 6 | low |
| 5 | Cable Crunch (`ex-cable-crunch`) | trunk work; core serves abs | core | abs / none | 2 | 14 reps / 14 reps | calibration_required | 105s | 6 | moderate |

Final status: **PASSED**
