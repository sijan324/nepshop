import { useState } from "react";
import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ShoppingCart, Minus, Plus, ChevronLeft, Package, Truck, Shield, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Layout } from "@/components/layout/Layout";
import { ProductGrid } from "@/components/products/ProductGrid";
import { useCart } from "@/contexts/CartContext";
import { formatPrice, cn } from "@/lib/utils";
import type { ProductWithCategory, ProductVariant } from "@/lib/types";

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isAdding, setIsAdding] = useState(false);

  const { data: product, isLoading } = useQuery<ProductWithCategory>({
    queryKey: ["/api/products", slug],
    enabled: !!slug,
  });

  const { data: relatedProductsData } = useQuery<{ products: ProductWithCategory[]; total: number }>({
    queryKey: ["/api/products", { categoryId: product?.categoryId, limit: 4, exclude: product?.id }],
    enabled: !!product?.categoryId,
  });
  const relatedProducts = relatedProductsData?.products;

  const handleAddToCart = async () => {
    if (!product) return;
    setIsAdding(true);
    try {
      await addItem(product.id, quantity, selectedVariant?.id);
    } finally {
      setIsAdding(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            <Skeleton className="aspect-square rounded-lg" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <p className="text-muted-foreground mb-8">The product you're looking for doesn't exist.</p>
          <Button asChild>
            <Link href="/products">Browse Products</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const hasDiscount = product.compareAtPrice && parseFloat(product.compareAtPrice) > parseFloat(product.price);
  const discountPercent = hasDiscount
    ? Math.round((1 - parseFloat(product.price) / parseFloat(product.compareAtPrice!)) * 100)
    : 0;
  const currentPrice = selectedVariant?.price ? parseFloat(selectedVariant.price) : parseFloat(product.price);
  const inStock = (selectedVariant?.stock ?? product.stock) > 0;

  const sizes = product.variants?.filter(v => v.size).map(v => v.size) || [];
  const uniqueSizes = [...new Set(sizes)];
  const colors = product.variants?.filter(v => v.color).map(v => v.color) || [];
  const uniqueColors = [...new Set(colors)];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" size="sm" className="mb-6" asChild>
          <Link href="/products">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Products
          </Link>
        </Button>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
              {product.images?.[selectedImage] ? (
                <img
                  src={product.images[selectedImage]}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <Package className="h-24 w-24 text-muted-foreground" />
                </div>
              )}
              {hasDiscount && (
                <Badge variant="destructive" className="absolute top-4 left-4">
                  -{discountPercent}% OFF
                </Badge>
              )}
            </div>
            
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={cn(
                      "flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-colors",
                      selectedImage === index ? "border-primary" : "border-transparent"
                    )}
                    data-testid={`button-image-${index}`}
                  >
                    <img src={image} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            {product.category && (
              <Link href={`/products?category=${product.category.slug}`}>
                <Badge variant="secondary" className="cursor-pointer">
                  {product.category.name}
                </Badge>
              </Link>
            )}

            <div>
              <h1 className="text-2xl md:text-3xl font-bold" data-testid="text-product-name">
                {product.name}
              </h1>
              <div className="flex items-center gap-3 mt-3">
                <span className="text-3xl font-bold" data-testid="text-product-price">
                  {formatPrice(currentPrice)}
                </span>
                {hasDiscount && (
                  <span className="text-lg text-muted-foreground line-through">
                    {formatPrice(parseFloat(product.compareAtPrice!))}
                  </span>
                )}
              </div>
            </div>

            {product.description && (
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            )}

            <Separator />

            {uniqueSizes.length > 0 && (
              <div>
                <label className="text-sm font-medium mb-3 block">Size</label>
                <div className="flex flex-wrap gap-2">
                  {uniqueSizes.map((size) => (
                    <Button
                      key={size}
                      variant={selectedVariant?.size === size ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        const variant = product.variants?.find(v => v.size === size);
                        setSelectedVariant(variant || null);
                      }}
                      data-testid={`button-size-${size}`}
                    >
                      {size}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {uniqueColors.length > 0 && (
              <div>
                <label className="text-sm font-medium mb-3 block">Color</label>
                <div className="flex flex-wrap gap-2">
                  {uniqueColors.map((color) => (
                    <Button
                      key={color}
                      variant={selectedVariant?.color === color ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        const variant = product.variants?.find(v => v.color === color);
                        setSelectedVariant(variant || null);
                      }}
                      data-testid={`button-color-${color}`}
                    >
                      {color}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="text-sm font-medium mb-3 block">Quantity</label>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  data-testid="button-decrease-qty"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center font-medium" data-testid="text-quantity">
                  {quantity}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                  data-testid="button-increase-qty"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {inStock ? (
                <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500">
                  <Check className="h-3 w-3 mr-1" />
                  In Stock
                </Badge>
              ) : (
                <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500">
                  Out of Stock
                </Badge>
              )}
              <span className="text-sm text-muted-foreground">
                {selectedVariant?.stock ?? product.stock} available
              </span>
            </div>

            <Button
              size="lg"
              className="w-full"
              onClick={handleAddToCart}
              disabled={!inStock || isAdding}
              data-testid="button-add-to-cart"
            >
              {isAdding ? (
                <span className="animate-pulse">Adding...</span>
              ) : (
                <>
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Add to Cart
                </>
              )}
            </Button>

            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <Truck className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium text-sm">Free Shipping</p>
                    <p className="text-xs text-muted-foreground">On orders over NPR 5,000</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium text-sm">Secure Payment</p>
                    <p className="text-xs text-muted-foreground">eSewa protected</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>

        <div className="mt-12">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="specifications">Specifications</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <p className="text-muted-foreground leading-relaxed">
                    {product.description || "No description available for this product."}
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="specifications" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <dl className="space-y-4">
                    <div className="flex justify-between py-2 border-b">
                      <dt className="font-medium">SKU</dt>
                      <dd className="text-muted-foreground">{product.id.slice(0, 8).toUpperCase()}</dd>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <dt className="font-medium">Category</dt>
                      <dd className="text-muted-foreground">{product.category?.name || "Uncategorized"}</dd>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <dt className="font-medium">Stock</dt>
                      <dd className="text-muted-foreground">{product.stock} units</dd>
                    </div>
                    {product.variants && product.variants.length > 0 && (
                      <div className="flex justify-between py-2">
                        <dt className="font-medium">Variants</dt>
                        <dd className="text-muted-foreground">{product.variants.length} options</dd>
                      </div>
                    )}
                  </dl>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="reviews" className="mt-6">
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  No reviews yet. Be the first to review this product!
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {relatedProducts && relatedProducts.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-bold mb-6">Related Products</h2>
            <ProductGrid products={relatedProducts} />
          </section>
        )}
      </div>
    </Layout>
  );
}
