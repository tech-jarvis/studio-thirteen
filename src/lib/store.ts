import { promises as fs } from "fs";
import path from "path";
import { StoreData, Category, Product, Order } from "./types";

const STORE_PATH = path.join(process.cwd(), "data", "store.json");

async function readStore(): Promise<StoreData> {
  const raw = await fs.readFile(STORE_PATH, "utf-8");
  return JSON.parse(raw) as StoreData;
}

async function writeStore(data: StoreData) {
  await fs.writeFile(STORE_PATH, JSON.stringify(data, null, 2), "utf-8");
}

export async function getStore(): Promise<StoreData> {
  return readStore();
}

export async function getCategories(type?: string) {
  const store = await readStore();
  if (type) return store.categories.filter((c) => c.type === type);
  return store.categories;
}

export async function getCategoryBySlug(slug: string) {
  const store = await readStore();
  return store.categories.find((c) => c.slug === slug);
}

export async function getProducts(filters?: {
  categorySlug?: string;
  featured?: boolean;
  isNew?: boolean;
  isLatest?: boolean;
  tag?: string;
}) {
  const store = await readStore();
  let list = [...store.products];

  if (filters?.categorySlug) {
    const cat = store.categories.find((c) => c.slug === filters.categorySlug);
    if (cat) list = list.filter((p) => p.categoryIds.includes(cat.id));
  }
  if (filters?.featured) list = list.filter((p) => p.featured);
  if (filters?.isNew) list = list.filter((p) => p.isNew);
  if (filters?.isLatest) list = list.filter((p) => p.isLatest);
  if (filters?.tag === "sale") {
    list = list.filter((p) => p.originalPrice && p.originalPrice > p.price);
  }

  return list;
}

export async function getProductById(id: string) {
  const store = await readStore();
  return store.products.find((p) => p.id === id);
}

export async function getOrders() {
  const store = await readStore();
  return store.orders.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function getOrderById(id: string) {
  const store = await readStore();
  return store.orders.find((o) => o.id === id);
}

export async function getOrderByNumber(orderNumber: string) {
  const store = await readStore();
  return store.orders.find((o) => o.orderNumber === orderNumber);
}

export async function addCategory(category: Category) {
  const store = await readStore();
  store.categories.push(category);
  await writeStore(store);
  return category;
}

export async function updateCategory(id: string, updates: Partial<Category>) {
  const store = await readStore();
  const idx = store.categories.findIndex((c) => c.id === id);
  if (idx === -1) throw new Error("Category not found");
  store.categories[idx] = { ...store.categories[idx], ...updates };
  await writeStore(store);
  return store.categories[idx];
}

export async function deleteCategory(id: string) {
  const store = await readStore();
  store.categories = store.categories.filter((c) => c.id !== id);
  store.products = store.products.map((p) => ({
    ...p,
    categoryIds: p.categoryIds.filter((cid) => cid !== id),
  }));
  await writeStore(store);
}

export async function addProduct(product: Product) {
  const store = await readStore();
  store.products.push(product);
  await writeStore(store);
  return product;
}

export async function updateProduct(id: string, updates: Partial<Product>) {
  const store = await readStore();
  const idx = store.products.findIndex((p) => p.id === id);
  if (idx === -1) throw new Error("Product not found");
  store.products[idx] = { ...store.products[idx], ...updates };
  await writeStore(store);
  return store.products[idx];
}

export async function deleteProduct(id: string) {
  const store = await readStore();
  store.products = store.products.filter((p) => p.id !== id);
  await writeStore(store);
}

export async function addOrder(order: Order) {
  const store = await readStore();
  store.orders.push(order);
  for (const item of order.items) {
    const product = store.products.find((p) => p.id === item.productId);
    if (product) {
      product.stock = Math.max(0, product.stock - item.quantity);
    }
  }
  await writeStore(store);
  return order;
}

export async function updateOrder(id: string, updates: Partial<Order>) {
  const store = await readStore();
  const idx = store.orders.findIndex((o) => o.id === id);
  if (idx === -1) throw new Error("Order not found");
  store.orders[idx] = { ...store.orders[idx], ...updates };
  await writeStore(store);
  return store.orders[idx];
}
