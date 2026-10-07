import type postgres from "postgres";
import { getSql, getTxSql } from "./client";
import { Category, Product, Order } from "@/lib/types";
import {
  mapCategory,
  mapProduct,
  mapOrder,
  productToDb,
  categoryToDb,
  orderToDb,
  DbCategory,
  DbProduct,
  DbOrder,
} from "./mappers";

export type ProductFilters = {
  categorySlug?: string;
  featured?: boolean;
  isNew?: boolean;
  isLatest?: boolean;
  tag?: string;
  search?: string;
  includeInactive?: boolean;
};

export type Pagination = {
  page?: number;
  pageSize?: number;
};

export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

function paginate(page = 1, pageSize = 24) {
  const safePage = Math.max(1, page);
  const safeSize = Math.min(100, Math.max(1, pageSize));
  return { page: safePage, pageSize: safeSize, offset: (safePage - 1) * safeSize };
}

export async function dbGetCategories(type?: string) {
  const sql = getSql();
  const rows = (type
    ? await sql`SELECT * FROM categories WHERE type = ${type} ORDER BY sort_order, name`
    : await sql`SELECT * FROM categories ORDER BY sort_order, name`) as unknown as DbCategory[];
  return rows.map(mapCategory);
}

export async function dbGetCategoryBySlug(slug: string) {
  const sql = getSql();
  const rows = (await sql`SELECT * FROM categories WHERE slug = ${slug} LIMIT 1`) as unknown as DbCategory[];
  return rows[0] ? mapCategory(rows[0]) : undefined;
}

export async function dbGetProducts(
  filters?: ProductFilters,
  pagination?: Pagination
): Promise<Paginated<Product>> {
  const sql = getSql();
  const { page, pageSize, offset } = paginate(pagination?.page, pagination?.pageSize);
  const activeOnly = !filters?.includeInactive;

  let categoryId: string | undefined;
  if (filters?.categorySlug) {
    const cat = await dbGetCategoryBySlug(filters.categorySlug);
    if (!cat) return { items: [], total: 0, page, pageSize, totalPages: 0 };
    categoryId = cat.id;
  }

  const search = filters?.search?.trim() || null;
  const saleOnly = filters?.tag === "sale";
  const tagFilter =
    filters?.tag && filters.tag !== "sale" ? filters.tag : null;

  const featuredOnly = filters?.featured === true ? true : null;
  const newOnly = filters?.isNew === true ? true : null;
  const latestOnly = filters?.isLatest === true ? true : null;

  const countRows = (await sql`
    SELECT COUNT(*)::int AS count FROM products p
    WHERE (${activeOnly} = false OR p.active = true)
      AND (${categoryId ?? null}::text IS NULL OR ${categoryId ?? null} = ANY(p.category_ids))
      AND (${featuredOnly}::boolean IS NULL OR p.featured = ${featuredOnly})
      AND (${newOnly}::boolean IS NULL OR p.is_new = ${newOnly})
      AND (${latestOnly}::boolean IS NULL OR p.is_latest = ${latestOnly})
      AND (${saleOnly} = false OR (p.original_price IS NOT NULL AND p.original_price > p.price) OR 'sale' = ANY(p.tags))
      AND (${tagFilter}::text IS NULL OR ${tagFilter} = ANY(p.tags))
      AND (${search}::text IS NULL OR p.name ILIKE ${search ? `%${search}%` : null} OR p.brand ILIKE ${search ? `%${search}%` : null})
  `) as unknown as { count: number }[];
  const total = countRows[0]?.count ?? 0;

  const rows = (await sql`
    SELECT p.* FROM products p
    WHERE (${activeOnly} = false OR p.active = true)
      AND (${categoryId ?? null}::text IS NULL OR ${categoryId ?? null} = ANY(p.category_ids))
      AND (${featuredOnly}::boolean IS NULL OR p.featured = ${featuredOnly})
      AND (${newOnly}::boolean IS NULL OR p.is_new = ${newOnly})
      AND (${latestOnly}::boolean IS NULL OR p.is_latest = ${latestOnly})
      AND (${saleOnly} = false OR (p.original_price IS NOT NULL AND p.original_price > p.price) OR 'sale' = ANY(p.tags))
      AND (${tagFilter}::text IS NULL OR ${tagFilter} = ANY(p.tags))
      AND (${search}::text IS NULL OR p.name ILIKE ${search ? `%${search}%` : null} OR p.brand ILIKE ${search ? `%${search}%` : null})
    ORDER BY p.created_at DESC
    LIMIT ${pageSize} OFFSET ${offset}
  `) as unknown as DbProduct[];

  return {
    items: rows.map(mapProduct),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize) || 0,
  };
}

/** List all products (admin) — no active filter */
export async function dbListAllProducts() {
  const result = await dbGetProducts({ includeInactive: true }, { page: 1, pageSize: 1000 });
  return result.items;
}

