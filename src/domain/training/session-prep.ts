import { getMovementGuide, type MovementGuide } from "@/domain/training/prep-capacity-guides";

export type SessionPrepWorkoutType = "push" | "pull" | "legs" | "upper" | "lower" | "full_body" | "arms" | "custom";

export type SessionPrepStatus = "completed" | "skipped";

export type SessionPrepFocus =
  | "bench"
  | "overhead_press"
  | "squat"
  | "hinge"
  | "row"
  | "pullup"
  | "lower"
  | "full_body"
  | "upper"
  | "arms";

export type SessionPrepStation =
  | "floor"
  | "band"
  | "bench"
  | "dumbbell"
  | "rack_platform"
  | "cable"
  | "pullup_station"
  | "machine";

export interface SessionPrepExercise {
  name: string;
  dose: string;
  purpose: string;
  guide: MovementGuide;
  subtitle?: string;
  guidance?: string;
  movements?: SessionPrepMovement[];
}

export interface SessionPrepMovement {
  name: string;
  prescription: string;
}

export interface SessionPrepRoutine {
  id: string;
  name: string;
  workoutType: SessionPrepWorkoutType;
  purpose: string;
  estimatedMinutes: number;
  exercises: SessionPrepExercise[];
  safetyCopy: string[];
  focus?: SessionPrepFocus;
  setupLabel?: string;
  stationCluster?: string;
  stationCount?: number;
}

export interface SessionPrepRecord {
  id: string;
  routineId: string;
  workoutType: SessionPrepWorkoutType;
  workoutName?: string;
  status: SessionPrepStatus;
  durationMinutes: number;
  createdAt: string;
  completedAt?: string;
  skippedAt?: string;
}

export interface SessionPrepOverview {
  routine: SessionPrepRoutine;
  status: "not_started" | SessionPrepStatus;
  title: string;
  message: string;
  primaryAction: "start" | "view";
  secondaryAction?: "skip";
}

export interface SessionPrepContext {
  workoutNameOrType?: string | null;
  workoutName?: string | null;
  workoutType?: string | null;
  firstExerciseName?: string | null;
  firstMovementPattern?: string | null;
}

export const trainingPreparationSafetyCopy = [
  "This is training preparation and capacity work.",
  "Not medical advice.",
  "Stop exercises that cause pain.",
  "If symptoms are severe, worsening, radiating, or associated with weakness/numbness, seek qualified medical advice.",
];

export const sessionPrepPrimerPool = [
  "Kettlebell Swing",
  "Medicine Ball Chest Pass",
  "Medicine Ball Slam",
  "Broad Jump",
  "Box Jump",
] as const;

export const universalCoreBracingPool = [
  "Side Plank",
  "McGill Curl-Up",
  "Dead Bug",
  "Bird Dog",
  "Front Plank",
  "Pallof Press",
] as const;

const corePrepByFocus: Record<SessionPrepFocus, SessionPrepExercise> = {
  bench: prepExercise("Dead Bug", "1 x 5-8 each side", "Set ribs, pelvis and trunk position before pressing."),
  overhead_press: prepExercise("Front Plank", "1 x 15-25 sec", "Set trunk stiffness before overhead work."),
  squat: prepExercise("Side Plank", "1 x 10-20 sec each side", "Set lateral trunk control before squatting."),
  hinge: prepExercise("Bird Dog", "1 x 5 each side", "Set trunk control for the hinge."),
  row: prepExercise("Bird Dog", "1 x 5 each side", "Set trunk and hip position before pulling."),
  pullup: prepExercise("Dead Bug", "1 x 5-8 each side", "Set rib position before vertical pulling."),
  lower: prepExercise("McGill Curl-Up", "1 x 5 controlled reps", "Set trunk control before lower-body work."),
  full_body: prepExercise("Dead Bug", "1 x 5-8 each side", "Set whole-body bracing before mixed training."),
  upper: prepExercise("Dead Bug", "1 x 5-8 each side", "Set rib position before upper-body work."),
  arms: prepExercise("Front Plank", "1 x 15-25 sec", "Keep shoulder and trunk position organised before arm work."),
};

const benchPrepPool = [
  prepExercise("Band Pull Apart", "1 x 15-25", "Prepare scapular control."),
  prepExercise("Pullover", "1 x 8-10 easy reps", "Open the press position without fatigue."),
  prepExercise("Cuban Press", "1 x 8 controlled reps", "Prime shoulder rotation."),
  prepExercise("Push Up", "1 x 8-12 easy reps", "Rehearse the pressing pattern."),
  prepExercise("Band Face Pull", "1 x 12-20", "Prepare upper-back and shoulder position."),
];

