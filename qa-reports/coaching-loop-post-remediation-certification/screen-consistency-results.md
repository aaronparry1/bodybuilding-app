# Home, Plan, and Train consistency

For every one-step scenario with a next session, the canonical read model, Home primary action, Plan next-actionable session, Train session, and Train presentation resolve the same session ID after restart.

At `strength_transition_boundary`, all five identities are null. This is internally consistent but not a successful coaching outcome: the final workout was consumed, the transition decision blocked, and no next session exists.

Historical prescription snapshots remained immutable in all 12 scenarios. Projections did not participate in policy or application.

## Finding SC-01

- Severity: P1
- Exact evidence: transition-boundary screen identities all null in `scenario-reproduction.json`
- Production path: blocked decision → unchanged carrier with no planned sessions → shared projections
- Affected configurations: completed default Mesocycle exposure
- Consequence: Home/Plan/Train consistently show no actionable coaching continuation
- Confidence: high
- Verdict: PROVEN consistency; CONTRADICTED continuity
- Remediation direction: resolve the transition/continuation policy before presentation; do not add a UI fallback
- Production code change required: yes, policy/application rather than UI
