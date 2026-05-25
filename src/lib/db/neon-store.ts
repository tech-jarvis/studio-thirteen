import { getSql } from "./neon";
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
    ? await sql`SELECT * FROM categories WHERE type = ${type} ORDER BY name`
    : await sql`SELECT * FROM categories ORDER BY name`) as DbCategory[];
  return rows.map(mapCategory);
}

export async function dbGetCategoryBySlug(slug: string) {
  const sql = getSql();
  const rows = (await sql`SELECT * FROM categories WHERE slug = ${slug} LIMIT 1`) as DbCategory[];
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

  const countRows = (await sql`
    SELECT COUNT(*)::int AS count FROM products p
    WHERE (${activeOnly} = false OR p.active = true)
      AND (${categoryId ?? null}::text IS NULL OR ${categoryId ?? null} = ANY(p.category_ids))
      AND (${filters?.featured ?? null}::boolean IS NULL OR p.featured = ${filters?.featured ?? false})
      AND (${filters?.isNew ?? null}::boolean IS NULL OR p.is_new = ${filters?.isNew ?? false})
      AND (${filters?.isLatest ?? null}::boolean IS NULL OR p.is_latest = ${filters?.isLatest ?? false})
      AND (${saleOnly} = false OR (p.original_price IS NOT NULL AND p.original_price > p.price))
      AND (${search}::text IS NULL OR p.name ILIKE ${search ? `%${search}%` : null} OR p.brand ILIKE ${search ? `%${search}%` : null})
  `) as { count: number }[];
  const total = countRows[0]?.count ?? 0;

  const rows = (await sql`
    SELECT p.* FROM products p
    WHERE (${activeOnly} = false OR p.active = true)
      AND (${categoryId ?? null}::text IS NULL OR ${categoryId ?? null} = ANY(p.category_ids))
      AND (${filters?.featured ?? null}::boolean IS NULL OR p.featured = ${filters?.featured ?? false})
      AND (${filters?.isNew ?? null}::boolean IS NULL OR p.is_new = ${filters?.isNew ?? false})
      AND (${filters?.isLatest ?? null}::boolean IS NULL OR p.is_latest = ${filters?.isLatest ?? false})
      AND (${saleOnly} = false OR (p.original_price IS NOT NULL AND p.original_price > p.price))
      AND (${search}::text IS NULL OR p.name ILIKE ${search ? `%${search}%` : null} OR p.brand ILIKE ${search ? `%${search}%` : null})
    ORDER BY p.created_at DESC
    LIMIT ${pageSize} OFFSET ${offset}
  `) as DbProduct[];

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
    : await sql`SELECT * FROM products WHERE id = ${id} AND active = true LIMIT 1`) as DbProduct[];
  return rows[0] ? mapProduct(rows[0]) : undefined;
}

export async function dbGetProductsByIds(ids: string[]) {
  if (!ids.length) return [];
  const sql = getSql();
  const rows = (await sql`
    SELECT * FROM products WHERE id = ANY(${ids}) AND active = true
  `) as DbProduct[];
  return rows.map(mapProduct);
}

export async function dbGetOrders(pagination?: Pagination): Promise<Paginated<Order>> {
  const sql = getSql();
  const { page, pageSize, offset } = paginate(pagination?.page, pagination?.pageSize ?? 50);

  const countRows = (await sql`SELECT COUNT(*)::int AS count FROM orders`) as { count: number }[];
  const total = countRows[0]?.count ?? 0;

  const rows = (await sql`
    SELECT * FROM orders ORDER BY created_at DESC
    LIMIT ${pageSize} OFFSET ${offset}
  `) as DbOrder[];

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
  const rows = (await sql`SELECT * FROM orders WHERE id = ${id} LIMIT 1`) as DbOrder[];
  return rows[0] ? mapOrder(rows[0]) : undefined;
}

export async function dbGetOrderByNumber(orderNumber: string) {
  const sql = getSql();
  const rows = (await sql`SELECT * FROM orders WHERE order_number = ${orderNumber} LIMIT 1`) as DbOrder[];
  return rows[0] ? mapOrder(rows[0]) : undefined;
}

export async function dbAddCategory(category: Category) {
  const sql = getSql();
  const db = categoryToDb(category);
  const rows = (await sql`
    INSERT INTO categories (id, name, slug, type, description, image)
    VALUES (${category.id}, ${db.name}, ${db.slug}, ${db.type}, ${db.description}, ${db.image})
  RETURNING *
  `) as DbCategory[];
  return mapCategory(rows[0]);
}

