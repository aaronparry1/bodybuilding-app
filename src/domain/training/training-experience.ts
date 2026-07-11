import type { ExperienceLevel } from "@/domain/training/models";

export interface TrainingExperience {
  id: ExperienceLevel;
  displayName: string;
  description: string;
  coachingSummary: string;
  initialCoachingAssumptions: string[];
}

export const trainingExperiences: readonly TrainingExperience[] = [
  {
    id: "beginner",
    displayName: "Beginner",
    description: "New to structured resistance training, returning after a long break, or still building consistent technique and training habits.",
    coachingSummary: "Start with simpler coaching, lower confidence, slower rotation, and conservative complexity until training evidence improves.",
    initialCoachingAssumptions: [
      "slower progression assumptions",
      "lower starting coaching confidence",
      "simpler exercise selection",
      "slower exercise rotation",
      "conservative complexity",
    ],
  },
  {
    id: "intermediate",
    displayName: "Intermediate",
    description: "Training consistently with good technique and progressing reliably using structured programmes.",
    coachingSummary: "Start with balanced progression, moderate confidence, balanced exercise selection, and moderate rotation.",
    initialCoachingAssumptions: [
      "balanced progression",
      "moderate coaching confidence",
      "balanced exercise selection",
      "moderate rotation",
    ],
  },
  {
    id: "advanced",
    displayName: "Advanced",
    description: "Several years of consistent lifting experience with strong technique, slower progress, and a need for more precise programming.",
    coachingSummary: "Start with slower expected progression, higher specificity, faster variation where useful, and stronger confidence only after evidence accumulates.",
    initialCoachingAssumptions: [
      "slower expected progression",
      "higher exercise specificity",
      "faster variation where appropriate",
      "higher coaching confidence after evidence accumulates",
    ],
  },
] as const;

export function getTrainingExperience(id: ExperienceLevel): TrainingExperience {
  const experience = trainingExperiences.find((item) => item.id === id);
  if (!experience) throw new Error(`Unsupported training experience: ${id}`);
  return experience;
}

export function isTrainingExperienceId(value: string): value is ExperienceLevel {
  return trainingExperiences.some((item) => item.id === value);
}
