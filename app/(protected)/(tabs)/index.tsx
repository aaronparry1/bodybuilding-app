import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { ScrollView } from "react-native";
import { canonicalActivePlanState, type CanonicalActivePlanState } from "@/application/training/canonical-active-plan-state";
import { projectCanonicalHome, readCanonicalHomeProjection, type CanonicalHomeAction, type CanonicalHomeProjection } from "@/application/training/canonical-home-projection";
import { useAppSettings } from "@/application/settings/app-settings";
import { HomeDashboard } from "@/ui/home-dashboard";
import { AppScreen } from "@/ui/primitives";
import { useSubscription } from "@/application/billing/subscription-context";
import { useAuth } from "@/application/auth/auth-context";
import { elapsedSince, recordStartupTelemetry } from "@/application/startup/startup-observability";

function readHome(state: CanonicalActivePlanState, displayUnit: "kg" | "lb"): CanonicalHomeProjection {
  if (state.hydration === "empty") return projectCanonicalHome({ status: "empty", model: null });
  if (state.hydration === "error") return projectCanonicalHome({ status: "error", model: null });
  if (!state.model) return projectCanonicalHome({ status: "hydrating", model: null });
  return readCanonicalHomeProjection({ state, displayUnit });
}

export default function HomeScreen() {
  const { settings } = useAppSettings();
  const { dataHydrationStatus, retryDataHydration } = useSubscription();
  const { isOfflineMode } = useAuth();
  const scrollRef = useRef<ScrollView>(null);
  const [state, setState] = useState<CanonicalActivePlanState>(canonicalActivePlanState.getState());
  useEffect(() => {
    const startedAt = Date.now();
    setState(canonicalActivePlanState.hydrate());
    recordStartupTelemetry({ stage: "local_today", outcome: "local_ready", durationMs: elapsedSince(startedAt) });
    return canonicalActivePlanState.subscribe(() => setState(canonicalActivePlanState.getState()));
  }, []);
  useFocusEffect(useCallback(() => {
    requestAnimationFrame(() => scrollRef.current?.scrollTo({ y: 0, animated: false }));
  }, []));
  const home = readHome(state, settings.unit);

  const onAction = (action: CanonicalHomeAction) => {
    if (action.type === "retry_storage") { canonicalActivePlanState.refresh(); return; }
    if (action.type === "setup_plan") { router.push("/(protected)/onboarding"); return; }
    if (action.type === "open_progress") { router.push("/(protected)/(tabs)/analytics"); return; }
    if (action.type === "open_session_prep") {
      router.push({ pathname: "/(protected)/session-prep", params: { workoutName: action.workoutName, workoutType: action.workoutType, firstExerciseName: action.firstExerciseName } });
      return;
    }
    if (action.type === "open_planned_session") {
      router.push({ pathname: "/(protected)/(tabs)/train", params: { planId: action.planId, planRevision: String(action.planRevision), plannedSessionId: action.sessionId, lifecycle: "start" } });
      return;
    }
    if (action.type === "resume_recorded_session") {
      router.push({ pathname: "/(protected)/(tabs)/train", params: { planId: action.planId, planRevision: String(action.planRevision), recordedSessionId: action.sessionId, lifecycle: "resume" } });
    }
  };

  return <AppScreen scrollRef={scrollRef}><HomeDashboard projection={home} onAction={onAction} startup={{ status: isOfflineMode ? "offline" : dataHydrationStatus, onRetry: retryDataHydration }} /></AppScreen>;
}
