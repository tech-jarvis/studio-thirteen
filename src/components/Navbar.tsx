"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { ShoppingBag, Menu, X, ChevronDown } from "lucide-react";
import { useState } from "react";
import Logo from "@/components/Logo";
import { SITE } from "@/lib/site-config";

const seasonLinks = [
  { href: "/shop?category=summer-lawn", label: "Summer Lawn" },
  { href: "/shop?category=winter-collection", label: "Winter" },
  { href: "/shop?category=eid-collection", label: "Eid Collection" },
  { href: "/shop?category=festive", label: "Festive" },
];

const typeLinks = [
  { href: "/shop?category=2-piece", label: "2 Piece" },
  { href: "/shop?category=3-piece", label: "3 Piece" },
  { href: "/shop?category=embroidered", label: "Embroidered" },
  { href: "/shop?category=printed", label: "Printed" },
  { href: "/shop?category=unstitched", label: "Unstitched" },
  { href: "/shop?category=ready-to-wear", label: "Ready to Wear" },
  { href: "/shop?category=patches", label: "Patches" },
];

export default function Navbar() {
  const { totalItems } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [seasonOpen, setSeasonOpen] = useState(false);
  const [typeOpen, setTypeOpen] = useState(false);

  return (
    <>
      <div className="bg-rose-700 text-white text-center text-xs py-2 px-4 tracking-wide">
        Minimum order Rs. 1,000 · Delivery {SITE.deliveryDays} ·{" "}
        <span className="font-semibold">5% off on bank transfer</span>
      </div>
      <header className="sticky top-0 z-50 bg-white border-b border-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Logo textClassName="text-xl" className="text-stone-900" />

            <nav className="hidden lg:flex items-center gap-6">
              <Link href="/shop" className="text-sm text-stone-600 hover:text-stone-900 transition-colors">
                Shop All
              </Link>
              <Link href="/shop?tag=sale" className="text-sm text-rose-600 hover:text-rose-800 font-medium transition-colors">
                Sale
              </Link>
              <Link href="/shop?latest=true" className="text-sm text-stone-600 hover:text-stone-900 transition-colors">
                Latest
              </Link>

              <div className="relative group">
                <button className="flex items-center gap-1 text-sm text-stone-600 hover:text-stone-900 transition-colors">
                  Season <ChevronDown size={14} />
                </button>
                <div className="absolute top-full left-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <div className="bg-white border border-stone-100 shadow-lg py-2 min-w-[180px]">
                    {seasonLinks.map((link) => (
                      <Link key={link.href} href={link.href} className="block px-4 py-2 text-sm text-stone-600 hover:bg-stone-50 hover:text-stone-900">
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              <div className="relative group">
                <button className="flex items-center gap-1 text-sm text-stone-600 hover:text-stone-900 transition-colors">
                  Product Type <ChevronDown size={14} />
                </button>
                <div className="absolute top-full left-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <div className="bg-white border border-stone-100 shadow-lg py-2 min-w-[180px]">
                    {typeLinks.map((link) => (
                      <Link key={link.href} href={link.href} className="block px-4 py-2 text-sm text-stone-600 hover:bg-stone-50 hover:text-stone-900">
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              <Link href="/track" className="text-sm text-stone-600 hover:text-stone-900 transition-colors">
                Track Order
              </Link>
            </nav>

            <div className="flex items-center gap-4">
              <Link href="/cart" className="relative p-1 text-stone-700 hover:text-stone-900 transition-colors" aria-label="Cart">
                <ShoppingBag size={22} />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-medium">
                    {totalItems > 9 ? "9+" : totalItems}
                  </span>
                )}
              </Link>
              <button className="lg:hidden p-1 text-stone-700" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
                {menuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {menuOpen && (
          <div className="lg:hidden border-t border-stone-100 bg-white max-h-[70vh] overflow-y-auto">
            <nav className="flex flex-col px-4 py-4 gap-1">
              <Link href="/shop" onClick={() => setMenuOpen(false)} className="py-2 text-sm">Shop All</Link>
              <Link href="/shop?tag=sale" onClick={() => setMenuOpen(false)} className="py-2 text-sm text-rose-600">Sale</Link>
              <Link href="/shop?latest=true" onClick={() => setMenuOpen(false)} className="py-2 text-sm">Latest</Link>
              <button onClick={() => setSeasonOpen(!seasonOpen)} className="py-2 text-sm text-left flex justify-between">
                Season <ChevronDown size={14} className={seasonOpen ? "rotate-180" : ""} />
              </button>
              {seasonOpen && seasonLinks.map((l) => (
                <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)} className="py-1.5 pl-4 text-sm text-stone-500">{l.label}</Link>
              ))}
              <button onClick={() => setTypeOpen(!typeOpen)} className="py-2 text-sm text-left flex justify-between">
                Product Type <ChevronDown size={14} className={typeOpen ? "rotate-180" : ""} />
              </button>
              {typeOpen && typeLinks.map((l) => (
                <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)} className="py-1.5 pl-4 text-sm text-stone-500">{l.label}</Link>
              ))}
              <Link href="/track" onClick={() => setMenuOpen(false)} className="py-2 text-sm">Track Order</Link>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}