// hooks/useAnalyticsData.ts
import { useQuery } from "@tanstack/react-query";
import { fetchUsers } from "../api/reactquery/usersApi";
import { fetchComponents } from "../api/reactquery/componentsApi";
import { fetchAllOrders } from "../api/reactquery/ordersApi";
import type { Component, Order, Product, User } from "../model";
import { fetchProducts } from "../api/reactquery/productsApi";

const LOW_STOCK_THRESHOLD = 10;

// Define the shape of the data the hook will return
export interface AnalyticsData {
  users: User[];
  orders: Order[];
  components: Component[];
    products: Product[];
  totalOrders: number;
  totalRevenue: number;
  lowStockCount: number;
  recentOrders: Order[];
  revenueData: { month: string; revenue: number }[];
  ordersByStatus: { status: string; value: number }[];
}

interface AnalyticsResult {
  data: AnalyticsData | undefined;
  isLoading: boolean;
  isError: boolean;
}

/**
 * Helper for Status Display (Exported for use in Dashboard/Orders components)
 * Converts status like "in-progress" to "In Progress".
 */
export function formatStatusDisplay(status: string) {
  return status
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export const useAnalyticsData = (): AnalyticsResult => {
  // --- Data Fetching with React Query ---
  const {
    data: users,
    isLoading: usersLoading,
    isError: usersError,
  } = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });

    const {
      data: products,
      isLoading: productsLoading,
      isError: productsError,
    } = useQuery<Product[], Error>({
      queryKey: ["products"],
      queryFn: fetchProducts,
      staleTime: 5 * 60 * 1000,
    });

  const {
    data: orders,
    isLoading: ordersLoading,
    isError: ordersError,
  } = useQuery<Order[]>({
    queryKey: ["orders"],
    queryFn: fetchAllOrders,
  });

  const {
    data: components,
    isLoading: componentsLoading,
    isError: componentsError,
  } = useQuery<Component[]>({
    queryKey: ["components"],
    queryFn: fetchComponents,
  });

  const isLoading = usersLoading || ordersLoading || componentsLoading || productsLoading;
  const isError = usersError || ordersError || componentsError || productsError;

  if (isLoading || isError || !users || !orders || !components || !products) {
    return { data: undefined, isLoading, isError: !!isError };
  }

  // ----------------------------------------------------------------------
  // Data Processing
  // ----------------------------------------------------------------------

  // 1. Core KPIs
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((acc, o) => acc + o.TotalAmount, 0);
  const lowStockCount = components.filter(
    (c) => c.Stock < LOW_STOCK_THRESHOLD
  ).length;

  // 2. Recent Orders (3 latest orders)
  const sortedOrders = [...orders].sort(
    // Sort descending by CreatedAt timestamp
    (a, b) => new Date(b.CreatedAt).getTime() - new Date(a.CreatedAt).getTime()
  );
  const recentOrders = sortedOrders.slice(0, 3);

  // 3. Revenue Trend (for Analytics)
  const revenueTrendMap = orders.reduce((acc, order) => {
    const month = new Date(order.CreatedAt).toLocaleString("default", {
      month: "short",
      year: "numeric",
    });
    acc[month] = (acc[month] || 0) + order.TotalAmount;
    return acc;
  }, {} as Record<string, number>);

  const revenueData = Object.keys(revenueTrendMap).map((month) => ({
    month: month.substring(0, 3),
    revenue: Math.round(revenueTrendMap[month]),
  }));

  // 4. Order Status Metrics (for Analytics)
  const ordersByStatusMap = orders.reduce((acc, order) => {
    const status = order.Status.toLowerCase();
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const ordersByStatus = Object.keys(ordersByStatusMap).map((status) => ({
    status: formatStatusDisplay(status),
    value: ordersByStatusMap[status],
  }));

  const analyticsData: AnalyticsData = {
    users, // Included for the Dashboard User Count KPI
    orders,
    components,
    products,
    totalOrders,
    totalRevenue,
    lowStockCount,
    recentOrders,
    revenueData,
    ordersByStatus,
  };

  return { data: analyticsData, isLoading: false, isError: false };
};
