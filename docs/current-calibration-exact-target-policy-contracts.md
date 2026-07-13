# Current calibration exact-target policy contracts

D4E2B defines the pure block-free contract `hypertrophy_calibration_exact_target_policy_v1`. It resolves only the certified intermediate four-day full-gym Upper/Lower calibration family and returns explicit rep, lane, set-envelope, starting-load, drop-off, shutdown, effort and suitability metadata.

Approved domains are 6–10 for primary compounds, 8–12 for secondary compounds, and 10–15 for isolation. The three lanes are primary-compound, secondary-compound and isolation calibration. D4B recommended min/max guidance is the hard set envelope; no-history and sparse history start at minimum, while established history may move within the envelope.

Starting-load evidence is ordered established history, sparse history, exercise-specific calibration and explicit review. Drop-off is greater than 15% from the best valid working set after two valid observations, excluding warm-ups. Shutdown is exercise-level, retains valid work, cancels remaining sets, adds no replacements and permits later jobs unless live safety says otherwise. Routine failure, AMRAP, RIR and RPE are disabled.

The resolver and certification boundary are pure and contain no `TrainingBlock`, `BlockType`, target arithmetic, D4D2 runtime wiring, persistence or adjustment authority. D4E3 will extract the shared arithmetic core and compare compatibility output before any current target handoff.
