import React, { useState } from "react";
import { Dialog } from "@headlessui/react";
import { Loader2 } from "lucide-react";
import type { Product } from "../../model"; // Assuming Product model path
import { apiService } from "../../api/apiService";
import { useQueryClient } from "@tanstack/react-query";

export type DeleteModalProps = {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
};

const DeleteProductModal: React.FC<DeleteModalProps> = ({
  isOpen,
  onClose,
  product,
}) => {
  const queryClient = useQueryClient();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!product?.Id) return;
    setIsDeleting(true);
    setError(null);

    try {
      await apiService.delete(`/Products/${product.Id}`);
      queryClient.invalidateQueries({ queryKey: ["products"] });
      onClose();
    } catch (err: any) {
      console.error("Error deleting product:", err);
      setError(err.message || "An error occurred.");
    } finally {
      setIsDeleting(false);
    }
  };

  const productName = product?.ProductName || "this product";

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    >
      <Dialog.Panel className="bg-white rounded-lg p-6 w-full max-w-sm">
        <Dialog.Title className="text-lg font-bold mb-4">
          Delete Product
        </Dialog.Title>

        {error && (
          <p className="text-sm text-red-500 mb-2">Failed to delete: {error}</p>
        )}

        <p>
          Are you sure you want to delete <strong>{productName}</strong>? This
          action cannot be undone.
        </p>

        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed flex items-center"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 size={16} className="animate-spin mr-2" />
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

export default DeleteProductModal;
