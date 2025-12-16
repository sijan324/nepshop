import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Filter, SlidersHorizontal, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Layout } from "@/components/layout/Layout";
import { ProductGrid } from "@/components/products/ProductGrid";
import type { ProductWithCategory, Category } from "@/lib/types";

const sortOptions = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name-asc", label: "Name: A to Z" },
];

export default function Products() {
  const searchString = useSearch();
  const [, setLocation] = useLocation();
  const searchParams = new URLSearchParams(searchString);
  
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [sort, setSort] = useState(searchParams.get("sort") || "newest");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const buildProductsUrl = () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (category) params.set("categoryId", category);
    if (sort === "price-asc") {
      params.set("sortBy", "price");
      params.set("sortOrder", "asc");
    } else if (sort === "price-desc") {
      params.set("sortBy", "price");
      params.set("sortOrder", "desc");
    } else if (sort === "name-asc") {
      params.set("sortBy", "name");
      params.set("sortOrder", "asc");
    }
    const queryString = params.toString();
    return `/api/products${queryString ? `?${queryString}` : ""}`;
  };

  const productsUrl = buildProductsUrl();

  const { data: productsData, isLoading } = useQuery<{ products: ProductWithCategory[]; total: number }>({
    queryKey: [productsUrl],
  });

  const products = productsData?.products;

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (category) params.set("category", category);
    if (sort && sort !== "newest") params.set("sort", sort);
    
    const newSearch = params.toString();
    setLocation(`/products${newSearch ? `?${newSearch}` : ""}`, { replace: true });
  }, [search, category, sort, setLocation]);

  const clearFilters = () => {
    setSearch("");
    setCategory("");
    setSort("newest");
  };

  const hasActiveFilters = search || category || sort !== "newest";

  const FilterContent = () => (
    <div className="space-y-6">
      <div>
        <Label className="text-sm font-medium mb-3 block">Search</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
            data-testid="input-filter-search"
          />
        </div>
      </div>

      <div>
        <Label className="text-sm font-medium mb-3 block">Category</Label>
        <div className="space-y-2">
          {categories?.map((cat) => (
            <div key={cat.id} className="flex items-center gap-2">
              <Checkbox
                id={`category-${cat.id}`}
                checked={category === cat.slug}
                onCheckedChange={(checked) => setCategory(checked ? cat.slug : "")}
                data-testid={`checkbox-category-${cat.slug}`}
              />
              <label
                htmlFor={`category-${cat.id}`}
                className="text-sm cursor-pointer flex-1"
              >
                {cat.name}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-sm font-medium mb-3 block">Sort By</Label>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger data-testid="select-sort">
            <SelectValue placeholder="Select sort order" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {hasActiveFilters && (
        <Button
          variant="outline"
          className="w-full"
          onClick={clearFilters}
          data-testid="button-clear-filters"
        >
          <X className="h-4 w-4 mr-2" />
          Clear Filters
        </Button>
      )}
    </div>
  );

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <Card className="p-6 sticky top-24">
              <div className="flex items-center gap-2 mb-6">
                <Filter className="h-5 w-5" />
                <h2 className="font-semibold text-lg">Filters</h2>
              </div>
              <FilterContent />
            </Card>
          </aside>

          <main className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Products</h1>
                <div className="text-muted-foreground mt-1 text-sm">
                  {isLoading ? (
                    <Skeleton className="h-4 w-32" />
                  ) : (
                    `${products?.length || 0} products found`
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                  <SheetTrigger asChild className="lg:hidden">
                    <Button variant="outline" data-testid="button-mobile-filters">
                      <SlidersHorizontal className="h-4 w-4 mr-2" />
                      Filters
                      {hasActiveFilters && (
                        <span className="ml-2 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                          !
                        </span>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80">
                    <SheetHeader>
                      <SheetTitle className="flex items-center gap-2">
                        <Filter className="h-5 w-5" />
                        Filters
                      </SheetTitle>
                    </SheetHeader>
                    <div className="mt-6">
                      <FilterContent />
                    </div>
                  </SheetContent>
                </Sheet>

                <div className="hidden sm:block lg:hidden">
                  <Select value={sort} onValueChange={setSort}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      {sortOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 mb-6">
                {search && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setSearch("")}
                    className="gap-1"
                  >
                    Search: {search}
                    <X className="h-3 w-3" />
                  </Button>
                )}
                {category && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setCategory("")}
                    className="gap-1"
                  >
                    Category: {category}
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            )}

            <ProductGrid
              products={products || []}
              isLoading={isLoading}
              emptyMessage="No products match your filters. Try adjusting your search criteria."
            />
          </main>
        </div>
      </div>
    </Layout>
  );
}
