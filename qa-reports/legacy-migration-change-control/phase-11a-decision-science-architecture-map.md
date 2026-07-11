# Phase 11A decision science and architecture map

| Symbol | Trigger/mutation | Block dependence | Product meaning | Current conflict | Design disposition |
| --- | --- | --- | --- | --- | --- |
| `advanceActivePlanBlock` | Moves next array block; writes block decision | ID/order | Transition | Free-form sequence authority | Replace with approved mesocycle advance |
| `repeatActivePlanBlock` | Resets active block week | ID/week | Continue stimulus | Conflates microcycle action with mesocycle | Repeat microcycle attempt |
| `decideLaterForActivePlanBlock` | Writes decided-later block ID | ID | Evidence/state unavailable | Undefined lifecycle | Delay lifecycle status |
| `startDeloadPlan` | Inserts active deload block | ID/order | Fatigue intervention | Treats deload as block by default | Authorised deload microcycle |
| `completeCurrentPlanWeek` | Increments block week | week | Completion bookkeeping | Legacy week authority | Microcycle completion state |
| `advanceCompletedMicrocycle` | Advances current microcycle/mesocycle | current IDs | Current continuation/transition | None; current foundation | Retain |
| progress dashboard action | Uses recommendation/fatigue and block context | active block | User-facing action | Mixed layers | Emit decision lifecycle result |
| volume adjustments | Disables/apply by active block/deload | block type | Volume context | Legacy context | Narrow current volume context |

Direct evidence supports using stored performance/adherence as inputs, but not fixed universal thresholds or fixed deload timing. Existing fixed-week/block assumptions are product policy, not established decision science.
