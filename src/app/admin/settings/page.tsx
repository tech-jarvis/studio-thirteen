"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PagesSettings, SiteSettings, StoreSettings } from "@/lib/settings-types";
import { Card, SaveBar, TextField, Toggle, useSaveState } from "@/components/admin/fields";

const PLACEHOLDER_HELP =
  "Formatting: start a line with “## ” for a heading and “- ” for a bullet point; leave a blank line between paragraphs. " +
  "These are filled in automatically: {businessName} {deliveryDays} {phone} {email} {shippingFee} {minOrder}";

export default function AdminSettingsPage() {
  const [store, setStore] = useState<StoreSettings | null>(null);
  const [pages, setPages] = useState<PagesSettings | null>(null);
  const [loadError, setLoadError] = useState("");
  const storeSave = useSaveState();
  const pagesSave = useSaveState();

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Failed to load settings"))))
      .then((s: SiteSettings) => {
        setStore(s.store);
        setPages(s.pages);
      })
      .catch((e) => setLoadError(e.message));
  }, []);

  if (loadError) return <p className="text-red-600 text-sm">{loadError}</p>;
  if (!store || !pages) return <p className="text-stone-400 text-sm">Loading…</p>;

  const set = (patch: Partial<StoreSettings>) => setStore({ ...store, ...patch });

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">Store settings</h1>
          <p className="text-sm text-stone-500 mt-1">Business details, contact info, announcement bar, and policy pages.</p>
        </div>
        <Link href="/" target="_blank" className="text-sm text-rose-600 hover:underline">View store ↗</Link>
      </div>

      <Card title="Announcement bar" description="The thin coloured strip at the very top of every page.">
        <Toggle label="Show announcement bar" checked={store.announcement.show} onChange={(show) => set({ announcement: { ...store.announcement, show } })} />
        <TextField label="Text" value={store.announcement.text} onChange={(text) => set({ announcement: { ...store.announcement, text } })} />
      </Card>

      <Card title="Business details" description="Shown in the footer, on order pages, and in policy pages.">
        <div className="grid sm:grid-cols-2 gap-4">
          <TextField label="Business name" value={store.businessName} onChange={(businessName) => set({ businessName })} />
          <TextField label="Delivery time" value={store.deliveryDays} onChange={(deliveryDays) => set({ deliveryDays })} placeholder="5–7 working days" />
          <TextField label="Email" value={store.email} onChange={(email) => set({ email })} />
          <TextField label="Phone (as shown to customers)" value={store.phone} onChange={(phone) => set({ phone })} />
          <TextField label="WhatsApp number" value={store.whatsapp} onChange={(whatsapp) => set({ whatsapp })} hint="International format, e.g. 923001234567 (no + or spaces)." />
          <TextField label="Opening hours" value={store.hours} onChange={(hours) => set({ hours })} />
        </div>
        <TextField label="Address" value={store.address} onChange={(address) => set({ address })} />
        <TextField label="Footer description" value={store.tagline} onChange={(tagline) => set({ tagline })} multiline rows={2} />
      </Card>

      <Card title="Social media" description="Full links to your profiles. Leave empty to hide.">
        <div className="grid sm:grid-cols-3 gap-4">
          <TextField label="Instagram" value={store.social.instagram} onChange={(instagram) => set({ social: { ...store.social, instagram } })} placeholder="https://instagram.com/…" />
          <TextField label="Facebook" value={store.social.facebook} onChange={(facebook) => set({ social: { ...store.social, facebook } })} placeholder="https://facebook.com/…" />
          <TextField label="TikTok" value={store.social.tiktok} onChange={(tiktok) => set({ social: { ...store.social, tiktok } })} placeholder="https://tiktok.com/@…" />
        </div>
      </Card>

      <Card title="Search engines (SEO)" description="How your store appears in Google results and link previews.">
        <TextField label="Site title" value={store.seo.title} onChange={(title) => set({ seo: { ...store.seo, title } })} />
        <TextField label="Site description" value={store.seo.description} onChange={(description) => set({ seo: { ...store.seo, description } })} multiline rows={2} />
      </Card>

      <SaveBar
        sticky={false}
        saving={storeSave.saving}
        message={storeSave.message}
        onSave={async () => {
          const saved = await storeSave.save("store", store);
          if (saved) setStore(saved);
        }}
      />

      <Card title="Policy pages" description={PLACEHOLDER_HELP}>
        {(["shipping", "returns"] as const).map((key) => (
          <div key={key} className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-stone-800">{key === "shipping" ? "Shipping page" : "Returns page"}</p>
              <Link href={`/${key}`} target="_blank" className="text-xs text-rose-600 hover:underline">View ↗</Link>
            </div>
            <TextField label="Page title" value={pages[key].title} onChange={(title) => setPages({ ...pages, [key]: { ...pages[key], title } })} />
            <TextField label="Page text" value={pages[key].body} onChange={(body) => setPages({ ...pages, [key]: { ...pages[key], body } })} multiline rows={14} />
          </div>
        ))}
      </Card>

      <SaveBar
        saving={pagesSave.saving}
        message={pagesSave.message}
        onSave={async () => {
          const saved = await pagesSave.save("pages", pages);
          if (saved) setPages(saved);
        }}
      />
    </div>
  );
}
