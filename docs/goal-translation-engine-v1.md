# Goal Translation Engine v1

Decision ID: 11A

## Purpose

The Goal Translation Engine translates user-facing outcomes into coach-facing objectives that the rest of Adaptive Strength Coach can execute.

Users express desired outcomes. They do not provide a complete coaching plan. This engine preserves the user's stated priority, resolves conflicts safely, and returns structured objectives, priorities, constraints, and success measures.

## Inputs

- user stated goal
- secondary user goals where provided
- training age
- current strength level
- bodyweight goal where provided
- sport where provided
- available equipment
- preferred schedule
- available time
- injury and pain restrictions
- adherence history
- Living Athlete Model summaries
- Coaching Evidence summaries

## Outputs

- primary training goal
- secondary training goals
- long-term objective
- current-phase objective
- session priority bias
- recommended training states
- progression expectations
- support function priorities
- energy system priorities
- recovery priority
- contraindicated emphases
- success metrics
- confidence
- reason codes

## Architecture Boundary

11A does not build workouts, select exercises, prescribe methods, prescribe load, prescribe reps, prescribe sets, mutate programmes, or update athlete learning.

Downstream engines consume translated objectives instead of raw user wording.

## Core Rules

- Do not treat user wording as a complete coaching plan.
- Translate vague goals into measurable coaching objectives.
- Preserve the user's stated priority.
- Resolve conflicts safely.
- Fat loss does not automatically become high-conditioning training.
- Strength goals bias loadable, measurable, progressive movements.
- Hypertrophy goals bias recoverable volume, target muscle stimulus, and progression consistency.
- Athletic goals bias transfer, power, speed, energy system development, and movement quality.
- General fitness biases sustainable strength, movement quality, conditioning, and recovery.
- Return-after-layoff biases Foundation/Pivot style re-entry and conservative progression.
- Return reason codes explaining the translation.

## Regression Protections

- Vague goals translate into structured objectives.
- Conflicting goals preserve the primary goal while raising safety/recovery priority.
- Fat loss does not force excessive conditioning.
- Strength, hypertrophy, athletic, and general fitness produce different priorities.
- Downstream engines consume translated objectives rather than raw user wording.
