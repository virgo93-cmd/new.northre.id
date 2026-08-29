"use client";

import { useState, useEffect } from "react";
import { Loader2, Save, Megaphone } from "lucide-react";
import { getAnnouncement, updateAnnouncement, Announcement } from "@/modules/storefront-cms/announcement.service";

export default function StorefrontAnnouncementPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState<Announcement>({
    content: "",
    link_url: "",
    is_active: true,
    background_color: "#2563eb",
    text_color: "#ffffff",
  });

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await getAnnouncement();
        if (data) {
          setFormData({
            content: data.content || "",
            link_url: data.link_url || "",
            is_active: data.is_active ?? true,
            background_color: data.background_color || "#2563eb",
            text_color: data.text_color || "#ffffff",
          });
        }
      } catch (err: any) {
        setErrorMsg("Failed to load announcement: " + err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setErrorMsg(null);
      setSuccessMsg(null);

      await updateAnnouncement(formData);
      setSuccessMsg("Announcement updated successfully!");
    } catch (err: any) {
      setErrorMsg("Failed to save announcement: " + err.message);
    } finally {
      setSaving(false);
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
    <form onSubmit={handleSubmit} className="w-full space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">Announcement Bar</h1>
          <p className="text-xs sm:text-sm text-gray-500">Manage top banner text, promotional links, and appearance.</p>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center justify-center px-4 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none disabled:opacity-50 w-full sm:w-auto"
        >
          {saving ? <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" /> : <Save className="-ml-1 mr-2 h-4 w-4" />}
          Save Changes
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

      {/* Preview Section */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
        <h2 className="text-sm font-medium text-gray-700">Live Preview</h2>
        {formData.is_active && formData.content ? (
          <div
            className="p-3 sm:p-4 rounded-lg text-center text-xs sm:text-sm font-medium flex flex-wrap items-center justify-center gap-2 shadow-sm transition-all overflow-hidden break-words"
            style={{ backgroundColor: formData.background_color, color: formData.text_color }}
          >
            <Megaphone className="h-4 w-4 shrink-0" />
            <span className="text-center">{formData.content}</span>
            {formData.link_url && (
              <span className="underline ml-1 text-[11px] sm:text-xs opacity-90 break-all">({formData.link_url})</span>
            )}
          </div>
        ) : (
          <div className="p-4 bg-gray-50 border border-dashed border-gray-200 rounded-lg text-center text-xs text-gray-400">
            Announcement bar is currently inactive or empty.
          </div>
        )}
      </div>

      {/* Form Settings */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h2 className="text-base sm:text-lg font-medium text-gray-900 flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-blue-600 shrink-0" /> Configuration
          </h2>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            <span className="ml-2 sm:ml-3 text-xs sm:text-sm font-medium text-gray-700">Active</span>
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Announcement Text</label>
          <input
            type="text"
            required
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            placeholder="e.g. 🔥 Special Promo: Free Shipping on All Orders!"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Link URL (Optional)</label>
          <input
            type="text"
            value={formData.link_url || ""}
            onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
            placeholder="e.g. /products or https://..."
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Background Color</label>
            <div className="flex items-center gap-3 mt-1">
              <input
                type="color"
                value={formData.background_color}
                onChange={(e) => setFormData({ ...formData, background_color: e.target.value })}
                className="h-10 w-14 p-1 border border-gray-300 rounded-lg cursor-pointer shrink-0"
              />
              <input
                type="text"
                value={formData.background_color}
                onChange={(e) => setFormData({ ...formData, background_color: e.target.value })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm uppercase"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Text Color</label>
            <div className="flex items-center gap-3 mt-1">
              <input
                type="color"
                value={formData.text_color}
                onChange={(e) => setFormData({ ...formData, text_color: e.target.value })}
                className="h-10 w-14 p-1 border border-gray-300 rounded-lg cursor-pointer shrink-0"
              />
              <input
                type="text"
                value={formData.text_color}
                onChange={(e) => setFormData({ ...formData, text_color: e.target.value })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm uppercase"
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}