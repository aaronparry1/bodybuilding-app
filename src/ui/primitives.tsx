import { useState, type ReactNode, type RefObject } from "react";
import type { PressableProps } from "react-native";
import { ActivityIndicator, InputAccessoryView, Keyboard, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getTabScreenBottomPadding } from "@/ui/layout";
import { colors, radius, shadow, shellTokens, spacing, type } from "@/ui/theme";

export function Screen({
  children,
  padded = true,
  bottom = 128,
}: {
  children: ReactNode;
  padded?: boolean;
  bottom?: number;
}) {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      keyboardDismissMode="on-drag"
      keyboardShouldPersistTaps="handled"
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{
        paddingHorizontal: padded ? spacing.xl : 0,
        paddingTop: spacing.xl,
        paddingBottom: bottom + insets.bottom,
        gap: spacing.xl,
      }}
    >
      {children}
    </ScrollView>
  );
}

export function ScreenHeader({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <View style={{ gap: spacing.sm }}>
      {eyebrow ? (
        <Text selectable style={{ ...type.label, color: colors.accent, textTransform: "uppercase" }}>
          {eyebrow}
        </Text>
      ) : null}
      <View style={{ flexDirection: "row", alignItems: "flex-start", gap: spacing.md }}>
        <View style={{ flex: 1, gap: spacing.sm }}>
          <Text selectable adjustsFontSizeToFit minimumFontScale={0.72} numberOfLines={1} style={{ ...type.title, color: colors.text }}>
            {title}
          </Text>
          {subtitle ? (
            <Text selectable style={{ ...type.body, color: colors.textMuted }}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        {action}
      </View>
    </View>
  );
}

export function PremiumCard({
  children,
  tone = "default",
  padded = true,
}: {
  children: ReactNode;
  tone?: "default" | "locked" | "danger" | "success" | "quiet";
  padded?: boolean;
}) {
  const styles = {
    default: { borderColor: colors.line, backgroundColor: colors.surface },
    locked: { borderColor: colors.accent, backgroundColor: colors.accentSoft },
    danger: { borderColor: colors.danger, backgroundColor: colors.dangerSoft },
    success: { borderColor: colors.success, backgroundColor: colors.successSoft },
    quiet: { borderColor: colors.lineSoft, backgroundColor: colors.surfaceMuted },
  }[tone];

  return (
    <View
      style={{
        borderRadius: radius.lg,
        borderCurve: "continuous",
        borderWidth: 1,
        borderColor: styles.borderColor,
        backgroundColor: styles.backgroundColor,
        padding: padded ? spacing.lg : 0,
        gap: spacing.md,
        boxShadow: tone === "default" ? shadow.soft : undefined,
      }}
    >
      {children}
    </View>
  );
}

export function PrimaryButton({
  label,
  onPress,
  disabled,
  compact,
  accessibilityLabel,
  accessibilityRole,
  testID,
  ...pressableProps
}: {
  label: string;
  onPress(): void;
  disabled?: boolean;
  compact?: boolean;
} & Omit<PressableProps, "style" | "children" | "disabled" | "onPress">) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole={accessibilityRole ?? "button"}
      testID={testID ?? stableUiIdentifier("action", label)}
      {...pressableProps}
      style={({ pressed }) => ({
        minHeight: compact ? 44 : 54,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: radius.md,
        borderCurve: "continuous",
        backgroundColor: disabled ? colors.surfaceSoft : pressed ? colors.accentPressed : colors.accent,
        paddingHorizontal: spacing.lg,
        opacity: disabled ? 0.55 : 1,
      })}
    >
      <Text adjustsFontSizeToFit minimumFontScale={0.78} numberOfLines={1} style={{ color: "#12110d", fontWeight: "900", fontSize: 15 }}>
        {label}
      </Text>
    </Pressable>
  );
}

