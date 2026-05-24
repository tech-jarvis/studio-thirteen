import { NextRequest, NextResponse } from "next/server";
import { addOrder, getOrderByNumber } from "@/lib/store";
import { calculateOrderTotals, MIN_ORDER_AMOUNT } from "@/lib/pricing";
import { generateOrderNumber } from "@/lib/format";
import { Order, OrderItem } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      customerName,
      phone,
      email,
      address,
      city,
      notes,
      items,
      paymentMethod,
    } = body;

    if (!customerName || !phone || !address || !city || !items?.length) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const orderItems: OrderItem[] = items.map(
      (item: { productId: string; productName: string; price: number; quantity: number }) => ({
        productId: item.productId,
        productName: item.productName,
        price: item.price,
        quantity: item.quantity,
      })
    );

    const subtotal = orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    if (subtotal < MIN_ORDER_AMOUNT) {
      return NextResponse.json(
        { error: `Minimum order amount is Rs. ${MIN_ORDER_AMOUNT.toLocaleString()}` },
        { status: 400 }
      );
    }

    const method = paymentMethod === "online" ? "online" : "cod";
    const totals = calculateOrderTotals(subtotal, method);

    const order: Order = {
      id: crypto.randomUUID(),
      orderNumber: generateOrderNumber(),
      customerName,
      phone,
      email: email || undefined,
      address,
      city,
      notes: notes || undefined,
      items: orderItems,
      subtotal: totals.subtotal,
      shipping: totals.shipping,
      discount: totals.discount,
      discountPercent: totals.discountPercent,
      total: totals.total,
      paymentMethod: method,
      paymentStatus: method === "online" ? "pending" : "pending",
      orderStatus: "pending",
      createdAt: new Date().toISOString(),
    };

    await addOrder(order);
    return NextResponse.json(order, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const orderNumber = request.nextUrl.searchParams.get("orderNumber");
  if (!orderNumber) {
    return NextResponse.json({ error: "Order number required" }, { status: 400 });
  }
  const order = await getOrderByNumber(orderNumber);
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  return NextResponse.json(order);
}
