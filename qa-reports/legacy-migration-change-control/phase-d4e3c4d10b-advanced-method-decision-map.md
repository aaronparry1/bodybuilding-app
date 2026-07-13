# D4E3C4D10B — advanced-method decision map

Status: rep-owned advanced-method branch decomposed; lane-owned methods remain unobserved.

The existing `userAdvancedOverride` conditional is now represented by the internal `resolveAdvancedMethodDecision` result. It runs only after explicit slot override, block and family/default branches exactly as before. The public `resolveRepRange` façade returns only the prior primitive range.

| Branch | Method identity | Ownership | Primitive output |
|---|---|---|---|
| enabled valid override | `user_advanced_override` | rep | unchanged range |
| disabled/missing | none | rep | fall-through |
| malformed override | none | rep | fall-through |

No planned-order or family/role lane logic was changed.
