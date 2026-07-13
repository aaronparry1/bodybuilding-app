# D4E3C4D10 — selector decomposition map

Status: D10A rep override decision completed; D10B–D10D remain blocked pending separate selector work.

The required order was audited. `resolveRepRange` contains precedence branches, but its current primitive contract does not carry branch identity. `resolveTrainingLane` likewise returns only a lane and its planned-order input is not retained in the result. Override and advanced-method identities are not represented in the current generated-settings inputs. A wrapper that classifies identity after calling these helpers would replay precedence and violate the phase boundary.

| Family | Current result | Local winner identity | Safe rich return now |
|---|---|---|---|
| explicit override | primitive rep range/settings | retained by `resolveRepRangeDecision` | yes, D10A |
| advanced method | primitive override input | not retained | no |
| planned-order lane | primitive lane | not retained | no |
| family/role collision | primitive role/lane | partially retained only at convergence | no |

No production conditionals were moved, duplicated or reordered. The next safe step is to enrich the actual selecting branches, beginning with the rep helper, and prove its primitive façade before touching lane selection.
