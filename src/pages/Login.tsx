import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiService } from "../api/apiService";
import { AxiosError } from "axios";
import { useAuth, type User } from "../context/AuthContext";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false); // Loading state
  // New state to toggle password visibility
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  // Helper function for the 3-second delay
  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true); // START loading spinner

    try {
      // 1. Initiate API call
      const apiPromise = apiService.post("/Auth/login", { email, password });

      // 2. Wait for both the API call and the 3-second delay to complete
      await Promise.all([apiPromise, delay(3000)]);

      // Get the response data after both promises resolve
      const res = await apiPromise;
      const userData = res.data as User;

      // Role check for access restriction
      if (userData.role !== "Manager" && userData.role !== "Clerk") {
        const accessError =
          "Access Denied: Only users with the role **Manager** or **Clerk** can access this portal.";
        setError(accessError);
        return; // Halt execution and skip login/navigation
      }

      console.log("Login Success:", userData);

      // Proceed with login for authorized roles
      login(userData);
      if (userData.role === "Clerk") {
        navigate("/orders");
      } else {
        navigate("/dashboard");
      }
    } catch (err: any) {
      const axiosError = err as AxiosError<{ Message?: string }>;
      console.error("Login Error:", axiosError);

      let errorMessage = "An unexpected error occurred. Please try again.";

      if (axiosError.response) {
        errorMessage =
          axiosError.response.data?.Message ||
          `Server Error: ${axiosError.response.statusText}`;
      } else if (axiosError.message) {
        errorMessage = `Network Error: ${axiosError.message}`;
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false); // STOP loading spinner
    }
  };

  // New function to toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-sm rounded-lg bg-white p-6 shadow-md"
      >
        <h2 className="mb-4 text-2xl font-bold">🔑 Login</h2>

        {/* Error Notification */}
        {error && (
          <div className="mb-3 rounded bg-red-100 p-2 text-sm text-red-700">
            <p
              dangerouslySetInnerHTML={{
                __html: error.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>"),
              }}
            />
          </div>
        )}

        {/* Email Input */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-3 w-full rounded border p-2"
          required
          disabled={isLoading}
        />

        {/* Password Input Group (The main change) */}
        <div className="relative mb-3">
          <input
            // Use the showPassword state to dynamically set the type
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded border p-2 pr-10" // Added pr-10 for padding on the right
            required
            disabled={isLoading}
          />
          {/* Eye Icon/Button */}
          <button
            type="button" // Important: Prevents it from submitting the form
            onClick={togglePasswordVisibility}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
            disabled={isLoading}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {/* SVG for the Eye Icon - Use a simple visibility icon */}
            {showPassword ? (
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
        </div>

        {/* Submit Button with Loading State */}
        <button
          type="submit"
          className={`w-full rounded p-2 text-white transition duration-150 flex items-center justify-center ${
            isLoading
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              {/* Tailwind Spinner */}
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
              Logging In...
            </>
          ) : (
            "Login"
          )}
        </button>

        <div className="mt-3 flex justify-between text-sm">
          <Link to="/forgot-password" className="text-blue-600 hover:underline">
            Forgot Password?
          </Link>
        </div>
      </form>
    </div>
  );
}

export default Login;
