# Coaching Engine V3 Internal Validation

This runbook enables Coaching Engine V3 active workout generation only for internal/dev validation.

Production defaults remain off. Do not add V3 active flags to the `production` EAS profile until a separate release decision is made.

## Internal Build Flags

The `development` and `preview` EAS profiles enable:

```bash
ASC_COACHING_ENGINE_V3=true
ASC_V3_ACTIVE_WORKOUT=true
ASC_V3_QUALITY_GATE_STRICT=true
EXPO_PUBLIC_ASC_COACHING_ENGINE_V3=true
EXPO_PUBLIC_ASC_V3_ACTIVE_WORKOUT=true
EXPO_PUBLIC_ASC_V3_QUALITY_GATE_STRICT=true
```

The non-public `ASC_*` flags support Node/test validation. The `EXPO_PUBLIC_ASC_*` flags are available to the Expo runtime.

## Run Locally With V3 On

```bash
ASC_COACHING_ENGINE_V3=true \
ASC_V3_ACTIVE_WORKOUT=true \
ASC_V3_QUALITY_GATE_STRICT=true \
EXPO_PUBLIC_ASC_COACHING_ENGINE_V3=true \
EXPO_PUBLIC_ASC_V3_ACTIVE_WORKOUT=true \
EXPO_PUBLIC_ASC_V3_QUALITY_GATE_STRICT=true \
npx expo start
```

## Run Locally With V3 Off

Unset the flags, or explicitly set them to `false`:

```bash
ASC_COACHING_ENGINE_V3=false \
ASC_V3_ACTIVE_WORKOUT=false \
ASC_V3_QUALITY_GATE_STRICT=false \
EXPO_PUBLIC_ASC_COACHING_ENGINE_V3=false \
EXPO_PUBLIC_ASC_V3_ACTIVE_WORKOUT=false \
EXPO_PUBLIC_ASC_V3_QUALITY_GATE_STRICT=false \
npx expo start
```

## Internal Build Commands

Development client:

```bash
npx eas-cli@latest build -p ios --profile development
```

Internal preview:

```bash
npx eas-cli@latest build -p ios --profile preview
```

Production:

```bash
npx eas-cli@latest build -p ios --profile production
```

Production must remain V3-off by default.

## Validation Indicator

In non-production builds only, the Train screen shows a small status line:

- `V3 active`: the current workout was built from an approved V3 packet.
- `V3 fallback`: V3 active mode was requested, but activation readiness failed and the legacy/current engine built the workout.
- `V3 off`: V3 active workout generation is not fully enabled.

The app also logs internal runtime status:

```text
[asc:v3-runtime] { environment, activeWorkoutReady, workoutSource, sessionId }
```

The V3 active gate logs:

```text
[asc:v3-active] { usedV3, readinessStatus, comparisonStatus, blockedReasons, fallbackReason }
```

These indicators must not appear in production UI. Production does not receive the internal EAS flags.

## Fallback Policy

V3 must never block workout start.

If V3 readiness fails, V3 crashes, or the quality gate blocks the packet, the current engine remains the active fallback and the app logs the blocked reason.

