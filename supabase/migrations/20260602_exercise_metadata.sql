-- Adds richer exercise metadata used by swaps and rules-based generated workouts.
-- Safe to run repeatedly on staging/production.

alter table public.exercises
  add column if not exists suitable_blocks text[] not null default '{hypertrophy,powerbuilding,strength_hypertrophy,strength,power,peak,deload}',
  add column if not exists swap_tags text[] not null default '{}',
  add column if not exists exercise_kind text not null default 'other',
  add column if not exists default_rep_range_min integer,
  add column if not exists default_rep_range_max integer;

update public.exercises
set
  exercise_kind = coalesce(nullif(exercise_kind, 'other'), kind, 'other'),
  default_rep_range_min = coalesce(default_rep_range_min, (default_rep_range->>'min')::integer, 8),
  default_rep_range_max = coalesce(default_rep_range_max, (default_rep_range->>'max')::integer, 12),
  swap_tags = case
    when cardinality(swap_tags) > 0 then swap_tags
    else array_remove(array[category, movement_pattern, coalesce(nullif(exercise_kind, 'other'), kind, 'other')], null) || equipment
  end
where true;

alter table public.exercises
  alter column default_rep_range_min set not null,
  alter column default_rep_range_min set default 8,
  alter column default_rep_range_max set not null,
  alter column default_rep_range_max set default 12;

create index if not exists exercises_suitable_blocks_gin_idx on public.exercises using gin (suitable_blocks);
create index if not exists exercises_swap_tags_gin_idx on public.exercises using gin (swap_tags);