const overheadPressPrepPool = [
  prepExercise("Trap 3 Raise", "1 x 8-12", "Prepare upward rotation and lower-trap control."),
  prepExercise("Scap Push Up", "1 x 8-12", "Wake up controlled shoulder blade motion."),
  prepExercise("External Rotation", "1 x 10-15 each side", "Prime cuff control."),
  prepExercise("Wall Slide", "1 x 8-10", "Rehearse overhead mechanics."),
];

const squatPrepPool = [
  prepExercise("Deep Squat Hold", "1 x 20-30 sec", "Own the bottom position."),
  prepExercise("Single Leg Glute Bridge", "1 x 6-8 each side", "Prime hip extension and pelvic control."),
  prepExercise("Loaded Butterfly", "1 x 20-30 sec", "Prepare adductor range."),
  prepExercise("Couch Stretch", "1 x 20-30 sec each side", "Open hip extension without forcing it."),
  prepExercise("Tibialis Raise", "1 x 12-20", "Prepare the front of the lower leg."),
  prepExercise("Deep Calf Raise", "1 x 8-12", "Prepare ankle range and calf control."),
  prepExercise("Reverse Step Up", "1 x 6-8 each side", "Prepare knee tracking and single-leg control."),
  prepExercise("Hip Flexor Kick Out", "1 x 8 each side", "Improve active hip flexor control for lower-body training."),
  prepExercise("Full Range Split Squat", "1 x 5-8 each side", "Prepare deep lower-body control."),
  prepExercise("Goblet Squat", "1 x 8-12 easy reps", "Rehearse the squat pattern."),
];

const hingePrepPool = [
  prepExercise("Bird Dog", "1 x 5 each side", "Set trunk control for hip extension."),
  prepExercise("Back Extension", "1 x 10-15 easy reps", "Prepare posterior-chain position."),
  prepExercise("Reverse Hyper", "1 x 10-15 easy reps", "Prepare glutes and hip extension."),
  prepExercise("Single Leg Glute Bridge", "1 x 6-8 each side", "Prime unilateral hip control."),
  prepExercise("Active Hang", "1 x 10-20 sec", "Decompress and organise upper-body tension."),
  prepExercise("Pigeon Strength", "1 x 5-8 each side", "Prepare controlled outer-hip range."),
  prepExercise("Outer Hip Circuit", "1 x 8-12 each side", "Wake up lateral hip control."),
];

const rowPrepPool = [
  prepExercise("Back Extension", "1 x 10-15 easy reps", "Prepare trunk position for pulling."),
  prepExercise("Active Hang", "1 x 10-20 sec", "Prepare shoulder and grip position."),
  prepExercise("Trap 3 Raise", "1 x 8-12", "Set shoulder blade position."),
  prepExercise("Band Pull Apart", "1 x 15-25", "Prepare upper-back control."),
  prepExercise("Pullover", "1 x 8-10 easy reps", "Feel the lat path."),
  prepExercise("Straight Arm Band Pulldown", "1 x 12-15", "Prime shoulder extension and lats."),
];

const pullupPrepPool = [
  prepExercise("Cuban Press", "1 x 8 controlled reps", "Prime shoulder rotation."),
  prepExercise("Scapular Pull Up", "1 x 5-8", "Rehearse shoulder blade depression."),
  prepExercise("Scapular Pull Down", "1 x 8-10", "Prepare vertical-pull mechanics."),
  prepExercise("Dead Bug", "1 x 5-8 each side", "Set rib position for vertical pulling."),
  prepExercise("Bird Dog", "1 x 5 each side", "Set trunk control before pulling."),
  prepExercise("Pullover", "1 x 8-10 easy reps", "Prepare the lat path."),
  prepExercise("Active Hang", "1 x 10-20 sec", "Prepare grip and shoulder position."),
];