export function SecondaryButton({
  label,
  onPress,
  disabled,
  compact,
  accessibilityLabel,
  accessibilityRole,
  testID,
  ...pressableProps
}: {
  label: string;
  onPress(): void;
  disabled?: boolean;
  compact?: boolean;
} & Omit<PressableProps, "style" | "children" | "disabled" | "onPress">) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole={accessibilityRole ?? "button"}
      testID={testID ?? stableUiIdentifier("action", label)}
      {...pressableProps}
      style={({ pressed }) => ({
        minHeight: compact ? 42 : 50,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: radius.md,
        borderCurve: "continuous",
        borderWidth: 1,
        borderColor: pressed ? colors.textMuted : colors.line,
        backgroundColor: pressed ? colors.surfaceSoft : colors.surfaceMuted,
        paddingHorizontal: spacing.lg,
        opacity: disabled ? 0.5 : 1,
      })}
    >
      <Text
        adjustsFontSizeToFit
        minimumFontScale={0.78}
        numberOfLines={1}
        style={{ color: disabled ? colors.textSubtle : colors.text, fontWeight: "800", fontSize: 15 }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function GhostButton({
  label,
  onPress,
  disabled,
  testID,
  ...pressableProps
}: { label: string; onPress(): void; disabled?: boolean } & Omit<PressableProps, "style" | "children" | "disabled" | "onPress">) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      testID={testID ?? stableUiIdentifier("action", label)}
      {...pressableProps}
      style={{ minHeight: 42, justifyContent: "center", opacity: disabled ? 0.45 : 1 }}
    >
      <Text adjustsFontSizeToFit minimumFontScale={0.78} numberOfLines={1} style={{ color: colors.textMuted, fontWeight: "800", textAlign: "center" }}>
        {label}
      </Text>
    </Pressable>
  );
}

export function DetailToggle({
  label = "Why?",
  children,
  compact,
  defaultOpen = false,
}: {
  label?: string;
  children: ReactNode;
  compact?: boolean;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <View style={{ gap: compact ? spacing.xs : spacing.sm }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={open ? `Hide ${label}` : `Show ${label}`}
        onPress={() => setOpen((value) => !value)}
        style={({ pressed }) => ({
          alignSelf: "flex-start",
          minHeight: compact ? 34 : 38,
          justifyContent: "center",
          borderRadius: radius.pill,
          borderCurve: "continuous",
          borderWidth: 1,
          borderColor: open ? colors.accent : colors.lineSoft,
          backgroundColor: pressed || open ? colors.accentSoft : colors.surfaceMuted,
          paddingHorizontal: compact ? spacing.sm : spacing.md,
          paddingVertical: compact ? 6 : 8,
        })}
      >
        <Text adjustsFontSizeToFit minimumFontScale={0.8} numberOfLines={1} style={{ color: open ? colors.accent : colors.textMuted, fontSize: 12, fontWeight: "900" }}>
          {open ? "Hide" : label}
        </Text>
      </Pressable>
      {open ? (
        <View
          style={{
            borderLeftWidth: 1,
            borderLeftColor: colors.line,
            paddingLeft: spacing.md,
            gap: spacing.sm,
          }}
        >
          {children}
        </View>
      ) : null}
    </View>
  );
}

export function AppInput({
  label,
  value,
  onChangeText,
  keyboardType,
  placeholder,
  secureTextEntry,
  multiline,
  testID,
}: {
  label: string;
  value: string;
  onChangeText(value: string): void;
  keyboardType?: "number-pad" | "decimal-pad" | "email-address";
  placeholder?: string;
  secureTextEntry?: boolean;
  multiline?: boolean;
  testID?: string;
}) {
  const inputID = testID ?? stableUiIdentifier("input", label);
  const numericInput = keyboardType === "number-pad" || keyboardType === "decimal-pad";
  const accessoryID = `${inputID}-keyboard-accessory`;
  return (
    <View style={{ gap: spacing.sm }}>
      <Text selectable style={{ ...type.label, color: colors.textMuted }}>
        {label}
      </Text>
      <TextInput
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType={keyboardType}
        multiline={multiline}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSubtle}
        secureTextEntry={secureTextEntry}
        testID={inputID}
        inputAccessoryViewID={numericInput && Platform.OS === "ios" ? accessoryID : undefined}
        value={value}
        style={{
          minHeight: multiline ? 104 : 52,
          borderRadius: radius.md,
          borderCurve: "continuous",
          borderWidth: 1,
          borderColor: colors.line,
          backgroundColor: colors.surfaceMuted,
          color: colors.text,
          paddingHorizontal: spacing.lg,
          paddingVertical: multiline ? spacing.md : 0,
          fontSize: 16,
          textAlignVertical: multiline ? "top" : "center",
        }}
      />
      {numericInput && Platform.OS === "ios" ? (
        <InputAccessoryView nativeID={accessoryID}>
          <View style={{ minHeight: 44, alignItems: "flex-end", justifyContent: "center", paddingHorizontal: spacing.md, backgroundColor: colors.surface }}>
            <Pressable testID={`${inputID}-done`} accessibilityRole="button" accessibilityLabel="Done" onPress={Keyboard.dismiss} style={({ pressed }) => ({ minWidth: 56, minHeight: 44, alignItems: "center", justifyContent: "center", opacity: pressed ? 0.65 : 1 })}>
              <Text style={{ color: colors.accent, fontSize: 16, fontWeight: "800" }}>Done</Text>
            </Pressable>
          </View>
        </InputAccessoryView>
      ) : null}
    </View>
  );
}

