# Action-flow extraction map

`buildActionFlow` now receives `LegacyProgressActionFlowInput`. The compatibility adapter is a direct typed pass-through; dashboard assembly supplies the legacy-derived values without selection, sorting, or fallback.

| Order | Existing branch | Typed category / field | Source |
| --- | --- | --- | --- |
| 1 | insufficient history → no action | `history.hasEnoughHistory` | legacy strategic history gate |
| 2 | accepted deload | `recovery.acceptedAt` | active-plan legacy recovery state |
| 3 | recovery action | `recovery.priority`, `recovery.fatigue` | existing legacy recovery calculation |
| 4 | rotation action | `rotation.action` | existing rotation result |
| 5 | volume action | `volume.recommendation` | existing personalised-volume result |
| 6 | block transition fallback | `strategic.transitionAvailable`, `strategic.transitionReason` | existing block transition preview |
| 7 | default | none | unchanged `undefined` |

`ordering.source` preserves existing evidence source construction. The helper receives no presenter, active plan, block, rotation container, or volume container. Branch order and returned output are unchanged. Replacement gates: strategic → current summary, recovery → current recovery context, rotation/volume → their future current contexts; immutable history stays historical.
