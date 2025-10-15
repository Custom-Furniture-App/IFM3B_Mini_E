import { useState } from "react";
import { apiService } from "../../api/apiService";
import { AxiosError } from "axios";
import React from "react";

// Define the props for the modal component
interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Callback to signal the parent component (Users) to refresh the list
  onUserAdded: (message: string) => void;
}

// Helper function for the 3-second delay (kept from original)
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const AddUserModal: React.FC<AddUserModalProps> = ({
  isOpen,
  onClose,
  onUserAdded,
}) => {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [role, setUserRole] = useState("Clerk");
  const [notification, setNotification] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Function to reset the form state
  const resetForm = () => {
    setFullName("");
    setPhone("");
    setEmail("");
    setUserRole("Clerk");
    setNotification(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotification(null);
    setIsLoading(true);

    const password = email;

    try {
      const apiPromise = apiService.post("/Auth/register", {
        fullName,
        phone,
        email,
        password,
        role,
      });

      // Wait for both the API call and the 3-second delay to complete
      await Promise.all([apiPromise, delay(3000)]);

      const successMessage = `User **${fullName}** added successfully! The default password is set to their **email address**`;

      // 1. Notify the parent component to refresh the user list
      onUserAdded(successMessage);

      // 2. Set temporary success notification on the modal
      setNotification(successMessage);

      // 3. Close the modal after a short delay to let the user see the success message
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err: any) {
      const error = err as AxiosError<{ Message?: string }>;
      console.error("Add User Error:", error);

      let errorMessage = "An unknown error occurred. Please try again.";

      if (error.response) {
        if (error.response.status === 409) {
          errorMessage =
            error.response.data?.Message ||
            "A user with this email or phone number already exists.";
        } else {
          errorMessage =
            error.response.data?.Message ||
            `Server Error: ${error.response.statusText}`;
        }
      } else if (error.message) {
        errorMessage = `Network Error: ${error.message}`;
      }

      setNotification(`Error adding user: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  // --- Basic Modal Structure (Tailwind) ---
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl relative m-4">
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
          disabled={isLoading}
        >
          <svg
            className="h-6 w-6"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>

        <form onSubmit={handleAddUser}>
          <h2 className="mb-4 text-2xl font-bold text-center">
            Add New User 👤
          </h2>

          {/* Success/Error Notification */}
          {notification && (
            <div
              className={`mb-3 rounded p-3 text-sm ${
                notification.includes("successfully")
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              <p
                dangerouslySetInnerHTML={{
                  __html: notification.replace(
                    /\*\*(.*?)\*\*/g,
                    "<strong>$1</strong>"
                  ),
                }}
              />
            </div>
          )}

          {/* Form Fields (disabled while loading) */}
          <input
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="mb-3 w-full rounded border p-2 focus:ring-blue-500 focus:border-blue-500"
            required
            disabled={isLoading}
          />
          <input
            type="tel"
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mb-3 w-full rounded border p-2 focus:ring-blue-500 focus:border-blue-500"
            required
            disabled={isLoading}
          />
          <input
            type="email"
            placeholder="Email Address (Default Password)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mb-3 w-full rounded border p-2 focus:ring-blue-500 focus:border-blue-500"
            required
            disabled={isLoading}
          />
          <div className="mb-4">
            <label
              htmlFor="user-role"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              User Type
            </label>
            <select
              id="user-role"
              value={role}
              onChange={(e) => setUserRole(e.target.value)}
              className="w-full rounded border p-2 focus:ring-blue-500 focus:border-blue-500"
              required
              disabled={isLoading}
            >
              <option value="Manager">Manager</option>
              <option value="Clerk">Clerk</option>
            </select>
          </div>

          {/* Submit Button with Loading State */}
          <button
            type="submit"
            className={`w-full rounded p-3 text-white transition duration-150 flex items-center justify-center font-semibold ${
              isLoading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                {/* Simple Tailwind Spinner */}
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
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
                Adding User...
              </>
            ) : (
              "Add User"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddUserModal;
