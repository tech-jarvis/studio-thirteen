import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  addCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "@/lib/store";
import { Category, CategoryType } from "@/lib/types";
import { refreshStorefront } from "@/lib/revalidate";

class CategoryValidationError extends Error {}

async function requireAdmin() {
  const ok = await isAdminAuthenticated();
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return null;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Validate category input; with `partial`, only fields present are checked. */
function parseCategoryInput(
  body: Record<string, unknown>,
  { partial = false } = {}
): Partial<Category> {
  const out: Partial<Category> = {};
  const has = (k: string) => k in body && body[k] !== undefined;
  const text = (v: unknown) => (typeof v === "string" ? v.trim() : "");

  if (!partial || has("name")) {
    const name = text(body.name);
    if (!name) throw new CategoryValidationError("Name is required");
    out.name = name.slice(0, 100);
  }
  if (!partial || has("slug")) {
    const slug = slugify(text(body.slug) || out.name || "");
    if (!slug) throw new CategoryValidationError("Link name (slug) is required");
    out.slug = slug;
  }
  if (!partial || has("type")) {
    const type = body.type as CategoryType;
    if (type !== "season" && type !== "product_type") {
      throw new CategoryValidationError("Choose Season or Product Type");
    }
    out.type = type;
  }
  // Empty description/image clear the field.
  if (has("description")) {
    (out as Record<string, unknown>).description = text(body.description) || null;
  }
  if (has("image")) {
    const image = text(body.image);
    if (image && !/^(https?:\/\/|\/)/.test(image)) {
      throw new CategoryValidationError("Image must be an uploaded image or an https:// URL");
    }
    (out as Record<string, unknown>).image = image || null;
  }
  if (has("sortOrder")) {
    const n = Number(body.sortOrder);
    if (!Number.isInteger(n)) throw new CategoryValidationError("Order must be a whole number");
    out.sortOrder = n;
  }
  if (has("showInMenu")) out.showInMenu = body.showInMenu === true;
  return out;
}

function errorResponse(error: unknown, fallback: string) {
  if (error instanceof CategoryValidationError) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  if ((error as { code?: string })?.code === "23505") {
    return NextResponse.json(
      { error: "Another category already uses that link name (slug)" },
      { status: 400 }
    );
  }
  if (error instanceof Error && error.message === "Category not found") {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }
  const message = error instanceof Error ? error.message : fallback;
  return NextResponse.json({ error: message }, { status: 500 });
}

export async function GET(request: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const type = request.nextUrl.searchParams.get("type") ?? undefined;
  const categories = await getCategories(type);
  return NextResponse.json(categories);
}

export async function POST(request: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const body = await request.json();
    const category: Category = {
      showInMenu: true,
      sortOrder: 0,
      ...(parseCategoryInput(body) as Omit<Category, "id">),
      id: crypto.randomUUID(),
    };
    await addCategory(category);
    refreshStorefront();
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    return errorResponse(error, "Failed to add category");
  }
}

export async function PATCH(request: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const { id, ...body } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "Category id required" }, { status: 400 });
    }
    const category = await updateCategory(id, parseCategoryInput(body, { partial: true }));
    refreshStorefront();
    return NextResponse.json(category);
  } catch (error) {
    return errorResponse(error, "Failed to update category");
  }
}

export async function DELETE(request: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Category id required" }, { status: 400 });
  }

  try {
    await deleteCategory(id);
    refreshStorefront();
    return NextResponse.json({ success: true });
  } catch (error) {
    return errorResponse(error, "Failed to delete category");
  }
}
