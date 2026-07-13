# D4B D3 slot-to-exercise-selection adapter map

The adapter is calibration-only, pure and one-to-one. Each persisted D3 prescription slot becomes exactly one exercise-selection job; omitted calibration slots remain absent and no legacy accessory padding is performed.

| D3 target | Adapter movement | Muscle projection | Purpose | Guidance | Legacy difference |
|---|---|---|---|---|---|
| `horizontal_press` | `horizontal_push` | chest | primary/secondary compound | Preserved | Generic legacy templates may differ |
| `horizontal_pull` | `horizontal_pull` | back | primary/secondary compound | Preserved | Generic role label removed |
| `vertical_press` | `vertical_push` | shoulders | primary/secondary compound | Preserved | Generic role label removed |
| `vertical_pull` | `vertical_pull` | back | primary/secondary compound | Preserved | Generic role label removed |
| `knee_dominant` | `squat` | quads | compound | Preserved | Calibration slot is exact |
| `hip_hinge` | `hinge` | hamstrings | compound | Preserved | One hinge only |
| `knee_flexion` | `knee_flexion` | hamstrings | isolation | Preserved | Explicit semantic adapter field |
| `plantar_flexion` | `plantar_flexion` | calves | isolation | Preserved | Explicit semantic adapter field |
| `shoulder_abduction` | `shoulder_abduction` | shoulders | isolation | Preserved | Explicit semantic adapter field |

Upper-A/B are five jobs each; Lower-A/B are four jobs each. Direct arms, trunk, Lower-A unilateral quadriceps and Lower-B quadriceps isolation remain omitted. The translated count intentionally differs from generic legacy templates where those templates contain extra accessories.

Every adapted job carries programme ID/version, template ID, prescription-slot ID, target version, policy version and adapter version. No selected exercise, exact target or generated identity is present. Requiredness is fixed by the certified calibration policy; runtime selection remains a later D4 authority concern.

Certification requires one-to-one identity, exact order, exact guidance, preserved constraints and complete source trace. Runtime construction is unchanged in D4B.
