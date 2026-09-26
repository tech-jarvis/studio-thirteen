import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { listAllProductsAdmin, addProduct, updateProduct, deleteProduct } from "@/lib/store";
import { Product } from "@/lib/types";
import { parseProductInput, ProductValidationError } from "@/lib/products/validate";
import { refreshStorefront } from "@/lib/revalidate";

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

  try {
    const body = await request.json();
    const product: Product = {
      ...(parseProductInput(body) as Omit<Product, "id">),
      id: crypto.randomUUID(),
    };
    await addProduct(product);
    refreshStorefront();
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    return errorResponse(error, "Failed to add product");
  }
}

export async function PATCH(request: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const { id, ...body } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "Product id required" }, { status: 400 });
    }
    const product = await updateProduct(id, parseProductInput(body, { partial: true }));
    refreshStorefront();
    return NextResponse.json(product);
  } catch (error) {
    if (error instanceof Error && error.message === "Product not found") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    return errorResponse(error, "Failed to update product");
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
    refreshStorefront();
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

function errorResponse(error: unknown, fallback: string) {
  if (error instanceof ProductValidationError) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  // Postgres check constraint (e.g. original_price >= price)
  if ((error as { code?: string })?.code === "23514") {
    return NextResponse.json(
      { error: "Original price must be higher than the sale price" },
      { status: 400 }
    );
  }
  const message = error instanceof Error ? error.message : fallback;
  return NextResponse.json({ error: message }, { status: 500 });
}
