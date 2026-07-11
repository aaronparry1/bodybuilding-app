import type {
  AnnualPlan,
  BlockGoal,
  BlockPerformanceSnapshot,
  BlockRecommendation,
  BlockType,
  DeloadTrigger,
  IntensityEmphasis,
  TrainingBlock,
  TrainingYear,
  VolumeEmphasis,
} from "@/domain/training/annual-models";
import type { RepRange } from "@/domain/training/models";

const blockOrder: BlockType[] = ["hypertrophy", "powerbuilding", "strength", "power", "peak", "deload"];

const blockDefaults: Record<
  BlockType,
  {
    name: string;
    goal: BlockGoal;
    durationWeeks: number;
    repRange: RepRange;
    mainRepRange: RepRange;
    secondaryRepRange: RepRange;
    accessoryRepRange: RepRange;
    hypertrophyAccessoryRepRange: RepRange;
    hypertrophyShare: number;
    strengthShare: number;
    powerShare: number;
    volumeEmphasis: VolumeEmphasis;
    intensityEmphasis: IntensityEmphasis;
    dropOffPercent: number;
    dropOffRange?: { min: number; max: number };
    stopRuleNote: string;
    progressionType: TrainingBlock["progressionRule"]["type"];
    progressionDescription: string;
    notes: string[];
  }
