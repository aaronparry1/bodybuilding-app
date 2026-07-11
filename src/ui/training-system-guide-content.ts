export interface TrainingSystemGuideSection {
  title: string;
  bullets: string[];
}

export const TRAINING_SYSTEM_GUIDE_SECTIONS: TrainingSystemGuideSection[] = [
  {
    title: "Why Adaptive Strength Coach Exists",
    bullets: [
      "Training is individual. Progress should be individual too.",
      "Most programmes assume everyone recovers the same, progresses the same, and should add weight after every good-looking session.",
      "Adaptive Strength Coach starts somewhere else: it uses what you actually log, then adapts the plan around performance, history, fatigue signs, and the block you are in.",
      "Your job is to train. Its job is to adapt.",
    ],
  },
  {
    title: "The Problem With Most Programmes",
    bullets: [
      "Traditional planning often looks like this: Week 1, 100kg. Week 2, 102.5kg. Week 3, 105kg.",
      "That can work for a while. It can also ignore recovery, fatigue, consistency, and life outside the gym.",
      "Adaptive Strength Coach still respects structure. It just refuses to pretend the body follows a spreadsheet perfectly.",
      "The plan gives direction. Your logged training decides whether the next move is smarter, not just heavier.",
    ],
  },
  {
    title: "Push. Hold. Pull Back.",
    bullets: [
      "This is the centre of the system: should we push, should we hold, or should we pull back?",
      "Push: performance is strong and recovery looks under control.",
      "Hold: progress is happening, but the cost is climbing.",
      "Pull back: performance is declining repeatedly and the current dose is not paying you back.",
      "Not every good session earns more weight. Not every bad session is failure.",
      "You will not always add weight. That is the point.",
    ],
  },
  {
    title: "Why We Don't Use RPE",
    bullets: [
      "RPE can be useful. Adaptive Strength Coach simply does not make you depend on it.",
      "Most people are not great at rating effort, especially mid-session, tired, or chasing a number.",
      "The app prioritises objective training signals first: reps, loads, consistency, fatigue signs, training history, and training phase.",
      "It watches what you do, not what you think you did.",
      "No RPE or RIR required. Log honest work and let the pattern show itself.",
    ],
  },
  {
    title: "Muscle Growth Isn't Just Weight",
    bullets: [
      "More weight is not always the answer. For muscle, useful work matters.",
      "Adaptive Strength Coach looks at productive work, volume, recovery, fatigue, and consistency before deciding whether to push load or adjust work.",
      "Required sets finish the exercise. Target range is where useful work lives. Soft cap is the guardrail, not the goal.",
      "Example: 3 required · target 3-5 · soft cap 8.",
      "Warm-ups help you prepare. They do not count as work.",
      "A warm-up set never sets your working weight.",
    ],
  },
  {
    title: "Session Prep and Warm-Up Sets",
    bullets: [
      "Session Prep happens before the workout. It prepares joints, positions, bracing, and movement readiness.",
      "Warm-Up Sets happen inside an exercise. They ramp from light load toward the working load for that lift.",
      "Session Prep is optional and low fatigue. Warm-Up Sets are the ramp you use before heavier work.",
      "Neither Session Prep nor Warm-Up Sets count toward progression, PRs, fatigue evidence, or weekly training completion.",
    ],
  },
  {
    title: "Rep Ranges and Target Zones",
    bullets: [
      "A rep range is a valid zone, not a staircase where only the top counts.",
      "Different exercises progress best in different parts of the range. Bench Press, Machine Flys, curls, and power work should not all chase reps the same way.",
      "Target Zone is the app's current best aim for that exercise: heavy-end work, balanced work, build reps first, keep it sharp, or easy quality reps.",
      "The app learns from load, reps, repeatability, fatigue signs, shutdowns, manual finishes, and progression outcomes.",
      "If evidence is weak, it may guide you toward the middle of the range to collect cleaner data.",
      "Technical failure means reps stop looking like the movement you are trying to train. Absolute failure is not the goal.",
      "Power work stays sharp. Peak work stays specific. Recovery Window work stays easy.",
    ],
  },
  {
    title: "Strength Isn't Hypertrophy",
    bullets: [
      "Different blocks have different jobs, so the app changes the rules by block.",
      "Hypertrophy builds muscle and work capacity. Powerbuilding blends muscle and strength. Strength builds force production.",
      "Power builds fast force production. Peak expresses strength while reducing fatigue. Recovery Windows lower stress so the next push has somewhere to go.",
      "100kg x 12 in Hypertrophy does not automatically become 100kg x 5 in Strength.",
      "Strength work, muscle-building work, power work, and taper work should not all be coached the same way.",
    ],
  },
  {
    title: "Recovery Windows",
    bullets: [
      "A Recovery Window is a planned opportunity to reduce fatigue, not a punishment and not a mandatory week off.",
      "If fatigue and readiness evidence are poor, it behaves like a true deload: lower volume, lower stress, less novelty.",
      "If you are recovering well, it works more like a transition week: easier than normal, skill stays alive, momentum does not get crushed.",
      "The roadmap creates the opportunity. Your data decides the dose.",
    ],
  },
  {
    title: "Powerlifting Meet",
    bullets: [
      "Powerlifting Meet works backwards from the meet date.",
      "Squat, bench, and deadlift stay in charge. Late phases reduce novelty and unnecessary fatigue.",
      "Specificity rises as the meet gets closer. Taper and meet week are about readiness, not adding random new work.",
      "The goal is to arrive strong, recovered, and ready to express the lifts that count.",
    ],
  },
  {
    title: "Recovery Is Training",
    bullets: [
      "Recovery is not separate from training. It is part of the training system.",
      "Recovery capacity affects progression, volume tolerance, fatigue, and consistency.",
      "Recovery Cardio is low-fatigue work that supports recovery and aerobic base.",
      "Capacity Cardio builds the engine for handling more work, when it will not interfere with the lifting that matters.",
      "More lifting is not always the answer.",
    ],
  },
  {
    title: "What Makes Adaptive Strength Coach Different",
    bullets: [
      "Performance-based autoregulation: push, hold, or pull back from real training data.",
      "Volume learning: muscles can need more, less, or the same work over time.",
      "Fatigue classification: one lift struggling is different from the whole system dragging.",
      "Strength-specific variation logic: main lifts are protected and varied with purpose when they stall.",
      "Block-specific progression rules: hypertrophy, strength, power, peak, and Recovery Windows do not play by one rulebook.",
      "Recovery and capacity integration: cardio supports training, not calorie guilt.",
      "Re-entry after time away: short breaks are not punished, longer gaps get a smarter ramp back in.",
      "Long-term planning: the plan has direction, but the work you log shapes the next step.",
    ],
  },
  {
    title: "What You Can Expect",
    bullets: [
      "Some sessions will push. Some will hold. Some will pull back.",
      "Powerlifting Meet plans work backwards from the date. Late phases reduce fatigue and novelty so you arrive ready.",
      "Pain, unavailable equipment, dislike, and temporary skips are treated differently. They are not all failure.",
      "The goal is consistent long-term progress, not constant increases forever.",
      "The app is smart. Not psychic.",
      "Your job is to train. Its job is to adapt.",
    ],
  },
];
