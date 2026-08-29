"use client";

import React from "react";
import { StockStatus } from "@/types";

interface SimplePricingCardProps {
  regularPrice: string;
  setRegularPrice: (val: string) => void;
  salePrice: string;
  setSalePrice: (val: string) => void;
  sku: string;
  setSku: (val: string) => void;
  stockStatus: StockStatus;
  setStockStatus: (val: StockStatus) => void;
  stockQuantity: string;
  setStockQuantity: (val: string) => void;
}

export default function SimplePricingCard({
  regularPrice,
  setRegularPrice,
  salePrice,
  setSalePrice,
  sku,
  setSku,
  stockStatus,
  setStockStatus,
  stockQuantity,
  setStockQuantity,
}: SimplePricingCardProps) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
      <h2 className="text-lg font-medium text-gray-900">
        Pricing & Inventory (Simple Product)
      </h2>

      {/* Pricing Inputs */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Regular Price (Rp) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            required
            value={regularPrice}
            onChange={(e) => setRegularPrice(e.target.value)}
            placeholder="150000"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Sale Price (Rp)
          </label>
          <input
            type="number"
            value={salePrice}
            onChange={(e) => setSalePrice(e.target.value)}
            placeholder="120000"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Inventory Inputs */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">SKU</label>
          <input
            type="text"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            placeholder="PRD-001"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Stock Status
          </label>
          <select
            value={stockStatus}
            onChange={(e) => setStockStatus(e.target.value as StockStatus)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="instock">In Stock</option>
            <option value="outofstock">Out of Stock</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Stock Quantity
          </label>
          <input
            type="number"
            value={stockQuantity}
            onChange={(e) => setStockQuantity(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
    </div>
  );
}