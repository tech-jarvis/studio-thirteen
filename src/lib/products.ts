import {
  getCategories,
  getCategoryBySlug,
  getProductById,
  getProducts,
} from "./store";
import { Category, Product } from "./types";

export { getCategories, getCategoryBySlug, getProductById, getProducts };

export async function getFeatured() {
  return getProducts({ featured: true });
}

export async function getNewArrivals() {
  return getProducts({ isNew: true });
}

export async function getLatestProducts() {
  return getProducts({ isLatest: true });
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

export async function getById(id: string) {
  return getProductById(id);
}

export async function getByCategorySlug(slug: string) {
  return getProducts({ categorySlug: slug });
}
