import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Loader2 } from "lucide-react"; 

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  // 👇 Destructure the new isLoading state
  const { user, isLoading } = useAuth();

  // 1. Show a loader while we are checking localStorage
  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Loader2 size={32} className="animate-spin text-blue-600" />
      </div>
    );
  }

  // 2. If loading is done AND there's no logged-in user, redirect
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // 3. Otherwise, render the protected content
  return <>{children}</>;
};

export default ProtectedRoute;
