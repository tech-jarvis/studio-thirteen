import Link from "next/link";
import Image from "next/image";
import ProductCard from "@/components/ProductCard";
import {
  getFeatured,
  getLatestProducts,
  getNewArrivals,
  getCategories,
} from "@/lib/products";
import { getSettings } from "@/lib/settings";
import { isOptimizableImage } from "@/lib/image-host";

export const revalidate = 60;

export default async function HomePage() {
  const [featured, latest, newArrivals, categories, { home }] = await Promise.all([
    getFeatured(),
    getLatestProducts(),
    getNewArrivals(),
    getCategories(),
    getSettings(),
  ]);
  const { hero, sections, promo } = home;

  const seasonCategories = categories.filter((c) => c.type === "season");
  const typeCategories = categories.filter((c) => c.type === "product_type");

  return (
    <main>
      <section className="relative h-[85vh] min-h-[520px] flex items-end bg-stone-100 overflow-hidden">
        {hero.image && (
          <Image
            src={hero.image}
            alt=""
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
            unoptimized={!isOptimizableImage(hero.image)}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20 w-full">
          {hero.eyebrow && (
            <p className="text-rose-400 text-xs tracking-[0.3em] uppercase mb-3 font-medium">
              {hero.eyebrow}
            </p>
          )}
          <h1 className="text-white text-4xl sm:text-6xl font-semibold leading-tight max-w-2xl mb-6 whitespace-pre-line">
            {hero.title}
          </h1>
          {hero.subtitle && (
            <p className="text-stone-300 text-base max-w-md mb-8">{hero.subtitle}</p>
          )}
          <div className="flex flex-wrap gap-3">
            {hero.primaryLabel && (
              <Link
                href={hero.primaryLink || "/shop"}
                className="inline-block bg-white text-stone-900 text-sm font-medium px-8 py-3 hover:bg-rose-600 hover:text-white transition-colors tracking-wide"
              >
                {hero.primaryLabel}
              </Link>
            )}
            {hero.secondaryLabel && (
              <Link
                href={hero.secondaryLink || "/shop"}
                className="inline-block border border-white text-white text-sm font-medium px-8 py-3 hover:bg-white hover:text-stone-900 transition-colors tracking-wide"
              >
                {hero.secondaryLabel}
              </Link>
            )}
          </div>
        </div>
      </section>

      {sections.seasons.show && seasonCategories.length > 0 && (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-xs tracking-[0.25em] uppercase text-stone-400 mb-8 font-medium">
          {sections.seasons.title}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {seasonCategories.map((cat) => (
            <Link
              key={cat.id}
              href={`/shop?category=${cat.slug}`}
              className="group relative aspect-[4/5] overflow-hidden bg-stone-200 rounded-sm"
            >
              {cat.image && (
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="25vw"
                  unoptimized={!isOptimizableImage(cat.image)}
                />
              )}
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/45 transition-colors" />
              <div className="absolute inset-0 flex items-end p-4">
                <p className="text-white text-lg font-semibold">{cat.name}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
      )}

      {sections.types.show && typeCategories.length > 0 && (
      <section
        className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${
          sections.seasons.show && seasonCategories.length > 0 ? "pb-16" : "py-16"
        }`}
      >
        <h2 className="text-xs tracking-[0.25em] uppercase text-stone-400 mb-6 font-medium">
          {sections.types.title}
        </h2>
        <div className="flex flex-wrap gap-2">
          {typeCategories.map((cat) => (
            <Link
              key={cat.id}
              href={`/shop?category=${cat.slug}`}
              className="px-4 py-2 text-sm border border-stone-200 text-stone-700 hover:bg-stone-900 hover:text-white hover:border-stone-900 transition-colors"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </section>
      )}

      {sections.latest.show && latest.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="flex items-end justify-between mb-8">
            <h2 className="text-2xl font-semibold text-stone-900">{sections.latest.title}</h2>
            <Link href="/shop?latest=true" className="text-sm text-stone-500 hover:text-stone-900 transition-colors">
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {latest.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {sections.featured.show && featured.length > 0 && (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex items-end justify-between mb-8">
          <h2 className="text-2xl font-semibold text-stone-900">{sections.featured.title}</h2>
          <Link href="/shop" className="text-sm text-stone-500 hover:text-stone-900 transition-colors">
            View All →
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {featured.slice(0, 4).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
      )}

      {promo.show && (
      <section className="bg-rose-700 py-14 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-white text-2xl sm:text-3xl font-semibold mb-3">
            {promo.title}
          </h2>
          {promo.text && (
            <p className="text-rose-100 text-sm mb-6 leading-relaxed">{promo.text}</p>
          )}
          {promo.buttonLabel && (
            <Link
              href={promo.buttonLink || "/shop"}
              className="inline-block bg-white text-rose-700 text-sm font-medium px-8 py-3 hover:bg-stone-900 hover:text-white transition-colors"
            >
              {promo.buttonLabel}
            </Link>
          )}
        </div>
      </section>
      )}

      {sections.newArrivals.show && newArrivals.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-end justify-between mb-8">
            <h2 className="text-2xl font-semibold text-stone-900">{sections.newArrivals.title}</h2>
            <Link href="/shop?new=true" className="text-sm text-stone-500 hover:text-stone-900 transition-colors">
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {newArrivals.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
