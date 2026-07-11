# Coaching Engine V3 Calibration Lifecycle

This table documents the Phase 10 longitudinal calibration rules. It is a validation reference, not a user-facing coaching screen.

| Lifecycle transition | Required evidence | Block reason | Graduation reason | Recalibration reason |
| --- | --- | --- | --- | --- |
| Unknown -> Calibrating | Exercise selected with no direct exact-exercise history. | Exact load is blocked because no direct evidence exists. | None. | None. |
| Calibrating -> Calibrating after one exposure | One direct exposure, even if successful or too light. | One exposure is not enough to prescribe or progress exact load. | None. | None. |
| Calibrating -> Confirmed | Repeated stable direct same-exercise evidence with compatible rep range and setup/equipment context. | None. | Repeated stable direct performance confirms a reliable working-load range. | None. |
| Confirmed -> Progressing | Stable direct evidence plus enough successful progression evidence. | None. | Repeated stable direct performance supports progression. | None. |
| Calibrating -> Calibrating from too-heavy exposure | Large rep drop-off, failed work, or low-quality first exposure. | Exact load and progression are blocked until confirmation evidence exists. | None. | None after one poor exposure. |
| Calibrating -> Calibrating from too-light exposure | User exceeds reps comfortably in one exposure. | Exact load and progression are blocked because one easy exposure is still only calibration evidence. | None. | None. |
| Calibrating -> Calibrating from inconsistent exposure | Alternating strong and weak direct exposures. | Exact load is blocked because direct evidence is contradictory. | None. | `stale_or_inconsistent_history` if this is later promoted into an explicit recalibration state. |
| Confirmed/Progressing -> Recalibration Required after long gap | Previously stable direct evidence, but latest exposure is stale. | Exact load is blocked until current capability is checked. | None. | `long_absence`. |
| Confirmed/Progressing -> Recalibration Required after rep-range change | Direct evidence exists, but selected work moves to a materially different rep zone. | Exact load is blocked because prior load may not transfer safely to the new rep target. | None. | `major_rep_range_change`. |
| Confirmed/Progressing -> Recalibration Required after setup/equipment change | Direct evidence exists, but equipment or setup context materially changes. | Exact load is blocked because the old setup is not identical evidence. | None. | `meaningful_equipment_change` or `setup_changed`. |

Invariant: exact loads remain eligible only when they are traceable to stable direct same-exercise evidence under compatible prescription context.
