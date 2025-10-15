import React, { useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom"; // Updated to use useParams
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiService } from "../api/apiService"; // Assuming apiService is available
import { getUser } from "../api/reactquery/usersApi";
import ManageUserRoleModal from "../modals/users/ManageUserRoleModal";

// --- 1. CORE DATA STRUCTURES (MOCKING model.ts) ---

/** Interface representing the user data structure. */
export interface User {
  Id: number;
  FullName: string;
  Email: string;
  Phone: string;
  Address: string | null;
  Role: string;
  CreatedAt: string;
  Disabled: boolean;
  IsDeleted: boolean;
}

/** Payload for updating user status. */
export interface UpdateUserStatusPayload {
  disabled: boolean;
  disableReason?: string; // Only required when disabling
}

/**
 * Refactored API call to toggle user disabled status (disable=true, enable=false).
 * This implements the request to use 'false' for enabling the user.
 * It's assumed the API endpoint `/Users/disable/{userId}` handles both based on the boolean body.
 * NOTE: The disableReason is handled locally in the handleSubmit logic but isn't passed here
 * since the original API call only included a boolean body.
 */
const toggleUserDisabledStatus = async (
  userId: number,
  disabled: boolean // true for disable, false for enable
): Promise<User> => {
  // Real API call to disable/enable user, passing the boolean status
  // This fulfills the requirement for the enable call to be the same except taking 'false'.
  const response = await apiService.put(`/Users/disable/${userId}`, disabled);
  return response.data as User;
};

const Card: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="bg-white rounded-xl shadow-lg border border-gray-100">
    {children}
  </div>
);

const CardContent: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="p-6">{children}</div>
);

const DetailItem: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <div>
    <p className="font-semibold text-gray-500">{label}</p>
    <p className="text-gray-800 mt-1">{value}</p>
  </div>
);

// --- 4. DISABLE USER MODAL COMPONENT ---

const DISABLE_REASONS = [
  { value: "violation", label: "Violation of Terms of Service" },
  { value: "suspicious", label: "Suspicious Activity Detected" },
  { value: "request", label: "User Requested Account Closure" },
  { value: "other", label: "Other (Specify in Details)" },
];

interface DisableUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
}

