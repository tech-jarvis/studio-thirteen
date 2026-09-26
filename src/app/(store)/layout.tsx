import type { Metadata } from "next";
import Navbar, { MenuLink } from "@/components/Navbar";
import Footer from "@/components/Footer";
import { StoreSettingsProvider } from "@/context/StoreSettingsContext";
import { getSettings } from "@/lib/settings";
import { getCategories } from "@/lib/store";
import { Category } from "@/lib/types";

// Admin saves refresh pages instantly; this is a safety net so storefront
// pages never serve settings more than 5 minutes old.
export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const { store } = await getSettings();
  return { title: store.seo.title, description: store.seo.description };
}

async function loadCategories(): Promise<Category[]> {
  try {
    return await getCategories();
  } catch (error) {
    console.error("Failed to load categories for menu", error);
    return [];
  }
}

function toMenuLinks(categories: Category[], type: Category["type"]): MenuLink[] {
  return categories
    .filter((c) => c.type === type && c.showInMenu !== false)
    .map((c) => ({ href: `/shop?category=${c.slug}`, label: c.name }));
}

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [{ store }, categories] = await Promise.all([getSettings(), loadCategories()]);
  const seasonLinks = toMenuLinks(categories, "season");
  const typeLinks = toMenuLinks(categories, "product_type");

  return (
    <StoreSettingsProvider value={store}>
      <Navbar
        announcement={store.announcement.show ? store.announcement.text : ""}
        seasonLinks={seasonLinks}
        typeLinks={typeLinks}
      />
      <div className="flex-1">{children}</div>
      <Footer store={store} shopLinks={[...seasonLinks, ...typeLinks].slice(0, 3)} />
    </StoreSettingsProvider>
  );
}
