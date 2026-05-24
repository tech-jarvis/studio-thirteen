"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/format";
import {
  calculateOrderTotals,
  MIN_ORDER_AMOUNT,
  ONLINE_DISCOUNT_PERCENT,
} from "@/lib/pricing";
import { PaymentMethod } from "@/lib/types";
import { CreditCard, Banknote } from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, clear } = useCart();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    customerName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    notes: "",
  });

  const totals = calculateOrderTotals(totalPrice, paymentMethod);

  if (items.length === 0) {
    return (
      <main className="max-w-xl mx-auto px-4 py-20 text-center">
        <p className="text-stone-500 mb-4">Your cart is empty.</p>
        <Link href="/shop" className="text-rose-600 hover:underline">Continue shopping</Link>
      </main>
    );
  }

  if (totalPrice < MIN_ORDER_AMOUNT) {
    return (
      <main className="max-w-xl mx-auto px-4 py-20 text-center">
        <p className="text-stone-500 mb-4">Minimum order is {formatPrice(MIN_ORDER_AMOUNT)}.</p>
        <Link href="/cart" className="text-rose-600 hover:underline">Back to cart</Link>
      </main>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          paymentMethod,
          items: items.map((i) => ({
            productId: i.productId,
            productName: i.name,
            price: i.price,
            quantity: i.quantity,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Order failed");

      clear();

      if (paymentMethod === "online") {
        router.push(`/checkout/payment?orderId=${data.id}`);
      } else {
        router.push(`/order/${data.id}?confirmed=1`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-semibold text-stone-900 mb-8">Checkout</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          <section>
            <h2 className="text-lg font-semibold mb-4">Delivery Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="block sm:col-span-2">
                <span className="text-sm text-stone-600">Full Name *</span>
                <input required value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} className="mt-1 w-full border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:border-stone-400" />
              </label>
              <label className="block">
                <span className="text-sm text-stone-600">Phone *</span>
                <input required type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="03XX-XXXXXXX" className="mt-1 w-full border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:border-stone-400" />
              </label>
              <label className="block">
                <span className="text-sm text-stone-600">Email</span>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1 w-full border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:border-stone-400" />
              </label>
              <label className="block sm:col-span-2">
                <span className="text-sm text-stone-600">Address *</span>
                <textarea required rows={2} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="mt-1 w-full border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:border-stone-400" />
              </label>
              <label className="block">
                <span className="text-sm text-stone-600">City *</span>
                <input required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="mt-1 w-full border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:border-stone-400" />
              </label>
              <label className="block sm:col-span-2">
                <span className="text-sm text-stone-600">Order Notes</span>
                <textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Any special instructions..." className="mt-1 w-full border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:border-stone-400" />
              </label>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-4">Payment Method</h2>
            <div className="space-y-3">
              <label className={`flex items-start gap-4 p-4 border cursor-pointer transition-colors ${paymentMethod === "cod" ? "border-stone-900 bg-stone-50" : "border-stone-200 hover:border-stone-300"}`}>
                <input type="radio" name="payment" value="cod" checked={paymentMethod === "cod"} onChange={() => setPaymentMethod("cod")} className="mt-1" />
                <div>
                  <div className="flex items-center gap-2 font-medium text-stone-900">
                    <Banknote size={18} /> Cash on Delivery
                  </div>
                  <p className="text-sm text-stone-500 mt-1">Pay when your order arrives. No discount applied.</p>
                </div>
              </label>

              <label className={`flex items-start gap-4 p-4 border cursor-pointer transition-colors ${paymentMethod === "online" ? "border-rose-600 bg-rose-50" : "border-stone-200 hover:border-stone-300"}`}>
                <input type="radio" name="payment" value="online" checked={paymentMethod === "online"} onChange={() => setPaymentMethod("online")} className="mt-1" />
                <div>
                  <div className="flex items-center gap-2 font-medium text-stone-900">
                    <CreditCard size={18} /> Advance Payment (Online)
                    <span className="text-xs bg-rose-600 text-white px-2 py-0.5 rounded">{ONLINE_DISCOUNT_PERCENT}% OFF</span>
                  </div>
                  <p className="text-sm text-stone-500 mt-1">
                    Pay now via card, bank transfer, or mobile wallet. Save {ONLINE_DISCOUNT_PERCENT}% on your order total.
                  </p>
                </div>
              </label>
            </div>
          </section>
        </div>

        <div>
          <div className="bg-stone-50 p-6 sticky top-24">
            <h2 className="text-lg font-semibold mb-6">Order Summary</h2>
            <div className="space-y-2 text-sm">
              {items.map((item) => (
                <div key={item.productId} className="flex justify-between text-stone-600">
                  <span className="truncate max-w-[160px]">{item.name} ×{item.quantity}</span>
                  <span>{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-stone-200 mt-4 pt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatPrice(totals.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{formatPrice(totals.shipping)}</span>
              </div>
              {totals.discount > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span>Advance Payment Discount ({totals.discountPercent}%)</span>
                  <span>-{formatPrice(totals.discount)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-base pt-2 border-t border-stone-200">
                <span>Total</span>
                <span>{formatPrice(totals.total)}</span>
              </div>
            </div>

            {error && <p className="text-red-500 text-sm mt-4">{error}</p>}

            <button type="submit" disabled={loading} className="w-full mt-6 bg-stone-900 text-white py-3.5 text-sm font-medium hover:bg-rose-600 transition-colors disabled:opacity-50">
              {loading ? "Placing Order..." : paymentMethod === "online" ? "Continue to Payment" : "Place Order (COD)"}
            </button>
          </div>
        </div>
      </form>
    </main>
  );
}
