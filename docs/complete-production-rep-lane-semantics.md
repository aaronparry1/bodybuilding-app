# Complete production rep and lane semantics

D4E3C4A records the production truth that prevented a premature rep/lane migration. Rep selection is precedence-driven: explicit slot overrides, power/small-muscle family branches, block×role branches, family/default values, advanced overrides, and final fallback all remain observable. Missing role values are inferred from movement, and `strength_hypertrophy` is normalized to `powerbuilding`.

Lane selection is also precedence-driven and produces eight distinct current identities: `strength`, `strength_support`, `hypertrophy_strength`, `hypertrophy`, `power`, `peak`, `maintenance`, and `recovery`. Peak and power branches use slot role and planned order in addition to block and exercise role. These identities cannot be mapped to the coarse D4E3C3 exercise-class lanes without semantic loss.

Generated settings couple lane, set prescription, and rep selection before starting load, drop-off, and suitability are applied. Public settings, extra-session, and cloud normalization callers do not have the complete aggregate facts. Therefore D4E3C4A makes no production changes and does not expand the registry speculatively.

The next implementation phase is D4E3C4B: extend the aggregate schema and registry to represent precedence traces, override identities, complete lane identities, planned-order branches, and generated-settings authority. Production caller migration remains gated until exact branch equivalence is proven.
