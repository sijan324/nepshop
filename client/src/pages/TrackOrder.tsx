import { useState } from "react";
import { useLocation, useSearch } from "wouter";
import { Search, Package, Truck, CheckCircle, Clock, XCircle, AlertCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Layout } from "@/components/layout/Layout";
import { formatPrice, formatDateTime, getOrderStatusColor, cn } from "@/lib/utils";
import type { OrderWithItems } from "@/lib/types";
import { apiRequest } from "@/lib/queryClient";

const statusTimeline = [
  { status: "PENDING", label: "Order Placed", description: "Your order has been received", icon: Clock },
  { status: "PAID", label: "Payment Confirmed", description: "Payment has been verified", icon: AlertCircle },
  { status: "PROCESSING", label: "Processing", description: "Your order is being prepared", icon: Package },
  { status: "SHIPPED", label: "Shipped", description: "Your order is on its way", icon: Truck },
  { status: "DELIVERED", label: "Delivered", description: "Your order has been delivered", icon: CheckCircle },
];

export default function TrackOrder() {
  const searchString = useSearch();
  const [, setLocation] = useLocation();
  const params = new URLSearchParams(searchString);
  const initialOrderNumber = params.get("order") || "";
  
  const [orderNumber, setOrderNumber] = useState(initialOrderNumber);
  const [order, setOrder] = useState<OrderWithItems | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim()) return;

    setIsLoading(true);
    setError("");
    setOrder(null);

    try {
      const response = await apiRequest("GET", `/api/orders/track?orderNumber=${encodeURIComponent(orderNumber)}`);
      const data = await response.json();
      setOrder(data);
      setLocation(`/track-order?order=${encodeURIComponent(orderNumber)}`, { replace: true });
    } catch (err: any) {
      if (err.message?.includes("404")) {
        setError("Order not found. Please check the order number and try again.");
      } else {
        setError("Failed to fetch order details. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const currentStatusIndex = order ? statusTimeline.findIndex(s => s.status === order.status) : -1;
  const isCancelled = order?.status === "CANCELLED";

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Track Your Order</h1>
            <p className="text-muted-foreground">Enter your order number to see the status</p>
          </div>

          <Card className="mb-8">
            <CardContent className="pt-6">
              <form onSubmit={handleSearch} className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Enter order number (e.g., ORD-ABC123)"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    className="pl-10"
                    data-testid="input-order-number"
                  />
                </div>
                <Button type="submit" disabled={isLoading} data-testid="button-track">
                  {isLoading ? "Searching..." : "Track"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {error && (
            <Card className="mb-8 border-destructive">
              <CardContent className="py-6 text-center">
                <XCircle className="h-12 w-12 mx-auto text-destructive mb-3" />
                <p className="text-destructive font-medium">{error}</p>
              </CardContent>
            </Card>
          )}

          {order && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Order #{order.orderNumber}</CardTitle>
                    <Badge className={getOrderStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Order Date</p>
                      <p className="font-medium">{formatDateTime(order.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total Amount</p>
                      <p className="font-medium">{formatPrice(parseFloat(order.total))}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {!isCancelled ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Order Timeline</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="relative">
                      {statusTimeline.map((step, index) => {
                        const isCompleted = index <= currentStatusIndex;
                        const isCurrent = index === currentStatusIndex;
                        return (
                          <div key={step.status} className="flex gap-4 pb-8 last:pb-0">
                            <div className="flex flex-col items-center">
                              <div
                                className={cn(
                                  "w-10 h-10 rounded-full flex items-center justify-center border-2 z-10",
                                  isCompleted
                                    ? "bg-primary border-primary text-primary-foreground"
                                    : "border-muted-foreground/30 text-muted-foreground bg-background"
                                )}
                              >
                                <step.icon className="h-5 w-5" />
                              </div>
                              {index < statusTimeline.length - 1 && (
                                <div
                                  className={cn(
                                    "w-0.5 flex-1 mt-2",
                                    index < currentStatusIndex ? "bg-primary" : "bg-muted"
                                  )}
                                />
                              )}
                            </div>
                            <div className="flex-1 pb-2">
                              <p
                                className={cn(
                                  "font-medium",
                                  isCurrent ? "text-primary" : isCompleted ? "text-foreground" : "text-muted-foreground"
                                )}
                              >
                                {step.label}
                              </p>
                              <p className="text-sm text-muted-foreground">{step.description}</p>
                              {isCurrent && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  {formatDateTime(order.updatedAt)}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-destructive">
                  <CardContent className="py-8 text-center">
                    <XCircle className="h-12 w-12 mx-auto text-destructive mb-3" />
                    <h3 className="font-semibold text-lg mb-1">Order Cancelled</h3>
                    <p className="text-muted-foreground">This order has been cancelled.</p>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Items in Order</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {order.items?.map((item) => (
                      <div key={item.id} className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-md bg-muted overflow-hidden flex-shrink-0">
                          {item.product?.images?.[0] ? (
                            <img
                              src={item.product.images[0]}
                              alt={item.productName}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center">
                              <Package className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{item.productName}</p>
                          <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-medium text-sm">{formatPrice(parseFloat(item.total))}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {!order && !error && !isLoading && (
            <div className="text-center py-12">
              <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg mb-2">Track Your Shipment</h3>
              <p className="text-muted-foreground mb-6">
                Enter your order number above to see real-time tracking information.
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
