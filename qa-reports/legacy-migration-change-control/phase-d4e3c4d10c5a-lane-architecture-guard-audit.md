# D4E3C4D10C5A — lane architecture guard audit

Status: `private_helper_acceptable_guard_revision_required`.

## Guard findings

| Guard | Exact assertion | Candidate trigger | Classification |
|---|---|---|---|
| D4E3C4D10 selector gate | `lane.not.toContain("resolveTrainingLaneDecision")` | same-file private helper name | `overbroad_guard` |
| D4E3C4D10C3 sidecar gate | source must not contain `resolveTrainingLaneDecision` or `ProvenanceSidecar` | private selector symbol | `correct_guard_outdated_policy` |
| D4E3C4D10C4 observation gate | source must not contain `resolveTrainingLaneDecision` or `ProvenanceSidecar` | private selector symbol | `correct_guard_outdated_policy` |

The candidate had one moved implementation, one primitive façade, no v2, no observer, no sidecar and no generated-settings integration. All 19 primitive tests passed. The three new failures were architecture-test expectations, not lane or generated-output drift.

## Decision

The approved D4E3C4D10C5 design permits one private selector behind an unchanged primitive façade. The permanent invariant is single-source precedence, not that the exported function must contain every conditional. The guards should retain checks for duplicate logic, public signature changes, v2 imports, rich-result projection, observers and façade selection, while permitting a same-file private mechanical extraction.

Next phase: D4E3C4D10C5B — revise architecture guards narrowly, add negative fixtures, then reapply the captured candidate patch.
