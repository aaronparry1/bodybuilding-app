# Final compatibility rep/lane decision equivalence

D4E3C4D5 audits the internal final decision boundary introduced in D4E3C4D4. The boundary is `resolveCompatibilityFinalRepLaneDecision`; it is read-only and remains production-local. Generated settings receive the decision's rep range and lane, while downstream set/load/drop-off/shutdown/suitability behaviour is unchanged.

Three ordinary production branches — primary compound, secondary compound and isolation/accessory — have exact observable equivalence. Six production authority/model gaps remain: override precedence, advanced methods, family collisions, special-family authority, planned-order/final lane authority, and partial public façades. These are not certified by matching final numbers or by the v2 registry.

Accordingly the certification result is `authority_still_unknown` and caller migration remains blocked. Production does not consume the v2 resolver, and no fallback or precedence change is introduced. The next phase must add independent fixtures or explicitly classify each remaining production-active gap before D4E3C4E.

The final decision carries a deterministic fingerprint and `helper_resolution` ownership for the observed ordinary branches. Source-level projection checks confirm no rep/lane semantic reassignment after the decision is projected into generated settings. Set, load, drop-off, shutdown and suitability authority remain outside this phase.
