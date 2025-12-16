import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle, RefreshCw, HelpCircle, ArrowLeft } from "lucide-react";
import { Layout } from "@/components/layout/Layout";

export default function PaymentFailed() {
  const params = new URLSearchParams(window.location.search);
  const orderId = params.get("oid");
  const errorMessage = params.get("message") || "Your payment could not be processed.";

  return (
    <Layout>
    <div className="container max-w-lg mx-auto px-4 py-12">
      <Card className="text-center">
        <CardHeader className="pb-2">
          <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
            <XCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-2xl" data-testid="text-payment-failed">
            Payment Failed
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground" data-testid="text-error-message">
            {errorMessage}
          </p>

          <div className="bg-muted/50 rounded-lg p-4 text-left space-y-2">
            <p className="font-medium text-sm">This could happen due to:</p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Insufficient balance in your eSewa wallet</li>
              <li>Transaction timeout or cancellation</li>
              <li>Network connectivity issues</li>
              <li>Payment gateway temporarily unavailable</li>
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            {orderId ? (
              <Link href={`/checkout?retry=${orderId}`}>
                <Button className="w-full" data-testid="button-retry-payment">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              </Link>
            ) : (
              <Link href="/checkout">
                <Button className="w-full" data-testid="button-retry-checkout">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Return to Checkout
                </Button>
              </Link>
            )}
            <Link href="/products">
              <Button variant="outline" className="w-full" data-testid="button-continue-shopping">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Continue Shopping
              </Button>
            </Link>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-2">Need help?</p>
            <Button variant="ghost" size="sm" data-testid="button-contact-support">
              <HelpCircle className="w-4 h-4 mr-2" />
              Contact Support
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
    </Layout>
  );
}
