import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/application/auth/auth-context";
import { ProgrammeCloudRepository } from "@/data/cloud/programme-cloud-repository";
import { programmeRepository } from "@/data/local/programme-repository";
import { LocalSyncQueueStore } from "@/data/sync/local-sync-queue-store";
import { SyncQueue } from "@/data/sync/sync-queue";
import { getOptionalSupabaseClient } from "@/lib/supabase/client";
import type { Programme } from "@/domain/training/models";

const syncQueue = new SyncQueue(new LocalSyncQueueStore());

export function useProgrammeLibrary() {
  const { user } = useAuth();
  const [programmes, setProgrammes] = useState(() => programmeRepository.listAll());

  useEffect(
    () =>
      programmeRepository.subscribe(() => {
        setProgrammes(programmeRepository.listAll());
      }),
    [],
  );

  const saveProgramme = useCallback(
    async (programme: Programme) => {
      programmeRepository.save({ ...programme, createdByUserId: user?.id ?? programme.createdByUserId ?? null });

      if (user?.id) {
        const { client } = getOptionalSupabaseClient();
        if (client) {
          try {
            await new ProgrammeCloudRepository(client).saveProgramme(user.id, programme);
          } catch {
            syncQueue.enqueue("programme", programme.id, programme, user.id);
          }
        } else {
          syncQueue.enqueue("programme", programme.id, programme, user.id);
        }
      }
    },
    [user?.id],
  );

  const startProgrammeDay = useCallback((programmeId: string, dayId: string) => {
    programmeRepository.selectProgrammeDay({ programmeId, dayId });
  }, []);

  return {
    programmes,
    saveProgramme,
    startProgrammeDay,
  };
}
