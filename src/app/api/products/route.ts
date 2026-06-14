import { NextRequest, NextResponse } from "next/server";
import { getProducts } from "@/lib/store";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const page = Number(params.get("page") ?? "1");
  const pageSize = Number(params.get("pageSize") ?? "48");
  const search = params.get("search") ?? undefined;

  try {
    const result = await getProducts(
      {
        categorySlug: params.get("category") ?? undefined,
        featured: params.get("featured") === "true" ? true : undefined,
        isNew: params.get("new") === "true" ? true : undefined,
        isLatest: params.get("latest") === "true" ? true : undefined,
        tag: params.get("tag") ?? undefined,
        search,
      },
      { page, pageSize }
    );
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load products";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
