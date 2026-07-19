# Complete Rolling Ppl Rotation

Generated from `canonical_adaptive_planning_certification_v1`. This report is evidence, not a second planning authority.

```json
{
  "schemaVersion": "canonical_dosage_evolution_certification_v2",
  "rotationPolicy": {
    "sequenceNumber": 1,
    "rotationCursor": 0,
    "scheduleMode": "asymmetric_rotation",
    "logicalRotation": [
      "push",
      "pull",
      "legs"
    ]
  },
  "calendarCrossing": [
    {
      "calendarDay": 0,
      "kind": "lifting",
      "role": "Push hypertrophy A"
    },
    {
      "calendarDay": 1,
      "kind": "lifting",
      "role": "Pull hypertrophy B"
    },
    {
      "calendarDay": 2,
      "kind": "lifting",
      "role": "Legs hypertrophy C"
    },
    {
      "calendarDay": 3,
      "kind": "cardio",
      "role": "recovery_cardio"
    },
    {
      "calendarDay": 4,
      "kind": "lifting",
      "role": "Push hypertrophy D"
    },
    {
      "calendarDay": 5,
      "kind": "lifting",
      "role": "Pull hypertrophy E"
    },
    {
      "calendarDay": 6,
      "kind": "cardio",
      "role": "recovery_cardio"
    },
    {
      "calendarDay": 7,
      "kind": "lifting",
      "role": "Legs hypertrophy F"
    },
    {
      "calendarDay": 8,
      "kind": "lifting",
      "role": "Push hypertrophy A"
    },
    {
      "calendarDay": 9,
      "kind": "lifting",
      "role": "Pull hypertrophy B"
    },
    {
      "calendarDay": 10,
      "kind": "cardio",
      "role": "recovery_cardio"
    },
    {
      "calendarDay": 11,
      "kind": "lifting",
      "role": "Legs hypertrophy C"
    },
    {
      "calendarDay": 12,
      "kind": "lifting",
      "role": "Push hypertrophy D"
    },
    {
      "calendarDay": 13,
      "kind": "cardio",
      "role": "recovery_cardio"
    }
  ],
  "completeRotation": {
    "roles": [
      "Push hypertrophy A",
      "Pull hypertrophy B",
      "Legs hypertrophy C",
      "Push hypertrophy D",
      "Pull hypertrophy E",
      "Legs hypertrophy F"
    ],
    "sessions": [
      {
        "role": "Push hypertrophy A",
        "calendarDayOffset": 0,
        "purpose": "Establish reproducible exercise, load and recovery baselines",
        "exercises": [
          {
            "exerciseId": "ex-bench-press",
            "exercise": "Bench Press",
            "purpose": "high-priority horizontal press",
            "workingSets": 3,
            "exactTargets": [
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
            "loadPrescription": {
              "schemaVersion": "canonical_load_prescription_v1",
              "state": "calibration_required",
              "loadingMode": "rep_progression",
              "instruction": "calibrate a reproducible starting load",
              "reason": "load_evidence_unavailable",
              "evidenceStatus": "missing",
              "protocol": {
                "schemaVersion": "canonical_load_calibration_protocol_v1",
                "targetReps": 8,
                "workingSets": 3,
                "warmupAndRampExcludedFromWorkingVolume": true,
                "startingInstruction": "Before working sets, begin with the lightest load you can control confidently for the exact target and leave at least three good reps in reserve.",
                "safeAdjustment": "Use warm-up/ramp attempts to increase by one available equipment increment; stop increasing if technique, range or rep speed becomes inconsistent.",
                "successCriteria": "Use the first load that permits 8 controlled reps with stable technique and at least two good reps in reserve.",
                "laterWorkingSets": "Use that provisional load for the prescribed working sets; reduce by one increment if the stop rule triggers. Warm-up/ramp attempts do not count as working sets.",
                "evidenceRetention": {
                  "persistCompletedWorkingSetEvidence": true,
                  "reuseWhileFreshAndCompatible": true,
                  "recalibrateOnlyWhen": [
                    "missing",
                    "stale",
                    "incompatible"
                  ]
                }
              }
            },
            "restSeconds": 150,
            "directMuscles": [
              "chest"
            ],
            "meaningfulSecondaryMuscles": [
              "triceps",
              "anterior_delts"
            ],
            "fatigueClass": "high",
            "stimulusToFatigueRationale": "Priority anchor with bounded exact sets, reps and rest; not repeated as redundant high-fatigue work.",
            "progression": "rep_progression",
            "stopRule": "change_target"
          },
          {
            "exerciseId": "ex-incline-dumbbell-press",
            "exercise": "Incline Dumbbell Press",
            "purpose": "chest work in a complementary press path",
            "workingSets": 2,
            "exactTargets": [
              10,
              10
            ],
            "exactTargetKinds": [
              "reps",
              "reps"
            ],
            "method": "straight_sets",
            "loadState": "calibration_required",
            "loadPrescription": {
              "schemaVersion": "canonical_load_prescription_v1",
              "state": "calibration_required",
              "loadingMode": "rep_progression",
              "instruction": "calibrate a reproducible starting load",
              "reason": "load_evidence_unavailable",
              "evidenceStatus": "missing",
              "protocol": {
                "schemaVersion": "canonical_load_calibration_protocol_v1",
                "targetReps": 10,
                "workingSets": 2,
                "warmupAndRampExcludedFromWorkingVolume": true,
                "startingInstruction": "Before working sets, begin with the lightest load you can control confidently for the exact target and leave at least three good reps in reserve.",
                "safeAdjustment": "Use warm-up/ramp attempts to increase by one available equipment increment; stop increasing if technique, range or rep speed becomes inconsistent.",
                "successCriteria": "Use the first load that permits 10 controlled reps with stable technique and at least two good reps in reserve.",
                "laterWorkingSets": "Use that provisional load for the prescribed working sets; reduce by one increment if the stop rule triggers. Warm-up/ramp attempts do not count as working sets.",
                "evidenceRetention": {
                  "persistCompletedWorkingSetEvidence": true,
                  "reuseWhileFreshAndCompatible": true,
                  "recalibrateOnlyWhen": [
                    "missing",
                    "stale",
                    "incompatible"
                  ]
                }
              }
            },
            "restSeconds": 120,
            "directMuscles": [
              "chest"
            ],
            "meaningfulSecondaryMuscles": [
              "anterior_delts",
              "triceps"
            ],
            "fatigueClass": "moderate",
            "stimulusToFatigueRationale": "Stable direct stimulus with less systemic cost than the primary high-fatigue anchor.",
            "progression": "rep_progression",
            "stopRule": "change_target"
          },
          {
            "exerciseId": "ex-machine-shoulder-press",
            "exercise": "Machine Shoulder Press",
            "purpose": "vertical pressing stimulus",
            "workingSets": 4,
            "exactTargets": [
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
            "loadPrescription": {
              "schemaVersion": "canonical_load_prescription_v1",
              "state": "calibration_required",
              "loadingMode": "rep_progression",
              "instruction": "calibrate a reproducible starting load",
              "reason": "load_evidence_unavailable",
              "evidenceStatus": "missing",
              "protocol": {
                "schemaVersion": "canonical_load_calibration_protocol_v1",
                "targetReps": 10,
                "workingSets": 4,
                "warmupAndRampExcludedFromWorkingVolume": true,
                "startingInstruction": "Before working sets, begin with the lightest load you can control confidently for the exact target and leave at least three good reps in reserve.",
                "safeAdjustment": "Use warm-up/ramp attempts to increase by one available equipment increment; stop increasing if technique, range or rep speed becomes inconsistent.",
                "successCriteria": "Use the first load that permits 10 controlled reps with stable technique and at least two good reps in reserve.",
                "laterWorkingSets": "Use that provisional load for the prescribed working sets; reduce by one increment if the stop rule triggers. Warm-up/ramp attempts do not count as working sets.",
                "evidenceRetention": {
                  "persistCompletedWorkingSetEvidence": true,
                  "reuseWhileFreshAndCompatible": true,
                  "recalibrateOnlyWhen": [
                    "missing",
                    "stale",
                    "incompatible"
                  ]
                }
              }
            },
            "restSeconds": 120,
            "directMuscles": [
              "anterior_delts"
            ],
            "meaningfulSecondaryMuscles": [
              "triceps"
            ],
            "fatigueClass": "moderate",
            "stimulusToFatigueRationale": "Stable direct stimulus with less systemic cost than the primary high-fatigue anchor.",
            "progression": "rep_progression",
            "stopRule": "change_target"
          },
          {
            "exerciseId": "ex-cable-lateral-raise",
            "exercise": "Cable Lateral Raise",
            "purpose": "lateral-delt stimulus",
            "workingSets": 4,
            "exactTargets": [
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
            "loadPrescription": {
              "schemaVersion": "canonical_load_prescription_v1",
              "state": "calibration_required",
              "loadingMode": "rep_progression",
              "instruction": "calibrate a reproducible starting load",
              "reason": "load_evidence_unavailable",
              "evidenceStatus": "missing",
              "protocol": {
                "schemaVersion": "canonical_load_calibration_protocol_v1",
                "targetReps": 15,
                "workingSets": 4,
                "warmupAndRampExcludedFromWorkingVolume": true,
                "startingInstruction": "Before working sets, begin with the lightest load you can control confidently for the exact target and leave at least three good reps in reserve.",
                "safeAdjustment": "Use warm-up/ramp attempts to increase by one available equipment increment; stop increasing if technique, range or rep speed becomes inconsistent.",
                "successCriteria": "Use the first load that permits 15 controlled reps with stable technique and at least two good reps in reserve.",
                "laterWorkingSets": "Use that provisional load for the prescribed working sets; reduce by one increment if the stop rule triggers. Warm-up/ramp attempts do not count as working sets.",
                "evidenceRetention": {
                  "persistCompletedWorkingSetEvidence": true,
                  "reuseWhileFreshAndCompatible": true,
                  "recalibrateOnlyWhen": [
                    "missing",
                    "stale",
                    "incompatible"
                  ]
                }
              }
            },
            "restSeconds": 75,
            "directMuscles": [
              "lateral_delts"
            ],
            "meaningfulSecondaryMuscles": [],
            "fatigueClass": "low",
            "stimulusToFatigueRationale": "Low-systemic-cost direct accessory work used only to meet an owned regional dose.",
            "progression": "rep_progression",
            "stopRule": "change_target"
          },
          {
            "exerciseId": "ex-cable-rope-overhead-extension",
            "exercise": "Rope Overhead Triceps Extension",
            "purpose": "lengthened elbow-extension work",
            "workingSets": 3,
            "exactTargets": [
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
            "loadPrescription": {
              "schemaVersion": "canonical_load_prescription_v1",
              "state": "calibration_required",
              "loadingMode": "rep_progression",
              "instruction": "calibrate a reproducible starting load",
              "reason": "load_evidence_unavailable",
              "evidenceStatus": "missing",
              "protocol": {
                "schemaVersion": "canonical_load_calibration_protocol_v1",
                "targetReps": 12,
                "workingSets": 3,
                "warmupAndRampExcludedFromWorkingVolume": true,
                "startingInstruction": "Before working sets, begin with the lightest load you can control confidently for the exact target and leave at least three good reps in reserve.",
                "safeAdjustment": "Use warm-up/ramp attempts to increase by one available equipment increment; stop increasing if technique, range or rep speed becomes inconsistent.",
                "successCriteria": "Use the first load that permits 12 controlled reps with stable technique and at least two good reps in reserve.",
                "laterWorkingSets": "Use that provisional load for the prescribed working sets; reduce by one increment if the stop rule triggers. Warm-up/ramp attempts do not count as working sets.",
                "evidenceRetention": {
                  "persistCompletedWorkingSetEvidence": true,
                  "reuseWhileFreshAndCompatible": true,
                  "recalibrateOnlyWhen": [
                    "missing",
                    "stale",
                    "incompatible"
                  ]
                }
              }
            },
            "restSeconds": 75,
            "directMuscles": [
              "triceps"
            ],
            "meaningfulSecondaryMuscles": [],
            "fatigueClass": "low",
            "stimulusToFatigueRationale": "Low-systemic-cost direct accessory work used only to meet an owned regional dose.",
            "progression": "rep_progression",
            "stopRule": "change_target"
          },
          {
            "exerciseId": "ex-close-neutral-pushdown",
            "exercise": "Close Neutral Pushdown",
            "purpose": "shortened-range triceps finish",
            "workingSets": 2,
            "exactTargets": [
              12,
              12
            ],
            "exactTargetKinds": [
              "reps",
              "reps"
            ],
            "method": "straight_sets",
            "loadState": "calibration_required",
            "loadPrescription": {
              "schemaVersion": "canonical_load_prescription_v1",
              "state": "calibration_required",
              "loadingMode": "rep_progression",
              "instruction": "calibrate a reproducible starting load",
              "reason": "load_evidence_unavailable",
              "evidenceStatus": "missing",
              "protocol": {
                "schemaVersion": "canonical_load_calibration_protocol_v1",
                "targetReps": 12,
                "workingSets": 2,
                "warmupAndRampExcludedFromWorkingVolume": true,
                "startingInstruction": "Before working sets, begin with the lightest load you can control confidently for the exact target and leave at least three good reps in reserve.",
                "safeAdjustment": "Use warm-up/ramp attempts to increase by one available equipment increment; stop increasing if technique, range or rep speed becomes inconsistent.",
                "successCriteria": "Use the first load that permits 12 controlled reps with stable technique and at least two good reps in reserve.",
                "laterWorkingSets": "Use that provisional load for the prescribed working sets; reduce by one increment if the stop rule triggers. Warm-up/ramp attempts do not count as working sets.",
                "evidenceRetention": {
                  "persistCompletedWorkingSetEvidence": true,
                  "reuseWhileFreshAndCompatible": true,
                  "recalibrateOnlyWhen": [
                    "missing",
                    "stale",
                    "incompatible"
                  ]
                }
              }
            },
            "restSeconds": 75,
            "directMuscles": [
              "triceps"
            ],
            "meaningfulSecondaryMuscles": [],
            "fatigueClass": "low",
            "stimulusToFatigueRationale": "Low-systemic-cost direct accessory work used only to meet an owned regional dose.",
            "progression": "rep_progression",
            "stopRule": "change_target"
          }
        ],
        "workingSets": 18,
        "estimatedMinutes": 54,
        "durationBreakdown": {
          "generalWarmup": 240,
          "liftSpecificRamp": 390,
          "workingSetExecution": 720,
          "prescribedInterSetRest": 1500,
          "equipmentSetup": 180,
          "exerciseTransitions": 150,
          "unilateralOverhead": 0,
          "calibrationOverhead": 60,
          "methodOverhead": 0
        },
        "durationAssumptions": [
          "general_warmup_included",
          "lift_specific_ramps_included",
          "prescribed_or_role_owned_rest_included",
          "set_execution_and_unilateral_time_included",
          "equipment_setup_and_transitions_included",
          "calibration_and_method_overhead_included"
        ],
        "localFatigue": {
          "chest": 5,
          "anterior_delts": 4,
          "lateral_delts": 4,
          "triceps": 5
        },
        "systemicFatigueUnits": 30,
        "meaningfulSecondarySets": {
          "triceps": 9,
          "anterior_delts": 5
        }
      },
      {
        "role": "Pull hypertrophy B",
        "calendarDayOffset": 1,
        "purpose": "Establish reproducible exercise, load and recovery baselines",
        "exercises": [
          {
            "exerciseId": "ex-chest-supported-row",
            "exercise": "Chest Supported Row",
            "purpose": "supported horizontal-pull anchor",
            "workingSets": 3,
            "exactTargets": [
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
            "loadPrescription": {
              "schemaVersion": "canonical_load_prescription_v1",
              "state": "calibration_required",
              "loadingMode": "rep_progression",
              "instruction": "calibrate a reproducible starting load",
              "reason": "load_evidence_unavailable",
              "evidenceStatus": "missing",
              "protocol": {
                "schemaVersion": "canonical_load_calibration_protocol_v1",
                "targetReps": 12,
                "workingSets": 3,
                "warmupAndRampExcludedFromWorkingVolume": true,
                "startingInstruction": "Before working sets, begin with the lightest load you can control confidently for the exact target and leave at least three good reps in reserve.",
                "safeAdjustment": "Use warm-up/ramp attempts to increase by one available equipment increment; stop increasing if technique, range or rep speed becomes inconsistent.",
                "successCriteria": "Use the first load that permits 12 controlled reps with stable technique and at least two good reps in reserve.",
                "laterWorkingSets": "Use that provisional load for the prescribed working sets; reduce by one increment if the stop rule triggers. Warm-up/ramp attempts do not count as working sets.",
                "evidenceRetention": {
                  "persistCompletedWorkingSetEvidence": true,
                  "reuseWhileFreshAndCompatible": true,
                  "recalibrateOnlyWhen": [
                    "missing",
                    "stale",
                    "incompatible"
                  ]
                }
              }
            },
            "restSeconds": 120,
            "directMuscles": [
              "upper_back"
            ],
            "meaningfulSecondaryMuscles": [
              "biceps",
              "rear_delts"
            ],
            "fatigueClass": "moderate",
            "stimulusToFatigueRationale": "Stable direct stimulus with less systemic cost than the primary high-fatigue anchor.",
            "progression": "rep_progression",
            "stopRule": "change_target"
          },
          {
            "exerciseId": "ex-lat-pulldown",
            "exercise": "Lat Pulldown",
            "purpose": "vertical-pull lat stimulus",
            "workingSets": 3,
            "exactTargets": [
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
            "loadPrescription": {
              "schemaVersion": "canonical_load_prescription_v1",
              "state": "calibration_required",
              "loadingMode": "rep_progression",
              "instruction": "calibrate a reproducible starting load",
              "reason": "load_evidence_unavailable",
              "evidenceStatus": "missing",
              "protocol": {
                "schemaVersion": "canonical_load_calibration_protocol_v1",
                "targetReps": 10,
                "workingSets": 3,
                "warmupAndRampExcludedFromWorkingVolume": true,
                "startingInstruction": "Before working sets, begin with the lightest load you can control confidently for the exact target and leave at least three good reps in reserve.",
                "safeAdjustment": "Use warm-up/ramp attempts to increase by one available equipment increment; stop increasing if technique, range or rep speed becomes inconsistent.",
                "successCriteria": "Use the first load that permits 10 controlled reps with stable technique and at least two good reps in reserve.",
                "laterWorkingSets": "Use that provisional load for the prescribed working sets; reduce by one increment if the stop rule triggers. Warm-up/ramp attempts do not count as working sets.",
                "evidenceRetention": {
                  "persistCompletedWorkingSetEvidence": true,
                  "reuseWhileFreshAndCompatible": true,
                  "recalibrateOnlyWhen": [
                    "missing",
                    "stale",
                    "incompatible"
                  ]
                }
              }
            },
            "restSeconds": 120,
            "directMuscles": [
              "lats"
            ],
            "meaningfulSecondaryMuscles": [
              "biceps"
            ],
            "fatigueClass": "moderate",
            "stimulusToFatigueRationale": "Stable direct stimulus with less systemic cost than the primary high-fatigue anchor.",
            "progression": "rep_progression",
            "stopRule": "change_target"
          },
          {
            "exerciseId": "ex-dorian-yates-row-machine",
            "exercise": "Dorian Yates Row Machine",
            "purpose": "upper-back work in a complementary supported row pattern",
            "workingSets": 2,
            "exactTargets": [
              10,
              10
            ],
            "exactTargetKinds": [
              "reps",
              "reps"
            ],
            "method": "straight_sets",
            "loadState": "calibration_required",
            "loadPrescription": {
              "schemaVersion": "canonical_load_prescription_v1",
              "state": "calibration_required",
              "loadingMode": "rep_progression",
              "instruction": "calibrate a reproducible starting load",
              "reason": "load_evidence_unavailable",
              "evidenceStatus": "missing",
              "protocol": {
                "schemaVersion": "canonical_load_calibration_protocol_v1",
                "targetReps": 10,
                "workingSets": 2,
                "warmupAndRampExcludedFromWorkingVolume": true,
                "startingInstruction": "Before working sets, begin with the lightest load you can control confidently for the exact target and leave at least three good reps in reserve.",
                "safeAdjustment": "Use warm-up/ramp attempts to increase by one available equipment increment; stop increasing if technique, range or rep speed becomes inconsistent.",
                "successCriteria": "Use the first load that permits 10 controlled reps with stable technique and at least two good reps in reserve.",
                "laterWorkingSets": "Use that provisional load for the prescribed working sets; reduce by one increment if the stop rule triggers. Warm-up/ramp attempts do not count as working sets.",
                "evidenceRetention": {
                  "persistCompletedWorkingSetEvidence": true,
                  "reuseWhileFreshAndCompatible": true,
                  "recalibrateOnlyWhen": [
                    "missing",
                    "stale",
                    "incompatible"
                  ]
                }
              }
            },
            "restSeconds": 120,
            "directMuscles": [
              "upper_back"
            ],
            "meaningfulSecondaryMuscles": [
              "biceps",
              "rear_delts"
            ],
            "fatigueClass": "moderate",
            "stimulusToFatigueRationale": "Stable direct stimulus with less systemic cost than the primary high-fatigue anchor.",
            "progression": "rep_progression",
            "stopRule": "change_target"
          },
          {
            "exerciseId": "ex-cable-rear-delt-fly",
            "exercise": "Cable Rear Delt Fly",
            "purpose": "rear-delt and scapular work",
            "workingSets": 4,
            "exactTargets": [
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
            "loadPrescription": {
              "schemaVersion": "canonical_load_prescription_v1",
              "state": "calibration_required",
              "loadingMode": "rep_progression",
              "instruction": "calibrate a reproducible starting load",
              "reason": "load_evidence_unavailable",
              "evidenceStatus": "missing",
              "protocol": {
                "schemaVersion": "canonical_load_calibration_protocol_v1",
                "targetReps": 15,
                "workingSets": 4,
                "warmupAndRampExcludedFromWorkingVolume": true,
                "startingInstruction": "Before working sets, begin with the lightest load you can control confidently for the exact target and leave at least three good reps in reserve.",
                "safeAdjustment": "Use warm-up/ramp attempts to increase by one available equipment increment; stop increasing if technique, range or rep speed becomes inconsistent.",
                "successCriteria": "Use the first load that permits 15 controlled reps with stable technique and at least two good reps in reserve.",
                "laterWorkingSets": "Use that provisional load for the prescribed working sets; reduce by one increment if the stop rule triggers. Warm-up/ramp attempts do not count as working sets.",
                "evidenceRetention": {
                  "persistCompletedWorkingSetEvidence": true,
                  "reuseWhileFreshAndCompatible": true,
                  "recalibrateOnlyWhen": [
                    "missing",
                    "stale",
                    "incompatible"
                  ]
                }
              }
            },
            "restSeconds": 75,
            "directMuscles": [
              "rear_delts"
            ],
            "meaningfulSecondaryMuscles": [
              "upper_back"
            ],
            "fatigueClass": "low",
            "stimulusToFatigueRationale": "Low-systemic-cost direct accessory work used only to meet an owned regional dose.",
            "progression": "rep_progression",
            "stopRule": "change_target"
          },
          {
            "exerciseId": "ex-bayesian-curl",
            "exercise": "Bayesian Curl",
            "purpose": "lengthened elbow-flexor work",
            "workingSets": 4,
            "exactTargets": [
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
            "loadPrescription": {
              "schemaVersion": "canonical_load_prescription_v1",
              "state": "calibration_required",
              "loadingMode": "rep_progression",
              "instruction": "calibrate a reproducible starting load",
              "reason": "load_evidence_unavailable",
              "evidenceStatus": "missing",
              "protocol": {
                "schemaVersion": "canonical_load_calibration_protocol_v1",
                "targetReps": 12,
                "workingSets": 4,
                "warmupAndRampExcludedFromWorkingVolume": true,
                "startingInstruction": "Before working sets, begin with the lightest load you can control confidently for the exact target and leave at least three good reps in reserve.",
                "safeAdjustment": "Use warm-up/ramp attempts to increase by one available equipment increment; stop increasing if technique, range or rep speed becomes inconsistent.",
                "successCriteria": "Use the first load that permits 12 controlled reps with stable technique and at least two good reps in reserve.",
                "laterWorkingSets": "Use that provisional load for the prescribed working sets; reduce by one increment if the stop rule triggers. Warm-up/ramp attempts do not count as working sets.",
                "evidenceRetention": {
                  "persistCompletedWorkingSetEvidence": true,
                  "reuseWhileFreshAndCompatible": true,
                  "recalibrateOnlyWhen": [
                    "missing",
                    "stale",
                    "incompatible"
                  ]
                }
              }
            },
            "restSeconds": 75,
            "directMuscles": [
              "biceps"
            ],
            "meaningfulSecondaryMuscles": [],
            "fatigueClass": "low",
            "stimulusToFatigueRationale": "Low-systemic-cost direct accessory work used only to meet an owned regional dose.",
            "progression": "rep_progression",
            "stopRule": "change_target"
          },
          {
            "exerciseId": "ex-lat-pulldown-machine",
            "exercise": "Lat Pulldown Machine",
            "purpose": "lat work in a complementary supported grip",
            "workingSets": 2,
            "exactTargets": [
              10,
              10
            ],
            "exactTargetKinds": [
              "reps",
              "reps"
            ],
            "method": "straight_sets",
            "loadState": "calibration_required",
            "loadPrescription": {
              "schemaVersion": "canonical_load_prescription_v1",
              "state": "calibration_required",
              "loadingMode": "rep_progression",
              "instruction": "calibrate a reproducible starting load",
              "reason": "load_evidence_unavailable",
              "evidenceStatus": "missing",
              "protocol": {
                "schemaVersion": "canonical_load_calibration_protocol_v1",
                "targetReps": 10,
                "workingSets": 2,
                "warmupAndRampExcludedFromWorkingVolume": true,
                "startingInstruction": "Before working sets, begin with the lightest load you can control confidently for the exact target and leave at least three good reps in reserve.",
                "safeAdjustment": "Use warm-up/ramp attempts to increase by one available equipment increment; stop increasing if technique, range or rep speed becomes inconsistent.",
                "successCriteria": "Use the first load that permits 10 controlled reps with stable technique and at least two good reps in reserve.",
                "laterWorkingSets": "Use that provisional load for the prescribed working sets; reduce by one increment if the stop rule triggers. Warm-up/ramp attempts do not count as working sets.",
                "evidenceRetention": {
                  "persistCompletedWorkingSetEvidence": true,
                  "reuseWhileFreshAndCompatible": true,
                  "recalibrateOnlyWhen": [
                    "missing",
                    "stale",
                    "incompatible"
                  ]
                }
              }
            },
            "restSeconds": 120,
            "directMuscles": [
              "lats"
            ],
            "meaningfulSecondaryMuscles": [
              "biceps"
            ],
            "fatigueClass": "moderate",
            "stimulusToFatigueRationale": "Stable direct stimulus with less systemic cost than the primary high-fatigue anchor.",
            "progression": "rep_progression",
            "stopRule": "change_target"
          }
        ],
        "workingSets": 18,
        "estimatedMinutes": 55,
        "durationBreakdown": {
          "generalWarmup": 240,
          "liftSpecificRamp": 420,
          "workingSetExecution": 720,
          "prescribedInterSetRest": 1500,
          "equipmentSetup": 180,
          "exerciseTransitions": 150,
          "unilateralOverhead": 0,
          "calibrationOverhead": 60,
          "methodOverhead": 0
        },
        "durationAssumptions": [
          "general_warmup_included",
          "lift_specific_ramps_included",
          "prescribed_or_role_owned_rest_included",
          "set_execution_and_unilateral_time_included",
          "equipment_setup_and_transitions_included",
          "calibration_and_method_overhead_included"
        ],
        "localFatigue": {
          "upper_back": 5,
          "lats": 5,
          "rear_delts": 4,
          "biceps": 4
        },
        "systemicFatigueUnits": 28,
        "meaningfulSecondarySets": {
          "biceps": 10,
          "rear_delts": 5,
          "upper_back": 4
        }
      },
      {
        "role": "Legs hypertrophy C",
        "calendarDayOffset": 2,
        "purpose": "Establish reproducible exercise, load and recovery baselines",
        "exercises": [
          {
            "exerciseId": "ex-hack-squat-machine",
            "exercise": "Hack Squat Machine",
            "purpose": "knee-dominant anchor",
            "workingSets": 4,
            "exactTargets": [
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
            "loadPrescription": {
              "schemaVersion": "canonical_load_prescription_v1",
              "state": "calibration_required",
              "loadingMode": "rep_progression",
              "instruction": "calibrate a reproducible starting load",
              "reason": "load_evidence_unavailable",
              "evidenceStatus": "missing",
              "protocol": {
                "schemaVersion": "canonical_load_calibration_protocol_v1",
                "targetReps": 12,
                "workingSets": 4,
                "warmupAndRampExcludedFromWorkingVolume": true,
                "startingInstruction": "Before working sets, begin with the lightest load you can control confidently for the exact target and leave at least three good reps in reserve.",
                "safeAdjustment": "Use warm-up/ramp attempts to increase by one available equipment increment; stop increasing if technique, range or rep speed becomes inconsistent.",
                "successCriteria": "Use the first load that permits 12 controlled reps with stable technique and at least two good reps in reserve.",
                "laterWorkingSets": "Use that provisional load for the prescribed working sets; reduce by one increment if the stop rule triggers. Warm-up/ramp attempts do not count as working sets.",
                "evidenceRetention": {
                  "persistCompletedWorkingSetEvidence": true,
                  "reuseWhileFreshAndCompatible": true,
                  "recalibrateOnlyWhen": [
                    "missing",
                    "stale",
                    "incompatible"
                  ]
                }
              }
            },
            "restSeconds": 120,
            "directMuscles": [
              "quadriceps"
            ],
            "meaningfulSecondaryMuscles": [
              "hip_extension"
            ],
            "fatigueClass": "moderate",
            "stimulusToFatigueRationale": "Stable direct stimulus with less systemic cost than the primary high-fatigue anchor.",
            "progression": "rep_progression",
            "stopRule": "change_target"
          },
          {
            "exerciseId": "ex-belt-squat",
            "exercise": "Belt Squat",
            "purpose": "complementary knee-dominant hypertrophy",
            "workingSets": 2,
            "exactTargets": [
              10,
              10
            ],
            "exactTargetKinds": [
              "reps",
              "reps"
            ],
            "method": "straight_sets",
            "loadState": "calibration_required",
            "loadPrescription": {
              "schemaVersion": "canonical_load_prescription_v1",
              "state": "calibration_required",
              "loadingMode": "rep_progression",
              "instruction": "calibrate a reproducible starting load",
              "reason": "load_evidence_unavailable",
              "evidenceStatus": "missing",
              "protocol": {
                "schemaVersion": "canonical_load_calibration_protocol_v1",
                "targetReps": 10,
                "workingSets": 2,
                "warmupAndRampExcludedFromWorkingVolume": true,
                "startingInstruction": "Before working sets, begin with the lightest load you can control confidently for the exact target and leave at least three good reps in reserve.",
                "safeAdjustment": "Use warm-up/ramp attempts to increase by one available equipment increment; stop increasing if technique, range or rep speed becomes inconsistent.",
                "successCriteria": "Use the first load that permits 10 controlled reps with stable technique and at least two good reps in reserve.",
                "laterWorkingSets": "Use that provisional load for the prescribed working sets; reduce by one increment if the stop rule triggers. Warm-up/ramp attempts do not count as working sets.",
                "evidenceRetention": {
                  "persistCompletedWorkingSetEvidence": true,
                  "reuseWhileFreshAndCompatible": true,
                  "recalibrateOnlyWhen": [
                    "missing",
                    "stale",
                    "incompatible"
                  ]
                }
              }
            },
            "restSeconds": 120,
            "directMuscles": [
              "quadriceps"
            ],
            "meaningfulSecondaryMuscles": [],
            "fatigueClass": "moderate",
            "stimulusToFatigueRationale": "Stable direct stimulus with less systemic cost than the primary high-fatigue anchor.",
            "progression": "rep_progression",
            "stopRule": "change_target"
          },
          {
            "exerciseId": "ex-stiff-leg-deadlift",
            "exercise": "Stiff-Leg Deadlift",
            "purpose": "hip-extension support",
            "workingSets": 3,
            "exactTargets": [
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
            "loadPrescription": {
              "schemaVersion": "canonical_load_prescription_v1",
              "state": "calibration_required",
              "loadingMode": "rep_progression",
              "instruction": "calibrate a reproducible starting load",
              "reason": "load_evidence_unavailable",
              "evidenceStatus": "missing",
              "protocol": {
                "schemaVersion": "canonical_load_calibration_protocol_v1",
                "targetReps": 10,
                "workingSets": 3,
                "warmupAndRampExcludedFromWorkingVolume": true,
                "startingInstruction": "Before working sets, begin with the lightest load you can control confidently for the exact target and leave at least three good reps in reserve.",
                "safeAdjustment": "Use warm-up/ramp attempts to increase by one available equipment increment; stop increasing if technique, range or rep speed becomes inconsistent.",
                "successCriteria": "Use the first load that permits 10 controlled reps with stable technique and at least two good reps in reserve.",
                "laterWorkingSets": "Use that provisional load for the prescribed working sets; reduce by one increment if the stop rule triggers. Warm-up/ramp attempts do not count as working sets.",
                "evidenceRetention": {
                  "persistCompletedWorkingSetEvidence": true,
                  "reuseWhileFreshAndCompatible": true,
                  "recalibrateOnlyWhen": [
                    "missing",
                    "stale",
                    "incompatible"
                  ]
                }
              }
            },
            "restSeconds": 120,
            "directMuscles": [
              "hip_extension"
            ],
            "meaningfulSecondaryMuscles": [
              "upper_back"
            ],
            "fatigueClass": "moderate",
            "stimulusToFatigueRationale": "Stable direct stimulus with less systemic cost than the primary high-fatigue anchor.",
            "progression": "rep_progression",
            "stopRule": "change_target"
          },
          {
            "exerciseId": "ex-kneeling-leg-curl",
            "exercise": "Kneeling Leg Curl",
            "purpose": "knee-flexion hamstring work",
            "workingSets": 4,
            "exactTargets": [
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
            "loadPrescription": {
              "schemaVersion": "canonical_load_prescription_v1",
              "state": "calibration_required",
              "loadingMode": "rep_progression",
              "instruction": "calibrate a reproducible starting load",
              "reason": "load_evidence_unavailable",
              "evidenceStatus": "missing",
              "protocol": {
                "schemaVersion": "canonical_load_calibration_protocol_v1",
                "targetReps": 12,
                "workingSets": 4,
                "warmupAndRampExcludedFromWorkingVolume": true,
                "startingInstruction": "Before working sets, begin with the lightest load you can control confidently for the exact target and leave at least three good reps in reserve.",
                "safeAdjustment": "Use warm-up/ramp attempts to increase by one available equipment increment; stop increasing if technique, range or rep speed becomes inconsistent.",
                "successCriteria": "Use the first load that permits 12 controlled reps with stable technique and at least two good reps in reserve.",
                "laterWorkingSets": "Use that provisional load for the prescribed working sets; reduce by one increment if the stop rule triggers. Warm-up/ramp attempts do not count as working sets.",
                "evidenceRetention": {
                  "persistCompletedWorkingSetEvidence": true,
                  "reuseWhileFreshAndCompatible": true,
                  "recalibrateOnlyWhen": [
                    "missing",
                    "stale",
                    "incompatible"
                  ]
                }
              }
            },
            "restSeconds": 75,
            "directMuscles": [
              "hamstrings_knee_flexion"
            ],
            "meaningfulSecondaryMuscles": [],
            "fatigueClass": "low",
            "stimulusToFatigueRationale": "Low-systemic-cost direct accessory work used only to meet an owned regional dose.",
            "progression": "rep_progression",
            "stopRule": "change_target"
          },
          {
            "exerciseId": "ex-hip-thrust-machine",
            "exercise": "Hip Thrust Machine",
            "purpose": "shortened hip-extension stimulus",
            "workingSets": 3,
            "exactTargets": [
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
            "loadPrescription": {
              "schemaVersion": "canonical_load_prescription_v1",
              "state": "calibration_required",
              "loadingMode": "rep_progression",
              "instruction": "calibrate a reproducible starting load",
              "reason": "load_evidence_unavailable",
              "evidenceStatus": "missing",
              "protocol": {
                "schemaVersion": "canonical_load_calibration_protocol_v1",
                "targetReps": 10,
                "workingSets": 3,
                "warmupAndRampExcludedFromWorkingVolume": true,
                "startingInstruction": "Before working sets, begin with the lightest load you can control confidently for the exact target and leave at least three good reps in reserve.",
                "safeAdjustment": "Use warm-up/ramp attempts to increase by one available equipment increment; stop increasing if technique, range or rep speed becomes inconsistent.",
                "successCriteria": "Use the first load that permits 10 controlled reps with stable technique and at least two good reps in reserve.",
                "laterWorkingSets": "Use that provisional load for the prescribed working sets; reduce by one increment if the stop rule triggers. Warm-up/ramp attempts do not count as working sets.",
                "evidenceRetention": {
                  "persistCompletedWorkingSetEvidence": true,
                  "reuseWhileFreshAndCompatible": true,
                  "recalibrateOnlyWhen": [
                    "missing",
                    "stale",
                    "incompatible"
                  ]
                }
              }
            },
            "restSeconds": 120,
            "directMuscles": [
              "hip_extension"
            ],
            "meaningfulSecondaryMuscles": [],
            "fatigueClass": "moderate",
            "stimulusToFatigueRationale": "Stable direct stimulus with less systemic cost than the primary high-fatigue anchor.",
            "progression": "rep_progression",
            "stopRule": "change_target"
          },
          {
            "exerciseId": "ex-donkey-calf-raise",
            "exercise": "Donkey Calf Raise",
            "purpose": "calf work",
            "workingSets": 4,
            "exactTargets": [
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
            "loadPrescription": {
              "schemaVersion": "canonical_load_prescription_v1",
              "state": "calibration_required",
              "loadingMode": "rep_progression",
              "instruction": "calibrate a reproducible starting load",
              "reason": "load_evidence_unavailable",
              "evidenceStatus": "missing",
              "protocol": {
                "schemaVersion": "canonical_load_calibration_protocol_v1",
                "targetReps": 15,
                "workingSets": 4,
                "warmupAndRampExcludedFromWorkingVolume": true,
                "startingInstruction": "Before working sets, begin with the lightest load you can control confidently for the exact target and leave at least three good reps in reserve.",
                "safeAdjustment": "Use warm-up/ramp attempts to increase by one available equipment increment; stop increasing if technique, range or rep speed becomes inconsistent.",
                "successCriteria": "Use the first load that permits 15 controlled reps with stable technique and at least two good reps in reserve.",
                "laterWorkingSets": "Use that provisional load for the prescribed working sets; reduce by one increment if the stop rule triggers. Warm-up/ramp attempts do not count as working sets.",
                "evidenceRetention": {
                  "persistCompletedWorkingSetEvidence": true,
                  "reuseWhileFreshAndCompatible": true,
                  "recalibrateOnlyWhen": [
                    "missing",
                    "stale",
                    "incompatible"
                  ]
                }
              }
            },
            "restSeconds": 75,
            "directMuscles": [
              "calves"
            ],
            "meaningfulSecondaryMuscles": [],
            "fatigueClass": "low",
            "stimulusToFatigueRationale": "Low-systemic-cost direct accessory work used only to meet an owned regional dose.",
            "progression": "rep_progression",
            "stopRule": "change_target"
          }
        ],
        "workingSets": 20,
        "estimatedMinutes": 65,
        "durationBreakdown": {
          "generalWarmup": 240,
          "liftSpecificRamp": 420,
          "workingSetExecution": 800,
          "prescribedInterSetRest": 1830,
          "equipmentSetup": 180,
          "exerciseTransitions": 150,
          "unilateralOverhead": 210,
          "calibrationOverhead": 60,
          "methodOverhead": 0
        },
        "durationAssumptions": [
          "general_warmup_included",
          "lift_specific_ramps_included",
          "prescribed_or_role_owned_rest_included",
          "set_execution_and_unilateral_time_included",
          "equipment_setup_and_transitions_included",
          "calibration_and_method_overhead_included"
        ],
        "localFatigue": {
          "quadriceps": 6,
          "hip_extension": 6,
          "hamstrings_knee_flexion": 4,
          "calves": 4
        },
        "systemicFatigueUnits": 32,
        "meaningfulSecondarySets": {
          "hip_extension": 4,
          "upper_back": 3
        }
      },
      {
        "role": "Push hypertrophy D",
        "calendarDayOffset": 4,
        "purpose": "Establish reproducible exercise, load and recovery baselines",
        "exercises": [
          {
            "exerciseId": "ex-incline-barbell-bench",
            "exercise": "Incline Barbell Bench",
            "purpose": "high-priority horizontal press",
            "workingSets": 3,
            "exactTargets": [
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
            "loadPrescription": {
              "schemaVersion": "canonical_load_prescription_v1",
              "state": "calibration_required",
              "loadingMode": "rep_progression",
              "instruction": "calibrate a reproducible starting load",
              "reason": "load_evidence_unavailable",
              "evidenceStatus": "missing",
              "protocol": {
                "schemaVersion": "canonical_load_calibration_protocol_v1",
                "targetReps": 8,
                "workingSets": 3,
                "warmupAndRampExcludedFromWorkingVolume": true,
                "startingInstruction": "Before working sets, begin with the lightest load you can control confidently for the exact target and leave at least three good reps in reserve.",
                "safeAdjustment": "Use warm-up/ramp attempts to increase by one available equipment increment; stop increasing if technique, range or rep speed becomes inconsistent.",
                "successCriteria": "Use the first load that permits 8 controlled reps with stable technique and at least two good reps in reserve.",
                "laterWorkingSets": "Use that provisional load for the prescribed working sets; reduce by one increment if the stop rule triggers. Warm-up/ramp attempts do not count as working sets.",
                "evidenceRetention": {
                  "persistCompletedWorkingSetEvidence": true,
                  "reuseWhileFreshAndCompatible": true,
                  "recalibrateOnlyWhen": [
                    "missing",
                    "stale",
                    "incompatible"
                  ]
                }
              }
            },
            "restSeconds": 150,
            "directMuscles": [
              "chest"
            ],
            "meaningfulSecondaryMuscles": [
              "triceps",
              "anterior_delts"
            ],
            "fatigueClass": "high",
            "stimulusToFatigueRationale": "Priority anchor with bounded exact sets, reps and rest; not repeated as redundant high-fatigue work.",
            "progression": "rep_progression",
            "stopRule": "change_target"
          },
          {
            "exerciseId": "ex-decline-plate-loaded-press",
            "exercise": "Decline Plate Loaded Press",
            "purpose": "chest work in a complementary press path",
            "workingSets": 2,
            "exactTargets": [
              10,
              10
            ],
            "exactTargetKinds": [
              "reps",
              "reps"
            ],
            "method": "straight_sets",
            "loadState": "calibration_required",
            "loadPrescription": {
              "schemaVersion": "canonical_load_prescription_v1",
              "state": "calibration_required",
              "loadingMode": "rep_progression",
              "instruction": "calibrate a reproducible starting load",
              "reason": "load_evidence_unavailable",
              "evidenceStatus": "missing",
              "protocol": {
                "schemaVersion": "canonical_load_calibration_protocol_v1",
                "targetReps": 10,
                "workingSets": 2,
                "warmupAndRampExcludedFromWorkingVolume": true,
                "startingInstruction": "Before working sets, begin with the lightest load you can control confidently for the exact target and leave at least three good reps in reserve.",
                "safeAdjustment": "Use warm-up/ramp attempts to increase by one available equipment increment; stop increasing if technique, range or rep speed becomes inconsistent.",
                "successCriteria": "Use the first load that permits 10 controlled reps with stable technique and at least two good reps in reserve.",
                "laterWorkingSets": "Use that provisional load for the prescribed working sets; reduce by one increment if the stop rule triggers. Warm-up/ramp attempts do not count as working sets.",
                "evidenceRetention": {
                  "persistCompletedWorkingSetEvidence": true,
                  "reuseWhileFreshAndCompatible": true,
                  "recalibrateOnlyWhen": [
                    "missing",
                    "stale",
                    "incompatible"
                  ]
                }
              }
            },
            "restSeconds": 120,
            "directMuscles": [
              "chest"
            ],
            "meaningfulSecondaryMuscles": [
              "triceps"
            ],
            "fatigueClass": "moderate",
            "stimulusToFatigueRationale": "Stable direct stimulus with less systemic cost than the primary high-fatigue anchor.",
            "progression": "rep_progression",
            "stopRule": "change_target"
          },
          {
            "exerciseId": "ex-plate-loaded-shoulder-press-machine",
            "exercise": "Plate Loaded Shoulder Press Machine",
            "purpose": "vertical pressing stimulus",
            "workingSets": 3,
            "exactTargets": [
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
            "loadPrescription": {
              "schemaVersion": "canonical_load_prescription_v1",
              "state": "calibration_required",
              "loadingMode": "rep_progression",
              "instruction": "calibrate a reproducible starting load",
              "reason": "load_evidence_unavailable",
              "evidenceStatus": "missing",
              "protocol": {
                "schemaVersion": "canonical_load_calibration_protocol_v1",
                "targetReps": 10,
                "workingSets": 3,
                "warmupAndRampExcludedFromWorkingVolume": true,
                "startingInstruction": "Before working sets, begin with the lightest load you can control confidently for the exact target and leave at least three good reps in reserve.",
                "safeAdjustment": "Use warm-up/ramp attempts to increase by one available equipment increment; stop increasing if technique, range or rep speed becomes inconsistent.",
                "successCriteria": "Use the first load that permits 10 controlled reps with stable technique and at least two good reps in reserve.",
                "laterWorkingSets": "Use that provisional load for the prescribed working sets; reduce by one increment if the stop rule triggers. Warm-up/ramp attempts do not count as working sets.",
                "evidenceRetention": {
                  "persistCompletedWorkingSetEvidence": true,
                  "reuseWhileFreshAndCompatible": true,
                  "recalibrateOnlyWhen": [
                    "missing",
                    "stale",
                    "incompatible"
                  ]
                }
              }
            },
            "restSeconds": 120,
            "directMuscles": [
              "anterior_delts"
            ],
            "meaningfulSecondaryMuscles": [
              "triceps"
            ],
            "fatigueClass": "moderate",
            "stimulusToFatigueRationale": "Stable direct stimulus with less systemic cost than the primary high-fatigue anchor.",
            "progression": "rep_progression",
            "stopRule": "change_target"
          },
          {
            "exerciseId": "ex-lateral-raise-plate-loaded",
            "exercise": "Lateral Raise Plate Loaded",
            "purpose": "lateral-delt stimulus",
            "workingSets": 3,
            "exactTargets": [
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
            "loadPrescription": {
              "schemaVersion": "canonical_load_prescription_v1",
              "state": "calibration_required",
              "loadingMode": "rep_progression",
              "instruction": "calibrate a reproducible starting load",
              "reason": "load_evidence_unavailable",
              "evidenceStatus": "missing",
              "protocol": {
                "schemaVersion": "canonical_load_calibration_protocol_v1",
                "targetReps": 15,
                "workingSets": 3,
                "warmupAndRampExcludedFromWorkingVolume": true,
                "startingInstruction": "Before working sets, begin with the lightest load you can control confidently for the exact target and leave at least three good reps in reserve.",
                "safeAdjustment": "Use warm-up/ramp attempts to increase by one available equipment increment; stop increasing if technique, range or rep speed becomes inconsistent.",
                "successCriteria": "Use the first load that permits 15 controlled reps with stable technique and at least two good reps in reserve.",
                "laterWorkingSets": "Use that provisional load for the prescribed working sets; reduce by one increment if the stop rule triggers. Warm-up/ramp attempts do not count as working sets.",
                "evidenceRetention": {
                  "persistCompletedWorkingSetEvidence": true,
                  "reuseWhileFreshAndCompatible": true,
                  "recalibrateOnlyWhen": [
                    "missing",
                    "stale",
                    "incompatible"
                  ]
                }
              }
            },
            "restSeconds": 75,
            "directMuscles": [
              "lateral_delts"
            ],
            "meaningfulSecondaryMuscles": [],
            "fatigueClass": "low",
            "stimulusToFatigueRationale": "Low-systemic-cost direct accessory work used only to meet an owned regional dose.",
            "progression": "rep_progression",
            "stopRule": "change_target"
          },
          {
            "exerciseId": "ex-ez-bar-pushdown",
            "exercise": "EZ-Bar Pushdown",
            "purpose": "lengthened elbow-extension work",
            "workingSets": 2,
            "exactTargets": [
              12,
              12
            ],
            "exactTargetKinds": [
              "reps",
              "reps"
            ],
            "method": "straight_sets",
            "loadState": "calibration_required",
            "loadPrescription": {
              "schemaVersion": "canonical_load_prescription_v1",
              "state": "calibration_required",
              "loadingMode": "rep_progression",
              "instruction": "calibrate a reproducible starting load",
              "reason": "load_evidence_unavailable",
              "evidenceStatus": "missing",
              "protocol": {
                "schemaVersion": "canonical_load_calibration_protocol_v1",
                "targetReps": 12,
                "workingSets": 2,
                "warmupAndRampExcludedFromWorkingVolume": true,
                "startingInstruction": "Before working sets, begin with the lightest load you can control confidently for the exact target and leave at least three good reps in reserve.",
                "safeAdjustment": "Use warm-up/ramp attempts to increase by one available equipment increment; stop increasing if technique, range or rep speed becomes inconsistent.",
                "successCriteria": "Use the first load that permits 12 controlled reps with stable technique and at least two good reps in reserve.",
                "laterWorkingSets": "Use that provisional load for the prescribed working sets; reduce by one increment if the stop rule triggers. Warm-up/ramp attempts do not count as working sets.",
                "evidenceRetention": {
                  "persistCompletedWorkingSetEvidence": true,
                  "reuseWhileFreshAndCompatible": true,
                  "recalibrateOnlyWhen": [
                    "missing",
                    "stale",
                    "incompatible"
                  ]
                }
              }
            },
            "restSeconds": 75,
            "directMuscles": [
              "triceps"
            ],
            "meaningfulSecondaryMuscles": [],
            "fatigueClass": "low",
            "stimulusToFatigueRationale": "Low-systemic-cost direct accessory work used only to meet an owned regional dose.",
            "progression": "rep_progression",
            "stopRule": "change_target"
          }
        ],
        "workingSets": 13,
        "estimatedMinutes": 42,
        "durationBreakdown": {
          "generalWarmup": 240,
          "liftSpecificRamp": 360,
          "workingSetExecution": 520,
          "prescribedInterSetRest": 1080,
          "equipmentSetup": 150,
          "exerciseTransitions": 120,
          "unilateralOverhead": 0,
          "calibrationOverhead": 50,
          "methodOverhead": 0
        },
        "durationAssumptions": [
          "general_warmup_included",
          "lift_specific_ramps_included",
          "prescribed_or_role_owned_rest_included",
          "set_execution_and_unilateral_time_included",
          "equipment_setup_and_transitions_included",
          "calibration_and_method_overhead_included"
        ],
        "localFatigue": {
          "chest": 5,
          "anterior_delts": 3,
          "lateral_delts": 3,
          "triceps": 2
        },
        "systemicFatigueUnits": 24,
        "meaningfulSecondarySets": {
          "triceps": 8,
          "anterior_delts": 3
        }
      },
      {
        "role": "Pull hypertrophy E",
        "calendarDayOffset": 5,
        "purpose": "Establish reproducible exercise, load and recovery baselines",
        "exercises": [
          {
            "exerciseId": "ex-high-row-plate-loaded",
            "exercise": "High Row Plate Loaded",
            "purpose": "supported horizontal-pull anchor",
            "workingSets": 3,
            "exactTargets": [
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
            "loadPrescription": {
              "schemaVersion": "canonical_load_prescription_v1",
              "state": "calibration_required",
              "loadingMode": "rep_progression",
              "instruction": "calibrate a reproducible starting load",
              "reason": "load_evidence_unavailable",
              "evidenceStatus": "missing",
              "protocol": {
                "schemaVersion": "canonical_load_calibration_protocol_v1",
                "targetReps": 12,
                "workingSets": 3,
                "warmupAndRampExcludedFromWorkingVolume": true,
                "startingInstruction": "Before working sets, begin with the lightest load you can control confidently for the exact target and leave at least three good reps in reserve.",
                "safeAdjustment": "Use warm-up/ramp attempts to increase by one available equipment increment; stop increasing if technique, range or rep speed becomes inconsistent.",
                "successCriteria": "Use the first load that permits 12 controlled reps with stable technique and at least two good reps in reserve.",
                "laterWorkingSets": "Use that provisional load for the prescribed working sets; reduce by one increment if the stop rule triggers. Warm-up/ramp attempts do not count as working sets.",
                "evidenceRetention": {
                  "persistCompletedWorkingSetEvidence": true,
                  "reuseWhileFreshAndCompatible": true,
                  "recalibrateOnlyWhen": [
                    "missing",
                    "stale",
                    "incompatible"
                  ]
                }
              }
            },
            "restSeconds": 120,
            "directMuscles": [
              "upper_back"
            ],
            "meaningfulSecondaryMuscles": [
              "biceps",
              "rear_delts"
            ],
            "fatigueClass": "moderate",
            "stimulusToFatigueRationale": "Stable direct stimulus with less systemic cost than the primary high-fatigue anchor.",
            "progression": "rep_progression",
            "stopRule": "change_target"
          },
          {
            "exerciseId": "ex-lat-pulldown-narrow",
            "exercise": "Lat Pulldown Narrow",
            "purpose": "vertical-pull lat stimulus",
            "workingSets": 3,
            "exactTargets": [
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
            "loadPrescription": {
              "schemaVersion": "canonical_load_prescription_v1",
              "state": "calibration_required",
              "loadingMode": "rep_progression",
              "instruction": "calibrate a reproducible starting load",
              "reason": "load_evidence_unavailable",
              "evidenceStatus": "missing",
              "protocol": {
                "schemaVersion": "canonical_load_calibration_protocol_v1",
                "targetReps": 10,
                "workingSets": 3,
                "warmupAndRampExcludedFromWorkingVolume": true,
                "startingInstruction": "Before working sets, begin with the lightest load you can control confidently for the exact target and leave at least three good reps in reserve.",
                "safeAdjustment": "Use warm-up/ramp attempts to increase by one available equipment increment; stop increasing if technique, range or rep speed becomes inconsistent.",
                "successCriteria": "Use the first load that permits 10 controlled reps with stable technique and at least two good reps in reserve.",
                "laterWorkingSets": "Use that provisional load for the prescribed working sets; reduce by one increment if the stop rule triggers. Warm-up/ramp attempts do not count as working sets.",
                "evidenceRetention": {
                  "persistCompletedWorkingSetEvidence": true,
                  "reuseWhileFreshAndCompatible": true,
                  "recalibrateOnlyWhen": [
                    "missing",
                    "stale",
                    "incompatible"
                  ]
                }
              }
            },
            "restSeconds": 120,
            "directMuscles": [
              "lats"
            ],
            "meaningfulSecondaryMuscles": [
              "biceps"
            ],
            "fatigueClass": "moderate",
            "stimulusToFatigueRationale": "Stable direct stimulus with less systemic cost than the primary high-fatigue anchor.",
            "progression": "rep_progression",
            "stopRule": "change_target"
          },
          {
            "exerciseId": "ex-low-row-plate-loaded",
            "exercise": "Low Row Plate Loaded",
            "purpose": "upper-back work in a complementary supported row pattern",
            "workingSets": 2,
            "exactTargets": [
              10,
              10
            ],
            "exactTargetKinds": [
              "reps",
              "reps"
            ],
            "method": "straight_sets",
            "loadState": "calibration_required",
            "loadPrescription": {
              "schemaVersion": "canonical_load_prescription_v1",
              "state": "calibration_required",
              "loadingMode": "rep_progression",
              "instruction": "calibrate a reproducible starting load",
              "reason": "load_evidence_unavailable",
              "evidenceStatus": "missing",
              "protocol": {
                "schemaVersion": "canonical_load_calibration_protocol_v1",
                "targetReps": 10,
                "workingSets": 2,
                "warmupAndRampExcludedFromWorkingVolume": true,
                "startingInstruction": "Before working sets, begin with the lightest load you can control confidently for the exact target and leave at least three good reps in reserve.",
                "safeAdjustment": "Use warm-up/ramp attempts to increase by one available equipment increment; stop increasing if technique, range or rep speed becomes inconsistent.",
                "successCriteria": "Use the first load that permits 10 controlled reps with stable technique and at least two good reps in reserve.",
                "laterWorkingSets": "Use that provisional load for the prescribed working sets; reduce by one increment if the stop rule triggers. Warm-up/ramp attempts do not count as working sets.",
                "evidenceRetention": {
                  "persistCompletedWorkingSetEvidence": true,
                  "reuseWhileFreshAndCompatible": true,
                  "recalibrateOnlyWhen": [
                    "missing",
                    "stale",
                    "incompatible"
                  ]
                }
              }
            },
            "restSeconds": 120,
            "directMuscles": [
              "upper_back"
            ],
            "meaningfulSecondaryMuscles": [
              "biceps"
            ],
            "fatigueClass": "moderate",
            "stimulusToFatigueRationale": "Stable direct stimulus with less systemic cost than the primary high-fatigue anchor.",
            "progression": "rep_progression",
            "stopRule": "change_target"
          },
          {
            "exerciseId": "ex-rear-delt-machine",
            "exercise": "Rear Delt Machine",
            "purpose": "rear-delt and scapular work",
            "workingSets": 3,
            "exactTargets": [
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
            "loadPrescription": {
              "schemaVersion": "canonical_load_prescription_v1",
              "state": "calibration_required",
              "loadingMode": "rep_progression",
              "instruction": "calibrate a reproducible starting load",
              "reason": "load_evidence_unavailable",
              "evidenceStatus": "missing",
              "protocol": {
                "schemaVersion": "canonical_load_calibration_protocol_v1",
                "targetReps": 15,
                "workingSets": 3,
                "warmupAndRampExcludedFromWorkingVolume": true,
                "startingInstruction": "Before working sets, begin with the lightest load you can control confidently for the exact target and leave at least three good reps in reserve.",
                "safeAdjustment": "Use warm-up/ramp attempts to increase by one available equipment increment; stop increasing if technique, range or rep speed becomes inconsistent.",
                "successCriteria": "Use the first load that permits 15 controlled reps with stable technique and at least two good reps in reserve.",
                "laterWorkingSets": "Use that provisional load for the prescribed working sets; reduce by one increment if the stop rule triggers. Warm-up/ramp attempts do not count as working sets.",
                "evidenceRetention": {
                  "persistCompletedWorkingSetEvidence": true,
                  "reuseWhileFreshAndCompatible": true,
                  "recalibrateOnlyWhen": [
                    "missing",
                    "stale",
                    "incompatible"
                  ]
                }
              }
            },
            "restSeconds": 75,
            "directMuscles": [
              "rear_delts"
            ],
            "meaningfulSecondaryMuscles": [
              "upper_back"
            ],
            "fatigueClass": "low",
            "stimulusToFatigueRationale": "Low-systemic-cost direct accessory work used only to meet an owned regional dose.",
            "progression": "rep_progression",
            "stopRule": "change_target"
          },
          {
            "exerciseId": "ex-cable-curl",
            "exercise": "Cable Curl",
            "purpose": "lengthened elbow-flexor work",
            "workingSets": 3,
            "exactTargets": [
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
            "loadPrescription": {
              "schemaVersion": "canonical_load_prescription_v1",
              "state": "calibration_required",
              "loadingMode": "rep_progression",
              "instruction": "calibrate a reproducible starting load",
              "reason": "load_evidence_unavailable",
              "evidenceStatus": "missing",
              "protocol": {
                "schemaVersion": "canonical_load_calibration_protocol_v1",
                "targetReps": 12,
                "workingSets": 3,
                "warmupAndRampExcludedFromWorkingVolume": true,
                "startingInstruction": "Before working sets, begin with the lightest load you can control confidently for the exact target and leave at least three good reps in reserve.",
                "safeAdjustment": "Use warm-up/ramp attempts to increase by one available equipment increment; stop increasing if technique, range or rep speed becomes inconsistent.",
                "successCriteria": "Use the first load that permits 12 controlled reps with stable technique and at least two good reps in reserve.",
                "laterWorkingSets": "Use that provisional load for the prescribed working sets; reduce by one increment if the stop rule triggers. Warm-up/ramp attempts do not count as working sets.",
                "evidenceRetention": {
                  "persistCompletedWorkingSetEvidence": true,
                  "reuseWhileFreshAndCompatible": true,
                  "recalibrateOnlyWhen": [
                    "missing",
                    "stale",
                    "incompatible"
                  ]
                }
              }
            },
            "restSeconds": 75,
            "directMuscles": [
              "biceps"
            ],
            "meaningfulSecondaryMuscles": [],
            "fatigueClass": "low",
            "stimulusToFatigueRationale": "Low-systemic-cost direct accessory work used only to meet an owned regional dose.",
            "progression": "rep_progression",
            "stopRule": "change_target"
          },
          {
            "exerciseId": "ex-lat-pulldown-neutral-close",
            "exercise": "Lat Pulldown Neutral Close",
            "purpose": "lat work in a complementary supported grip",
            "workingSets": 2,
            "exactTargets": [
              10,
              10
            ],
            "exactTargetKinds": [
              "reps",
              "reps"
            ],
            "method": "straight_sets",
            "loadState": "calibration_required",
            "loadPrescription": {
              "schemaVersion": "canonical_load_prescription_v1",
              "state": "calibration_required",
              "loadingMode": "rep_progression",
              "instruction": "calibrate a reproducible starting load",
              "reason": "load_evidence_unavailable",
              "evidenceStatus": "missing",
              "protocol": {
                "schemaVersion": "canonical_load_calibration_protocol_v1",
                "targetReps": 10,
                "workingSets": 2,
                "warmupAndRampExcludedFromWorkingVolume": true,
                "startingInstruction": "Before working sets, begin with the lightest load you can control confidently for the exact target and leave at least three good reps in reserve.",
                "safeAdjustment": "Use warm-up/ramp attempts to increase by one available equipment increment; stop increasing if technique, range or rep speed becomes inconsistent.",
                "successCriteria": "Use the first load that permits 10 controlled reps with stable technique and at least two good reps in reserve.",
                "laterWorkingSets": "Use that provisional load for the prescribed working sets; reduce by one increment if the stop rule triggers. Warm-up/ramp attempts do not count as working sets.",
                "evidenceRetention": {
                  "persistCompletedWorkingSetEvidence": true,
                  "reuseWhileFreshAndCompatible": true,
                  "recalibrateOnlyWhen": [
                    "missing",
                    "stale",
                    "incompatible"
                  ]
                }
              }
            },
            "restSeconds": 120,
            "directMuscles": [
              "lats"
            ],
            "meaningfulSecondaryMuscles": [
              "biceps"
            ],
            "fatigueClass": "moderate",
            "stimulusToFatigueRationale": "Stable direct stimulus with less systemic cost than the primary high-fatigue anchor.",
            "progression": "rep_progression",
            "stopRule": "change_target"
          }
        ],
        "workingSets": 16,
        "estimatedMinutes": 51,
        "durationBreakdown": {
          "generalWarmup": 240,
          "liftSpecificRamp": 420,
          "workingSetExecution": 640,
          "prescribedInterSetRest": 1320,
          "equipmentSetup": 180,
          "exerciseTransitions": 150,
          "unilateralOverhead": 0,
          "calibrationOverhead": 60,
          "methodOverhead": 0
        },
        "durationAssumptions": [
          "general_warmup_included",
          "lift_specific_ramps_included",
          "prescribed_or_role_owned_rest_included",
          "set_execution_and_unilateral_time_included",
          "equipment_setup_and_transitions_included",
          "calibration_and_method_overhead_included"
        ],
        "localFatigue": {
          "upper_back": 5,
          "lats": 5,
          "rear_delts": 3,
          "biceps": 3
        },
        "systemicFatigueUnits": 26,
        "meaningfulSecondarySets": {
          "biceps": 10,
          "rear_delts": 3,
          "upper_back": 3
        }
      },
      {
        "role": "Legs hypertrophy F",
        "calendarDayOffset": 0,
        "purpose": "Establish reproducible exercise, load and recovery baselines",
        "exercises": [
          {
            "exerciseId": "ex-stiff-leg-deadlift",
            "exercise": "Stiff-Leg Deadlift",
            "purpose": "moderate-fatigue hinge-led posterior-chain anchor",
            "workingSets": 2,
            "exactTargets": [
              12,
              12
            ],
            "exactTargetKinds": [
              "reps",
              "reps"
            ],
            "method": "straight_sets",
            "loadState": "calibration_required",
            "loadPrescription": {
              "schemaVersion": "canonical_load_prescription_v1",
              "state": "calibration_required",
              "loadingMode": "rep_progression",
              "instruction": "calibrate a reproducible starting load",
              "reason": "load_evidence_unavailable",
              "evidenceStatus": "missing",
              "protocol": {
                "schemaVersion": "canonical_load_calibration_protocol_v1",
                "targetReps": 12,
                "workingSets": 2,
                "warmupAndRampExcludedFromWorkingVolume": true,
                "startingInstruction": "Before working sets, begin with the lightest load you can control confidently for the exact target and leave at least three good reps in reserve.",
                "safeAdjustment": "Use warm-up/ramp attempts to increase by one available equipment increment; stop increasing if technique, range or rep speed becomes inconsistent.",
                "successCriteria": "Use the first load that permits 12 controlled reps with stable technique and at least two good reps in reserve.",
                "laterWorkingSets": "Use that provisional load for the prescribed working sets; reduce by one increment if the stop rule triggers. Warm-up/ramp attempts do not count as working sets.",
                "evidenceRetention": {
                  "persistCompletedWorkingSetEvidence": true,
                  "reuseWhileFreshAndCompatible": true,
                  "recalibrateOnlyWhen": [
                    "missing",
                    "stale",
                    "incompatible"
                  ]
                }
              }
            },
            "restSeconds": 120,
            "directMuscles": [
              "hip_extension"
            ],
            "meaningfulSecondaryMuscles": [
              "upper_back"
            ],
            "fatigueClass": "moderate",
            "stimulusToFatigueRationale": "Stable direct stimulus with less systemic cost than the primary high-fatigue anchor.",
            "progression": "rep_progression",
            "stopRule": "change_target"
          },
          {
            "exerciseId": "ex-walking-lunge",
            "exercise": "Walking Lunge",
            "purpose": "single-leg knee-dominant hypertrophy",
            "workingSets": 2,
            "exactTargets": [
              10,
              10
            ],
            "exactTargetKinds": [
              "reps",
              "reps"
            ],
            "method": "straight_sets",
            "loadState": "calibration_required",
            "loadPrescription": {
              "schemaVersion": "canonical_load_prescription_v1",
              "state": "calibration_required",
              "loadingMode": "rep_progression",
              "instruction": "calibrate a reproducible starting load",
              "reason": "load_evidence_unavailable",
              "evidenceStatus": "missing",
              "protocol": {
                "schemaVersion": "canonical_load_calibration_protocol_v1",
                "targetReps": 10,
                "workingSets": 2,
                "warmupAndRampExcludedFromWorkingVolume": true,
                "startingInstruction": "Before working sets, begin with the lightest load you can control confidently for the exact target and leave at least three good reps in reserve.",
                "safeAdjustment": "Use warm-up/ramp attempts to increase by one available equipment increment; stop increasing if technique, range or rep speed becomes inconsistent.",
                "successCriteria": "Use the first load that permits 10 controlled reps with stable technique and at least two good reps in reserve.",
                "laterWorkingSets": "Use that provisional load for the prescribed working sets; reduce by one increment if the stop rule triggers. Warm-up/ramp attempts do not count as working sets.",
                "evidenceRetention": {
                  "persistCompletedWorkingSetEvidence": true,
                  "reuseWhileFreshAndCompatible": true,
                  "recalibrateOnlyWhen": [
                    "missing",
                    "stale",
                    "incompatible"
                  ]
                }
              }
            },
            "restSeconds": 120,
            "directMuscles": [
              "quadriceps"
            ],
            "meaningfulSecondaryMuscles": [
              "hip_extension"
            ],
            "fatigueClass": "moderate",
            "stimulusToFatigueRationale": "Stable direct stimulus with less systemic cost than the primary high-fatigue anchor.",
            "progression": "rep_progression",
            "stopRule": "change_target"
          },
          {
            "exerciseId": "ex-kneeling-leg-curl",
            "exercise": "Kneeling Leg Curl",
            "purpose": "knee-flexion hamstring work",
            "workingSets": 3,
            "exactTargets": [
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
            "loadPrescription": {
              "schemaVersion": "canonical_load_prescription_v1",
              "state": "calibration_required",
              "loadingMode": "rep_progression",
              "instruction": "calibrate a reproducible starting load",
              "reason": "load_evidence_unavailable",
              "evidenceStatus": "missing",
              "protocol": {
                "schemaVersion": "canonical_load_calibration_protocol_v1",
                "targetReps": 12,
                "workingSets": 3,
                "warmupAndRampExcludedFromWorkingVolume": true,
                "startingInstruction": "Before working sets, begin with the lightest load you can control confidently for the exact target and leave at least three good reps in reserve.",
                "safeAdjustment": "Use warm-up/ramp attempts to increase by one available equipment increment; stop increasing if technique, range or rep speed becomes inconsistent.",
                "successCriteria": "Use the first load that permits 12 controlled reps with stable technique and at least two good reps in reserve.",
                "laterWorkingSets": "Use that provisional load for the prescribed working sets; reduce by one increment if the stop rule triggers. Warm-up/ramp attempts do not count as working sets.",
                "evidenceRetention": {
                  "persistCompletedWorkingSetEvidence": true,
                  "reuseWhileFreshAndCompatible": true,
                  "recalibrateOnlyWhen": [
                    "missing",
                    "stale",
                    "incompatible"
                  ]
                }
              }
            },
            "restSeconds": 75,
            "directMuscles": [
              "hamstrings_knee_flexion"
            ],
            "meaningfulSecondaryMuscles": [],
            "fatigueClass": "low",
            "stimulusToFatigueRationale": "Low-systemic-cost direct accessory work used only to meet an owned regional dose.",
            "progression": "rep_progression",
            "stopRule": "change_target"
          },
          {
            "exerciseId": "ex-leg-extension",
            "exercise": "Leg Extension",
            "purpose": "low-systemic-cost quadriceps work",
            "workingSets": 2,
            "exactTargets": [
              12,
              12
            ],
            "exactTargetKinds": [
              "reps",
              "reps"
            ],
            "method": "straight_sets",
            "loadState": "calibration_required",
            "loadPrescription": {
              "schemaVersion": "canonical_load_prescription_v1",
              "state": "calibration_required",
              "loadingMode": "rep_progression",
              "instruction": "calibrate a reproducible starting load",
              "reason": "load_evidence_unavailable",
              "evidenceStatus": "missing",
              "protocol": {
                "schemaVersion": "canonical_load_calibration_protocol_v1",
                "targetReps": 12,
                "workingSets": 2,
                "warmupAndRampExcludedFromWorkingVolume": true,
                "startingInstruction": "Before working sets, begin with the lightest load you can control confidently for the exact target and leave at least three good reps in reserve.",
                "safeAdjustment": "Use warm-up/ramp attempts to increase by one available equipment increment; stop increasing if technique, range or rep speed becomes inconsistent.",
                "successCriteria": "Use the first load that permits 12 controlled reps with stable technique and at least two good reps in reserve.",
                "laterWorkingSets": "Use that provisional load for the prescribed working sets; reduce by one increment if the stop rule triggers. Warm-up/ramp attempts do not count as working sets.",
                "evidenceRetention": {
                  "persistCompletedWorkingSetEvidence": true,
                  "reuseWhileFreshAndCompatible": true,
                  "recalibrateOnlyWhen": [
                    "missing",
                    "stale",
                    "incompatible"
                  ]
                }
              }
            },
            "restSeconds": 75,
            "directMuscles": [
              "quadriceps"
            ],
            "meaningfulSecondaryMuscles": [],
            "fatigueClass": "low",
            "stimulusToFatigueRationale": "Low-systemic-cost direct accessory work used only to meet an owned regional dose.",
            "progression": "rep_progression",
            "stopRule": "change_target"
          },
          {
            "exerciseId": "ex-hip-thrust-machine",
            "exercise": "Hip Thrust Machine",
            "purpose": "shortened hip-extension stimulus",
            "workingSets": 2,
            "exactTargets": [
              10,
              10
            ],
            "exactTargetKinds": [
              "reps",
              "reps"
            ],
            "method": "straight_sets",
            "loadState": "calibration_required",
            "loadPrescription": {
              "schemaVersion": "canonical_load_prescription_v1",
              "state": "calibration_required",
              "loadingMode": "rep_progression",
              "instruction": "calibrate a reproducible starting load",
              "reason": "load_evidence_unavailable",
              "evidenceStatus": "missing",
              "protocol": {
                "schemaVersion": "canonical_load_calibration_protocol_v1",
                "targetReps": 10,
                "workingSets": 2,
                "warmupAndRampExcludedFromWorkingVolume": true,
                "startingInstruction": "Before working sets, begin with the lightest load you can control confidently for the exact target and leave at least three good reps in reserve.",
                "safeAdjustment": "Use warm-up/ramp attempts to increase by one available equipment increment; stop increasing if technique, range or rep speed becomes inconsistent.",
                "successCriteria": "Use the first load that permits 10 controlled reps with stable technique and at least two good reps in reserve.",
                "laterWorkingSets": "Use that provisional load for the prescribed working sets; reduce by one increment if the stop rule triggers. Warm-up/ramp attempts do not count as working sets.",
                "evidenceRetention": {
                  "persistCompletedWorkingSetEvidence": true,
                  "reuseWhileFreshAndCompatible": true,
                  "recalibrateOnlyWhen": [
                    "missing",
                    "stale",
                    "incompatible"
                  ]
                }
              }
            },
            "restSeconds": 120,
            "directMuscles": [
              "hip_extension"
            ],
            "meaningfulSecondaryMuscles": [],
            "fatigueClass": "moderate",
            "stimulusToFatigueRationale": "Stable direct stimulus with less systemic cost than the primary high-fatigue anchor.",
            "progression": "rep_progression",
            "stopRule": "change_target"
          },
          {
            "exerciseId": "ex-donkey-calf-raise",
            "exercise": "Donkey Calf Raise",
            "purpose": "calf work",
            "workingSets": 3,
            "exactTargets": [
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
            "loadPrescription": {
              "schemaVersion": "canonical_load_prescription_v1",
              "state": "calibration_required",
              "loadingMode": "rep_progression",
              "instruction": "calibrate a reproducible starting load",
              "reason": "load_evidence_unavailable",
              "evidenceStatus": "missing",
              "protocol": {
                "schemaVersion": "canonical_load_calibration_protocol_v1",
                "targetReps": 15,
                "workingSets": 3,
                "warmupAndRampExcludedFromWorkingVolume": true,
                "startingInstruction": "Before working sets, begin with the lightest load you can control confidently for the exact target and leave at least three good reps in reserve.",
                "safeAdjustment": "Use warm-up/ramp attempts to increase by one available equipment increment; stop increasing if technique, range or rep speed becomes inconsistent.",
                "successCriteria": "Use the first load that permits 15 controlled reps with stable technique and at least two good reps in reserve.",
                "laterWorkingSets": "Use that provisional load for the prescribed working sets; reduce by one increment if the stop rule triggers. Warm-up/ramp attempts do not count as working sets.",
                "evidenceRetention": {
                  "persistCompletedWorkingSetEvidence": true,
                  "reuseWhileFreshAndCompatible": true,
                  "recalibrateOnlyWhen": [
                    "missing",
                    "stale",
                    "incompatible"
                  ]
                }
              }
            },
            "restSeconds": 75,
            "directMuscles": [
              "calves"
            ],
            "meaningfulSecondaryMuscles": [],
            "fatigueClass": "low",
            "stimulusToFatigueRationale": "Low-systemic-cost direct accessory work used only to meet an owned regional dose.",
            "progression": "rep_progression",
            "stopRule": "change_target"
          },
          {
            "exerciseId": "ex-cable-crunch",
            "exercise": "Cable Crunch",
            "purpose": "trunk work",
            "workingSets": 2,
            "exactTargets": [
              12,
              12
            ],
            "exactTargetKinds": [
              "reps",
              "reps"
            ],
            "method": "straight_sets",
            "loadState": "calibration_required",
            "loadPrescription": {
              "schemaVersion": "canonical_load_prescription_v1",
              "state": "calibration_required",
              "loadingMode": "rep_progression",
              "instruction": "calibrate a reproducible starting load",
              "reason": "load_evidence_unavailable",
              "evidenceStatus": "missing",
              "protocol": {
                "schemaVersion": "canonical_load_calibration_protocol_v1",
                "targetReps": 12,
                "workingSets": 2,
                "warmupAndRampExcludedFromWorkingVolume": true,
                "startingInstruction": "Before working sets, begin with the lightest load you can control confidently for the exact target and leave at least three good reps in reserve.",
                "safeAdjustment": "Use warm-up/ramp attempts to increase by one available equipment increment; stop increasing if technique, range or rep speed becomes inconsistent.",
                "successCriteria": "Use the first load that permits 12 controlled reps with stable technique and at least two good reps in reserve.",
                "laterWorkingSets": "Use that provisional load for the prescribed working sets; reduce by one increment if the stop rule triggers. Warm-up/ramp attempts do not count as working sets.",
                "evidenceRetention": {
                  "persistCompletedWorkingSetEvidence": true,
                  "reuseWhileFreshAndCompatible": true,
                  "recalibrateOnlyWhen": [
                    "missing",
                    "stale",
                    "incompatible"
                  ]
                }
              }
            },
            "restSeconds": 120,
            "directMuscles": [
              "core"
            ],
            "meaningfulSecondaryMuscles": [],
            "fatigueClass": "moderate",
            "stimulusToFatigueRationale": "Stable direct stimulus with less systemic cost than the primary high-fatigue anchor.",
            "progression": "rep_progression",
            "stopRule": "change_target"
          }
        ],
        "workingSets": 16,
        "estimatedMinutes": 48,
        "durationBreakdown": {
          "generalWarmup": 240,
          "liftSpecificRamp": 420,
          "workingSetExecution": 640,
          "prescribedInterSetRest": 1020,
          "equipmentSetup": 210,
          "exerciseTransitions": 180,
          "unilateralOverhead": 70,
          "calibrationOverhead": 70,
          "methodOverhead": 0
        },
        "durationAssumptions": [
          "general_warmup_included",
          "lift_specific_ramps_included",
          "prescribed_or_role_owned_rest_included",
          "set_execution_and_unilateral_time_included",
          "equipment_setup_and_transitions_included",
          "calibration_and_method_overhead_included"
        ],
        "localFatigue": {
          "hip_extension": 4,
          "quadriceps": 4,
          "hamstrings_knee_flexion": 3,
          "calves": 3,
          "core": 2
        },
        "systemicFatigueUnits": 24,
        "meaningfulSecondarySets": {
          "upper_back": 2,
          "hip_extension": 2
        }
      }
    ],
    "totalWorkingSets": 101,
    "estimatedMinutes": 315,
    "directSets": {
      "chest": 10,
      "anterior_delts": 7,
      "lateral_delts": 7,
      "triceps": 7,
      "upper_back": 10,
      "lats": 10,
      "rear_delts": 7,
      "biceps": 7,
      "quadriceps": 10,
      "hip_extension": 10,
      "hamstrings_knee_flexion": 7,
      "calves": 7,
      "core": 2
    },
    "meaningfulSecondarySets": {
      "triceps": 17,
      "anterior_delts": 8,
      "biceps": 20,
      "rear_delts": 8,
      "upper_back": 12,
      "hip_extension": 6
    },
    "frequency": {
      "chest": 2,
      "lats": 2,
      "upper_back": 2,
      "anterior_delts": 2,
      "lateral_delts": 2,
      "rear_delts": 2,
      "triceps": 2,
      "biceps": 2,
      "quadriceps": 2,
      "hamstrings_knee_flexion": 2,
      "hip_extension": 2,
      "calves": 2,
      "core": 1
    },
    "systemicFatigueUnits": 164,
    "recoverySpacing": {
      "chest": {
        "rotationExposures": 2,
        "sessionGaps": [
          3,
          3
        ],
        "calendarDayGaps": [
          4,
          4
        ]
      },
      "lats": {
        "rotationExposures": 2,
        "sessionGaps": [
          3,
          3
        ],
        "calendarDayGaps": [
          4,
          4
        ]
      },
      "upper_back": {
        "rotationExposures": 2,
        "sessionGaps": [
          3,
          3
        ],
        "calendarDayGaps": [
          4,
          4
        ]
      },
      "anterior_delts": {
        "rotationExposures": 2,
        "sessionGaps": [
          3,
          3
        ],
        "calendarDayGaps": [
          4,
          4
        ]
      },
      "lateral_delts": {
        "rotationExposures": 2,
        "sessionGaps": [
          3,
          3
        ],
        "calendarDayGaps": [
          4,
          4
        ]
      },
      "rear_delts": {
        "rotationExposures": 2,
        "sessionGaps": [
          3,
          3
        ],
        "calendarDayGaps": [
          4,
          4
        ]
      },
      "triceps": {
        "rotationExposures": 2,
        "sessionGaps": [
          3,
          3
        ],
        "calendarDayGaps": [
          4,
          4
        ]
      },
      "biceps": {
        "rotationExposures": 2,
        "sessionGaps": [
          3,
          3
        ],
        "calendarDayGaps": [
          4,
          4
        ]
      },
      "quadriceps": {
        "rotationExposures": 2,
        "sessionGaps": [
          3,
          3
        ],
        "calendarDayGaps": [
          5,
          3
        ]
      },
      "hamstrings_knee_flexion": {
        "rotationExposures": 2,
        "sessionGaps": [
          3,
          3
        ],
        "calendarDayGaps": [
          5,
          3
        ]
      },
      "hip_extension": {
        "rotationExposures": 2,
        "sessionGaps": [
          3,
          3
        ],
        "calendarDayGaps": [
          5,
          3
        ]
      },
      "calves": {
        "rotationExposures": 2,
        "sessionGaps": [
          3,
          3
        ],
        "calendarDayGaps": [
          5,
          3
        ]
      },
      "core": {
        "rotationExposures": 1,
        "sessionGaps": [
          6
        ],
        "calendarDayGaps": [
          8
        ]
      }
    }
  },
  "complementaryPairQuality": [
    {
      "id": "Push A/D",
      "firstRole": "Push hypertrophy A",
      "secondRole": "Push hypertrophy D",
      "stableExercises": [],
      "variedExercises": [
        "ex-bench-press",
        "ex-incline-dumbbell-press",
        "ex-machine-shoulder-press",
        "ex-cable-lateral-raise",
        "ex-cable-rope-overhead-extension",
        "ex-close-neutral-pushdown",
        "ex-incline-barbell-bench",
        "ex-decline-plate-loaded-press",
        "ex-plate-loaded-shoulder-press-machine",
        "ex-lateral-raise-plate-loaded",
        "ex-ez-bar-pushdown"
      ],
      "requiredRegions": [
        "chest",
        "anterior_delts",
        "lateral_delts",
        "triceps"
      ],
      "completeCoverage": true,
      "renamedDuplicate": false
    },
    {
      "id": "Pull B/E",
      "firstRole": "Pull hypertrophy B",
      "secondRole": "Pull hypertrophy E",
      "stableExercises": [],
      "variedExercises": [
        "ex-chest-supported-row",
        "ex-lat-pulldown",
        "ex-dorian-yates-row-machine",
        "ex-cable-rear-delt-fly",
        "ex-bayesian-curl",
        "ex-lat-pulldown-machine",
        "ex-high-row-plate-loaded",
        "ex-lat-pulldown-narrow",
        "ex-low-row-plate-loaded",
        "ex-rear-delt-machine",
        "ex-cable-curl",
        "ex-lat-pulldown-neutral-close"
      ],
      "requiredRegions": [
        "upper_back",
        "lats",
        "rear_delts",
        "biceps"
      ],
      "completeCoverage": true,
      "renamedDuplicate": false
    },
    {
      "id": "Legs C/F",
      "firstRole": "Legs hypertrophy C",
      "secondRole": "Legs hypertrophy F",
      "stableExercises": [
        "ex-stiff-leg-deadlift",
        "ex-kneeling-leg-curl",
        "ex-hip-thrust-machine",
        "ex-donkey-calf-raise"
      ],
      "variedExercises": [
        "ex-hack-squat-machine",
        "ex-belt-squat",
        "ex-walking-lunge",
        "ex-leg-extension",
        "ex-cable-crunch"
      ],
      "requiredRegions": [
        "quadriceps",
        "hamstrings_knee_flexion",
        "hip_extension",
        "calves",
        "core"
      ],
      "completeCoverage": true,
      "renamedDuplicate": false
    }
  ],
  "resetProof": {
    "sequence1Last": "Pull hypertrophy E",
    "sequence2First": "Legs hypertrophy F",
    "sequence2Roles": [
      "Legs hypertrophy F",
      "Push hypertrophy A",
      "Pull hypertrophy B",
      "Legs hypertrophy C",
      "Push hypertrophy D"
    ],
    "mondayResetAbsent": true
  }
}
```
