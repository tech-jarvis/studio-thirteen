import { Category, Product, Order } from "@/lib/types";

export type DbCategory = {
  id: string;
  name: string;
  slug: string;
  type: "season" | "product_type";
  description: string | null;
  image: string | null;
};

export type DbProduct = {
  id: string;
  name: string;
  description: string;
  price: number;
  original_price: number | null;
  images: string[];
  category_ids: string[];
  brand: string | null;
  stock: number;
  featured: boolean;
  is_new: boolean;
  is_latest: boolean;
  tags: string[];
  created_at?: string;
};

export type DbOrder = {
  id: string;
  order_number: string;
  customer_name: string;
  phone: string;
  email: string | null;
  address: string;
  city: string;
  notes: string | null;
  items: Order["items"];
  subtotal: number;
  shipping: number;
  discount: number;
  discount_percent: number;
  total: number;
  payment_method: Order["paymentMethod"];
  payment_status: Order["paymentStatus"];
  order_status: Order["orderStatus"];
  created_at: string;
};

export function mapCategory(row: DbCategory): Category {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    type: row.type,
    description: row.description ?? undefined,
    image: row.image ?? undefined,
  };
}

export function mapProduct(row: DbProduct): Product {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: row.price,
    originalPrice: row.original_price ?? undefined,
    images: row.images ?? [],
    categoryIds: row.category_ids ?? [],
    brand: row.brand ?? undefined,
    stock: row.stock,
    featured: row.featured,
    isNew: row.is_new,
    isLatest: row.is_latest,
    tags: row.tags ?? [],
  };
}

export function mapOrder(row: DbOrder): Order {
  return {
    id: row.id,
    orderNumber: row.order_number,
    customerName: row.customer_name,
    phone: row.phone,
    email: row.email ?? undefined,
    address: row.address,
    city: row.city,
    notes: row.notes ?? undefined,
    items: row.items,
    subtotal: row.subtotal,
    shipping: row.shipping,
    discount: row.discount,
    discountPercent: row.discount_percent,
    total: row.total,
    paymentMethod: row.payment_method,
    paymentStatus: row.payment_status,
    orderStatus: row.order_status,
    createdAt: row.created_at,
  };
}

export function productToDb(
  product: Partial<Product> & { name: string; price: number }
) {
  return {
    name: product.name,
    description: product.description ?? "",
    price: product.price,
    original_price: product.originalPrice ?? null,
    images: product.images ?? [],
    category_ids: product.categoryIds ?? [],
    brand: product.brand ?? null,
    stock: product.stock ?? 0,
    featured: product.featured ?? false,
    is_new: product.isNew ?? false,
    is_latest: product.isLatest ?? false,
    tags: product.tags ?? [],
  };
}

export function categoryToDb(category: Partial<Category> & { name: string; slug: string; type: Category["type"] }) {
  return {
    name: category.name,
    slug: category.slug,
    type: category.type,
    description: category.description ?? null,
    image: category.image ?? null,
  };
}

export function orderToDb(order: Order) {
  return {
    id: order.id,
    order_number: order.orderNumber,
    customer_name: order.customerName,
    phone: order.phone,
    email: order.email ?? null,
    address: order.address,
    city: order.city,
    notes: order.notes ?? null,
    items: order.items,
    subtotal: order.subtotal,
    shipping: order.shipping,
    discount: order.discount,
    discount_percent: order.discountPercent,
    total: order.total,
    payment_method: order.paymentMethod,
    payment_status: order.paymentStatus,
    order_status: order.orderStatus,
    created_at: order.createdAt,
  };
}
