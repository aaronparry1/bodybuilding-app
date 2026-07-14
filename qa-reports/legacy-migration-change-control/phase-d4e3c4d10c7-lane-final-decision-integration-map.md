# D4E3C4D10C7 lane final-decision integration map

The generated-settings path now evaluates `resolveTrainingLaneDecision` once per slot. The primitive `decision.lane` is projected into the existing settings object, while the readonly decision is passed separately to final compatibility rep/lane assembly. The exported `resolveTrainingLane` façade remains unchanged for all other callers.

The final assembler copies branch-local lane authority, applied identity, planned-order class, reason, and retention status; it performs no selection or inference. Internal metadata is not added to generated settings, slots, workouts, persistence, or serialization.

The carrier boundary is `resolveGeneratedSettings` → `resolveCompatibilityFinalRepLaneDecision`. Legacy invalid-input fallback continues to use the already-evaluated lane decision rather than invoking the selector a second time.
