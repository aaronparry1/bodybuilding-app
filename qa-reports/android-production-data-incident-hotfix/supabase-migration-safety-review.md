# Supabase migration safety review

Migration: `20260808110239_harden_production_backup_contract.sql`.

Safety properties: no table/schema drop, delete, truncate, default training-state write, or existing-profile update. Missing profiles are inserted only when absent; conflict behavior is `DO NOTHING`. The migration is repeatable, RLS remains enabled, grants are least-privilege, parent ownership is checked for nested programme/workout rows, subscription state is read-only to clients, and queue identity has a unique owner/entity key.

Rollback policy is forward repair: do not remove or roll back data tables. If a policy blocks a valid app operation, deploy a narrowly scoped policy correction transaction after preserving the deployed migration and count-only evidence.
