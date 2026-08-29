"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Loader2,
  Search,
  ShoppingBag,
  Eye,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  CreditCard,
  X,
  Package,
} from "lucide-react";
import {
  getOrders,
  updateOrderStatus,
  updatePaymentStatus,
  updateShippingTracking,
  Order,
  OrderStatus,
  PaymentStatus,
} from "@/modules/orders/orders.service";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [paymentFilter, setPaymentFilter] = useState<PaymentStatus | "all">("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [trackingForm, setTrackingForm] = useState({
    shipping_courier: "",
    shipping_tracking_number: "",
  });
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getOrders({
        search,
        status: statusFilter,
        payment_status: paymentFilter,
        page,
        limit: 10,
      });
      setOrders(res.data);
      setTotalPages(res.totalPages);
      setTotalCount(res.count);
    } catch (err: any) {
      console.error("Failed to load orders:", err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, paymentFilter, page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOrders();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchOrders]);

  const handleOpenDetail = (order: Order) => {
    setSelectedOrder(order);
    setTrackingForm({
      shipping_courier: order.shipping_courier || "",
      shipping_tracking_number: order.shipping_tracking_number || "",
    });
    setSuccessMsg(null);
    setErrorMsg(null);
  };

  const handleStatusChange = async (newStatus: OrderStatus) => {
    if (!selectedOrder?.id) return;
    try {
      setUpdating(true);
      setErrorMsg(null);
      const updated = await updateOrderStatus(selectedOrder.id, newStatus);
      if (updated) {
        setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
        setSuccessMsg(`Order status updated to ${newStatus}`);
        fetchOrders();
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handlePaymentStatusChange = async (newPaymentStatus: PaymentStatus) => {
    if (!selectedOrder?.id) return;
    try {
      setUpdating(true);
      setErrorMsg(null);
      const updated = await updatePaymentStatus(selectedOrder.id, newPaymentStatus);
      if (updated) {
        setSelectedOrder((prev) => (prev ? { ...prev, payment_status: newPaymentStatus } : null));
        setSuccessMsg(`Payment status updated to ${newPaymentStatus}`);
        fetchOrders();
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveTracking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder?.id) return;
    try {
      setUpdating(true);
      setErrorMsg(null);
      const updated = await updateShippingTracking(selectedOrder.id, trackingForm);
      if (updated) {
        setSelectedOrder((prev) =>
          prev
            ? {
                ...prev,
                shipping_courier: trackingForm.shipping_courier,
                shipping_tracking_number: trackingForm.shipping_tracking_number,
              }
            : null
        );
        setSuccessMsg("Tracking details updated successfully");
        fetchOrders();
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "pending":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200"><Clock className="h-3 w-3" /> Pending</span>;
      case "processing":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200"><AlertCircle className="h-3 w-3" /> Processing</span>;
      case "shipped":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200"><Truck className="h-3 w-3" /> Shipped</span>;
      case "delivered":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200"><CheckCircle2 className="h-3 w-3" /> Delivered</span>;
      case "cancelled":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200"><XCircle className="h-3 w-3" /> Cancelled</span>;
      case "refunded":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200"><CreditCard className="h-3 w-3" /> Refunded</span>;
    }
  };

  const getPaymentBadge = (status: PaymentStatus) => {
    switch (status) {
      case "paid":
        return <span className="inline-flex px-2 py-0.5 rounded text-[11px] font-bold bg-green-100 text-green-800">PAID</span>;
      case "unpaid":
        return <span className="inline-flex px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800">UNPAID</span>;
      case "failed":
        return <span className="inline-flex px-2 py-0.5 rounded text-[11px] font-bold bg-red-100 text-red-800">FAILED</span>;
      case "refunded":
        return <span className="inline-flex px-2 py-0.5 rounded text-[11px] font-bold bg-gray-100 text-gray-800">REFUNDED</span>;
    }
  };

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">Orders</h1>
          <p className="text-xs sm:text-sm text-gray-500">Manage orders, track fulfillment, and view shipments.</p>
        </div>
        <div className="text-xs sm:text-sm text-gray-600 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg w-fit">
          Total: <span className="font-semibold text-gray-900">{totalCount}</span> Orders
        </div>
      </div>

      {/* Filter & Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search Order No, Customer, Email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as any);
            setPage(1);
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All Order Status</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
          <option value="refunded">Refunded</option>
        </select>

        <select
          value={paymentFilter}
          onChange={(e) => {
            setPaymentFilter(e.target.value as any);
            setPage(1);
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All Payment Status</option>
          <option value="unpaid">Unpaid</option>
          <option value="paid">Paid</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center min-h-[300px]">
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="px-6 py-16 text-center text-sm text-gray-500">
            <ShoppingBag className="mx-auto h-10 w-10 text-gray-300 mb-2" />
            No orders found matching the filter criteria.
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order No.</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-mono font-semibold text-gray-900">{order.order_number}</td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{order.customer_name}</div>
                        <div className="text-xs text-gray-400">{order.customer_phone}</div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-900">
                        Rp {Number(order.total_amount).toLocaleString("id-ID")}
                      </td>
                      <td className="px-6 py-4">
                        {getPaymentBadge(order.payment_status)}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleOpenDetail(order)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-semibold transition-colors"
                        >
                          <Eye className="h-3.5 w-3.5" /> Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-gray-100">
              {orders.map((order) => (
                <div key={order.id} className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-mono font-bold text-xs text-gray-900">{order.order_number}</div>
                      <div className="text-xs text-gray-600 mt-1">{order.customer_name} ({order.customer_phone})</div>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-gray-900">Rp {Number(order.total_amount).toLocaleString("id-ID")}</span>
                    {getPaymentBadge(order.payment_status)}
                  </div>
                  <button
                    onClick={() => handleOpenDetail(order)}
                    className="w-full py-2 bg-blue-50 text-blue-600 text-xs font-semibold rounded-lg flex items-center justify-center gap-1"
                  >
                    <Eye className="h-3.5 w-3.5" /> View Details
                  </button>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50 text-xs">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 border border-gray-300 rounded bg-white disabled:opacity-50"
                >
                  Previous
                </button>
                <span>Page {page} of {totalPages}</span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="px-3 py-1.5 border border-gray-300 rounded bg-white disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal Detail */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-4 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto my-auto">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h2 className="text-base font-bold text-gray-900">Order #{selectedOrder.order_number}</h2>
                <p className="text-xs text-gray-400">
                  Placed on: {selectedOrder.created_at ? new Date(selectedOrder.created_at).toLocaleString("en-US") : "-"}
                </p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            {successMsg && <div className="p-3 bg-green-50 text-green-700 text-xs rounded-lg">{successMsg}</div>}
            {errorMsg && <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg">{errorMsg}</div>}

            {/* Status Control */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-gray-50 p-3 rounded-lg text-xs">
              <div>
                <label className="block font-medium text-gray-700 mb-1">Order Status</label>
                <select
                  disabled={updating}
                  value={selectedOrder.status}
                  onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
                  className="w-full p-2 border border-gray-300 rounded bg-white"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>
              <div>
                <label className="block font-medium text-gray-700 mb-1">Payment Status</label>
                <select
                  disabled={updating}
                  value={selectedOrder.payment_status}
                  onChange={(e) => handlePaymentStatusChange(e.target.value as PaymentStatus)}
                  className="w-full p-2 border border-gray-300 rounded bg-white"
                >
                  <option value="unpaid">Unpaid</option>
                  <option value="paid">Paid</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>
            </div>

            {/* Tracking Form */}
            <form onSubmit={handleSaveTracking} className="space-y-2 bg-blue-50/50 p-3 rounded-lg border border-blue-100 text-xs">
              <span className="font-semibold text-blue-900 flex items-center gap-1">
                <Truck className="h-3.5 w-3.5 text-blue-600" /> Shipping & Tracking Info
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Courier (e.g. JNE, DHL, FedEx)"
                  value={trackingForm.shipping_courier}
                  onChange={(e) => setTrackingForm({ ...trackingForm, shipping_courier: e.target.value })}
                  className="p-2 border border-gray-300 rounded bg-white"
                />
                <input
                  type="text"
                  placeholder="Tracking / Waybill Number"
                  value={trackingForm.shipping_tracking_number}
                  onChange={(e) => setTrackingForm({ ...trackingForm, shipping_tracking_number: e.target.value })}
                  className="p-2 border border-gray-300 rounded bg-white font-mono"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={updating}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-semibold disabled:opacity-50"
                >
                  {updating ? "Saving..." : "Save Tracking"}
                </button>
              </div>
            </form>

            {/* Customer & Shipping Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <h4 className="font-bold text-gray-900 uppercase">Customer Details</h4>
                <p className="text-gray-600"><span className="text-gray-400">Name:</span> {selectedOrder.customer_name}</p>
                <p className="text-gray-600"><span className="text-gray-400">Email:</span> {selectedOrder.customer_email}</p>
                <p className="text-gray-600"><span className="text-gray-400">Phone:</span> {selectedOrder.customer_phone}</p>
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-gray-900 uppercase">Shipping Address</h4>
                <p className="text-gray-600">{selectedOrder.shipping_address}</p>
                <p className="text-gray-500">{[selectedOrder.shipping_city, selectedOrder.shipping_province, selectedOrder.shipping_postal_code].filter(Boolean).join(", ")}</p>
              </div>
            </div>

            {/* Ordered Items */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-gray-800">Ordered Items ({selectedOrder.order_items?.length || 0})</span>
              <div className="border border-gray-200 rounded-lg divide-y divide-gray-100 text-xs">
                {(selectedOrder.order_items || []).map((item) => (
                  <div key={item.id} className="p-3 flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-gray-900">{item.product_name}</div>
                      <div className="text-gray-400">Rp {Number(item.unit_price).toLocaleString("id-ID")} x {item.quantity}</div>
                    </div>
                    <div className="font-bold text-gray-900">Rp {Number(item.subtotal).toLocaleString("id-ID")}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="bg-gray-50 p-4 rounded-xl space-y-1.5 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span>Rp {Number(selectedOrder.subtotal).toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping Cost:</span>
                <span>Rp {Number(selectedOrder.shipping_cost).toLocaleString("id-ID")}</span>
              </div>
              {Number(selectedOrder.discount_amount) > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount:</span>
                  <span>- Rp {Number(selectedOrder.discount_amount).toLocaleString("id-ID")}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-gray-900 pt-2 border-t border-gray-200">
                <span>Total Amount:</span>
                <span className="text-blue-600">Rp {Number(selectedOrder.total_amount).toLocaleString("id-ID")}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}