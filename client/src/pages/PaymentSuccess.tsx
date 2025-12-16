import { useEffect } from "react";
import { useLocation, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Package, ArrowRight, Truck } from "lucide-react";
import { Layout } from "@/components/layout/Layout";

export default function PaymentSuccess() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const orderNumber = params.get("orderNumber");
    
    if (!orderNumber) {
      // Optional: redirect if no order number, or just show generic success
      // setLocation("/");
    }
  }, [setLocation]);

  const params = new URLSearchParams(window.location.search);
  const orderNumber = params.get("orderNumber");
  const orderId = params.get("orderId");

  return (
    <Layout>
    <div className="container max-w-lg mx-auto px-4 py-12">
      <Card className="text-center">
        <CardHeader className="pb-2">
          <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-2xl" data-testid="text-payment-success">
            Payment Successful!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            Thank you for your purchase. Your order has been confirmed and will be processed shortly.
          </p>

          {orderNumber && (
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Order Number</p>
              <p className="font-mono font-medium text-lg" data-testid="text-order-id">{orderNumber}</p>
            </div>
          )}

          <div className="flex flex-col gap-3">
            {orderId && (
              <Link href={`/orders/${orderId}`}>
                <Button className="w-full" data-testid="button-view-order">
                  <Package className="w-4 h-4 mr-2" />
                  View Order Details
                </Button>
              </Link>
            )}
            
            {orderNumber && (
              <Link href={`/track-order?order=${orderNumber}`}>
                <Button variant="outline" className="w-full">
                  Track Order <Truck className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            )}

            <Link href="/products">
              <Button variant="ghost" className="w-full" data-testid="button-continue-shopping">
                Continue Shopping
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          <p className="text-sm text-muted-foreground">
            A confirmation email has been sent to your registered email address.
          </p>
        </CardContent>
      </Card>
    </div>
    </Layout>
  );
}
