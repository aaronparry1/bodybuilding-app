import { resolveCurrentPlanningInput } from "@/domain/training/current-planning-input";
import { mesocycleById } from "@/domain/training/mesocycle-library";
import type { ActiveTrainingPlan } from "@/domain/training/plan-setup";

export type AnalyticsPlanningContext =
  | { status: "no_plan" }
  | {
      status: "ready" | "compatibility";
      goal: ActiveTrainingPlan["goal"];
      macrocycle: string;
      mesocyclePurpose: string;
      microcycle: { number: number; priority: string };
      sessionRole: string;
    }
  | { status: "incomplete"; missing: Array<"mesocycle" | "microcycle" | "session_role"> };

/** A read-only Analytics context derived from current planning authority. */
export function buildAnalyticsPlanningContext({
  activePlan,
  sessionIndex = 0,
}: {
  activePlan: ActiveTrainingPlan | null | undefined;
  sessionIndex?: number;
}): AnalyticsPlanningContext {
  if (!activePlan) return { status: "no_plan" };

  const resolved = resolveCurrentPlanningInput(activePlan, sessionIndex);
  if (resolved.status === "incomplete") return { status: "incomplete", missing: resolved.missing };
  const mesocycle = mesocycleById(resolved.planning.mesocycleId);
  if (!mesocycle) return { status: "incomplete", missing: ["mesocycle"] };

  return {
    status: resolved.planning.source === "current" ? "ready" : "compatibility",
    goal: resolved.planning.goal,
    macrocycle: resolved.planning.macrocycle,
    mesocyclePurpose: mesocycle.adaptation,
    microcycle: {
      number: resolved.planning.microcycle.sequenceNumber,
      priority: resolved.planning.microcycle.priority,
    },
    sessionRole: resolved.planning.sessionRole,
  };
}
