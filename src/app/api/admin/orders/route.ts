import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getOrders, updateOrder } from "@/lib/store";

async function requireAdmin() {
  const ok = await isAdminAuthenticated();
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return null;
}

export async function GET() {
  const authError = await requireAdmin();
  if (authError) return authError;

  const orders = await getOrders();
  return NextResponse.json(orders);
}

export async function PATCH(request: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const body = await request.json();
  const { id } = body;
  if (!id) {
    return NextResponse.json({ error: "Order id required" }, { status: 400 });
  }

  const updates: Parameters<typeof updateOrder>[1] = {};
  if (body.orderStatus !== undefined) updates.orderStatus = body.orderStatus;
  if (body.paymentStatus !== undefined) updates.paymentStatus = body.paymentStatus;

  try {
    const order = await updateOrder(id, updates);
    return NextResponse.json(order);
  } catch {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
}
