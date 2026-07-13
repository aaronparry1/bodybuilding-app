# D4E3C4B complete rep/lane aggregate schema map

## Versioning

D4E3C4B introduces additive complete-production schema version `v2`, registry version `v2`, and fingerprint version `v2`. The D4E3C2/C3 `v1` contracts remain readable as historical characterization fixtures; no runtime upgrade or reinterpretation is performed.

## Schema extensions

| Requirement | New representation | Validation/fingerprint impact |
|---|---|---|
| complete production facts | `CompleteRepLaneBranchKey` | canonical dimensions are required |
| authority precedence | `CompatibilityPrescriptionAuthorityCandidate` | selected IDs must be matching candidates |
| collision explanation | `CompatibilityPrescriptionPrecedenceTrace` | trace is semantic fingerprint input |
| explicit rep source | `CompleteRepSemantics.authorityId` and source fields | source changes fingerprint |
| all current lanes | `CompatibilityLaneIdentity` with eight identities | lane identity/pairing changes fingerprint |
| impossible combinations | `RepLanePairing` | invalid pairings rejected |
| generated-settings ownership | `GeneratedSettingsOwnership` metadata | ownership classification changes fingerprint |

## Registry coverage

The additive registry contains representative complete-schema branches for hypertrophy primary/secondary/accessory, strength primary/support, power, peak, deload maintenance, and deload recovery. The eight lane identities are represented explicitly: strength, strength_support, hypertrophy_strength, hypertrophy, power, peak, maintenance, recovery. This is schema/characterization data, not a claim that all production precedence branches are now executable; D4E3C4C owns complete precedence resolution.

## Validation and compatibility

Validation rejects unsupported schema, missing identity, invalid rep bounds, missing selected authorities, duplicate authority IDs, and invalid rep/lane pairings. Candidates and traces contain data only—no callbacks, formulas, blocks, workouts, repositories, or persistence. Existing seven-branch v1 fixtures are not silently upgraded.

## Next gate

D4E3C4C must implement and characterize the complete precedence resolver over these structures before any production caller or generated-settings path is migrated.
