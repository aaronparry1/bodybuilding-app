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
      "id": "intermediate-hypertrophy-5-asc_recommended-calibration",
      "label": "Intermediate Hypertrophy · 5 days · ASC Recommended · no established history",
      "status": "constructed",
      "input": {
        "goal": "build_muscle",
        "experience": "intermediate",
        "frequency": 5,
        "requestedFramework": "let_app_choose",
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
        "macrocycle": "cert-intermediate-hypertrophy-5-asc_recommended-calibration:macrocycle",
        "mesocycle": "hypertrophy_calibration",
        "microcycle": "cert-intermediate-hypertrophy-5-asc_recommended-calibration:microcycle:1",
        "sessionConstruction": "canonical_plan_v3",
        "prescriptionPolicy": "mesocycle_prescription_policy_v1",
        "rationale": {
          "schemaVersion": "canonical_planning_rationale_v1",
          "goalStrategyId": "canonical_goal_hypertrophy_v1",
          "rotationReasons": [
            "framework:push_pull_legs",
            "framework_reason:asc_recommended_for_frequency",
            "goal_strategy:build_muscle",
            "experience:intermediate",
            "frequency:5",
            "mesocycle:hypertrophy_calibration",
            "schedule:calendar_week"
          ],
          "sessionReasons": [
            {
              "planSessionIndex": 0,
              "role": "Push hypertrophy A",
              "reasons": [
                "microcycle_role:Push hypertrophy A",
                "mesocycle_purpose:Establish reproducible exercise, load and recovery baselines",
                "slot:0:primary horizontal press",
                "slot:1:secondary press stimulus",
                "slot:2:lateral-delt stimulus",
                "slot:3:elbow-extension support"
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
                "slot:2:hinge support",
                "slot:3:elbow-flexor support"
              ]
            },
            {
              "planSessionIndex": 2,
              "role": "Legs hypertrophy C",
              "reasons": [
                "microcycle_role:Legs hypertrophy C",
                "mesocycle_purpose:Establish reproducible exercise, load and recovery baselines",
                "slot:0:knee-dominant anchor",
                "slot:1:hip-extension support",
                "slot:2:knee-flexion hamstring work",
                "slot:3:calf work"
              ]
            },
            {
              "planSessionIndex": 3,
              "role": "Upper hypertrophy",
              "reasons": [
                "microcycle_role:Upper hypertrophy",
                "mesocycle_purpose:Establish reproducible exercise, load and recovery baselines",
                "slot:0:upper chest anchor",
                "slot:1:horizontal pulling support",
                "slot:2:vertical pulling support",
                "slot:3:lateral-delt support",
                "slot:4:triceps support",
                "slot:5:biceps support"
              ]
            },
            {
              "planSessionIndex": 4,
              "role": "Lower hypertrophy",
              "reasons": [
                "microcycle_role:Lower hypertrophy",
                "mesocycle_purpose:Establish reproducible exercise, load and recovery baselines",
                "slot:0:knee-dominant anchor",
                "slot:1:hip-extension support",
                "slot:2:knee-flexion hamstring work",
                "slot:3:calf work"
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
        "mode": "calendar_week",
        "resolvedFramework": "push_pull_legs",
        "reason": "asc_recommended_for_frequency",
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
          "workingSets": 9,
          "estimatedMinutes": 35,
          "dosageAssessment": {
            "exerciseCount": 4,
            "workingSets": 9,
            "fourExercisesAndElevenSets": false,
            "outcome": "role_specific_allocation",
            "reason": "4 owned movement/muscle slots supply 9 exact working sets for this session role; appropriateness is certified from full-rotation direct stimulus, secondary stimulus, duration and fatigue rather than a universal exercise count."
          },
          "exercises": [
            {
              "exerciseId": "ex-decline-barbell-bench",
              "exercise": "Decline Barbell Bench",
              "movement": "horizontal_push",
              "slotPurpose": "primary horizontal press",
              "workingSets": 3,
              "exactReps": [
                12,
                12,
                12
              ],
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
              "exerciseId": "ex-decline-plate-loaded-press",
              "exercise": "Decline Plate Loaded Press",
              "movement": "horizontal_push",
              "slotPurpose": "secondary press stimulus",
              "workingSets": 2,
              "exactReps": [
                10,
                10
              ],
              "loadState": "calibration_required",
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:secondary press stimulus",
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
              "workingSets": 2,
              "exactReps": [
                15,
                15
              ],
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
              "slotPurpose": "elbow-extension support",
              "workingSets": 2,
              "exactReps": [
                12,
                12
              ],
              "loadState": "calibration_required",
              "restSeconds": 75,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:elbow-extension support",
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
          "workingSets": 9,
          "estimatedMinutes": 35,
          "dosageAssessment": {
            "exerciseCount": 4,
            "workingSets": 9,
            "fourExercisesAndElevenSets": false,
            "outcome": "role_specific_allocation",
            "reason": "4 owned movement/muscle slots supply 9 exact working sets for this session role; appropriateness is certified from full-rotation direct stimulus, secondary stimulus, duration and fatigue rather than a universal exercise count."
          },
          "exercises": [
            {
              "exerciseId": "ex-barbell-row",
              "exercise": "Barbell Row",
              "movement": "horizontal_pull",
              "slotPurpose": "primary horizontal pull",
              "workingSets": 3,
              "exactReps": [
                8,
                8,
                8
              ],
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
              "workingSets": 2,
              "exactReps": [
                10,
                10
              ],
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
              "exerciseId": "ex-hip-thrust-machine",
              "exercise": "Hip Thrust Machine",
              "movement": "hip_thrust",
              "slotPurpose": "hinge support",
              "workingSets": 2,
              "exactReps": [
                10,
                10
              ],
              "loadState": "calibration_required",
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:hinge support",
                "fatigue:moderate",
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
              "slotPurpose": "elbow-flexor support",
              "workingSets": 2,
              "exactReps": [
                12,
                12
              ],
              "loadState": "calibration_required",
              "restSeconds": 75,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:elbow-flexor support",
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
          "workingSets": 9,
          "estimatedMinutes": 35,
          "dosageAssessment": {
            "exerciseCount": 4,
            "workingSets": 9,
            "fourExercisesAndElevenSets": false,
            "outcome": "role_specific_allocation",
            "reason": "4 owned movement/muscle slots supply 9 exact working sets for this session role; appropriateness is certified from full-rotation direct stimulus, secondary stimulus, duration and fatigue rather than a universal exercise count."
          },
          "exercises": [
            {
              "exerciseId": "ex-hack-squat-machine",
              "exercise": "Hack Squat Machine",
              "movement": "squat",
              "slotPurpose": "knee-dominant anchor",
              "workingSets": 3,
              "exactReps": [
                12,
                12,
                12
              ],
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
              "exerciseId": "ex-machine-glute-drive",
              "exercise": "Machine Glute Drive",
              "movement": "hip_thrust",
              "slotPurpose": "hip-extension support",
              "workingSets": 2,
              "exactReps": [
                10,
                10
              ],
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
              "workingSets": 2,
              "exactReps": [
                12,
                12
              ],
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
              "exerciseId": "ex-donkey-calf-raise",
              "exercise": "Donkey Calf Raise",
              "movement": "isolation",
              "slotPurpose": "calf work",
              "workingSets": 2,
              "exactReps": [
                15,
                15
              ],
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
          "role": "Upper hypertrophy",
          "purpose": "Establish reproducible exercise, load and recovery baselines",
          "workingSets": 13,
          "estimatedMinutes": 47,
          "dosageAssessment": {
            "exerciseCount": 6,
            "workingSets": 13,
            "fourExercisesAndElevenSets": false,
            "outcome": "role_specific_allocation",
            "reason": "6 owned movement/muscle slots supply 13 exact working sets for this session role; appropriateness is certified from full-rotation direct stimulus, secondary stimulus, duration and fatigue rather than a universal exercise count."
          },
          "exercises": [
            {
              "exerciseId": "ex-decline-barbell-bench",
              "exercise": "Decline Barbell Bench",
              "movement": "horizontal_push",
              "slotPurpose": "upper chest anchor",
              "workingSets": 3,
              "exactReps": [
                12,
                12,
                12
              ],
              "loadState": "calibration_required",
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:upper chest anchor",
                "fatigue:moderate",
                "recovery:normal",
                "stability:high",
                "repeat:stable_primary_practice",
                "preference_score:0"
              ]
            },
            {
              "exerciseId": "ex-chest-supported-row",
              "exercise": "Chest Supported Row",
              "movement": "horizontal_pull",
              "slotPurpose": "horizontal pulling support",
              "workingSets": 2,
              "exactReps": [
                10,
                10
              ],
              "loadState": "calibration_required",
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:horizontal pulling support",
                "fatigue:moderate",
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
              "slotPurpose": "vertical pulling support",
              "workingSets": 2,
              "exactReps": [
                10,
                10
              ],
              "loadState": "calibration_required",
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:vertical pulling support",
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
              "slotPurpose": "lateral-delt support",
              "workingSets": 2,
              "exactReps": [
                15,
                15
              ],
              "loadState": "calibration_required",
              "restSeconds": 75,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:lateral-delt support",
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
              "slotPurpose": "triceps support",
              "workingSets": 2,
              "exactReps": [
                12,
                12
              ],
              "loadState": "calibration_required",
              "restSeconds": 75,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:triceps support",
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
              "slotPurpose": "biceps support",
              "workingSets": 2,
              "exactReps": [
                12,
                12
              ],
              "loadState": "calibration_required",
              "restSeconds": 75,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:biceps support",
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
          "role": "Lower hypertrophy",
          "purpose": "Establish reproducible exercise, load and recovery baselines",
          "workingSets": 9,
          "estimatedMinutes": 35,
          "dosageAssessment": {
            "exerciseCount": 4,
            "workingSets": 9,
            "fourExercisesAndElevenSets": false,
            "outcome": "role_specific_allocation",
            "reason": "4 owned movement/muscle slots supply 9 exact working sets for this session role; appropriateness is certified from full-rotation direct stimulus, secondary stimulus, duration and fatigue rather than a universal exercise count."
          },
          "exercises": [
            {
              "exerciseId": "ex-hack-squat-machine",
              "exercise": "Hack Squat Machine",
              "movement": "squat",
              "slotPurpose": "knee-dominant anchor",
              "workingSets": 3,
              "exactReps": [
                12,
                12,
                12
              ],
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
                "repeat:stable_primary_practice",
                "preference_score:0"
              ]
            },
            {
              "exerciseId": "ex-stiff-leg-deadlift",
              "exercise": "Stiff-Leg Deadlift",
              "movement": "hinge",
              "slotPurpose": "hip-extension support",
              "workingSets": 2,
              "exactReps": [
                10,
                10
              ],
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
              "exerciseId": "ex-lying-leg-curl",
              "exercise": "Lying Leg Curl",
              "movement": "isolation",
              "slotPurpose": "knee-flexion hamstring work",
              "workingSets": 2,
              "exactReps": [
                12,
                12
              ],
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
              "exerciseId": "ex-machine-calf-raise",
              "exercise": "Machine Calf Raise",
              "movement": "isolation",
              "slotPurpose": "calf work",
              "workingSets": 2,
              "exactReps": [
                15,
                15
              ],
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
        }
      ],
      "accounting": {
        "directSets": {
          "chest": 8,
          "lateral_delts": 4,
          "triceps": 4,
          "upper_back": 5,
          "lats": 4,
          "hip_extension": 6,
          "biceps": 4,
          "quadriceps": 6,
          "hamstrings_knee_flexion": 4,
          "calves": 4
        },
        "meaningfulSecondarySets": {
          "triceps": 8,
          "anterior_delts": 6,
          "biceps": 9,
          "rear_delts": 5,
          "hip_extension": 11,
          "upper_back": 2
        },
        "muscleFrequency": {
          "biceps": 2,
          "calves": 2,
          "chest": 2,
          "hamstrings_knee_flexion": 2,
          "hip_extension": 3,
          "lateral_delts": 2,
          "lats": 2,
          "quadriceps": 2,
          "triceps": 2,
          "upper_back": 2
        },
        "movementPatternExposures": {
          "horizontal_push": 3,
          "vertical_push": 1,
          "isolation": 10,
          "horizontal_pull": 2,
          "vertical_pull": 2,
          "hinge": 3,
          "hip_thrust": 3,
          "squat": 2,
          "lunge": 2
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
        "totalWorkingSets": 49,
        "perSessionWorkingSets": [
          9,
          9,
          9,
          13,
          9
        ],
        "perSessionEstimatedMinutes": [
          35,
          35,
          35,
          47,
          35
        ],
        "fatigueUnits": {
          "perSession": [
            17,
            19,
            17,
            23,
            17
          ],
          "weeklyUnits": 93,
          "overlapFlags": [
            "more_than_three_primary_sessions"
          ]
        },
        "repeatedExercises": [
          {
            "exerciseId": "ex-decline-barbell-bench",
            "count": 2,
            "reason": "stable_primary_practice"
          },
          {
            "exerciseId": "ex-hack-squat-machine",
            "count": 2,
            "reason": "stable_primary_practice"
          }
        ]
      },
      "progression": {
        "nextRotation": "same immutable prescriptions until canonical Progress evidence authorises regeneration",
        "mesocycleExitCriteria": [
          "Main movement and muscle data exists"
        ],
        "approvedNextMesocycles": [
          "hypertrophy_base"
        ]
      },
      "certification": {
        "allocation": {
          "status": "passed",
          "checks": [
            "exact_working_sets_resolved",
            "session_volume_bounded",
            "session_duration_bounded",
            "slot_targets_resolved"
          ],
          "failures": []
        },
        "constructed": {
          "status": "passed",
          "checks": [
            "chest_direct_coverage",
            "lateral_delts_direct_coverage",
            "triceps_direct_coverage",
            "upper_back_direct_coverage",
            "lats_direct_coverage",
            "hip_extension_direct_coverage",
            "biceps_direct_coverage",
            "quadriceps_direct_coverage",
            "hamstrings_knee_flexion_direct_coverage",
            "calves_direct_coverage",
            "secondary_stimulus_reported_separately",
            "no_unauthorised_specialist_selection",
            "repeat_authorised:ex-decline-barbell-bench",
            "repeat_authorised:ex-hack-squat-machine"
          ],
          "failures": []
        }
      }
    },
    {
      "id": "intermediate-hypertrophy-5-asc_recommended-established",
      "label": "Intermediate Hypertrophy · 5 days · ASC Recommended · established comparable history",
      "status": "constructed",
      "input": {
        "goal": "build_muscle",
        "experience": "intermediate",
        "frequency": 5,
        "requestedFramework": "let_app_choose",
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
        "macrocycle": "cert-intermediate-hypertrophy-5-asc_recommended-established:macrocycle",
        "mesocycle": "hypertrophy_calibration",
        "microcycle": "cert-intermediate-hypertrophy-5-asc_recommended-established:microcycle:1",
        "sessionConstruction": "canonical_plan_v3",
        "prescriptionPolicy": "mesocycle_prescription_policy_v1",
        "rationale": {
          "schemaVersion": "canonical_planning_rationale_v1",
          "goalStrategyId": "canonical_goal_hypertrophy_v1",
          "rotationReasons": [
            "framework:push_pull_legs",
            "framework_reason:asc_recommended_for_frequency",
            "goal_strategy:build_muscle",
            "experience:intermediate",
            "frequency:5",
            "mesocycle:hypertrophy_calibration",
            "schedule:calendar_week"
          ],
          "sessionReasons": [
            {
              "planSessionIndex": 0,
              "role": "Push hypertrophy A",
              "reasons": [
                "microcycle_role:Push hypertrophy A",
                "mesocycle_purpose:Establish reproducible exercise, load and recovery baselines",
                "slot:0:primary horizontal press",
                "slot:1:secondary press stimulus",
                "slot:2:lateral-delt stimulus",
                "slot:3:elbow-extension support"
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
                "slot:2:hinge support",
                "slot:3:elbow-flexor support"
              ]
            },
            {
              "planSessionIndex": 2,
              "role": "Legs hypertrophy C",
              "reasons": [
                "microcycle_role:Legs hypertrophy C",
                "mesocycle_purpose:Establish reproducible exercise, load and recovery baselines",
                "slot:0:knee-dominant anchor",
                "slot:1:hip-extension support",
                "slot:2:knee-flexion hamstring work",
                "slot:3:calf work"
              ]
            },
            {
              "planSessionIndex": 3,
              "role": "Upper hypertrophy",
              "reasons": [
                "microcycle_role:Upper hypertrophy",
                "mesocycle_purpose:Establish reproducible exercise, load and recovery baselines",
                "slot:0:upper chest anchor",
                "slot:1:horizontal pulling support",
                "slot:2:vertical pulling support",
                "slot:3:lateral-delt support",
                "slot:4:triceps support",
                "slot:5:biceps support"
              ]
            },
            {
              "planSessionIndex": 4,
              "role": "Lower hypertrophy",
              "reasons": [
                "microcycle_role:Lower hypertrophy",
                "mesocycle_purpose:Establish reproducible exercise, load and recovery baselines",
                "slot:0:knee-dominant anchor",
                "slot:1:hip-extension support",
                "slot:2:knee-flexion hamstring work",
                "slot:3:calf work"
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
        "mode": "calendar_week",
        "resolvedFramework": "push_pull_legs",
        "reason": "asc_recommended_for_frequency",
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
          "workingSets": 9,
          "estimatedMinutes": 35,
          "dosageAssessment": {
            "exerciseCount": 4,
            "workingSets": 9,
            "fourExercisesAndElevenSets": false,
            "outcome": "role_specific_allocation",
            "reason": "4 owned movement/muscle slots supply 9 exact working sets for this session role; appropriateness is certified from full-rotation direct stimulus, secondary stimulus, duration and fatigue rather than a universal exercise count."
          },
          "exercises": [
            {
              "exerciseId": "ex-decline-barbell-bench",
              "exercise": "Decline Barbell Bench",
              "movement": "horizontal_push",
              "slotPurpose": "primary horizontal press",
              "workingSets": 3,
              "exactReps": [
                12,
                12,
                12
              ],
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
              "exerciseId": "ex-decline-plate-loaded-press",
              "exercise": "Decline Plate Loaded Press",
              "movement": "horizontal_push",
              "slotPurpose": "secondary press stimulus",
              "workingSets": 2,
              "exactReps": [
                10,
                10
              ],
              "loadState": "established",
              "prescribedBaseLoad": 50,
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:secondary press stimulus",
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
              "workingSets": 2,
              "exactReps": [
                15,
                15
              ],
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
              "slotPurpose": "elbow-extension support",
              "workingSets": 2,
              "exactReps": [
                12,
                12
              ],
              "loadState": "established",
              "prescribedBaseLoad": 50,
              "restSeconds": 75,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:elbow-extension support",
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
          "workingSets": 9,
          "estimatedMinutes": 35,
          "dosageAssessment": {
            "exerciseCount": 4,
            "workingSets": 9,
            "fourExercisesAndElevenSets": false,
            "outcome": "role_specific_allocation",
            "reason": "4 owned movement/muscle slots supply 9 exact working sets for this session role; appropriateness is certified from full-rotation direct stimulus, secondary stimulus, duration and fatigue rather than a universal exercise count."
          },
          "exercises": [
            {
              "exerciseId": "ex-barbell-row",
              "exercise": "Barbell Row",
              "movement": "horizontal_pull",
              "slotPurpose": "primary horizontal pull",
              "workingSets": 3,
              "exactReps": [
                8,
                8,
                8
              ],
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
              "workingSets": 2,
              "exactReps": [
                10,
                10
              ],
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
              "exerciseId": "ex-hip-thrust-machine",
              "exercise": "Hip Thrust Machine",
              "movement": "hip_thrust",
              "slotPurpose": "hinge support",
              "workingSets": 2,
              "exactReps": [
                10,
                10
              ],
              "loadState": "established",
              "prescribedBaseLoad": 50,
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:hinge support",
                "fatigue:moderate",
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
              "slotPurpose": "elbow-flexor support",
              "workingSets": 2,
              "exactReps": [
                12,
                12
              ],
              "loadState": "established",
              "prescribedBaseLoad": 50,
              "restSeconds": 75,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:elbow-flexor support",
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
          "workingSets": 9,
          "estimatedMinutes": 35,
          "dosageAssessment": {
            "exerciseCount": 4,
            "workingSets": 9,
            "fourExercisesAndElevenSets": false,
            "outcome": "role_specific_allocation",
            "reason": "4 owned movement/muscle slots supply 9 exact working sets for this session role; appropriateness is certified from full-rotation direct stimulus, secondary stimulus, duration and fatigue rather than a universal exercise count."
          },
          "exercises": [
            {
              "exerciseId": "ex-hack-squat-machine",
              "exercise": "Hack Squat Machine",
              "movement": "squat",
              "slotPurpose": "knee-dominant anchor",
              "workingSets": 3,
              "exactReps": [
                12,
                12,
                12
              ],
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
              "exerciseId": "ex-machine-glute-drive",
              "exercise": "Machine Glute Drive",
              "movement": "hip_thrust",
              "slotPurpose": "hip-extension support",
              "workingSets": 2,
              "exactReps": [
                10,
                10
              ],
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
              "workingSets": 2,
              "exactReps": [
                12,
                12
              ],
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
              "exerciseId": "ex-donkey-calf-raise",
              "exercise": "Donkey Calf Raise",
              "movement": "isolation",
              "slotPurpose": "calf work",
              "workingSets": 2,
              "exactReps": [
                15,
                15
              ],
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
          "role": "Upper hypertrophy",
          "purpose": "Establish reproducible exercise, load and recovery baselines",
          "workingSets": 13,
          "estimatedMinutes": 47,
          "dosageAssessment": {
            "exerciseCount": 6,
            "workingSets": 13,
            "fourExercisesAndElevenSets": false,
            "outcome": "role_specific_allocation",
            "reason": "6 owned movement/muscle slots supply 13 exact working sets for this session role; appropriateness is certified from full-rotation direct stimulus, secondary stimulus, duration and fatigue rather than a universal exercise count."
          },
          "exercises": [
            {
              "exerciseId": "ex-decline-barbell-bench",
              "exercise": "Decline Barbell Bench",
              "movement": "horizontal_push",
              "slotPurpose": "upper chest anchor",
              "workingSets": 3,
              "exactReps": [
                12,
                12,
                12
              ],
              "loadState": "established",
              "prescribedBaseLoad": 50,
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:upper chest anchor",
                "fatigue:moderate",
                "recovery:normal",
                "stability:high",
                "repeat:stable_primary_practice",
                "preference_score:0"
              ]
            },
            {
              "exerciseId": "ex-chest-supported-row",
              "exercise": "Chest Supported Row",
              "movement": "horizontal_pull",
              "slotPurpose": "horizontal pulling support",
              "workingSets": 2,
              "exactReps": [
                10,
                10
              ],
              "loadState": "established",
              "prescribedBaseLoad": 50,
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:horizontal pulling support",
                "fatigue:moderate",
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
              "slotPurpose": "vertical pulling support",
              "workingSets": 2,
              "exactReps": [
                10,
                10
              ],
              "loadState": "established",
              "prescribedBaseLoad": 50,
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:vertical pulling support",
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
              "slotPurpose": "lateral-delt support",
              "workingSets": 2,
              "exactReps": [
                15,
                15
              ],
              "loadState": "established",
              "prescribedBaseLoad": 50,
              "restSeconds": 75,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:lateral-delt support",
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
              "slotPurpose": "triceps support",
              "workingSets": 2,
              "exactReps": [
                12,
                12
              ],
              "loadState": "established",
              "prescribedBaseLoad": 50,
              "restSeconds": 75,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:triceps support",
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
              "slotPurpose": "biceps support",
              "workingSets": 2,
              "exactReps": [
                12,
                12
              ],
              "loadState": "established",
              "prescribedBaseLoad": 50,
              "restSeconds": 75,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:biceps support",
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
          "role": "Lower hypertrophy",
          "purpose": "Establish reproducible exercise, load and recovery baselines",
          "workingSets": 9,
          "estimatedMinutes": 35,
          "dosageAssessment": {
            "exerciseCount": 4,
            "workingSets": 9,
            "fourExercisesAndElevenSets": false,
            "outcome": "role_specific_allocation",
            "reason": "4 owned movement/muscle slots supply 9 exact working sets for this session role; appropriateness is certified from full-rotation direct stimulus, secondary stimulus, duration and fatigue rather than a universal exercise count."
          },
          "exercises": [
            {
              "exerciseId": "ex-hack-squat-machine",
              "exercise": "Hack Squat Machine",
              "movement": "squat",
              "slotPurpose": "knee-dominant anchor",
              "workingSets": 3,
              "exactReps": [
                12,
                12,
                12
              ],
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
                "repeat:stable_primary_practice",
                "preference_score:0"
              ]
            },
            {
              "exerciseId": "ex-stiff-leg-deadlift",
              "exercise": "Stiff-Leg Deadlift",
              "movement": "hinge",
              "slotPurpose": "hip-extension support",
              "workingSets": 2,
              "exactReps": [
                10,
                10
              ],
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
              "exerciseId": "ex-lying-leg-curl",
              "exercise": "Lying Leg Curl",
              "movement": "isolation",
              "slotPurpose": "knee-flexion hamstring work",
              "workingSets": 2,
              "exactReps": [
                12,
                12
              ],
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
              "exerciseId": "ex-machine-calf-raise",
              "exercise": "Machine Calf Raise",
              "movement": "isolation",
              "slotPurpose": "calf work",
              "workingSets": 2,
              "exactReps": [
                15,
                15
              ],
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
        }
      ],
      "accounting": {
        "directSets": {
          "chest": 8,
          "lateral_delts": 4,
          "triceps": 4,
          "upper_back": 5,
          "lats": 4,
          "hip_extension": 6,
          "biceps": 4,
          "quadriceps": 6,
          "hamstrings_knee_flexion": 4,
          "calves": 4
        },
        "meaningfulSecondarySets": {
          "triceps": 8,
          "anterior_delts": 6,
          "biceps": 9,
          "rear_delts": 5,
          "hip_extension": 11,
          "upper_back": 2
        },
        "muscleFrequency": {
          "biceps": 2,
          "calves": 2,
          "chest": 2,
          "hamstrings_knee_flexion": 2,
          "hip_extension": 3,
          "lateral_delts": 2,
          "lats": 2,
          "quadriceps": 2,
          "triceps": 2,
          "upper_back": 2
        },
        "movementPatternExposures": {
          "horizontal_push": 3,
          "vertical_push": 1,
          "isolation": 10,
          "horizontal_pull": 2,
          "vertical_pull": 2,
          "hinge": 3,
          "hip_thrust": 3,
          "squat": 2,
          "lunge": 2
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
        "totalWorkingSets": 49,
        "perSessionWorkingSets": [
          9,
          9,
          9,
          13,
          9
        ],
        "perSessionEstimatedMinutes": [
          35,
          35,
          35,
          47,
          35
        ],
        "fatigueUnits": {
          "perSession": [
            17,
            19,
            17,
            23,
            17
          ],
          "weeklyUnits": 93,
          "overlapFlags": [
            "more_than_three_primary_sessions"
          ]
        },
        "repeatedExercises": [
          {
            "exerciseId": "ex-decline-barbell-bench",
            "count": 2,
            "reason": "stable_primary_practice"
          },
          {
            "exerciseId": "ex-hack-squat-machine",
            "count": 2,
            "reason": "stable_primary_practice"
          }
        ]
      },
      "progression": {
        "nextRotation": "same immutable prescriptions until canonical Progress evidence authorises regeneration",
        "mesocycleExitCriteria": [
          "Main movement and muscle data exists"
        ],
        "approvedNextMesocycles": [
          "hypertrophy_base"
        ]
      },
      "certification": {
        "allocation": {
          "status": "passed",
          "checks": [
            "exact_working_sets_resolved",
            "session_volume_bounded",
            "session_duration_bounded",
            "slot_targets_resolved"
          ],
          "failures": []
        },
        "constructed": {
          "status": "passed",
          "checks": [
            "chest_direct_coverage",
            "lateral_delts_direct_coverage",
            "triceps_direct_coverage",
            "upper_back_direct_coverage",
            "lats_direct_coverage",
            "hip_extension_direct_coverage",
            "biceps_direct_coverage",
            "quadriceps_direct_coverage",
            "hamstrings_knee_flexion_direct_coverage",
            "calves_direct_coverage",
            "secondary_stimulus_reported_separately",
            "no_unauthorised_specialist_selection",
            "repeat_authorised:ex-decline-barbell-bench",
            "repeat_authorised:ex-hack-squat-machine"
          ],
          "failures": []
        }
      }
    },
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
            "schedule:calendar_week"
          ],
          "sessionReasons": [
            {
              "planSessionIndex": 0,
              "role": "Push hypertrophy A",
              "reasons": [
                "microcycle_role:Push hypertrophy A",
                "mesocycle_purpose:Establish reproducible exercise, load and recovery baselines",
                "slot:0:primary horizontal press",
                "slot:1:secondary press stimulus",
                "slot:2:lateral-delt stimulus",
                "slot:3:elbow-extension support"
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
                "slot:2:hinge support",
                "slot:3:elbow-flexor support"
              ]
            },
            {
              "planSessionIndex": 2,
              "role": "Legs hypertrophy C",
              "reasons": [
                "microcycle_role:Legs hypertrophy C",
                "mesocycle_purpose:Establish reproducible exercise, load and recovery baselines",
                "slot:0:knee-dominant anchor",
                "slot:1:hip-extension support",
                "slot:2:knee-flexion hamstring work",
                "slot:3:calf work"
              ]
            },
            {
              "planSessionIndex": 3,
              "role": "Upper hypertrophy",
              "reasons": [
                "microcycle_role:Upper hypertrophy",
                "mesocycle_purpose:Establish reproducible exercise, load and recovery baselines",
                "slot:0:upper chest anchor",
                "slot:1:horizontal pulling support",
                "slot:2:vertical pulling support",
                "slot:3:lateral-delt support",
                "slot:4:triceps support",
                "slot:5:biceps support"
              ]
            },
            {
              "planSessionIndex": 4,
              "role": "Lower hypertrophy",
              "reasons": [
                "microcycle_role:Lower hypertrophy",
                "mesocycle_purpose:Establish reproducible exercise, load and recovery baselines",
                "slot:0:knee-dominant anchor",
                "slot:1:hip-extension support",
                "slot:2:knee-flexion hamstring work",
                "slot:3:calf work"
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
        "mode": "calendar_week",
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
          "workingSets": 9,
          "estimatedMinutes": 35,
          "dosageAssessment": {
            "exerciseCount": 4,
            "workingSets": 9,
            "fourExercisesAndElevenSets": false,
            "outcome": "role_specific_allocation",
            "reason": "4 owned movement/muscle slots supply 9 exact working sets for this session role; appropriateness is certified from full-rotation direct stimulus, secondary stimulus, duration and fatigue rather than a universal exercise count."
          },
          "exercises": [
            {
              "exerciseId": "ex-decline-barbell-bench",
              "exercise": "Decline Barbell Bench",
              "movement": "horizontal_push",
              "slotPurpose": "primary horizontal press",
              "workingSets": 3,
              "exactReps": [
                12,
                12,
                12
              ],
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
              "exerciseId": "ex-decline-plate-loaded-press",
              "exercise": "Decline Plate Loaded Press",
              "movement": "horizontal_push",
              "slotPurpose": "secondary press stimulus",
              "workingSets": 2,
              "exactReps": [
                10,
                10
              ],
              "loadState": "calibration_required",
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:secondary press stimulus",
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
              "workingSets": 2,
              "exactReps": [
                15,
                15
              ],
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
              "slotPurpose": "elbow-extension support",
              "workingSets": 2,
              "exactReps": [
                12,
                12
              ],
              "loadState": "calibration_required",
              "restSeconds": 75,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:elbow-extension support",
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
          "workingSets": 9,
          "estimatedMinutes": 35,
          "dosageAssessment": {
            "exerciseCount": 4,
            "workingSets": 9,
            "fourExercisesAndElevenSets": false,
            "outcome": "role_specific_allocation",
            "reason": "4 owned movement/muscle slots supply 9 exact working sets for this session role; appropriateness is certified from full-rotation direct stimulus, secondary stimulus, duration and fatigue rather than a universal exercise count."
          },
          "exercises": [
            {
              "exerciseId": "ex-barbell-row",
              "exercise": "Barbell Row",
              "movement": "horizontal_pull",
              "slotPurpose": "primary horizontal pull",
              "workingSets": 3,
              "exactReps": [
                8,
                8,
                8
              ],
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
              "workingSets": 2,
              "exactReps": [
                10,
                10
              ],
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
              "exerciseId": "ex-hip-thrust-machine",
              "exercise": "Hip Thrust Machine",
              "movement": "hip_thrust",
              "slotPurpose": "hinge support",
              "workingSets": 2,
              "exactReps": [
                10,
                10
              ],
              "loadState": "calibration_required",
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:hinge support",
                "fatigue:moderate",
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
              "slotPurpose": "elbow-flexor support",
              "workingSets": 2,
              "exactReps": [
                12,
                12
              ],
              "loadState": "calibration_required",
              "restSeconds": 75,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:elbow-flexor support",
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
          "workingSets": 9,
          "estimatedMinutes": 35,
          "dosageAssessment": {
            "exerciseCount": 4,
            "workingSets": 9,
            "fourExercisesAndElevenSets": false,
            "outcome": "role_specific_allocation",
            "reason": "4 owned movement/muscle slots supply 9 exact working sets for this session role; appropriateness is certified from full-rotation direct stimulus, secondary stimulus, duration and fatigue rather than a universal exercise count."
          },
          "exercises": [
            {
              "exerciseId": "ex-hack-squat-machine",
              "exercise": "Hack Squat Machine",
              "movement": "squat",
              "slotPurpose": "knee-dominant anchor",
              "workingSets": 3,
              "exactReps": [
                12,
                12,
                12
              ],
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
              "exerciseId": "ex-machine-glute-drive",
              "exercise": "Machine Glute Drive",
              "movement": "hip_thrust",
              "slotPurpose": "hip-extension support",
              "workingSets": 2,
              "exactReps": [
                10,
                10
              ],
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
              "workingSets": 2,
              "exactReps": [
                12,
                12
              ],
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
              "exerciseId": "ex-donkey-calf-raise",
              "exercise": "Donkey Calf Raise",
              "movement": "isolation",
              "slotPurpose": "calf work",
              "workingSets": 2,
              "exactReps": [
                15,
                15
              ],
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
          "role": "Upper hypertrophy",
          "purpose": "Establish reproducible exercise, load and recovery baselines",
          "workingSets": 13,
          "estimatedMinutes": 47,
          "dosageAssessment": {
            "exerciseCount": 6,
            "workingSets": 13,
            "fourExercisesAndElevenSets": false,
            "outcome": "role_specific_allocation",
            "reason": "6 owned movement/muscle slots supply 13 exact working sets for this session role; appropriateness is certified from full-rotation direct stimulus, secondary stimulus, duration and fatigue rather than a universal exercise count."
          },
          "exercises": [
            {
              "exerciseId": "ex-decline-barbell-bench",
              "exercise": "Decline Barbell Bench",
              "movement": "horizontal_push",
              "slotPurpose": "upper chest anchor",
              "workingSets": 3,
              "exactReps": [
                12,
                12,
                12
              ],
              "loadState": "calibration_required",
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:upper chest anchor",
                "fatigue:moderate",
                "recovery:normal",
                "stability:high",
                "repeat:stable_primary_practice",
                "preference_score:0"
              ]
            },
            {
              "exerciseId": "ex-chest-supported-row",
              "exercise": "Chest Supported Row",
              "movement": "horizontal_pull",
              "slotPurpose": "horizontal pulling support",
              "workingSets": 2,
              "exactReps": [
                10,
                10
              ],
              "loadState": "calibration_required",
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:horizontal pulling support",
                "fatigue:moderate",
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
              "slotPurpose": "vertical pulling support",
              "workingSets": 2,
              "exactReps": [
                10,
                10
              ],
              "loadState": "calibration_required",
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:vertical pulling support",
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
              "slotPurpose": "lateral-delt support",
              "workingSets": 2,
              "exactReps": [
                15,
                15
              ],
              "loadState": "calibration_required",
              "restSeconds": 75,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:lateral-delt support",
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
              "slotPurpose": "triceps support",
              "workingSets": 2,
              "exactReps": [
                12,
                12
              ],
              "loadState": "calibration_required",
              "restSeconds": 75,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:triceps support",
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
              "slotPurpose": "biceps support",
              "workingSets": 2,
              "exactReps": [
                12,
                12
              ],
              "loadState": "calibration_required",
              "restSeconds": 75,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:biceps support",
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
          "role": "Lower hypertrophy",
          "purpose": "Establish reproducible exercise, load and recovery baselines",
          "workingSets": 9,
          "estimatedMinutes": 35,
          "dosageAssessment": {
            "exerciseCount": 4,
            "workingSets": 9,
            "fourExercisesAndElevenSets": false,
            "outcome": "role_specific_allocation",
            "reason": "4 owned movement/muscle slots supply 9 exact working sets for this session role; appropriateness is certified from full-rotation direct stimulus, secondary stimulus, duration and fatigue rather than a universal exercise count."
          },
          "exercises": [
            {
              "exerciseId": "ex-hack-squat-machine",
              "exercise": "Hack Squat Machine",
              "movement": "squat",
              "slotPurpose": "knee-dominant anchor",
              "workingSets": 3,
              "exactReps": [
                12,
                12,
                12
              ],
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
                "repeat:stable_primary_practice",
                "preference_score:0"
              ]
            },
            {
              "exerciseId": "ex-stiff-leg-deadlift",
              "exercise": "Stiff-Leg Deadlift",
              "movement": "hinge",
              "slotPurpose": "hip-extension support",
              "workingSets": 2,
              "exactReps": [
                10,
                10
              ],
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
              "exerciseId": "ex-lying-leg-curl",
              "exercise": "Lying Leg Curl",
              "movement": "isolation",
              "slotPurpose": "knee-flexion hamstring work",
              "workingSets": 2,
              "exactReps": [
                12,
                12
              ],
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
              "exerciseId": "ex-machine-calf-raise",
              "exercise": "Machine Calf Raise",
              "movement": "isolation",
              "slotPurpose": "calf work",
              "workingSets": 2,
              "exactReps": [
                15,
                15
              ],
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
        }
      ],
      "accounting": {
        "directSets": {
          "chest": 8,
          "lateral_delts": 4,
          "triceps": 4,
          "upper_back": 5,
          "lats": 4,
          "hip_extension": 6,
          "biceps": 4,
          "quadriceps": 6,
          "hamstrings_knee_flexion": 4,
          "calves": 4
        },
        "meaningfulSecondarySets": {
          "triceps": 8,
          "anterior_delts": 6,
          "biceps": 9,
          "rear_delts": 5,
          "hip_extension": 11,
          "upper_back": 2
        },
        "muscleFrequency": {
          "biceps": 2,
          "calves": 2,
          "chest": 2,
          "hamstrings_knee_flexion": 2,
          "hip_extension": 3,
          "lateral_delts": 2,
          "lats": 2,
          "quadriceps": 2,
          "triceps": 2,
          "upper_back": 2
        },
        "movementPatternExposures": {
          "horizontal_push": 3,
          "vertical_push": 1,
          "isolation": 10,
          "horizontal_pull": 2,
          "vertical_pull": 2,
          "hinge": 3,
          "hip_thrust": 3,
          "squat": 2,
          "lunge": 2
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
        "totalWorkingSets": 49,
        "perSessionWorkingSets": [
          9,
          9,
          9,
          13,
          9
        ],
        "perSessionEstimatedMinutes": [
          35,
          35,
          35,
          47,
          35
        ],
        "fatigueUnits": {
          "perSession": [
            17,
            19,
            17,
            23,
            17
          ],
          "weeklyUnits": 93,
          "overlapFlags": [
            "more_than_three_primary_sessions"
          ]
        },
        "repeatedExercises": [
          {
            "exerciseId": "ex-decline-barbell-bench",
            "count": 2,
            "reason": "stable_primary_practice"
          },
          {
            "exerciseId": "ex-hack-squat-machine",
            "count": 2,
            "reason": "stable_primary_practice"
          }
        ]
      },
      "progression": {
        "nextRotation": "same immutable prescriptions until canonical Progress evidence authorises regeneration",
        "mesocycleExitCriteria": [
          "Main movement and muscle data exists"
        ],
        "approvedNextMesocycles": [
          "hypertrophy_base"
        ]
      },
      "certification": {
        "allocation": {
          "status": "passed",
          "checks": [
            "exact_working_sets_resolved",
            "session_volume_bounded",
            "session_duration_bounded",
            "slot_targets_resolved"
          ],
          "failures": []
        },
        "constructed": {
          "status": "passed",
          "checks": [
            "chest_direct_coverage",
            "lateral_delts_direct_coverage",
            "triceps_direct_coverage",
            "upper_back_direct_coverage",
            "lats_direct_coverage",
            "hip_extension_direct_coverage",
            "biceps_direct_coverage",
            "quadriceps_direct_coverage",
            "hamstrings_knee_flexion_direct_coverage",
            "calves_direct_coverage",
            "secondary_stimulus_reported_separately",
            "no_unauthorised_specialist_selection",
            "repeat_authorised:ex-decline-barbell-bench",
            "repeat_authorised:ex-hack-squat-machine"
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
            "schedule:calendar_week"
          ],
          "sessionReasons": [
            {
              "planSessionIndex": 0,
              "role": "Push hypertrophy A",
              "reasons": [
                "microcycle_role:Push hypertrophy A",
                "mesocycle_purpose:Establish reproducible exercise, load and recovery baselines",
                "slot:0:primary horizontal press",
                "slot:1:secondary press stimulus",
                "slot:2:lateral-delt stimulus",
                "slot:3:elbow-extension support"
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
                "slot:2:hinge support",
                "slot:3:elbow-flexor support"
              ]
            },
            {
              "planSessionIndex": 2,
              "role": "Legs hypertrophy C",
              "reasons": [
                "microcycle_role:Legs hypertrophy C",
                "mesocycle_purpose:Establish reproducible exercise, load and recovery baselines",
                "slot:0:knee-dominant anchor",
                "slot:1:hip-extension support",
                "slot:2:knee-flexion hamstring work",
                "slot:3:calf work"
              ]
            },
            {
              "planSessionIndex": 3,
              "role": "Upper hypertrophy",
              "reasons": [
                "microcycle_role:Upper hypertrophy",
                "mesocycle_purpose:Establish reproducible exercise, load and recovery baselines",
                "slot:0:upper chest anchor",
                "slot:1:horizontal pulling support",
                "slot:2:vertical pulling support",
                "slot:3:lateral-delt support",
                "slot:4:triceps support",
                "slot:5:biceps support"
              ]
            },
            {
              "planSessionIndex": 4,
              "role": "Lower hypertrophy",
              "reasons": [
                "microcycle_role:Lower hypertrophy",
                "mesocycle_purpose:Establish reproducible exercise, load and recovery baselines",
                "slot:0:knee-dominant anchor",
                "slot:1:hip-extension support",
                "slot:2:knee-flexion hamstring work",
                "slot:3:calf work"
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
        "mode": "calendar_week",
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
          "workingSets": 9,
          "estimatedMinutes": 35,
          "dosageAssessment": {
            "exerciseCount": 4,
            "workingSets": 9,
            "fourExercisesAndElevenSets": false,
            "outcome": "role_specific_allocation",
            "reason": "4 owned movement/muscle slots supply 9 exact working sets for this session role; appropriateness is certified from full-rotation direct stimulus, secondary stimulus, duration and fatigue rather than a universal exercise count."
          },
          "exercises": [
            {
              "exerciseId": "ex-decline-barbell-bench",
              "exercise": "Decline Barbell Bench",
              "movement": "horizontal_push",
              "slotPurpose": "primary horizontal press",
              "workingSets": 3,
              "exactReps": [
                12,
                12,
                12
              ],
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
              "exerciseId": "ex-decline-plate-loaded-press",
              "exercise": "Decline Plate Loaded Press",
              "movement": "horizontal_push",
              "slotPurpose": "secondary press stimulus",
              "workingSets": 2,
              "exactReps": [
                10,
                10
              ],
              "loadState": "established",
              "prescribedBaseLoad": 50,
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:secondary press stimulus",
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
              "workingSets": 2,
              "exactReps": [
                15,
                15
              ],
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
              "slotPurpose": "elbow-extension support",
              "workingSets": 2,
              "exactReps": [
                12,
                12
              ],
              "loadState": "established",
              "prescribedBaseLoad": 50,
              "restSeconds": 75,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:elbow-extension support",
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
          "workingSets": 9,
          "estimatedMinutes": 35,
          "dosageAssessment": {
            "exerciseCount": 4,
            "workingSets": 9,
            "fourExercisesAndElevenSets": false,
            "outcome": "role_specific_allocation",
            "reason": "4 owned movement/muscle slots supply 9 exact working sets for this session role; appropriateness is certified from full-rotation direct stimulus, secondary stimulus, duration and fatigue rather than a universal exercise count."
          },
          "exercises": [
            {
              "exerciseId": "ex-barbell-row",
              "exercise": "Barbell Row",
              "movement": "horizontal_pull",
              "slotPurpose": "primary horizontal pull",
              "workingSets": 3,
              "exactReps": [
                8,
                8,
                8
              ],
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
              "workingSets": 2,
              "exactReps": [
                10,
                10
              ],
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
              "exerciseId": "ex-hip-thrust-machine",
              "exercise": "Hip Thrust Machine",
              "movement": "hip_thrust",
              "slotPurpose": "hinge support",
              "workingSets": 2,
              "exactReps": [
                10,
                10
              ],
              "loadState": "established",
              "prescribedBaseLoad": 50,
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:hinge support",
                "fatigue:moderate",
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
              "slotPurpose": "elbow-flexor support",
              "workingSets": 2,
              "exactReps": [
                12,
                12
              ],
              "loadState": "established",
              "prescribedBaseLoad": 50,
              "restSeconds": 75,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:elbow-flexor support",
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
          "workingSets": 9,
          "estimatedMinutes": 35,
          "dosageAssessment": {
            "exerciseCount": 4,
            "workingSets": 9,
            "fourExercisesAndElevenSets": false,
            "outcome": "role_specific_allocation",
            "reason": "4 owned movement/muscle slots supply 9 exact working sets for this session role; appropriateness is certified from full-rotation direct stimulus, secondary stimulus, duration and fatigue rather than a universal exercise count."
          },
          "exercises": [
            {
              "exerciseId": "ex-hack-squat-machine",
              "exercise": "Hack Squat Machine",
              "movement": "squat",
              "slotPurpose": "knee-dominant anchor",
              "workingSets": 3,
              "exactReps": [
                12,
                12,
                12
              ],
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
              "exerciseId": "ex-machine-glute-drive",
              "exercise": "Machine Glute Drive",
              "movement": "hip_thrust",
              "slotPurpose": "hip-extension support",
              "workingSets": 2,
              "exactReps": [
                10,
                10
              ],
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
              "workingSets": 2,
              "exactReps": [
                12,
                12
              ],
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
              "exerciseId": "ex-donkey-calf-raise",
              "exercise": "Donkey Calf Raise",
              "movement": "isolation",
              "slotPurpose": "calf work",
              "workingSets": 2,
              "exactReps": [
                15,
                15
              ],
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
          "role": "Upper hypertrophy",
          "purpose": "Establish reproducible exercise, load and recovery baselines",
          "workingSets": 13,
          "estimatedMinutes": 47,
          "dosageAssessment": {
            "exerciseCount": 6,
            "workingSets": 13,
            "fourExercisesAndElevenSets": false,
            "outcome": "role_specific_allocation",
            "reason": "6 owned movement/muscle slots supply 13 exact working sets for this session role; appropriateness is certified from full-rotation direct stimulus, secondary stimulus, duration and fatigue rather than a universal exercise count."
          },
          "exercises": [
            {
              "exerciseId": "ex-decline-barbell-bench",
              "exercise": "Decline Barbell Bench",
              "movement": "horizontal_push",
              "slotPurpose": "upper chest anchor",
              "workingSets": 3,
              "exactReps": [
                12,
                12,
                12
              ],
              "loadState": "established",
              "prescribedBaseLoad": 50,
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:upper chest anchor",
                "fatigue:moderate",
                "recovery:normal",
                "stability:high",
                "repeat:stable_primary_practice",
                "preference_score:0"
              ]
            },
            {
              "exerciseId": "ex-chest-supported-row",
              "exercise": "Chest Supported Row",
              "movement": "horizontal_pull",
              "slotPurpose": "horizontal pulling support",
              "workingSets": 2,
              "exactReps": [
                10,
                10
              ],
              "loadState": "established",
              "prescribedBaseLoad": 50,
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:horizontal pulling support",
                "fatigue:moderate",
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
              "slotPurpose": "vertical pulling support",
              "workingSets": 2,
              "exactReps": [
                10,
                10
              ],
              "loadState": "established",
              "prescribedBaseLoad": 50,
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:vertical pulling support",
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
              "slotPurpose": "lateral-delt support",
              "workingSets": 2,
              "exactReps": [
                15,
                15
              ],
              "loadState": "established",
              "prescribedBaseLoad": 50,
              "restSeconds": 75,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:lateral-delt support",
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
              "slotPurpose": "triceps support",
              "workingSets": 2,
              "exactReps": [
                12,
                12
              ],
              "loadState": "established",
              "prescribedBaseLoad": 50,
              "restSeconds": 75,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:triceps support",
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
              "slotPurpose": "biceps support",
              "workingSets": 2,
              "exactReps": [
                12,
                12
              ],
              "loadState": "established",
              "prescribedBaseLoad": 50,
              "restSeconds": 75,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:biceps support",
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
          "role": "Lower hypertrophy",
          "purpose": "Establish reproducible exercise, load and recovery baselines",
          "workingSets": 9,
          "estimatedMinutes": 35,
          "dosageAssessment": {
            "exerciseCount": 4,
            "workingSets": 9,
            "fourExercisesAndElevenSets": false,
            "outcome": "role_specific_allocation",
            "reason": "4 owned movement/muscle slots supply 9 exact working sets for this session role; appropriateness is certified from full-rotation direct stimulus, secondary stimulus, duration and fatigue rather than a universal exercise count."
          },
          "exercises": [
            {
              "exerciseId": "ex-hack-squat-machine",
              "exercise": "Hack Squat Machine",
              "movement": "squat",
              "slotPurpose": "knee-dominant anchor",
              "workingSets": 3,
              "exactReps": [
                12,
                12,
                12
              ],
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
                "repeat:stable_primary_practice",
                "preference_score:0"
              ]
            },
            {
              "exerciseId": "ex-stiff-leg-deadlift",
              "exercise": "Stiff-Leg Deadlift",
              "movement": "hinge",
              "slotPurpose": "hip-extension support",
              "workingSets": 2,
              "exactReps": [
                10,
                10
              ],
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
              "exerciseId": "ex-lying-leg-curl",
              "exercise": "Lying Leg Curl",
              "movement": "isolation",
              "slotPurpose": "knee-flexion hamstring work",
              "workingSets": 2,
              "exactReps": [
                12,
                12
              ],
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
              "exerciseId": "ex-machine-calf-raise",
              "exercise": "Machine Calf Raise",
              "movement": "isolation",
              "slotPurpose": "calf work",
              "workingSets": 2,
              "exactReps": [
                15,
                15
              ],
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
        }
      ],
      "accounting": {
        "directSets": {
          "chest": 8,
          "lateral_delts": 4,
          "triceps": 4,
          "upper_back": 5,
          "lats": 4,
          "hip_extension": 6,
          "biceps": 4,
          "quadriceps": 6,
          "hamstrings_knee_flexion": 4,
          "calves": 4
        },
        "meaningfulSecondarySets": {
          "triceps": 8,
          "anterior_delts": 6,
          "biceps": 9,
          "rear_delts": 5,
          "hip_extension": 11,
          "upper_back": 2
        },
        "muscleFrequency": {
          "biceps": 2,
          "calves": 2,
          "chest": 2,
          "hamstrings_knee_flexion": 2,
          "hip_extension": 3,
          "lateral_delts": 2,
          "lats": 2,
          "quadriceps": 2,
          "triceps": 2,
          "upper_back": 2
        },
        "movementPatternExposures": {
          "horizontal_push": 3,
          "vertical_push": 1,
          "isolation": 10,
          "horizontal_pull": 2,
          "vertical_pull": 2,
          "hinge": 3,
          "hip_thrust": 3,
          "squat": 2,
          "lunge": 2
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
        "totalWorkingSets": 49,
        "perSessionWorkingSets": [
          9,
          9,
          9,
          13,
          9
        ],
        "perSessionEstimatedMinutes": [
          35,
          35,
          35,
          47,
          35
        ],
        "fatigueUnits": {
          "perSession": [
            17,
            19,
            17,
            23,
            17
          ],
          "weeklyUnits": 93,
          "overlapFlags": [
            "more_than_three_primary_sessions"
          ]
        },
        "repeatedExercises": [
          {
            "exerciseId": "ex-decline-barbell-bench",
            "count": 2,
            "reason": "stable_primary_practice"
          },
          {
            "exerciseId": "ex-hack-squat-machine",
            "count": 2,
            "reason": "stable_primary_practice"
          }
        ]
      },
      "progression": {
        "nextRotation": "same immutable prescriptions until canonical Progress evidence authorises regeneration",
        "mesocycleExitCriteria": [
          "Main movement and muscle data exists"
        ],
        "approvedNextMesocycles": [
          "hypertrophy_base"
        ]
      },
      "certification": {
        "allocation": {
          "status": "passed",
          "checks": [
            "exact_working_sets_resolved",
            "session_volume_bounded",
            "session_duration_bounded",
            "slot_targets_resolved"
          ],
          "failures": []
        },
        "constructed": {
          "status": "passed",
          "checks": [
            "chest_direct_coverage",
            "lateral_delts_direct_coverage",
            "triceps_direct_coverage",
            "upper_back_direct_coverage",
            "lats_direct_coverage",
            "hip_extension_direct_coverage",
            "biceps_direct_coverage",
            "quadriceps_direct_coverage",
            "hamstrings_knee_flexion_direct_coverage",
            "calves_direct_coverage",
            "secondary_stimulus_reported_separately",
            "no_unauthorised_specialist_selection",
            "repeat_authorised:ex-decline-barbell-bench",
            "repeat_authorised:ex-hack-squat-machine"
          ],
          "failures": []
        }
      }
    },
    {
      "id": "intermediate-hypertrophy-5-upper_lower-calibration",
      "label": "Intermediate Hypertrophy · 5 days · Upper/Lower · no established history",
      "status": "constructed",
      "input": {
        "goal": "build_muscle",
        "experience": "intermediate",
        "frequency": 5,
        "requestedFramework": "upper_lower",
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
        "macrocycle": "cert-intermediate-hypertrophy-5-upper_lower-calibration:macrocycle",
        "mesocycle": "hypertrophy_calibration",
        "microcycle": "cert-intermediate-hypertrophy-5-upper_lower-calibration:microcycle:1",
        "sessionConstruction": "canonical_plan_v3",
        "prescriptionPolicy": "mesocycle_prescription_policy_v1",
        "rationale": {
          "schemaVersion": "canonical_planning_rationale_v1",
          "goalStrategyId": "canonical_goal_hypertrophy_v1",
          "rotationReasons": [
            "framework:upper_lower",
            "framework_reason:explicit_supported_preference",
            "goal_strategy:build_muscle",
            "experience:intermediate",
            "frequency:5",
            "mesocycle:hypertrophy_calibration",
            "schedule:calendar_week"
          ],
          "sessionReasons": [
            {
              "planSessionIndex": 0,
              "role": "Upper hypertrophy",
              "reasons": [
                "microcycle_role:Upper hypertrophy",
                "mesocycle_purpose:Establish reproducible exercise, load and recovery baselines",
                "slot:0:upper chest anchor",
                "slot:1:horizontal pulling support",
                "slot:2:vertical pulling support",
                "slot:3:lateral-delt support",
                "slot:4:triceps support",
                "slot:5:biceps support"
              ]
            },
            {
              "planSessionIndex": 1,
              "role": "Lower hypertrophy",
              "reasons": [
                "microcycle_role:Lower hypertrophy",
                "mesocycle_purpose:Establish reproducible exercise, load and recovery baselines",
                "slot:0:knee-dominant anchor",
                "slot:1:hip-extension support",
                "slot:2:knee-flexion hamstring work",
                "slot:3:calf work"
              ]
            },
            {
              "planSessionIndex": 2,
              "role": "Upper hypertrophy",
              "reasons": [
                "microcycle_role:Upper hypertrophy",
                "mesocycle_purpose:Establish reproducible exercise, load and recovery baselines",
                "slot:0:upper chest anchor",
                "slot:1:horizontal pulling support",
                "slot:2:vertical pulling support",
                "slot:3:lateral-delt support",
                "slot:4:triceps support",
                "slot:5:biceps support"
              ]
            },
            {
              "planSessionIndex": 3,
              "role": "Lower hypertrophy",
              "reasons": [
                "microcycle_role:Lower hypertrophy",
                "mesocycle_purpose:Establish reproducible exercise, load and recovery baselines",
                "slot:0:knee-dominant anchor",
                "slot:1:hip-extension support",
                "slot:2:knee-flexion hamstring work",
                "slot:3:calf work"
              ]
            },
            {
              "planSessionIndex": 4,
              "role": "Full Body hypertrophy E",
              "reasons": [
                "microcycle_role:Full Body hypertrophy E",
                "mesocycle_purpose:Establish reproducible exercise, load and recovery baselines",
                "slot:0:full-body knee-dominant anchor",
                "slot:1:full-body press",
                "slot:2:full-body pull",
                "slot:3:complementary lower pattern",
                "slot:4:trunk support"
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
        "mode": "calendar_week",
        "resolvedFramework": "upper_lower",
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
          "role": "Upper hypertrophy",
          "purpose": "Establish reproducible exercise, load and recovery baselines",
          "workingSets": 13,
          "estimatedMinutes": 47,
          "dosageAssessment": {
            "exerciseCount": 6,
            "workingSets": 13,
            "fourExercisesAndElevenSets": false,
            "outcome": "role_specific_allocation",
            "reason": "6 owned movement/muscle slots supply 13 exact working sets for this session role; appropriateness is certified from full-rotation direct stimulus, secondary stimulus, duration and fatigue rather than a universal exercise count."
          },
          "exercises": [
            {
              "exerciseId": "ex-decline-barbell-bench",
              "exercise": "Decline Barbell Bench",
              "movement": "horizontal_push",
              "slotPurpose": "upper chest anchor",
              "workingSets": 3,
              "exactReps": [
                12,
                12,
                12
              ],
              "loadState": "calibration_required",
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:upper chest anchor",
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
              "slotPurpose": "horizontal pulling support",
              "workingSets": 2,
              "exactReps": [
                10,
                10
              ],
              "loadState": "calibration_required",
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:horizontal pulling support",
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
              "slotPurpose": "vertical pulling support",
              "workingSets": 2,
              "exactReps": [
                10,
                10
              ],
              "loadState": "calibration_required",
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:vertical pulling support",
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
              "slotPurpose": "lateral-delt support",
              "workingSets": 2,
              "exactReps": [
                15,
                15
              ],
              "loadState": "calibration_required",
              "restSeconds": 75,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:lateral-delt support",
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
              "slotPurpose": "triceps support",
              "workingSets": 2,
              "exactReps": [
                12,
                12
              ],
              "loadState": "calibration_required",
              "restSeconds": 75,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:triceps support",
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
              "slotPurpose": "biceps support",
              "workingSets": 2,
              "exactReps": [
                12,
                12
              ],
              "loadState": "calibration_required",
              "restSeconds": 75,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:biceps support",
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
          "role": "Lower hypertrophy",
          "purpose": "Establish reproducible exercise, load and recovery baselines",
          "workingSets": 9,
          "estimatedMinutes": 35,
          "dosageAssessment": {
            "exerciseCount": 4,
            "workingSets": 9,
            "fourExercisesAndElevenSets": false,
            "outcome": "role_specific_allocation",
            "reason": "4 owned movement/muscle slots supply 9 exact working sets for this session role; appropriateness is certified from full-rotation direct stimulus, secondary stimulus, duration and fatigue rather than a universal exercise count."
          },
          "exercises": [
            {
              "exerciseId": "ex-hack-squat-machine",
              "exercise": "Hack Squat Machine",
              "movement": "squat",
              "slotPurpose": "knee-dominant anchor",
              "workingSets": 3,
              "exactReps": [
                12,
                12,
                12
              ],
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
              "exerciseId": "ex-hip-thrust-machine",
              "exercise": "Hip Thrust Machine",
              "movement": "hip_thrust",
              "slotPurpose": "hip-extension support",
              "workingSets": 2,
              "exactReps": [
                10,
                10
              ],
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
              "workingSets": 2,
              "exactReps": [
                12,
                12
              ],
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
              "exerciseId": "ex-donkey-calf-raise",
              "exercise": "Donkey Calf Raise",
              "movement": "isolation",
              "slotPurpose": "calf work",
              "workingSets": 2,
              "exactReps": [
                15,
                15
              ],
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
          "order": 3,
          "dayOffset": 2,
          "role": "Upper hypertrophy",
          "purpose": "Establish reproducible exercise, load and recovery baselines",
          "workingSets": 13,
          "estimatedMinutes": 47,
          "dosageAssessment": {
            "exerciseCount": 6,
            "workingSets": 13,
            "fourExercisesAndElevenSets": false,
            "outcome": "role_specific_allocation",
            "reason": "6 owned movement/muscle slots supply 13 exact working sets for this session role; appropriateness is certified from full-rotation direct stimulus, secondary stimulus, duration and fatigue rather than a universal exercise count."
          },
          "exercises": [
            {
              "exerciseId": "ex-decline-barbell-bench",
              "exercise": "Decline Barbell Bench",
              "movement": "horizontal_push",
              "slotPurpose": "upper chest anchor",
              "workingSets": 3,
              "exactReps": [
                12,
                12,
                12
              ],
              "loadState": "calibration_required",
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:upper chest anchor",
                "fatigue:moderate",
                "recovery:normal",
                "stability:high",
                "repeat:stable_primary_practice",
                "preference_score:0"
              ]
            },
            {
              "exerciseId": "ex-dorian-yates-row-machine",
              "exercise": "Dorian Yates Row Machine",
              "movement": "horizontal_pull",
              "slotPurpose": "horizontal pulling support",
              "workingSets": 2,
              "exactReps": [
                10,
                10
              ],
              "loadState": "calibration_required",
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:horizontal pulling support",
                "fatigue:moderate",
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
              "slotPurpose": "vertical pulling support",
              "workingSets": 2,
              "exactReps": [
                10,
                10
              ],
              "loadState": "calibration_required",
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:vertical pulling support",
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
              "slotPurpose": "lateral-delt support",
              "workingSets": 2,
              "exactReps": [
                15,
                15
              ],
              "loadState": "calibration_required",
              "restSeconds": 75,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:lateral-delt support",
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
              "slotPurpose": "triceps support",
              "workingSets": 2,
              "exactReps": [
                12,
                12
              ],
              "loadState": "calibration_required",
              "restSeconds": 75,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:triceps support",
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
              "slotPurpose": "biceps support",
              "workingSets": 2,
              "exactReps": [
                12,
                12
              ],
              "loadState": "calibration_required",
              "restSeconds": 75,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:biceps support",
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
          "role": "Lower hypertrophy",
          "purpose": "Establish reproducible exercise, load and recovery baselines",
          "workingSets": 9,
          "estimatedMinutes": 35,
          "dosageAssessment": {
            "exerciseCount": 4,
            "workingSets": 9,
            "fourExercisesAndElevenSets": false,
            "outcome": "role_specific_allocation",
            "reason": "4 owned movement/muscle slots supply 9 exact working sets for this session role; appropriateness is certified from full-rotation direct stimulus, secondary stimulus, duration and fatigue rather than a universal exercise count."
          },
          "exercises": [
            {
              "exerciseId": "ex-hack-squat-machine",
              "exercise": "Hack Squat Machine",
              "movement": "squat",
              "slotPurpose": "knee-dominant anchor",
              "workingSets": 3,
              "exactReps": [
                12,
                12,
                12
              ],
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
                "repeat:stable_primary_practice",
                "preference_score:0"
              ]
            },
            {
              "exerciseId": "ex-machine-glute-drive",
              "exercise": "Machine Glute Drive",
              "movement": "hip_thrust",
              "slotPurpose": "hip-extension support",
              "workingSets": 2,
              "exactReps": [
                10,
                10
              ],
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
              "exerciseId": "ex-lying-leg-curl",
              "exercise": "Lying Leg Curl",
              "movement": "isolation",
              "slotPurpose": "knee-flexion hamstring work",
              "workingSets": 2,
              "exactReps": [
                12,
                12
              ],
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
              "exerciseId": "ex-machine-calf-raise",
              "exercise": "Machine Calf Raise",
              "movement": "isolation",
              "slotPurpose": "calf work",
              "workingSets": 2,
              "exactReps": [
                15,
                15
              ],
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
          "order": 5,
          "dayOffset": 5,
          "role": "Full Body hypertrophy E",
          "purpose": "Establish reproducible exercise, load and recovery baselines",
          "workingSets": 11,
          "estimatedMinutes": 41,
          "dosageAssessment": {
            "exerciseCount": 5,
            "workingSets": 11,
            "fourExercisesAndElevenSets": false,
            "outcome": "role_specific_allocation",
            "reason": "5 owned movement/muscle slots supply 11 exact working sets for this session role; appropriateness is certified from full-rotation direct stimulus, secondary stimulus, duration and fatigue rather than a universal exercise count."
          },
          "exercises": [
            {
              "exerciseId": "ex-barbell-back-squat",
              "exercise": "Barbell Back Squat",
              "movement": "squat",
              "slotPurpose": "full-body knee-dominant anchor",
              "workingSets": 3,
              "exactReps": [
                8,
                8,
                8
              ],
              "loadState": "calibration_required",
              "restSeconds": 150,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:full-body knee-dominant anchor",
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
              "slotPurpose": "full-body press",
              "workingSets": 2,
              "exactReps": [
                10,
                10
              ],
              "loadState": "calibration_required",
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:full-body press",
                "fatigue:moderate",
                "recovery:normal",
                "stability:high",
                "repeat:not_repeated",
                "preference_score:0"
              ]
            },
            {
              "exerciseId": "ex-high-row-plate-loaded",
              "exercise": "High Row Plate Loaded",
              "movement": "horizontal_pull",
              "slotPurpose": "full-body pull",
              "workingSets": 2,
              "exactReps": [
                10,
                10
              ],
              "loadState": "calibration_required",
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:full-body pull",
                "fatigue:moderate",
                "recovery:normal",
                "stability:high",
                "repeat:not_repeated",
                "preference_score:0"
              ]
            },
            {
              "exerciseId": "ex-single-leg-hip-thrust",
              "exercise": "Single-Leg Hip Thrust",
              "movement": "hip_thrust",
              "slotPurpose": "complementary lower pattern",
              "workingSets": 2,
              "exactReps": [
                10,
                10
              ],
              "loadState": "bodyweight",
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:complementary lower pattern",
                "fatigue:moderate",
                "recovery:normal",
                "stability:high",
                "repeat:not_repeated",
                "preference_score:0"
              ]
            },
            {
              "exerciseId": "ex-cable-crunch",
              "exercise": "Cable Crunch",
              "movement": "core",
              "slotPurpose": "trunk support",
              "workingSets": 2,
              "exactReps": [
                12,
                12
              ],
              "loadState": "calibration_required",
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:trunk support",
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
          "chest": 8,
          "upper_back": 6,
          "lats": 4,
          "lateral_delts": 4,
          "triceps": 4,
          "biceps": 4,
          "quadriceps": 9,
          "hip_extension": 6,
          "hamstrings_knee_flexion": 4,
          "calves": 4,
          "core": 2
        },
        "meaningfulSecondarySets": {
          "triceps": 8,
          "anterior_delts": 6,
          "biceps": 10,
          "rear_delts": 6,
          "hip_extension": 13
        },
        "muscleFrequency": {
          "biceps": 2,
          "calves": 2,
          "chest": 3,
          "core": 1,
          "hamstrings_knee_flexion": 2,
          "hip_extension": 3,
          "lateral_delts": 2,
          "lats": 2,
          "quadriceps": 3,
          "triceps": 2,
          "upper_back": 3
        },
        "movementPatternExposures": {
          "horizontal_push": 3,
          "horizontal_pull": 3,
          "vertical_pull": 2,
          "isolation": 10,
          "squat": 3,
          "lunge": 3,
          "hinge": 3,
          "hip_thrust": 3,
          "core": 1,
          "carry": 1
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
        "totalWorkingSets": 55,
        "perSessionWorkingSets": [
          13,
          9,
          13,
          9,
          11
        ],
        "perSessionEstimatedMinutes": [
          47,
          35,
          47,
          35,
          41
        ],
        "fatigueUnits": {
          "perSession": [
            23,
            17,
            23,
            17,
            23
          ],
          "weeklyUnits": 103,
          "overlapFlags": [
            "more_than_three_primary_sessions"
          ]
        },
        "repeatedExercises": [
          {
            "exerciseId": "ex-decline-barbell-bench",
            "count": 2,
            "reason": "stable_primary_practice"
          },
          {
            "exerciseId": "ex-hack-squat-machine",
            "count": 2,
            "reason": "stable_primary_practice"
          }
        ]
      },
      "progression": {
        "nextRotation": "same immutable prescriptions until canonical Progress evidence authorises regeneration",
        "mesocycleExitCriteria": [
          "Main movement and muscle data exists"
        ],
        "approvedNextMesocycles": [
          "hypertrophy_base"
        ]
      },
      "certification": {
        "allocation": {
          "status": "passed",
          "checks": [
            "exact_working_sets_resolved",
            "session_volume_bounded",
            "session_duration_bounded",
            "slot_targets_resolved"
          ],
          "failures": []
        },
        "constructed": {
          "status": "passed",
          "checks": [
            "chest_direct_coverage",
            "upper_back_direct_coverage",
            "lats_direct_coverage",
            "lateral_delts_direct_coverage",
            "triceps_direct_coverage",
            "biceps_direct_coverage",
            "quadriceps_direct_coverage",
            "hip_extension_direct_coverage",
            "hamstrings_knee_flexion_direct_coverage",
            "calves_direct_coverage",
            "core_direct_coverage",
            "secondary_stimulus_reported_separately",
            "no_unauthorised_specialist_selection",
            "repeat_authorised:ex-decline-barbell-bench",
            "repeat_authorised:ex-hack-squat-machine"
          ],
          "failures": []
        }
      }
    },
    {
      "id": "intermediate-hypertrophy-5-upper_lower-established",
      "label": "Intermediate Hypertrophy · 5 days · Upper/Lower · established comparable history",
      "status": "constructed",
      "input": {
        "goal": "build_muscle",
        "experience": "intermediate",
        "frequency": 5,
        "requestedFramework": "upper_lower",
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
        "macrocycle": "cert-intermediate-hypertrophy-5-upper_lower-established:macrocycle",
        "mesocycle": "hypertrophy_calibration",
        "microcycle": "cert-intermediate-hypertrophy-5-upper_lower-established:microcycle:1",
        "sessionConstruction": "canonical_plan_v3",
        "prescriptionPolicy": "mesocycle_prescription_policy_v1",
        "rationale": {
          "schemaVersion": "canonical_planning_rationale_v1",
          "goalStrategyId": "canonical_goal_hypertrophy_v1",
          "rotationReasons": [
            "framework:upper_lower",
            "framework_reason:explicit_supported_preference",
            "goal_strategy:build_muscle",
            "experience:intermediate",
            "frequency:5",
            "mesocycle:hypertrophy_calibration",
            "schedule:calendar_week"
          ],
          "sessionReasons": [
            {
              "planSessionIndex": 0,
              "role": "Upper hypertrophy",
              "reasons": [
                "microcycle_role:Upper hypertrophy",
                "mesocycle_purpose:Establish reproducible exercise, load and recovery baselines",
                "slot:0:upper chest anchor",
                "slot:1:horizontal pulling support",
                "slot:2:vertical pulling support",
                "slot:3:lateral-delt support",
                "slot:4:triceps support",
                "slot:5:biceps support"
              ]
            },
            {
              "planSessionIndex": 1,
              "role": "Lower hypertrophy",
              "reasons": [
                "microcycle_role:Lower hypertrophy",
                "mesocycle_purpose:Establish reproducible exercise, load and recovery baselines",
                "slot:0:knee-dominant anchor",
                "slot:1:hip-extension support",
                "slot:2:knee-flexion hamstring work",
                "slot:3:calf work"
              ]
            },
            {
              "planSessionIndex": 2,
              "role": "Upper hypertrophy",
              "reasons": [
                "microcycle_role:Upper hypertrophy",
                "mesocycle_purpose:Establish reproducible exercise, load and recovery baselines",
                "slot:0:upper chest anchor",
                "slot:1:horizontal pulling support",
                "slot:2:vertical pulling support",
                "slot:3:lateral-delt support",
                "slot:4:triceps support",
                "slot:5:biceps support"
              ]
            },
            {
              "planSessionIndex": 3,
              "role": "Lower hypertrophy",
              "reasons": [
                "microcycle_role:Lower hypertrophy",
                "mesocycle_purpose:Establish reproducible exercise, load and recovery baselines",
                "slot:0:knee-dominant anchor",
                "slot:1:hip-extension support",
                "slot:2:knee-flexion hamstring work",
                "slot:3:calf work"
              ]
            },
            {
              "planSessionIndex": 4,
              "role": "Full Body hypertrophy E",
              "reasons": [
                "microcycle_role:Full Body hypertrophy E",
                "mesocycle_purpose:Establish reproducible exercise, load and recovery baselines",
                "slot:0:full-body knee-dominant anchor",
                "slot:1:full-body press",
                "slot:2:full-body pull",
                "slot:3:complementary lower pattern",
                "slot:4:trunk support"
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
        "mode": "calendar_week",
        "resolvedFramework": "upper_lower",
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
          "role": "Upper hypertrophy",
          "purpose": "Establish reproducible exercise, load and recovery baselines",
          "workingSets": 13,
          "estimatedMinutes": 47,
          "dosageAssessment": {
            "exerciseCount": 6,
            "workingSets": 13,
            "fourExercisesAndElevenSets": false,
            "outcome": "role_specific_allocation",
            "reason": "6 owned movement/muscle slots supply 13 exact working sets for this session role; appropriateness is certified from full-rotation direct stimulus, secondary stimulus, duration and fatigue rather than a universal exercise count."
          },
          "exercises": [
            {
              "exerciseId": "ex-decline-barbell-bench",
              "exercise": "Decline Barbell Bench",
              "movement": "horizontal_push",
              "slotPurpose": "upper chest anchor",
              "workingSets": 3,
              "exactReps": [
                12,
                12,
                12
              ],
              "loadState": "established",
              "prescribedBaseLoad": 50,
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:upper chest anchor",
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
              "slotPurpose": "horizontal pulling support",
              "workingSets": 2,
              "exactReps": [
                10,
                10
              ],
              "loadState": "established",
              "prescribedBaseLoad": 50,
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:horizontal pulling support",
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
              "slotPurpose": "vertical pulling support",
              "workingSets": 2,
              "exactReps": [
                10,
                10
              ],
              "loadState": "established",
              "prescribedBaseLoad": 50,
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:vertical pulling support",
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
              "slotPurpose": "lateral-delt support",
              "workingSets": 2,
              "exactReps": [
                15,
                15
              ],
              "loadState": "established",
              "prescribedBaseLoad": 50,
              "restSeconds": 75,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:lateral-delt support",
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
              "slotPurpose": "triceps support",
              "workingSets": 2,
              "exactReps": [
                12,
                12
              ],
              "loadState": "established",
              "prescribedBaseLoad": 50,
              "restSeconds": 75,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:triceps support",
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
              "slotPurpose": "biceps support",
              "workingSets": 2,
              "exactReps": [
                12,
                12
              ],
              "loadState": "established",
              "prescribedBaseLoad": 50,
              "restSeconds": 75,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:biceps support",
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
          "role": "Lower hypertrophy",
          "purpose": "Establish reproducible exercise, load and recovery baselines",
          "workingSets": 9,
          "estimatedMinutes": 35,
          "dosageAssessment": {
            "exerciseCount": 4,
            "workingSets": 9,
            "fourExercisesAndElevenSets": false,
            "outcome": "role_specific_allocation",
            "reason": "4 owned movement/muscle slots supply 9 exact working sets for this session role; appropriateness is certified from full-rotation direct stimulus, secondary stimulus, duration and fatigue rather than a universal exercise count."
          },
          "exercises": [
            {
              "exerciseId": "ex-hack-squat-machine",
              "exercise": "Hack Squat Machine",
              "movement": "squat",
              "slotPurpose": "knee-dominant anchor",
              "workingSets": 3,
              "exactReps": [
                12,
                12,
                12
              ],
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
              "exerciseId": "ex-hip-thrust-machine",
              "exercise": "Hip Thrust Machine",
              "movement": "hip_thrust",
              "slotPurpose": "hip-extension support",
              "workingSets": 2,
              "exactReps": [
                10,
                10
              ],
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
              "workingSets": 2,
              "exactReps": [
                12,
                12
              ],
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
              "exerciseId": "ex-donkey-calf-raise",
              "exercise": "Donkey Calf Raise",
              "movement": "isolation",
              "slotPurpose": "calf work",
              "workingSets": 2,
              "exactReps": [
                15,
                15
              ],
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
          "order": 3,
          "dayOffset": 2,
          "role": "Upper hypertrophy",
          "purpose": "Establish reproducible exercise, load and recovery baselines",
          "workingSets": 13,
          "estimatedMinutes": 47,
          "dosageAssessment": {
            "exerciseCount": 6,
            "workingSets": 13,
            "fourExercisesAndElevenSets": false,
            "outcome": "role_specific_allocation",
            "reason": "6 owned movement/muscle slots supply 13 exact working sets for this session role; appropriateness is certified from full-rotation direct stimulus, secondary stimulus, duration and fatigue rather than a universal exercise count."
          },
          "exercises": [
            {
              "exerciseId": "ex-decline-barbell-bench",
              "exercise": "Decline Barbell Bench",
              "movement": "horizontal_push",
              "slotPurpose": "upper chest anchor",
              "workingSets": 3,
              "exactReps": [
                12,
                12,
                12
              ],
              "loadState": "established",
              "prescribedBaseLoad": 50,
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:upper chest anchor",
                "fatigue:moderate",
                "recovery:normal",
                "stability:high",
                "repeat:stable_primary_practice",
                "preference_score:0"
              ]
            },
            {
              "exerciseId": "ex-dorian-yates-row-machine",
              "exercise": "Dorian Yates Row Machine",
              "movement": "horizontal_pull",
              "slotPurpose": "horizontal pulling support",
              "workingSets": 2,
              "exactReps": [
                10,
                10
              ],
              "loadState": "established",
              "prescribedBaseLoad": 50,
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:horizontal pulling support",
                "fatigue:moderate",
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
              "slotPurpose": "vertical pulling support",
              "workingSets": 2,
              "exactReps": [
                10,
                10
              ],
              "loadState": "established",
              "prescribedBaseLoad": 50,
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:vertical pulling support",
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
              "slotPurpose": "lateral-delt support",
              "workingSets": 2,
              "exactReps": [
                15,
                15
              ],
              "loadState": "established",
              "prescribedBaseLoad": 50,
              "restSeconds": 75,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:lateral-delt support",
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
              "slotPurpose": "triceps support",
              "workingSets": 2,
              "exactReps": [
                12,
                12
              ],
              "loadState": "established",
              "prescribedBaseLoad": 50,
              "restSeconds": 75,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:triceps support",
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
              "slotPurpose": "biceps support",
              "workingSets": 2,
              "exactReps": [
                12,
                12
              ],
              "loadState": "established",
              "prescribedBaseLoad": 50,
              "restSeconds": 75,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:biceps support",
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
          "role": "Lower hypertrophy",
          "purpose": "Establish reproducible exercise, load and recovery baselines",
          "workingSets": 9,
          "estimatedMinutes": 35,
          "dosageAssessment": {
            "exerciseCount": 4,
            "workingSets": 9,
            "fourExercisesAndElevenSets": false,
            "outcome": "role_specific_allocation",
            "reason": "4 owned movement/muscle slots supply 9 exact working sets for this session role; appropriateness is certified from full-rotation direct stimulus, secondary stimulus, duration and fatigue rather than a universal exercise count."
          },
          "exercises": [
            {
              "exerciseId": "ex-hack-squat-machine",
              "exercise": "Hack Squat Machine",
              "movement": "squat",
              "slotPurpose": "knee-dominant anchor",
              "workingSets": 3,
              "exactReps": [
                12,
                12,
                12
              ],
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
                "repeat:stable_primary_practice",
                "preference_score:0"
              ]
            },
            {
              "exerciseId": "ex-machine-glute-drive",
              "exercise": "Machine Glute Drive",
              "movement": "hip_thrust",
              "slotPurpose": "hip-extension support",
              "workingSets": 2,
              "exactReps": [
                10,
                10
              ],
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
              "exerciseId": "ex-lying-leg-curl",
              "exercise": "Lying Leg Curl",
              "movement": "isolation",
              "slotPurpose": "knee-flexion hamstring work",
              "workingSets": 2,
              "exactReps": [
                12,
                12
              ],
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
              "exerciseId": "ex-machine-calf-raise",
              "exercise": "Machine Calf Raise",
              "movement": "isolation",
              "slotPurpose": "calf work",
              "workingSets": 2,
              "exactReps": [
                15,
                15
              ],
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
          "order": 5,
          "dayOffset": 5,
          "role": "Full Body hypertrophy E",
          "purpose": "Establish reproducible exercise, load and recovery baselines",
          "workingSets": 11,
          "estimatedMinutes": 41,
          "dosageAssessment": {
            "exerciseCount": 5,
            "workingSets": 11,
            "fourExercisesAndElevenSets": false,
            "outcome": "role_specific_allocation",
            "reason": "5 owned movement/muscle slots supply 11 exact working sets for this session role; appropriateness is certified from full-rotation direct stimulus, secondary stimulus, duration and fatigue rather than a universal exercise count."
          },
          "exercises": [
            {
              "exerciseId": "ex-barbell-back-squat",
              "exercise": "Barbell Back Squat",
              "movement": "squat",
              "slotPurpose": "full-body knee-dominant anchor",
              "workingSets": 3,
              "exactReps": [
                8,
                8,
                8
              ],
              "loadState": "established",
              "prescribedBaseLoad": 50,
              "restSeconds": 150,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:full-body knee-dominant anchor",
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
              "slotPurpose": "full-body press",
              "workingSets": 2,
              "exactReps": [
                10,
                10
              ],
              "loadState": "established",
              "prescribedBaseLoad": 50,
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:full-body press",
                "fatigue:moderate",
                "recovery:normal",
                "stability:high",
                "repeat:not_repeated",
                "preference_score:0"
              ]
            },
            {
              "exerciseId": "ex-high-row-plate-loaded",
              "exercise": "High Row Plate Loaded",
              "movement": "horizontal_pull",
              "slotPurpose": "full-body pull",
              "workingSets": 2,
              "exactReps": [
                10,
                10
              ],
              "loadState": "established",
              "prescribedBaseLoad": 50,
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:full-body pull",
                "fatigue:moderate",
                "recovery:normal",
                "stability:high",
                "repeat:not_repeated",
                "preference_score:0"
              ]
            },
            {
              "exerciseId": "ex-single-leg-hip-thrust",
              "exercise": "Single-Leg Hip Thrust",
              "movement": "hip_thrust",
              "slotPurpose": "complementary lower pattern",
              "workingSets": 2,
              "exactReps": [
                10,
                10
              ],
              "loadState": "bodyweight",
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:complementary lower pattern",
                "fatigue:moderate",
                "recovery:normal",
                "stability:high",
                "repeat:not_repeated",
                "preference_score:0"
              ]
            },
            {
              "exerciseId": "ex-cable-crunch",
              "exercise": "Cable Crunch",
              "movement": "core",
              "slotPurpose": "trunk support",
              "workingSets": 2,
              "exactReps": [
                12,
                12
              ],
              "loadState": "established",
              "prescribedBaseLoad": 50,
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:trunk support",
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
          "chest": 8,
          "upper_back": 6,
          "lats": 4,
          "lateral_delts": 4,
          "triceps": 4,
          "biceps": 4,
          "quadriceps": 9,
          "hip_extension": 6,
          "hamstrings_knee_flexion": 4,
          "calves": 4,
          "core": 2
        },
        "meaningfulSecondarySets": {
          "triceps": 8,
          "anterior_delts": 6,
          "biceps": 10,
          "rear_delts": 6,
          "hip_extension": 13
        },
        "muscleFrequency": {
          "biceps": 2,
          "calves": 2,
          "chest": 3,
          "core": 1,
          "hamstrings_knee_flexion": 2,
          "hip_extension": 3,
          "lateral_delts": 2,
          "lats": 2,
          "quadriceps": 3,
          "triceps": 2,
          "upper_back": 3
        },
        "movementPatternExposures": {
          "horizontal_push": 3,
          "horizontal_pull": 3,
          "vertical_pull": 2,
          "isolation": 10,
          "squat": 3,
          "lunge": 3,
          "hinge": 3,
          "hip_thrust": 3,
          "core": 1,
          "carry": 1
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
        "totalWorkingSets": 55,
        "perSessionWorkingSets": [
          13,
          9,
          13,
          9,
          11
        ],
        "perSessionEstimatedMinutes": [
          47,
          35,
          47,
          35,
          41
        ],
        "fatigueUnits": {
          "perSession": [
            23,
            17,
            23,
            17,
            23
          ],
          "weeklyUnits": 103,
          "overlapFlags": [
            "more_than_three_primary_sessions"
          ]
        },
        "repeatedExercises": [
          {
            "exerciseId": "ex-decline-barbell-bench",
            "count": 2,
            "reason": "stable_primary_practice"
          },
          {
            "exerciseId": "ex-hack-squat-machine",
            "count": 2,
            "reason": "stable_primary_practice"
          }
        ]
      },
      "progression": {
        "nextRotation": "same immutable prescriptions until canonical Progress evidence authorises regeneration",
        "mesocycleExitCriteria": [
          "Main movement and muscle data exists"
        ],
        "approvedNextMesocycles": [
          "hypertrophy_base"
        ]
      },
      "certification": {
        "allocation": {
          "status": "passed",
          "checks": [
            "exact_working_sets_resolved",
            "session_volume_bounded",
            "session_duration_bounded",
            "slot_targets_resolved"
          ],
          "failures": []
        },
        "constructed": {
          "status": "passed",
          "checks": [
            "chest_direct_coverage",
            "upper_back_direct_coverage",
            "lats_direct_coverage",
            "lateral_delts_direct_coverage",
            "triceps_direct_coverage",
            "biceps_direct_coverage",
            "quadriceps_direct_coverage",
            "hip_extension_direct_coverage",
            "hamstrings_knee_flexion_direct_coverage",
            "calves_direct_coverage",
            "core_direct_coverage",
            "secondary_stimulus_reported_separately",
            "no_unauthorised_specialist_selection",
            "repeat_authorised:ex-decline-barbell-bench",
            "repeat_authorised:ex-hack-squat-machine"
          ],
          "failures": []
        }
      }
    },
    {
      "id": "intermediate-hypertrophy-5-full_body-calibration",
      "label": "Intermediate Hypertrophy · 5 days · Full Body · no established history",
      "status": "constructed",
      "input": {
        "goal": "build_muscle",
        "experience": "intermediate",
        "frequency": 5,
        "requestedFramework": "full_body",
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
        "macrocycle": "cert-intermediate-hypertrophy-5-full_body-calibration:macrocycle",
        "mesocycle": "hypertrophy_calibration",
        "microcycle": "cert-intermediate-hypertrophy-5-full_body-calibration:microcycle:1",
        "sessionConstruction": "canonical_plan_v3",
        "prescriptionPolicy": "mesocycle_prescription_policy_v1",
        "rationale": {
          "schemaVersion": "canonical_planning_rationale_v1",
          "goalStrategyId": "canonical_goal_hypertrophy_v1",
          "rotationReasons": [
            "framework:full_body",
            "framework_reason:explicit_supported_preference",
            "goal_strategy:build_muscle",
            "experience:intermediate",
            "frequency:5",
            "mesocycle:hypertrophy_calibration",
            "schedule:calendar_week"
          ],
          "sessionReasons": [
            {
              "planSessionIndex": 0,
              "role": "Full Body hypertrophy A",
              "reasons": [
                "microcycle_role:Full Body hypertrophy A",
                "mesocycle_purpose:Establish reproducible exercise, load and recovery baselines",
                "slot:0:full-body knee-dominant anchor",
                "slot:1:full-body press",
                "slot:2:full-body pull",
                "slot:3:complementary lower pattern",
                "slot:4:trunk support"
              ]
            },
            {
              "planSessionIndex": 1,
              "role": "Full Body hypertrophy B",
              "reasons": [
                "microcycle_role:Full Body hypertrophy B",
                "mesocycle_purpose:Establish reproducible exercise, load and recovery baselines",
                "slot:0:full-body hinge anchor",
                "slot:1:full-body press",
                "slot:2:full-body pull",
                "slot:3:complementary lower pattern",
                "slot:4:trunk support"
              ]
            },
            {
              "planSessionIndex": 2,
              "role": "Full Body hypertrophy C",
              "reasons": [
                "microcycle_role:Full Body hypertrophy C",
                "mesocycle_purpose:Establish reproducible exercise, load and recovery baselines",
                "slot:0:full-body knee-dominant anchor",
                "slot:1:full-body press",
                "slot:2:full-body pull",
                "slot:3:complementary lower pattern",
                "slot:4:trunk support"
              ]
            },
            {
              "planSessionIndex": 3,
              "role": "Full Body hypertrophy D",
              "reasons": [
                "microcycle_role:Full Body hypertrophy D",
                "mesocycle_purpose:Establish reproducible exercise, load and recovery baselines",
                "slot:0:full-body hinge anchor",
                "slot:1:full-body press",
                "slot:2:full-body pull",
                "slot:3:complementary lower pattern",
                "slot:4:trunk support"
              ]
            },
            {
              "planSessionIndex": 4,
              "role": "Full Body hypertrophy E",
              "reasons": [
                "microcycle_role:Full Body hypertrophy E",
                "mesocycle_purpose:Establish reproducible exercise, load and recovery baselines",
                "slot:0:full-body knee-dominant anchor",
                "slot:1:full-body press",
                "slot:2:full-body pull",
                "slot:3:complementary lower pattern",
                "slot:4:trunk support"
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
        "mode": "calendar_week",
        "resolvedFramework": "full_body",
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
          "role": "Full Body hypertrophy A",
          "purpose": "Establish reproducible exercise, load and recovery baselines",
          "workingSets": 11,
          "estimatedMinutes": 41,
          "dosageAssessment": {
            "exerciseCount": 5,
            "workingSets": 11,
            "fourExercisesAndElevenSets": false,
            "outcome": "role_specific_allocation",
            "reason": "5 owned movement/muscle slots supply 11 exact working sets for this session role; appropriateness is certified from full-rotation direct stimulus, secondary stimulus, duration and fatigue rather than a universal exercise count."
          },
          "exercises": [
            {
              "exerciseId": "ex-barbell-back-squat",
              "exercise": "Barbell Back Squat",
              "movement": "squat",
              "slotPurpose": "full-body knee-dominant anchor",
              "workingSets": 3,
              "exactReps": [
                8,
                8,
                8
              ],
              "loadState": "calibration_required",
              "restSeconds": 150,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:full-body knee-dominant anchor",
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
              "slotPurpose": "full-body press",
              "workingSets": 2,
              "exactReps": [
                10,
                10
              ],
              "loadState": "calibration_required",
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:full-body press",
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
              "slotPurpose": "full-body pull",
              "workingSets": 2,
              "exactReps": [
                10,
                10
              ],
              "loadState": "calibration_required",
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:full-body pull",
                "fatigue:moderate",
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
              "slotPurpose": "complementary lower pattern",
              "workingSets": 2,
              "exactReps": [
                10,
                10
              ],
              "loadState": "calibration_required",
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:complementary lower pattern",
                "fatigue:moderate",
                "recovery:normal",
                "stability:high",
                "repeat:not_repeated",
                "preference_score:0"
              ]
            },
            {
              "exerciseId": "ex-cable-crunch",
              "exercise": "Cable Crunch",
              "movement": "core",
              "slotPurpose": "trunk support",
              "workingSets": 2,
              "exactReps": [
                12,
                12
              ],
              "loadState": "calibration_required",
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:trunk support",
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
          "order": 2,
          "dayOffset": 1,
          "role": "Full Body hypertrophy B",
          "purpose": "Establish reproducible exercise, load and recovery baselines",
          "workingSets": 11,
          "estimatedMinutes": 41,
          "dosageAssessment": {
            "exerciseCount": 5,
            "workingSets": 11,
            "fourExercisesAndElevenSets": false,
            "outcome": "role_specific_allocation",
            "reason": "5 owned movement/muscle slots supply 11 exact working sets for this session role; appropriateness is certified from full-rotation direct stimulus, secondary stimulus, duration and fatigue rather than a universal exercise count."
          },
          "exercises": [
            {
              "exerciseId": "ex-deadlift",
              "exercise": "Deadlift",
              "movement": "hinge",
              "slotPurpose": "full-body hinge anchor",
              "workingSets": 3,
              "exactReps": [
                8,
                8,
                8
              ],
              "loadState": "calibration_required",
              "restSeconds": 150,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:full-body hinge anchor",
                "fatigue:high",
                "recovery:normal",
                "stability:moderate",
                "repeat:not_repeated",
                "preference_score:0"
              ]
            },
            {
              "exerciseId": "ex-incline-plate-loaded-press",
              "exercise": "Incline Plate Loaded Press",
              "movement": "horizontal_push",
              "slotPurpose": "full-body press",
              "workingSets": 2,
              "exactReps": [
                10,
                10
              ],
              "loadState": "calibration_required",
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:full-body press",
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
              "slotPurpose": "full-body pull",
              "workingSets": 2,
              "exactReps": [
                10,
                10
              ],
              "loadState": "calibration_required",
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:full-body pull",
                "fatigue:moderate",
                "recovery:normal",
                "stability:high",
                "repeat:not_repeated",
                "preference_score:0"
              ]
            },
            {
              "exerciseId": "ex-hack-squat-machine",
              "exercise": "Hack Squat Machine",
              "movement": "squat",
              "slotPurpose": "complementary lower pattern",
              "workingSets": 2,
              "exactReps": [
                10,
                10
              ],
              "loadState": "calibration_required",
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:complementary lower pattern",
                "fatigue:moderate",
                "recovery:normal",
                "stability:high",
                "repeat:not_repeated",
                "preference_score:0"
              ]
            },
            {
              "exerciseId": "ex-cable-crunch",
              "exercise": "Cable Crunch",
              "movement": "core",
              "slotPurpose": "trunk support",
              "workingSets": 2,
              "exactReps": [
                12,
                12
              ],
              "loadState": "calibration_required",
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:trunk support",
                "fatigue:moderate",
                "recovery:normal",
                "stability:high",
                "repeat:only_equivalent_available",
                "preference_score:0"
              ]
            }
          ]
        },
        {
          "order": 3,
          "dayOffset": 2,
          "role": "Full Body hypertrophy C",
          "purpose": "Establish reproducible exercise, load and recovery baselines",
          "workingSets": 11,
          "estimatedMinutes": 41,
          "dosageAssessment": {
            "exerciseCount": 5,
            "workingSets": 11,
            "fourExercisesAndElevenSets": false,
            "outcome": "role_specific_allocation",
            "reason": "5 owned movement/muscle slots supply 11 exact working sets for this session role; appropriateness is certified from full-rotation direct stimulus, secondary stimulus, duration and fatigue rather than a universal exercise count."
          },
          "exercises": [
            {
              "exerciseId": "ex-safety-bar-squat",
              "exercise": "Safety Bar Squat",
              "movement": "squat",
              "slotPurpose": "full-body knee-dominant anchor",
              "workingSets": 3,
              "exactReps": [
                8,
                8,
                8
              ],
              "loadState": "calibration_required",
              "restSeconds": 150,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:full-body knee-dominant anchor",
                "fatigue:high",
                "recovery:normal",
                "stability:moderate",
                "repeat:not_repeated",
                "preference_score:0"
              ]
            },
            {
              "exerciseId": "ex-machine-chest-press",
              "exercise": "Machine Chest Press",
              "movement": "horizontal_push",
              "slotPurpose": "full-body press",
              "workingSets": 2,
              "exactReps": [
                10,
                10
              ],
              "loadState": "calibration_required",
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:full-body press",
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
              "slotPurpose": "full-body pull",
              "workingSets": 2,
              "exactReps": [
                10,
                10
              ],
              "loadState": "calibration_required",
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:full-body pull",
                "fatigue:moderate",
                "recovery:normal",
                "stability:high",
                "repeat:not_repeated",
                "preference_score:0"
              ]
            },
            {
              "exerciseId": "ex-machine-glute-drive",
              "exercise": "Machine Glute Drive",
              "movement": "hip_thrust",
              "slotPurpose": "complementary lower pattern",
              "workingSets": 2,
              "exactReps": [
                10,
                10
              ],
              "loadState": "calibration_required",
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:complementary lower pattern",
                "fatigue:moderate",
                "recovery:normal",
                "stability:high",
                "repeat:not_repeated",
                "preference_score:0"
              ]
            },
            {
              "exerciseId": "ex-cable-crunch",
              "exercise": "Cable Crunch",
              "movement": "core",
              "slotPurpose": "trunk support",
              "workingSets": 2,
              "exactReps": [
                12,
                12
              ],
              "loadState": "calibration_required",
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:trunk support",
                "fatigue:moderate",
                "recovery:normal",
                "stability:high",
                "repeat:only_equivalent_available",
                "preference_score:0"
              ]
            }
          ]
        },
        {
          "order": 4,
          "dayOffset": 4,
          "role": "Full Body hypertrophy D",
          "purpose": "Establish reproducible exercise, load and recovery baselines",
          "workingSets": 11,
          "estimatedMinutes": 41,
          "dosageAssessment": {
            "exerciseCount": 5,
            "workingSets": 11,
            "fourExercisesAndElevenSets": false,
            "outcome": "role_specific_allocation",
            "reason": "5 owned movement/muscle slots supply 11 exact working sets for this session role; appropriateness is certified from full-rotation direct stimulus, secondary stimulus, duration and fatigue rather than a universal exercise count."
          },
          "exercises": [
            {
              "exerciseId": "ex-dumbbell-romanian-deadlift",
              "exercise": "Dumbbell Romanian Deadlift",
              "movement": "hinge",
              "slotPurpose": "full-body hinge anchor",
              "workingSets": 3,
              "exactReps": [
                8,
                8,
                8
              ],
              "loadState": "calibration_required",
              "restSeconds": 150,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:full-body hinge anchor",
                "fatigue:high",
                "recovery:normal",
                "stability:moderate",
                "repeat:not_repeated",
                "preference_score:0"
              ]
            },
            {
              "exerciseId": "ex-decline-barbell-bench",
              "exercise": "Decline Barbell Bench",
              "movement": "horizontal_push",
              "slotPurpose": "full-body press",
              "workingSets": 2,
              "exactReps": [
                10,
                10
              ],
              "loadState": "calibration_required",
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:full-body press",
                "fatigue:moderate",
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
              "slotPurpose": "full-body pull",
              "workingSets": 2,
              "exactReps": [
                10,
                10
              ],
              "loadState": "calibration_required",
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:full-body pull",
                "fatigue:moderate",
                "recovery:normal",
                "stability:high",
                "repeat:not_repeated",
                "preference_score:0"
              ]
            },
            {
              "exerciseId": "ex-hack-squat-plate-loaded",
              "exercise": "Hack Squat Plate Loaded",
              "movement": "squat",
              "slotPurpose": "complementary lower pattern",
              "workingSets": 2,
              "exactReps": [
                10,
                10
              ],
              "loadState": "calibration_required",
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:complementary lower pattern",
                "fatigue:moderate",
                "recovery:normal",
                "stability:high",
                "repeat:not_repeated",
                "preference_score:0"
              ]
            },
            {
              "exerciseId": "ex-cable-crunch",
              "exercise": "Cable Crunch",
              "movement": "core",
              "slotPurpose": "trunk support",
              "workingSets": 2,
              "exactReps": [
                12,
                12
              ],
              "loadState": "calibration_required",
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:trunk support",
                "fatigue:moderate",
                "recovery:normal",
                "stability:high",
                "repeat:only_equivalent_available",
                "preference_score:0"
              ]
            }
          ]
        },
        {
          "order": 5,
          "dayOffset": 5,
          "role": "Full Body hypertrophy E",
          "purpose": "Establish reproducible exercise, load and recovery baselines",
          "workingSets": 11,
          "estimatedMinutes": 41,
          "dosageAssessment": {
            "exerciseCount": 5,
            "workingSets": 11,
            "fourExercisesAndElevenSets": false,
            "outcome": "role_specific_allocation",
            "reason": "5 owned movement/muscle slots supply 11 exact working sets for this session role; appropriateness is certified from full-rotation direct stimulus, secondary stimulus, duration and fatigue rather than a universal exercise count."
          },
          "exercises": [
            {
              "exerciseId": "ex-front-squat",
              "exercise": "Front Squat",
              "movement": "squat",
              "slotPurpose": "full-body knee-dominant anchor",
              "workingSets": 3,
              "exactReps": [
                8,
                8,
                8
              ],
              "loadState": "calibration_required",
              "restSeconds": 150,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:full-body knee-dominant anchor",
                "fatigue:high",
                "recovery:normal",
                "stability:moderate",
                "repeat:not_repeated",
                "preference_score:0"
              ]
            },
            {
              "exerciseId": "ex-decline-press",
              "exercise": "Decline Press",
              "movement": "horizontal_push",
              "slotPurpose": "full-body press",
              "workingSets": 2,
              "exactReps": [
                10,
                10
              ],
              "loadState": "calibration_required",
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:full-body press",
                "fatigue:moderate",
                "recovery:normal",
                "stability:high",
                "repeat:not_repeated",
                "preference_score:0"
              ]
            },
            {
              "exerciseId": "ex-high-row-plate-loaded",
              "exercise": "High Row Plate Loaded",
              "movement": "horizontal_pull",
              "slotPurpose": "full-body pull",
              "workingSets": 2,
              "exactReps": [
                10,
                10
              ],
              "loadState": "calibration_required",
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:full-body pull",
                "fatigue:moderate",
                "recovery:normal",
                "stability:high",
                "repeat:not_repeated",
                "preference_score:0"
              ]
            },
            {
              "exerciseId": "ex-single-leg-hip-thrust",
              "exercise": "Single-Leg Hip Thrust",
              "movement": "hip_thrust",
              "slotPurpose": "complementary lower pattern",
              "workingSets": 2,
              "exactReps": [
                10,
                10
              ],
              "loadState": "bodyweight",
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:complementary lower pattern",
                "fatigue:moderate",
                "recovery:normal",
                "stability:high",
                "repeat:not_repeated",
                "preference_score:0"
              ]
            },
            {
              "exerciseId": "ex-cable-crunch",
              "exercise": "Cable Crunch",
              "movement": "core",
              "slotPurpose": "trunk support",
              "workingSets": 2,
              "exactReps": [
                12,
                12
              ],
              "loadState": "calibration_required",
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:trunk support",
                "fatigue:moderate",
                "recovery:normal",
                "stability:high",
                "repeat:only_equivalent_available",
                "preference_score:0"
              ]
            }
          ]
        }
      ],
      "accounting": {
        "directSets": {
          "quadriceps": 13,
          "chest": 10,
          "upper_back": 6,
          "hip_extension": 12,
          "core": 10,
          "lats": 4
        },
        "meaningfulSecondarySets": {
          "hip_extension": 20,
          "triceps": 10,
          "biceps": 10,
          "rear_delts": 6,
          "upper_back": 12,
          "quadriceps": 3,
          "anterior_delts": 8
        },
        "muscleFrequency": {
          "chest": 5,
          "core": 5,
          "hip_extension": 5,
          "lats": 2,
          "quadriceps": 5,
          "upper_back": 3
        },
        "movementPatternExposures": {
          "squat": 5,
          "lunge": 5,
          "horizontal_push": 5,
          "horizontal_pull": 3,
          "hinge": 5,
          "hip_thrust": 3,
          "core": 5,
          "carry": 5,
          "vertical_pull": 2
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
        "totalWorkingSets": 55,
        "perSessionWorkingSets": [
          11,
          11,
          11,
          11,
          11
        ],
        "perSessionEstimatedMinutes": [
          41,
          41,
          41,
          41,
          41
        ],
        "fatigueUnits": {
          "perSession": [
            23,
            23,
            23,
            23,
            23
          ],
          "weeklyUnits": 115,
          "overlapFlags": [
            "more_than_three_primary_sessions"
          ]
        },
        "repeatedExercises": [
          {
            "exerciseId": "ex-cable-crunch",
            "count": 5,
            "reason": "only_equivalent_available"
          }
        ]
      },
      "progression": {
        "nextRotation": "same immutable prescriptions until canonical Progress evidence authorises regeneration",
        "mesocycleExitCriteria": [
          "Main movement and muscle data exists"
        ],
        "approvedNextMesocycles": [
          "hypertrophy_base"
        ]
      },
      "certification": {
        "allocation": {
          "status": "passed",
          "checks": [
            "exact_working_sets_resolved",
            "session_volume_bounded",
            "session_duration_bounded",
            "slot_targets_resolved"
          ],
          "failures": []
        },
        "constructed": {
          "status": "passed",
          "checks": [
            "quadriceps_direct_coverage",
            "chest_direct_coverage",
            "upper_back_direct_coverage",
            "hip_extension_direct_coverage",
            "core_direct_coverage",
            "lats_direct_coverage",
            "secondary_stimulus_reported_separately",
            "no_unauthorised_specialist_selection",
            "repeat_authorised:ex-cable-crunch"
          ],
          "failures": []
        }
      }
    },
    {
      "id": "intermediate-hypertrophy-5-full_body-established",
      "label": "Intermediate Hypertrophy · 5 days · Full Body · established comparable history",
      "status": "constructed",
      "input": {
        "goal": "build_muscle",
        "experience": "intermediate",
        "frequency": 5,
        "requestedFramework": "full_body",
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
        "macrocycle": "cert-intermediate-hypertrophy-5-full_body-established:macrocycle",
        "mesocycle": "hypertrophy_calibration",
        "microcycle": "cert-intermediate-hypertrophy-5-full_body-established:microcycle:1",
        "sessionConstruction": "canonical_plan_v3",
        "prescriptionPolicy": "mesocycle_prescription_policy_v1",
        "rationale": {
          "schemaVersion": "canonical_planning_rationale_v1",
          "goalStrategyId": "canonical_goal_hypertrophy_v1",
          "rotationReasons": [
            "framework:full_body",
            "framework_reason:explicit_supported_preference",
            "goal_strategy:build_muscle",
            "experience:intermediate",
            "frequency:5",
            "mesocycle:hypertrophy_calibration",
            "schedule:calendar_week"
          ],
          "sessionReasons": [
            {
              "planSessionIndex": 0,
              "role": "Full Body hypertrophy A",
              "reasons": [
                "microcycle_role:Full Body hypertrophy A",
                "mesocycle_purpose:Establish reproducible exercise, load and recovery baselines",
                "slot:0:full-body knee-dominant anchor",
                "slot:1:full-body press",
                "slot:2:full-body pull",
                "slot:3:complementary lower pattern",
                "slot:4:trunk support"
              ]
            },
            {
              "planSessionIndex": 1,
              "role": "Full Body hypertrophy B",
              "reasons": [
                "microcycle_role:Full Body hypertrophy B",
                "mesocycle_purpose:Establish reproducible exercise, load and recovery baselines",
                "slot:0:full-body hinge anchor",
                "slot:1:full-body press",
                "slot:2:full-body pull",
                "slot:3:complementary lower pattern",
                "slot:4:trunk support"
              ]
            },
            {
              "planSessionIndex": 2,
              "role": "Full Body hypertrophy C",
              "reasons": [
                "microcycle_role:Full Body hypertrophy C",
                "mesocycle_purpose:Establish reproducible exercise, load and recovery baselines",
                "slot:0:full-body knee-dominant anchor",
                "slot:1:full-body press",
                "slot:2:full-body pull",
                "slot:3:complementary lower pattern",
                "slot:4:trunk support"
              ]
            },
            {
              "planSessionIndex": 3,
              "role": "Full Body hypertrophy D",
              "reasons": [
                "microcycle_role:Full Body hypertrophy D",
                "mesocycle_purpose:Establish reproducible exercise, load and recovery baselines",
                "slot:0:full-body hinge anchor",
                "slot:1:full-body press",
                "slot:2:full-body pull",
                "slot:3:complementary lower pattern",
                "slot:4:trunk support"
              ]
            },
            {
              "planSessionIndex": 4,
              "role": "Full Body hypertrophy E",
              "reasons": [
                "microcycle_role:Full Body hypertrophy E",
                "mesocycle_purpose:Establish reproducible exercise, load and recovery baselines",
                "slot:0:full-body knee-dominant anchor",
                "slot:1:full-body press",
                "slot:2:full-body pull",
                "slot:3:complementary lower pattern",
                "slot:4:trunk support"
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
        "mode": "calendar_week",
        "resolvedFramework": "full_body",
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
          "role": "Full Body hypertrophy A",
          "purpose": "Establish reproducible exercise, load and recovery baselines",
          "workingSets": 11,
          "estimatedMinutes": 41,
          "dosageAssessment": {
            "exerciseCount": 5,
            "workingSets": 11,
            "fourExercisesAndElevenSets": false,
            "outcome": "role_specific_allocation",
            "reason": "5 owned movement/muscle slots supply 11 exact working sets for this session role; appropriateness is certified from full-rotation direct stimulus, secondary stimulus, duration and fatigue rather than a universal exercise count."
          },
          "exercises": [
            {
              "exerciseId": "ex-barbell-back-squat",
              "exercise": "Barbell Back Squat",
              "movement": "squat",
              "slotPurpose": "full-body knee-dominant anchor",
              "workingSets": 3,
              "exactReps": [
                8,
                8,
                8
              ],
              "loadState": "established",
              "prescribedBaseLoad": 50,
              "restSeconds": 150,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:full-body knee-dominant anchor",
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
              "slotPurpose": "full-body press",
              "workingSets": 2,
              "exactReps": [
                10,
                10
              ],
              "loadState": "established",
              "prescribedBaseLoad": 50,
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:full-body press",
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
              "slotPurpose": "full-body pull",
              "workingSets": 2,
              "exactReps": [
                10,
                10
              ],
              "loadState": "established",
              "prescribedBaseLoad": 50,
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:full-body pull",
                "fatigue:moderate",
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
              "slotPurpose": "complementary lower pattern",
              "workingSets": 2,
              "exactReps": [
                10,
                10
              ],
              "loadState": "established",
              "prescribedBaseLoad": 50,
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:complementary lower pattern",
                "fatigue:moderate",
                "recovery:normal",
                "stability:high",
                "repeat:not_repeated",
                "preference_score:0"
              ]
            },
            {
              "exerciseId": "ex-cable-crunch",
              "exercise": "Cable Crunch",
              "movement": "core",
              "slotPurpose": "trunk support",
              "workingSets": 2,
              "exactReps": [
                12,
                12
              ],
              "loadState": "established",
              "prescribedBaseLoad": 50,
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:trunk support",
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
          "order": 2,
          "dayOffset": 1,
          "role": "Full Body hypertrophy B",
          "purpose": "Establish reproducible exercise, load and recovery baselines",
          "workingSets": 11,
          "estimatedMinutes": 41,
          "dosageAssessment": {
            "exerciseCount": 5,
            "workingSets": 11,
            "fourExercisesAndElevenSets": false,
            "outcome": "role_specific_allocation",
            "reason": "5 owned movement/muscle slots supply 11 exact working sets for this session role; appropriateness is certified from full-rotation direct stimulus, secondary stimulus, duration and fatigue rather than a universal exercise count."
          },
          "exercises": [
            {
              "exerciseId": "ex-deadlift",
              "exercise": "Deadlift",
              "movement": "hinge",
              "slotPurpose": "full-body hinge anchor",
              "workingSets": 3,
              "exactReps": [
                8,
                8,
                8
              ],
              "loadState": "established",
              "prescribedBaseLoad": 50,
              "restSeconds": 150,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:full-body hinge anchor",
                "fatigue:high",
                "recovery:normal",
                "stability:moderate",
                "repeat:not_repeated",
                "preference_score:0"
              ]
            },
            {
              "exerciseId": "ex-incline-plate-loaded-press",
              "exercise": "Incline Plate Loaded Press",
              "movement": "horizontal_push",
              "slotPurpose": "full-body press",
              "workingSets": 2,
              "exactReps": [
                10,
                10
              ],
              "loadState": "established",
              "prescribedBaseLoad": 50,
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:full-body press",
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
              "slotPurpose": "full-body pull",
              "workingSets": 2,
              "exactReps": [
                10,
                10
              ],
              "loadState": "established",
              "prescribedBaseLoad": 50,
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:full-body pull",
                "fatigue:moderate",
                "recovery:normal",
                "stability:high",
                "repeat:not_repeated",
                "preference_score:0"
              ]
            },
            {
              "exerciseId": "ex-hack-squat-machine",
              "exercise": "Hack Squat Machine",
              "movement": "squat",
              "slotPurpose": "complementary lower pattern",
              "workingSets": 2,
              "exactReps": [
                10,
                10
              ],
              "loadState": "established",
              "prescribedBaseLoad": 50,
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:complementary lower pattern",
                "fatigue:moderate",
                "recovery:normal",
                "stability:high",
                "repeat:not_repeated",
                "preference_score:0"
              ]
            },
            {
              "exerciseId": "ex-cable-crunch",
              "exercise": "Cable Crunch",
              "movement": "core",
              "slotPurpose": "trunk support",
              "workingSets": 2,
              "exactReps": [
                12,
                12
              ],
              "loadState": "established",
              "prescribedBaseLoad": 50,
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:trunk support",
                "fatigue:moderate",
                "recovery:normal",
                "stability:high",
                "repeat:only_equivalent_available",
                "preference_score:0"
              ]
            }
          ]
        },
        {
          "order": 3,
          "dayOffset": 2,
          "role": "Full Body hypertrophy C",
          "purpose": "Establish reproducible exercise, load and recovery baselines",
          "workingSets": 11,
          "estimatedMinutes": 41,
          "dosageAssessment": {
            "exerciseCount": 5,
            "workingSets": 11,
            "fourExercisesAndElevenSets": false,
            "outcome": "role_specific_allocation",
            "reason": "5 owned movement/muscle slots supply 11 exact working sets for this session role; appropriateness is certified from full-rotation direct stimulus, secondary stimulus, duration and fatigue rather than a universal exercise count."
          },
          "exercises": [
            {
              "exerciseId": "ex-safety-bar-squat",
              "exercise": "Safety Bar Squat",
              "movement": "squat",
              "slotPurpose": "full-body knee-dominant anchor",
              "workingSets": 3,
              "exactReps": [
                8,
                8,
                8
              ],
              "loadState": "established",
              "prescribedBaseLoad": 50,
              "restSeconds": 150,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:full-body knee-dominant anchor",
                "fatigue:high",
                "recovery:normal",
                "stability:moderate",
                "repeat:not_repeated",
                "preference_score:0"
              ]
            },
            {
              "exerciseId": "ex-machine-chest-press",
              "exercise": "Machine Chest Press",
              "movement": "horizontal_push",
              "slotPurpose": "full-body press",
              "workingSets": 2,
              "exactReps": [
                10,
                10
              ],
              "loadState": "established",
              "prescribedBaseLoad": 50,
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:full-body press",
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
              "slotPurpose": "full-body pull",
              "workingSets": 2,
              "exactReps": [
                10,
                10
              ],
              "loadState": "established",
              "prescribedBaseLoad": 50,
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:full-body pull",
                "fatigue:moderate",
                "recovery:normal",
                "stability:high",
                "repeat:not_repeated",
                "preference_score:0"
              ]
            },
            {
              "exerciseId": "ex-machine-glute-drive",
              "exercise": "Machine Glute Drive",
              "movement": "hip_thrust",
              "slotPurpose": "complementary lower pattern",
              "workingSets": 2,
              "exactReps": [
                10,
                10
              ],
              "loadState": "established",
              "prescribedBaseLoad": 50,
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:complementary lower pattern",
                "fatigue:moderate",
                "recovery:normal",
                "stability:high",
                "repeat:not_repeated",
                "preference_score:0"
              ]
            },
            {
              "exerciseId": "ex-cable-crunch",
              "exercise": "Cable Crunch",
              "movement": "core",
              "slotPurpose": "trunk support",
              "workingSets": 2,
              "exactReps": [
                12,
                12
              ],
              "loadState": "established",
              "prescribedBaseLoad": 50,
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:trunk support",
                "fatigue:moderate",
                "recovery:normal",
                "stability:high",
                "repeat:only_equivalent_available",
                "preference_score:0"
              ]
            }
          ]
        },
        {
          "order": 4,
          "dayOffset": 4,
          "role": "Full Body hypertrophy D",
          "purpose": "Establish reproducible exercise, load and recovery baselines",
          "workingSets": 11,
          "estimatedMinutes": 41,
          "dosageAssessment": {
            "exerciseCount": 5,
            "workingSets": 11,
            "fourExercisesAndElevenSets": false,
            "outcome": "role_specific_allocation",
            "reason": "5 owned movement/muscle slots supply 11 exact working sets for this session role; appropriateness is certified from full-rotation direct stimulus, secondary stimulus, duration and fatigue rather than a universal exercise count."
          },
          "exercises": [
            {
              "exerciseId": "ex-dumbbell-romanian-deadlift",
              "exercise": "Dumbbell Romanian Deadlift",
              "movement": "hinge",
              "slotPurpose": "full-body hinge anchor",
              "workingSets": 3,
              "exactReps": [
                8,
                8,
                8
              ],
              "loadState": "established",
              "prescribedBaseLoad": 50,
              "restSeconds": 150,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:full-body hinge anchor",
                "fatigue:high",
                "recovery:normal",
                "stability:moderate",
                "repeat:not_repeated",
                "preference_score:0"
              ]
            },
            {
              "exerciseId": "ex-decline-barbell-bench",
              "exercise": "Decline Barbell Bench",
              "movement": "horizontal_push",
              "slotPurpose": "full-body press",
              "workingSets": 2,
              "exactReps": [
                10,
                10
              ],
              "loadState": "established",
              "prescribedBaseLoad": 50,
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:full-body press",
                "fatigue:moderate",
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
              "slotPurpose": "full-body pull",
              "workingSets": 2,
              "exactReps": [
                10,
                10
              ],
              "loadState": "established",
              "prescribedBaseLoad": 50,
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:full-body pull",
                "fatigue:moderate",
                "recovery:normal",
                "stability:high",
                "repeat:not_repeated",
                "preference_score:0"
              ]
            },
            {
              "exerciseId": "ex-hack-squat-plate-loaded",
              "exercise": "Hack Squat Plate Loaded",
              "movement": "squat",
              "slotPurpose": "complementary lower pattern",
              "workingSets": 2,
              "exactReps": [
                10,
                10
              ],
              "loadState": "established",
              "prescribedBaseLoad": 50,
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:complementary lower pattern",
                "fatigue:moderate",
                "recovery:normal",
                "stability:high",
                "repeat:not_repeated",
                "preference_score:0"
              ]
            },
            {
              "exerciseId": "ex-cable-crunch",
              "exercise": "Cable Crunch",
              "movement": "core",
              "slotPurpose": "trunk support",
              "workingSets": 2,
              "exactReps": [
                12,
                12
              ],
              "loadState": "established",
              "prescribedBaseLoad": 50,
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:trunk support",
                "fatigue:moderate",
                "recovery:normal",
                "stability:high",
                "repeat:only_equivalent_available",
                "preference_score:0"
              ]
            }
          ]
        },
        {
          "order": 5,
          "dayOffset": 5,
          "role": "Full Body hypertrophy E",
          "purpose": "Establish reproducible exercise, load and recovery baselines",
          "workingSets": 11,
          "estimatedMinutes": 41,
          "dosageAssessment": {
            "exerciseCount": 5,
            "workingSets": 11,
            "fourExercisesAndElevenSets": false,
            "outcome": "role_specific_allocation",
            "reason": "5 owned movement/muscle slots supply 11 exact working sets for this session role; appropriateness is certified from full-rotation direct stimulus, secondary stimulus, duration and fatigue rather than a universal exercise count."
          },
          "exercises": [
            {
              "exerciseId": "ex-front-squat",
              "exercise": "Front Squat",
              "movement": "squat",
              "slotPurpose": "full-body knee-dominant anchor",
              "workingSets": 3,
              "exactReps": [
                8,
                8,
                8
              ],
              "loadState": "established",
              "prescribedBaseLoad": 50,
              "restSeconds": 150,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:full-body knee-dominant anchor",
                "fatigue:high",
                "recovery:normal",
                "stability:moderate",
                "repeat:not_repeated",
                "preference_score:0"
              ]
            },
            {
              "exerciseId": "ex-decline-press",
              "exercise": "Decline Press",
              "movement": "horizontal_push",
              "slotPurpose": "full-body press",
              "workingSets": 2,
              "exactReps": [
                10,
                10
              ],
              "loadState": "established",
              "prescribedBaseLoad": 50,
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:full-body press",
                "fatigue:moderate",
                "recovery:normal",
                "stability:high",
                "repeat:not_repeated",
                "preference_score:0"
              ]
            },
            {
              "exerciseId": "ex-high-row-plate-loaded",
              "exercise": "High Row Plate Loaded",
              "movement": "horizontal_pull",
              "slotPurpose": "full-body pull",
              "workingSets": 2,
              "exactReps": [
                10,
                10
              ],
              "loadState": "established",
              "prescribedBaseLoad": 50,
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:full-body pull",
                "fatigue:moderate",
                "recovery:normal",
                "stability:high",
                "repeat:not_repeated",
                "preference_score:0"
              ]
            },
            {
              "exerciseId": "ex-single-leg-hip-thrust",
              "exercise": "Single-Leg Hip Thrust",
              "movement": "hip_thrust",
              "slotPurpose": "complementary lower pattern",
              "workingSets": 2,
              "exactReps": [
                10,
                10
              ],
              "loadState": "bodyweight",
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:complementary lower pattern",
                "fatigue:moderate",
                "recovery:normal",
                "stability:high",
                "repeat:not_repeated",
                "preference_score:0"
              ]
            },
            {
              "exerciseId": "ex-cable-crunch",
              "exercise": "Cable Crunch",
              "movement": "core",
              "slotPurpose": "trunk support",
              "workingSets": 2,
              "exactReps": [
                12,
                12
              ],
              "loadState": "established",
              "prescribedBaseLoad": 50,
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:trunk support",
                "fatigue:moderate",
                "recovery:normal",
                "stability:high",
                "repeat:only_equivalent_available",
                "preference_score:0"
              ]
            }
          ]
        }
      ],
      "accounting": {
        "directSets": {
          "quadriceps": 13,
          "chest": 10,
          "upper_back": 6,
          "hip_extension": 12,
          "core": 10,
          "lats": 4
        },
        "meaningfulSecondarySets": {
          "hip_extension": 20,
          "triceps": 10,
          "biceps": 10,
          "rear_delts": 6,
          "upper_back": 12,
          "quadriceps": 3,
          "anterior_delts": 8
        },
        "muscleFrequency": {
          "chest": 5,
          "core": 5,
          "hip_extension": 5,
          "lats": 2,
          "quadriceps": 5,
          "upper_back": 3
        },
        "movementPatternExposures": {
          "squat": 5,
          "lunge": 5,
          "horizontal_push": 5,
          "horizontal_pull": 3,
          "hinge": 5,
          "hip_thrust": 3,
          "core": 5,
          "carry": 5,
          "vertical_pull": 2
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
        "totalWorkingSets": 55,
        "perSessionWorkingSets": [
          11,
          11,
          11,
          11,
          11
        ],
        "perSessionEstimatedMinutes": [
          41,
          41,
          41,
          41,
          41
        ],
        "fatigueUnits": {
          "perSession": [
            23,
            23,
            23,
            23,
            23
          ],
          "weeklyUnits": 115,
          "overlapFlags": [
            "more_than_three_primary_sessions"
          ]
        },
        "repeatedExercises": [
          {
            "exerciseId": "ex-cable-crunch",
            "count": 5,
            "reason": "only_equivalent_available"
          }
        ]
      },
      "progression": {
        "nextRotation": "same immutable prescriptions until canonical Progress evidence authorises regeneration",
        "mesocycleExitCriteria": [
          "Main movement and muscle data exists"
        ],
        "approvedNextMesocycles": [
          "hypertrophy_base"
        ]
      },
      "certification": {
        "allocation": {
          "status": "passed",
          "checks": [
            "exact_working_sets_resolved",
            "session_volume_bounded",
            "session_duration_bounded",
            "slot_targets_resolved"
          ],
          "failures": []
        },
        "constructed": {
          "status": "passed",
          "checks": [
            "quadriceps_direct_coverage",
            "chest_direct_coverage",
            "upper_back_direct_coverage",
            "hip_extension_direct_coverage",
            "core_direct_coverage",
            "lats_direct_coverage",
            "secondary_stimulus_reported_separately",
            "no_unauthorised_specialist_selection",
            "repeat_authorised:ex-cable-crunch"
          ],
          "failures": []
        }
      }
    },
    {
      "id": "intermediate-hypertrophy-5-body_part_split-calibration",
      "label": "Intermediate Hypertrophy · 5 days · Body Part Split · no established history",
      "status": "constructed",
      "input": {
        "goal": "build_muscle",
        "experience": "intermediate",
        "frequency": 5,
        "requestedFramework": "body_part_split",
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
        "macrocycle": "cert-intermediate-hypertrophy-5-body_part_split-calibration:macrocycle",
        "mesocycle": "hypertrophy_calibration",
        "microcycle": "cert-intermediate-hypertrophy-5-body_part_split-calibration:microcycle:1",
        "sessionConstruction": "canonical_plan_v3",
        "prescriptionPolicy": "mesocycle_prescription_policy_v1",
        "rationale": {
          "schemaVersion": "canonical_planning_rationale_v1",
          "goalStrategyId": "canonical_goal_hypertrophy_v1",
          "rotationReasons": [
            "framework:chest_back_shoulders_arms_legs",
            "framework_reason:explicit_supported_preference",
            "goal_strategy:build_muscle",
            "experience:intermediate",
            "frequency:5",
            "mesocycle:hypertrophy_calibration",
            "schedule:calendar_week"
          ],
          "sessionReasons": [
            {
              "planSessionIndex": 0,
              "role": "Chest hypertrophy",
              "reasons": [
                "microcycle_role:Chest hypertrophy",
                "mesocycle_purpose:Establish reproducible exercise, load and recovery baselines",
                "slot:0:primary horizontal press",
                "slot:1:secondary press stimulus",
                "slot:2:lateral-delt stimulus",
                "slot:3:elbow-extension support"
              ]
            },
            {
              "planSessionIndex": 1,
              "role": "Back hypertrophy",
              "reasons": [
                "microcycle_role:Back hypertrophy",
                "mesocycle_purpose:Establish reproducible exercise, load and recovery baselines",
                "slot:0:primary horizontal pull",
                "slot:1:vertical-pull lat stimulus",
                "slot:2:rear-delt support",
                "slot:3:elbow-flexor support"
              ]
            },
            {
              "planSessionIndex": 2,
              "role": "Shoulders hypertrophy",
              "reasons": [
                "microcycle_role:Shoulders hypertrophy",
                "mesocycle_purpose:Establish reproducible exercise, load and recovery baselines",
                "slot:0:shoulder press anchor",
                "slot:1:lateral-delt work",
                "slot:2:rear-delt work",
                "slot:3:triceps support"
              ]
            },
            {
              "planSessionIndex": 3,
              "role": "Arms hypertrophy",
              "reasons": [
                "microcycle_role:Arms hypertrophy",
                "mesocycle_purpose:Establish reproducible exercise, load and recovery baselines",
                "slot:0:primary triceps work",
                "slot:1:primary biceps work",
                "slot:2:second triceps angle",
                "slot:3:second biceps angle"
              ]
            },
            {
              "planSessionIndex": 4,
              "role": "Legs hypertrophy E",
              "reasons": [
                "microcycle_role:Legs hypertrophy E",
                "mesocycle_purpose:Establish reproducible exercise, load and recovery baselines",
                "slot:0:knee-dominant anchor",
                "slot:1:hip-extension support",
                "slot:2:knee-flexion hamstring work",
                "slot:3:calf work"
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
        "mode": "calendar_week",
        "resolvedFramework": "body_part_split",
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
          "role": "Chest hypertrophy",
          "purpose": "Establish reproducible exercise, load and recovery baselines",
          "workingSets": 9,
          "estimatedMinutes": 35,
          "dosageAssessment": {
            "exerciseCount": 4,
            "workingSets": 9,
            "fourExercisesAndElevenSets": false,
            "outcome": "role_specific_allocation",
            "reason": "4 owned movement/muscle slots supply 9 exact working sets for this session role; appropriateness is certified from full-rotation direct stimulus, secondary stimulus, duration and fatigue rather than a universal exercise count."
          },
          "exercises": [
            {
              "exerciseId": "ex-decline-barbell-bench",
              "exercise": "Decline Barbell Bench",
              "movement": "horizontal_push",
              "slotPurpose": "primary horizontal press",
              "workingSets": 3,
              "exactReps": [
                12,
                12,
                12
              ],
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
              "exerciseId": "ex-decline-plate-loaded-press",
              "exercise": "Decline Plate Loaded Press",
              "movement": "horizontal_push",
              "slotPurpose": "secondary press stimulus",
              "workingSets": 2,
              "exactReps": [
                10,
                10
              ],
              "loadState": "calibration_required",
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:secondary press stimulus",
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
              "workingSets": 2,
              "exactReps": [
                15,
                15
              ],
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
              "slotPurpose": "elbow-extension support",
              "workingSets": 2,
              "exactReps": [
                12,
                12
              ],
              "loadState": "calibration_required",
              "restSeconds": 75,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:elbow-extension support",
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
          "role": "Back hypertrophy",
          "purpose": "Establish reproducible exercise, load and recovery baselines",
          "workingSets": 9,
          "estimatedMinutes": 35,
          "dosageAssessment": {
            "exerciseCount": 4,
            "workingSets": 9,
            "fourExercisesAndElevenSets": false,
            "outcome": "role_specific_allocation",
            "reason": "4 owned movement/muscle slots supply 9 exact working sets for this session role; appropriateness is certified from full-rotation direct stimulus, secondary stimulus, duration and fatigue rather than a universal exercise count."
          },
          "exercises": [
            {
              "exerciseId": "ex-barbell-row",
              "exercise": "Barbell Row",
              "movement": "horizontal_pull",
              "slotPurpose": "primary horizontal pull",
              "workingSets": 3,
              "exactReps": [
                8,
                8,
                8
              ],
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
              "workingSets": 2,
              "exactReps": [
                10,
                10
              ],
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
              "exerciseId": "ex-cable-rear-delt-fly",
              "exercise": "Cable Rear Delt Fly",
              "movement": "isolation",
              "slotPurpose": "rear-delt support",
              "workingSets": 2,
              "exactReps": [
                15,
                15
              ],
              "loadState": "calibration_required",
              "restSeconds": 75,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:rear-delt support",
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
              "slotPurpose": "elbow-flexor support",
              "workingSets": 2,
              "exactReps": [
                12,
                12
              ],
              "loadState": "calibration_required",
              "restSeconds": 75,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:elbow-flexor support",
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
          "role": "Shoulders hypertrophy",
          "purpose": "Establish reproducible exercise, load and recovery baselines",
          "workingSets": 9,
          "estimatedMinutes": 35,
          "dosageAssessment": {
            "exerciseCount": 4,
            "workingSets": 9,
            "fourExercisesAndElevenSets": false,
            "outcome": "role_specific_allocation",
            "reason": "4 owned movement/muscle slots supply 9 exact working sets for this session role; appropriateness is certified from full-rotation direct stimulus, secondary stimulus, duration and fatigue rather than a universal exercise count."
          },
          "exercises": [
            {
              "exerciseId": "ex-arnold-press",
              "exercise": "Arnold Press",
              "movement": "vertical_push",
              "slotPurpose": "shoulder press anchor",
              "workingSets": 3,
              "exactReps": [
                12,
                12,
                12
              ],
              "loadState": "calibration_required",
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:shoulder press anchor",
                "fatigue:moderate",
                "recovery:normal",
                "stability:moderate",
                "repeat:not_repeated",
                "preference_score:0"
              ]
            },
            {
              "exerciseId": "ex-lateral-raise-plate-loaded",
              "exercise": "Lateral Raise Plate Loaded",
              "movement": "isolation",
              "slotPurpose": "lateral-delt work",
              "workingSets": 2,
              "exactReps": [
                15,
                15
              ],
              "loadState": "calibration_required",
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:lateral-delt work",
                "fatigue:low",
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
              "slotPurpose": "rear-delt work",
              "workingSets": 2,
              "exactReps": [
                15,
                15
              ],
              "loadState": "calibration_required",
              "restSeconds": 75,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:rear-delt work",
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
              "slotPurpose": "triceps support",
              "workingSets": 2,
              "exactReps": [
                12,
                12
              ],
              "loadState": "calibration_required",
              "restSeconds": 75,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:triceps support",
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
          "role": "Arms hypertrophy",
          "purpose": "Establish reproducible exercise, load and recovery baselines",
          "workingSets": 8,
          "estimatedMinutes": 32,
          "dosageAssessment": {
            "exerciseCount": 4,
            "workingSets": 8,
            "fourExercisesAndElevenSets": false,
            "outcome": "role_specific_allocation",
            "reason": "4 owned movement/muscle slots supply 8 exact working sets for this session role; appropriateness is certified from full-rotation direct stimulus, secondary stimulus, duration and fatigue rather than a universal exercise count."
          },
          "exercises": [
            {
              "exerciseId": "ex-ez-bar-pushdown",
              "exercise": "EZ-Bar Pushdown",
              "movement": "isolation",
              "slotPurpose": "primary triceps work",
              "workingSets": 2,
              "exactReps": [
                12,
                12
              ],
              "loadState": "calibration_required",
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:primary triceps work",
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
              "slotPurpose": "primary biceps work",
              "workingSets": 2,
              "exactReps": [
                12,
                12
              ],
              "loadState": "calibration_required",
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:primary biceps work",
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
              "slotPurpose": "second triceps angle",
              "workingSets": 2,
              "exactReps": [
                12,
                12
              ],
              "loadState": "calibration_required",
              "restSeconds": 75,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:second triceps angle",
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
              "slotPurpose": "second biceps angle",
              "workingSets": 2,
              "exactReps": [
                12,
                12
              ],
              "loadState": "calibration_required",
              "restSeconds": 75,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:second biceps angle",
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
          "role": "Legs hypertrophy E",
          "purpose": "Establish reproducible exercise, load and recovery baselines",
          "workingSets": 9,
          "estimatedMinutes": 35,
          "dosageAssessment": {
            "exerciseCount": 4,
            "workingSets": 9,
            "fourExercisesAndElevenSets": false,
            "outcome": "role_specific_allocation",
            "reason": "4 owned movement/muscle slots supply 9 exact working sets for this session role; appropriateness is certified from full-rotation direct stimulus, secondary stimulus, duration and fatigue rather than a universal exercise count."
          },
          "exercises": [
            {
              "exerciseId": "ex-hack-squat-machine",
              "exercise": "Hack Squat Machine",
              "movement": "squat",
              "slotPurpose": "knee-dominant anchor",
              "workingSets": 3,
              "exactReps": [
                12,
                12,
                12
              ],
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
              "exerciseId": "ex-hip-thrust-machine",
              "exercise": "Hip Thrust Machine",
              "movement": "hip_thrust",
              "slotPurpose": "hip-extension support",
              "workingSets": 2,
              "exactReps": [
                10,
                10
              ],
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
              "workingSets": 2,
              "exactReps": [
                12,
                12
              ],
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
              "exerciseId": "ex-donkey-calf-raise",
              "exercise": "Donkey Calf Raise",
              "movement": "isolation",
              "slotPurpose": "calf work",
              "workingSets": 2,
              "exactReps": [
                15,
                15
              ],
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
        }
      ],
      "accounting": {
        "directSets": {
          "chest": 5,
          "lateral_delts": 4,
          "triceps": 8,
          "upper_back": 3,
          "lats": 2,
          "rear_delts": 4,
          "biceps": 6,
          "anterior_delts": 3,
          "quadriceps": 3,
          "hip_extension": 2,
          "hamstrings_knee_flexion": 2,
          "calves": 2
        },
        "meaningfulSecondarySets": {
          "triceps": 8,
          "anterior_delts": 3,
          "biceps": 5,
          "rear_delts": 3,
          "hip_extension": 6,
          "upper_back": 4
        },
        "muscleFrequency": {
          "anterior_delts": 1,
          "biceps": 2,
          "calves": 1,
          "chest": 1,
          "hamstrings_knee_flexion": 1,
          "hip_extension": 1,
          "lateral_delts": 2,
          "lats": 1,
          "quadriceps": 1,
          "rear_delts": 2,
          "triceps": 3,
          "upper_back": 1
        },
        "movementPatternExposures": {
          "horizontal_push": 2,
          "vertical_push": 2,
          "isolation": 13,
          "horizontal_pull": 1,
          "vertical_pull": 1,
          "squat": 1,
          "lunge": 1,
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
        "totalWorkingSets": 44,
        "perSessionWorkingSets": [
          9,
          9,
          9,
          8,
          9
        ],
        "perSessionEstimatedMinutes": [
          35,
          35,
          35,
          32,
          35
        ],
        "fatigueUnits": {
          "perSession": [
            17,
            17,
            17,
            12,
            17
          ],
          "weeklyUnits": 80,
          "overlapFlags": [
            "more_than_three_primary_sessions"
          ]
        },
        "repeatedExercises": []
      },
      "progression": {
        "nextRotation": "same immutable prescriptions until canonical Progress evidence authorises regeneration",
        "mesocycleExitCriteria": [
          "Main movement and muscle data exists"
        ],
        "approvedNextMesocycles": [
          "hypertrophy_base"
        ]
      },
      "certification": {
        "allocation": {
          "status": "passed",
          "checks": [
            "exact_working_sets_resolved",
            "session_volume_bounded",
            "session_duration_bounded",
            "slot_targets_resolved"
          ],
          "failures": []
        },
        "constructed": {
          "status": "passed",
          "checks": [
            "chest_direct_coverage",
            "lateral_delts_direct_coverage",
            "triceps_direct_coverage",
            "upper_back_direct_coverage",
            "lats_direct_coverage",
            "rear_delts_direct_coverage",
            "biceps_direct_coverage",
            "anterior_delts_direct_coverage",
            "quadriceps_direct_coverage",
            "hip_extension_direct_coverage",
            "hamstrings_knee_flexion_direct_coverage",
            "calves_direct_coverage",
            "secondary_stimulus_reported_separately",
            "no_unauthorised_specialist_selection"
          ],
          "failures": []
        }
      }
    },
    {
      "id": "intermediate-hypertrophy-5-body_part_split-established",
      "label": "Intermediate Hypertrophy · 5 days · Body Part Split · established comparable history",
      "status": "constructed",
      "input": {
        "goal": "build_muscle",
        "experience": "intermediate",
        "frequency": 5,
        "requestedFramework": "body_part_split",
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
        "macrocycle": "cert-intermediate-hypertrophy-5-body_part_split-established:macrocycle",
        "mesocycle": "hypertrophy_calibration",
        "microcycle": "cert-intermediate-hypertrophy-5-body_part_split-established:microcycle:1",
        "sessionConstruction": "canonical_plan_v3",
        "prescriptionPolicy": "mesocycle_prescription_policy_v1",
        "rationale": {
          "schemaVersion": "canonical_planning_rationale_v1",
          "goalStrategyId": "canonical_goal_hypertrophy_v1",
          "rotationReasons": [
            "framework:chest_back_shoulders_arms_legs",
            "framework_reason:explicit_supported_preference",
            "goal_strategy:build_muscle",
            "experience:intermediate",
            "frequency:5",
            "mesocycle:hypertrophy_calibration",
            "schedule:calendar_week"
          ],
          "sessionReasons": [
            {
              "planSessionIndex": 0,
              "role": "Chest hypertrophy",
              "reasons": [
                "microcycle_role:Chest hypertrophy",
                "mesocycle_purpose:Establish reproducible exercise, load and recovery baselines",
                "slot:0:primary horizontal press",
                "slot:1:secondary press stimulus",
                "slot:2:lateral-delt stimulus",
                "slot:3:elbow-extension support"
              ]
            },
            {
              "planSessionIndex": 1,
              "role": "Back hypertrophy",
              "reasons": [
                "microcycle_role:Back hypertrophy",
                "mesocycle_purpose:Establish reproducible exercise, load and recovery baselines",
                "slot:0:primary horizontal pull",
                "slot:1:vertical-pull lat stimulus",
                "slot:2:rear-delt support",
                "slot:3:elbow-flexor support"
              ]
            },
            {
              "planSessionIndex": 2,
              "role": "Shoulders hypertrophy",
              "reasons": [
                "microcycle_role:Shoulders hypertrophy",
                "mesocycle_purpose:Establish reproducible exercise, load and recovery baselines",
                "slot:0:shoulder press anchor",
                "slot:1:lateral-delt work",
                "slot:2:rear-delt work",
                "slot:3:triceps support"
              ]
            },
            {
              "planSessionIndex": 3,
              "role": "Arms hypertrophy",
              "reasons": [
                "microcycle_role:Arms hypertrophy",
                "mesocycle_purpose:Establish reproducible exercise, load and recovery baselines",
                "slot:0:primary triceps work",
                "slot:1:primary biceps work",
                "slot:2:second triceps angle",
                "slot:3:second biceps angle"
              ]
            },
            {
              "planSessionIndex": 4,
              "role": "Legs hypertrophy E",
              "reasons": [
                "microcycle_role:Legs hypertrophy E",
                "mesocycle_purpose:Establish reproducible exercise, load and recovery baselines",
                "slot:0:knee-dominant anchor",
                "slot:1:hip-extension support",
                "slot:2:knee-flexion hamstring work",
                "slot:3:calf work"
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
        "mode": "calendar_week",
        "resolvedFramework": "body_part_split",
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
          "role": "Chest hypertrophy",
          "purpose": "Establish reproducible exercise, load and recovery baselines",
          "workingSets": 9,
          "estimatedMinutes": 35,
          "dosageAssessment": {
            "exerciseCount": 4,
            "workingSets": 9,
            "fourExercisesAndElevenSets": false,
            "outcome": "role_specific_allocation",
            "reason": "4 owned movement/muscle slots supply 9 exact working sets for this session role; appropriateness is certified from full-rotation direct stimulus, secondary stimulus, duration and fatigue rather than a universal exercise count."
          },
          "exercises": [
            {
              "exerciseId": "ex-decline-barbell-bench",
              "exercise": "Decline Barbell Bench",
              "movement": "horizontal_push",
              "slotPurpose": "primary horizontal press",
              "workingSets": 3,
              "exactReps": [
                12,
                12,
                12
              ],
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
              "exerciseId": "ex-decline-plate-loaded-press",
              "exercise": "Decline Plate Loaded Press",
              "movement": "horizontal_push",
              "slotPurpose": "secondary press stimulus",
              "workingSets": 2,
              "exactReps": [
                10,
                10
              ],
              "loadState": "established",
              "prescribedBaseLoad": 50,
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:secondary press stimulus",
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
              "workingSets": 2,
              "exactReps": [
                15,
                15
              ],
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
              "slotPurpose": "elbow-extension support",
              "workingSets": 2,
              "exactReps": [
                12,
                12
              ],
              "loadState": "established",
              "prescribedBaseLoad": 50,
              "restSeconds": 75,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:elbow-extension support",
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
          "role": "Back hypertrophy",
          "purpose": "Establish reproducible exercise, load and recovery baselines",
          "workingSets": 9,
          "estimatedMinutes": 35,
          "dosageAssessment": {
            "exerciseCount": 4,
            "workingSets": 9,
            "fourExercisesAndElevenSets": false,
            "outcome": "role_specific_allocation",
            "reason": "4 owned movement/muscle slots supply 9 exact working sets for this session role; appropriateness is certified from full-rotation direct stimulus, secondary stimulus, duration and fatigue rather than a universal exercise count."
          },
          "exercises": [
            {
              "exerciseId": "ex-barbell-row",
              "exercise": "Barbell Row",
              "movement": "horizontal_pull",
              "slotPurpose": "primary horizontal pull",
              "workingSets": 3,
              "exactReps": [
                8,
                8,
                8
              ],
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
              "workingSets": 2,
              "exactReps": [
                10,
                10
              ],
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
              "exerciseId": "ex-cable-rear-delt-fly",
              "exercise": "Cable Rear Delt Fly",
              "movement": "isolation",
              "slotPurpose": "rear-delt support",
              "workingSets": 2,
              "exactReps": [
                15,
                15
              ],
              "loadState": "established",
              "prescribedBaseLoad": 50,
              "restSeconds": 75,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:rear-delt support",
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
              "slotPurpose": "elbow-flexor support",
              "workingSets": 2,
              "exactReps": [
                12,
                12
              ],
              "loadState": "established",
              "prescribedBaseLoad": 50,
              "restSeconds": 75,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:elbow-flexor support",
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
          "role": "Shoulders hypertrophy",
          "purpose": "Establish reproducible exercise, load and recovery baselines",
          "workingSets": 9,
          "estimatedMinutes": 35,
          "dosageAssessment": {
            "exerciseCount": 4,
            "workingSets": 9,
            "fourExercisesAndElevenSets": false,
            "outcome": "role_specific_allocation",
            "reason": "4 owned movement/muscle slots supply 9 exact working sets for this session role; appropriateness is certified from full-rotation direct stimulus, secondary stimulus, duration and fatigue rather than a universal exercise count."
          },
          "exercises": [
            {
              "exerciseId": "ex-arnold-press",
              "exercise": "Arnold Press",
              "movement": "vertical_push",
              "slotPurpose": "shoulder press anchor",
              "workingSets": 3,
              "exactReps": [
                12,
                12,
                12
              ],
              "loadState": "established",
              "prescribedBaseLoad": 50,
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:shoulder press anchor",
                "fatigue:moderate",
                "recovery:normal",
                "stability:moderate",
                "repeat:not_repeated",
                "preference_score:0"
              ]
            },
            {
              "exerciseId": "ex-lateral-raise-plate-loaded",
              "exercise": "Lateral Raise Plate Loaded",
              "movement": "isolation",
              "slotPurpose": "lateral-delt work",
              "workingSets": 2,
              "exactReps": [
                15,
                15
              ],
              "loadState": "established",
              "prescribedBaseLoad": 50,
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:lateral-delt work",
                "fatigue:low",
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
              "slotPurpose": "rear-delt work",
              "workingSets": 2,
              "exactReps": [
                15,
                15
              ],
              "loadState": "established",
              "prescribedBaseLoad": 50,
              "restSeconds": 75,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:rear-delt work",
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
              "slotPurpose": "triceps support",
              "workingSets": 2,
              "exactReps": [
                12,
                12
              ],
              "loadState": "established",
              "prescribedBaseLoad": 50,
              "restSeconds": 75,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:triceps support",
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
          "role": "Arms hypertrophy",
          "purpose": "Establish reproducible exercise, load and recovery baselines",
          "workingSets": 8,
          "estimatedMinutes": 32,
          "dosageAssessment": {
            "exerciseCount": 4,
            "workingSets": 8,
            "fourExercisesAndElevenSets": false,
            "outcome": "role_specific_allocation",
            "reason": "4 owned movement/muscle slots supply 8 exact working sets for this session role; appropriateness is certified from full-rotation direct stimulus, secondary stimulus, duration and fatigue rather than a universal exercise count."
          },
          "exercises": [
            {
              "exerciseId": "ex-ez-bar-pushdown",
              "exercise": "EZ-Bar Pushdown",
              "movement": "isolation",
              "slotPurpose": "primary triceps work",
              "workingSets": 2,
              "exactReps": [
                12,
                12
              ],
              "loadState": "established",
              "prescribedBaseLoad": 50,
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:primary triceps work",
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
              "slotPurpose": "primary biceps work",
              "workingSets": 2,
              "exactReps": [
                12,
                12
              ],
              "loadState": "established",
              "prescribedBaseLoad": 50,
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:primary biceps work",
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
              "slotPurpose": "second triceps angle",
              "workingSets": 2,
              "exactReps": [
                12,
                12
              ],
              "loadState": "established",
              "prescribedBaseLoad": 50,
              "restSeconds": 75,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:second triceps angle",
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
              "slotPurpose": "second biceps angle",
              "workingSets": 2,
              "exactReps": [
                12,
                12
              ],
              "loadState": "established",
              "prescribedBaseLoad": 50,
              "restSeconds": 75,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:second biceps angle",
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
          "role": "Legs hypertrophy E",
          "purpose": "Establish reproducible exercise, load and recovery baselines",
          "workingSets": 9,
          "estimatedMinutes": 35,
          "dosageAssessment": {
            "exerciseCount": 4,
            "workingSets": 9,
            "fourExercisesAndElevenSets": false,
            "outcome": "role_specific_allocation",
            "reason": "4 owned movement/muscle slots supply 9 exact working sets for this session role; appropriateness is certified from full-rotation direct stimulus, secondary stimulus, duration and fatigue rather than a universal exercise count."
          },
          "exercises": [
            {
              "exerciseId": "ex-hack-squat-machine",
              "exercise": "Hack Squat Machine",
              "movement": "squat",
              "slotPurpose": "knee-dominant anchor",
              "workingSets": 3,
              "exactReps": [
                12,
                12,
                12
              ],
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
              "exerciseId": "ex-hip-thrust-machine",
              "exercise": "Hip Thrust Machine",
              "movement": "hip_thrust",
              "slotPurpose": "hip-extension support",
              "workingSets": 2,
              "exactReps": [
                10,
                10
              ],
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
              "workingSets": 2,
              "exactReps": [
                12,
                12
              ],
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
              "exerciseId": "ex-donkey-calf-raise",
              "exercise": "Donkey Calf Raise",
              "movement": "isolation",
              "slotPurpose": "calf work",
              "workingSets": 2,
              "exactReps": [
                15,
                15
              ],
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
        }
      ],
      "accounting": {
        "directSets": {
          "chest": 5,
          "lateral_delts": 4,
          "triceps": 8,
          "upper_back": 3,
          "lats": 2,
          "rear_delts": 4,
          "biceps": 6,
          "anterior_delts": 3,
          "quadriceps": 3,
          "hip_extension": 2,
          "hamstrings_knee_flexion": 2,
          "calves": 2
        },
        "meaningfulSecondarySets": {
          "triceps": 8,
          "anterior_delts": 3,
          "biceps": 5,
          "rear_delts": 3,
          "hip_extension": 6,
          "upper_back": 4
        },
        "muscleFrequency": {
          "anterior_delts": 1,
          "biceps": 2,
          "calves": 1,
          "chest": 1,
          "hamstrings_knee_flexion": 1,
          "hip_extension": 1,
          "lateral_delts": 2,
          "lats": 1,
          "quadriceps": 1,
          "rear_delts": 2,
          "triceps": 3,
          "upper_back": 1
        },
        "movementPatternExposures": {
          "horizontal_push": 2,
          "vertical_push": 2,
          "isolation": 13,
          "horizontal_pull": 1,
          "vertical_pull": 1,
          "squat": 1,
          "lunge": 1,
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
        "totalWorkingSets": 44,
        "perSessionWorkingSets": [
          9,
          9,
          9,
          8,
          9
        ],
        "perSessionEstimatedMinutes": [
          35,
          35,
          35,
          32,
          35
        ],
        "fatigueUnits": {
          "perSession": [
            17,
            17,
            17,
            12,
            17
          ],
          "weeklyUnits": 80,
          "overlapFlags": [
            "more_than_three_primary_sessions"
          ]
        },
        "repeatedExercises": []
      },
      "progression": {
        "nextRotation": "same immutable prescriptions until canonical Progress evidence authorises regeneration",
        "mesocycleExitCriteria": [
          "Main movement and muscle data exists"
        ],
        "approvedNextMesocycles": [
          "hypertrophy_base"
        ]
      },
      "certification": {
        "allocation": {
          "status": "passed",
          "checks": [
            "exact_working_sets_resolved",
            "session_volume_bounded",
            "session_duration_bounded",
            "slot_targets_resolved"
          ],
          "failures": []
        },
        "constructed": {
          "status": "passed",
          "checks": [
            "chest_direct_coverage",
            "lateral_delts_direct_coverage",
            "triceps_direct_coverage",
            "upper_back_direct_coverage",
            "lats_direct_coverage",
            "rear_delts_direct_coverage",
            "biceps_direct_coverage",
            "anterior_delts_direct_coverage",
            "quadriceps_direct_coverage",
            "hip_extension_direct_coverage",
            "hamstrings_knee_flexion_direct_coverage",
            "calves_direct_coverage",
            "secondary_stimulus_reported_separately",
            "no_unauthorised_specialist_selection"
          ],
          "failures": []
        }
      }
    }
  ]
}
```
