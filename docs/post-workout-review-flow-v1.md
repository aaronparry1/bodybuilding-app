# Post-Workout Review Flow v1

Decision ID: 10F

Status: Locked architecture.

## Purpose

The Post-Workout Review Flow captures the minimum useful user feedback required to validate workout evidence, update coaching evidence, and improve future coaching decisions.

The flow does not interrogate the user. It asks only what improves coaching.

## Architecture Rule

Post-workout review collects user feedback. It does not directly update the athlete model.

All learning must pass through:

Post-Workout Review -> Quality of Execution Engine -> Coaching Evidence Engine -> Living Athlete Model

## Review Sections

### Session Summary

Show:

- completed work
- missed work
- live adjustments
- PRs or notable performances
- safety/pain events
- session duration

### Required Questions

Ask:

- How hard did the session feel?
- Any pain or discomfort?
- Did anything stop you completing the plan?

### Conditional Questions

Ask only when relevant:

- pain occurred: location, severity, movement affected
- incomplete workout: time, fatigue, equipment, pain, motivation, other
- substitutions happened: whether replacement was acceptable
- unusually poor performance: sleep, stress, or recovery context
- conditioning/accessories skipped: why

### Optional Notes

Allow free-text notes, but never require them.

## Outputs

- session difficulty
- pain feedback
- completion reason
- user constraint reason
- substitution feedback
- recovery context
- user notes
- evidence flags for 10D
- evidence flags for 9J

## Rules

Keep review short by default.

Never ask irrelevant questions.

Safety and pain questions override friction concerns.

Missed or modified work must be explained before learning from it.

User feedback is evidence, not absolute truth.

Review data feeds Quality of Execution first.

Coaching Evidence decides what can be learned.

Living Athlete Model is never updated directly from review answers.

## Regression Protections

Tests must prove:

- review flow is adaptive, not a fixed questionnaire
- pain and incomplete workouts trigger follow-up questions
- clean completed workouts stay low-friction
- review data cannot directly mutate the athlete model
- evidence passes through 10D and 9J
