# Guidance container persistence map

Generated programme exercise settings currently carry `recommendedMinSets`/`recommendedMaxSets`, but generated slots have no persisted active-plan stable guidance identity. E2E3D defines the current persisted target shape separately: one programme-guidance slot per min/max pair, stable child ID, parent programme ID/version and monotonically increasing target version.

Plans without this container remain compatibility-only. Exact lookup/update is ID/version based and immutable; it does not use arrays, blocks, titles or timestamps. E2E3E must add constructor/repository persistence before the injected application service can bind concretely.