export function stableUiIdentifier(kind: "action" | "input" | "option", value: string | number): string {
  const slug = String(value).trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `${kind}-${slug || "unnamed"}`;
}

export function StatTile({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return (
    <View style={{ flex: 1, minWidth: 96 }}>
      <PremiumCard tone="quiet">
        <Text selectable numberOfLines={1} style={{ ...type.label, color: colors.textSubtle }}>
          {label}
        </Text>
        <Text
          selectable
          adjustsFontSizeToFit
          minimumFontScale={0.58}
          numberOfLines={1}
          style={{ ...type.metric, color: colors.text, fontVariant: ["tabular-nums"], flexShrink: 1, minWidth: 0 }}
        >
          {value}
        </Text>
        {detail ? (
          <Text selectable numberOfLines={2} style={{ color: colors.textMuted, fontSize: 12, lineHeight: 17 }}>
            {detail}
          </Text>
        ) : null}
      </PremiumCard>
    </View>
  );
}

export function MetricStrip({ children }: { children: ReactNode }) {
  return <View style={{ flexDirection: "row", gap: spacing.sm }}>{children}</View>;
}

export function Pill({ label, tone = "default" }: { label: string; tone?: "default" | "accent" | "success" | "danger" }) {
  const palette = {
    default: { bg: colors.surfaceSoft, fg: colors.textMuted, border: colors.line },
    accent: { bg: colors.accentSoft, fg: colors.accent, border: "#5a4721" },
    success: { bg: colors.successSoft, fg: colors.success, border: "#214d35" },
    danger: { bg: colors.dangerSoft, fg: colors.danger, border: "#55302f" },
  }[tone];

  return (
    <View
      style={{
        alignSelf: "flex-start",
        borderRadius: radius.pill,
        borderWidth: 1,
        borderColor: palette.border,
        backgroundColor: palette.bg,
        paddingHorizontal: spacing.md,
        paddingVertical: 7,
      }}
    >
      <Text style={{ color: palette.fg, fontSize: 12, fontWeight: "800" }}>{label}</Text>
    </View>
  );
}

export function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <PremiumCard tone="quiet">
      <Text selectable style={{ ...type.section, color: colors.text }}>
        {title}
      </Text>
      <Text selectable style={{ ...type.body, color: colors.textMuted }}>
        {message}
      </Text>
    </PremiumCard>
  );
}

export function LoadingState({ message = "Loading..." }: { message?: string }) {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background, gap: spacing.md }}>
      <ActivityIndicator color={colors.accent} />
      <Text selectable style={{ color: colors.textMuted }}>{message}</Text>
    </View>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <PremiumCard tone="danger">
      <Text selectable style={{ ...type.section, color: colors.text }}>Needs attention</Text>
      <Text selectable style={{ ...type.body, color: "#f1c5c3" }}>{message}</Text>
    </PremiumCard>
  );
}

