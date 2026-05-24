"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { Product } from "@/lib/types";
import { Suspense } from "react";

const SORT_OPTIONS = [
  { value: "default", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "discount", label: "Biggest Discount" },
];

function ShopContent() {
  const searchParams = useSearchParams();
  const category = searchParams.get("category") ?? "";
  const tag = searchParams.get("tag") ?? "";
  const latest = searchParams.get("latest") === "true";
  const isNew = searchParams.get("new") === "true";

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("default");

  useEffect(() => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (tag) params.set("tag", tag);
    if (latest) params.set("latest", "true");
    if (isNew) params.set("new", "true");

    setLoading(true);
    fetch(`/api/products?${params}`)
      .then((r) => r.json())
      .then((data) => setProducts(data))
      .finally(() => setLoading(false));
  }, [category, tag, latest, isNew]);

  const filtered = useMemo(() => {
    const list = [...products];
    switch (sort) {
      case "price-asc":
        list.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        list.sort((a, b) => b.price - a.price);
        break;
      case "discount":
        list.sort((a, b) => {
          const da = a.originalPrice ? (a.originalPrice - a.price) / a.originalPrice : 0;
          const db = b.originalPrice ? (b.originalPrice - b.price) / b.originalPrice : 0;
          return db - da;
        });
        break;
    }
    return list;
  }, [products, sort]);

  const title = tag === "sale"
    ? "On Sale"
    : latest
    ? "Latest Products"
    : isNew
    ? "New Arrivals"
    : category
    ? category.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : "Shop All";

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-stone-900">{title}</h1>
        <p className="text-stone-400 text-sm mt-1">
          {loading ? "Loading..." : `${filtered.length} product${filtered.length !== 1 ? "s" : ""}`}
        </p>
      </div>

      <div className="flex justify-end mb-10">
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="text-sm border border-stone-200 px-3 py-1.5 text-stone-600 bg-white focus:outline-none focus:border-stone-400"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-24 text-stone-400">Loading products...</div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 text-stone-400">
          <p className="text-lg">No products found.</p>
          <p className="text-sm mt-2">Try a different category.</p>
        </div>
      )}
    </main>
  );
}

export default function ShopPage() {
  return (
    <Suspense>
      <ShopContent />
    </Suspense>
  );
}