export async function dbGetProductById(id: string, includeInactive = false) {
  const sql = getSql();
  const rows = (includeInactive
    ? await sql`SELECT * FROM products WHERE id = ${id} LIMIT 1`
    : await sql`SELECT * FROM products WHERE id = ${id} AND active = true LIMIT 1`) as unknown as DbProduct[];
  return rows[0] ? mapProduct(rows[0]) : undefined;
}

export async function dbGetProductsByIds(ids: string[]) {
  if (!ids.length) return [];
  const sql = getSql();
  const rows = (await sql`
    SELECT * FROM products WHERE id = ANY(${ids}) AND active = true
  `) as unknown as DbProduct[];
  return rows.map(mapProduct);
}

export async function dbGetOrders(pagination?: Pagination): Promise<Paginated<Order>> {
  const sql = getSql();
  const { page, pageSize, offset } = paginate(pagination?.page, pagination?.pageSize ?? 50);

  const countRows = (await sql`SELECT COUNT(*)::int AS count FROM orders`) as unknown as { count: number }[];
  const total = countRows[0]?.count ?? 0;

  const rows = (await sql`
    SELECT * FROM orders ORDER BY created_at DESC
    LIMIT ${pageSize} OFFSET ${offset}
  `) as unknown as DbOrder[];

  return {
    items: rows.map(mapOrder),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize) || 0,
  };
}

export async function dbGetAllOrders() {
  const result = await dbGetOrders({ page: 1, pageSize: 1000 });
  return result.items;
}

export async function dbGetOrderById(id: string) {
  const sql = getSql();
  const rows = (await sql`SELECT * FROM orders WHERE id = ${id} LIMIT 1`) as unknown as DbOrder[];
  return rows[0] ? mapOrder(rows[0]) : undefined;
}

export async function dbGetOrderByNumber(orderNumber: string) {
  const sql = getSql();
  const rows = (await sql`SELECT * FROM orders WHERE order_number = ${orderNumber} LIMIT 1`) as unknown as DbOrder[];
  return rows[0] ? mapOrder(rows[0]) : undefined;
}

export async function dbAddCategory(category: Category) {
  const sql = getSql();
  const db = categoryToDb(category);
  const rows = (await sql`
    INSERT INTO categories (id, name, slug, type, description, image, sort_order, show_in_menu)
    VALUES (${category.id}, ${db.name}, ${db.slug}, ${db.type}, ${db.description}, ${db.image},
      ${db.sort_order}, ${db.show_in_menu})
  RETURNING *
  `) as unknown as DbCategory[];
  return mapCategory(rows[0]);
}

export async function dbUpdateCategory(id: string, updates: Partial<Category>) {
  const sql = getSql();
  const rows = (await sql`
    UPDATE categories SET
      name = COALESCE(${updates.name ?? null}, name),
      slug = COALESCE(${updates.slug ?? null}, slug),
      type = COALESCE(${updates.type ?? null}, type),
      description = CASE WHEN ${"description" in updates} THEN ${updates.description ?? null}::text ELSE description END,
      image = CASE WHEN ${"image" in updates} THEN ${updates.image ?? null}::text ELSE image END,
      sort_order = COALESCE(${updates.sortOrder ?? null}::int, sort_order),
      show_in_menu = COALESCE(${updates.showInMenu ?? null}::boolean, show_in_menu),
      updated_at = now()
    WHERE id = ${id}
    RETURNING *
  `) as unknown as DbCategory[];
  if (!rows[0]) throw new Error("Category not found");
  return mapCategory(rows[0]);
}

export async function dbDeleteCategory(id: string) {
  const sql = getSql();
  await sql`DELETE FROM categories WHERE id = ${id}`;
  await sql`
    UPDATE products SET category_ids = array_remove(category_ids, ${id})
    WHERE ${id} = ANY(category_ids)
  `;
}

export async function dbAddProduct(product: Product) {
  const sql = getSql();
  const db = productToDb(product);
  const rows = (await sql`
    INSERT INTO products (
      id, name, description, price, original_price, images, videos, category_ids,
      brand, stock, featured, is_new, is_latest, tags, active
    ) VALUES (
      ${product.id}, ${db.name}, ${db.description}, ${db.price}, ${db.original_price},
      ${db.images}, ${db.videos}, ${db.category_ids}, ${db.brand}, ${db.stock},
      ${db.featured}, ${db.is_new}, ${db.is_latest}, ${db.tags}, true
    ) RETURNING *
  `) as unknown as DbProduct[];
  return mapProduct(rows[0]);
}

