import { NextRequest, NextResponse } from "next/server";
import { getCategories } from "@/lib/store";

export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get("type") ?? undefined;
  const categories = await getCategories(type ?? undefined);
  return NextResponse.json(categories);
}
