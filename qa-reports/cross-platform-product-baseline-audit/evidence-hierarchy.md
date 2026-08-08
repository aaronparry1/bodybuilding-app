# Evidence hierarchy and policy conversion

Priority: systematic reviews/meta-analyses; consensus/position stands; controlled trials; longitudinal observations; foundational texts; expert systems; anecdote/history. Recency does not automatically outrank quality, and commercial manuals never become scientific authority by repetition.

```mermaid
flowchart LR
  Evidence["Retrieved evidence"] --> Claim["Reviewed claim"]
  Claim --> Policy["Approved coaching policy"]
  Policy --> Rule["Versioned deterministic rule"]
  Rule --> Decision["Athlete-specific decision"]
  Decision --> Explain["User explanation + evidence IDs"]
```

Hard rules are reserved for safety, identity, data integrity or very high-confidence invariants. Soft heuristics require bounds and fallbacks. Explanation-only evidence may educate but cannot mutate prescriptions. Literature never directly generates workouts; AI may retrieve/summarize/explain/gap-detect but cannot override protected deterministic authorities.