export function LockedFeatureCard({ title, message }: { title: string; message: string }) {
  return (
    <PremiumCard tone="locked">
      <Text selectable style={{ ...type.section, color: colors.text }}>{title}</Text>
      <Text selectable style={{ ...type.body, color: "#dfc994" }}>{message}</Text>
    </PremiumCard>
  );
}

export function SectionHeader({ title, detail }: { title: string; detail?: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.md }}>
      <Text selectable style={{ ...type.section, color: colors.text }}>{title}</Text>
      {detail ? (
        <Text selectable style={{ ...type.label, color: colors.textSubtle }}>
          {detail}
        </Text>
      ) : null}
    </View>
  );
}

export function RowItem({
  title,
  subtitle,
  meta,
  children,
  index = 0,
}: {
  title: string;
  subtitle?: string;
  meta?: string;
  children?: ReactNode;
  index?: number;
}) {
  return (
    <Animated.View entering={FadeInUp.duration(180).delay(Math.min(index, 8) * 18)}>
      <PremiumCard tone="quiet">
        <View style={{ flexDirection: "row", justifyContent: "space-between", gap: spacing.md }}>
          <View style={{ flex: 1, flexShrink: 1, minWidth: 0, gap: spacing.xs }}>
            <Text selectable numberOfLines={2} ellipsizeMode="tail" style={{ color: colors.text, fontSize: 17, lineHeight: 22, fontWeight: "800", flexShrink: 1 }}>
              {title}
            </Text>
            {subtitle ? (
              <Text selectable numberOfLines={2} ellipsizeMode="tail" style={{ color: colors.textMuted, fontSize: 13, lineHeight: 19, flexShrink: 1 }}>
                {subtitle}
              </Text>
            ) : null}
          </View>
          {meta ? (
            <Text selectable style={{ ...type.label, color: colors.accent, textAlign: "right" }}>
              {meta}
            </Text>
          ) : null}
        </View>
        {children}
      </PremiumCard>
    </Animated.View>
  );
}

export function AppScreen({
  children,
  bottom,
  scrollRef,
  respectTopSafeArea = false,
}: {
  children: ReactNode;
  bottom?: number;
  scrollRef?: RefObject<ScrollView | null>;
  respectTopSafeArea?: boolean;
}) {
  const insets = useSafeAreaInsets();
  const bottomPadding = bottom == null ? getTabScreenBottomPadding(insets.bottom) : bottom + insets.bottom;

  return (
    <ScrollView
      ref={scrollRef}
      contentInsetAdjustmentBehavior="automatic"
      keyboardDismissMode="interactive"
      keyboardShouldPersistTaps="handled"
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{
        paddingHorizontal: shellTokens.pageHorizontal,
        paddingTop: respectTopSafeArea ? Math.max(spacing.lg, insets.top) : spacing.lg,
        paddingBottom: bottomPadding,
        gap: spacing.xxl,
      }}
    >
      {children}
    </ScrollView>
  );
}

export function HeroPanel({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children?: ReactNode;
}) {
  return (
    <View style={{ gap: spacing.md }}>
      {eyebrow ? (
        <Text selectable style={{ ...type.label, color: colors.accent, textTransform: "uppercase" }}>
          {eyebrow}
        </Text>
      ) : null}
      <Text selectable style={{ ...type.title, color: colors.text }}>
        {title}
      </Text>
      {subtitle ? (
        <Text selectable style={{ ...type.body, color: colors.textMuted }}>
          {subtitle}
        </Text>
      ) : null}
      {children}
    </View>
  );
}

