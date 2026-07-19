# Authority Boundary

Generated from `canonical_adaptive_planning_certification_v1`. This report is evidence, not a second planning authority.

```json
{
  "schemaVersion": "canonical_adaptive_planning_certification_v1",
  "authority": [
    {
      "owner": "Macrocycle",
      "owns": [
        "goal strategy",
        "event horizon",
        "phase pathway",
        "approved mesocycle families"
      ],
      "cannotOwn": [
        "exercise",
        "set",
        "load"
      ]
    },
    {
      "owner": "Mesocycle",
      "owns": [
        "phase purpose",
        "volume/intensity emphasis",
        "methods",
        "progression/exit",
        "successors"
      ],
      "cannotOwn": [
        "calendar navigation",
        "exact exercise"
      ]
    },
    {
      "owner": "Microcycle",
      "owns": [
        "rotation",
        "session order",
        "frequency distribution",
        "recovery spacing",
        "missed-session reflow"
      ],
      "cannotOwn": [
        "goal strategy",
        "exact load"
      ]
    },
    {
      "owner": "Session Construction",
      "owns": [
        "exercise slots",
        "selection",
        "order",
        "sets",
        "reps",
        "rest",
        "load state",
        "stop rules"
      ],
      "cannotOwn": [
        "macro strategy",
        "progress decision"
      ]
    },
    {
      "owner": "Set Prescription",
      "owns": [
        "exact executable target",
        "set-local stop condition"
      ],
      "cannotOwn": [
        "phase",
        "rotation"
      ]
    },
    {
      "owner": "Progress",
      "owns": [
        "evidence",
        "evaluation",
        "bounded intervention",
        "decision/application coordination"
      ],
      "cannotOwn": [
        "exact future prescription",
        "arbitrary successor"
      ]
    }
  ],
  "precedence": [
    "safety_or_limitation",
    "event_or_deadline",
    "goal_and_phase",
    "recovery_and_fatigue",
    "equipment",
    "availability",
    "framework_preference",
    "exercise_preference",
    "variety"
  ]
}
```
