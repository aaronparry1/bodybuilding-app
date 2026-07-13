# D4D2 current-job runtime selection map

| Runtime step | Input | D4D2 action | Output/failure | Boundary |
|---|---|---|---|---|
| D4C source routing | restricted D3 current source | unchanged exact source/template resolution | source failure remains distinct | no compatibility fallback |
| D4B adaptation | certified ordered jobs | validate before selection | invalid adapter/certification stops | one slot → one job |
| Selection context | exercise library, equipment, history, preferences | copy into read-only batch context | invalid context explicit | no block/workout input |
| Job selection | ordered D4B jobs | one D4D1 request/call per job | required failure is atomic; optional omission explicit | no generic fallback |
| Aggregation | selector results | preserve ordinal and source trace | complete batch only | no persistence |
| Downstream handoff | complete selected batch | metadata for later target generation | exact targets remain downstream | no target formula changes |

D4C runtime now invokes D4D2 only after source resolution and D4B certification. Compatibility sources return through the existing compatibility result before D4D2 and carry no current trace.
