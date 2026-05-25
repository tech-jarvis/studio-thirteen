"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/format";
import { Order } from "@/lib/types";
import { PaymentAccountDetails } from "@/lib/payment-details";
import { Upload, Building2, Smartphone } from "lucide-react";

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [order, setOrder] = useState<Order | null>(null);
  const [accounts, setAccounts] = useState<PaymentAccountDetails | null>(null);
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!orderId) return;
    fetch(`/api/orders/${orderId}`)
      .then((r) => r.json())
      .then(setOrder);
    fetch("/api/payment/details")
      .then((r) => r.json())
      .then(setAccounts);
  }, [orderId]);

  if (!orderId) {
    return (
      <main className="max-w-xl mx-auto px-4 py-20 text-center">
        <p className="text-stone-500">Invalid payment session.</p>
        <Link href="/shop" className="text-rose-600 hover:underline mt-4 inline-block">Back to shop</Link>
      </main>
    );
  }

  if (!order || !accounts) {
    return (
      <main className="max-w-xl mx-auto px-4 py-20 text-center text-stone-400">
        Loading...
      </main>
    );
  }

  if (order.paymentScreenshot) {
    return (
      <main className="max-w-xl mx-auto px-4 py-20 text-center">
        <p className="text-stone-700 font-medium mb-2">Payment proof already submitted</p>
        <p className="text-sm text-stone-500 mb-6">We will verify your payment and update your order.</p>
        <Link href={`/order/${orderId}?submitted=1`} className="text-rose-600 hover:underline">
          View order
        </Link>
      </main>
    );
  }

  function onFileChange(file: File | null) {
    setScreenshot(file);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(file ? URL.createObjectURL(file) : null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!screenshot) {
      setError("Please upload your payment screenshot.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("screenshot", screenshot);

      const res = await fetch(`/api/orders/${orderId}/payment-proof`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      router.push(`/order/${orderId}?submitted=1`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-lg mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold text-stone-900 mb-2">Pay &amp; confirm order</h1>
      <p className="text-sm text-stone-500 mb-2">
        Order <strong>#{order.orderNumber}</strong> — pay{" "}
        <strong>{formatPrice(order.total)}</strong> then upload proof.
      </p>
      {order.discount > 0 && (
        <p className="text-xs text-rose-600 mb-6">
          {order.discountPercent}% advance payment discount applied.
        </p>
      )}

      <div className="mb-8 p-4 bg-stone-50 border border-stone-200 text-sm space-y-3">
        <p className="font-medium text-stone-900 flex items-center gap-2">
          <Building2 size={16} /> Bank transfer
        </p>
        <div className="text-stone-600 space-y-1">
          <p><strong>Bank:</strong> {accounts.bankName}</p>
          <p><strong>Account title:</strong> {accounts.accountTitle}</p>
          <p><strong>Account #:</strong> {accounts.accountNumber}</p>
          <p><strong>IBAN:</strong> {accounts.iban}</p>
        </div>
        {(accounts.jazzCash || accounts.easyPaisa) && (
          <>
            <p className="font-medium text-stone-900 flex items-center gap-2 pt-2">
              <Smartphone size={16} /> Mobile wallets
            </p>
            <div className="text-stone-600 space-y-1">
              {accounts.jazzCash && <p><strong>JazzCash:</strong> {accounts.jazzCash}</p>}
              {accounts.easyPaisa && <p><strong>EasyPaisa:</strong> {accounts.easyPaisa}</p>}
            </div>
          </>
        )}
        <p className="text-xs text-stone-500 pt-2">{accounts.instructions}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">
            Payment screenshot *
          </label>
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-stone-200 p-8 cursor-pointer hover:border-stone-400 transition-colors">
            <Upload className="text-stone-400 mb-2" size={28} />
            <span className="text-sm text-stone-500">
              {screenshot ? screenshot.name : "Tap to upload screenshot"}
            </span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
            />
          </label>
          {preview && (
            <div className="mt-4 relative aspect-video border border-stone-200">
              <Image src={preview} alt="Payment preview" fill className="object-contain" unoptimized />
            </div>
          )}
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-stone-900 text-white py-3.5 text-sm font-medium hover:bg-rose-600 transition-colors disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Submit payment & confirm order"}
        </button>
      </form>
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
