"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { isOptimizableImage } from "@/lib/image-host";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { Product } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import ProductCard from "@/components/ProductCard";
import { use } from "react";
import { Play } from "lucide-react";

export default function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [product, setProduct] = useState<Product | null | undefined>(undefined);
  const [related, setRelated] = useState<Product[]>([]);
  const [activeImage, setActiveImage] = useState(0);
  const [added, setAdded] = useState(false);
  const { add } = useCart();

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then((p: Product) => {
        setProduct(p);
        fetch("/api/products?pageSize=12")
          .then((r) => r.json())
          .then((data: { items?: Product[] }) => {
            const list = Array.isArray(data.items) ? data.items : [];
            setRelated(
              list
                .filter(
                  (x) =>
                    x.id !== p.id &&
                    x.categoryIds.some((cid) => p.categoryIds.includes(cid))
                )
                .slice(0, 4)
            );
          })
          .catch(() => setRelated([]));
      })
      .catch(() => setProduct(null));
  }, [id]);

  if (product === undefined) {
    return (
      <main className="max-w-7xl mx-auto px-4 py-20 text-center text-stone-400">
        Loading...
      </main>
    );
  }

  if (!product) notFound();

  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  // Images first, then videos, in one gallery.
  const media = [
    ...product.images.map((src) => ({ type: "image" as const, src })),
    ...(product.videos ?? []).map((src) => ({ type: "video" as const, src })),
  ];
  const current = media[activeImage] ?? media[0];

  function handleAdd() {
    if (!product || product.stock <= 0) return;
    add({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <nav className="text-xs text-stone-400 mb-8 flex gap-2 flex-wrap">
        <Link href="/" className="hover:text-stone-700">Home</Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-stone-700">Shop</Link>
        <span>/</span>
        <span className="text-stone-600">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
        <div className="space-y-3">
          <div className="relative aspect-[3/4] bg-stone-100 overflow-hidden rounded-sm">
            {current?.type === "video" ? (
              <video
                key={current.src}
                src={current.src}
                controls
                playsInline
                preload="metadata"
                className="absolute inset-0 w-full h-full object-contain bg-black"
              />
            ) : current ? (
              <Image
                src={current.src}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
                unoptimized={!isOptimizableImage(current.src)}
              />
            ) : null}
            {discount && current?.type !== "video" && (
              <div className="absolute top-3 left-3 bg-rose-600 text-white text-xs px-2 py-1 font-medium">
                -{discount}%
              </div>
            )}
          </div>
          {media.length > 1 && (
            <div className="flex flex-wrap gap-2">
              {media.map((item, i) => (
                <button
                  key={`${item.type}-${i}`}
                  onClick={() => setActiveImage(i)}
                  aria-label={item.type === "video" ? "Play video" : `Image ${i + 1}`}
                  className={`relative w-20 aspect-square overflow-hidden rounded-sm border-2 transition-colors bg-stone-900 ${
                    activeImage === i ? "border-stone-900" : "border-transparent"
                  }`}
                >
                  {item.type === "video" ? (
                    <>
                      <video src={`${item.src}#t=0.5`} muted playsInline preload="metadata" className="absolute inset-0 w-full h-full object-cover opacity-80" />
                      <span className="absolute inset-0 flex items-center justify-center">
                        <span className="bg-white/90 rounded-full p-1.5 text-stone-900">
                          <Play size={14} fill="currentColor" />
                        </span>
                      </span>
                    </>
                  ) : (
                    <Image src={item.src} alt="" fill className="object-cover" sizes="80px" unoptimized={!isOptimizableImage(item.src)} />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col">
          {product.brand && (
            <p className="text-xs text-stone-400 uppercase tracking-wider mb-2">{product.brand}</p>
          )}
          <h1 className="text-2xl sm:text-3xl font-semibold text-stone-900 mb-4">{product.name}</h1>

          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl font-semibold text-stone-900">{formatPrice(product.price)}</span>
            {product.originalPrice && (
              <>
                <span className="text-base text-stone-400 line-through">{formatPrice(product.originalPrice)}</span>
                <span className="text-sm text-rose-600 font-medium">
                  Save {formatPrice(product.originalPrice - product.price)}
                </span>
              </>
            )}
          </div>

          <p className="text-stone-600 text-sm leading-relaxed mb-8">{product.description}</p>

          {product.stock <= 3 && product.stock > 0 && (
            <p className="text-red-500 text-xs font-medium mb-4">Only {product.stock} left in stock</p>
          )}
          {product.stock === 0 && (
            <p className="text-red-500 text-sm font-medium mb-4">Out of Stock</p>
          )}

          <button
            onClick={handleAdd}
            disabled={product.stock <= 0}
            className={`w-full py-4 text-sm font-medium tracking-wide transition-colors ${
              added
                ? "bg-green-600 text-white"
                : product.stock > 0
                ? "bg-stone-900 text-white hover:bg-rose-600"
                : "bg-stone-200 text-stone-400 cursor-not-allowed"
            }`}
          >
            {added ? "Added to Cart ✓" : product.stock > 0 ? "Add to Cart" : "Out of Stock"}
          </button>

          {added && (
            <Link href="/cart" className="mt-3 text-center text-sm text-stone-600 hover:text-stone-900 underline underline-offset-2">
              View Cart →
            </Link>
          )}

          <div className="mt-8 pt-6 border-t border-stone-100">
            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <span key={tag} className="text-xs text-stone-400 border border-stone-200 px-2 py-0.5 capitalize">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="text-xl font-semibold text-stone-900 mb-8">You May Also Like</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
