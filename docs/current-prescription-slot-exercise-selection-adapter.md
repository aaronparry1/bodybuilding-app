# Current prescription-slot exercise-selection adapter

D4B defines the semantic boundary between persisted calibration D3 prescription slots and later exercise selection. It is pure, calibration-only and one-to-one: every D3 slot maps to one job, with exact order, target, movement translation, purpose, guidance, constraints and source trace preserved.

The adapter does not select exercises, generate exact targets, read repositories, mutate plans or recreate legacy generic accessories. Calibration omissions remain absent: arms, trunk, Lower-A unilateral quadriceps and Lower-B quadriceps isolation are not padded back into the translated jobs. Generic legacy slot-count differences are reported as intentional policy differences.

Movement translations are explicit (`horizontal_press` → `horizontal_push`, `knee_dominant` → `squat`, `hip_hinge` → `hinge`, and exact adapter fields for knee flexion, plantar flexion and shoulder abduction). Certification rejects missing/duplicate jobs, guidance drift, constraint loss, malformed trace and any selected-exercise or exact-target field.

Runtime construction remains unchanged. The next phase is the explicit D4 authority-switch adapter integration, followed by exact selection/output-equivalence verification.
