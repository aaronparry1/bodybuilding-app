-- Replace this with the staging tester email before running.
-- This deletes app-owned data for one staging user, then deletes the auth user.
-- Run only in the staging Supabase project.

begin;

with target_user as (
  select id
  from auth.users
  where email = 'ironlogic.beta+001@example.com'
)
delete from public.sync_queue
where user_id in (select id from target_user);

with target_user as (
  select id
  from auth.users
  where email = 'ironlogic.beta+001@example.com'
)
delete from public.performed_sets
where user_id in (select id from target_user);

with target_user as (
  select id
  from auth.users
  where email = 'ironlogic.beta+001@example.com'
)
delete from public.performed_exercises
where user_id in (select id from target_user);

with target_user as (
  select id
  from auth.users
  where email = 'ironlogic.beta+001@example.com'
)
delete from public.workout_sessions
where user_id in (select id from target_user);

with target_user as (
  select id
  from auth.users
  where email = 'ironlogic.beta+001@example.com'
)
delete from public.planned_exercises
where user_id in (select id from target_user);

with target_user as (
  select id
  from auth.users
  where email = 'ironlogic.beta+001@example.com'
)
delete from public.programme_days
where user_id in (select id from target_user);

with target_user as (
  select id
  from auth.users
  where email = 'ironlogic.beta+001@example.com'
)
delete from public.programmes
where user_id in (select id from target_user);

with target_user as (
  select id
  from auth.users
  where email = 'ironlogic.beta+001@example.com'
)
delete from public.exercises
where user_id in (select id from target_user);

with target_user as (
  select id
  from auth.users
  where email = 'ironlogic.beta+001@example.com'
)
delete from public.user_settings
where user_id in (select id from target_user);

with target_user as (
  select id
  from auth.users
  where email = 'ironlogic.beta+001@example.com'
)
delete from public.subscription_statuses
where user_id in (select id from target_user);

delete from auth.users
where email = 'ironlogic.beta+001@example.com';

commit;
