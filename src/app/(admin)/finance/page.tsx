"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Loader2,
  DollarSign,
  Wallet,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Receipt,
  Building2,
  X,
} from "lucide-react";
import {
  getFinancialOverview,
  getWithdrawalRequests,
  getWalletTransactions,
  updateWithdrawalStatus,
  FinancialOverview,
  WithdrawalRequest,
  WalletTransaction,
  WithdrawalStatus,
} from "@/modules/finance/finance.service";

export default function AdminFinancePage() {
  const [overview, setOverview] = useState<FinancialOverview | null>(null);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState<"withdrawals" | "ledger">("withdrawals");

  // Modal / Review state
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<WithdrawalRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadFinanceData = useCallback(async () => {
    try {
      setLoading(true);
      const [overviewData, withdrawalsData, transactionsData] = await Promise.all([
        getFinancialOverview(),
        getWithdrawalRequests(),
        getWalletTransactions(30),
      ]);
      setOverview(overviewData);
      setWithdrawals(withdrawalsData);
      setTransactions(transactionsData);
    } catch (err: any) {
      console.error("Failed to load finance data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFinanceData();
  }, [loadFinanceData]);

  const handleOpenReview = (req: WithdrawalRequest) => {
    setSelectedWithdrawal(req);
    setAdminNotes(req.admin_notes || "");
    setSuccessMsg(null);
    setErrorMsg(null);
  };

  const handleUpdateWithdrawal = async (status: WithdrawalStatus) => {
    if (!selectedWithdrawal?.id) return;
    try {
      setUpdating(true);
      setErrorMsg(null);
      await updateWithdrawalStatus(selectedWithdrawal.id, status, adminNotes);
      setSuccessMsg(`Withdrawal request marked as ${status}.`);
      setSelectedWithdrawal(null);
      loadFinanceData();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update withdrawal request.");
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status: WithdrawalStatus) => {
    switch (status) {
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="h-3 w-3" /> Pending
          </span>
        );
      case "approved":
      case "completed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
            <CheckCircle2 className="h-3 w-3" /> {status.toUpperCase()}
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="h-3 w-3" /> Rejected
          </span>
        );
    }
  };

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">
          Finance & Settlements
        </h1>
        <p className="text-xs sm:text-sm text-gray-500">
          Overview of gross revenue, wallet balances, affiliate commissions, and payout approvals.
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-medium uppercase tracking-wider">Gross Revenue</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-gray-900">
            Rp {Number(overview?.grossRevenue || 0).toLocaleString("id-ID")}
          </div>
          <div className="text-[11px] text-gray-400">Total settled from paid orders</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-medium uppercase tracking-wider">Wallets In Circulation</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <Wallet className="h-4 w-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-gray-900">
            Rp {Number(overview?.totalWalletsBalance || 0).toLocaleString("id-ID")}
          </div>
          <div className="text-[11px] text-gray-400">Total active balance across users</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-medium uppercase tracking-wider">Commissions Paid</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-gray-900">
            Rp {Number(overview?.totalCommissionsPaid || 0).toLocaleString("id-ID")}
          </div>
          <div className="text-[11px] text-gray-400">Affiliate commissions & cashbacks</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-medium uppercase tracking-wider">Pending Payouts</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-gray-900">
            Rp {Number(overview?.pendingWithdrawalsAmount || 0).toLocaleString("id-ID")}
          </div>
          <div className="text-[11px] text-amber-600 font-medium">
            {overview?.pendingWithdrawalsCount || 0} requests awaiting review
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab("withdrawals")}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === "withdrawals"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Withdrawal Requests ({withdrawals.length})
        </button>
        <button
          onClick={() => setActiveTab("ledger")}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === "ledger"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Recent Transactions Ledger
        </button>
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center min-h-[300px]">
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
          </div>
        ) : activeTab === "withdrawals" ? (
          /* Withdrawals View */
          withdrawals.length === 0 ? (
            <div className="px-6 py-16 text-center text-sm text-gray-500">
              <Receipt className="mx-auto h-10 w-10 text-gray-300 mb-2" />
              No withdrawal requests logged.
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bank Details</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {withdrawals.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-900">{item.profiles?.full_name || "User"}</div>
                          <div className="text-xs text-gray-400 font-mono">{item.profiles?.email}</div>
                        </td>
                        <td className="px-6 py-4 font-bold text-gray-900">
                          Rp {Number(item.amount).toLocaleString("id-ID")}
                        </td>
                        <td className="px-6 py-4 text-xs">
                          <div className="font-semibold text-gray-900 uppercase">{item.bank_name}</div>
                          <div className="text-gray-500 font-mono">{item.bank_account_number} ({item.bank_account_name})</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(item.status)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-400">
                          {new Date(item.created_at).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleOpenReview(item)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-semibold transition-colors"
                          >
                            Review
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden divide-y divide-gray-100">
                {withdrawals.map((item) => (
                  <div key={item.id} className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold text-xs text-gray-900">{item.profiles?.full_name || "User"}</div>
                        <div className="text-[11px] text-gray-400 font-mono">{item.profiles?.email}</div>
                      </div>
                      {getStatusBadge(item.status)}
                    </div>

                    <div className="bg-gray-50 p-2.5 rounded-lg text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Amount:</span>
                        <span className="font-bold text-gray-900">Rp {Number(item.amount).toLocaleString("id-ID")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Bank:</span>
                        <span className="font-semibold uppercase text-gray-800">{item.bank_name}</span>
                      </div>
                      <div className="text-[11px] text-gray-400 font-mono">
                        {item.bank_account_number} ({item.bank_account_name})
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenReview(item)}
                      className="w-full py-2 bg-blue-50 text-blue-600 text-xs font-semibold rounded-lg flex items-center justify-center gap-1"
                    >
                      Review Request
                    </button>
                  </div>
                ))}
              </div>
            </>
          )
        ) : (
          /* Ledger View */
          transactions.length === 0 ? (
            <div className="px-6 py-16 text-center text-sm text-gray-500">
              <Receipt className="mx-auto h-10 w-10 text-gray-300 mb-2" />
              No transaction ledger logs found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900 text-xs">{tx.profiles?.full_name || "User"}</div>
                        <div className="text-[11px] text-gray-400 font-mono">{tx.profiles?.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-0.5 rounded text-[11px] font-semibold uppercase bg-gray-100 text-gray-700">
                          {tx.type.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-600 max-w-xs">{tx.description}</td>
                      <td className="px-6 py-4 whitespace-nowrap font-bold text-xs text-gray-900">
                        Rp {Number(tx.amount).toLocaleString("id-ID")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-400">
                        {new Date(tx.created_at).toLocaleString("en-US", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>

      {/* Review Modal */}
      {selectedWithdrawal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-4 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto my-auto">
            <div className="flex justify-between items-center border-b pb-3">
              <h2 className="text-base font-bold text-gray-900">Review Payout Request</h2>
              <button onClick={() => setSelectedWithdrawal(null)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            {successMsg && <div className="p-3 bg-green-50 text-green-700 text-xs rounded-lg">{successMsg}</div>}
            {errorMsg && <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg">{errorMsg}</div>}

            {/* Payout Details */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Applicant:</span>
                <span className="font-semibold text-gray-900">{selectedWithdrawal.profiles?.full_name || selectedWithdrawal.profiles?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Amount to Transfer:</span>
                <span className="text-base font-bold text-blue-600">
                  Rp {Number(selectedWithdrawal.amount).toLocaleString("id-ID")}
                </span>
              </div>
              <div className="pt-2 border-t border-gray-200 space-y-1">
                <div className="font-semibold text-gray-800 flex items-center gap-1">
                  <Building2 className="h-3.5 w-3.5 text-gray-500" /> Destination Account
                </div>
                <div className="text-gray-600">Bank: <span className="font-bold uppercase text-gray-900">{selectedWithdrawal.bank_name}</span></div>
                <div className="text-gray-600">Account No: <span className="font-mono font-bold text-gray-900">{selectedWithdrawal.bank_account_number}</span></div>
                <div className="text-gray-600">Account Name: <span className="font-semibold text-gray-900">{selectedWithdrawal.bank_account_name}</span></div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                Admin Audit Notes (Optional)
              </label>
              <textarea
                rows={2}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="e.g. Transferred via BCA KlikBCA Ref #12345"
                className="w-full p-2 border border-gray-300 rounded-lg text-xs focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                disabled={updating}
                onClick={() => handleUpdateWithdrawal("rejected")}
                className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-semibold disabled:opacity-50"
              >
                Reject
              </button>
              <button
                type="button"
                disabled={updating}
                onClick={() => handleUpdateWithdrawal("completed")}
                className="inline-flex items-center gap-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold disabled:opacity-50"
              >
                {updating && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Approve & Mark Completed
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}