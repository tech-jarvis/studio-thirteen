"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
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

type ProductPage = {
  items: Product[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

function ShopContent() {
  const searchParams = useSearchParams();
  const category = searchParams.get("category") ?? "";
  const tag = searchParams.get("tag") ?? "";
  const latest = searchParams.get("latest") === "true";
  const isNew = searchParams.get("new") === "true";

  const [products, setProducts] = useState<Product[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [sort, setSort] = useState("default");
  const [search, setSearch] = useState("");

  const fetchProducts = useCallback(
    async (page: number, append = false) => {
      const params = new URLSearchParams({ page: String(page), pageSize: "24" });
      if (category) params.set("category", category);
      if (tag) params.set("tag", tag);
      if (latest) params.set("latest", "true");
      if (isNew) params.set("new", "true");
      if (search.trim()) params.set("search", search.trim());

      if (append) setLoadingMore(true);
      else setLoading(true);

      try {
        const res = await fetch(`/api/products?${params}`);
        const data: ProductPage = await res.json();
        setProducts((prev) => (append ? [...prev, ...data.items] : data.items));
        setMeta({ total: data.total, page: data.page, totalPages: data.totalPages });
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [category, tag, latest, isNew, search]
  );

  useEffect(() => {
    fetchProducts(1);
  }, [fetchProducts]);

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

  const title =
    tag === "sale"
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
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-stone-900">{title}</h1>
          <p className="text-stone-400 text-sm mt-1">
            {loading ? "Loading..." : `${meta.total} product${meta.total !== 1 ? "s" : ""}`}
          </p>
        </div>
        <input
          type="search"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-stone-200 px-3 py-2 text-sm w-full sm:w-64 focus:outline-none focus:border-stone-400"
        />
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
        <p className="text-center py-24 text-stone-400">Loading products...</p>
      ) : filtered.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
          {meta.page < meta.totalPages && (
            <div className="text-center mt-12">
              <button
                type="button"
                onClick={() => fetchProducts(meta.page + 1, true)}
                disabled={loadingMore}
                className="px-8 py-3 border border-stone-900 text-sm font-medium hover:bg-stone-900 hover:text-white transition-colors disabled:opacity-50"
              >
                {loadingMore ? "Loading..." : "Load More"}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-24 text-stone-400">
          <p className="text-lg">No products found.</p>
          <p className="text-sm mt-2">Try a different category or search term.</p>
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
