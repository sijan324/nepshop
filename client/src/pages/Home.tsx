import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Truck, Shield, CreditCard, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Layout } from "@/components/layout/Layout";
import { ProductGrid } from "@/components/products/ProductGrid";
import type { ProductWithCategory, Category } from "@/lib/types";

const features = [
  {
    icon: Truck,
    title: "Free Shipping",
    description: "On orders over NPR 5,000",
  },
  {
    icon: Shield,
    title: "Secure Payment",
    description: "eSewa & COD available",
  },
  {
    icon: CreditCard,
    title: "Easy Returns",
    description: "7 days return policy",
  },
  {
    icon: RefreshCw,
    title: "24/7 Support",
    description: "We're here to help",
  },
];

export default function Home() {
  const { data: productsData, isLoading: loadingProducts } = useQuery<{ products: ProductWithCategory[]; total: number }>({
    queryKey: ["/api/products", { featured: true, limit: 8 }],
  });
  const featuredProducts = productsData?.products;

  const { data: categories, isLoading: loadingCategories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  return (
    <Layout>
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container mx-auto px-4 py-16 md:py-24 lg:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Shop the Best Products in{" "}
              <span className="text-primary">Nepal</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Discover quality products with secure eSewa payments and fast delivery across Nepal. Your trusted online shopping destination.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild data-testid="button-shop-now">
                <Link href="/products">
                  Shop Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild data-testid="button-view-categories">
                <Link href="/categories">View Categories</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y bg-card">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-8">
            {features.map((feature) => (
              <div key={feature.title} className="flex items-center gap-3">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{feature.title}</h3>
                  <p className="text-xs text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">Shop by Category</h2>
            <p className="text-muted-foreground mt-1">Browse our collection by category</p>
          </div>
          <Button variant="ghost" asChild data-testid="link-all-categories">
            <Link href="/categories">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {loadingCategories ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[4/3] rounded-lg" />
            ))}
          </div>
        ) : categories && categories.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.slice(0, 8).map((category) => (
              <Link key={category.id} href={`/products?category=${category.slug}`}>
                <Card className="group overflow-hidden hover-elevate cursor-pointer h-full" data-testid={`card-category-${category.id}`}>
                  <div className="aspect-[4/3] relative overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5">
                    {category.image ? (
                      <img
                        src={category.image}
                        alt={category.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <span className="text-4xl font-bold text-primary/30">
                          {category.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-white font-semibold text-lg">{category.name}</h3>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No categories available</p>
          </Card>
        )}
      </section>

      <section className="bg-card border-y">
        <div className="container mx-auto px-4 py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">Featured Products</h2>
              <p className="text-muted-foreground mt-1">Handpicked products just for you</p>
            </div>
            <Button variant="ghost" asChild data-testid="link-all-products">
              <Link href="/products">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <ProductGrid
            products={featuredProducts || []}
            isLoading={loadingProducts}
            emptyMessage="No featured products available"
          />
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <Card className="overflow-hidden bg-gradient-to-r from-primary to-primary/80">
          <CardContent className="p-8 md:p-12">
            <div className="max-w-2xl">
              <h2 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-4">
                Get 10% Off Your First Order
              </h2>
              <p className="text-primary-foreground/80 mb-6">
                Sign up for our newsletter and receive exclusive offers, early access to sales, and more.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button size="lg" variant="secondary" asChild>
                  <Link href="/register" data-testid="button-signup-promo">
                    Sign Up Now
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </Layout>
  );
}
