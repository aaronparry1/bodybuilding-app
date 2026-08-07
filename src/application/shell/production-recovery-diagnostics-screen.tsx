import { useState } from "react";
import { Text } from "react-native";
import { collectAndroidRecoveryEvidence, type AndroidRecoveryEvidence } from "@/application/diagnostics/android-recovery-evidence";
import { useAuth } from "@/application/auth/auth-context";
import { PremiumCard, PrimaryButton, Screen, ScreenHeader } from "@/ui/primitives";
import { colors } from "@/ui/theme";

export default function ProductionRecoveryDiagnosticsScreen() {
  const { user } = useAuth();
  const [evidence, setEvidence] = useState<AndroidRecoveryEvidence | null>(null);
  const [failure, setFailure] = useState(false);
  const collect = () => {
    try { setEvidence(collectAndroidRecoveryEvidence(user?.id ?? null)); setFailure(false); }
    catch { setEvidence(null); setFailure(true); }
  };
  return <Screen>
    <ScreenHeader eyebrow="Recovery" title="Data diagnostic summary" subtitle="This checks presence, counts and redacted status only. It does not change or upload your training data." />
    <PremiumCard>
      <Text style={{ color: colors.textMuted }}>Nothing is collected until you press the button. Account identifiers, tokens, workout contents, exercises, sets, reps and loads are never included.</Text>
      <PrimaryButton label={evidence ? "Refresh read-only summary" : "Create read-only summary"} onPress={collect} />
      {failure ? <Text accessibilityRole="alert" style={{ color: colors.danger }}>Persistent storage could not be read. Nothing was changed. Close the app and contact support before creating a new programme.</Text> : null}
      {evidence ? <Text selectable testID="android-recovery-evidence" style={{ color: colors.text, fontFamily: "monospace" }}>{JSON.stringify(evidence, null, 2)}</Text> : null}
    </PremiumCard>
  </Screen>;
}
