import Link from "next/link";
import { SITE } from "@/lib/site-config";

export default function ShippingPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-semibold text-stone-900 mb-6">Shipping Policy</h1>

      <div className="prose prose-stone text-sm space-y-6 text-stone-600">
        <section>
          <h2 className="text-lg font-semibold text-stone-900 mb-2">Delivery Time</h2>
          <p>
            Orders are delivered within <strong>{SITE.deliveryDays}</strong> across Pakistan,
            depending on your city and courier availability.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-stone-900 mb-2">Shipping Fee</h2>
          <p>
            A flat shipping fee of <strong>Rs. 200</strong> applies to all orders. This is added
            at checkout.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-stone-900 mb-2">Minimum Order</h2>
          <p>
            Minimum order value is <strong>Rs. 1,000</strong>. Orders below this amount cannot
            be placed.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-stone-900 mb-2">Order Processing</h2>
          <p>
            Once your order is confirmed (and payment verified for bank transfer orders), we
            prepare and dispatch your parcel. You can track your order anytime using your order
            number on our{" "}
            <Link href="/track" className="text-rose-600 hover:underline">
              Track Order
            </Link>{" "}
            page.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-stone-900 mb-2">Cash on Delivery</h2>
          <p>
            COD is available nationwide. Please keep the exact amount ready when the courier
            arrives.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-stone-900 mb-2">Contact</h2>
          <p>
            Questions about your delivery? WhatsApp us at{" "}
            <a href={`https://wa.me/${SITE.phoneWhatsApp}`} className="text-rose-600 hover:underline">
              {SITE.phone}
            </a>{" "}
            or email{" "}
            <a href={`mailto:${SITE.email}`} className="text-rose-600 hover:underline">
              {SITE.email}
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
