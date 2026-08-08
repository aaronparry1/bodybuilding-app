# Post-recovery UI/UX backlog

This backlog is separate from the release-recovery slice. It does not authorise a redesign or move UI polish ahead of retained-data, backup and lifecycle proof.

| Priority | Item | Evidence | Acceptance direction |
|---|---|---|---|
| Gate | Physically verify workout brand tokens | Current Train and completion summary consume `workoutColors`; contrast tests pass, but owner reports inconsistent real screens | current Android/iOS screenshots show canonical background/surface/accent/state colours; identify exact route/component for any mismatch before editing |
| Gate | Discard interaction observability | Domain transaction is deeply tested; owner reports broken behaviour | record pre-state, confirmation, result copy/reason, destination, clean session availability and force-close outcome on current build |
| High | Workout logging density and one-hand speed | Baseline audit identifies dense Train UI and lacks native timings | measured open-to-set, set-entry and timer actions meet explicit device budgets without smaller targets or inaccessible type |
| High | Programme visibility | Canonical snapshots exist but athlete-facing phase/change explanations are incomplete | stable future programme, current phase and affected sessions are visible with clear provenance |
| High | Change explanations and control | Deterministic receipts exist but user-facing “kept/changed/why/return condition” is incomplete | every programme-level change is attributable, bounded and reversible where policy permits |
| Medium | Loading/error/empty states | Recovery distinguishes unavailable/retryable/blocked states, while route presentation is uneven | no destructive onboarding or generic empty state masks existing data; retry and support action are explicit |
| Medium | Navigation consistency | Shared router and protected shell exist; Android back/keyboard and iPad remain under-certified | Home/Plan/Train/history/settings transitions pass physical back, keyboard, accessibility and deep-link checks |
| Medium | Cross-platform component consistency | Shared React Native code is not device parity proof | representative Android/iPhone matrix plus TalkBack/VoiceOver, 200% text and reduced-motion captures |

Do not fix an owner-reported visual issue by inventing a second palette. Locate the mounted route, reproduce it, and repair the semantic token consumer or stale build only.
