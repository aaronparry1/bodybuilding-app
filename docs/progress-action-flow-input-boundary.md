# Progress action-flow input boundary

`buildActionFlow` now consumes `LegacyProgressActionFlowInput`, built once at the legacy compatibility boundary. It receives separate history, recovery, rotation, volume, strategic-transition, and ordering values rather than a presenter or plan object.

The preserved precedence is: insufficient history, accepted legacy deload, recovery priority, rotation, personalised-volume change, legacy block-transition fallback, then no action. Candidate selection remains in `buildActionFlow`; the compatibility adapter only carries existing values.

This is structural only. Historical fatigue can still create the legacy recovery action, and no current recovery, strategic, rotation, or volume context is wired yet. The next phase replaces only the recovery candidate with `CurrentProgressRecoveryContext`; rotation and volume replacements follow. The legacy presenter remains until every Progress compatibility candidate has a current replacement.
