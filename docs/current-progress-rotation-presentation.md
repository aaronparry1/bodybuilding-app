# Current Progress rotation presentation

Progress uses a pure `CurrentProgressRotationContext` from current identity, persisted intervention records, applied replacement records, and optional immutable observation. It never selects, ranks, applies, or writes replacements.

`rotation_observed` is supporting-only. `rotation_authorised` and `rotation_applied` reflect already persisted intervention facts. Strategic, volume, and session-construction authority remain outside this presentation boundary.
