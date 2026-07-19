# Planning Input Registry

Generated from `canonical_adaptive_planning_certification_v1`. This report is evidence, not a second planning authority.

```json
{
  "schemaVersion": "canonical_adaptive_planning_system_v1",
  "inputs": [
    {
      "id": "goal",
      "sourceOfTruth": "onboarding TrainingSetupGoal",
      "availability": "onboarding",
      "domain": "build_muscle | build_strength | build_muscle_and_strength | athletic_performance | get_leaner",
      "validValues": "five production goals",
      "defaultValue": "build_muscle",
      "validation": "goal strategy and framework compatibility must resolve",
      "mayAffect": [
        "Macrocycle",
        "Mesocycle",
        "Microcycle",
        "Session Construction"
      ],
      "mustNotAffect": [
        "Presentation"
      ],
      "effects": [
        "structure",
        "dosage",
        "exercise_selection",
        "recovery"
      ],
      "applies": "next_macrocycle",
      "precedence": "below safety/event; above preference"
    },
    {
      "id": "experience",
      "sourceOfTruth": "onboarding/AppSettings ExperienceLevel",
      "availability": "onboarding",
      "domain": "beginner | intermediate | advanced",
      "validValues": "three declared levels",
      "defaultValue": "intermediate",
      "validation": "must be eligible for selected Mesocycle and exercises",
      "mayAffect": [
        "Mesocycle",
        "Microcycle",
        "Session Construction",
        "Set Prescription"
      ],
      "mustNotAffect": [
        "Presentation"
      ],
      "effects": [
        "dosage",
        "exercise_selection",
        "load"
      ],
      "applies": "next_mesocycle",
      "precedence": "below safety/goal; above variety"
    },
    {
      "id": "days_per_week",
      "sourceOfTruth": "onboarding TrainingDaysPerWeek",
      "availability": "onboarding",
      "domain": "integer 2..6",
      "validValues": "2,3,4,5,6",
      "defaultValue": "5",
      "validation": "frequency/framework pair must have a deterministic sequence",
      "mayAffect": [
        "Microcycle",
        "Session Construction"
      ],
      "mustNotAffect": [
        "Macrocycle"
      ],
      "effects": [
        "scheduling",
        "dosage"
      ],
      "applies": "next_microcycle",
      "precedence": "below equipment; above split preference"
    },
    {
      "id": "framework_preference",
      "sourceOfTruth": "onboarding PreferredSplit",
      "availability": "onboarding",
      "domain": "three customer-facing framework preferences",
      "validValues": "push_pull_legs, upper_lower, full_body (frequency compatible only)",
      "defaultValue": "frequency-specific ASC preselection",
      "validation": "frequency truth table rejects incompatibility before plan creation; internal asymmetric/lift strategies remain Microcycle-owned",
      "mayAffect": [
        "Microcycle",
        "Session Construction"
      ],
      "mustNotAffect": [
        "Macrocycle",
        "Mesocycle"
      ],
      "effects": [
        "structure",
        "scheduling",
        "exercise_selection"
      ],
      "applies": "next_microcycle",
      "precedence": "preference intent is preserved while phase/safety/recovery may morph delivery"
    },
    {
      "id": "commitment",
      "sourceOfTruth": "onboarding TrainingCommitment",
      "availability": "onboarding",
      "domain": "continuous_development | event_driven",
      "validValues": "rolling or fixed deadline",
      "defaultValue": "continuous_development",
      "validation": "event-driven requires compatible type and valid target date",
      "mayAffect": [
        "Macrocycle"
      ],
      "mustNotAffect": [
        "Set Prescription"
      ],
      "effects": [
        "structure",
        "scheduling"
      ],
      "applies": "next_macrocycle",
      "precedence": "deadline above goal delivery preference"
    },
    {
      "id": "event_type",
      "sourceOfTruth": "onboarding TrainingEventType",
      "availability": "onboarding",
      "domain": "goal-compatible event type",
      "validValues": "powerlifting, athletic, physique, holiday/photoshoot, custom",
      "defaultValue": "none",
      "validation": "compatibility registry",
      "mayAffect": [
        "Macrocycle",
        "Mesocycle"
      ],
      "mustNotAffect": [
        "Set Prescription"
      ],
      "effects": [
        "structure",
        "scheduling"
      ],
      "applies": "next_macrocycle",
      "precedence": "below safety; above goal pathway defaults"
    },
    {
      "id": "target_date",
      "sourceOfTruth": "canonical Macrocycle input",
      "availability": "canonical_construction",
      "domain": "ISO date",
      "validValues": "future date with enough minimum phase time",
      "defaultValue": "none (rolling)",
      "validation": "typed impossible timeline rejection",
      "mayAffect": [
        "Macrocycle",
        "Mesocycle"
      ],
      "mustNotAffect": [
        "Set Prescription"
      ],
      "effects": [
        "structure",
        "scheduling"
      ],
      "applies": "next_macrocycle",
      "precedence": "deadline constraint"
    },
    {
      "id": "equipment",
      "sourceOfTruth": "canonical construction command",
      "availability": "canonical_construction",
      "domain": "non-empty Equipment[]",
      "validValues": "catalogue equipment enum",
      "defaultValue": "onboarding currently supplies complete catalogue capability",
      "validation": "every selected exercise must have available equipment",
      "mayAffect": [
        "Session Construction"
      ],
      "mustNotAffect": [
        "Macrocycle",
        "Mesocycle"
      ],
      "effects": [
        "exercise_selection"
      ],
      "applies": "next_session",
      "precedence": "above preferences"
    },
    {
      "id": "units",
      "sourceOfTruth": "AppSettings UnitSystem",
      "availability": "settings",
      "domain": "kg | lb",
      "validValues": "kg, lb",
      "defaultValue": "kg",
      "validation": "display conversion only; canonical base load remains kg",
      "mayAffect": [
        "Presentation"
      ],
      "mustNotAffect": [
        "Macrocycle",
        "Mesocycle",
        "Microcycle",
        "Session Construction"
      ],
      "effects": [
        "presentation"
      ],
      "applies": "immediate_display",
      "precedence": "presentation only"
    },
    {
      "id": "load_increment_profile",
      "sourceOfTruth": "AppSettings LoadIncrementProfile",
      "availability": "settings",
      "domain": "positive equipment/exercise increments",
      "validValues": "normalised factual increments",
      "defaultValue": "equipment defaults",
      "validation": "positive and factual equipment resolution",
      "mayAffect": [
        "Set Prescription",
        "Presentation"
      ],
      "mustNotAffect": [
        "Macrocycle",
        "Mesocycle",
        "Microcycle"
      ],
      "effects": [
        "load",
        "presentation"
      ],
      "applies": "next_session",
      "precedence": "rounding after prescription"
    },
    {
      "id": "recovery_cardio_preference",
      "sourceOfTruth": "onboarding/AppSettings",
      "availability": "onboarding",
      "domain": "recommended | minimal | off",
      "validValues": "three modes",
      "defaultValue": "recommended",
      "validation": "canonical concurrent-training policy creates exact bounded sessions without changing lifting-session count",
      "mayAffect": [
        "Microcycle",
        "Progress",
        "Presentation"
      ],
      "mustNotAffect": [
        "Macrocycle",
        "Set Prescription"
      ],
      "effects": [
        "recovery",
        "scheduling",
        "presentation"
      ],
      "applies": "next_microcycle",
      "precedence": "below safety, sport workload and recovery evidence"
    },
    {
      "id": "exercise_catalogue",
      "sourceOfTruth": "canonical exercise catalogue plus custom exercise repository",
      "availability": "catalogue",
      "domain": "versioned factual Exercise[]",
      "validValues": "validated metadata",
      "defaultValue": "bundled catalogue",
      "validation": "role, movement, stimulus, suitability and equipment metadata",
      "mayAffect": [
        "Session Construction"
      ],
      "mustNotAffect": [
        "Macrocycle",
        "Mesocycle",
        "Microcycle"
      ],
      "effects": [
        "exercise_selection"
      ],
      "applies": "next_session",
      "precedence": "factual candidate pool"
    },
    {
      "id": "exercise_preferences",
      "sourceOfTruth": "canonical learned ExercisePreferenceRecord",
      "availability": "progress_evidence",
      "domain": "versioned preferred/avoided exercise facts",
      "validValues": "persistent or temporary records",
      "defaultValue": "none",
      "validation": "cannot override limitation, equipment, slot role or stimulus",
      "mayAffect": [
        "Session Construction"
      ],
      "mustNotAffect": [
        "Macrocycle",
        "Mesocycle",
        "Microcycle"
      ],
      "effects": [
        "exercise_selection"
      ],
      "applies": "next_session",
      "precedence": "below safety/equipment/programme role"
    },
    {
      "id": "limitations",
      "sourceOfTruth": "canonical construction constraints",
      "availability": "canonical_construction",
      "domain": "typed exclusion tokens",
      "validValues": "exclude_exercise, exclude_movement, exclude_equipment",
      "defaultValue": "none",
      "validation": "unknown/free-text medical limitations fail closed",
      "mayAffect": [
        "Session Construction"
      ],
      "mustNotAffect": [
        "Macrocycle"
      ],
      "effects": [
        "exercise_selection"
      ],
      "applies": "next_session",
      "precedence": "highest safety constraint"
    },
    {
      "id": "established_loads",
      "sourceOfTruth": "canonical Progress evidence",
      "availability": "progress_evidence",
      "domain": "positive base-kg loads linked to exercise evidence",
      "validValues": "fresh compatible evidence",
      "defaultValue": "absent",
      "validation": "exercise identity/freshness/calibration linkage",
      "mayAffect": [
        "Set Prescription"
      ],
      "mustNotAffect": [
        "Macrocycle",
        "Mesocycle",
        "Microcycle",
        "Session Construction"
      ],
      "effects": [
        "load"
      ],
      "applies": "next_session",
      "precedence": "evidence above display preference"
    },
    {
      "id": "performed_work",
      "sourceOfTruth": "canonical recorded-session ledger",
      "availability": "recorded_ledger",
      "domain": "immutable performed-work events",
      "validValues": "validated versioned events",
      "defaultValue": "none",
      "validation": "session/slot/prescription linkage",
      "mayAffect": [
        "Progress"
      ],
      "mustNotAffect": [
        "Macrocycle",
        "Session Construction"
      ],
      "effects": [
        "evidence_only"
      ],
      "applies": "recorded_history_only",
      "precedence": "factual evidence"
    },
    {
      "id": "adherence_and_missed_sessions",
      "sourceOfTruth": "ledger completion/missed facts",
      "availability": "progress_evidence",
      "domain": "session-level evidence",
      "validValues": "completed, partial, missed, interrupted",
      "defaultValue": "no evidence",
      "validation": "calendar absence alone is not fatigue",
      "mayAffect": [
        "Microcycle",
        "Progress"
      ],
      "mustNotAffect": [
        "Macrocycle"
      ],
      "effects": [
        "scheduling",
        "evidence_only"
      ],
      "applies": "next_microcycle",
      "precedence": "preserve sequence unless higher intervention approved"
    },
    {
      "id": "performance_trend",
      "sourceOfTruth": "canonical Progress evaluation",
      "availability": "progress_evidence",
      "domain": "comparable improvement/regression evidence",
      "validValues": "sufficient, stale, conflicting, insufficient",
      "defaultValue": "insufficient",
      "validation": "identity/version/freshness",
      "mayAffect": [
        "Progress",
        "Mesocycle"
      ],
      "mustNotAffect": [
        "Session Construction"
      ],
      "effects": [
        "evidence_only",
        "dosage"
      ],
      "applies": "next_mesocycle",
      "precedence": "persistent evidence, not one set"
    },
    {
      "id": "rep_drop_off",
      "sourceOfTruth": "performed work plus canonical stop rule",
      "availability": "recorded_ledger",
      "domain": "set-local percentage against authorised threshold",
      "validValues": "below/at/above policy threshold",
      "defaultValue": "none",
      "validation": "same exercise/session prescription",
      "mayAffect": [
        "Set Prescription",
        "Progress"
      ],
      "mustNotAffect": [
        "Macrocycle"
      ],
      "effects": [
        "dosage",
        "evidence_only"
      ],
      "applies": "next_set",
      "precedence": "session stop rule first; future change requires Progress"
    },
    {
      "id": "fatigue_readiness",
      "sourceOfTruth": "canonical Progress/recovery evidence",
      "availability": "progress_evidence",
      "domain": "fresh complete non-conflicting evidence",
      "validValues": "ready, restricted, review, insufficient",
      "defaultValue": "insufficient",
      "validation": "policy identity and evidence freshness",
      "mayAffect": [
        "Mesocycle",
        "Microcycle",
        "Progress"
      ],
      "mustNotAffect": [
        "Presentation"
      ],
      "effects": [
        "recovery",
        "dosage",
        "scheduling"
      ],
      "applies": "next_microcycle",
      "precedence": "below safety; above preference/variety"
    },
    {
      "id": "active_cycle_state",
      "sourceOfTruth": "canonical active-plan carrier",
      "availability": "cycle_state",
      "domain": "macro/meso/micro identities and revisions",
      "validValues": "validated lineage",
      "defaultValue": "none before activation",
      "validation": "parent/revision/lineage consistency",
      "mayAffect": [
        "Macrocycle",
        "Mesocycle",
        "Microcycle",
        "Session Construction"
      ],
      "mustNotAffect": [
        "Presentation"
      ],
      "effects": [
        "structure",
        "scheduling"
      ],
      "applies": "next_session",
      "precedence": "current canonical authority"
    },
    {
      "id": "previous_mesocycles",
      "sourceOfTruth": "canonical cycle lineage and persisted decisions",
      "availability": "cycle_state",
      "domain": "immutable predecessor identities",
      "validValues": "validated lineage",
      "defaultValue": "none",
      "validation": "successor edge and decision linkage",
      "mayAffect": [
        "Mesocycle",
        "Progress"
      ],
      "mustNotAffect": [
        "Set Prescription"
      ],
      "effects": [
        "structure",
        "evidence_only"
      ],
      "applies": "next_mesocycle",
      "precedence": "approved successors only"
    },
    {
      "id": "custom_movements",
      "sourceOfTruth": "custom exercise repository",
      "availability": "catalogue",
      "domain": "validated Exercise metadata",
      "validValues": "complete role/movement/equipment/prescription metadata",
      "defaultValue": "none",
      "validation": "incomplete or incompatible custom movement rejected",
      "mayAffect": [
        "Session Construction"
      ],
      "mustNotAffect": [
        "Macrocycle",
        "Mesocycle",
        "Microcycle"
      ],
      "effects": [
        "exercise_selection"
      ],
      "applies": "next_session",
      "precedence": "same suitability rules as bundled catalogue"
    },
    {
      "id": "session_duration_constraint",
      "sourceOfTruth": "canonical_session_duration_policy_v1",
      "availability": "onboarding",
      "domain": "typed onboarding/settings fact reconstructed through canonical active-plan application",
      "validValues": "30 | 45 | 60 | 75 | 90 minutes",
      "defaultValue": "75 minutes",
      "validation": "exact enum; infeasible coverage fails closed; active attempts block reconstruction",
      "mayAffect": [
        "Microcycle",
        "Session Construction",
        "Set Prescription"
      ],
      "mustNotAffect": [
        "Macrocycle",
        "Mesocycle",
        "Progress"
      ],
      "effects": [
        "dosage",
        "scheduling"
      ],
      "applies": "next_session",
      "precedence": "athlete time constraint bounds discrete dosage after muscle policy; it never invents frequency or mutates recorded history"
    },
    {
      "id": "sport_workload",
      "sourceOfTruth": "recorded cardio/session evidence only",
      "availability": "progress_evidence",
      "domain": "factual recent workload",
      "validValues": "where recorded",
      "defaultValue": "absent",
      "validation": "must not be inferred from athletic goal",
      "mayAffect": [
        "Microcycle",
        "Progress"
      ],
      "mustNotAffect": [
        "Macrocycle",
        "Set Prescription"
      ],
      "effects": [
        "recovery",
        "scheduling"
      ],
      "applies": "next_microcycle",
      "precedence": "fresh factual workload"
    },
    {
      "id": "body_metrics",
      "sourceOfTruth": "recorded factual metrics",
      "availability": "progress_evidence",
      "domain": "optional factual observations",
      "validValues": "validated records",
      "defaultValue": "absent",
      "validation": "cannot prove fat loss alone",
      "mayAffect": [
        "Progress"
      ],
      "mustNotAffect": [
        "Macrocycle",
        "Mesocycle",
        "Microcycle",
        "Session Construction",
        "Set Prescription"
      ],
      "effects": [
        "evidence_only",
        "presentation"
      ],
      "applies": "recorded_history_only",
      "precedence": "context only"
    }
  ]
}
```
