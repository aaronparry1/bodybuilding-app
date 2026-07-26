# Method Evolution Certification

Generated from `canonical_adaptive_planning_certification_v1`. This report is evidence, not a second planning authority.

```json
{
  "schemaVersion": "canonical_dosage_evolution_certification_v2",
  "firstRotationReason": "The initial hypertrophy calibration Mesocycle owns stable, repeatable technique and load evidence; exact straight sets reduce ambiguity before comparable evidence exists.",
  "examples": [
    {
      "id": "calibration-straight",
      "goal": "build_muscle",
      "phase": "hypertrophy_calibration",
      "experience": "intermediate",
      "exercise": "Bench Press",
      "method": "straight_sets",
      "selectedByGovernance": {
        "selected": "exact_straight_sets",
        "mapsToExpected": true
      },
      "exactTargets": [
        6,
        6,
        6,
        6
      ],
      "targetKinds": [
        "reps",
        "reps",
        "reps",
        "reps"
      ],
      "restSeconds": 180,
      "progression": "Progress through the method's exact target sequence inside the Mesocycle envelope.",
      "stopRule": "Stop on missed target, material rep drop-off or technique loss.",
      "exitRule": [
        "Main movement and muscle data exists"
      ],
      "why": "Exact straight-set targets are the default progression method."
    },
    {
      "id": "base-pyramid",
      "goal": "build_muscle",
      "phase": "hypertrophy_base",
      "experience": "intermediate",
      "exercise": "Bench Press",
      "method": "pyramid",
      "selectedByGovernance": {
        "selected": "pyramid",
        "mapsToExpected": true
      },
      "exactTargets": [
        8,
        6,
        4,
        8
      ],
      "targetKinds": [
        "reps",
        "reps",
        "reps",
        "reps"
      ],
      "restSeconds": 180,
      "progression": "Progress through the method's exact target sequence inside the Mesocycle envelope.",
      "stopRule": "Stop on missed target, material rep drop-off or technique loss.",
      "exitRule": [
        "Broad slowing, fatigue or duration limit"
      ],
      "why": "An exact ascending loading sequence; decisive sets control progression."
    },
    {
      "id": "volume-capped-amrap",
      "goal": "build_muscle",
      "phase": "hypertrophy_volume",
      "experience": "intermediate",
      "exercise": "Cable Curl",
      "method": "amrap",
      "selectedByGovernance": {
        "selected": "controlled_performance_set",
        "mapsToExpected": true
      },
      "exactTargets": [
        12,
        12,
        12
      ],
      "targetKinds": [
        "reps",
        "reps",
        "amrap"
      ],
      "restSeconds": 75,
      "progression": "Progress only after the capped performance set remains technically valid and recovery is acceptable.",
      "stopRule": "Stop at the prescribed rep cap or first technical breakdown.",
      "exitRule": [
        "Dose identified or recovery ceiling"
      ],
      "why": "A capped assessment set with technical stop rules."
    },
    {
      "id": "strength-top-and-backoffs",
      "goal": "build_strength",
      "phase": "strength_specific",
      "experience": "intermediate",
      "exercise": "Bench Press",
      "method": "back_off_sets",
      "selectedByGovernance": {
        "selected": "top_set_backoffs",
        "mapsToExpected": true
      },
      "exactTargets": [
        3,
        5,
        5,
        5
      ],
      "targetKinds": [
        "reps",
        "reps",
        "reps",
        "reps"
      ],
      "restSeconds": 180,
      "progression": "Progress through the method's exact target sequence inside the Mesocycle envelope.",
      "stopRule": "Stop on missed target, material rep drop-off or technique loss.",
      "exitRule": [
        "Peak or fatigue"
      ],
      "why": "Heavy evidence followed by pre-authorised developmental work."
    },
    {
      "id": "powerbuilding-bbb-conditional",
      "goal": "build_muscle_and_strength",
      "phase": "powerbuilding_hypertrophy",
      "experience": "advanced",
      "exercise": "Bench Press",
      "method": "bbb",
      "selectedByGovernance": {
        "selected": "boring_but_big",
        "mapsToExpected": true
      },
      "exactTargets": [
        8,
        8,
        8,
        8,
        8
      ],
      "targetKinds": [
        "reps",
        "reps",
        "reps",
        "reps",
        "reps"
      ],
      "restSeconds": 150,
      "progression": "Progress through the method's exact target sequence inside the Mesocycle envelope.",
      "stopRule": "Stop on missed target, material rep drop-off or technique loss.",
      "exitRule": [
        "Development achieved or fatigue"
      ],
      "why": "A governed 5 × 10 supplemental-volume allocation that replaces other supplemental work."
    }
  ],
  "supportedLinkedMethods": [
    {
      "method": "antagonist_superset",
      "policy": "canonical_training_method_policy_v1",
      "boundary": "one equal-round, low/moderate-fatigue antagonist pair in an eligible Mesocycle"
    },
    {
      "method": "rest_pause",
      "policy": "canonical_training_method_policy_v1",
      "boundary": "one established-load stable row/accessory, three rounds of ten one-rep segments"
    }
  ],
  "unsupportedMethods": [
    {
      "method": "same_region_supersets_trisets",
      "reason": "no approved bounded production eligibility and exact execution contract"
    },
    {
      "method": "high_rep_finisher_as_separate_method",
      "reason": "not a canonical method; high-rep exact accessory targets remain straight or capped AMRAP only when authorised"
    }
  ],
  "indefiniteIdenticalStructureAbsent": true
}
```
