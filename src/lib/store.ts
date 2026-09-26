import { isDbConfigured } from "@/lib/db/client";
import { Category, Product, Order } from "./types";
import * as db from "./db/postgres-store";
import type { Paginated, ProductFilters, Pagination } from "./db/postgres-store";

export type { Paginated, ProductFilters, Pagination };

export async function getCategories(type?: string) {
  if (!isDbConfigured()) throw new Error("Database not configured");
  return db.dbGetCategories(type);
}

export async function getCategoryBySlug(slug: string) {
  if (!isDbConfigured()) throw new Error("Database not configured");
  return db.dbGetCategoryBySlug(slug);
}

export async function getProducts(
  filters?: ProductFilters,
  pagination?: Pagination
) {
  if (!isDbConfigured()) throw new Error("Database not configured");
  return db.dbGetProducts(filters, pagination);
}

export async function getProductById(id: string) {
  if (!isDbConfigured()) throw new Error("Database not configured");
  return db.dbGetProductById(id);
}

export async function getProductsByIds(ids: string[]) {
  if (!isDbConfigured()) throw new Error("Database not configured");
  return db.dbGetProductsByIds(ids);
}

export async function getOrders() {
  if (!isDbConfigured()) throw new Error("Database not configured");
  return db.dbGetAllOrders();
}

export async function getOrderById(id: string) {
  if (!isDbConfigured()) throw new Error("Database not configured");
  return db.dbGetOrderById(id);
}

export async function getOrderByNumber(orderNumber: string) {
  if (!isDbConfigured()) throw new Error("Database not configured");
  return db.dbGetOrderByNumber(orderNumber);
}

export async function addCategory(category: Category) {
  return db.dbAddCategory(category);
}

export async function updateCategory(id: string, updates: Partial<Category>) {
  return db.dbUpdateCategory(id, updates);
}

export async function deleteCategory(id: string) {
  return db.dbDeleteCategory(id);
}

export async function addProduct(product: Product) {
  return db.dbAddProduct(product);
}

export async function updateProduct(id: string, updates: Partial<Product>) {
  return db.dbUpdateProduct(id, updates);
}

export async function deleteProduct(id: string) {
  return db.dbDeleteProduct(id);
}

export async function addOrder(order: Order) {
  return db.dbAddOrder(order);
}

export async function updateOrder(id: string, updates: Partial<Order>) {
  return db.dbUpdateOrder(id, updates);
}

export async function attachOrderPaymentProof(id: string, paymentScreenshot: string) {
  return db.dbUpdateOrder(id, { paymentScreenshot });
}

export async function listAllProductsAdmin() {
  return db.dbListAllProducts();
}

export async function healthCheck() {
  if (!isDbConfigured()) return { database: false as const };
  try {
    const ok = await db.dbHealthCheck();
    return { database: ok };
  } catch {
    return { database: false as const };
  }
}
