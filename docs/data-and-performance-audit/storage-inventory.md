# Storage inventory

| Data | Authoritative source | Local replica | Remote | Retention / cleanup | Sensitivity | Bound |
|---|---|---|---|---|---|---|
| Auth session | Supabase Auth | SDK-managed | Supabase Auth | Sign-out handled by provider; local SDK cleanup not independently verified | high | SDK-defined |
| App settings/onboarding | `appSettingsStore` | JSON store / SQLite KV / web localStorage | user settings cloud blob | Sign-out/account deletion cleanup needs runtime confirmation | medium | small object |
| Canonical active plan | canonical carrier + v2 repository | JSON store / SQLite KV | cloud backup transport | immutable revisions; migration/archive retained | high | plan size |
| Recorded sessions/events | canonical ledger | JSON object keyed by ID | backup transport; legacy cloud repository exists | history retained; no pagination in local export | high | unbounded by account history |
| Progress evidence/decisions | canonical repositories | JSON objects | included in backup | no explicit retention/eviction found | high | grows with evidence |
| Custom exercises/programmes | local repositories | JSON arrays | nested Supabase repositories | user deletion path requires confirmation | medium | unbounded arrays |
| Sync queue | `LocalSyncQueueStore` | JSON array | Supabase on flush | queue removal after flush; retry bounds require runtime test | high | potentially grows offline |
| Billing cache | subscription cache | JSON store | RevenueCat when configured | entitlement cache normalized; TTL policy requires confirmation | high | small |
| Legacy archive | `legacyTrainingYearArchive` | JSON store | migration/archive only | retained for compatibility | high | migration payload |

`jsonStore` caches parsed values by raw string but stores entire values. There is no general byte/count quota or eviction policy for history-shaped records.
