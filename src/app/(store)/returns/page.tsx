import Link from "next/link";
import { SITE, getWhatsAppUrl } from "@/lib/site-config";

export default function ReturnsPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-semibold text-stone-900 mb-6">Returns &amp; Exchanges</h1>

      <div className="prose prose-stone text-sm space-y-6 text-stone-600">
        <section>
          <h2 className="text-lg font-semibold text-stone-900 mb-2">Our Policy</h2>
          <p>
            At {SITE.businessName}, we deal in branded unstitched and ready-to-wear fashion.
            Because of the nature of fabric and suit products, we handle returns and exchanges
            on a case-by-case basis.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-stone-900 mb-2">Eligible for Return / Exchange</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Wrong item received (different product than ordered)</li>
            <li>Damaged or defective product on arrival</li>
            <li>Significant difference from product description or images</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-stone-900 mb-2">Not Eligible</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Change of mind after order is confirmed</li>
            <li>Minor colour variation due to screen settings</li>
            <li>Products that have been cut, stitched, or altered</li>
            <li>Sale items marked as final sale</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-stone-900 mb-2">How to Request</h2>
          <p>
            Contact us within <strong>48 hours</strong> of receiving your order via WhatsApp or
            email. Include your order number and photos of the issue.
          </p>
          <p className="mt-2">
            <a href={getWhatsAppUrl()} target="_blank" rel="noopener noreferrer" className="text-rose-600 hover:underline">
              WhatsApp {SITE.phone}
            </a>
            {" · "}
            <a href={`mailto:${SITE.email}`} className="text-rose-600 hover:underline">
              {SITE.email}
            </a>
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-stone-900 mb-2">Refunds</h2>
          <p>
            Approved refunds are processed within 5–7 working days to your original payment
            method (bank transfer) or as store credit, depending on the situation.
          </p>
        </section>

        <p>
          <Link href="/shop" className="text-rose-600 hover:underline">
            ← Continue shopping
          </Link>
        </p>
      </div>
    </main>
  );
}