export async function dbUpdateProduct(id: string, updates: Partial<Product>) {
  const sql = getSql();
  // originalPrice and brand can be cleared, so "key present" means "set it",
  // even to null; every other field keeps its value when omitted.
  const setOriginalPrice = "originalPrice" in updates;
  const setBrand = "brand" in updates;
  const rows = (await sql`
    UPDATE products SET
      name = COALESCE(${updates.name ?? null}, name),
      description = COALESCE(${updates.description ?? null}, description),
      price = COALESCE(${updates.price ?? null}, price),
      original_price = CASE WHEN ${setOriginalPrice} THEN ${updates.originalPrice ?? null}::int ELSE original_price END,
      images = COALESCE(${updates.images ?? null}, images),
      videos = COALESCE(${updates.videos ?? null}, videos),
      category_ids = COALESCE(${updates.categoryIds ?? null}, category_ids),
      brand = CASE WHEN ${setBrand} THEN ${updates.brand ?? null}::text ELSE brand END,
      stock = COALESCE(${updates.stock ?? null}, stock),
      featured = COALESCE(${updates.featured ?? null}, featured),
      is_new = COALESCE(${updates.isNew ?? null}, is_new),
      is_latest = COALESCE(${updates.isLatest ?? null}, is_latest),
      tags = COALESCE(${updates.tags ?? null}, tags),
      active = COALESCE(${updates.active ?? null}::boolean, active),
      updated_at = now()
    WHERE id = ${id}
    RETURNING *
  `) as unknown as DbProduct[];
  if (!rows[0]) throw new Error("Product not found");
  return mapProduct(rows[0]);
}

export async function dbDeleteProduct(id: string) {
  const sql = getSql();
  await sql`UPDATE products SET active = false WHERE id = ${id}`;
}

export async function dbAddOrder(order: Order) {
  const db = orderToDb(order);

  // Throwing inside begin() rolls back every stock decrement made so far.
  const inserted = await getTxSql().begin(async (tx) => {
    for (const item of order.items) {
      const updated = await tx`
        UPDATE products
        SET stock = stock - ${item.quantity}
        WHERE id = ${item.productId} AND active = true AND stock >= ${item.quantity}
        RETURNING id
      `;
      if (!updated.length) {
        throw new Error(`Insufficient stock for ${item.productName}`);
      }
    }

    return (await tx`
      INSERT INTO orders (
        id, order_number, customer_name, phone, email, address, city, notes,
        items, subtotal, shipping, discount, discount_percent, total,
        payment_method, payment_status, order_status, payment_screenshot, created_at
      ) VALUES (
        ${db.id}, ${db.order_number}, ${db.customer_name}, ${db.phone}, ${db.email},
        ${db.address}, ${db.city}, ${db.notes}, ${tx.json(db.items as unknown as postgres.JSONValue)},
        ${db.subtotal}, ${db.shipping}, ${db.discount}, ${db.discount_percent}, ${db.total},
        ${db.payment_method}, ${db.payment_status}, ${db.order_status},
        ${db.payment_screenshot}, ${db.created_at}
      ) RETURNING *
    `) as unknown as DbOrder[];
  });

  return mapOrder(inserted[0]);
}

export async function dbUpdateOrder(id: string, updates: Partial<Order>) {

  const rows = await getTxSql().begin(async (tx) => {
    const existingRows = (await tx`
      SELECT * FROM orders WHERE id = ${id} LIMIT 1 FOR UPDATE
    `) as unknown as DbOrder[];
    const existing = existingRows[0];
    if (!existing) throw new Error("Order not found");

    const nextStatus = updates.orderStatus ?? existing.order_status;
    const wasCancelled = existing.order_status === "cancelled";
    const willBeCancelled = nextStatus === "cancelled";

    const updated = (await tx`
      UPDATE orders SET
        payment_status = COALESCE(${updates.paymentStatus ?? null}, payment_status),
        order_status = COALESCE(${updates.orderStatus ?? null}, order_status),
        payment_screenshot = COALESCE(${updates.paymentScreenshot ?? null}, payment_screenshot)
      WHERE id = ${id}
      RETURNING *
    `) as unknown as DbOrder[];

    // Reconcile stock when an order is cancelled (restore) or un-cancelled (re-decrement).
    if (!wasCancelled && willBeCancelled) {
      for (const item of existing.items) {
        await tx`
          UPDATE products SET stock = stock + ${item.quantity}
          WHERE id = ${item.productId}
        `;
      }
    } else if (wasCancelled && !willBeCancelled) {
      for (const item of existing.items) {
        await tx`
          UPDATE products SET stock = GREATEST(stock - ${item.quantity}, 0)
          WHERE id = ${item.productId}
        `;
      }
    }

    return updated;
  });

  if (!rows[0]) throw new Error("Order not found");
  return mapOrder(rows[0]);
}

export async function dbHealthCheck() {
  const sql = getSql();
  const rows = (await sql`SELECT 1 AS ok`) as unknown as { ok: number }[];
  return rows[0]?.ok === 1;
}
