"use client";

import { useState, ReactNode } from "react";
import { compressImage } from "@/lib/compress-image";

const inputClass =
  "w-full border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:border-stone-400";

export function Card({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="bg-white border border-stone-200 p-6 space-y-4">
      <div>
        <h2 className="font-semibold text-stone-900">{title}</h2>
        {description && <p className="text-xs text-stone-500 mt-1">{description}</p>}
      </div>
      {children}
    </section>
  );
}

export function TextField({
  label,
  value,
  onChange,
  placeholder,
  hint,
  multiline,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hint?: string;
  multiline?: boolean;
  rows?: number;
}) {
  return (
    <label className="block">
      <span className="block text-sm text-stone-600 mb-1">{label}</span>
      {multiline ? (
        <textarea rows={rows} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={inputClass} />
      ) : (
        <input value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={inputClass} />
      )}
      {hint && <span className="block text-xs text-stone-400 mt-1">{hint}</span>}
    </label>
  );
}

export function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="inline-flex items-center gap-2 text-sm text-stone-700 cursor-pointer">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  );
}

/** Image picker: upload (compressed, stored in Supabase) or paste a URL. */
export function ImageField({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  hint?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function upload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const body = new FormData();
      body.append("file", await compressImage(file, { maxSize: 2000 }));
      const res = await fetch("/api/admin/upload", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      onChange(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <span className="block text-sm text-stone-600">{label}</span>
      <div className="flex flex-wrap items-start gap-4">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="h-24 w-40 object-cover border border-stone-200 bg-stone-50" />
        ) : (
          <div className="h-24 w-40 border border-dashed border-stone-300 flex items-center justify-center text-xs text-stone-400">
            No image
          </div>
        )}
        <div className="flex-1 min-w-[220px] space-y-2">
          <label className="inline-flex items-center gap-2 text-sm text-stone-700 border border-stone-200 px-3 py-1.5 cursor-pointer hover:border-stone-400">
            <input type="file" accept="image/*" onChange={upload} disabled={uploading} className="hidden" />
            {uploading ? "Uploading…" : "Upload image"}
          </label>
          <input value={value} placeholder="…or paste an image URL" onChange={(e) => onChange(e.target.value.trim())} className={inputClass} />
          {value && (
            <button type="button" onClick={() => onChange("")} className="text-xs text-stone-500 hover:text-red-600">
              Remove image
            </button>
          )}
        </div>
      </div>
      {hint && <p className="text-xs text-stone-400">{hint}</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

/** Load one settings section and save it back; shared by the settings pages. */
export function useSaveState() {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  async function save(section: string, value: unknown) {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section, value }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      // Visit the homepage once so it rebuilds now and the next customer
      // doesn't get the previous version while it refreshes.
      fetch("/", { cache: "no-store" }).catch(() => {});
      setMessage({ type: "ok", text: "Saved. Changes show on the store within a few seconds." });
      return data;
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to save" });
      return null;
    } finally {
      setSaving(false);
    }
  }

  return { saving, message, save };
}

export function SaveBar({
  saving,
  message,
  onSave,
  sticky = true,
}: {
  saving: boolean;
  message: { type: "ok" | "error"; text: string } | null;
  onSave: () => void;
  /** Keep the bar pinned to the bottom of the screen while scrolling. */
  sticky?: boolean;
}) {
  return (
    <div className={`${sticky ? "sticky bottom-0 bg-stone-100/95 backdrop-blur border-t border-stone-200" : ""} py-4 flex items-center gap-4`}>
      <button type="button" onClick={onSave} disabled={saving} className="bg-stone-900 text-white px-6 py-2.5 text-sm font-medium hover:bg-rose-600 transition-colors disabled:opacity-50">
        {saving ? "Saving…" : "Save changes"}
      </button>
      {message && (
        <p className={`text-sm ${message.type === "ok" ? "text-emerald-700" : "text-red-600"}`}>{message.text}</p>
      )}
    </div>
  );
}
