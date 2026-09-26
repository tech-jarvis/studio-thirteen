"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { Product } from "@/lib/types";
import { Suspense } from "react";

const SORT_OPTIONS = [
  { value: "default", label: "Newest" },
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

type Results = {
  /** Which filters these results belong to. */
  key: string;
  products: Product[];
  meta: { total: number; page: number; totalPages: number };
  error: string;
};

async function fetchProductPage(filters: string, page: number) {
  const params = new URLSearchParams(filters);
  params.set("page", String(page));
  params.set("pageSize", "48");
  const res = await fetch(`/api/products?${params}`);
  const data = (await res.json()) as Partial<ProductPage> & { error?: string };
  if (!res.ok) throw new Error(data.error || "Failed to load products");
  const items = Array.isArray(data.items) ? data.items : [];
  return {
    items,
    meta: {
      total: data.total ?? items.length,
      page: data.page ?? page,
      totalPages: data.totalPages ?? 1,
    },
  };
}

function ShopContent() {
  const searchParams = useSearchParams();
  const category = searchParams.get("category") ?? "";
  const tag = searchParams.get("tag") ?? "";
  const latest = searchParams.get("latest") === "true";
  const isNew = searchParams.get("new") === "true";

  const [sort, setSort] = useState("default");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loadingMore, setLoadingMore] = useState(false);

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Query string for the current filters; doubles as the results key.
  const filters = useMemo(() => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (tag) params.set("tag", tag);
    if (latest) params.set("latest", "true");
    if (isNew) params.set("new", "true");
    if (search.trim()) params.set("search", search.trim());
    return params.toString();
  }, [category, tag, latest, isNew, search]);

  const [results, setResults] = useState<Results | null>(null);
  // Results for older filters are hidden until the new ones arrive.
  const current = results?.key === filters ? results : null;
  const loading = current === null;
  const products = useMemo(() => current?.products ?? [], [current]);
  const meta = current?.meta ?? { total: 0, page: 1, totalPages: 0 };
  const error = current?.error ?? "";

  useEffect(() => {
    let cancelled = false;
    fetchProductPage(filters, 1)
      .then(({ items, meta }) => {
        if (!cancelled) setResults({ key: filters, products: items, meta, error: "" });
      })
      .catch((e) => {
        if (cancelled) return;
        setResults({
          key: filters,
          products: [],
          meta: { total: 0, page: 1, totalPages: 0 },
          error: e instanceof Error ? e.message : "Failed to load products",
        });
      });
    return () => {
      cancelled = true;
    };
  }, [filters]);

  async function loadMore() {
    if (!current) return;
    setLoadingMore(true);
    try {
      const { items, meta: next } = await fetchProductPage(filters, current.meta.page + 1);
      setResults((prev) =>
        prev && prev.key === filters
          ? { ...prev, products: [...prev.products, ...items], meta: next, error: "" }
          : prev
      );
    } catch (e) {
      setResults((prev) =>
        prev && prev.key === filters
          ? { ...prev, error: e instanceof Error ? e.message : "Failed to load products" }
          : prev
      );
    } finally {
      setLoadingMore(false);
    }
  }

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
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
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

      {error && (
        <p className="text-center text-red-500 text-sm mb-6">{error}</p>
      )}

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
                onClick={loadMore}
                disabled={loadingMore}
                className="px-8 py-3 border border-stone-900 text-sm font-medium hover:bg-stone-900 hover:text-white transition-colors disabled:opacity-50"
              >
                {loadingMore ? "Loading..." : `Load More (${products.length} of ${meta.total})`}
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
