# Listener and subscription inventory

| Listener | Source | Mount / cleanup | Risk |
|---|---|---|---|
| Auth state | `auth-context.tsx` → Supabase `onAuthStateChange` | effect cleanup unsubscribes | network startup; duplicate mount should be tested |
| Canonical plan | protected layout, tabs and history/train screens | effects return store unsubscribe | many subscribers can fan out writes |
| Settings/sync diagnostics | settings and stores | repository subscriptions return cleanup | repeated navigation must be profiled |
| Programme/custom exercise repositories | builder/library hooks | subscriptions return cleanup | list updates can rerender consumers |
| RevenueCat/AppState | `subscription-context.tsx` | AppState subscription cleanup in effect | provider refresh may trigger network work |
| Timers | targeted source search found no production interval/timer owner in app paths | none identified | confirm rest timer implementation via runtime |
| Supabase realtime channels | no `channel(` production call found | none identified | no realtime leak evidence |

Static evidence shows cleanup for reviewed subscriptions. It does not prove no retained closure or render amplification; repeated mount/unmount measurement remains required.
