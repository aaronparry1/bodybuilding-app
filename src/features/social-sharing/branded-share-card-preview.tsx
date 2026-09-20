import { LinearGradient } from "expo-linear-gradient";
import { forwardRef, useRef, useState } from "react";
import { ActivityIndicator, Image, Modal, Pressable, Text, View } from "react-native";
import { ADAPTIVE_STRENGTH_COACH_DOWNLOAD_URL, type BrandedSharePayload } from "@/domain/training/share-cards";
import { shareBrandedProgressLink, shareCapturedBrandedProgressCard } from "@/features/social-sharing/share-progress-card";
import { colors, spacing } from "@/ui/theme";

const logo = require("../../../assets/share-card-logo.png");

export function BrandedShareCardPreviewModal({
  payload,
  onClose,
}: {
  payload: BrandedSharePayload | null;
  onClose(): void;
}) {
  const cardRef = useRef<View>(null);
  const [sharing, setSharing] = useState(false);

  const handleShare = async () => {
    if (!payload || sharing) return;
    setSharing(true);
    try {
      await shareCapturedBrandedProgressCard(payload, cardRef);
      onClose();
    } finally {
      setSharing(false);
    }
  };

  const handleShareLink = async () => {
    if (!payload || sharing) return;
    setSharing(true);
    try {
      await shareBrandedProgressLink(payload);
      onClose();
    } finally {
      setSharing(false);
    }
  };

  return (
    <Modal visible={Boolean(payload)} transparent animationType="fade" onRequestClose={onClose}>
      <View style={previewBackdropStyle}>
        <Pressable accessible={false} style={previewCardStyle}>
          {payload ? <BrandedShareCard payload={payload} ref={cardRef} /> : null}
          <View style={{ flexDirection: "row", gap: spacing.sm, flexWrap: "wrap" }}>
            <Pressable accessibilityRole="button" onPress={onClose} style={({ pressed }) => previewButtonStyle(false, pressed)}>
              <Text selectable={false} style={previewButtonTextStyle(false)}>
                Cancel
              </Text>
            </Pressable>
            <Pressable accessibilityRole="button" onPress={handleShare} disabled={sharing} style={({ pressed }) => previewButtonStyle(true, pressed || sharing)}>
              {sharing ? (
                <ActivityIndicator color="#071018" />
              ) : (
                <Text selectable={false} style={previewButtonTextStyle(true)}>
                  Share image
                </Text>
              )}
            </Pressable>
            <Pressable accessibilityRole="button" onPress={handleShareLink} disabled={sharing} style={({ pressed }) => ({ ...previewButtonStyle(false, pressed || sharing), flexBasis: "100%" })}>
              <Text selectable={false} style={previewButtonTextStyle(false)}>
                Share app link
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </View>
    </Modal>
  );
}

export const BrandedShareCard = forwardRef<View, { payload: BrandedSharePayload }>(function BrandedShareCard({ payload }, ref) {
  const eyebrow = payload.eyebrow ?? eyebrowFor(payload.type, payload.cardTitle);
  return (
    <View ref={ref} collapsable={false} style={shareCardOuterStyle}>
      <LinearGradient colors={["#08111D", "#05070B", "#101319"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={shareCardGradientStyle}>
        <View style={shareCardGlowStyle} />
        <View style={shareCardTopRowStyle}>
          <Image source={logo} resizeMode="cover" style={shareLogoStyle} />
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text selectable={false} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.82} style={shareBrandStyle}>
              {payload.brand}
            </Text>
            <Text selectable={false} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.82} style={shareSubtitleStyle}>
              {payload.subtitle}
            </Text>
          </View>
        </View>

        <View style={shareCardBodyStyle}>
          <Text selectable={false} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.78} style={shareEyebrowStyle}>
            {eyebrow}
          </Text>
          <Text selectable={false} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.72} style={shareTitleStyle}>
            {payload.cardTitle}
          </Text>
          <Text selectable={false} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.62} style={shareMetricStyle}>
            {payload.metric}
          </Text>
          <View style={shareDividerStyle} />
          <Text selectable={false} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.8} style={shareDetailStyle}>
            {payload.detail}
          </Text>
        </View>

        <View style={shareCardFooterStyle}>
          <Text selectable={false} style={shareFooterKickerStyle}>
            PERFORMANCE-BASED COACHING
          </Text>
          <Text selectable={false} style={shareFooterBrandStyle}>
            adaptive strength coach
          </Text>
          <Text selectable={false} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.78} style={shareFooterUrlStyle}>
            {ADAPTIVE_STRENGTH_COACH_DOWNLOAD_URL.replace("https://", "")}
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
});

