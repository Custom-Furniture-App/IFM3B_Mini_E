import React, { useState, useMemo } from "react";
import { Card, CardContent } from "../components/ui/Card";
import { Plus, Loader2, Search } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"; // Import useMutation and useQueryClient
import { fetchComponents } from "../api/reactquery/componentsApi";
import { apiService } from "../api/apiService"; // Assuming your apiService is available
import type { Component } from "../model";
import { useNavigate } from "react-router-dom";
import AddComponentModal from "../modals/component/AddComponentModal";
import EditComponentModal from "../modals/component/EditComponent";
import DeleteComponentModal from "../modals/component/DeleteComponentModal"; // 👈 NEW IMPORT

// --- Data Definitions (Reused from Modals for Consistency) ---
const componentCategories = [
  "All Categories", // Option to show all
  "Chair",
  "Table",
  "Sofa",
  "Bed",
  "Cabinet",
  "Desk",
  "Shelf",
];
// -------------------------------------------------------------

// --- Delete API Function ---
const deleteComponent = async (id: number) => {
  await apiService.delete(`/Components/${id}`);
};
// ---------------------------

const ComponentsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // --- Modal States ---
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false); // 👈 NEW STATE

  // --- Data States ---
  const [editingComponent, setEditingComponent] = useState<Component | null>(
    null
  );
  const [deletingComponent, setDeletingComponent] = useState<Component | null>(
    null
  ); // 👈 NEW STATE

  // States for Filtering and Searching
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState(componentCategories[0]);

  // --- Data Fetching (Query) ---
  const {
    data: componentsData,
    isLoading,
    isError,
    error,
  } = useQuery<Component[], Error>({
    queryKey: ["components"],
    queryFn: fetchComponents,
    staleTime: 5 * 60 * 1000,
  });

  // --- Deletion Mutation ---
  const deleteMutation = useMutation({
    mutationFn: deleteComponent,
    onSuccess: () => {
      // ✅ Invalidate and refetch the components list to auto-update the UI
      queryClient.invalidateQueries({ queryKey: ["components"] });
      // Close the modal and clear the deleting component state
      setShowDeleteModal(false);
      setDeletingComponent(null);
    },
    onError: (err) => {
      console.error("Delete Error:", err);
      // The modal will display the error handled internally by handleDelete function
    },
  });

  // --- Filtering Logic ---
  const components = componentsData || [];

  const filteredComponents = useMemo(() => {
    let currentComponents = components;
    // 1. Filter by Category
    if (filterCategory !== "All Categories") {
      currentComponents = currentComponents.filter(
        (c) => c.Category === filterCategory
      );
    }
    // 2. Filter by Search Term
    if (searchTerm.trim() !== "") {
      const lowerCaseSearch = searchTerm.toLowerCase().trim();
      currentComponents = currentComponents.filter(
        (c) =>
          c.Name.toLowerCase().includes(lowerCaseSearch) ||
          c.Description.toLowerCase().includes(lowerCaseSearch) ||
          c.Type.toLowerCase().includes(lowerCaseSearch)
      );
    }
    return currentComponents;
  }, [components, filterCategory, searchTerm]);

  // --- Handlers ---
  const handleAdd = () => {
    setEditingComponent(null);
    setShowAddEditModal(true);
  };

  const handleEdit = (component: Component) => {
    setEditingComponent(component);
    setShowAddEditModal(true);
  };

  const handleView = (component: Component) => {
    navigate(`/components/${component.Id}`, { state: { component } });
  };

  // 👈 UPDATED: Opens the Delete Modal
  const handleDeleteClick = (component: Component) => {
    setDeletingComponent(component);
    setShowDeleteModal(true);
  };

  // 👈 NEW: Wrapper for the mutation
  const handleConfirmDelete = async (id: number) => {
    await deleteMutation.mutateAsync(id);
  };

  // --- Loading and Error States (Unchanged) ---
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        <span className="ml-2 text-lg text-gray-600">
          Loading components...
        </span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center p-8 bg-red-50 border border-red-200 rounded">
        <h3 className="text-xl font-semibold text-red-600">
          Error Loading Data
        </h3>
        <p className="text-red-500 mt-2">
          {(error as Error).message || "Could not fetch components."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* 1. Header and Add Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">⚙️ Components Management</h2>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded font-medium hover:bg-green-700 transition"
        >
          <Plus size={16} /> Add Component
        </button>
      </div>

      {/* --- Filter and Search Bar --- */}
      <div className="flex gap-4 p-4 bg-gray-50 rounded-lg border">
        {/* Category Filter Dropdown */}
        <div className="flex flex-col w-64">
          <label
            htmlFor="category-filter"
            className="text-sm font-medium text-gray-700 mb-1"
          >
            Filter by Category
          </label>
          <select
            id="category-filter"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="border px-3 py-2 rounded bg-white"
          >
            {componentCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Search Input */}
        <div className="flex flex-col flex-grow">
          <label
            htmlFor="search-input"
            className="text-sm font-medium text-gray-700 mb-1"
          >
            Search Components
          </label>
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              id="search-input"
              type="text"
              placeholder="Search by Name, Type, or Description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border px-3 py-2 pl-10 rounded"
            />
          </div>
        </div>
      </div>
      {/* ------------------------------- */}

      <Card>
        <CardContent className="p-0">
          {filteredComponents.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              No components found matching the current filters.
            </div>
          ) : (
            <table className="w-full table-auto border-collapse">
              <thead>
                <tr className="border-b bg-gray-100">
                  <th className="py-3 px-3 text-left">Picture</th>
                  <th className="py-3 px-3 text-left">Name</th>
                  <th className="py-3 px-3 text-left">Category</th>
                  <th className="py-3 px-3 text-right">Unit Price</th>
                  <th className="py-3 px-3 text-right">Stock</th>
                  <th className="py-3 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredComponents.map((c) => (
                  <tr
                    key={c.Id}
                    className="border-b last:border-none hover:bg-gray-50"
                  >
                    <td className="py-3 px-3">
                      <img
                        src={c.ImageUrl}
                        alt={c.Name}
                        className="w-10 h-10 object-cover rounded-sm"
                        onError={(e) => {
                          (e.target as HTMLImageElement).onerror = null;
                          (e.target as HTMLImageElement).src =
                            "/placeholder-image.png"; // Fallback image
                        }}
                      />
                    </td>
                    <td className="py-3 px-3">{c.Name}</td>
                    <td className="py-3 px-3">{c.Category}</td>
                    <td className="py-3 px-3 text-right">
                      R{c.UnitPrice.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-right">{c.Stock}</td>

                    {/* --- ACTIONS COLUMN --- */}
                    <td className="py-3 px-3 flex justify-center gap-2">
                      <button
                        onClick={() => handleView(c)}
                        className="px-3 py-1 text-xs font-medium rounded bg-gray-500 text-white hover:bg-gray-600 transition"
                        title="View Component Details"
                      >
                        View
                      </button>

                      <button
                        onClick={() => handleEdit(c)}
                        className="px-3 py-1 text-xs font-medium rounded bg-blue-500 text-white hover:bg-blue-600 transition"
                        title="Edit Component"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(c)}
                        className="px-3 py-1 text-xs font-medium rounded bg-red-500 text-white hover:bg-red-600 transition"
                        title="Delete Component"
                      >
                        Delete
                      </button>
                    </td>
                    {/* ------------------------ */}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* 2. RENDER THE Add/Edit Modal */}
      {showAddEditModal &&
        (editingComponent === null ? (
          <AddComponentModal
            isOpen={showAddEditModal}
            onClose={() => setShowAddEditModal(false)}
          />
        ) : (
          <EditComponentModal
            isOpen={showAddEditModal}
            component={editingComponent}
            onClose={() => {
              setShowAddEditModal(false);
              setEditingComponent(null);
            }}
          />
        ))}

      {/* 3. RENDER THE DELETE Modal */}
      {showDeleteModal && deletingComponent !== null && (
        <DeleteComponentModal
          isOpen={showDeleteModal}
          component={deletingComponent}
          onClose={() => {
            setShowDeleteModal(false);
            setDeletingComponent(null);
          }}
        />
      )}
    </div>
  );
};

export default ComponentsPage;
