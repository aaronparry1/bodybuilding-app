/** Canonical, read-only identity/status shape for Progress projections. */
export type CanonicalProgressContext =
  | { status: "ready" | "in_progress" | "insufficient_evidence" | "insufficient_policy" | "blocked" | "disrupted" | "review_required"; planId: string; mesocycleId: string; microcycleNumber: number; snapshotId: string; decisionId?: string; decisionOutcome?: "delay" | "continue" | "deload" | "advance" | "review_required"; decisionLifecycle?: string; advanceTargetMesocycleId?: string }
  | { status: "no_current_snapshot" | "no_current_decision" | "compatibility" | "invalid"; reason: string };
