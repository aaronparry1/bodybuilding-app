# Third-party data flow

Auth and user-scoped training data can traverse Supabase. Native billing can send an app user identity to RevenueCat when configured. Web uses mock billing. No analytics/crash provider was found in the inspected imports. Calls are not shown to be globally deduplicated beyond provider refs/caches. Third-party failures generally fall back or surface errors, but launch timing requires runtime measurement.
