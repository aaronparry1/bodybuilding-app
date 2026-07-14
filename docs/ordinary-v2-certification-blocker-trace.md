# D4E3C4E1E ordinary certification blocker trace

The unchanged E2A certifier loads only the summary E1 shadow artifact. Its `certifyFirstCandidate` function checks the summary status and then unconditionally returns `no_eligible_branch_family / incomplete_shadow_coverage`; it never loads E1A, E1B, E1C, or E1D fixture evidence, performs fixture correlation, groups ordinary fixtures, evaluates translations, or checks rollback evidence.

Therefore the ordinary family is not rejected by a substantive authority or semantic predicate. The E1D proof exists but is disconnected from certification input. Classification: **B — certification evidence exists but is not connected to E2A**.

The smallest corrective task is to make the existing certifier consume the stable E1D fixture records and expose its existing predicates. That task is intentionally not performed here.
