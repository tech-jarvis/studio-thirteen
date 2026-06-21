import { isNeonConfigured } from "@/lib/db/neon";

export type StorageBackend = "db";

export function getStorageBackend(): StorageBackend {
  return "db";
}

export function getDataBackend(): "neon" | "none" {
  return isNeonConfigured() ? "neon" : "none";
}
