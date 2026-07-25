# Test Discovery Reconciliation

Generated from `canonical_adaptive_planning_certification_v1`. This report is evidence, not a second planning authority.

```json
{
  "schemaVersion": "canonical_dosage_evolution_certification_v2",
  "certifiedBaseline": {
    "files": 348,
    "tests": 2072,
    "commit": "a538d197f57e91e3f8a48a070a75e01132a8e917"
  },
  "taskStart": {
    "files": 349,
    "tests": 2070,
    "commit": "730952658effff5d04817e9fef1d1221e8293bb9"
  },
  "adversarialCorrectionStart": {
    "files": 350,
    "tests": 2080,
    "commit": "1ab62df921f3e38fac4fa052a33f09f654a761e5"
  },
  "correctionStart": {
    "files": 351,
    "tests": 2088,
    "commit": "cd91bea3a916e4c7ff824455c560aea0d599e61a"
  },
  "finalDiscovery": {
    "files": 351,
    "tests": 2090
  },
  "filesAddedAtTaskStart": [
    "tests/canonical-final-adaptive-planning.test.ts"
  ],
  "filesDeletedAtTaskStart": [],
  "filesAddedByThisTask": [
    "tests/canonical-dosage-evolution-certification.test.ts"
  ],
  "filesAddedByAdversarialCorrection": [
    "tests/canonical-session-duration-planning.test.ts"
  ],
  "individualTestsRemovedAtTaskStart": [
    "complete canonical adaptive planning system > does not expose goal combinations classified as not recommended",
    "complete canonical adaptive planning system > constructs all five allowed intermediate hypertrophy five-day frameworks from production paths",
    "canonical microcycle volume allocator > retains goal/frequency/split-specific construction for build_strength advanced 4-day bench_squat_deadlift",
    "canonical microcycle volume allocator > retains goal/frequency/split-specific construction for athletic_performance intermediate 6-day upper_lower",
    "programme framework rules > returns every user-facing framework option for each approved goal",
    "programme framework rules > marks ASC Recommended as default for every goal",
    "programme framework rules > applies goal-aware suitability rules",
    "programme framework rules > keeps user override available even when a framework is not recommended",
    "programme framework rules > surfaces goal-aware framework wording in onboarding",
    "programme framework rules > returns correct allowed frameworks for hypertrophy",
    "programme framework rules > returns correct allowed frameworks for get_lean",
    "programme framework rules > returns correct allowed frameworks for strength",
    "programme framework rules > returns correct allowed frameworks for athletic_performance",
    "programme framework rules > returns correct allowed frameworks for build_muscle_strength",
    "programme framework rules > supports every allowed framework from 2 to 6 sessions per week",
    "programme framework rules > does not allow hypertrophy or get lean to use bench/squat/deadlift",
    "programme framework rules > does not allow strength-oriented goals to use chest/back/shoulders/arms/legs",
    "programme framework rules > returns the approved PPL sequences for 4 and 5 days",
    "programme framework rules > returns the approved 4-day chest/back/shoulders/arms/legs sequence",
    "programme framework rules > returns approved strength framework sequences",
    "programme framework rules > rejects session counts outside 2 to 6",
    "programme framework rules > returns deterministic copies that callers cannot mutate globally",
    "programme framework rules > keeps every framework sequence deterministic for 2 to 6 days"
  ],
  "individualTestsAddedAtTaskStart": [
    "complete canonical adaptive planning system > uses the base frequency table plus explicitly executable five-day hypertrophy choices",
    "complete canonical adaptive planning system > constructs every dense intermediate five-day hypertrophy choice from production paths",
    "canonical microcycle volume allocator > retains goal/frequency/split-specific construction for build_strength advanced 4-day upper_lower",
    "canonical microcycle volume allocator > retains goal/frequency/split-specific construction for athletic_performance intermediate 6-day push_pull_legs",
    "final canonical adaptive-planning product rules > keeps the three experience levels materially distinct without treating advanced as automatic volume",
    "final canonical adaptive-planning product rules > owns exact evidence-bounded add, retain, remove and reallocate rules",
    "final canonical adaptive-planning product rules > keeps beginner, intermediate and advanced landmarks bounded by region",
    "final canonical adaptive-planning product rules > resolves exact method targets only inside Mesocycle permission",
    "final canonical adaptive-planning product rules > constructs a corrected dense five-day PPL with exact set targets and load states",
    "final canonical adaptive-planning product rules > requires direct transfer rationales for strength-focused assistance",
    "final canonical adaptive-planning product rules > creates exact concurrent prescriptions and never changes the lifting count",
    "final canonical adaptive-planning product rules > projects the next conditioning action on Home and the full schedule on Plan",
    "final canonical adaptive-planning product rules > keeps onboarding free from internal strategies and legacy choices",
    "canonical customer programme framework rules > exposes only the three plain-language framework preferences",
    "canonical customer programme framework rules > owns the final frequency truth table",
    "canonical customer programme framework rules > preselects a valid choice instead of adding an ASC option",
    "canonical customer programme framework rules > rejects incompatible public preferences before construction",
    "canonical customer programme framework rules > keeps four- and five-day PPL recognisable and rolling",
    "canonical customer programme framework rules > uses typed block morphs while retaining the athlete's preference",
    "canonical customer programme framework rules > keeps onboarding free of internal framework choices",
    "canonical customer programme framework rules > rejects invalid frequencies and remains deterministic"
  ],
  "individualTestsAddedByThisTask": [
    "canonical dosage, rotation, method evolution and cardio certification > carries the six-session PPL identity across calendar boundaries without a Monday reset",
    "canonical dosage, rotation, method evolution and cardio certification > constructs Legs F through real Session Construction as a complementary hinge-led session",
    "canonical dosage, rotation, method evolution and cardio certification > normalises five lifting days from the complete rotation and keeps every lower-body region above its floor",
    "canonical dosage, rotation, method evolution and cardio certification > requires productive history and demonstrated capacity before an upper starting dose",
    "canonical dosage, rotation, method evolution and cardio certification > replaces the contradictory 95/101 claims with one executable muscle-specific start",
    "canonical dosage, rotation, method evolution and cardio certification > evolves exact method structure only when a Mesocycle owns a useful reason",
    "canonical dosage, rotation, method evolution and cardio certification > simulates productive, local, systemic, missed-session and stagnation paths without weekly auto-escalation",
    "canonical dosage, rotation, method evolution and cardio certification > individualises eight cardio profiles and exposes their recovery-budget effect",
    "canonical dosage, rotation, method evolution and cardio certification > never prescribes cardio against an explicit off preference or conflicting sport workload",
    "canonical dosage, rotation, method evolution and cardio certification > uses typed session duration and passes every adversarial dosage quality gate"
  ],
  "individualTestsAddedByCurrentCorrection": [
    "canonical per-session available-time planning > calibrates only future estimates from at least three comparable completed durations",
    "app settings > normalizes persisted recent-training facts without conflating experience and history"
  ],
  "renamedOrConsolidated": [
    {
      "source": "2 complete-planning tests",
      "replacement": "2 exact public-framework/dense-PPL planning tests",
      "status": "stronger_equivalent"
    },
    {
      "source": "2 allocator strategy cases",
      "replacement": "2 currently selectable framework cases plus exhaustive matrix",
      "status": "renamed_for_new_public_contract"
    },
    {
      "source": "19 legacy public/internal framework shells",
      "replacement": "8 final public-framework tests plus exhaustive goal × experience × frequency construction matrix",
      "status": "consolidated_after_removal_of_obsolete_public_choices"
    },
    {
      "source": "missing complete-rotation/dosage/cardio evolution coverage",
      "replacement": "10 focused certification tests",
      "status": "restored_and_expanded"
    }
  ],
  "focusedMarkers": {
    "skip": [],
    "todo": [],
    "only": []
  },
  "discoveryConfigurationChanges": [],
  "exactArithmetic": {
    "baselineToTaskStartFiles": "348 + 1 added - 0 deleted = 349",
    "baselineToTaskStartTests": "2072 - 23 removed + 21 added = 2070",
    "taskStartToFinalFiles": "349 + 1 added - 0 deleted = 350",
    "taskStartToFinalTests": "2070 + 10 added - 0 deleted = 2080",
    "adversarialCorrectionFiles": "350 + 1 added - 0 deleted = 351",
    "adversarialCorrectionTests": "2080 + 8 added - 0 deleted = 2088",
    "currentCorrectionTests": "2088 + 2 added - 0 deleted = 2090"
  },
  "lostCoverageWithoutReplacement": []
}
```