function eyebrowFor(type: BrandedSharePayload["type"], fallback: string): string {
  if (type === "pr") return "NEW PR";
  if (type === "strength_progress") return `${fallback.toUpperCase()} PROGRESS`;
  if (type === "powerlifting_total") return "PROJECTED TOTAL";
  return "WORKOUT COMPLETE";
}

const previewBackdropStyle = {
  flex: 1,
  justifyContent: "center" as const,
  padding: spacing.lg,
  backgroundColor: "rgba(0,0,0,0.78)",
};

const previewCardStyle = {
  borderRadius: 24,
  borderWidth: 1,
  borderColor: colors.line,
  backgroundColor: colors.background,
  padding: spacing.md,
  gap: spacing.md,
};

const previewButtonStyle = (primary: boolean, pressed: boolean) => ({
  flex: 1,
  minHeight: 46,
  borderRadius: 999,
  alignItems: "center" as const,
  justifyContent: "center" as const,
  borderWidth: 1,
  borderColor: primary ? "#F7D37A" : colors.line,
  backgroundColor: primary ? "#F7D37A" : colors.surface,
  opacity: pressed ? 0.76 : 1,
});

const previewButtonTextStyle = (primary: boolean) => ({
  color: primary ? "#071018" : colors.text,
  fontSize: 14,
  lineHeight: 18,
  fontWeight: "900" as const,
});

const shareCardOuterStyle = {
  width: 320,
  height: 400,
  alignSelf: "center" as const,
  borderRadius: 26,
  overflow: "hidden" as const,
  backgroundColor: "#05070B",
};

const shareCardGradientStyle = {
  flex: 1,
  paddingTop: 20,
  paddingHorizontal: 22,
  paddingBottom: 20,
  justifyContent: "space-between" as const,
};

const shareCardGlowStyle = {
  position: "absolute" as const,
  top: -70,
  right: -45,
  width: 210,
  height: 210,
  borderRadius: 140,
  backgroundColor: "rgba(247,211,122,0.15)",
};

const shareCardTopRowStyle = {
  flexDirection: "row" as const,
  alignItems: "center" as const,
  gap: 10,
};

const shareLogoStyle = {
  width: 54,
  height: 54,
  borderRadius: 16,
  borderWidth: 1,
  borderColor: "rgba(247,211,122,0.55)",
};

const shareBrandStyle = {
  color: "#F8F3E8",
  fontSize: 17,
  lineHeight: 20,
  fontWeight: "900" as const,
};

const shareSubtitleStyle = {
  color: "rgba(248,243,232,0.72)",
  fontSize: 10,
  lineHeight: 14,
  fontWeight: "800" as const,
  textTransform: "uppercase" as const,
};

const shareCardBodyStyle = {
  gap: 8,
  paddingVertical: 12,
};

const shareEyebrowStyle = {
  color: "#F7D37A",
  fontSize: 15,
  lineHeight: 19,
  fontWeight: "900" as const,
  letterSpacing: 0,
};

const shareTitleStyle = {
  color: "#FFFFFF",
  fontSize: 28,
  lineHeight: 32,
  fontWeight: "900" as const,
};

const shareMetricStyle = {
  color: "#F7D37A",
  fontSize: 34,
  lineHeight: 40,
  fontWeight: "900" as const,
};

const shareDividerStyle = {
  width: 72,
  height: 3,
  borderRadius: 3,
  backgroundColor: "rgba(247,211,122,0.86)",
};

const shareDetailStyle = {
  color: "rgba(248,243,232,0.84)",
  fontSize: 14,
  lineHeight: 19,
  fontWeight: "900" as const,
};

const shareCardFooterStyle = {
  gap: 5,
};

const shareFooterKickerStyle = {
  color: "rgba(248,243,232,0.58)",
  fontSize: 10,
  lineHeight: 14,
  fontWeight: "900" as const,
};

const shareFooterBrandStyle = {
  color: "#F7D37A",
  fontSize: 12,
  lineHeight: 16,
  fontWeight: "900" as const,
  textTransform: "uppercase" as const,
};

const shareFooterUrlStyle = {
  color: "rgba(248,243,232,0.72)",
  fontSize: 10,
  lineHeight: 14,
  fontWeight: "800" as const,
};
