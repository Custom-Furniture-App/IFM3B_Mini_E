import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./index.css";
import App from "./App.tsx";
import { AuthProvider } from "./context/AuthContext.tsx";

// 1. Create the default Query Client instance
const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/* 2. Wrap the App with the Provider */}
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>
);