const lowerBodyPrepPool = [
  prepExercise("Cat-Camel", "5 easy reps", "Move gently before bracing."),
  prepExercise("Deep Squat Hold", "1 x 20-30 sec", "Prepare comfortable lower-body range."),
  prepExercise("Reverse Step Up", "1 x 6-8 each side", "Prepare knee control."),
  prepExercise("Hip Flexor Kick Out", "1 x 8 each side", "Improve active hip flexor control for lower-body training."),
  prepExercise("Full Range Split Squat", "1 x 5-8 each side", "Prepare single-leg range."),
  prepExercise("Single Leg Glute Bridge", "1 x 6-8 each side", "Prime hip extension."),
  prepExercise("Active Hang", "1 x 10-20 sec", "Organise trunk and upper-body tension."),
  prepExercise("Goblet Squat", "1 x 8-12 easy reps", "Rehearse lower-body positions."),
];

const focusConfig: Record<SessionPrepFocus, {
  name: string;
  purpose: string;
  pool: SessionPrepExercise[];
  defaults: string[];
  estimatedMinutes: number;
}> = {
  bench: {
    name: "Bench Prep",
    purpose: "Prepare bracing, scapular control and pressing mechanics.",
    pool: benchPrepPool,
    defaults: ["Band Pull Apart", "Cuban Press", "Band Face Pull", "Push Up"],
    estimatedMinutes: 5,
  },
  overhead_press: {
    name: "Overhead Press Prep",
    purpose: "Prepare trunk position, cuff control and overhead mechanics.",
    pool: overheadPressPrepPool,
    defaults: ["Trap 3 Raise", "External Rotation", "Wall Slide", "Scap Push Up"],
    estimatedMinutes: 5,
  },
  squat: {
    name: "Squat Prep",
    purpose: "Prepare bracing, hips, knees, ankles and squat positions.",
    pool: squatPrepPool,
    defaults: ["Deep Squat Hold", "Hip Flexor Kick Out", "Reverse Step Up", "Goblet Squat"],
    estimatedMinutes: 6,
  },
  hinge: {
    name: "Deadlift Prep",
    purpose: "Prepare trunk control, hip extension and hinge positions.",
    pool: hingePrepPool,
    defaults: ["Back Extension", "Single Leg Glute Bridge", "Active Hang", "Outer Hip Circuit"],
    estimatedMinutes: 6,
  },
  row: {
    name: "Pull Prep",
    purpose: "Prepare trunk position, upper back and rowing mechanics.",
    pool: rowPrepPool,
    defaults: ["Back Extension", "Trap 3 Raise", "Band Pull Apart", "Straight Arm Band Pulldown"],
    estimatedMinutes: 5,
  },
  pullup: {
    name: "Pull-Up Prep",
    purpose: "Prepare bracing, shoulder position and vertical-pull mechanics.",
    pool: pullupPrepPool,
    defaults: ["Scapular Pull Down", "Pullover", "Active Hang"],
    estimatedMinutes: 5,
  },
  lower: {
    name: "Lower Prep",
    purpose: "Prepare bracing, hips, knees and lower-body positions.",
    pool: lowerBodyPrepPool,
    defaults: ["Cat-Camel", "Deep Squat Hold", "Reverse Step Up", "Goblet Squat"],
    estimatedMinutes: 6,
  },
  full_body: {
    name: "Full Body Prep",
    purpose: "Prepare bracing plus one relevant upper and lower pattern.",
    pool: [...benchPrepPool, ...rowPrepPool, ...lowerBodyPrepPool],
    defaults: ["Band Pull Apart", "Goblet Squat", "Pullover", "Reverse Step Up"],
    estimatedMinutes: 6,
  },
  upper: {
    name: "Upper Prep",
    purpose: "Prepare bracing, shoulders and upper-body positions.",
    pool: [...benchPrepPool, ...overheadPressPrepPool, ...rowPrepPool],
    defaults: ["Band Pull Apart", "External Rotation", "Trap 3 Raise", "Pullover"],
    estimatedMinutes: 5,
  },
  arms: {
    name: "Arms Prep",
    purpose: "Prepare bracing, shoulders and elbow-friendly upper-body positions.",
    pool: [...benchPrepPool, ...rowPrepPool],
    defaults: ["Band Pull Apart", "Pullover", "Band Face Pull"],
    estimatedMinutes: 4,
  },
};

type PrepExerciseLogistics = {
  equipmentTags: string[];
  stations: SessionPrepStation[];
};

type PrepClusterConfig = {
  id: string;
  setupLabel: string;
  preferredStations: SessionPrepStation[];
  allowedStations: SessionPrepStation[];
  lowFrictionStations: SessionPrepStation[];
  defaults: Partial<Record<SessionPrepFocus, string[]>>;
};

