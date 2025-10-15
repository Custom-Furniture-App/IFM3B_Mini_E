import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import ComponentsPage from "./pages/ComponentsPage";
import Users from "./pages/Users";
import Analytics from "./pages/Analytics";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import SingleUser from "./pages/SingleUser";
import Orders from "./pages/Orders";
import SingleOrder from "./pages/SingleOrder";
import Products from "./pages/Products";
import SingleProduct from "./pages/SingleProduct";
import SingleComponent from "./pages/SingleComponent";
import ProtectedRoute from "./components/ProtectedRoute"; 
import Landing from "./pages/Landing";
import Profile from "./pages/Profile";

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth routes (no layout) */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/" element={<Landing />} />

        {/* Protected routes */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/components" element={<ComponentsPage />} />
                  <Route path="/users" element={<Users />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/users/:id" element={<SingleUser />} />
                  <Route path="/orders" element={<Orders />} />
                  <Route path="/orders/:orderId" element={<SingleOrder />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/products/:id" element={<SingleProduct />} />
                  <Route path="/components/:id" element={<SingleComponent />} />
                  <Route path="/profile" element={<Profile />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
