import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { listAllProductsAdmin, addProduct, updateProduct, deleteProduct } from "@/lib/store";
import { Product } from "@/lib/types";

export async function GET() {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const products = await listAllProductsAdmin();
    return NextResponse.json(products);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load products";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const body = await request.json();
  const product: Product = {
    id: crypto.randomUUID(),
    name: body.name,
    description: body.description ?? "",
    price: Number(body.price),
    originalPrice: body.originalPrice ? Number(body.originalPrice) : undefined,
    images: body.images ?? [],
    categoryIds: body.categoryIds ?? [],
    brand: body.brand,
    stock: Number(body.stock ?? 0),
    featured: body.featured ?? false,
    isNew: body.isNew ?? false,
    isLatest: body.isLatest ?? false,
    tags: body.tags ?? [],
  };

  try {
    await addProduct(product);
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to add product";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const body = await request.json();
  const { id, ...updates } = body;
  if (!id) {
    return NextResponse.json({ error: "Product id required" }, { status: 400 });
  }

  try {
    const product = await updateProduct(id, updates);
    return NextResponse.json(product);
  } catch {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }
}

export async function DELETE(request: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Product id required" }, { status: 400 });
  }

  try {
    await deleteProduct(id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}

async function requireAdmin() {
  const ok = await isAdminAuthenticated();
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return null;
}
