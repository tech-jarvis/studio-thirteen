/**
 * Seeds Supabase from data/store.json
 * Usage: node --env-file=.env.local scripts/seed-supabase.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const storePath = join(__dirname, "../data/store.json");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(url, key);
const store = JSON.parse(readFileSync(storePath, "utf-8"));

async function seed() {
  console.log("Seeding categories...");
  for (const cat of store.categories) {
    const { error } = await supabase.from("categories").upsert({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      type: cat.type,
      description: cat.description ?? null,
      image: cat.image ?? null,
    });
    if (error) console.warn(`Category ${cat.slug}:`, error.message);
  }

  console.log("Seeding products...");
  for (const p of store.products) {
    const { error } = await supabase.from("products").upsert({
      id: p.id,
      name: p.name,
      description: p.description,
      price: p.price,
      original_price: p.originalPrice ?? null,
      images: p.images,
      category_ids: p.categoryIds,
      brand: p.brand ?? null,
      stock: p.stock,
      featured: p.featured ?? false,
      is_new: p.isNew ?? false,
      is_latest: p.isLatest ?? false,
      tags: p.tags ?? [],
    });
    if (error) console.warn(`Product ${p.name}:`, error.message);
  }

  console.log("Seeding orders...");
  for (const o of store.orders ?? []) {
    const { error } = await supabase.from("orders").upsert({
      id: o.id,
      order_number: o.orderNumber,
      customer_name: o.customerName,
      phone: o.phone,
      email: o.email ?? null,
      address: o.address,
      city: o.city,
      notes: o.notes ?? null,
      items: o.items,
      subtotal: o.subtotal,
      shipping: o.shipping,
      discount: o.discount,
      discount_percent: o.discountPercent,
      total: o.total,
      payment_method: o.paymentMethod,
      payment_status: o.paymentStatus,
      order_status: o.orderStatus,
      created_at: o.createdAt,
    });
    if (error) console.warn(`Order ${o.orderNumber}:`, error.message);
  }

  console.log("Done.");
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
