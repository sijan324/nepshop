import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, FolderOpen } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Layout } from "@/components/layout/Layout";
import type { Category } from "@/lib/types";

export default function Categories() {
  const { data: categories, isLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold">Shop by Category</h1>
          <p className="text-muted-foreground mt-1">Browse our collection by category</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[4/3] rounded-lg" />
            ))}
          </div>
        ) : categories && categories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Link key={category.id} href={`/products?category=${category.slug}`}>
                <Card
                  className="group overflow-hidden hover-elevate cursor-pointer h-full"
                  data-testid={`card-category-${category.id}`}
                >
                  <div className="aspect-[4/3] relative overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5">
                    {category.image ? (
                      <img
                        src={category.image}
                        alt={category.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <FolderOpen className="h-16 w-16 text-primary/30" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <h3 className="text-white font-bold text-xl mb-1">{category.name}</h3>
                      {category.description && (
                        <p className="text-white/80 text-sm line-clamp-2">{category.description}</p>
                      )}
                      <div className="flex items-center text-white/90 text-sm mt-3 group-hover:text-white">
                        Shop Now
                        <ArrowRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <FolderOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-2">No Categories Yet</h3>
            <p className="text-muted-foreground">Check back soon for product categories.</p>
          </Card>
        )}
      </div>
    </Layout>
  );
}
