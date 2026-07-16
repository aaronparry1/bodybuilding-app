# Supabase query audit

## Findings

- `WorkoutSessionCloudRepository.loadWorkoutHistory` selects `workout_sessions` with nested `performed_exercises` and `performed_sets`, filters only by `user_id`, orders all rows, and has no limit/cursor.
- `ProgrammeCloudRepository.loadProgrammes` selects all nested programme days and planned exercises for a user, with no pagination.
- `ExerciseCloudRepository.loadExercises` must be reviewed for bounds; source search found a broad select path.
- Cloud writes upsert each session, exercise, and set; this is intentionally granular but can create a request count proportional to session size.

No N+1 loop was proven in a mounted action from repository inspection alone, but nested reads and per-child upserts need query/request measurement. No database migration was applied.
