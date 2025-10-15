import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiService } from "../api/apiService"; // Assuming the path is correct

// --- Reusable Password Toggle Icon Component ---
const PasswordToggleIcon = ({ isVisible, toggleVisibility, isLoading }) => (
  <button
    type="button" // Important: Prevents it from submitting the form
    onClick={toggleVisibility}
    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-purple-700"
    disabled={isLoading}
    aria-label={isVisible ? "Hide password" : "Show password"}
  >
    {/* SVG for the Eye Icon - Use a simple visibility icon */}
    {isVisible ? (
      // Eye-slash icon (Password hidden)
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-5 h-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3.988 5.558A10 10 0 1 0 12 3.525a10 10 0 0 0-8.012 2.033Z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.2 21.8l18.4-18.4"
        />
      </svg>
    ) : (
      // Eye icon (Password visible)
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-5 h-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.437 0 .644C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
        />
      </svg>
    )}
  </button>
);
// ---------------------------------------------------

function ForgotPassword() {
  const navigate = useNavigate(); // Used for navigation after success

  // State for the two-step flow: 'email' or 'reset'
  const [step, setStep] = useState("email");

  // Input states
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // NEW STATES for password visibility
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // State for displaying errors on screen and loading state
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // --- Step 1: Check Email ---
  const handleCheckEmail = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors
    setSuccessMessage("");

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    try {
      setIsLoading(true);

      // API call to check if the email exists
      const response = await apiService.post("/Auth/check-email", { email });

      if (response.status === 200) {
        setStep("reset"); // Move to the password reset step
      } else {
        setError("No account found with this email.");
      }
    } catch (err) {
      setError("Failed to check email. Please try again later.");
      console.error("Email check error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Step 2: Reset Password ---
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors
    setSuccessMessage("");

    // --- Validation Logic ---
    if (!newPassword || !confirmPassword) {
      setError("Please fill in both password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    // --- End Validation Logic ---

    try {
      setIsLoading(true);

      // API call to reset the password
      await apiService.post("/Auth/forgot-password", {
        email: email, // Use the stored email from Step 1
        password: newPassword,
      });

      setSuccessMessage("Success! Your password has been updated.");
      setNewPassword("");
      setConfirmPassword("");

      // Navigate after a short delay to allow the user to see the success message
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      setError(
        "Unable to update password. Please ensure your details are correct."
      );
      console.error("Password reset error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Render based on Step ---
  const renderEmailStep = () => (
    <form
      onSubmit={handleCheckEmail}
      className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl"
    >
      <h2 className="mb-4 text-2xl font-bold text-gray-800">
        Find Your Account 📧
      </h2>
      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="mb-4 w-full rounded border p-3 focus:border-purple-500 focus:ring-purple-500"
        autoFocus
      />

      {error && (
        <p className="mb-4 text-center text-sm font-medium text-red-600">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className={`w-full rounded p-3 font-semibold text-white transition duration-200 ${
          isLoading
            ? "cursor-not-allowed bg-purple-400"
            : "bg-purple-600 hover:bg-purple-700"
        }`}
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <svg
              className="mr-3 h-5 w-5 animate-spin text-white"
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
            Finding...
          </div>
        ) : (
          "Find Account"
        )}
      </button>
    </form>
  );

  const renderResetStep = () => (
    <form
      onSubmit={handleResetPassword}
      className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl"
    >
      <h2 className="mb-4 text-2xl font-bold text-gray-800">
        Set New Password 🔒
      </h2>

      {/* Disabled Email Field */}
      <input
        type="email"
        placeholder="Email"
        value={email}
        readOnly
        className="mb-4 w-full cursor-not-allowed rounded border border-gray-300 bg-gray-100 p-3 text-gray-600"
      />

      {/* New Password Field with Toggle */}
      <div className="relative mb-4">
        <input
          type={showNewPassword ? "text" : "password"}
          placeholder="New Password (min 6 chars)"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full rounded border p-3 pr-10 focus:border-purple-500 focus:ring-purple-500" // Added pr-10
          autoFocus
        />
        <PasswordToggleIcon
          isVisible={showNewPassword}
          toggleVisibility={() => setShowNewPassword((prev) => !prev)}
          isLoading={isLoading}
        />
      </div>

      {/* Confirm Password Field with Toggle */}
      <div className="relative mb-4">
        <input
          type={showConfirmPassword ? "text" : "password"}
          placeholder="Confirm New Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full rounded border p-3 pr-10 focus:border-purple-500 focus:ring-purple-500" // Added pr-10
        />
        <PasswordToggleIcon
          isVisible={showConfirmPassword}
          toggleVisibility={() => setShowConfirmPassword((prev) => !prev)}
          isLoading={isLoading}
        />
      </div>

      {error && (
        <p className="mb-4 text-center text-sm font-medium text-red-600">
          {error}
        </p>
      )}

      {successMessage && (
        <p className="mb-4 text-center text-sm font-medium text-green-600">
          {successMessage} Redirecting to login...
        </p>
      )}

      <button
        type="submit"
        disabled={isLoading || !!successMessage}
        className={`w-full rounded p-3 font-semibold text-white transition duration-200 ${
          isLoading || !!successMessage
            ? "cursor-not-allowed bg-purple-400"
            : "bg-purple-600 hover:bg-purple-700"
        }`}
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <svg
              className="mr-3 h-5 w-5 animate-spin text-white"
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
            Resetting...
          </div>
        ) : (
          "Reset Password"
        )}
      </button>
    </form>
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-sm">
        {step === "email" ? renderEmailStep() : renderResetStep()}

        <p className="mt-4 text-center text-sm">
          <Link to="/login" className="text-purple-600 hover:underline">
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;
