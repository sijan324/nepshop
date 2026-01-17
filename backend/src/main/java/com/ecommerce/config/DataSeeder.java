package com.ecommerce.config;

import com.ecommerce.model.Category;
import com.ecommerce.model.Product;
import com.ecommerce.repository.CategoryRepository;
import com.ecommerce.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ProductRepository productRepository;

    @Override
    public void run(String... args) throws Exception {
        if (categoryRepository.count() == 0) {
            seedCategoriesAndProducts();
        }
    }

    private void seedCategoriesAndProducts() {
        // Create Categories
        Category electronics = createCategory("Electronics", "electronics", "Latest gadgets and devices", "https://images.unsplash.com/photo-1498049860654-af1a5c5668ba?w=500&q=80");
        Category fashion = createCategory("Fashion", "fashion", "Trendy clothing and accessories", "https://images.unsplash.com/photo-1445205170230-05328324f377?w=500&q=80");
        Category home = createCategory("Home & Living", "home-living", "Essentials for your home", "https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=500&q=80");
        Category sports = createCategory("Sports & Outdoors", "sports-outdoors", "Gear for active lifestyles", "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=500&q=80");

        categoryRepository.saveAll(Arrays.asList(electronics, fashion, home, sports));

        // --- Electronics ---
        Product laptop = createProduct(
            electronics,
            "Premium Ultra Slim Laptop",
            "premium-ultra-slim-laptop",
            "Experience power and portability with our latest ultrabook. Featuring a 4K display, i9 processor, and all-day battery life.",
            new BigDecimal("1299.99"),
            new BigDecimal("1499.99"),
            Arrays.asList("https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&q=80")
        );

        Product headphones = createProduct(
            electronics,
            "Noise Cancelling Headphones",
            "noise-cancelling-headphones",
            "Immerse yourself in music with industry-leading noise cancellation technology.",
            new BigDecimal("299.99"),
            new BigDecimal("349.99"),
            Arrays.asList("https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80")
        );

        Product smartphone = createProduct(
            electronics,
            "Pro Smart Phone 15",
            "pro-smart-phone-15",
            "The ultimate smartphone experience with a pro-grade camera system and all-day battery life.",
            new BigDecimal("999.99"),
            null,
            Arrays.asList("https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&q=80")
        );

        Product watch = createProduct(
            electronics,
            "Series 7 Smart Watch",
            "series-7-smart-watch",
            "Stay connected and active with the Series 7. Features always-on retina display and blood oxygen sensor.",
            new BigDecimal("399.99"),
            new BigDecimal("449.99"),
            Arrays.asList("https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80")
        );

        Product keyboard = createProduct(
            electronics,
            "Mechanical Gaming Keyboard",
            "mechanical-gaming-keyboard",
            "Tactile switches and RGB lighting for the ultimate gaming usage.",
            new BigDecimal("129.99"),
            new BigDecimal("159.99"),
            Arrays.asList("https://images.unsplash.com/photo-1587829741301-dc798b91a05e?w=500&q=80")
        );

        // --- Fashion ---
        Product tshirt = createProduct(
            fashion,
            "Classic Cotton T-Shirt",
            "classic-cotton-t-shirt",
            "Essential wardrobe staple made from 100% organic cotton for maximum comfort.",
            new BigDecimal("29.99"),
            null,
            Arrays.asList("https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&q=80")
        );

        Product denimJacket = createProduct(
            fashion,
            "Vintage Denim Jacket",
            "vintage-denim-jacket",
            "Timeless style with this vintage wash denim jacket. Perfect for layering.",
            new BigDecimal("89.99"),
            new BigDecimal("119.99"),
            Arrays.asList("https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=500&q=80")
        );

        Product sneakers = createProduct(
            fashion,
            "Urban Runner Sneakers",
            "urban-runner-sneakers",
            "Lightweight and breathable sneakers designed for city life and casual running.",
            new BigDecimal("79.99"),
            new BigDecimal("99.99"),
            Arrays.asList("https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80")
        );

        Product sunglasses = createProduct(
            fashion,
            "Aviator Sunglasses",
            "aviator-sunglasses",
            "Classic metal frame aviator sunglasses with UV protection.",
            new BigDecimal("149.99"),
            null,
            Arrays.asList("https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500&q=80")
        );

        // --- Home & Living ---
        Product lamp = createProduct(
            home,
            "Modern Minimalist Lamp",
            "modern-minimalist-lamp",
            "Add a touch of elegance to any room with this modern desk lamp.",
            new BigDecimal("49.99"),
            null,
            Arrays.asList("https://images.unsplash.com/photo-1507473888900-52e1ad147231?w=500&q=80")
        );

        Product plant = createProduct(
            home,
            "Ceramic Potted Plant",
            "ceramic-potted-plant",
            "Artificial succulent in a beautiful ceramic pot. Zero maintenance required.",
            new BigDecimal("24.99"),
            null,
            Arrays.asList("https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=500&q=80")
        );

        Product coffeeMaker = createProduct(
            home,
            "Automatic Coffee Maker",
            "automatic-coffee-maker",
            "Start your morning right with this programmable coffee maker.",
            new BigDecimal("89.99"),
            new BigDecimal("129.99"),
            Arrays.asList("https://images.unsplash.com/photo-1517036665-2070e1781204?w=500&q=80")
        );

        // --- Sports ---
        Product yogaMat = createProduct(
            sports,
            "Non-Slip Yoga Mat",
            "non-slip-yoga-mat",
            "Eco-friendly yoga mat with extra cushioning and non-slip surface.",
            new BigDecimal("35.99"),
            null,
            Arrays.asList("https://images.unsplash.com/photo-1592432678016-e910b752f99e?w=500&q=80")
        );

        Product waterBottle = createProduct(
            sports,
            "Insulated Water Bottle",
            "insulated-water-bottle",
            "Keep your drinks cold for 24 hours or hot for 12 hours.",
            new BigDecimal("29.99"),
            null,
            Arrays.asList("https://images.unsplash.com/photo-1602143407151-eb111db0a55b?w=500&q=80")
        );

        productRepository.saveAll(Arrays.asList(
            laptop, headphones, smartphone, watch, keyboard,
            tshirt, denimJacket, sneakers, sunglasses,
            lamp, plant, coffeeMaker,
            yogaMat, waterBottle
        ));
        
        System.out.println("Database seeded successfully with " + productRepository.count() + " products!");
    }

    private Category createCategory(String name, String slug, String description, String image) {
        Category category = new Category();
        category.setName(name);
        category.setSlug(slug);
        category.setDescription(description);
        category.setImage(image);
        return category;
    }

    private Product createProduct(Category category, String name, String slug, String description, BigDecimal price, BigDecimal compareAtPrice, List<String> images) {
        Product product = new Product();
        product.setCategory(category);
        product.setName(name);
        product.setSlug(slug);
        product.setDescription(description);
        product.setPrice(price);
        product.setCompareAtPrice(compareAtPrice);
        product.setImages(images);
        product.setStock(100);
        product.setActive(true);
        product.setFeatured(true);
        return product;
    }
}
