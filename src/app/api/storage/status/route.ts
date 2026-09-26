import { NextResponse } from "next/server";
import { healthCheck } from "@/lib/store";
import { getDataBackend, getStorageBackend } from "@/lib/storage/config";

export async function GET() {
  const db = await healthCheck();
  const data = getDataBackend();
  const storage = getStorageBackend();

  return NextResponse.json({
    ok: db.database,
    backend: data,
    storage,
    storageLabel: "Supabase Postgres (uploads table)",
    dataLabel: data === "postgres" ? "Supabase Postgres" : "Not configured",
  });
}
