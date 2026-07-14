# D4E3C4D10C3 — lane provenance sidecar experiment

Status: `sidecar_boundary_not_viable`.

The current `resolveTrainingLane` selector returns a primitive lane and has no branch-local callback or internal carrier. A sidecar implemented outside the selector would need to infer the winning branch from inputs or execute precedence a second time. Both are prohibited. No production candidate patch was therefore applied.

The authoritative 17-fixture harness remains unchanged. The safest next boundary is a narrowly scoped branch-local hook inside one ordinary selector return, with the primitive projection unchanged, captured in an isolated candidate worktree before rollback.
