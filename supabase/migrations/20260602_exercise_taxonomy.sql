-- Adds exercise taxonomy metadata for coaching-grade generation, swaps, and rotation.
-- Safe to run repeatedly.

alter table public.exercises
  add column if not exists exercise_role text not null default 'isolation',
  add column if not exists exercise_roles text[] not null default '{isolation}',
  add column if not exists exercise_family text not null default 'other',
  add column if not exists exercise_tier text not null default 'C',
  add column if not exists fatigue_cost text not null default 'low',
  add column if not exists joint_stress text not null default 'low',
  add column if not exists suitability text[] not null default '{beginner,intermediate,advanced}';

update public.exercises
set
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
  swap_tags = case
    when cardinality(swap_tags) > 0 then swap_tags
    else array_remove(array[category, movement_pattern, coalesce(exercise_kind, kind), exercise_role, exercise_family, exercise_tier], null) || equipment
  end
where true;

create index if not exists exercises_exercise_family_idx on public.exercises (exercise_family);
create index if not exists exercises_exercise_tier_idx on public.exercises (exercise_tier);
create index if not exists exercises_exercise_role_idx on public.exercises (exercise_role);
