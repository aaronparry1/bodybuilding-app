# Representative Golden Programmes

Generated from `canonical_adaptive_planning_certification_v1`. This report is evidence, not a second planning authority.

```json
{
  "schemaVersion": "canonical_adaptive_planning_certification_v1",
  "cases": [
    {
      "id": "beginner-hypertrophy-2",
      "label": "Beginner Hypertrophy · 2 days",
      "status": "constructed",
      "input": {
        "goal": "build_muscle",
        "experience": "beginner",
        "frequency": 2,
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
        "macrocycle": "cert-beginner-hypertrophy-2:macrocycle",
        "mesocycle": "hypertrophy_calibration",
        "microcycle": "cert-beginner-hypertrophy-2:microcycle:1",
        "sessionConstruction": "canonical_plan_v3",
        "prescriptionPolicy": "mesocycle_prescription_policy_v1",
        "rationale": {
          "schemaVersion": "canonical_planning_rationale_v1",
          "goalStrategyId": "canonical_goal_hypertrophy_v1",
          "rotationReasons": [
            "framework:full_body",
            "framework_reason:explicit_supported_preference",
            "goal_strategy:build_muscle",
            "experience:beginner",
            "frequency:2",
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
          3
        ],
        "recoveryDays": 5
      },
      "sessions": [
        {
          "order": 1,
          "dayOffset": 0,
          "role": "Full Body hypertrophy A",
          "purpose": "Establish reproducible exercise, load and recovery baselines",
          "workingSets": 10,
          "estimatedMinutes": 38,
          "dosageAssessment": {
            "exerciseCount": 5,
            "workingSets": 10,
            "fourExercisesAndElevenSets": false,
            "outcome": "role_specific_allocation",
            "reason": "5 owned movement/muscle slots supply 10 exact working sets for this session role; appropriateness is certified from full-rotation direct stimulus, secondary stimulus, duration and fatigue rather than a universal exercise count."
          },
          "exercises": [
            {
              "exerciseId": "ex-barbell-back-squat",
              "exercise": "Barbell Back Squat",
              "movement": "squat",
              "slotPurpose": "full-body knee-dominant anchor",
              "workingSets": 2,
              "exactReps": [
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
          "dayOffset": 3,
          "role": "Full Body hypertrophy B",
          "purpose": "Establish reproducible exercise, load and recovery baselines",
          "workingSets": 10,
          "estimatedMinutes": 38,
          "dosageAssessment": {
            "exerciseCount": 5,
            "workingSets": 10,
            "fourExercisesAndElevenSets": false,
            "outcome": "role_specific_allocation",
            "reason": "5 owned movement/muscle slots supply 10 exact working sets for this session role; appropriateness is certified from full-rotation direct stimulus, secondary stimulus, duration and fatigue rather than a universal exercise count."
          },
          "exercises": [
            {
              "exerciseId": "ex-deadlift",
              "exercise": "Deadlift",
              "movement": "hinge",
              "slotPurpose": "full-body hinge anchor",
              "workingSets": 2,
              "exactReps": [
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
        }
      ],
      "accounting": {
        "directSets": {
          "quadriceps": 4,
          "chest": 4,
          "upper_back": 2,
          "hip_extension": 4,
          "core": 4,
          "lats": 2
        },
        "meaningfulSecondarySets": {
          "hip_extension": 4,
          "triceps": 4,
          "biceps": 4,
          "rear_delts": 2,
          "upper_back": 2,
          "quadriceps": 2,
          "anterior_delts": 2
        },
        "muscleFrequency": {
          "chest": 2,
          "core": 2,
          "hip_extension": 2,
          "lats": 1,
          "quadriceps": 2,
          "upper_back": 1
        },
        "movementPatternExposures": {
          "squat": 2,
          "lunge": 2,
          "horizontal_push": 2,
          "horizontal_pull": 1,
          "hinge": 2,
          "hip_thrust": 1,
          "core": 2,
          "carry": 2,
          "vertical_pull": 1
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
        "totalWorkingSets": 20,
        "perSessionWorkingSets": [
          10,
          10
        ],
        "perSessionEstimatedMinutes": [
          38,
          38
        ],
        "fatigueUnits": {
          "perSession": [
            20,
            20
          ],
          "weeklyUnits": 40,
          "overlapFlags": []
        },
        "repeatedExercises": [
          {
            "exerciseId": "ex-cable-crunch",
            "count": 2,
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
      "id": "intermediate-hypertrophy-3",
      "label": "Intermediate Hypertrophy · 3 days",
      "status": "constructed",
      "input": {
        "goal": "build_muscle",
        "experience": "intermediate",
        "frequency": 3,
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
        "macrocycle": "cert-intermediate-hypertrophy-3:macrocycle",
        "mesocycle": "hypertrophy_calibration",
        "microcycle": "cert-intermediate-hypertrophy-3:microcycle:1",
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
            "frequency:3",
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
          2,
          4
        ],
        "recoveryDays": 4
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
          "dayOffset": 2,
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
          "dayOffset": 4,
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
        }
      ],
      "accounting": {
        "directSets": {
          "quadriceps": 8,
          "chest": 6,
          "upper_back": 4,
          "hip_extension": 7,
          "core": 6,
          "lats": 2
        },
        "meaningfulSecondarySets": {
          "hip_extension": 10,
          "triceps": 6,
          "biceps": 6,
          "rear_delts": 4,
          "upper_back": 6,
          "quadriceps": 3,
          "anterior_delts": 4
        },
        "muscleFrequency": {
          "chest": 3,
          "core": 3,
          "hip_extension": 3,
          "lats": 1,
          "quadriceps": 3,
          "upper_back": 2
        },
        "movementPatternExposures": {
          "squat": 3,
          "lunge": 3,
          "horizontal_push": 3,
          "horizontal_pull": 2,
          "hinge": 3,
          "hip_thrust": 2,
          "core": 3,
          "carry": 3,
          "vertical_pull": 1
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
        "totalWorkingSets": 33,
        "perSessionWorkingSets": [
          11,
          11,
          11
        ],
        "perSessionEstimatedMinutes": [
          41,
          41,
          41
        ],
        "fatigueUnits": {
          "perSession": [
            23,
            23,
            23
          ],
          "weeklyUnits": 69,
          "overlapFlags": []
        },
        "repeatedExercises": [
          {
            "exerciseId": "ex-cable-crunch",
            "count": 3,
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
      "id": "intermediate-hypertrophy-4",
      "label": "Intermediate Hypertrophy · 4 days",
      "status": "constructed",
      "input": {
        "goal": "build_muscle",
        "experience": "intermediate",
        "frequency": 4,
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
        "macrocycle": "cert-intermediate-hypertrophy-4:macrocycle",
        "mesocycle": "hypertrophy_calibration",
        "microcycle": "cert-intermediate-hypertrophy-4:microcycle:1",
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
            "frequency:4",
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
          3,
          4
        ],
        "recoveryDays": 3
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
          "dayOffset": 3,
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
        }
      ],
      "accounting": {
        "directSets": {
          "chest": 6,
          "upper_back": 4,
          "lats": 4,
          "lateral_delts": 4,
          "triceps": 4,
          "biceps": 4,
          "quadriceps": 6,
          "hip_extension": 4,
          "hamstrings_knee_flexion": 4,
          "calves": 4
        },
        "meaningfulSecondarySets": {
          "triceps": 6,
          "anterior_delts": 6,
          "biceps": 8,
          "rear_delts": 4,
          "hip_extension": 8
        },
        "muscleFrequency": {
          "biceps": 2,
          "calves": 2,
          "chest": 2,
          "hamstrings_knee_flexion": 2,
          "hip_extension": 2,
          "lateral_delts": 2,
          "lats": 2,
          "quadriceps": 2,
          "triceps": 2,
          "upper_back": 2
        },
        "movementPatternExposures": {
          "horizontal_push": 2,
          "horizontal_pull": 2,
          "vertical_pull": 2,
          "isolation": 10,
          "squat": 2,
          "lunge": 2,
          "hinge": 2,
          "hip_thrust": 2
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
          13,
          9,
          13,
          9
        ],
        "perSessionEstimatedMinutes": [
          47,
          35,
          47,
          35
        ],
        "fatigueUnits": {
          "perSession": [
            23,
            17,
            23,
            17
          ],
          "weeklyUnits": 80,
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
      "id": "intermediate-hypertrophy-5",
      "label": "Intermediate Hypertrophy · 5 days",
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
        "macrocycle": "cert-intermediate-hypertrophy-5:macrocycle",
        "mesocycle": "hypertrophy_calibration",
        "microcycle": "cert-intermediate-hypertrophy-5:microcycle:1",
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
      "id": "intermediate-hypertrophy-6",
      "label": "Intermediate Hypertrophy · 6 days",
      "status": "constructed",
      "input": {
        "goal": "build_muscle",
        "experience": "intermediate",
        "frequency": 6,
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
        "macrocycle": "cert-intermediate-hypertrophy-6:macrocycle",
        "mesocycle": "hypertrophy_calibration",
        "microcycle": "cert-intermediate-hypertrophy-6:microcycle:1",
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
            "frequency:6",
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
              "role": "Push hypertrophy D",
              "reasons": [
                "microcycle_role:Push hypertrophy D",
                "mesocycle_purpose:Establish reproducible exercise, load and recovery baselines",
                "slot:0:primary horizontal press",
                "slot:1:secondary press stimulus",
                "slot:2:lateral-delt stimulus",
                "slot:3:elbow-extension support"
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
                "slot:2:hinge support",
                "slot:3:elbow-flexor support"
              ]
            },
            {
              "planSessionIndex": 5,
              "role": "Legs hypertrophy F",
              "reasons": [
                "microcycle_role:Legs hypertrophy F",
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
          3,
          4,
          5
        ],
        "recoveryDays": 1
      },
      "sessions": [
        {
          "order": 1,
          "dayOffset": 0,
          "role": "Push hypertrophy A",
          "purpose": "Establish reproducible exercise, load and recovery baselines",
          "workingSets": 6,
          "estimatedMinutes": 26,
          "dosageAssessment": {
            "exerciseCount": 4,
            "workingSets": 6,
            "fourExercisesAndElevenSets": false,
            "outcome": "role_specific_allocation",
            "reason": "4 owned movement/muscle slots supply 6 exact working sets for this session role; appropriateness is certified from full-rotation direct stimulus, secondary stimulus, duration and fatigue rather than a universal exercise count."
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
              "workingSets": 1,
              "exactReps": [
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
              "workingSets": 1,
              "exactReps": [
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
              "workingSets": 1,
              "exactReps": [
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
          "workingSets": 6,
          "estimatedMinutes": 26,
          "dosageAssessment": {
            "exerciseCount": 4,
            "workingSets": 6,
            "fourExercisesAndElevenSets": false,
            "outcome": "role_specific_allocation",
            "reason": "4 owned movement/muscle slots supply 6 exact working sets for this session role; appropriateness is certified from full-rotation direct stimulus, secondary stimulus, duration and fatigue rather than a universal exercise count."
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
              "workingSets": 1,
              "exactReps": [
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
              "workingSets": 1,
              "exactReps": [
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
              "workingSets": 1,
              "exactReps": [
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
          "workingSets": 6,
          "estimatedMinutes": 26,
          "dosageAssessment": {
            "exerciseCount": 4,
            "workingSets": 6,
            "fourExercisesAndElevenSets": false,
            "outcome": "role_specific_allocation",
            "reason": "4 owned movement/muscle slots supply 6 exact working sets for this session role; appropriateness is certified from full-rotation direct stimulus, secondary stimulus, duration and fatigue rather than a universal exercise count."
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
              "workingSets": 1,
              "exactReps": [
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
              "workingSets": 1,
              "exactReps": [
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
              "workingSets": 1,
              "exactReps": [
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
          "dayOffset": 3,
          "role": "Push hypertrophy D",
          "purpose": "Establish reproducible exercise, load and recovery baselines",
          "workingSets": 6,
          "estimatedMinutes": 26,
          "dosageAssessment": {
            "exerciseCount": 4,
            "workingSets": 6,
            "fourExercisesAndElevenSets": false,
            "outcome": "role_specific_allocation",
            "reason": "4 owned movement/muscle slots supply 6 exact working sets for this session role; appropriateness is certified from full-rotation direct stimulus, secondary stimulus, duration and fatigue rather than a universal exercise count."
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
                "repeat:stable_primary_practice",
                "preference_score:0"
              ]
            },
            {
              "exerciseId": "ex-incline-plate-loaded-press",
              "exercise": "Incline Plate Loaded Press",
              "movement": "horizontal_push",
              "slotPurpose": "secondary press stimulus",
              "workingSets": 1,
              "exactReps": [
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
              "exerciseId": "ex-lateral-raise-plate-loaded",
              "exercise": "Lateral Raise Plate Loaded",
              "movement": "isolation",
              "slotPurpose": "lateral-delt stimulus",
              "workingSets": 1,
              "exactReps": [
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
              "exerciseId": "ex-close-neutral-pushdown",
              "exercise": "Close Neutral Pushdown",
              "movement": "isolation",
              "slotPurpose": "elbow-extension support",
              "workingSets": 1,
              "exactReps": [
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
          "order": 5,
          "dayOffset": 4,
          "role": "Pull hypertrophy E",
          "purpose": "Establish reproducible exercise, load and recovery baselines",
          "workingSets": 6,
          "estimatedMinutes": 26,
          "dosageAssessment": {
            "exerciseCount": 4,
            "workingSets": 6,
            "fourExercisesAndElevenSets": false,
            "outcome": "role_specific_allocation",
            "reason": "4 owned movement/muscle slots supply 6 exact working sets for this session role; appropriateness is certified from full-rotation direct stimulus, secondary stimulus, duration and fatigue rather than a universal exercise count."
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
                "repeat:stable_primary_practice",
                "preference_score:0"
              ]
            },
            {
              "exerciseId": "ex-lat-pulldown-machine",
              "exercise": "Lat Pulldown Machine",
              "movement": "vertical_pull",
              "slotPurpose": "vertical-pull lat stimulus",
              "workingSets": 1,
              "exactReps": [
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
              "exerciseId": "ex-stiff-leg-deadlift",
              "exercise": "Stiff-Leg Deadlift",
              "movement": "hinge",
              "slotPurpose": "hinge support",
              "workingSets": 1,
              "exactReps": [
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
              "exerciseId": "ex-cable-curl",
              "exercise": "Cable Curl",
              "movement": "isolation",
              "slotPurpose": "elbow-flexor support",
              "workingSets": 1,
              "exactReps": [
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
          "order": 6,
          "dayOffset": 5,
          "role": "Legs hypertrophy F",
          "purpose": "Establish reproducible exercise, load and recovery baselines",
          "workingSets": 6,
          "estimatedMinutes": 26,
          "dosageAssessment": {
            "exerciseCount": 4,
            "workingSets": 6,
            "fourExercisesAndElevenSets": false,
            "outcome": "role_specific_allocation",
            "reason": "4 owned movement/muscle slots supply 6 exact working sets for this session role; appropriateness is certified from full-rotation direct stimulus, secondary stimulus, duration and fatigue rather than a universal exercise count."
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
              "exerciseId": "ex-single-leg-hip-thrust",
              "exercise": "Single-Leg Hip Thrust",
              "movement": "hip_thrust",
              "slotPurpose": "hip-extension support",
              "workingSets": 1,
              "exactReps": [
                10
              ],
              "loadState": "bodyweight",
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
              "workingSets": 1,
              "exactReps": [
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
              "workingSets": 1,
              "exactReps": [
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
          "lateral_delts": 2,
          "triceps": 2,
          "upper_back": 6,
          "lats": 2,
          "hip_extension": 4,
          "biceps": 2,
          "quadriceps": 6,
          "hamstrings_knee_flexion": 2,
          "calves": 2
        },
        "meaningfulSecondarySets": {
          "triceps": 8,
          "anterior_delts": 7,
          "biceps": 8,
          "rear_delts": 6,
          "hip_extension": 14,
          "upper_back": 1
        },
        "muscleFrequency": {
          "biceps": 2,
          "calves": 2,
          "chest": 2,
          "hamstrings_knee_flexion": 2,
          "hip_extension": 4,
          "lateral_delts": 2,
          "lats": 2,
          "quadriceps": 2,
          "triceps": 2,
          "upper_back": 2
        },
        "movementPatternExposures": {
          "horizontal_push": 4,
          "vertical_push": 2,
          "isolation": 10,
          "horizontal_pull": 2,
          "vertical_pull": 2,
          "hinge": 4,
          "hip_thrust": 4,
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
        "totalWorkingSets": 36,
        "perSessionWorkingSets": [
          6,
          6,
          6,
          6,
          6,
          6
        ],
        "perSessionEstimatedMinutes": [
          26,
          26,
          26,
          26,
          26,
          26
        ],
        "fatigueUnits": {
          "perSession": [
            13,
            14,
            13,
            13,
            14,
            13
          ],
          "weeklyUnits": 80,
          "overlapFlags": [
            "more_than_three_primary_sessions"
          ]
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
            "repeat_authorised:ex-barbell-row",
            "repeat_authorised:ex-decline-barbell-bench",
            "repeat_authorised:ex-hack-squat-machine"
          ],
          "failures": []
        }
      }
    },
    {
      "id": "beginner-strength-3",
      "label": "Beginner Strength · 3 days",
      "status": "constructed",
      "input": {
        "goal": "build_strength",
        "experience": "beginner",
        "frequency": 3,
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
        "macrocycle": "cert-beginner-strength-3:macrocycle",
        "mesocycle": "strength_general",
        "microcycle": "cert-beginner-strength-3:microcycle:1",
        "sessionConstruction": "canonical_plan_v3",
        "prescriptionPolicy": "mesocycle_prescription_policy_v1",
        "rationale": {
          "schemaVersion": "canonical_planning_rationale_v1",
          "goalStrategyId": "canonical_goal_strength_v1",
          "rotationReasons": [
            "framework:full_body",
            "framework_reason:explicit_supported_preference",
            "goal_strategy:build_strength",
            "experience:beginner",
            "frequency:3",
            "mesocycle:strength_general",
            "schedule:calendar_week"
          ],
          "sessionReasons": [
            {
              "planSessionIndex": 0,
              "role": "Full body strength A",
              "reasons": [
                "microcycle_role:Full body strength A",
                "mesocycle_purpose:Build work capacity and movement tolerance",
                "slot:0:full-body knee-dominant anchor",
                "slot:1:full-body press",
                "slot:2:full-body pull",
                "slot:3:complementary lower pattern",
                "slot:4:trunk support"
              ]
            },
            {
              "planSessionIndex": 1,
              "role": "Full body strength B",
              "reasons": [
                "microcycle_role:Full body strength B",
                "mesocycle_purpose:Build work capacity and movement tolerance",
                "slot:0:full-body hinge anchor",
                "slot:1:full-body press",
                "slot:2:full-body pull",
                "slot:3:complementary lower pattern",
                "slot:4:trunk support"
              ]
            },
            {
              "planSessionIndex": 2,
              "role": "Full body strength C",
              "reasons": [
                "microcycle_role:Full body strength C",
                "mesocycle_purpose:Build work capacity and movement tolerance",
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
          2,
          4
        ],
        "recoveryDays": 4
      },
      "sessions": [
        {
          "order": 1,
          "dayOffset": 0,
          "role": "Full body strength A",
          "purpose": "Build work capacity and movement tolerance",
          "workingSets": 10,
          "estimatedMinutes": 38,
          "dosageAssessment": {
            "exerciseCount": 5,
            "workingSets": 10,
            "fourExercisesAndElevenSets": false,
            "outcome": "role_specific_allocation",
            "reason": "5 owned movement/muscle slots supply 10 exact working sets for this session role; appropriateness is certified from full-rotation direct stimulus, secondary stimulus, duration and fatigue rather than a universal exercise count."
          },
          "exercises": [
            {
              "exerciseId": "ex-barbell-back-squat",
              "exercise": "Barbell Back Squat",
              "movement": "squat",
              "slotPurpose": "full-body knee-dominant anchor",
              "workingSets": 2,
              "exactReps": [
                5,
                5
              ],
              "loadState": "calibration_required",
              "restSeconds": 210,
              "progression": "load_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_strength",
                "mesocycle:strength_general",
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
                "goal:build_strength",
                "mesocycle:strength_general",
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
                "goal:build_strength",
                "mesocycle:strength_general",
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
                "goal:build_strength",
                "mesocycle:strength_general",
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
                "goal:build_strength",
                "mesocycle:strength_general",
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
          "dayOffset": 2,
          "role": "Full body strength B",
          "purpose": "Build work capacity and movement tolerance",
          "workingSets": 10,
          "estimatedMinutes": 38,
          "dosageAssessment": {
            "exerciseCount": 5,
            "workingSets": 10,
            "fourExercisesAndElevenSets": false,
            "outcome": "role_specific_allocation",
            "reason": "5 owned movement/muscle slots supply 10 exact working sets for this session role; appropriateness is certified from full-rotation direct stimulus, secondary stimulus, duration and fatigue rather than a universal exercise count."
          },
          "exercises": [
            {
              "exerciseId": "ex-deadlift",
              "exercise": "Deadlift",
              "movement": "hinge",
              "slotPurpose": "full-body hinge anchor",
              "workingSets": 2,
              "exactReps": [
                5,
                5
              ],
              "loadState": "calibration_required",
              "restSeconds": 240,
              "progression": "load_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_strength",
                "mesocycle:strength_general",
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
                "goal:build_strength",
                "mesocycle:strength_general",
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
                "goal:build_strength",
                "mesocycle:strength_general",
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
                "goal:build_strength",
                "mesocycle:strength_general",
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
                "goal:build_strength",
                "mesocycle:strength_general",
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
          "dayOffset": 4,
          "role": "Full body strength C",
          "purpose": "Build work capacity and movement tolerance",
          "workingSets": 10,
          "estimatedMinutes": 38,
          "dosageAssessment": {
            "exerciseCount": 5,
            "workingSets": 10,
            "fourExercisesAndElevenSets": false,
            "outcome": "role_specific_allocation",
            "reason": "5 owned movement/muscle slots supply 10 exact working sets for this session role; appropriateness is certified from full-rotation direct stimulus, secondary stimulus, duration and fatigue rather than a universal exercise count."
          },
          "exercises": [
            {
              "exerciseId": "ex-barbell-back-squat",
              "exercise": "Barbell Back Squat",
              "movement": "squat",
              "slotPurpose": "full-body knee-dominant anchor",
              "workingSets": 2,
              "exactReps": [
                5,
                5
              ],
              "loadState": "calibration_required",
              "restSeconds": 210,
              "progression": "load_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_strength",
                "mesocycle:strength_general",
                "slot:full-body knee-dominant anchor",
                "fatigue:high",
                "recovery:normal",
                "stability:moderate",
                "repeat:stable_primary_practice",
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
                "goal:build_strength",
                "mesocycle:strength_general",
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
                "goal:build_strength",
                "mesocycle:strength_general",
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
                "goal:build_strength",
                "mesocycle:strength_general",
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
                "goal:build_strength",
                "mesocycle:strength_general",
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
          "quadriceps": 6,
          "chest": 6,
          "upper_back": 4,
          "hip_extension": 6,
          "core": 6,
          "lats": 2
        },
        "meaningfulSecondarySets": {
          "hip_extension": 8,
          "triceps": 6,
          "biceps": 6,
          "rear_delts": 4,
          "upper_back": 2,
          "quadriceps": 2,
          "anterior_delts": 4
        },
        "muscleFrequency": {
          "chest": 3,
          "core": 3,
          "hip_extension": 3,
          "lats": 1,
          "quadriceps": 3,
          "upper_back": 2
        },
        "movementPatternExposures": {
          "squat": 3,
          "lunge": 3,
          "horizontal_push": 3,
          "horizontal_pull": 2,
          "hinge": 3,
          "hip_thrust": 2,
          "core": 3,
          "carry": 3,
          "vertical_pull": 1
        },
        "primaryLiftExposures": {
          "bench": {
            "primary": 0,
            "secondaryVariation": 0
          },
          "squat": {
            "primary": 2,
            "secondaryVariation": 0
          },
          "deadlift": {
            "primary": 1,
            "secondaryVariation": 0
          }
        },
        "totalWorkingSets": 30,
        "perSessionWorkingSets": [
          10,
          10,
          10
        ],
        "perSessionEstimatedMinutes": [
          38,
          38,
          38
        ],
        "fatigueUnits": {
          "perSession": [
            20,
            20,
            20
          ],
          "weeklyUnits": 60,
          "overlapFlags": []
        },
        "repeatedExercises": [
          {
            "exerciseId": "ex-barbell-back-squat",
            "count": 2,
            "reason": "stable_primary_practice"
          },
          {
            "exerciseId": "ex-cable-crunch",
            "count": 3,
            "reason": "only_equivalent_available"
          }
        ]
      },
      "progression": {
        "nextRotation": "same immutable prescriptions until canonical Progress evidence authorises regeneration",
        "mesocycleExitCriteria": [
          "Capacity established"
        ],
        "approvedNextMesocycles": [
          "strength_accumulation"
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
            "repeat_authorised:ex-barbell-back-squat",
            "repeat_authorised:ex-cable-crunch"
          ],
          "failures": []
        }
      }
    },
    {
      "id": "intermediate-strength-4",
      "label": "Intermediate Strength · 4 days",
      "status": "constructed",
      "input": {
        "goal": "build_strength",
        "experience": "intermediate",
        "frequency": 4,
        "requestedFramework": "bench_squat_deadlift",
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
        "macrocycle": "cert-intermediate-strength-4:macrocycle",
        "mesocycle": "strength_general",
        "microcycle": "cert-intermediate-strength-4:microcycle:1",
        "sessionConstruction": "canonical_plan_v3",
        "prescriptionPolicy": "mesocycle_prescription_policy_v1",
        "rationale": {
          "schemaVersion": "canonical_planning_rationale_v1",
          "goalStrategyId": "canonical_goal_strength_v1",
          "rotationReasons": [
            "framework:bench_squat_deadlift",
            "framework_reason:explicit_supported_preference",
            "goal_strategy:build_strength",
            "experience:intermediate",
            "frequency:4",
            "mesocycle:strength_general",
            "schedule:calendar_week"
          ],
          "sessionReasons": [
            {
              "planSessionIndex": 0,
              "role": "Bench strength",
              "reasons": [
                "microcycle_role:Bench strength",
                "mesocycle_purpose:Build work capacity and movement tolerance",
                "slot:0:bench-specific anchor",
                "slot:1:bench-support row",
                "slot:2:bench triceps support"
              ]
            },
            {
              "planSessionIndex": 1,
              "role": "Squat strength",
              "reasons": [
                "microcycle_role:Squat strength",
                "mesocycle_purpose:Build work capacity and movement tolerance",
                "slot:0:squat-specific anchor",
                "slot:1:hip-extension support",
                "slot:2:knee-flexion hamstring work",
                "slot:3:calf work"
              ]
            },
            {
              "planSessionIndex": 2,
              "role": "Deadlift strength",
              "reasons": [
                "microcycle_role:Deadlift strength",
                "mesocycle_purpose:Build work capacity and movement tolerance",
                "slot:0:deadlift-specific anchor",
                "slot:1:deadlift back support",
                "slot:2:deadlift hamstring support"
              ]
            },
            {
              "planSessionIndex": 3,
              "role": "Technical strength support",
              "reasons": [
                "microcycle_role:Technical strength support",
                "mesocycle_purpose:Build work capacity and movement tolerance",
                "slot:0:full-body hinge anchor",
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
        "resolvedFramework": "bench_squat_deadlift",
        "reason": "explicit_supported_preference",
        "sessionDayOffsets": [
          0,
          1,
          3,
          4
        ],
        "recoveryDays": 3
      },
      "sessions": [
        {
          "order": 1,
          "dayOffset": 0,
          "role": "Bench strength",
          "purpose": "Build work capacity and movement tolerance",
          "workingSets": 7,
          "estimatedMinutes": 29,
          "dosageAssessment": {
            "exerciseCount": 3,
            "workingSets": 7,
            "fourExercisesAndElevenSets": false,
            "outcome": "role_specific_allocation",
            "reason": "3 owned movement/muscle slots supply 7 exact working sets for this session role; appropriateness is certified from full-rotation direct stimulus, secondary stimulus, duration and fatigue rather than a universal exercise count."
          },
          "exercises": [
            {
              "exerciseId": "ex-bench-press",
              "exercise": "Bench Press",
              "movement": "horizontal_push",
              "slotPurpose": "bench-specific anchor",
              "workingSets": 3,
              "exactReps": [
                5,
                5,
                5
              ],
              "loadState": "calibration_required",
              "restSeconds": 180,
              "progression": "load_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_strength",
                "mesocycle:strength_general",
                "slot:bench-specific anchor",
                "fatigue:high",
                "recovery:normal",
                "stability:moderate",
                "repeat:not_repeated",
                "preference_score:0"
              ]
            },
            {
              "exerciseId": "ex-chest-supported-row",
              "exercise": "Chest Supported Row",
              "movement": "horizontal_pull",
              "slotPurpose": "bench-support row",
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
                "goal:build_strength",
                "mesocycle:strength_general",
                "slot:bench-support row",
                "fatigue:moderate",
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
              "slotPurpose": "bench triceps support",
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
                "goal:build_strength",
                "mesocycle:strength_general",
                "slot:bench triceps support",
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
          "role": "Squat strength",
          "purpose": "Build work capacity and movement tolerance",
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
              "exerciseId": "ex-barbell-back-squat",
              "exercise": "Barbell Back Squat",
              "movement": "squat",
              "slotPurpose": "squat-specific anchor",
              "workingSets": 3,
              "exactReps": [
                5,
                5,
                5
              ],
              "loadState": "calibration_required",
              "restSeconds": 210,
              "progression": "load_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_strength",
                "mesocycle:strength_general",
                "slot:squat-specific anchor",
                "fatigue:high",
                "recovery:normal",
                "stability:moderate",
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
                "goal:build_strength",
                "mesocycle:strength_general",
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
                "goal:build_strength",
                "mesocycle:strength_general",
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
                "goal:build_strength",
                "mesocycle:strength_general",
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
          "dayOffset": 3,
          "role": "Deadlift strength",
          "purpose": "Build work capacity and movement tolerance",
          "workingSets": 7,
          "estimatedMinutes": 29,
          "dosageAssessment": {
            "exerciseCount": 3,
            "workingSets": 7,
            "fourExercisesAndElevenSets": false,
            "outcome": "role_specific_allocation",
            "reason": "3 owned movement/muscle slots supply 7 exact working sets for this session role; appropriateness is certified from full-rotation direct stimulus, secondary stimulus, duration and fatigue rather than a universal exercise count."
          },
          "exercises": [
            {
              "exerciseId": "ex-deadlift",
              "exercise": "Deadlift",
              "movement": "hinge",
              "slotPurpose": "deadlift-specific anchor",
              "workingSets": 3,
              "exactReps": [
                5,
                5,
                5
              ],
              "loadState": "calibration_required",
              "restSeconds": 240,
              "progression": "load_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_strength",
                "mesocycle:strength_general",
                "slot:deadlift-specific anchor",
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
              "slotPurpose": "deadlift back support",
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
                "goal:build_strength",
                "mesocycle:strength_general",
                "slot:deadlift back support",
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
              "slotPurpose": "deadlift hamstring support",
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
                "goal:build_strength",
                "mesocycle:strength_general",
                "slot:deadlift hamstring support",
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
          "role": "Technical strength support",
          "purpose": "Build work capacity and movement tolerance",
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
                5,
                5,
                5
              ],
              "loadState": "calibration_required",
              "restSeconds": 240,
              "progression": "load_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_strength",
                "mesocycle:strength_general",
                "slot:full-body hinge anchor",
                "fatigue:high",
                "recovery:normal",
                "stability:moderate",
                "repeat:stable_primary_practice",
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
                "goal:build_strength",
                "mesocycle:strength_general",
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
                "goal:build_strength",
                "mesocycle:strength_general",
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
                "goal:build_strength",
                "mesocycle:strength_general",
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
                "goal:build_strength",
                "mesocycle:strength_general",
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
          "chest": 5,
          "upper_back": 2,
          "triceps": 2,
          "quadriceps": 5,
          "hip_extension": 8,
          "hamstrings_knee_flexion": 4,
          "calves": 2,
          "lats": 4,
          "core": 2
        },
        "meaningfulSecondarySets": {
          "triceps": 5,
          "anterior_delts": 3,
          "biceps": 6,
          "rear_delts": 2,
          "hip_extension": 5,
          "upper_back": 6,
          "quadriceps": 6
        },
        "muscleFrequency": {
          "calves": 1,
          "chest": 2,
          "core": 1,
          "hamstrings_knee_flexion": 2,
          "hip_extension": 3,
          "lats": 2,
          "quadriceps": 2,
          "triceps": 1,
          "upper_back": 1
        },
        "movementPatternExposures": {
          "horizontal_push": 2,
          "horizontal_pull": 1,
          "isolation": 4,
          "squat": 2,
          "lunge": 2,
          "hinge": 3,
          "hip_thrust": 1,
          "vertical_pull": 2,
          "core": 1,
          "carry": 1
        },
        "primaryLiftExposures": {
          "bench": {
            "primary": 1,
            "secondaryVariation": 0
          },
          "squat": {
            "primary": 1,
            "secondaryVariation": 0
          },
          "deadlift": {
            "primary": 2,
            "secondaryVariation": 0
          }
        },
        "totalWorkingSets": 34,
        "perSessionWorkingSets": [
          7,
          9,
          7,
          11
        ],
        "perSessionEstimatedMinutes": [
          29,
          35,
          29,
          41
        ],
        "fatigueUnits": {
          "perSession": [
            15,
            17,
            15,
            23
          ],
          "weeklyUnits": 70,
          "overlapFlags": [
            "more_than_three_primary_sessions"
          ]
        },
        "repeatedExercises": [
          {
            "exerciseId": "ex-deadlift",
            "count": 2,
            "reason": "stable_primary_practice"
          }
        ]
      },
      "progression": {
        "nextRotation": "same immutable prescriptions until canonical Progress evidence authorises regeneration",
        "mesocycleExitCriteria": [
          "Capacity established"
        ],
        "approvedNextMesocycles": [
          "strength_accumulation"
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
            "triceps_direct_coverage",
            "quadriceps_direct_coverage",
            "hip_extension_direct_coverage",
            "hamstrings_knee_flexion_direct_coverage",
            "calves_direct_coverage",
            "lats_direct_coverage",
            "core_direct_coverage",
            "secondary_stimulus_reported_separately",
            "no_unauthorised_specialist_selection",
            "repeat_authorised:ex-deadlift"
          ],
          "failures": []
        }
      }
    },
    {
      "id": "intermediate-powerbuilding-3",
      "label": "Intermediate Powerbuilding · 3 days",
      "status": "constructed",
      "input": {
        "goal": "build_muscle_and_strength",
        "experience": "intermediate",
        "frequency": 3,
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
        "macrocycle": "cert-intermediate-powerbuilding-3:macrocycle",
        "mesocycle": "powerbuilding_foundation",
        "microcycle": "cert-intermediate-powerbuilding-3:microcycle:1",
        "sessionConstruction": "canonical_plan_v3",
        "prescriptionPolicy": "mesocycle_prescription_policy_v1",
        "rationale": {
          "schemaVersion": "canonical_planning_rationale_v1",
          "goalStrategyId": "canonical_goal_powerbuilding_v1",
          "rotationReasons": [
            "framework:full_body",
            "framework_reason:explicit_supported_preference",
            "goal_strategy:build_muscle_and_strength",
            "experience:intermediate",
            "frequency:3",
            "mesocycle:powerbuilding_foundation",
            "schedule:calendar_week"
          ],
          "sessionReasons": [
            {
              "planSessionIndex": 0,
              "role": "Full body powerbuilding A",
              "reasons": [
                "microcycle_role:Full body powerbuilding A",
                "mesocycle_purpose:Establish repeatable squat, bench and deadlift",
                "slot:0:full-body knee-dominant anchor",
                "slot:1:full-body press",
                "slot:2:full-body pull",
                "slot:3:complementary lower pattern",
                "slot:4:trunk support"
              ]
            },
            {
              "planSessionIndex": 1,
              "role": "Full body powerbuilding B",
              "reasons": [
                "microcycle_role:Full body powerbuilding B",
                "mesocycle_purpose:Establish repeatable squat, bench and deadlift",
                "slot:0:full-body hinge anchor",
                "slot:1:full-body press",
                "slot:2:full-body pull",
                "slot:3:complementary lower pattern",
                "slot:4:trunk support"
              ]
            },
            {
              "planSessionIndex": 2,
              "role": "Full body powerbuilding C",
              "reasons": [
                "microcycle_role:Full body powerbuilding C",
                "mesocycle_purpose:Establish repeatable squat, bench and deadlift",
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
          2,
          4
        ],
        "recoveryDays": 4
      },
      "sessions": [
        {
          "order": 1,
          "dayOffset": 0,
          "role": "Full body powerbuilding A",
          "purpose": "Establish repeatable squat, bench and deadlift",
          "workingSets": 15,
          "estimatedMinutes": 53,
          "dosageAssessment": {
            "exerciseCount": 5,
            "workingSets": 15,
            "fourExercisesAndElevenSets": false,
            "outcome": "role_specific_allocation",
            "reason": "5 owned movement/muscle slots supply 15 exact working sets for this session role; appropriateness is certified from full-rotation direct stimulus, secondary stimulus, duration and fatigue rather than a universal exercise count."
          },
          "exercises": [
            {
              "exerciseId": "ex-barbell-back-squat",
              "exercise": "Barbell Back Squat",
              "movement": "squat",
              "slotPurpose": "full-body knee-dominant anchor",
              "workingSets": 4,
              "exactReps": [
                6,
                6,
                6,
                6
              ],
              "loadState": "calibration_required",
              "restSeconds": 210,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle_and_strength",
                "mesocycle:powerbuilding_foundation",
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
              "workingSets": 3,
              "exactReps": [
                10,
                10,
                10
              ],
              "loadState": "calibration_required",
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle_and_strength",
                "mesocycle:powerbuilding_foundation",
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
              "workingSets": 3,
              "exactReps": [
                10,
                10,
                10
              ],
              "loadState": "calibration_required",
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle_and_strength",
                "mesocycle:powerbuilding_foundation",
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
              "workingSets": 3,
              "exactReps": [
                10,
                10,
                10
              ],
              "loadState": "calibration_required",
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle_and_strength",
                "mesocycle:powerbuilding_foundation",
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
                "goal:build_muscle_and_strength",
                "mesocycle:powerbuilding_foundation",
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
          "dayOffset": 2,
          "role": "Full body powerbuilding B",
          "purpose": "Establish repeatable squat, bench and deadlift",
          "workingSets": 15,
          "estimatedMinutes": 53,
          "dosageAssessment": {
            "exerciseCount": 5,
            "workingSets": 15,
            "fourExercisesAndElevenSets": false,
            "outcome": "role_specific_allocation",
            "reason": "5 owned movement/muscle slots supply 15 exact working sets for this session role; appropriateness is certified from full-rotation direct stimulus, secondary stimulus, duration and fatigue rather than a universal exercise count."
          },
          "exercises": [
            {
              "exerciseId": "ex-deadlift",
              "exercise": "Deadlift",
              "movement": "hinge",
              "slotPurpose": "full-body hinge anchor",
              "workingSets": 4,
              "exactReps": [
                5,
                5,
                5,
                5
              ],
              "loadState": "calibration_required",
              "restSeconds": 240,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle_and_strength",
                "mesocycle:powerbuilding_foundation",
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
              "workingSets": 3,
              "exactReps": [
                10,
                10,
                10
              ],
              "loadState": "calibration_required",
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle_and_strength",
                "mesocycle:powerbuilding_foundation",
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
              "workingSets": 3,
              "exactReps": [
                10,
                10,
                10
              ],
              "loadState": "calibration_required",
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle_and_strength",
                "mesocycle:powerbuilding_foundation",
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
              "workingSets": 3,
              "exactReps": [
                10,
                10,
                10
              ],
              "loadState": "calibration_required",
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle_and_strength",
                "mesocycle:powerbuilding_foundation",
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
                "goal:build_muscle_and_strength",
                "mesocycle:powerbuilding_foundation",
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
          "dayOffset": 4,
          "role": "Full body powerbuilding C",
          "purpose": "Establish repeatable squat, bench and deadlift",
          "workingSets": 15,
          "estimatedMinutes": 53,
          "dosageAssessment": {
            "exerciseCount": 5,
            "workingSets": 15,
            "fourExercisesAndElevenSets": false,
            "outcome": "role_specific_allocation",
            "reason": "5 owned movement/muscle slots supply 15 exact working sets for this session role; appropriateness is certified from full-rotation direct stimulus, secondary stimulus, duration and fatigue rather than a universal exercise count."
          },
          "exercises": [
            {
              "exerciseId": "ex-barbell-back-squat",
              "exercise": "Barbell Back Squat",
              "movement": "squat",
              "slotPurpose": "full-body knee-dominant anchor",
              "workingSets": 4,
              "exactReps": [
                6,
                6,
                6,
                6
              ],
              "loadState": "calibration_required",
              "restSeconds": 210,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle_and_strength",
                "mesocycle:powerbuilding_foundation",
                "slot:full-body knee-dominant anchor",
                "fatigue:high",
                "recovery:normal",
                "stability:moderate",
                "repeat:stable_primary_practice",
                "preference_score:0"
              ]
            },
            {
              "exerciseId": "ex-machine-chest-press",
              "exercise": "Machine Chest Press",
              "movement": "horizontal_push",
              "slotPurpose": "full-body press",
              "workingSets": 3,
              "exactReps": [
                10,
                10,
                10
              ],
              "loadState": "calibration_required",
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle_and_strength",
                "mesocycle:powerbuilding_foundation",
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
              "workingSets": 3,
              "exactReps": [
                10,
                10,
                10
              ],
              "loadState": "calibration_required",
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle_and_strength",
                "mesocycle:powerbuilding_foundation",
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
              "workingSets": 3,
              "exactReps": [
                10,
                10,
                10
              ],
              "loadState": "calibration_required",
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle_and_strength",
                "mesocycle:powerbuilding_foundation",
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
                "goal:build_muscle_and_strength",
                "mesocycle:powerbuilding_foundation",
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
          "quadriceps": 11,
          "chest": 9,
          "upper_back": 6,
          "hip_extension": 10,
          "core": 6,
          "lats": 3
        },
        "meaningfulSecondarySets": {
          "hip_extension": 14,
          "triceps": 9,
          "biceps": 9,
          "rear_delts": 6,
          "upper_back": 4,
          "quadriceps": 4,
          "anterior_delts": 6
        },
        "muscleFrequency": {
          "chest": 3,
          "core": 3,
          "hip_extension": 3,
          "lats": 1,
          "quadriceps": 3,
          "upper_back": 2
        },
        "movementPatternExposures": {
          "squat": 3,
          "lunge": 3,
          "horizontal_push": 3,
          "horizontal_pull": 2,
          "hinge": 3,
          "hip_thrust": 2,
          "core": 3,
          "carry": 3,
          "vertical_pull": 1
        },
        "primaryLiftExposures": {
          "bench": {
            "primary": 0,
            "secondaryVariation": 0
          },
          "squat": {
            "primary": 2,
            "secondaryVariation": 0
          },
          "deadlift": {
            "primary": 1,
            "secondaryVariation": 0
          }
        },
        "totalWorkingSets": 45,
        "perSessionWorkingSets": [
          15,
          15,
          15
        ],
        "perSessionEstimatedMinutes": [
          53,
          53,
          53
        ],
        "fatigueUnits": {
          "perSession": [
            32,
            32,
            32
          ],
          "weeklyUnits": 96,
          "overlapFlags": []
        },
        "repeatedExercises": [
          {
            "exerciseId": "ex-barbell-back-squat",
            "count": 2,
            "reason": "stable_primary_practice"
          },
          {
            "exerciseId": "ex-cable-crunch",
            "count": 3,
            "reason": "only_equivalent_available"
          }
        ]
      },
      "progression": {
        "nextRotation": "same immutable prescriptions until canonical Progress evidence authorises regeneration",
        "mesocycleExitCriteria": [
          "Progressive loading is stable"
        ],
        "approvedNextMesocycles": [
          "powerbuilding_hypertrophy"
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
            "repeat_authorised:ex-barbell-back-squat",
            "repeat_authorised:ex-cable-crunch"
          ],
          "failures": []
        }
      }
    },
    {
      "id": "intermediate-powerbuilding-5",
      "label": "Intermediate Powerbuilding · 5 days",
      "status": "constructed",
      "input": {
        "goal": "build_muscle_and_strength",
        "experience": "intermediate",
        "frequency": 5,
        "requestedFramework": "bench_squat_deadlift",
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
        "macrocycle": "cert-intermediate-powerbuilding-5:macrocycle",
        "mesocycle": "powerbuilding_foundation",
        "microcycle": "cert-intermediate-powerbuilding-5:microcycle:1",
        "sessionConstruction": "canonical_plan_v3",
        "prescriptionPolicy": "mesocycle_prescription_policy_v1",
        "rationale": {
          "schemaVersion": "canonical_planning_rationale_v1",
          "goalStrategyId": "canonical_goal_powerbuilding_v1",
          "rotationReasons": [
            "framework:bench_squat_deadlift",
            "framework_reason:explicit_supported_preference",
            "goal_strategy:build_muscle_and_strength",
            "experience:intermediate",
            "frequency:5",
            "mesocycle:powerbuilding_foundation",
            "schedule:calendar_week"
          ],
          "sessionReasons": [
            {
              "planSessionIndex": 0,
              "role": "Bench and hypertrophy",
              "reasons": [
                "microcycle_role:Bench and hypertrophy",
                "mesocycle_purpose:Establish repeatable squat, bench and deadlift",
                "slot:0:bench competition-pattern practice",
                "slot:1:complementary chest hypertrophy",
                "slot:2:lateral-delt work not supplied by pressing",
                "slot:3:triceps support"
              ]
            },
            {
              "planSessionIndex": 1,
              "role": "Squat and hypertrophy",
              "reasons": [
                "microcycle_role:Squat and hypertrophy",
                "mesocycle_purpose:Establish repeatable squat, bench and deadlift",
                "slot:0:squat competition-pattern practice",
                "slot:1:stable low-complexity quadriceps hypertrophy",
                "slot:2:knee-flexion hamstring work",
                "slot:3:calf work"
              ]
            },
            {
              "planSessionIndex": 2,
              "role": "Deadlift and back",
              "reasons": [
                "microcycle_role:Deadlift and back",
                "mesocycle_purpose:Establish repeatable squat, bench and deadlift",
                "slot:0:deadlift competition-pattern practice",
                "slot:1:horizontal-pull upper-back work",
                "slot:2:true vertical-pull lat work",
                "slot:3:elbow-flexor support"
              ]
            },
            {
              "planSessionIndex": 3,
              "role": "Upper support",
              "reasons": [
                "microcycle_role:Upper support",
                "mesocycle_purpose:Establish repeatable squat, bench and deadlift",
                "slot:0:bench-family secondary variation exposure",
                "slot:1:complementary horizontal-pull exposure",
                "slot:2:rear-delt/scapular work",
                "slot:3:second lateral-delt exposure",
                "slot:4:triceps volume",
                "slot:5:biceps volume"
              ]
            },
            {
              "planSessionIndex": 4,
              "role": "Lower support",
              "reasons": [
                "microcycle_role:Lower support",
                "mesocycle_purpose:Establish repeatable squat, bench and deadlift",
                "slot:0:second knee-dominant hypertrophy exposure",
                "slot:1:second knee-flexion hamstring exposure",
                "slot:2:hip-thrust hip-extension work distinct from a hinge",
                "slot:3:second calf exposure",
                "slot:4:trunk work"
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
        "resolvedFramework": "bench_squat_deadlift",
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
          "role": "Bench and hypertrophy",
          "purpose": "Establish repeatable squat, bench and deadlift",
          "workingSets": 11,
          "estimatedMinutes": 41,
          "dosageAssessment": {
            "exerciseCount": 4,
            "workingSets": 11,
            "fourExercisesAndElevenSets": true,
            "outcome": "role_specific_allocation",
            "reason": "4 owned movement/muscle slots supply 11 exact working sets for this session role; appropriateness is certified from full-rotation direct stimulus, secondary stimulus, duration and fatigue rather than a universal exercise count."
          },
          "exercises": [
            {
              "exerciseId": "ex-bench-press",
              "exercise": "Bench Press",
              "movement": "horizontal_push",
              "slotPurpose": "bench competition-pattern practice",
              "workingSets": 4,
              "exactReps": [
                6,
                6,
                6,
                6
              ],
              "loadState": "calibration_required",
              "restSeconds": 180,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle_and_strength",
                "mesocycle:powerbuilding_foundation",
                "slot:bench competition-pattern practice",
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
              "slotPurpose": "complementary chest hypertrophy",
              "workingSets": 3,
              "exactReps": [
                10,
                10,
                10
              ],
              "loadState": "calibration_required",
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle_and_strength",
                "mesocycle:powerbuilding_foundation",
                "slot:complementary chest hypertrophy",
                "fatigue:moderate",
                "recovery:normal",
                "stability:moderate",
                "repeat:not_repeated",
                "preference_score:0"
              ]
            },
            {
              "exerciseId": "ex-cable-lateral-raise",
              "exercise": "Cable Lateral Raise",
              "movement": "isolation",
              "slotPurpose": "lateral-delt work not supplied by pressing",
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
                "goal:build_muscle_and_strength",
                "mesocycle:powerbuilding_foundation",
                "slot:lateral-delt work not supplied by pressing",
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
                "goal:build_muscle_and_strength",
                "mesocycle:powerbuilding_foundation",
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
          "order": 2,
          "dayOffset": 1,
          "role": "Squat and hypertrophy",
          "purpose": "Establish repeatable squat, bench and deadlift",
          "workingSets": 11,
          "estimatedMinutes": 41,
          "dosageAssessment": {
            "exerciseCount": 4,
            "workingSets": 11,
            "fourExercisesAndElevenSets": true,
            "outcome": "role_specific_allocation",
            "reason": "4 owned movement/muscle slots supply 11 exact working sets for this session role; appropriateness is certified from full-rotation direct stimulus, secondary stimulus, duration and fatigue rather than a universal exercise count."
          },
          "exercises": [
            {
              "exerciseId": "ex-barbell-back-squat",
              "exercise": "Barbell Back Squat",
              "movement": "squat",
              "slotPurpose": "squat competition-pattern practice",
              "workingSets": 4,
              "exactReps": [
                6,
                6,
                6,
                6
              ],
              "loadState": "calibration_required",
              "restSeconds": 210,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle_and_strength",
                "mesocycle:powerbuilding_foundation",
                "slot:squat competition-pattern practice",
                "fatigue:high",
                "recovery:normal",
                "stability:moderate",
                "repeat:not_repeated",
                "preference_score:0"
              ]
            },
            {
              "exerciseId": "ex-hack-squat-machine",
              "exercise": "Hack Squat Machine",
              "movement": "squat",
              "slotPurpose": "stable low-complexity quadriceps hypertrophy",
              "workingSets": 3,
              "exactReps": [
                10,
                10,
                10
              ],
              "loadState": "calibration_required",
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle_and_strength",
                "mesocycle:powerbuilding_foundation",
                "slot:stable low-complexity quadriceps hypertrophy",
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
                "goal:build_muscle_and_strength",
                "mesocycle:powerbuilding_foundation",
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
                "goal:build_muscle_and_strength",
                "mesocycle:powerbuilding_foundation",
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
          "role": "Deadlift and back",
          "purpose": "Establish repeatable squat, bench and deadlift",
          "workingSets": 11,
          "estimatedMinutes": 41,
          "dosageAssessment": {
            "exerciseCount": 4,
            "workingSets": 11,
            "fourExercisesAndElevenSets": true,
            "outcome": "role_specific_allocation",
            "reason": "4 owned movement/muscle slots supply 11 exact working sets for this session role; appropriateness is certified from full-rotation direct stimulus, secondary stimulus, duration and fatigue rather than a universal exercise count."
          },
          "exercises": [
            {
              "exerciseId": "ex-deadlift",
              "exercise": "Deadlift",
              "movement": "hinge",
              "slotPurpose": "deadlift competition-pattern practice",
              "workingSets": 3,
              "exactReps": [
                5,
                5,
                5
              ],
              "loadState": "calibration_required",
              "restSeconds": 240,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle_and_strength",
                "mesocycle:powerbuilding_foundation",
                "slot:deadlift competition-pattern practice",
                "fatigue:high",
                "recovery:normal",
                "stability:moderate",
                "repeat:not_repeated",
                "preference_score:0"
              ]
            },
            {
              "exerciseId": "ex-chest-supported-row",
              "exercise": "Chest Supported Row",
              "movement": "horizontal_pull",
              "slotPurpose": "horizontal-pull upper-back work",
              "workingSets": 3,
              "exactReps": [
                10,
                10,
                10
              ],
              "loadState": "calibration_required",
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle_and_strength",
                "mesocycle:powerbuilding_foundation",
                "slot:horizontal-pull upper-back work",
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
              "slotPurpose": "true vertical-pull lat work",
              "workingSets": 3,
              "exactReps": [
                10,
                10,
                10
              ],
              "loadState": "calibration_required",
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle_and_strength",
                "mesocycle:powerbuilding_foundation",
                "slot:true vertical-pull lat work",
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
                "goal:build_muscle_and_strength",
                "mesocycle:powerbuilding_foundation",
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
          "order": 4,
          "dayOffset": 4,
          "role": "Upper support",
          "purpose": "Establish repeatable squat, bench and deadlift",
          "workingSets": 14,
          "estimatedMinutes": 50,
          "dosageAssessment": {
            "exerciseCount": 6,
            "workingSets": 14,
            "fourExercisesAndElevenSets": false,
            "outcome": "role_specific_allocation",
            "reason": "6 owned movement/muscle slots supply 14 exact working sets for this session role; appropriateness is certified from full-rotation direct stimulus, secondary stimulus, duration and fatigue rather than a universal exercise count."
          },
          "exercises": [
            {
              "exerciseId": "ex-decline-barbell-bench",
              "exercise": "Decline Barbell Bench",
              "movement": "horizontal_push",
              "slotPurpose": "bench-family secondary variation exposure",
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
                "goal:build_muscle_and_strength",
                "mesocycle:powerbuilding_foundation",
                "slot:bench-family secondary variation exposure",
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
              "slotPurpose": "complementary horizontal-pull exposure",
              "workingSets": 3,
              "exactReps": [
                10,
                10,
                10
              ],
              "loadState": "calibration_required",
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle_and_strength",
                "mesocycle:powerbuilding_foundation",
                "slot:complementary horizontal-pull exposure",
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
              "slotPurpose": "rear-delt/scapular work",
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
                "goal:build_muscle_and_strength",
                "mesocycle:powerbuilding_foundation",
                "slot:rear-delt/scapular work",
                "fatigue:low",
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
              "slotPurpose": "second lateral-delt exposure",
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
                "goal:build_muscle_and_strength",
                "mesocycle:powerbuilding_foundation",
                "slot:second lateral-delt exposure",
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
              "slotPurpose": "triceps volume",
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
                "goal:build_muscle_and_strength",
                "mesocycle:powerbuilding_foundation",
                "slot:triceps volume",
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
              "slotPurpose": "biceps volume",
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
                "goal:build_muscle_and_strength",
                "mesocycle:powerbuilding_foundation",
                "slot:biceps volume",
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
          "role": "Lower support",
          "purpose": "Establish repeatable squat, bench and deadlift",
          "workingSets": 12,
          "estimatedMinutes": 44,
          "dosageAssessment": {
            "exerciseCount": 5,
            "workingSets": 12,
            "fourExercisesAndElevenSets": false,
            "outcome": "role_specific_allocation",
            "reason": "5 owned movement/muscle slots supply 12 exact working sets for this session role; appropriateness is certified from full-rotation direct stimulus, secondary stimulus, duration and fatigue rather than a universal exercise count."
          },
          "exercises": [
            {
              "exerciseId": "ex-hack-squat-plate-loaded",
              "exercise": "Hack Squat Plate Loaded",
              "movement": "squat",
              "slotPurpose": "second knee-dominant hypertrophy exposure",
              "workingSets": 3,
              "exactReps": [
                10,
                10,
                10
              ],
              "loadState": "calibration_required",
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle_and_strength",
                "mesocycle:powerbuilding_foundation",
                "slot:second knee-dominant hypertrophy exposure",
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
              "slotPurpose": "second knee-flexion hamstring exposure",
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
                "goal:build_muscle_and_strength",
                "mesocycle:powerbuilding_foundation",
                "slot:second knee-flexion hamstring exposure",
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
              "slotPurpose": "hip-thrust hip-extension work distinct from a hinge",
              "workingSets": 3,
              "exactReps": [
                10,
                10,
                10
              ],
              "loadState": "calibration_required",
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle_and_strength",
                "mesocycle:powerbuilding_foundation",
                "slot:hip-thrust hip-extension work distinct from a hinge",
                "fatigue:moderate",
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
              "slotPurpose": "second calf exposure",
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
                "goal:build_muscle_and_strength",
                "mesocycle:powerbuilding_foundation",
                "slot:second calf exposure",
                "fatigue:low",
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
              "slotPurpose": "trunk work",
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
                "goal:build_muscle_and_strength",
                "mesocycle:powerbuilding_foundation",
                "slot:trunk work",
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
          "lateral_delts": 4,
          "triceps": 4,
          "quadriceps": 10,
          "hamstrings_knee_flexion": 4,
          "calves": 4,
          "hip_extension": 6,
          "upper_back": 6,
          "lats": 3,
          "biceps": 4,
          "rear_delts": 2,
          "core": 2
        },
        "meaningfulSecondarySets": {
          "triceps": 10,
          "anterior_delts": 10,
          "hip_extension": 10,
          "upper_back": 5,
          "quadriceps": 3,
          "biceps": 9,
          "rear_delts": 6
        },
        "muscleFrequency": {
          "biceps": 2,
          "calves": 2,
          "chest": 2,
          "core": 1,
          "hamstrings_knee_flexion": 2,
          "hip_extension": 2,
          "lateral_delts": 2,
          "lats": 1,
          "quadriceps": 2,
          "rear_delts": 1,
          "triceps": 2,
          "upper_back": 2
        },
        "movementPatternExposures": {
          "horizontal_push": 3,
          "isolation": 11,
          "squat": 3,
          "lunge": 2,
          "hinge": 1,
          "horizontal_pull": 2,
          "vertical_pull": 1,
          "hip_thrust": 1,
          "core": 1
        },
        "primaryLiftExposures": {
          "bench": {
            "primary": 1,
            "secondaryVariation": 1
          },
          "squat": {
            "primary": 1,
            "secondaryVariation": 0
          },
          "deadlift": {
            "primary": 1,
            "secondaryVariation": 0
          }
        },
        "totalWorkingSets": 59,
        "perSessionWorkingSets": [
          11,
          11,
          11,
          14,
          12
        ],
        "perSessionEstimatedMinutes": [
          41,
          41,
          41,
          50,
          44
        ],
        "fatigueUnits": {
          "perSession": [
            22,
            22,
            23,
            20,
            18
          ],
          "weeklyUnits": 105,
          "overlapFlags": []
        },
        "repeatedExercises": []
      },
      "progression": {
        "nextRotation": "same immutable prescriptions until canonical Progress evidence authorises regeneration",
        "mesocycleExitCriteria": [
          "Progressive loading is stable"
        ],
        "approvedNextMesocycles": [
          "powerbuilding_hypertrophy"
        ]
      },
      "certification": {
        "allocation": {
          "status": "passed",
          "checks": [
            "exact_working_sets_resolved",
            "session_volume_bounded",
            "session_duration_bounded",
            "slot_targets_resolved",
            "bench_primary_and_secondary_exposures_present",
            "squat_primary_exposure_present",
            "deadlift_fatigue_bounded_to_primary_exposure",
            "weekly_overlap_bounded",
            "chest_volume_authorised",
            "lats_volume_authorised",
            "upper_back_volume_authorised",
            "lateral_delts_volume_authorised",
            "rear_delts_volume_authorised",
            "triceps_volume_authorised",
            "biceps_volume_authorised",
            "quadriceps_volume_authorised",
            "hamstrings_knee_flexion_volume_authorised",
            "hip_extension_volume_authorised",
            "calves_volume_authorised",
            "core_volume_authorised",
            "frequency_matches_profile"
          ],
          "failures": []
        },
        "constructed": {
          "status": "passed",
          "checks": [
            "chest_direct_coverage",
            "lats_direct_coverage",
            "upper_back_direct_coverage",
            "lateral_delts_direct_coverage",
            "rear_delts_direct_coverage",
            "triceps_direct_coverage",
            "biceps_direct_coverage",
            "quadriceps_direct_coverage",
            "hamstrings_knee_flexion_direct_coverage",
            "hip_extension_direct_coverage",
            "calves_direct_coverage",
            "core_direct_coverage",
            "anterior_delts_meaningful_secondary_coverage",
            "no_unauthorised_specialist_selection"
          ],
          "failures": []
        }
      }
    },
    {
      "id": "athletic-concurrent-workload",
      "label": "Athletic Performance · concurrent workload evidence boundary",
      "status": "constructed",
      "input": {
        "goal": "athletic_performance",
        "experience": "intermediate",
        "frequency": 3,
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
        "macrocycle": "cert-athletic-concurrent-workload:macrocycle",
        "mesocycle": "athletic_general",
        "microcycle": "cert-athletic-concurrent-workload:microcycle:1",
        "sessionConstruction": "canonical_plan_v3",
        "prescriptionPolicy": "mesocycle_prescription_policy_v1",
        "rationale": {
          "schemaVersion": "canonical_planning_rationale_v1",
          "goalStrategyId": "canonical_goal_athletic_v1",
          "rotationReasons": [
            "framework:full_body",
            "framework_reason:explicit_supported_preference",
            "goal_strategy:athletic_performance",
            "experience:intermediate",
            "frequency:3",
            "mesocycle:athletic_general",
            "schedule:calendar_week"
          ],
          "sessionReasons": [
            {
              "planSessionIndex": 0,
              "role": "Full body strength and power A",
              "reasons": [
                "microcycle_role:Full body strength and power A",
                "mesocycle_purpose:General athletic preparation",
                "slot:0:full-body knee-dominant anchor",
                "slot:1:full-body press",
                "slot:2:full-body pull",
                "slot:3:complementary lower pattern",
                "slot:4:trunk support"
              ]
            },
            {
              "planSessionIndex": 1,
              "role": "Full body strength and power B",
              "reasons": [
                "microcycle_role:Full body strength and power B",
                "mesocycle_purpose:General athletic preparation",
                "slot:0:full-body hinge anchor",
                "slot:1:full-body press",
                "slot:2:full-body pull",
                "slot:3:complementary lower pattern",
                "slot:4:trunk support"
              ]
            },
            {
              "planSessionIndex": 2,
              "role": "Full body strength and power C",
              "reasons": [
                "microcycle_role:Full body strength and power C",
                "mesocycle_purpose:General athletic preparation",
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
          2,
          4
        ],
        "recoveryDays": 4
      },
      "sessions": [
        {
          "order": 1,
          "dayOffset": 0,
          "role": "Full body strength and power A",
          "purpose": "General athletic preparation",
          "workingSets": 10,
          "estimatedMinutes": 38,
          "dosageAssessment": {
            "exerciseCount": 5,
            "workingSets": 10,
            "fourExercisesAndElevenSets": false,
            "outcome": "role_specific_allocation",
            "reason": "5 owned movement/muscle slots supply 10 exact working sets for this session role; appropriateness is certified from full-rotation direct stimulus, secondary stimulus, duration and fatigue rather than a universal exercise count."
          },
          "exercises": [
            {
              "exerciseId": "ex-barbell-back-squat",
              "exercise": "Barbell Back Squat",
              "movement": "squat",
              "slotPurpose": "full-body knee-dominant anchor",
              "workingSets": 3,
              "exactReps": [
                6,
                6,
                6
              ],
              "loadState": "calibration_required",
              "restSeconds": 210,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:athletic_performance",
                "mesocycle:athletic_general",
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
                "goal:athletic_performance",
                "mesocycle:athletic_general",
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
                "goal:athletic_performance",
                "mesocycle:athletic_general",
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
                "goal:athletic_performance",
                "mesocycle:athletic_general",
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
              "workingSets": 1,
              "exactReps": [
                12
              ],
              "loadState": "calibration_required",
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:athletic_performance",
                "mesocycle:athletic_general",
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
          "dayOffset": 2,
          "role": "Full body strength and power B",
          "purpose": "General athletic preparation",
          "workingSets": 10,
          "estimatedMinutes": 38,
          "dosageAssessment": {
            "exerciseCount": 5,
            "workingSets": 10,
            "fourExercisesAndElevenSets": false,
            "outcome": "role_specific_allocation",
            "reason": "5 owned movement/muscle slots supply 10 exact working sets for this session role; appropriateness is certified from full-rotation direct stimulus, secondary stimulus, duration and fatigue rather than a universal exercise count."
          },
          "exercises": [
            {
              "exerciseId": "ex-deadlift",
              "exercise": "Deadlift",
              "movement": "hinge",
              "slotPurpose": "full-body hinge anchor",
              "workingSets": 3,
              "exactReps": [
                5,
                5,
                5
              ],
              "loadState": "calibration_required",
              "restSeconds": 240,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:athletic_performance",
                "mesocycle:athletic_general",
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
                "goal:athletic_performance",
                "mesocycle:athletic_general",
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
                "goal:athletic_performance",
                "mesocycle:athletic_general",
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
                "goal:athletic_performance",
                "mesocycle:athletic_general",
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
              "workingSets": 1,
              "exactReps": [
                12
              ],
              "loadState": "calibration_required",
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:athletic_performance",
                "mesocycle:athletic_general",
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
          "dayOffset": 4,
          "role": "Full body strength and power C",
          "purpose": "General athletic preparation",
          "workingSets": 10,
          "estimatedMinutes": 38,
          "dosageAssessment": {
            "exerciseCount": 5,
            "workingSets": 10,
            "fourExercisesAndElevenSets": false,
            "outcome": "role_specific_allocation",
            "reason": "5 owned movement/muscle slots supply 10 exact working sets for this session role; appropriateness is certified from full-rotation direct stimulus, secondary stimulus, duration and fatigue rather than a universal exercise count."
          },
          "exercises": [
            {
              "exerciseId": "ex-barbell-back-squat",
              "exercise": "Barbell Back Squat",
              "movement": "squat",
              "slotPurpose": "full-body knee-dominant anchor",
              "workingSets": 3,
              "exactReps": [
                6,
                6,
                6
              ],
              "loadState": "calibration_required",
              "restSeconds": 210,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:athletic_performance",
                "mesocycle:athletic_general",
                "slot:full-body knee-dominant anchor",
                "fatigue:high",
                "recovery:normal",
                "stability:moderate",
                "repeat:stable_primary_practice",
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
                "goal:athletic_performance",
                "mesocycle:athletic_general",
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
                "goal:athletic_performance",
                "mesocycle:athletic_general",
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
                "goal:athletic_performance",
                "mesocycle:athletic_general",
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
              "workingSets": 1,
              "exactReps": [
                12
              ],
              "loadState": "calibration_required",
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:athletic_performance",
                "mesocycle:athletic_general",
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
          "quadriceps": 8,
          "chest": 6,
          "upper_back": 4,
          "hip_extension": 7,
          "core": 3,
          "lats": 2
        },
        "meaningfulSecondarySets": {
          "hip_extension": 10,
          "triceps": 6,
          "biceps": 6,
          "rear_delts": 4,
          "upper_back": 3,
          "quadriceps": 3,
          "anterior_delts": 4
        },
        "muscleFrequency": {
          "chest": 3,
          "core": 3,
          "hip_extension": 3,
          "lats": 1,
          "quadriceps": 3,
          "upper_back": 2
        },
        "movementPatternExposures": {
          "squat": 3,
          "lunge": 3,
          "horizontal_push": 3,
          "horizontal_pull": 2,
          "hinge": 3,
          "hip_thrust": 2,
          "core": 3,
          "carry": 3,
          "vertical_pull": 1
        },
        "primaryLiftExposures": {
          "bench": {
            "primary": 0,
            "secondaryVariation": 0
          },
          "squat": {
            "primary": 2,
            "secondaryVariation": 0
          },
          "deadlift": {
            "primary": 1,
            "secondaryVariation": 0
          }
        },
        "totalWorkingSets": 30,
        "perSessionWorkingSets": [
          10,
          10,
          10
        ],
        "perSessionEstimatedMinutes": [
          38,
          38,
          38
        ],
        "fatigueUnits": {
          "perSession": [
            22,
            22,
            22
          ],
          "weeklyUnits": 66,
          "overlapFlags": []
        },
        "repeatedExercises": [
          {
            "exerciseId": "ex-barbell-back-squat",
            "count": 2,
            "reason": "stable_primary_practice"
          },
          {
            "exerciseId": "ex-cable-crunch",
            "count": 3,
            "reason": "only_equivalent_available"
          }
        ]
      },
      "progression": {
        "nextRotation": "same immutable prescriptions until canonical Progress evidence authorises regeneration",
        "mesocycleExitCriteria": [
          "Ready for force or power work"
        ],
        "approvedNextMesocycles": [
          "athletic_force",
          "athletic_power"
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
            "repeat_authorised:ex-barbell-back-squat",
            "repeat_authorised:ex-cable-crunch"
          ],
          "failures": []
        }
      },
      "note": "Sport workload is Progress evidence; absent fresh evidence does not invent a reduction."
    },
    {
      "id": "getting-lean-recovery-boundary",
      "label": "Getting Lean · constrained recovery boundary",
      "status": "constructed",
      "input": {
        "goal": "get_leaner",
        "experience": "intermediate",
        "frequency": 4,
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
        "macrocycle": "cert-getting-lean-recovery-boundary:macrocycle",
        "mesocycle": "hypertrophy_calibration",
        "microcycle": "cert-getting-lean-recovery-boundary:microcycle:1",
        "sessionConstruction": "canonical_plan_v3",
        "prescriptionPolicy": "mesocycle_prescription_policy_v1",
        "rationale": {
          "schemaVersion": "canonical_planning_rationale_v1",
          "goalStrategyId": "canonical_goal_getting_lean_v1",
          "rotationReasons": [
            "framework:upper_lower",
            "framework_reason:explicit_supported_preference",
            "goal_strategy:get_leaner",
            "experience:intermediate",
            "frequency:4",
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
          3,
          4
        ],
        "recoveryDays": 3
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
                "goal:get_leaner",
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
                "goal:get_leaner",
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
                "goal:get_leaner",
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
                "goal:get_leaner",
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
                "goal:get_leaner",
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
                "goal:get_leaner",
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
                "goal:get_leaner",
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
                "goal:get_leaner",
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
                "goal:get_leaner",
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
                "goal:get_leaner",
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
          "dayOffset": 3,
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
                "goal:get_leaner",
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
                "goal:get_leaner",
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
                "goal:get_leaner",
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
                "goal:get_leaner",
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
                "goal:get_leaner",
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
                "goal:get_leaner",
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
                "goal:get_leaner",
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
                "goal:get_leaner",
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
                "goal:get_leaner",
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
                "goal:get_leaner",
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
          "chest": 6,
          "upper_back": 4,
          "lats": 4,
          "lateral_delts": 4,
          "triceps": 4,
          "biceps": 4,
          "quadriceps": 6,
          "hip_extension": 4,
          "hamstrings_knee_flexion": 4,
          "calves": 4
        },
        "meaningfulSecondarySets": {
          "triceps": 6,
          "anterior_delts": 6,
          "biceps": 8,
          "rear_delts": 4,
          "hip_extension": 8
        },
        "muscleFrequency": {
          "biceps": 2,
          "calves": 2,
          "chest": 2,
          "hamstrings_knee_flexion": 2,
          "hip_extension": 2,
          "lateral_delts": 2,
          "lats": 2,
          "quadriceps": 2,
          "triceps": 2,
          "upper_back": 2
        },
        "movementPatternExposures": {
          "horizontal_push": 2,
          "horizontal_pull": 2,
          "vertical_pull": 2,
          "isolation": 10,
          "squat": 2,
          "lunge": 2,
          "hinge": 2,
          "hip_thrust": 2
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
          13,
          9,
          13,
          9
        ],
        "perSessionEstimatedMinutes": [
          47,
          35,
          47,
          35
        ],
        "fatigueUnits": {
          "perSession": [
            23,
            17,
            23,
            17
          ],
          "weeklyUnits": 80,
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
            "secondary_stimulus_reported_separately",
            "no_unauthorised_specialist_selection",
            "repeat_authorised:ex-decline-barbell-bench",
            "repeat_authorised:ex-hack-squat-machine"
          ],
          "failures": []
        }
      },
      "note": "Recovery change requires canonical evidence/intervention; construction preserves resistance stimulus."
    },
    {
      "id": "limited-dumbbells",
      "label": "Limited equipment · dumbbells and bodyweight",
      "status": "constructed",
      "input": {
        "goal": "build_muscle",
        "experience": "intermediate",
        "frequency": 4,
        "requestedFramework": "upper_lower",
        "equipment": [
          "dumbbell",
          "bodyweight"
        ],
        "establishedHistory": false
      },
      "authority": {
        "macrocycle": "cert-limited-dumbbells:macrocycle",
        "mesocycle": "hypertrophy_calibration",
        "microcycle": "cert-limited-dumbbells:microcycle:1",
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
            "frequency:4",
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
          3,
          4
        ],
        "recoveryDays": 3
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
              "exerciseId": "ex-dumbbell-bench-press",
              "exercise": "Dumbbell Bench Press",
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
                "stability:moderate",
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
              "exerciseId": "ex-pull-up",
              "exercise": "Pull-Up",
              "movement": "vertical_pull",
              "slotPurpose": "vertical pulling support",
              "workingSets": 2,
              "exactReps": [
                8,
                8
              ],
              "loadState": "bodyweight",
              "restSeconds": 150,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:vertical pulling support",
                "fatigue:high",
                "recovery:normal",
                "stability:high",
                "repeat:not_repeated",
                "preference_score:0"
              ]
            },
            {
              "exerciseId": "ex-dumbbell-lateral-raise",
              "exercise": "Dumbbell Lateral Raise",
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
                "stability:moderate",
                "repeat:not_repeated",
                "preference_score:0"
              ]
            },
            {
              "exerciseId": "ex-french-press",
              "exercise": "French Press",
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
              "exerciseId": "ex-preacher-curl",
              "exercise": "Preacher Curl",
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
              "exerciseId": "ex-bulgarian-split-squat",
              "exercise": "Bulgarian Split Squat",
              "movement": "lunge",
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
                "stability:moderate",
                "repeat:not_repeated",
                "preference_score:0"
              ]
            },
            {
              "exerciseId": "ex-single-leg-hip-thrust",
              "exercise": "Single-Leg Hip Thrust",
              "movement": "hip_thrust",
              "slotPurpose": "hip-extension support",
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
                "slot:hip-extension support",
                "fatigue:moderate",
                "recovery:normal",
                "stability:high",
                "repeat:not_repeated",
                "preference_score:0"
              ]
            },
            {
              "exerciseId": "ex-glute-ham-raise",
              "exercise": "Glute-Ham Raise",
              "movement": "isolation",
              "slotPurpose": "knee-flexion hamstring work",
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
                "slot:knee-flexion hamstring work",
                "fatigue:moderate",
                "recovery:normal",
                "stability:high",
                "repeat:not_repeated",
                "preference_score:0"
              ]
            },
            {
              "exerciseId": "ex-single-leg-calf-raise",
              "exercise": "Single-Leg Calf Raise",
              "movement": "isolation",
              "slotPurpose": "calf work",
              "workingSets": 2,
              "exactReps": [
                15,
                15
              ],
              "loadState": "bodyweight",
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
          "dayOffset": 3,
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
              "exerciseId": "ex-dumbbell-bench-press",
              "exercise": "Dumbbell Bench Press",
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
                "stability:moderate",
                "repeat:stable_primary_practice",
                "preference_score:0"
              ]
            },
            {
              "exerciseId": "ex-seal-row",
              "exercise": "Seal Row",
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
              "exerciseId": "ex-pull-up",
              "exercise": "Pull-Up",
              "movement": "vertical_pull",
              "slotPurpose": "vertical pulling support",
              "workingSets": 2,
              "exactReps": [
                8,
                8
              ],
              "loadState": "bodyweight",
              "restSeconds": 150,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:vertical pulling support",
                "fatigue:high",
                "recovery:normal",
                "stability:high",
                "repeat:variation_preferred",
                "preference_score:0",
                "repeat:no_unused_equivalent_available"
              ]
            },
            {
              "exerciseId": "ex-leaning-lateral-raise",
              "exercise": "Leaning Lateral Raise",
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
                "stability:moderate",
                "repeat:not_repeated",
                "preference_score:0"
              ]
            },
            {
              "exerciseId": "ex-elbows-out-extension",
              "exercise": "Elbows Out Extension",
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
                "stability:moderate",
                "repeat:not_repeated",
                "preference_score:0"
              ]
            },
            {
              "exerciseId": "ex-drag-curl",
              "exercise": "Drag Curls",
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
              "exerciseId": "ex-bulgarian-split-squat",
              "exercise": "Bulgarian Split Squat",
              "movement": "lunge",
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
                "stability:moderate",
                "repeat:stable_primary_practice",
                "preference_score:0"
              ]
            },
            {
              "exerciseId": "ex-single-leg-hip-thrust",
              "exercise": "Single-Leg Hip Thrust",
              "movement": "hip_thrust",
              "slotPurpose": "hip-extension support",
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
                "slot:hip-extension support",
                "fatigue:moderate",
                "recovery:normal",
                "stability:high",
                "repeat:variation_preferred",
                "preference_score:0",
                "repeat:no_unused_equivalent_available"
              ]
            },
            {
              "exerciseId": "ex-nordic-curl",
              "exercise": "Nordic Curl",
              "movement": "isolation",
              "slotPurpose": "knee-flexion hamstring work",
              "workingSets": 2,
              "exactReps": [
                8,
                8
              ],
              "loadState": "bodyweight",
              "restSeconds": 120,
              "progression": "rep_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_muscle",
                "mesocycle:hypertrophy_calibration",
                "slot:knee-flexion hamstring work",
                "fatigue:moderate",
                "recovery:normal",
                "stability:high",
                "repeat:not_repeated",
                "preference_score:0"
              ]
            },
            {
              "exerciseId": "ex-tibialis-raise",
              "exercise": "Tibialis Raise",
              "movement": "isolation",
              "slotPurpose": "calf work",
              "workingSets": 2,
              "exactReps": [
                15,
                15
              ],
              "loadState": "bodyweight",
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
          "chest": 6,
          "upper_back": 4,
          "lats": 4,
          "lateral_delts": 4,
          "triceps": 4,
          "biceps": 4,
          "quadriceps": 6,
          "hip_extension": 4,
          "hamstrings_knee_flexion": 4,
          "calves": 4
        },
        "meaningfulSecondarySets": {
          "triceps": 6,
          "anterior_delts": 6,
          "biceps": 8,
          "rear_delts": 4,
          "hip_extension": 12
        },
        "muscleFrequency": {
          "biceps": 2,
          "calves": 2,
          "chest": 2,
          "hamstrings_knee_flexion": 2,
          "hip_extension": 2,
          "lateral_delts": 2,
          "lats": 2,
          "quadriceps": 2,
          "triceps": 2,
          "upper_back": 2
        },
        "movementPatternExposures": {
          "horizontal_push": 2,
          "horizontal_pull": 2,
          "vertical_pull": 2,
          "isolation": 10,
          "squat": 2,
          "lunge": 2,
          "hinge": 2,
          "hip_thrust": 2
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
          13,
          9,
          13,
          9
        ],
        "perSessionEstimatedMinutes": [
          47,
          35,
          47,
          35
        ],
        "fatigueUnits": {
          "perSession": [
            23,
            17,
            23,
            17
          ],
          "weeklyUnits": 80,
          "overlapFlags": [
            "more_than_three_primary_sessions"
          ]
        },
        "repeatedExercises": [
          {
            "exerciseId": "ex-bulgarian-split-squat",
            "count": 2,
            "reason": "stable_primary_practice"
          },
          {
            "exerciseId": "ex-dumbbell-bench-press",
            "count": 2,
            "reason": "stable_primary_practice"
          },
          {
            "exerciseId": "ex-pull-up",
            "count": 2,
            "reason": "only_equivalent_available"
          },
          {
            "exerciseId": "ex-single-leg-hip-thrust",
            "count": 2,
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
            "secondary_stimulus_reported_separately",
            "no_unauthorised_specialist_selection",
            "repeat_authorised:ex-bulgarian-split-squat",
            "repeat_authorised:ex-dumbbell-bench-press",
            "repeat_authorised:ex-pull-up",
            "repeat_authorised:ex-single-leg-hip-thrust"
          ],
          "failures": []
        }
      }
    },
    {
      "id": "limited-machines",
      "label": "Limited equipment · machine and cable",
      "status": "constructed",
      "input": {
        "goal": "build_muscle",
        "experience": "intermediate",
        "frequency": 4,
        "requestedFramework": "upper_lower",
        "equipment": [
          "machine",
          "cable"
        ],
        "establishedHistory": false
      },
      "authority": {
        "macrocycle": "cert-limited-machines:macrocycle",
        "mesocycle": "hypertrophy_calibration",
        "microcycle": "cert-limited-machines:microcycle:1",
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
            "frequency:4",
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
          3,
          4
        ],
        "recoveryDays": 3
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
              "exerciseId": "ex-decline-plate-loaded-press",
              "exercise": "Decline Plate Loaded Press",
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
          "dayOffset": 3,
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
              "exerciseId": "ex-decline-plate-loaded-press",
              "exercise": "Decline Plate Loaded Press",
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
        }
      ],
      "accounting": {
        "directSets": {
          "chest": 6,
          "upper_back": 4,
          "lats": 4,
          "lateral_delts": 4,
          "triceps": 4,
          "biceps": 4,
          "quadriceps": 6,
          "hip_extension": 4,
          "hamstrings_knee_flexion": 4,
          "calves": 4
        },
        "meaningfulSecondarySets": {
          "triceps": 6,
          "biceps": 8,
          "rear_delts": 4,
          "hip_extension": 8
        },
        "muscleFrequency": {
          "biceps": 2,
          "calves": 2,
          "chest": 2,
          "hamstrings_knee_flexion": 2,
          "hip_extension": 2,
          "lateral_delts": 2,
          "lats": 2,
          "quadriceps": 2,
          "triceps": 2,
          "upper_back": 2
        },
        "movementPatternExposures": {
          "horizontal_push": 2,
          "horizontal_pull": 2,
          "vertical_pull": 2,
          "isolation": 10,
          "squat": 2,
          "lunge": 2,
          "hinge": 2,
          "hip_thrust": 2
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
          13,
          9,
          13,
          9
        ],
        "perSessionEstimatedMinutes": [
          47,
          35,
          47,
          35
        ],
        "fatigueUnits": {
          "perSession": [
            23,
            17,
            23,
            17
          ],
          "weeklyUnits": 80,
          "overlapFlags": [
            "more_than_three_primary_sessions"
          ]
        },
        "repeatedExercises": [
          {
            "exerciseId": "ex-decline-plate-loaded-press",
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
            "secondary_stimulus_reported_separately",
            "no_unauthorised_specialist_selection",
            "repeat_authorised:ex-decline-plate-loaded-press",
            "repeat_authorised:ex-hack-squat-machine"
          ],
          "failures": []
        }
      }
    },
    {
      "id": "event-strength",
      "label": "Strength · supported event horizon",
      "status": "constructed",
      "input": {
        "goal": "build_strength",
        "experience": "intermediate",
        "frequency": 4,
        "requestedFramework": "bench_squat_deadlift",
        "equipment": [
          "barbell",
          "dumbbell",
          "machine",
          "cable",
          "bodyweight"
        ],
        "targetDate": "2027-01-31",
        "establishedHistory": false
      },
      "authority": {
        "macrocycle": "cert-event-strength:macrocycle",
        "mesocycle": "strength_general",
        "microcycle": "cert-event-strength:microcycle:1",
        "sessionConstruction": "canonical_plan_v3",
        "prescriptionPolicy": "mesocycle_prescription_policy_v1",
        "rationale": {
          "schemaVersion": "canonical_planning_rationale_v1",
          "goalStrategyId": "canonical_goal_strength_v1",
          "rotationReasons": [
            "framework:bench_squat_deadlift",
            "framework_reason:explicit_supported_preference",
            "goal_strategy:build_strength",
            "experience:intermediate",
            "frequency:4",
            "mesocycle:strength_general",
            "schedule:calendar_week"
          ],
          "sessionReasons": [
            {
              "planSessionIndex": 0,
              "role": "Bench strength",
              "reasons": [
                "microcycle_role:Bench strength",
                "mesocycle_purpose:Build work capacity and movement tolerance",
                "slot:0:bench-specific anchor",
                "slot:1:bench-support row",
                "slot:2:bench triceps support"
              ]
            },
            {
              "planSessionIndex": 1,
              "role": "Squat strength",
              "reasons": [
                "microcycle_role:Squat strength",
                "mesocycle_purpose:Build work capacity and movement tolerance",
                "slot:0:squat-specific anchor",
                "slot:1:hip-extension support",
                "slot:2:knee-flexion hamstring work",
                "slot:3:calf work"
              ]
            },
            {
              "planSessionIndex": 2,
              "role": "Deadlift strength",
              "reasons": [
                "microcycle_role:Deadlift strength",
                "mesocycle_purpose:Build work capacity and movement tolerance",
                "slot:0:deadlift-specific anchor",
                "slot:1:deadlift back support",
                "slot:2:deadlift hamstring support"
              ]
            },
            {
              "planSessionIndex": 3,
              "role": "Technical strength support",
              "reasons": [
                "microcycle_role:Technical strength support",
                "mesocycle_purpose:Build work capacity and movement tolerance",
                "slot:0:full-body hinge anchor",
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
        "resolvedFramework": "bench_squat_deadlift",
        "reason": "explicit_supported_preference",
        "sessionDayOffsets": [
          0,
          1,
          3,
          4
        ],
        "recoveryDays": 3
      },
      "sessions": [
        {
          "order": 1,
          "dayOffset": 0,
          "role": "Bench strength",
          "purpose": "Build work capacity and movement tolerance",
          "workingSets": 7,
          "estimatedMinutes": 29,
          "dosageAssessment": {
            "exerciseCount": 3,
            "workingSets": 7,
            "fourExercisesAndElevenSets": false,
            "outcome": "role_specific_allocation",
            "reason": "3 owned movement/muscle slots supply 7 exact working sets for this session role; appropriateness is certified from full-rotation direct stimulus, secondary stimulus, duration and fatigue rather than a universal exercise count."
          },
          "exercises": [
            {
              "exerciseId": "ex-bench-press",
              "exercise": "Bench Press",
              "movement": "horizontal_push",
              "slotPurpose": "bench-specific anchor",
              "workingSets": 3,
              "exactReps": [
                5,
                5,
                5
              ],
              "loadState": "calibration_required",
              "restSeconds": 180,
              "progression": "load_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_strength",
                "mesocycle:strength_general",
                "slot:bench-specific anchor",
                "fatigue:high",
                "recovery:normal",
                "stability:moderate",
                "repeat:not_repeated",
                "preference_score:0"
              ]
            },
            {
              "exerciseId": "ex-chest-supported-row",
              "exercise": "Chest Supported Row",
              "movement": "horizontal_pull",
              "slotPurpose": "bench-support row",
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
                "goal:build_strength",
                "mesocycle:strength_general",
                "slot:bench-support row",
                "fatigue:moderate",
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
              "slotPurpose": "bench triceps support",
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
                "goal:build_strength",
                "mesocycle:strength_general",
                "slot:bench triceps support",
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
          "role": "Squat strength",
          "purpose": "Build work capacity and movement tolerance",
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
              "exerciseId": "ex-barbell-back-squat",
              "exercise": "Barbell Back Squat",
              "movement": "squat",
              "slotPurpose": "squat-specific anchor",
              "workingSets": 3,
              "exactReps": [
                5,
                5,
                5
              ],
              "loadState": "calibration_required",
              "restSeconds": 210,
              "progression": "load_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_strength",
                "mesocycle:strength_general",
                "slot:squat-specific anchor",
                "fatigue:high",
                "recovery:normal",
                "stability:moderate",
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
                "goal:build_strength",
                "mesocycle:strength_general",
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
                "goal:build_strength",
                "mesocycle:strength_general",
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
                "goal:build_strength",
                "mesocycle:strength_general",
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
          "dayOffset": 3,
          "role": "Deadlift strength",
          "purpose": "Build work capacity and movement tolerance",
          "workingSets": 7,
          "estimatedMinutes": 29,
          "dosageAssessment": {
            "exerciseCount": 3,
            "workingSets": 7,
            "fourExercisesAndElevenSets": false,
            "outcome": "role_specific_allocation",
            "reason": "3 owned movement/muscle slots supply 7 exact working sets for this session role; appropriateness is certified from full-rotation direct stimulus, secondary stimulus, duration and fatigue rather than a universal exercise count."
          },
          "exercises": [
            {
              "exerciseId": "ex-deadlift",
              "exercise": "Deadlift",
              "movement": "hinge",
              "slotPurpose": "deadlift-specific anchor",
              "workingSets": 3,
              "exactReps": [
                5,
                5,
                5
              ],
              "loadState": "calibration_required",
              "restSeconds": 240,
              "progression": "load_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_strength",
                "mesocycle:strength_general",
                "slot:deadlift-specific anchor",
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
              "slotPurpose": "deadlift back support",
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
                "goal:build_strength",
                "mesocycle:strength_general",
                "slot:deadlift back support",
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
              "slotPurpose": "deadlift hamstring support",
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
                "goal:build_strength",
                "mesocycle:strength_general",
                "slot:deadlift hamstring support",
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
          "role": "Technical strength support",
          "purpose": "Build work capacity and movement tolerance",
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
                5,
                5,
                5
              ],
              "loadState": "calibration_required",
              "restSeconds": 240,
              "progression": "load_progression",
              "stopRule": "change_target",
              "reasonCodes": [
                "goal:build_strength",
                "mesocycle:strength_general",
                "slot:full-body hinge anchor",
                "fatigue:high",
                "recovery:normal",
                "stability:moderate",
                "repeat:stable_primary_practice",
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
                "goal:build_strength",
                "mesocycle:strength_general",
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
                "goal:build_strength",
                "mesocycle:strength_general",
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
                "goal:build_strength",
                "mesocycle:strength_general",
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
                "goal:build_strength",
                "mesocycle:strength_general",
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
          "chest": 5,
          "upper_back": 2,
          "triceps": 2,
          "quadriceps": 5,
          "hip_extension": 8,
          "hamstrings_knee_flexion": 4,
          "calves": 2,
          "lats": 4,
          "core": 2
        },
        "meaningfulSecondarySets": {
          "triceps": 5,
          "anterior_delts": 3,
          "biceps": 6,
          "rear_delts": 2,
          "hip_extension": 5,
          "upper_back": 6,
          "quadriceps": 6
        },
        "muscleFrequency": {
          "calves": 1,
          "chest": 2,
          "core": 1,
          "hamstrings_knee_flexion": 2,
          "hip_extension": 3,
          "lats": 2,
          "quadriceps": 2,
          "triceps": 1,
          "upper_back": 1
        },
        "movementPatternExposures": {
          "horizontal_push": 2,
          "horizontal_pull": 1,
          "isolation": 4,
          "squat": 2,
          "lunge": 2,
          "hinge": 3,
          "hip_thrust": 1,
          "vertical_pull": 2,
          "core": 1,
          "carry": 1
        },
        "primaryLiftExposures": {
          "bench": {
            "primary": 1,
            "secondaryVariation": 0
          },
          "squat": {
            "primary": 1,
            "secondaryVariation": 0
          },
          "deadlift": {
            "primary": 2,
            "secondaryVariation": 0
          }
        },
        "totalWorkingSets": 34,
        "perSessionWorkingSets": [
          7,
          9,
          7,
          11
        ],
        "perSessionEstimatedMinutes": [
          29,
          35,
          29,
          41
        ],
        "fatigueUnits": {
          "perSession": [
            15,
            17,
            15,
            23
          ],
          "weeklyUnits": 70,
          "overlapFlags": [
            "more_than_three_primary_sessions"
          ]
        },
        "repeatedExercises": [
          {
            "exerciseId": "ex-deadlift",
            "count": 2,
            "reason": "stable_primary_practice"
          }
        ]
      },
      "progression": {
        "nextRotation": "same immutable prescriptions until canonical Progress evidence authorises regeneration",
        "mesocycleExitCriteria": [
          "Capacity established"
        ],
        "approvedNextMesocycles": [
          "strength_accumulation"
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
            "triceps_direct_coverage",
            "quadriceps_direct_coverage",
            "hip_extension_direct_coverage",
            "hamstrings_knee_flexion_direct_coverage",
            "calves_direct_coverage",
            "lats_direct_coverage",
            "core_direct_coverage",
            "secondary_stimulus_reported_separately",
            "no_unauthorised_specialist_selection",
            "repeat_authorised:ex-deadlift"
          ],
          "failures": []
        }
      }
    },
    {
      "id": "established-loads",
      "label": "Hypertrophy · established comparable loads",
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
        "macrocycle": "cert-established-loads:macrocycle",
        "mesocycle": "hypertrophy_calibration",
        "microcycle": "cert-established-loads:microcycle:1",
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
      "id": "no-load-history",
      "label": "Hypertrophy · calibration required",
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
        "macrocycle": "cert-no-load-history:macrocycle",
        "mesocycle": "hypertrophy_calibration",
        "microcycle": "cert-no-load-history:microcycle:1",
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
      "id": "exercise-limitation",
      "label": "Hypertrophy · bench exercise excluded",
      "status": "constructed",
      "input": {
        "goal": "build_muscle",
        "experience": "intermediate",
        "frequency": 4,
        "requestedFramework": "upper_lower",
        "equipment": [
          "barbell",
          "dumbbell",
          "machine",
          "cable",
          "bodyweight"
        ],
        "establishedHistory": false,
        "limitation": "exclude_exercise:ex-bench-press"
      },
      "authority": {
        "macrocycle": "cert-exercise-limitation:macrocycle",
        "mesocycle": "hypertrophy_calibration",
        "microcycle": "cert-exercise-limitation:microcycle:1",
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
            "frequency:4",
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
          3,
          4
        ],
        "recoveryDays": 3
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
          "dayOffset": 3,
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
        }
      ],
      "accounting": {
        "directSets": {
          "chest": 6,
          "upper_back": 4,
          "lats": 4,
          "lateral_delts": 4,
          "triceps": 4,
          "biceps": 4,
          "quadriceps": 6,
          "hip_extension": 4,
          "hamstrings_knee_flexion": 4,
          "calves": 4
        },
        "meaningfulSecondarySets": {
          "triceps": 6,
          "anterior_delts": 6,
          "biceps": 8,
          "rear_delts": 4,
          "hip_extension": 8
        },
        "muscleFrequency": {
          "biceps": 2,
          "calves": 2,
          "chest": 2,
          "hamstrings_knee_flexion": 2,
          "hip_extension": 2,
          "lateral_delts": 2,
          "lats": 2,
          "quadriceps": 2,
          "triceps": 2,
          "upper_back": 2
        },
        "movementPatternExposures": {
          "horizontal_push": 2,
          "horizontal_pull": 2,
          "vertical_pull": 2,
          "isolation": 10,
          "squat": 2,
          "lunge": 2,
          "hinge": 2,
          "hip_thrust": 2
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
          13,
          9,
          13,
          9
        ],
        "perSessionEstimatedMinutes": [
          47,
          35,
          47,
          35
        ],
        "fatigueUnits": {
          "perSession": [
            23,
            17,
            23,
            17
          ],
          "weeklyUnits": 80,
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
      "id": "short-session-gap",
      "label": "Short-session duration · unsupported input",
      "status": "unsupported",
      "reason": "session_duration_constraint_not_supported",
      "note": "Production has no session-duration input owner; activation must not infer one."
    }
  ]
}
```
