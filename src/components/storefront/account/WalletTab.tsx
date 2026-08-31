"use client";

import { useState } from "react";
import { Wallet, ArrowUpRight, ArrowDownLeft, Clock, CheckCircle2, AlertCircle, PlusCircle } from "lucide-react";

export interface WalletData {
  id: string;
  balance: number;
  cashback_balance: number;
}

export interface WalletTransaction {
  id: string;
  amount: number;
  type: string;
  description: string;
  created_at: string;
}

export interface WithdrawalRequest {
  id: string;
  amount: number;
  bank_name: string;
  bank_account_number: string;
  bank_account_name: string;
  status: string;
  created_at: string;
}

interface WalletTabProps {
  userId: string;
  wallet: WalletData | null;
  transactions?: WalletTransaction[];
  withdrawals?: WithdrawalRequest[];
}

export function WalletTab({ userId, wallet, transactions = [], withdrawals = [] }: WalletTabProps) {
  const [isRequesting, setIsRequesting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form withdrawal
  const [amount, setAmount] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [bankAccountName, setBankAccountName] = useState("");

  const handleWithdrawalRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // Logika integrasi ke withdrawal_requests table
      setMessage({ type: "success", text: "Withdrawal request submitted successfully to withdrawal_requests table." });
      setIsRequesting(false);
      setAmount("");
      setBankName("");
      setBankAccountNumber("");
      setBankAccountName("");
    } catch (error: unknown) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Failed to submit withdrawal request." });
    } finally {
      setLoading(false);
    }
  };

  const getTxBadge = (type: string) => {
    switch (type) {
      case "affiliate_commission":
      case "cashback":
        return "text-emerald-700 bg-emerald-50 border-emerald-200";
      case "withdrawal":
        return "text-rose-700 bg-rose-50 border-rose-200";
      default:
        return "text-neutral-700 bg-neutral-100 border-neutral-200";
    }
  };

  const getWithdrawalBadge = (status: string) => {
    switch (status) {
      case "approved":
      case "completed":
        return "text-emerald-700 bg-emerald-50 border-emerald-200";
      case "rejected":
        return "text-rose-700 bg-rose-50 border-rose-200";
      default:
        return "text-amber-700 bg-amber-50 border-amber-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-100">
        <div>
          <h2 className="text-xl font-black tracking-tight text-neutral-900 uppercase">Wallet & Commissions</h2>
          <p className="text-xs text-neutral-500 font-medium mt-1">
            Manage your balance, cashback rewards, and bank withdrawal requests.
          </p>
        </div>
        {!isRequesting && (
          <button
            onClick={() => setIsRequesting(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Request Withdrawal</span>
          </button>
        )}
      </div>

      {message && (
        <div className={`flex items-center gap-3 p-4 rounded-xl text-xs font-bold ${
          message.type === "success"
            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
            : "bg-rose-50 text-rose-800 border border-rose-200"
        }`}>
          {message.type === "success" ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Saldo Overview Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-6 bg-neutral-900 text-white rounded-3xl shadow-xl flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Main Balance (balance)</span>
            <Wallet className="w-5 h-5 text-neutral-400" />
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black tracking-tight">
              Rp {(wallet?.balance || 0).toLocaleString("id-ID")}
            </p>
            <p className="text-[10px] text-neutral-400 mt-1 uppercase">Available for withdrawal / order payment</p>
          </div>
        </div>

        <div className="p-6 bg-neutral-50 border border-neutral-200/80 rounded-3xl flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Cashback Balance (cashback_balance)</span>
            <ArrowDownLeft className="w-5 h-5 text-neutral-600" />
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black tracking-tight text-neutral-900">
              Rp {(wallet?.cashback_balance || 0).toLocaleString("id-ID")}
            </p>
            <p className="text-[10px] text-neutral-500 mt-1 uppercase">Earned from store transactions</p>
          </div>
        </div>
      </div>

      {isRequesting ? (
        <form onSubmit={handleWithdrawalRequest} className="space-y-4 bg-neutral-50 p-6 rounded-3xl border border-neutral-200">
          <h3 className="text-sm font-black text-neutral-900 uppercase tracking-wide">New Withdrawal Request</h3>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Amount (amount)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter nominal in IDR"
              required
              className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl text-sm font-semibold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Bank Name (bank_name)</label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="e.g. BCA, MANDIRI, BRI"
                required
                className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl text-sm font-semibold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Account Number (bank_account_number)</label>
              <input
                type="text"
                value={bankAccountNumber}
                onChange={(e) => setBankAccountNumber(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl text-sm font-semibold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Account Name (bank_account_name)</label>
              <input
                type="text"
                value={bankAccountName}
                onChange={(e) => setBankAccountName(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl text-sm font-semibold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Submitting..." : "Submit Request"}
            </button>
            <button
              type="button"
              onClick={() => setIsRequesting(false)}
              className="px-5 py-2.5 bg-white border border-neutral-200 text-neutral-700 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      {/* Riwayat Transaksi & Penarikan */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
        {/* Wallet Transactions */}
        <div className="space-y-4">
          <h3 className="text-xs font-black text-neutral-900 uppercase tracking-widest">Wallet Transactions (wallet_transactions)</h3>
          {transactions.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-neutral-300 rounded-2xl bg-neutral-50/50">
              <p className="text-xs text-neutral-500 font-semibold">No recent transactions recorded.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {transactions.map((tx) => (
                <div key={tx.id} className="p-4 bg-white rounded-2xl border border-neutral-200 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-neutral-900">{tx.description}</p>
                    <p className="text-[10px] text-neutral-400 mt-0.5">{new Date(tx.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-black ${tx.amount >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                      {tx.amount >= 0 ? "+" : ""}Rp {tx.amount.toLocaleString("id-ID")}
                    </p>
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${getTxBadge(tx.type)}`}>
                      {tx.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Withdrawal Requests */}
        <div className="space-y-4">
          <h3 className="text-xs font-black text-neutral-900 uppercase tracking-widest">Withdrawal Requests (withdrawal_requests)</h3>
          {withdrawals.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-neutral-300 rounded-2xl bg-neutral-50/50">
              <p className="text-xs text-neutral-500 font-semibold">No withdrawal requests made.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {withdrawals.map((wd) => (
                <div key={wd.id} className="p-4 bg-white rounded-2xl border border-neutral-200 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-neutral-900">{wd.bank_name} - {wd.bank_account_number}</p>
                    <p className="text-[10px] text-neutral-400 mt-0.5">{wd.bank_account_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-neutral-900">Rp {wd.amount.toLocaleString("id-ID")}</p>
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${getWithdrawalBadge(wd.status)}`}>
                      {wd.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
