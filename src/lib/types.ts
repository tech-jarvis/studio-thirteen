export type CategoryType = "season" | "product_type";

export interface Category {
  id: string;
  name: string;
  slug: string;
  type: CategoryType;
  description?: string;
  image?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  categoryIds: string[];
  brand?: string;
  stock: number;
  featured?: boolean;
  isNew?: boolean;
  isLatest?: boolean;
  tags: string[];
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export type PaymentMethod = "cod" | "online";
export type PaymentStatus = "pending" | "paid" | "failed";
export type OrderStatus =
  | "pending"
  | "paid"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  notes?: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  discountPercent: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  paymentScreenshot?: string;
  createdAt: string;
}

export interface StoreData {
  categories: Category[];
  products: Product[];
  orders: Order[];
}
