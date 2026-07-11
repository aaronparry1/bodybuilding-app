import type { ExactTargetWindowAggregate } from "@/domain/training/current-exact-target-evidence-aggregation";
export type PerformanceWindow = { id: string; planId: string; mesocycleId: string; microcycleNumber: number; evaluatedAt: string; evidence: ExactTargetWindowAggregate };
export type PerformanceWindowPolicy = { version: 1; id: string; minimumValidSets: number; minimumExercises: number; minimumSessions: number; positiveSets: number; negativeSets: number };
export type WindowDirection = "positive" | "maintained" | "mixed" | "negative" | "insufficient" | "invalid";
export type PerformanceWindowResult = { status: "ready"; windows: readonly { window: PerformanceWindow; direction: WindowDirection; trace: { validSets: number; reasons: readonly string[] } }[]; policy: PerformanceWindowPolicy } | { status: "insufficient_evidence" | "insufficient_policy" | "invalid_policy" | "invalid_series"; reason: string };
export function classifyPerformanceWindows(windows: readonly PerformanceWindow[], policy?: PerformanceWindowPolicy): PerformanceWindowResult {
  if (!policy) return { status: "insufficient_policy", reason: "missing_policy" };
  if (policy.version !== 1 || policy.minimumValidSets <= 0 || policy.minimumExercises < 0 || policy.minimumSessions < 0 || policy.positiveSets <= 0 || policy.negativeSets <= 0) return { status: "invalid_policy", reason: "invalid_policy_fields" };
  const sorted = [...windows].sort((a,b) => a.microcycleNumber - b.microcycleNumber || a.evaluatedAt.localeCompare(b.evaluatedAt) || a.id.localeCompare(b.id));
  if (!sorted.length) return { status: "insufficient_evidence", reason: "empty_series" };
  if (new Set(sorted.map((w) => `${w.planId}:${w.mesocycleId}`)).size !== 1 || new Set(sorted.map((w) => w.microcycleNumber)).size !== sorted.length) return { status: "invalid_series", reason: "conflicting_identity_or_chronology" };
  return { status: "ready", policy, windows: sorted.map((window) => ({ window, direction: direction(window, policy), trace: { validSets: validSets(window), reasons: reasons(window, policy) } })) };
}
function validSets(window: PerformanceWindow) { const c = window.evidence.counts; return c.exceeded + c.met + c.missed + c.stopped; }
function direction(window: PerformanceWindow, policy: PerformanceWindowPolicy): WindowDirection { if (window.evidence.status === "invalid") return "invalid"; const c = window.evidence.counts; const valid = validSets(window); if (valid < policy.minimumValidSets || window.evidence.breadth.exercises < policy.minimumExercises || window.evidence.breadth.sessions < policy.minimumSessions) return "insufficient"; if (c.exceeded + c.met >= policy.positiveSets && c.missed + c.stopped === 0) return "positive"; if (c.missed + c.stopped >= policy.negativeSets && window.evidence.breadth.exercises >= policy.minimumExercises) return "negative"; if (c.missed + c.stopped && c.exceeded + c.met) return "mixed"; return "maintained"; }
function reasons(window: PerformanceWindow, policy: PerformanceWindowPolicy) { const c = window.evidence.counts; return [`valid_sets:${validSets(window)}`, `positive:${c.exceeded + c.met}`, `negative:${c.missed + c.stopped}`, `policy:${policy.id}`]; }
