import { router } from "expo-router";
import { useAppSettings } from "@/application/settings/app-settings";
import { canonicalActivePlanState } from "@/application/training/canonical-active-plan-state";
import type { CanonicalProgressPresentationAction } from "@/application/training/canonical-progress-presentation";
import { ProgressDashboard } from "@/ui/progress-dashboard";
import { useCanonicalProgressPresentation } from "@/ui/canonical-training-presentation-hooks";
import { AppScreen } from "@/ui/primitives";

export default function ProgressScreen() {
  // Free tier: progress and history are free. Seeing the numbers move is the
  // reason people keep training (and keep the app); the paywall sits on coaching.
  return <CanonicalProgressContent />;
}

function CanonicalProgressContent() {
  const { settings } = useAppSettings();
  const projection = useCanonicalProgressPresentation({ displayUnit: settings.unit });
  const onAction = (action: CanonicalProgressPresentationAction) => {
    if (action.type === "retry") { canonicalActivePlanState.refresh(); return; }
    if (action.type === "setup_plan") { router.push("/(protected)/onboarding"); return; }
    if (action.type === "open_history" && action.sessionId) { router.push(`/(protected)/history/${action.sessionId}`); return; }
    if (action.type === "open_planned_session" && action.sessionId && action.planId && action.planRevision !== undefined) {
      router.push({ pathname: "/(protected)/(tabs)/train", params: { planId: action.planId, planRevision: String(action.planRevision), plannedSessionId: action.sessionId, lifecycle: "start" } });
    }
  };
  return <AppScreen><ProgressDashboard projection={projection} onAction={onAction} /></AppScreen>;
}
