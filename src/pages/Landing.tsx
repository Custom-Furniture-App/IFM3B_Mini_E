import React from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, UserCog } from "lucide-react";

const Landing: React.FC = () => {
  const navigate = useNavigate();

  // Handle Super Admin Access
  const handleSuperAdminAccess = () => {
    const input = prompt("Enter the Super Admin access phrase:");

    if (input === "SUPER-ADMIN") {
      navigate("/register");
    } else if (input !== null) {
      alert("❌ Incorrect magic words. Please contact system administrator.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white to-gray-100 px-6">
      <div className="max-w-lg w-full bg-white shadow-xl rounded-2xl p-10 text-center border border-gray-200">
        <h1 className="text-3xl font-bold text-gray-800 mb-3">
          Welcome to <span className="text-blue-600">Uj Furn</span>
        </h1>
        <p className="text-gray-600 mb-8">Select below to get started</p>

        <div className="space-y-4">
          {/* Manager/Clerk Button */}
          <button
            onClick={() => navigate("/login")}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition"
          >
            <UserCog size={18} />I am a Manager / Clerk
          </button>

          {/* Super Admin Button */}
          <button
            onClick={handleSuperAdminAccess}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium transition"
          >
            <ShieldCheck size={18} />I am a Super Admin
          </button>
        </div>
      </div>

      <footer className="mt-10 text-gray-500 text-sm">
        © {new Date().getFullYear()} Uj Furn. All rights reserved.
      </footer>
    </div>
  );
};

export default Landing;