> = {
  hypertrophy: {
    name: "Hypertrophy",
    goal: "build_muscle",
    durationWeeks: 6,
    repRange: { min: 6, max: 20 },
    mainRepRange: { min: 6, max: 10 },
    secondaryRepRange: { min: 8, max: 12 },
    accessoryRepRange: { min: 10, max: 15 },
    hypertrophyAccessoryRepRange: { min: 10, max: 20 },
    hypertrophyShare: 100,
    strengthShare: 0,
    powerShare: 0,
    volumeEmphasis: "high",
    intensityEmphasis: "moderate",
    dropOffPercent: 18,
    dropOffRange: { min: 15, max: 20 },
    stopRuleNote: "Use rep drop-off to stop before quality turns into junk volume.",
    progressionType: "double_progression",
    progressionDescription: "Complete the exact prescribed targets with acceptable quality, then take the next approved progression step.",
    notes: ["Volume rises when fitness rises.", "The block sets the target. Your performance sets the dose."],
  },
  powerbuilding: {
    name: "Powerbuilding",
    goal: "bridge_strength_hypertrophy",
    durationWeeks: 6,
    repRange: { min: 4, max: 15 },
    mainRepRange: { min: 4, max: 8 },
    secondaryRepRange: { min: 6, max: 10 },
    accessoryRepRange: { min: 8, max: 15 },
    hypertrophyAccessoryRepRange: { min: 8, max: 15 },
    hypertrophyShare: 50,
    strengthShare: 50,
    powerShare: 0,
    volumeEmphasis: "moderate_high",
    intensityEmphasis: "moderate_high",
    dropOffPercent: 12,
    dropOffRange: { min: 10, max: 15 },
    stopRuleNote: "Heavy compounds stay crisp; accessories keep hypertrophy moving.",
    progressionType: "double_progression",
    progressionDescription: "Blend heavier main work with hypertrophy accessory progression.",
    notes: ["50% strength, 50% hypertrophy. Earn the load without starving the muscle work."],
  },
  strength_hypertrophy: {
    name: "Powerbuilding",
    goal: "bridge_strength_hypertrophy",
    durationWeeks: 6,
    repRange: { min: 4, max: 15 },
    mainRepRange: { min: 4, max: 8 },
    secondaryRepRange: { min: 6, max: 10 },
    accessoryRepRange: { min: 8, max: 15 },
    hypertrophyAccessoryRepRange: { min: 8, max: 15 },
    hypertrophyShare: 50,
    strengthShare: 50,
    powerShare: 0,
    volumeEmphasis: "moderate_high",
    intensityEmphasis: "moderate_high",
    dropOffPercent: 12,
    dropOffRange: { min: 10, max: 15 },
    stopRuleNote: "Keep heavier work productive with a tighter performance drop-off.",
    progressionType: "double_progression",
    progressionDescription: "Progress load when reps are earned cleanly across quality sets.",
    notes: ["Build the bridge from muscle to force production."],
  },
  strength: {
    name: "Strength",
    goal: "increase_force_production",
    durationWeeks: 6,
    repRange: { min: 3, max: 15 },
    mainRepRange: { min: 3, max: 5 },
    secondaryRepRange: { min: 5, max: 8 },
    accessoryRepRange: { min: 8, max: 12 },
    hypertrophyAccessoryRepRange: { min: 8, max: 15 },
    hypertrophyShare: 25,
    strengthShare: 75,
    powerShare: 0,
    volumeEmphasis: "moderate",
    intensityEmphasis: "high",
    dropOffPercent: 10,
    dropOffRange: { min: 8, max: 12 },
    stopRuleNote: "Stop sooner because heavy sets get expensive fast.",
    progressionType: "load_progression",
    progressionDescription: "Hold or increase load from completed low-rep performance.",
    notes: ["Turn the new tissue into output."],
  },
  power: {
    name: "Power",
    goal: "rate_of_force_development",
    durationWeeks: 3,
    repRange: { min: 1, max: 12 },
    mainRepRange: { min: 1, max: 3 },
    secondaryRepRange: { min: 3, max: 5 },
    accessoryRepRange: { min: 8, max: 15 },
    hypertrophyAccessoryRepRange: { min: 8, max: 15 },
    hypertrophyShare: 20,
    strengthShare: 50,
    powerShare: 30,
    volumeEmphasis: "low",
    intensityEmphasis: "high",
    dropOffPercent: 0,
    stopRuleNote: "Future bar-speed support will stop work when explosiveness drops.",
    progressionType: "speed_intent",
    progressionDescription: "Keep intent maximal. Do not grind power work.",
    notes: ["Speed first. Fatigue is not the trophy here."],
  },
  peak: {
    name: "Peak",
    goal: "express_strength",
    durationWeeks: 2,
    repRange: { min: 1, max: 2 },
    mainRepRange: { min: 1, max: 2 },
    secondaryRepRange: { min: 3, max: 5 },
    accessoryRepRange: { min: 8, max: 12 },
    hypertrophyAccessoryRepRange: { min: 8, max: 12 },
    hypertrophyShare: 10,
    strengthShare: 80,
    powerShare: 10,
    volumeEmphasis: "very_low",
    intensityEmphasis: "very_high",
    dropOffPercent: 5,
    stopRuleNote: "Express strength with very low volume and very high intent.",
    progressionType: "test_expression",
    progressionDescription: "Week 1 expresses around 90%, week 2 around 95% or test readiness.",
    notes: ["No hero volume. Show the strength, then leave."],
  },
  deload: {
    name: "Deload",
    goal: "restore_performance",
    durationWeeks: 1,
    repRange: { min: 6, max: 10 },
    mainRepRange: { min: 6, max: 10 },
    secondaryRepRange: { min: 8, max: 12 },
    accessoryRepRange: { min: 10, max: 15 },
    hypertrophyAccessoryRepRange: { min: 10, max: 15 },
    hypertrophyShare: 40,
    strengthShare: 60,
    powerShare: 0,
    volumeEmphasis: "low",
    intensityEmphasis: "low_moderate",
    dropOffPercent: 20,
    stopRuleNote: "Keep reps clean and leave plenty in the tank without needing RPE.",
    progressionType: "fatigue_reduction",
    progressionDescription: "Reduce fatigue and restore performance before the next block.",
    notes: ["Deloads are earned by data, not calendar guilt."],
  },
};

