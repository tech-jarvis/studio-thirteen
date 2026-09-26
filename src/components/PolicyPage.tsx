import Link from "next/link";
import { ReactNode } from "react";
import { formatPrice } from "@/lib/format";
import { MIN_ORDER_AMOUNT, SHIPPING_FEE } from "@/lib/pricing";
import { PageContent, StoreSettings, whatsAppUrl } from "@/lib/settings-types";

/** Placeholders admins can use in page text; replaced with live values. */
export function policyPlaceholders(store: StoreSettings): Record<string, string> {
  return {
    businessName: store.businessName,
    deliveryDays: store.deliveryDays,
    phone: store.phone,
    email: store.email,
    shippingFee: formatPrice(SHIPPING_FEE),
    minOrder: formatPrice(MIN_ORDER_AMOUNT),
  };
}

function fill(text: string, values: Record<string, string>) {
  return text.replace(/\{(\w+)\}/g, (match, key) => values[key] ?? match);
}

/**
 * Render admin-written page text. Format:
 *   "## Heading" lines become headings, "- item" lines become bullet lists,
 *   and other lines separated by a blank line become paragraphs.
 * Rendered as plain React text — no HTML is interpreted.
 */
function renderBody(body: string): ReactNode[] {
  const blocks: ReactNode[] = [];
  let paragraph: string[] = [];
  let list: string[] = [];

  const flush = () => {
    if (paragraph.length) {
      blocks.push(<p key={blocks.length}>{paragraph.join(" ")}</p>);
      paragraph = [];
    }
    if (list.length) {
      blocks.push(
        <ul key={blocks.length} className="list-disc pl-5 space-y-1">
          {list.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      );
      list = [];
    }
  };

  for (const raw of body.split("\n")) {
    const line = raw.trim();
    if (!line) {
      flush();
    } else if (line.startsWith("## ")) {
      flush();
      blocks.push(
        <h2 key={blocks.length} className="text-lg font-semibold text-stone-900 pt-2">
          {line.slice(3)}
        </h2>
      );
    } else if (line.startsWith("- ")) {
      if (paragraph.length) flush();
      list.push(line.slice(2));
    } else {
      if (list.length) flush();
      paragraph.push(line);
    }
  }
  flush();
  return blocks;
}

export default function PolicyPage({
  page,
  store,
}: {
  page: PageContent;
  store: StoreSettings;
}) {
  const values = policyPlaceholders(store);
  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-semibold text-stone-900 mb-6">{fill(page.title, values)}</h1>

      <div className="text-sm space-y-3 text-stone-600 leading-relaxed">
        {renderBody(fill(page.body, values))}
      </div>

      <p className="mt-8 text-sm">
        <a href={whatsAppUrl(store.whatsapp)} target="_blank" rel="noopener noreferrer" className="text-rose-600 hover:underline">
          WhatsApp {store.phone}
        </a>
        {" · "}
        <a href={`mailto:${store.email}`} className="text-rose-600 hover:underline">
          {store.email}
        </a>
        {" · "}
        <Link href="/track" className="text-rose-600 hover:underline">
          Track your order
        </Link>
      </p>
    </main>
  );
}
