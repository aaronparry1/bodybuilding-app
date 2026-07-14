# Private lane selector architecture decision

The D4E3C4D10C5 candidate failed three architecture guards because they prohibited any `resolveTrainingLaneDecision` symbol. The candidate did not duplicate precedence, change the public signature, infer provenance, add an observer, import v2, or route generated settings through rich metadata. Primitive characterization remained exact.

Decision: `private_helper_acceptable_guard_revision_required`. The permanent rule is one production authority for lane precedence behind an unchanged primitive façade. D4E3C4D10C5B must narrow the guards to enforce that invariant and add negative fixtures for duplicate selectors, façade selection, public return expansion, observers, v2 imports and rich projection.
