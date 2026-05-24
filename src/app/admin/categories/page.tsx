"use client";

import { useEffect, useState } from "react";
import { Category, CategoryType } from "@/lib/types";
import { Plus, Trash2 } from "lucide-react";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    type: "product_type" as CategoryType,
    description: "",
  });
  const [loading, setLoading] = useState(false);

  function load() {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then(setCategories);
  }

  useEffect(() => { load(); }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ name: "", slug: "", type: "product_type", description: "" });
    load();
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this category?")) return;
    await fetch(`/api/admin/categories?id=${id}`, { method: "DELETE" });
    load();
  }

  const seasons = categories.filter((c) => c.type === "season");
  const types = categories.filter((c) => c.type === "product_type");

  return (
    <div>
      <h1 className="text-2xl font-semibold text-stone-900 mb-8">Categories</h1>

      <form onSubmit={handleAdd} className="bg-white border border-stone-200 p-6 mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <input required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="border border-stone-200 px-3 py-2 text-sm" />
        <input placeholder="Slug (auto)" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="border border-stone-200 px-3 py-2 text-sm" />
        <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as CategoryType })} className="border border-stone-200 px-3 py-2 text-sm">
          <option value="season">Season</option>
          <option value="product_type">Product Type</option>
        </select>
        <input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="border border-stone-200 px-3 py-2 text-sm" />
        <button type="submit" disabled={loading} className="bg-stone-900 text-white text-sm font-medium hover:bg-rose-600 transition-colors flex items-center justify-center gap-1">
          <Plus size={16} /> Add Category
        </button>
      </form>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {[
          { title: "Season Categories", list: seasons },
          { title: "Product Type Categories", list: types },
        ].map(({ title, list }) => (
          <div key={title} className="bg-white border border-stone-200">
            <h2 className="px-6 py-4 font-semibold border-b border-stone-100">{title}</h2>
            <ul>
              {list.map((cat) => (
                <li key={cat.id} className="px-6 py-3 flex justify-between items-center border-b border-stone-50 text-sm">
                  <div>
                    <p className="font-medium">{cat.name}</p>
                    <p className="text-stone-400 text-xs">{cat.slug}</p>
                  </div>
                  <button onClick={() => handleDelete(cat.id)} className="text-stone-300 hover:text-red-500">
                    <Trash2 size={16} />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
