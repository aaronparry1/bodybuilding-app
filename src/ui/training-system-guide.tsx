import { useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { AppScreen, SecondaryButton } from "@/ui/primitives";
import { colors, radius, spacing, type } from "@/ui/theme";
import { TRAINING_SYSTEM_GUIDE_SECTIONS } from "@/ui/training-system-guide-content";

export function TrainingSystemGuideButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Open How Adaptive Strength Coach Works guide"
        onPress={() => setOpen(true)}
        style={({ pressed }) => ({
          width: 42,
          height: 42,
          borderRadius: radius.pill,
          borderCurve: "continuous",
          borderWidth: 1,
          borderColor: pressed ? colors.accent : colors.line,
          backgroundColor: pressed ? colors.accentSoft : colors.surfaceMuted,
          alignItems: "center",
          justifyContent: "center",
        })}
      >
        <Text selectable={false} style={{ color: colors.accent, fontSize: 20, lineHeight: 24, fontWeight: "900" }}>
          ?
        </Text>
      </Pressable>
      <TrainingSystemGuideModal visible={open} onClose={() => setOpen(false)} />
    </>
  );
}

export function TrainingSystemGuideModal({ visible, onClose }: { visible: boolean; onClose(): void }) {
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <AppScreen bottom={48}>
        <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: spacing.lg }}>
          <View style={{ flex: 1, gap: spacing.sm }}>
            <Text selectable style={{ ...type.label, color: colors.accent, textTransform: "uppercase" }}>
              Guide
            </Text>
            <Text selectable style={{ color: colors.text, fontSize: 32, lineHeight: 37, fontWeight: "900", letterSpacing: 0 }}>
              How Adaptive Strength Coach Works
            </Text>
            <Text selectable style={{ color: colors.textMuted, fontSize: 16, lineHeight: 23, fontWeight: "700" }}>
              Short version: log honest work, let the app read the pattern, and do not turn every session into a heroic documentary.
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close How Adaptive Strength Coach Works guide"
            onPress={onClose}
            style={({ pressed }) => ({
              width: 42,
              height: 42,
              borderRadius: radius.pill,
              borderCurve: "continuous",
              borderWidth: 1,
              borderColor: colors.line,
              backgroundColor: pressed ? colors.surfaceSoft : colors.surfaceMuted,
              alignItems: "center",
              justifyContent: "center",
            })}
          >
            <Text selectable={false} style={{ color: colors.text, fontSize: 18, lineHeight: 22, fontWeight: "900" }}>
              ×
            </Text>
          </Pressable>
        </View>

        <View style={{ gap: spacing.lg }}>
          {TRAINING_SYSTEM_GUIDE_SECTIONS.map((section, sectionIndex) => (
            <View
              key={section.title}
              style={{
                borderRadius: radius.lg,
                borderCurve: "continuous",
                borderWidth: 1,
                borderColor: colors.lineSoft,
                backgroundColor: colors.surfaceMuted,
                padding: spacing.xl,
                gap: spacing.md,
              }}
            >
              <Text selectable style={{ ...type.label, color: colors.accent, textTransform: "uppercase" }}>
                {String(sectionIndex + 1).padStart(2, "0")}
              </Text>
              <Text selectable style={{ color: colors.text, fontSize: 24, lineHeight: 30, fontWeight: "900" }}>
                {section.title}
              </Text>
              <View style={{ gap: spacing.sm }}>
                {section.bullets.map((bullet, index) => (
                  <View key={bullet} style={{ flexDirection: "row", gap: spacing.sm, alignItems: "flex-start" }}>
                    <Text selectable style={{ color: index === 0 ? colors.accent : colors.textSubtle, fontSize: index === 0 ? 16 : 15, lineHeight: index === 0 ? 25 : 23, fontWeight: "900" }}>
                      {index === 0 ? "•" : "-"}
                    </Text>
                    <Text selectable style={{ color: index === 0 ? colors.text : colors.textMuted, fontSize: index === 0 ? 17 : 16, lineHeight: index === 0 ? 25 : 24, fontWeight: index === 0 ? "800" : "500", flex: 1 }}>
                      {bullet}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>

        <SecondaryButton label="Close guide" onPress={onClose} accessibilityLabel="Close How Adaptive Strength Coach Works guide" />
      </AppScreen>
    </Modal>
  );
}
