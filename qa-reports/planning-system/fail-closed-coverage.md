# Fail Closed Coverage

Generated from `canonical_adaptive_planning_certification_v1`. This report is evidence, not a second planning authority.

```json
{
  "schemaVersion": "canonical_adaptive_planning_certification_v1",
  "cases": [
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
  ],
  "rule": "No unresolved combination degrades to a generic workout."
}
```
