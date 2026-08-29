"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import Link from "next/link";
import { Plus, Search, Filter, Package, Edit, Trash2, Loader2, ArrowUpDown, ChevronDown } from "lucide-react";
import { getProducts, deleteProduct } from "@/modules/products/product.service";
import { getCategories } from "@/modules/products/category.service";
import { Category } from "@/types";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); 
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("newest");
  
  // UI States
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Custom Delete Modal States
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string; name: string }>({
    isOpen: false,
    id: "",
    name: ""
  });

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [prodData, catData] = await Promise.all([
          getProducts(),
          getCategories()
        ]);
        setProducts(prodData || []);
        setCategories(catData || []);
      } catch (error) {
        console.error("Failed to load products", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Menutup dropdown kategori jika klik di luar elemen
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCategoryOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Trigger untuk membuka modal delete
  const handleDeleteClick = (id: string, name: string) => {
    setDeleteModal({ isOpen: true, id, name });
  };

  // Eksekusi hapus produk
  const confirmDelete = async () => {
    const { id } = deleteModal;
    if (!id) return;
    
    try {
      setDeletingId(id);
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setDeleteModal({ isOpen: false, id: "", name: "" }); // Tutup modal
    } catch (error: any) {
      alert("Failed to delete product: " + error.message);
    } finally {
      setDeletingId(null);
    }
  };

  const toggleCategory = (id: string) => {
    setSelectedCategoryIds(prev => 
      prev.includes(id) ? prev.filter(cId => cId !== id) : [...prev, id]
    );
  };

  // Render Kategori (Badge Style)
  const renderCategory = (product: any) => {
    if (!product.category) return <span className="italic text-gray-400 text-xs">Uncategorized</span>;
    
    const catName = product.category.name;
    const parentName = product.category.parent?.name;
    
    if (parentName) {
      return (
        <span className="inline-flex items-center gap-1.5">
          <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase">
            {parentName}
          </span>
          <span className="text-gray-300">/</span>
          <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-medium">
            {catName}
          </span>
        </span>
      );
    }
    return (
      <span className="inline-flex bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-medium">
        {catName}
      </span>
    );
  };

  // Grup Kategori untuk Dropdown
  const parentCategories = categories.filter(c => !c.parent_id);
  const getChildren = (parentId: string) => categories.filter(c => c.parent_id === parentId);

  // Proses Filter & Sorting
  const processedProducts = useMemo(() => {
    let result = [...products];

    if (searchTerm) {
      const lowerQuery = searchTerm.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(lowerQuery) || 
        (p.sku && p.sku.toLowerCase().includes(lowerQuery))
      );
    }

    if (statusFilter !== "all") {
      result = result.filter(p => p.status === statusFilter);
    }

    if (selectedCategoryIds.length > 0) {
      result = result.filter(p => {
        const catId = p.category_id;
        const parentId = p.category?.parent?.id;
        return selectedCategoryIds.includes(catId) || (parentId && selectedCategoryIds.includes(parentId));
      });
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case "oldest":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case "best_selling":
          return (b.total_orders || 0) - (a.total_orders || 0);
        case "price_asc":
          return (a.sale_price || a.regular_price || 0) - (b.sale_price || b.regular_price || 0);
        case "price_desc":
          return (b.sale_price || b.regular_price || 0) - (a.sale_price || a.regular_price || 0);
        default:
          return 0;
      }
    });

    return result;
  }, [products, searchTerm, statusFilter, selectedCategoryIds, sortBy]);

  return (
    <div className="space-y-6">
      {/* Header & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Products</h1>
          <p className="text-sm text-gray-500">Manage your store products, pricing, and inventory.</p>
        </div>
        <Link
          href="/products/new"
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none transition"
        >
          <Plus className="-ml-1 mr-2 h-4 w-4" />
          Add New Product
        </Link>
      </div>

      {/* Advanced Filters Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search products by name or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex flex-wrap lg:flex-nowrap items-center gap-3 w-full lg:w-auto">
            {/* Custom Multi-Select Category Dropdown */}
            <div className="relative w-full sm:w-auto" ref={dropdownRef}>
              <button
                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                className="flex items-center justify-between w-full sm:w-auto min-w-[170px] pl-3 pr-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <div className="flex items-center">
                  <Filter className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="font-medium mr-2">Categories</span>
                  {selectedCategoryIds.length > 0 && (
                    <span className="bg-blue-100 text-blue-700 py-0.5 px-2 rounded-full text-xs font-bold">
                      {selectedCategoryIds.length}
                    </span>
                  )}
                </div>
                <ChevronDown className="h-4 w-4 text-gray-400 ml-2" />
              </button>

              {isCategoryOpen && (
                <div className="absolute z-20 mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-xl py-2 max-h-80 overflow-y-auto right-0 lg:left-0">
                  <div className="px-4 pb-2 mb-2 border-b border-gray-100 flex justify-between items-center">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Filter by Category</span>
                    {selectedCategoryIds.length > 0 && (
                      <button onClick={() => setSelectedCategoryIds([])} className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                        Clear All
                      </button>
                    )}
                  </div>
                  {parentCategories.map(parent => (
                    <div key={parent.id} className="px-2 py-1">
                      <label className="flex items-center px-2 py-1.5 hover:bg-gray-50 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4 mr-3"
                          checked={selectedCategoryIds.includes(parent.id)}
                          onChange={() => toggleCategory(parent.id)}
                        />
                        <span className="text-sm font-semibold text-gray-800">{parent.name}</span>
                      </label>
                      {/* Render Children */}
                      {getChildren(parent.id).map(child => (
                        <label key={child.id} className="flex items-center px-2 py-1.5 ml-7 hover:bg-gray-50 rounded cursor-pointer">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4 mr-3"
                            checked={selectedCategoryIds.includes(child.id)}
                            onChange={() => toggleCategory(child.id)}
                          />
                          <span className="text-sm text-gray-600">{child.name}</span>
                        </label>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="relative flex items-center bg-white border border-gray-300 rounded-lg overflow-hidden w-full sm:w-auto">
              <div className="pl-3 py-2 flex items-center pointer-events-none border-r border-gray-200 bg-gray-50">
                <ArrowUpDown className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-sm text-gray-600 font-medium mr-2">Sort:</span>
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="pl-3 pr-8 py-2 text-sm text-gray-700 bg-white border-none focus:ring-0 cursor-pointer outline-none w-full"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="best_selling">Best Selling</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-2 pl-3 pr-8 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer w-full sm:w-auto"
            >
              <option value="all">All Status</option>
              <option value="publish">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product & Category
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SKU
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Orders
                </th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-500">
                    <Loader2 className="mx-auto h-6 w-6 text-blue-600 animate-spin mb-2" />
                    Loading product database...
                  </td>
                </tr>
              ) : processedProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-500">
                    <Package className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                    No products found matching your filters.
                  </td>
                </tr>
              ) : (
                processedProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    
                    {/* Product Name & Category Combined */}
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-14 w-14 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 flex items-center justify-center">
                          {product.image_url ? (
                            <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
                          ) : (
                            <Package className="h-6 w-6 text-gray-400" />
                          )}
                        </div>
                        <div className="ml-4 max-w-[250px] lg:max-w-[350px]">
                          <div className="text-sm font-bold text-gray-900 truncate" title={product.name}>
                            {product.name}
                          </div>
                          <div className="flex flex-wrap items-center gap-2 mt-1.5">
                            {renderCategory(product)}
                            {/* Tambahan Tipe Produk */}
                            <span className="inline-flex items-center bg-gray-50 text-gray-500 border border-gray-200 px-1.5 py-0.5 rounded text-[10px] font-medium capitalize tracking-wide">
                              {product.type || "simple"} Product
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    {/* SKU */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.sku || "—"}
                    </td>

                    {/* Price */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="font-medium text-gray-900">
                        Rp {product.regular_price?.toLocaleString("id-ID")}
                      </div>
                      {product.sale_price && (
                        <div className="text-xs text-red-600 font-medium mt-0.5">
                          Sale: Rp {product.sale_price.toLocaleString("id-ID")}
                        </div>
                      )}
                    </td>

                    {/* Stock */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${
                        product.stock_status === "instock" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}>
                        {product.stock_status === "instock" ? `In Stock (${product.stock_quantity ?? 0})` : "Out of Stock"}
                      </span>
                    </td>

                    {/* Orders */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900 font-bold">
                      {product.total_orders || 0}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                      <span className={`inline-flex px-2.5 py-0.5 text-xs font-medium rounded-md ${
                        product.status === "publish" ? "bg-blue-50 text-blue-700 border border-blue-200" : 
                        "bg-gray-100 text-gray-700 border border-gray-200"
                      }`}>
                        {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-3">
                        <Link href={`/products/${product.id}/edit`} className="text-gray-500 hover:text-blue-600 bg-white p-2 rounded-md shadow-sm border border-gray-200 hover:border-blue-300 transition">
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button 
                          onClick={() => handleDeleteClick(product.id, product.name)}
                          className="text-gray-500 hover:text-red-600 hover:border-red-300 bg-white p-2 rounded-md shadow-sm border border-gray-200 transition"
                          title="Delete Product"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- CUSTOM DELETE MODAL --- */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-gray-900/50 backdrop-blur-sm p-4 sm:p-0">
          <div className="relative w-full max-w-md transform overflow-hidden rounded-xl bg-white text-left align-middle shadow-2xl transition-all">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-center text-gray-900 mb-2">Delete Product</h3>
              <p className="text-sm text-center text-gray-500">
                Are you sure you want to delete <span className="font-semibold text-gray-800">"{deleteModal.name}"</span>? 
                This action cannot be undone.
              </p>
            </div>
            
            <div className="bg-gray-50 px-6 py-4 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 gap-3 sm:gap-0">
              <button
                type="button"
                onClick={() => setDeleteModal({ isOpen: false, id: "", name: "" })}
                disabled={deletingId !== null}
                className="w-full sm:w-auto inline-flex justify-center items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deletingId !== null}
                className="w-full sm:w-auto inline-flex justify-center items-center rounded-lg border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {deletingId !== null ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete Product"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}