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
