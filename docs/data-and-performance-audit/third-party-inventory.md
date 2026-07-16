# Third-party inventory

| Integration | Purpose | Data / auth | UI blocking | Environment / status |
|---|---|---|---|---|
| Supabase | auth, settings, programmes, exercises, workout transport | user-scoped rows; publishable client config | Auth restore and explicit sync can await network | Optional config; RLS/index proof requires Supabase access |
| RevenueCat | native entitlement/purchases | public SDK key and app user ID | Provider refresh/purchase actions await gateway; web uses mock | Native configured only when keys/native module exist |
| Expo/React Native | runtime, storage, navigation | local platform services | startup/runtime dependency | Expo SDK 56 |
| Expo SQLite KV | native local persistence | local device only | synchronous KV calls | fallback memory storage if unavailable |
| Browser localStorage | web local persistence | local browser only | synchronous | web only |

No analytics/crash SDK import was found in the targeted source inventory. No telemetry activation occurred. Apple/Google auth methods are explicitly future integration points and throw when called.
