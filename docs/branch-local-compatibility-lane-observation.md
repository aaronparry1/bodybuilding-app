# Branch-local compatibility lane observation

D4E3C4D10C4 is not viable without changing the public `resolveTrainingLane` contract. The selector exposes no internal options or callback seam; a test-side observer would either infer the winner or execute precedence twice. No production lane code changed, and no observation was integrated into generated settings or the final decision.

Recommended next phase: introduce a private value-plus-source helper behind the unchanged primitive façade, one ordinary branch at a time, with the candidate capture workflow preserved.
