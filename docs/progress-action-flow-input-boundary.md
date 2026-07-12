# Progress action-flow input boundary

`buildActionFlow` now consumes `LegacyProgressActionFlowInput`, built once at the legacy compatibility boundary. It receives separate history, recovery, rotation, volume, strategic-transition, and ordering values rather than a presenter or plan object.

The preserved precedence is: insufficient history, accepted legacy deload, recovery priority, rotation, personalised-volume change, legacy block-transition fallback, then no action. Candidate selection remains in `buildActionFlow`; the compatibility adapter only carries existing values.

The structural boundary is now consumed by the current recovery category. Historical fatigue cannot create a recovery action; only persisted/current deload state can. Strategic, rotation, and volume candidates remain legacy compatibility inputs. The legacy presenter remains until every remaining compatibility category has a current replacement.
