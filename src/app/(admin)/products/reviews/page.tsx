"use client";

import { useEffect, useState } from "react";
import { Star, Trash2, CheckCircle, Clock, ShieldAlert, MessageSquare, Loader2 } from "lucide-react";
import { getReviews, updateReviewStatus, deleteReview } from "@/modules/products/review.service";
import { Review } from "@/types";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const data = await getReviews();
      setReviews(data);
    } catch (err) {
      console.error("Failed to load reviews", err);
      setErrorMsg("Failed to load product reviews.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    queueMicrotask(() => void loadData());
  }, []);

  const handleStatusChange = async (id: string, status: "approved" | "pending" | "spam") => {
    try {
      setActionLoading(id);
      await updateReviewStatus(id, status);
      loadData();
    } catch (err: any) {
      alert("Failed to update status: " + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    try {
      setActionLoading(id);
      await deleteReview(id);
      loadData();
    } catch (err: any) {
      alert("Failed to delete review: " + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Product Reviews</h1>
        <p className="text-sm text-gray-500">Manage customer feedback, ratings, and moderate product reviews.</p>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {errorMsg}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author & Product</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Review</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-500">Loading reviews...</td>
                </tr>
              ) : reviews.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-500">
                    <MessageSquare className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                    No reviews found.
                  </td>
                </tr>
              ) : (
                reviews.map((review) => (
                  <tr key={review.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {review.profiles?.full_name || review.profiles?.email || "Anonymous User"}
                      </div>
                      <div className="text-xs text-gray-500">
                        Product: <span className="font-medium text-gray-700">{review.products?.name || "Unknown Product"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-amber-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${i < review.rating ? "fill-current" : "text-gray-200"}`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-400 mt-0.5 block">{review.rating} out of 5 stars</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                      {review.comment || <span className="italic text-gray-400">No comment provided</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        review.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : review.status === "spam"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {review.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      {actionLoading === review.id ? (
                        <Loader2 className="inline h-4 w-4 animate-spin text-gray-400" />
                      ) : (
                        <>
                          {review.status !== "approved" && (
                            <button
                              onClick={() => handleStatusChange(review.id, "approved")}
                              title="Approve Review"
                              className="text-green-600 hover:text-green-900"
                            >
                              <CheckCircle className="h-4 w-4 inline" />
                            </button>
                          )}
                          {review.status !== "spam" && (
                            <button
                              onClick={() => handleStatusChange(review.id, "spam")}
                              title="Mark as Spam"
                              className="text-amber-600 hover:text-amber-900"
                            >
                              <ShieldAlert className="h-4 w-4 inline" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(review.id)}
                            title="Delete Review"
                            className="text-gray-400 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4 inline" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
