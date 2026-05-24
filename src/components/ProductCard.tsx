import Image from "next/image";
import Link from "next/link";
import { Product } from "@/lib/types";
import { formatPrice } from "@/lib/format";

export default function ProductCard({ product }: { product: Product }) {
  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  return (
    <Link href={`/product/${product.id}`} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden bg-stone-100 rounded-sm">
        <Image
          src={product.images[0] ?? "/brand/logo-black.svg"}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />

        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {discount && discount > 0 && (
            <span className="bg-rose-600 text-white text-[10px] px-2 py-0.5 font-medium tracking-wide">
              -{discount}%
            </span>
          )}
          {product.isNew && (
            <span className="bg-emerald-600 text-white text-[10px] px-2 py-0.5 font-medium tracking-wide">
              NEW
            </span>
          )}
          {product.isLatest && (
            <span className="bg-amber-600 text-white text-[10px] px-2 py-0.5 font-medium tracking-wide">
              LATEST
            </span>
          )}
          {product.stock <= 3 && product.stock > 0 && (
            <span className="bg-red-600 text-white text-[10px] px-2 py-0.5 font-medium tracking-wide">
              LOW STOCK
            </span>
          )}
          {product.stock === 0 && (
            <span className="bg-stone-600 text-white text-[10px] px-2 py-0.5 font-medium tracking-wide">
              OUT OF STOCK
            </span>
          )}
        </div>
      </div>

      <div className="mt-3 space-y-1">
        {product.brand && (
          <p className="text-xs text-stone-400 uppercase tracking-wider">
            {product.brand}
          </p>
        )}
        <p className="text-sm font-medium text-stone-900 group-hover:text-rose-700 transition-colors leading-snug line-clamp-2">
          {product.name}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-stone-900">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && (
            <span className="text-xs text-stone-400 line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
