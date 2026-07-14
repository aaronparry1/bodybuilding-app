# Private compatibility lane decision

The D4E3C4D10C5 candidate mechanically extracted the existing lane branches into a private value-plus-source helper behind the unchanged primitive façade. All 19 primitive characterization tests passed. The candidate nevertheless added three failures in architecture tests whose purpose was to assert that no private rich helper existed. Those failures were captured and the production patch was reverted.

No lane-value, generated-output, formula, rep, v2, D4D2, persistence, fallback or guidance behavior changed. The next attempt must update the stale architecture gates in an isolated candidate while preserving the existing primitive/output regression locks.
