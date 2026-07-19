# Quality Gate Coverage

Generated from `canonical_adaptive_planning_certification_v1`. This report is evidence, not a second planning authority.

```json
{
  "schemaVersion": "canonical_adaptive_planning_certification_v1",
  "gates": [
    {
      "gate": "muscle_first_dosage_before_slots",
      "status": "covered"
    },
    {
      "gate": "ppl_identity_and_density",
      "status": "covered"
    },
    {
      "gate": "experience_is_material",
      "status": "covered"
    },
    {
      "gate": "framework_preference_linked_through_morph",
      "status": "covered"
    },
    {
      "gate": "strength_assistance_transfer_explained",
      "status": "covered"
    },
    {
      "gate": "methods_require_mesocycle_permission",
      "status": "covered"
    },
    {
      "gate": "cardio_not_merged_into_lifting_count",
      "status": "covered"
    },
    {
      "gate": "fatigue_and_duration_certified",
      "status": "covered"
    },
    {
      "gate": "missing_load_never_zero",
      "status": "covered"
    },
    {
      "gate": "progression_requires_comparable_evidence",
      "status": "covered"
    },
    {
      "gate": "asymmetric_strategy_requires_rationale",
      "status": "covered"
    }
  ],
  "failClosed": [
    {
      "id": "unsupported-framework",
      "input": {
        "goal": "build_muscle",
        "framework": "bench_squat_deadlift"
      },
      "expected": "unsupported_input_combination"
    },
    {
      "id": "impossible-event-timeline",
      "input": {
        "createdAt": "2026-07-19T08:00:00.000Z",
        "targetDate": "2026-07-20"
      },
      "expected": "impossible_event_timeline"
    },
    {
      "id": "unsafe-free-text-limitation",
      "input": {
        "limitation": "sore shoulder"
      },
      "expected": "unsafe_limitation_conflict"
    },
    {
      "id": "unsupported-duration",
      "input": {
        "sessionDurationMinutes": 30
      },
      "expected": "unsupported_input_not_in_activation_contract"
    },
    {
      "id": "unsupported-custom-movement",
      "input": {
        "metadata": "incomplete"
      },
      "expected": "no_suitable_exercise"
    }
  ]
}
```
