import { eq, and, desc, asc, ilike, or, sql, gte, lte } from "drizzle-orm";
import { db } from "./db";
import {
  users, categories, products, productVariants, addresses,
  coupons, carts, cartItems, orders, orderItems, payments, reviews,
  type User, type InsertUser, type Category, type InsertCategory,
  type Product, type InsertProduct, type ProductVariant, type InsertProductVariant,
  type Address, type InsertAddress, type Coupon, type InsertCoupon,
  type Cart, type InsertCart, type CartItem, type InsertCartItem,
  type Order, type InsertOrder, type OrderItem, type InsertOrderItem,
  type Payment, type InsertPayment, type Review, type InsertReview
} from "@shared/schema";

export interface ProductFilters {
  categoryId?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  sortBy?: 'price' | 'name' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: Partial<InsertUser>): Promise<User | undefined>;

  getCategories(): Promise<Category[]>;
  getCategory(id: string): Promise<Category | undefined>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: string, data: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: string): Promise<boolean>;

  getProducts(filters?: ProductFilters): Promise<{ products: Product[]; total: number }>;
  getProduct(id: string): Promise<Product | undefined>;
  getProductBySlug(slug: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, data: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;

  getProductVariants(productId: string): Promise<ProductVariant[]>;
  createProductVariant(variant: InsertProductVariant): Promise<ProductVariant>;
  updateProductVariant(id: string, data: Partial<InsertProductVariant>): Promise<ProductVariant | undefined>;
  deleteProductVariant(id: string): Promise<boolean>;

  getAddresses(userId: string): Promise<Address[]>;
  getAddress(id: string): Promise<Address | undefined>;
  createAddress(address: InsertAddress): Promise<Address>;
  updateAddress(id: string, data: Partial<InsertAddress>): Promise<Address | undefined>;
  deleteAddress(id: string): Promise<boolean>;

  getCouponByCode(code: string): Promise<Coupon | undefined>;
  getCoupons(): Promise<Coupon[]>;
  createCoupon(coupon: InsertCoupon): Promise<Coupon>;
  updateCoupon(id: string, data: Partial<InsertCoupon>): Promise<Coupon | undefined>;
  incrementCouponUsage(id: string): Promise<void>;

  getCart(userId?: string, sessionId?: string): Promise<Cart | undefined>;
  createCart(cart: InsertCart): Promise<Cart>;
  getCartItems(cartId: string): Promise<CartItem[]>;
  getCartItemsWithProducts(cartId: string): Promise<(CartItem & { product: Product; variant?: ProductVariant })[]>;
  addCartItem(item: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: string, quantity: number): Promise<CartItem | undefined>;
  removeCartItem(id: string): Promise<boolean>;
  clearCart(cartId: string): Promise<void>;
  migrateGuestCartToUser(sessionId: string, userId: string): Promise<void>;

  getOrders(userId?: string): Promise<Order[]>;
  getOrder(id: string): Promise<Order | undefined>;
  getOrderByNumber(orderNumber: string): Promise<Order | undefined>;
  createOrder(order: InsertOrder & { orderNumber: string }): Promise<Order>;
  updateOrderStatus(id: string, status: Order['status'], timestamps?: Partial<Pick<Order, 'paidAt' | 'shippedAt' | 'deliveredAt'>>): Promise<Order | undefined>;

  getOrderItems(orderId: string): Promise<OrderItem[]>;
  createOrderItem(item: InsertOrderItem): Promise<OrderItem>;

  createPayment(payment: InsertPayment): Promise<Payment>;
  getPaymentByOrderId(orderId: string): Promise<Payment | undefined>;
  updatePayment(id: string, data: Partial<InsertPayment>): Promise<Payment | undefined>;

  getProductReviews(productId: string): Promise<Review[]>;
  getUserReviews(userId: string): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  deleteReview(id: string): Promise<boolean>;

  getDashboardStats(): Promise<{
    totalOrders: number;
    totalRevenue: number;
    totalProducts: number;
    totalCustomers: number;
    recentOrders: Order[];
  }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: string, data: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db.update(users).set({ ...data, updatedAt: new Date() }).where(eq(users.id, id)).returning();
    return user;
  }

  async getCategories(): Promise<Category[]> {
    return db.select().from(categories).orderBy(asc(categories.name));
  }

  async getCategory(id: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
    return category;
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
    return category;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [created] = await db.insert(categories).values(category).returning();
    return created;
  }

  async updateCategory(id: string, data: Partial<InsertCategory>): Promise<Category | undefined> {
    const [updated] = await db.update(categories).set(data).where(eq(categories.id, id)).returning();
    return updated;
  }

  async deleteCategory(id: string): Promise<boolean> {
    const result = await db.delete(categories).where(eq(categories.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async getProducts(filters: ProductFilters = {}): Promise<{ products: Product[]; total: number }> {
    const conditions = [];
    
    if (filters.categoryId) {
      conditions.push(eq(products.categoryId, filters.categoryId));
    }
    if (filters.search) {
      conditions.push(or(
        ilike(products.name, `%${filters.search}%`),
        ilike(products.description, `%${filters.search}%`)
      ));
    }
    if (filters.minPrice !== undefined) {
      conditions.push(gte(products.price, filters.minPrice.toString()));
    }
    if (filters.maxPrice !== undefined) {
      conditions.push(lte(products.price, filters.maxPrice.toString()));
    }
    if (filters.isActive !== undefined) {
      conditions.push(eq(products.isActive, filters.isActive));
    }
    if (filters.isFeatured !== undefined) {
      conditions.push(eq(products.isFeatured, filters.isFeatured));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const sortColumn = filters.sortBy === 'price' ? products.price 
      : filters.sortBy === 'name' ? products.name 
      : products.createdAt;
    const sortFn = filters.sortOrder === 'asc' ? asc : desc;

    const [countResult] = await db.select({ count: sql<number>`count(*)` })
      .from(products)
      .where(whereClause);

    let query = db.select().from(products).where(whereClause).orderBy(sortFn(sortColumn));
    
    if (filters.limit) {
      query = query.limit(filters.limit) as typeof query;
    }
    if (filters.offset) {
      query = query.offset(filters.offset) as typeof query;
    }

    const productList = await query;

    return {
      products: productList,
      total: Number(countResult.count)
    };
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id)).limit(1);
    return product;
  }

  async getProductBySlug(slug: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
    return product;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [created] = await db.insert(products).values(product).returning();
    return created;
  }

  async updateProduct(id: string, data: Partial<InsertProduct>): Promise<Product | undefined> {
    const [updated] = await db.update(products).set({ ...data, updatedAt: new Date() }).where(eq(products.id, id)).returning();
    return updated;
  }

  async deleteProduct(id: string): Promise<boolean> {
    const result = await db.delete(products).where(eq(products.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async getProductVariants(productId: string): Promise<ProductVariant[]> {
    return db.select().from(productVariants).where(eq(productVariants.productId, productId));
  }

  async createProductVariant(variant: InsertProductVariant): Promise<ProductVariant> {
    const [created] = await db.insert(productVariants).values(variant).returning();
    return created;
  }

  async updateProductVariant(id: string, data: Partial<InsertProductVariant>): Promise<ProductVariant | undefined> {
    const [updated] = await db.update(productVariants).set(data).where(eq(productVariants.id, id)).returning();
    return updated;
  }

  async deleteProductVariant(id: string): Promise<boolean> {
    const result = await db.delete(productVariants).where(eq(productVariants.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async getAddresses(userId: string): Promise<Address[]> {
    return db.select().from(addresses).where(eq(addresses.userId, userId));
  }

  async getAddress(id: string): Promise<Address | undefined> {
    const [address] = await db.select().from(addresses).where(eq(addresses.id, id)).limit(1);
    return address;
  }

  async createAddress(address: InsertAddress): Promise<Address> {
    if (address.isDefault) {
      await db.update(addresses).set({ isDefault: false }).where(eq(addresses.userId, address.userId));
    }
    const [created] = await db.insert(addresses).values(address).returning();
    return created;
  }

  async updateAddress(id: string, data: Partial<InsertAddress>): Promise<Address | undefined> {
    if (data.isDefault) {
      const [existing] = await db.select().from(addresses).where(eq(addresses.id, id)).limit(1);
      if (existing) {
        await db.update(addresses).set({ isDefault: false }).where(eq(addresses.userId, existing.userId));
      }
    }
    const [updated] = await db.update(addresses).set(data).where(eq(addresses.id, id)).returning();
    return updated;
  }

  async deleteAddress(id: string): Promise<boolean> {
    const result = await db.delete(addresses).where(eq(addresses.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async getCouponByCode(code: string): Promise<Coupon | undefined> {
    const [coupon] = await db.select().from(coupons).where(eq(coupons.code, code.toUpperCase())).limit(1);
    return coupon;
  }

  async getCoupons(): Promise<Coupon[]> {
    return db.select().from(coupons).orderBy(desc(coupons.createdAt));
  }

  async createCoupon(coupon: InsertCoupon): Promise<Coupon> {
    const [created] = await db.insert(coupons).values({ ...coupon, code: coupon.code.toUpperCase() }).returning();
    return created;
  }

  async updateCoupon(id: string, data: Partial<InsertCoupon>): Promise<Coupon | undefined> {
    const updateData = data.code ? { ...data, code: data.code.toUpperCase() } : data;
    const [updated] = await db.update(coupons).set(updateData).where(eq(coupons.id, id)).returning();
    return updated;
  }

  async incrementCouponUsage(id: string): Promise<void> {
    await db.update(coupons).set({ usedCount: sql`${coupons.usedCount} + 1` }).where(eq(coupons.id, id));
  }

  async getCart(userId?: string, sessionId?: string): Promise<Cart | undefined> {
    if (userId) {
      const [cart] = await db.select().from(carts).where(eq(carts.userId, userId)).limit(1);
      return cart;
    }
    if (sessionId) {
      const [cart] = await db.select().from(carts).where(eq(carts.sessionId, sessionId)).limit(1);
      return cart;
    }
    return undefined;
  }

  async createCart(cart: InsertCart): Promise<Cart> {
    const [created] = await db.insert(carts).values(cart).returning();
    return created;
  }

  async getCartItems(cartId: string): Promise<CartItem[]> {
    return db.select().from(cartItems).where(eq(cartItems.cartId, cartId));
  }

  async getCartItemsWithProducts(cartId: string): Promise<(CartItem & { product: Product; variant?: ProductVariant })[]> {
    const items = await db.select().from(cartItems).where(eq(cartItems.cartId, cartId));
    
    const result = await Promise.all(items.map(async (item) => {
      const [product] = await db.select().from(products).where(eq(products.id, item.productId)).limit(1);
      let variant: ProductVariant | undefined;
      if (item.variantId) {
        const [v] = await db.select().from(productVariants).where(eq(productVariants.id, item.variantId)).limit(1);
        variant = v;
      }
      return { ...item, product, variant };
    }));
    
    return result;
  }

  async addCartItem(item: InsertCartItem): Promise<CartItem> {
    const [existing] = await db.select().from(cartItems)
      .where(and(
        eq(cartItems.cartId, item.cartId),
        eq(cartItems.productId, item.productId),
        item.variantId ? eq(cartItems.variantId, item.variantId) : sql`${cartItems.variantId} IS NULL`
      ))
      .limit(1);

    if (existing) {
      const [updated] = await db.update(cartItems)
        .set({ quantity: existing.quantity + (item.quantity || 1) })
        .where(eq(cartItems.id, existing.id))
        .returning();
      return updated;
    }

    const [created] = await db.insert(cartItems).values(item).returning();
    return created;
  }

  async updateCartItem(id: string, quantity: number): Promise<CartItem | undefined> {
    if (quantity <= 0) {
      await this.removeCartItem(id);
      return undefined;
    }
    const [updated] = await db.update(cartItems).set({ quantity }).where(eq(cartItems.id, id)).returning();
    return updated;
  }

  async removeCartItem(id: string): Promise<boolean> {
    const result = await db.delete(cartItems).where(eq(cartItems.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async clearCart(cartId: string): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.cartId, cartId));
  }

  async migrateGuestCartToUser(sessionId: string, userId: string): Promise<void> {
    const guestCart = await this.getCart(undefined, sessionId);
    if (!guestCart) return;

    let userCart = await this.getCart(userId);
    if (!userCart) {
      const [updated] = await db.update(carts)
        .set({ userId, sessionId: null })
        .where(eq(carts.id, guestCart.id))
        .returning();
      return;
    }

    const guestItems = await this.getCartItems(guestCart.id);
    for (const item of guestItems) {
      await this.addCartItem({
        cartId: userCart.id,
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        price: item.price
      });
    }
    
    await this.clearCart(guestCart.id);
    await db.delete(carts).where(eq(carts.id, guestCart.id));
  }

  async getOrders(userId?: string): Promise<Order[]> {
    if (userId) {
      return db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
    }
    return db.select().from(orders).orderBy(desc(orders.createdAt));
  }

  async getOrder(id: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
    return order;
  }

  async getOrderByNumber(orderNumber: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber)).limit(1);
    return order;
  }

  async createOrder(order: InsertOrder & { orderNumber: string }): Promise<Order> {
    const [created] = await db.insert(orders).values(order).returning();
    return created;
  }

  async createOrderWithItems(
    orderData: InsertOrder & { orderNumber: string },
    items: InsertOrderItem[],
    cartId: string,
    couponId?: string
  ): Promise<Order> {
    return await db.transaction(async (tx) => {
      const [order] = await tx.insert(orders).values(orderData).returning();
      
      for (const item of items) {
        await tx.insert(orderItems).values({ ...item, orderId: order.id });
      }
      
      if (couponId) {
        await tx.update(coupons).set({ usedCount: sql`${coupons.usedCount} + 1` }).where(eq(coupons.id, couponId));
      }
      
      await tx.delete(cartItems).where(eq(cartItems.cartId, cartId));
      
      return order;
    });
  }

  async updateOrderStatus(id: string, status: Order['status'], timestamps?: Partial<Pick<Order, 'paidAt' | 'shippedAt' | 'deliveredAt'>>): Promise<Order | undefined> {
    const [updated] = await db.update(orders)
      .set({ status, updatedAt: new Date(), ...timestamps })
      .where(eq(orders.id, id))
      .returning();
    return updated;
  }

  async getOrderItems(orderId: string): Promise<OrderItem[]> {
    return db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  }

  async createOrderItem(item: InsertOrderItem): Promise<OrderItem> {
    const [created] = await db.insert(orderItems).values(item).returning();
    return created;
  }

  async createPayment(payment: InsertPayment): Promise<Payment> {
    const [created] = await db.insert(payments).values(payment).returning();
    return created;
  }

  async getPaymentByOrderId(orderId: string): Promise<Payment | undefined> {
    const [payment] = await db.select().from(payments).where(eq(payments.orderId, orderId)).limit(1);
    return payment;
  }

  async updatePayment(id: string, data: Partial<InsertPayment>): Promise<Payment | undefined> {
    const [updated] = await db.update(payments).set({ ...data, updatedAt: new Date() }).where(eq(payments.id, id)).returning();
    return updated;
  }

  async getProductReviews(productId: string): Promise<Review[]> {
    return db.select().from(reviews).where(eq(reviews.productId, productId)).orderBy(desc(reviews.createdAt));
  }

  async getUserReviews(userId: string): Promise<Review[]> {
    return db.select().from(reviews).where(eq(reviews.userId, userId)).orderBy(desc(reviews.createdAt));
  }

  async createReview(review: InsertReview): Promise<Review> {
    const [created] = await db.insert(reviews).values(review).returning();
    return created;
  }

  async deleteReview(id: string): Promise<boolean> {
    const result = await db.delete(reviews).where(eq(reviews.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async getDashboardStats(): Promise<{
    totalOrders: number;
    totalRevenue: number;
    totalProducts: number;
    totalCustomers: number;
    recentOrders: Order[];
  }> {
    const [orderStats] = await db.select({
      count: sql<number>`count(*)`,
      revenue: sql<number>`COALESCE(sum(${orders.total}::numeric), 0)`
    }).from(orders).where(eq(orders.status, 'PAID'));

    const [productCount] = await db.select({ count: sql<number>`count(*)` }).from(products);
    const [customerCount] = await db.select({ count: sql<number>`count(*)` }).from(users).where(eq(users.role, 'CUSTOMER'));
    
    const recentOrders = await db.select().from(orders).orderBy(desc(orders.createdAt)).limit(5);

    return {
      totalOrders: Number(orderStats.count),
      totalRevenue: Number(orderStats.revenue),
      totalProducts: Number(productCount.count),
      totalCustomers: Number(customerCount.count),
      recentOrders
    };
  }
}

export const storage = new DatabaseStorage();
