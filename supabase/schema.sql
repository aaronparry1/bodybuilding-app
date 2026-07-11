create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.exercises (
  id text primary key default gen_random_uuid()::text,
  user_id uuid references auth.users(id) on delete cascade,
  created_by_user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  category text not null default 'chest',
  primary_muscles text[] not null default '{}',
  secondary_muscles text[] not null default '{}',
  equipment text[] not null default '{}',
  movement_pattern text not null default 'isolation',
  default_rep_range jsonb not null default '{"min": 8, "max": 12}',
  default_rep_range_min integer not null default 8,
  default_rep_range_max integer not null default 12,
  default_load_jump numeric not null default 2.5,
  unit_compatibility text[] not null default '{kg,lb}',
  kind text not null default 'other',
  exercise_kind text not null default 'other',
  exercise_role text not null default 'isolation',
  exercise_roles text[] not null default '{isolation}',
  exercise_family text not null default 'other',
  exercise_tier text not null default 'C',
  fatigue_cost text not null default 'low',
  joint_stress text not null default 'low',
  suitability text[] not null default '{beginner,intermediate,advanced}',
  is_beginner_friendly boolean not null default false,
  is_advanced boolean not null default false,
  notes text[] not null default '{}',
  suitable_blocks text[] not null default '{hypertrophy,powerbuilding,strength_hypertrophy,strength,power,peak,deload}',
  swap_tags text[] not null default '{}',
  is_custom boolean not null default false,
  default_settings jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.programmes (
  id text primary key default gen_random_uuid()::text,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_by_user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  description text,
  goal text not null default 'hypertrophy',
  experience_level text not null default 'intermediate',
  days_per_week integer not null default 3,
  notes text,
  is_custom boolean not null default true,
  is_preset boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.programme_days (
  id text primary key default gen_random_uuid()::text,
  user_id uuid not null references auth.users(id) on delete cascade,
  programme_id text not null references public.programmes(id) on delete cascade,
  name text not null,
  day_order integer not null,
  created_at timestamptz not null default now()
);

create table if not exists public.planned_exercises (
  id text primary key default gen_random_uuid()::text,
  user_id uuid not null references auth.users(id) on delete cascade,
  programme_day_id text not null references public.programme_days(id) on delete cascade,
  exercise_id text not null,
  planned_order integer not null,
  settings jsonb not null,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.workout_sessions (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  template_id text,
  programme_id text references public.programmes(id) on delete set null,
  name text not null,
  started_at timestamptz not null,
  completed_at timestamptz,
  sync_state text not null default 'synced',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.performed_exercises (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  workout_session_id text not null references public.workout_sessions(id) on delete cascade,
  exercise_id text not null,
  exercise_name text not null,
  settings jsonb not null,
  load numeric not null,
  load_known boolean not null default true,
  status text not null,
  shutdown_reason text,
  exercise_order integer not null,
  exercise_origin text not null default 'planned',
  swapped_from_exercise_id text,
  swapped_from_exercise_name text,
  swapped_to_exercise_id text,
  swapped_to_exercise_name text,
  archived_swapped_sets jsonb not null default '[]'::jsonb,
  added_at timestamptz,
  swapped_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.performed_sets (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  performed_exercise_id text not null references public.performed_exercises(id) on delete cascade,
  set_number integer not null,
  reps integer not null check (reps >= 0),
  load numeric not null check (load >= 0),
  set_type text not null default 'work',
  logged_at timestamptz not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  settings jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.subscription_statuses (
  user_id uuid primary key references auth.users(id) on delete cascade,
  entitlement text not null default 'free',
  provider text,
  provider_customer_id text,
  renews_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sync_queue (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entity_type text not null,
  entity_id text not null,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)))
  on conflict (id) do update
    set email = excluded.email,
        updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
after insert on auth.users
for each row execute function public.handle_new_user_profile();

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

alter table public.planned_exercises drop constraint if exists planned_exercises_exercise_id_fkey;

alter table public.exercises
  add column if not exists suitable_blocks text[] not null default '{hypertrophy,powerbuilding,strength_hypertrophy,strength,power,peak,deload}',
  add column if not exists swap_tags text[] not null default '{}',
  add column if not exists exercise_kind text not null default 'other',
  add column if not exists exercise_role text not null default 'isolation',
  add column if not exists exercise_roles text[] not null default '{isolation}',
  add column if not exists exercise_family text not null default 'other',
  add column if not exists exercise_tier text not null default 'C',
  add column if not exists fatigue_cost text not null default 'low',
  add column if not exists joint_stress text not null default 'low',
  add column if not exists suitability text[] not null default '{beginner,intermediate,advanced}',
  add column if not exists default_rep_range_min integer,
  add column if not exists default_rep_range_max integer;

update public.exercises
set
  exercise_kind = coalesce(nullif(exercise_kind, 'other'), kind, 'other'),
  exercise_role = case
    when exercise_role is not null and exercise_role <> '' and exercise_role <> 'isolation' then exercise_role
    when movement_pattern = 'isolation' then 'isolation'
    when movement_pattern in ('core', 'carry') then 'accessory'
    when coalesce(exercise_kind, kind) = 'barbell' or movement_pattern in ('squat', 'hinge') then 'primary_compound'
    else 'secondary_compound'
  end,
  exercise_roles = case
    when cardinality(exercise_roles) > 0 and exercise_roles <> '{isolation}' then exercise_roles
    when movement_pattern in ('core', 'carry') then array['accessory', 'corrective']
    else array[
      case
        when movement_pattern = 'isolation' then 'isolation'
        when coalesce(exercise_kind, kind) = 'barbell' or movement_pattern in ('squat', 'hinge') then 'primary_compound'
        else 'secondary_compound'
      end
    ]
  end,
  exercise_family = case
    when exercise_family is not null and exercise_family <> 'other' then exercise_family
    when category = 'chest' and movement_pattern = 'isolation' then 'chest_isolation'
    when category in ('shoulders', 'rear_delts') and movement_pattern = 'isolation' then 'shoulder_isolation'
    when category = 'biceps' and movement_pattern = 'isolation' then 'biceps_isolation'
    when category = 'triceps' and movement_pattern = 'isolation' then 'triceps_isolation'
    when category = 'quads' and movement_pattern = 'isolation' then 'quad_isolation'
    when category = 'hamstrings' and movement_pattern = 'isolation' then 'hamstring_isolation'
    when category = 'glutes' and movement_pattern = 'isolation' then 'glute_isolation'
    when category = 'calves' then 'calf_raise'
    when category = 'forearms' then 'forearm'
    when category = 'traps' then 'trap'
    when category = 'adductors' then 'adductor'
    when category = 'abductors' then 'abductor'
    when movement_pattern = 'horizontal_push' then 'horizontal_press'
    when movement_pattern = 'vertical_push' then 'vertical_press'
    when movement_pattern = 'horizontal_pull' then 'horizontal_pull'
    when movement_pattern = 'vertical_pull' then 'vertical_pull'
    when movement_pattern = 'squat' then 'squat_pattern'
    when movement_pattern = 'hinge' then 'hip_hinge'
    when movement_pattern = 'hip_thrust' then 'hip_thrust'
    when movement_pattern = 'lunge' then 'single_leg'
    when movement_pattern = 'core' then 'core_flexion'
    when movement_pattern = 'carry' then 'carry'
    else 'other'
  end,
  exercise_tier = case
    when exercise_tier in ('A', 'B', 'C') then exercise_tier
    when exercise_role in ('primary_compound', 'power') then 'A'
    when exercise_role in ('secondary_compound', 'accessory') then 'B'
    else 'C'
  end,
  fatigue_cost = case
    when fatigue_cost in ('low', 'moderate', 'high') then fatigue_cost
    when exercise_role in ('primary_compound', 'power') then 'high'
    when exercise_role in ('secondary_compound', 'accessory') then 'moderate'
    else 'low'
  end,
  joint_stress = case
    when joint_stress in ('low', 'moderate', 'high') then joint_stress
    when exercise_role in ('primary_compound', 'power') then 'high'
    when exercise_role = 'secondary_compound' then 'moderate'
    else 'low'
  end,
  suitability = case
    when cardinality(suitability) > 0 then suitability
    when is_advanced then array['intermediate', 'advanced']
    else array['beginner', 'intermediate', 'advanced']
  end,
  default_rep_range_min = coalesce(default_rep_range_min, (default_rep_range->>'min')::integer, 8),
  default_rep_range_max = coalesce(default_rep_range_max, (default_rep_range->>'max')::integer, 12),
  swap_tags = case
    when cardinality(swap_tags) > 0 then swap_tags
    else array_remove(array[category, movement_pattern, coalesce(nullif(exercise_kind, 'other'), kind, 'other'), exercise_role, exercise_family, exercise_tier], null) || equipment
  end
where true;

alter table public.exercises
  alter column default_rep_range_min set not null,
  alter column default_rep_range_min set default 8,
  alter column default_rep_range_max set not null,
  alter column default_rep_range_max set default 12;

alter table public.performed_exercises
  add column if not exists load_known boolean not null default true,
  add column if not exists exercise_origin text not null default 'planned',
  add column if not exists swapped_from_exercise_id text,
  add column if not exists swapped_from_exercise_name text,
  add column if not exists swapped_to_exercise_id text,
  add column if not exists swapped_to_exercise_name text,
  add column if not exists archived_swapped_sets jsonb not null default '[]'::jsonb,
  add column if not exists added_at timestamptz,
  add column if not exists swapped_at timestamptz,
  add column if not exists metadata jsonb not null default '{}'::jsonb;

alter table public.performed_sets
  add column if not exists set_type text not null default 'work',
  add column if not exists metadata jsonb not null default '{}'::jsonb;

update public.performed_exercises
set
  load_known = coalesce(load_known, true),
  exercise_origin = coalesce(nullif(exercise_origin, ''), 'planned'),
  archived_swapped_sets = coalesce(archived_swapped_sets, '[]'::jsonb),
  metadata = coalesce(metadata, '{}'::jsonb)
where true;

update public.performed_sets
set
  set_type = coalesce(nullif(set_type, ''), 'work'),
  metadata = coalesce(metadata, '{}'::jsonb)
where true;

alter table public.performed_exercises
  drop constraint if exists performed_exercises_origin_check;

alter table public.performed_exercises
  add constraint performed_exercises_origin_check
  check (exercise_origin in ('planned', 'added_during_workout', 'swapped_in'));

alter table public.performed_sets
  drop constraint if exists performed_sets_set_type_check;

alter table public.performed_sets
  add constraint performed_sets_set_type_check
  check (set_type in ('warmup', 'work'));

drop policy if exists "profiles own rows" on public.profiles;
drop policy if exists "exercises own or public read" on public.exercises;
drop policy if exists "exercises own write" on public.exercises;
drop policy if exists "programmes own rows" on public.programmes;
drop policy if exists "programme_days own rows" on public.programme_days;
drop policy if exists "planned_exercises own rows" on public.planned_exercises;
drop policy if exists "workout_sessions own rows" on public.workout_sessions;
drop policy if exists "performed_exercises own rows" on public.performed_exercises;
drop policy if exists "performed_sets own rows" on public.performed_sets;
drop policy if exists "user_settings own rows" on public.user_settings;
drop policy if exists "subscription_statuses own rows" on public.subscription_statuses;
drop policy if exists "sync_queue own rows" on public.sync_queue;

create policy "profiles own rows" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "exercises own or public read" on public.exercises for select using (user_id is null or auth.uid() = user_id);
create policy "exercises own write" on public.exercises for all using (auth.uid() = user_id) with check (auth.uid() = user_id and auth.uid() = created_by_user_id);
create policy "programmes own rows" on public.programmes for all using (auth.uid() = user_id) with check (auth.uid() = user_id and auth.uid() = created_by_user_id);
create policy "programme_days own rows" on public.programme_days for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "planned_exercises own rows" on public.planned_exercises for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "workout_sessions own rows" on public.workout_sessions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "performed_exercises own rows" on public.performed_exercises for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "performed_sets own rows" on public.performed_sets for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "user_settings own rows" on public.user_settings for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "subscription_statuses own rows" on public.subscription_statuses for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "sync_queue own rows" on public.sync_queue for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists exercises_user_id_idx on public.exercises(user_id);
create index if not exists exercises_suitable_blocks_gin_idx on public.exercises using gin (suitable_blocks);
create index if not exists exercises_swap_tags_gin_idx on public.exercises using gin (swap_tags);
create index if not exists workout_sessions_user_started_idx on public.workout_sessions(user_id, started_at desc);
create index if not exists performed_exercises_session_idx on public.performed_exercises(workout_session_id);
create index if not exists performed_exercises_origin_idx on public.performed_exercises(user_id, exercise_origin);
create index if not exists performed_sets_exercise_idx on public.performed_sets(performed_exercise_id);
create index if not exists performed_sets_type_idx on public.performed_sets(performed_exercise_id, set_type);
