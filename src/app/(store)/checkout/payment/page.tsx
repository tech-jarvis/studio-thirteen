"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { formatPrice } from "@/lib/format";
import { CreditCard, Smartphone, Building2 } from "lucide-react";

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [method, setMethod] = useState<"card" | "bank" | "wallet">("card");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!orderId) {
    return (
      <main className="max-w-xl mx-auto px-4 py-20 text-center">
        <p className="text-stone-500">Invalid payment session.</p>
        <Link href="/shop" className="text-rose-600 hover:underline mt-4 inline-block">Back to shop</Link>
      </main>
    );
  }

  async function handlePay() {
    setLoading(true);
    setError("");
    try {
      await new Promise((r) => setTimeout(r, 1500));
      const res = await fetch("/api/payment/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      if (!res.ok) throw new Error("Payment failed");
      router.push(`/order/${orderId}?paid=1`);
    } catch {
      setError("Payment could not be processed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-lg mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold text-stone-900 mb-2">Complete Payment</h1>
      <p className="text-sm text-stone-500 mb-8">
        Your 5% advance payment discount has been applied. Choose a payment method below.
      </p>

      <div className="space-y-3 mb-8">
        {[
          { id: "card" as const, label: "Credit / Debit Card", icon: CreditCard },
          { id: "bank" as const, label: "Bank Transfer", icon: Building2 },
          { id: "wallet" as const, label: "JazzCash / EasyPaisa", icon: Smartphone },
        ].map(({ id, label, icon: Icon }) => (
          <label
            key={id}
            className={`flex items-center gap-3 p-4 border cursor-pointer ${method === id ? "border-rose-600 bg-rose-50" : "border-stone-200"}`}
          >
            <input type="radio" checked={method === id} onChange={() => setMethod(id)} />
            <Icon size={20} />
            <span className="text-sm font-medium">{label}</span>
          </label>
        ))}
      </div>

      {method === "card" && (
        <div className="space-y-4 mb-8 p-4 bg-stone-50 border border-stone-100">
          <label className="block">
            <span className="text-xs text-stone-500">Card Number</span>
            <input placeholder="4242 4242 4242 4242" className="mt-1 w-full border border-stone-200 px-3 py-2 text-sm" />
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-xs text-stone-500">Expiry</span>
              <input placeholder="MM/YY" className="mt-1 w-full border border-stone-200 px-3 py-2 text-sm" />
            </label>
            <label className="block">
              <span className="text-xs text-stone-500">CVV</span>
              <input placeholder="123" className="mt-1 w-full border border-stone-200 px-3 py-2 text-sm" />
            </label>
          </div>
          <p className="text-xs text-stone-400">Demo payment — no real charge will be made.</p>
        </div>
      )}

      {method === "bank" && (
        <div className="mb-8 p-4 bg-stone-50 border border-stone-100 text-sm text-stone-600 space-y-1">
          <p><strong>Bank:</strong> HBL</p>
          <p><strong>Account:</strong> Studio Thirteen</p>
          <p><strong>IBAN:</strong> PK00HABB00000000000000</p>
          <p className="text-xs text-stone-400 pt-2">Demo — click Pay Now to simulate confirmation.</p>
        </div>
      )}

      {method === "wallet" && (
        <div className="mb-8 p-4 bg-stone-50 border border-stone-100">
          <label className="block">
            <span className="text-xs text-stone-500">Mobile Number</span>
            <input placeholder="03XX-XXXXXXX" className="mt-1 w-full border border-stone-200 px-3 py-2 text-sm" />
          </label>
          <p className="text-xs text-stone-400 mt-2">Demo — click Pay Now to simulate confirmation.</p>
        </div>
      )}

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      <button
        onClick={handlePay}
        disabled={loading}
        className="w-full bg-rose-600 text-white py-3.5 text-sm font-medium hover:bg-rose-700 transition-colors disabled:opacity-50"
      >
        {loading ? "Processing..." : "Pay Now"}
      </button>
    </main>
  );
}

export default function PaymentPage() {
  return (
    <Suspense>
      <PaymentContent />
    </Suspense>
  );
}
