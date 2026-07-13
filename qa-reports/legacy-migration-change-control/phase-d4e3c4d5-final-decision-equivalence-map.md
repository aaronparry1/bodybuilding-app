# D4E3C4D5 — final rep/lane decision equivalence map

Status: **audit complete, migration not ready**.

The D4E3C4D4 boundary (`resolveCompatibilityFinalRepLaneDecision`) is the production observation point. It produces one immutable decision object containing the final rep range, lane, role/family metadata, ownership stage, reason codes and a deterministic fingerprint. `resolveGeneratedSettings` projects that object into generated settings before downstream set/load/drop-off/suitability work.

## Fixture inventory and evidence

| Category | Evidence | Result | Readiness |
|---|---|---|---|
| Primary compound | direct generated-settings regression | exact for ordinary branch | blocked pending complete coverage |
| Secondary compound | direct generated-settings regression | exact for ordinary branch | blocked pending complete coverage |
| Isolation/accessory | direct generated-settings regression | exact for ordinary branch | blocked pending complete coverage |
| Slot overrides | final boundary metadata | authority gap | blocked |
| Advanced methods | final boundary metadata | authority gap | blocked |
| Family collisions | final boundary metadata | authority gap | blocked |
| Explicit/inferred role collisions | final boundary metadata | authority gap | blocked |
| Corrective/recovery/power | final boundary metadata | authority gap | blocked |
| Planned-order lanes | final boundary metadata is `unknown` | authority gap | blocked |
| Public façades | partial argument sets | not migration-ready | compatibility-only |

The three ordinary branches are the only exact equivalence currently certified by independent production observations. Documentation or identical final numbers are not treated as proof of precedence equivalence.

## Authority and ownership

The final decision is owned by `helper_resolution` for the currently observed ordinary branches. Generated settings consume `decision.repRange` and the decision lane; no later rep/lane semantic reassignment was found in the projection path. `applyLaneSetConstraints` consumes the projected lane for set metadata and is outside this phase's rep/lane authority boundary.

The decision object is the production truth for the observed output. It is not a v2 resolver result and production does not import or execute the v2 resolver.

## Six unresolved model gaps

1. explicit override authority and collisions;
2. advanced method authority;
3. exercise-family collision precedence;
4. explicit versus inferred role precedence;
5. corrective, recovery and power family authority;
6. planned-order lane/final generated-settings authority and partial façade facts.

These remain `authority_still_unknown`/`public_facade_gap` rather than being inferred from the v2 registry. Internal caller migration is blocked until each production-active branch is directly observable or explicitly classified as a genuine model gap.

## Gate

Certification outcome: `authority_still_unknown`.

Next phase: close the unresolved production authority fixtures and façade gaps before any D4E3C4E caller migration. Set, load, drop-off, shutdown and suitability extraction remain deferred.
