-- Run this in the Supabase staging SQL editor after applying supabase/schema.sql.
-- It checks tables, RLS, policies, auth profile trigger, and basic synced data shape.

with required_tables(table_name) as (
  values
    ('profiles'),
    ('exercises'),
    ('programmes'),
    ('programme_days'),
    ('planned_exercises'),
    ('workout_sessions'),
    ('performed_exercises'),
    ('performed_sets'),
    ('user_settings'),
    ('subscription_statuses'),
    ('sync_queue')
)
select
  required_tables.table_name,
  case when pg_tables.tablename is null then 'missing' else 'present' end as status
from required_tables
left join pg_tables
  on pg_tables.schemaname = 'public'
 and pg_tables.tablename = required_tables.table_name
order by required_tables.table_name;

select
  schemaname,
  tablename,
  rowsecurity as rls_enabled
from pg_tables
where schemaname = 'public'
  and tablename in (
    'profiles',
    'exercises',
    'programmes',
    'programme_days',
    'planned_exercises',
    'workout_sessions',
    'performed_exercises',
    'performed_sets',
    'user_settings',
    'subscription_statuses',
    'sync_queue'
  )
order by tablename;

select
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
from pg_policies
where schemaname = 'public'
order by tablename, policyname;

select
  trigger_schema,
  event_object_schema,
  event_object_table,
  trigger_name,
  action_timing,
  event_manipulation
from information_schema.triggers
where event_object_schema = 'auth'
  and event_object_table = 'users'
  and trigger_name = 'on_auth_user_created_profile';

select
  routine_schema,
  routine_name,
  routine_type
from information_schema.routines
where routine_schema = 'public'
  and routine_name = 'handle_new_user_profile';

with required_exercise_columns(column_name) as (
  values
    ('category'),
    ('primary_muscles'),
    ('secondary_muscles'),
    ('equipment'),
    ('movement_pattern'),
    ('exercise_kind'),
    ('kind'),
    ('default_rep_range'),
    ('default_rep_range_min'),
    ('default_rep_range_max'),
    ('default_load_jump'),
    ('suitable_blocks'),
    ('swap_tags')
)
select
  required_exercise_columns.column_name,
  case when columns.column_name is null then 'missing' else 'present' end as status
from required_exercise_columns
left join information_schema.columns columns
  on columns.table_schema = 'public'
 and columns.table_name = 'exercises'
 and columns.column_name = required_exercise_columns.column_name
order by required_exercise_columns.column_name;

select
  workout_sessions.user_id,
  count(distinct workout_sessions.id) as workout_sessions,
  count(distinct performed_exercises.id) as performed_exercises,
  count(distinct performed_sets.id) as performed_sets
from public.workout_sessions
left join public.performed_exercises on performed_exercises.workout_session_id = workout_sessions.id
left join public.performed_sets on performed_sets.performed_exercise_id = performed_exercises.id
group by workout_sessions.user_id
order by workout_sessions desc;
