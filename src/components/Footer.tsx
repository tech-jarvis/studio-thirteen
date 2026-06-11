import Link from "next/link";
import Logo from "@/components/Logo";
import { SITE, getWhatsAppUrl } from "@/lib/site-config";

export default function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          <div className="col-span-2 md:col-span-1">
            <Logo textClassName="text-lg" className="text-white mb-3 block" />
            <p className="text-sm leading-relaxed text-stone-400">
              Premium branded lawn, embroidered suits, and patches at honest
              prices. We deal in brands only.
            </p>
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
                ["Summer Lawn", "/shop?category=summer-lawn"],
                ["3 Piece", "/shop?category=3-piece"],
                ["Embroidered", "/shop?category=embroidered"],
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
                  href={`mailto:${SITE.email}`}
                  className="hover:text-white transition-colors"
                >
                  {SITE.email}
                </a>
              </li>
              <li>
                <a
                  href={getWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  WhatsApp: {SITE.phone}
                </a>
              </li>
              <li>{SITE.address}</li>
              <li>{SITE.hours}</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-stone-700 mt-12 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-stone-500">
          <p>© {new Date().getFullYear()} {SITE.businessName}. All rights reserved.</p>
          <p>Prices in PKR · 5% off on bank transfer</p>
        </div>
      </div>
    </footer>
  );
}
