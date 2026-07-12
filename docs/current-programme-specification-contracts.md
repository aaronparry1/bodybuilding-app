# Current programme specification contracts

D1 defines a pure, persisted-domain-ready hierarchy: mesocycle programme specification → session template → prescription slot. Programme versions are immutable; same-lineage guidance updates preserve programme/template/slot IDs, increment programme version once, and increment only changed slot target versions.

Microcycles must carry an explicit programme ID/version reference before construction. D1 introduces no ActiveTrainingPlan field, constructor, repository, sync, generated-setting trace, workout trace, or runtime consumer.
