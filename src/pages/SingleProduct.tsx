import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { Card, CardContent } from "../components/ui/Card";
import type { Product } from "../model";

const SingleProduct: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const product: Product = location.state?.product;

  if (!product) {
    return (
      <div className="text-center p-8 text-lg text-gray-600">
        Product data not found. Please go back and try again.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition duration-150"
      >
        ← Back to Products
      </button>

      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* 1. IMAGE (First to show) */}
            <div className="md:col-span-1">
              {product.ImageUrl ? (
                <img
                  src={product.ImageUrl}
                  alt={product.ProductName}
                  className="w-full h-auto max-h-80 object-cover rounded-lg shadow-md"
                />
              ) : (
                <div className="w-full h-80 bg-gray-200 flex items-center justify-center rounded-lg text-gray-500">
                  No Image Available
                </div>
              )}
            </div>

            {/* 2. DETAILS */}
            <div className="md:col-span-2 space-y-4">
              <h1 className="text-4xl font-extrabold text-gray-900 border-b pb-2">
                {/* Display Name */}
                {product.ProductName}
              </h1>

              <p className="text-xl font-semibold text-blue-600">
                {/* Capitalized Field: Category */}
                Category:{" "}
                <span className="font-normal text-gray-700">
                  {product.Category}
                </span>
              </p>

              <p className="text-3xl font-bold text-green-700">
                {/* Capitalized Field: Price */}
                Price: R {product.Price.toFixed(2)}
              </p>

              <div className="grid grid-cols-2 gap-4 text-lg">
                <p className="font-medium text-gray-800">
                  {/* Capitalized Field: Stock */}
                  Stock:{" "}
                  <span className="font-normal">{product.Stock} units</span>
                </p>
                <p className="font-medium text-gray-800">
                  {/* Capitalized Field: Created Date */}
                  Created Date:{" "}
                  <span className="font-normal">
                    {new Date(product.CreatedDate).toLocaleDateString()}
                  </span>
                </p>
              </div>

              {/* 3. DESCRIPTION (Added) */}
              <div className="pt-4 border-t mt-4">
                {/* Capitalized Field: Description */}
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Description
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {product.Description ||
                    "No detailed description provided for this product."}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SingleProduct;
