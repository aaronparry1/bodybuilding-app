# Current Progress rotation replacement map

Legacy `recommendExerciseRotation` presentation is replaced by a pure current intervention projection. Persisted non-keep interventions produce `rotation_authorised`; persisted applied replacements produce `rotation_applied`; immutable observations produce `rotation_observed` only. No state selects or applies a replacement. Action flow, evidence, and journey presentation consume this state; strategic and volume compatibility remain deferred.
