# ResolvedWorkoutIntent / CoachingPacket Contract v1

Decision ID: 12A

## Purpose

ResolvedWorkoutIntent is the single contract between the coaching engines and the Workout Builder.

It prevents parallel authority by requiring all workout-building inputs to pass through one validated packet before assembly.

## Core Rule

Workout Builder must accept only a ResolvedWorkoutIntent / CoachingPacket.

Workout Builder must not consume raw outputs from individual engines and must not invent exercise, method, loading, volume, warm-up, rest, density, conditioning, or PR logic.

## Required Fields

- goal translation
- athlete model snapshot id
- training state
- adaptation summary
- recovery summary
- selected intervention
- resolver decision
- session objective
- session layers
- support functions
- ranked exercise candidates
- selected exercises
- selected methods
- loading prescriptions
- resource allocation
- warm-up plan
- recovery between efforts
- density plan
- energy system objective
- PR opportunity
- safety constraints
- reason codes
- confidence
- review after sessions

## Validation

The packet must be produced before Workout Builder runs.

If required fields are missing, validation returns a diagnostic error and the builder must fail closed. It must not fall back to legacy generation or invent missing coaching decisions.

## Legacy Quarantine

Legacy generation may remain only behind an explicit rollback or QA flag. It must not act as a silent fallback for incomplete coaching packets.

## Regression Protections

- Direct Workout Builder calls without a packet fail closed.
- Missing required fields produce diagnostics.
- Resolver authority is asserted in the packet.
- Raw engine outputs cannot bypass the packet.
- Legacy generation is explicitly rollback-gated.
