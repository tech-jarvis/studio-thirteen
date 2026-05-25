import { isNeonConfigured } from "@/lib/db/neon";
import { Category, Product, Order } from "./types";
import * as neon from "./db/neon-store";
import type { Paginated, ProductFilters, Pagination } from "./db/neon-store";

export type { Paginated, ProductFilters, Pagination };

export async function getCategories(type?: string) {
  if (!isNeonConfigured()) throw new Error("Database not configured");
  return neon.dbGetCategories(type);
}

export async function getCategoryBySlug(slug: string) {
  if (!isNeonConfigured()) throw new Error("Database not configured");
  return neon.dbGetCategoryBySlug(slug);
}

export async function getProducts(
  filters?: ProductFilters,
  pagination?: Pagination
) {
  if (!isNeonConfigured()) throw new Error("Database not configured");
  return neon.dbGetProducts(filters, pagination);
}

export async function getProductById(id: string) {
  if (!isNeonConfigured()) throw new Error("Database not configured");
  return neon.dbGetProductById(id);
}

export async function getProductsByIds(ids: string[]) {
  if (!isNeonConfigured()) throw new Error("Database not configured");
  return neon.dbGetProductsByIds(ids);
}

export async function getOrders(pagination?: Pagination) {
  if (!isNeonConfigured()) throw new Error("Database not configured");
  return neon.dbGetAllOrders();
}

export async function getOrdersPaginated(pagination?: Pagination) {
  if (!isNeonConfigured()) throw new Error("Database not configured");
  return neon.dbGetOrders(pagination);
}

export async function getOrderById(id: string) {
  if (!isNeonConfigured()) throw new Error("Database not configured");
  return neon.dbGetOrderById(id);
}

export async function getOrderByNumber(orderNumber: string) {
  if (!isNeonConfigured()) throw new Error("Database not configured");
  return neon.dbGetOrderByNumber(orderNumber);
}

export async function addCategory(category: Category) {
  return neon.dbAddCategory(category);
}

export async function updateCategory(id: string, updates: Partial<Category>) {
  return neon.dbUpdateCategory(id, updates);
}

export async function deleteCategory(id: string) {
  return neon.dbDeleteCategory(id);
}

export async function addProduct(product: Product) {
  return neon.dbAddProduct(product);
}

export async function updateProduct(id: string, updates: Partial<Product>) {
  return neon.dbUpdateProduct(id, updates);
}

export async function deleteProduct(id: string) {
  return neon.dbDeleteProduct(id);
}

export async function addOrder(order: Order) {
  return neon.dbAddOrder(order);
}

export async function updateOrder(id: string, updates: Partial<Order>) {
  return neon.dbUpdateOrder(id, updates);
}

export async function listAllProductsAdmin() {
  return neon.dbListAllProducts();
}

export function getStorageBackend() {
  return isNeonConfigured() ? "neon" : "none";
}

export async function healthCheck() {
  if (!isNeonConfigured()) return { database: false as const };
  try {
    const ok = await neon.dbHealthCheck();
    return { database: ok };
  } catch {
    return { database: false as const };
  }
}
