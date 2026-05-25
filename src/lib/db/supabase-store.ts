import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Category, Product, Order } from "@/lib/types";
import {
  mapCategory,
  mapProduct,
  mapOrder,
  productToDb,
  categoryToDb,
  orderToDb,
  DbProduct,
} from "./mappers";

export async function dbGetCategories(type?: string) {
  const supabase = createSupabaseServerClient();
  let query = supabase.from("categories").select("*").order("name");
  if (type) query = query.eq("type", type);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(mapCategory);
}

export async function dbGetCategoryBySlug(slug: string) {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data ? mapCategory(data) : undefined;
}

export async function dbGetProducts(filters?: {
  categorySlug?: string;
  featured?: boolean;
  isNew?: boolean;
  isLatest?: boolean;
  tag?: string;
}) {
  const supabase = createSupabaseServerClient();
  let categoryId: string | undefined;

  if (filters?.categorySlug) {
    const cat = await dbGetCategoryBySlug(filters.categorySlug);
    categoryId = cat?.id;
    if (!categoryId) return [];
  }

  let query = supabase.from("products").select("*").order("created_at", { ascending: false });

  if (filters?.featured) query = query.eq("featured", true);
  if (filters?.isNew) query = query.eq("is_new", true);
  if (filters?.isLatest) query = query.eq("is_latest", true);

  const { data, error } = await query;
  if (error) throw error;

  let list = (data ?? []).map(mapProduct);

  if (categoryId) {
    list = list.filter((p) => p.categoryIds.includes(categoryId!));
  }

  if (filters?.tag === "sale") {
    list = list.filter((p) => p.originalPrice && p.originalPrice > p.price);
  }

  return list;
}

export async function dbGetProductById(id: string) {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? mapProduct(data as DbProduct) : undefined;
}

export async function dbGetOrders() {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapOrder);
}

export async function dbGetOrderById(id: string) {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? mapOrder(data) : undefined;
}

export async function dbGetOrderByNumber(orderNumber: string) {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("order_number", orderNumber)
    .maybeSingle();
  if (error) throw error;
  return data ? mapOrder(data) : undefined;
}

export async function dbAddCategory(category: Category) {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("categories")
    .insert({ id: category.id, ...categoryToDb(category) })
    .select("*")
    .single();
  if (error) throw error;
  return mapCategory(data);
}

export async function dbUpdateCategory(id: string, updates: Partial<Category>) {
  const supabase = createSupabaseServerClient();
  const payload: Record<string, unknown> = {};
  if (updates.name !== undefined) payload.name = updates.name;
  if (updates.slug !== undefined) payload.slug = updates.slug;
  if (updates.type !== undefined) payload.type = updates.type;
  if (updates.description !== undefined) payload.description = updates.description;
  if (updates.image !== undefined) payload.image = updates.image;

  const { data, error } = await supabase
    .from("categories")
    .update(payload)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return mapCategory(data);
}

export async function dbDeleteCategory(id: string) {
  const supabase = createSupabaseServerClient();
  const { error: catError } = await supabase.from("categories").delete().eq("id", id);
  if (catError) throw catError;

  const { data: products } = await supabase.from("products").select("*");
  for (const row of products ?? []) {
    const product = mapProduct(row as DbProduct);
    if (product.categoryIds.includes(id)) {
      await supabase
        .from("products")
        .update({ category_ids: product.categoryIds.filter((cid) => cid !== id) })
        .eq("id", product.id);
    }
  }
}

export async function dbAddProduct(product: Product) {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("products")
    .insert({ id: product.id, ...productToDb(product) })
    .select("*")
    .single();
  if (error) throw error;
  return mapProduct(data as DbProduct);
}

export async function dbUpdateProduct(id: string, updates: Partial<Product>) {
  const supabase = createSupabaseServerClient();
  const payload: Record<string, unknown> = {};
  if (updates.name !== undefined) payload.name = updates.name;
  if (updates.description !== undefined) payload.description = updates.description;
  if (updates.price !== undefined) payload.price = updates.price;
  if (updates.originalPrice !== undefined) payload.original_price = updates.originalPrice;
  if (updates.images !== undefined) payload.images = updates.images;
  if (updates.categoryIds !== undefined) payload.category_ids = updates.categoryIds;
  if (updates.brand !== undefined) payload.brand = updates.brand;
  if (updates.stock !== undefined) payload.stock = updates.stock;
  if (updates.featured !== undefined) payload.featured = updates.featured;
  if (updates.isNew !== undefined) payload.is_new = updates.isNew;
  if (updates.isLatest !== undefined) payload.is_latest = updates.isLatest;
  if (updates.tags !== undefined) payload.tags = updates.tags;

  const { data, error } = await supabase
    .from("products")
    .update(payload)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return mapProduct(data as DbProduct);
}

export async function dbDeleteProduct(id: string) {
  const supabase = createSupabaseServerClient();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
}

export async function dbAddOrder(order: Order) {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("orders")
    .insert(orderToDb(order))
    .select("*")
    .single();
  if (error) throw error;

  for (const item of order.items) {
    const product = await dbGetProductById(item.productId);
    if (product) {
      await dbUpdateProduct(item.productId, {
        stock: Math.max(0, product.stock - item.quantity),
      });
    }
  }

  return mapOrder(data);
}

export async function dbUpdateOrder(id: string, updates: Partial<Order>) {
  const supabase = createSupabaseServerClient();
  const payload: Record<string, unknown> = {};
  if (updates.paymentStatus !== undefined) payload.payment_status = updates.paymentStatus;
  if (updates.orderStatus !== undefined) payload.order_status = updates.orderStatus;

  const { data, error } = await supabase
    .from("orders")
    .update(payload)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return mapOrder(data);
}