const lowFrictionDefaultStations: SessionPrepStation[] = ["floor", "band"];

const prepExerciseLogistics: Record<string, PrepExerciseLogistics> = {
  "Active Hang": { equipmentTags: ["bodyweight", "pull-up station"], stations: ["pullup_station"] },
  "Back Extension": { equipmentTags: ["machine", "bench"], stations: ["machine"] },
  "Band Face Pull": { equipmentTags: ["band"], stations: ["band"] },
  "Band Pull Apart": { equipmentTags: ["band"], stations: ["band"] },
  "Bird Dog": { equipmentTags: ["bodyweight", "floor"], stations: ["floor"] },
  "Cat-Camel": { equipmentTags: ["bodyweight", "floor"], stations: ["floor"] },
  "Couch Stretch": { equipmentTags: ["bench", "floor"], stations: ["bench", "floor"] },
  "Cuban Press": { equipmentTags: ["dumbbell", "bodyweight"], stations: ["dumbbell", "floor"] },
  "Dead Bug": { equipmentTags: ["bodyweight", "floor"], stations: ["floor"] },
  "Deep Calf Raise": { equipmentTags: ["bodyweight", "rack"], stations: ["rack_platform", "floor"] },
  "Deep Squat Hold": { equipmentTags: ["bodyweight", "rack"], stations: ["rack_platform", "floor"] },
  "External Rotation": { equipmentTags: ["band", "cable"], stations: ["band", "cable"] },
  "Front Plank": { equipmentTags: ["bodyweight", "floor"], stations: ["floor"] },
  "Full Range Split Squat": { equipmentTags: ["bodyweight", "dumbbell optional"], stations: ["floor", "rack_platform"] },
  "Goblet Squat": { equipmentTags: ["dumbbell", "kettlebell"], stations: ["dumbbell"] },
  "Hip Flexor Kick Out": { equipmentTags: ["bodyweight", "rack optional", "bench optional"], stations: ["rack_platform", "bench"] },
  "Loaded Butterfly": { equipmentTags: ["bodyweight", "floor", "dumbbell optional"], stations: ["floor", "dumbbell"] },
  "McGill Curl-Up": { equipmentTags: ["bodyweight", "floor"], stations: ["floor"] },
  "Outer Hip Circuit": { equipmentTags: ["bodyweight", "band optional", "floor"], stations: ["floor", "band"] },
  "Pallof Press": { equipmentTags: ["band", "cable"], stations: ["band", "cable"] },
  "Pigeon Strength": { equipmentTags: ["bodyweight", "floor"], stations: ["floor"] },
  "Pullover": { equipmentTags: ["band", "dumbbell", "bench"], stations: ["band", "dumbbell", "bench"] },
  "Push Up": { equipmentTags: ["bodyweight", "bench optional", "rack optional"], stations: ["floor", "bench", "rack_platform"] },
  "Reverse Hyper": { equipmentTags: ["machine"], stations: ["machine"] },
  "Reverse Step Up": { equipmentTags: ["bench", "box", "bodyweight"], stations: ["bench", "rack_platform"] },
  "Scap Push Up": { equipmentTags: ["bodyweight", "floor", "rack optional"], stations: ["floor", "rack_platform"] },
  "Scapular Pull Down": { equipmentTags: ["cable", "band"], stations: ["cable", "band"] },
  "Scapular Pull Up": { equipmentTags: ["bodyweight", "pull-up station"], stations: ["pullup_station"] },
  "Side Plank": { equipmentTags: ["bodyweight", "floor"], stations: ["floor"] },
  "Single Leg Glute Bridge": { equipmentTags: ["bodyweight", "floor"], stations: ["floor"] },
  "Straight Arm Band Pulldown": { equipmentTags: ["band", "cable"], stations: ["band", "cable"] },
  "Tibialis Raise": { equipmentTags: ["bodyweight", "rack"], stations: ["rack_platform", "floor"] },
  "Trap 3 Raise": { equipmentTags: ["bodyweight", "dumbbell optional", "bench optional"], stations: ["floor", "dumbbell", "bench"] },
  "Wall Slide": { equipmentTags: ["bodyweight", "wall", "rack"], stations: ["rack_platform", "floor"] },
};

