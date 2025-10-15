import React, { useState, useMemo } from "react";
import { Dialog } from "@headlessui/react";
import { uploadImage } from "../../utils/uploadImage";
import { apiService } from "../../api/apiService";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchComponents } from "../../api/reactquery/componentsApi";
import type { Component } from "../../model";
import { Loader2 } from "lucide-react";

export type ComponentFormProps = {
  isOpen: boolean;
  onClose: () => void;
};

// --- Data definitions: Mapped Categories and Types ---
const componentCategoryTypes: { [key: string]: string[] } = {
  Chair: [
    "Seat Base",
    "Back Support",
    "Leg/Castor Set",
    "Armrest",
    "Recline Mechanism",
  ],
  Table: [
    "Table Top",
    "Leg Set (Single)",
    "Frame/Apron",
    "Leaf/Extension",
    "Mounting Hardware",
  ],
  Sofa: [
    "Cushion Insert",
    "Frame Rail",
    "Spring System",
    "Upholstery Fabric",
    "Modular Connector",
  ],
  Bed: [
    "Headboard Panel",
    "Bed Frame Rail",
    "Slat Support",
    "Footboard",
    "Mattress Foundation",
  ],
  Cabinet: [
    "Door Panel",
    "Drawer Slide",
    "Shelf Pin/Clip",
    "Carcass Frame",
    "Handle/Pull",
  ],
  Desk: [
    "Desktop Surface",
    "Cable Grommet",
    "Drawer Unit",
    "Monitor Stand",
    "Height Adjustment Kit",
  ],
  Shelf: [
    "Shelf Board",
    "Wall Bracket",
    "Mounting Rail",
    "Adjustable Pin",
    "Corner Stabilizer",
  ],
};

// Extracting just the main categories for the dropdown keys
const componentCategories = Object.keys(componentCategoryTypes);

