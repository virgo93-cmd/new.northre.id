"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import { Brand } from "@/types";
import { createBrand } from "@/modules/products/brand.service";

interface BrandSidebarProps {
  brands: Brand[];
  setBrands: React.Dispatch<React.SetStateAction<Brand[]>>;
  selectedBrandId: string;
  setSelectedBrandId: (id: string) => void;
  onError?: (msg: string) => void;
}

export default function BrandSidebar({
  brands,
  setBrands,
  selectedBrandId,
  setSelectedBrandId,
  onError,
}: BrandSidebarProps) {
  const [newBrandName, setNewBrandName] = useState("");
  const [isAddingBrand, setIsAddingBrand] = useState(false);
  const [loadingAdd, setLoadingAdd] = useState(false);

  const handleCreateBrandInline = async () => {
    if (!newBrandName.trim()) return;
    try {
      setLoadingAdd(true);
      const slugVal = newBrandName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const created = await createBrand({
        name: newBrandName.trim(),
        slug: slugVal,
      });

      setBrands((prev) => [created, ...prev]);
      setSelectedBrandId(created.id);
      setNewBrandName("");
      setIsAddingBrand(false);
    } catch (err: any) {
      if (onError) onError(err.message || "Failed to create brand");
    } finally {
      setLoadingAdd(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
      <h2 className="text-lg font-medium text-gray-900">Product Brand</h2>

      <select
        value={selectedBrandId}
        onChange={(e) => setSelectedBrandId(e.target.value)}
        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="">Select Brand</option>
        {brands.map((brand) => (
          <option key={brand.id} value={brand.id}>
            {brand.name}
          </option>
        ))}
      </select>

      {isAddingBrand ? (
        <div className="space-y-2 pt-2 border-t border-gray-100">
          <input
            type="text"
            value={newBrandName}
            onChange={(e) => setNewBrandName(e.target.value)}
            placeholder="New brand name..."
            className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleCreateBrandInline();
              }
            }}
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={loadingAdd}
              onClick={handleCreateBrandInline}
              className="px-3 py-1 bg-blue-600 text-white rounded-md text-xs font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {loadingAdd ? "Adding..." : "Add"}
            </button>
            <button
              type="button"
              onClick={() => setIsAddingBrand(false)}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md text-xs font-medium hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsAddingBrand(true)}
          className="text-xs text-blue-600 font-medium hover:underline inline-flex items-center gap-1"
        >
          <Plus className="h-3 w-3" /> + Add new brand
        </button>
      )}
    </div>
  );
}