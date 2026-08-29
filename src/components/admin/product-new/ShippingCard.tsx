"use client";

import React from "react";
import { Truck } from "lucide-react";

interface ShippingCardProps {
  isFreeShipping: boolean;
  setIsFreeShipping: (val: boolean) => void;
  weight: string;
  setWeight: (val: string) => void;
  length: string;
  setLength: (val: string) => void;
  width: string;
  setWidth: (val: string) => void;
  height: string;
  setHeight: (val: string) => void;
}

export default function ShippingCard({
  isFreeShipping,
  setIsFreeShipping,
  weight,
  setWeight,
  length,
  setLength,
  width,
  setWidth,
  height,
  setHeight,
}: ShippingCardProps) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
      <h2 className="text-lg font-medium text-gray-900 flex items-center gap-2">
        <Truck className="h-5 w-5 text-gray-500" /> Shipping & Logistics
      </h2>
      <p className="text-xs text-gray-500 mb-2">
        Base shipping details used for calculating automated courier rates.
      </p>

      {/* Toggle Free Shipping */}
      <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <div>
          <h3 className="text-sm font-medium text-gray-900">Free Shipping</h3>
          <p className="text-xs text-gray-500">
            Enable free shipping specifically for this product.
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={isFreeShipping}
            onChange={(e) => setIsFreeShipping(e.target.checked)}
          />
          <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
        </label>
      </div>

      {/* Physical Dimensions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Weight (g)
          </label>
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="e.g. 500"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Length (cm)
          </label>
          <input
            type="number"
            value={length}
            onChange={(e) => setLength(e.target.value)}
            placeholder="0"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Width (cm)
          </label>
          <input
            type="number"
            value={width}
            onChange={(e) => setWidth(e.target.value)}
            placeholder="0"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Height (cm)
          </label>
          <input
            type="number"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            placeholder="0"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
    </div>
  );
}