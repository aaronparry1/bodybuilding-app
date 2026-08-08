# Persistence authority audit

Canonical active programme: the versioned canonical active-plan repository plus owner binding. Completed canonical sessions live in the recorded-session ledger; progress evidence remains keyed by plan/exercise identity. Legacy programme and workout stores are migration inputs and rollback evidence, read before reconciliation and never emptied as a hydration fallback.

Supabase Auth UUID owns remote rows. RevenueCat entitlement is subscription identity only and cannot own training data. The cloud backup envelope in `user_settings` carries canonical plan, recorded sessions, progress evidence, preferences and recovery state; custom programmes/exercises use their dedicated tables. SQLite/local stores remain usable when cloud access fails.

Authority counts: mounted coaching authorities 1; competing coaching authorities 0; UI adaptation authorities 0.
