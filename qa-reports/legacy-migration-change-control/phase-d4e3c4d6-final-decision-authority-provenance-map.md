# D4E3C4D6 — final decision authority provenance

Status: provenance improved; equivalence remains blocked.

The final decision now carries production-native rep and lane authority sources and applied identities. These fields are assembled from the already-selected production family/role facts; no precedence is rerun and no output arithmetic reads provenance.

| Category | Provenance | Status |
|---|---|---|
| ordinary | `block_compatibility` | observable, value-equivalent anchors |
| corrective | `corrective_family` | observable, v2 equivalence pending |
| recovery | `recovery_family` | observable, v2 equivalence pending |
| power | `power_family` | observable, v2 equivalence pending |
| override/method/family collisions | unavailable in current helper contract | blocked |
| planned-order authority | unavailable in current helper contract | blocked |

Public façades remain unchanged and compatibility-only where they lack complete branch facts. The next phase must add source-point provenance for override/method/role collisions without reimplementing precedence.
