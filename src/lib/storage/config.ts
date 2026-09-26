import { isDbConfigured } from "@/lib/db/client";

export type StorageBackend = "db";

export function getStorageBackend(): StorageBackend {
  return "db";
}

export function getDataBackend(): "postgres" | "none" {
  return isDbConfigured() ? "postgres" : "none";
}