export function createTrainingBlock(
  type: BlockType,
  overrides: Partial<TrainingBlock> = {},
  idSuffix = "template",
): TrainingBlock {
  const defaults = blockDefaults[type];
  const durationWeeks = overrides.durationWeeks ?? defaults.durationWeeks;
  const name = overrides.name ?? `${defaults.name} ${durationWeeks} weeks`;

  return {
    id: overrides.id ?? `block-${type}-${idSuffix}`,
    name,
    type,
    goal: overrides.goal ?? defaults.goal,
    durationWeeks,
    currentWeek: overrides.currentWeek ?? 1,
    repRange: overrides.repRange ?? defaults.repRange,
    mainRepRange: overrides.mainRepRange ?? defaults.mainRepRange,
    secondaryRepRange: overrides.secondaryRepRange ?? defaults.secondaryRepRange,
    accessoryRepRange: overrides.accessoryRepRange ?? defaults.accessoryRepRange,
    hypertrophyAccessoryRepRange: overrides.hypertrophyAccessoryRepRange ?? defaults.hypertrophyAccessoryRepRange,
    hypertrophyShare: overrides.hypertrophyShare ?? defaults.hypertrophyShare,
    strengthShare: overrides.strengthShare ?? defaults.strengthShare,
    powerShare: overrides.powerShare ?? defaults.powerShare,
    volumeEmphasis: overrides.volumeEmphasis ?? defaults.volumeEmphasis,
    intensityEmphasis: overrides.intensityEmphasis ?? defaults.intensityEmphasis,
    dropOffRule: overrides.dropOffRule ?? {
      type: type === "power" ? "speed_drop_off" : type === "peak" ? "planned_test" : "rep_drop_off",
      defaultDropOffPercent: defaults.dropOffPercent,
      range: defaults.dropOffRange,
      note: defaults.stopRuleNote,
    },
    progressionRule: overrides.progressionRule ?? {
      type: defaults.progressionType,
      description: defaults.progressionDescription,
    },
    weeks:
      overrides.weeks ??
      Array.from({ length: durationWeeks }, (_, index) => ({
        weekNumber: index + 1,
        focus: getWeekFocus(type, index + 1, durationWeeks),
      })),
    prescriptions: overrides.prescriptions ?? [],
    status: overrides.status ?? "planned",
    startedAt: overrides.startedAt,
    completedAt: overrides.completedAt,
    notes: overrides.notes ?? defaults.notes,
  };
}

export const blockTemplates = [
  createTrainingBlock("hypertrophy", { name: "Hypertrophy 6 weeks", durationWeeks: 6 }),
  createTrainingBlock("powerbuilding", { name: "Powerbuilding 6 weeks", durationWeeks: 6 }),
  createTrainingBlock("strength", { name: "Strength 6 weeks", durationWeeks: 6 }),
  createTrainingBlock("power", { name: "Power 3 weeks", durationWeeks: 3 }),
  createTrainingBlock("peak", { name: "Peak 2 weeks", durationWeeks: 2 }),
  createTrainingBlock("deload", { name: "Deload 1 week", durationWeeks: 1 }),
];

export const naturalLifterAnnualPlan: AnnualPlan = {
  id: "annual-natural-lifter",
  name: "Natural Lifter Annual Plan",
  description: "Hypertrophy, powerbuilding, strength, power, optional peak, then a data-led deload.",
  repeatable: true,
  blocks: [
    createTrainingBlock("hypertrophy", { name: "Hypertrophy 6 weeks", durationWeeks: 6 }),
    createTrainingBlock("powerbuilding", { name: "Powerbuilding 6 weeks", durationWeeks: 6 }),
    createTrainingBlock("strength", { name: "Strength 6 weeks", durationWeeks: 6 }),
    createTrainingBlock("power", { name: "Power 3 weeks", durationWeeks: 3 }),
    createTrainingBlock("peak", { name: "Peak 2 weeks", durationWeeks: 2 }),
    createTrainingBlock("deload", { name: "Deload 1 week", durationWeeks: 1 }),
  ],
};

export function createAnnualPlan(
  plan: AnnualPlan = naturalLifterAnnualPlan,
  startedAt = new Date().toISOString(),
): TrainingYear {
  const yearId = `training-year-${startedAt}`;
  const blocks = plan.blocks.map((block, index) => ({
    ...block,
    id: `${yearId}-block-${index + 1}-${block.type}`,
    currentWeek: 1,
    status: index === 0 ? ("active" as const) : ("planned" as const),
    startedAt: index === 0 ? startedAt : undefined,
    completedAt: undefined,
    weeks: block.weeks.map((week) => ({ ...week })),
  }));

  return {
    id: yearId,
    name: plan.name,
    startedAt,
    currentBlockId: blocks[0]?.id ?? "",
    blocks,
    status: "active",
  };
}

