import React, { useState } from "react";
// Import useQuery from React Query
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "../components/ui/Card";
import { useNavigate } from "react-router-dom";
import { Plus, Loader2 } from "lucide-react"; // Only keeping Plus and Loader2
import AddProductModal from "../modals/products/AddProductModal";
import DeleteProductModal from "../modals/products/DeleteProductModal";
import EditProductModal from "../modals/products/EditProductModal";
import type { Product } from "../model";
import { fetchProducts } from "../api/reactquery/productsApi";

const Products: React.FC = () => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const navigate = useNavigate();

  const {
    data: products,
    isLoading,
    isError,
    error,
  } = useQuery<Product[], Error>({
    queryKey: ["products"],
    queryFn: fetchProducts,
    staleTime: 5 * 60 * 1000,
  });

  console.log("Fetched products:", products);

  // --- Action Handlers ---

  const handleView = (product: Product) => {
    // Navigates to the product detail page
    navigate(`/products/${product.Id}`, { state: { product } });
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setIsEditOpen(true);
  };

  const handleDelete = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteOpen(true);
  };
  // -----------------------

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        <span className="ml-2 text-lg text-gray-600">Loading products...</span>
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
          {(error as Error).message || "Could not fetch products."}
        </p>
        <p className="text-sm text-gray-500 mt-4">
          Please check your network connection or API service.
        </p>
      </div>
    );
  }

  // Ensure products is an array, even if the data is null/undefined after loading/error checks
  const productList = products || [];

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">🛠️ Products Management</h2>
        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 transition"
        >
          <Plus size={16} /> Add Product
        </button>
      </div>

      <Card>
        <CardContent className="p-0">
          {productList.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              No products found. Click "Add Product" to get started.
            </div>
          ) : (
            <table className="w-full table-auto border-collapse">
              <thead>
                <tr className="border-b bg-gray-100">
                  <th className="py-3 px-3 text-left">Image</th>
                  <th className="py-3 px-3 text-left">Product Name</th>
                  <th className="py-3 px-3 text-left">Category</th>
                  <th className="py-3 px-3 text-right">Price</th>
                  <th className="py-3 px-3 text-right">Stock</th>
                  <th className="py-3 px-3 text-center">Actions</th>{" "}
                  {/* Adjusted to center */}
                </tr>
              </thead>
              <tbody>
                {productList.map((product) => (
                  <tr
                    key={product.Id}
                    className="border-b last:border-none hover:bg-gray-50"
                  >
                    <td className="py-3 px-3">
                      {product.ImageUrl ? (
                        <img
                          src={product.ImageUrl}
                          alt={product.ProductName}
                          className="w-12 h-12 object-cover rounded"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 flex items-center justify-center rounded text-gray-500 text-sm">
                          No Image
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3">{product.ProductName}</td>
                    <td className="py-3 px-3">{product.Category}</td>
                    <td className="py-3 px-3 text-right">
                      R {product.Price.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-right">{product.Stock}</td>

                    {/* --- UPDATED ACTIONS COLUMN WITH BUTTONS --- */}
                    <td className="py-3 px-3 flex justify-center gap-2">
                      <button
                        onClick={() => handleView(product)}
                        className="px-3 py-1 text-xs font-medium rounded bg-blue-500 text-white hover:bg-blue-600 transition"
                        title="View Details"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleEdit(product)}
                        className="px-3 py-1 text-xs font-medium rounded bg-green-500 text-white hover:bg-green-600 transition"
                        title="Edit Product"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product)}
                        className="px-3 py-1 text-xs font-medium rounded bg-red-500 text-white hover:bg-red-600 transition"
                        title="Delete Product"
                      >
                        Delete
                      </button>
                    </td>
                    {/* ------------------------------------------- */}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Modals remain the same, relying on state */}
      <AddProductModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />

      <EditProductModal
        isOpen={isEditOpen}
        product={selectedProduct}
        onClose={() => setIsEditOpen(false)}
      />

      <DeleteProductModal
        isOpen={isDeleteOpen}
        product={selectedProduct}
        onClose={() => setIsDeleteOpen(false)}
      />
    </div>
  );
};

export default Products;
