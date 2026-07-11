# Stage 2A current decision application map

| Outcome | Source | Mutation | Guard |
| --- | --- | --- | --- |
| `delay` | Persisted decision + snapshot | None | Returns `no_action_delay`; lifecycle remains proposed. |
| `review_required` | Persisted decision + snapshot | None | Returns `no_action_review_required`; no fallback. |
| `continue` | Persisted ready decision | Next current microcycle in same mesocycle | Snapshot/current plan identity and lifecycle must match. |
| `deload` | Persisted ready decision | Next current `deload` microcycle in same mesocycle | No legacy deload block. |
| `advance` | Explicit decision target | Current approved transition boundary | Target must remain approved; no order selection. |

Application persists the plan before marking the decision applied. Local repositories are not transactional: an applied-lifecycle write failure is reported explicitly and must be recovered from current plan/decision identity, never by blindly reapplying the mutation.

Stage 2B–D consumer migration remains deferred. This service imports no evaluator, evidence producer, annual planner, or block decision authority.
