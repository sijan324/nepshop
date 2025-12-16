import { db, pool } from "./db";
import { users, categories, products, coupons } from "@shared/schema";
import bcrypt from "bcrypt";
import { sql } from "drizzle-orm";

async function seed() {
  console.log("Seeding database...");

  const adminPassword = await bcrypt.hash("admin123", 10);
  const userPassword = await bcrypt.hash("user123", 10);

  const [admin] = await db.insert(users).values({
    email: "admin@shop.com",
    password: adminPassword,
    firstName: "Admin",
    lastName: "User",
    role: "ADMIN",
    phone: "+977-9800000001",
    isVerified: true,
  }).onConflictDoNothing().returning();

  const [customer] = await db.insert(users).values({
    email: "customer@shop.com",
    password: userPassword,
    firstName: "Test",
    lastName: "Customer",
    role: "CUSTOMER",
    phone: "+977-9800000002",
    isVerified: true,
  }).onConflictDoNothing().returning();

  console.log("Users created");

  const categoryData = [
    { name: "Electronics", slug: "electronics", description: "Gadgets, phones, and electronic devices", image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400" },
    { name: "Clothing", slug: "clothing", description: "Fashion and apparel for all", image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400" },
    { name: "Home & Kitchen", slug: "home-kitchen", description: "Home essentials and kitchen appliances", image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400" },
    { name: "Sports", slug: "sports", description: "Sports equipment and outdoor gear", image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400" },
    { name: "Beauty", slug: "beauty", description: "Skincare, makeup, and beauty products", image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400" },
  ];

  const insertedCategories = await db.insert(categories).values(categoryData).onConflictDoNothing().returning();
  console.log(`${insertedCategories.length} categories created`);

  const electronicsId = insertedCategories.find(c => c.slug === "electronics")?.id;
  const clothingId = insertedCategories.find(c => c.slug === "clothing")?.id;
  const homeId = insertedCategories.find(c => c.slug === "home-kitchen")?.id;
  const sportsId = insertedCategories.find(c => c.slug === "sports")?.id;
  const beautyId = insertedCategories.find(c => c.slug === "beauty")?.id;

  const productData = [
    { name: "Wireless Bluetooth Earbuds", slug: "wireless-bluetooth-earbuds", description: "High-quality wireless earbuds with noise cancellation and 24-hour battery life.", price: "250.00", compareAtPrice: "350.00", categoryId: electronicsId, images: ["https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400"], stock: 50, isActive: true, isFeatured: true, taxRate: "13" },
    { name: "Smart Watch Pro", slug: "smart-watch-pro", description: "Feature-packed smartwatch with health tracking, GPS, and water resistance.", price: "300.00", compareAtPrice: "400.00", categoryId: electronicsId, images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400"], stock: 30, isActive: true, isFeatured: true, taxRate: "13" },
    { name: "Laptop Stand Aluminum", slug: "laptop-stand-aluminum", description: "Ergonomic aluminum laptop stand for better posture and cooling.", price: "220.00", categoryId: electronicsId, images: ["https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400"], stock: 100, isActive: true, isFeatured: false, taxRate: "13" },
    { name: "USB-C Hub 7-in-1", slug: "usb-c-hub-7in1", description: "Multi-port USB-C hub with HDMI, USB 3.0, SD card reader.", price: "210.00", compareAtPrice: "290.00", categoryId: electronicsId, images: ["https://images.unsplash.com/photo-1625723044792-44de16ccb4e8?w=400"], stock: 75, isActive: true, isFeatured: false, taxRate: "13" },
    { name: "Men's Cotton T-Shirt", slug: "mens-cotton-tshirt", description: "Premium 100% cotton t-shirt, comfortable and breathable.", price: "200.00", compareAtPrice: "300.00", categoryId: clothingId, images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400"], stock: 200, isActive: true, isFeatured: true, taxRate: "13" },
    { name: "Women's Casual Dress", slug: "womens-casual-dress", description: "Elegant casual dress perfect for any occasion.", price: "280.00", compareAtPrice: "380.00", categoryId: clothingId, images: ["https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400"], stock: 80, isActive: true, isFeatured: true, taxRate: "13" },
    { name: "Denim Jacket Classic", slug: "denim-jacket-classic", description: "Timeless denim jacket with modern fit.", price: "290.00", categoryId: clothingId, images: ["https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=400"], stock: 45, isActive: true, isFeatured: false, taxRate: "13" },
    { name: "Non-stick Cookware Set", slug: "nonstick-cookware-set", description: "8-piece non-stick cookware set for modern kitchens.", price: "295.00", compareAtPrice: "395.00", categoryId: homeId, images: ["https://images.unsplash.com/photo-1584990347449-a4c29f0ccee9?w=400"], stock: 25, isActive: true, isFeatured: true, taxRate: "13" },
    { name: "Coffee Maker Automatic", slug: "coffee-maker-automatic", description: "Programmable coffee maker with thermal carafe.", price: "275.00", categoryId: homeId, images: ["https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=400"], stock: 40, isActive: true, isFeatured: false, taxRate: "13" },
    { name: "Yoga Mat Premium", slug: "yoga-mat-premium", description: "Extra thick yoga mat with carrying strap.", price: "230.00", categoryId: sportsId, images: ["https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400"], stock: 150, isActive: true, isFeatured: true, taxRate: "13" },
    { name: "Running Shoes Light", slug: "running-shoes-light", description: "Lightweight running shoes with superior cushioning.", price: "299.00", compareAtPrice: "399.00", categoryId: sportsId, images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400"], stock: 60, isActive: true, isFeatured: true, taxRate: "13" },
    { name: "Skincare Set Complete", slug: "skincare-set-complete", description: "Complete skincare routine set with cleanser, toner, and moisturizer.", price: "260.00", compareAtPrice: "360.00", categoryId: beautyId, images: ["https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400"], stock: 90, isActive: true, isFeatured: true, taxRate: "13" },
  ];

  const insertedProducts = await db.insert(products).values(productData).onConflictDoUpdate({
    target: products.slug,
    set: { 
      price: sql`excluded.price`,
      compareAtPrice: sql`excluded.compare_at_price`
    }
  }).returning();
  console.log(`${insertedProducts.length} products created`);

  const couponData = [
    { code: "WELCOME10", description: "10% off for new customers", discountType: "percentage", discountValue: "10", minOrderAmount: "200", maxDiscount: "500", usageLimit: 100, isActive: true },
    { code: "FLAT200", description: "Flat Rs. 200 off", discountType: "fixed", discountValue: "200", minOrderAmount: "500", isActive: true },
  ];

  const insertedCoupons = await db.insert(coupons).values(couponData).onConflictDoUpdate({
    target: coupons.code,
    set: {
      minOrderAmount: sql`excluded.min_order_amount`,
      discountValue: sql`excluded.discount_value`
    }
  }).returning();
  console.log(`${insertedCoupons.length} coupons created`);

  console.log("Database seeded successfully!");
  console.log("\nTest accounts:");
  console.log("Admin: admin@shop.com / admin123");
  console.log("Customer: customer@shop.com / user123");
  console.log("\nCoupon codes: WELCOME10, FLAT200");

  await pool.end();
}

seed().catch(console.error);
