# Hypertrophy Volume Policy

Generated from `canonical_adaptive_planning_certification_v1`. This report is evidence, not a second planning authority.

```json
{
  "schemaVersion": "canonical_adaptive_planning_certification_v1",
  "allocatorPolicy": {
    "policyId": "canonical_microcycle_volume_policy_v4",
    "accountingConvention": "A working set counts once for every explicitly programmed direct stimulus region it meaningfully trains; it is not divided into fractional set-equivalents. Meaningful secondary stimulus and fatigue are reported separately and are not added to direct volume. These categories are guardrails, not claims of physiological precision.",
    "durationConvention": "Construction includes general warm-up, lift ramps, prescribed rest, set execution, equipment setup, exercise transitions, unilateral work, calibration and method overhead. Observed completed durations may calibrate future estimates without rewriting history.",
    "fatigueConvention": "The planning index weights primary, secondary and accessory sets 3/2/1 only to detect concentration and overlap. Exercise-level output retains the catalogue's factual high/moderate/low fatigue class.",
    "sourceReferences": [
      "docs/evidence-based-prescription-model.md#weekly-volume-targets",
      "docs/evidence-based-prescription-model.md#session-volume-targets",
      "src/domain/training/productive-set-targets.ts#targetTable",
      "src/domain/training/volume-landmarks.ts#getStartingVolumeLandmarks"
    ]
  },
  "volumePolicy": {
    "policyId": "canonical_hypertrophy_volume_policy_v2",
    "sourceReferences": [
      "docs/evidence-based-prescription-model.md#weekly-volume-targets",
      "docs/evidence-based-prescription-model.md#session-volume-targets",
      "src/domain/training/volume-landmarks.ts#getStartingVolumeLandmarks",
      "canonical-policy-source-corpus/13-Chad-Waterbury-s-Programs.pdf#printed-pages-1-2"
    ],
    "accounting": "Direct working sets are counted by explicitly programmed stimulus region. Secondary stimulus is reported separately and never silently promoted to a direct set.",
    "limitations": "Population ranges are product-policy authorisations, not a measured personal maximum. Missing app history lowers evidence confidence; only canonical comparable performed work can authorise later changes.",
    "progression": {
      "add": "Add one direct set to one local stimulus region only after at least three comparable completed observations show productive performance, recovery is acceptable, the region remains below target, and no rep drop-off or technique contraindication is present.",
      "retain": "Retain dosage when comparable performance is improving or stable inside the target range, or when evidence is not yet sufficient for a safe change.",
      "remove": "Remove one direct set from the affected region after confirmed local rep drop-off or local recovery failure; remove two only when the same fresh signal is repeated and the resulting dose remains above the starting floor.",
      "reallocate": "Reallocate one low-benefit accessory set to a lagging region only when systemic recovery is acceptable, the source region is at or above target, the destination is below target, and both regions have comparable evidence.",
      "systemic": "Systemic fatigue never triggers an automatic local increase. Hold all additions and require stress-reduction review; deload remains a separate Mesocycle decision."
    }
  },
  "previousFiveDayWorkingSets": 49,
  "correctedFiveDay": [
    {
      "id": "intermediate-hypertrophy-5-push_pull_legs-calibration",
      "totalWorkingSets": 85,
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
      "secondarySets": {
        "triceps": 17,
        "anterior_delts": 8,
        "biceps": 20,
        "rear_delts": 8,
        "upper_back": 10,
        "hip_extension": 4
      },
      "frequency": {
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
      }
    },
    {
      "id": "intermediate-hypertrophy-5-push_pull_legs-established",
      "totalWorkingSets": 95,
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
      "secondarySets": {
        "triceps": 19,
        "anterior_delts": 9,
        "biceps": 22,
        "rear_delts": 9,
        "upper_back": 11,
        "hip_extension": 4
      },
      "frequency": {
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
      }
    },
    {
      "id": "intermediate-hypertrophy-5-upper_lower-calibration",
      "totalWorkingSets": 70,
      "directSets": {
        "chest": 8,
        "upper_back": 10,
        "lats": 8,
        "lateral_delts": 6,
        "triceps": 6,
        "biceps": 6,
        "quadriceps": 8,
        "hip_extension": 8,
        "hamstrings_knee_flexion": 6,
        "calves": 6
      },
      "secondarySets": {
        "triceps": 8,
        "anterior_delts": 8,
        "biceps": 16,
        "rear_delts": 8,
        "hip_extension": 8,
        "upper_back": 2
      },
      "frequency": {
        "biceps": 3,
        "calves": 2,
        "chest": 3,
        "hamstrings_knee_flexion": 2,
        "hip_extension": 2,
        "lateral_delts": 3,
        "lats": 3,
        "quadriceps": 2,
        "triceps": 3,
        "upper_back": 3
      }
    },
    {
      "id": "intermediate-hypertrophy-5-upper_lower-established",
      "totalWorkingSets": 80,
      "directSets": {
        "chest": 9,
        "upper_back": 11,
        "lats": 9,
        "lateral_delts": 7,
        "triceps": 7,
        "biceps": 7,
        "quadriceps": 9,
        "hip_extension": 9,
        "hamstrings_knee_flexion": 7,
        "calves": 7
      },
      "secondarySets": {
        "triceps": 9,
        "anterior_delts": 9,
        "biceps": 18,
        "rear_delts": 9,
        "hip_extension": 9,
        "upper_back": 3
      },
      "frequency": {
        "biceps": 3,
        "calves": 2,
        "chest": 3,
        "hamstrings_knee_flexion": 2,
        "hip_extension": 2,
        "lateral_delts": 3,
        "lats": 3,
        "quadriceps": 2,
        "triceps": 3,
        "upper_back": 3
      }
    },
    {
      "id": "intermediate-hypertrophy-5-full_body-calibration",
      "totalWorkingSets": 42,
      "directSets": {
        "quadriceps": 8,
        "chest": 8,
        "upper_back": 8,
        "hip_extension": 8,
        "core": 2,
        "lats": 8
      },
      "secondarySets": {
        "hip_extension": 12,
        "triceps": 8,
        "biceps": 16,
        "rear_delts": 8,
        "upper_back": 8,
        "quadriceps": 2,
        "anterior_delts": 6
      },
      "frequency": {
        "chest": 4,
        "core": 1,
        "hip_extension": 4,
        "lats": 2,
        "quadriceps": 4,
        "upper_back": 3
      }
    },
    {
      "id": "intermediate-hypertrophy-5-full_body-established",
      "totalWorkingSets": 48,
      "directSets": {
        "quadriceps": 9,
        "chest": 9,
        "upper_back": 9,
        "hip_extension": 9,
        "core": 3,
        "lats": 9
      },
      "secondarySets": {
        "hip_extension": 13,
        "triceps": 9,
        "biceps": 18,
        "rear_delts": 9,
        "upper_back": 9,
        "quadriceps": 3,
        "anterior_delts": 6
      },
      "frequency": {
        "chest": 4,
        "core": 1,
        "hip_extension": 4,
        "lats": 2,
        "quadriceps": 4,
        "upper_back": 3
      }
    },
    {
      "id": "intermediate-hypertrophy-5-body_part_split-calibration",
      "totalWorkingSets": 82,
      "directSets": {
        "chest": 8,
        "anterior_delts": 6,
        "lateral_delts": 6,
        "upper_back": 8,
        "lats": 8,
        "rear_delts": 6,
        "triceps": 6,
        "calves": 6,
        "biceps": 6,
        "hamstrings_knee_flexion": 6,
        "quadriceps": 8,
        "hip_extension": 8
      },
      "secondarySets": {
        "triceps": 14,
        "anterior_delts": 8,
        "biceps": 16,
        "rear_delts": 8,
        "upper_back": 10,
        "hip_extension": 5
      },
      "frequency": {
        "anterior_delts": 2,
        "biceps": 1,
        "calves": 1,
        "chest": 1,
        "hamstrings_knee_flexion": 1,
        "hip_extension": 1,
        "lateral_delts": 2,
        "lats": 1,
        "quadriceps": 1,
        "rear_delts": 2,
        "triceps": 2,
        "upper_back": 1
      }
    },
    {
      "id": "intermediate-hypertrophy-5-body_part_split-established",
      "totalWorkingSets": 94,
      "directSets": {
        "chest": 9,
        "anterior_delts": 7,
        "lateral_delts": 7,
        "upper_back": 9,
        "lats": 9,
        "rear_delts": 7,
        "triceps": 7,
        "calves": 7,
        "biceps": 7,
        "hamstrings_knee_flexion": 7,
        "quadriceps": 9,
        "hip_extension": 9
      },
      "secondarySets": {
        "triceps": 16,
        "anterior_delts": 9,
        "biceps": 18,
        "rear_delts": 9,
        "upper_back": 12,
        "hip_extension": 5
      },
      "frequency": {
        "anterior_delts": 2,
        "biceps": 1,
        "calves": 1,
        "chest": 1,
        "hamstrings_knee_flexion": 1,
        "hip_extension": 1,
        "lateral_delts": 2,
        "lats": 1,
        "quadriceps": 1,
        "rear_delts": 2,
        "triceps": 2,
        "upper_back": 1
      }
    }
  ]
}
```
