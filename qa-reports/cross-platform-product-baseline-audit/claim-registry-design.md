# Claim-registry design

```ts
type EvidenceClaim = {
  claimId: string; claim: string; population: string; trainingStatus: string;
  goal: string; intervention: string; comparison: string; dose: string;
  duration: string; outcome: string; evidenceType: string; confidence: string;
  applicability: string; limitations: string[]; supportingCitations: string[];
  conflictingCitations: string[]; exactSourceLocations: string[];
  reviewDate: string; policyOwner: string; permittedDecisionConsumers: string[];
  ruleStrength: "hard" | "soft" | "explanation_only";
  implementationStatus: "draft" | "approved" | "implemented" | "retired";
  testCoverage: string[];
};
```

Governance: two-person scientific/product approval for material rules; DOI/source-location deduplication; conflict record mandatory; expiry/review cadence; rule version pinned into prescription rationale; withdrawn/updated claims do not rewrite historical decisions; implementation requires deterministic counterfactual and boundary tests.

## Source-supplement ingestion contract

Import the 26 candidates only as `draft`. Add source-level fields for `exactFilename`, file hash, edition/provenance confidence, stable logical PDF page, extraction mode (`native`, `ocr`, `mixed`), OCR verification status, rights status and source availability. Add a candidate disposition covering `method_definition`, `soft_heuristic`, `explanation_only`, `historical_only`, `insufficient` and `rejected`; only an independently approved claim can receive a rule strength.

The registry must link a manual claim to its modern crosswalk rather than merging them into one citation. Source 16 is an unresolved, unavailable source record with no claims and low current-mission priority. Rights status defaults to `research_reference_only`; evidence approval does not imply permission to reproduce source expression.

## Scope and gap linkage

Add `missionLane` (`hypertrophy`, `strength`, `powerbuilding`, `shared_context`, `future_product`, `out_of_scope`) and `gapIds`. A claim without a current mission lane and exact registered decision cannot become policy. `shared_context` includes safety, adherence and energy-deficit recovery only; it does not create a fourth coaching lane. Sport-specific claims default to `future_product` or `out_of_scope`. Implementation readiness is tracked separately from evidence coverage, as defined in `evidence-coverage-matrix.md`.
