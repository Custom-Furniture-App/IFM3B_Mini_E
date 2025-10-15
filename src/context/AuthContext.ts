import React, { createContext, useContext } from "react";

// 1. Define the User type based on your API response
export interface User {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  role: "Manager" | "Clerk";
  address: string;
}

// 2. Define the shape of the Auth Context
export interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
    isLoading: boolean; // NEW: Loading state to indicate if auth status is being checked
}

// 3. Create the Context object
// Note: We use 'undefined' as the initial value and handle the check in the hook.
export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

// Define the key for local storage
export const LOCAL_STORAGE_KEY = "uj_furn_user";

// 4. Custom hook for easy access to the context (ONLY export functions/types here)
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
