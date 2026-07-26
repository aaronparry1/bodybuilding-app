# Boundary continuity contract

## Existing owners

- Mesocycle policy owns the default/maximum horizon and ordered approved
  successor identities.
- `resolveCanonicalCycleBoundary` composes those existing facts into a typed
  continuity result. It owns no successor graph or numeric horizon.
- The mounted Progress evaluator decides whether the completed factual exposure
  is successful, partial, or failed.
- The existing active-plan application authority invokes Session Construction
  and atomically commits the next Microcycle or approved successor Mesocycle.
- Home, Plan, and Train read the same committed carrier.

## Resolution

| Context | Result |
| --- | --- |
| Current Microcycle still has planned work | `not_at_boundary` |
| Partial/failed completion at the boundary | continue current phase without inventing successful evidence |
| Successful completion before the default horizon | continue current phase |
| Successful completion at/after the default horizon with an approved successor | transition to the existing ordered approved successor |
| No approved successor but still below the maximum horizon | continue current phase |
| No approved successor at the maximum horizon | persisted review-required state |
| Approved successor cannot construct, current phase below its maximum horizon | continue the current phase and record the actual fallback in the application receipt |
| Approved successor cannot construct at the current phase maximum horizon | persist a blocked no-change receipt naming the missing compatible successor/prescription |

The maximum-horizon blocked state declares:

- missing fact: `approved_successor`;
- why it is required;
- resolution event: `canonical_mesocycle_policy_successor_approved`;
- current programme safely usable: `false`.

It does not fabricate an athlete fact or a successor.

## Atomicity and identity

The next Microcycle/Mesocycle is constructed before the carrier CAS. The CAS
commits cycle identity, lineage, future immutable prescriptions, and the
decision reference together. Completed ledger prescriptions are never
rewritten. Limited-equipment constraints and recorded limitations remain inputs
to successor construction.

An approved edge is not treated as a completed transition until Session
Construction can produce a compatible successor. If construction fails while
the current Mesocycle is still below its existing maximum horizon, the
application authority constructs the next Microcycle in the current Mesocycle
and records
`approved_successor_construction_unavailable_continued_within_horizon`.
At the maximum horizon it records a typed blocked no-change result instead of
repeating a hidden failed transition. Neither case invents a successor edge.

## Certified construction-boundary correction

The longitudinal run exposed an existing-policy successor that failed final
construction certification: a high-fatigue exercise produced more than the
already-certified maximum of eight repetitions. Exact-target resolution now
honours the same high-fatigue maximum already enforced by
`canonical-constructed-microcycle-certification`; it does not add a new
progression, method, or volume policy.

## Proof

- `src/domain/training/canonical-cycle-boundary-resolution.ts`
- `src/domain/training/canonical-progress-evaluator.ts`
- `src/application/training/canonical-progress-decision-application.ts`
- `src/domain/training/canonical-exact-target-policy.ts`
- `tests/canonical-cycle-boundary-continuity.test.ts`
- `tests/canonical-coaching-loop-p0.test.ts`
