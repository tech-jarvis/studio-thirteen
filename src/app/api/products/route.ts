import { NextRequest, NextResponse } from "next/server";
import { getProducts } from "@/lib/store";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const products = await getProducts({
    categorySlug: params.get("category") ?? undefined,
    featured: params.get("featured") === "true",
    isNew: params.get("new") === "true",
    isLatest: params.get("latest") === "true",
    tag: params.get("tag") ?? undefined,
  });
  return NextResponse.json(products);
}
