# Progress presentation equivalence inventory

## Call graph and branch order

| Helper | Caller | Inputs read | Output / precedence |
| --- | --- | --- | --- |
| `buildActionFlow` | Dashboard | strategic history/recommendation, recovery boolean, rotation, volume, fatigue | insufficient history → accepted legacy deload → recovery → rotation → volume → strategic fallback. |
| `buildPrimaryEvidence` | Dashboard | strategic recommendation/reasons, historical sessions, rotation, volume, fatigue | insufficient history → recovery → volume → rotation → strategic default. |
| `buildJourneyActions` | Dashboard | strategic history/recommendation, recovery boolean, rotation boolean | insufficient history → recovery → rotation → strategic fallback. |
| `verdictTitle` | Dashboard | strategic history/recommendation/momentum | insufficient history → recovery recommendation → advance → momentum → default. |
| `verdictMessage` | Dashboard | strategic history/recommendation | insufficient history → recovery recommendation → reasons → message/default. |
| `actionTitle` / `actionMessage` | Dashboard | strategic history/recommendation, exercise action, recovery boolean | insufficient history → recovery → strategic recommendation/message → exercise/default. |

## Field classification

| Field | Category | Affected helpers |
| --- | --- | --- |
| `strategic.hasEnoughHistory`, `emptyMessage` | Historical/generic gating | All helpers |
| `strategic.recommendation.title/message/reasons/deloadProfile` | Mixed strategic/recovery/volume/general | All helpers; must be decomposed field-by-field. |
| `hasRecoveryPriority`, fatigue classifier | Recovery presentation | Action flow, journey, action title/message, evidence. |
| `rotationAction` | Rotation | Action flow, evidence, journey. |
| volume recommendation/result | Volume | Action flow, evidence. |
| completed workout summaries/source | Historical | Evidence and copy support. |

## Scenario matrix to freeze

| Scenario | Required equivalence outputs |
| --- | --- |
| insufficient history | verdict/action/evidence/journey defaults |
| strategic continue / advance / repeat / deload | verdict, action title/message, fallback journey |
| recovery + rotation | recovery ordering over rotation |
| recovery + volume | recovery ordering over volume |
| rotation + volume | existing ordering |
| accepted recovery | accepted branch and journey copy |
| rotation only / volume increase-reduce-maintain | action flow and evidence |

## Natural extraction families and order

1. Characterize and extract leaf copy inputs (`verdict*`, `action*`) with exact output fixtures.
2. Extract primary evidence input.
3. Extract journey input.
4. Extract action-flow ordering last.
5. Replace recovery input with `CurrentProgressRecoveryContext`; then rotation, then volume; remove presenter only after every Progress helper is free of raw legacy input.

## Target boundary

`ProgressPresentationInputs` must eventually separate `strategic`, `recovery`, `rotation`, `volume`, `historical`, and ordering inputs. No generic recommendation object, block identity, or fake current strategic type is permitted.

Structural-only phases preserve current output exactly. Approved later semantic correction: historical fatigue warning must no longer create current recovery action. Unresolved product semantics: any goal-specific strategic analysis beyond persisted decision/current evidence/history.
