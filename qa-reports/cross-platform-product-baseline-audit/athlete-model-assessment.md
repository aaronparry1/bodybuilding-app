# Athlete-model assessment

Maturity: **2/5 — structured facts and evidence, not yet a first-class athlete model.** [inferred from repository]

The architecture can represent stable profile constraints, explicit preferences, observed ledger behavior and performance response, but these live across settings, carrier construction facts, customisation repositories, recorded events and derived projections. It lacks a single versioned contract with provenance, confidence, recency, contradictions, decay and user correction.

## Target contract

```ts
type AthleteFact<T> = {
  id: string;
  kind: "stated" | "observed" | "derived" | "inferred";
  value: T;
  observedAt: string;
  validFrom: string;
  expiresAt?: string;
  confidence: number;
  evidenceIds: string[];
  contradictions: string[];
  userCorrectable: boolean;
  privacy: "account" | "sensitive-health";
};
type AthleteModel = {
  schemaVersion: "athlete_model_v1";
  athleteId: string;
  stableProfile: AthleteFact<unknown>[];
  preferences: AthleteFact<unknown>[];
  behaviour: AthleteFact<unknown>[];
  responses: AthleteFact<unknown>[];
};
```

Rules: one anomaly cannot create a high-confidence inference; confidence needs minimum comparable observations; contradictory evidence lowers confidence; time-sensitive facts decay; user correction is appended, not history-rewritten; every material consumer records input IDs and rule version. Explanations must say “You told us…”, “We observed…”, “We infer…”, confidence/insufficiency, and the exact prescription delta.
