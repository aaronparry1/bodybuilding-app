# External-link inventory

| Source | Link behavior | Validation |
|---|---|---|
| `app/(protected)/paywall.tsx` | `Linking.openURL(url)` for legal/support/payment-related links | Static host/scheme review required; current handler catches rejection without user-visible diagnostic |
| Expo Router routes | internal route links | typed/local route paths |
| Supabase/RevenueCat endpoints | SDK-configured HTTPS endpoints | Values are environment/config driven; secrets not printed |

No universal-link association or custom-scheme proof was found in the inspected tracked files. A complete host allowlist and platform association audit remains an evidence gap.
