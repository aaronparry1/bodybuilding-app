-- Replace this with the staging tester email before running.
-- Run in the staging Supabase SQL editor after completing a device workout.

with target_user as (
  select id, email
  from auth.users
  where email = 'ironlogic.beta+001@example.com'
)
select
  target_user.email,
  (select count(*) from public.profiles where id = target_user.id) as profile_count,
  (select count(*) from public.exercises where user_id = target_user.id) as custom_exercise_count,
  (select count(*) from public.programmes where user_id = target_user.id) as programme_count,
  (select count(*) from public.workout_sessions where user_id = target_user.id) as workout_session_count,
  (select count(*) from public.workout_sessions where user_id = target_user.id and completed_at is not null) as completed_workout_count,
  (select count(*) from public.performed_exercises where user_id = target_user.id) as performed_exercise_count,
  (select count(*) from public.performed_sets where user_id = target_user.id) as performed_set_count,
  (select count(*) from public.sync_queue where user_id = target_user.id) as remote_sync_queue_count
from target_user;

with target_user as (
  select id
  from auth.users
  where email = 'ironlogic.beta+001@example.com'
)
select
  workout_sessions.name as session_name,
  workout_sessions.started_at,
  workout_sessions.completed_at,
  performed_exercises.exercise_order,
  performed_exercises.exercise_name,
  performed_exercises.status,
  performed_exercises.load,
  count(performed_sets.id) as set_count,
  coalesce(sum(performed_sets.reps), 0) as total_reps
from public.workout_sessions
join target_user on target_user.id = workout_sessions.user_id
left join public.performed_exercises on performed_exercises.workout_session_id = workout_sessions.id
left join public.performed_sets on performed_sets.performed_exercise_id = performed_exercises.id
group by
  workout_sessions.name,
  workout_sessions.started_at,
  workout_sessions.completed_at,
  performed_exercises.exercise_order,
  performed_exercises.exercise_name,
  performed_exercises.status,
  performed_exercises.load
order by workout_sessions.started_at desc, performed_exercises.exercise_order asc;
