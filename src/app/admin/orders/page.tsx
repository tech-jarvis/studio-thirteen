"use client";

import { useEffect, useState } from "react";
import { Order, OrderStatus } from "@/lib/types";
import { formatPrice } from "@/lib/format";

const STATUSES: OrderStatus[] = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  function load() {
    fetch("/api/admin/orders").then((r) => r.json()).then(setOrders);
  }

  useEffect(() => { load(); }, []);

  async function updateStatus(id: string, orderStatus: OrderStatus) {
    await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, orderStatus }),
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
                  <p className="font-semibold">{order.orderNumber}</p>
                  <p className="text-sm text-stone-500">{new Date(order.createdAt).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatPrice(order.total)}</p>
                  <p className="text-sm text-stone-500 capitalize">
                    {order.paymentMethod} · {order.paymentStatus}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mb-4">
                <div>
                  <p><strong>{order.customerName}</strong></p>
                  <p className="text-stone-500">{order.phone}</p>
                  <p className="text-stone-500">{order.address}, {order.city}</p>
                </div>
                <div>
                  {order.items.map((item, i) => (
                    <p key={i} className="text-stone-600">{item.productName} ×{item.quantity} — {formatPrice(item.price * item.quantity)}</p>
                  ))}
                  {order.discount > 0 && (
                    <p className="text-rose-600 text-xs mt-1">Advance payment discount: -{formatPrice(order.discount)}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm text-stone-500">Status:</span>
                <select
                  value={order.orderStatus}
                  onChange={(e) => updateStatus(order.id, e.target.value as OrderStatus)}
                  className="border border-stone-200 px-3 py-1.5 text-sm"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
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
