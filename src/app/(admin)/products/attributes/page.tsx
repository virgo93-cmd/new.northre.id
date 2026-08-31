"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, ListTree, Loader2, Tag as TagIcon } from "lucide-react";
import { 
  getAttributes, 
  createAttribute, 
  deleteAttribute, 
  addAttributeTerm, 
  deleteAttributeTerm 
} from "@/modules/products/attribute.service";
import { Attribute, AttributeTerm } from "@/types";

export default function AdminAttributesPage() {
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingAttr, setSubmittingAttr] = useState(false);
  const [submittingTerm, setSubmittingTerm] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form Attribute State
  const [attrName, setAttrName] = useState("");
  const [attrSlug, setAttrSlug] = useState("");

  // Form Term State (per attribute id)
  const [termName, setTermName] = useState<{ [key: string]: string }>({});
  const [termSlug, setTermSlug] = useState<{ [key: string]: string }>({});

  const loadData = async () => {
    try {
      const data = await getAttributes();
      setAttributes(data);
    } catch (err) {
      console.error("Failed to load attributes", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    queueMicrotask(() => void loadData());
  }, []);

  const handleAttrNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setAttrName(val);
    const generatedSlug = val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    setAttrSlug(generatedSlug);
  };

  const handleCreateAttribute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!attrName) return;

    try {
      setSubmittingAttr(true);
      setErrorMsg(null);

      await createAttribute(
        attrName,
        attrSlug || attrName.toLowerCase().replace(/[^a-z0-9]+/g, "-")
      );

      setAttrName("");
      setAttrSlug("");
      loadData();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to create attribute");
    } finally {
      setSubmittingAttr(false);
    }
  };

  const handleDeleteAttribute = async (id: string) => {
    if (!confirm("Are you sure? This will also delete all terms inside this attribute.")) return;
    try {
      await deleteAttribute(id);
      loadData();
    } catch (err: any) {
      alert("Failed to delete attribute: " + err.message);
    }
  };

  const handleCreateTerm = async (attributeId: string, e: React.FormEvent) => {
    e.preventDefault();
    const name = termName[attributeId];
    if (!name) return;

    const slug = termSlug[attributeId] || name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    try {
      setSubmittingTerm(attributeId);
      setErrorMsg(null);

      await addAttributeTerm(attributeId, name, slug);

      setTermName({ ...termName, [attributeId]: "" });
      setTermSlug({ ...termSlug, [attributeId]: "" });
      loadData();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to create term");
    } finally {
      setSubmittingTerm(null);
    }
  };

  const handleDeleteTerm = async (termId: string) => {
    if (!confirm("Delete this term?")) return;
    try {
      await deleteAttributeTerm(termId);
      loadData();
    } catch (err: any) {
      alert("Failed to delete term: " + err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Attributes</h1>
        <p className="text-sm text-gray-500">Manage product attributes like size, color, or material for variable products.</p>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Add Attribute */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Add New Attribute</h2>
          <form onSubmit={handleCreateAttribute} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                required
                value={attrName}
                onChange={handleAttrNameChange}
                placeholder="e.g. Size"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Slug</label>
              <input
                type="text"
                value={attrSlug}
                onChange={(e) => setAttrSlug(e.target.value)}
                placeholder="size"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={submittingAttr}
              className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none disabled:opacity-50"
            >
              {submittingAttr && <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />}
              Add Attribute
            </button>
          </form>
        </div>

        {/* List Attributes & Terms */}
        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <div className="bg-white p-12 text-center text-sm text-gray-500 rounded-xl shadow-sm border border-gray-100">
              Loading attributes...
            </div>
          ) : attributes.length === 0 ? (
            <div className="bg-white p-12 text-center text-sm text-gray-500 rounded-xl shadow-sm border border-gray-100">
              <ListTree className="mx-auto h-12 w-12 text-gray-300 mb-2" />
              No attributes found. Create your first attribute on the left.
            </div>
          ) : (
            attributes.map((attr) => (
              <div key={attr.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">{attr.name}</h3>
                    <p className="text-xs text-gray-500">Slug: {attr.slug}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteAttribute(attr.id)}
                    className="text-gray-400 hover:text-red-600 p-1"
                    title="Delete Attribute"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Terms List & Add Form */}
                <div className="space-y-3">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Terms / Values</div>
                  
                  <div className="flex flex-wrap gap-2">
                    {attr.terms && attr.terms.length > 0 ? (
                      attr.terms.map((term) => (
                        <span
                          key={term.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200"
                        >
                          {term.name}
                          <button
                            onClick={() => handleDeleteTerm(term.id)}
                            className="text-gray-400 hover:text-red-600 ml-1"
                          >
                            &times;
                          </button>
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400 italic">No terms added yet.</span>
                    )}
                  </div>

                  {/* Add Term Form Inline */}
                  <form
                    onSubmit={(e) => handleCreateTerm(attr.id, e)}
                    className="flex gap-2 pt-2"
                  >
                    <input
                      type="text"
                      placeholder="Add term (e.g. XL, Red)"
                      value={termName[attr.id] || ""}
                      onChange={(e) =>
                        setTermName({ ...termName, [attr.id]: e.target.value })
                      }
                      className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                    <button
                      type="submit"
                      disabled={submittingTerm === attr.id}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-lg text-xs font-medium text-white bg-gray-900 hover:bg-gray-800 focus:outline-none disabled:opacity-50"
                    >
                      {submittingTerm === attr.id ? (
                        <Loader2 className="animate-spin h-3 w-3" />
                      ) : (
                        <Plus className="h-3 w-3 mr-1" />
                      )}
                      Add Term
                    </button>
                  </form>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
