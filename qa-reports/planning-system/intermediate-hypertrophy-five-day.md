# Intermediate Hypertrophy Five Day

Generated from `canonical_adaptive_planning_certification_v1`. This report is evidence, not a second planning authority.

```json
{
  "schemaVersion": "canonical_adaptive_planning_certification_v1",
  "profile": {
    "goal": "build_muscle",
    "experience": "intermediate",
    "frequency": 5,
    "equipment": [
      "barbell",
      "dumbbell",
      "machine",
      "cable",
      "bodyweight"
    ]
  },
  "cases": [
    {
      "id": "intermediate-hypertrophy-5-push_pull_legs-calibration",
      "label": "Intermediate Hypertrophy · 5 days · Push/Pull/Legs · no established history",
      "status": "constructed",
      "input": {
        "goal": "build_muscle",
        "experience": "intermediate",
        "frequency": 5,
        "requestedFramework": "push_pull_legs",
        "equipment": [
          "barbell",
          "dumbbell",
          "machine",
          "cable",
          "bodyweight"
        ],
        "availableSessionMinutes": 75,
        "establishedHistory": false
      },
      "authority": {
        "macrocycle": "cert-intermediate-hypertrophy-5-push_pull_legs-calibration:macrocycle",
        "mesocycle": "hypertrophy_calibration",
        "microcycle": "cert-intermediate-hypertrophy-5-push_pull_legs-calibration:microcycle:1",
        "sessionConstruction": "canonical_plan_v3",
        "prescriptionPolicy": "mesocycle_prescription_policy_v1",
        "rationale": {
          "schemaVersion": "canonical_planning_rationale_v1",
          "goalStrategyId": "canonical_goal_hypertrophy_v1",
          "rotationReasons": [
            "framework:push_pull_legs",
            "framework_reason:explicit_supported_preference",
            "goal_strategy:build_muscle",
            "experience:intermediate",
            "frequency:5",
            "mesocycle:hypertrophy_calibration",
            "schedule:asymmetric_rotation"
          ],
          "sessionReasons": [
            {
              "planSessionIndex": 0,
              "role": "Push hypertrophy A",
              "reasons": [
                "microcycle_role:Push hypertrophy A",
                "mesocycle_purpose:Establish reproducible exercise, load and recovery baselines",
                "slot:0:high-priority horizontal press",
                "slot:1:chest work in a complementary press path",
                "slot:2:vertical pressing stimulus",
                "slot:3:lateral-delt stimulus",
                "slot:4:lengthened elbow-extension work",
                "slot:5:shortened-range triceps finish"
              ]
            },
            {
              "planSessionIndex": 1,
              "role": "Pull hypertrophy B",
              "reasons": [
                "microcycle_role:Pull hypertrophy B",
                "mesocycle_purpose:Establish reproducible exercise, load and recovery baselines",
                "slot:0:supported horizontal-pull anchor",
                "slot:1:vertical-pull lat stimulus",
                "slot:2:upper-back work in a complementary supported row pattern",
                "slot:3:rear-delt and scapular work",
                "slot:4:lengthened elbow-flexor work",
                "slot:5:lat work in a complementary supported grip"
              ]
            },
            {
              "planSessionIndex": 2,
              "role": "Legs hypertrophy C",
              "reasons": [
                "microcycle_role:Legs hypertrophy C",
                "mesocycle_purpose:Establish reproducible exercise, load and recovery baselines",
                "slot:0:knee-dominant anchor",
                "slot:1:complementary knee-dominant hypertrophy",
                "slot:2:hip-extension support",
                "slot:3:knee-flexion hamstring work",
                "slot:4:shortened hip-extension stimulus",
                "slot:5:calf work"
              ]
            },
            {
              "planSessionIndex": 3,
              "role": "Push hypertrophy D",
              "reasons": [
                "microcycle_role:Push hypertrophy D",
                "mesocycle_purpose:Establish reproducible exercise, load and recovery baselines",
                "slot:0:high-priority horizontal press",
                "slot:1:chest work in a complementary press path",
                "slot:2:vertical pressing stimulus",
                "slot:3:lateral-delt stimulus",
                "slot:4:lengthened elbow-extension work"
              ]
            },
            {
              "planSessionIndex": 4,
              "role": "Pull hypertrophy E",
              "reasons": [
                "microcycle_role:Pull hypertrophy E",
                "mesocycle_purpose:Establish reproducible exercise, load and recovery baselines",
                "slot:0:supported horizontal-pull anchor",
                "slot:1:vertical-pull lat stimulus",
                "slot:2:upper-back work in a complementary supported row pattern",
                "slot:3:rear-delt and scapular work",
                "slot:4:lengthened elbow-flexor work",
                "slot:5:lat work in a complementary supported grip"
              ]
            }
          ],
          "changeReasons": [
            "initial_canonical_construction",
            "no_progress_intervention_applied"
          ]
        }
      },
      "rotation": {
        "lengthDays": 7,
        "mode": "asymmetric_rotation",
        "publicFrameworkPreference": "push_pull_legs",
        "deliveryStrategy": "classic_push_pull_legs_rotation",
        "resolvedFramework": "push_pull_legs",
        "reason": "explicit_supported_preference",
        "sessionDayOffsets": [
          0,
          1,
          2,
          4,
          5
        ],
        "recoveryDays": 2
      },
      "sessions": [
        {
          "order": 1,
          "dayOffset": 0,
          "role": "Push hypertrophy A",
          "purpose": "Establish reproducible exercise, load and recovery baselines",
          "workingSets": 18,
          "estimatedMinutes": 54,
          "dosageAssessment": {
            "exerciseCount": 6,
            "workingSets": 18,
            "fourExercisesAndElevenSets": false,
            "outcome": "role_specific_allocation",
            "reason": "6 owned movement/muscle slots supply 18 exact working sets for this session role; appropriateness is certified from full-rotation direct stimulus, secondary stimulus, duration and fatigue rather than a universal exercise count."
          },
          "exercises": [
            {
              "exerciseId": "ex-bench-press",
              "exercise": "Bench Press",
              "movement": "horizontal_push",
              "slotPurpose": "high-priority horizontal press",
              "directStimuli": [
                "chest"
              ],
              "meaningfulSecondaryMuscles": [
                "triceps",
                "shoulders"
              ],
              "exerciseFatigue": "high",
              "workingSets": 3,
              "exactReps": [
                8,
                8,
                8
              ],
              "exactTargetKinds": [
                "reps",
                "reps",
                "reps"
              ],
              "method": "straight_sets",
              "loadState": "calibration_required",
              "restSeconds": 150,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:high-priority horizontal press",
                "fatigue:high",
                "recovery:normal",
                "stability:moderate",
                "repeat:not_repeated",
                "preference_score:0"
              ]
            },
            {
              "exerciseId": "ex-incline-dumbbell-press",
              "exercise": "Incline Dumbbell Press",
              "movement": "horizontal_push",
              "slotPurpose": "chest work in a complementary press path",
              "directStimuli": [
                "chest"
              ],
              "meaningfulSecondaryMuscles": [
                "shoulders",
                "triceps"
              ],
              "exerciseFatigue": "moderate",
              "workingSets": 2,
              "exactReps": [
                10,
                10
              ],
              "exactTargetKinds": [
                "reps",
                "reps"
              ],
              "method": "straight_sets",
              "loadState": "calibration_required",
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:chest work in a complementary press path",
                "fatigue:moderate",
                "recovery:normal",
                "stability:moderate",
                "repeat:not_repeated",
                "preference_score:0"
              ]
            },
            {
              "exerciseId": "ex-machine-shoulder-press",
              "exercise": "Machine Shoulder Press",
              "movement": "vertical_push",
              "slotPurpose": "vertical pressing stimulus",
              "directStimuli": [
                "anterior_delts"
              ],
              "meaningfulSecondaryMuscles": [
                "triceps"
              ],
              "exerciseFatigue": "moderate",
              "workingSets": 4,
              "exactReps": [
                10,
                10,
                10,
                10
              ],
              "exactTargetKinds": [
                "reps",
                "reps",
                "reps",
                "reps"
              ],
              "method": "straight_sets",
              "loadState": "calibration_required",
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:vertical pressing stimulus",
                "fatigue:moderate",
                "recovery:normal",
                "stability:high",
                "repeat:not_repeated",
                "preference_score:0"
              ]
            },
            {
              "exerciseId": "ex-cable-lateral-raise",
              "exercise": "Cable Lateral Raise",
              "movement": "isolation",
              "slotPurpose": "lateral-delt stimulus",
              "directStimuli": [
                "lateral_delts"
              ],
              "meaningfulSecondaryMuscles": [],
              "exerciseFatigue": "low",
              "workingSets": 4,
              "exactReps": [
                15,
                15,
                15,
                15
              ],
              "exactTargetKinds": [
                "reps",
                "reps",
                "reps",
                "reps"
              ],
              "method": "straight_sets",
              "loadState": "calibration_required",
              "restSeconds": 75,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:lateral-delt stimulus",
                "fatigue:low",
                "recovery:normal",
                "stability:high",
                "repeat:not_repeated",
                "preference_score:0"
              ]
            },
            {
              "exerciseId": "ex-cable-rope-overhead-extension",
              "exercise": "Rope Overhead Triceps Extension",
              "movement": "isolation",
              "slotPurpose": "lengthened elbow-extension work",
              "directStimuli": [
                "triceps"
              ],
              "meaningfulSecondaryMuscles": [],
              "exerciseFatigue": "low",
              "workingSets": 3,
              "exactReps": [
                12,
                12,
                12
              ],
              "exactTargetKinds": [
                "reps",
                "reps",
                "reps"
              ],
              "method": "straight_sets",
              "loadState": "calibration_required",
              "restSeconds": 75,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:lengthened elbow-extension work",
                "fatigue:low",
                "recovery:normal",
                "stability:high",
                "repeat:not_repeated",
                "preference_score:0"
              ]
            },
            {
              "exerciseId": "ex-close-neutral-pushdown",
              "exercise": "Close Neutral Pushdown",
              "movement": "isolation",
              "slotPurpose": "shortened-range triceps finish",
              "directStimuli": [
                "triceps"
              ],
              "meaningfulSecondaryMuscles": [],
              "exerciseFatigue": "low",
              "workingSets": 2,
              "exactReps": [
                12,
                12
              ],
              "exactTargetKinds": [
                "reps",
                "reps"
              ],
              "method": "straight_sets",
              "loadState": "calibration_required",
              "restSeconds": 75,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:shortened-range triceps finish",
                "fatigue:low",
                "recovery:normal",
                "stability:high",
                "repeat:not_repeated",
                "preference_score:0"
              ]
            }
          ]
        },
        {
          "order": 2,
          "dayOffset": 1,
          "role": "Pull hypertrophy B",
          "purpose": "Establish reproducible exercise, load and recovery baselines",
          "workingSets": 18,
          "estimatedMinutes": 55,
          "dosageAssessment": {
            "exerciseCount": 6,
            "workingSets": 18,
            "fourExercisesAndElevenSets": false,
            "outcome": "role_specific_allocation",
            "reason": "6 owned movement/muscle slots supply 18 exact working sets for this session role; appropriateness is certified from full-rotation direct stimulus, secondary stimulus, duration and fatigue rather than a universal exercise count."
          },
          "exercises": [
            {
              "exerciseId": "ex-chest-supported-row",
              "exercise": "Chest Supported Row",
              "movement": "horizontal_pull",
              "slotPurpose": "supported horizontal-pull anchor",
              "directStimuli": [
                "upper_back"
              ],
              "meaningfulSecondaryMuscles": [
                "biceps"
              ],
              "exerciseFatigue": "moderate",
              "workingSets": 3,
              "exactReps": [
                12,
                12,
                12
              ],
              "exactTargetKinds": [
                "reps",
                "reps",
                "reps"
              ],
              "method": "straight_sets",
              "loadState": "calibration_required",
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:supported horizontal-pull anchor",
                "fatigue:moderate",
                "recovery:normal",
                "stability:high",
                "repeat:not_repeated",
                "preference_score:0"
              ]
            },
            {
              "exerciseId": "ex-lat-pulldown",
              "exercise": "Lat Pulldown",
              "movement": "vertical_pull",
              "slotPurpose": "vertical-pull lat stimulus",
              "directStimuli": [
                "lats"
              ],
              "meaningfulSecondaryMuscles": [
                "biceps"
              ],
              "exerciseFatigue": "moderate",
              "workingSets": 3,
              "exactReps": [
                10,
                10,
                10
              ],
              "exactTargetKinds": [
                "reps",
                "reps",
                "reps"
              ],
              "method": "straight_sets",
              "loadState": "calibration_required",
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:vertical-pull lat stimulus",
                "fatigue:moderate",
                "recovery:normal",
                "stability:high",
                "repeat:not_repeated",
                "preference_score:0"
              ]
            },
            {
              "exerciseId": "ex-dorian-yates-row-machine",
              "exercise": "Dorian Yates Row Machine",
              "movement": "horizontal_pull",
              "slotPurpose": "upper-back work in a complementary supported row pattern",
              "directStimuli": [
                "upper_back"
              ],
              "meaningfulSecondaryMuscles": [
                "biceps",
                "rear_delts"
              ],
              "exerciseFatigue": "moderate",
              "workingSets": 2,
              "exactReps": [
                10,
                10
              ],
              "exactTargetKinds": [
                "reps",
                "reps"
              ],
              "method": "straight_sets",
              "loadState": "calibration_required",
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:upper-back work in a complementary supported row pattern",
                "fatigue:moderate",
                "recovery:normal",
                "stability:high",
                "repeat:not_repeated",
                "preference_score:0"
              ]
            },
            {
              "exerciseId": "ex-cable-rear-delt-fly",
              "exercise": "Cable Rear Delt Fly",
              "movement": "isolation",
              "slotPurpose": "rear-delt and scapular work",
              "directStimuli": [
                "rear_delts"
              ],
              "meaningfulSecondaryMuscles": [
                "shoulders",
                "back"
              ],
              "exerciseFatigue": "low",
              "workingSets": 4,
              "exactReps": [
                15,
                15,
                15,
                15
              ],
              "exactTargetKinds": [
                "reps",
                "reps",
                "reps",
                "reps"
              ],
              "method": "straight_sets",
              "loadState": "calibration_required",
              "restSeconds": 75,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:rear-delt and scapular work",
                "fatigue:low",
                "recovery:normal",
                "stability:high",
                "repeat:not_repeated",
                "preference_score:0"
              ]
            },
            {
              "exerciseId": "ex-bayesian-curl",
              "exercise": "Bayesian Curl",
              "movement": "isolation",
              "slotPurpose": "lengthened elbow-flexor work",
              "directStimuli": [
                "biceps"
              ],
              "meaningfulSecondaryMuscles": [],
              "exerciseFatigue": "low",
              "workingSets": 4,
              "exactReps": [
                12,
                12,
                12,
                12
              ],
              "exactTargetKinds": [
                "reps",
                "reps",
                "reps",
                "reps"
              ],
              "method": "straight_sets",
              "loadState": "calibration_required",
              "restSeconds": 75,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:lengthened elbow-flexor work",
                "fatigue:low",
                "recovery:normal",
                "stability:high",
                "repeat:not_repeated",
                "preference_score:0"
              ]
            },
            {
              "exerciseId": "ex-lat-pulldown-machine",
              "exercise": "Lat Pulldown Machine",
              "movement": "vertical_pull",
              "slotPurpose": "lat work in a complementary supported grip",
              "directStimuli": [
                "lats"
              ],
              "meaningfulSecondaryMuscles": [
                "biceps"
              ],
              "exerciseFatigue": "moderate",
              "workingSets": 2,
              "exactReps": [
                10,
                10
              ],
              "exactTargetKinds": [
                "reps",
                "reps"
              ],
              "method": "straight_sets",
              "loadState": "calibration_required",
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:lat work in a complementary supported grip",
                "fatigue:moderate",
                "recovery:normal",
                "stability:high",
                "repeat:not_repeated",
                "preference_score:0"
              ]
            }
          ]
        },
        {
          "order": 3,
          "dayOffset": 2,
          "role": "Legs hypertrophy C",
          "purpose": "Establish reproducible exercise, load and recovery baselines",
          "workingSets": 20,
          "estimatedMinutes": 65,
          "dosageAssessment": {
            "exerciseCount": 6,
            "workingSets": 20,
            "fourExercisesAndElevenSets": false,
            "outcome": "role_specific_allocation",
            "reason": "6 owned movement/muscle slots supply 20 exact working sets for this session role; appropriateness is certified from full-rotation direct stimulus, secondary stimulus, duration and fatigue rather than a universal exercise count."
          },
          "exercises": [
            {
              "exerciseId": "ex-hack-squat-machine",
              "exercise": "Hack Squat Machine",
              "movement": "squat",
              "slotPurpose": "knee-dominant anchor",
              "directStimuli": [
                "quadriceps"
              ],
              "meaningfulSecondaryMuscles": [
                "glutes"
              ],
              "exerciseFatigue": "moderate",
              "workingSets": 4,
              "exactReps": [
                12,
                12,
                12,
                12
              ],
              "exactTargetKinds": [
                "reps",
                "reps",
                "reps",
                "reps"
              ],
              "method": "straight_sets",
              "loadState": "calibration_required",
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:knee-dominant anchor",
                "fatigue:moderate",
                "recovery:normal",
                "stability:high",
                "repeat:not_repeated",
                "preference_score:0"
              ]
            },
            {
              "exerciseId": "ex-belt-squat",
              "exercise": "Belt Squat",
              "movement": "squat",
              "slotPurpose": "complementary knee-dominant hypertrophy",
              "directStimuli": [
                "quadriceps"
              ],
              "meaningfulSecondaryMuscles": [
                "adductors"
              ],
              "exerciseFatigue": "moderate",
              "workingSets": 2,
              "exactReps": [
                10,
                10
              ],
              "exactTargetKinds": [
                "reps",
                "reps"
              ],
              "method": "straight_sets",
              "loadState": "calibration_required",
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:complementary knee-dominant hypertrophy",
                "fatigue:moderate",
                "recovery:normal",
                "stability:high",
                "repeat:not_repeated",
                "preference_score:0"
              ]
            },
            {
              "exerciseId": "ex-stiff-leg-deadlift",
              "exercise": "Stiff-Leg Deadlift",
              "movement": "hinge",
              "slotPurpose": "hip-extension support",
              "directStimuli": [
                "hip_extension"
              ],
              "meaningfulSecondaryMuscles": [
                "back"
              ],
              "exerciseFatigue": "moderate",
              "workingSets": 3,
              "exactReps": [
                10,
                10,
                10
              ],
              "exactTargetKinds": [
                "reps",
                "reps",
                "reps"
              ],
              "method": "straight_sets",
              "loadState": "calibration_required",
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:hip-extension support",
                "fatigue:moderate",
                "recovery:normal",
                "stability:high",
                "repeat:not_repeated",
                "preference_score:0"
              ]
            },
            {
              "exerciseId": "ex-kneeling-leg-curl",
              "exercise": "Kneeling Leg Curl",
              "movement": "isolation",
              "slotPurpose": "knee-flexion hamstring work",
              "directStimuli": [
                "hamstrings_knee_flexion"
              ],
              "meaningfulSecondaryMuscles": [],
              "exerciseFatigue": "low",
              "workingSets": 4,
              "exactReps": [
                12,
                12,
                12,
                12
              ],
              "exactTargetKinds": [
                "reps",
                "reps",
                "reps",
                "reps"
              ],
              "method": "straight_sets",
              "loadState": "calibration_required",
              "restSeconds": 75,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:knee-flexion hamstring work",
                "fatigue:low",
                "recovery:normal",
                "stability:high",
                "repeat:not_repeated",
                "preference_score:0"
              ]
            },
            {
              "exerciseId": "ex-hip-thrust-machine",
              "exercise": "Hip Thrust Machine",
              "movement": "hip_thrust",
              "slotPurpose": "shortened hip-extension stimulus",
              "directStimuli": [
                "hip_extension"
              ],
              "meaningfulSecondaryMuscles": [
                "hamstrings"
              ],
              "exerciseFatigue": "moderate",
              "workingSets": 3,
              "exactReps": [
                10,
                10,
                10
              ],
              "exactTargetKinds": [
                "reps",
                "reps",
                "reps"
              ],
              "method": "straight_sets",
              "loadState": "calibration_required",
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:shortened hip-extension stimulus",
                "fatigue:moderate",
                "recovery:normal",
                "stability:high",
                "repeat:not_repeated",
                "preference_score:0"
              ]
            },
            {
              "exerciseId": "ex-donkey-calf-raise",
              "exercise": "Donkey Calf Raise",
              "movement": "isolation",
              "slotPurpose": "calf work",
              "directStimuli": [
                "calves"
              ],
              "meaningfulSecondaryMuscles": [],
              "exerciseFatigue": "low",
              "workingSets": 4,
              "exactReps": [
                15,
                15,
                15,
                15
              ],
              "exactTargetKinds": [
                "reps",
                "reps",
                "reps",
                "reps"
              ],
              "method": "straight_sets",
              "loadState": "calibration_required",
              "restSeconds": 75,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:calf work",
                "fatigue:low",
                "recovery:normal",
                "stability:high",
                "repeat:not_repeated",
                "preference_score:0"
              ]
            }
          ]
        },
        {
          "order": 4,
          "dayOffset": 4,
          "role": "Push hypertrophy D",
          "purpose": "Establish reproducible exercise, load and recovery baselines",
          "workingSets": 13,
          "estimatedMinutes": 42,
          "dosageAssessment": {
            "exerciseCount": 5,
            "workingSets": 13,
            "fourExercisesAndElevenSets": false,
            "outcome": "role_specific_allocation",
            "reason": "5 owned movement/muscle slots supply 13 exact working sets for this session role; appropriateness is certified from full-rotation direct stimulus, secondary stimulus, duration and fatigue rather than a universal exercise count."
          },
          "exercises": [
            {
              "exerciseId": "ex-incline-barbell-bench",
              "exercise": "Incline Barbell Bench",
              "movement": "horizontal_push",
              "slotPurpose": "high-priority horizontal press",
              "directStimuli": [
                "chest"
              ],
              "meaningfulSecondaryMuscles": [
                "shoulders",
                "triceps"
              ],
              "exerciseFatigue": "high",
              "workingSets": 3,
              "exactReps": [
                8,
                8,
                8
              ],
              "exactTargetKinds": [
                "reps",
                "reps",
                "reps"
              ],
              "method": "straight_sets",
              "loadState": "calibration_required",
              "restSeconds": 150,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:high-priority horizontal press",
                "fatigue:high",
                "recovery:normal",
                "stability:moderate",
                "repeat:not_repeated",
                "preference_score:0"
              ]
            },
            {
              "exerciseId": "ex-decline-plate-loaded-press",
              "exercise": "Decline Plate Loaded Press",
              "movement": "horizontal_push",
              "slotPurpose": "chest work in a complementary press path",
              "directStimuli": [
                "chest"
              ],
              "meaningfulSecondaryMuscles": [
                "triceps"
              ],
              "exerciseFatigue": "moderate",
              "workingSets": 2,
              "exactReps": [
                10,
                10
              ],
              "exactTargetKinds": [
                "reps",
                "reps"
              ],
              "method": "straight_sets",
              "loadState": "calibration_required",
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:chest work in a complementary press path",
                "fatigue:moderate",
                "recovery:normal",
                "stability:high",
                "repeat:not_repeated",
                "preference_score:0"
              ]
            },
            {
              "exerciseId": "ex-plate-loaded-shoulder-press-machine",
              "exercise": "Plate Loaded Shoulder Press Machine",
              "movement": "vertical_push",
              "slotPurpose": "vertical pressing stimulus",
              "directStimuli": [
                "anterior_delts"
              ],
              "meaningfulSecondaryMuscles": [
                "triceps"
              ],
              "exerciseFatigue": "moderate",
              "workingSets": 3,
              "exactReps": [
                10,
                10,
                10
              ],
              "exactTargetKinds": [
                "reps",
                "reps",
                "reps"
              ],
              "method": "straight_sets",
              "loadState": "calibration_required",
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:vertical pressing stimulus",
                "fatigue:moderate",
                "recovery:normal",
                "stability:high",
                "repeat:not_repeated",
                "preference_score:0"
              ]
            },
            {
              "exerciseId": "ex-lateral-raise-plate-loaded",
              "exercise": "Lateral Raise Plate Loaded",
              "movement": "isolation",
              "slotPurpose": "lateral-delt stimulus",
              "directStimuli": [
                "lateral_delts"
              ],
              "meaningfulSecondaryMuscles": [],
              "exerciseFatigue": "low",
              "workingSets": 3,
              "exactReps": [
                15,
                15,
                15
              ],
              "exactTargetKinds": [
                "reps",
                "reps",
                "reps"
              ],
              "method": "straight_sets",
              "loadState": "calibration_required",
              "restSeconds": 75,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:lateral-delt stimulus",
                "fatigue:low",
                "recovery:normal",
                "stability:high",
                "repeat:not_repeated",
                "preference_score:0"
              ]
            },
            {
              "exerciseId": "ex-ez-bar-pushdown",
              "exercise": "EZ-Bar Pushdown",
              "movement": "isolation",
              "slotPurpose": "lengthened elbow-extension work",
              "directStimuli": [
                "triceps"
              ],
              "meaningfulSecondaryMuscles": [],
              "exerciseFatigue": "low",
              "workingSets": 2,
              "exactReps": [
                12,
                12
              ],
              "exactTargetKinds": [
                "reps",
                "reps"
              ],
              "method": "straight_sets",
              "loadState": "calibration_required",
              "restSeconds": 75,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:lengthened elbow-extension work",
                "fatigue:low",
                "recovery:normal",
                "stability:high",
                "repeat:not_repeated",
                "preference_score:0"
              ]
            }
          ]
        },
        {
          "order": 5,
          "dayOffset": 5,
          "role": "Pull hypertrophy E",
          "purpose": "Establish reproducible exercise, load and recovery baselines",
          "workingSets": 16,
          "estimatedMinutes": 51,
          "dosageAssessment": {
            "exerciseCount": 6,
            "workingSets": 16,
            "fourExercisesAndElevenSets": false,
            "outcome": "role_specific_allocation",
            "reason": "6 owned movement/muscle slots supply 16 exact working sets for this session role; appropriateness is certified from full-rotation direct stimulus, secondary stimulus, duration and fatigue rather than a universal exercise count."
          },
          "exercises": [
            {
              "exerciseId": "ex-high-row-plate-loaded",
              "exercise": "High Row Plate Loaded",
              "movement": "horizontal_pull",
              "slotPurpose": "supported horizontal-pull anchor",
              "directStimuli": [
                "upper_back"
              ],
              "meaningfulSecondaryMuscles": [
                "biceps",
                "rear_delts"
              ],
              "exerciseFatigue": "moderate",
              "workingSets": 3,
              "exactReps": [
                12,
                12,
                12
              ],
              "exactTargetKinds": [
                "reps",
                "reps",
                "reps"
              ],
              "method": "straight_sets",
              "loadState": "calibration_required",
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:supported horizontal-pull anchor",
                "fatigue:moderate",
                "recovery:normal",
                "stability:high",
                "repeat:not_repeated",
                "preference_score:0"
              ]
            },
            {
              "exerciseId": "ex-lat-pulldown-narrow",
              "exercise": "Lat Pulldown Narrow",
              "movement": "vertical_pull",
              "slotPurpose": "vertical-pull lat stimulus",
              "directStimuli": [
                "lats"
              ],
              "meaningfulSecondaryMuscles": [
                "biceps"
              ],
              "exerciseFatigue": "moderate",
              "workingSets": 3,
              "exactReps": [
                10,
                10,
                10
              ],
              "exactTargetKinds": [
                "reps",
                "reps",
                "reps"
              ],
              "method": "straight_sets",
              "loadState": "calibration_required",
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:vertical-pull lat stimulus",
                "fatigue:moderate",
                "recovery:normal",
                "stability:high",
                "repeat:not_repeated",
                "preference_score:0"
              ]
            },
            {
              "exerciseId": "ex-low-row-plate-loaded",
              "exercise": "Low Row Plate Loaded",
              "movement": "horizontal_pull",
              "slotPurpose": "upper-back work in a complementary supported row pattern",
              "directStimuli": [
                "upper_back"
              ],
              "meaningfulSecondaryMuscles": [
                "biceps"
              ],
              "exerciseFatigue": "moderate",
              "workingSets": 2,
              "exactReps": [
                10,
                10
              ],
              "exactTargetKinds": [
                "reps",
                "reps"
              ],
              "method": "straight_sets",
              "loadState": "calibration_required",
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:upper-back work in a complementary supported row pattern",
                "fatigue:moderate",
                "recovery:normal",
                "stability:high",
                "repeat:not_repeated",
                "preference_score:0"
              ]
            },
            {
              "exerciseId": "ex-rear-delt-machine",
              "exercise": "Rear Delt Machine",
              "movement": "isolation",
              "slotPurpose": "rear-delt and scapular work",
              "directStimuli": [
                "rear_delts"
              ],
              "meaningfulSecondaryMuscles": [
                "back"
              ],
              "exerciseFatigue": "low",
              "workingSets": 3,
              "exactReps": [
                15,
                15,
                15
              ],
              "exactTargetKinds": [
                "reps",
                "reps",
                "reps"
              ],
              "method": "straight_sets",
              "loadState": "calibration_required",
              "restSeconds": 75,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:rear-delt and scapular work",
                "fatigue:low",
                "recovery:normal",
                "stability:high",
                "repeat:not_repeated",
                "preference_score:0"
              ]
            },
            {
              "exerciseId": "ex-cable-curl",
              "exercise": "Cable Curl",
              "movement": "isolation",
              "slotPurpose": "lengthened elbow-flexor work",
              "directStimuli": [
                "biceps"
              ],
              "meaningfulSecondaryMuscles": [],
              "exerciseFatigue": "low",
              "workingSets": 3,
              "exactReps": [
                12,
                12,
                12
              ],
              "exactTargetKinds": [
                "reps",
                "reps",
                "reps"
              ],
              "method": "straight_sets",
              "loadState": "calibration_required",
              "restSeconds": 75,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:lengthened elbow-flexor work",
                "fatigue:low",
                "recovery:normal",
                "stability:high",
                "repeat:not_repeated",
                "preference_score:0"
              ]
            },
            {
              "exerciseId": "ex-lat-pulldown-neutral-close",
              "exercise": "Lat Pulldown Neutral Close",
              "movement": "vertical_pull",
              "slotPurpose": "lat work in a complementary supported grip",
              "directStimuli": [
                "lats"
              ],
              "meaningfulSecondaryMuscles": [
                "biceps"
              ],
              "exerciseFatigue": "moderate",
              "workingSets": 2,
              "exactReps": [
                10,
                10
              ],
              "exactTargetKinds": [
                "reps",
                "reps"
              ],
              "method": "straight_sets",
              "loadState": "calibration_required",
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:lat work in a complementary supported grip",
                "fatigue:moderate",
                "recovery:normal",
                "stability:high",
                "repeat:not_repeated",
                "preference_score:0"
              ]
            }
          ]
        }
      ],
      "accounting": {
        "directSets": {
          "chest": 10,
          "anterior_delts": 7,
          "lateral_delts": 7,
          "triceps": 7,
          "upper_back": 10,
          "lats": 10,
          "rear_delts": 7,
          "biceps": 7,
          "quadriceps": 6,
          "hip_extension": 6,
          "hamstrings_knee_flexion": 4,
          "calves": 4
        },
        "meaningfulSecondarySets": {
          "triceps": 17,
          "anterior_delts": 8,
          "biceps": 20,
          "rear_delts": 8,
          "upper_back": 10,
          "hip_extension": 4
        },
        "muscleFrequency": {
          "anterior_delts": 2,
          "biceps": 2,
          "calves": 1,
          "chest": 2,
          "hamstrings_knee_flexion": 1,
          "hip_extension": 1,
          "lateral_delts": 2,
          "lats": 2,
          "quadriceps": 1,
          "rear_delts": 2,
          "triceps": 2,
          "upper_back": 2
        },
        "movementPatternExposures": {
          "horizontal_push": 4,
          "vertical_push": 2,
          "isolation": 11,
          "horizontal_pull": 4,
          "vertical_pull": 4,
          "squat": 2,
          "lunge": 2,
          "hinge": 1,
          "hip_thrust": 1
        },
        "primaryLiftExposures": {
          "bench": {
            "primary": 0,
            "secondaryVariation": 0
          },
          "squat": {
            "primary": 0,
            "secondaryVariation": 0
          },
          "deadlift": {
            "primary": 0,
            "secondaryVariation": 0
          }
        },
        "totalWorkingSets": 85,
        "perSessionWorkingSets": [
          18,
          18,
          20,
          13,
          16
        ],
        "perSessionEstimatedMinutes": [
          54,
          55,
          65,
          42,
          51
        ],
        "fatigueUnits": {
          "perSession": [
            30,
            31,
            36,
            24,
            29
          ],
          "weeklyUnits": 150,
          "overlapFlags": []
        },
        "repeatedExercises": []
      },
      "progression": {
        "volumePolicyId": "canonical_hypertrophy_volume_policy_v2",
        "exactRules": {
          "add": "Add one direct set to one local stimulus region only after at least three comparable completed observations show productive performance, recovery is acceptable, the region remains below target, and no rep drop-off or technique contraindication is present.",
          "retain": "Retain dosage when comparable performance is improving or stable inside the target range, or when evidence is not yet sufficient for a safe change.",
          "remove": "Remove one direct set from the affected region after confirmed local rep drop-off or local recovery failure; remove two only when the same fresh signal is repeated and the resulting dose remains above the starting floor.",
          "reallocate": "Reallocate one low-benefit accessory set to a lagging region only when systemic recovery is acceptable, the source region is at or above target, the destination is below target, and both regions have comparable evidence.",
          "systemic": "Systemic fatigue never triggers an automatic local increase. Hold all additions and require stress-reduction review; deload remains a separate Mesocycle decision."
        },
        "nextRotation": "same immutable prescriptions until canonical Progress evidence authorises regeneration",
        "mesocycleExitCriteria": [
          "Main movement and muscle data exists"
        ],
        "approvedNextMesocycles": [
          "hypertrophy_base"
        ]
      },
      "conditioning": {
        "schemaVersion": "canonical_cardio_prescription_v1",
        "policyId": "canonical_concurrent_training_policy_v1",
        "preference": "recommended",
        "status": "active",
        "goal": "build_muscle",
        "sessions": [
          {
            "id": "cert-intermediate-hypertrophy-5-push_pull_legs-calibration:cardio:1",
            "dayOffset": 3,
            "kind": "recovery_cardio",
            "modality": "incline_walk",
            "durationMinutes": 20,
            "intensity": "easy_zone_2",
            "placement": "recovery_day",
            "progression": "After three completed, well-tolerated sessions, add five minutes to one session; do not add intensity and duration together.",
            "stopOrAdjust": "Stop for pain, dizziness or unusual breathlessness; hold progression and review if lower-body performance or recovery declines."
          },
          {
            "id": "cert-intermediate-hypertrophy-5-push_pull_legs-calibration:cardio:2",
            "dayOffset": 6,
            "kind": "recovery_cardio",
            "modality": "cycle",
            "durationMinutes": 20,
            "intensity": "easy_zone_2",
            "placement": "recovery_day",
            "progression": "After three completed, well-tolerated sessions, add five minutes to one session; do not add intensity and duration together.",
            "stopOrAdjust": "Stop for pain, dizziness or unusual breathlessness; hold progression and review if lower-body performance or recovery declines."
          }
        ],
        "weeklyFrequency": 2,
        "rationaleCodes": [
          "recovery_capacity",
          "hypertrophy_stimulus_preserved",
          "ordinary_recovery_start"
        ],
        "interferenceRules": [
          "cardio_never_changes_lifting_session_count",
          "hard_conditioning_not_before_priority_lower_session",
          "progress_requires_completed_tolerated_evidence"
        ],
        "recoveryBudget": {
          "cardioMinutes": 40,
          "intervalWorkMinutes": 0,
          "concurrentSportSessions": 0,
          "lowerBodyInterference": "low",
          "resistanceDosageAdjustment": "none"
        }
      },
      "certification": {
        "allocation": {
          "status": "passed",
          "checks": [
            "exact_working_sets_resolved",
            "no_token_hypertrophy_exercises",
            "complete_rotation_meets_normalized_seven_day_starting_floor",
            "session_volume_has_meaningful_work",
            "available_session_duration_respected",
            "slot_targets_resolved",
            "ppl_session_density_authorised",
            "push_identity_preserved",
            "pull_identity_preserved",
            "legs_identity_preserved",
            "strength_assistance_transfer_explained"
          ],
          "failures": []
        },
        "constructed": {
          "status": "passed",
          "checks": [
            "chest_direct_coverage",
            "anterior_delts_direct_coverage",
            "lateral_delts_direct_coverage",
            "triceps_direct_coverage",
            "upper_back_direct_coverage",
            "lats_direct_coverage",
            "rear_delts_direct_coverage",
            "biceps_direct_coverage",
            "quadriceps_direct_coverage",
            "hip_extension_direct_coverage",
            "hamstrings_knee_flexion_direct_coverage",
            "calves_direct_coverage",
            "secondary_stimulus_reported_separately",
            "no_unauthorised_specialist_selection",
            "session_systemic_fatigue_reported_for_comparison",
            "same_role_sessions_complementary:push",
            "same_role_sessions_complementary:pull",
            "high_fatigue_reps_and_rest_appropriate"
          ],
          "failures": []
        }
      }
    },
    {
      "id": "intermediate-hypertrophy-5-push_pull_legs-established",
      "label": "Intermediate Hypertrophy · 5 days · Push/Pull/Legs · established comparable history",
      "status": "constructed",
      "input": {
        "goal": "build_muscle",
        "experience": "intermediate",
        "frequency": 5,
        "requestedFramework": "push_pull_legs",
        "equipment": [
          "barbell",
          "dumbbell",
          "machine",
          "cable",
          "bodyweight"
        ],
        "availableSessionMinutes": 75,
        "establishedHistory": true
      },
      "authority": {
        "macrocycle": "cert-intermediate-hypertrophy-5-push_pull_legs-established:macrocycle",
        "mesocycle": "hypertrophy_calibration",
        "microcycle": "cert-intermediate-hypertrophy-5-push_pull_legs-established:microcycle:1",
        "sessionConstruction": "canonical_plan_v3",
        "prescriptionPolicy": "mesocycle_prescription_policy_v1",
        "rationale": {
          "schemaVersion": "canonical_planning_rationale_v1",
          "goalStrategyId": "canonical_goal_hypertrophy_v1",
          "rotationReasons": [
            "framework:push_pull_legs",
            "framework_reason:explicit_supported_preference",
            "goal_strategy:build_muscle",
            "experience:intermediate",
            "frequency:5",
            "mesocycle:hypertrophy_calibration",
            "schedule:asymmetric_rotation"
          ],
          "sessionReasons": [
            {
              "planSessionIndex": 0,
              "role": "Push hypertrophy A",
              "reasons": [
                "microcycle_role:Push hypertrophy A",
                "mesocycle_purpose:Establish reproducible exercise, load and recovery baselines",
                "slot:0:high-priority horizontal press",
                "slot:1:chest work in a complementary press path",
                "slot:2:vertical pressing stimulus",
                "slot:3:lateral-delt stimulus",
                "slot:4:lengthened elbow-extension work",
                "slot:5:shortened-range triceps finish"
              ]
            },
            {
              "planSessionIndex": 1,
              "role": "Pull hypertrophy B",
              "reasons": [
                "microcycle_role:Pull hypertrophy B",
                "mesocycle_purpose:Establish reproducible exercise, load and recovery baselines",
                "slot:0:supported horizontal-pull anchor",
                "slot:1:vertical-pull lat stimulus",
                "slot:2:upper-back work in a complementary supported row pattern",
                "slot:3:rear-delt and scapular work",
                "slot:4:lengthened elbow-flexor work",
                "slot:5:lat work in a complementary supported grip"
              ]
            },
            {
              "planSessionIndex": 2,
              "role": "Legs hypertrophy C",
              "reasons": [
                "microcycle_role:Legs hypertrophy C",
                "mesocycle_purpose:Establish reproducible exercise, load and recovery baselines",
                "slot:0:knee-dominant anchor",
                "slot:1:complementary knee-dominant hypertrophy",
                "slot:2:hip-extension support",
                "slot:3:knee-flexion hamstring work",
                "slot:4:shortened hip-extension stimulus",
                "slot:5:calf work"
              ]
            },
            {
              "planSessionIndex": 3,
              "role": "Push hypertrophy D",
              "reasons": [
                "microcycle_role:Push hypertrophy D",
                "mesocycle_purpose:Establish reproducible exercise, load and recovery baselines",
                "slot:0:high-priority horizontal press",
                "slot:1:chest work in a complementary press path",
                "slot:2:vertical pressing stimulus",
                "slot:3:lateral-delt stimulus",
                "slot:4:lengthened elbow-extension work",
                "slot:5:shortened-range triceps finish"
              ]
            },
            {
              "planSessionIndex": 4,
              "role": "Pull hypertrophy E",
              "reasons": [
                "microcycle_role:Pull hypertrophy E",
                "mesocycle_purpose:Establish reproducible exercise, load and recovery baselines",
                "slot:0:supported horizontal-pull anchor",
                "slot:1:vertical-pull lat stimulus",
                "slot:2:upper-back work in a complementary supported row pattern",
                "slot:3:rear-delt and scapular work",
                "slot:4:lengthened elbow-flexor work",
                "slot:5:lat work in a complementary supported grip"
              ]
            }
          ],
          "changeReasons": [
            "initial_canonical_construction",
            "no_progress_intervention_applied"
          ]
        }
      },
      "rotation": {
        "lengthDays": 7,
        "mode": "asymmetric_rotation",
        "publicFrameworkPreference": "push_pull_legs",
        "deliveryStrategy": "classic_push_pull_legs_rotation",
        "resolvedFramework": "push_pull_legs",
        "reason": "explicit_supported_preference",
        "sessionDayOffsets": [
          0,
          1,
          2,
          4,
          5
        ],
        "recoveryDays": 2
      },
      "sessions": [
        {
          "order": 1,
          "dayOffset": 0,
          "role": "Push hypertrophy A",
          "purpose": "Establish reproducible exercise, load and recovery baselines",
          "workingSets": 18,
          "estimatedMinutes": 52,
          "dosageAssessment": {
            "exerciseCount": 6,
            "workingSets": 18,
            "fourExercisesAndElevenSets": false,
            "outcome": "role_specific_allocation",
            "reason": "6 owned movement/muscle slots supply 18 exact working sets for this session role; appropriateness is certified from full-rotation direct stimulus, secondary stimulus, duration and fatigue rather than a universal exercise count."
          },
          "exercises": [
            {
              "exerciseId": "ex-bench-press",
              "exercise": "Bench Press",
              "movement": "horizontal_push",
              "slotPurpose": "high-priority horizontal press",
              "directStimuli": [
                "chest"
              ],
              "meaningfulSecondaryMuscles": [
                "triceps",
                "shoulders"
              ],
              "exerciseFatigue": "high",
              "workingSets": 4,
              "exactReps": [
                8,
                8,
                8,
                8
              ],
              "exactTargetKinds": [
                "reps",
                "reps",
                "reps",
                "reps"
              ],
              "method": "straight_sets",
              "loadState": "established",
              "prescribedBaseLoad": 50,
              "restSeconds": 150,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:high-priority horizontal press",
                "fatigue:high",
                "recovery:normal",
                "stability:moderate",
                "repeat:not_repeated",
                "preference_score:0"
              ]
            },
            {
              "exerciseId": "ex-incline-dumbbell-press",
              "exercise": "Incline Dumbbell Press",
              "movement": "horizontal_push",
              "slotPurpose": "chest work in a complementary press path",
              "directStimuli": [
                "chest"
              ],
              "meaningfulSecondaryMuscles": [
                "shoulders",
                "triceps"
              ],
              "exerciseFatigue": "moderate",
              "workingSets": 2,
              "exactReps": [
                10,
                10
              ],
              "exactTargetKinds": [
                "reps",
                "reps"
              ],
              "method": "straight_sets",
              "loadState": "established",
              "prescribedBaseLoad": 50,
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:chest work in a complementary press path",
                "fatigue:moderate",
                "recovery:normal",
                "stability:moderate",
                "repeat:not_repeated",
                "preference_score:0"
              ]
            },
            {
              "exerciseId": "ex-machine-shoulder-press",
              "exercise": "Machine Shoulder Press",
              "movement": "vertical_push",
              "slotPurpose": "vertical pressing stimulus",
              "directStimuli": [
                "anterior_delts"
              ],
              "meaningfulSecondaryMuscles": [
                "triceps"
              ],
              "exerciseFatigue": "moderate",
              "workingSets": 4,
              "exactReps": [
                10,
                10,
                10,
                10
              ],
              "exactTargetKinds": [
                "reps",
                "reps",
                "reps",
                "reps"
              ],
              "method": "straight_sets",
              "loadState": "established",
              "prescribedBaseLoad": 50,
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:vertical pressing stimulus",
                "fatigue:moderate",
                "recovery:normal",
                "stability:high",
                "repeat:not_repeated",
                "preference_score:0"
              ]
            },
            {
              "exerciseId": "ex-cable-lateral-raise",
              "exercise": "Cable Lateral Raise",
              "movement": "isolation",
              "slotPurpose": "lateral-delt stimulus",
              "directStimuli": [
                "lateral_delts"
              ],
              "meaningfulSecondaryMuscles": [],
              "exerciseFatigue": "low",
              "workingSets": 4,
              "exactReps": [
                15,
                15,
                15,
                15
              ],
              "exactTargetKinds": [
                "reps",
                "reps",
                "reps",
                "reps"
              ],
              "method": "straight_sets",
              "loadState": "established",
              "prescribedBaseLoad": 50,
              "restSeconds": 75,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:lateral-delt stimulus",
                "fatigue:low",
                "recovery:normal",
                "stability:high",
                "repeat:not_repeated",
                "preference_score:0"
              ]
            },
            {
              "exerciseId": "ex-cable-rope-overhead-extension",
              "exercise": "Rope Overhead Triceps Extension",
              "movement": "isolation",
              "slotPurpose": "lengthened elbow-extension work",
              "directStimuli": [
                "triceps"
              ],
              "meaningfulSecondaryMuscles": [],
              "exerciseFatigue": "low",
              "workingSets": 2,
              "exactReps": [
                12,
                12
              ],
              "exactTargetKinds": [
                "reps",
                "reps"
              ],
              "method": "straight_sets",
              "loadState": "established",
              "prescribedBaseLoad": 50,
              "restSeconds": 75,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:lengthened elbow-extension work",
                "fatigue:low",
                "recovery:normal",
                "stability:high",
                "repeat:not_repeated",
                "preference_score:0"
              ]
            },
            {
              "exerciseId": "ex-close-neutral-pushdown",
              "exercise": "Close Neutral Pushdown",
              "movement": "isolation",
              "slotPurpose": "shortened-range triceps finish",
              "directStimuli": [
                "triceps"
              ],
              "meaningfulSecondaryMuscles": [],
              "exerciseFatigue": "low",
              "workingSets": 2,
              "exactReps": [
                12,
                12
              ],
              "exactTargetKinds": [
                "reps",
                "reps"
              ],
              "method": "straight_sets",
              "loadState": "established",
              "prescribedBaseLoad": 50,
              "restSeconds": 75,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:shortened-range triceps finish",
                "fatigue:low",
                "recovery:normal",
                "stability:high",
                "repeat:not_repeated",
                "preference_score:0"
              ]
            }
          ]
        },
        {
          "order": 2,
          "dayOffset": 1,
          "role": "Pull hypertrophy B",
          "purpose": "Establish reproducible exercise, load and recovery baselines",
          "workingSets": 20,
          "estimatedMinutes": 59,
          "dosageAssessment": {
            "exerciseCount": 6,
            "workingSets": 20,
            "fourExercisesAndElevenSets": false,
            "outcome": "role_specific_allocation",
            "reason": "6 owned movement/muscle slots supply 20 exact working sets for this session role; appropriateness is certified from full-rotation direct stimulus, secondary stimulus, duration and fatigue rather than a universal exercise count."
          },
          "exercises": [
            {
              "exerciseId": "ex-chest-supported-row",
              "exercise": "Chest Supported Row",
              "movement": "horizontal_pull",
              "slotPurpose": "supported horizontal-pull anchor",
              "directStimuli": [
                "upper_back"
              ],
              "meaningfulSecondaryMuscles": [
                "biceps"
              ],
              "exerciseFatigue": "moderate",
              "workingSets": 4,
              "exactReps": [
                12,
                12,
                12,
                12
              ],
              "exactTargetKinds": [
                "reps",
                "reps",
                "reps",
                "reps"
              ],
              "method": "straight_sets",
              "loadState": "established",
              "prescribedBaseLoad": 50,
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:supported horizontal-pull anchor",
                "fatigue:moderate",
                "recovery:normal",
                "stability:high",
                "repeat:not_repeated",
                "preference_score:0"
              ]
            },
            {
              "exerciseId": "ex-lat-pulldown",
              "exercise": "Lat Pulldown",
              "movement": "vertical_pull",
              "slotPurpose": "vertical-pull lat stimulus",
              "directStimuli": [
                "lats"
              ],
              "meaningfulSecondaryMuscles": [
                "biceps"
              ],
              "exerciseFatigue": "moderate",
              "workingSets": 4,
              "exactReps": [
                10,
                10,
                10,
                10
              ],
              "exactTargetKinds": [
                "reps",
                "reps",
                "reps",
                "reps"
              ],
              "method": "straight_sets",
              "loadState": "established",
              "prescribedBaseLoad": 50,
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:vertical-pull lat stimulus",
                "fatigue:moderate",
                "recovery:normal",
                "stability:high",
                "repeat:not_repeated",
                "preference_score:0"
              ]
            },
            {
              "exerciseId": "ex-dorian-yates-row-machine",
              "exercise": "Dorian Yates Row Machine",
              "movement": "horizontal_pull",
              "slotPurpose": "upper-back work in a complementary supported row pattern",
              "directStimuli": [
                "upper_back"
              ],
              "meaningfulSecondaryMuscles": [
                "biceps",
                "rear_delts"
              ],
              "exerciseFatigue": "moderate",
              "workingSets": 2,
              "exactReps": [
                10,
                10
              ],
              "exactTargetKinds": [
                "reps",
                "reps"
              ],
              "method": "straight_sets",
              "loadState": "established",
              "prescribedBaseLoad": 50,
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:upper-back work in a complementary supported row pattern",
                "fatigue:moderate",
                "recovery:normal",
                "stability:high",
                "repeat:not_repeated",
                "preference_score:0"
              ]
            },
            {
              "exerciseId": "ex-cable-rear-delt-fly",
              "exercise": "Cable Rear Delt Fly",
              "movement": "isolation",
              "slotPurpose": "rear-delt and scapular work",
              "directStimuli": [
                "rear_delts"
              ],
              "meaningfulSecondaryMuscles": [
                "shoulders",
                "back"
              ],
              "exerciseFatigue": "low",
              "workingSets": 4,
              "exactReps": [
                15,
                15,
                15,
                15
              ],
              "exactTargetKinds": [
                "reps",
                "reps",
                "reps",
                "reps"
              ],
              "method": "straight_sets",
              "loadState": "established",
              "prescribedBaseLoad": 50,
              "restSeconds": 75,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:rear-delt and scapular work",
                "fatigue:low",
                "recovery:normal",
                "stability:high",
                "repeat:not_repeated",
                "preference_score:0"
              ]
            },
            {
              "exerciseId": "ex-bayesian-curl",
              "exercise": "Bayesian Curl",
              "movement": "isolation",
              "slotPurpose": "lengthened elbow-flexor work",
              "directStimuli": [
                "biceps"
              ],
              "meaningfulSecondaryMuscles": [],
              "exerciseFatigue": "low",
              "workingSets": 4,
              "exactReps": [
                12,
                12,
                12,
                12
              ],
              "exactTargetKinds": [
                "reps",
                "reps",
                "reps",
                "reps"
              ],
              "method": "straight_sets",
              "loadState": "established",
              "prescribedBaseLoad": 50,
              "restSeconds": 75,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:lengthened elbow-flexor work",
                "fatigue:low",
                "recovery:normal",
                "stability:high",
                "repeat:not_repeated",
                "preference_score:0"
              ]
            },
            {
              "exerciseId": "ex-lat-pulldown-machine",
              "exercise": "Lat Pulldown Machine",
              "movement": "vertical_pull",
              "slotPurpose": "lat work in a complementary supported grip",
              "directStimuli": [
                "lats"
              ],
              "meaningfulSecondaryMuscles": [
                "biceps"
              ],
              "exerciseFatigue": "moderate",
              "workingSets": 2,
              "exactReps": [
                10,
                10
              ],
              "exactTargetKinds": [
                "reps",
                "reps"
              ],
              "method": "straight_sets",
              "loadState": "established",
              "prescribedBaseLoad": 50,
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:lat work in a complementary supported grip",
                "fatigue:moderate",
                "recovery:normal",
                "stability:high",
                "repeat:not_repeated",
                "preference_score:0"
              ]
            }
          ]
        },
        {
          "order": 3,
          "dayOffset": 2,
          "role": "Legs hypertrophy C",
          "purpose": "Establish reproducible exercise, load and recovery baselines",
          "workingSets": 22,
          "estimatedMinutes": 68,
          "dosageAssessment": {
            "exerciseCount": 6,
            "workingSets": 22,
            "fourExercisesAndElevenSets": false,
            "outcome": "role_specific_allocation",
            "reason": "6 owned movement/muscle slots supply 22 exact working sets for this session role; appropriateness is certified from full-rotation direct stimulus, secondary stimulus, duration and fatigue rather than a universal exercise count."
          },
          "exercises": [
            {
              "exerciseId": "ex-hack-squat-machine",
              "exercise": "Hack Squat Machine",
              "movement": "squat",
              "slotPurpose": "knee-dominant anchor",
              "directStimuli": [
                "quadriceps"
              ],
              "meaningfulSecondaryMuscles": [
                "glutes"
              ],
              "exerciseFatigue": "moderate",
              "workingSets": 4,
              "exactReps": [
                12,
                12,
                12,
                12
              ],
              "exactTargetKinds": [
                "reps",
                "reps",
                "reps",
                "reps"
              ],
              "method": "straight_sets",
              "loadState": "established",
              "prescribedBaseLoad": 50,
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:knee-dominant anchor",
                "fatigue:moderate",
                "recovery:normal",
                "stability:high",
                "repeat:not_repeated",
                "preference_score:0"
              ]
            },
            {
              "exerciseId": "ex-belt-squat",
              "exercise": "Belt Squat",
              "movement": "squat",
              "slotPurpose": "complementary knee-dominant hypertrophy",
              "directStimuli": [
                "quadriceps"
              ],
              "meaningfulSecondaryMuscles": [
                "adductors"
              ],
              "exerciseFatigue": "moderate",
              "workingSets": 3,
              "exactReps": [
                10,
                10,
                10
              ],
              "exactTargetKinds": [
                "reps",
                "reps",
                "reps"
              ],
              "method": "straight_sets",
              "loadState": "established",
              "prescribedBaseLoad": 50,
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:complementary knee-dominant hypertrophy",
                "fatigue:moderate",
                "recovery:normal",
                "stability:high",
                "repeat:not_repeated",
                "preference_score:0"
              ]
            },
            {
              "exerciseId": "ex-stiff-leg-deadlift",
              "exercise": "Stiff-Leg Deadlift",
              "movement": "hinge",
              "slotPurpose": "hip-extension support",
              "directStimuli": [
                "hip_extension"
              ],
              "meaningfulSecondaryMuscles": [
                "back"
              ],
              "exerciseFatigue": "moderate",
              "workingSets": 3,
              "exactReps": [
                10,
                10,
                10
              ],
              "exactTargetKinds": [
                "reps",
                "reps",
                "reps"
              ],
              "method": "straight_sets",
              "loadState": "established",
              "prescribedBaseLoad": 50,
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:hip-extension support",
                "fatigue:moderate",
                "recovery:normal",
                "stability:high",
                "repeat:not_repeated",
                "preference_score:0"
              ]
            },
            {
              "exerciseId": "ex-kneeling-leg-curl",
              "exercise": "Kneeling Leg Curl",
              "movement": "isolation",
              "slotPurpose": "knee-flexion hamstring work",
              "directStimuli": [
                "hamstrings_knee_flexion"
              ],
              "meaningfulSecondaryMuscles": [],
              "exerciseFatigue": "low",
              "workingSets": 5,
              "exactReps": [
                12,
                12,
                12,
                12,
                12
              ],
              "exactTargetKinds": [
                "reps",
                "reps",
                "reps",
                "reps",
                "reps"
              ],
              "method": "straight_sets",
              "loadState": "established",
              "prescribedBaseLoad": 50,
              "restSeconds": 75,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:knee-flexion hamstring work",
                "fatigue:low",
                "recovery:normal",
                "stability:high",
                "repeat:not_repeated",
                "preference_score:0"
              ]
            },
            {
              "exerciseId": "ex-hip-thrust-machine",
              "exercise": "Hip Thrust Machine",
              "movement": "hip_thrust",
              "slotPurpose": "shortened hip-extension stimulus",
              "directStimuli": [
                "hip_extension"
              ],
              "meaningfulSecondaryMuscles": [
                "hamstrings"
              ],
              "exerciseFatigue": "moderate",
              "workingSets": 3,
              "exactReps": [
                10,
                10,
                10
              ],
              "exactTargetKinds": [
                "reps",
                "reps",
                "reps"
              ],
              "method": "straight_sets",
              "loadState": "established",
              "prescribedBaseLoad": 50,
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:shortened hip-extension stimulus",
                "fatigue:moderate",
                "recovery:normal",
                "stability:high",
                "repeat:not_repeated",
                "preference_score:0"
              ]
            },
            {
              "exerciseId": "ex-donkey-calf-raise",
              "exercise": "Donkey Calf Raise",
              "movement": "isolation",
              "slotPurpose": "calf work",
              "directStimuli": [
                "calves"
              ],
              "meaningfulSecondaryMuscles": [],
              "exerciseFatigue": "low",
              "workingSets": 4,
              "exactReps": [
                15,
                15,
                15,
                15
              ],
              "exactTargetKinds": [
                "reps",
                "reps",
                "reps",
                "reps"
              ],
              "method": "straight_sets",
              "loadState": "established",
              "prescribedBaseLoad": 50,
              "restSeconds": 75,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:calf work",
                "fatigue:low",
                "recovery:normal",
                "stability:high",
                "repeat:not_repeated",
                "preference_score:0"
              ]
            }
          ]
        },
        {
          "order": 4,
          "dayOffset": 4,
          "role": "Push hypertrophy D",
          "purpose": "Establish reproducible exercise, load and recovery baselines",
          "workingSets": 17,
          "estimatedMinutes": 49,
          "dosageAssessment": {
            "exerciseCount": 6,
            "workingSets": 17,
            "fourExercisesAndElevenSets": false,
            "outcome": "role_specific_allocation",
            "reason": "6 owned movement/muscle slots supply 17 exact working sets for this session role; appropriateness is certified from full-rotation direct stimulus, secondary stimulus, duration and fatigue rather than a universal exercise count."
          },
          "exercises": [
            {
              "exerciseId": "ex-incline-barbell-bench",
              "exercise": "Incline Barbell Bench",
              "movement": "horizontal_push",
              "slotPurpose": "high-priority horizontal press",
              "directStimuli": [
                "chest"
              ],
              "meaningfulSecondaryMuscles": [
                "shoulders",
                "triceps"
              ],
              "exerciseFatigue": "high",
              "workingSets": 3,
              "exactReps": [
                8,
                8,
                8
              ],
              "exactTargetKinds": [
                "reps",
                "reps",
                "reps"
              ],
              "method": "straight_sets",
              "loadState": "established",
              "prescribedBaseLoad": 50,
              "restSeconds": 150,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:high-priority horizontal press",
                "fatigue:high",
                "recovery:normal",
                "stability:moderate",
                "repeat:not_repeated",
                "preference_score:0"
              ]
            },
            {
              "exerciseId": "ex-decline-plate-loaded-press",
              "exercise": "Decline Plate Loaded Press",
              "movement": "horizontal_push",
              "slotPurpose": "chest work in a complementary press path",
              "directStimuli": [
                "chest"
              ],
              "meaningfulSecondaryMuscles": [
                "triceps"
              ],
              "exerciseFatigue": "moderate",
              "workingSets": 2,
              "exactReps": [
                10,
                10
              ],
              "exactTargetKinds": [
                "reps",
                "reps"
              ],
              "method": "straight_sets",
              "loadState": "established",
              "prescribedBaseLoad": 50,
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:chest work in a complementary press path",
                "fatigue:moderate",
                "recovery:normal",
                "stability:high",
                "repeat:not_repeated",
                "preference_score:0"
              ]
            },
            {
              "exerciseId": "ex-plate-loaded-shoulder-press-machine",
              "exercise": "Plate Loaded Shoulder Press Machine",
              "movement": "vertical_push",
              "slotPurpose": "vertical pressing stimulus",
              "directStimuli": [
                "anterior_delts"
              ],
              "meaningfulSecondaryMuscles": [
                "triceps"
              ],
              "exerciseFatigue": "moderate",
              "workingSets": 4,
              "exactReps": [
                10,
                10,
                10,
                10
              ],
              "exactTargetKinds": [
                "reps",
                "reps",
                "reps",
                "reps"
              ],
              "method": "straight_sets",
              "loadState": "established",
              "prescribedBaseLoad": 50,
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:vertical pressing stimulus",
                "fatigue:moderate",
                "recovery:normal",
                "stability:high",
                "repeat:not_repeated",
                "preference_score:0"
              ]
            },
            {
              "exerciseId": "ex-lateral-raise-plate-loaded",
              "exercise": "Lateral Raise Plate Loaded",
              "movement": "isolation",
              "slotPurpose": "lateral-delt stimulus",
              "directStimuli": [
                "lateral_delts"
              ],
              "meaningfulSecondaryMuscles": [],
              "exerciseFatigue": "low",
              "workingSets": 4,
              "exactReps": [
                15,
                15,
                15,
                15
              ],
              "exactTargetKinds": [
                "reps",
                "reps",
                "reps",
                "reps"
              ],
              "method": "straight_sets",
              "loadState": "established",
              "prescribedBaseLoad": 50,
              "restSeconds": 75,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:lateral-delt stimulus",
                "fatigue:low",
                "recovery:normal",
                "stability:high",
                "repeat:not_repeated",
                "preference_score:0"
              ]
            },
            {
              "exerciseId": "ex-ez-bar-pushdown",
              "exercise": "EZ-Bar Pushdown",
              "movement": "isolation",
              "slotPurpose": "lengthened elbow-extension work",
              "directStimuli": [
                "triceps"
              ],
              "meaningfulSecondaryMuscles": [],
              "exerciseFatigue": "low",
              "workingSets": 2,
              "exactReps": [
                12,
                12
              ],
              "exactTargetKinds": [
                "reps",
                "reps"
              ],
              "method": "straight_sets",
              "loadState": "established",
              "prescribedBaseLoad": 50,
              "restSeconds": 75,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:lengthened elbow-extension work",
                "fatigue:low",
                "recovery:normal",
                "stability:high",
                "repeat:not_repeated",
                "preference_score:0"
              ]
            },
            {
              "exerciseId": "ex-machine-triceps-extension",
              "exercise": "Machine Tricep Extension",
              "movement": "isolation",
              "slotPurpose": "shortened-range triceps finish",
              "directStimuli": [
                "triceps"
              ],
              "meaningfulSecondaryMuscles": [],
              "exerciseFatigue": "low",
              "workingSets": 2,
              "exactReps": [
                12,
                12
              ],
              "exactTargetKinds": [
                "reps",
                "reps"
              ],
              "method": "straight_sets",
              "loadState": "established",
              "prescribedBaseLoad": 50,
              "restSeconds": 75,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:shortened-range triceps finish",
                "fatigue:low",
                "recovery:normal",
                "stability:high",
                "repeat:not_repeated",
                "preference_score:0"
              ]
            }
          ]
        },
        {
          "order": 5,
          "dayOffset": 5,
          "role": "Pull hypertrophy E",
          "purpose": "Establish reproducible exercise, load and recovery baselines",
          "workingSets": 18,
          "estimatedMinutes": 52,
          "dosageAssessment": {
            "exerciseCount": 6,
            "workingSets": 18,
            "fourExercisesAndElevenSets": false,
            "outcome": "role_specific_allocation",
            "reason": "6 owned movement/muscle slots supply 18 exact working sets for this session role; appropriateness is certified from full-rotation direct stimulus, secondary stimulus, duration and fatigue rather than a universal exercise count."
          },
          "exercises": [
            {
              "exerciseId": "ex-high-row-plate-loaded",
              "exercise": "High Row Plate Loaded",
              "movement": "horizontal_pull",
              "slotPurpose": "supported horizontal-pull anchor",
              "directStimuli": [
                "upper_back"
              ],
              "meaningfulSecondaryMuscles": [
                "biceps",
                "rear_delts"
              ],
              "exerciseFatigue": "moderate",
              "workingSets": 3,
              "exactReps": [
                12,
                12,
                12
              ],
              "exactTargetKinds": [
                "reps",
                "reps",
                "reps"
              ],
              "method": "straight_sets",
              "loadState": "established",
              "prescribedBaseLoad": 50,
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:supported horizontal-pull anchor",
                "fatigue:moderate",
                "recovery:normal",
                "stability:high",
                "repeat:not_repeated",
                "preference_score:0"
              ]
            },
            {
              "exerciseId": "ex-lat-pulldown-narrow",
              "exercise": "Lat Pulldown Narrow",
              "movement": "vertical_pull",
              "slotPurpose": "vertical-pull lat stimulus",
              "directStimuli": [
                "lats"
              ],
              "meaningfulSecondaryMuscles": [
                "biceps"
              ],
              "exerciseFatigue": "moderate",
              "workingSets": 3,
              "exactReps": [
                10,
                10,
                10
              ],
              "exactTargetKinds": [
                "reps",
                "reps",
                "reps"
              ],
              "method": "straight_sets",
              "loadState": "established",
              "prescribedBaseLoad": 50,
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:vertical-pull lat stimulus",
                "fatigue:moderate",
                "recovery:normal",
                "stability:high",
                "repeat:not_repeated",
                "preference_score:0"
              ]
            },
            {
              "exerciseId": "ex-low-row-plate-loaded",
              "exercise": "Low Row Plate Loaded",
              "movement": "horizontal_pull",
              "slotPurpose": "upper-back work in a complementary supported row pattern",
              "directStimuli": [
                "upper_back"
              ],
              "meaningfulSecondaryMuscles": [
                "biceps"
              ],
              "exerciseFatigue": "moderate",
              "workingSets": 2,
              "exactReps": [
                10,
                10
              ],
              "exactTargetKinds": [
                "reps",
                "reps"
              ],
              "method": "straight_sets",
              "loadState": "established",
              "prescribedBaseLoad": 50,
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:upper-back work in a complementary supported row pattern",
                "fatigue:moderate",
                "recovery:normal",
                "stability:high",
                "repeat:not_repeated",
                "preference_score:0"
              ]
            },
            {
              "exerciseId": "ex-rear-delt-machine",
              "exercise": "Rear Delt Machine",
              "movement": "isolation",
              "slotPurpose": "rear-delt and scapular work",
              "directStimuli": [
                "rear_delts"
              ],
              "meaningfulSecondaryMuscles": [
                "back"
              ],
              "exerciseFatigue": "low",
              "workingSets": 4,
              "exactReps": [
                15,
                15,
                15,
                15
              ],
              "exactTargetKinds": [
                "reps",
                "reps",
                "reps",
                "reps"
              ],
              "method": "straight_sets",
              "loadState": "established",
              "prescribedBaseLoad": 50,
              "restSeconds": 75,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:rear-delt and scapular work",
                "fatigue:low",
                "recovery:normal",
                "stability:high",
                "repeat:not_repeated",
                "preference_score:0"
              ]
            },
            {
              "exerciseId": "ex-cable-curl",
              "exercise": "Cable Curl",
              "movement": "isolation",
              "slotPurpose": "lengthened elbow-flexor work",
              "directStimuli": [
                "biceps"
              ],
              "meaningfulSecondaryMuscles": [],
              "exerciseFatigue": "low",
              "workingSets": 4,
              "exactReps": [
                12,
                12,
                12,
                12
              ],
              "exactTargetKinds": [
                "reps",
                "reps",
                "reps",
                "reps"
              ],
              "method": "straight_sets",
              "loadState": "established",
              "prescribedBaseLoad": 50,
              "restSeconds": 75,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:lengthened elbow-flexor work",
                "fatigue:low",
                "recovery:normal",
                "stability:high",
                "repeat:not_repeated",
                "preference_score:0"
              ]
            },
            {
              "exerciseId": "ex-lat-pulldown-neutral-close",
              "exercise": "Lat Pulldown Neutral Close",
              "movement": "vertical_pull",
              "slotPurpose": "lat work in a complementary supported grip",
              "directStimuli": [
                "lats"
              ],
              "meaningfulSecondaryMuscles": [
                "biceps"
              ],
              "exerciseFatigue": "moderate",
              "workingSets": 2,
              "exactReps": [
                10,
                10
              ],
              "exactTargetKinds": [
                "reps",
                "reps"
              ],
              "method": "straight_sets",
              "loadState": "established",
              "prescribedBaseLoad": 50,
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:lat work in a complementary supported grip",
                "fatigue:moderate",
                "recovery:normal",
                "stability:high",
                "repeat:not_repeated",
                "preference_score:0"
              ]
            }
          ]
        }
      ],
      "accounting": {
        "directSets": {
          "chest": 11,
          "anterior_delts": 8,
          "lateral_delts": 8,
          "triceps": 8,
          "upper_back": 11,
          "lats": 11,
          "rear_delts": 8,
          "biceps": 8,
          "quadriceps": 7,
          "hip_extension": 6,
          "hamstrings_knee_flexion": 5,
          "calves": 4
        },
        "meaningfulSecondarySets": {
          "triceps": 19,
          "anterior_delts": 9,
          "biceps": 22,
          "rear_delts": 9,
          "upper_back": 11,
          "hip_extension": 4
        },
        "muscleFrequency": {
          "anterior_delts": 2,
          "biceps": 2,
          "calves": 1,
          "chest": 2,
          "hamstrings_knee_flexion": 1,
          "hip_extension": 1,
          "lateral_delts": 2,
          "lats": 2,
          "quadriceps": 1,
          "rear_delts": 2,
          "triceps": 2,
          "upper_back": 2
        },
        "movementPatternExposures": {
          "horizontal_push": 4,
          "vertical_push": 2,
          "isolation": 12,
          "horizontal_pull": 4,
          "vertical_pull": 4,
          "squat": 2,
          "lunge": 2,
          "hinge": 1,
          "hip_thrust": 1
        },
        "primaryLiftExposures": {
          "bench": {
            "primary": 0,
            "secondaryVariation": 0
          },
          "squat": {
            "primary": 0,
            "secondaryVariation": 0
          },
          "deadlift": {
            "primary": 0,
            "secondaryVariation": 0
          }
        },
        "totalWorkingSets": 95,
        "perSessionWorkingSets": [
          18,
          20,
          22,
          17,
          18
        ],
        "perSessionEstimatedMinutes": [
          52,
          59,
          68,
          49,
          52
        ],
        "fatigueUnits": {
          "perSession": [
            32,
            36,
            39,
            29,
            31
          ],
          "weeklyUnits": 167,
          "overlapFlags": []
        },
        "repeatedExercises": []
      },
      "progression": {
        "volumePolicyId": "canonical_hypertrophy_volume_policy_v2",
        "exactRules": {
          "add": "Add one direct set to one local stimulus region only after at least three comparable completed observations show productive performance, recovery is acceptable, the region remains below target, and no rep drop-off or technique contraindication is present.",
          "retain": "Retain dosage when comparable performance is improving or stable inside the target range, or when evidence is not yet sufficient for a safe change.",
          "remove": "Remove one direct set from the affected region after confirmed local rep drop-off or local recovery failure; remove two only when the same fresh signal is repeated and the resulting dose remains above the starting floor.",
          "reallocate": "Reallocate one low-benefit accessory set to a lagging region only when systemic recovery is acceptable, the source region is at or above target, the destination is below target, and both regions have comparable evidence.",
          "systemic": "Systemic fatigue never triggers an automatic local increase. Hold all additions and require stress-reduction review; deload remains a separate Mesocycle decision."
        },
        "nextRotation": "same immutable prescriptions until canonical Progress evidence authorises regeneration",
        "mesocycleExitCriteria": [
          "Main movement and muscle data exists"
        ],
        "approvedNextMesocycles": [
          "hypertrophy_base"
        ]
      },
      "conditioning": {
        "schemaVersion": "canonical_cardio_prescription_v1",
        "policyId": "canonical_concurrent_training_policy_v1",
        "preference": "recommended",
        "status": "active",
        "goal": "build_muscle",
        "sessions": [
          {
            "id": "cert-intermediate-hypertrophy-5-push_pull_legs-established:cardio:1",
            "dayOffset": 3,
            "kind": "recovery_cardio",
            "modality": "incline_walk",
            "durationMinutes": 20,
            "intensity": "easy_zone_2",
            "placement": "recovery_day",
            "progression": "After three completed, well-tolerated sessions, add five minutes to one session; do not add intensity and duration together.",
            "stopOrAdjust": "Stop for pain, dizziness or unusual breathlessness; hold progression and review if lower-body performance or recovery declines."
          },
          {
            "id": "cert-intermediate-hypertrophy-5-push_pull_legs-established:cardio:2",
            "dayOffset": 6,
            "kind": "recovery_cardio",
            "modality": "cycle",
            "durationMinutes": 20,
            "intensity": "easy_zone_2",
            "placement": "recovery_day",
            "progression": "After three completed, well-tolerated sessions, add five minutes to one session; do not add intensity and duration together.",
            "stopOrAdjust": "Stop for pain, dizziness or unusual breathlessness; hold progression and review if lower-body performance or recovery declines."
          }
        ],
        "weeklyFrequency": 2,
        "rationaleCodes": [
          "recovery_capacity",
          "hypertrophy_stimulus_preserved",
          "ordinary_recovery_start"
        ],
        "interferenceRules": [
          "cardio_never_changes_lifting_session_count",
          "hard_conditioning_not_before_priority_lower_session",
          "progress_requires_completed_tolerated_evidence"
        ],
        "recoveryBudget": {
          "cardioMinutes": 40,
          "intervalWorkMinutes": 0,
          "concurrentSportSessions": 0,
          "lowerBodyInterference": "low",
          "resistanceDosageAdjustment": "none"
        }
      },
      "certification": {
        "allocation": {
          "status": "passed",
          "checks": [
            "exact_working_sets_resolved",
            "no_token_hypertrophy_exercises",
            "complete_rotation_meets_normalized_seven_day_starting_floor",
            "session_volume_has_meaningful_work",
            "available_session_duration_respected",
            "slot_targets_resolved",
            "ppl_session_density_authorised",
            "push_identity_preserved",
            "pull_identity_preserved",
            "legs_identity_preserved",
            "strength_assistance_transfer_explained"
          ],
          "failures": []
        },
        "constructed": {
          "status": "passed",
          "checks": [
            "chest_direct_coverage",
            "anterior_delts_direct_coverage",
            "lateral_delts_direct_coverage",
            "triceps_direct_coverage",
            "upper_back_direct_coverage",
            "lats_direct_coverage",
            "rear_delts_direct_coverage",
            "biceps_direct_coverage",
            "quadriceps_direct_coverage",
            "hip_extension_direct_coverage",
            "hamstrings_knee_flexion_direct_coverage",
            "calves_direct_coverage",
            "secondary_stimulus_reported_separately",
            "no_unauthorised_specialist_selection",
            "session_systemic_fatigue_reported_for_comparison",
            "same_role_sessions_complementary:push",
            "same_role_sessions_complementary:pull",
            "high_fatigue_reps_and_rest_appropriate"
          ],
          "failures": []
        }
      }
    }
  ]
}
```
