# Stage 2C2A1.2 Progress strategic caller map

| Dashboard field | Source | Status |
| --- | --- | --- |
| `currentProgressContext` | Resolved once through current context | Current-only. |
| `currentStrategicSummary` | Built from that same context | Current-only; identity cannot diverge. |
| Existing strategic/recovery/rotation/volume fields | Legacy presenter/adapters | Temporary compatibility behaviour; A1.3 must remove the Progress presenter call before current dashboard certification. |

The current summary is informational only. It never affects historical metrics, adapter inputs, transition controls, or decision application.
