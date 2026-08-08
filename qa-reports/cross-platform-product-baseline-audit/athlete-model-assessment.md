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

## Mission-locked athlete model supplement

The model serves only hypertrophy, strength and powerbuilding. Stable facts/preferences should cover training age, goal lane and priority, available days/time/equipment, target-lift history where relevant, exercise preferences, limitations, units and load increments. Observations cover performed sets, comparable lift performance, adherence, substitutions, duration and explicit pain/stop events. Optional time-decaying context may include deficit status, sleep, soreness, motivation and stress only when a reviewed consumer justifies collection burden.

Sport, speed, agility, conditioning and endurance prescriptions are not consumers. Bodyweight is contextual evidence and must never become a complete muscle-growth or programme-effectiveness score. The 43-gap register makes minimum observations, confidence decay, contradiction handling, e1RM error and readiness validity explicit prerequisites; no “responder” label is presently justified.
