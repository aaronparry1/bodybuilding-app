# Native profiling identity plan

The committed iOS project is authoritative for EAS, so profile environment bundle identifiers were previously ignored. The minimum strategy is a third target configuration, `DebugProfiling`, plus the shared `AdaptiveStrengthCoachProfiling` scheme. The EAS profile explicitly selects both the scheme and `DebugProfiling` configuration. It reuses the existing target, Pods, entitlements, and sources; it changes only bundle identifier, product name, display name, and URL-scheme variables for profiling.

Production `Debug` and `Release` continue to resolve `com.aaronparry.adaptivestrengthcoach`, `AdaptiveStrengthCoach`, and `ironlogic`. Profiling resolves `com.aaronparry.adaptivestrengthcoach.profiling`, `AdaptiveStrengthCoachProfiling`, `Adaptive Strength QA`, and `ironlogic-profiling`. No production entitlements, associated domains, push settings, credentials, or submission profiles were changed.

Rollback is removal of the added configuration, scheme, variable substitutions, and the profiling EAS scheme field. CocoaPods remains shared; no Pods or build products are committed.

EAS credential inspection found an existing active credential set for the production bundle, but no confirmed development credential set for the profiling bundle. One enabled iPhone record exists on the Apple team; its authorization as the intended test phone was not established from the redacted listing.
