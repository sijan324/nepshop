import { Link } from "wouter";
import { ShoppingCart, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import { formatPrice, cn } from "@/lib/utils";
import type { ProductWithCategory } from "@/lib/types";

interface ProductCardProps {
  product: ProductWithCategory;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const { addItem } = useCart();
  const hasDiscount = product.compareAtPrice && parseFloat(product.compareAtPrice) > parseFloat(product.price);
  const discountPercent = hasDiscount
    ? Math.round((1 - parseFloat(product.price) / parseFloat(product.compareAtPrice!)) * 100)
    : 0;
  const isOutOfStock = product.stock <= 0;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isOutOfStock) {
      await addItem(product.id);
    }
  };

  return (
    <Card
      className={cn(
        "group overflow-hidden transition-all duration-300 hover-elevate",
        className
      )}
      data-testid={`card-product-${product.id}`}
    >
      <Link href={`/products/${product.slug}`}>
        <div className="relative aspect-square overflow-hidden bg-muted">
          {product.images?.[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-muted-foreground">
              <ShoppingCart className="h-12 w-12" />
            </div>
          )}
          
          {hasDiscount && (
            <Badge
              variant="destructive"
              className="absolute top-2 right-2"
            >
              -{discountPercent}%
            </Badge>
          )}
          
          {isOutOfStock && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
              <Badge variant="secondary" className="text-sm">Out of Stock</Badge>
            </div>
          )}

          <div className="absolute inset-x-0 bottom-0 p-2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                className="flex-1 backdrop-blur-sm bg-background/90"
                asChild
              >
                <span>
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </span>
              </Button>
              <Button
                size="sm"
                className="flex-1"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                data-testid={`button-add-cart-${product.id}`}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>
          </div>
        </div>

        <CardContent className="p-4">
          {product.category && (
            <p className="text-xs text-muted-foreground mb-1">
              {product.category.name}
            </p>
          )}
          <h3 className="font-medium text-sm line-clamp-2 min-h-[2.5rem] group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center gap-2 mt-2">
            <span className="font-bold text-lg">
              {formatPrice(parseFloat(product.price))}
            </span>
            {hasDiscount && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(parseFloat(product.compareAtPrice!))}
              </span>
            )}
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
