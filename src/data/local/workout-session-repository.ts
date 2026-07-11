import { jsonStore } from "@/data/local/json-store";
import type { WorkoutSession } from "@/domain/training/models";

const workoutSessionsKey = "iron-logic.workout-sessions";

export interface WorkoutSessionRepository {
  list(): WorkoutSession[];
  save(session: WorkoutSession): void;
  remove(sessionId: string): void;
  subscribe(listener: () => void): () => void;
}

export class LocalWorkoutSessionRepository implements WorkoutSessionRepository {
  list(): WorkoutSession[] {
    return jsonStore.get<WorkoutSession[]>(workoutSessionsKey, []);
  }

  save(session: WorkoutSession): void {
    const sessions = this.list();
    const existingIndex = sessions.findIndex((candidate) => candidate.id === session.id);
    const nextSessions =
      existingIndex >= 0
        ? sessions.map((candidate) => (candidate.id === session.id ? session : candidate))
        : [session, ...sessions];

    jsonStore.set(workoutSessionsKey, nextSessions);
  }

  remove(sessionId: string): void {
    jsonStore.set(
      workoutSessionsKey,
      this.list().filter((session) => session.id !== sessionId),
    );
  }

  subscribe(listener: () => void): () => void {
    return jsonStore.subscribe(workoutSessionsKey, listener);
  }
}

export const workoutSessionRepository = new LocalWorkoutSessionRepository();
