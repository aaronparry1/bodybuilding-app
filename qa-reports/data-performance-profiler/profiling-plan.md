# Controlled profiling plan

Source audit: `57acc18`. Hypotheses map to `src/data/cloud/workout-session-cloud-repository.ts` (unbounded nested history reads), `src/data/local/json-store.ts` (synchronous whole-value parse/stringify), `src/data/local/canonical-recorded-session-ledger.ts` (full scans/sorts), `src/application/sync/cloud-data-sync.ts` (full backup export), and mounted canonical-plan subscribers in `app/(protected)/_layout.tsx` and tab/history/train screens (render fan-out).

| Journey | Fixtures | Instrumentation | Expected network | Render owner / pass criterion |
|---|---:|---|---|---|
| Cold/warm launch | 0/100/500/2000 | launch span, hydration, first feedback | auth/billing only if configured | root/providers; no history-size trend |
| Tab cycles 25/100 | each | navigation span, render count/listeners | none expected offline | protected layout; slope near zero |
| Workout open/start/log set | each | handler, persistence, JSON bytes/time, ledger span | no full-history fetch | Train + canonical state; feedback before persistence |
| Swap/search/apply 10/25/100 | each | search/apply spans, request count, render count | no full-history fetch | Train/swap flow; bounded count and latency |
| Combined loop 10/25/50/100 | 100/500/2000 | all above + lifecycle counts | constant request shape | no progressive p95/slope increase |
| Long history | 2000 (10k targeted) | ledger scan/sort, backup serialisation | bounded/summary reads | history; no unbounded UI read |

Runs must be separated into cold-cache, warm-cache, and repeated-use conditions. Runtime results are not present because no interactive profiler was available.
