import React, { useState } from "react";
import { Dialog } from "@headlessui/react";
import { Loader2, Trash } from "lucide-react"; // Added Trash icon for visual appeal
import type { Component } from "../../model"; // Assuming Component model path
import { apiService } from "../../api/apiService"; // API service for DELETE call
import { useQueryClient } from "@tanstack/react-query";

// --- Props Definition (Adapted for Component) ---
export type DeleteComponentProps = {
  isOpen: boolean;
  onClose: () => void;
  component: Component | null; // Pass the component data
};
// -------------------------------------------------

const DeleteComponentModal: React.FC<DeleteComponentProps> = ({
  isOpen,
  onClose,
  component,
}) => {
  const queryClient = useQueryClient();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Function to handle the actual deletion
  const handleDelete = async () => {
    if (!component?.Id) return; // Ensure component ID exists

    setIsDeleting(true);
    setError(null);

    try {
      await apiService.delete(`/Components/${component.Id}`);
      queryClient.invalidateQueries({ queryKey: ["components"] });
      onClose();
    } catch (err: any) {
      console.error("Error deleting component:", err);
      // Provide a user-friendly error message
      setError("Failed to delete component. Please check your network.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Use component Name for confirmation text
  const componentName = component?.Name || "this component";

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    >
      <Dialog.Panel className="bg-white rounded-lg p-6 w-full max-w-sm">
        {/* Title and Icon */}
        <div className="flex items-center text-red-600 mb-4">
          <Trash size={24} className="mr-3" />
          <Dialog.Title className="text-xl font-bold">
            Delete Component
          </Dialog.Title>
        </div>

        {error && (
          <p className="text-sm text-red-500 bg-red-50 p-2 border border-red-200 rounded mb-4">
            **Failed to delete:** {error}
          </p>
        )}

        <p className="text-gray-700">
          Are you sure you want to delete component:
          <strong className="text-red-600"> {componentName}</strong>? This
          action cannot be undone and will affect any products that use it.
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
            disabled={isDeleting}
          >
            Cancel
          </button>

          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed flex items-center gap-2 transition"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </button>
        </div>
      </Dialog.Panel>
    </Dialog>
  );
};

export default DeleteComponentModal;
