# Canonical adaptive coaching loop map

Last verified: 2026-08-23 at starting commit `7c33696` plus the closed-loop slice.

## Authoritative path

`plannedSessions.prescriptionSnapshot` → recorded-session ledger snapshot → immutable performance/completion events → reconciled progress evidence → post-workout evaluation → persisted progress decision + adaptation audit → atomic future-plan application receipt → later comparable evidence → persisted adaptation outcome.

Historical prescription snapshots are never rewritten. The active-plan repository is the sole future-prescription mutation boundary. Operation IDs, decision IDs, expected revisions, immutable hashes and application receipts make retry, restart and offline replay idempotent.

## Signal inventory

| Signal | Source of truth and reliability | Comparability/minimum evidence | Production consumer and present effect | Duplicate/conflict handling |
|---|---|---|---|---|
| Prescribed target | Recorded ledger `prescriptionSnapshot` copied from canonical planned session; high | Exact prescription hash, slot/exercise/method/role/lane/load state | Evidence reconciliation and evaluator; anchors before state | Hash mismatch blocks adaptation |
| Performed load/reps/effort | Append-only performance events; load/reps high, effort self-report moderate | Complete sets, kg, exact slot, no substitution, semantic comparable key | Numeric policy; three successes progress, two failures regress | Effective-work projection resolves event corrections; identity conflict creates review evidence |
| Set/workout completion | Ledger performance/completed events; high | Prescribed set count and completion event | One incomplete exposure holds; repeated comparable misses can regress/recalibrate | Aggregate version and operation ID prevent duplicate completion |
| Substitution | Performance event substitution ID; high identity, variable stimulus equivalence | Current numeric policy requires no substitution | Blocks numeric comparability; does not yet choose replacement | Persisted event identity; mismatches fail closed |
| Missed/abandoned work | Partial/skipped completion summary; high | One result is insufficient | Holds target or advances week without crediting success | Reconciled from effective events |
| Pain/limitation | Progress evidence; self-report, safety-relevant | One credible signal | Blocks automatic change for safety review | Conflicting identity blocks; no inferred pain |
| Readiness/recovery | Readiness/capacity evidence; self-report/contextual | Latest complete/fresh evidence; conflicting records rejected | Constrained/conflicting state currently blocks automatic change | Same-time disagreement becomes `conflicting` |
| Adherence history | Recorded-session references/ledger; high for completed app sessions | Requires schedule context | Determines microcycle completion; not yet a dose/schedule mutation authority | Reconstructed from durable references |
| Equipment/exercise comparability | Construction facts plus comparable semantic key; high | Exact equipment increment and single matching future slot | Bounds increments; incompatible/swapped work does not progress numeric target | Ambiguous material identity blocks atomically |
| Duration/rest | Prescription carries estimates/rest; performed duration/rest are not yet canonical outcome evidence | No mounted reliable minimum | Display/planning only; **fake adaptivity if described as coaching input** | Not applicable until persisted canonically |
| Progress/recommendation reports | Derived projections; lower authority | Must cite canonical decision ID | Display only; cannot mutate programme | Legacy paths cannot override canonical repositories |
| Reconstruction/transition | Construction facts, lineage, approved successor policy; high | Complete context and approved successor | Rebuilds future sessions; pending numeric decisions survive only within compatible mesocycle | Expected revision + material diff + application intent |
| Explanation | Persisted adaptation audit and application receipt; high | Same decision/evidence identity | UI can present observation → decision → next action | UI must not reverse-engineer changed numbers |
| Later outcome | Later comparable performance evidence; moderate-high | Two later comparable exposures | Persists productive/neutral/unsuccessful/inconclusive; now closes learning measurement loop | Outcome record is immutable/idempotent by decision ID |

## Disconnected or incomplete adaptivity

- Performed rest intervals and actual workout duration are not persisted as canonical coaching evidence.
- Readiness, pain and capacity writers are not mounted on the production completion journey; reconciliation correctly refuses to invent them.
- Adherence can advance/hold a week but does not yet safely reorder work or simplify schedules.
- Substitution invalidates numeric comparison but no canonical equivalence graph currently authorises transfer.
- Deload phase construction exists, but production post-workout evaluation deliberately reports `deloadEligible: false`; automatic recovery intervention is not yet evidence-complete.
- Legacy progress, fatigue, rotation and volume reports remain projections/recommendations, not mutation authority.

These omissions are explicit fail-closed boundaries, not hidden claims of adaptivity.
