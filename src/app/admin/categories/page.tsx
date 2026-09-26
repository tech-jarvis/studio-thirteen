"use client";

import { useEffect, useState } from "react";
import { Category, CategoryType } from "@/lib/types";
import { Plus, Trash2, Pencil, X, Eye, EyeOff } from "lucide-react";
import { ImageField, TextField, Toggle } from "@/components/admin/fields";

const EMPTY_FORM = {
  name: "",
  slug: "",
  type: "product_type" as CategoryType,
  description: "",
  image: "",
  sortOrder: "0",
  showInMenu: true,
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function load() {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((data) => setCategories(Array.isArray(data) ? data : []));
  }

  useEffect(() => { load(); }, []);

  function startEdit(cat: Category) {
    setEditingId(cat.id);
    setError("");
    setForm({
      name: cat.name,
      slug: cat.slug,
      type: cat.type,
      description: cat.description ?? "",
      image: cat.image ?? "",
      sortOrder: String(cat.sortOrder ?? 0),
      showInMenu: cat.showInMenu !== false,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError("");
  }

  async function send(method: "POST" | "PATCH", body: Record<string, unknown>) {
    const res = await fetch("/api/admin/categories", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to save category");
    return data;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await send(editingId ? "PATCH" : "POST", {
        ...(editingId ? { id: editingId } : {}),
        ...form,
        sortOrder: Number(form.sortOrder) || 0,
      });
      resetForm();
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save category");
    } finally {
      setLoading(false);
    }
  }

  async function toggleMenu(cat: Category) {
    try {
      await send("PATCH", { id: cat.id, showInMenu: cat.showInMenu === false });
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update category");
    }
  }

  async function handleDelete(cat: Category) {
    if (!confirm(`Delete "${cat.name}"? Products stay in the shop but are removed from this category.`)) return;
    await fetch(`/api/admin/categories?id=${cat.id}`, { method: "DELETE" });
    if (editingId === cat.id) resetForm();
    load();
  }

  const seasons = categories.filter((c) => c.type === "season");
  const types = categories.filter((c) => c.type === "product_type");

  return (
    <div>
      <h1 className="text-2xl font-semibold text-stone-900 mb-2">Categories</h1>
      <p className="text-sm text-stone-500 mb-8">
        Categories build the store&apos;s <strong>Season</strong> and <strong>Product Type</strong> menus. Season categories with an image also appear as tiles on the homepage.
      </p>

      <form onSubmit={handleSubmit} className="bg-white border border-stone-200 p-6 mb-8 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-stone-900">{editingId ? `Edit: ${form.name || "category"}` : "Add category"}</h2>
          {editingId && (
            <button type="button" onClick={resetForm} className="text-sm text-stone-500 hover:text-stone-900 flex items-center gap-1">
              <X size={14} /> Cancel edit
            </button>
          )}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <TextField label="Name" value={form.name} onChange={(name) => setForm({ ...form, name })} />
          <TextField label="Link name (slug)" value={form.slug} onChange={(slug) => setForm({ ...form, slug })} placeholder="auto from name" hint={form.slug ? `/shop?category=${form.slug}` : undefined} />
          <label className="block">
            <span className="block text-sm text-stone-600 mb-1">Menu group</span>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as CategoryType })} className="w-full border border-stone-200 px-3 py-2 text-sm">
              <option value="season">Season</option>
              <option value="product_type">Product Type</option>
            </select>
          </label>
          <TextField label="Order" value={form.sortOrder} onChange={(sortOrder) => setForm({ ...form, sortOrder })} hint="Lower numbers show first." />
        </div>
        <TextField label="Description" value={form.description} onChange={(description) => setForm({ ...form, description })} />
        <ImageField label="Image (used for homepage season tiles)" value={form.image} onChange={(image) => setForm({ ...form, image })} />
        <Toggle label="Show in menu" checked={form.showInMenu} onChange={(showInMenu) => setForm({ ...form, showInMenu })} />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button type="submit" disabled={loading || !form.name.trim()} className="bg-stone-900 text-white px-6 py-2.5 text-sm font-medium hover:bg-rose-600 transition-colors flex items-center gap-1 disabled:opacity-50">
          {editingId ? <><Pencil size={16} /> Save changes</> : <><Plus size={16} /> Add category</>}
        </button>
      </form>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {[
          { title: "Season", list: seasons },
          { title: "Product Type", list: types },
        ].map(({ title, list }) => (
          <div key={title} className="bg-white border border-stone-200">
            <h2 className="px-6 py-4 font-semibold border-b border-stone-100">{title} menu</h2>
            {list.length === 0 && <p className="px-6 py-4 text-sm text-stone-400">No categories — the {title} menu is hidden.</p>}
            <ul>
              {list.map((cat) => (
                <li key={cat.id} className="px-6 py-3 flex justify-between items-center gap-4 border-b border-stone-50 text-sm">
                  <div className="flex items-center gap-3 min-w-0">
                    {cat.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={cat.image} alt="" className="h-10 w-10 object-cover border border-stone-200 shrink-0" />
                    ) : (
                      <div className="h-10 w-10 bg-stone-100 shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className={`font-medium ${cat.showInMenu === false ? "text-stone-400" : ""}`}>
                        {cat.name}
                        {cat.showInMenu === false && <span className="ml-2 text-xs text-amber-600">hidden from menu</span>}
                      </p>
                      <p className="text-stone-400 text-xs truncate">/shop?category={cat.slug} · order {cat.sortOrder ?? 0}</p>
                    </div>
                  </div>
                  <div className="flex gap-3 shrink-0">
                    <button title={cat.showInMenu === false ? "Show in menu" : "Hide from menu"} onClick={() => toggleMenu(cat)} className="text-stone-400 hover:text-stone-900">
                      {cat.showInMenu === false ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    <button title="Edit" onClick={() => startEdit(cat)} className="text-stone-400 hover:text-stone-900"><Pencil size={16} /></button>
                    <button title="Delete" onClick={() => handleDelete(cat)} className="text-stone-300 hover:text-red-500"><Trash2 size={16} /></button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
