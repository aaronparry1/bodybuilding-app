# D4E3C4D7 — collision and planned-order provenance

Status: provenance partially exposed; migration remains blocked.

The final decision now carries compact collision metadata when the existing production path can establish it. Inferred-role fall-through is recorded at the existing role derivation point. Override/method/family collision winners and planned-order lane authority are not retained by the current helper contracts and remain unavailable rather than inferred.

| Category | Selected source | Displaced source | Status |
|---|---|---|---|
| inferred role fall-through | `inferred_role` | none retained | observable |
| explicit override/method | unavailable | unavailable | blocked |
| method/family/role collisions | unavailable | unavailable | blocked |
| planned-order lanes | unavailable | unavailable | blocked |

No conditionals were reordered and collision metadata is not consumed by arithmetic or generated-settings projection.
