export interface ProductWithCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: string;
  compareAtPrice: string | null;
  categoryId: string | null;
  images: string[];
  stock: number;
  isActive: boolean;
  isFeatured: boolean | null;
  taxRate: string | null;
  createdAt: Date;
  updatedAt: Date;
  category?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  variants?: ProductVariant[];
}

export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  size: string | null;
  color: string | null;
  price: string | null;
  stock: number;
  sku: string | null;
}

export interface CartItemWithProduct {
  id: string;
  cartId: string;
  productId: string;
  variantId: string | null;
  quantity: number;
  price: string;
  product: ProductWithCategory;
  variant?: ProductVariant | null;
}

export interface OrderWithItems {
  id: string;
  orderNumber: string;
  userId: string;
  status: "PENDING" | "PAID" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  subtotal: string;
  tax: string | null;
  shippingCost: string | null;
  discount: string | null;
  total: string;
  couponId: string | null;
  shippingAddressId: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  paidAt: Date | null;
  shippedAt: Date | null;
  deliveredAt: Date | null;
  items: OrderItemWithProduct[];
  shippingAddress?: Address | null;
}

export interface OrderItemWithProduct {
  id: string;
  orderId: string;
  productId: string;
  variantId: string | null;
  productName: string;
  variantName: string | null;
  quantity: number;
  price: string;
  total: string;
  product?: ProductWithCategory;
}

export interface Address {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  postalCode: string | null;
  country: string;
  isDefault: boolean | null;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  parentId: string | null;
  createdAt: Date;
  children?: Category[];
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "ADMIN" | "CUSTOMER";
  phone: string | null;
  isVerified: boolean | null;
  createdAt: Date;
  updatedAt: Date;
  lastLogin: Date | null;
}

export interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discountType: string;
  discountValue: string;
  minOrderAmount: string | null;
  maxDiscount: string | null;
  usageLimit: number | null;
  usedCount: number | null;
  isActive: boolean | null;
  expiresAt: Date | null;
  createdAt: Date;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface CartState {
  items: CartItemWithProduct[];
  subtotal: number;
  itemCount: number;
}

// Alias types for simpler usage
export type Product = ProductWithCategory;
export type Order = OrderWithItems;
export type OrderItem = OrderItemWithProduct;

export interface Review {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  title: string | null;
  comment: string | null;
  isVerified: boolean | null;
  createdAt: Date;
  product?: Product;
}
