# Session PR Opportunity Policy v1

Decision ID: 10H

Status: Locked architecture.

## Purpose

Every workout should include at least one realistic opportunity for measurable progress, inspired by the Westside principle of frequent PRs, without forcing unsafe or inappropriate max effort.

## Core Principle

ASC should aim to create a small, achievable PR opportunity every session.

A PR opportunity is not mandatory if safety, recovery, pain, poor execution quality, method rules, or Productive Training Exposure make it inappropriate.

## PR Types

- load PR
- rep PR
- estimated 1RM PR
- volume PR
- density PR
- set quality PR
- consistency PR
- exercise variation PR
- recovery-friendly PR

## Inputs

- session objective
- training state
- selected method
- loading prescription
- exercise history
- recent PR history
- adaptation status
- recovery status
- pain/safety flags
- execution quality history
- athlete model summary
- intervention outputs

## Rules

Prefer low-cost PRs when recovery is limited.

Allow bigger or more taxing PRs only when recovery, adaptation, method rules, execution quality, and safety support them.

Do not force PRs during compromised recovery, pain, poor execution, deload, or pivot unless the PR is recovery-friendly.

PR opportunities must support the session objective.

PR targets should be small and realistic.

Do not chase PRs that conflict with method rules or effort caps.

If no physical PR is appropriate, use consistency, quality, completion, or recovery-friendly PRs.

PR attempts must pass through Live Workout Coaching and Productive Training Exposure rules.

PR outcomes feed the Coaching Evidence Engine.

User-facing messaging should frame PRs as progress, not pressure.

## Outputs

- selected PR opportunity
- PR type
- target exercise
- target metric
- target threshold
- confidence
- risk level
- reason codes
- fallback PR option
- user-facing message

## Boundaries

This policy identifies the best PR opportunity within the existing workout plan.

It does not:

- directly change programming
- override safety or pain
- override method effort caps
- force max effort
- decide live execution
- update the athlete model

Live Workout Coaching decides whether the opportunity remains appropriate during execution.

## Regression Protections

Tests must prove:

- every suitable session gets a PR opportunity
- unsafe PR attempts are blocked
- recovery-limited sessions use low-cost PRs
- PR chasing cannot override pain, safety, or Productive Training Exposure
- PR outcomes feed the Coaching Evidence Engine
