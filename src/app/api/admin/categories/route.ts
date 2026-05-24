import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  addCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "@/lib/store";
import { Category } from "@/lib/types";

async function requireAdmin() {
  const ok = await isAdminAuthenticated();
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return null;
}

export async function GET(request: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const type = request.nextUrl.searchParams.get("type") ?? undefined;
  const categories = await getCategories(type ?? undefined);
  return NextResponse.json(categories);
}

export async function POST(request: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const body = await request.json();
  const category: Category = {
    id: crypto.randomUUID(),
    name: body.name,
    slug: body.slug || body.name.toLowerCase().replace(/\s+/g, "-"),
    type: body.type,
    description: body.description,
    image: body.image,
  };

  await addCategory(category);
  return NextResponse.json(category, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const body = await request.json();
  const { id, ...updates } = body;
  if (!id) {
    return NextResponse.json({ error: "Category id required" }, { status: 400 });
  }

  try {
    const category = await updateCategory(id, updates);
    return NextResponse.json(category);
  } catch {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }
}

export async function DELETE(request: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Category id required" }, { status: 400 });
  }

  await deleteCategory(id);
  return NextResponse.json({ success: true });
}
