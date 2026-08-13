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
  focus: "#d8b56d",
  scrim: "rgba(3, 5, 8, 0.72)",
  transparent: "transparent",
} as const;

/**
 * Semantic workout-state colours derived from the approved application shell.
 * Workout screens must consume this view rather than inventing a local palette.
 */
export const workoutColors = {
  background: colors.background,
  surface: colors.surface,
  surfaceRaised: colors.surfaceSoft,
  line: colors.lineSoft,
  lineStrong: colors.line,
  text: colors.text,
  muted: colors.textMuted,
  subtle: colors.textSubtle,
  accent: colors.accent,
  accentPressed: colors.accentPressed,
  accentSoft: colors.accentSoft,
  success: colors.success,
  successSoft: colors.successSoft,
  warning: colors.warning,
  warningSoft: colors.warningSoft,
  danger: colors.danger,
  dangerSoft: colors.dangerSoft,
  scrim: colors.scrim,
  transparent: colors.transparent,
} as const;

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

/** Living Programme semantic roles. Kept separate while Stage 1 is introduced so
 * untouched production surfaces do not change by accident. */
export const livingProgrammeColors = {
  action: "#c9f35c",
  actionPressed: "#b7df50",
  actionSoft: "#1b2418",
  complete: "#70e0ad",
  attention: "#f0b35a",
  risk: "#ff766d",
  canvas: colors.background,
  surface: "#111513",
  surfaceRaised: "#171c19",
  line: "#2a302d",
  text: colors.text,
  muted: colors.textMuted,
} as const;

export const shadow = {
  soft: "0 10px 28px rgba(0, 0, 0, 0.22)",
  lift: "0 18px 44px rgba(0, 0, 0, 0.32)",
};
