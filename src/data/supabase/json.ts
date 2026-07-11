import type { Json } from "@/data/supabase/database.types";

export function toJson(value: unknown): Json {
  return value as Json;
}

export function fromJson<T>(value: Json): T {
  return value as unknown as T;
}
