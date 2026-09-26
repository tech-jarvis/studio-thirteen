"use client";

import { useEffect, useState } from "react";
import { Product, Category } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import { Plus, Trash2, Star, Pencil, X, RotateCcw } from "lucide-react";
import { compressImage } from "@/lib/compress-image";

const EMPTY_FORM = {
  name: "",
  description: "",
  price: "",
  originalPrice: "",
  brand: "",
  stock: "10",
  images: [] as string[],
  categoryIds: [] as string[],
  featured: false,
  isNew: false,
  isLatest: false,
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  function load() {
    Promise.all([
      fetch("/api/admin/products").then((r) => r.json()),
      fetch("/api/admin/categories").then((r) => r.json()),
    ]).then(([prods, cats]) => {
      setProducts(Array.isArray(prods) ? prods : []);
      setCategories(Array.isArray(cats) ? cats : []);
    });
  }

  useEffect(() => { load(); }, []);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setUploading(true);
    setError("");
    try {
      for (const file of files) {
        const body = new FormData();
        body.append("file", await compressImage(file));
        const res = await fetch("/api/admin/upload", { method: "POST", body });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Upload failed");
        setForm((f) => ({ ...f, images: [...f.images, data.url] }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function addImageUrl() {
    const url = imageUrl.trim();
    if (!url) return;
    setForm((f) => ({ ...f, images: [...f.images, url] }));
    setImageUrl("");
  }

  function removeImage(index: number) {
    setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== index) }));
  }

  function makeCover(index: number) {
    setForm((f) => ({
      ...f,
      images: [f.images[index], ...f.images.filter((_, i) => i !== index)],
    }));
  }

  function toggleCategory(id: string) {
    setForm((f) => ({
      ...f,
      categoryIds: f.categoryIds.includes(id)
        ? f.categoryIds.filter((c) => c !== id)
        : [...f.categoryIds, id],
    }));
  }

  function startEdit(p: Product) {
    setEditingId(p.id);
    setError("");
    setForm({
      name: p.name,
      description: p.description,
      price: String(p.price),
      originalPrice: p.originalPrice ? String(p.originalPrice) : "",
      brand: p.brand ?? "",
      stock: String(p.stock),
      images: [...p.images],
      categoryIds: [...p.categoryIds],
      featured: Boolean(p.featured),
      isNew: Boolean(p.isNew),
      isLatest: Boolean(p.isLatest),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setImageUrl("");
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.categoryIds.length === 0) {
      setError("Select at least one category so the product appears in the shop.");
      return;
    }
    if (form.images.length === 0) {
      setError("Add at least one image.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/products", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(editingId ? { id: editingId } : {}),
          ...form,
          price: Number(form.price),
          originalPrice: form.originalPrice ? Number(form.originalPrice) : null,
          stock: Number(form.stock),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save product");
      resetForm();
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save product");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Hide this product from the shop? You can restore it later.")) return;
    await fetch(`/api/admin/products?id=${id}`, { method: "DELETE" });
    if (editingId === id) resetForm();
    load();
  }

  async function restore(id: string) {
    await fetch("/api/admin/products", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, active: true }),
    });
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
        Data: <span className="font-medium">Supabase Postgres</span>
        {" · "}
        Images: <span className="font-medium">Supabase Storage</span>
      </p>

      <form onSubmit={handleSubmit} className="bg-white border border-stone-200 p-6 mb-8 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-stone-900">
            {editingId ? `Edit: ${form.name || "product"}` : "Add product"}
          </h2>
          {editingId && (
            <button type="button" onClick={resetForm} className="text-sm text-stone-500 hover:text-stone-900 flex items-center gap-1">
              <X size={14} /> Cancel edit
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <input required placeholder="Product name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="border border-stone-200 px-3 py-2 text-sm" />
          <input placeholder="Brand" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} className="border border-stone-200 px-3 py-2 text-sm" />
          <input required type="number" min={1} placeholder="Price (Rs.)" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="border border-stone-200 px-3 py-2 text-sm" />
          <input type="number" min={1} placeholder="Original price — for sale items (optional)" value={form.originalPrice} onChange={(e) => setForm({ ...form, originalPrice: e.target.value })} className="border border-stone-200 px-3 py-2 text-sm" />
          <input required type="number" min={0} placeholder="Stock" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="border border-stone-200 px-3 py-2 text-sm" />
        </div>

        <div className="space-y-2">
          <p className="text-sm text-stone-600">Images (first one is the cover)</p>
          {form.images.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {form.images.map((src, i) => (
                <div key={`${src}-${i}`} className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" className={`h-20 w-20 object-cover border ${i === 0 ? "border-stone-900" : "border-stone-200"}`} />
                  <button type="button" title="Remove" onClick={() => removeImage(i)} className="absolute -top-2 -right-2 bg-white border border-stone-300 rounded-full p-0.5 text-stone-500 hover:text-red-500">
                    <X size={12} />
                  </button>
                  {i > 0 && (
                    <button type="button" onClick={() => makeCover(i)} className="block text-[10px] text-stone-500 hover:text-stone-900 mt-1">
                      Make cover
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
          <div className="flex flex-wrap items-center gap-3">
            <label className="inline-flex items-center gap-2 text-sm text-stone-600 cursor-pointer">
              <input type="file" accept="image/*" multiple onChange={handleImageUpload} disabled={uploading} className="text-xs" />
              {uploading ? "Uploading..." : "Upload images"}
            </label>
            <div className="flex gap-2 flex-1 min-w-[240px]">
              <input placeholder="…or paste an image URL" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="flex-1 border border-stone-200 px-3 py-2 text-sm" />
              <button type="button" onClick={addImageUrl} className="px-3 py-2 text-sm border border-stone-200 hover:border-stone-400">Add</button>
            </div>
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

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button type="submit" disabled={loading || uploading} className="bg-stone-900 text-white px-6 py-2.5 text-sm font-medium hover:bg-rose-600 transition-colors flex items-center gap-1 disabled:opacity-50">
          {editingId ? <><Pencil size={16} /> Save changes</> : <><Plus size={16} /> Add Product</>}
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
              <tr key={p.id} className={`border-b border-stone-50 ${p.active === false ? "bg-stone-50 text-stone-400" : ""}`}>
                <td className="px-4 py-3">
                  <p className="font-medium">
                    {p.name}
                    {p.active === false && <span className="ml-2 text-xs font-normal text-amber-600">Hidden</span>}
                  </p>
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
                  <div className="flex gap-3">
                    <button title="Edit" onClick={() => startEdit(p)} className="text-stone-400 hover:text-stone-900"><Pencil size={16} /></button>
                    {p.active === false ? (
                      <button title="Restore to shop" onClick={() => restore(p.id)} className="text-emerald-600 hover:text-emerald-800 flex items-center gap-1 text-xs"><RotateCcw size={14} /> Restore</button>
                    ) : (
                      <button title="Hide from shop" onClick={() => handleDelete(p.id)} className="text-stone-300 hover:text-red-500"><Trash2 size={16} /></button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
