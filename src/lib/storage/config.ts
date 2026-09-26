import { isDbConfigured } from "@/lib/db/client";
import { isStorageConfigured } from "@/lib/storage/supabase";

export type StorageBackend = "supabase" | "db";

export function getStorageBackend(): StorageBackend {
  return isStorageConfigured() ? "supabase" : "db";
}

export function getDataBackend(): "postgres" | "none" {
  return isDbConfigured() ? "postgres" : "none";
}
