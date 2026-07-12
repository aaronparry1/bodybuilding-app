# Stage 2C2A1.1 current strategic summary map

| Field/state | Source | Availability | Notes |
| --- | --- | --- | --- |
| Current identity and decision | `CurrentProgressContext` | Available only in current ready/review context | Persisted decision is copied, never reinterpreted. |
| Mesocycle purpose | Current mesocycle library keyed by context ID | Omitted when context is not current | No block mapping. |
| Microcycle priority/type | Supplied current details when available | Omitted, never inferred | Caller migration can supply it later. |
| Historical observation | Optional immutable input | Supporting only | Cannot change a decision. |
| Compatibility/unavailable | Context state/reason | Explicit result | Never fabricates current analysis. |

The pure summary imports only current context and current mesocycle metadata. It imports no strategic engine, block type, repository, evaluator, writer, or application service. Stage 2C2A1.2 will wire it into Progress.
