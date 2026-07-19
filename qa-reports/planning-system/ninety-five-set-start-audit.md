# Ninety Five Set Start Audit

Generated from `canonical_adaptive_planning_certification_v1`. This report is evidence, not a second planning authority.

```json
{
  "schemaVersion": "canonical_dosage_evolution_certification_v2",
  "firstCalendarSliceWorkingSets": 85,
  "completeRotationWorkingSets": 101,
  "averageSevenDayWorkingSets": 84.17,
  "userFactsAuthorisingStart": [
    "goal:build_muscle",
    "experience:intermediate",
    "recent_training:five_days_moderate_workload",
    "continuity:currently_training",
    "commitment:five_lifting_days",
    "framework:push_pull_legs",
    "equipment:full_gym",
    "recovery:ordinary",
    "history:no_comparable_completed_work",
    "load_state:calibration_required",
    "dosage_confidence:declared_recent_training"
  ],
  "demonstratedTolerance": false,
  "expectedRecoverability": "provisional_only; session duration and muscle-specific dosage are bounded, but completed comparable work must confirm tolerance before any increase",
  "classification": "experience_and_recent_training_baseline_reconciled_to_discrete_rotation",
  "retained": false,
  "rationale": "Production resolves each region from declared experience, recent training, continuity, recovery, sport and retained evidence, then allocates once across the complete six-session rotation. Missing app history keeps loads in calibration and progression confidence low; it does not force a minimum-volume floor. This case produces 101 raw rotation sets, 85 in the first calendar slice and 84.17 normalised sets per seven days without padding to a global total.",
  "contradictionResolved": {
    "previousRepresentativeRawRotation": 78,
    "previousRepresentativeNormalisedSevenDays": 65,
    "previousMatrixTotal": 65,
    "cause": "missing app history was incorrectly used as detraining and low-capacity evidence",
    "authoritativeOwner": "canonical_hypertrophy_volume_policy_v2 -> canonical_microcycle_volume_policy_v4 discrete allocation"
  },
  "excessiveDetection": [
    "three comparable observations required before any addition",
    "local drop-off removes one affected-region set first",
    "repeated local failure can remove two without crossing the starting floor",
    "systemic fatigue blocks additions and requires stress-reduction review"
  ],
  "firstChanges": [
    "hold all additions",
    "reduce one local low-benefit set when the affected region shows confirmed drop-off",
    "review systemic stress before any broad dosage change"
  ],
  "muscleSpecificComparison": {
    "chest": {
      "averageDirectSets": 8.33,
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
      "averageDirectSets": 8.33,
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
      "averageDirectSets": 8.33,
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
      "averageDirectSets": 5.83,
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
      "averageDirectSets": 5.83,
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
      "averageDirectSets": 5.83,
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
      "averageDirectSets": 5.83,
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
      "averageDirectSets": 5.83,
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
      "averageDirectSets": 8.33,
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
      "averageDirectSets": 5.83,
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
      "averageDirectSets": 8.33,
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
      "averageDirectSets": 5.83,
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
      "averageDirectSets": 1.67,
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
  }
}
```
