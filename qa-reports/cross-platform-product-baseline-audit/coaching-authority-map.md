# Coaching-authority map

## Counts

- Mounted post-workout adaptation authorities: **1**.
- Competing post-workout adaptation authorities: **0**.
- UI adaptation authorities: **0**.
- Unreachable/legacy coaching clusters: numerous helpers; two production-reachable custom programme/session builders remain separate product surfaces but cannot mutate the canonical carrier.

These narrow counts are test-derived from the production chain, not a claim that only one policy function exists.

```mermaid
flowchart LR
  Input["Onboarding + carrier facts"] --> Construct["Canonical construction authority"]
  Construct --> Snapshot["Immutable planned snapshot"]
  Snapshot --> Ledger["Recorded-session ledger"]
  Ledger --> Evidence["Completion evidence"]
  Evidence --> Evaluate["One post-workout evaluator"]
  Evaluate --> Decision["Persisted decision + intent"]
  Decision --> CAS["Carrier CAS application"]
  CAS --> Receipt["Receipt + shared projections"]
```

| Decision family | Owner | Persistence/fallback/explanation |
|---|---|---|
| Macro/mesocycle | macrocycle engine, mesocycle library/policy | carrier; deterministic eligible phase/fail closed |
| Split/microcycle | framework resolver + scheduler | carrier roles/order; deterministic |
| Volume/frequency | canonical allocator/policies | snapshots; bounded by phase/experience/time |
| Exercise/order | construction pipeline/suitability | immutable snapshot; safe fallback/rejection |
| Sets/reps/load/rest | exact-target/load/component policies | snapshot with evidence/calibration reason |
| Methods | canonical method policy | explicit eligibility; straight sets fallback |
| Active changes | canonical exercise management + ledger | current attempt events; no UI-authored coaching |
| Post-session learning | canonical orchestrator/evaluator/application | evidence→decision→CAS→receipt; resumable |

Stochastic behavior is seeded/deterministic where variation exists; ordinary prescriptions do not require AI/network calls. The main product ambiguity is not authority collision but separate legacy-feeling builder surfaces that users may reasonably expect to edit the active plan.
