import Link from "next/link";
import Logo from "@/components/Logo";
import { StoreSettings, whatsAppUrl } from "@/lib/settings-types";
import { ONLINE_DISCOUNT_PERCENT } from "@/lib/pricing";

export default function Footer({
  store,
  shopLinks,
}: {
  store: StoreSettings;
  /** A few category links shown under "Shop". */
  shopLinks: { href: string; label: string }[];
}) {
  const social = [
    ["Instagram", store.social.instagram],
    ["Facebook", store.social.facebook],
    ["TikTok", store.social.tiktok],
  ].filter(([, url]) => url);

  return (
    <footer className="bg-stone-900 text-stone-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          <div className="col-span-2 md:col-span-1">
            <Logo textClassName="text-lg" className="text-white mb-3 block" />
            <p className="text-sm leading-relaxed text-stone-400">{store.tagline}</p>
            {social.length > 0 && (
              <div className="flex flex-wrap gap-4 mt-4 text-sm">
                {social.map(([label, url]) => (
                  <a key={label} href={url} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                    {label}
                  </a>
                ))}
              </div>
            )}
          </div>

          <div>
            <p className="text-white text-sm font-medium mb-4 uppercase tracking-wider">
              Shop
            </p>
            <ul className="space-y-2 text-sm">
              {[
                ["All Products", "/shop"],
                ["Sale", "/shop?tag=sale"],
                ["Latest", "/shop?latest=true"],
                ...shopLinks.map((l) => [l.label, l.href]),
              ].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-white text-sm font-medium mb-4 uppercase tracking-wider">
              Customer
            </p>
            <ul className="space-y-2 text-sm">
              {[
                ["Track Order", "/track"],
                ["Shipping Policy", "/shipping"],
                ["Returns", "/returns"],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-white text-sm font-medium mb-4 uppercase tracking-wider">
              Contact
            </p>
            <ul className="space-y-2 text-sm text-stone-400">
              <li>
                <a
                  href={`mailto:${store.email}`}
                  className="hover:text-white transition-colors"
                >
                  {store.email}
                </a>
              </li>
              <li>
                <a
                  href={whatsAppUrl(store.whatsapp)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  WhatsApp: {store.phone}
                </a>
              </li>
              {store.address && <li>{store.address}</li>}
              {store.hours && <li>{store.hours}</li>}
            </ul>
          </div>
        </div>

        <div className="border-t border-stone-700 mt-12 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-stone-500">
          <p>© {new Date().getFullYear()} {store.businessName}. All rights reserved.</p>
          <p>Prices in PKR · {ONLINE_DISCOUNT_PERCENT}% off on bank transfer</p>
        </div>
      </div>
    </footer>
  );
}
