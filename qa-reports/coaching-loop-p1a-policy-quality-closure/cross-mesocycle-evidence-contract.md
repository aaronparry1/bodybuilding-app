# Cross-Mesocycle evidence contract

Overall verdict: **NOT PROVEN** for numeric carry-forward.

Immutable completed evidence, canonical exercise identity, performed sets, prior decisions and receipts persist. They remain historical truth even when excluded from a current comparison.

Current behavior:

- Mesocycle identity is part of the comparable-exposure key.
- A different Mesocycle therefore begins a new comparable streak.
- Method, role, set structure, loading mode, equipment-related exercise identity and limitation constraints also partition evidence.
- Generated IDs and display units remain non-semantic.
- Established load can remain available to Session Construction, but it is not automatically equivalent to a current successful trend.
- No recency window, intervening-phase marker or Macrocycle identity qualifies a later return to the same Mesocycle ID.

Required policy before cross-boundary reuse:

1. Preserve all facts and prior established loads.
2. Reset success/failure streaks at a Mesocycle transition.
3. Treat deload/taper/peak/recovery exposures as historical but not ordinary performance evidence.
4. Require at least one new compatible ordinary exposure after return.
5. Apply explicit recency/freshness and intervening-method/equipment/role checks.
6. Reuse old evidence only as baseline context, never as enough by itself to trigger immediate progression.
7. Goal or Macrocycle change must start a new streak while preserving historical records.

The current implementation safely excludes a different Mesocycle but can combine two old successes with one much later success after returning to the same Mesocycle ID. That behavior is **CONTRADICTED** by the required streak-reset contract and must be a separate bounded implementation task.
