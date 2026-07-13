# D4 programme-specification construction projection map

## Scope

D4 introduces a read-only projection boundary for supported D3 calibration plans. The persisted D1 specification is authoritative for pre-exercise guidance; compatibility plans retain the legacy generated path. No programme or guidance writes are introduced.

| Seam | Current source | D4 source | Projection / failure | Compatibility | D4 gate |
|---|---|---|---|---|---|
| Plan/microcycle identity | Active plan and current microcycle | Exact D3 reference | Resolve plan, mesocycle, microcycle, programme and version; no latest fallback | Legacy source | D5 runtime binding |
| Session template | Generic role/index selection | Exact `upper-a`, `lower-a`, `upper-b`, `lower-b` template | Exact template lookup; missing/ambiguous is explicit failure | Existing role path | D4B |
| Prescription slot | Generated setting defaults | D1 prescription slot | Project target, purpose, ordinal, range, constraints, requirement, omission, substitution and target version | Existing generated settings | D4B |
| Exercise selection | Existing selector | Unchanged downstream selector fed by projection | Selected exercise remains output, never source identity | Existing selector | No selector migration |
| Exact targets | Existing exact-target boundary | Unchanged | Exact reps/load/ordinals remain downstream | Existing path | No target changes |
| Source trace | Generated setting had no D3 trace | Optional diagnostic trace | Plan/programme/template/slot/version metadata; no runtime authority | None | Persist trace only in later D4B if needed |
| Construction result | Generated/compatibility result | Explicit current/compatibility/failure union | No fallback for malformed supported D3 | Compatibility remains explicit | D5 |

## Source classification

`current_programme_specification` is required for a valid restricted D3 current plan. `compatibility_generated_guidance` is valid only when no D3 metadata exists. Missing references, dangling references, wrong versions, missing templates and invalid specifications are explicit failures.

## Baseline and rollback

Pre-edit baseline: 15 failing files, 43 failing tests, 1,631 passing tests; typecheck, Expo public config and web export passed. Originals are under `qa-reports/legacy-migration-change-control/originals/`. D4 can roll back by removing the projection consumer while retaining D3 metadata and compatibility construction.
