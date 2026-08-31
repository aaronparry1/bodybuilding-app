import Constants from "expo-constants";
import { Redirect, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Text } from "react-native";
import { useSubscription } from "@/application/billing/subscription-context";
import { isDesignQaModeAvailable, isDesignQaModeRequested } from "@/application/design-qa/design-qa-runtime";
import { getAppEnvironment } from "@/application/runtime/app-environment";
import { getCanonicalSupersetLifecycleState, reconcileCanonicalSupersetLifecycleFixture, resetCanonicalSupersetLifecycleFixture, seedCanonicalSupersetDisabledExposure, seedCanonicalSupersetOfflineCompletion } from "@/application/design-qa/canonical-superset-lifecycle-fixture";
import { resolveCanonicalSupersetAuthority, setCanonicalSupersetProfilingAuthority } from "@/application/training/canonical-superset-authority";
import { AppScreen, PremiumCard, SecondaryButton } from "@/ui/primitives";
import { colors, type } from "@/ui/theme";

export default function SupersetLifecycleQaScreen() {
  const environment = getAppEnvironment();
  const { qaPremiumFixtureActive } = useSubscription();
  if (!isDesignQaModeAvailable(environment) || !isDesignQaModeRequested() || !qaPremiumFixtureActive) return <Redirect href="/(protected)/(tabs)" />;
  return <Content />;
}

function Content() {
  const { action } = useLocalSearchParams<{ action?: string }>();
  const handledAction = useRef<string | null>(null);
  const [state, setState] = useState(() => getCanonicalSupersetLifecycleState());
  const [error, setError] = useState<string | null>(null);
  const extra = Constants.expoConfig?.extra as { qaBuildIdentity?: string } | undefined;
  const run = (action: () => ReturnType<typeof getCanonicalSupersetLifecycleState>) => { try { setError(null); setState(action()); } catch (next) { setError(next instanceof Error ? next.message : "QA lifecycle action failed"); } };
  const setAuthority = (mode: "shadow_only" | "certification_authority" | "disabled") => run(() => { const result = setCanonicalSupersetProfilingAuthority(mode); if (result.status !== "saved") throw new Error(result.reason); return { ...getCanonicalSupersetLifecycleState(), authority: resolveCanonicalSupersetAuthority() }; });
  useEffect(() => {
    if (!action || handledAction.current === action) return;
    handledAction.current = action;
    const actions: Record<string, () => void> = {
      reset: () => run(resetCanonicalSupersetLifecycleFixture),
      certification: () => setAuthority("certification_authority"),
      seed_offline: () => run(seedCanonicalSupersetOfflineCompletion),
      reconcile: () => run(reconcileCanonicalSupersetLifecycleFixture),
      disable: () => setAuthority("disabled"),
      disabled_exposure: () => run(seedCanonicalSupersetDisabledExposure),
      reenable: () => setAuthority("certification_authority"),
      replay: () => run(reconcileCanonicalSupersetLifecycleFixture),
    };
    const selected = actions[action];
    if (!selected) { setError(`Unknown QA lifecycle action: ${action}`); return; }
    selected();
  }, [action]);
  return <AppScreen>
    <Text accessibilityRole="header" style={{ ...type.title, color: colors.text }}>Superset lifecycle QA</Text>
    <PremiumCard tone="locked">
      <Text selectable style={{ ...type.body, color: colors.text }}>Native {extra?.qaBuildIdentity ?? "unknown"} · JS {process.env.EXPO_PUBLIC_QA_BUNDLE_ID ?? "unknown"}</Text>
      <Text selectable style={{ ...type.body, color: colors.text }}>Fixture {state.fixture}</Text>
      <Text selectable style={{ ...type.body, color: colors.text }}>Authority {state.authority.mode} · {state.connection}</Text>
      <Text selectable style={{ ...type.body, color: colors.text }}>Phase {state.phase} · revision {state.baselineRevision}</Text>
      <Text selectable style={{ ...type.body, color: colors.text }}>Evaluations {state.evaluationCount} · mutations {state.mutationCount} · receipts {state.receiptCount} · Progress {state.progressCount}</Text>
      <Text selectable style={{ ...type.body, color: colors.textMuted }}>Fingerprint {state.evidenceFingerprint || "not seeded"}</Text>
      <Text selectable style={{ ...type.body, color: colors.success }}>Premium QA · billing disabled · production data unavailable</Text>
      {error ? <Text selectable style={{ ...type.body, color: colors.danger }}>{error}</Text> : null}
    </PremiumCard>
    <PremiumCard tone="quiet">
      <SecondaryButton label="Reset isolated lifecycle fixture" onPress={() => run(resetCanonicalSupersetLifecycleFixture)} testID="superset-lifecycle-reset" />
      <SecondaryButton label="Use certification authority" onPress={() => setAuthority("certification_authority")} testID="superset-lifecycle-certification" />
      <SecondaryButton label="Seed pending offline completion" onPress={() => run(seedCanonicalSupersetOfflineCompletion)} testID="superset-lifecycle-seed-offline" />
      <SecondaryButton label="Reconnect and reconcile" onPress={() => run(reconcileCanonicalSupersetLifecycleFixture)} testID="superset-lifecycle-reconcile" />
      <SecondaryButton label="Disable method authority" onPress={() => setAuthority("disabled")} testID="superset-lifecycle-disable" />
      <SecondaryButton label="Process eligible exposure while disabled" onPress={() => run(seedCanonicalSupersetDisabledExposure)} testID="superset-lifecycle-disabled-exposure" />
      <SecondaryButton label="Re-enable certification authority" onPress={() => setAuthority("certification_authority")} testID="superset-lifecycle-reenable" />
      <SecondaryButton label="Reconcile again" onPress={() => run(reconcileCanonicalSupersetLifecycleFixture)} testID="superset-lifecycle-replay" />
    </PremiumCard>
  </AppScreen>;
}
