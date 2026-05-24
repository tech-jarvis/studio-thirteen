"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { formatPrice } from "@/lib/format";
import { Order } from "@/lib/types";
import { Search } from "lucide-react";

function TrackContent() {
  const searchParams = useSearchParams();
  const initialOrder = searchParams.get("order") ?? "";
  const [orderNumber, setOrderNumber] = useState(initialOrder);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleTrack(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setOrder(null);
    try {
      const res = await fetch(`/api/orders?orderNumber=${encodeURIComponent(orderNumber)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Order not found");
      setOrder(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Order not found");
    } finally {
      setLoading(false);
    }
  }

  const statusSteps = ["pending", "confirmed", "shipped", "delivered"];
  const currentStep = order ? statusSteps.indexOf(order.orderStatus) : -1;

  return (
    <main className="max-w-xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-semibold text-stone-900 mb-2">Track Your Order</h1>
      <p className="text-stone-500 text-sm mb-8">Enter your order number to see delivery status.</p>

      <form onSubmit={handleTrack} className="flex gap-2 mb-8">
        <input
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
          placeholder="e.g. ST2505231234"
          required
          className="flex-1 border border-stone-200 px-4 py-2.5 text-sm focus:outline-none focus:border-stone-400"
        />
        <button type="submit" disabled={loading} className="px-5 py-2.5 bg-stone-900 text-white text-sm font-medium hover:bg-rose-600 transition-colors disabled:opacity-50 flex items-center gap-2">
          <Search size={16} />
          {loading ? "..." : "Track"}
        </button>
      </form>

      {error && <p className="text-red-500 text-sm mb-6">{error}</p>}

      {order && (
        <div className="border border-stone-100 p-6 space-y-6">
          <div>
            <p className="text-xs text-stone-400 uppercase tracking-wider">Order Number</p>
            <p className="text-lg font-semibold">{order.orderNumber}</p>
          </div>

          <div className="flex justify-between text-sm">
            {statusSteps.map((step, i) => (
              <div key={step} className="flex flex-col items-center flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium mb-2 ${i <= currentStep ? "bg-rose-600 text-white" : "bg-stone-200 text-stone-500"}`}>
                  {i + 1}
                </div>
                <span className={`text-xs capitalize text-center ${i <= currentStep ? "text-stone-900 font-medium" : "text-stone-400"}`}>
                  {step}
                </span>
              </div>
            ))}
          </div>

          <div className="text-sm space-y-2 pt-4 border-t border-stone-100">
            <div className="flex justify-between">
              <span className="text-stone-500">Payment</span>
              <span className="capitalize">{order.paymentMethod === "cod" ? "Cash on Delivery" : "Online"} — {order.paymentStatus}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Total</span>
              <span className="font-semibold">{formatPrice(order.total)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Items</span>
              <span>{order.items.length}</span>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default function TrackPage() {
  return (
    <Suspense>
      <TrackContent />
    </Suspense>
  );
}
