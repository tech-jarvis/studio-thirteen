import { NextRequest, NextResponse } from "next/server";
import { updateOrder } from "@/lib/store";

export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json();
    if (!orderId) {
      return NextResponse.json({ error: "Order id required" }, { status: 400 });
    }

    const order = await updateOrder(orderId, {
      paymentStatus: "paid",
      orderStatus: "confirmed",
    });

    return NextResponse.json(order);
  } catch {
    return NextResponse.json({ error: "Payment failed" }, { status: 500 });
  }
}
