// Dashboard.tsx
import React from "react";
import { Card, CardContent } from "../components/ui/Card";
import {
  ShoppingCart,
  AlertTriangle,
  Package,
  TrendingUp,
  Users,
  Loader2,
} from "lucide-react";
import {
  useAnalyticsData,
  formatStatusDisplay,
} from "../hooks/useAnalyticsData";
import { useNavigate } from "react-router-dom"; // Import useNavigate

const Dashboard: React.FC = () => {
  const { data, isLoading, isError } = useAnalyticsData();
  const navigate = useNavigate(); // Initialize useNavigate

  console.log("Dashboard loaded");

  if (isLoading) {
    return (
      <div className="text-center p-8 flex justify-center items-center gap-2">
        <Loader2 size={24} className="animate-spin text-blue-600" />
        <p className="text-lg font-semibold text-gray-600">
          Loading Dashboard Data...
        </p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-6 text-red-500">
        Error: Could not load dashboard data. Please check the network
        connection.
      </div>
    );
  }

  // Destructure the necessary data, including 'users'
  const {
    totalOrders,
    lowStockCount,
    components,
    totalRevenue,
    recentOrders,
    users,
    products,
  } = data;

  const handleManageOrder = (orderId: number) => {
    navigate(`/orders/${orderId}`);
  };

  // Real KPI data
  const kpis = [
    {
      title: "Total Orders",
      value: totalOrders,
      icon: <ShoppingCart className="h-6 w-6 text-blue-500" />,
    },
    {
      title: "Total Users",
      value: users.length,
      icon: <Users className="h-6 w-6 text-indigo-500" />,
    },
    {
      title: "Low Stock Items",
      value: lowStockCount,
      icon: <AlertTriangle className="h-6 w-6 text-yellow-500" />,
    },
    {
      title: "Components in Inventory",
      value: components.length,
      icon: <Package className="h-6 w-6 text-green-500" />,
    },
    {
      title: "Total Products",
      value: products.length,
      icon: <Package className="h-6 w-6 text-green-500" />,
    },
    {
      title: "Total Revenue",
      value: `R${totalRevenue.toFixed(2).toLocaleString()}`,
      icon: <TrendingUp className="h-6 w-6 text-purple-500" />,
    },
  ];

  // Map order status to Tailwind classes
  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "assembling":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">
        Dashboard Overview 👋
      </h1>
      <p className="text-gray-600">Quick insights into key operations.</p>

      {/* 1. KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {kpis.map((kpi, index) => (
          <Card key={index} className="shadow-md">
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm text-gray-500">{kpi.title}</p>
                <h3 className="text-2xl font-semibold">{kpi.value}</h3>
              </div>
              {kpi.icon}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 2. Recent Orders (3 latest orders) - UPDATED TABLE */}
      <Card className="shadow-md">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold mb-4">
            Recent Orders (Latest 3)
          </h2>
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="text-left border-b bg-gray-50">
                <th className="py-2 px-3 text-left">Order #</th>
                <th className="py-2 px-3 text-left">Customer</th>
                <th className="py-2 px-3 text-left">Date</th>
                <th className="py-2 px-3 text-right">Total</th>
                <th className="py-2 px-3 text-left">Status</th>
                <th className="py-2 px-3 text-left">Action</th>{" "}
                {/* Added Action column */}
              </tr>
            </thead>
            <tbody>
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <tr
                    key={order.Id}
                    className="border-b last:border-none hover:bg-gray-50"
                  >
                    <td className="py-2 px-3 font-medium">
                      {order.OrderNumber}
                    </td>
                    <td className="py-2 px-3">{order.CustomerName}</td>
                    <td className="py-2 px-3">
                      {new Date(order.CreatedAt).toLocaleDateString()}
                    </td>
                    <td className="py-2 px-3 text-right font-semibold">
                      R{order.TotalAmount.toFixed(2)}
                    </td>
                    <td className="py-2 px-3">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(
                          order.Status
                        )}`}
                      >
                        {formatStatusDisplay(order.Status)}
                      </span>
                    </td>
                    <td className="py-2 px-3">
                      <button
                        onClick={() => handleManageOrder(order.Id)}
                        className="px-3 py-1 text-xs font-medium rounded bg-blue-500 text-white hover:bg-blue-600 transition"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-4 text-center text-gray-500">
                    {" "}
                    {/* Updated colspan */}
                    No recent orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
