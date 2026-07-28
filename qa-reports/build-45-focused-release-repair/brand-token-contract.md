# Workout brand token contract

Verdict: **PROVEN**

The sole production authority is `src/ui/theme.ts:workoutColors`.

| Meaning | Token | Value |
|---|---|---|
| Background | `background` | `#07090d` |
| Surface/card | `surface` | `#101722` |
| Raised/pressed surface | `surfaceRaised` | `#151d2a` |
| Border | `line` / `lineStrong` | `#182230` / `#202a39` |
| Primary text | `text` | `#f4f0e8` |
| Secondary text | `muted` | `#a7b0bf` |
| Subtle text | `subtle` | `#6f7b8d` |
| Brand/active/focus | `accent` | `#d8b56d` |
| Completed | `success` | `#72d49f` |
| Paused/warning | `warning` | `#e2b866` |
| Destructive/error | `danger` | `#e97872` |
| Modal overlay | `scrim` | canonical shared scrim |

Normal-text foreground/background pairs used by Train are deterministically checked at 4.5:1 or better. Disabled controls retain a distinct opacity/state and are not presented as enabled actions.

No second theme, local palette, appearance-specific branch, or system default is authorised.
