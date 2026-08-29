"use client";

import React, { useState } from "react";
import { Tag as TagIcon } from "lucide-react";
import { Attribute } from "@/types";
import { addAttributeTerm } from "@/modules/products/attribute.service";

interface SelectedAttribute {
  attributeId: string;
  terms: string[];
}

interface AttributesSectionProps {
  attributesList: Attribute[];
  setAttributesList: React.Dispatch<React.SetStateAction<Attribute[]>>;
  selectedAttributes: SelectedAttribute[];
  setSelectedAttributes: React.Dispatch<React.SetStateAction<SelectedAttribute[]>>;
  onError?: (msg: string) => void;
}

export default function AttributesSection({
  attributesList,
  setAttributesList,
  selectedAttributes,
  setSelectedAttributes,
  onError,
}: AttributesSectionProps) {
  const [newTermInputs, setNewTermInputs] = useState<{ [attributeId: string]: string }>({});

  const handleAddInlineTerm = async (attributeId: string) => {
    const termName = newTermInputs[attributeId];
    if (!termName || !termName.trim()) return;

    try {
      const termSlug = termName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const newTerm = await addAttributeTerm(attributeId, termName.trim(), termSlug);

      // Update state metadata attributesList
      setAttributesList((prev) =>
        prev.map((attr) => {
          if (attr.id === attributeId) {
            return {
              ...attr,
              terms: [...(attr.terms || []), newTerm],
            };
          }
          return attr;
        })
      );

      // Otomatis pilih term baru tersebut
      setSelectedAttributes((prev) =>
        prev.map((item) => {
          if (item.attributeId === attributeId) {
            return {
              ...item,
              terms: [...item.terms, newTerm.id],
            };
          }
          return item;
        })
      );

      // Reset input
      setNewTermInputs((prev) => ({ ...prev, [attributeId]: "" }));
    } catch (err: any) {
      if (onError) onError("Failed to add attribute value: " + err.message);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
      <div className="flex items-center justify-between border-b border-gray-200 pb-3">
        <div>
          <h2 className="text-lg font-medium text-gray-900 flex items-center gap-2">
            <TagIcon className="h-5 w-5 text-gray-500" /> Product Attributes
          </h2>
          <p className="text-xs text-gray-500">
            Configure product specifications (e.g. Material, Color). For Variable products, these will generate your variants.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Dropdown Add Attribute */}
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
          <label className="block text-sm font-medium text-gray-700">Add Attribute</label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-blue-500 focus:border-blue-500"
            defaultValue=""
            onChange={(e) => {
              const attrId = e.target.value;
              if (!attrId) return;
              if (!selectedAttributes.some((a) => a.attributeId === attrId)) {
                setSelectedAttributes([...selectedAttributes, { attributeId: attrId, terms: [] }]);
              }
              e.target.value = "";
            }}
          >
            <option value="" disabled>-- Choose Attribute --</option>
            {attributesList.map((attr) => (
              <option key={attr.id} value={attr.id}>
                {attr.name}
              </option>
            ))}
          </select>
        </div>

        {/* Selected Attributes List */}
        {selectedAttributes.map((item, idx) => {
          const currentAttr = attributesList.find((a) => a.id === item.attributeId);
          if (!currentAttr) return null;

          return (
            <div key={item.attributeId} className="p-4 bg-white rounded-lg border border-gray-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm text-gray-900">{currentAttr.name}</span>
                <button
                  type="button"
                  onClick={() => setSelectedAttributes((prev) => prev.filter((_, i) => i !== idx))}
                  className="text-xs text-red-600 hover:underline"
                >
                  Remove Attribute
                </button>
              </div>

              {/* Term Badges Selection */}
              <div className="flex flex-wrap gap-2">
                {currentAttr.terms?.map((term) => {
                  const isSelected = item.terms.includes(term.id);
                  return (
                    <button
                      key={term.id}
                      type="button"
                      onClick={() => {
                        const updatedTerms = isSelected
                          ? item.terms.filter((id) => id !== term.id)
                          : [...item.terms, term.id];
                        setSelectedAttributes((prev) =>
                          prev.map((a, i) => (i === idx ? { ...a, terms: updatedTerms } : a))
                        );
                      }}
                      className={`px-3 py-1 rounded-md text-xs font-medium border transition ${
                        isSelected
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100"
                      }`}
                    >
                      {term.name}
                    </button>
                  );
                })}
              </div>

              {/* Inline Add New Term Input */}
              <div className="pt-2 flex items-center gap-2">
                <input
                  type="text"
                  placeholder={`Add new ${currentAttr.name} value (e.g. XL, Blue)...`}
                  value={newTermInputs[currentAttr.id] || ""}
                  onChange={(e) =>
                    setNewTermInputs((prev) => ({ ...prev, [currentAttr.id]: e.target.value }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddInlineTerm(currentAttr.id);
                    }
                  }}
                  className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => handleAddInlineTerm(currentAttr.id)}
                  className="px-3 py-1.5 bg-gray-900 text-white rounded-lg text-xs font-medium hover:bg-gray-800 transition"
                >
                  Add Value
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}