import { router } from "expo-router";
import { useState } from "react";
import { canonicalActivePlanState } from "@/application/training/canonical-active-plan-state";
import type { CanonicalPlanPresentationAction } from "@/application/training/canonical-plan-presentation";
import { useAppSettings } from "@/application/settings/app-settings";
import { PlanDashboard } from "@/ui/plan-dashboard";
import { useCanonicalPlanPresentation } from "@/ui/canonical-training-presentation-hooks";
import { AppScreen } from "@/ui/primitives";
import { TrainingSystemGuideButton } from "@/ui/training-system-guide";

export default function PlanScreen() {
  const { settings } = useAppSettings();
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const projection = useCanonicalPlanPresentation({ displayUnit: settings.unit });
  const onAction = (action: CanonicalPlanPresentationAction) => {
    if (action.type === "retry") { canonicalActivePlanState.refresh(); return; }
    if (action.type === "setup_plan") { router.push("/(protected)/onboarding"); return; }
    if (!action.planId || action.planRevision === undefined || !action.sessionId) return;
    if (action.type === "open_planned_session") {
      router.push({ pathname: "/(protected)/(tabs)/train", params: { planId: action.planId, planRevision: String(action.planRevision), plannedSessionId: action.sessionId, lifecycle: "start" } });
      return;
    }
    router.push({ pathname: "/(protected)/(tabs)/train", params: { planId: action.planId, planRevision: String(action.planRevision), recordedSessionId: action.sessionId, lifecycle: "resume" } });
  };

  return <AppScreen><PlanDashboard projection={projection} selectedSessionId={selectedSessionId} onSelectSession={setSelectedSessionId} onAction={onAction} guideAction={<TrainingSystemGuideButton />} /></AppScreen>;
}
