import { createClient } from "@/lib/supabase/client";

export type WalletTxType =
  | "order_payment"
  | "cashback"
  | "affiliate_commission"
  | "withdrawal"
  | "refund"
  | "manual_adjustment";

export type WithdrawalStatus = "pending" | "approved" | "rejected" | "completed";

export interface WalletTransaction {
  id: string;
  wallet_id: string;
  user_id: string;
  amount: number;
  type: WalletTxType;
  description: string;
  reference_id?: string | null;
  created_at: string;
  profiles?: {
    email: string;
    full_name: string | null;
  } | null;
}

export interface WithdrawalRequest {
  id: string;
  user_id: string;
  amount: number;
  bank_name: string;
  bank_account_number: string;
  bank_account_name: string;
  status: WithdrawalStatus;
  admin_notes?: string | null;
  created_at: string;
  updated_at: string;
  profiles?: {
    email: string;
    full_name: string | null;
    phone_number: string | null;
  } | null;
}

export interface FinancialOverview {
  grossRevenue: number;
  totalWalletsBalance: number;
  totalCommissionsPaid: number;
  pendingWithdrawalsCount: number;
  pendingWithdrawalsAmount: number;
}

export async function getFinancialOverview(): Promise<FinancialOverview> {
  const supabase = createClient();

  // 1. Gross Revenue from Paid Orders
  const { data: paidOrders } = await supabase
    .from("orders")
    .select("total_amount")
    .eq("payment_status", "paid");

  const grossRevenue = (paidOrders || []).reduce(
    (acc, item) => acc + Number(item.total_amount || 0),
    0
  );

  // 2. Total Wallet Balance in Circulation
  const { data: wallets } = await supabase
    .from("wallets")
    .select("balance");

  const totalWalletsBalance = (wallets || []).reduce(
    (acc, item) => acc + Number(item.balance || 0),
    0
  );

  // 3. Total Commissions & Cashback Paid
  const { data: commissionTxs } = await supabase
    .from("wallet_transactions")
    .select("amount")
    .in("type", ["affiliate_commission", "cashback"]);

  const totalCommissionsPaid = (commissionTxs || []).reduce(
    (acc, item) => acc + Number(item.amount || 0),
    0
  );

  // 4. Pending Withdrawals
  const { data: pendingWithdrawals } = await supabase
    .from("withdrawal_requests")
    .select("amount")
    .eq("status", "pending");

  const pendingWithdrawalsCount = pendingWithdrawals?.length || 0;
  const pendingWithdrawalsAmount = (pendingWithdrawals || []).reduce(
    (acc, item) => acc + Number(item.amount || 0),
    0
  );

  return {
    grossRevenue,
    totalWalletsBalance,
    totalCommissionsPaid,
    pendingWithdrawalsCount,
    pendingWithdrawalsAmount,
  };
}

export async function getWalletTransactions(limit = 20): Promise<WalletTransaction[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("wallet_transactions")
    .select("*, profiles(email, full_name)")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching transactions:", error.message);
    return [];
  }

  return (data || []) as WalletTransaction[];
}

export async function getWithdrawalRequests(): Promise<WithdrawalRequest[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("withdrawal_requests")
    .select("*, profiles(email, full_name, phone_number)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching withdrawal requests:", error.message);
    return [];
  }

  return (data || []) as WithdrawalRequest[];
}

export async function updateWithdrawalStatus(
  id: string,
  status: WithdrawalStatus,
  admin_notes?: string
) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("withdrawal_requests")
    .update({
      status,
      admin_notes: admin_notes || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as WithdrawalRequest;
}
