"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/format";
import { MIN_ORDER_AMOUNT } from "@/lib/pricing";
import { Minus, Plus, Trash2 } from "lucide-react";

export default function CartPage() {
  const { items, remove, updateQty, totalPrice, totalItems } = useCart();
  const belowMinimum = totalPrice < MIN_ORDER_AMOUNT;

  if (items.length === 0) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-2xl">🛍️</span>
          </div>
          <h1 className="text-2xl font-semibold text-stone-900 mb-3">Your cart is empty</h1>
          <p className="text-stone-400 text-sm mb-8">
            Browse our branded lawn, embroidered suits, and patches.
          </p>
          <Link href="/shop" className="inline-block bg-stone-900 text-white text-sm font-medium px-8 py-3 hover:bg-rose-600 transition-colors">
            Shop Now
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-semibold text-stone-900 mb-2">Your Cart</h1>
      <p className="text-stone-400 text-sm mb-10">{totalItems} item{totalItems !== 1 ? "s" : ""}</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-6">
          {items.map((item) => (
            <div key={item.productId} className="flex gap-4 sm:gap-6 pb-6 border-b border-stone-100">
              <Link href={`/product/${item.productId}`} className="relative w-24 sm:w-32 aspect-[3/4] flex-shrink-0 bg-stone-100 overflow-hidden rounded-sm">
                <Image src={item.image} alt={item.name} fill className="object-cover" sizes="128px" />
              </Link>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between gap-2">
                  <Link href={`/product/${item.productId}`} className="text-sm font-medium text-stone-900 hover:text-rose-700 transition-colors">
                    {item.name}
                  </Link>
                  <button onClick={() => remove(item.productId)} className="text-stone-300 hover:text-red-500 transition-colors" aria-label="Remove item">
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center border border-stone-200">
                    <button onClick={() => updateQty(item.productId, item.quantity - 1)} className="px-3 py-1.5 text-stone-600 hover:bg-stone-50" aria-label="Decrease">
                      <Minus size={14} />
                    </button>
                    <span className="px-3 py-1.5 text-sm min-w-[2rem] text-center">{item.quantity}</span>
                    <button onClick={() => updateQty(item.productId, item.quantity + 1)} className="px-3 py-1.5 text-stone-600 hover:bg-stone-50" aria-label="Increase">
                      <Plus size={14} />
                    </button>
                  </div>
                  <p className="text-sm font-semibold">{formatPrice(item.price * item.quantity)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div>
          <div className="bg-stone-50 p-6 sticky top-24">
            <h2 className="text-lg font-semibold mb-6">Order Summary</h2>
            <div className="space-y-3 text-sm">
              {items.map((item) => (
                <div key={item.productId} className="flex justify-between text-stone-600">
                  <span className="truncate max-w-[180px]">{item.name} ×{item.quantity}</span>
                  <span>{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-stone-200 mt-6 pt-4 flex justify-between">
              <span className="font-semibold">Subtotal</span>
              <span className="font-semibold">{formatPrice(totalPrice)}</span>
            </div>
            {belowMinimum && (
              <p className="text-xs text-red-500 mt-2">
                Minimum order is {formatPrice(MIN_ORDER_AMOUNT)}. Add more items to checkout.
              </p>
            )}
            <p className="text-xs text-stone-400 mt-2 mb-6">
              Shipping Rs. 200 · 5% off on advance payment
            </p>
            {belowMinimum ? (
              <button disabled className="w-full bg-stone-200 text-stone-400 py-3.5 text-sm font-medium cursor-not-allowed">
                Proceed to Checkout
              </button>
            ) : (
              <Link href="/checkout" className="block w-full bg-stone-900 text-white py-3.5 text-sm font-medium hover:bg-rose-600 transition-colors tracking-wide text-center">
                Proceed to Checkout
              </Link>
            )}
            <Link href="/shop" className="block text-center text-sm text-stone-500 hover:text-stone-900 mt-4">
              ← Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