export function getCurrentBlock(year: TrainingYear): TrainingBlock | null {
  return year.blocks.find((block) => block.id === year.currentBlockId) ?? null;
}

export function getCurrentBlockWeek(block: TrainingBlock): TrainingBlock["weeks"][number] | null {
  return block.weeks.find((week) => week.weekNumber === block.currentWeek) ?? null;
}

export function getBlockRepRange(block: Pick<TrainingBlock, "repRange">): RepRange {
  return block.repRange;
}

export function getBlockDropOffPercentage(block: Pick<TrainingBlock, "dropOffRule">): number {
  return block.dropOffRule.defaultDropOffPercent;
}

export function getBlockVolumeEmphasis(block: Pick<TrainingBlock, "volumeEmphasis">): VolumeEmphasis {
  return block.volumeEmphasis;
}

export function advanceBlockWeek(block: TrainingBlock): TrainingBlock {
  if (block.status === "completed") return block;

  if (block.currentWeek >= block.durationWeeks) {
    return { ...block, status: "completed", completedAt: new Date().toISOString() };
  }

  return { ...block, currentWeek: block.currentWeek + 1 };
}

export function completeBlock(year: TrainingYear, completedAt = new Date().toISOString()): TrainingYear {
  const currentIndex = year.blocks.findIndex((block) => block.id === year.currentBlockId);
  if (currentIndex < 0) return year;

  const nextBlocks = year.blocks.map((block, index) => {
    if (index === currentIndex) return { ...block, status: "completed" as const, completedAt };
    if (index === currentIndex + 1) return { ...block, status: "active" as const, startedAt: completedAt, currentWeek: 1 };
    return block;
  });
  const nextBlock = nextBlocks[currentIndex + 1];

  return {
    ...year,
    blocks: nextBlocks,
    currentBlockId: nextBlock?.id ?? year.currentBlockId,
    status: nextBlock ? "active" : "completed",
  };
}

export function recommendNextBlock(block: TrainingBlock): BlockType {
  const index = blockOrder.indexOf(block.type);
  return blockOrder[(index + 1) % blockOrder.length] ?? "hypertrophy";
}

export function calculateEmergentVolumeTrend(snapshots: BlockPerformanceSnapshot[]): {
  qualitySets: number[];
  trend: "rising" | "falling" | "flat" | "insufficient_data";
  change: number;
} {
  if (snapshots.length < 2) return { qualitySets: snapshots.map((snapshot) => snapshot.qualitySets), trend: "insufficient_data", change: 0 };

  const qualitySets = snapshots.map((snapshot) => snapshot.qualitySets);
  const first = qualitySets[0] ?? 0;
  const last = qualitySets[qualitySets.length - 1] ?? 0;
  const change = last - first;
  const trend = change > 0 ? "rising" : change < 0 ? "falling" : "flat";
  return { qualitySets, trend, change };
}

export function detectBestSetDrop(snapshots: BlockPerformanceSnapshot[], dropPercent = 5): DeloadTrigger {
  if (snapshots.length < 3) return inactiveTrigger("best_set_drop", "Not enough best-set history yet.");

  const previousPeak = Math.max(...snapshots.slice(0, -1).map((snapshot) => snapshot.bestSetReps));
  const latest = snapshots[snapshots.length - 1]?.bestSetReps ?? previousPeak;
  const drop = previousPeak > 0 ? ((previousPeak - latest) / previousPeak) * 100 : 0;
  const recentBelowPeak = snapshots.slice(-2).filter((snapshot) => snapshot.bestSetReps <= previousPeak * (1 - dropPercent / 100)).length;
  const active = drop >= dropPercent && recentBelowPeak >= 1;

  return {
    type: "best_set_drop",
    active,
    severity: drop >= 10 ? "high" : active ? "moderate" : "low",
    message: active ? "Best set has dropped across recent sessions." : "Best set is holding.",
    evidence: active ? `${round(drop)}% below recent peak` : undefined,
  };
}

