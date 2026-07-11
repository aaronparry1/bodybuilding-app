import { jsonStore } from "@/data/local/json-store";
import type { Programme, WorkoutSessionKind } from "@/domain/training/models";
import { isNonPlannedSessionKind, type NonPlannedSessionKind } from "@/domain/training/workout-origin";
import { presetProgrammes } from "@/domain/training/presets";

const customProgrammesKey = "iron-logic.custom-programmes";
const selectedProgrammeDayKey = "iron-logic.selected-programme-day";
let cachedAllSourceProgrammes: Programme[] | null = null;
let cachedAllProgrammes: Programme[] | null = null;

export interface SelectedProgrammeDay {
  programmeId: string;
  dayId: string;
  sessionKind: NonPlannedSessionKind;
}

type PersistedSelectedProgrammeDay = {
  programmeId: string;
  dayId: string;
  sessionKind?: WorkoutSessionKind;
};

export class LocalProgrammeRepository {
  listCustom(): Programme[] {
    return jsonStore.get<Programme[]>(customProgrammesKey, []);
  }

  listAll(): Programme[] {
    const customProgrammes = this.listCustom();
    if (cachedAllSourceProgrammes !== customProgrammes) {
      cachedAllSourceProgrammes = customProgrammes;
      cachedAllProgrammes = [...presetProgrammes, ...customProgrammes];
    }
    return cachedAllProgrammes ?? presetProgrammes;
  }

  save(programme: Programme): void {
    const nextProgramme = { ...programme, isCustom: true, isPreset: false };
    const programmes = this.listCustom();
    const nextProgrammes = programmes.some((candidate) => candidate.id === programme.id)
      ? programmes.map((candidate) => (candidate.id === programme.id ? nextProgramme : candidate))
      : [nextProgramme, ...programmes];

    cachedAllSourceProgrammes = null;
    cachedAllProgrammes = null;
    jsonStore.set(customProgrammesKey, nextProgrammes);
  }

  selectProgrammeDay(selection: SelectedProgrammeDay): void {
    if (!isNonPlannedSessionKind(selection.sessionKind)) return;
    const currentSelection = this.getSelectedProgrammeDay();
    if (
      currentSelection?.programmeId === selection.programmeId &&
      currentSelection.dayId === selection.dayId &&
      currentSelection.sessionKind === selection.sessionKind
    ) {
      return;
    }
    jsonStore.set(selectedProgrammeDayKey, selection);
  }

  getSelectedProgrammeDay(): SelectedProgrammeDay | null {
    const selection = jsonStore.get<PersistedSelectedProgrammeDay | null>(selectedProgrammeDayKey, null);
    if (!selection || selection.sessionKind === "planned") return null;
    return {
      programmeId: selection.programmeId,
      dayId: selection.dayId,
      sessionKind: selection.sessionKind ?? "custom",
    };
  }

  clearSelectedProgrammeDay(): void {
    if (!this.getSelectedProgrammeDay()) return;
    jsonStore.set(selectedProgrammeDayKey, null);
  }

  subscribe(listener: () => void): () => void {
    const unsubscribeProgrammes = jsonStore.subscribe(customProgrammesKey, () => {
      cachedAllSourceProgrammes = null;
      cachedAllProgrammes = null;
      listener();
    });
    const unsubscribeSelection = jsonStore.subscribe(selectedProgrammeDayKey, listener);
    return () => {
      unsubscribeProgrammes();
      unsubscribeSelection();
    };
  }
}

export const programmeRepository = new LocalProgrammeRepository();
