# Current calibration exact-target policy

D4E2 is an explicit policy-design gate. The certified calibration programme supplies semantic jobs and recommended set guidance, but exact-target generation still receives rep, lane, drop-off, shutdown and load-calibration semantics through legacy `BlockType` branches.

Those values cannot be inferred from `hypertrophy_calibration`, slot purpose, movement pattern or programme order. A future calibration exact-target bundle must define each policy independently, validate all four session roles and retained slot classifications, and certify that no unresolved default remains.

## Proposed bundle (not yet certified)

Identity: `hypertrophy_calibration_exact_target_policy_v1`, for the certified intermediate four-day full-gym Upper/Lower calibration family and normal calibration priority.

The proposed lanes are:

- `primary_compound_calibration` for knee/hinge and primary upper compounds;
- `secondary_compound_calibration` for retained complementary compounds;
- `isolation_calibration` for lateral deltoid, knee-flexion and calf jobs.

The proposed precedence is: certified D4B recommended min/max guidance is the hard envelope; calibration chooses an initial count inside that envelope; history may move within it; drop-off/shutdown may terminate early. Legacy block defaults never override the envelope.

Starting-load policy proposal: exercise-specific history first, sparse-history evidence second, conservative exercise-specific discovery third, and explicit review when safe estimation is unavailable. Generic body-part or block percentages are not valid current authority.

Drop-off proposal: retain the approved 15% rule, compare valid working performance with the best/reference set after the minimum observation count, and exclude warm-up/load-finding attempts. Shutdown is exercise-level, retains valid completed work, does not add replacement sets, and permits later unrelated jobs when live safety permits.

Effort policy proposal: no routine AMRAP or intentional failure; missed or failed reps are evidence. Suitability is explicit purpose/lane/exercise-class/loading validation, not a renamed block check.

### Slot/session matrix

All retained Upper-A, Upper-B, Lower-A and Lower-B slots resolve to one of the three lanes above. Primary presses, pulls, knee-dominant and hip-hinge jobs use the compound lanes; knee-flexion, calves and lateral deltoid use isolation calibration. Every row must additionally specify rep domain, set construction, load method, drop-off and shutdown before certification; no wildcard row is allowed.

### Owner decisions still required

Aaron must approve exact numerical rep domains, initial count within each D4B range, no-history minimum behavior, starting-load hierarchy and rounding, 15% comparison basis/minimum observations, exercise-level continuation, final-set failure/AMRAP behavior, and how established history changes calibration prescriptions. These are intentionally unresolved rather than inferred.

### Certification and implementation sequence

Certification requires complete lane/slot/class coverage, no block dependency, valid guidance precedence, explicit load/drop-off/shutdown/suitability policies, and approval of every intentional legacy difference. Proposed rollback-safe sequence: D4E2B pure contracts/resolver; D4E2C slot/class certification; D4E3 block-free shared arithmetic extraction; D4E4 current context builder; D4E5 D4D2 target wiring; D4F final construction/persistence certification.

No target formulas, runtime wiring, persistence, or compatibility behavior changed in D4E2A.
