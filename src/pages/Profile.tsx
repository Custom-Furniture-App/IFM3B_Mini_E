import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { apiService } from "../api/apiService";
import { AxiosError } from "axios";
import { getUser } from "../api/reactquery/usersApi";
// Import useMutation and useQueryClient
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// NOTE: I've updated the interface property names to use PascalCase
// based on the usage (e.g., user.fullName -> user.FullName) for consistency,
// but the original API service is using camelCase in the payload, which I kept.
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

// --- UpdateProfileModal Component (Updated to use useMutation) ---

// Define the payload structure for the update
interface UpdatePayload {
  fullName: string;
  phone: string;
  address: string | null;
  email: string;
}

interface UpdateModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  // Removed onUpdateSuccess as React Query handles the update via cache invalidation
}

const UpdateProfileModal: React.FC<UpdateModalProps> = ({
  user,
  isOpen,
  onClose,
}) => {
  // Initialize state with the user prop data (or empty string/null)
  const [fullName, setFullName] = useState(user.FullName);
  const [phone, setPhone] = useState(user.Phone || "");
  const [address, setAddress] = useState(user.Address || "");
  const [error, setError] = useState<string | null>(null);

  // Get the query client instance
  const queryClient = useQueryClient();

  // Define the mutation function
  const updateProfile = async (payload: UpdatePayload) => {
    // NOTE: Ensure the ID is passed correctly, and adjust the endpoint if needed
    const response = await apiService.put(`/Users/${user.Id}`, payload);
    return response.data; // The server should return the updated user object
  };

  // Setup the mutation hook
  const mutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      // 1. Invalidate the 'loggedInUser' query to trigger an automatic refetch
      // This will ensure all components using this query key get the fresh data.
      queryClient.invalidateQueries({ queryKey: ["loggedInUser"] });

      // 2. Alternatively (and often faster), you can set the query data directly
      // using the response from the mutation (data).
      // queryClient.setQueryData(["loggedInUser", user.Id], data);

      // Close the modal
      onClose();
    },
    onError: (err: AxiosError<{ Message?: string }>) => {
      let errorMessage = "Failed to update profile. Please try again.";
      if (err.response) {
        errorMessage =
          err.response.data?.Message ||
          `Server Error: ${err.response.statusText}`;
      }
      setError(errorMessage);
    },
  });

  if (!isOpen) return null;

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName || !phone) {
      setError("Full Name and Phone are required.");
      return;
    }

    // Call the mutation
    mutation.mutate({
      fullName,
      phone,
      address,
      email: user.Email,
    });
  };

  const isLoading = mutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 transition-opacity duration-300">
      <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-2xl">
        <h2 className="mb-4 text-xl font-bold text-gray-800">
          Update Profile Details ✏️
        </h2>
        <form onSubmit={handleUpdate}>
          {error && (
            <div className="mb-4 rounded bg-red-100 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Form fields remain the same */}
          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded border p-2 focus:border-blue-500 focus:ring-blue-500"
              required
              disabled={isLoading}
            />
          </div>

          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Phone
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded border p-2 focus:border-blue-500 focus:ring-blue-500"
              required
              disabled={isLoading}
            />
          </div>

          <div className="mb-6">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Address
            </label>
            <textarea
              value={address || ""}
              onChange={(e) => setAddress(e.target.value)}
              rows={3}
              className="w-full rounded border p-2 focus:border-blue-500 focus:ring-blue-500"
              disabled={isLoading}
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition duration-150 hover:bg-gray-100"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`flex items-center rounded-lg px-4 py-2 font-semibold text-white transition duration-150 ${
                isLoading
                  ? "cursor-not-allowed bg-blue-400"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {/* Spinner icon remains the same */}
              {isLoading && (
                <svg
                  className="-ml-1 mr-3 h-5 w-5 animate-spin text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              )}
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Profile Component (Updated to use fetched data directly) ---
const Profile: React.FC = () => {
  const { user: authUser } = useAuth(); // Rename context user to avoid conflict
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Use a constant for the query key
  const USER_QUERY_KEY = ["loggedInUser"];

  // 1. Fetch user data using useQuery
  const {
    data: fetchedUser,
    isLoading,
    isError,
    error,
    isFetching, // Add isFetching to show loading when refreshing
  } = useQuery<User, Error>({
    queryKey: [...USER_QUERY_KEY, authUser?.id], // Use the ID from the AuthContext user
    queryFn: () => getUser(authUser?.id??0), // Fallback to 0 if undefined
    // Only run the query if the user ID from AuthContext is available (and > 0)
    enabled: !!authUser?.id && authUser.id > 0,
    // Keep the data fresh for a longer time since it's personal profile data
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // 2. Display Loading/Error States based on React Query status
  if (isLoading) {
    return (
      <div className="p-6 text-center text-gray-500">
        <p>Loading profile data...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 text-center text-red-600">
        Error loading profile: {error.message}
      </div>
    );
  }

  // 3. Use the fetched data for rendering and the modal prop
  if (!fetchedUser) {
    return (
      <div className="p-6 text-center text-gray-500">
        No user data available. Please log in.
      </div>
    );
  }

  // The Profile component now directly uses fetchedUser
  const userToDisplay = fetchedUser;

  return (
    <div className="p-8 max-w-md mx-auto bg-white shadow-lg rounded-xl mt-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 flex items-center justify-between">
        Profile
        {isFetching && (
          <span className="text-sm text-blue-500 ml-2">Refreshing...</span>
        )}
      </h1>

      <div className="space-y-4">
        {/* Profile Details Display using fetchedUser (now userToDisplay) */}
        <div className="flex justify-between">
          <span className="font-medium text-gray-600">Full Name:</span>
          <span className="text-gray-800">{userToDisplay.FullName}</span>
        </div>

        <div className="flex justify-between">
          <span className="font-medium text-gray-600">Email:</span>
          <span className="text-gray-800">{userToDisplay.Email}</span>
        </div>

        <div className="flex justify-between">
          <span className="font-medium text-gray-600">Phone:</span>
          <span className="text-gray-800">{userToDisplay.Phone}</span>
        </div>

        <div className="flex justify-between">
          <span className="font-medium text-gray-600">Address:</span>
          <span className="text-gray-800">
            {userToDisplay.Address || "N/A"}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="font-medium text-gray-600">Role:</span>
          <span className="text-gray-800">{userToDisplay.Role}</span>
        </div>

        <div className="flex justify-between">
          <span className="font-medium text-gray-600">ID:</span>
          <span className="text-gray-800">{userToDisplay.Id}</span>
        </div>
      </div>

      {/* Edit Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="mt-6 w-full rounded-lg bg-blue-600 py-2 font-semibold text-white transition duration-150 hover:bg-blue-700"
      >
        Edit Profile
      </button>

      {/* Profile Update Modal */}
      {/* Pass the latest fetchedUser data to the modal */}
      <UpdateProfileModal
        user={userToDisplay}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        // Removed onUpdateSuccess prop
      />
    </div>
  );
};

export default Profile;
