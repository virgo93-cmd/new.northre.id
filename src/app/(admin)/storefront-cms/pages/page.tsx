"use client";

import { useState, useEffect } from "react";
import { Loader2, Plus, Trash2, Edit, FileText, X, ExternalLink } from "lucide-react";
import {
  getStorePages,
  createStorePage,
  updateStorePage,
  deleteStorePage,
  StorePage,
} from "@/modules/storefront-cms/pages.service";
import RichTextEditor from "@/components/admin/RichTextEditor"; // <-- IMPORT COMPONENT LO DI SINI

export default function StorefrontPagesPage() {
  const [pages, setPages] = useState<StorePage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<StorePage, "id" | "created_at" | "updated_at">>({
    title: "",
    slug: "",
    content: "",
    meta_description: "",
    is_published: true,
  });

  useEffect(() => {
    loadPages();
  }, []);

  async function loadPages() {
    try {
      setLoading(true);
      const data = await getStorePages();
      setPages(data);
    } catch (err: any) {
      setErrorMsg("Failed to load storefront pages: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    if (!editingId) {
      setFormData((prev) => ({
        ...prev,
        title,
        slug: slugify(title),
      }));
    } else {
      setFormData((prev) => ({ ...prev, title }));
    }
  };

  const handleOpenCreateModal = () => {
    setEditingId(null);
    setFormData({
      title: "",
      slug: "",
      content: "",
      meta_description: "",
      is_published: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (page: StorePage) => {
    setEditingId(page.id || null);
    setFormData({
      title: page.title,
      slug: page.slug,
      content: page.content || "",
      meta_description: page.meta_description || "",
      is_published: page.is_published ?? true,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.slug) {
      setErrorMsg("Page title and slug are required.");
      return;
    }

    try {
      setSaving(true);
      setErrorMsg(null);

      if (editingId) {
        await updateStorePage(editingId, formData);
        setSuccessMsg("Page updated successfully!");
      } else {
        await createStorePage(formData);
        setSuccessMsg("Page created successfully!");
      }

      setIsModalOpen(false);
      loadPages();
    } catch (err: any) {
      setErrorMsg("Failed to save page: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this custom page?")) return;
    try {
      setErrorMsg(null);
      await deleteStorePage(id);
      setSuccessMsg("Page deleted successfully!");
      loadPages();
    } catch (err: any) {
      setErrorMsg("Failed to delete page: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] w-full">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">Custom Pages</h1>
          <p className="text-xs sm:text-sm text-gray-500">
            Create and manage informational and policy pages (e.g. About Us, Privacy Policy, Terms).
          </p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center justify-center px-4 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 w-full sm:w-auto cursor-pointer"
        >
          <Plus className="-ml-1 mr-2 h-4 w-4" /> Add Page
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

      {/* Pages Container */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {pages.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-gray-500">
            <FileText className="mx-auto h-12 w-12 text-gray-300 mb-2" />
            No custom pages created yet. Click &quot;Add Page&quot; to begin.
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Page Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Public URL</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pages.map((page) => (
                    <tr key={page.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                            <FileText className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900">{page.title}</div>
                            <div className="text-xs text-gray-400 line-clamp-1 max-w-xs">
                              {page.meta_description || "No meta description"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-mono">
                        <a
                          href={`/pages/${page.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 hover:underline"
                        >
                          /pages/{page.slug}
                          <ExternalLink className="h-3.5 w-3.5 text-gray-400" />
                        </a>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          className={`inline-flex px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                            page.is_published ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {page.is_published ? "Published" : "Draft"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditModal(page)}
                            className="text-gray-400 hover:text-blue-600 p-2 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => page.id && handleDelete(page.id)}
                            className="text-gray-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View */}
            <div className="md:hidden divide-y divide-gray-100">
              {pages.map((page) => (
                <div key={page.id} className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 bg-blue-50 text-blue-600 rounded shrink-0">
                        <FileText className="h-4 w-4" />
                      </div>
                      <h3 className="text-sm font-semibold text-gray-900">{page.title}</h3>
                    </div>
                    <span
                      className={`inline-flex px-2 py-0.5 text-[10px] font-semibold rounded-full shrink-0 ${
                        page.is_published ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {page.is_published ? "Published" : "Draft"}
                    </span>
                  </div>

                  {page.meta_description && (
                    <p className="text-xs text-gray-500 line-clamp-2">{page.meta_description}</p>
                  )}

                  <div className="text-xs font-mono text-blue-600 pt-1">
                    <a
                      href={`/pages/${page.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 hover:underline break-all"
                    >
                      /pages/{page.slug}
                      <ExternalLink className="h-3 w-3 text-gray-400 shrink-0" />
                    </a>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-50">
                    <button
                      onClick={() => handleOpenEditModal(page)}
                      className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-blue-600 p-1.5 rounded bg-gray-50 cursor-pointer"
                    >
                      <Edit className="h-3.5 w-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => page.id && handleDelete(page.id)}
                      className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700 p-1.5 rounded bg-red-50 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full p-4 sm:p-6 space-y-4 my-auto max-h-[95vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 className="text-base sm:text-lg font-bold text-gray-900">
                {editingId ? "Edit Custom Page" : "Create New Custom Page"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Page Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={handleTitleChange}
                    placeholder="e.g. Terms of Service"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">URL Slug</label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: slugify(e.target.value) })}
                    placeholder="e.g. terms-of-service"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SEO Meta Description</label>
                <input
                  type="text"
                  value={formData.meta_description}
                  onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                  placeholder="Brief summary for search engine optimization..."
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* MENGGANTI TEXTAREA DENGAN RICH TEXT EDITOR */}
              <div className="pt-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Page Content</label>
                <RichTextEditor
                  value={formData.content}
                  onChange={(val) => setFormData({ ...formData, content: val })}
                  placeholder="Write full page content here..."
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="page_published"
                  checked={formData.is_published}
                  onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                />
                <label htmlFor="page_published" className="text-sm font-medium text-gray-700 cursor-pointer">
                  Published (Visible to public storefront visitors)
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex-1 sm:flex-initial cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center px-6 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 flex-1 sm:flex-initial cursor-pointer"
                >
                  {saving && <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />}
                  {editingId ? "Update Page" : "Save Page"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}