import { workoutSessionRepository } from "@/data/local/workout-session-repository";
import type { WorkoutSession } from "@/domain/training/models";
import { filterWorkoutHistory, summarizeWorkoutHistory, type WorkoutHistoryFilters } from "@/domain/training/workout-history";

export class LocalWorkoutHistoryRepository {
  private cachedSourceSessions: WorkoutSession[] | null = null;
  private cachedCompletedSessions: WorkoutSession[] | null = null;

  listCompletedSessions(): WorkoutSession[] {
    const sessions = workoutSessionRepository.list();
    if (this.cachedSourceSessions !== sessions) {
      this.cachedSourceSessions = sessions;
      this.cachedCompletedSessions = sessions.filter((session) => Boolean(session.completedAt));
    }
    return this.cachedCompletedSessions ?? [];
  }

  listSummaries(filters: WorkoutHistoryFilters = {}) {
    return filterWorkoutHistory(summarizeWorkoutHistory(this.listCompletedSessions()), filters);
  }

  subscribe(listener: () => void): () => void {
    return workoutSessionRepository.subscribe(() => {
      this.cachedSourceSessions = null;
      this.cachedCompletedSessions = null;
      listener();
    });
  }
}

export const workoutHistoryRepository = new LocalWorkoutHistoryRepository();
