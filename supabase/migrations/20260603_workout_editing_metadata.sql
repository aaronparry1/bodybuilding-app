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

create index if not exists performed_exercises_origin_idx
  on public.performed_exercises(user_id, exercise_origin);

create index if not exists performed_sets_type_idx
  on public.performed_sets(performed_exercise_id, set_type);
