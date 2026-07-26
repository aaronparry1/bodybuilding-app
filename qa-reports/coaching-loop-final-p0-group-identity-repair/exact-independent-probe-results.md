# Exact independent falsification probe

Verdict: **PROVEN**.

Fixture:

- canonical Session Construction;
- `powerbuilding_hypertrophy`;
- Microcycle 4;
- four linked-round members across two sessions;
- complete carrier and a clone with only grouped `groupId` removed.

Observed after repair:

| Check | Result |
| --- | --- |
| Complete carrier validation | valid |
| Migrated carrier validation | valid |
| Migrated → complete comparison | unchanged, 0 deltas |
| Complete → migrated comparison | unchanged, 0 deltas |
| `semanticGroupMembers` deltas | 0 |
| Application result | explicit no-change |
| Receipt status | unchanged |
| Reason | `material_prescription_delta_absent` |
| Intent/CAS material application | none |
| Revision | unchanged by coaching application |
| Explanation | materially equivalent; no changed-demand claim |
| Duplicate/concurrent replay | same persisted no-change receipt |

Representative command:

`npx vitest run tests/canonical-coaching-loop-p0.test.ts -t 'grouped-method groupId-removal probe' --reporter=verbose`

Result: 1 passed, 25 skipped.
