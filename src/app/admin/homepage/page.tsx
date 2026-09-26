"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { HomeSettings, SiteSettings } from "@/lib/settings-types";
import { Card, ImageField, SaveBar, TextField, Toggle, useSaveState } from "@/components/admin/fields";

const SECTION_LABELS: Record<keyof HomeSettings["sections"], string> = {
  seasons: "Season categories (image tiles)",
  types: "Product type categories (buttons)",
  latest: "Latest products",
  featured: "Featured products",
  newArrivals: "New arrivals",
};

export default function AdminHomepagePage() {
  const [home, setHome] = useState<HomeSettings | null>(null);
  const [loadError, setLoadError] = useState("");
  const { saving, message, save } = useSaveState();

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Failed to load settings"))))
      .then((s: SiteSettings) => setHome(s.home))
      .catch((e) => setLoadError(e.message));
  }, []);

  if (loadError) return <p className="text-red-600 text-sm">{loadError}</p>;
  if (!home) return <p className="text-stone-400 text-sm">Loading…</p>;

  const setHero = (patch: Partial<HomeSettings["hero"]>) => setHome({ ...home, hero: { ...home.hero, ...patch } });
  const setPromo = (patch: Partial<HomeSettings["promo"]>) => setHome({ ...home, promo: { ...home.promo, ...patch } });
  const setSection = (key: keyof HomeSettings["sections"], patch: Partial<HomeSettings["sections"]["latest"]>) =>
    setHome({ ...home, sections: { ...home.sections, [key]: { ...home.sections[key], ...patch } } });

  async function handleSave() {
    const saved = await save("home", home);
    if (saved) setHome(saved);
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">Homepage</h1>
          <p className="text-sm text-stone-500 mt-1">Edit the banner, sections, and promo shown on your store&apos;s front page.</p>
        </div>
        <Link href="/" target="_blank" className="text-sm text-rose-600 hover:underline">View store ↗</Link>
      </div>

      <Card title="Hero banner" description="The large image and headline at the top of the homepage.">
        <ImageField label="Hero image" value={home.hero.image} onChange={(image) => setHero({ image })} hint="Wide landscape photos work best (at least 1600px wide)." />
        <TextField label="Small text above headline" value={home.hero.eyebrow} onChange={(eyebrow) => setHero({ eyebrow })} />
        <TextField label="Headline" value={home.hero.title} onChange={(title) => setHero({ title })} multiline rows={2} hint="Press Enter for a new line." />
        <TextField label="Description" value={home.hero.subtitle} onChange={(subtitle) => setHero({ subtitle })} multiline />
        <div className="grid sm:grid-cols-2 gap-4">
          <TextField label="Main button text" value={home.hero.primaryLabel} onChange={(primaryLabel) => setHero({ primaryLabel })} hint="Leave empty to hide the button." />
          <TextField label="Main button link" value={home.hero.primaryLink} onChange={(primaryLink) => setHero({ primaryLink })} placeholder="/shop" />
          <TextField label="Second button text" value={home.hero.secondaryLabel} onChange={(secondaryLabel) => setHero({ secondaryLabel })} hint="Leave empty to hide the button." />
          <TextField label="Second button link" value={home.hero.secondaryLink} onChange={(secondaryLink) => setHero({ secondaryLink })} placeholder="/shop?tag=sale" />
        </div>
        <p className="text-xs text-stone-400">
          Useful links: <code>/shop</code> (all products), <code>/shop?tag=sale</code>, <code>/shop?latest=true</code>, <code>/shop?new=true</code>, <code>/shop?category=your-category-link</code>
        </p>
      </Card>

      <Card title="Homepage sections" description="Turn sections on or off and rename their headings. Product sections only show when at least one product is marked Latest / Featured / New.">
        <div className="divide-y divide-stone-100">
          {(Object.keys(SECTION_LABELS) as (keyof HomeSettings["sections"])[]).map((key) => (
            <div key={key} className="py-3 grid sm:grid-cols-[220px_1fr] gap-3 items-center">
              <Toggle label={SECTION_LABELS[key]} checked={home.sections[key].show} onChange={(show) => setSection(key, { show })} />
              <input
                value={home.sections[key].title}
                onChange={(e) => setSection(key, { title: e.target.value })}
                placeholder="Section heading"
                className="w-full border border-stone-200 px-3 py-2 text-sm"
              />
            </div>
          ))}
        </div>
      </Card>

      <Card title="Promo banner" description="The coloured banner in the middle of the homepage.">
        <Toggle label="Show promo banner" checked={home.promo.show} onChange={(show) => setPromo({ show })} />
        <TextField label="Heading" value={home.promo.title} onChange={(title) => setPromo({ title })} />
        <TextField label="Text" value={home.promo.text} onChange={(text) => setPromo({ text })} multiline />
        <div className="grid sm:grid-cols-2 gap-4">
          <TextField label="Button text" value={home.promo.buttonLabel} onChange={(buttonLabel) => setPromo({ buttonLabel })} hint="Leave empty to hide the button." />
          <TextField label="Button link" value={home.promo.buttonLink} onChange={(buttonLink) => setPromo({ buttonLink })} placeholder="/shop" />
        </div>
      </Card>

      <SaveBar saving={saving} message={message} onSave={handleSave} />
    </div>
  );
}