export function detectQualitySetCollapse(snapshots: BlockPerformanceSnapshot[], collapseRatio = 0.7): DeloadTrigger {
  if (snapshots.length < 3) return inactiveTrigger("quality_set_collapse", "Not enough volume history yet.");

  const previous = snapshots.slice(0, -1).map((snapshot) => snapshot.qualitySets);
  const previousAverage = average(previous);
  const latest = snapshots[snapshots.length - 1]?.qualitySets ?? previousAverage;
  const active = previousAverage > 0 && latest <= previousAverage * collapseRatio;

  return {
    type: "quality_set_collapse",
    active,
    severity: active && latest <= previousAverage * 0.55 ? "high" : active ? "moderate" : "low",
    message: active ? "Quality sets have collapsed below the recent baseline." : "Quality set volume is intact.",
    evidence: active ? `${latest} quality sets vs ${round(previousAverage)} normal` : undefined,
  };
}

export function detectRepeatedEarlyDropOffs(snapshots: BlockPerformanceSnapshot[], minimumCount = 2): DeloadTrigger {
  if (snapshots.length < 2) return inactiveTrigger("repeated_early_drop_offs", "Not enough shutdown history yet.");

  const recent = snapshots.slice(-3);
  const count = recent.filter((snapshot) => snapshot.earlyDropOff || snapshot.stoppedByDropOff).length;
  const active = count >= minimumCount;

  return {
    type: "repeated_early_drop_offs",
    active,
    severity: count >= 3 ? "high" : active ? "moderate" : "low",
    message: active ? "Repeated early drop-offs are showing fatigue pressure." : "Drop-offs are not clustering.",
    evidence: active ? `${count} of last ${recent.length} sessions` : undefined,
  };
}

export function detectWorseningPerformanceTrend(snapshots: BlockPerformanceSnapshot[]): DeloadTrigger {
  if (snapshots.length < 3) return inactiveTrigger("worsening_performance_trend", "Not enough trend data yet.");

  const recent = snapshots.slice(-3).map((snapshot) => snapshot.bestSetReps);
  const active = recent[2] < recent[1] && recent[1] < recent[0];

  return {
    type: "worsening_performance_trend",
    active,
    severity: active ? "moderate" : "low",
    message: active ? "Best-set trend is moving the wrong way." : "Performance trend is stable enough.",
    evidence: active ? recent.join(" → ") : undefined,
  };
}

export function recommendBlockAction(snapshots: BlockPerformanceSnapshot[]): BlockRecommendation {
  const triggers = [
    detectBestSetDrop(snapshots),
    detectQualitySetCollapse(snapshots),
    detectRepeatedEarlyDropOffs(snapshots),
    detectWorseningPerformanceTrend(snapshots),
  ];
  const activeTriggers = triggers.filter((trigger) => trigger.active);

  if (activeTriggers.length >= 3) {
    return {
      action: "end_block_early",
      triggers,
      nextBlockType: "deload",
      message: "Multiple fatigue signals align. End the block early and deload.",
    };
  }

  if (activeTriggers.length >= 2) {
    return {
      action: "deload_next_week",
      triggers,
      nextBlockType: "deload",
      message: "Two fatigue signals align. Deload next week.",
    };
  }

  const single = activeTriggers[0];
  if (single?.type === "best_set_drop") {
    return { action: "reduce_load", triggers, message: "One weak signal. Reduce load slightly or hold course before deloading." };
  }
  if (single?.type === "quality_set_collapse" || single?.type === "repeated_early_drop_offs") {
    return { action: "reduce_volume", triggers, message: "One weak signal. Trim volume and watch the next session." };
  }

  return {
    action: "continue_block",
    triggers,
    message: "No meaningful fatigue cluster. Keep the block moving.",
  };
}

function inactiveTrigger(type: DeloadTrigger["type"], message: string): DeloadTrigger {
  return { type, active: false, severity: "low", message };
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((total, value) => total + value, 0) / values.length;
}

function round(value: number): number {
  return Math.round(value * 10) / 10;
}

function getWeekFocus(type: BlockType, week: number, durationWeeks: number): string {
  if (type === "peak") return week === durationWeeks ? "Test readiness" : "Express strength";
  if (type === "deload") return "Restore performance";
  if (type === "power") return "Maximum speed intent";
  return week === durationWeeks ? "Consolidate performance" : "Let volume emerge from quality sets";
}
