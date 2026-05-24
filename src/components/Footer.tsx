import Link from "next/link";
import Logo from "@/components/Logo";

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
              <li>hello@studiothirteen.pk</li>
              <li>WhatsApp: 0300-0000000</li>
              <li>Lahore, Pakistan</li>
              <li>Mon–Sat, 10am–7pm</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-stone-700 mt-12 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-stone-500">
          <p>© {new Date().getFullYear()} Studio Thirteen. All rights reserved.</p>
          <p>Prices in PKR · 5% discount on advance payment</p>
        </div>
      </div>
    </footer>
  );
}
