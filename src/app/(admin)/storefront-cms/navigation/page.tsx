"use client";

import { useState, useEffect } from "react";
import { Loader2, Plus, Trash2, Edit, Compass, X, Link as LinkIcon, Layers, Lock } from "lucide-react";
import {
  getNavigationItems,
  createNavigationItem,
  updateNavigationItem,
  deleteNavigationItem,
  NavigationItem,
} from "@/modules/storefront-cms/navigation.service";

export default function StorefrontNavigationPage() {
  const [items, setItems] = useState<NavigationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<"header" | "footer">("header");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<NavigationItem>({
    label: "",
    url: "",
    location: "header",
    sort_order: 0,
    is_active: true,
    parent_id: null,
  });

  useEffect(() => {
    loadNavigation();
  }, []);

  async function loadNavigation() {
    try {
      setLoading(true);
      const data = await getNavigationItems();
      setItems(data);
    } catch (err: any) {
      setErrorMsg("Failed to load navigation items: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  const handleOpenCreateModal = () => {
    setEditingId(null);
    const filteredItems = items.filter((i) => i.location === activeTab);
    const nextOrder = filteredItems.length > 0 ? Math.max(...filteredItems.map((i) => i.sort_order || 0)) + 1 : 0;

    setFormData({
      label: "",
      url: "",
      location: activeTab,
      sort_order: nextOrder,
      is_active: true,
      parent_id: null,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: NavigationItem) => {
    setEditingId(item.id || null);
    setFormData({
      label: item.label,
      url: item.url === "#" ? "" : (item.url || ""),
      location: item.location,
      sort_order: item.sort_order ?? 0,
      is_active: item.is_active ?? true,
      parent_id: item.parent_id ?? null,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.label) {
      setErrorMsg("Menu label is required.");
      return;
    }

    try {
      setSaving(true);
      setErrorMsg(null);

      // Jika URL dikosongkan, otomatis set jadi "#" agar valid sebagai parent menu
      const finalUrl = formData.url && formData.url.trim() !== "" ? formData.url : "#";

      const payload = {
        ...formData,
        url: finalUrl,
        parent_id: formData.parent_id === "" ? null : formData.parent_id,
      };

      if (editingId) {
        await updateNavigationItem(editingId, payload);
        setSuccessMsg("Navigation link updated successfully!");
      } else {
        await createNavigationItem(payload);
        setSuccessMsg("Navigation link created successfully!");
      }

      setIsModalOpen(false);
      loadNavigation();
    } catch (err: any) {
      setErrorMsg("Failed to save navigation link: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this navigation link?")) return;
    try {
      setErrorMsg(null);
      await deleteNavigationItem(id);
      setSuccessMsg("Navigation link deleted successfully!");
      loadNavigation();
    } catch (err: any) {
      setErrorMsg("Failed to delete navigation link: " + err.message);
    }
  };

  const currentTabItems = items.filter((i) => i.location === activeTab);

  const potentialParents = items.filter(
    (i) => i.location === activeTab && !i.parent_id && i.id !== editingId
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] w-full">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">Navigation Menus</h1>
          <p className="text-xs sm:text-sm text-gray-500">Manage header navigation and footer quick links for your storefront.</p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center justify-center px-4 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
        >
          <Plus className="-ml-1 mr-2 h-4 w-4" /> Add Menu Link
        </button>
      </div>

      {successMsg && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-green-600">
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {errorMsg}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 overflow-x-auto">
        <nav className="-mb-px flex space-x-6 min-w-max">
          <button
            onClick={() => setActiveTab("header")}
            className={`py-3 px-1 border-b-2 font-medium text-xs sm:text-sm flex items-center gap-2 whitespace-nowrap ${
              activeTab === "header"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <Compass className="h-4 w-4" />
            Header Navigation ({items.filter((i) => i.location === "header").length + (activeTab === "header" ? 1 : 0)})
          </button>
          <button
            onClick={() => setActiveTab("footer")}
            className={`py-3 px-1 border-b-2 font-medium text-xs sm:text-sm flex items-center gap-2 whitespace-nowrap ${
              activeTab === "footer"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <LinkIcon className="h-4 w-4" />
            Footer Links ({items.filter((i) => i.location === "footer").length})
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 bg-amber-50 border-b border-amber-100 flex items-center gap-2 text-xs text-amber-800">
          <Lock className="w-4 h-4 shrink-0 text-amber-600" />
          <span>Menu <strong>CATEGORIES</strong> bersifat otomatis/hardcode dari database produk dan selalu tampil di Drawer Header.</span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Order</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Menu Label</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parent Menu</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destination URL</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {/* Baris Khusus Kategori Hardcode (Hanya muncul di Tab Header) */}
              {activeTab === "header" && (
                <tr className="bg-amber-50/40">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-400">
                    #System
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 flex items-center gap-2">
                    CATEGORIES <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded font-mono">LOCKED</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 italic">
                    Main Menu
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 font-mono italic">
                    Dynamic Database Categories
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className="inline-flex px-2.5 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      Active (System)
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <span className="text-xs text-gray-400 italic">Locked</span>
                  </td>
                </tr>
              )}

              {currentTabItems.map((item) => {
                const parentItem = items.find((i) => i.id === item.parent_id);
                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{item.sort_order}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {item.parent_id ? `— ${item.label}` : item.label}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {parentItem ? (
                        <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-800 px-2 py-0.5 rounded text-xs">
                          <Layers className="w-3 h-3" /> {parentItem.label}
                        </span>
                      ) : (
                        <span className="text-gray-400 italic">Main Menu</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-mono">
                      {item.url === "#" ? <span className="text-gray-400 italic">Parent (No URL)</span> : item.url}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`inline-flex px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                        item.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                      }`}>
                        {item.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(item)}
                          className="text-gray-400 hover:text-blue-600 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => item.id && handleDelete(item.id)}
                          className="text-gray-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-4 sm:p-6 space-y-4 my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 className="text-base sm:text-lg font-bold text-gray-900">
                {editingId ? "Edit Navigation Link" : "Add Navigation Link"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Display Label</label>
                <input
                  type="text"
                  required
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  placeholder="e.g. INFO, CLEARANCE SALE"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Parent Menu (Optional)</label>
                <select
                  value={formData.parent_id || ""}
                  onChange={(e) => setFormData({ ...formData, parent_id: e.target.value ? e.target.value : null })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">— None (This is a Main Menu) —</option>
                  {potentialParents.map((parent) => (
                    <option key={parent.id} value={parent.id}>
                      {parent.label} ({parent.location})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-gray-500 mt-1">Pilih menu induk jika ini adalah sub-menu (dropdown).</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Target URL (Opsional untuk Parent)</label>
                <input
                  type="text"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="Kosongkan jika ini menu utama / parent"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-[11px] text-gray-400 mt-1">Jika dikosongkan, sistem otomatis mengaturnya sebagai menu statis/parent.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Location</label>
                  <select
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value as "header" | "footer" })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="header">Header Nav</option>
                    <option value="footer">Footer Nav</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Sort Order</label>
                  <input
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="nav_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="nav_active" className="text-sm font-medium text-gray-700">
                  Visible on Storefront
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex-1 sm:flex-initial"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 flex-1 sm:flex-initial"
                >
                  {saving && <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />}
                  {editingId ? "Update Link" : "Save Link"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}