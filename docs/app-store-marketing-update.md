# App Store Marketing Update

Date: 2026-06-17

Purpose: prepare the first live-store marketing cleanup update for Adaptive Strength Coach after version 1.0.0 (3) went live with the old Expo-style icon and old screenshots.

## Binary-Owned Changes

These require a new iOS binary:

- App icon: use the dark/gold bench logo.
- iOS home-screen display label: use `A.S.C.` so the label fits cleanly under the icon.

Keep the App Store product name as:

```text
Adaptive Strength Coach
```

Reason: the full name is better for search, brand clarity, and App Store discovery. The short `A.S.C.` label is only for the installed iPhone home-screen label.

## Recommended App Store Metadata

### App Name

```text
Adaptive Strength Coach
```

### Subtitle

```text
Adaptive Strength Training
```

### Promotional Text

```text
Evidence-based workouts, adaptive progression, PR tracking, recovery guidance and strength reports in one focused coaching app.
```

### Keywords

```text
workout,gym,weights,lifting,powerlifting,hypertrophy,1RM,PR,barbell,fitness,bodybuilding
```

Notes:

- Apple keywords are limited to 100 characters.
- Do not repeat words already used in the app name/subtitle where possible.
- Current keyword string length: 88 characters.

## Short Description / Review-Friendly Positioning

```text
Adaptive Strength Coach builds evidence-based strength and hypertrophy plans that adjust to your performance, recovery, and progress.
```

## Full Description

```text
Adaptive Strength Coach is a focused training app for lifters who want structured strength and hypertrophy coaching without spreadsheets, guesswork, or max testing.

Build your plan, train, log your sets, and let the app adapt your next sessions from real performance evidence.

Adaptive Strength Coach helps you:

- Follow evidence-based strength and hypertrophy programming
- Train with adaptive set, rep, and load targets
- Track estimated 1RM without testing a true max
- See Strength Dashboard trends for bench press, squat, deadlift, and overhead press
- Capture load, rep, and estimated-strength PRs
- Use Workout Review to approve or hold next-session recommendations
- Manage fatigue with Recovery Windows instead of rigid calendar deloads
- Add Recovery & Capacity work without turning the app into a running or calorie tracker
- Prepare for powerlifting meets with specificity, tapering, and fatigue control
- Review progress with strength, volume, recovery, and consistency reports

The system is performance-based. You do not need to enter RPE or RIR. The app watches load, reps, workout history, target zones, fatigue signs, block context, and consistency to guide the next step.

More weight is not always the smartest move. Some weeks you push. Some weeks you hold. Some weeks the app pulls back so progress can continue.

Adaptive Strength Coach is built for lifters who want intelligent coaching, not random workouts.
```

## Screenshot Refresh Plan

Use screenshots from the current dark/gold Adaptive Strength Coach app, not the old blue/green Iron Logic-style app.

Recommended iPhone screenshot order:

1. Paywall / value proposition
   - Caption: `Start your adaptive strength plan`
   - Shows trial/subscription value clearly.

2. Home / weekly plan
   - Caption: `Know what to train today`
   - Shows current block, week, next workout, and Recovery & Capacity if applicable.

3. Workout logging / Train
   - Caption: `Log sets. Get coached.`
   - Shows set targets, target zone, and clean workout flow.

4. Workout Review
   - Caption: `Approve smarter progression`
   - Shows approve/keep recommendations, PRs, and baseline/progression copy.

5. Strength Dashboard
   - Caption: `Track strength without max testing`
   - Shows e1RM, 30-day/90-day trends, primary lifts.

6. Progress reports / PR history
   - Caption: `See what is actually improving`
   - Shows Strength, Volume, Recovery, Consistency, or PR history.

7. Recovery & Capacity
   - Caption: `Build your engine without interfering`
   - Shows weekly recovery/cardio target and timing guidance.

8. Powerlifting Meet mode
   - Caption: `Peak for meet day`
   - Shows event countdown, taper/recovery context, or meet-specific plan.

## Screenshot Capture Notes

- Use iPhone 6.9-inch screenshots first if possible.
- Keep text large enough to read in App Store search results.
- Avoid screenshots with personal notes, pain/injury reasons, private user data, or raw debug/design fixture labels.
- Prefer polished production paths over QA fixture screens.
- Keep all screenshots visually consistent: dark background, gold/cream accents, premium training feel.

## Developer Name: David Parry -> ARX Algorithms

This is not controlled by the app binary.

Apple's current guidance says:

- Individual Apple Developer Program accounts use the legal name as the developer name.
- Organization accounts can set a developer name if it is a registered trade name, DBA, or fictitious business name.
- The developer name is set when adding the first app and cannot simply be edited later in App Store Connect.

Likely routes:

1. Convert the Apple Developer membership from Individual to Organization if `ARX Algorithms` is a legal entity that Apple can verify.
2. Create/enroll an Organization developer account for `ARX Algorithms` and transfer the app if needed.
3. Contact Apple Developer Support/App Store Connect support to confirm the allowed route for the current account.

Do not expect a new app build to change the displayed developer/seller name.

## Recommended Release Sequence

1. Keep current live version available.
2. Build and submit a marketing cleanup version with:
   - corrected app icon
   - `A.S.C.` installed display label
   - fresh App Store screenshots
   - updated subtitle, keywords, promotional text, and description
3. Do not bundle coaching/warm-up/capacity changes into this marketing update.
4. Put actual app behaviour changes into a separate later release.

## Sources

- Apple product page guidance: https://developer.apple.com/app-store/product-page/
- Apple App Store search guidance: https://developer.apple.com/app-store/search/
- Apple developer name guidance: https://developer.apple.com/help/app-store-connect/create-an-app-record/set-your-developer-name/
