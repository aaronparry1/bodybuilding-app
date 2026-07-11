import type { AppSupabaseClient } from "@/lib/supabase/client";
import { fromJson, toJson } from "@/data/supabase/json";
import type { UserTrainingSettings } from "@/domain/training/models";

export class UserSettingsCloudRepository {
  constructor(private readonly client: AppSupabaseClient) {}

  async saveUserSettings(userId: string, settings: unknown): Promise<void> {
    const { error } = await this.client.from("user_settings").upsert({
      user_id: userId,
      settings: toJson(settings),
      updated_at: new Date().toISOString(),
    });
    if (error) throw error;
  }

  async loadUserSettings(userId: string): Promise<UserTrainingSettings | null> {
    const { data, error } = await this.client.from("user_settings").select("settings").eq("user_id", userId).maybeSingle();
    if (error) throw error;
    return data?.settings ? fromJson<UserTrainingSettings>(data.settings) : null;
  }

  async saveUserSettingsBlob(userId: string, settings: unknown): Promise<void> {
    await this.saveUserSettings(userId, settings);
  }

  async loadUserSettingsBlob(userId: string): Promise<unknown | null> {
    const { data, error } = await this.client.from("user_settings").select("settings").eq("user_id", userId).maybeSingle();
    if (error) throw error;
    return data?.settings ? fromJson<unknown>(data.settings) : null;
  }
}
