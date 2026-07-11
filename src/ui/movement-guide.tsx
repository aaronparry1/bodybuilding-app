import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import type { MovementGuide } from "@/domain/training/prep-capacity-guides";
import { colors, radius, spacing, type } from "@/ui/theme";

type GuidePanel = "why" | "how" | null;

export function GuideDisclosureRow({ why, guide }: { why: string; guide: MovementGuide }) {
  const [openPanel, setOpenPanel] = useState<GuidePanel>(null);

  return (
    <View style={{ gap: spacing.sm }}>
      <View style={{ flexDirection: "row", gap: spacing.xs, flexWrap: "wrap" }}>
        <GuideDisclosureButton label="Why?" active={openPanel === "why"} onPress={() => setOpenPanel((current) => (current === "why" ? null : "why"))} />
        <GuideDisclosureButton label="How?" active={openPanel === "how"} onPress={() => setOpenPanel((current) => (current === "how" ? null : "how"))} />
      </View>
      {openPanel ? (
        <View
          style={{
            borderLeftWidth: 1,
            borderLeftColor: colors.line,
            paddingLeft: spacing.md,
            gap: spacing.sm,
          }}
        >
          {openPanel === "why" ? (
            <Text selectable style={{ ...type.body, color: colors.textSubtle }}>
              {why}
            </Text>
          ) : (
            <MovementGuideDetails guide={guide} />
          )}
        </View>
      ) : null}
    </View>
  );
}

function GuideDisclosureButton({ label, active, onPress }: { label: string; active: boolean; onPress(): void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={active ? `Hide ${label}` : `Show ${label}`}
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: 34,
        justifyContent: "center",
        borderRadius: radius.pill,
        borderCurve: "continuous",
        borderWidth: 1,
        borderColor: active ? colors.accent : colors.lineSoft,
        backgroundColor: pressed || active ? colors.accentSoft : colors.surfaceMuted,
        paddingHorizontal: spacing.sm,
        paddingVertical: 6,
      })}
    >
      <Text style={{ color: active ? colors.accent : colors.textMuted, fontSize: 12, fontWeight: "900" }}>
        {active ? "Hide" : label}
      </Text>
    </Pressable>
  );
}

export function MovementGuideDetails({ guide }: { guide: MovementGuide }) {
  return (
    <View style={{ gap: spacing.xs }}>
      <GuideSection title="How" items={buildConciseGuideItems(guide)} />
    </View>
  );
}

export function buildConciseGuideItems(guide: MovementGuide): string[] {
  const avoid = [...guide.commonMistakes, ...(guide.avoid ?? [])].find(Boolean);
  return [
    guide.setup[0] ?? "Set up in a comfortable position.",
    guide.steps[0] ?? "Move slowly.",
    guide.cues[0] ? `Cue: ${guide.cues[0]}` : "Pause and control the position.",
    guide.steps[1] ?? "Return and reset before the next rep.",
    avoid ? `Avoid: ${avoid}` : "Avoid rushing or forcing range.",
  ].slice(0, 5);
}

function GuideSection({ title, items }: { title: string; items: string[] }) {
  return (
    <View style={{ gap: 2 }}>
      <Text selectable style={{ ...type.label, color: colors.textSubtle }}>
        {title}
      </Text>
      {items.map((item) => (
        <Text
          key={`${title}-${item}`}
          selectable
          style={{ color: colors.textMuted, fontSize: 14, lineHeight: 19, fontWeight: "500" }}
        >
          {`\u2022 ${item}`}
        </Text>
      ))}
    </View>
  );
}
