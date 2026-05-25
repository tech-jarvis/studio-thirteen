"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Order, OrderStatus } from "@/lib/types";
import { formatPrice } from "@/lib/format";

const STATUSES: OrderStatus[] = [
  "pending",
  "paid",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
];

const STATUS_STYLES: Record<OrderStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  paid: "bg-emerald-100 text-emerald-800",
  confirmed: "bg-green-100 text-green-800",
  shipped: "bg-blue-100 text-blue-800",
  delivered: "bg-stone-100 text-stone-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  function load() {
    fetch("/api/admin/orders")
      .then((r) => r.json())
      .then((data) => setOrders(Array.isArray(data) ? data : []));
  }

  useEffect(() => {
    load();
  }, []);

  async function updateStatus(id: string, orderStatus: OrderStatus) {
    const body: { id: string; orderStatus: OrderStatus; paymentStatus?: string } = {
      id,
      orderStatus,
    };
    if (orderStatus === "paid") {
      body.paymentStatus = "paid";
    }

    await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    load();
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-stone-900 mb-8">Orders</h1>

      {orders.length === 0 ? (
        <p className="text-stone-400">No orders yet.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white border border-stone-200 p-6">
              <div className="flex flex-wrap justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold">{order.orderNumber}</p>
                    <span
                      className={`text-xs px-2 py-0.5 capitalize ${STATUS_STYLES[order.orderStatus]}`}
                    >
                      {order.orderStatus}
                    </span>
                  </div>
                  <p className="text-sm text-stone-500 mt-1">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatPrice(order.total)}</p>
                  <p className="text-sm text-stone-500 capitalize">
                    {order.paymentMethod === "cod" ? "Cash on Delivery" : "Bank transfer"}{" "}
                    · {order.paymentStatus}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mb-4">
                <div>
                  <p>
                    <strong>{order.customerName}</strong>
                  </p>
                  <p className="text-stone-500">{order.phone}</p>
                  <p className="text-stone-500">
                    {order.address}, {order.city}
                  </p>
                </div>
                <div>
                  {order.items.map((item, i) => (
                    <p key={i} className="text-stone-600">
                      {item.productName} ×{item.quantity} —{" "}
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  ))}
                  {order.discount > 0 && (
                    <p className="text-rose-600 text-xs mt-1">
                      Advance discount: -{formatPrice(order.discount)}
                    </p>
                  )}
                </div>
              </div>

              {order.paymentMethod === "online" && (
                <div className="mb-4 p-4 bg-stone-50 border border-stone-100">
                  <p className="text-sm font-medium text-stone-700 mb-2">Payment screenshot</p>
                  {order.paymentScreenshot ? (
                    <a
                      href={order.paymentScreenshot}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block relative w-full max-w-xs aspect-[4/3] border border-stone-200"
                    >
                      <Image
                        src={order.paymentScreenshot}
                        alt="Payment proof"
                        fill
                        className="object-contain"
                        unoptimized
                      />
                    </a>
                  ) : (
                    <p className="text-sm text-amber-700">Awaiting payment proof from customer</p>
                  )}
                </div>
              )}

              <div className="flex items-center gap-3 pt-4 border-t border-stone-100">
                <span className="text-sm text-stone-500">Status:</span>
                <select
                  value={order.orderStatus}
                  onChange={(e) => updateStatus(order.id, e.target.value as OrderStatus)}
                  className="border border-stone-200 px-3 py-1.5 text-sm capitalize"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
