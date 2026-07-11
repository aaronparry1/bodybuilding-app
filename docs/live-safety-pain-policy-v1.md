# Live Safety & Pain Policy v1

Decision ID: 10C

Status: Locked architecture.

## Purpose

The Live Safety & Pain Policy is the hard safety gate for live workout execution. It evaluates pain, unsafe technique, dizziness, medical red flags, and equipment safety concerns during a workout.

The policy is conservative by design. It does not diagnose, treat, or provide medical advice. It gives safe coaching actions and routes safety evidence to the Coaching Evidence Engine.

## Categories

- no_issue
- normal_training_discomfort
- local_muscle_burn
- joint_pain
- sharp_pain
- radiating_pain
- worsening_pain
- technique_breakdown
- dizziness_or_medical_concern
- equipment_safety_issue

## Severity

- low
- moderate
- high
- critical

## Allowed Responses

- continue
- monitor
- reduce load
- reduce range of motion
- modify grip or stance
- slow tempo
- extend rest
- substitute lower-stress variation
- stop exercise
- stop workout
- recommend seeking appropriate professional advice

## Rules

Safety overrides progression, density, method, and session objective.

Sharp, radiating, worsening, or high-severity joint pain stops the affected exercise.

Dizziness, faintness, chest pain, or medical red flags stop the workout and use non-diagnostic language advising appropriate help.

Mild expected muscular discomfort can continue with monitoring.

Pain during warm-up triggers conservative modification before working sets.

Pain limited to a specific range of motion may allow range reduction only when low severity and safe.

Pain that persists after load, range, or setup modification requires stopping or substituting.

High-risk methods are blocked or downgraded when pain or recovery risk is present.

Pain evidence routes immediately to the Coaching Evidence Engine. One pain event does not become a permanent injury assumption.

## Boundaries

Live Workout Coaching and Live Constraint Resolution must obey this policy. They may consume its safety decision and blocked actions, but they must not create separate pain/safety logic.

This policy does not:

- diagnose injuries
- provide medical treatment
- permanently mutate programmes
- update the athlete model directly
- select replacement exercises
- decide future training state transitions

## Regression Protections

Tests must prove:

- pain vetoes progression
- sharp/radiating/worsening pain stops the exercise
- medical red flags stop the workout
- mild muscular discomfort can continue with monitoring
- evidence reaches 9J
- user-facing copy avoids diagnostic language
