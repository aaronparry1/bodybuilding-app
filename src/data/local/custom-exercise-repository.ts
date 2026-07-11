import { jsonStore } from "@/data/local/json-store";
import type { Exercise } from "@/domain/training/models";
import { exerciseLibrary } from "@/domain/training/presets";

const customExercisesKey = "iron-logic.custom-exercises";
const selectedExerciseKey = "iron-logic.selected-exercise-id";
let cachedAllSourceExercises: Exercise[] | null = null;
let cachedAllExercises: Exercise[] | null = null;

export interface CustomExerciseRepository {
  listCustom(): Exercise[];
  listAll(): Exercise[];
  save(exercise: Exercise): void;
  deleteCustomExercise(id: string): boolean;
  getSelectedExerciseId(): string | null;
  setSelectedExerciseId(id: string): void;
  subscribe(listener: () => void): () => void;
}

export class LocalCustomExerciseRepository implements CustomExerciseRepository {
  listCustom(): Exercise[] {
    return jsonStore.get<Exercise[]>(customExercisesKey, []);
  }

  listAll(): Exercise[] {
    const customExercises = this.listCustom();
    if (cachedAllSourceExercises !== customExercises) {
      cachedAllSourceExercises = customExercises;
      cachedAllExercises = [...exerciseLibrary, ...customExercises];
    }
    return cachedAllExercises ?? exerciseLibrary;
  }

  save(exercise: Exercise): void {
    const customExercises = this.listCustom();
    const nextExercise = { ...exercise, isCustom: true };
    const nextExercises = customExercises.some((candidate) => candidate.id === exercise.id)
      ? customExercises.map((candidate) => (candidate.id === exercise.id ? nextExercise : candidate))
      : [nextExercise, ...customExercises];

    cachedAllSourceExercises = null;
    cachedAllExercises = null;
    jsonStore.set(customExercisesKey, nextExercises);
  }

  deleteCustomExercise(id: string): boolean {
    const customExercises = this.listCustom();
    const nextExercises = customExercises.filter((exercise) => exercise.id !== id);
    if (nextExercises.length === customExercises.length) return false;

    cachedAllSourceExercises = null;
    cachedAllExercises = null;
    jsonStore.set(customExercisesKey, nextExercises);
    if (this.getSelectedExerciseId() === id) {
      jsonStore.set(selectedExerciseKey, null);
    }
    return true;
  }

  getSelectedExerciseId(): string | null {
    return jsonStore.get<string | null>(selectedExerciseKey, null);
  }

  setSelectedExerciseId(id: string): void {
    if (this.getSelectedExerciseId() === id) return;
    jsonStore.set(selectedExerciseKey, id);
  }

  subscribe(listener: () => void): () => void {
    const unsubscribeCustom = jsonStore.subscribe(customExercisesKey, () => {
      cachedAllSourceExercises = null;
      cachedAllExercises = null;
      listener();
    });
    const unsubscribeSelected = jsonStore.subscribe(selectedExerciseKey, listener);
    return () => {
      unsubscribeCustom();
      unsubscribeSelected();
    };
  }
}

export const customExerciseRepository = new LocalCustomExerciseRepository();
