import { NextRequest, NextResponse } from "next/server";
import { getOrderById, updateOrder } from "@/lib/store";

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
  const { id } = await params;
  const body = await request.json();
  try {
    const order = await updateOrder(id, body);
    return NextResponse.json(order);
  } catch {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
}
