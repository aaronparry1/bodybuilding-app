# Unknowns and device gates

## Blocked/unknown

- Current Play state beyond the supplied Candidate 111 report; do not call it approved/installable/public.
- Current TestFlight/App Store live state.
- Source 16 (`16-Applied-Strongman-Training-for-Sport-POLIQUIN-and-McDERMOTT.pdf`) remains unreviewed; no usable replacement was available in this workspace. It is a low-priority supplementary unknown, not a product/device gate.
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

The other 15 historical sources were inspected outside the repository at the authoritative supplied path, with extraction status and page candidates documented. Source 16 may be revisited only if a clean exact edition and provenance/permission are later available. A similarly titled copy is not an acceptable silent substitute, and no product work should wait for it.

## Scope-decision unknowns

The mission is decided; operational policies are not. The evidence register contains 43 unresolved decisions, including eight critical gaps. None authorises implementation. Current repository routes/settings that may still expose athletic or conditioning semantics require a later code-level scope migration after reliability gates; this documentation task neither deletes nor silently reinterprets stored user state. Source 16 is explicitly not part of that critical/high evidence queue.
