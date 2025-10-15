import React, { useState } from "react";
import { Dialog } from "@headlessui/react";
import { Loader2 } from "lucide-react";
import type { User } from "../../model"; // Update path if needed
import { apiService } from "../../api/apiService";
import { useQueryClient } from "@tanstack/react-query";

export type DisableUserModalProps = {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
};

const DisableUserModal: React.FC<DisableUserModalProps> = ({
  isOpen,
  onClose,
  user,
}) => {
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDisable = async () => {
    if (!user?.Id) return;
    setIsProcessing(true);
    setError(null);

    try {
      await apiService.put(`/Users/disable/${user.Id}`);
      queryClient.invalidateQueries({ queryKey: ["users"] });
      onClose();
    } catch (err: any) {
      console.error("Error disabling user:", err);
      setError(err.message || "An error occurred.");
    } finally {
      setIsProcessing(false);
    }
  };

  const userName = user?.FullName || "this user";

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    >
      <Dialog.Panel className="bg-white rounded-lg p-6 w-full max-w-sm">
        <Dialog.Title className="text-lg font-bold mb-4">
          Disable User Account
        </Dialog.Title>

        {error && (
          <p className="text-sm text-red-500 mb-2">
            Failed to disable: {error}
          </p>
        )}

        <p>
          Are you sure you want to disable <strong>{userName}</strong>? The user
          will not be able to access their account until re-enabled.
        </p>

        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            disabled={isProcessing}
          >
            Cancel
          </button>
          <button
            onClick={handleDisable}
            className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:bg-yellow-400 disabled:cursor-not-allowed flex items-center"
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 size={16} className="animate-spin mr-2" />
                Processing...
              </>
            ) : (
              "Disable"
            )}
          </button>
        </div>
      </Dialog.Panel>
    </Dialog>
  );
};

export default DisableUserModal;
