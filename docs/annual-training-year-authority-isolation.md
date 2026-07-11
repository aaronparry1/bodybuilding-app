# Annual and training-year authority isolation

Phase 10A removes the active logger fallback to `useTrainingYear().currentBlock` and the unused Train import. No active planned session, Train execution, exact target, or non-planned fallback now reads training-year state.

`training-year-repository`, cloud sync, design QA, V2 QA, and legacy plan/block utilities remain as saved-data compatibility, non-planned policy, or QA debt. They are not imported by the current planned constructor or Train path. Future deletion requires migration of those remaining callers; this phase does not change storage, sync payloads, preferences, or user data.
