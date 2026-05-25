import { neon } from "@neondatabase/serverless";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const storePath = join(__dirname, "../data/store.json");

const url =
  process.env.DATABASE_URL ??
  process.env.POSTGRES_URL;

if (!url) {
  console.error("Set DATABASE_URL in .env.local");
  process.exit(1);
}

const sql = neon(url);
const store = JSON.parse(readFileSync(storePath, "utf-8"));

async function seed() {
  console.log("Seeding categories...");
  for (const cat of store.categories) {
    await sql`
      INSERT INTO categories (id, name, slug, type, description, image)
      VALUES (${cat.id}, ${cat.name}, ${cat.slug}, ${cat.type}, ${cat.description ?? null}, ${cat.image ?? null})
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        slug = EXCLUDED.slug,
        type = EXCLUDED.type,
        description = EXCLUDED.description,
        image = EXCLUDED.image
    `;
  }

  console.log("Seeding products...");
  for (const p of store.products) {
    await sql`
      INSERT INTO products (
        id, name, description, price, original_price, images, category_ids,
        brand, stock, featured, is_new, is_latest, tags, active
      ) VALUES (
        ${p.id}, ${p.name}, ${p.description}, ${p.price}, ${p.originalPrice ?? null},
        ${p.images}, ${p.categoryIds}, ${p.brand ?? null}, ${p.stock},
        ${p.featured ?? false}, ${p.isNew ?? false}, ${p.isLatest ?? false},
        ${p.tags ?? []}, true
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        price = EXCLUDED.price,
        original_price = EXCLUDED.original_price,
        images = EXCLUDED.images,
        category_ids = EXCLUDED.category_ids,
        brand = EXCLUDED.brand,
        stock = EXCLUDED.stock,
        featured = EXCLUDED.featured,
        is_new = EXCLUDED.is_new,
        is_latest = EXCLUDED.is_latest,
        tags = EXCLUDED.tags,
        active = true
    `;
  }

  console.log(`Seeded ${store.categories.length} categories, ${store.products.length} products.`);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
