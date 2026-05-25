import { isNeonConfigured } from "@/lib/db/neon";

export type StorageBackend = "local";

export function getStorageBackend(): StorageBackend {
  return "local";
}

export function getDataBackend(): "neon" | "none" {
  return isNeonConfigured() ? "neon" : "none";
}
