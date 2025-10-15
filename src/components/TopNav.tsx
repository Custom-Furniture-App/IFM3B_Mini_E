import React, { useState, useRef, useEffect } from "react";
import { LogOut, User as UserIcon } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

interface TopNavProps {
  className?: string;
}

const TopNav: React.FC<TopNavProps> = ({ className }) => {
  const { user, logout } = useAuth();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Create a ref for the entire clickable user area and the menu
  const menuRef = useRef<HTMLDivElement>(null);

  const fullName = user?.fullName || "Guest User";
  const email = user?.email || "N/A";
  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);

  const handleLogoutConfirm = () => {
    logout();
    setIsModalOpen(false);
    setIsMenuOpen(false);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // Check if the click is outside the entire container (user info + dropdown)
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    // Only add the listener when the menu is actually open
    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    // Cleanup the event listener
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]); // Rerun effect whenever the menu state changes

  return (
    <>
      <header
        className={`h-16 bg-white shadow px-6 flex items-center justify-between z-10 ${
          className || ""
        }`}
      >
        <span className="font-semibold text-lg"></span>

        {/* Attach the ref to the parent container of the user area and the menu */}
        <div className="relative flex items-center gap-4" ref={menuRef}>
          {/* User Info and Initials Container (The main clickable area) */}
          <div
            className="flex items-center cursor-pointer p-2 rounded-lg transition duration-150"
            // Use simple click to toggle the menu
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {/* Initials Circle */}
            <div className="h-10 w-10 bg-blue-500 text-white flex items-center justify-center rounded-full font-bold mr-3">
              {initials}
            </div>

            {/* Left-aligned name and email */}
            <div className="text-left hidden sm:block">
              <span className="block font-medium text-sm">{fullName}</span>
              <span className="block text-xs text-gray-500">{email}</span>
            </div>
          </div>

          {/* Dropdown Menu */}
          {isMenuOpen && (
            <div
              className="absolute right-0 top-12 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20"
              // NOTE: All mouse/hover handlers are REMOVED here
            >
              <div
                className="py-1"
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="user-menu"
              >
                {/* Profile Link (Example) */}
                <Link
                  to="/profile"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsMenuOpen(false)} // Close menu on click inside
                >
                  <UserIcon size={16} className="mr-3 text-gray-400" />
                  Profile
                </Link>

                {/* Logout Button (Opens Modal) */}
                <button
                  onClick={() => {
                    setIsModalOpen(true);
                    setIsMenuOpen(false); // Close menu when modal opens
                  }}
                  className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-red-100 hover:text-red-600"
                  role="menuitem"
                >
                  <LogOut size={16} className="mr-3 text-red-400" />
                  Log Out
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Logout Confirmation Modal (unchanged) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          {/* ✅ bg-white/60 keeps background visible with soft white tint and blur */}

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

export default TopNav;