export async function dbUpdateCategory(id: string, updates: Partial<Category>) {
  const sql = getSql();
  const rows = (await sql`
    UPDATE categories SET
      name = COALESCE(${updates.name ?? null}, name),
      slug = COALESCE(${updates.slug ?? null}, slug),
      type = COALESCE(${updates.type ?? null}, type),
      description = COALESCE(${updates.description ?? null}, description),
      image = COALESCE(${updates.image ?? null}, image)
    WHERE id = ${id}
    RETURNING *
  `) as DbCategory[];
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
      id, name, description, price, original_price, images, category_ids,
      brand, stock, featured, is_new, is_latest, tags
    ) VALUES (
      ${product.id}, ${db.name}, ${db.description}, ${db.price}, ${db.original_price},
      ${db.images}, ${db.category_ids}, ${db.brand}, ${db.stock},
      ${db.featured}, ${db.is_new}, ${db.is_latest}, ${db.tags}
    ) RETURNING *
  `) as DbProduct[];
  return mapProduct(rows[0]);
}

export async function dbUpdateProduct(id: string, updates: Partial<Product>) {
  const sql = getSql();
  const rows = (await sql`
    UPDATE products SET
      name = COALESCE(${updates.name ?? null}, name),
      description = COALESCE(${updates.description ?? null}, description),
      price = COALESCE(${updates.price ?? null}, price),
      original_price = COALESCE(${updates.originalPrice ?? null}, original_price),
      images = COALESCE(${updates.images ?? null}, images),
      category_ids = COALESCE(${updates.categoryIds ?? null}, category_ids),
      brand = COALESCE(${updates.brand ?? null}, brand),
      stock = COALESCE(${updates.stock ?? null}, stock),
      featured = COALESCE(${updates.featured ?? null}, featured),
      is_new = COALESCE(${updates.isNew ?? null}, is_new),
      is_latest = COALESCE(${updates.isLatest ?? null}, is_latest),
      tags = COALESCE(${updates.tags ?? null}, tags)
    WHERE id = ${id}
    RETURNING *
  `) as DbProduct[];
  if (!rows[0]) throw new Error("Product not found");
  return mapProduct(rows[0]);
}

export async function dbDeleteProduct(id: string) {
  const sql = getSql();
  await sql`UPDATE products SET active = false WHERE id = ${id}`;
}

export async function dbAddOrder(order: Order) {
  const sql = getSql();
  const db = orderToDb(order);

  const results = await sql.transaction([
    ...order.items.map(
      (item) =>
        sql`
          UPDATE products
          SET stock = stock - ${item.quantity}
          WHERE id = ${item.productId} AND active = true AND stock >= ${item.quantity}
          RETURNING id
        `
    ),
    sql`
      INSERT INTO orders (
        id, order_number, customer_name, phone, email, address, city, notes,
        items, subtotal, shipping, discount, discount_percent, total,
        payment_method, payment_status, order_status, payment_screenshot, created_at
      ) VALUES (
        ${db.id}, ${db.order_number}, ${db.customer_name}, ${db.phone}, ${db.email},
        ${db.address}, ${db.city}, ${db.notes}, ${JSON.stringify(db.items)}::jsonb,
        ${db.subtotal}, ${db.shipping}, ${db.discount}, ${db.discount_percent}, ${db.total},
        ${db.payment_method}, ${db.payment_status}, ${db.order_status},
        ${db.payment_screenshot}, ${db.created_at}
      ) RETURNING *
    `,
  ]);

  const stockResults = results.slice(0, order.items.length) as { id: string }[][];
  for (let i = 0; i < order.items.length; i++) {
    if (!stockResults[i]?.length) {
      throw new Error(`Insufficient stock for ${order.items[i].productName}`);
    }
  }

  const inserted = results[results.length - 1] as DbOrder[];
  return mapOrder(inserted[0]);
}

export async function dbUpdateOrder(id: string, updates: Partial<Order>) {
  const sql = getSql();
  const rows = (await sql`
    UPDATE orders SET
      payment_status = COALESCE(${updates.paymentStatus ?? null}, payment_status),
      order_status = COALESCE(${updates.orderStatus ?? null}, order_status),
      payment_screenshot = COALESCE(${updates.paymentScreenshot ?? null}, payment_screenshot)
    WHERE id = ${id}
    RETURNING *
  `) as DbOrder[];
  if (!rows[0]) throw new Error("Order not found");
  return mapOrder(rows[0]);
}

export async function dbHealthCheck() {
  const sql = getSql();
  const rows = (await sql`SELECT 1 AS ok`) as { ok: number }[];
  return rows[0]?.ok === 1;
}
