import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import { Pool } from "pg";
import connectPgSimple from "connect-pg-simple";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { storage } from "./storage";
import {
  loginSchema, registerSchema, insertProductSchema, insertCategorySchema,
  insertAddressSchema, insertReviewSchema, insertCouponSchema
} from "@shared/schema";
import type { User } from "@shared/schema";

declare module "express-session" {
  interface SessionData {
    userId?: string;
    cartSessionId?: string;
  }
}

const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
};

const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Authentication required" });
  }
  const user = await storage.getUser(req.session.userId);
  if (!user || user.role !== "ADMIN") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim();
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  const PgSession = connectPgSimple(session);
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  app.use(
    session({
      store: new PgSession({
        pool,
        tableName: "session",
        createTableIfMissing: true,
      }),
      secret: process.env.SESSION_SECRET || "ecommerce-secret-key",
      resave: false,
      saveUninitialized: true,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      },
    })
  );

  app.post("/api/auth/register", async (req, res) => {
    try {
      const parsed = registerSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.errors[0].message });
      }

      const { confirmPassword, ...userData } = parsed.data;
      const existing = await storage.getUserByEmail(userData.email);
      if (existing) {
        return res.status(400).json({ message: "Email already registered" });
      }

      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = await storage.createUser({ ...userData, password: hashedPassword });

      if (req.session.cartSessionId) {
        await storage.migrateGuestCartToUser(req.session.cartSessionId, user.id);
      }

      req.session.userId = user.id;
      const { password, ...safeUser } = user;
      res.status(201).json(safeUser);
    } catch (error) {
      console.error("Register error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.errors[0].message });
      }

      const user = await storage.getUserByEmail(parsed.data.email);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const validPassword = await bcrypt.compare(parsed.data.password, user.password);
      if (!validPassword) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      await storage.updateUser(user.id, { lastLogin: new Date() } as any);
      
      if (req.session.cartSessionId) {
        await storage.migrateGuestCartToUser(req.session.cartSessionId, user.id);
      }

      req.session.userId = user.id;

      const { password, ...safeUser } = user;
      res.json(safeUser);
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.clearCookie("connect.sid");
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    const { password, ...safeUser } = user;
    res.json(safeUser);
  });

  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.get("/api/categories/:slug", async (req, res) => {
    try {
      const category = await storage.getCategoryBySlug(req.params.slug);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch category" });
    }
  });

  app.post("/api/categories", requireAdmin, async (req, res) => {
    try {
      const parsed = insertCategorySchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.errors[0].message });
      }
      const category = await storage.createCategory({
        ...parsed.data,
        slug: slugify(parsed.data.name)
      });
      res.status(201).json(category);
    } catch (error) {
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  app.patch("/api/categories/:id", requireAdmin, async (req, res) => {
    try {
      const data = req.body;
      if (data.name) {
        data.slug = slugify(data.name);
      }
      const category = await storage.updateCategory(req.params.id, data);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      res.status(500).json({ message: "Failed to update category" });
    }
  });

  app.delete("/api/categories/:id", requireAdmin, async (req, res) => {
    try {
      const deleted = await storage.deleteCategory(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json({ message: "Category deleted" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete category" });
    }
  });

  app.get("/api/products", async (req, res) => {
    try {
      const { categoryId, search, minPrice, maxPrice, featured, sortBy, sortOrder, page, limit } = req.query;
      const pageNum = parseInt(page as string) || 1;
      const limitNum = parseInt(limit as string) || 12;

      const result = await storage.getProducts({
        categoryId: categoryId as string,
        search: search as string,
        minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
        isFeatured: featured === 'true' ? true : undefined,
        isActive: true,
        sortBy: sortBy as 'price' | 'name' | 'createdAt',
        sortOrder: sortOrder as 'asc' | 'desc',
        limit: limitNum,
        offset: (pageNum - 1) * limitNum
      });

      const productsWithCategory = await Promise.all(
        result.products.map(async (product) => {
          const category = product.categoryId ? await storage.getCategory(product.categoryId) : null;
          return { ...product, category };
        })
      );

      res.json({
        products: productsWithCategory,
        total: result.total,
        page: pageNum,
        totalPages: Math.ceil(result.total / limitNum)
      });
    } catch (error) {
      console.error("Products fetch error:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:slug", async (req, res) => {
    try {
      const product = await storage.getProductBySlug(req.params.slug);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      const category = product.categoryId ? await storage.getCategory(product.categoryId) : null;
      const variants = await storage.getProductVariants(product.id);
      const reviews = await storage.getProductReviews(product.id);
      res.json({ ...product, category, variants, reviews });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  app.post("/api/products", requireAdmin, async (req, res) => {
    try {
      const parsed = insertProductSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.errors[0].message });
      }
      const product = await storage.createProduct({
        ...parsed.data,
        slug: slugify(parsed.data.name)
      });
      res.status(201).json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  app.patch("/api/products/:id", requireAdmin, async (req, res) => {
    try {
      const data = req.body;
      if (data.name) {
        data.slug = slugify(data.name);
      }
      const product = await storage.updateProduct(req.params.id, data);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to update product" });
    }
  });

  app.delete("/api/products/:id", requireAdmin, async (req, res) => {
    try {
      const deleted = await storage.deleteProduct(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json({ message: "Product deleted" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  app.get("/api/cart", async (req, res) => {
    try {
      if (!req.session.cartSessionId) {
        req.session.cartSessionId = crypto.randomUUID();
      }

      let cart = await storage.getCart(req.session.userId, req.session.cartSessionId);
      if (!cart) {
        cart = await storage.createCart({
          userId: req.session.userId,
          sessionId: req.session.cartSessionId
        });
      }

      const items = await storage.getCartItemsWithProducts(cart.id);
      res.json({ cart, items });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch cart" });
    }
  });

  app.post("/api/cart/items", async (req, res) => {
    try {
      const { productId, variantId, quantity = 1 } = req.body;

      if (!req.session.cartSessionId) {
        req.session.cartSessionId = crypto.randomUUID();
      }

      let cart = await storage.getCart(req.session.userId, req.session.cartSessionId);
      if (!cart) {
        cart = await storage.createCart({
          userId: req.session.userId,
          sessionId: req.session.cartSessionId
        });
      }

      const product = await storage.getProduct(productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      let price = product.price;
      if (variantId) {
        const variants = await storage.getProductVariants(productId);
        const variant = variants.find(v => v.id === variantId);
        if (variant && variant.price) {
          price = variant.price;
        }
      }

      const item = await storage.addCartItem({
        cartId: cart.id,
        productId,
        variantId,
        quantity,
        price
      });

      const items = await storage.getCartItemsWithProducts(cart.id);
      res.json({ cart, items });
    } catch (error) {
      res.status(500).json({ message: "Failed to add item to cart" });
    }
  });

  app.patch("/api/cart/items/:id", async (req, res) => {
    try {
      const { quantity } = req.body;
      await storage.updateCartItem(req.params.id, quantity);
      
      const cart = await storage.getCart(req.session.userId, req.session.cartSessionId);
      if (!cart) {
        return res.status(404).json({ message: "Cart not found" });
      }

      const items = await storage.getCartItemsWithProducts(cart.id);
      res.json({ cart, items });
    } catch (error) {
      res.status(500).json({ message: "Failed to update cart item" });
    }
  });

  app.delete("/api/cart/items/:id", async (req, res) => {
    try {
      await storage.removeCartItem(req.params.id);
      
      const cart = await storage.getCart(req.session.userId, req.session.cartSessionId);
      if (!cart) {
        return res.status(404).json({ message: "Cart not found" });
      }

      const items = await storage.getCartItemsWithProducts(cart.id);
      res.json({ cart, items });
    } catch (error) {
      res.status(500).json({ message: "Failed to remove cart item" });
    }
  });

  app.get("/api/addresses", requireAuth, async (req, res) => {
    try {
      const addresses = await storage.getAddresses(req.session.userId!);
      res.json(addresses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch addresses" });
    }
  });

  app.post("/api/addresses", requireAuth, async (req, res) => {
    try {
      const parsed = insertAddressSchema.safeParse({ ...req.body, userId: req.session.userId });
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.errors[0].message });
      }
      const address = await storage.createAddress(parsed.data);
      res.status(201).json(address);
    } catch (error) {
      res.status(500).json({ message: "Failed to create address" });
    }
  });

  app.patch("/api/addresses/:id", requireAuth, async (req, res) => {
    try {
      const address = await storage.getAddress(req.params.id);
      if (!address || address.userId !== req.session.userId) {
        return res.status(404).json({ message: "Address not found" });
      }
      const updated = await storage.updateAddress(req.params.id, req.body);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Failed to update address" });
    }
  });

  app.delete("/api/addresses/:id", requireAuth, async (req, res) => {
    try {
      const address = await storage.getAddress(req.params.id);
      if (!address || address.userId !== req.session.userId) {
        return res.status(404).json({ message: "Address not found" });
      }
      await storage.deleteAddress(req.params.id);
      res.json({ message: "Address deleted" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete address" });
    }
  });

  app.post("/api/coupons/validate", async (req, res) => {
    try {
      const { code, subtotal } = req.body;
      const coupon = await storage.getCouponByCode(code);

      if (!coupon) {
        return res.status(404).json({ message: "Invalid coupon code" });
      }

      if (!coupon.isActive) {
        return res.status(400).json({ message: "This coupon is no longer active" });
      }

      if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
        return res.status(400).json({ message: "This coupon has expired" });
      }

      if (coupon.usageLimit && coupon.usedCount && coupon.usedCount >= coupon.usageLimit) {
        return res.status(400).json({ message: "This coupon has reached its usage limit" });
      }

      if (coupon.minOrderAmount && parseFloat(coupon.minOrderAmount) > subtotal) {
        return res.status(400).json({ 
          message: `Minimum order amount is Rs. ${coupon.minOrderAmount}` 
        });
      }

      let discount = 0;
      if (coupon.discountType === 'percentage') {
        discount = (subtotal * parseFloat(coupon.discountValue)) / 100;
        if (coupon.maxDiscount && discount > parseFloat(coupon.maxDiscount)) {
          discount = parseFloat(coupon.maxDiscount);
        }
      } else {
        discount = parseFloat(coupon.discountValue);
      }

      res.json({ coupon, discount });
    } catch (error) {
      res.status(500).json({ message: "Failed to validate coupon" });
    }
  });

  app.get("/api/orders", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      const orders = user?.role === 'ADMIN' 
        ? await storage.getOrders()
        : await storage.getOrders(req.session.userId);

      const ordersWithItems = await Promise.all(
        orders.map(async (order) => {
          const items = await storage.getOrderItems(order.id);
          const address = order.shippingAddressId ? await storage.getAddress(order.shippingAddressId) : null;
          return { ...order, items, shippingAddress: address };
        })
      );

      res.json(ordersWithItems);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get("/api/orders/:id", requireAuth, async (req, res) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      const user = await storage.getUser(req.session.userId!);
      if (order.userId !== req.session.userId && user?.role !== 'ADMIN') {
        return res.status(403).json({ message: "Access denied" });
      }

      const items = await storage.getOrderItems(order.id);
      const address = order.shippingAddressId ? await storage.getAddress(order.shippingAddressId) : null;
      const payment = await storage.getPaymentByOrderId(order.id);

      res.json({ ...order, items, shippingAddress: address, payment });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  app.get("/api/orders/track/:orderNumber", async (req, res) => {
    try {
      const order = await storage.getOrderByNumber(req.params.orderNumber);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      const items = await storage.getOrderItems(order.id);
      const address = order.shippingAddressId ? await storage.getAddress(order.shippingAddressId) : null;

      res.json({ ...order, items, shippingAddress: address });
    } catch (error) {
      res.status(500).json({ message: "Failed to track order" });
    }
  });

  app.post("/api/orders", requireAuth, async (req, res) => {
    try {
      const { shippingAddressId, couponCode, notes } = req.body;

      const cart = await storage.getCart(req.session.userId, req.session.cartSessionId);
      if (!cart) {
        return res.status(400).json({ message: "Cart is empty" });
      }

      const cartItems = await storage.getCartItemsWithProducts(cart.id);
      if (cartItems.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }

      let subtotal = 0;
      let tax = 0;
      const shippingCost = 100;

      for (const item of cartItems) {
        const itemTotal = parseFloat(item.price) * item.quantity;
        subtotal += itemTotal;
        if (item.product.taxRate) {
          tax += itemTotal * (parseFloat(item.product.taxRate) / 100);
        }
      }

      let discount = 0;
      let couponId: string | undefined;

      if (couponCode) {
        const coupon = await storage.getCouponByCode(couponCode);
        if (coupon && coupon.isActive) {
          couponId = coupon.id;
          if (coupon.discountType === 'percentage') {
            discount = (subtotal * parseFloat(coupon.discountValue)) / 100;
            if (coupon.maxDiscount && discount > parseFloat(coupon.maxDiscount)) {
              discount = parseFloat(coupon.maxDiscount);
            }
          } else {
            discount = parseFloat(coupon.discountValue);
          }
        }
      }

      const total = subtotal + tax + shippingCost - discount;

      const orderItemsData = cartItems.map(item => ({
        productId: item.productId,
        variantId: item.variantId,
        productName: item.product.name,
        variantName: item.variant?.name,
        quantity: item.quantity,
        price: item.price,
        total: (parseFloat(item.price) * item.quantity).toFixed(2)
      }));

      const order = await storage.createOrderWithItems(
        {
          orderNumber: generateOrderNumber(),
          userId: req.session.userId!,
          status: 'PENDING',
          subtotal: subtotal.toFixed(2),
          tax: tax.toFixed(2),
          shippingCost: shippingCost.toFixed(2),
          discount: discount.toFixed(2),
          total: total.toFixed(2),
          couponId,
          shippingAddressId,
          notes
        },
        orderItemsData,
        cart.id,
        couponId
      );

      const items = await storage.getOrderItems(order.id);
      res.status(201).json({ ...order, items });
    } catch (error) {
      console.error("Order creation error:", error);
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  app.patch("/api/orders/:id/status", requireAdmin, async (req, res) => {
    try {
      const { status } = req.body;
      const timestamps: any = {};

      if (status === 'PAID') timestamps.paidAt = new Date();
      if (status === 'SHIPPED') timestamps.shippedAt = new Date();
      if (status === 'DELIVERED') timestamps.deliveredAt = new Date();

      const order = await storage.updateOrderStatus(req.params.id, status, timestamps);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to update order status" });
    }
  });

  app.post("/api/payments/esewa/initiate", requireAuth, async (req, res) => {
    try {
      const { orderId } = req.body;
      const order = await storage.getOrder(orderId);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      if (order.userId !== req.session.userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const payment = await storage.createPayment({
        orderId: order.id,
        method: 'esewa',
        amount: order.total,
        status: 'PENDING'
      });

      const merchantCode = process.env.ESEWA_MERCHANT_CODE || "EPAYTEST";
      const secretKey = process.env.ESEWA_SECRET_KEY || "8gBm/:&EnhH.1/q";
      const successUrl = `${req.protocol}://${req.get('host')}/api/payments/esewa/success`;
      const failureUrl = `${req.protocol}://${req.get('host')}/api/payments/esewa/failure`;

      const message = `total_amount=${order.total},transaction_uuid=${payment.id},product_code=${merchantCode}`;
      const signature = crypto.createHmac('sha256', secretKey).update(message).digest('base64');

      res.json({
        paymentUrl: 'https://rc-epay.esewa.com.np/api/epay/main/v2/form',
        formData: {
          amount: String(Number(order.total) - Number(order.tax || 0) - Number(order.shippingCost || 0)),
          tax_amount: String(order.tax || "0"),
          total_amount: String(order.total),
          transaction_uuid: payment.id,
          product_code: merchantCode,
          product_service_charge: "0",
          product_delivery_charge: String(order.shippingCost || "0"),
          success_url: successUrl,
          failure_url: failureUrl,
          signed_field_names: "total_amount,transaction_uuid,product_code",
          signature
        }
      });
    } catch (error) {
      console.error("Payment initiation error:", error);
      res.status(500).json({ message: "Failed to initiate payment" });
    }
  });

  app.get("/api/payments/esewa/success", async (req, res) => {
    try {
      const { data } = req.query;
      if (!data) {
        return res.redirect('/payment-failed?error=missing_data');
      }

      const decodedData = JSON.parse(Buffer.from(data as string, 'base64').toString());
      const { transaction_uuid, status, total_amount, transaction_code, signed_field_names, signature } = decodedData;

      if (status !== 'COMPLETE') {
        return res.redirect(`/payment-failed?error=payment_incomplete`);
      }

      const secretKey = process.env.ESEWA_SECRET_KEY || "8gBm/:&EnhH.1/q";
      const message = `transaction_code=${transaction_code},status=${status},total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${process.env.ESEWA_MERCHANT_CODE || "EPAYTEST"},signed_field_names=${signed_field_names}`;
      const expectedSignature = crypto.createHmac('sha256', secretKey).update(message).digest('base64');

      if (signature !== expectedSignature) {
        console.error("eSewa signature mismatch");
        return res.redirect('/payment-failed?error=invalid_signature');
      }

      const updatedPayment = await storage.updatePayment(transaction_uuid, {
        status: 'COMPLETED',
        transactionId: transaction_code,
        responseData: JSON.stringify(decodedData)
      });
      
      if (updatedPayment && updatedPayment.orderId) {
        const order = await storage.getOrder(updatedPayment.orderId);
        if (order) {
          await storage.updateOrderStatus(order.id, 'PAID', { paidAt: new Date() });
          return res.redirect(`/payment/success?orderNumber=${order.orderNumber}&orderId=${order.id}`);
        }
      }

      res.redirect('/payment/success');
    } catch (error) {
      console.error("Payment success callback error:", error);
      res.redirect('/payment/failed?error=processing_error');
    }
  });

  app.get("/api/payments/esewa/failure", async (req, res) => {
    res.redirect('/payment/failed');
  });

  app.get("/api/reviews/product/:productId", async (req, res) => {
    try {
      const reviews = await storage.getProductReviews(req.params.productId);
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  app.get("/api/reviews/user", requireAuth, async (req, res) => {
    try {
      const reviews = await storage.getUserReviews(req.session.userId!);
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  app.post("/api/reviews", requireAuth, async (req, res) => {
    try {
      const parsed = insertReviewSchema.safeParse({ ...req.body, userId: req.session.userId });
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.errors[0].message });
      }
      const review = await storage.createReview(parsed.data);
      res.status(201).json(review);
    } catch (error) {
      res.status(500).json({ message: "Failed to create review" });
    }
  });

  app.delete("/api/reviews/:id", requireAuth, async (req, res) => {
    try {
      await storage.deleteReview(req.params.id);
      res.json({ message: "Review deleted" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete review" });
    }
  });

  app.get("/api/admin/dashboard", requireAdmin, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  app.get("/api/admin/products", requireAdmin, async (req, res) => {
    try {
      const result = await storage.getProducts({ limit: 100 });
      res.json(result.products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/admin/orders", requireAdmin, async (req, res) => {
    try {
      const orders = await storage.getOrders();
      const ordersWithDetails = await Promise.all(
        orders.map(async (order) => {
          const items = await storage.getOrderItems(order.id);
          const user = await storage.getUser(order.userId);
          return { ...order, items, user: user ? { firstName: user.firstName, lastName: user.lastName, email: user.email } : null };
        })
      );
      res.json(ordersWithDetails);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get("/api/admin/coupons", requireAdmin, async (req, res) => {
    try {
      const coupons = await storage.getCoupons();
      res.json(coupons);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch coupons" });
    }
  });

  app.post("/api/admin/coupons", requireAdmin, async (req, res) => {
    try {
      const parsed = insertCouponSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.errors[0].message });
      }
      const coupon = await storage.createCoupon(parsed.data);
      res.status(201).json(coupon);
    } catch (error) {
      res.status(500).json({ message: "Failed to create coupon" });
    }
  });

  return httpServer;
}
