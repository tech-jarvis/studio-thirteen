import { NextRequest, NextResponse } from "next/server";
import { addOrder, getOrderByNumber } from "@/lib/store";
import { buildValidatedOrder, OrderValidationError } from "@/lib/orders/create-order";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const order = await buildValidatedOrder({
      customerName: body.customerName,
      phone: body.phone,
      email: body.email,
      address: body.address,
      city: body.city,
      notes: body.notes,
      items: body.items,
      paymentMethod: body.paymentMethod,
    });

    const saved = await addOrder(order);
    return NextResponse.json(saved, { status: 201 });
  } catch (error) {
    if (error instanceof OrderValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    const message = error instanceof Error ? error.message : "Failed to create order";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const orderNumber = request.nextUrl.searchParams.get("orderNumber");
  if (!orderNumber) {
    return NextResponse.json({ error: "Order number required" }, { status: 400 });
  }
  try {
    const order = await getOrderByNumber(orderNumber);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    return NextResponse.json(order);
  } catch {
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
  }
}
