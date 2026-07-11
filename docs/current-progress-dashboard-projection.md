# Current Progress dashboard projection

The dashboard contract now exposes `currentProgressContext`, obtained solely through the read-only current Progress context resolver. The projection preserves explicit current, no-current, compatibility, and invalid states without converting them into recommendations or actions.

It has no block, block-week, successor ranking, rep-range authority, formula output, producer, writer, evaluator, or application responsibility. Historical workout cards and stored exact-target outcomes are unchanged.

The strategic, recovery, rotation, and volume adapters still receive their existing legacy-shaped planning inputs. They are deliberately outside this seam: Stage 2C2A1, A2, A3, and C3 must migrate those adapters independently before dashboard migration can be certified.