export function PrimaryActionCard({
  title,
  subtitle,
  actionLabel,
  onPress,
  meta,
}: {
  title: string;
  subtitle?: string;
  actionLabel: string;
  onPress(): void;
  meta?: string;
}) {
  return (
    <PremiumCard>
      {meta ? <Pill label={meta} tone="accent" /> : null}
      <View style={{ gap: spacing.sm }}>
        <Text selectable style={{ ...type.section, color: colors.text }}>
          {title}
        </Text>
        {subtitle ? (
          <Text selectable style={{ ...type.body, color: colors.textMuted }}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <PrimaryButton label={actionLabel} onPress={onPress} />
    </PremiumCard>
  );
}

export function MetricRow({ items }: { items: Array<{ label: string; value: string; tone?: "default" | "success" | "danger" }> }) {
  return (
    <View style={{ flexDirection: "row", gap: spacing.sm }}>
      {items.map((item) => (
        <View key={item.label} style={{ flex: 1, gap: spacing.xs }}>
          <Text selectable style={{ ...type.label, color: colors.textSubtle }}>
            {item.label}
          </Text>
          <Text
            selectable
            style={{
              color: item.tone === "success" ? colors.success : item.tone === "danger" ? colors.danger : colors.text,
              fontSize: 24,
              lineHeight: 29,
              fontWeight: "900",
              fontVariant: ["tabular-nums"],
            }}
          >
            {item.value}
          </Text>
        </View>
      ))}
    </View>
  );
}

export function WorkoutSetRow({
  setNumber,
  reps,
  load,
  unit,
  loadLabel,
  status = "counted",
}: {
  setNumber: number;
  reps: number;
  load: number;
  unit: string;
  loadLabel?: string;
  status?: "counted" | "below";
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderRadius: radius.md,
        borderCurve: "continuous",
        backgroundColor: status === "below" ? colors.dangerSoft : colors.surfaceMuted,
        borderWidth: 1,
        borderColor: status === "below" ? colors.danger : colors.lineSoft,
        padding: spacing.md,
        gap: spacing.md,
      }}
    >
      <View>
        <Text selectable style={{ ...type.label, color: colors.textSubtle }}>
          Set {setNumber}
        </Text>
        <Text selectable style={{ color: status === "below" ? colors.danger : colors.textSubtle, fontSize: 12, fontWeight: "800" }}>
          {status === "below" ? "Stopped" : "Counted"}
        </Text>
      </View>
      <Text selectable style={{ color: colors.text, fontSize: 18, fontWeight: "900", fontVariant: ["tabular-nums"] }}>
        {loadLabel ?? `${reps} @ ${load}${unit}`}
      </Text>
    </View>
  );
}

export function CoachInsightCard({
  title,
  message,
  tone = "default",
}: {
  title: string;
  message: string;
  tone?: "default" | "success" | "danger" | "locked";
}) {
  return (
    <PremiumCard tone={tone}>
      <Text selectable style={{ ...type.section, color: colors.text }}>
        {title}
      </Text>
      <Text selectable style={{ ...type.body, color: tone === "danger" ? "#f1c5c3" : tone === "locked" ? "#dfc994" : colors.textMuted }}>
        {message}
      </Text>
    </PremiumCard>
  );
}

export function SectionList({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <View style={{ gap: spacing.md }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.md }}>
        <Text selectable style={{ ...type.section, color: colors.text }}>
          {title}
        </Text>
        {action}
      </View>
      <View style={{ gap: spacing.sm }}>{children}</View>
    </View>
  );
}

export function EmptyActionState({
  title,
  message,
  actionLabel,
  onPress,
}: {
  title: string;
  message: string;
  actionLabel?: string;
  onPress?: () => void;
}) {
  return (
    <PremiumCard tone="quiet">
      <Text selectable style={{ ...type.section, color: colors.text }}>
        {title}
      </Text>
      <Text selectable style={{ ...type.body, color: colors.textMuted }}>
        {message}
      </Text>
      {actionLabel && onPress ? <SecondaryButton label={actionLabel} onPress={onPress} compact /> : null}
    </PremiumCard>
  );
}

export function BottomActionBar({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        marginBottom: insets.bottom,
        gap: spacing.sm,
        borderRadius: radius.lg,
        borderCurve: "continuous",
        borderWidth: 1,
        borderColor: colors.line,
        backgroundColor: colors.backgroundElevated,
        padding: spacing.sm,
      }}
    >
      {children}
    </View>
  );
}
