import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { ScrollView } from "react-native";
import { canonicalActivePlanState, type CanonicalActivePlanState } from "@/application/training/canonical-active-plan-state";
import { projectCanonicalHome, readCanonicalHomeProjection, type CanonicalHomeAction, type CanonicalHomeProjection } from "@/application/training/canonical-home-projection";
import { useAppSettings } from "@/application/settings/app-settings";
import { getAppEnvironment, isDesignQaModeAvailable } from "@/application/runtime/app-environment";
import { HomeDashboard } from "@/ui/home-dashboard";
import { AppScreen } from "@/ui/primitives";

function readHome(state: CanonicalActivePlanState, displayUnit: "kg" | "lb", qaPreview?: string): CanonicalHomeProjection {
  if (isDesignQaModeAvailable(getAppEnvironment()) && qaPreview === "storage_error") return projectCanonicalHome({ status: "error", model: null });
  if (isDesignQaModeAvailable(getAppEnvironment()) && qaPreview === "rest_day" && state.model) return projectCanonicalHome({ status: "ready", model: { ...state.model, plannedSessions: [], nextSession: null }, now: 0 });
  if (state.hydration === "empty") return projectCanonicalHome({ status: "empty", model: null });
  if (state.hydration === "error") return projectCanonicalHome({ status: "error", model: null });
  if (!state.model) return projectCanonicalHome({ status: "hydrating", model: null });
  return readCanonicalHomeProjection({ state, displayUnit });
}

export default function HomeScreen() {
  const { settings } = useAppSettings();
  const { qaHomePreview } = useLocalSearchParams<{ qaHomePreview?: string }>();
  const scrollRef = useRef<ScrollView>(null);
  const [state, setState] = useState<CanonicalActivePlanState>(canonicalActivePlanState.getState());
  useEffect(() => {
    setState(canonicalActivePlanState.hydrate());
    return canonicalActivePlanState.subscribe(() => setState(canonicalActivePlanState.getState()));
  }, []);
  useFocusEffect(useCallback(() => {
    requestAnimationFrame(() => scrollRef.current?.scrollTo({ y: 0, animated: false }));
  }, []));
  const home = readHome(state, settings.unit, qaHomePreview);

  const onAction = (action: CanonicalHomeAction) => {
    if (action.type === "retry_storage") { canonicalActivePlanState.refresh(); return; }
    if (action.type === "setup_plan") { router.push("/(protected)/onboarding"); return; }
    if (action.type === "open_progress") { router.push("/(protected)/(tabs)/analytics"); return; }
    if (action.type === "open_planned_session") {
      router.push({ pathname: "/(protected)/(tabs)/train", params: { planId: action.planId, planRevision: String(action.planRevision), plannedSessionId: action.sessionId, lifecycle: "start" } });
      return;
    }
    if (action.type === "resume_recorded_session") {
      router.push({ pathname: "/(protected)/(tabs)/train", params: { planId: action.planId, planRevision: String(action.planRevision), recordedSessionId: action.sessionId, lifecycle: "resume" } });
    }
  };

  return <AppScreen scrollRef={scrollRef}><HomeDashboard projection={home} onAction={onAction} /></AppScreen>;
}
