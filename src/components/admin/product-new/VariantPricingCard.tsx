"use client";

import React, { useState } from "react";
import { Layers } from "lucide-react";

export interface ProductVariantItem {
  key: string;
  name: string;
  regular_price: string;
  sale_price: string;
  stock_quantity: string;
  is_active: boolean;
}

interface VariantPricingCardProps {
  variants: ProductVariantItem[];
  setVariants: React.Dispatch<React.SetStateAction<ProductVariantItem[]>>;
}

export default function VariantPricingCard({
  variants,
  setVariants,
}: VariantPricingCardProps) {
  const [globalRegularPrice, setGlobalRegularPrice] = useState("");
  const [globalSalePrice, setGlobalSalePrice] = useState("");
  const [globalStock, setGlobalStock] = useState("");

  const handleApplyGlobalSettings = () => {
    if (!globalRegularPrice && !globalSalePrice && !globalStock) return;
    setVariants((prev) =>
      prev.map((v) => ({
        ...v,
        regular_price: globalRegularPrice !== "" ? globalRegularPrice : v.regular_price,
        sale_price: globalSalePrice !== "" ? globalSalePrice : v.sale_price,
        stock_quantity: globalStock !== "" ? globalStock : v.stock_quantity,
      }))
    );
  };

  const handleToggleAll = (status: boolean) => {
    setVariants((prev) => prev.map((v) => ({ ...v, is_active: status })));
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-200 bg-blue-50/25 space-y-4">
      <div className="flex items-center justify-between border-b border-blue-200 pb-3">
        <div>
          <h2 className="text-lg font-medium text-gray-900 flex items-center gap-2">
            <Layers className="h-5 w-5 text-blue-600" /> Variant Pricing & Setup
          </h2>
          <p className="text-xs text-gray-600">
            Set price, stock quantity, and active status for each generated variant.
          </p>
        </div>
        {variants.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleToggleAll(true)}
              className="text-xs text-blue-600 hover:underline font-medium"
            >
              Enable All
            </button>
            <span className="text-gray-300">|</span>
            <button
              type="button"
              onClick={() => handleToggleAll(false)}
              className="text-xs text-gray-500 hover:underline font-medium"
            >
              Disable All
            </button>
          </div>
        )}
      </div>

      {/* Global Bulk Update Form */}
      <div className="p-4 bg-white rounded-lg border border-gray-200 space-y-3">
        <span className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
          Quick Bulk Update (Apply to All Variants)
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Regular Price (Rp)
            </label>
            <input
              type="number"
              value={globalRegularPrice}
              onChange={(e) => setGlobalRegularPrice(e.target.value)}
              placeholder="e.g. 150000"
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Sale Price (Rp)
            </label>
            <input
              type="number"
              value={globalSalePrice}
              onChange={(e) => setGlobalSalePrice(e.target.value)}
              placeholder="e.g. 120000"
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Stock Quantity
            </label>
            <input
              type="number"
              value={globalStock}
              onChange={(e) => setGlobalStock(e.target.value)}
              placeholder="e.g. 50"
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <button
            type="button"
            onClick={handleApplyGlobalSettings}
            className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
          >
            Apply to All
          </button>
        </div>
      </div>

      {/* Variant List Table */}
      {variants.length === 0 ? (
        <div className="text-sm text-gray-500 text-center py-6 bg-white rounded-lg border border-dashed border-gray-300">
          Select attributes and values above to generate variant combinations.
        </div>
      ) : (
        <div className="space-y-3">
          {variants.map((variant, idx) => (
            <div
              key={variant.key}
              className={`flex flex-col lg:flex-row lg:items-center justify-between p-3.5 bg-white rounded-lg border transition shadow-sm gap-3 ${
                variant.is_active ? "border-gray-200" : "border-gray-200 bg-gray-50 opacity-60"
              }`}
            >
              {/* Toggle ON/OFF & Variant Name */}
              <div className="flex items-center gap-3 lg:w-1/4">
                <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={variant.is_active}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setVariants((prev) =>
                        prev.map((v, i) => (i === idx ? { ...v, is_active: checked } : v))
                      );
                    }}
                  />
                  <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
                <div>
                  <span className={`font-medium text-sm block ${variant.is_active ? "text-gray-800" : "text-gray-400 line-through"}`}>
                    {variant.name}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {variant.is_active ? "Active" : "Disabled"}
                  </span>
                </div>
              </div>

              {/* Input Prices & Stock */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 lg:w-3/4">
                {/* Regular Price */}
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 text-gray-400 text-xs">
                    Rp
                  </span>
                  <input
                    type="number"
                    disabled={!variant.is_active}
                    placeholder="Regular Price *"
                    value={variant.regular_price}
                    onChange={(e) => {
                      const val = e.target.value;
                      setVariants((prev) =>
                        prev.map((v, i) => (i === idx ? { ...v, regular_price: val } : v))
                      );
                    }}
                    className="block w-full pl-8 pr-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Sale Price */}
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 text-gray-400 text-xs">
                    Rp
                  </span>
                  <input
                    type="number"
                    disabled={!variant.is_active}
                    placeholder="Sale Price (Opt)"
                    value={variant.sale_price}
                    onChange={(e) => {
                      const val = e.target.value;
                      setVariants((prev) =>
                        prev.map((v, i) => (i === idx ? { ...v, sale_price: val } : v))
                      );
                    }}
                    className="block w-full pl-8 pr-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Stock Quantity */}
                <div>
                  <input
                    type="number"
                    disabled={!variant.is_active}
                    placeholder="Stock Qty (e.g. 10)"
                    value={variant.stock_quantity}
                    onChange={(e) => {
                      const val = e.target.value;
                      setVariants((prev) =>
                        prev.map((v, i) => (i === idx ? { ...v, stock_quantity: val } : v))
                      );
                    }}
                    className="block w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}