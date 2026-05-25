import { NextResponse } from "next/server";
import { healthCheck } from "@/lib/store";
import { getDataBackend } from "@/lib/storage/config";

export async function GET() {
  const db = await healthCheck();
  return NextResponse.json({
    status: db.database ? "healthy" : "unhealthy",
    database: getDataBackend(),
    timestamp: new Date().toISOString(),
  });
}
