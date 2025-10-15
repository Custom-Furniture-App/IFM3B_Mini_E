import React, { useState, useEffect, type ReactNode } from "react";
import {
  AuthContext,
  type User,
  LOCAL_STORAGE_KEY,
  type AuthContextType,
} from "./AuthContext";

// 4. Create the Provider Component
interface AuthProviderProps {
  children: ReactNode;
}

// Export ONLY the component from this file
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  // 👇 NEW: State to track if the initial local storage check is done
  const [isLoading, setIsLoading] = useState(true);

  // 5. Load user from local storage on initial mount
  useEffect(() => {
    const storedUser = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedUser) {
      try {
        const parsedUser: User = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (e) {
        console.error("Error parsing user from local storage:", e);
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
    }
    // 👇 NEW: Set loading to false once the check is complete (in success or failure)
    setIsLoading(false);
  }, []);

  // 6. Login function: sets state and saves to local storage
  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(userData));
  };

  // 7. Logout function: clears state and removes from local storage
  const logout = () => {
    setUser(null);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  };

  const contextValue: AuthContextType = {
    user,
    login,
    logout,
    isLoading,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
