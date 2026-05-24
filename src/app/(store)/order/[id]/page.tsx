"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { formatPrice } from "@/lib/format";
import { Order } from "@/lib/types";
import { use } from "react";
import { CheckCircle } from "lucide-react";

function OrderContent({ id }: { id: string }) {
  const searchParams = useSearchParams();
  const paid = searchParams.get("paid") === "1";
  const confirmed = searchParams.get("confirmed") === "1";
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetch(`/api/orders/${id}`)
      .then((r) => r.json())
      .then(setOrder);
  }, [id]);

  if (!order) {
    return (
      <main className="max-w-xl mx-auto px-4 py-20 text-center text-stone-400">
        Loading order...
      </main>
    );
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      <div className="text-center mb-10">
        <CheckCircle className="mx-auto text-green-600 mb-4" size={48} />
        <h1 className="text-2xl font-semibold text-stone-900 mb-2">
          {paid ? "Payment Successful!" : confirmed ? "Order Placed!" : "Order Details"}
        </h1>
        <p className="text-stone-500 text-sm">Order #{order.orderNumber}</p>
      </div>

      <div className="bg-stone-50 p-6 mb-6 space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-stone-400">Customer</p>
            <p className="font-medium">{order.customerName}</p>
          </div>
          <div>
            <p className="text-stone-400">Phone</p>
            <p className="font-medium">{order.phone}</p>
          </div>
          <div className="col-span-2">
            <p className="text-stone-400">Delivery Address</p>
            <p className="font-medium">{order.address}, {order.city}</p>
          </div>
          <div>
            <p className="text-stone-400">Payment</p>
            <p className="font-medium capitalize">
              {order.paymentMethod === "cod" ? "Cash on Delivery" : "Advance Payment (Online)"}
            </p>
          </div>
          <div>
            <p className="text-stone-400">Status</p>
            <p className="font-medium capitalize">{order.orderStatus}</p>
          </div>
        </div>
      </div>

      <div className="border border-stone-100 p-6 mb-6">
        <h2 className="font-semibold mb-4">Items</h2>
        {order.items.map((item, i) => (
          <div key={i} className="flex justify-between text-sm py-2 border-b border-stone-50 last:border-0">
            <span>{item.productName} ×{item.quantity}</span>
            <span>{formatPrice(item.price * item.quantity)}</span>
          </div>
        ))}
        <div className="mt-4 pt-4 border-t border-stone-100 space-y-1 text-sm">
          <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
          <div className="flex justify-between"><span>Shipping</span><span>{formatPrice(order.shipping)}</span></div>
          {order.discount > 0 && (
            <div className="flex justify-between text-rose-600">
              <span>Advance Payment Discount ({order.discountPercent}%)</span>
              <span>-{formatPrice(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between font-semibold text-base pt-2">
            <span>Total</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>
      </div>

      <p className="text-sm text-stone-500 text-center mb-6">
        Estimated delivery: 3–5 business days. Track your order anytime.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link href={`/track?order=${order.orderNumber}`} className="px-6 py-3 bg-stone-900 text-white text-sm font-medium text-center hover:bg-rose-600 transition-colors">
          Track Order
        </Link>
        <Link href="/shop" className="px-6 py-3 border border-stone-200 text-sm font-medium text-center hover:border-stone-400 transition-colors">
          Continue Shopping
        </Link>
      </div>
    </main>
  );
}

export default function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <Suspense>
      <OrderContent id={id} />
    </Suspense>
  );
}
