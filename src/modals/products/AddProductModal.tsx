import React, { useState } from "react";
import { Dialog } from "@headlessui/react";
import { uploadImage } from "../../utils/uploadImage";
import { apiService } from "../../api/apiService";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

export type ProductFormProps = {
  isOpen: boolean;
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

const AddProductModal: React.FC<ProductFormProps> = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(0);
  const [stock, setStock] = useState(0);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrlPreview, setImageUrlPreview] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file); // Store the actual file
      setImageUrlPreview(URL.createObjectURL(file)); // Store URL for local preview
    } else {
      setImageFile(null);
      setImageUrlPreview(null);
    }
  };

  const resetForm = () => {
    setProductName("");
    setCategory(categories[0]);
    setDescription("");
    setPrice(0);
    setStock(0);
    setImageFile(null);
    setImageUrlPreview(null);
    setError(null);
  };

  const handleSubmit = async () => {
    setError(null);
    if (!productName || !category || !description || price <= 0 || stock < 0) {
      setError("Please fill in all fields correctly (Price must be > 0).");
      return;
    }
    if (!imageFile) {
      setError("Please select an image to upload.");
      return;
    }

    setIsSubmitting(true);
    let finalImageUrl = "";

    try {
      console.log("Starting image upload...");
      finalImageUrl = await uploadImage(imageFile, "product-images");
      console.log("Image uploaded. URL:", finalImageUrl);

      // 2. Prepare Product Data
      const productData = {
        productName,
        category,
        description,
        price,
        stock,
        imageUrl: finalImageUrl,
      };

      // 3. Post Product Data to API
      await apiService.post("/Products", productData);
      queryClient.invalidateQueries({ queryKey: ["products"] });
      console.log("Product successfully added to the database.");

      // 4. Close and Reset
      resetForm();
      onClose();
    } catch (e) {
      console.error("Submission failed:", e);
      setError("Failed to add product. Please check console for details.");
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
      onClose={() => {
        onClose();
        resetForm();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    >
      <Dialog.Panel className="bg-white rounded-lg p-6 w-full max-w-md">
        <Dialog.Title className="text-xl font-bold mb-4">
          Add New Product
        </Dialog.Title>

        <div className="space-y-4">
          {/* IMAGE upload/preview */}
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
            />
            {imageUrlPreview && (
              <img
                src={imageUrlPreview}
                alt="Preview"
                className="w-32 h-32 object-cover mt-2 rounded border"
              />
            )}
          </div>

          {/* Product Name */}
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

          {/* Category Select */}
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

          {/* Description */}
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

          {/* Price Input */}
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

          {/* Stock Input */}
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

          {/* Display Error Message */}
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={() => {
              onClose();
              resetForm();
            }}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
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
                Submitting...
              </>
            ) : (
              "Add Product"
            )}
          </button>
        </div>
      </Dialog.Panel>
    </Dialog>
  );
};

export default AddProductModal;
