import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { Card, CardContent } from "../components/ui/Card";
// Assuming the Component interface is in the same model file as Product
import type { Component } from "../model";

const SingleComponent: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Cast the state data to the Component interface
  const component: Component | undefined = location.state?.component;

  if (!component) {
    return (
      <div className="text-center p-8 text-lg text-gray-600">
        Component data not found. Please go back and try again.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition duration-150"
      >
        ← Back to Components
      </button>

      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* 1. IMAGE */}
            <div className="md:col-span-1">
              {component.ImageUrl ? (
                <img
                  src={component.ImageUrl}
                  alt={component.Name}
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
                {component.Name}
              </h1>

              <p className="text-xl font-semibold text-blue-600">
                {/* Field: Type */}
                Type:{" "}
                <span className="font-normal text-gray-700">
                  {component.Type}
                </span>
              </p>

              <p className="text-xl font-semibold text-blue-600">
                {/* Field: Category */}
                Category:{" "}
                <span className="font-normal text-gray-700">
                  {component.Category}
                </span>
              </p>

              <p className="text-3xl font-bold text-green-700">
                {/* Field: Unit Price */}
                Unit Price: R {component.UnitPrice.toFixed(2)}
              </p>

              <div className="grid grid-cols-2 gap-4 text-lg">
                <p className="font-medium text-gray-800">
                  {/* Field: Stock */}
                  Stock:{" "}
                  <span className="font-normal">{component.Stock} units</span>
                </p>
                {/* Note: I'm omitting a 'CreatedDate' field as it wasn't in the Component interface, 
                         but you can add it here if it exists in your actual data. */}
              </div>

              {/* 3. DESCRIPTION */}
              <div className="pt-4 border-t mt-4">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Description
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {component.Description ||
                    "No detailed description provided for this component."}
                </p>
              </div>

              {/* 4. COMPATIBLE COMPONENTS (New Section) */}
              <div className="pt-4 border-t mt-4">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Compatible Components
                </h3>
                {component.CompatibleComponents &&
                component.CompatibleComponents.length > 0 ? (
                  <ul className="list-disc list-inside space-y-1 pl-4 text-gray-700">
                    {component.CompatibleComponents.map((comp) => (
                      <li key={comp.Id} className="font-normal">
                        {comp.Name} (ID: {comp.Id})
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">
                    No compatible components listed.
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SingleComponent;
