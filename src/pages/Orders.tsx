import React from "react";
import { Card, CardContent } from "../components/ui/Card";
import { useNavigate } from "react-router-dom";
// Removed Eye and Trash2 icons
import type { Order } from "../model";
import { useQuery } from "@tanstack/react-query";
import { fetchAllOrders } from "../api/reactquery/ordersApi";

const Orders: React.FC = () => {
  const navigate = useNavigate();

  const {
    data: ordersData,
    isLoading,
    isError,
    error,
  } = useQuery<Order[], Error>({
    queryKey: ["orders"],
    queryFn: fetchAllOrders,
    staleTime: 5 * 60 * 1000,
  });

  // Function to format status text nicely (Kept for consistency)
  const formatStatus = (status: string) => {
    return status
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  /**
   * Navigate to the single order view using a generic "Manage" action.
   */
  const handleManage = (orderId: number) => {
    // Navigate using the Order ID to the detail page
    navigate(`/orders/${orderId}`);
  };

  // Removed handleDelete function

  if (isLoading) {
    return (
      <div className="text-center py-10">
        <p className="text-xl font-semibold">Loading orders...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-10 text-red-600">
        <h2 className="text-2xl font-bold mb-2">Error Loading Data</h2>
        <p>An error occurred: {error?.message || "Unknown error"}</p>
      </div>
    );
  }

  const orders = ordersData || [];

  return (
    <div className="space-y-6 p-6">
      <h2 className="text-3xl font-bold">📦 Orders Management</h2>

      <Card>
        <CardContent className="p-0">
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="border-b bg-gray-100">
                <th className="py-3 px-3 text-left">Order #</th>
                <th className="py-3 px-3 text-left">Customer</th>
                <th className="py-3 px-3 text-left">Date</th>
                <th className="py-3 px-3 text-left">Status</th>
                <th className="py-3 px-3 text-right">Total</th>
                <th className="py-3 px-3 text-left">Action</th>{" "}
                {/* Single Action column */}
              </tr>
            </thead>
            <tbody>
              {orders.length > 0 ? (
                orders.map((order) => (
                  <tr
                    key={order.Id}
                    className="border-b last:border-none hover:bg-gray-50"
                  >
                    <td className="py-3 px-3 font-medium">
                      {order.OrderNumber}
                    </td>{" "}
                    <td className="py-3 px-3">{order.CustomerName}</td>{" "}
                    <td className="py-3 px-3">
                      {new Date(order.CreatedAt).toLocaleDateString()}{" "}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          order.Status === "completed"
                            ? "bg-green-100 text-green-800"
                            : order.Status === "assembling"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {formatStatus(order.Status)}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-semibold">
                      R{order.TotalAmount.toFixed(2)}
                    </td>
                    <td className="py-3 px-3">
                      <button
                        onClick={() => handleManage(order.Id)}
                        className="px-3 py-1 text-xs font-medium rounded bg-blue-600 text-white hover:bg-blue-700 transition"
                        title="Manage Order"
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
                    No orders found.
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

export default Orders;
