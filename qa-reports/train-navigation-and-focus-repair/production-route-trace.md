# Production route trace

Verdict: **PROVEN** by resolved production configuration and mounted imports.

Production Expo configuration selects `app-production` in `app.config.ts`. The bundle identity remains `com.aaronparry.adaptivestrengthcoach`, version `1.0.17`, build `52`.

Mounted path:

`app-production/(protected)/_layout.tsx`
→ `src/application/shell/production-protected-layout.tsx`
→ `app-production/(protected)/(tabs)/_layout.tsx`
→ shared `app/(protected)/(tabs)/_layout.tsx`
→ `app-production/(protected)/(tabs)/train.tsx`
→ shared `app/(protected)/(tabs)/train.tsx`.

Workout lifecycle path:

Train UI
→ `minimiseCanonicalActiveWorkout`
→ existing `pauseCanonicalSession`
→ `canonicalRecordedSessionLedger.append`
→ persisted `paused` aggregate and canonical plan revision
→ authenticated tabs/Home projection
→ existing Resume action
→ `resumeCanonicalSession`
→ the same recorded-session identity.

The navigation coordinator does not evaluate coaching, generate sessions, edit prescriptions, or create another workout authority. Workout completion continues through `completeCanonicalSession`; Discard continues through `discardLatestCanonicalSessionAttempt` and the certified discard transaction.
