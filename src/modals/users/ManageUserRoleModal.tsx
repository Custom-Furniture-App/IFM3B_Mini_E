import React, { useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiService } from "../../api/apiService"; // Adjust the import path as necessary
// Assuming User interface is imported from SingleUserView or a model file
import type { User } from "../../model"; // This import should match your actual file structure

// --- New API Function (with 3-Second Delay Simulation) ---
/**
 * API call to update a user's role, simulating a 3-second network delay.
 * @param userId The ID of the user to update.
 * @param newRole The new role to assign (e.g., "Manager").
 * @returns A promise resolving to the updated User object.
 */
const updateRole = async (userId: number, newRole: string): Promise<User> => {
  // 1. Simulate network latency to showcase the loading state
  await new Promise((resolve) => setTimeout(resolve, 3000));

  // 2. Actual API call
  const response = await apiService.put(`/Users/updateRole/${userId}`, {
    Role: newRole,
  });
  return response.data as User;
};
// --- End New API Function ---

interface ManageUserRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
}

const ManageUserRoleModal: React.FC<ManageUserRoleModalProps> = ({
  isOpen,
  onClose,
  user,
}) => {
  const queryClient = useQueryClient();
  const [localError, setLocalError] = useState<string | null>(null);
  // State to hold the selected role. Since promotion is always Clerk -> Manager,
  // this is initialized to and only contains "Manager" for UI consistency.
  const [selectedRole, setSelectedRole] = useState("Manager");

  // Check if the user is a Clerk to ensure the modal is relevant
  const isClerk = user.Role === "Clerk";

  // Use the updateRole API function
  const {
    mutate,
    isPending,
    isError,
    error,
    isSuccess,
    reset: resetMutation,
  } = useMutation({
    // Pass the user ID and the currently selected role ("Manager") to the mutation function
    mutationFn: () => updateRole(user.Id, selectedRole),
    onSuccess: (updatedUser) => {
      // Invalidate the specific user query to force a data refresh
      queryClient.invalidateQueries({ queryKey: ["user", updatedUser.Id] });

      // Close and reset after a short success display time
      setTimeout(() => {
        onClose();
        resetMutation();
      }, 1000);
    },
    onError: (err) => {
      console.error("Role update failed:", err);
      // Display a user-friendly error message
      setLocalError(
        err.message || "An unknown error occurred during promotion."
      );
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    mutate();
  };

  // Only render if the modal is requested to be open AND the user is a Clerk
  if (!isOpen || !isClerk) return null;

  return (
    // Modal Overlay
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 transition-opacity duration-300">
      {/* Modal Content */}
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 transform transition-all scale-100">
        <h3 className="text-2xl font-bold mb-4 text-center text-blue-700">
          Promote User Role 🏅
        </h3>
        <p className="mb-6 text-gray-600 text-center">
          Select the new role for **{user.FullName}** (currently **{user.Role}
          **).
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label
              htmlFor="new-role"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              New Role
            </label>
            {/* UI Tweak: Dropdown with only one option for better UX */}
            <select
              id="new-role"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 shadow-sm bg-gray-50 cursor-pointer"
              required
              disabled={isPending}
            >
              {/* Only the promotion target is available */}
              <option value="Manager">Manager</option>
            </select>
          </div>

          {/* Display Errors and Success */}
          {(localError || isError) && (
            <div className="p-3 mb-4 rounded-md bg-red-100 border border-red-400 text-red-700 text-sm font-medium">
              Error: {localError || error?.message || "Failed to update role."}
            </div>
          )}

          {isSuccess && (
            <div className="p-3 mb-4 rounded-md bg-green-100 border border-green-400 text-green-700 text-sm font-medium">
              Success! {user.FullName} is now a **Manager**.
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-70"
              disabled={isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-5 py-2 rounded-lg text-sm font-medium text-white shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 transition-colors`}
              disabled={isPending}
            >
              {/* Loading state visible for 3 seconds */}
              {isPending ? "Promoting... (3s delay)" : "Promote to Manager"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManageUserRoleModal;
