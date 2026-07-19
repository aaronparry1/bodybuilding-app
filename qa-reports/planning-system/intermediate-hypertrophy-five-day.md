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
                "slot:0:primary horizontal press",
                "slot:1:second-angle chest stimulus",
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
                "slot:0:primary horizontal pull",
                "slot:1:vertical-pull lat stimulus",
                "slot:2:second-angle upper-back stimulus",
                "slot:3:rear-delt and scapular work",
                "slot:4:lengthened elbow-flexor work",
                "slot:5:shortened-range biceps finish"
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
                "slot:0:primary horizontal press",
                "slot:1:second-angle chest stimulus",
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
                "slot:0:primary horizontal pull",
                "slot:1:vertical-pull lat stimulus",
                "slot:2:second-angle upper-back stimulus",
                "slot:3:rear-delt and scapular work",
                "slot:4:lengthened elbow-flexor work",
                "slot:5:shortened-range biceps finish"
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
          "estimatedMinutes": 62,
          "dosageAssessment": {
            "exerciseCount": 6,
            "workingSets": 18,
            "fourExercisesAndElevenSets": false,
            "outcome": "role_specific_allocation",
            "reason": "6 owned movement/muscle slots supply 18 exact working sets for this session role; appropriateness is certified from full-rotation direct stimulus, secondary stimulus, duration and fatigue rather than a universal exercise count."
          },
          "exercises": [
            {
              "exerciseId": "ex-decline-barbell-bench",
              "exercise": "Decline Barbell Bench",
              "movement": "horizontal_push",
              "slotPurpose": "primary horizontal press",
              "directStimuli": [
                "chest"
              ],
              "meaningfulSecondaryMuscles": [
                "triceps",
                "shoulders"
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
                "slot:primary horizontal press",
                "fatigue:moderate",
                "recovery:normal",
                "stability:high",
                "repeat:not_repeated",
                "preference_score:0"
              ]
            },
            {
              "exerciseId": "ex-incline-dumbbell-press",
              "exercise": "Incline Dumbbell Press",
              "movement": "horizontal_push",
              "slotPurpose": "second-angle chest stimulus",
              "directStimuli": [
                "chest"
              ],
              "meaningfulSecondaryMuscles": [
                "shoulders",
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
                "slot:second-angle chest stimulus",
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
              "exerciseId": "ex-cable-lateral-raise",
              "exercise": "Cable Lateral Raise",
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
          "workingSets": 19,
          "estimatedMinutes": 65,
          "dosageAssessment": {
            "exerciseCount": 6,
            "workingSets": 19,
            "fourExercisesAndElevenSets": false,
            "outcome": "role_specific_allocation",
            "reason": "6 owned movement/muscle slots supply 19 exact working sets for this session role; appropriateness is certified from full-rotation direct stimulus, secondary stimulus, duration and fatigue rather than a universal exercise count."
          },
          "exercises": [
            {
              "exerciseId": "ex-barbell-row",
              "exercise": "Barbell Row",
              "movement": "horizontal_pull",
              "slotPurpose": "primary horizontal pull",
              "directStimuli": [
                "upper_back"
              ],
              "meaningfulSecondaryMuscles": [
                "biceps",
                "rear_delts",
                "hamstrings"
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
              "loadState": "calibration_required",
              "restSeconds": 150,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:primary horizontal pull",
                "fatigue:high",
                "recovery:normal",
                "stability:moderate",
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
              "exerciseId": "ex-chest-supported-row",
              "exercise": "Chest Supported Row",
              "movement": "horizontal_pull",
              "slotPurpose": "second-angle upper-back stimulus",
              "directStimuli": [
                "upper_back"
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
                "slot:second-angle upper-back stimulus",
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
              "exerciseId": "ex-bayesian-curl",
              "exercise": "Bayesian Curl",
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
              "exerciseId": "ex-cable-curl",
              "exercise": "Cable Curl",
              "movement": "isolation",
              "slotPurpose": "shortened-range biceps finish",
              "directStimuli": [
                "biceps"
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
                "slot:shortened-range biceps finish",
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
          "order": 3,
          "dayOffset": 2,
          "role": "Legs hypertrophy C",
          "purpose": "Establish reproducible exercise, load and recovery baselines",
          "workingSets": 21,
          "estimatedMinutes": 71,
          "dosageAssessment": {
            "exerciseCount": 6,
            "workingSets": 21,
            "fourExercisesAndElevenSets": false,
            "outcome": "role_specific_allocation",
            "reason": "6 owned movement/muscle slots supply 21 exact working sets for this session role; appropriateness is certified from full-rotation direct stimulus, secondary stimulus, duration and fatigue rather than a universal exercise count."
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
          "workingSets": 18,
          "estimatedMinutes": 62,
          "dosageAssessment": {
            "exerciseCount": 6,
            "workingSets": 18,
            "fourExercisesAndElevenSets": false,
            "outcome": "role_specific_allocation",
            "reason": "6 owned movement/muscle slots supply 18 exact working sets for this session role; appropriateness is certified from full-rotation direct stimulus, secondary stimulus, duration and fatigue rather than a universal exercise count."
          },
          "exercises": [
            {
              "exerciseId": "ex-decline-barbell-bench",
              "exercise": "Decline Barbell Bench",
              "movement": "horizontal_push",
              "slotPurpose": "primary horizontal press",
              "directStimuli": [
                "chest"
              ],
              "meaningfulSecondaryMuscles": [
                "triceps",
                "shoulders"
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
                "slot:primary horizontal press",
                "fatigue:moderate",
                "recovery:normal",
                "stability:high",
                "repeat:stable_primary_practice",
                "preference_score:0"
              ]
            },
            {
              "exerciseId": "ex-decline-plate-loaded-press",
              "exercise": "Decline Plate Loaded Press",
              "movement": "horizontal_push",
              "slotPurpose": "second-angle chest stimulus",
              "directStimuli": [
                "chest"
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
                "slot:second-angle chest stimulus",
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
          "order": 5,
          "dayOffset": 5,
          "role": "Pull hypertrophy E",
          "purpose": "Establish reproducible exercise, load and recovery baselines",
          "workingSets": 19,
          "estimatedMinutes": 65,
          "dosageAssessment": {
            "exerciseCount": 6,
            "workingSets": 19,
            "fourExercisesAndElevenSets": false,
            "outcome": "role_specific_allocation",
            "reason": "6 owned movement/muscle slots supply 19 exact working sets for this session role; appropriateness is certified from full-rotation direct stimulus, secondary stimulus, duration and fatigue rather than a universal exercise count."
          },
          "exercises": [
            {
              "exerciseId": "ex-barbell-row",
              "exercise": "Barbell Row",
              "movement": "horizontal_pull",
              "slotPurpose": "primary horizontal pull",
              "directStimuli": [
                "upper_back"
              ],
              "meaningfulSecondaryMuscles": [
                "biceps",
                "rear_delts",
                "hamstrings"
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
              "loadState": "calibration_required",
              "restSeconds": 150,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:primary horizontal pull",
                "fatigue:high",
                "recovery:normal",
                "stability:moderate",
                "repeat:stable_primary_practice",
                "preference_score:0"
              ]
            },
            {
              "exerciseId": "ex-lat-pulldown-machine",
              "exercise": "Lat Pulldown Machine",
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
              "slotPurpose": "second-angle upper-back stimulus",
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
                "slot:second-angle upper-back stimulus",
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
              "exerciseId": "ex-machine-preacher-curl",
              "exercise": "Machine Preacher Curl",
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
              "exerciseId": "ex-preacher-curl",
              "exercise": "Preacher Curl",
              "movement": "isolation",
              "slotPurpose": "shortened-range biceps finish",
              "directStimuli": [
                "biceps"
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
                "slot:shortened-range biceps finish",
                "fatigue:low",
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
          "chest": 14,
          "anterior_delts": 6,
          "lateral_delts": 6,
          "triceps": 10,
          "upper_back": 14,
          "lats": 8,
          "rear_delts": 6,
          "biceps": 10,
          "quadriceps": 7,
          "hip_extension": 7,
          "hamstrings_knee_flexion": 3,
          "calves": 4
        },
        "meaningfulSecondarySets": {
          "triceps": 20,
          "anterior_delts": 11,
          "biceps": 22,
          "rear_delts": 14,
          "hip_extension": 12,
          "upper_back": 10
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
          "isolation": 14,
          "horizontal_pull": 4,
          "vertical_pull": 2,
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
          19,
          21,
          18,
          19
        ],
        "perSessionEstimatedMinutes": [
          62,
          65,
          71,
          62,
          65
        ],
        "fatigueUnits": {
          "perSession": [
            32,
            34,
            39,
            32,
            34
          ],
          "weeklyUnits": 171,
          "overlapFlags": []
        },
        "repeatedExercises": [
          {
            "exerciseId": "ex-barbell-row",
            "count": 2,
            "reason": "stable_primary_practice"
          },
          {
            "exerciseId": "ex-decline-barbell-bench",
            "count": 2,
            "reason": "stable_primary_practice"
          }
        ]
      },
      "progression": {
        "volumePolicyId": "canonical_hypertrophy_volume_policy_v1",
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
            "session_volume_bounded",
            "session_duration_bounded",
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
            "repeat_authorised:ex-barbell-row",
            "repeat_authorised:ex-decline-barbell-bench"
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
                "slot:0:primary horizontal press",
                "slot:1:second-angle chest stimulus",
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
                "slot:0:primary horizontal pull",
                "slot:1:vertical-pull lat stimulus",
                "slot:2:second-angle upper-back stimulus",
                "slot:3:rear-delt and scapular work",
                "slot:4:lengthened elbow-flexor work",
                "slot:5:shortened-range biceps finish"
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
                "slot:0:primary horizontal press",
                "slot:1:second-angle chest stimulus",
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
                "slot:0:primary horizontal pull",
                "slot:1:vertical-pull lat stimulus",
                "slot:2:second-angle upper-back stimulus",
                "slot:3:rear-delt and scapular work",
                "slot:4:lengthened elbow-flexor work",
                "slot:5:shortened-range biceps finish"
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
          "estimatedMinutes": 62,
          "dosageAssessment": {
            "exerciseCount": 6,
            "workingSets": 18,
            "fourExercisesAndElevenSets": false,
            "outcome": "role_specific_allocation",
            "reason": "6 owned movement/muscle slots supply 18 exact working sets for this session role; appropriateness is certified from full-rotation direct stimulus, secondary stimulus, duration and fatigue rather than a universal exercise count."
          },
          "exercises": [
            {
              "exerciseId": "ex-decline-barbell-bench",
              "exercise": "Decline Barbell Bench",
              "movement": "horizontal_push",
              "slotPurpose": "primary horizontal press",
              "directStimuli": [
                "chest"
              ],
              "meaningfulSecondaryMuscles": [
                "triceps",
                "shoulders"
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
                "slot:primary horizontal press",
                "fatigue:moderate",
                "recovery:normal",
                "stability:high",
                "repeat:not_repeated",
                "preference_score:0"
              ]
            },
            {
              "exerciseId": "ex-incline-dumbbell-press",
              "exercise": "Incline Dumbbell Press",
              "movement": "horizontal_push",
              "slotPurpose": "second-angle chest stimulus",
              "directStimuli": [
                "chest"
              ],
              "meaningfulSecondaryMuscles": [
                "shoulders",
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
              "loadState": "established",
              "prescribedBaseLoad": 50,
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:second-angle chest stimulus",
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
          "workingSets": 19,
          "estimatedMinutes": 65,
          "dosageAssessment": {
            "exerciseCount": 6,
            "workingSets": 19,
            "fourExercisesAndElevenSets": false,
            "outcome": "role_specific_allocation",
            "reason": "6 owned movement/muscle slots supply 19 exact working sets for this session role; appropriateness is certified from full-rotation direct stimulus, secondary stimulus, duration and fatigue rather than a universal exercise count."
          },
          "exercises": [
            {
              "exerciseId": "ex-barbell-row",
              "exercise": "Barbell Row",
              "movement": "horizontal_pull",
              "slotPurpose": "primary horizontal pull",
              "directStimuli": [
                "upper_back"
              ],
              "meaningfulSecondaryMuscles": [
                "biceps",
                "rear_delts",
                "hamstrings"
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
                "slot:primary horizontal pull",
                "fatigue:high",
                "recovery:normal",
                "stability:moderate",
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
              "exerciseId": "ex-chest-supported-row",
              "exercise": "Chest Supported Row",
              "movement": "horizontal_pull",
              "slotPurpose": "second-angle upper-back stimulus",
              "directStimuli": [
                "upper_back"
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
                "slot:second-angle upper-back stimulus",
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
              "exerciseId": "ex-cable-curl",
              "exercise": "Cable Curl",
              "movement": "isolation",
              "slotPurpose": "shortened-range biceps finish",
              "directStimuli": [
                "biceps"
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
                "slot:shortened-range biceps finish",
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
          "order": 3,
          "dayOffset": 2,
          "role": "Legs hypertrophy C",
          "purpose": "Establish reproducible exercise, load and recovery baselines",
          "workingSets": 21,
          "estimatedMinutes": 71,
          "dosageAssessment": {
            "exerciseCount": 6,
            "workingSets": 21,
            "fourExercisesAndElevenSets": false,
            "outcome": "role_specific_allocation",
            "reason": "6 owned movement/muscle slots supply 21 exact working sets for this session role; appropriateness is certified from full-rotation direct stimulus, secondary stimulus, duration and fatigue rather than a universal exercise count."
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
          "workingSets": 18,
          "estimatedMinutes": 62,
          "dosageAssessment": {
            "exerciseCount": 6,
            "workingSets": 18,
            "fourExercisesAndElevenSets": false,
            "outcome": "role_specific_allocation",
            "reason": "6 owned movement/muscle slots supply 18 exact working sets for this session role; appropriateness is certified from full-rotation direct stimulus, secondary stimulus, duration and fatigue rather than a universal exercise count."
          },
          "exercises": [
            {
              "exerciseId": "ex-decline-barbell-bench",
              "exercise": "Decline Barbell Bench",
              "movement": "horizontal_push",
              "slotPurpose": "primary horizontal press",
              "directStimuli": [
                "chest"
              ],
              "meaningfulSecondaryMuscles": [
                "triceps",
                "shoulders"
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
                "slot:primary horizontal press",
                "fatigue:moderate",
                "recovery:normal",
                "stability:high",
                "repeat:stable_primary_practice",
                "preference_score:0"
              ]
            },
            {
              "exerciseId": "ex-decline-plate-loaded-press",
              "exercise": "Decline Plate Loaded Press",
              "movement": "horizontal_push",
              "slotPurpose": "second-angle chest stimulus",
              "directStimuli": [
                "chest"
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
              "loadState": "established",
              "prescribedBaseLoad": 50,
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:second-angle chest stimulus",
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
          "workingSets": 19,
          "estimatedMinutes": 65,
          "dosageAssessment": {
            "exerciseCount": 6,
            "workingSets": 19,
            "fourExercisesAndElevenSets": false,
            "outcome": "role_specific_allocation",
            "reason": "6 owned movement/muscle slots supply 19 exact working sets for this session role; appropriateness is certified from full-rotation direct stimulus, secondary stimulus, duration and fatigue rather than a universal exercise count."
          },
          "exercises": [
            {
              "exerciseId": "ex-barbell-row",
              "exercise": "Barbell Row",
              "movement": "horizontal_pull",
              "slotPurpose": "primary horizontal pull",
              "directStimuli": [
                "upper_back"
              ],
              "meaningfulSecondaryMuscles": [
                "biceps",
                "rear_delts",
                "hamstrings"
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
                "slot:primary horizontal pull",
                "fatigue:high",
                "recovery:normal",
                "stability:moderate",
                "repeat:stable_primary_practice",
                "preference_score:0"
              ]
            },
            {
              "exerciseId": "ex-lat-pulldown-machine",
              "exercise": "Lat Pulldown Machine",
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
              "slotPurpose": "second-angle upper-back stimulus",
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
                "slot:second-angle upper-back stimulus",
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
              "exerciseId": "ex-machine-preacher-curl",
              "exercise": "Machine Preacher Curl",
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
              "exerciseId": "ex-preacher-curl",
              "exercise": "Preacher Curl",
              "movement": "isolation",
              "slotPurpose": "shortened-range biceps finish",
              "directStimuli": [
                "biceps"
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
                "slot:shortened-range biceps finish",
                "fatigue:low",
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
          "chest": 14,
          "anterior_delts": 6,
          "lateral_delts": 6,
          "triceps": 10,
          "upper_back": 14,
          "lats": 8,
          "rear_delts": 6,
          "biceps": 10,
          "quadriceps": 7,
          "hip_extension": 7,
          "hamstrings_knee_flexion": 3,
          "calves": 4
        },
        "meaningfulSecondarySets": {
          "triceps": 20,
          "anterior_delts": 11,
          "biceps": 22,
          "rear_delts": 14,
          "hip_extension": 12,
          "upper_back": 10
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
          "isolation": 14,
          "horizontal_pull": 4,
          "vertical_pull": 2,
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
          19,
          21,
          18,
          19
        ],
        "perSessionEstimatedMinutes": [
          62,
          65,
          71,
          62,
          65
        ],
        "fatigueUnits": {
          "perSession": [
            32,
            34,
            39,
            32,
            34
          ],
          "weeklyUnits": 171,
          "overlapFlags": []
        },
        "repeatedExercises": [
          {
            "exerciseId": "ex-barbell-row",
            "count": 2,
            "reason": "stable_primary_practice"
          },
          {
            "exerciseId": "ex-decline-barbell-bench",
            "count": 2,
            "reason": "stable_primary_practice"
          }
        ]
      },
      "progression": {
        "volumePolicyId": "canonical_hypertrophy_volume_policy_v1",
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
            "session_volume_bounded",
            "session_duration_bounded",
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
            "repeat_authorised:ex-barbell-row",
            "repeat_authorised:ex-decline-barbell-bench"
          ],
          "failures": []
        }
      }
    }
  ]
}
```
