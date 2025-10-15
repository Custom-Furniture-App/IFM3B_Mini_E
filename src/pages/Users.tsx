import React, { useState, useMemo } from "react";
import { Card, CardContent } from "../components/ui/Card";
import { useNavigate } from "react-router-dom";
import { PlusCircle } from "lucide-react"; // Import PlusCircle icon for the button
import type { User } from "../model";
import { useQuery, useQueryClient } from "@tanstack/react-query"; // Import useQueryClient
import { fetchUsers } from "../api/reactquery/usersApi";
import DeleteUserModal from "../modals/users/DeleteUserModal";
import AddUserModal from "../modals/users/AddUserModal ";


// Define the valid user types for the filter
const USER_TYPES = ["All", "Clerk", "Manager", "Customer"] as const;
type UserType = (typeof USER_TYPES)[number];

const Users: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient(); // <-- Initialize query client

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false); // <-- New state for Add User Modal
  const [userListNotification, setUserListNotification] = useState<
    string | null
  >(null); // <-- New state for User List notification

  // --- State for Filtering and Searching ---
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<UserType>("All");
  // --- End State ---

  const {
    data: users = [],
    isLoading,
    isError,
    error,
    refetch, // <-- Get refetch function from useQuery
  } = useQuery<User[], Error>({
    queryKey: ["users"],
    queryFn: fetchUsers,
    staleTime: 5 * 60 * 1000,
  });

  // Function to handle successful user addition
  const handleUserAdded = (message: string) => {
    // 1. Refetch the users data to update the list immediately
    queryClient.invalidateQueries({ queryKey: ["users"] });
    // or just use refetch();

    // 2. Set a temporary success message above the user list
    setUserListNotification(message);
    setTimeout(() => setUserListNotification(null), 5000); // Clear after 5 seconds
  };

  // --- Filtering and Searching Logic (Optimized with useMemo) ---
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      // 1. Filter by Role
      const typeMatch = filterType === "All" || user.Role === filterType;

      // 2. Filter by Search Term (Check FullName, Email, or Phone)
      const lowerCaseSearch = searchTerm.toLowerCase();
      const searchMatch =
        user.FullName.toLowerCase().includes(lowerCaseSearch) ||
        user.Email.toLowerCase().includes(lowerCaseSearch) ||
        (user.Phone && user.Phone.includes(lowerCaseSearch));

      return typeMatch && searchMatch;
    });
  }, [users, filterType, searchTerm]);
  // --- End Filtering and Searching Logic ---

  // --- Navigation Logic (Passing ONLY the ID) ---
  const handleView = (user: User) => {
    navigate(`/users/${user.Id}`); // Pass only the ID in the URL
  };
  // --- End Navigation Logic ---

  const handleDelete = (user: User) => {
    setSelectedUser(user);
    setIsDeleteOpen(true);
  };

  if (isLoading) return <p>Loading users...</p>;
  if (isError) return <p>Error loading users: {error.message}</p>;

  return (
    <div className="space-y-6">
      {/* Page Header and Add Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Users Management</h2>
        <button
          onClick={() => setIsAddUserOpen(true)} // <-- Open the modal
          className="flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-white font-semibold hover:bg-green-700 transition"
        >
          <PlusCircle className="h-5 w-5" />
          Add New User
        </button>
      </div>

      {/* User List Notification */}
      {userListNotification && (
        <div className="rounded-md bg-green-100 p-3 text-green-700">
          <p
            dangerouslySetInnerHTML={{
              __html: userListNotification.replace(
                /\*\*(.*?)\*\*/g,
                "<strong>$1</strong>"
              ),
            }}
          />
        </div>
      )}

      <Card>
        <CardContent className="p-4">
          {/* 🔍 Filter and Search Controls using standard HTML elements */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
            {/* Search Input */}
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-blue-500 sm:w-80"
            />

            {/* Type Filter Select */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as UserType)}
              className="w-full cursor-pointer rounded-md border border-gray-300 bg-white p-2 sm:w-[180px]"
            >
              {USER_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type === "All" ? "All Roles" : `Role: ${type}`}
                </option>
              ))}
            </select>
          </div>
          {/* --- End Filter and Search Controls --- */}

          {/* User Table */}
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="border-b bg-gray-100">
                <th className="py-2 px-3 text-left">Full Name</th>
                <th className="py-2 px-3 text-left">Email</th>
                <th className="py-2 px-3 text-left">Phone</th>
                <th className="py-2 px-3 text-left">Role</th>
                <th className="py-2 px-3 text-left">Status</th>
                <th className="py-2 px-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-4 text-center text-gray-500">
                    No users found matching your current filters.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr
                    key={user.Id}
                    className="border-b last:border-none hover:bg-gray-50"
                  >
                    <td className="py-2 px-3 font-medium">{user.FullName}</td>
                    <td className="py-2 px-3">{user.Email}</td>
                    <td className="py-2 px-3">{user.Phone || "-"}</td>
                    <td className="py-2 px-3">{user.Role}</td>
                    <td
                      className={`py-2 px-3 font-semibold ${
                        user.Disabled ? "text-red-600" : "text-green-600"
                      }`}
                    >
                      {user.Disabled ? "Disabled" : "Active"}
                    </td>
                    <td className="py-2 px-3 flex gap-2">
                      <button
                        onClick={() => handleView(user)}
                        className="px-3 py-1 text-xs font-medium rounded bg-blue-500 text-white hover:bg-blue-600 transition"
                        title="View Details"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Delete Modal (Existing) */}
      <DeleteUserModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        user={selectedUser}
      />

      {/* Add User Modal (New) */}
      <AddUserModal
        isOpen={isAddUserOpen}
        onClose={() => setIsAddUserOpen(false)}
        onUserAdded={handleUserAdded} // <-- Pass the callback for successful addition
      />
    </div>
  );
};

export default Users;
