export const colors = {
  background: "#050B14",
  backgroundElevated: "#0B1522",
  surface: "#0B1522",
  surfaceSoft: "#101E2E",
  surfaceMuted: "#0D1721",
  line: "#1E2D3F",
  lineSoft: "#16212F",
  text: "#F3E9DA",
  textMuted: "#97A3B5",
  textSubtle: "#5C6C82",
  accent: "#F3D08A",
  accentPressed: "#F7DBA3",
  accentDeep: "#C9973F",
  accentSoft: "#241E10",
  success: "#7FB088",
  successSoft: "#102519",
  warning: "#e2b866",
  warningSoft: "#241d10",
  danger: "#e97872",
  dangerSoft: "#241314",
  blue: "#9ab8ff",
  blueSoft: "#121a2d",
  focus: "#F3D08A",
  scrim: "rgba(3, 6, 11, 0.72)",
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

/**
 * fontFamily values reference fonts loaded via useFonts() in the root layout
 * (see app/_layout.tsx). "Oswald" is the display/number face used for hero
 * numerals and titles; body text uses the platform system font (no
 * fontFamily override) as before.
 */
export const type = {
  hero: { fontSize: 36, lineHeight: 40, fontWeight: "600" as const, letterSpacing: -0.4, fontFamily: "Oswald_600SemiBold" },
  title: { fontSize: 30, lineHeight: 34, fontWeight: "600" as const, letterSpacing: 0, fontFamily: "Oswald_600SemiBold" },
  display: { fontSize: 26, lineHeight: 31, fontWeight: "600" as const, letterSpacing: -0.2, fontFamily: "Oswald_600SemiBold" },
  section: { fontSize: 18, lineHeight: 23, fontWeight: "600" as const, letterSpacing: 0, fontFamily: "Oswald_600SemiBold" },
  body: { fontSize: 15, lineHeight: 22, fontWeight: "500" as const, letterSpacing: 0 },
  label: { fontSize: 12, lineHeight: 16, fontWeight: "600" as const, letterSpacing: 0 },
  metric: { fontSize: 28, lineHeight: 32, fontWeight: "600" as const, letterSpacing: 0, fontFamily: "Oswald_600SemiBold" },
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

/**
 * Living Programme semantic roles, now unified with the brand palette sampled
 * from the app's own logo (navy canvas, warm gold accent, cream text) instead
 * of the previous unrelated acid-green/dark-green scheme.
 */
export const livingProgrammeColors = {
  action: colors.accent,
  actionPressed: colors.accentPressed,
  actionSoft: colors.accentSoft,
  complete: colors.success,
  attention: colors.warning,
  risk: colors.danger,
  canvas: colors.background,
  surface: colors.surface,
  surfaceRaised: colors.surfaceSoft,
  line: colors.line,
  text: colors.text,
  muted: colors.textMuted,
} as const;

export const shadow = {
  soft: "0 10px 28px rgba(0, 0, 0, 0.22)",
  lift: "0 18px 44px rgba(0, 0, 0, 0.32)",
};
