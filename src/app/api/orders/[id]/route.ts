import { NextRequest, NextResponse } from "next/server";
import { getOrderById, updateOrder } from "@/lib/store";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  return NextResponse.json(order);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  const allowed: Parameters<typeof updateOrder>[1] = {};
  if (body.orderStatus !== undefined) allowed.orderStatus = body.orderStatus;
  if (body.paymentStatus !== undefined) allowed.paymentStatus = body.paymentStatus;

  try {
    const order = await updateOrder(id, allowed);
    return NextResponse.json(order);
  } catch {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
}