const prepClusterConfigs: Record<string, PrepClusterConfig> = {
  bench_bodyweight_band: {
    id: "bench_bodyweight_band",
    setupLabel: "Bench + bodyweight + band",
    preferredStations: ["bench", "floor", "band"],
    allowedStations: ["bench", "floor", "band", "rack_platform"],
    lowFrictionStations: ["floor", "band", "bench", "rack_platform"],
    defaults: {
      bench: ["Band Pull Apart", "Band Face Pull", "Push Up", "Cuban Press"],
      upper: ["Band Pull Apart", "Push Up", "Band Face Pull", "Pullover"],
      arms: ["Band Pull Apart", "Band Face Pull", "Pullover"],
    },
  },
  rack_floor_band: {
    id: "rack_floor_band",
    setupLabel: "Rack + floor + band",
    preferredStations: ["rack_platform", "floor", "band"],
    allowedStations: ["rack_platform", "floor", "band", "dumbbell"],
    lowFrictionStations: ["floor", "band", "rack_platform"],
    defaults: {
      overhead_press: ["Wall Slide", "External Rotation", "Scap Push Up", "Trap 3 Raise"],
      squat: ["Deep Squat Hold", "Hip Flexor Kick Out", "Full Range Split Squat", "Goblet Squat"],
      lower: ["Cat-Camel", "Deep Squat Hold", "Full Range Split Squat", "Goblet Squat"],
      full_body: ["Band Pull Apart", "Push Up", "Full Range Split Squat", "Deep Squat Hold"],
    },
  },
  platform_floor_band: {
    id: "platform_floor_band",
    setupLabel: "Platform + floor + band",
    preferredStations: ["rack_platform", "floor", "band"],
    allowedStations: ["rack_platform", "floor", "band"],
    lowFrictionStations: ["floor", "band", "rack_platform"],
    defaults: {
      hinge: ["Single Leg Glute Bridge", "Outer Hip Circuit", "Pigeon Strength", "Back Extension"],
      row: ["Band Pull Apart", "Straight Arm Band Pulldown", "Trap 3 Raise", "Pullover"],
    },
  },
  cable_bodyweight: {
    id: "cable_bodyweight",
    setupLabel: "Cable + bodyweight",
    preferredStations: ["cable", "floor", "band"],
    allowedStations: ["cable", "floor", "band"],
    lowFrictionStations: ["floor", "band", "cable"],
    defaults: {
      row: ["Straight Arm Band Pulldown", "Band Pull Apart", "Pullover", "Trap 3 Raise"],
      pullup: ["Scapular Pull Down", "Pullover", "Cuban Press"],
      bench: ["Band Face Pull", "Band Pull Apart", "Pullover", "Push Up"],
      overhead_press: ["External Rotation", "Wall Slide", "Scap Push Up"],
      arms: ["Band Pull Apart", "Pullover", "Band Face Pull"],
    },
  },
  pullup_floor_band: {
    id: "pullup_floor_band",
    setupLabel: "Pull-up station + floor",
    preferredStations: ["pullup_station", "floor", "band"],
    allowedStations: ["pullup_station", "floor", "band"],
    lowFrictionStations: ["floor", "band", "pullup_station"],
    defaults: {
      pullup: ["Scapular Pull Up", "Active Hang", "Pullover", "Cuban Press"],
      row: ["Active Hang", "Band Pull Apart", "Straight Arm Band Pulldown", "Trap 3 Raise"],
      full_body: ["Active Hang", "Push Up", "Full Range Split Squat"],
    },
  },
  machine_bodyweight: {
    id: "machine_bodyweight",
    setupLabel: "Machine + floor",
    preferredStations: ["machine", "floor", "band"],
    allowedStations: ["machine", "floor", "band"],
    lowFrictionStations: ["floor", "band", "machine"],
    defaults: {
      hinge: ["Back Extension", "Single Leg Glute Bridge", "Outer Hip Circuit"],
      row: ["Back Extension", "Band Pull Apart", "Straight Arm Band Pulldown"],
      lower: ["Cat-Camel", "Single Leg Glute Bridge", "Deep Squat Hold"],
    },
  },
  bodyweight_floor_band: {
    id: "bodyweight_floor_band",
    setupLabel: "Floor + band",
    preferredStations: ["floor", "band"],
    allowedStations: ["floor", "band", "rack_platform", "bench"],
    lowFrictionStations: ["floor", "band", "rack_platform", "bench"],
    defaults: {
      full_body: ["Band Pull Apart", "Push Up", "Full Range Split Squat", "Deep Squat Hold"],
      lower: ["Cat-Camel", "Deep Squat Hold", "Full Range Split Squat", "Single Leg Glute Bridge"],
      upper: ["Band Pull Apart", "External Rotation", "Scap Push Up", "Wall Slide"],
      arms: ["Band Pull Apart", "Band Face Pull", "Pullover"],
    },
  },
};

