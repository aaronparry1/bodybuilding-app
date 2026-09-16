import { useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { useAuth } from "@/application/auth/auth-context";
import { getAppEnvironment } from "@/application/runtime/app-environment";
import { customerSafeServiceMessage } from "@/application/runtime/customer-facing-errors";
import { AppInput, AppScreen, ErrorState, HeroPanel, PrimaryButton, SecondaryButton } from "@/ui/primitives";
import { colors, radius, spacing } from "@/ui/theme";

export default function AuthScreen() {
  const { signIn, signUp, continueOffline, error, notice, isLoading, isConfigured } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const canSubmit = email.includes("@") && password.length >= 6 && isConfigured && !isLoading;
  const appEnvironment = getAppEnvironment();
  const safeError = customerSafeServiceMessage(error, appEnvironment);
  const accountUnavailableMessage = "We couldn’t connect to online services right now. Offline mode still works.";

  const submit = () => {
    if (!canSubmit) return;
    if (mode === "login") {
      signIn(email.trim(), password);
    } else {
      signUp(email.trim(), password);
    }
  };

  return (
    <AppScreen bottom={56}>
      <HeroPanel
        eyebrow="Adaptive Strength Coach"
        title="Objective hypertrophy."
        subtitle="Log reps. Stop junk volume. Earn load increases without RPE theatre."
      />

      {safeError ? <ErrorState message={safeError} /> : null}
      {notice ? (
        <Text selectable style={{ color: colors.text, fontSize: 14, lineHeight: 20, padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.surfaceMuted }}>
          {notice}
        </Text>
      ) : null}
      {!isConfigured ? <ErrorState message={accountUnavailableMessage} /> : null}

      <View style={{ gap: spacing.lg }}>
        <View style={{ flexDirection: "row", gap: spacing.sm, padding: 3, borderRadius: radius.md, backgroundColor: colors.surfaceMuted }}>
          <ModeButton label="Create" active={mode === "signup"} onPress={() => setMode("signup")} />
          <ModeButton label="Login" active={mode === "login"} onPress={() => setMode("login")} />
        </View>

        <AppInput label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" placeholder="you@adaptivestrengthcoach.com" />
        <AppInput label="Password" value={password} onChangeText={setPassword} secureTextEntry placeholder="Minimum 6 characters" />
        <PrimaryButton label={mode === "login" ? "Login" : "Create account"} onPress={submit} disabled={!canSubmit} />
        {isLoading ? <ActivityIndicator color={colors.accent} /> : null}
      </View>

      <View style={{ gap: spacing.sm }}>
        <SecondaryButton label="Continue offline" onPress={continueOffline} disabled={isLoading} />
        {/* Apple / Google sign-in are not wired up yet; the buttons were shown but threw. Hidden until implemented. */}
      </View>

      <Text selectable style={{ color: colors.textSubtle, fontSize: 12, lineHeight: 18, textAlign: "center" }}>
        Offline logs stay on device and can sync after sign-in.
      </Text>
    </AppScreen>
  );
}

function ModeButton({ label, active, onPress }: { label: string; active: boolean; onPress(): void }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        flex: 1,
        minHeight: 40,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: radius.sm,
        borderCurve: "continuous",
        backgroundColor: active ? colors.surfaceSoft : "transparent",
      }}
    >
      <Text style={{ color: active ? colors.text : colors.textSubtle, fontWeight: "900" }}>{label}</Text>
    </Pressable>
  );
}
