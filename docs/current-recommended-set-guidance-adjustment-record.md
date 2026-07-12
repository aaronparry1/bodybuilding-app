# Current recommended set guidance adjustment record

E2E3A defines a persistence-ready current record contract only. A record names one stable future programme-guidance slot, parent/version, plan/mesocycle and set-guidance policy. Its timing is either explicitly unresolved pending decision or a resolved next eligible normal microcycle. The semantic idempotency key excludes timestamps and includes target/version/timing/policy identity.

Legacy block/week records hydrate as compatibility-only and cannot become current target identities. This module performs no repository write, plan/workout query, normalization, timing resolution or application.
