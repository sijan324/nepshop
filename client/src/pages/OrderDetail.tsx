import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Package, Truck, CheckCircle, Clock, XCircle, AlertCircle, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Layout } from "@/components/layout/Layout";
import { formatPrice, formatDate, formatDateTime, getOrderStatusColor, cn } from "@/lib/utils";
import type { OrderWithItems } from "@/lib/types";

const statusSteps = [
  { status: "PENDING", label: "Order Placed", icon: Clock },
  { status: "PAID", label: "Payment Confirmed", icon: AlertCircle },
  { status: "PROCESSING", label: "Processing", icon: Package },
  { status: "SHIPPED", label: "Shipped", icon: Truck },
  { status: "DELIVERED", label: "Delivered", icon: CheckCircle },
];

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();

  const { data: order, isLoading } = useQuery<OrderWithItems>({
    queryKey: ["/api/orders", id],
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-6">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!order) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
          <p className="text-muted-foreground mb-8">The order you're looking for doesn't exist.</p>
          <Button asChild>
            <Link href="/orders">View All Orders</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const currentStatusIndex = statusSteps.findIndex(s => s.status === order.status);
  const isCancelled = order.status === "CANCELLED";

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" size="sm" className="mb-6" asChild>
            <Link href="/orders">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Orders
            </Link>
          </Button>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Order #{order.orderNumber}</h1>
              <p className="text-muted-foreground mt-1">
                Placed on {formatDate(order.createdAt)}
              </p>
            </div>
            <Badge className={cn("text-sm", getOrderStatusColor(order.status))}>
              {order.status}
            </Badge>
          </div>

          {!isCancelled && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Order Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <div className="flex justify-between">
                    {statusSteps.map((step, index) => {
                      const isCompleted = index <= currentStatusIndex;
                      const isCurrent = index === currentStatusIndex;
                      return (
                        <div key={step.status} className="flex flex-col items-center flex-1">
                          <div
                            className={cn(
                              "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors z-10 bg-background",
                              isCompleted
                                ? "bg-primary border-primary text-primary-foreground"
                                : "border-muted-foreground/30 text-muted-foreground"
                            )}
                          >
                            <step.icon className="h-5 w-5" />
                          </div>
                          <p
                            className={cn(
                              "text-xs mt-2 text-center",
                              isCurrent ? "font-medium text-foreground" : "text-muted-foreground"
                            )}
                          >
                            {step.label}
                          </p>
                          {isCurrent && order.updatedAt && (
                            <p className="text-xs text-muted-foreground">
                              {formatDateTime(order.updatedAt)}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div className="absolute top-5 left-0 right-0 h-0.5 bg-muted -z-0">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${(currentStatusIndex / (statusSteps.length - 1)) * 100}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {isCancelled && (
            <Card className="mb-6 border-destructive">
              <CardContent className="py-6 flex items-center gap-4">
                <XCircle className="h-10 w-10 text-destructive" />
                <div>
                  <h3 className="font-semibold text-lg">Order Cancelled</h3>
                  <p className="text-muted-foreground">This order has been cancelled.</p>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                {order.shippingAddress ? (
                  <div className="text-sm space-y-1">
                    <p className="font-medium">{order.shippingAddress.fullName}</p>
                    <p className="text-muted-foreground">{order.shippingAddress.addressLine1}</p>
                    {order.shippingAddress.addressLine2 && (
                      <p className="text-muted-foreground">{order.shippingAddress.addressLine2}</p>
                    )}
                    <p className="text-muted-foreground">
                      {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                    </p>
                    <p className="text-muted-foreground">{order.shippingAddress.country}</p>
                    <p className="text-muted-foreground mt-2">Phone: {order.shippingAddress.phone}</p>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No shipping address available</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(parseFloat(order.subtotal))}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{parseFloat(order.shippingCost || "0") === 0 ? "Free" : formatPrice(parseFloat(order.shippingCost || "0"))}</span>
                </div>
                {parseFloat(order.tax || "0") > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span>{formatPrice(parseFloat(order.tax || "0"))}</span>
                  </div>
                )}
                {parseFloat(order.discount || "0") > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span>-{formatPrice(parseFloat(order.discount || "0"))}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span className="text-lg">{formatPrice(parseFloat(order.total))}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items?.map((item) => (
                  <div key={item.id} className="flex gap-4 py-4 border-b last:border-0">
                    <div className="h-20 w-20 rounded-md bg-muted overflow-hidden flex-shrink-0">
                      {item.product?.images?.[0] ? (
                        <img
                          src={item.product.images[0]}
                          alt={item.productName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <Package className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium">{item.productName}</h4>
                      {item.variantName && (
                        <p className="text-sm text-muted-foreground">{item.variantName}</p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        {formatPrice(parseFloat(item.price))} x {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatPrice(parseFloat(item.total))}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
