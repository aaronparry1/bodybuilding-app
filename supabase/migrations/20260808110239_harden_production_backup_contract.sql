-- Production backup-contract hardening.
--
-- This migration is deliberately data preserving: it contains no DELETE,
-- TRUNCATE, table replacement, or default-state writes. Existing profile rows
-- are never updated. The public schema already contains the application tables;
-- this records and tightens their API contract without changing training data.

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke all on function public.handle_new_user_profile() from public, anon, authenticated;
grant execute on function public.handle_new_user_profile() to postgres, service_role;

-- Backfill only a missing profile for an existing Auth identity. ON CONFLICT
-- DO NOTHING is intentional: an existing profile is immutable in this step.
insert into public.profiles (id, email, display_name)
select
  users.id,
  users.email,
  coalesce(users.raw_user_meta_data ->> 'display_name', split_part(users.email, '@', 1))
from auth.users as users
where not exists (select 1 from public.profiles where profiles.id = users.id)
on conflict (id) do nothing;

alter table public.profiles enable row level security;
alter table public.exercises enable row level security;
alter table public.programmes enable row level security;
alter table public.programme_days enable row level security;
alter table public.planned_exercises enable row level security;
alter table public.workout_sessions enable row level security;
alter table public.performed_exercises enable row level security;
alter table public.performed_sets enable row level security;
alter table public.user_settings enable row level security;
alter table public.subscription_statuses enable row level security;
alter table public.sync_queue enable row level security;

-- Replace broad PUBLIC policies with explicit authenticated-account policies.
drop policy if exists "profiles own rows" on public.profiles;
drop policy if exists "profiles owner select" on public.profiles;
drop policy if exists "profiles owner insert" on public.profiles;
drop policy if exists "profiles owner update" on public.profiles;
create policy "profiles owner select" on public.profiles for select to authenticated
  using ((select auth.uid()) = id);
create policy "profiles owner insert" on public.profiles for insert to authenticated
  with check ((select auth.uid()) = id);
create policy "profiles owner update" on public.profiles for update to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

drop policy if exists "exercises own or public read" on public.exercises;
drop policy if exists "exercises own write" on public.exercises;
drop policy if exists "exercises public or owner select" on public.exercises;
drop policy if exists "exercises owner insert" on public.exercises;
drop policy if exists "exercises owner update" on public.exercises;
drop policy if exists "exercises owner delete" on public.exercises;
create policy "exercises public or owner select" on public.exercises for select to anon, authenticated
  using (user_id is null or (select auth.uid()) = user_id);
create policy "exercises owner insert" on public.exercises for insert to authenticated
  with check ((select auth.uid()) = user_id and (select auth.uid()) = created_by_user_id);
create policy "exercises owner update" on public.exercises for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id and (select auth.uid()) = created_by_user_id);
create policy "exercises owner delete" on public.exercises for delete to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "programmes own rows" on public.programmes;
drop policy if exists "programmes owner select" on public.programmes;
drop policy if exists "programmes owner insert" on public.programmes;
drop policy if exists "programmes owner update" on public.programmes;
drop policy if exists "programmes owner delete" on public.programmes;
create policy "programmes owner select" on public.programmes for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "programmes owner insert" on public.programmes for insert to authenticated
  with check ((select auth.uid()) = user_id and (select auth.uid()) = created_by_user_id);
create policy "programmes owner update" on public.programmes for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id and (select auth.uid()) = created_by_user_id);
create policy "programmes owner delete" on public.programmes for delete to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "programme_days own rows" on public.programme_days;
drop policy if exists "programme_days owner rows" on public.programme_days;
create policy "programme_days owner rows" on public.programme_days for all to authenticated
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.programmes
      where programmes.id = programme_id and programmes.user_id = (select auth.uid())
    )
  );

drop policy if exists "planned_exercises own rows" on public.planned_exercises;
drop policy if exists "planned_exercises owner rows" on public.planned_exercises;
create policy "planned_exercises owner rows" on public.planned_exercises for all to authenticated
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.programme_days
      where programme_days.id = programme_day_id and programme_days.user_id = (select auth.uid())
    )
  );

drop policy if exists "workout_sessions own rows" on public.workout_sessions;
drop policy if exists "workout_sessions owner rows" on public.workout_sessions;
create policy "workout_sessions owner rows" on public.workout_sessions for all to authenticated
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    and (
      programme_id is null
      or exists (
        select 1 from public.programmes
        where programmes.id = programme_id and programmes.user_id = (select auth.uid())
      )
    )
  );

drop policy if exists "performed_exercises own rows" on public.performed_exercises;
drop policy if exists "performed_exercises owner rows" on public.performed_exercises;
create policy "performed_exercises owner rows" on public.performed_exercises for all to authenticated
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.workout_sessions
      where workout_sessions.id = workout_session_id and workout_sessions.user_id = (select auth.uid())
    )
  );

drop policy if exists "performed_sets own rows" on public.performed_sets;
drop policy if exists "performed_sets owner rows" on public.performed_sets;
create policy "performed_sets owner rows" on public.performed_sets for all to authenticated
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.performed_exercises
      where performed_exercises.id = performed_exercise_id and performed_exercises.user_id = (select auth.uid())
    )
  );

drop policy if exists "user_settings own rows" on public.user_settings;
drop policy if exists "user_settings owner rows" on public.user_settings;
create policy "user_settings owner rows" on public.user_settings for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- Entitlement is readable by its owner but writable only by trusted backend
-- roles. Training-data ownership must never be established from this table.
drop policy if exists "subscription_statuses own rows" on public.subscription_statuses;
drop policy if exists "subscription_statuses owner select" on public.subscription_statuses;
create policy "subscription_statuses owner select" on public.subscription_statuses for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "sync_queue own rows" on public.sync_queue;
drop policy if exists "sync_queue owner rows" on public.sync_queue;
create policy "sync_queue owner rows" on public.sync_queue for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- Data API permissions are explicit and least-privilege. RLS remains the
-- account-isolation boundary for every authenticated operation.
revoke all on all tables in schema public from anon, authenticated;
grant select on public.exercises to anon;
grant select, insert, update, delete on
  public.profiles,
  public.exercises,
  public.programmes,
  public.programme_days,
  public.planned_exercises,
  public.workout_sessions,
  public.performed_exercises,
  public.performed_sets,
  public.user_settings,
  public.sync_queue
to authenticated;
grant select on public.subscription_statuses to authenticated;

create index if not exists programme_days_user_programme_idx
  on public.programme_days (user_id, programme_id);
create index if not exists planned_exercises_user_day_idx
  on public.planned_exercises (user_id, programme_day_id);
create index if not exists workout_sessions_user_started_idx
  on public.workout_sessions (user_id, started_at desc);
create index if not exists performed_exercises_user_session_idx
  on public.performed_exercises (user_id, workout_session_id);
create index if not exists performed_sets_user_exercise_idx
  on public.performed_sets (user_id, performed_exercise_id);
create unique index if not exists sync_queue_user_entity_uidx
  on public.sync_queue (user_id, entity_type, entity_id);
