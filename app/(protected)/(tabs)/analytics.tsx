import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { usePremiumAccess, PremiumRequiredScreen } from "@/application/billing/premium-access";
import { canonicalActivePlanState } from "@/application/training/canonical-active-plan-state";
import { projectCanonicalProgress } from "@/application/training/canonical-progress-projection";
import { evaluateCanonicalProgress } from "@/domain/training/canonical-progress-evaluator";
import { canonicalProgressEvidenceRepository } from "@/data/local/canonical-progress-evidence-repository";
import { canonicalProgressDecisionRepository } from "@/data/local/canonical-progress-decision-repository";
import { AppScreen, PrimaryButton, SecondaryButton } from "@/ui/primitives";
import { colors, spacing, type } from "@/ui/theme";
import { mesocyclePurposeDisplayName, sessionRoleDisplayName, trainingGoalDisplayName } from "@/application/training/display-labels";

export default function ProgressScreen() {
  const premium = usePremiumAccess();
  if (!premium) return <PremiumRequiredScreen title="Unlock your progress dashboard" message="Start a 14-day free trial to unlock canonical Progress evidence and decisions." />;
  return <CanonicalProgressContent />;
}

function CanonicalProgressContent() {
  const [, refresh] = useState(0);
  useEffect(() => { canonicalActivePlanState.hydrate(); return canonicalActivePlanState.subscribe(() => refresh((value) => value + 1)); }, []);
  const state = canonicalActivePlanState.getState();
  const plan = state.model;
  const evidence = plan ? canonicalProgressEvidenceRepository.list(plan.planId, plan.microcycle.id) : [];
  const evaluation = plan ? evaluateCanonicalProgress({ plan, evidence }) : null;
  const decision = plan ? canonicalProgressDecisionRepository.current(plan.planId, plan.mesocycle.id)[0] ?? null : null;
  const progress = projectCanonicalProgress({ status: state.hydration === "empty" ? "empty" : state.hydration === "error" ? "error" : state.hydration === "hydrated" ? "ready" : "hydrating", plan, evidence, evaluation, decision });
  const applyDecision = () => {
    if (!plan || !decision || !evaluation) return;
    canonicalActivePlanState.applyProgressDecision({ planId: plan.planId, expectedPlanRevision: plan.revision, macrocycleId: plan.macrocycle.goal, mesocycleId: decision.mesocycleId, microcycleId: decision.microcycleId, decisionId: decision.decisionId, evaluationId: evaluation.evaluationId, expectedEvidenceIds: decision.evidenceIds });
  };
  if (progress.status === "hydrating") return <AppScreen><Text style={{ color: colors.text }}>Loading Progress…</Text></AppScreen>;
  if (progress.status === "empty") return <AppScreen><Text style={{ color: colors.text, ...type.section }}>Progress</Text><Text style={{ color: colors.textMuted }}>{progress.explanation}</Text><PrimaryButton label="Set up training" onPress={() => router.push("/(protected)/onboarding")} /></AppScreen>;
  if (!progress.evidenceCount && !progress.recentSessions.length) return <AppScreen><View style={{ gap: spacing.md }}><Text style={{ color: colors.text, ...type.hero }}>Progress</Text><Text style={{ color: colors.textMuted }}>Your progress will appear here after you complete your first workout.</Text><PrimaryButton label="View next workout" onPress={() => router.push("/(protected)/(tabs)/train")} /></View></AppScreen>;
  return <AppScreen><View style={{ gap: spacing.md }}><Text style={{ color: colors.text, ...type.hero }}>Progress</Text><Text style={{ color: colors.textMuted }}>Your training progress at a glance.</Text><View style={{ gap: spacing.xs }}><Text style={{ color: colors.text, ...type.section }}>{progress.status === "review_required" ? "Review recommended" : progress.status === "insufficient_evidence" ? "Keep training" : "On track"}</Text><Text style={{ color: colors.textMuted }}>{progress.explanation}</Text></View><View style={{ gap: spacing.xs }}><Text style={{ color: colors.text }}>Focus: {trainingGoalDisplayName(progress.macrocycle)}</Text><Text style={{ color: colors.text }}>Phase: {mesocyclePurposeDisplayName(progress.mesocycle)}</Text></View>{progress.decision ? <View style={{ gap: spacing.xs }}><Text style={{ color: colors.text }}>A coaching review is available</Text><Text style={{ color: colors.textMuted }}>{progress.decision.explanation}</Text><PrimaryButton label="Review recommendation" accessibilityLabel="Apply current decision" onPress={applyDecision} /></View> : null}{progress.recentSessions.slice(0, 5).map((session) => <SecondaryButton key={session.id} label={`${sessionRoleDisplayName(session.role)} · ${session.performedSets} sets`} onPress={() => router.push(`/(protected)/history/${session.id}`)} />)}</View></AppScreen>;
}
