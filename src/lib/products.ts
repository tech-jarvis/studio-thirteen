import {
  getCategories,
  getCategoryBySlug,
  getProductById,
  getProducts,
} from "./store";
import { Category, Product } from "./types";

export { getCategories, getCategoryBySlug, getProductById, getProducts };

export async function getFeatured(limit = 4) {
  const result = await getProducts({ featured: true }, { page: 1, pageSize: limit });
  return result.items;
}

export async function getNewArrivals(limit = 4) {
  const result = await getProducts({ isNew: true }, { page: 1, pageSize: limit });
  return result.items;
}

export async function getLatestProducts(limit = 4) {
  const result = await getProducts({ isLatest: true }, { page: 1, pageSize: limit });
  return result.items;
}

export async function getById(id: string) {
  return getProductById(id);
}

export async function getByCategorySlug(slug: string, page = 1, pageSize = 24) {
  return getProducts({ categorySlug: slug }, { page, pageSize });
}

export async function getProductsWithCategories(products: Product[]) {
  const categories = await getCategories();
  const categoryMap = new Map(categories.map((c) => [c.id, c]));
  return products.map((p) => ({
    ...p,
    categories: p.categoryIds
      .map((id) => categoryMap.get(id))
      .filter(Boolean) as Category[],
  }));
}
