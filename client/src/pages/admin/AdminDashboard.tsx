import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/lib/utils";
import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  TrendingDown,
  ArrowRight,
} from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import AdminLayout from "./AdminLayout";

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  revenueChange: number;
  ordersChange: number;
}

interface RecentOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  total: number;
  status: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/admin/stats"],
  });

  const { data: recentOrders, isLoading: ordersLoading } = useQuery<RecentOrder[]>({
    queryKey: ["/api/admin/orders/recent"],
  });

  const statCards = [
    {
      title: "Total Revenue",
      value: stats ? formatPrice(stats.totalRevenue) : "Rs. 0",
      icon: DollarSign,
      change: stats?.revenueChange || 0,
      changeLabel: "vs last month",
    },
    {
      title: "Total Orders",
      value: stats?.totalOrders?.toString() || "0",
      icon: ShoppingCart,
      change: stats?.ordersChange || 0,
      changeLabel: "vs last month",
    },
    {
      title: "Products",
      value: stats?.totalProducts?.toString() || "0",
      icon: Package,
      link: "/admin/products",
    },
    {
      title: "Customers",
      value: stats?.totalCustomers?.toString() || "0",
      icon: Users,
      link: "/admin/customers",
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-dashboard-title">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's an overview of your store.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, index) => (
            <Card key={index} data-testid={`card-stat-${stat.title.toLowerCase().replace(/\s/g, "-")}`}>
              <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className="w-5 h-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    {stat.change !== undefined && (
                      <div className="flex items-center gap-1 text-sm mt-1">
                        {stat.change >= 0 ? (
                          <>
                            <TrendingUp className="w-4 h-4 text-green-500" />
                            <span className="text-green-500">+{stat.change}%</span>
                          </>
                        ) : (
                          <>
                            <TrendingDown className="w-4 h-4 text-red-500" />
                            <span className="text-red-500">{stat.change}%</span>
                          </>
                        )}
                        <span className="text-muted-foreground">{stat.changeLabel}</span>
                      </div>
                    )}
                    {stat.link && (
                      <Link href={stat.link}>
                        <Button variant="link" className="p-0 h-auto text-sm mt-1">
                          View all <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                      </Link>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <CardTitle>Recent Orders</CardTitle>
            <Link href="/admin/orders">
              <Button variant="outline" size="sm" data-testid="link-view-all-orders">
                View All
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {ordersLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : recentOrders && recentOrders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Order</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Customer</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Status</th>
                      <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="border-b last:border-0" data-testid={`row-order-${order.id}`}>
                        <td className="py-3 px-2">
                          <Link href={`/admin/orders/${order.id}`}>
                            <span className="font-medium hover:underline">#{order.orderNumber}</span>
                          </Link>
                        </td>
                        <td className="py-3 px-2 text-muted-foreground">{order.customerName}</td>
                        <td className="py-3 px-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            order.status === "DELIVERED" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" :
                            order.status === "SHIPPED" ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" :
                            order.status === "PROCESSING" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" :
                            order.status === "CANCELLED" ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" :
                            "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-right font-medium">{formatPrice(order.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No orders yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
