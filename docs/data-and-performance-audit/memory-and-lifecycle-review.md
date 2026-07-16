# Memory and lifecycle review

Reviewed providers and major canonical screens return unsubscribe functions from store/auth/AppState effects. The main retained-memory risks are whole JSON values in `jsonStore.valueCache`, whole ledger scans, and arrays retained in mounted projections. No repeated-mount runtime measurement was available, so “no memory leak” is not claimed. The new span utility is bounded to 200 completed spans and has no production output.
