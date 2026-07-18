export const colors = {
  background: "#07090d",
  backgroundElevated: "#0b0f16",
  surface: "#101722",
  surfaceSoft: "#151d2a",
  surfaceMuted: "#0d121a",
  line: "#202a39",
  lineSoft: "#182230",
  text: "#f4f0e8",
  textMuted: "#a7b0bf",
  textSubtle: "#6f7b8d",
  accent: "#d8b56d",
  accentPressed: "#e7c67b",
  accentSoft: "#2a2418",
  success: "#72d49f",
  successSoft: "#102519",
  warning: "#e2b866",
  warningSoft: "#241d10",
  danger: "#e97872",
  dangerSoft: "#241314",
  blue: "#9ab8ff",
  blueSoft: "#121a2d",
  focus: "#8ee8ff",
  scrim: "rgba(3, 5, 8, 0.72)",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  xxxl: 36,
};

export const radius = {
  sm: 8,
  md: 10,
  lg: 14,
  xl: 18,
  pill: 999,
};

export const type = {
  hero: { fontSize: 36, lineHeight: 40, fontWeight: "900" as const, letterSpacing: -0.4 },
  title: { fontSize: 30, lineHeight: 34, fontWeight: "900" as const, letterSpacing: 0 },
  display: { fontSize: 26, lineHeight: 31, fontWeight: "900" as const, letterSpacing: -0.2 },
  section: { fontSize: 18, lineHeight: 23, fontWeight: "800" as const, letterSpacing: 0 },
  body: { fontSize: 15, lineHeight: 22, fontWeight: "500" as const, letterSpacing: 0 },
  label: { fontSize: 12, lineHeight: 16, fontWeight: "800" as const, letterSpacing: 0 },
  metric: { fontSize: 28, lineHeight: 32, fontWeight: "900" as const, letterSpacing: 0 },
};

/** Shared semantic design tokens for the mounted application shell. */
export const shellTokens = {
  pageHorizontal: spacing.lg,
  sectionGap: spacing.xl,
  cardPadding: spacing.lg,
  controlMinHeight: 44,
  border: colors.line,
  focus: colors.focus,
};

export const shadow = {
  soft: "0 10px 28px rgba(0, 0, 0, 0.22)",
  lift: "0 18px 44px rgba(0, 0, 0, 0.32)",
};
