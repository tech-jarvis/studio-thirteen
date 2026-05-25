import { Order, OrderItem } from "@/lib/types";
import { getProductsByIds } from "@/lib/store";
import { calculateOrderTotals, MIN_ORDER_AMOUNT } from "@/lib/pricing";
import { generateOrderNumber } from "@/lib/format";

export class OrderValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OrderValidationError";
  }
}

export async function buildValidatedOrder(input: {
  customerName: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  notes?: string;
  items: { productId: string; quantity: number }[];
  paymentMethod: "cod" | "online";
}): Promise<Order> {
  if (!input.customerName?.trim() || !input.phone?.trim() || !input.address?.trim() || !input.city?.trim()) {
    throw new OrderValidationError("Missing required delivery fields");
  }

  if (!input.items?.length) {
    throw new OrderValidationError("Cart is empty");
  }

  for (const item of input.items) {
    if (!item.productId || item.quantity < 1 || item.quantity > 99) {
      throw new OrderValidationError("Invalid cart item quantity");
    }
  }

  const productIds = input.items.map((i) => i.productId);
  const products = await getProductsByIds(productIds);

  if (products.length !== new Set(productIds).size) {
    throw new OrderValidationError("One or more products are unavailable");
  }

  const orderItems: OrderItem[] = [];

  for (const item of input.items) {
    const product = products.find((p) => p.id === item.productId);
    if (!product) throw new OrderValidationError("Product not found");
    if (product.stock < item.quantity) {
      throw new OrderValidationError(`Insufficient stock for ${product.name}`);
    }
    orderItems.push({
      productId: product.id,
      productName: product.name,
      price: product.price,
      quantity: item.quantity,
    });
  }

  const subtotal = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  if (subtotal < MIN_ORDER_AMOUNT) {
    throw new OrderValidationError(
      `Minimum order amount is Rs. ${MIN_ORDER_AMOUNT.toLocaleString()}`
    );
  }

  const method = input.paymentMethod === "online" ? "online" : "cod";
  const totals = calculateOrderTotals(subtotal, method);

  return {
    id: crypto.randomUUID(),
    orderNumber: generateOrderNumber(),
    customerName: input.customerName.trim(),
    phone: input.phone.trim(),
    email: input.email?.trim() || undefined,
    address: input.address.trim(),
    city: input.city.trim(),
    notes: input.notes?.trim() || undefined,
    items: orderItems,
    subtotal: totals.subtotal,
    shipping: totals.shipping,
    discount: totals.discount,
    discountPercent: totals.discountPercent,
    total: totals.total,
    paymentMethod: method,
    paymentStatus: "pending",
    orderStatus: "pending",
    createdAt: new Date().toISOString(),
  };
}
