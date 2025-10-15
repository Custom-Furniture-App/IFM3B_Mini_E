import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "../components/ui/Card";
import { Loader2 } from "lucide-react";

// --- Recharts Imports (already provided) ---
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";


import { fetchUsers } from "../api/reactquery/usersApi";
import type { Component, Order, User } from "../model";
import { fetchComponents } from "../api/reactquery/componentsApi";
import { fetchAllOrders } from "../api/reactquery/ordersApi";



// --- Constants ---
const LOW_STOCK_THRESHOLD = 10;
const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#A28CF7",
  "#848484",
];

// ----------------------------------------------------------------------
// Analytics Component
// ----------------------------------------------------------------------

const Analytics: React.FC = () => {
  // --- Data Fetching with React Query ---
  const { data: users, isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });

  const { data: orders, isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ["orders"],
    queryFn: fetchAllOrders,
  });

  const { data: components, isLoading: componentsLoading } = useQuery<
    Component[]
  >({
   queryKey: ["components"],
     queryFn: fetchComponents,

  });

  const isLoading = usersLoading || ordersLoading || componentsLoading;
  if (isLoading) {
    return (
      <div className="text-center p-8 flex justify-center items-center gap-2">
        <Loader2 size={24} className="animate-spin text-blue-600" />
        <p className="text-lg font-semibold text-gray-600">
          Loading Analytics Data...
        </p>
      </div>
    );
  }

  // Handle case where data might not be available after loading
  if (!users || !orders || !components) {
    return (
      <div className="p-6 text-red-500">
        Error: Could not load all analytics data.
      </div>
    );
  }

  // ----------------------------------------------------------------------
  // Data Processing
  // ----------------------------------------------------------------------

  // 1. Order Status Metrics (for Pie Chart)
  const ordersByStatusMap = orders.reduce((acc, order) => {
    const status = order.Status.toLowerCase();
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const ordersByStatus = Object.keys(ordersByStatusMap).map((status) => ({
    status: formatStatusDisplay(status),
    value: ordersByStatusMap[status],
  }));
  const totalOrders = orders.length;

  // 2. Component Stock & Popularity
  const lowStockComponents = components.filter(
    (c) => c.Stock < LOW_STOCK_THRESHOLD
  );
  const lowStockCount = lowStockComponents.length;

  // To simulate popular components, we'll sort by SaleCount (assumed)
  // const popularComponents = components
  //   .sort((a, b) => (b.SalesCount || 0) - (a.SalesCount || 0))
  //   .slice(0, 5)
  //   .map((c) => ({ name: c.ComponentName, count: c.SalesCount || 0 }));

  // 3. Revenue Trend (Simple monthly grouping for demonstration)
  const revenueTrendMap = orders.reduce((acc, order) => {
    const month = new Date(order.CreatedAt).toLocaleString("default", {
      month: "short",
      year: "numeric",
    });
    acc[month] = (acc[month] || 0) + order.TotalAmount;
    return acc;
  }, {} as Record<string, number>);

  const revenueData = Object.keys(revenueTrendMap).map((month) => ({
    month: month.substring(0, 3), // e.g., 'Oct'
    revenue: Math.round(revenueTrendMap[month]),
  }));
  const totalRevenue = orders.reduce((acc, o) => acc + o.TotalAmount, 0);

  // 4. Helper for Status Display
  function formatStatusDisplay(status: string) {
    return status
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  // ----------------------------------------------------------------------
  // Render
  // ----------------------------------------------------------------------

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900">
        Dashboard Analytics 📊
      </h2>
      <p className="text-gray-600">
        Key performance indicators and operational insights.
      </p>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-medium text-gray-500">Total Users</h3>
            <p className="text-3xl font-bold text-indigo-600">{users.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-medium text-gray-500">Total Orders</h3>
            <p className="text-3xl font-bold">{totalOrders}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-medium text-gray-500">
              Low Stock Items
            </h3>
            <p
              className={`text-3xl font-bold ${
                lowStockCount > 0 ? "text-red-500" : "text-green-500"
              }`}
            >
              {lowStockCount}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-medium text-gray-500">Total Revenue</h3>
            <p className="text-3xl font-bold text-green-700">
              R{totalRevenue.toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Over Time Chart (Main focus) */}
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-4 border-b pb-2">
              Revenue Trend
            </h3>
            <div className="w-full h-[350px]">
              <LineChart
                width={800} // Set a fixed width or use a container size hook
                height={350}
                data={revenueData}
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="month" />
                <YAxis
                  unit="R"
                  tickFormatter={(value) => `${value.toLocaleString()}`}
                />
                <Tooltip
                  formatter={(value: number) => [
                    `R${value.toFixed(2)}`,
                    "Revenue",
                  ]}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#4F46E5"
                  strokeWidth={2}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </div>
          </CardContent>
        </Card>

        {/* Orders by Status Pie Chart (Side panel) */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-4 border-b pb-2">
              Orders by Status
            </h3>
            <PieChart width={300} height={350} className="mx-auto">
              <Pie
                data={ordersByStatus}
                dataKey="value"
                nameKey="status"
                cx="50%"
                cy="45%"
                outerRadius={100}
                fill="#8884d8"
                label={({ status, value }) => `${status}: ${value}`}
              >
                {ordersByStatus.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [
                  `${value} orders`,
                  "Status Count",
                ]}
              />
              <Legend
                layout="vertical"
                verticalAlign="bottom"
                align="center"
                wrapperStyle={{ paddingTop: "10px" }}
              />
            </PieChart>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock and Popularity List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock List */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-4 text-red-600 border-b pb-2">
              🚨 Low Stock Components (Stock &lt; {LOW_STOCK_THRESHOLD})
            </h3>
            {lowStockComponents.length > 0 ? (
              <ul className="space-y-2">
                {lowStockComponents.map((c) => (
                  <li
                    key={c.Id}
                    className="flex justify-between items-center text-sm p-2 border-l-4 border-red-400 bg-red-50 rounded"
                  >
                    <span className="font-medium">{c.Name}</span>
                    <span className="font-bold text-red-600">
                      Stock: {c.Stock}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-green-500 font-medium">
                All components are currently above the low stock threshold! 👍
              </p>
            )}
          </CardContent>
        </Card>

        {/* Most Popular Components List */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-4 border-b pb-2">
              🔥 Top 5 Most Popular Components
            </h3>
            {/* <ul className="space-y-2">
              {popularComponents.map((p, index) => (
                <li
                  key={p.name}
                  className="flex justify-between items-center p-2 border-l-4 border-blue-400 bg-blue-50 rounded"
                >
                  <span className="font-medium">
                    {index + 1}. {p.name}
                  </span>
                  <span className="font-bold text-blue-600">
                    {p.count} sold
                  </span>
                </li>
              ))}
            </ul> */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
