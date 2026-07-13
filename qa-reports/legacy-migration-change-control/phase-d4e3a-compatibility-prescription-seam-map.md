# D4E3A compatibility prescription seam map

| Function | Current responsibility | Seam treatment | Equivalence |
|---|---|---|---|
| `createGeneratedSlot` | slot orchestration and result assembly | builds one request and adapts one result | slot shape/order unchanged |
| `resolveGeneratedSettings` | rep/lane/set/drop-off settings | invoked unchanged by seam | exact settings unchanged |
| `resolveRepRange` | rep-domain arithmetic | unchanged call through settings | exact range unchanged |
| `resolveStartingLoadRecommendation` | history/load/rounding | invoked unchanged by seam | exact load unchanged |
| `resolveEvidenceBasedSlotPrescription` | set guidance | invoked unchanged by settings builder | exact set bounds unchanged |
| generated-workout builder | iteration and aggregation | untouched | programme output unchanged |

The compatibility request may temporarily carry `TrainingBlock` because D4E3B owns its removal. It carries one slot only and never owns workout iteration, persistence or current-policy mapping.
