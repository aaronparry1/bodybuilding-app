# Unknowns and device gates

## Blocked/unknown

- Current Play state beyond the supplied Candidate 111 report; do not call it approved/installable/public.
- Current TestFlight/App Store live state.
- All 16 exact source PDFs, metadata, OCR and page claims.
- Android rendering, TalkBack, keyboard/back/haptics, billing and lifecycle.
- Current iOS rendering outside retained captures; iPad behavior.
- Native cold/warm/navigation/set/timer/memory/ANR metrics.
- Remote backup readback and second-device restore in current deployed infrastructure.
- Paid competitor behavior, offline guarantees, accessibility and private algorithms.

## Required gates

1. Candidate 111 retained Android in-place upgrade: before/after plan ID/revision, history counts/hashes, active attempt, timer, owner; then workout completion and backup readback. Do not update the affected device during this audit.
2. Fresh and returning iOS/Android: auth, offline, restore, logout/login, wrong-account block, interrupted sync.
3. Workout: keyboard, one-hand touch targets, pause/background/OS kill/clock change, edit/swap/discard/complete.
4. Accessibility: 200% text, VoiceOver/TalkBack order/actions, reduced motion, contrast, switch access.
5. Store: sandbox purchase/restore/cancel/paywall/account deletion with test identities.
6. Scale: 100/1,000 sessions and repeated navigation/memory/render counts.

Evidence needed for PDF unblock: place the 16 exact, unchanged files at `project_sources/` or provide authoritative paths and hashes plus permission to inspect them.
