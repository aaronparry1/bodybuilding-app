import { useCallback, useEffect, useState } from "react";
import { canonicalActivePlanState } from "@/application/training/canonical-active-plan-state";
import { canonicalTrainCommands, projectCanonicalTrainSession, type CanonicalTrainProjectionResult } from "@/application/training/canonical-train-session-boundary";

export type CanonicalTrainRouteInput = Readonly<{ planId: string; planRevision: number; plannedSessionId?: string; recordedSessionId?: string }>;

export function useCanonicalTrainSession(route: CanonicalTrainRouteInput) {
  const [, refresh] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [recordedSessionId, setRecordedSessionId] = useState(route.recordedSessionId);
  const [projection, setProjection] = useState<CanonicalTrainProjectionResult>({ status: "rejected", reason: "recorded_session_not_found" });
  const reload = useCallback(() => {
    if (recordedSessionId) setProjection(projectCanonicalTrainSession(route.planId, recordedSessionId));
    refresh((value) => value + 1);
  }, [recordedSessionId, route.planId]);
  useEffect(() => { canonicalActivePlanState.hydrate(); return canonicalActivePlanState.subscribe(() => refresh((value) => value + 1)); }, []);
  useEffect(() => { setRecordedSessionId(route.recordedSessionId); }, [route.recordedSessionId]);
  useEffect(() => { if (recordedSessionId) setProjection(projectCanonicalTrainSession(route.planId, recordedSessionId)); }, [recordedSessionId, route.planId]);
  const command = useCallback((operation: () => Readonly<{ reason?: string; recordedSessionId?: string }>) => { const result = operation(); if (result.recordedSessionId) setRecordedSessionId(result.recordedSessionId); setMessage(result.reason ?? "canonical_command_applied"); reload(); return result; }, [reload]);
  return { projection, recordedSessionId, message, setMessage, command, reload, commands: canonicalTrainCommands };
}
