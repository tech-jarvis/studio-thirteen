"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { formatPrice } from "@/lib/format";
import { Order } from "@/lib/types";
import { use } from "react";
import { CheckCircle } from "lucide-react";
import { SITE, getWhatsAppUrl } from "@/lib/site-config";

function OrderContent({ id }: { id: string }) {
  const searchParams = useSearchParams();
  const submitted = searchParams.get("submitted") === "1";
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

  const title = submitted
    ? "Payment submitted!"
    : confirmed
      ? "Order placed!"
      : "Order details";

  const subtitle = submitted
    ? "We will verify your payment and update your order status."
    : confirmed && order.paymentMethod === "online"
      ? "Complete payment on the next step to confirm your order."
      : confirmed
        ? "We will confirm your order shortly."
        : null;

  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      <div className="text-center mb-10">
        <CheckCircle className="mx-auto text-green-600 mb-4" size={48} />
        <h1 className="text-2xl font-semibold text-stone-900 mb-2">{title}</h1>
        <p className="text-stone-500 text-sm">Order #{order.orderNumber}</p>
        {subtitle && <p className="text-sm text-stone-500 mt-3 max-w-md mx-auto">{subtitle}</p>}
      </div>

      {order.paymentMethod === "online" &&
        !order.paymentScreenshot &&
        order.orderStatus !== "cancelled" && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 text-sm text-center">
            <p className="text-amber-900 mb-3">
              Payment not completed yet. Transfer the total and upload your screenshot to confirm this order.
            </p>
            <Link
              href={`/checkout/payment?orderId=${order.id}`}
              className="inline-block bg-stone-900 text-white px-6 py-2.5 text-sm hover:bg-rose-600"
            >
              Pay &amp; upload screenshot
            </Link>
          </div>
        )}

      {order.paymentMethod === "online" && order.paymentScreenshot && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-sm text-center text-emerald-800">
          Payment proof received. We will verify and confirm your order shortly.
        </div>
      )}

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
            <p className="text-stone-400">Delivery address</p>
            <p className="font-medium">{order.address}, {order.city}</p>
          </div>
          <div>
            <p className="text-stone-400">Payment</p>
            <p className="font-medium">
              {order.paymentMethod === "cod" ? "Cash on Delivery" : "Bank / wallet transfer"}
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
              <span>Advance payment discount ({order.discountPercent}%)</span>
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
        Questions?{" "}
        <a
          href={getWhatsAppUrl(`Hi, about order ${order.orderNumber}`)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#128C7E] hover:underline"
        >
          WhatsApp {SITE.phone}
        </a>
        {" · "}
        <a href={`mailto:${SITE.email}`} className="text-stone-600 hover:underline">
          {SITE.email}
        </a>
      </p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link href={`/track?order=${order.orderNumber}`} className="px-6 py-3 bg-stone-900 text-white text-sm font-medium text-center hover:bg-rose-600 transition-colors">
          Track order
        </Link>
        <Link href="/shop" className="px-6 py-3 border border-stone-200 text-sm font-medium text-center hover:border-stone-400 transition-colors">
          Continue shopping
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
