import { canonicalSupersetApplicationRepository } from "@/data/local/canonical-superset-application-repository";
import type { CanonicalSupersetApplicationRecord } from "@/domain/training/canonical-superset-application";

export type CanonicalSupersetAdaptationSurface = "completion" | "today" | "preview" | "progress";
export type CanonicalSupersetAdaptationPresentation = Readonly<{
  meaningIdentity: string;
  surface: CanonicalSupersetAdaptationSurface;
  state: "applied" | "held" | "rejected";
  pairIdentity: string;
  explanation: string;
  targetSessionId: string | null;
  changes: CanonicalSupersetApplicationRecord["proposal"]["mutations"];
  moreEvidenceNeeded: boolean;
  qaOnly: boolean;
}>;

/** All surfaces consume one persisted application fact. Applied copy is taken
 * verbatim from the immutable receipt and is never regenerated in UI code. */
export function projectCanonicalSupersetAdaptation(input: Readonly<{
  planId: string;
  surface: CanonicalSupersetAdaptationSurface;
  includeQaOnly?: boolean;
}>): CanonicalSupersetAdaptationPresentation | null {
  const record = canonicalSupersetApplicationRepository.list(input.planId)
    .filter((item) => input.includeQaOnly || item.receipt?.appliedAuthority === "production" || item.proposal.applicationAuthority === "production")
    .sort((left, right) => eventTime(right).localeCompare(eventTime(left)))[0];
  if (!record || record.status === "prepared") return null;
  const qaOnly = record.receipt?.appliedAuthority === "shadow_certification" || record.proposal.applicationAuthority === "shadow_only";
  if (qaOnly && !input.includeQaOnly) return null;
  return {
    meaningIdentity: record.receipt?.explanationId ?? `superset-state:${record.decisionId}`,
    surface: input.surface,
    state: record.status,
    pairIdentity: record.proposal.pairIdentity,
    explanation: record.receipt?.explanation ?? heldExplanation(record),
    targetSessionId: record.receipt?.targetSessionId ?? record.proposal.targetSessionId,
    changes: record.receipt?.exactMutations ?? record.proposal.mutations,
    moreEvidenceNeeded: record.status === "held" && record.proposal.applicationEligibility !== "eligible",
    qaOnly,
  };
}

function eventTime(record: CanonicalSupersetApplicationRecord): string {
  return record.receipt?.appliedAt ?? record.preparedAt;
}

function heldExplanation(record: CanonicalSupersetApplicationRecord): string {
  if (record.terminalReason === "shadow_authority_no_plan_write") return "QA only: the coach found a possible superset adjustment, but shadow mode made no plan change.";
  if (record.status === "rejected") return "No superset change was made because the future prescription could not be targeted safely.";
  return "The pairing stays unchanged while the coach gathers more comparable evidence.";
}
