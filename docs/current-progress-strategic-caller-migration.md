# Current Progress strategic caller migration

The dashboard now resolves `currentProgressContext` once and builds `currentStrategicSummary` from that exact value. Both fields are exposed on the view model; the summary cannot independently select another snapshot or decision.

Legacy strategic output remains temporarily in the dashboard for unmigrated strategic/recovery/rotation/volume presentation fields. It is not the source of either current field. Stage 2C2A1.3 must remove the Progress presenter call; this phase does not claim that removal.
