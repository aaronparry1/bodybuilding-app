# Identity-independent grouped semantics

Verdict: **PROVEN** for the focused repair matrix.

## Stable representation

For each planned session, slots are ordered by canonical `index`. Grouped
members are represented by the ordered tuple:

`session context → group structure → member position → slot index + exerciseId`

The material group structure retains:

- `kind` and method;
- ordered member exercise identities;
- position and group size;
- rounds;
- intra-method and inter-round rest;
- policy;
- execution order.

The session boundary prevents two independent groups in one session from
collapsing when generated IDs are absent. Position resets and declared group
size delimit each group.

## Identity categories

- Semantic target identity: plan-session index, role/kind, slot index and
  exercise identity.
- Generated persistence identity: session ID, slot ID, exercise-instance ID,
  prescription ID and `groupId`.
- Material demand: exercise membership/order, sets, repetitions, load state and
  load, method, rests, progression, stop and substitution constraints.

Generated persistence identity is excluded by
`NON_MATERIAL_KEYS`. Group membership is independently projected before the
recursive material comparison.

## Legacy/fail-closed rule

Complete structural position/size facts normalise without `groupId`. Older
valid grouped shapes can use a surviving `groupId` only to collect their
members; the ID value is discarded before comparison. If neither source
establishes membership, the result is typed ambiguity with zero material
deltas. No membership is invented.

The projection is deterministic, symmetric and stable across JSON restart,
key-order regeneration and display-unit conversion.