const AddComponentModal: React.FC<ComponentFormProps> = ({
  isOpen,
  onClose,
}) => {
  const queryClient = useQueryClient();

  // --- Data Fetching for Compatible Components ---
  const { data: allComponents, isLoading: isLoadingComponents } = useQuery<
    Component[],
    Error
  >({
    queryKey: ["components", "all"],
    queryFn: fetchComponents,
    staleTime: Infinity,
    enabled: isOpen,
  });
  // ----------------------------------------------------

  // State for component fields
  const [name, setName] = useState("");
  const [category, setCategory] = useState(componentCategories[0]);
  // Initialize type based on the first category's first type
  const [type, setType] = useState(
    componentCategoryTypes[componentCategories[0]][0]
  );
  const [description, setDescription] = useState("");
  const [unitPrice, setUnitPrice] = useState(0);
  const [stock, setStock] = useState(0);

  const [compatibleComponentIds, setCompatibleComponentIds] = useState<
    number[]
  >([]);

  // State for image handling and submission
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrlPreview, setImageUrlPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Dynamically selected list of types based on the current category
   */
  const availableTypes = componentCategoryTypes[category] || [];

  /**
   * Logic to filter compatible components based on selected category.
   */
  const filteredCompatibleComponents = useMemo(() => {
    // Return empty array if data isn't loaded yet
    if (isLoadingComponents || !allComponents) return [];

    // Filter components that belong to the currently selected Category
    return allComponents.filter((c) => c.Category === category);
  }, [allComponents, category, isLoadingComponents]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImageUrlPreview(URL.createObjectURL(file));
    } else {
      setImageFile(null);
      setImageUrlPreview(null);
    }
  };

  /**
   * Handles Category change: updates the category state and resets Type and Compatibility IDs.
   */
  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory);
    // Reset Type state to the first Type of the new Category
    const newTypes = componentCategoryTypes[newCategory];
    if (newTypes && newTypes.length > 0) {
      setType(newTypes[0]);
    }
    // Also reset compatible components, as the pool changes
    setCompatibleComponentIds([]);
  };

  const handleCompatibleIdsChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectedOptions = Array.from(e.target.selectedOptions);
    const selectedIds = selectedOptions
      .map((option) => parseInt(option.value))
      .filter((id) => !isNaN(id));
    setCompatibleComponentIds(selectedIds);
  };

  const resetForm = () => {
    setName("");
    // Resetting category and type will be handled by the initial state setup if we close and re-open
    setCategory(componentCategories[0]);
    setType(componentCategoryTypes[componentCategories[0]][0]);
    setDescription("");
    setUnitPrice(0);
    setStock(0);
    setCompatibleComponentIds([]);
    setImageFile(null);
    setImageUrlPreview(null);
    setError(null);
  };

  const handleSubmit = async () => {
    setError(null);

    if (
      !name ||
      !type ||
      !category ||
      !description ||
      unitPrice <= 0 ||
      stock < 0
    ) {
      setError(
        "Please fill in all required fields correctly (Unit Price > 0)."
      );
      return;
    }
    if (!imageFile) {
      setError("Please select an image to upload.");
      return;
    }

    setIsSubmitting(true);
    let finalImageUrl = "";

    try {
      finalImageUrl = await uploadImage(imageFile, "component-images");

      const componentData = {
        Name: name,
        Type: type,
        UnitPrice: unitPrice,
        Stock: stock,
        ImageUrl: finalImageUrl,
        Category: category,
        Description: description,
        CompatibleComponentIds: compatibleComponentIds,
      };

      await apiService.post("/Components", componentData);
      queryClient.invalidateQueries({ queryKey: ["components"] });

      resetForm();
      onClose();
    } catch (e) {
      console.error("Submission failed:", e);
      setError("Failed to add component. Please check console for details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid =
    name &&
    type &&
    category &&
    description &&
    unitPrice > 0 &&
    stock >= 0 &&
    !isSubmitting &&
    imageFile !== null;

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    >
      <Dialog.Panel className="bg-white rounded-lg p-6 w-full max-w-2xl transform overflow-hidden shadow-xl">
        <Dialog.Title className="text-xl font-bold mb-6">
          ⚙️ Add New Component
        </Dialog.Title>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="space-y-6"
        >
          {/* 1. Image Upload/Preview (Full Width) */}
          <div className="border-b pb-4">
            <label
              htmlFor="imageFile"
              className="text-sm font-medium text-gray-700 block mb-1"
            >
              Component Image
            </label>
            <input
              id="imageFile"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full border p-2 rounded text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              disabled={isSubmitting}
            />
            {imageUrlPreview && (
              <img
                src={imageUrlPreview}
                alt="Preview"
                className="w-32 h-32 object-cover mt-2 rounded border"
              />
            )}
          </div>

          {/* 2. Horizontal Fields: Name & Category */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="name"
                className="text-sm font-medium text-gray-700 block mb-1"
              >
                Component Name
              </label>
              <input
                id="name"
                type="text"
                placeholder="Example: Steel Table Leg (4-pack)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border px-3 py-2 rounded"
                disabled={isSubmitting}
                required
              />
            </div>

            <div>
              <label
                htmlFor="category"
                className="text-sm font-medium text-gray-700 block mb-1"
              >
                Product Category (Choose First)
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full border px-3 py-2 rounded"
                disabled={isSubmitting}
                required
              >
                {componentCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 3. Horizontal Fields: Type & Compatibility Selector */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="type"
                className="text-sm font-medium text-gray-700 block mb-1"
              >
                Component Type
              </label>
              <select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full border px-3 py-2 rounded"
                disabled={isSubmitting}
                required
              >
                {/* Dynamically filtered based on category state */}
                {availableTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative">
              <label
                htmlFor="compatible"
                className="text-sm font-medium text-gray-700 block mb-1"
              >
                Compatible Components ({category} only)
              </label>
              {isLoadingComponents ? (
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <Loader2 className="w-4 h-4 animate-spin" /> Loading
                  components...
                </p>
              ) : (
                <select
                  id="compatible"
                  multiple
                  value={compatibleComponentIds.map(String)}
                  onChange={handleCompatibleIdsChange}
                  className="w-full border px-3 py-2 rounded h-24"
                  disabled={
                    isSubmitting || filteredCompatibleComponents.length === 0
                  }
                >
                  {filteredCompatibleComponents.length === 0 && (
                    <option disabled>
                      No other {category} components available
                    </option>
                  )}
                  {filteredCompatibleComponents.map((c) => (
                    <option key={c.Id} value={c.Id}>
                      {c.Name}
                    </option>
                  ))}
                </select>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Hold Ctrl/Cmd to select multiple.
              </p>
            </div>
          </div>

          {/* 4. Horizontal Fields: Unit Price & Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="unitPrice"
                className="text-sm font-medium text-gray-700 block mb-1"
              >
                Unit Price (R)
              </label>
              <input
                id="unitPrice"
                type="number"
                placeholder="Example: 150.50"
                value={unitPrice}
                onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 0)}
                className="w-full border px-3 py-2 rounded"
                disabled={isSubmitting}
                min="0.01"
                step="0.01"
                required
              />
            </div>
            <div>
              <label
                htmlFor="stock"
                className="text-sm font-medium text-gray-700 block mb-1"
              >
                Stock Quantity
              </label>
              <input
                id="stock"
                type="number"
                placeholder="Example: 120"
                value={stock}
                onChange={(e) => setStock(parseInt(e.target.value) || 0)}
                className="w-full border px-3 py-2 rounded"
                disabled={isSubmitting}
                min="0"
                required
              />
            </div>
          </div>

          {/* 5. Description (Full Width) */}
          <div>
            <label
              htmlFor="description"
              className="text-sm font-medium text-gray-700 block mb-1"
            >
              Component Description
            </label>
            <textarea
              id="description"
              placeholder="Example: Heavy-duty steel component used for the frame of chairs and sofas."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full border px-3 py-2 rounded resize-none"
              disabled={isSubmitting}
              required
            />
          </div>

          {/* Error Message */}
          {error && <p className="text-sm text-red-500">{error}</p>}

          {/* Actions */}
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-2 font-semibold text-white rounded flex items-center justify-center gap-2 ${
                isFormValid
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-blue-400 cursor-not-allowed"
              }`}
              disabled={!isFormValid}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Uploading...
                </>
              ) : (
                "Add Component"
              )}
            </button>
          </div>
        </form>
      </Dialog.Panel>
    </Dialog>
  );
};

export default AddComponentModal;
