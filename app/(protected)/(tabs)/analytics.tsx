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
  if (progress.status === "hydrating") return <AppScreen><Text style={{ color: colors.text }}>Loading Progress…</Text></AppScreen>;
  if (progress.status === "empty") return <AppScreen><Text style={{ color: colors.text, ...type.section }}>Progress</Text><Text style={{ color: colors.textMuted }}>{progress.explanation}</Text><PrimaryButton label="Set up training" onPress={() => router.push("/(protected)/onboarding")} /></AppScreen>;
  return <AppScreen><View style={{ gap: spacing.md }}><Text style={{ color: colors.text, ...type.hero }}>Progress</Text><Text style={{ color: colors.textMuted }}>How your canonical training is progressing.</Text><View style={{ gap: spacing.xs }}><Text style={{ color: colors.text, ...type.section }}>{progress.status.replaceAll("_", " ")}</Text><Text style={{ color: colors.textMuted }}>{progress.explanation}</Text><Text style={{ color: colors.textMuted }}>Evidence recorded: {progress.evidenceCount}</Text></View><View style={{ gap: spacing.xs }}><Text style={{ color: colors.text }}>Macrocycle: {progress.macrocycle}</Text><Text style={{ color: colors.text }}>Mesocycle: {progress.mesocycle}</Text><Text style={{ color: colors.text }}>Microcycle: {progress.microcycle}</Text></View>{progress.decision ? <View style={{ gap: spacing.xs }}><Text style={{ color: colors.text }}>Current decision: {progress.decision.outcome}</Text><Text style={{ color: colors.textMuted }}>{progress.decision.explanation}</Text></View> : null}<PrimaryButton label="Refresh Progress" onPress={() => canonicalActivePlanState.refresh()} />{progress.recentSessions.slice(0, 5).map((session) => <SecondaryButton key={session.id} label={`${session.role} · ${session.status}`} onPress={() => router.push(`/(protected)/history/${session.id}`)} />)}</View></AppScreen>;
}
