# Method Selection Policy

Generated from `canonical_adaptive_planning_certification_v1`. This report is evidence, not a second planning authority.

```json
{
  "schemaVersion": "canonical_adaptive_planning_certification_v1",
  "exactTargetPolicyId": "canonical_exact_target_policy_v1",
  "mesocycles": [
    {
      "id": "hypertrophy_calibration",
      "methods": {
        "permitted": [
          "straight_sets",
          "back_off_sets",
          "pyramid"
        ],
        "prohibited": [],
        "conditional": []
      }
    },
    {
      "id": "hypertrophy_base",
      "methods": {
        "permitted": [
          "straight_sets",
          "back_off_sets",
          "pyramid",
          "amrap"
        ],
        "prohibited": [],
        "conditional": []
      }
    },
    {
      "id": "hypertrophy_volume",
      "methods": {
        "permitted": [
          "straight_sets",
          "back_off_sets",
          "pyramid",
          "amrap",
          "antagonist_superset",
          "rest_pause",
          "eight_across"
        ],
        "prohibited": [],
        "conditional": []
      }
    },
    {
      "id": "hypertrophy_specialisation",
      "methods": {
        "permitted": [
          "straight_sets",
          "back_off_sets",
          "pyramid",
          "amrap",
          "antagonist_superset",
          "rest_pause",
          "eight_across"
        ],
        "prohibited": [],
        "conditional": []
      }
    },
    {
      "id": "hypertrophy_consolidation",
      "methods": {
        "permitted": [
          "straight_sets",
          "back_off_sets"
        ],
        "prohibited": [
          "amrap",
          "dynamic_effort",
          "max_effort",
          "heavy_single_triple_five_backoffs",
          "bbb"
        ],
        "conditional": []
      }
    },
    {
      "id": "hypertrophy_transition",
      "methods": {
        "permitted": [
          "straight_sets",
          "back_off_sets"
        ],
        "prohibited": [
          "amrap",
          "dynamic_effort",
          "max_effort",
          "heavy_single_triple_five_backoffs",
          "bbb"
        ],
        "conditional": []
      }
    },
    {
      "id": "powerbuilding_foundation",
      "methods": {
        "permitted": [
          "straight_sets",
          "back_off_sets",
          "pyramid"
        ],
        "prohibited": [],
        "conditional": []
      }
    },
    {
      "id": "powerbuilding_hypertrophy",
      "methods": {
        "permitted": [
          "straight_sets",
          "back_off_sets",
          "pyramid",
          "amrap",
          "antagonist_superset",
          "rest_pause",
          "eight_across",
          "bbb"
        ],
        "prohibited": [],
        "conditional": [
          "bbb"
        ]
      }
    },
    {
      "id": "powerbuilding_strength",
      "methods": {
        "permitted": [
          "straight_sets",
          "back_off_sets",
          "pyramid",
          "heavy_single_triple_five_backoffs",
          "five_three_one",
          "ladder"
        ],
        "prohibited": [],
        "conditional": []
      }
    },
    {
      "id": "powerbuilding_intensification",
      "methods": {
        "permitted": [
          "straight_sets",
          "back_off_sets",
          "pyramid",
          "dynamic_effort"
        ],
        "prohibited": [],
        "conditional": []
      }
    },
    {
      "id": "powerbuilding_realisation",
      "methods": {
        "permitted": [
          "straight_sets",
          "back_off_sets",
          "pyramid",
          "heavy_single_triple_five_backoffs"
        ],
        "prohibited": [],
        "conditional": []
      }
    },
    {
      "id": "powerbuilding_transition",
      "methods": {
        "permitted": [
          "straight_sets",
          "back_off_sets"
        ],
        "prohibited": [
          "amrap",
          "dynamic_effort",
          "max_effort",
          "heavy_single_triple_five_backoffs",
          "bbb"
        ],
        "conditional": []
      }
    },
    {
      "id": "strength_general",
      "methods": {
        "permitted": [
          "straight_sets",
          "back_off_sets",
          "pyramid",
          "heavy_single_triple_five_backoffs"
        ],
        "prohibited": [],
        "conditional": []
      }
    },
    {
      "id": "strength_accumulation",
      "methods": {
        "permitted": [
          "straight_sets",
          "back_off_sets",
          "pyramid",
          "heavy_single_triple_five_backoffs",
          "five_three_one",
          "ladder"
        ],
        "prohibited": [],
        "conditional": [
          "cluster",
          "ladder"
        ]
      }
    },
    {
      "id": "strength_specific",
      "methods": {
        "permitted": [
          "straight_sets",
          "back_off_sets",
          "pyramid",
          "heavy_single_triple_five_backoffs",
          "dynamic_effort",
          "cluster"
        ],
        "prohibited": [],
        "conditional": [
          "cluster",
          "ladder"
        ]
      }
    },
    {
      "id": "strength_intensification",
      "methods": {
        "permitted": [
          "straight_sets",
          "back_off_sets",
          "pyramid",
          "heavy_single_triple_five_backoffs",
          "dynamic_effort",
          "max_effort"
        ],
        "prohibited": [],
        "conditional": []
      }
    },
    {
      "id": "strength_taper",
      "methods": {
        "permitted": [
          "straight_sets",
          "back_off_sets"
        ],
        "prohibited": [
          "amrap",
          "eight_across",
          "max_effort",
          "bbb"
        ],
        "conditional": []
      }
    },
    {
      "id": "strength_transition",
      "methods": {
        "permitted": [
          "straight_sets",
          "back_off_sets"
        ],
        "prohibited": [
          "amrap",
          "dynamic_effort",
          "max_effort",
          "heavy_single_triple_five_backoffs",
          "bbb"
        ],
        "conditional": []
      }
    },
    {
      "id": "athletic_general",
      "methods": {
        "permitted": [
          "straight_sets",
          "back_off_sets",
          "pyramid",
          "antagonist_superset"
        ],
        "prohibited": [],
        "conditional": []
      }
    },
    {
      "id": "athletic_force",
      "methods": {
        "permitted": [
          "straight_sets",
          "back_off_sets",
          "pyramid",
          "cluster"
        ],
        "prohibited": [],
        "conditional": []
      }
    },
    {
      "id": "athletic_power",
      "methods": {
        "permitted": [
          "straight_sets",
          "back_off_sets",
          "pyramid",
          "dynamic_effort"
        ],
        "prohibited": [],
        "conditional": []
      }
    },
    {
      "id": "athletic_transition",
      "methods": {
        "permitted": [
          "straight_sets",
          "back_off_sets"
        ],
        "prohibited": [
          "amrap",
          "dynamic_effort",
          "max_effort",
          "heavy_single_triple_five_backoffs",
          "bbb"
        ],
        "conditional": []
      }
    }
  ],
  "observedMethods": [
    "antagonist_superset",
    "back_off_sets",
    "straight_sets"
  ]
}
```
