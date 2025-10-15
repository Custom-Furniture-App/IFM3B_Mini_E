import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Boxes,
  Users,
  ShoppingCart,
  PieChart,
  Package,
  LogOut,
  User as UserIcon,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface SidebarProps {
  className?: string;
}

const menuItems = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: <LayoutDashboard size={20} />,
    roles: ["Manager"],
  },
  {
    name: "Orders",
    path: "/orders",
    icon: <ShoppingCart size={20} />,
    roles: ["Manager", "Clerk"],
  },
  {
    name: "Products",
    path: "/products",
    icon: <Package size={20} />,
    roles: ["Manager", "Clerk"],
  },
  {
    name: "Users",
    path: "/users",
    icon: <Users size={20} />,
    roles: ["Manager"],
  },
  {
    name: "Analytics",
    path: "/analytics",
    icon: <PieChart size={20} />,
    roles: ["Manager"],
  },
  {
    name: "Components",
    path: "/components",
    icon: <Boxes size={20} />,
    roles: ["Manager", "Clerk"],
  },
];

const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const currentUserRole = user?.role;

  const filteredMenuItems = menuItems.filter((item) => {
    if (!currentUserRole) return false;
    return item.roles.includes(currentUserRole);
  });

  const handleLogoutConfirm = () => {
    logout();
    setIsModalOpen(false);
    navigate("/login");
  };

  return (
    <>
      <aside
        className={`h-screen w-64 bg-gray-900 text-white flex flex-col justify-between ${
          className || ""
        }`}
      >
        {/* --- Top Section (App Name + Menu) --- */}
        <div>
          <div className="p-4 text-xl font-bold border-b border-gray-700">
            Uj Furn Console
            {currentUserRole && (
              <span className="text-sm font-normal block text-gray-400">
                {currentUserRole} Portal
              </span>
            )}
          </div>

          <nav className="p-2 overflow-auto">
            {filteredMenuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 rounded-md px-3 py-2 mb-1 ${
                  location.pathname === item.path
                    ? "bg-gray-700"
                    : "hover:bg-gray-800"
                }`}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>
        </div>

        {/* --- Bottom Section: Profile + Logout --- */}
        <div className="border-t border-gray-700 p-3">
          {/* Profile Link */}
          <Link
            to="/profile"
            className={`flex items-center gap-2 rounded-md px-3 py-2 mb-2 ${
              location.pathname === "/profile"
                ? "bg-gray-700"
                : "hover:bg-gray-800"
            }`}
          >
            <UserIcon size={20} />
            <span>Profile</span>
          </Link>

          {/* Logout Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 w-full rounded-md px-3 py-2 text-left hover:bg-gray-800 text-red-400 hover:text-red-300"
          >
            <LogOut size={20} />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* --- Logout Confirmation Modal --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center">
              <LogOut size={20} className="mr-2 text-red-500" />
              Confirm Logout
            </h3>

            <p className="text-gray-600 mb-6">
              Are you sure you want to log out of the admin portal?
            </p>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition"
              >
                Cancel
              </button>

              <button
                onClick={handleLogoutConfirm}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
