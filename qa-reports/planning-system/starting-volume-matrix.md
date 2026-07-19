# Starting Volume Matrix

Generated from `canonical_adaptive_planning_certification_v1`. This report is evidence, not a second planning authority.

```json
{
  "schemaVersion": "canonical_dosage_evolution_certification_v2",
  "policyId": "canonical_hypertrophy_volume_policy_v2",
  "sourceEvidence": [
    {
      "source": "docs/evidence-based-prescription-model.md",
      "section": "Weekly volume targets",
      "paraphrasedRule": "Experience-specific direct-set ranges differ for major, small and core regions; volume increases require evidence.",
      "supportedFields": [
        "target",
        "maximumRecoverableAuthorisation"
      ],
      "limitation": "Product policy range, not a demonstrated individual MRV."
    },
    {
      "source": "docs/evidence-based-prescription-model.md",
      "section": "Session volume targets",
      "paraphrasedRule": "Primary, secondary, isolation and core roles own useful multi-set session prescriptions.",
      "supportedFields": [
        "starting",
        "maximumAuthorisedStarting",
        "no_token_work"
      ],
      "limitation": "Discrete session allocation may differ from the normalized weekly target by rounding."
    },
    {
      "source": "canonical-policy-source-corpus/13-Chad-Waterbury-s-Programs.pdf",
      "printedPages": "1-2",
      "paraphrasedRule": "Published hypertrophy examples specify exercise-level sets, reps, rest and planned progression rather than decorative exercise counts.",
      "supportedFields": [
        "exact_set_rep_rest_execution",
        "planned_progression"
      ],
      "limitation": "Example programmes support executable prescription structure; they do not define a universal weekly regional dose."
    }
  ],
  "rows": [
    {
      "experience": "beginner",
      "profile": "low-acceptable-recovery-no-history",
      "context": {
        "continuity": "currently_training",
        "recentTrainingDaysPerWeek": 5,
        "recentSessionWorkload": "moderate",
        "recentSessionDurationMinutes": 60,
        "recovery": "low_acceptable",
        "history": "none",
        "workCapacity": "not_demonstrated",
        "concurrentSport": "none",
        "loadConfidence": "calibration_required",
        "dosageConfidence": "declared_recent_training"
      },
      "frequency": {
        "chest": 1.67,
        "lats": 1.67,
        "upper_back": 1.67,
        "anterior_delts": 1.67,
        "lateral_delts": 1.67,
        "rear_delts": 1.67,
        "triceps": 1.67,
        "biceps": 1.67,
        "quadriceps": 1.67,
        "hamstrings_knee_flexion": 1.67,
        "hip_extension": 1.67,
        "calves": 1.67,
        "core": 0.83
      },
      "muscles": {
        "chest": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 4,
          "authorisedFloor": 3,
          "authorisedCeiling": 8,
          "target": {
            "min": 5,
            "max": 10
          },
          "calibrationRequired": true,
          "retainedHistoryEffect": "declared_training_baseline",
          "reasonCodes": [
            "experience:beginner",
            "region:chest",
            "current_training_preserves_experience_baseline",
            "missing_app_history_lowers_dosage_confidence_not_experience",
            "low_acceptable_recovery_reduces_start",
            "load_calibration_required_independent_of_dosage"
          ]
        },
        "lats": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 4,
          "authorisedFloor": 3,
          "authorisedCeiling": 8,
          "target": {
            "min": 5,
            "max": 10
          },
          "calibrationRequired": true,
          "retainedHistoryEffect": "declared_training_baseline",
          "reasonCodes": [
            "experience:beginner",
            "region:lats",
            "current_training_preserves_experience_baseline",
            "missing_app_history_lowers_dosage_confidence_not_experience",
            "low_acceptable_recovery_reduces_start",
            "load_calibration_required_independent_of_dosage"
          ]
        },
        "upper_back": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 4,
          "authorisedFloor": 3,
          "authorisedCeiling": 8,
          "target": {
            "min": 5,
            "max": 10
          },
          "calibrationRequired": true,
          "retainedHistoryEffect": "declared_training_baseline",
          "reasonCodes": [
            "experience:beginner",
            "region:upper_back",
            "current_training_preserves_experience_baseline",
            "missing_app_history_lowers_dosage_confidence_not_experience",
            "low_acceptable_recovery_reduces_start",
            "load_calibration_required_independent_of_dosage"
          ]
        },
        "anterior_delts": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 3,
          "authorisedFloor": 2,
          "authorisedCeiling": 6,
          "target": {
            "min": 3,
            "max": 8
          },
          "calibrationRequired": true,
          "retainedHistoryEffect": "declared_training_baseline",
          "reasonCodes": [
            "experience:beginner",
            "region:anterior_delts",
            "current_training_preserves_experience_baseline",
            "missing_app_history_lowers_dosage_confidence_not_experience",
            "low_acceptable_recovery_reduces_start",
            "load_calibration_required_independent_of_dosage"
          ]
        },
        "lateral_delts": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 3,
          "authorisedFloor": 2,
          "authorisedCeiling": 6,
          "target": {
            "min": 3,
            "max": 8
          },
          "calibrationRequired": true,
          "retainedHistoryEffect": "declared_training_baseline",
          "reasonCodes": [
            "experience:beginner",
            "region:lateral_delts",
            "current_training_preserves_experience_baseline",
            "missing_app_history_lowers_dosage_confidence_not_experience",
            "low_acceptable_recovery_reduces_start",
            "load_calibration_required_independent_of_dosage"
          ]
        },
        "rear_delts": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 3,
          "authorisedFloor": 2,
          "authorisedCeiling": 6,
          "target": {
            "min": 3,
            "max": 8
          },
          "calibrationRequired": true,
          "retainedHistoryEffect": "declared_training_baseline",
          "reasonCodes": [
            "experience:beginner",
            "region:rear_delts",
            "current_training_preserves_experience_baseline",
            "missing_app_history_lowers_dosage_confidence_not_experience",
            "low_acceptable_recovery_reduces_start",
            "load_calibration_required_independent_of_dosage"
          ]
        },
        "triceps": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 3,
          "authorisedFloor": 2,
          "authorisedCeiling": 6,
          "target": {
            "min": 3,
            "max": 8
          },
          "calibrationRequired": true,
          "retainedHistoryEffect": "declared_training_baseline",
          "reasonCodes": [
            "experience:beginner",
            "region:triceps",
            "current_training_preserves_experience_baseline",
            "missing_app_history_lowers_dosage_confidence_not_experience",
            "low_acceptable_recovery_reduces_start",
            "load_calibration_required_independent_of_dosage"
          ]
        },
        "biceps": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 3,
          "authorisedFloor": 2,
          "authorisedCeiling": 6,
          "target": {
            "min": 3,
            "max": 8
          },
          "calibrationRequired": true,
          "retainedHistoryEffect": "declared_training_baseline",
          "reasonCodes": [
            "experience:beginner",
            "region:biceps",
            "current_training_preserves_experience_baseline",
            "missing_app_history_lowers_dosage_confidence_not_experience",
            "low_acceptable_recovery_reduces_start",
            "load_calibration_required_independent_of_dosage"
          ]
        },
        "quadriceps": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 4,
          "authorisedFloor": 3,
          "authorisedCeiling": 8,
          "target": {
            "min": 5,
            "max": 10
          },
          "calibrationRequired": true,
          "retainedHistoryEffect": "declared_training_baseline",
          "reasonCodes": [
            "experience:beginner",
            "region:quadriceps",
            "current_training_preserves_experience_baseline",
            "missing_app_history_lowers_dosage_confidence_not_experience",
            "low_acceptable_recovery_reduces_start",
            "load_calibration_required_independent_of_dosage"
          ]
        },
        "hamstrings_knee_flexion": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 3,
          "authorisedFloor": 2,
          "authorisedCeiling": 6,
          "target": {
            "min": 3,
            "max": 8
          },
          "calibrationRequired": true,
          "retainedHistoryEffect": "declared_training_baseline",
          "reasonCodes": [
            "experience:beginner",
            "region:hamstrings_knee_flexion",
            "current_training_preserves_experience_baseline",
            "missing_app_history_lowers_dosage_confidence_not_experience",
            "low_acceptable_recovery_reduces_start",
            "load_calibration_required_independent_of_dosage"
          ]
        },
        "hip_extension": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 4,
          "authorisedFloor": 3,
          "authorisedCeiling": 8,
          "target": {
            "min": 5,
            "max": 10
          },
          "calibrationRequired": true,
          "retainedHistoryEffect": "declared_training_baseline",
          "reasonCodes": [
            "experience:beginner",
            "region:hip_extension",
            "current_training_preserves_experience_baseline",
            "missing_app_history_lowers_dosage_confidence_not_experience",
            "low_acceptable_recovery_reduces_start",
            "load_calibration_required_independent_of_dosage"
          ]
        },
        "calves": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 3,
          "authorisedFloor": 2,
          "authorisedCeiling": 6,
          "target": {
            "min": 3,
            "max": 8
          },
          "calibrationRequired": true,
          "retainedHistoryEffect": "declared_training_baseline",
          "reasonCodes": [
            "experience:beginner",
            "region:calves",
            "current_training_preserves_experience_baseline",
            "missing_app_history_lowers_dosage_confidence_not_experience",
            "low_acceptable_recovery_reduces_start",
            "load_calibration_required_independent_of_dosage"
          ]
        },
        "core": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 1,
          "authorisedFloor": 1,
          "authorisedCeiling": 2,
          "target": {
            "min": 1,
            "max": 4
          },
          "calibrationRequired": true,
          "retainedHistoryEffect": "declared_training_baseline",
          "reasonCodes": [
            "experience:beginner",
            "region:core",
            "current_training_preserves_experience_baseline",
            "missing_app_history_lowers_dosage_confidence_not_experience",
            "low_acceptable_recovery_reduces_start",
            "load_calibration_required_independent_of_dosage"
          ]
        }
      },
      "totalDirectSets": 42,
      "expectedSessionMinutes": "resolved_after_exact_slot_allocation",
      "reason": "declared_recent_training_start_with_load_calibration"
    },
    {
      "experience": "beginner",
      "profile": "ordinary-recovery-no-history",
      "context": {
        "continuity": "currently_training",
        "recentTrainingDaysPerWeek": 5,
        "recentSessionWorkload": "moderate",
        "recentSessionDurationMinutes": 60,
        "recovery": "ordinary",
        "history": "none",
        "workCapacity": "not_demonstrated",
        "concurrentSport": "none",
        "loadConfidence": "calibration_required",
        "dosageConfidence": "declared_recent_training"
      },
      "frequency": {
        "chest": 1.67,
        "lats": 1.67,
        "upper_back": 1.67,
        "anterior_delts": 1.67,
        "lateral_delts": 1.67,
        "rear_delts": 1.67,
        "triceps": 1.67,
        "biceps": 1.67,
        "quadriceps": 1.67,
        "hamstrings_knee_flexion": 1.67,
        "hip_extension": 1.67,
        "calves": 1.67,
        "core": 0.83
      },
      "muscles": {
        "chest": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 6,
          "authorisedFloor": 3,
          "authorisedCeiling": 8,
          "target": {
            "min": 5,
            "max": 10
          },
          "calibrationRequired": true,
          "retainedHistoryEffect": "declared_training_baseline",
          "reasonCodes": [
            "experience:beginner",
            "region:chest",
            "current_training_preserves_experience_baseline",
            "missing_app_history_lowers_dosage_confidence_not_experience",
            "load_calibration_required_independent_of_dosage",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "lats": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 6,
          "authorisedFloor": 3,
          "authorisedCeiling": 8,
          "target": {
            "min": 5,
            "max": 10
          },
          "calibrationRequired": true,
          "retainedHistoryEffect": "declared_training_baseline",
          "reasonCodes": [
            "experience:beginner",
            "region:lats",
            "current_training_preserves_experience_baseline",
            "missing_app_history_lowers_dosage_confidence_not_experience",
            "load_calibration_required_independent_of_dosage",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "upper_back": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 6,
          "authorisedFloor": 3,
          "authorisedCeiling": 8,
          "target": {
            "min": 5,
            "max": 10
          },
          "calibrationRequired": true,
          "retainedHistoryEffect": "declared_training_baseline",
          "reasonCodes": [
            "experience:beginner",
            "region:upper_back",
            "current_training_preserves_experience_baseline",
            "missing_app_history_lowers_dosage_confidence_not_experience",
            "load_calibration_required_independent_of_dosage",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "anterior_delts": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 4,
          "authorisedFloor": 2,
          "authorisedCeiling": 6,
          "target": {
            "min": 3,
            "max": 8
          },
          "calibrationRequired": true,
          "retainedHistoryEffect": "declared_training_baseline",
          "reasonCodes": [
            "experience:beginner",
            "region:anterior_delts",
            "current_training_preserves_experience_baseline",
            "missing_app_history_lowers_dosage_confidence_not_experience",
            "load_calibration_required_independent_of_dosage",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "lateral_delts": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 4,
          "authorisedFloor": 2,
          "authorisedCeiling": 6,
          "target": {
            "min": 3,
            "max": 8
          },
          "calibrationRequired": true,
          "retainedHistoryEffect": "declared_training_baseline",
          "reasonCodes": [
            "experience:beginner",
            "region:lateral_delts",
            "current_training_preserves_experience_baseline",
            "missing_app_history_lowers_dosage_confidence_not_experience",
            "load_calibration_required_independent_of_dosage",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "rear_delts": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 4,
          "authorisedFloor": 2,
          "authorisedCeiling": 6,
          "target": {
            "min": 3,
            "max": 8
          },
          "calibrationRequired": true,
          "retainedHistoryEffect": "declared_training_baseline",
          "reasonCodes": [
            "experience:beginner",
            "region:rear_delts",
            "current_training_preserves_experience_baseline",
            "missing_app_history_lowers_dosage_confidence_not_experience",
            "load_calibration_required_independent_of_dosage",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "triceps": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 4,
          "authorisedFloor": 2,
          "authorisedCeiling": 6,
          "target": {
            "min": 3,
            "max": 8
          },
          "calibrationRequired": true,
          "retainedHistoryEffect": "declared_training_baseline",
          "reasonCodes": [
            "experience:beginner",
            "region:triceps",
            "current_training_preserves_experience_baseline",
            "missing_app_history_lowers_dosage_confidence_not_experience",
            "load_calibration_required_independent_of_dosage",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "biceps": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 4,
          "authorisedFloor": 2,
          "authorisedCeiling": 6,
          "target": {
            "min": 3,
            "max": 8
          },
          "calibrationRequired": true,
          "retainedHistoryEffect": "declared_training_baseline",
          "reasonCodes": [
            "experience:beginner",
            "region:biceps",
            "current_training_preserves_experience_baseline",
            "missing_app_history_lowers_dosage_confidence_not_experience",
            "load_calibration_required_independent_of_dosage",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "quadriceps": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 6,
          "authorisedFloor": 3,
          "authorisedCeiling": 8,
          "target": {
            "min": 5,
            "max": 10
          },
          "calibrationRequired": true,
          "retainedHistoryEffect": "declared_training_baseline",
          "reasonCodes": [
            "experience:beginner",
            "region:quadriceps",
            "current_training_preserves_experience_baseline",
            "missing_app_history_lowers_dosage_confidence_not_experience",
            "load_calibration_required_independent_of_dosage",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "hamstrings_knee_flexion": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 4,
          "authorisedFloor": 2,
          "authorisedCeiling": 6,
          "target": {
            "min": 3,
            "max": 8
          },
          "calibrationRequired": true,
          "retainedHistoryEffect": "declared_training_baseline",
          "reasonCodes": [
            "experience:beginner",
            "region:hamstrings_knee_flexion",
            "current_training_preserves_experience_baseline",
            "missing_app_history_lowers_dosage_confidence_not_experience",
            "load_calibration_required_independent_of_dosage",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "hip_extension": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 6,
          "authorisedFloor": 3,
          "authorisedCeiling": 8,
          "target": {
            "min": 5,
            "max": 10
          },
          "calibrationRequired": true,
          "retainedHistoryEffect": "declared_training_baseline",
          "reasonCodes": [
            "experience:beginner",
            "region:hip_extension",
            "current_training_preserves_experience_baseline",
            "missing_app_history_lowers_dosage_confidence_not_experience",
            "load_calibration_required_independent_of_dosage",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "calves": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 4,
          "authorisedFloor": 2,
          "authorisedCeiling": 6,
          "target": {
            "min": 3,
            "max": 8
          },
          "calibrationRequired": true,
          "retainedHistoryEffect": "declared_training_baseline",
          "reasonCodes": [
            "experience:beginner",
            "region:calves",
            "current_training_preserves_experience_baseline",
            "missing_app_history_lowers_dosage_confidence_not_experience",
            "load_calibration_required_independent_of_dosage",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "core": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 1,
          "authorisedFloor": 1,
          "authorisedCeiling": 2,
          "target": {
            "min": 1,
            "max": 4
          },
          "calibrationRequired": true,
          "retainedHistoryEffect": "declared_training_baseline",
          "reasonCodes": [
            "experience:beginner",
            "region:core",
            "current_training_preserves_experience_baseline",
            "missing_app_history_lowers_dosage_confidence_not_experience",
            "load_calibration_required_independent_of_dosage",
            "ordinary_recovery_supports_resolved_start"
          ]
        }
      },
      "totalDirectSets": 59,
      "expectedSessionMinutes": "resolved_after_exact_slot_allocation",
      "reason": "declared_recent_training_start_with_load_calibration"
    },
    {
      "experience": "beginner",
      "profile": "ordinary-recovery-productive-history",
      "context": {
        "continuity": "currently_training",
        "recentTrainingDaysPerWeek": 5,
        "recentSessionWorkload": "moderate",
        "recentSessionDurationMinutes": 60,
        "recovery": "ordinary",
        "history": "established_productive",
        "workCapacity": "not_demonstrated",
        "concurrentSport": "none",
        "loadConfidence": "established",
        "dosageConfidence": "canonical_productive_history"
      },
      "frequency": {
        "chest": 1.67,
        "lats": 1.67,
        "upper_back": 1.67,
        "anterior_delts": 1.67,
        "lateral_delts": 1.67,
        "rear_delts": 1.67,
        "triceps": 1.67,
        "biceps": 1.67,
        "quadriceps": 1.67,
        "hamstrings_knee_flexion": 1.67,
        "hip_extension": 1.67,
        "calves": 1.67,
        "core": 0.83
      },
      "muscles": {
        "chest": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 7,
          "authorisedFloor": 3,
          "authorisedCeiling": 8,
          "target": {
            "min": 5,
            "max": 10
          },
          "calibrationRequired": false,
          "retainedHistoryEffect": "productive_baseline",
          "reasonCodes": [
            "experience:beginner",
            "region:chest",
            "current_training_preserves_experience_baseline",
            "retained_productive_history_supports_one_set_above_provisional_start",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "lats": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 7,
          "authorisedFloor": 3,
          "authorisedCeiling": 8,
          "target": {
            "min": 5,
            "max": 10
          },
          "calibrationRequired": false,
          "retainedHistoryEffect": "productive_baseline",
          "reasonCodes": [
            "experience:beginner",
            "region:lats",
            "current_training_preserves_experience_baseline",
            "retained_productive_history_supports_one_set_above_provisional_start",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "upper_back": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 7,
          "authorisedFloor": 3,
          "authorisedCeiling": 8,
          "target": {
            "min": 5,
            "max": 10
          },
          "calibrationRequired": false,
          "retainedHistoryEffect": "productive_baseline",
          "reasonCodes": [
            "experience:beginner",
            "region:upper_back",
            "current_training_preserves_experience_baseline",
            "retained_productive_history_supports_one_set_above_provisional_start",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "anterior_delts": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 5,
          "authorisedFloor": 2,
          "authorisedCeiling": 6,
          "target": {
            "min": 3,
            "max": 8
          },
          "calibrationRequired": false,
          "retainedHistoryEffect": "productive_baseline",
          "reasonCodes": [
            "experience:beginner",
            "region:anterior_delts",
            "current_training_preserves_experience_baseline",
            "retained_productive_history_supports_one_set_above_provisional_start",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "lateral_delts": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 5,
          "authorisedFloor": 2,
          "authorisedCeiling": 6,
          "target": {
            "min": 3,
            "max": 8
          },
          "calibrationRequired": false,
          "retainedHistoryEffect": "productive_baseline",
          "reasonCodes": [
            "experience:beginner",
            "region:lateral_delts",
            "current_training_preserves_experience_baseline",
            "retained_productive_history_supports_one_set_above_provisional_start",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "rear_delts": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 5,
          "authorisedFloor": 2,
          "authorisedCeiling": 6,
          "target": {
            "min": 3,
            "max": 8
          },
          "calibrationRequired": false,
          "retainedHistoryEffect": "productive_baseline",
          "reasonCodes": [
            "experience:beginner",
            "region:rear_delts",
            "current_training_preserves_experience_baseline",
            "retained_productive_history_supports_one_set_above_provisional_start",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "triceps": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 5,
          "authorisedFloor": 2,
          "authorisedCeiling": 6,
          "target": {
            "min": 3,
            "max": 8
          },
          "calibrationRequired": false,
          "retainedHistoryEffect": "productive_baseline",
          "reasonCodes": [
            "experience:beginner",
            "region:triceps",
            "current_training_preserves_experience_baseline",
            "retained_productive_history_supports_one_set_above_provisional_start",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "biceps": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 5,
          "authorisedFloor": 2,
          "authorisedCeiling": 6,
          "target": {
            "min": 3,
            "max": 8
          },
          "calibrationRequired": false,
          "retainedHistoryEffect": "productive_baseline",
          "reasonCodes": [
            "experience:beginner",
            "region:biceps",
            "current_training_preserves_experience_baseline",
            "retained_productive_history_supports_one_set_above_provisional_start",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "quadriceps": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 7,
          "authorisedFloor": 3,
          "authorisedCeiling": 8,
          "target": {
            "min": 5,
            "max": 10
          },
          "calibrationRequired": false,
          "retainedHistoryEffect": "productive_baseline",
          "reasonCodes": [
            "experience:beginner",
            "region:quadriceps",
            "current_training_preserves_experience_baseline",
            "retained_productive_history_supports_one_set_above_provisional_start",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "hamstrings_knee_flexion": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 5,
          "authorisedFloor": 2,
          "authorisedCeiling": 6,
          "target": {
            "min": 3,
            "max": 8
          },
          "calibrationRequired": false,
          "retainedHistoryEffect": "productive_baseline",
          "reasonCodes": [
            "experience:beginner",
            "region:hamstrings_knee_flexion",
            "current_training_preserves_experience_baseline",
            "retained_productive_history_supports_one_set_above_provisional_start",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "hip_extension": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 7,
          "authorisedFloor": 3,
          "authorisedCeiling": 8,
          "target": {
            "min": 5,
            "max": 10
          },
          "calibrationRequired": false,
          "retainedHistoryEffect": "productive_baseline",
          "reasonCodes": [
            "experience:beginner",
            "region:hip_extension",
            "current_training_preserves_experience_baseline",
            "retained_productive_history_supports_one_set_above_provisional_start",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "calves": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 5,
          "authorisedFloor": 2,
          "authorisedCeiling": 6,
          "target": {
            "min": 3,
            "max": 8
          },
          "calibrationRequired": false,
          "retainedHistoryEffect": "productive_baseline",
          "reasonCodes": [
            "experience:beginner",
            "region:calves",
            "current_training_preserves_experience_baseline",
            "retained_productive_history_supports_one_set_above_provisional_start",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "core": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 2,
          "authorisedFloor": 1,
          "authorisedCeiling": 2,
          "target": {
            "min": 1,
            "max": 4
          },
          "calibrationRequired": false,
          "retainedHistoryEffect": "productive_baseline",
          "reasonCodes": [
            "experience:beginner",
            "region:core",
            "current_training_preserves_experience_baseline",
            "retained_productive_history_supports_one_set_above_provisional_start",
            "ordinary_recovery_supports_resolved_start"
          ]
        }
      },
      "totalDirectSets": 72,
      "expectedSessionMinutes": "resolved_after_exact_slot_allocation",
      "reason": "productive_history_supports_bounded_start"
    },
    {
      "experience": "beginner",
      "profile": "high-demonstrated-capacity",
      "context": {
        "continuity": "currently_training",
        "recentTrainingDaysPerWeek": 5,
        "recentSessionWorkload": "moderate",
        "recentSessionDurationMinutes": 60,
        "recovery": "high",
        "history": "established_productive",
        "workCapacity": "demonstrated_high",
        "concurrentSport": "none",
        "loadConfidence": "established",
        "dosageConfidence": "canonical_productive_history"
      },
      "frequency": {
        "chest": 1.67,
        "lats": 1.67,
        "upper_back": 1.67,
        "anterior_delts": 1.67,
        "lateral_delts": 1.67,
        "rear_delts": 1.67,
        "triceps": 1.67,
        "biceps": 1.67,
        "quadriceps": 1.67,
        "hamstrings_knee_flexion": 1.67,
        "hip_extension": 1.67,
        "calves": 1.67,
        "core": 0.83
      },
      "muscles": {
        "chest": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 8,
          "authorisedFloor": 3,
          "authorisedCeiling": 8,
          "target": {
            "min": 5,
            "max": 10
          },
          "calibrationRequired": false,
          "retainedHistoryEffect": "demonstrated_upper_start",
          "reasonCodes": [
            "experience:beginner",
            "region:chest",
            "current_training_preserves_experience_baseline",
            "retained_productive_history_supports_one_set_above_provisional_start",
            "productive_history_and_high_capacity_authorise_upper_start"
          ]
        },
        "lats": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 8,
          "authorisedFloor": 3,
          "authorisedCeiling": 8,
          "target": {
            "min": 5,
            "max": 10
          },
          "calibrationRequired": false,
          "retainedHistoryEffect": "demonstrated_upper_start",
          "reasonCodes": [
            "experience:beginner",
            "region:lats",
            "current_training_preserves_experience_baseline",
            "retained_productive_history_supports_one_set_above_provisional_start",
            "productive_history_and_high_capacity_authorise_upper_start"
          ]
        },
        "upper_back": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 8,
          "authorisedFloor": 3,
          "authorisedCeiling": 8,
          "target": {
            "min": 5,
            "max": 10
          },
          "calibrationRequired": false,
          "retainedHistoryEffect": "demonstrated_upper_start",
          "reasonCodes": [
            "experience:beginner",
            "region:upper_back",
            "current_training_preserves_experience_baseline",
            "retained_productive_history_supports_one_set_above_provisional_start",
            "productive_history_and_high_capacity_authorise_upper_start"
          ]
        },
        "anterior_delts": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 6,
          "authorisedFloor": 2,
          "authorisedCeiling": 6,
          "target": {
            "min": 3,
            "max": 8
          },
          "calibrationRequired": false,
          "retainedHistoryEffect": "demonstrated_upper_start",
          "reasonCodes": [
            "experience:beginner",
            "region:anterior_delts",
            "current_training_preserves_experience_baseline",
            "retained_productive_history_supports_one_set_above_provisional_start",
            "productive_history_and_high_capacity_authorise_upper_start"
          ]
        },
        "lateral_delts": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 6,
          "authorisedFloor": 2,
          "authorisedCeiling": 6,
          "target": {
            "min": 3,
            "max": 8
          },
          "calibrationRequired": false,
          "retainedHistoryEffect": "demonstrated_upper_start",
          "reasonCodes": [
            "experience:beginner",
            "region:lateral_delts",
            "current_training_preserves_experience_baseline",
            "retained_productive_history_supports_one_set_above_provisional_start",
            "productive_history_and_high_capacity_authorise_upper_start"
          ]
        },
        "rear_delts": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 6,
          "authorisedFloor": 2,
          "authorisedCeiling": 6,
          "target": {
            "min": 3,
            "max": 8
          },
          "calibrationRequired": false,
          "retainedHistoryEffect": "demonstrated_upper_start",
          "reasonCodes": [
            "experience:beginner",
            "region:rear_delts",
            "current_training_preserves_experience_baseline",
            "retained_productive_history_supports_one_set_above_provisional_start",
            "productive_history_and_high_capacity_authorise_upper_start"
          ]
        },
        "triceps": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 6,
          "authorisedFloor": 2,
          "authorisedCeiling": 6,
          "target": {
            "min": 3,
            "max": 8
          },
          "calibrationRequired": false,
          "retainedHistoryEffect": "demonstrated_upper_start",
          "reasonCodes": [
            "experience:beginner",
            "region:triceps",
            "current_training_preserves_experience_baseline",
            "retained_productive_history_supports_one_set_above_provisional_start",
            "productive_history_and_high_capacity_authorise_upper_start"
          ]
        },
        "biceps": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 6,
          "authorisedFloor": 2,
          "authorisedCeiling": 6,
          "target": {
            "min": 3,
            "max": 8
          },
          "calibrationRequired": false,
          "retainedHistoryEffect": "demonstrated_upper_start",
          "reasonCodes": [
            "experience:beginner",
            "region:biceps",
            "current_training_preserves_experience_baseline",
            "retained_productive_history_supports_one_set_above_provisional_start",
            "productive_history_and_high_capacity_authorise_upper_start"
          ]
        },
        "quadriceps": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 8,
          "authorisedFloor": 3,
          "authorisedCeiling": 8,
          "target": {
            "min": 5,
            "max": 10
          },
          "calibrationRequired": false,
          "retainedHistoryEffect": "demonstrated_upper_start",
          "reasonCodes": [
            "experience:beginner",
            "region:quadriceps",
            "current_training_preserves_experience_baseline",
            "retained_productive_history_supports_one_set_above_provisional_start",
            "productive_history_and_high_capacity_authorise_upper_start"
          ]
        },
        "hamstrings_knee_flexion": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 6,
          "authorisedFloor": 2,
          "authorisedCeiling": 6,
          "target": {
            "min": 3,
            "max": 8
          },
          "calibrationRequired": false,
          "retainedHistoryEffect": "demonstrated_upper_start",
          "reasonCodes": [
            "experience:beginner",
            "region:hamstrings_knee_flexion",
            "current_training_preserves_experience_baseline",
            "retained_productive_history_supports_one_set_above_provisional_start",
            "productive_history_and_high_capacity_authorise_upper_start"
          ]
        },
        "hip_extension": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 8,
          "authorisedFloor": 3,
          "authorisedCeiling": 8,
          "target": {
            "min": 5,
            "max": 10
          },
          "calibrationRequired": false,
          "retainedHistoryEffect": "demonstrated_upper_start",
          "reasonCodes": [
            "experience:beginner",
            "region:hip_extension",
            "current_training_preserves_experience_baseline",
            "retained_productive_history_supports_one_set_above_provisional_start",
            "productive_history_and_high_capacity_authorise_upper_start"
          ]
        },
        "calves": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 6,
          "authorisedFloor": 2,
          "authorisedCeiling": 6,
          "target": {
            "min": 3,
            "max": 8
          },
          "calibrationRequired": false,
          "retainedHistoryEffect": "demonstrated_upper_start",
          "reasonCodes": [
            "experience:beginner",
            "region:calves",
            "current_training_preserves_experience_baseline",
            "retained_productive_history_supports_one_set_above_provisional_start",
            "productive_history_and_high_capacity_authorise_upper_start"
          ]
        },
        "core": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 2,
          "authorisedFloor": 1,
          "authorisedCeiling": 2,
          "target": {
            "min": 1,
            "max": 4
          },
          "calibrationRequired": false,
          "retainedHistoryEffect": "demonstrated_upper_start",
          "reasonCodes": [
            "experience:beginner",
            "region:core",
            "current_training_preserves_experience_baseline",
            "retained_productive_history_supports_one_set_above_provisional_start",
            "productive_history_and_high_capacity_authorise_upper_start"
          ]
        }
      },
      "totalDirectSets": 84,
      "expectedSessionMinutes": "resolved_after_exact_slot_allocation",
      "reason": "upper_start_requires_productive_history_and_high_capacity"
    },
    {
      "experience": "beginner",
      "profile": "concurrent-sport-no-history",
      "context": {
        "continuity": "currently_training",
        "recentTrainingDaysPerWeek": 5,
        "recentSessionWorkload": "moderate",
        "recentSessionDurationMinutes": 60,
        "recovery": "ordinary",
        "history": "none",
        "workCapacity": "not_demonstrated",
        "concurrentSport": "lower_body_loading",
        "loadConfidence": "calibration_required",
        "dosageConfidence": "declared_recent_training"
      },
      "frequency": {
        "chest": 1.67,
        "lats": 1.67,
        "upper_back": 1.67,
        "anterior_delts": 1.67,
        "lateral_delts": 1.67,
        "rear_delts": 1.67,
        "triceps": 1.67,
        "biceps": 1.67,
        "quadriceps": 1.67,
        "hamstrings_knee_flexion": 1.67,
        "hip_extension": 1.67,
        "calves": 1.67,
        "core": 0.83
      },
      "muscles": {
        "chest": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 6,
          "authorisedFloor": 3,
          "authorisedCeiling": 8,
          "target": {
            "min": 5,
            "max": 10
          },
          "calibrationRequired": true,
          "retainedHistoryEffect": "declared_training_baseline",
          "reasonCodes": [
            "experience:beginner",
            "region:chest",
            "current_training_preserves_experience_baseline",
            "missing_app_history_lowers_dosage_confidence_not_experience",
            "load_calibration_required_independent_of_dosage",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "lats": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 6,
          "authorisedFloor": 3,
          "authorisedCeiling": 8,
          "target": {
            "min": 5,
            "max": 10
          },
          "calibrationRequired": true,
          "retainedHistoryEffect": "declared_training_baseline",
          "reasonCodes": [
            "experience:beginner",
            "region:lats",
            "current_training_preserves_experience_baseline",
            "missing_app_history_lowers_dosage_confidence_not_experience",
            "load_calibration_required_independent_of_dosage",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "upper_back": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 6,
          "authorisedFloor": 3,
          "authorisedCeiling": 8,
          "target": {
            "min": 5,
            "max": 10
          },
          "calibrationRequired": true,
          "retainedHistoryEffect": "declared_training_baseline",
          "reasonCodes": [
            "experience:beginner",
            "region:upper_back",
            "current_training_preserves_experience_baseline",
            "missing_app_history_lowers_dosage_confidence_not_experience",
            "load_calibration_required_independent_of_dosage",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "anterior_delts": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 4,
          "authorisedFloor": 2,
          "authorisedCeiling": 6,
          "target": {
            "min": 3,
            "max": 8
          },
          "calibrationRequired": true,
          "retainedHistoryEffect": "declared_training_baseline",
          "reasonCodes": [
            "experience:beginner",
            "region:anterior_delts",
            "current_training_preserves_experience_baseline",
            "missing_app_history_lowers_dosage_confidence_not_experience",
            "load_calibration_required_independent_of_dosage",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "lateral_delts": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 4,
          "authorisedFloor": 2,
          "authorisedCeiling": 6,
          "target": {
            "min": 3,
            "max": 8
          },
          "calibrationRequired": true,
          "retainedHistoryEffect": "declared_training_baseline",
          "reasonCodes": [
            "experience:beginner",
            "region:lateral_delts",
            "current_training_preserves_experience_baseline",
            "missing_app_history_lowers_dosage_confidence_not_experience",
            "load_calibration_required_independent_of_dosage",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "rear_delts": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 4,
          "authorisedFloor": 2,
          "authorisedCeiling": 6,
          "target": {
            "min": 3,
            "max": 8
          },
          "calibrationRequired": true,
          "retainedHistoryEffect": "declared_training_baseline",
          "reasonCodes": [
            "experience:beginner",
            "region:rear_delts",
            "current_training_preserves_experience_baseline",
            "missing_app_history_lowers_dosage_confidence_not_experience",
            "load_calibration_required_independent_of_dosage",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "triceps": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 4,
          "authorisedFloor": 2,
          "authorisedCeiling": 6,
          "target": {
            "min": 3,
            "max": 8
          },
          "calibrationRequired": true,
          "retainedHistoryEffect": "declared_training_baseline",
          "reasonCodes": [
            "experience:beginner",
            "region:triceps",
            "current_training_preserves_experience_baseline",
            "missing_app_history_lowers_dosage_confidence_not_experience",
            "load_calibration_required_independent_of_dosage",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "biceps": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 4,
          "authorisedFloor": 2,
          "authorisedCeiling": 6,
          "target": {
            "min": 3,
            "max": 8
          },
          "calibrationRequired": true,
          "retainedHistoryEffect": "declared_training_baseline",
          "reasonCodes": [
            "experience:beginner",
            "region:biceps",
            "current_training_preserves_experience_baseline",
            "missing_app_history_lowers_dosage_confidence_not_experience",
            "load_calibration_required_independent_of_dosage",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "quadriceps": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 4,
          "authorisedFloor": 3,
          "authorisedCeiling": 8,
          "target": {
            "min": 5,
            "max": 10
          },
          "calibrationRequired": true,
          "retainedHistoryEffect": "declared_training_baseline",
          "reasonCodes": [
            "experience:beginner",
            "region:quadriceps",
            "current_training_preserves_experience_baseline",
            "missing_app_history_lowers_dosage_confidence_not_experience",
            "concurrent_lower_body_workload_reduces_starting_resistance_dose",
            "load_calibration_required_independent_of_dosage",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "hamstrings_knee_flexion": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 3,
          "authorisedFloor": 2,
          "authorisedCeiling": 6,
          "target": {
            "min": 3,
            "max": 8
          },
          "calibrationRequired": true,
          "retainedHistoryEffect": "declared_training_baseline",
          "reasonCodes": [
            "experience:beginner",
            "region:hamstrings_knee_flexion",
            "current_training_preserves_experience_baseline",
            "missing_app_history_lowers_dosage_confidence_not_experience",
            "concurrent_lower_body_workload_reduces_starting_resistance_dose",
            "load_calibration_required_independent_of_dosage",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "hip_extension": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 4,
          "authorisedFloor": 3,
          "authorisedCeiling": 8,
          "target": {
            "min": 5,
            "max": 10
          },
          "calibrationRequired": true,
          "retainedHistoryEffect": "declared_training_baseline",
          "reasonCodes": [
            "experience:beginner",
            "region:hip_extension",
            "current_training_preserves_experience_baseline",
            "missing_app_history_lowers_dosage_confidence_not_experience",
            "concurrent_lower_body_workload_reduces_starting_resistance_dose",
            "load_calibration_required_independent_of_dosage",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "calves": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 3,
          "authorisedFloor": 2,
          "authorisedCeiling": 6,
          "target": {
            "min": 3,
            "max": 8
          },
          "calibrationRequired": true,
          "retainedHistoryEffect": "declared_training_baseline",
          "reasonCodes": [
            "experience:beginner",
            "region:calves",
            "current_training_preserves_experience_baseline",
            "missing_app_history_lowers_dosage_confidence_not_experience",
            "concurrent_lower_body_workload_reduces_starting_resistance_dose",
            "load_calibration_required_independent_of_dosage",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "core": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 1,
          "authorisedFloor": 1,
          "authorisedCeiling": 2,
          "target": {
            "min": 1,
            "max": 4
          },
          "calibrationRequired": true,
          "retainedHistoryEffect": "declared_training_baseline",
          "reasonCodes": [
            "experience:beginner",
            "region:core",
            "current_training_preserves_experience_baseline",
            "missing_app_history_lowers_dosage_confidence_not_experience",
            "load_calibration_required_independent_of_dosage",
            "ordinary_recovery_supports_resolved_start"
          ]
        }
      },
      "totalDirectSets": 53,
      "expectedSessionMinutes": "resolved_after_exact_slot_allocation",
      "reason": "declared_recent_training_start_with_load_calibration"
    },
    {
      "experience": "beginner",
      "profile": "concurrent-sport-productive-history",
      "context": {
        "continuity": "currently_training",
        "recentTrainingDaysPerWeek": 5,
        "recentSessionWorkload": "moderate",
        "recentSessionDurationMinutes": 60,
        "recovery": "ordinary",
        "history": "established_productive",
        "workCapacity": "not_demonstrated",
        "concurrentSport": "lower_body_loading",
        "loadConfidence": "established",
        "dosageConfidence": "canonical_productive_history"
      },
      "frequency": {
        "chest": 1.67,
        "lats": 1.67,
        "upper_back": 1.67,
        "anterior_delts": 1.67,
        "lateral_delts": 1.67,
        "rear_delts": 1.67,
        "triceps": 1.67,
        "biceps": 1.67,
        "quadriceps": 1.67,
        "hamstrings_knee_flexion": 1.67,
        "hip_extension": 1.67,
        "calves": 1.67,
        "core": 0.83
      },
      "muscles": {
        "chest": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 7,
          "authorisedFloor": 3,
          "authorisedCeiling": 8,
          "target": {
            "min": 5,
            "max": 10
          },
          "calibrationRequired": false,
          "retainedHistoryEffect": "productive_baseline",
          "reasonCodes": [
            "experience:beginner",
            "region:chest",
            "current_training_preserves_experience_baseline",
            "retained_productive_history_supports_one_set_above_provisional_start",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "lats": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 7,
          "authorisedFloor": 3,
          "authorisedCeiling": 8,
          "target": {
            "min": 5,
            "max": 10
          },
          "calibrationRequired": false,
          "retainedHistoryEffect": "productive_baseline",
          "reasonCodes": [
            "experience:beginner",
            "region:lats",
            "current_training_preserves_experience_baseline",
            "retained_productive_history_supports_one_set_above_provisional_start",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "upper_back": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 7,
          "authorisedFloor": 3,
          "authorisedCeiling": 8,
          "target": {
            "min": 5,
            "max": 10
          },
          "calibrationRequired": false,
          "retainedHistoryEffect": "productive_baseline",
          "reasonCodes": [
            "experience:beginner",
            "region:upper_back",
            "current_training_preserves_experience_baseline",
            "retained_productive_history_supports_one_set_above_provisional_start",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "anterior_delts": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 5,
          "authorisedFloor": 2,
          "authorisedCeiling": 6,
          "target": {
            "min": 3,
            "max": 8
          },
          "calibrationRequired": false,
          "retainedHistoryEffect": "productive_baseline",
          "reasonCodes": [
            "experience:beginner",
            "region:anterior_delts",
            "current_training_preserves_experience_baseline",
            "retained_productive_history_supports_one_set_above_provisional_start",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "lateral_delts": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 5,
          "authorisedFloor": 2,
          "authorisedCeiling": 6,
          "target": {
            "min": 3,
            "max": 8
          },
          "calibrationRequired": false,
          "retainedHistoryEffect": "productive_baseline",
          "reasonCodes": [
            "experience:beginner",
            "region:lateral_delts",
            "current_training_preserves_experience_baseline",
            "retained_productive_history_supports_one_set_above_provisional_start",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "rear_delts": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 5,
          "authorisedFloor": 2,
          "authorisedCeiling": 6,
          "target": {
            "min": 3,
            "max": 8
          },
          "calibrationRequired": false,
          "retainedHistoryEffect": "productive_baseline",
          "reasonCodes": [
            "experience:beginner",
            "region:rear_delts",
            "current_training_preserves_experience_baseline",
            "retained_productive_history_supports_one_set_above_provisional_start",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "triceps": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 5,
          "authorisedFloor": 2,
          "authorisedCeiling": 6,
          "target": {
            "min": 3,
            "max": 8
          },
          "calibrationRequired": false,
          "retainedHistoryEffect": "productive_baseline",
          "reasonCodes": [
            "experience:beginner",
            "region:triceps",
            "current_training_preserves_experience_baseline",
            "retained_productive_history_supports_one_set_above_provisional_start",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "biceps": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 5,
          "authorisedFloor": 2,
          "authorisedCeiling": 6,
          "target": {
            "min": 3,
            "max": 8
          },
          "calibrationRequired": false,
          "retainedHistoryEffect": "productive_baseline",
          "reasonCodes": [
            "experience:beginner",
            "region:biceps",
            "current_training_preserves_experience_baseline",
            "retained_productive_history_supports_one_set_above_provisional_start",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "quadriceps": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 5,
          "authorisedFloor": 3,
          "authorisedCeiling": 8,
          "target": {
            "min": 5,
            "max": 10
          },
          "calibrationRequired": false,
          "retainedHistoryEffect": "productive_baseline",
          "reasonCodes": [
            "experience:beginner",
            "region:quadriceps",
            "current_training_preserves_experience_baseline",
            "retained_productive_history_supports_one_set_above_provisional_start",
            "concurrent_lower_body_workload_reduces_starting_resistance_dose",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "hamstrings_knee_flexion": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 4,
          "authorisedFloor": 2,
          "authorisedCeiling": 6,
          "target": {
            "min": 3,
            "max": 8
          },
          "calibrationRequired": false,
          "retainedHistoryEffect": "productive_baseline",
          "reasonCodes": [
            "experience:beginner",
            "region:hamstrings_knee_flexion",
            "current_training_preserves_experience_baseline",
            "retained_productive_history_supports_one_set_above_provisional_start",
            "concurrent_lower_body_workload_reduces_starting_resistance_dose",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "hip_extension": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 5,
          "authorisedFloor": 3,
          "authorisedCeiling": 8,
          "target": {
            "min": 5,
            "max": 10
          },
          "calibrationRequired": false,
          "retainedHistoryEffect": "productive_baseline",
          "reasonCodes": [
            "experience:beginner",
            "region:hip_extension",
            "current_training_preserves_experience_baseline",
            "retained_productive_history_supports_one_set_above_provisional_start",
            "concurrent_lower_body_workload_reduces_starting_resistance_dose",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "calves": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 4,
          "authorisedFloor": 2,
          "authorisedCeiling": 6,
          "target": {
            "min": 3,
            "max": 8
          },
          "calibrationRequired": false,
          "retainedHistoryEffect": "productive_baseline",
          "reasonCodes": [
            "experience:beginner",
            "region:calves",
            "current_training_preserves_experience_baseline",
            "retained_productive_history_supports_one_set_above_provisional_start",
            "concurrent_lower_body_workload_reduces_starting_resistance_dose",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "core": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 2,
          "authorisedFloor": 1,
          "authorisedCeiling": 2,
          "target": {
            "min": 1,
            "max": 4
          },
          "calibrationRequired": false,
          "retainedHistoryEffect": "productive_baseline",
          "reasonCodes": [
            "experience:beginner",
            "region:core",
            "current_training_preserves_experience_baseline",
            "retained_productive_history_supports_one_set_above_provisional_start",
            "ordinary_recovery_supports_resolved_start"
          ]
        }
      },
      "totalDirectSets": 66,
      "expectedSessionMinutes": "resolved_after_exact_slot_allocation",
      "reason": "productive_history_supports_bounded_start"
    },
    {
      "experience": "intermediate",
      "profile": "low-acceptable-recovery-no-history",
      "context": {
        "continuity": "currently_training",
        "recentTrainingDaysPerWeek": 5,
        "recentSessionWorkload": "moderate",
        "recentSessionDurationMinutes": 60,
        "recovery": "low_acceptable",
        "history": "none",
        "workCapacity": "not_demonstrated",
        "concurrentSport": "none",
        "loadConfidence": "calibration_required",
        "dosageConfidence": "declared_recent_training"
      },
      "frequency": {
        "chest": 1.67,
        "lats": 1.67,
        "upper_back": 1.67,
        "anterior_delts": 1.67,
        "lateral_delts": 1.67,
        "rear_delts": 1.67,
        "triceps": 1.67,
        "biceps": 1.67,
        "quadriceps": 1.67,
        "hamstrings_knee_flexion": 1.67,
        "hip_extension": 1.67,
        "calves": 1.67,
        "core": 0.83
      },
      "muscles": {
        "chest": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 6,
          "authorisedFloor": 6,
          "authorisedCeiling": 12,
          "target": {
            "min": 8,
            "max": 16
          },
          "calibrationRequired": true,
          "retainedHistoryEffect": "declared_training_baseline",
          "reasonCodes": [
            "experience:intermediate",
            "region:chest",
            "current_training_preserves_experience_baseline",
            "missing_app_history_lowers_dosage_confidence_not_experience",
            "low_acceptable_recovery_reduces_start",
            "load_calibration_required_independent_of_dosage"
          ]
        },
        "lats": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 6,
          "authorisedFloor": 6,
          "authorisedCeiling": 12,
          "target": {
            "min": 8,
            "max": 16
          },
          "calibrationRequired": true,
          "retainedHistoryEffect": "declared_training_baseline",
          "reasonCodes": [
            "experience:intermediate",
            "region:lats",
            "current_training_preserves_experience_baseline",
            "missing_app_history_lowers_dosage_confidence_not_experience",
            "low_acceptable_recovery_reduces_start",
            "load_calibration_required_independent_of_dosage"
          ]
        },
        "upper_back": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 6,
          "authorisedFloor": 6,
          "authorisedCeiling": 12,
          "target": {
            "min": 8,
            "max": 16
          },
          "calibrationRequired": true,
          "retainedHistoryEffect": "declared_training_baseline",
          "reasonCodes": [
            "experience:intermediate",
            "region:upper_back",
            "current_training_preserves_experience_baseline",
            "missing_app_history_lowers_dosage_confidence_not_experience",
            "low_acceptable_recovery_reduces_start",
            "load_calibration_required_independent_of_dosage"
          ]
        },
        "anterior_delts": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 5,
          "authorisedFloor": 5,
          "authorisedCeiling": 10,
          "target": {
            "min": 6,
            "max": 14
          },
          "calibrationRequired": true,
          "retainedHistoryEffect": "declared_training_baseline",
          "reasonCodes": [
            "experience:intermediate",
            "region:anterior_delts",
            "current_training_preserves_experience_baseline",
            "missing_app_history_lowers_dosage_confidence_not_experience",
            "low_acceptable_recovery_reduces_start",
            "load_calibration_required_independent_of_dosage"
          ]
        },
        "lateral_delts": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 5,
          "authorisedFloor": 5,
          "authorisedCeiling": 10,
          "target": {
            "min": 6,
            "max": 14
          },
          "calibrationRequired": true,
          "retainedHistoryEffect": "declared_training_baseline",
          "reasonCodes": [
            "experience:intermediate",
            "region:lateral_delts",
            "current_training_preserves_experience_baseline",
            "missing_app_history_lowers_dosage_confidence_not_experience",
            "low_acceptable_recovery_reduces_start",
            "load_calibration_required_independent_of_dosage"
          ]
        },
        "rear_delts": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 5,
          "authorisedFloor": 5,
          "authorisedCeiling": 10,
          "target": {
            "min": 6,
            "max": 14
          },
          "calibrationRequired": true,
          "retainedHistoryEffect": "declared_training_baseline",
          "reasonCodes": [
            "experience:intermediate",
            "region:rear_delts",
            "current_training_preserves_experience_baseline",
            "missing_app_history_lowers_dosage_confidence_not_experience",
            "low_acceptable_recovery_reduces_start",
            "load_calibration_required_independent_of_dosage"
          ]
        },
        "triceps": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 5,
          "authorisedFloor": 5,
          "authorisedCeiling": 10,
          "target": {
            "min": 6,
            "max": 14
          },
          "calibrationRequired": true,
          "retainedHistoryEffect": "declared_training_baseline",
          "reasonCodes": [
            "experience:intermediate",
            "region:triceps",
            "current_training_preserves_experience_baseline",
            "missing_app_history_lowers_dosage_confidence_not_experience",
            "low_acceptable_recovery_reduces_start",
            "load_calibration_required_independent_of_dosage"
          ]
        },
        "biceps": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 5,
          "authorisedFloor": 5,
          "authorisedCeiling": 10,
          "target": {
            "min": 6,
            "max": 14
          },
          "calibrationRequired": true,
          "retainedHistoryEffect": "declared_training_baseline",
          "reasonCodes": [
            "experience:intermediate",
            "region:biceps",
            "current_training_preserves_experience_baseline",
            "missing_app_history_lowers_dosage_confidence_not_experience",
            "low_acceptable_recovery_reduces_start",
            "load_calibration_required_independent_of_dosage"
          ]
        },
        "quadriceps": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 6,
          "authorisedFloor": 6,
          "authorisedCeiling": 12,
          "target": {
            "min": 8,
            "max": 16
          },
          "calibrationRequired": true,
          "retainedHistoryEffect": "declared_training_baseline",
          "reasonCodes": [
            "experience:intermediate",
            "region:quadriceps",
            "current_training_preserves_experience_baseline",
            "missing_app_history_lowers_dosage_confidence_not_experience",
            "low_acceptable_recovery_reduces_start",
            "load_calibration_required_independent_of_dosage"
          ]
        },
        "hamstrings_knee_flexion": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 5,
          "authorisedFloor": 5,
          "authorisedCeiling": 10,
          "target": {
            "min": 6,
            "max": 14
          },
          "calibrationRequired": true,
          "retainedHistoryEffect": "declared_training_baseline",
          "reasonCodes": [
            "experience:intermediate",
            "region:hamstrings_knee_flexion",
            "current_training_preserves_experience_baseline",
            "missing_app_history_lowers_dosage_confidence_not_experience",
            "low_acceptable_recovery_reduces_start",
            "load_calibration_required_independent_of_dosage"
          ]
        },
        "hip_extension": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 6,
          "authorisedFloor": 6,
          "authorisedCeiling": 12,
          "target": {
            "min": 8,
            "max": 16
          },
          "calibrationRequired": true,
          "retainedHistoryEffect": "declared_training_baseline",
          "reasonCodes": [
            "experience:intermediate",
            "region:hip_extension",
            "current_training_preserves_experience_baseline",
            "missing_app_history_lowers_dosage_confidence_not_experience",
            "low_acceptable_recovery_reduces_start",
            "load_calibration_required_independent_of_dosage"
          ]
        },
        "calves": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 5,
          "authorisedFloor": 5,
          "authorisedCeiling": 10,
          "target": {
            "min": 6,
            "max": 14
          },
          "calibrationRequired": true,
          "retainedHistoryEffect": "declared_training_baseline",
          "reasonCodes": [
            "experience:intermediate",
            "region:calves",
            "current_training_preserves_experience_baseline",
            "missing_app_history_lowers_dosage_confidence_not_experience",
            "low_acceptable_recovery_reduces_start",
            "load_calibration_required_independent_of_dosage"
          ]
        },
        "core": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 1,
          "authorisedFloor": 1,
          "authorisedCeiling": 3,
          "target": {
            "min": 2,
            "max": 6
          },
          "calibrationRequired": true,
          "retainedHistoryEffect": "declared_training_baseline",
          "reasonCodes": [
            "experience:intermediate",
            "region:core",
            "current_training_preserves_experience_baseline",
            "missing_app_history_lowers_dosage_confidence_not_experience",
            "low_acceptable_recovery_reduces_start",
            "load_calibration_required_independent_of_dosage"
          ]
        }
      },
      "totalDirectSets": 66,
      "expectedSessionMinutes": "resolved_after_exact_slot_allocation",
      "reason": "declared_recent_training_start_with_load_calibration"
    },
    {
      "experience": "intermediate",
      "profile": "ordinary-recovery-no-history",
      "context": {
        "continuity": "currently_training",
        "recentTrainingDaysPerWeek": 5,
        "recentSessionWorkload": "moderate",
        "recentSessionDurationMinutes": 60,
        "recovery": "ordinary",
        "history": "none",
        "workCapacity": "not_demonstrated",
        "concurrentSport": "none",
        "loadConfidence": "calibration_required",
        "dosageConfidence": "declared_recent_training"
      },
      "frequency": {
        "chest": 1.67,
        "lats": 1.67,
        "upper_back": 1.67,
        "anterior_delts": 1.67,
        "lateral_delts": 1.67,
        "rear_delts": 1.67,
        "triceps": 1.67,
        "biceps": 1.67,
        "quadriceps": 1.67,
        "hamstrings_knee_flexion": 1.67,
        "hip_extension": 1.67,
        "calves": 1.67,
        "core": 0.83
      },
      "muscles": {
        "chest": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 8,
          "authorisedFloor": 6,
          "authorisedCeiling": 12,
          "target": {
            "min": 8,
            "max": 16
          },
          "calibrationRequired": true,
          "retainedHistoryEffect": "declared_training_baseline",
          "reasonCodes": [
            "experience:intermediate",
            "region:chest",
            "current_training_preserves_experience_baseline",
            "missing_app_history_lowers_dosage_confidence_not_experience",
            "load_calibration_required_independent_of_dosage",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "lats": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 8,
          "authorisedFloor": 6,
          "authorisedCeiling": 12,
          "target": {
            "min": 8,
            "max": 16
          },
          "calibrationRequired": true,
          "retainedHistoryEffect": "declared_training_baseline",
          "reasonCodes": [
            "experience:intermediate",
            "region:lats",
            "current_training_preserves_experience_baseline",
            "missing_app_history_lowers_dosage_confidence_not_experience",
            "load_calibration_required_independent_of_dosage",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "upper_back": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 8,
          "authorisedFloor": 6,
          "authorisedCeiling": 12,
          "target": {
            "min": 8,
            "max": 16
          },
          "calibrationRequired": true,
          "retainedHistoryEffect": "declared_training_baseline",
          "reasonCodes": [
            "experience:intermediate",
            "region:upper_back",
            "current_training_preserves_experience_baseline",
            "missing_app_history_lowers_dosage_confidence_not_experience",
            "load_calibration_required_independent_of_dosage",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "anterior_delts": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 6,
          "authorisedFloor": 5,
          "authorisedCeiling": 10,
          "target": {
            "min": 6,
            "max": 14
          },
          "calibrationRequired": true,
          "retainedHistoryEffect": "declared_training_baseline",
          "reasonCodes": [
            "experience:intermediate",
            "region:anterior_delts",
            "current_training_preserves_experience_baseline",
            "missing_app_history_lowers_dosage_confidence_not_experience",
            "load_calibration_required_independent_of_dosage",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "lateral_delts": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 6,
          "authorisedFloor": 5,
          "authorisedCeiling": 10,
          "target": {
            "min": 6,
            "max": 14
          },
          "calibrationRequired": true,
          "retainedHistoryEffect": "declared_training_baseline",
          "reasonCodes": [
            "experience:intermediate",
            "region:lateral_delts",
            "current_training_preserves_experience_baseline",
            "missing_app_history_lowers_dosage_confidence_not_experience",
            "load_calibration_required_independent_of_dosage",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "rear_delts": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 6,
          "authorisedFloor": 5,
          "authorisedCeiling": 10,
          "target": {
            "min": 6,
            "max": 14
          },
          "calibrationRequired": true,
          "retainedHistoryEffect": "declared_training_baseline",
          "reasonCodes": [
            "experience:intermediate",
            "region:rear_delts",
            "current_training_preserves_experience_baseline",
            "missing_app_history_lowers_dosage_confidence_not_experience",
            "load_calibration_required_independent_of_dosage",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "triceps": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 6,
          "authorisedFloor": 5,
          "authorisedCeiling": 10,
          "target": {
            "min": 6,
            "max": 14
          },
          "calibrationRequired": true,
          "retainedHistoryEffect": "declared_training_baseline",
          "reasonCodes": [
            "experience:intermediate",
            "region:triceps",
            "current_training_preserves_experience_baseline",
            "missing_app_history_lowers_dosage_confidence_not_experience",
            "load_calibration_required_independent_of_dosage",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "biceps": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 6,
          "authorisedFloor": 5,
          "authorisedCeiling": 10,
          "target": {
            "min": 6,
            "max": 14
          },
          "calibrationRequired": true,
          "retainedHistoryEffect": "declared_training_baseline",
          "reasonCodes": [
            "experience:intermediate",
            "region:biceps",
            "current_training_preserves_experience_baseline",
            "missing_app_history_lowers_dosage_confidence_not_experience",
            "load_calibration_required_independent_of_dosage",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "quadriceps": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 8,
          "authorisedFloor": 6,
          "authorisedCeiling": 12,
          "target": {
            "min": 8,
            "max": 16
          },
          "calibrationRequired": true,
          "retainedHistoryEffect": "declared_training_baseline",
          "reasonCodes": [
            "experience:intermediate",
            "region:quadriceps",
            "current_training_preserves_experience_baseline",
            "missing_app_history_lowers_dosage_confidence_not_experience",
            "load_calibration_required_independent_of_dosage",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "hamstrings_knee_flexion": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 6,
          "authorisedFloor": 5,
          "authorisedCeiling": 10,
          "target": {
            "min": 6,
            "max": 14
          },
          "calibrationRequired": true,
          "retainedHistoryEffect": "declared_training_baseline",
          "reasonCodes": [
            "experience:intermediate",
            "region:hamstrings_knee_flexion",
            "current_training_preserves_experience_baseline",
            "missing_app_history_lowers_dosage_confidence_not_experience",
            "load_calibration_required_independent_of_dosage",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "hip_extension": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 8,
          "authorisedFloor": 6,
          "authorisedCeiling": 12,
          "target": {
            "min": 8,
            "max": 16
          },
          "calibrationRequired": true,
          "retainedHistoryEffect": "declared_training_baseline",
          "reasonCodes": [
            "experience:intermediate",
            "region:hip_extension",
            "current_training_preserves_experience_baseline",
            "missing_app_history_lowers_dosage_confidence_not_experience",
            "load_calibration_required_independent_of_dosage",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "calves": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 6,
          "authorisedFloor": 5,
          "authorisedCeiling": 10,
          "target": {
            "min": 6,
            "max": 14
          },
          "calibrationRequired": true,
          "retainedHistoryEffect": "declared_training_baseline",
          "reasonCodes": [
            "experience:intermediate",
            "region:calves",
            "current_training_preserves_experience_baseline",
            "missing_app_history_lowers_dosage_confidence_not_experience",
            "load_calibration_required_independent_of_dosage",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "core": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 2,
          "authorisedFloor": 1,
          "authorisedCeiling": 3,
          "target": {
            "min": 2,
            "max": 6
          },
          "calibrationRequired": true,
          "retainedHistoryEffect": "declared_training_baseline",
          "reasonCodes": [
            "experience:intermediate",
            "region:core",
            "current_training_preserves_experience_baseline",
            "missing_app_history_lowers_dosage_confidence_not_experience",
            "load_calibration_required_independent_of_dosage",
            "ordinary_recovery_supports_resolved_start"
          ]
        }
      },
      "totalDirectSets": 84,
      "expectedSessionMinutes": "resolved_after_exact_slot_allocation",
      "reason": "declared_recent_training_start_with_load_calibration"
    },
    {
      "experience": "intermediate",
      "profile": "ordinary-recovery-productive-history",
      "context": {
        "continuity": "currently_training",
        "recentTrainingDaysPerWeek": 5,
        "recentSessionWorkload": "moderate",
        "recentSessionDurationMinutes": 60,
        "recovery": "ordinary",
        "history": "established_productive",
        "workCapacity": "not_demonstrated",
        "concurrentSport": "none",
        "loadConfidence": "established",
        "dosageConfidence": "canonical_productive_history"
      },
      "frequency": {
        "chest": 1.67,
        "lats": 1.67,
        "upper_back": 1.67,
        "anterior_delts": 1.67,
        "lateral_delts": 1.67,
        "rear_delts": 1.67,
        "triceps": 1.67,
        "biceps": 1.67,
        "quadriceps": 1.67,
        "hamstrings_knee_flexion": 1.67,
        "hip_extension": 1.67,
        "calves": 1.67,
        "core": 0.83
      },
      "muscles": {
        "chest": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 9,
          "authorisedFloor": 6,
          "authorisedCeiling": 12,
          "target": {
            "min": 8,
            "max": 16
          },
          "calibrationRequired": false,
          "retainedHistoryEffect": "productive_baseline",
          "reasonCodes": [
            "experience:intermediate",
            "region:chest",
            "current_training_preserves_experience_baseline",
            "retained_productive_history_supports_one_set_above_provisional_start",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "lats": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 9,
          "authorisedFloor": 6,
          "authorisedCeiling": 12,
          "target": {
            "min": 8,
            "max": 16
          },
          "calibrationRequired": false,
          "retainedHistoryEffect": "productive_baseline",
          "reasonCodes": [
            "experience:intermediate",
            "region:lats",
            "current_training_preserves_experience_baseline",
            "retained_productive_history_supports_one_set_above_provisional_start",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "upper_back": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 9,
          "authorisedFloor": 6,
          "authorisedCeiling": 12,
          "target": {
            "min": 8,
            "max": 16
          },
          "calibrationRequired": false,
          "retainedHistoryEffect": "productive_baseline",
          "reasonCodes": [
            "experience:intermediate",
            "region:upper_back",
            "current_training_preserves_experience_baseline",
            "retained_productive_history_supports_one_set_above_provisional_start",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "anterior_delts": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 7,
          "authorisedFloor": 5,
          "authorisedCeiling": 10,
          "target": {
            "min": 6,
            "max": 14
          },
          "calibrationRequired": false,
          "retainedHistoryEffect": "productive_baseline",
          "reasonCodes": [
            "experience:intermediate",
            "region:anterior_delts",
            "current_training_preserves_experience_baseline",
            "retained_productive_history_supports_one_set_above_provisional_start",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "lateral_delts": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 7,
          "authorisedFloor": 5,
          "authorisedCeiling": 10,
          "target": {
            "min": 6,
            "max": 14
          },
          "calibrationRequired": false,
          "retainedHistoryEffect": "productive_baseline",
          "reasonCodes": [
            "experience:intermediate",
            "region:lateral_delts",
            "current_training_preserves_experience_baseline",
            "retained_productive_history_supports_one_set_above_provisional_start",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "rear_delts": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 7,
          "authorisedFloor": 5,
          "authorisedCeiling": 10,
          "target": {
            "min": 6,
            "max": 14
          },
          "calibrationRequired": false,
          "retainedHistoryEffect": "productive_baseline",
          "reasonCodes": [
            "experience:intermediate",
            "region:rear_delts",
            "current_training_preserves_experience_baseline",
            "retained_productive_history_supports_one_set_above_provisional_start",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "triceps": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 7,
          "authorisedFloor": 5,
          "authorisedCeiling": 10,
          "target": {
            "min": 6,
            "max": 14
          },
          "calibrationRequired": false,
          "retainedHistoryEffect": "productive_baseline",
          "reasonCodes": [
            "experience:intermediate",
            "region:triceps",
            "current_training_preserves_experience_baseline",
            "retained_productive_history_supports_one_set_above_provisional_start",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "biceps": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 7,
          "authorisedFloor": 5,
          "authorisedCeiling": 10,
          "target": {
            "min": 6,
            "max": 14
          },
          "calibrationRequired": false,
          "retainedHistoryEffect": "productive_baseline",
          "reasonCodes": [
            "experience:intermediate",
            "region:biceps",
            "current_training_preserves_experience_baseline",
            "retained_productive_history_supports_one_set_above_provisional_start",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "quadriceps": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 9,
          "authorisedFloor": 6,
          "authorisedCeiling": 12,
          "target": {
            "min": 8,
            "max": 16
          },
          "calibrationRequired": false,
          "retainedHistoryEffect": "productive_baseline",
          "reasonCodes": [
            "experience:intermediate",
            "region:quadriceps",
            "current_training_preserves_experience_baseline",
            "retained_productive_history_supports_one_set_above_provisional_start",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "hamstrings_knee_flexion": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 7,
          "authorisedFloor": 5,
          "authorisedCeiling": 10,
          "target": {
            "min": 6,
            "max": 14
          },
          "calibrationRequired": false,
          "retainedHistoryEffect": "productive_baseline",
          "reasonCodes": [
            "experience:intermediate",
            "region:hamstrings_knee_flexion",
            "current_training_preserves_experience_baseline",
            "retained_productive_history_supports_one_set_above_provisional_start",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "hip_extension": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 9,
          "authorisedFloor": 6,
          "authorisedCeiling": 12,
          "target": {
            "min": 8,
            "max": 16
          },
          "calibrationRequired": false,
          "retainedHistoryEffect": "productive_baseline",
          "reasonCodes": [
            "experience:intermediate",
            "region:hip_extension",
            "current_training_preserves_experience_baseline",
            "retained_productive_history_supports_one_set_above_provisional_start",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "calves": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 7,
          "authorisedFloor": 5,
          "authorisedCeiling": 10,
          "target": {
            "min": 6,
            "max": 14
          },
          "calibrationRequired": false,
          "retainedHistoryEffect": "productive_baseline",
          "reasonCodes": [
            "experience:intermediate",
            "region:calves",
            "current_training_preserves_experience_baseline",
            "retained_productive_history_supports_one_set_above_provisional_start",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "core": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 3,
          "authorisedFloor": 1,
          "authorisedCeiling": 3,
          "target": {
            "min": 2,
            "max": 6
          },
          "calibrationRequired": false,
          "retainedHistoryEffect": "productive_baseline",
          "reasonCodes": [
            "experience:intermediate",
            "region:core",
            "current_training_preserves_experience_baseline",
            "retained_productive_history_supports_one_set_above_provisional_start",
            "ordinary_recovery_supports_resolved_start"
          ]
        }
      },
      "totalDirectSets": 97,
      "expectedSessionMinutes": "resolved_after_exact_slot_allocation",
      "reason": "productive_history_supports_bounded_start"
    },
    {
      "experience": "intermediate",
      "profile": "high-demonstrated-capacity",
      "context": {
        "continuity": "currently_training",
        "recentTrainingDaysPerWeek": 5,
        "recentSessionWorkload": "moderate",
        "recentSessionDurationMinutes": 60,
        "recovery": "high",
        "history": "established_productive",
        "workCapacity": "demonstrated_high",
        "concurrentSport": "none",
        "loadConfidence": "established",
        "dosageConfidence": "canonical_productive_history"
      },
      "frequency": {
        "chest": 1.67,
        "lats": 1.67,
        "upper_back": 1.67,
        "anterior_delts": 1.67,
        "lateral_delts": 1.67,
        "rear_delts": 1.67,
        "triceps": 1.67,
        "biceps": 1.67,
        "quadriceps": 1.67,
        "hamstrings_knee_flexion": 1.67,
        "hip_extension": 1.67,
        "calves": 1.67,
        "core": 0.83
      },
      "muscles": {
        "chest": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 12,
          "authorisedFloor": 6,
          "authorisedCeiling": 12,
          "target": {
            "min": 8,
            "max": 16
          },
          "calibrationRequired": false,
          "retainedHistoryEffect": "demonstrated_upper_start",
          "reasonCodes": [
            "experience:intermediate",
            "region:chest",
            "current_training_preserves_experience_baseline",
            "retained_productive_history_supports_one_set_above_provisional_start",
            "productive_history_and_high_capacity_authorise_upper_start"
          ]
        },
        "lats": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 12,
          "authorisedFloor": 6,
          "authorisedCeiling": 12,
          "target": {
            "min": 8,
            "max": 16
          },
          "calibrationRequired": false,
          "retainedHistoryEffect": "demonstrated_upper_start",
          "reasonCodes": [
            "experience:intermediate",
            "region:lats",
            "current_training_preserves_experience_baseline",
            "retained_productive_history_supports_one_set_above_provisional_start",
            "productive_history_and_high_capacity_authorise_upper_start"
          ]
        },
        "upper_back": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 12,
          "authorisedFloor": 6,
          "authorisedCeiling": 12,
          "target": {
            "min": 8,
            "max": 16
          },
          "calibrationRequired": false,
          "retainedHistoryEffect": "demonstrated_upper_start",
          "reasonCodes": [
            "experience:intermediate",
            "region:upper_back",
            "current_training_preserves_experience_baseline",
            "retained_productive_history_supports_one_set_above_provisional_start",
            "productive_history_and_high_capacity_authorise_upper_start"
          ]
        },
        "anterior_delts": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 10,
          "authorisedFloor": 5,
          "authorisedCeiling": 10,
          "target": {
            "min": 6,
            "max": 14
          },
          "calibrationRequired": false,
          "retainedHistoryEffect": "demonstrated_upper_start",
          "reasonCodes": [
            "experience:intermediate",
            "region:anterior_delts",
            "current_training_preserves_experience_baseline",
            "retained_productive_history_supports_one_set_above_provisional_start",
            "productive_history_and_high_capacity_authorise_upper_start"
          ]
        },
        "lateral_delts": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 10,
          "authorisedFloor": 5,
          "authorisedCeiling": 10,
          "target": {
            "min": 6,
            "max": 14
          },
          "calibrationRequired": false,
          "retainedHistoryEffect": "demonstrated_upper_start",
          "reasonCodes": [
            "experience:intermediate",
            "region:lateral_delts",
            "current_training_preserves_experience_baseline",
            "retained_productive_history_supports_one_set_above_provisional_start",
            "productive_history_and_high_capacity_authorise_upper_start"
          ]
        },
        "rear_delts": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 10,
          "authorisedFloor": 5,
          "authorisedCeiling": 10,
          "target": {
            "min": 6,
            "max": 14
          },
          "calibrationRequired": false,
          "retainedHistoryEffect": "demonstrated_upper_start",
          "reasonCodes": [
            "experience:intermediate",
            "region:rear_delts",
            "current_training_preserves_experience_baseline",
            "retained_productive_history_supports_one_set_above_provisional_start",
            "productive_history_and_high_capacity_authorise_upper_start"
          ]
        },
        "triceps": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 10,
          "authorisedFloor": 5,
          "authorisedCeiling": 10,
          "target": {
            "min": 6,
            "max": 14
          },
          "calibrationRequired": false,
          "retainedHistoryEffect": "demonstrated_upper_start",
          "reasonCodes": [
            "experience:intermediate",
            "region:triceps",
            "current_training_preserves_experience_baseline",
            "retained_productive_history_supports_one_set_above_provisional_start",
            "productive_history_and_high_capacity_authorise_upper_start"
          ]
        },
        "biceps": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 10,
          "authorisedFloor": 5,
          "authorisedCeiling": 10,
          "target": {
            "min": 6,
            "max": 14
          },
          "calibrationRequired": false,
          "retainedHistoryEffect": "demonstrated_upper_start",
          "reasonCodes": [
            "experience:intermediate",
            "region:biceps",
            "current_training_preserves_experience_baseline",
            "retained_productive_history_supports_one_set_above_provisional_start",
            "productive_history_and_high_capacity_authorise_upper_start"
          ]
        },
        "quadriceps": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 12,
          "authorisedFloor": 6,
          "authorisedCeiling": 12,
          "target": {
            "min": 8,
            "max": 16
          },
          "calibrationRequired": false,
          "retainedHistoryEffect": "demonstrated_upper_start",
          "reasonCodes": [
            "experience:intermediate",
            "region:quadriceps",
            "current_training_preserves_experience_baseline",
            "retained_productive_history_supports_one_set_above_provisional_start",
            "productive_history_and_high_capacity_authorise_upper_start"
          ]
        },
        "hamstrings_knee_flexion": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 10,
          "authorisedFloor": 5,
          "authorisedCeiling": 10,
          "target": {
            "min": 6,
            "max": 14
          },
          "calibrationRequired": false,
          "retainedHistoryEffect": "demonstrated_upper_start",
          "reasonCodes": [
            "experience:intermediate",
            "region:hamstrings_knee_flexion",
            "current_training_preserves_experience_baseline",
            "retained_productive_history_supports_one_set_above_provisional_start",
            "productive_history_and_high_capacity_authorise_upper_start"
          ]
        },
        "hip_extension": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 12,
          "authorisedFloor": 6,
          "authorisedCeiling": 12,
          "target": {
            "min": 8,
            "max": 16
          },
          "calibrationRequired": false,
          "retainedHistoryEffect": "demonstrated_upper_start",
          "reasonCodes": [
            "experience:intermediate",
            "region:hip_extension",
            "current_training_preserves_experience_baseline",
            "retained_productive_history_supports_one_set_above_provisional_start",
            "productive_history_and_high_capacity_authorise_upper_start"
          ]
        },
        "calves": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 10,
          "authorisedFloor": 5,
          "authorisedCeiling": 10,
          "target": {
            "min": 6,
            "max": 14
          },
          "calibrationRequired": false,
          "retainedHistoryEffect": "demonstrated_upper_start",
          "reasonCodes": [
            "experience:intermediate",
            "region:calves",
            "current_training_preserves_experience_baseline",
            "retained_productive_history_supports_one_set_above_provisional_start",
            "productive_history_and_high_capacity_authorise_upper_start"
          ]
        },
        "core": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 3,
          "authorisedFloor": 1,
          "authorisedCeiling": 3,
          "target": {
            "min": 2,
            "max": 6
          },
          "calibrationRequired": false,
          "retainedHistoryEffect": "demonstrated_upper_start",
          "reasonCodes": [
            "experience:intermediate",
            "region:core",
            "current_training_preserves_experience_baseline",
            "retained_productive_history_supports_one_set_above_provisional_start",
            "productive_history_and_high_capacity_authorise_upper_start"
          ]
        }
      },
      "totalDirectSets": 133,
      "expectedSessionMinutes": "resolved_after_exact_slot_allocation",
      "reason": "upper_start_requires_productive_history_and_high_capacity"
    },
    {
      "experience": "intermediate",
      "profile": "concurrent-sport-no-history",
      "context": {
        "continuity": "currently_training",
        "recentTrainingDaysPerWeek": 5,
        "recentSessionWorkload": "moderate",
        "recentSessionDurationMinutes": 60,
        "recovery": "ordinary",
        "history": "none",
        "workCapacity": "not_demonstrated",
        "concurrentSport": "lower_body_loading",
        "loadConfidence": "calibration_required",
        "dosageConfidence": "declared_recent_training"
      },
      "frequency": {
        "chest": 1.67,
        "lats": 1.67,
        "upper_back": 1.67,
        "anterior_delts": 1.67,
        "lateral_delts": 1.67,
        "rear_delts": 1.67,
        "triceps": 1.67,
        "biceps": 1.67,
        "quadriceps": 1.67,
        "hamstrings_knee_flexion": 1.67,
        "hip_extension": 1.67,
        "calves": 1.67,
        "core": 0.83
      },
      "muscles": {
        "chest": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 8,
          "authorisedFloor": 6,
          "authorisedCeiling": 12,
          "target": {
            "min": 8,
            "max": 16
          },
          "calibrationRequired": true,
          "retainedHistoryEffect": "declared_training_baseline",
          "reasonCodes": [
            "experience:intermediate",
            "region:chest",
            "current_training_preserves_experience_baseline",
            "missing_app_history_lowers_dosage_confidence_not_experience",
            "load_calibration_required_independent_of_dosage",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "lats": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 8,
          "authorisedFloor": 6,
          "authorisedCeiling": 12,
          "target": {
            "min": 8,
            "max": 16
          },
          "calibrationRequired": true,
          "retainedHistoryEffect": "declared_training_baseline",
          "reasonCodes": [
            "experience:intermediate",
            "region:lats",
            "current_training_preserves_experience_baseline",
            "missing_app_history_lowers_dosage_confidence_not_experience",
            "load_calibration_required_independent_of_dosage",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "upper_back": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 8,
          "authorisedFloor": 6,
          "authorisedCeiling": 12,
          "target": {
            "min": 8,
            "max": 16
          },
          "calibrationRequired": true,
          "retainedHistoryEffect": "declared_training_baseline",
          "reasonCodes": [
            "experience:intermediate",
            "region:upper_back",
            "current_training_preserves_experience_baseline",
            "missing_app_history_lowers_dosage_confidence_not_experience",
            "load_calibration_required_independent_of_dosage",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "anterior_delts": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 6,
          "authorisedFloor": 5,
          "authorisedCeiling": 10,
          "target": {
            "min": 6,
            "max": 14
          },
          "calibrationRequired": true,
          "retainedHistoryEffect": "declared_training_baseline",
          "reasonCodes": [
            "experience:intermediate",
            "region:anterior_delts",
            "current_training_preserves_experience_baseline",
            "missing_app_history_lowers_dosage_confidence_not_experience",
            "load_calibration_required_independent_of_dosage",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "lateral_delts": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 6,
          "authorisedFloor": 5,
          "authorisedCeiling": 10,
          "target": {
            "min": 6,
            "max": 14
          },
          "calibrationRequired": true,
          "retainedHistoryEffect": "declared_training_baseline",
          "reasonCodes": [
            "experience:intermediate",
            "region:lateral_delts",
            "current_training_preserves_experience_baseline",
            "missing_app_history_lowers_dosage_confidence_not_experience",
            "load_calibration_required_independent_of_dosage",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "rear_delts": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 6,
          "authorisedFloor": 5,
          "authorisedCeiling": 10,
          "target": {
            "min": 6,
            "max": 14
          },
          "calibrationRequired": true,
          "retainedHistoryEffect": "declared_training_baseline",
          "reasonCodes": [
            "experience:intermediate",
            "region:rear_delts",
            "current_training_preserves_experience_baseline",
            "missing_app_history_lowers_dosage_confidence_not_experience",
            "load_calibration_required_independent_of_dosage",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "triceps": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 6,
          "authorisedFloor": 5,
          "authorisedCeiling": 10,
          "target": {
            "min": 6,
            "max": 14
          },
          "calibrationRequired": true,
          "retainedHistoryEffect": "declared_training_baseline",
          "reasonCodes": [
            "experience:intermediate",
            "region:triceps",
            "current_training_preserves_experience_baseline",
            "missing_app_history_lowers_dosage_confidence_not_experience",
            "load_calibration_required_independent_of_dosage",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "biceps": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 6,
          "authorisedFloor": 5,
          "authorisedCeiling": 10,
          "target": {
            "min": 6,
            "max": 14
          },
          "calibrationRequired": true,
          "retainedHistoryEffect": "declared_training_baseline",
          "reasonCodes": [
            "experience:intermediate",
            "region:biceps",
            "current_training_preserves_experience_baseline",
            "missing_app_history_lowers_dosage_confidence_not_experience",
            "load_calibration_required_independent_of_dosage",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "quadriceps": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 6,
          "authorisedFloor": 6,
          "authorisedCeiling": 12,
          "target": {
            "min": 8,
            "max": 16
          },
          "calibrationRequired": true,
          "retainedHistoryEffect": "declared_training_baseline",
          "reasonCodes": [
            "experience:intermediate",
            "region:quadriceps",
            "current_training_preserves_experience_baseline",
            "missing_app_history_lowers_dosage_confidence_not_experience",
            "concurrent_lower_body_workload_reduces_starting_resistance_dose",
            "load_calibration_required_independent_of_dosage",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "hamstrings_knee_flexion": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 5,
          "authorisedFloor": 5,
          "authorisedCeiling": 10,
          "target": {
            "min": 6,
            "max": 14
          },
          "calibrationRequired": true,
          "retainedHistoryEffect": "declared_training_baseline",
          "reasonCodes": [
            "experience:intermediate",
            "region:hamstrings_knee_flexion",
            "current_training_preserves_experience_baseline",
            "missing_app_history_lowers_dosage_confidence_not_experience",
            "concurrent_lower_body_workload_reduces_starting_resistance_dose",
            "load_calibration_required_independent_of_dosage",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "hip_extension": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 6,
          "authorisedFloor": 6,
          "authorisedCeiling": 12,
          "target": {
            "min": 8,
            "max": 16
          },
          "calibrationRequired": true,
          "retainedHistoryEffect": "declared_training_baseline",
          "reasonCodes": [
            "experience:intermediate",
            "region:hip_extension",
            "current_training_preserves_experience_baseline",
            "missing_app_history_lowers_dosage_confidence_not_experience",
            "concurrent_lower_body_workload_reduces_starting_resistance_dose",
            "load_calibration_required_independent_of_dosage",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "calves": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 5,
          "authorisedFloor": 5,
          "authorisedCeiling": 10,
          "target": {
            "min": 6,
            "max": 14
          },
          "calibrationRequired": true,
          "retainedHistoryEffect": "declared_training_baseline",
          "reasonCodes": [
            "experience:intermediate",
            "region:calves",
            "current_training_preserves_experience_baseline",
            "missing_app_history_lowers_dosage_confidence_not_experience",
            "concurrent_lower_body_workload_reduces_starting_resistance_dose",
            "load_calibration_required_independent_of_dosage",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "core": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 2,
          "authorisedFloor": 1,
          "authorisedCeiling": 3,
          "target": {
            "min": 2,
            "max": 6
          },
          "calibrationRequired": true,
          "retainedHistoryEffect": "declared_training_baseline",
          "reasonCodes": [
            "experience:intermediate",
            "region:core",
            "current_training_preserves_experience_baseline",
            "missing_app_history_lowers_dosage_confidence_not_experience",
            "load_calibration_required_independent_of_dosage",
            "ordinary_recovery_supports_resolved_start"
          ]
        }
      },
      "totalDirectSets": 78,
      "expectedSessionMinutes": "resolved_after_exact_slot_allocation",
      "reason": "declared_recent_training_start_with_load_calibration"
    },
    {
      "experience": "intermediate",
      "profile": "concurrent-sport-productive-history",
      "context": {
        "continuity": "currently_training",
        "recentTrainingDaysPerWeek": 5,
        "recentSessionWorkload": "moderate",
        "recentSessionDurationMinutes": 60,
        "recovery": "ordinary",
        "history": "established_productive",
        "workCapacity": "not_demonstrated",
        "concurrentSport": "lower_body_loading",
        "loadConfidence": "established",
        "dosageConfidence": "canonical_productive_history"
      },
      "frequency": {
        "chest": 1.67,
        "lats": 1.67,
        "upper_back": 1.67,
        "anterior_delts": 1.67,
        "lateral_delts": 1.67,
        "rear_delts": 1.67,
        "triceps": 1.67,
        "biceps": 1.67,
        "quadriceps": 1.67,
        "hamstrings_knee_flexion": 1.67,
        "hip_extension": 1.67,
        "calves": 1.67,
        "core": 0.83
      },
      "muscles": {
        "chest": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 9,
          "authorisedFloor": 6,
          "authorisedCeiling": 12,
          "target": {
            "min": 8,
            "max": 16
          },
          "calibrationRequired": false,
          "retainedHistoryEffect": "productive_baseline",
          "reasonCodes": [
            "experience:intermediate",
            "region:chest",
            "current_training_preserves_experience_baseline",
            "retained_productive_history_supports_one_set_above_provisional_start",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "lats": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 9,
          "authorisedFloor": 6,
          "authorisedCeiling": 12,
          "target": {
            "min": 8,
            "max": 16
          },
          "calibrationRequired": false,
          "retainedHistoryEffect": "productive_baseline",
          "reasonCodes": [
            "experience:intermediate",
            "region:lats",
            "current_training_preserves_experience_baseline",
            "retained_productive_history_supports_one_set_above_provisional_start",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "upper_back": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 9,
          "authorisedFloor": 6,
          "authorisedCeiling": 12,
          "target": {
            "min": 8,
            "max": 16
          },
          "calibrationRequired": false,
          "retainedHistoryEffect": "productive_baseline",
          "reasonCodes": [
            "experience:intermediate",
            "region:upper_back",
            "current_training_preserves_experience_baseline",
            "retained_productive_history_supports_one_set_above_provisional_start",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "anterior_delts": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 7,
          "authorisedFloor": 5,
          "authorisedCeiling": 10,
          "target": {
            "min": 6,
            "max": 14
          },
          "calibrationRequired": false,
          "retainedHistoryEffect": "productive_baseline",
          "reasonCodes": [
            "experience:intermediate",
            "region:anterior_delts",
            "current_training_preserves_experience_baseline",
            "retained_productive_history_supports_one_set_above_provisional_start",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "lateral_delts": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 7,
          "authorisedFloor": 5,
          "authorisedCeiling": 10,
          "target": {
            "min": 6,
            "max": 14
          },
          "calibrationRequired": false,
          "retainedHistoryEffect": "productive_baseline",
          "reasonCodes": [
            "experience:intermediate",
            "region:lateral_delts",
            "current_training_preserves_experience_baseline",
            "retained_productive_history_supports_one_set_above_provisional_start",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "rear_delts": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 7,
          "authorisedFloor": 5,
          "authorisedCeiling": 10,
          "target": {
            "min": 6,
            "max": 14
          },
          "calibrationRequired": false,
          "retainedHistoryEffect": "productive_baseline",
          "reasonCodes": [
            "experience:intermediate",
            "region:rear_delts",
            "current_training_preserves_experience_baseline",
            "retained_productive_history_supports_one_set_above_provisional_start",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "triceps": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 7,
          "authorisedFloor": 5,
          "authorisedCeiling": 10,
          "target": {
            "min": 6,
            "max": 14
          },
          "calibrationRequired": false,
          "retainedHistoryEffect": "productive_baseline",
          "reasonCodes": [
            "experience:intermediate",
            "region:triceps",
            "current_training_preserves_experience_baseline",
            "retained_productive_history_supports_one_set_above_provisional_start",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "biceps": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 7,
          "authorisedFloor": 5,
          "authorisedCeiling": 10,
          "target": {
            "min": 6,
            "max": 14
          },
          "calibrationRequired": false,
          "retainedHistoryEffect": "productive_baseline",
          "reasonCodes": [
            "experience:intermediate",
            "region:biceps",
            "current_training_preserves_experience_baseline",
            "retained_productive_history_supports_one_set_above_provisional_start",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "quadriceps": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 7,
          "authorisedFloor": 6,
          "authorisedCeiling": 12,
          "target": {
            "min": 8,
            "max": 16
          },
          "calibrationRequired": false,
          "retainedHistoryEffect": "productive_baseline",
          "reasonCodes": [
            "experience:intermediate",
            "region:quadriceps",
            "current_training_preserves_experience_baseline",
            "retained_productive_history_supports_one_set_above_provisional_start",
            "concurrent_lower_body_workload_reduces_starting_resistance_dose",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "hamstrings_knee_flexion": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 6,
          "authorisedFloor": 5,
          "authorisedCeiling": 10,
          "target": {
            "min": 6,
            "max": 14
          },
          "calibrationRequired": false,
          "retainedHistoryEffect": "productive_baseline",
          "reasonCodes": [
            "experience:intermediate",
            "region:hamstrings_knee_flexion",
            "current_training_preserves_experience_baseline",
            "retained_productive_history_supports_one_set_above_provisional_start",
            "concurrent_lower_body_workload_reduces_starting_resistance_dose",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "hip_extension": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 7,
          "authorisedFloor": 6,
          "authorisedCeiling": 12,
          "target": {
            "min": 8,
            "max": 16
          },
          "calibrationRequired": false,
          "retainedHistoryEffect": "productive_baseline",
          "reasonCodes": [
            "experience:intermediate",
            "region:hip_extension",
            "current_training_preserves_experience_baseline",
            "retained_productive_history_supports_one_set_above_provisional_start",
            "concurrent_lower_body_workload_reduces_starting_resistance_dose",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "calves": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 6,
          "authorisedFloor": 5,
          "authorisedCeiling": 10,
          "target": {
            "min": 6,
            "max": 14
          },
          "calibrationRequired": false,
          "retainedHistoryEffect": "productive_baseline",
          "reasonCodes": [
            "experience:intermediate",
            "region:calves",
            "current_training_preserves_experience_baseline",
            "retained_productive_history_supports_one_set_above_provisional_start",
            "concurrent_lower_body_workload_reduces_starting_resistance_dose",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "core": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 3,
          "authorisedFloor": 1,
          "authorisedCeiling": 3,
          "target": {
            "min": 2,
            "max": 6
          },
          "calibrationRequired": false,
          "retainedHistoryEffect": "productive_baseline",
          "reasonCodes": [
            "experience:intermediate",
            "region:core",
            "current_training_preserves_experience_baseline",
            "retained_productive_history_supports_one_set_above_provisional_start",
            "ordinary_recovery_supports_resolved_start"
          ]
        }
      },
      "totalDirectSets": 91,
      "expectedSessionMinutes": "resolved_after_exact_slot_allocation",
      "reason": "productive_history_supports_bounded_start"
    },
    {
      "experience": "advanced",
      "profile": "low-acceptable-recovery-no-history",
      "context": {
        "continuity": "currently_training",
        "recentTrainingDaysPerWeek": 5,
        "recentSessionWorkload": "moderate",
        "recentSessionDurationMinutes": 60,
        "recovery": "low_acceptable",
        "history": "none",
        "workCapacity": "not_demonstrated",
        "concurrentSport": "none",
        "loadConfidence": "calibration_required",
        "dosageConfidence": "declared_recent_training"
      },
      "frequency": {
        "chest": 1.67,
        "lats": 1.67,
        "upper_back": 1.67,
        "anterior_delts": 1.67,
        "lateral_delts": 1.67,
        "rear_delts": 1.67,
        "triceps": 1.67,
        "biceps": 1.67,
        "quadriceps": 1.67,
        "hamstrings_knee_flexion": 1.67,
        "hip_extension": 1.67,
        "calves": 1.67,
        "core": 0.83
      },
      "muscles": {
        "chest": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 8,
          "authorisedFloor": 8,
          "authorisedCeiling": 14,
          "target": {
            "min": 10,
            "max": 20
          },
          "calibrationRequired": true,
          "retainedHistoryEffect": "declared_training_baseline",
          "reasonCodes": [
            "experience:advanced",
            "region:chest",
            "current_training_preserves_experience_baseline",
            "missing_app_history_lowers_dosage_confidence_not_experience",
            "low_acceptable_recovery_reduces_start",
            "load_calibration_required_independent_of_dosage"
          ]
        },
        "lats": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 8,
          "authorisedFloor": 8,
          "authorisedCeiling": 14,
          "target": {
            "min": 10,
            "max": 20
          },
          "calibrationRequired": true,
          "retainedHistoryEffect": "declared_training_baseline",
          "reasonCodes": [
            "experience:advanced",
            "region:lats",
            "current_training_preserves_experience_baseline",
            "missing_app_history_lowers_dosage_confidence_not_experience",
            "low_acceptable_recovery_reduces_start",
            "load_calibration_required_independent_of_dosage"
          ]
        },
        "upper_back": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 8,
          "authorisedFloor": 8,
          "authorisedCeiling": 14,
          "target": {
            "min": 10,
            "max": 20
          },
          "calibrationRequired": true,
          "retainedHistoryEffect": "declared_training_baseline",
          "reasonCodes": [
            "experience:advanced",
            "region:upper_back",
            "current_training_preserves_experience_baseline",
            "missing_app_history_lowers_dosage_confidence_not_experience",
            "low_acceptable_recovery_reduces_start",
            "load_calibration_required_independent_of_dosage"
          ]
        },
        "anterior_delts": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 7,
          "authorisedFloor": 7,
          "authorisedCeiling": 12,
          "target": {
            "min": 8,
            "max": 16
          },
          "calibrationRequired": true,
          "retainedHistoryEffect": "declared_training_baseline",
          "reasonCodes": [
            "experience:advanced",
            "region:anterior_delts",
            "current_training_preserves_experience_baseline",
            "missing_app_history_lowers_dosage_confidence_not_experience",
            "low_acceptable_recovery_reduces_start",
            "load_calibration_required_independent_of_dosage"
          ]
        },
        "lateral_delts": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 7,
          "authorisedFloor": 7,
          "authorisedCeiling": 12,
          "target": {
            "min": 8,
            "max": 16
          },
          "calibrationRequired": true,
          "retainedHistoryEffect": "declared_training_baseline",
          "reasonCodes": [
            "experience:advanced",
            "region:lateral_delts",
            "current_training_preserves_experience_baseline",
            "missing_app_history_lowers_dosage_confidence_not_experience",
            "low_acceptable_recovery_reduces_start",
            "load_calibration_required_independent_of_dosage"
          ]
        },
        "rear_delts": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 7,
          "authorisedFloor": 7,
          "authorisedCeiling": 12,
          "target": {
            "min": 8,
            "max": 16
          },
          "calibrationRequired": true,
          "retainedHistoryEffect": "declared_training_baseline",
          "reasonCodes": [
            "experience:advanced",
            "region:rear_delts",
            "current_training_preserves_experience_baseline",
            "missing_app_history_lowers_dosage_confidence_not_experience",
            "low_acceptable_recovery_reduces_start",
            "load_calibration_required_independent_of_dosage"
          ]
        },
        "triceps": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 7,
          "authorisedFloor": 7,
          "authorisedCeiling": 12,
          "target": {
            "min": 8,
            "max": 16
          },
          "calibrationRequired": true,
          "retainedHistoryEffect": "declared_training_baseline",
          "reasonCodes": [
            "experience:advanced",
            "region:triceps",
            "current_training_preserves_experience_baseline",
            "missing_app_history_lowers_dosage_confidence_not_experience",
            "low_acceptable_recovery_reduces_start",
            "load_calibration_required_independent_of_dosage"
          ]
        },
        "biceps": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 7,
          "authorisedFloor": 7,
          "authorisedCeiling": 12,
          "target": {
            "min": 8,
            "max": 16
          },
          "calibrationRequired": true,
          "retainedHistoryEffect": "declared_training_baseline",
          "reasonCodes": [
            "experience:advanced",
            "region:biceps",
            "current_training_preserves_experience_baseline",
            "missing_app_history_lowers_dosage_confidence_not_experience",
            "low_acceptable_recovery_reduces_start",
            "load_calibration_required_independent_of_dosage"
          ]
        },
        "quadriceps": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 8,
          "authorisedFloor": 8,
          "authorisedCeiling": 14,
          "target": {
            "min": 10,
            "max": 20
          },
          "calibrationRequired": true,
          "retainedHistoryEffect": "declared_training_baseline",
          "reasonCodes": [
            "experience:advanced",
            "region:quadriceps",
            "current_training_preserves_experience_baseline",
            "missing_app_history_lowers_dosage_confidence_not_experience",
            "low_acceptable_recovery_reduces_start",
            "load_calibration_required_independent_of_dosage"
          ]
        },
        "hamstrings_knee_flexion": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 7,
          "authorisedFloor": 7,
          "authorisedCeiling": 12,
          "target": {
            "min": 8,
            "max": 16
          },
          "calibrationRequired": true,
          "retainedHistoryEffect": "declared_training_baseline",
          "reasonCodes": [
            "experience:advanced",
            "region:hamstrings_knee_flexion",
            "current_training_preserves_experience_baseline",
            "missing_app_history_lowers_dosage_confidence_not_experience",
            "low_acceptable_recovery_reduces_start",
            "load_calibration_required_independent_of_dosage"
          ]
        },
        "hip_extension": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 8,
          "authorisedFloor": 8,
          "authorisedCeiling": 14,
          "target": {
            "min": 10,
            "max": 20
          },
          "calibrationRequired": true,
          "retainedHistoryEffect": "declared_training_baseline",
          "reasonCodes": [
            "experience:advanced",
            "region:hip_extension",
            "current_training_preserves_experience_baseline",
            "missing_app_history_lowers_dosage_confidence_not_experience",
            "low_acceptable_recovery_reduces_start",
            "load_calibration_required_independent_of_dosage"
          ]
        },
        "calves": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 7,
          "authorisedFloor": 7,
          "authorisedCeiling": 12,
          "target": {
            "min": 8,
            "max": 16
          },
          "calibrationRequired": true,
          "retainedHistoryEffect": "declared_training_baseline",
          "reasonCodes": [
            "experience:advanced",
            "region:calves",
            "current_training_preserves_experience_baseline",
            "missing_app_history_lowers_dosage_confidence_not_experience",
            "low_acceptable_recovery_reduces_start",
            "load_calibration_required_independent_of_dosage"
          ]
        },
        "core": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 1,
          "authorisedFloor": 1,
          "authorisedCeiling": 4,
          "target": {
            "min": 2,
            "max": 8
          },
          "calibrationRequired": true,
          "retainedHistoryEffect": "declared_training_baseline",
          "reasonCodes": [
            "experience:advanced",
            "region:core",
            "current_training_preserves_experience_baseline",
            "missing_app_history_lowers_dosage_confidence_not_experience",
            "low_acceptable_recovery_reduces_start",
            "load_calibration_required_independent_of_dosage"
          ]
        }
      },
      "totalDirectSets": 90,
      "expectedSessionMinutes": "resolved_after_exact_slot_allocation",
      "reason": "declared_recent_training_start_with_load_calibration"
    },
    {
      "experience": "advanced",
      "profile": "ordinary-recovery-no-history",
      "context": {
        "continuity": "currently_training",
        "recentTrainingDaysPerWeek": 5,
        "recentSessionWorkload": "moderate",
        "recentSessionDurationMinutes": 60,
        "recovery": "ordinary",
        "history": "none",
        "workCapacity": "not_demonstrated",
        "concurrentSport": "none",
        "loadConfidence": "calibration_required",
        "dosageConfidence": "declared_recent_training"
      },
      "frequency": {
        "chest": 1.67,
        "lats": 1.67,
        "upper_back": 1.67,
        "anterior_delts": 1.67,
        "lateral_delts": 1.67,
        "rear_delts": 1.67,
        "triceps": 1.67,
        "biceps": 1.67,
        "quadriceps": 1.67,
        "hamstrings_knee_flexion": 1.67,
        "hip_extension": 1.67,
        "calves": 1.67,
        "core": 0.83
      },
      "muscles": {
        "chest": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 10,
          "authorisedFloor": 8,
          "authorisedCeiling": 14,
          "target": {
            "min": 10,
            "max": 20
          },
          "calibrationRequired": true,
          "retainedHistoryEffect": "declared_training_baseline",
          "reasonCodes": [
            "experience:advanced",
            "region:chest",
            "current_training_preserves_experience_baseline",
            "missing_app_history_lowers_dosage_confidence_not_experience",
            "load_calibration_required_independent_of_dosage",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "lats": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 10,
          "authorisedFloor": 8,
          "authorisedCeiling": 14,
          "target": {
            "min": 10,
            "max": 20
          },
          "calibrationRequired": true,
          "retainedHistoryEffect": "declared_training_baseline",
          "reasonCodes": [
            "experience:advanced",
            "region:lats",
            "current_training_preserves_experience_baseline",
            "missing_app_history_lowers_dosage_confidence_not_experience",
            "load_calibration_required_independent_of_dosage",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "upper_back": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 10,
          "authorisedFloor": 8,
          "authorisedCeiling": 14,
          "target": {
            "min": 10,
            "max": 20
          },
          "calibrationRequired": true,
          "retainedHistoryEffect": "declared_training_baseline",
          "reasonCodes": [
            "experience:advanced",
            "region:upper_back",
            "current_training_preserves_experience_baseline",
            "missing_app_history_lowers_dosage_confidence_not_experience",
            "load_calibration_required_independent_of_dosage",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "anterior_delts": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 8,
          "authorisedFloor": 7,
          "authorisedCeiling": 12,
          "target": {
            "min": 8,
            "max": 16
          },
          "calibrationRequired": true,
          "retainedHistoryEffect": "declared_training_baseline",
          "reasonCodes": [
            "experience:advanced",
            "region:anterior_delts",
            "current_training_preserves_experience_baseline",
            "missing_app_history_lowers_dosage_confidence_not_experience",
            "load_calibration_required_independent_of_dosage",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "lateral_delts": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 8,
          "authorisedFloor": 7,
          "authorisedCeiling": 12,
          "target": {
            "min": 8,
            "max": 16
          },
          "calibrationRequired": true,
          "retainedHistoryEffect": "declared_training_baseline",
          "reasonCodes": [
            "experience:advanced",
            "region:lateral_delts",
            "current_training_preserves_experience_baseline",
            "missing_app_history_lowers_dosage_confidence_not_experience",
            "load_calibration_required_independent_of_dosage",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "rear_delts": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 8,
          "authorisedFloor": 7,
          "authorisedCeiling": 12,
          "target": {
            "min": 8,
            "max": 16
          },
          "calibrationRequired": true,
          "retainedHistoryEffect": "declared_training_baseline",
          "reasonCodes": [
            "experience:advanced",
            "region:rear_delts",
            "current_training_preserves_experience_baseline",
            "missing_app_history_lowers_dosage_confidence_not_experience",
            "load_calibration_required_independent_of_dosage",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "triceps": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 8,
          "authorisedFloor": 7,
          "authorisedCeiling": 12,
          "target": {
            "min": 8,
            "max": 16
          },
          "calibrationRequired": true,
          "retainedHistoryEffect": "declared_training_baseline",
          "reasonCodes": [
            "experience:advanced",
            "region:triceps",
            "current_training_preserves_experience_baseline",
            "missing_app_history_lowers_dosage_confidence_not_experience",
            "load_calibration_required_independent_of_dosage",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "biceps": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 8,
          "authorisedFloor": 7,
          "authorisedCeiling": 12,
          "target": {
            "min": 8,
            "max": 16
          },
          "calibrationRequired": true,
          "retainedHistoryEffect": "declared_training_baseline",
          "reasonCodes": [
            "experience:advanced",
            "region:biceps",
            "current_training_preserves_experience_baseline",
            "missing_app_history_lowers_dosage_confidence_not_experience",
            "load_calibration_required_independent_of_dosage",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "quadriceps": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 10,
          "authorisedFloor": 8,
          "authorisedCeiling": 14,
          "target": {
            "min": 10,
            "max": 20
          },
          "calibrationRequired": true,
          "retainedHistoryEffect": "declared_training_baseline",
          "reasonCodes": [
            "experience:advanced",
            "region:quadriceps",
            "current_training_preserves_experience_baseline",
            "missing_app_history_lowers_dosage_confidence_not_experience",
            "load_calibration_required_independent_of_dosage",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "hamstrings_knee_flexion": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 8,
          "authorisedFloor": 7,
          "authorisedCeiling": 12,
          "target": {
            "min": 8,
            "max": 16
          },
          "calibrationRequired": true,
          "retainedHistoryEffect": "declared_training_baseline",
          "reasonCodes": [
            "experience:advanced",
            "region:hamstrings_knee_flexion",
            "current_training_preserves_experience_baseline",
            "missing_app_history_lowers_dosage_confidence_not_experience",
            "load_calibration_required_independent_of_dosage",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "hip_extension": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 10,
          "authorisedFloor": 8,
          "authorisedCeiling": 14,
          "target": {
            "min": 10,
            "max": 20
          },
          "calibrationRequired": true,
          "retainedHistoryEffect": "declared_training_baseline",
          "reasonCodes": [
            "experience:advanced",
            "region:hip_extension",
            "current_training_preserves_experience_baseline",
            "missing_app_history_lowers_dosage_confidence_not_experience",
            "load_calibration_required_independent_of_dosage",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "calves": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 8,
          "authorisedFloor": 7,
          "authorisedCeiling": 12,
          "target": {
            "min": 8,
            "max": 16
          },
          "calibrationRequired": true,
          "retainedHistoryEffect": "declared_training_baseline",
          "reasonCodes": [
            "experience:advanced",
            "region:calves",
            "current_training_preserves_experience_baseline",
            "missing_app_history_lowers_dosage_confidence_not_experience",
            "load_calibration_required_independent_of_dosage",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "core": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 2,
          "authorisedFloor": 1,
          "authorisedCeiling": 4,
          "target": {
            "min": 2,
            "max": 8
          },
          "calibrationRequired": true,
          "retainedHistoryEffect": "declared_training_baseline",
          "reasonCodes": [
            "experience:advanced",
            "region:core",
            "current_training_preserves_experience_baseline",
            "missing_app_history_lowers_dosage_confidence_not_experience",
            "load_calibration_required_independent_of_dosage",
            "ordinary_recovery_supports_resolved_start"
          ]
        }
      },
      "totalDirectSets": 108,
      "expectedSessionMinutes": "resolved_after_exact_slot_allocation",
      "reason": "declared_recent_training_start_with_load_calibration"
    },
    {
      "experience": "advanced",
      "profile": "ordinary-recovery-productive-history",
      "context": {
        "continuity": "currently_training",
        "recentTrainingDaysPerWeek": 5,
        "recentSessionWorkload": "moderate",
        "recentSessionDurationMinutes": 60,
        "recovery": "ordinary",
        "history": "established_productive",
        "workCapacity": "not_demonstrated",
        "concurrentSport": "none",
        "loadConfidence": "established",
        "dosageConfidence": "canonical_productive_history"
      },
      "frequency": {
        "chest": 1.67,
        "lats": 1.67,
        "upper_back": 1.67,
        "anterior_delts": 1.67,
        "lateral_delts": 1.67,
        "rear_delts": 1.67,
        "triceps": 1.67,
        "biceps": 1.67,
        "quadriceps": 1.67,
        "hamstrings_knee_flexion": 1.67,
        "hip_extension": 1.67,
        "calves": 1.67,
        "core": 0.83
      },
      "muscles": {
        "chest": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 11,
          "authorisedFloor": 8,
          "authorisedCeiling": 14,
          "target": {
            "min": 10,
            "max": 20
          },
          "calibrationRequired": false,
          "retainedHistoryEffect": "productive_baseline",
          "reasonCodes": [
            "experience:advanced",
            "region:chest",
            "current_training_preserves_experience_baseline",
            "retained_productive_history_supports_one_set_above_provisional_start",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "lats": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 11,
          "authorisedFloor": 8,
          "authorisedCeiling": 14,
          "target": {
            "min": 10,
            "max": 20
          },
          "calibrationRequired": false,
          "retainedHistoryEffect": "productive_baseline",
          "reasonCodes": [
            "experience:advanced",
            "region:lats",
            "current_training_preserves_experience_baseline",
            "retained_productive_history_supports_one_set_above_provisional_start",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "upper_back": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 11,
          "authorisedFloor": 8,
          "authorisedCeiling": 14,
          "target": {
            "min": 10,
            "max": 20
          },
          "calibrationRequired": false,
          "retainedHistoryEffect": "productive_baseline",
          "reasonCodes": [
            "experience:advanced",
            "region:upper_back",
            "current_training_preserves_experience_baseline",
            "retained_productive_history_supports_one_set_above_provisional_start",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "anterior_delts": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 9,
          "authorisedFloor": 7,
          "authorisedCeiling": 12,
          "target": {
            "min": 8,
            "max": 16
          },
          "calibrationRequired": false,
          "retainedHistoryEffect": "productive_baseline",
          "reasonCodes": [
            "experience:advanced",
            "region:anterior_delts",
            "current_training_preserves_experience_baseline",
            "retained_productive_history_supports_one_set_above_provisional_start",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "lateral_delts": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 9,
          "authorisedFloor": 7,
          "authorisedCeiling": 12,
          "target": {
            "min": 8,
            "max": 16
          },
          "calibrationRequired": false,
          "retainedHistoryEffect": "productive_baseline",
          "reasonCodes": [
            "experience:advanced",
            "region:lateral_delts",
            "current_training_preserves_experience_baseline",
            "retained_productive_history_supports_one_set_above_provisional_start",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "rear_delts": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 9,
          "authorisedFloor": 7,
          "authorisedCeiling": 12,
          "target": {
            "min": 8,
            "max": 16
          },
          "calibrationRequired": false,
          "retainedHistoryEffect": "productive_baseline",
          "reasonCodes": [
            "experience:advanced",
            "region:rear_delts",
            "current_training_preserves_experience_baseline",
            "retained_productive_history_supports_one_set_above_provisional_start",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "triceps": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 9,
          "authorisedFloor": 7,
          "authorisedCeiling": 12,
          "target": {
            "min": 8,
            "max": 16
          },
          "calibrationRequired": false,
          "retainedHistoryEffect": "productive_baseline",
          "reasonCodes": [
            "experience:advanced",
            "region:triceps",
            "current_training_preserves_experience_baseline",
            "retained_productive_history_supports_one_set_above_provisional_start",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "biceps": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 9,
          "authorisedFloor": 7,
          "authorisedCeiling": 12,
          "target": {
            "min": 8,
            "max": 16
          },
          "calibrationRequired": false,
          "retainedHistoryEffect": "productive_baseline",
          "reasonCodes": [
            "experience:advanced",
            "region:biceps",
            "current_training_preserves_experience_baseline",
            "retained_productive_history_supports_one_set_above_provisional_start",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "quadriceps": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 11,
          "authorisedFloor": 8,
          "authorisedCeiling": 14,
          "target": {
            "min": 10,
            "max": 20
          },
          "calibrationRequired": false,
          "retainedHistoryEffect": "productive_baseline",
          "reasonCodes": [
            "experience:advanced",
            "region:quadriceps",
            "current_training_preserves_experience_baseline",
            "retained_productive_history_supports_one_set_above_provisional_start",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "hamstrings_knee_flexion": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 9,
          "authorisedFloor": 7,
          "authorisedCeiling": 12,
          "target": {
            "min": 8,
            "max": 16
          },
          "calibrationRequired": false,
          "retainedHistoryEffect": "productive_baseline",
          "reasonCodes": [
            "experience:advanced",
            "region:hamstrings_knee_flexion",
            "current_training_preserves_experience_baseline",
            "retained_productive_history_supports_one_set_above_provisional_start",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "hip_extension": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 11,
          "authorisedFloor": 8,
          "authorisedCeiling": 14,
          "target": {
            "min": 10,
            "max": 20
          },
          "calibrationRequired": false,
          "retainedHistoryEffect": "productive_baseline",
          "reasonCodes": [
            "experience:advanced",
            "region:hip_extension",
            "current_training_preserves_experience_baseline",
            "retained_productive_history_supports_one_set_above_provisional_start",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "calves": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 9,
          "authorisedFloor": 7,
          "authorisedCeiling": 12,
          "target": {
            "min": 8,
            "max": 16
          },
          "calibrationRequired": false,
          "retainedHistoryEffect": "productive_baseline",
          "reasonCodes": [
            "experience:advanced",
            "region:calves",
            "current_training_preserves_experience_baseline",
            "retained_productive_history_supports_one_set_above_provisional_start",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "core": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 3,
          "authorisedFloor": 1,
          "authorisedCeiling": 4,
          "target": {
            "min": 2,
            "max": 8
          },
          "calibrationRequired": false,
          "retainedHistoryEffect": "productive_baseline",
          "reasonCodes": [
            "experience:advanced",
            "region:core",
            "current_training_preserves_experience_baseline",
            "retained_productive_history_supports_one_set_above_provisional_start",
            "ordinary_recovery_supports_resolved_start"
          ]
        }
      },
      "totalDirectSets": 121,
      "expectedSessionMinutes": "resolved_after_exact_slot_allocation",
      "reason": "productive_history_supports_bounded_start"
    },
    {
      "experience": "advanced",
      "profile": "high-demonstrated-capacity",
      "context": {
        "continuity": "currently_training",
        "recentTrainingDaysPerWeek": 5,
        "recentSessionWorkload": "moderate",
        "recentSessionDurationMinutes": 60,
        "recovery": "high",
        "history": "established_productive",
        "workCapacity": "demonstrated_high",
        "concurrentSport": "none",
        "loadConfidence": "established",
        "dosageConfidence": "canonical_productive_history"
      },
      "frequency": {
        "chest": 1.67,
        "lats": 1.67,
        "upper_back": 1.67,
        "anterior_delts": 1.67,
        "lateral_delts": 1.67,
        "rear_delts": 1.67,
        "triceps": 1.67,
        "biceps": 1.67,
        "quadriceps": 1.67,
        "hamstrings_knee_flexion": 1.67,
        "hip_extension": 1.67,
        "calves": 1.67,
        "core": 0.83
      },
      "muscles": {
        "chest": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 14,
          "authorisedFloor": 8,
          "authorisedCeiling": 14,
          "target": {
            "min": 10,
            "max": 20
          },
          "calibrationRequired": false,
          "retainedHistoryEffect": "demonstrated_upper_start",
          "reasonCodes": [
            "experience:advanced",
            "region:chest",
            "current_training_preserves_experience_baseline",
            "retained_productive_history_supports_one_set_above_provisional_start",
            "productive_history_and_high_capacity_authorise_upper_start"
          ]
        },
        "lats": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 14,
          "authorisedFloor": 8,
          "authorisedCeiling": 14,
          "target": {
            "min": 10,
            "max": 20
          },
          "calibrationRequired": false,
          "retainedHistoryEffect": "demonstrated_upper_start",
          "reasonCodes": [
            "experience:advanced",
            "region:lats",
            "current_training_preserves_experience_baseline",
            "retained_productive_history_supports_one_set_above_provisional_start",
            "productive_history_and_high_capacity_authorise_upper_start"
          ]
        },
        "upper_back": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 14,
          "authorisedFloor": 8,
          "authorisedCeiling": 14,
          "target": {
            "min": 10,
            "max": 20
          },
          "calibrationRequired": false,
          "retainedHistoryEffect": "demonstrated_upper_start",
          "reasonCodes": [
            "experience:advanced",
            "region:upper_back",
            "current_training_preserves_experience_baseline",
            "retained_productive_history_supports_one_set_above_provisional_start",
            "productive_history_and_high_capacity_authorise_upper_start"
          ]
        },
        "anterior_delts": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 12,
          "authorisedFloor": 7,
          "authorisedCeiling": 12,
          "target": {
            "min": 8,
            "max": 16
          },
          "calibrationRequired": false,
          "retainedHistoryEffect": "demonstrated_upper_start",
          "reasonCodes": [
            "experience:advanced",
            "region:anterior_delts",
            "current_training_preserves_experience_baseline",
            "retained_productive_history_supports_one_set_above_provisional_start",
            "productive_history_and_high_capacity_authorise_upper_start"
          ]
        },
        "lateral_delts": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 12,
          "authorisedFloor": 7,
          "authorisedCeiling": 12,
          "target": {
            "min": 8,
            "max": 16
          },
          "calibrationRequired": false,
          "retainedHistoryEffect": "demonstrated_upper_start",
          "reasonCodes": [
            "experience:advanced",
            "region:lateral_delts",
            "current_training_preserves_experience_baseline",
            "retained_productive_history_supports_one_set_above_provisional_start",
            "productive_history_and_high_capacity_authorise_upper_start"
          ]
        },
        "rear_delts": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 12,
          "authorisedFloor": 7,
          "authorisedCeiling": 12,
          "target": {
            "min": 8,
            "max": 16
          },
          "calibrationRequired": false,
          "retainedHistoryEffect": "demonstrated_upper_start",
          "reasonCodes": [
            "experience:advanced",
            "region:rear_delts",
            "current_training_preserves_experience_baseline",
            "retained_productive_history_supports_one_set_above_provisional_start",
            "productive_history_and_high_capacity_authorise_upper_start"
          ]
        },
        "triceps": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 12,
          "authorisedFloor": 7,
          "authorisedCeiling": 12,
          "target": {
            "min": 8,
            "max": 16
          },
          "calibrationRequired": false,
          "retainedHistoryEffect": "demonstrated_upper_start",
          "reasonCodes": [
            "experience:advanced",
            "region:triceps",
            "current_training_preserves_experience_baseline",
            "retained_productive_history_supports_one_set_above_provisional_start",
            "productive_history_and_high_capacity_authorise_upper_start"
          ]
        },
        "biceps": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 12,
          "authorisedFloor": 7,
          "authorisedCeiling": 12,
          "target": {
            "min": 8,
            "max": 16
          },
          "calibrationRequired": false,
          "retainedHistoryEffect": "demonstrated_upper_start",
          "reasonCodes": [
            "experience:advanced",
            "region:biceps",
            "current_training_preserves_experience_baseline",
            "retained_productive_history_supports_one_set_above_provisional_start",
            "productive_history_and_high_capacity_authorise_upper_start"
          ]
        },
        "quadriceps": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 14,
          "authorisedFloor": 8,
          "authorisedCeiling": 14,
          "target": {
            "min": 10,
            "max": 20
          },
          "calibrationRequired": false,
          "retainedHistoryEffect": "demonstrated_upper_start",
          "reasonCodes": [
            "experience:advanced",
            "region:quadriceps",
            "current_training_preserves_experience_baseline",
            "retained_productive_history_supports_one_set_above_provisional_start",
            "productive_history_and_high_capacity_authorise_upper_start"
          ]
        },
        "hamstrings_knee_flexion": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 12,
          "authorisedFloor": 7,
          "authorisedCeiling": 12,
          "target": {
            "min": 8,
            "max": 16
          },
          "calibrationRequired": false,
          "retainedHistoryEffect": "demonstrated_upper_start",
          "reasonCodes": [
            "experience:advanced",
            "region:hamstrings_knee_flexion",
            "current_training_preserves_experience_baseline",
            "retained_productive_history_supports_one_set_above_provisional_start",
            "productive_history_and_high_capacity_authorise_upper_start"
          ]
        },
        "hip_extension": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 14,
          "authorisedFloor": 8,
          "authorisedCeiling": 14,
          "target": {
            "min": 10,
            "max": 20
          },
          "calibrationRequired": false,
          "retainedHistoryEffect": "demonstrated_upper_start",
          "reasonCodes": [
            "experience:advanced",
            "region:hip_extension",
            "current_training_preserves_experience_baseline",
            "retained_productive_history_supports_one_set_above_provisional_start",
            "productive_history_and_high_capacity_authorise_upper_start"
          ]
        },
        "calves": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 12,
          "authorisedFloor": 7,
          "authorisedCeiling": 12,
          "target": {
            "min": 8,
            "max": 16
          },
          "calibrationRequired": false,
          "retainedHistoryEffect": "demonstrated_upper_start",
          "reasonCodes": [
            "experience:advanced",
            "region:calves",
            "current_training_preserves_experience_baseline",
            "retained_productive_history_supports_one_set_above_provisional_start",
            "productive_history_and_high_capacity_authorise_upper_start"
          ]
        },
        "core": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 4,
          "authorisedFloor": 1,
          "authorisedCeiling": 4,
          "target": {
            "min": 2,
            "max": 8
          },
          "calibrationRequired": false,
          "retainedHistoryEffect": "demonstrated_upper_start",
          "reasonCodes": [
            "experience:advanced",
            "region:core",
            "current_training_preserves_experience_baseline",
            "retained_productive_history_supports_one_set_above_provisional_start",
            "productive_history_and_high_capacity_authorise_upper_start"
          ]
        }
      },
      "totalDirectSets": 158,
      "expectedSessionMinutes": "resolved_after_exact_slot_allocation",
      "reason": "upper_start_requires_productive_history_and_high_capacity"
    },
    {
      "experience": "advanced",
      "profile": "concurrent-sport-no-history",
      "context": {
        "continuity": "currently_training",
        "recentTrainingDaysPerWeek": 5,
        "recentSessionWorkload": "moderate",
        "recentSessionDurationMinutes": 60,
        "recovery": "ordinary",
        "history": "none",
        "workCapacity": "not_demonstrated",
        "concurrentSport": "lower_body_loading",
        "loadConfidence": "calibration_required",
        "dosageConfidence": "declared_recent_training"
      },
      "frequency": {
        "chest": 1.67,
        "lats": 1.67,
        "upper_back": 1.67,
        "anterior_delts": 1.67,
        "lateral_delts": 1.67,
        "rear_delts": 1.67,
        "triceps": 1.67,
        "biceps": 1.67,
        "quadriceps": 1.67,
        "hamstrings_knee_flexion": 1.67,
        "hip_extension": 1.67,
        "calves": 1.67,
        "core": 0.83
      },
      "muscles": {
        "chest": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 10,
          "authorisedFloor": 8,
          "authorisedCeiling": 14,
          "target": {
            "min": 10,
            "max": 20
          },
          "calibrationRequired": true,
          "retainedHistoryEffect": "declared_training_baseline",
          "reasonCodes": [
            "experience:advanced",
            "region:chest",
            "current_training_preserves_experience_baseline",
            "missing_app_history_lowers_dosage_confidence_not_experience",
            "load_calibration_required_independent_of_dosage",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "lats": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 10,
          "authorisedFloor": 8,
          "authorisedCeiling": 14,
          "target": {
            "min": 10,
            "max": 20
          },
          "calibrationRequired": true,
          "retainedHistoryEffect": "declared_training_baseline",
          "reasonCodes": [
            "experience:advanced",
            "region:lats",
            "current_training_preserves_experience_baseline",
            "missing_app_history_lowers_dosage_confidence_not_experience",
            "load_calibration_required_independent_of_dosage",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "upper_back": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 10,
          "authorisedFloor": 8,
          "authorisedCeiling": 14,
          "target": {
            "min": 10,
            "max": 20
          },
          "calibrationRequired": true,
          "retainedHistoryEffect": "declared_training_baseline",
          "reasonCodes": [
            "experience:advanced",
            "region:upper_back",
            "current_training_preserves_experience_baseline",
            "missing_app_history_lowers_dosage_confidence_not_experience",
            "load_calibration_required_independent_of_dosage",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "anterior_delts": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 8,
          "authorisedFloor": 7,
          "authorisedCeiling": 12,
          "target": {
            "min": 8,
            "max": 16
          },
          "calibrationRequired": true,
          "retainedHistoryEffect": "declared_training_baseline",
          "reasonCodes": [
            "experience:advanced",
            "region:anterior_delts",
            "current_training_preserves_experience_baseline",
            "missing_app_history_lowers_dosage_confidence_not_experience",
            "load_calibration_required_independent_of_dosage",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "lateral_delts": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 8,
          "authorisedFloor": 7,
          "authorisedCeiling": 12,
          "target": {
            "min": 8,
            "max": 16
          },
          "calibrationRequired": true,
          "retainedHistoryEffect": "declared_training_baseline",
          "reasonCodes": [
            "experience:advanced",
            "region:lateral_delts",
            "current_training_preserves_experience_baseline",
            "missing_app_history_lowers_dosage_confidence_not_experience",
            "load_calibration_required_independent_of_dosage",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "rear_delts": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 8,
          "authorisedFloor": 7,
          "authorisedCeiling": 12,
          "target": {
            "min": 8,
            "max": 16
          },
          "calibrationRequired": true,
          "retainedHistoryEffect": "declared_training_baseline",
          "reasonCodes": [
            "experience:advanced",
            "region:rear_delts",
            "current_training_preserves_experience_baseline",
            "missing_app_history_lowers_dosage_confidence_not_experience",
            "load_calibration_required_independent_of_dosage",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "triceps": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 8,
          "authorisedFloor": 7,
          "authorisedCeiling": 12,
          "target": {
            "min": 8,
            "max": 16
          },
          "calibrationRequired": true,
          "retainedHistoryEffect": "declared_training_baseline",
          "reasonCodes": [
            "experience:advanced",
            "region:triceps",
            "current_training_preserves_experience_baseline",
            "missing_app_history_lowers_dosage_confidence_not_experience",
            "load_calibration_required_independent_of_dosage",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "biceps": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 8,
          "authorisedFloor": 7,
          "authorisedCeiling": 12,
          "target": {
            "min": 8,
            "max": 16
          },
          "calibrationRequired": true,
          "retainedHistoryEffect": "declared_training_baseline",
          "reasonCodes": [
            "experience:advanced",
            "region:biceps",
            "current_training_preserves_experience_baseline",
            "missing_app_history_lowers_dosage_confidence_not_experience",
            "load_calibration_required_independent_of_dosage",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "quadriceps": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 8,
          "authorisedFloor": 8,
          "authorisedCeiling": 14,
          "target": {
            "min": 10,
            "max": 20
          },
          "calibrationRequired": true,
          "retainedHistoryEffect": "declared_training_baseline",
          "reasonCodes": [
            "experience:advanced",
            "region:quadriceps",
            "current_training_preserves_experience_baseline",
            "missing_app_history_lowers_dosage_confidence_not_experience",
            "concurrent_lower_body_workload_reduces_starting_resistance_dose",
            "load_calibration_required_independent_of_dosage",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "hamstrings_knee_flexion": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 7,
          "authorisedFloor": 7,
          "authorisedCeiling": 12,
          "target": {
            "min": 8,
            "max": 16
          },
          "calibrationRequired": true,
          "retainedHistoryEffect": "declared_training_baseline",
          "reasonCodes": [
            "experience:advanced",
            "region:hamstrings_knee_flexion",
            "current_training_preserves_experience_baseline",
            "missing_app_history_lowers_dosage_confidence_not_experience",
            "concurrent_lower_body_workload_reduces_starting_resistance_dose",
            "load_calibration_required_independent_of_dosage",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "hip_extension": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 8,
          "authorisedFloor": 8,
          "authorisedCeiling": 14,
          "target": {
            "min": 10,
            "max": 20
          },
          "calibrationRequired": true,
          "retainedHistoryEffect": "declared_training_baseline",
          "reasonCodes": [
            "experience:advanced",
            "region:hip_extension",
            "current_training_preserves_experience_baseline",
            "missing_app_history_lowers_dosage_confidence_not_experience",
            "concurrent_lower_body_workload_reduces_starting_resistance_dose",
            "load_calibration_required_independent_of_dosage",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "calves": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 7,
          "authorisedFloor": 7,
          "authorisedCeiling": 12,
          "target": {
            "min": 8,
            "max": 16
          },
          "calibrationRequired": true,
          "retainedHistoryEffect": "declared_training_baseline",
          "reasonCodes": [
            "experience:advanced",
            "region:calves",
            "current_training_preserves_experience_baseline",
            "missing_app_history_lowers_dosage_confidence_not_experience",
            "concurrent_lower_body_workload_reduces_starting_resistance_dose",
            "load_calibration_required_independent_of_dosage",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "core": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 2,
          "authorisedFloor": 1,
          "authorisedCeiling": 4,
          "target": {
            "min": 2,
            "max": 8
          },
          "calibrationRequired": true,
          "retainedHistoryEffect": "declared_training_baseline",
          "reasonCodes": [
            "experience:advanced",
            "region:core",
            "current_training_preserves_experience_baseline",
            "missing_app_history_lowers_dosage_confidence_not_experience",
            "load_calibration_required_independent_of_dosage",
            "ordinary_recovery_supports_resolved_start"
          ]
        }
      },
      "totalDirectSets": 102,
      "expectedSessionMinutes": "resolved_after_exact_slot_allocation",
      "reason": "declared_recent_training_start_with_load_calibration"
    },
    {
      "experience": "advanced",
      "profile": "concurrent-sport-productive-history",
      "context": {
        "continuity": "currently_training",
        "recentTrainingDaysPerWeek": 5,
        "recentSessionWorkload": "moderate",
        "recentSessionDurationMinutes": 60,
        "recovery": "ordinary",
        "history": "established_productive",
        "workCapacity": "not_demonstrated",
        "concurrentSport": "lower_body_loading",
        "loadConfidence": "established",
        "dosageConfidence": "canonical_productive_history"
      },
      "frequency": {
        "chest": 1.67,
        "lats": 1.67,
        "upper_back": 1.67,
        "anterior_delts": 1.67,
        "lateral_delts": 1.67,
        "rear_delts": 1.67,
        "triceps": 1.67,
        "biceps": 1.67,
        "quadriceps": 1.67,
        "hamstrings_knee_flexion": 1.67,
        "hip_extension": 1.67,
        "calves": 1.67,
        "core": 0.83
      },
      "muscles": {
        "chest": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 11,
          "authorisedFloor": 8,
          "authorisedCeiling": 14,
          "target": {
            "min": 10,
            "max": 20
          },
          "calibrationRequired": false,
          "retainedHistoryEffect": "productive_baseline",
          "reasonCodes": [
            "experience:advanced",
            "region:chest",
            "current_training_preserves_experience_baseline",
            "retained_productive_history_supports_one_set_above_provisional_start",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "lats": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 11,
          "authorisedFloor": 8,
          "authorisedCeiling": 14,
          "target": {
            "min": 10,
            "max": 20
          },
          "calibrationRequired": false,
          "retainedHistoryEffect": "productive_baseline",
          "reasonCodes": [
            "experience:advanced",
            "region:lats",
            "current_training_preserves_experience_baseline",
            "retained_productive_history_supports_one_set_above_provisional_start",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "upper_back": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 11,
          "authorisedFloor": 8,
          "authorisedCeiling": 14,
          "target": {
            "min": 10,
            "max": 20
          },
          "calibrationRequired": false,
          "retainedHistoryEffect": "productive_baseline",
          "reasonCodes": [
            "experience:advanced",
            "region:upper_back",
            "current_training_preserves_experience_baseline",
            "retained_productive_history_supports_one_set_above_provisional_start",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "anterior_delts": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 9,
          "authorisedFloor": 7,
          "authorisedCeiling": 12,
          "target": {
            "min": 8,
            "max": 16
          },
          "calibrationRequired": false,
          "retainedHistoryEffect": "productive_baseline",
          "reasonCodes": [
            "experience:advanced",
            "region:anterior_delts",
            "current_training_preserves_experience_baseline",
            "retained_productive_history_supports_one_set_above_provisional_start",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "lateral_delts": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 9,
          "authorisedFloor": 7,
          "authorisedCeiling": 12,
          "target": {
            "min": 8,
            "max": 16
          },
          "calibrationRequired": false,
          "retainedHistoryEffect": "productive_baseline",
          "reasonCodes": [
            "experience:advanced",
            "region:lateral_delts",
            "current_training_preserves_experience_baseline",
            "retained_productive_history_supports_one_set_above_provisional_start",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "rear_delts": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 9,
          "authorisedFloor": 7,
          "authorisedCeiling": 12,
          "target": {
            "min": 8,
            "max": 16
          },
          "calibrationRequired": false,
          "retainedHistoryEffect": "productive_baseline",
          "reasonCodes": [
            "experience:advanced",
            "region:rear_delts",
            "current_training_preserves_experience_baseline",
            "retained_productive_history_supports_one_set_above_provisional_start",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "triceps": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 9,
          "authorisedFloor": 7,
          "authorisedCeiling": 12,
          "target": {
            "min": 8,
            "max": 16
          },
          "calibrationRequired": false,
          "retainedHistoryEffect": "productive_baseline",
          "reasonCodes": [
            "experience:advanced",
            "region:triceps",
            "current_training_preserves_experience_baseline",
            "retained_productive_history_supports_one_set_above_provisional_start",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "biceps": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 9,
          "authorisedFloor": 7,
          "authorisedCeiling": 12,
          "target": {
            "min": 8,
            "max": 16
          },
          "calibrationRequired": false,
          "retainedHistoryEffect": "productive_baseline",
          "reasonCodes": [
            "experience:advanced",
            "region:biceps",
            "current_training_preserves_experience_baseline",
            "retained_productive_history_supports_one_set_above_provisional_start",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "quadriceps": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 9,
          "authorisedFloor": 8,
          "authorisedCeiling": 14,
          "target": {
            "min": 10,
            "max": 20
          },
          "calibrationRequired": false,
          "retainedHistoryEffect": "productive_baseline",
          "reasonCodes": [
            "experience:advanced",
            "region:quadriceps",
            "current_training_preserves_experience_baseline",
            "retained_productive_history_supports_one_set_above_provisional_start",
            "concurrent_lower_body_workload_reduces_starting_resistance_dose",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "hamstrings_knee_flexion": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 8,
          "authorisedFloor": 7,
          "authorisedCeiling": 12,
          "target": {
            "min": 8,
            "max": 16
          },
          "calibrationRequired": false,
          "retainedHistoryEffect": "productive_baseline",
          "reasonCodes": [
            "experience:advanced",
            "region:hamstrings_knee_flexion",
            "current_training_preserves_experience_baseline",
            "retained_productive_history_supports_one_set_above_provisional_start",
            "concurrent_lower_body_workload_reduces_starting_resistance_dose",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "hip_extension": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 9,
          "authorisedFloor": 8,
          "authorisedCeiling": 14,
          "target": {
            "min": 10,
            "max": 20
          },
          "calibrationRequired": false,
          "retainedHistoryEffect": "productive_baseline",
          "reasonCodes": [
            "experience:advanced",
            "region:hip_extension",
            "current_training_preserves_experience_baseline",
            "retained_productive_history_supports_one_set_above_provisional_start",
            "concurrent_lower_body_workload_reduces_starting_resistance_dose",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "calves": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 8,
          "authorisedFloor": 7,
          "authorisedCeiling": 12,
          "target": {
            "min": 8,
            "max": 16
          },
          "calibrationRequired": false,
          "retainedHistoryEffect": "productive_baseline",
          "reasonCodes": [
            "experience:advanced",
            "region:calves",
            "current_training_preserves_experience_baseline",
            "retained_productive_history_supports_one_set_above_provisional_start",
            "concurrent_lower_body_workload_reduces_starting_resistance_dose",
            "ordinary_recovery_supports_resolved_start"
          ]
        },
        "core": {
          "policyId": "canonical_hypertrophy_volume_policy_v2",
          "startingDirectSets": 3,
          "authorisedFloor": 1,
          "authorisedCeiling": 4,
          "target": {
            "min": 2,
            "max": 8
          },
          "calibrationRequired": false,
          "retainedHistoryEffect": "productive_baseline",
          "reasonCodes": [
            "experience:advanced",
            "region:core",
            "current_training_preserves_experience_baseline",
            "retained_productive_history_supports_one_set_above_provisional_start",
            "ordinary_recovery_supports_resolved_start"
          ]
        }
      },
      "totalDirectSets": 115,
      "expectedSessionMinutes": "resolved_after_exact_slot_allocation",
      "reason": "productive_history_supports_bounded_start"
    }
  ]
}
```