export function listSessionPrepRoutines(): SessionPrepRoutine[] {
  const types: SessionPrepWorkoutType[] = ["push", "pull", "legs", "upper", "lower", "full_body", "arms", "custom"];
  return types.map((type) => getSessionPrepRoutine(type));
}

export function getSessionPrepRoutine(input?: string | SessionPrepContext | null): SessionPrepRoutine {
  const context = typeof input === "object" && input !== null ? input : { workoutNameOrType: input };
  const workoutType = inferSessionPrepWorkoutType(context.workoutType ?? context.workoutNameOrType ?? context.workoutName);
  const focus = resolveSessionPrepFocus({
    workoutType,
    firstExerciseName: context.firstExerciseName,
    firstMovementPattern: context.firstMovementPattern,
  });
  const config = focusConfig[focus];
  const core = corePrepByFocus[focus];
  const cluster = resolveSessionPrepCluster({
    workoutType,
    focus,
    firstExerciseName: context.firstExerciseName,
    firstMovementPattern: context.firstMovementPattern,
  });
  const specificExercises = selectSpecificPrepExercises(config, focus, cluster);
  const exercises = dedupeExercises([core, ...specificExercises]).slice(0, 5);
  const stationCount = countRoutineStations(exercises, cluster);

  return {
    id: `prep-${workoutType}-${focus}`,
    name: config.name,
    workoutType,
    purpose: config.purpose,
    estimatedMinutes: config.estimatedMinutes,
    exercises,
    safetyCopy: trainingPreparationSafetyCopy,
    focus,
    setupLabel: cluster.setupLabel,
    stationCluster: cluster.id,
    stationCount,
  };
}

export function resolveSessionPrepFocus(input: {
  workoutType: SessionPrepWorkoutType;
  firstExerciseName?: string | null;
  firstMovementPattern?: string | null;
}): SessionPrepFocus {
  const firstLift = normalizePrepText(`${input.firstExerciseName ?? ""} ${input.firstMovementPattern ?? ""}`);

  if (matchesAny(firstLift, ["pull up", "pullup", "chin up", "chinup", "pulldown", "lat pulldown"])) return "pullup";
  if (matchesAny(firstLift, ["overhead press", "shoulder press", "military press", "standing barbell overhead", "arnold press"])) return "overhead_press";
  if (matchesAny(firstLift, ["bench", "chest press", "floor press", "push up", "pushup", "horizontal press"])) return "bench";
  if (matchesAny(firstLift, ["deadlift", "romanian", "rdl", "hinge", "good morning", "hip thrust", "glute bridge", "back extension"])) return "hinge";
  if (matchesAny(firstLift, ["squat", "leg press", "hack", "lunge", "split squat", "step up", "quad"])) return "squat";
  if (matchesAny(firstLift, ["row", "seal row", "chest supported row", "t bar", "horizontal pull"])) return "row";

  switch (input.workoutType) {
    case "push":
      return "bench";
    case "pull":
      return "row";
    case "legs":
    case "lower":
      return "lower";
    case "upper":
      return "upper";
    case "full_body":
      return "full_body";
    case "arms":
      return "arms";
    case "custom":
    default:
      return "full_body";
  }
}

export function inferSessionPrepWorkoutType(value?: string | null): SessionPrepWorkoutType {
  const normalized = String(value ?? "").toLowerCase().replaceAll("-", "_").replaceAll(" ", "_");
  if (normalized.includes("full_body")) return "full_body";
  if (normalized.includes("push")) return "push";
  if (normalized.includes("pull")) return "pull";
  if (normalized.includes("legs") || normalized.includes("leg")) return "legs";
  if (normalized.includes("upper")) return "upper";
  if (normalized.includes("lower")) return "lower";
  if (normalized.includes("arms") || normalized.includes("arm")) return "arms";
  return "custom";
}

