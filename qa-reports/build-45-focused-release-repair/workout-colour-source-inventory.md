# Workout colour source inventory

Verdict: **PROVEN**

| Surface/state | Production source | Colour authority before repair | Result |
|---|---|---|---|
| Preview, active shell, progress, cards, exercise rail, set rows | `app/(protected)/(tabs)/train.tsx` | `workoutColors` | **PROVEN** |
| Inputs, completed sets, disabled sets | Train `styles` | `workoutColors` plus React Native disabled opacity | **PROVEN** |
| Rest panel and controls | `RestPanel` / `RestAction` | `workoutColors` | **PROVEN** |
| Pause/resume, Finish, modal/sheet, Discard | `TrainActionModal` | `workoutColors` | **PROVEN** |
| Loading/error/unavailable | `UnavailableState` | general `colors` alias | migrated to `workoutColors` |
| Subscription/paywall within Train | `TrainPaywall` | general `colors` alias | migrated to `workoutColors` |
| Completion summary | `app/(protected)/completion-summary.tsx` | general `colors` alias | migrated to `workoutColors` |
| Production route | `app-production/(protected)/(tabs)/train.tsx` | re-export | **PROVEN** |
| Home workout projection | `src/ui/home-dashboard.tsx` | canonical global theme | unchanged |
| Plan workout projection | mounted Plan presentation | canonical global theme | unchanged |

No raw colour literals or duplicate local workout palette exist in the mounted Train or completion-summary files after repair. Navigation tabs remain provided by the existing protected tab layout.

Rendered-web evidence observed:

- background `#07090d`;
- workout/exercise surfaces `#101722` and `#151d2a`;
- active accent `#d8b56d`;
- destructive action `#e97872`;
- no console warnings or errors during the exercised route.

The older installed Build 45 palette cannot be reconstructed from current source, so its binary-specific cause is **NOT PROVEN**.
