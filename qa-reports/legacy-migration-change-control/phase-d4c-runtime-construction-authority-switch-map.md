# D4C runtime construction authority switch map

## Scope

D4C routes the exact restricted D3 calibration family through persisted programme resolution, the D4 projection and certified D4B adapter. It does not mutate programme metadata, select exercises itself, generate exact targets or write workouts.

| Stage | Current/target seam | D4C behavior | Failure before selection | Compatibility |
|---|---|---|---|---|
| Plan gate | Active-plan metadata classification | Require restricted D3 current metadata | Invalid current plan explicit | Legacy plans use existing path |
| Reference | D3 microcycle reference | Exact plan/mesocycle/programme/version lookup | Missing/dangling/version mismatch | No D3 lookup |
| Template | D4 session source projection | Exact A/B identity and role | Missing template explicit | Generic role path |
| Adapter | D4B slot adapter/certification | One-to-one jobs, exact guidance and trace | Adapter failure explicit | Not invoked |
| Exercise selection | Existing downstream boundary | Receives certified jobs through runtime result seam | Required job unresolved later | Existing generated inputs |
| Exact targets | Existing generator | Unchanged downstream | Existing failure state | Existing path |
| Persistence | Workout repository | No D3 writes or programme mutation | Atomicity remains caller boundary | Existing behavior |

## Baseline

Pre-edit baseline: 15 failing files, 43 failing tests, 1,645 passing tests; typecheck, Expo public config and web export passed. High-risk runtime originals are under `qa-reports/legacy-migration-change-control/originals/`.