export function buildSessionPrepRecord(input: {
  routine: SessionPrepRoutine;
  workoutName?: string;
  status: SessionPrepStatus;
  now?: Date;
}): SessionPrepRecord {
  const now = input.now ?? new Date();
  const timestamp = now.toISOString();
  return {
    id: `prep-${input.routine.id}-${now.getTime()}`,
    routineId: input.routine.id,
    workoutType: input.routine.workoutType,
    workoutName: input.workoutName,
    status: input.status,
    durationMinutes: input.routine.estimatedMinutes,
    createdAt: timestamp,
    completedAt: input.status === "completed" ? timestamp : undefined,
    skippedAt: input.status === "skipped" ? timestamp : undefined,
  };
}

export function getLatestSessionPrepRecord(
  records: SessionPrepRecord[],
  input: { workoutName?: string | null; workoutType?: string | null; firstExerciseName?: string | null },
): SessionPrepRecord | null {
  const routine = getSessionPrepRoutine({
    workoutType: input.workoutType,
    workoutName: input.workoutName,
    firstExerciseName: input.firstExerciseName,
  });
  const normalizedWorkoutName = normalizePrepKey(input.workoutName);
  const matches = records
    .filter((record) => {
      if (record.routineId === routine.id || record.workoutType === routine.workoutType) return true;
      if (!normalizedWorkoutName) return false;
      return normalizePrepKey(record.workoutName) === normalizedWorkoutName;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return matches[0] ?? null;
}

export function buildSessionPrepOverview(input: {
  records: SessionPrepRecord[];
  workoutName?: string | null;
  workoutType?: string | null;
  firstExerciseName?: string | null;
  firstMovementPattern?: string | null;
}): SessionPrepOverview {
  const routine = getSessionPrepRoutine({
    workoutName: input.workoutName,
    workoutType: input.workoutType,
    firstExerciseName: input.firstExerciseName,
    firstMovementPattern: input.firstMovementPattern,
  });
  const latest = getLatestSessionPrepRecord(input.records, input);

  if (latest?.status === "completed") {
    return {
      routine,
      status: "completed",
      title: "Prep completed",
      message: `${routine.name} is done. Start the session when you are ready.`,
      primaryAction: "view",
    };
  }

  if (latest?.status === "skipped") {
    return {
      routine,
      status: "skipped",
      title: "Prep skipped",
      message: "Workout is still ready. You can view the prep if you want it.",
      primaryAction: "view",
    };
  }

  return {
    routine,
    status: "not_started",
    title: "Session Prep",
    message: `${routine.name} is recommended before this workout. Optional, low fatigue, and not counted toward progression.`,
    primaryAction: "start",
    secondaryAction: "skip",
  };
}

function prepExercise(name: string, dose: string, purpose: string): SessionPrepExercise {
  return {
    name,
    dose,
    purpose,
    guide: getMovementGuide(name),
  };
}

export function getSessionPrepExerciseLogistics(name: string): PrepExerciseLogistics {
  return prepExerciseLogistics[name] ?? { equipmentTags: ["bodyweight"], stations: ["floor"] };
}

export function listSessionPrepStations(routine: SessionPrepRoutine): SessionPrepStation[] {
  const cluster = routine.stationCluster ? prepClusterConfigs[routine.stationCluster] : undefined;
  const stations = new Set<SessionPrepStation>();
  routine.exercises.forEach((exercise) => {
    pickStationsForExercise(exercise.name, cluster).forEach((station) => stations.add(station));
  });
  return Array.from(stations);
}

export function countSessionPrepStations(routine: SessionPrepRoutine): number {
  const cluster = routine.stationCluster ? prepClusterConfigs[routine.stationCluster] : undefined;
  return countRoutineStations(routine.exercises, cluster);
}

function selectSpecificPrepExercises(
  config: (typeof focusConfig)[SessionPrepFocus],
  focus: SessionPrepFocus,
  cluster: PrepClusterConfig,
): SessionPrepExercise[] {
  const poolByName = new Map(config.pool.map((exercise) => [exercise.name, exercise]));
  const orderedNames = cluster.defaults[focus] ?? config.defaults;
  const selected = orderedNames.flatMap((name) => {
    const exercise = poolByName.get(name);
    if (!exercise) return [];
    return exerciseFitsCluster(exercise.name, cluster) ? [exercise] : [];
  });
  if (selected.length >= 3) {
    return selected.slice(0, 4);
  }
  const fallbackSelected = config.pool
    .filter((exercise) => !selected.some((candidate) => normalizePrepText(candidate.name) === normalizePrepText(exercise.name)))
    .filter((exercise) => exerciseFitsCluster(exercise.name, cluster))
    .sort((a, b) => scoreExerciseForCluster(b.name, cluster) - scoreExerciseForCluster(a.name, cluster));
  const enoughSpecificWork = [...selected, ...fallbackSelected].slice(0, focus === "full_body" ? 4 : 4);

  return enoughSpecificWork;
}

function resolveSessionPrepCluster(input: {
  workoutType: SessionPrepWorkoutType;
  focus: SessionPrepFocus;
  firstExerciseName?: string | null;
  firstMovementPattern?: string | null;
}): PrepClusterConfig {
  const firstLift = normalizePrepText(`${input.firstExerciseName ?? ""} ${input.firstMovementPattern ?? ""}`);

  if (matchesAny(firstLift, ["cable row", "cable pulldown", "lat pulldown", "pulldown", "cable", "machine row"])) return prepClusterConfigs.cable_bodyweight;
  if (matchesAny(firstLift, ["pull up", "pullup", "chin up", "chinup"])) return prepClusterConfigs.pullup_floor_band;
  if (matchesAny(firstLift, ["machine", "back extension", "reverse hyper"])) return prepClusterConfigs.machine_bodyweight;

  switch (input.focus) {
    case "bench":
      return prepClusterConfigs.bench_bodyweight_band;
    case "overhead_press":
    case "squat":
      return prepClusterConfigs.rack_floor_band;
    case "hinge":
      return prepClusterConfigs.platform_floor_band;
    case "row":
      return prepClusterConfigs.platform_floor_band;
    case "pullup":
      return prepClusterConfigs.pullup_floor_band;
    case "lower":
      return prepClusterConfigs.rack_floor_band;
    case "full_body":
      return input.workoutType === "full_body" ? prepClusterConfigs.bodyweight_floor_band : prepClusterConfigs.rack_floor_band;
    case "upper":
      return prepClusterConfigs.bodyweight_floor_band;
    case "arms":
      return prepClusterConfigs.bodyweight_floor_band;
    default:
      return prepClusterConfigs.bodyweight_floor_band;
  }
}

function exerciseFitsCluster(name: string, cluster: PrepClusterConfig): boolean {
  const logistics = getSessionPrepExerciseLogistics(name);
  return logistics.stations.some((station) => cluster.allowedStations.includes(station) || cluster.lowFrictionStations.includes(station));
}

function scoreExerciseForCluster(name: string, cluster: PrepClusterConfig): number {
  const logistics = getSessionPrepExerciseLogistics(name);
  return logistics.stations.reduce((score, station) => {
    if (cluster.preferredStations.includes(station)) return score + 4;
    if (cluster.lowFrictionStations.includes(station)) return score + 2;
    if (cluster.allowedStations.includes(station)) return score + 1;
    return score - 3;
  }, 0);
}

function countRoutineStations(exercises: SessionPrepExercise[], cluster?: PrepClusterConfig): number {
  const stations = new Set<SessionPrepStation>();
  exercises.forEach((exercise) => {
    pickStationsForExercise(exercise.name, cluster).forEach((station) => {
      if (!lowFrictionDefaultStations.includes(station)) stations.add(station);
    });
  });
  return stations.size;
}

function pickStationsForExercise(name: string, cluster?: PrepClusterConfig): SessionPrepStation[] {
  const stations = getSessionPrepExerciseLogistics(name).stations;
  if (!cluster) return stations;
  const preferred = cluster.preferredStations.find((station) => stations.includes(station));
  if (preferred) return [preferred];
  const lowFriction = cluster.lowFrictionStations.find((station) => stations.includes(station));
  if (lowFriction) return [lowFriction];
  const allowed = cluster.allowedStations.find((station) => stations.includes(station));
  if (allowed) return [allowed];
  return stations.slice(0, 1);
}

function dedupeExercises(exercises: SessionPrepExercise[]): SessionPrepExercise[] {
  const seen = new Set<string>();
  return exercises.filter((exercise) => {
    const key = normalizePrepText(exercise.name);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function matchesAny(value: string, needles: string[]): boolean {
  return needles.some((needle) => value.includes(normalizePrepText(needle)));
}

function normalizePrepText(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function normalizePrepKey(value?: string | null): string {
  return String(value ?? "")
    .toLowerCase()
    .replace(/^ai\s+/i, "")
    .replace(/\s+•\s+.+$/i, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}