const DisableUserModal: React.FC<DisableUserModalProps> = ({
  isOpen,
  onClose,
  user,
}) => {
  const queryClient = useQueryClient();
  const [reason, setReason] = useState(DISABLE_REASONS[0].value);
  const [details, setDetails] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  // Determine if the current action is Disabling (user is currently Active) or Enabling (user is currently Disabled)
  const isDisabling = !user.Disabled;

  const {
    mutate,
    isPending,
    isError,
    error,
    isSuccess,
    reset: resetMutation,
  } = useMutation({
    // IMPORTANT: Pass both userId and the desired disabled status (payload.payload.disabled)
    mutationFn: (payload: {
      userId: number;
      payload: UpdateUserStatusPayload;
    }) => toggleUserDisabledStatus(payload.userId, payload.payload.disabled),

    onSuccess: (updatedUser) => {
      // Invalidate the query for this specific user to trigger a re-fetch and update the SingleUser view
      queryClient.invalidateQueries({ queryKey: ["user", updatedUser.Id] });
      setTimeout(() => {
        onClose();
        resetMutation();
        setReason(DISABLE_REASONS[0].value);
        setDetails("");
      }, 500);
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (isDisabling) {
      // Logic for DISABLING (disabled: true)
      if (reason === "other" && details.trim() === "") {
        setLocalError('Please provide details for the "Other" reason.');
        return;
      }

      const disableReason =
        reason === "other" && details.trim()
          ? `${reason}: ${details.trim()}`
          : reason !== "other"
          ? reason
          : details.trim();

      // The mutate call sets disabled: true
      mutate({
        userId: user.Id,
        payload: { disabled: true, disableReason: disableReason },
      });
    } else {
      // Logic for ENABLING (disabled: false)
      // The mutate call sets disabled: false
      mutate({
        userId: user.Id,
        payload: { disabled: false },
      });
    }
  };

  if (!isOpen) return null;

  const actionText = isDisabling ? "Disable" : "Enable";
  const buttonStyle = isDisabling
    ? "bg-red-600 hover:bg-red-700"
    : "bg-green-600 hover:bg-green-700";

  return (
    // Outermost div acts as the modal overlay
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 transition-opacity p-4">
      {/* Modal content container */}
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
        <h3 className="text-2xl font-bold mb-4 text-center text-gray-800">
          {actionText} Account
        </h3>
        <p className="mb-6 text-gray-600 text-center">
          {isDisabling
            ? `Confirm action for: ${user.FullName}`
            : `Are you sure you want to re-enable ${user.FullName}'s account?`}
        </p>

        <form onSubmit={handleSubmit}>
          {isDisabling && (
            <div className="space-y-4 mb-6">
              <div>
                <label
                  htmlFor="disable-reason"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Reason for Disabling <span className="text-red-500">*</span>
                </label>
                <select
                  id="disable-reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                  required
                >
                  {DISABLE_REASONS.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              {(reason === "other" ||
                reason === "violation" ||
                reason === "suspicious") && (
                <div>
                  <label
                    htmlFor="details"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Additional Details{" "}
                    {reason === "other" && '(Mandatory for "Other")'}
                  </label>
                  <textarea
                    id="details"
                    rows={3}
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 mt-1 block w-full p-2 border border-gray-300 rounded-lg"
                    placeholder="Enter specific details regarding the action taken..."
                  />
                </div>
              )}
            </div>
          )}

          {/* Display Errors and Success */}
          {(localError || isError) && (
            <div className="p-3 mb-4 rounded-md bg-red-100 border border-red-400 text-red-700 text-sm">
              Error:{" "}
              {localError || error?.message || "Failed to update status."}
            </div>
          )}

          {isSuccess && (
            <div className="p-3 mb-4 rounded-md bg-green-100 border border-green-400 text-green-700 text-sm">
              Success! User status updated.
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-5 py-2 rounded-lg text-sm font-medium text-white shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${buttonStyle} disabled:opacity-50 transition-colors`}
              disabled={isPending}
            >
              {isPending ? "Processing..." : `${actionText} User`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
// --- 5. MAIN COMPONENT (SingleUserView) ---

const SingleUserView: React.FC = () => {
  const navigate = useNavigate();
  // 1. Get the userId from the URL parameters
  const { id: userIdParam } = useParams<{ id: string }>();
  const userId = parseInt(userIdParam || "0"); // Convert param string to number

  const [isDisableModalOpen, setIsDisableModalOpen] = React.useState(false); // Renamed for clarity
  const [isRoleModalOpen, setIsRoleModalOpen] = React.useState(false); // <--- New state

  // 2. Use React Query to fetch the user data by ID
  const {
    data: user,
    isLoading,
    isError,
    error,
  } = useQuery<User, Error>({
    queryKey: ["user", userId],
    queryFn: () => getUser(userId),
    enabled: userId > 0,
  });

  if (isLoading || userId <= 0)
    return <p className="p-6 text-lg text-gray-600">Loading user details...</p>;

  if (isError)
    return (
      <p className="p-6 text-lg text-red-600">
        Error loading user: {error.message}.
      </p>
    );

  if (!user)
    return (
      <p className="p-6 text-lg text-red-600">
        User with ID {userId} not found.
      </p>
    );

  const statusText = user.Disabled ? "Disabled" : "Active";
  const statusColor = user.Disabled
    ? "text-red-600 bg-red-50"
    : "text-green-600 bg-green-50";
    
  // Check if the user is a Clerk to conditionally show the Promote button
  const canBePromoted = user.Role === "Clerk";

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center pb-4 border-b border-gray-200">
        <h2 className="text-3xl font-extrabold text-gray-900">
          User Details: {user.FullName}
        </h2>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-colors shadow-sm"
        >
          &larr; Back to Users
        </button>
      </div>

      <Card>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 text-base">
            <DetailItem label="Full Name" value={user.FullName} />
            <DetailItem label="Email" value={user.Email} />
            <DetailItem label="Phone" value={user.Phone} />
            <DetailItem label="Role" value={user.Role} />
            <DetailItem label="Address" value={user.Address || "N/A"} />
            <DetailItem
              label="Created At"
              value={new Date(user.CreatedAt).toLocaleString()}
            />

            <div className="col-span-1 md:col-span-2">
              <p className="font-semibold text-gray-500">Status</p>
              <span
                className={`inline-flex items-center px-3 py-1 mt-1 text-sm font-semibold rounded-full ${statusColor}`}
              >
                {statusText}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-8"> {/* <-- Use flex for button grouping */}
            {/* 1. Disable/Enable Button (Existing) */}
            <button
              onClick={() => setIsDisableModalOpen(true)}
              className={`px-6 py-3 font-semibold text-white rounded-lg transition-all shadow-lg text-lg
                ${
                  user.Disabled
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                }
                transform hover:scale-[1.02] active:scale-[0.98]
              `}
            >
              {user.Disabled ? "Re-Enable User Account" : "Disable User Account"}
            </button>
            
            {/* 2. Promote to Manager Button (NEW) */}
            {canBePromoted && (
                <button
                onClick={() => setIsRoleModalOpen(true)} // <--- Open role modal
                className={`px-6 py-3 font-semibold text-white rounded-lg transition-all shadow-lg text-lg
                    bg-blue-600 hover:bg-blue-700
                    transform hover:scale-[1.02] active:scale-[0.98]
                `}
                >
                Manage User Role
                </button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* The Disable/Enable Modal Component (existing, renamed prop) */}
      <DisableUserModal
        isOpen={isDisableModalOpen}
        onClose={() => setIsDisableModalOpen(false)}
        user={user}
      />

      {/* The Role Management Modal Component (NEW) */}
      <ManageUserRoleModal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        user={user}
      />
    </div>
  );
};

export default SingleUserView;