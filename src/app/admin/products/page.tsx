"use client";

import { useEffect, useState } from "react";
import { Product, Category } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import { Plus, Trash2, Star } from "lucide-react";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    originalPrice: "",
    brand: "",
    stock: "10",
    image: "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=800&q=80",
    categoryIds: [] as string[],
    featured: false,
    isNew: false,
    isLatest: false,
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [storageBackend, setStorageBackend] = useState<string>("local-json");

  function load() {
    Promise.all([
      fetch("/api/admin/products").then((r) => r.json()),
      fetch("/api/admin/categories").then((r) => r.json()),
      fetch("/api/storage/status").then((r) => r.json()),
    ]).then(([prods, cats, status]) => {
      setProducts(prods);
      setCategories(cats);
      setStorageBackend(status.backend ?? "local-json");
    });
  }

  useEffect(() => { load(); }, []);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setForm((f) => ({ ...f, image: data.url }));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function toggleCategory(id: string) {
    setForm((f) => ({
      ...f,
      categoryIds: f.categoryIds.includes(id)
        ? f.categoryIds.filter((c) => c !== id)
        : [...f.categoryIds, id],
    }));
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (form.categoryIds.length === 0) {
      alert("Please select at least one category so the product appears in the shop.");
      return;
    }
    setLoading(true);
    await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        price: Number(form.price),
        originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
        stock: Number(form.stock),
        images: [form.image],
        tags: [],
      }),
    });
    setForm({
      name: "", description: "", price: "", originalPrice: "", brand: "",
      stock: "10", image: form.image, categoryIds: [], featured: false, isNew: false, isLatest: false,
    });
    load();
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this product?")) return;
    await fetch(`/api/admin/products?id=${id}`, { method: "DELETE" });
    load();
  }

  async function toggleFlag(id: string, flag: "featured" | "isLatest" | "isNew", value: boolean) {
    await fetch("/api/admin/products", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, [flag]: value }),
    });
    load();
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-stone-900 mb-2">Products</h1>
      <p className="text-sm text-stone-500 mb-8">
        Data: <span className="font-medium">Neon Postgres</span>
        {" · "}
        Images: <span className="font-medium">Local uploads</span>
      </p>

      <form onSubmit={handleAdd} className="bg-white border border-stone-200 p-6 mb-8 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <input required placeholder="Product name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="border border-stone-200 px-3 py-2 text-sm" />
          <input required placeholder="Brand" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} className="border border-stone-200 px-3 py-2 text-sm" />
          <input required type="number" placeholder="Price (Rs.)" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="border border-stone-200 px-3 py-2 text-sm" />
          <input type="number" placeholder="Original price (optional)" value={form.originalPrice} onChange={(e) => setForm({ ...form, originalPrice: e.target.value })} className="border border-stone-200 px-3 py-2 text-sm" />
          <input type="number" placeholder="Stock" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="border border-stone-200 px-3 py-2 text-sm" />
          <div className="sm:col-span-2 space-y-2">
            <input placeholder="Image URL" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className="w-full border border-stone-200 px-3 py-2 text-sm" />
            <label className="inline-flex items-center gap-2 text-sm text-stone-600 cursor-pointer">
              <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} className="text-xs" />
              {uploading ? "Uploading..." : "Upload product image"}
            </label>
            {form.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.image} alt="Preview" className="h-20 w-20 object-cover border border-stone-200" />
            )}
          </div>
        </div>
        <textarea required placeholder="Description" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full border border-stone-200 px-3 py-2 text-sm" />

        <div>
          <p className="text-sm text-stone-600 mb-2">Categories</p>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => toggleCategory(cat.id)}
                className={`px-3 py-1 text-xs border ${form.categoryIds.includes(cat.id) ? "bg-stone-900 text-white border-stone-900" : "border-stone-200 text-stone-600"}`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-4 text-sm">
          <label className="flex items-center gap-2"><input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} /> Featured</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={form.isNew} onChange={(e) => setForm({ ...form, isNew: e.target.checked })} /> New Arrival</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={form.isLatest} onChange={(e) => setForm({ ...form, isLatest: e.target.checked })} /> Latest</label>
        </div>

        <button type="submit" disabled={loading} className="bg-stone-900 text-white px-6 py-2.5 text-sm font-medium hover:bg-rose-600 transition-colors flex items-center gap-1">
          <Plus size={16} /> Add Product
        </button>
      </form>

      <div className="bg-white border border-stone-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-100 text-left text-stone-500">
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Categories</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Flags</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-stone-50">
                <td className="px-4 py-3">
                  <p className="font-medium">{p.name}</p>
                  <p className="text-xs text-stone-400">{p.brand}</p>
                </td>
                <td className="px-4 py-3 text-xs text-stone-500">
                  {p.categoryIds.length === 0 ? (
                    <span className="text-amber-600">None assigned</span>
                  ) : (
                    p.categoryIds
                      .map((id) => categories.find((c) => c.id === id)?.name ?? id)
                      .join(", ")
                  )}
                </td>
                <td className="px-4 py-3">{formatPrice(p.price)}</td>
                <td className="px-4 py-3">{p.stock}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button title="Featured" onClick={() => toggleFlag(p.id, "featured", !p.featured)} className={p.featured ? "text-amber-500" : "text-stone-300"}><Star size={16} /></button>
                    <button onClick={() => toggleFlag(p.id, "isLatest", !p.isLatest)} className={`text-xs px-1.5 py-0.5 border ${p.isLatest ? "bg-amber-100 border-amber-300" : "border-stone-200 text-stone-400"}`}>Latest</button>
                    <button onClick={() => toggleFlag(p.id, "isNew", !p.isNew)} className={`text-xs px-1.5 py-0.5 border ${p.isNew ? "bg-emerald-100 border-emerald-300" : "border-stone-200 text-stone-400"}`}>New</button>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => handleDelete(p.id)} className="text-stone-300 hover:text-red-500"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
