import React, { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "../components/ui/Card";
import { Loader2, Zap, X, CheckCircle, Clock } from "lucide-react";

// --- API Imports ---
// Assuming these are the correct paths to your Order model and API service
import type { Order, OrderItem } from "../model";
import { fetchOrderById } from "../api/reactquery/ordersApi";
import { apiService } from "../api/apiService";

// --- Order Status Structures ---
// Define the official flow statuses (excluding the assumed starting status 'placed')
const FLOW_STEPS: { [key: string]: string[] } = {
  // Collection Flow: Excludes delivery steps
  collection: [
    "assembling",
    "done-assembling",
    "ready-for-collection",
    "completed",
  ],
  // Delivery Flow: Excludes collection steps
  delivery: [
    "assembling",
    "done-assembling",
    "ready-for-delivery",
    "courier-on-the-way",
    "completed",
  ],
};

// Define a common initial status that exists before the flow begins
const INITIAL_STATUS = "placed";

// ----------------------------------------------------------------------
// StatusUpdateModal Component (Fixed to allow jumping forward) - No Change
// ----------------------------------------------------------------------

interface StatusUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: number;
  currentStatus: Order["Status"];
  onStatusUpdated: () => void;
  fulfillmentType: Order["FulfillmentType"];
}

const formatStatusDisplay = (status: string) => {
  return status
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const StatusUpdateModal: React.FC<StatusUpdateModalProps> = ({
  isOpen,
  onClose,
  orderId,
  currentStatus,
  onStatusUpdated,
  fulfillmentType,
}) => {
  const [newStatus, setNewStatus] = useState<string>(currentStatus);
  const [error, setError] = useState<string | null>(null);

  const flowStepsForType = FLOW_STEPS[fulfillmentType] || [];

  // Combine initial status with the steps for the full available list in the UI
  const fullStatusFlow = useMemo(() => {
    // Only prepend the initial status if the current status hasn't moved past it.
    if (!flowStepsForType.includes(currentStatus)) {
      return [INITIAL_STATUS, ...flowStepsForType];
    }
    return flowStepsForType;
  }, [fulfillmentType, currentStatus, flowStepsForType]);

  // Find the index of the current status in the new combined flow array
  const currentStatusIndex = fullStatusFlow.indexOf(currentStatus);

  const { mutate, isPending } = useMutation({
    mutationFn: (status: string) => {
      // 🚀 CONSOLE LOG TO CONFIRM FINAL PAYLOAD 🚀
      console.log(
        "🚀 Submitting new status to backend:",
        status,
        "| Order ID:",
        orderId
      );
      if (status === currentStatus) {
        // Throwing an error here prevents the API call if the status hasn't changed.
        throw new Error("Status is already set to this value.");
      }
      // Assuming apiService is configured to send the raw string body correctly
      return apiService.put(`/Orders/change-status/${orderId}`, status);
    },
    onSuccess: () => {
      onStatusUpdated();
      onClose();
    },
    onError: (err) => {
      // Improved error handling
      const errorMessage =
        (err as any).response?.data?.message ||
        (err as Error).message ||
        "Failed to update status.";
      setError(`Error: ${errorMessage}`);
      console.error("Status Update Error:", err);
    },
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Only submit if the status has actually changed
    if (newStatus !== currentStatus) {
      mutate(newStatus);
    } else {
      setError("Please select a different status to update.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h3 className="text-xl font-bold text-gray-800">
            Manage Order Status
          </h3>
          <button onClick={onClose} disabled={isPending}>
            <X size={20} className="text-gray-500 hover:text-gray-800" />
          </button>
        </div>

        <p className="mb-4 text-sm text-gray-600 border-b pb-4">
          Fulfillment:{" "}
          <span className="font-semibold text-gray-800">
            {fulfillmentType.toUpperCase()}
          </span>
          <br />
          Current Status:{" "}
          <span className="font-semibold text-blue-600">
            {currentStatus.toUpperCase()}
          </span>
        </p>

        {/* Status Flow Visualization */}
        <div className="mb-6 space-y-2">
          <h4 className="text-lg font-semibold text-gray-700">
            Order Progress
          </h4>
          <div className="space-y-2 pl-4 border-l-2 border-gray-200">
            {fullStatusFlow.map((status, index) => {
              const isCompleted = index < currentStatusIndex;
              const isCurrent = status === currentStatus;

              return (
                <div
                  key={status}
                  className={`flex items-center gap-3 py-1 ${
                    isCurrent
                      ? "font-bold text-indigo-700"
                      : isCompleted
                      ? "text-green-600"
                      : "text-gray-500"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle
                      size={20}
                      className="text-green-500 flex-shrink-0"
                    />
                  ) : isCurrent ? (
                    <Zap
                      size={20}
                      className="text-indigo-600 flex-shrink-0 animate-pulse"
                    />
                  ) : (
                    <Clock size={20} className="text-gray-400 flex-shrink-0" />
                  )}
                  <span className={isCompleted ? "" : "font-normal"}>
                    {formatStatusDisplay(status)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label
            htmlFor="status-select"
            className="block text-sm font-medium text-gray-700"
          >
            Select Next Status
          </label>
          <select
            id="status-select"
            value={newStatus}
            onChange={(e) => {
              const selectedValue = e.target.value;
              setNewStatus(selectedValue);
              // 🚨 UI DEBUG CONSOLE LOG 🚨
              console.log("👉 UI Selection:", selectedValue);
            }}
            className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isPending}
          >
            {fullStatusFlow.map((status, index) => {
              const isCompletedStep = index < currentStatusIndex;

              // FIX: Only disable if the step is already completed.
              // This allows selection of the current status and ANY subsequent status.
              const isDisabled = isCompletedStep;

              return (
                <option
                  key={status}
                  value={status}
                  disabled={isDisabled}
                  className={isDisabled ? "text-gray-400 italic" : ""}
                >
                  {formatStatusDisplay(status)}
                  {isCompletedStep ? " (Completed)" : ""}
                </option>
              );
            })}
          </select>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              // Disable if pending, if no status change was made, or if there's an error.
              disabled={isPending || newStatus === currentStatus || !!error}
              className={`flex items-center gap-2 px-4 py-2 rounded font-semibold text-white transition 
              ${
                isPending || newStatus === currentStatus || !!error
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isPending ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Updating...
                </>
              ) : (
                "Update Status"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------
// SingleOrder Component (UPDATED FOR ITEM CATEGORIZATION)
// ----------------------------------------------------------------------

const SingleOrder: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    data: order,
    isLoading,
    isError,
    error,
  } = useQuery<Order, Error>({
    queryKey: ["order", orderId],
    queryFn: () => fetchOrderById(Number(orderId!)),
    enabled: !!orderId,
    staleTime: 5 * 60 * 1000,
  });

  const handleStatusUpdated = () => {
    queryClient.invalidateQueries({ queryKey: ["order", orderId] });
  };

  // 🚀 NEW: Memoized item categorization 🚀
  const categorizedItems = useMemo(() => {
    if (!order) return {};
    // ASSUMPTION: OrderItem now has a 'Category' property.
    return order.Items.reduce((acc, item) => {
      // Fallback for items that may not have a category (e.g., service fees, simple products)
      const category =
        (item as OrderItem & { Category?: string }).ItemCategory ||
        "Other Products";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    }, {} as Record<string, OrderItem[]>);
  }, [order]);
  // ------------------------------------

  if (!orderId) {
    return (
      <div className="text-center p-8 text-lg text-red-600">
        Error: Order ID is missing from the URL.
      </div>
    );
  }
  if (isLoading) {
    return (
      <div className="text-center p-8 flex justify-center items-center gap-2">
        <Loader2 size={24} className="animate-spin text-blue-600" />
        <p className="text-lg font-semibold text-gray-600">
          Loading Order {orderId}...
        </p>
      </div>
    );
  }
  if (isError || !order) {
    return (
      <div className="text-center p-8 text-lg text-red-600">
        <h2 className="text-2xl font-bold mb-2">Error Loading Order</h2>
        <p>
          Could not fetch order data for ID {orderId}. {error?.message}
        </p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
        >
          Go Back
        </button>
      </div>
    );
  }

  const formatStatus = (status: string) => {
    return status
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // 🚀 NEW: Item rendering function 🚀
  const renderItemRow = (item: OrderItem) => (
    <div
      key={item.OrderItemId}
      className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-100 shadow-sm transition hover:shadow-md"
    >
      <div className="flex items-center space-x-4">
        {/* --- Image Implementation --- */}
        {item.ImageUrl ? (
          <img
            src={item.ImageUrl}
            alt={item.ItemName || "Order Item"}
            className="w-16 h-16 object-cover rounded-md flex-shrink-0 border border-gray-200"
          />
        ) : (
          <div className="w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center text-gray-500 text-xs flex-shrink-0">
            No Image
          </div>
        )}

        <div>
          <p className="font-semibold text-gray-900">{item.ItemName}</p>
          <p className="text-sm text-gray-500">{item.ItemType}</p>
        </div>
      </div>

      <div className="text-right">
        <p className="text-sm font-medium">Qty: {item.Quantity}</p>
        <p className="text-lg font-bold text-gray-800">
          R{(item.UnitPrice * item.Quantity).toFixed(2)}
        </p>
      </div>
    </div>
  );
  // ------------------------------------

  return (
    <div className="space-y-6 p-4">
      <button
        onClick={() => navigate(-1)}
        className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition duration-150"
      >
        ← Back to Orders
      </button>

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">
          Order Details:{" "}
          <span className="text-blue-600">{order.OrderNumber}</span>
        </h1>

        <button
          onClick={() => setIsModalOpen(true)}
          disabled={order.Status === "completed"}
          className={`flex items-center gap-2 px-4 py-2 rounded shadow-md transition ${
            order.Status === "completed"
              ? "bg-gray-400 text-white cursor-not-allowed"
              : "bg-indigo-600 text-white hover:bg-indigo-700"
          }`}
        >
          <Zap size={18} /> Manage Order Status
        </button>
      </div>

      <Card>
        <CardContent className="p-6 space-y-6">
          {/* Customer & Status Section */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 border-b pb-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Customer Name</p>
              <p className="text-lg font-semibold">{order.CustomerName}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">
                Customer Email
              </p>
              <p className="text-lg font-semibold">{order.Email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Contact</p>
              <p className="text-lg">{order.Phone}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Order Status</p>
              <span
                className={`px-3 py-1 text-sm font-bold rounded-full ${
                  order.Status === "completed"
                    ? "bg-green-100 text-green-800"
                    : order.Status === "assembling"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                {formatStatus(order.Status)}
              </span>
            </div>
          </div>

          {/* Order Summary & Dates */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm pt-4 border-t">
            <div>
              <p className="font-medium text-gray-500">Order Date</p>
              <p>{new Date(order.CreatedAt).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="font-medium text-gray-500">Total Amount</p>
              <p className="font-bold text-xl text-green-700">
                R{order.TotalAmount.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="font-medium text-gray-500">Updated At</p>
              <p>
                {order.UpdatedAt
                  ? new Date(order.UpdatedAt).toLocaleString()
                  : "N/A"}
              </p>
            </div>
            <div>
              <p className="font-medium text-gray-500">Completed At</p>
              <p>
                {order.CompletedAt
                  ? new Date(order.CompletedAt).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
          </div>

          {/* Shipping/Address/Fulfillment Section */}
          <div className="pt-4 border-t">
            <h3 className="text-xl font-semibold mb-3">Shipping Details</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2 shadow-sm border">
              <div>
                <span className="block text-sm font-medium text-gray-500">
                  Fulfillment Type
                </span>
                <span
                  className={`inline-block px-2 py-1 rounded text-xs font-bold ${
                    order.FulfillmentType === "delivery"
                      ? "bg-blue-100 text-blue-700"
                      : order.FulfillmentType === "collection"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {formatStatus(order.FulfillmentType)}
                </span>
              </div>
              <div>
                <span className="block text-sm font-medium text-gray-500">
                  Address
                </span>
                <span className="text-gray-800 font-semibold">
                  {order.Address || (
                    <span className="italic text-gray-400">
                      Address not provided.
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Order Items (NOW CATEGORIZED) */}
          <div className="pt-4 border-t">
            <h3 className="text-xl font-semibold mb-4">
              Order Items ({order.Items.length})
            </h3>
            <div className="space-y-6">
              {/* 🚀 CATEGORIZED ITEMS RENDER 🚀 */}
              {Object.entries(categorizedItems).map(([category, items]) => (
                <div
                  key={category}
                  className="border p-4 rounded-lg bg-indigo-50/50 shadow-sm"
                >
                  <h4 className="text-lg font-bold text-indigo-700 mb-3 border-b border-indigo-200 pb-2">
                    {category.toUpperCase()} BUILD
                  </h4>
                  <div className="space-y-2">{items.map(renderItemRow)}</div>
                </div>
              ))}
              {/* ------------------------------------- */}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Update Modal */}
      {isModalOpen && (
        <StatusUpdateModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          orderId={order.Id}
          currentStatus={order.Status}
          onStatusUpdated={handleStatusUpdated}
          fulfillmentType={order.FulfillmentType}
        />
      )}
    </div>
  );
};

export default SingleOrder;
