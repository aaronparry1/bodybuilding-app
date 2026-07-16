# Database index review

Repository evidence includes typed Supabase schema and migrations, but no live query-plan access was available. Required verification before a database fix: indexes for `workout_sessions(user_id, started_at)`, child foreign keys (`performed_exercises.workout_session_id`, `performed_sets.performed_exercise_id`), and programme ownership/order predicates. This audit creates no migration because query plans and production schema cannot be confirmed locally.
