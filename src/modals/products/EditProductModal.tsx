import React, { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import type { Product } from "../../model";
import { uploadImage } from "../../utils/uploadImage";
import { apiService } from "../../api/apiService";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

export type EditProductProps = {
  isOpen: boolean;
  product: Product | null;
  onClose: () => void;
};

const categories = [
  "Chairs",
  "Tables",
  "Sofas",
  "Beds",
  "Cabinets",
  "Desks",
  "Shelves",
  "Outdoor Furniture",
];

const EditProductModal: React.FC<EditProductProps> = ({
  isOpen,
  product,
  onClose,
}) => {
  const queryClient = useQueryClient();

  // State initialized based on the passed product
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(0);
  const [stock, setStock] = useState(0);

  // State for image handling
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // useEffect to initialize state when a product is passed or the modal opens
  useEffect(() => {
    if (product) {
      setProductName(product.ProductName);
      setCategory(product.Category);
      setDescription(product.Description || "");
      setPrice(product.Price);
      setStock(product.Stock);
      setPreviewImageUrl(product.ImageUrl || null);
      setNewImageFile(null); // Clear pending new file on product change
    }
  }, [product]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewImageFile(file); // Store the actual file for upload
      setPreviewImageUrl(URL.createObjectURL(file)); // Show the local preview
    } else {
      setNewImageFile(null);
      // Revert the preview to the original image (if it exists)
      setPreviewImageUrl(product?.ImageUrl || null);
    }
  };

  const resetForm = () => {
    setError(null);
    setIsSubmitting(false);
    onClose();
  };

  const handleSubmit = async () => {
    setError(null);
    if (
      !product ||
      !productName ||
      !category ||
      !description ||
      price <= 0 ||
      stock < 0
    ) {
      setError(
        "Please ensure all fields are filled correctly (Price must be > 0)."
      );
      return;
    }

    setIsSubmitting(true);
    let finalImageUrl = product.ImageUrl;

    try {
      // 1. Conditional Image Upload
      if (newImageFile) {
        finalImageUrl = await uploadImage(newImageFile, "product-images");
      }

      // 2. Prepare Updated Product Data
      const updatedProduct = {
        ...product,
        ProductName: productName,
        Category: category,
        Description: description,
        Price: parseFloat(price.toString()),
        Stock: parseInt(stock.toString()),
        ImageUrl: finalImageUrl,
      };

      // 3. API PUT Request
      await apiService.put(`/Products/${product.Id}`, updatedProduct);
      queryClient.invalidateQueries({ queryKey: ["products"] });
      console.log("Product successfully updated.");

      // 4. Close and Reset
      resetForm();
    } catch (e) {
      console.error("Update failed:", e);
      setError("Failed to update product. Please check console for details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid =
    productName &&
    category &&
    description &&
    price > 0 &&
    stock >= 0 &&
    !isSubmitting;

  return (
    <Dialog
      open={isOpen}
      onClose={resetForm}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    >
      <Dialog.Panel className="bg-white rounded-lg p-6 w-full max-w-md">
        <Dialog.Title className="text-xl font-bold mb-4">
          ✏️ Edit Product: {product?.ProductName}
        </Dialog.Title>

        <div className="space-y-4">
          {/* 1. Image Upload and Preview */}
          <div>
            <label
              htmlFor="imageFile"
              className="text-sm font-medium text-gray-700 block mb-1"
            >
              Product Image
            </label>
            <input
              id="imageFile"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full border p-2 rounded text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              disabled={isSubmitting}
            />
            {previewImageUrl && (
              <div className="relative">
                <img
                  src={previewImageUrl}
                  alt="Preview"
                  className="w-32 h-32 object-cover mt-2 rounded border"
                />
                {newImageFile && (
                  <span className="absolute top-3 left-3 bg-red-500 text-white text-xs px-2 py-0.5 rounded shadow-lg">
                    New Image
                  </span>
                )}
              </div>
            )}
          </div>

          {/* 2. Product Name */}
          <div>
            <label
              htmlFor="productName"
              className="text-sm font-medium text-gray-700 block mb-1"
            >
              Product Name
            </label>
            <input
              id="productName"
              type="text"
              placeholder="Example: The Stellar Desk Lamp"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="w-full border px-3 py-2 rounded"
              disabled={isSubmitting}
            />
          </div>

          {/* 3. Category */}
          <div>
            <label
              htmlFor="category"
              className="text-sm font-medium text-gray-700 block mb-1"
            >
              Category
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border px-3 py-2 rounded"
              disabled={isSubmitting}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Description */}
          <div>
            <label
              htmlFor="description"
              className="text-sm font-medium text-gray-700 block mb-1"
            >
              Description
            </label>
            <textarea
              id="description"
              placeholder="Example: A sleek, modern lamp with built-in wireless charging. Perfect for home offices."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full border px-3 py-2 rounded resize-none"
              disabled={isSubmitting}
            />
          </div>

          {/* 5. Price */}
          <div>
            <label
              htmlFor="price"
              className="text-sm font-medium text-gray-700 block mb-1"
            >
              Price (R)
            </label>
            <input
              id="price"
              type="number"
              placeholder="Example: 1299.00"
              value={price}
              onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
              className="w-full border px-3 py-2 rounded"
              disabled={isSubmitting}
              min="0.01"
              step="0.01"
            />
          </div>

          {/* 6. Stock */}
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
              placeholder="Example: 50"
              value={stock}
              onChange={(e) => setStock(parseInt(e.target.value) || 0)}
              className="w-full border px-3 py-2 rounded"
              disabled={isSubmitting}
              min="0"
            />
          </div>

          {/* Error Message */}
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={resetForm}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className={`px-4 py-2 font-semibold text-white rounded flex items-center justify-center gap-2 ${
              isFormValid
                ? "bg-green-600 hover:bg-green-700"
                : "bg-green-400 cursor-not-allowed"
            }`}
            disabled={!isFormValid}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </Dialog.Panel>
    </Dialog>
  );
};

export default EditProductModal;
