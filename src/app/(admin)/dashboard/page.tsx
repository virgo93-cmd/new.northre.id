"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import {
  getDashboardOverviewData,
  DashboardOverviewData,
} from "@/modules/dashboard/dashboard.service";
import DashboardMetrics from "@/components/admin/dashboard/DashboardMetrics";
import QuickAnalytics from "@/components/admin/dashboard/QuickAnalytics";
import RecentOrdersTable from "@/components/admin/dashboard/RecentOrdersTable";
import RevenueChart from "@/components/admin/dashboard/RevenueChart";
import TopProductsList from "@/components/admin/dashboard/TopProductsList";
import RecentCustomersList from "@/components/admin/dashboard/RecentCustomersList";
import DateRangeFilter, {
  DateRangeOption,
} from "@/components/admin/dashboard/DateRangeFilter";

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  
  // State Filter
  const [dateRange, setDateRange] = useState<DateRangeOption>("7d");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  useEffect(() => {
    async function fetchOverview() {
      // Jika mode custom tapi tanggal belum diisi lengkap, jangan fetch dulu
      if (dateRange === "custom" && (!customStartDate || !customEndDate)) return;

      setLoading(true);
      try {
        const result = await getDashboardOverviewData(dateRange, customStartDate, customEndDate);
        setData(result);
      } catch (err) {
        console.error("Failed to load dashboard overview:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchOverview();
  }, [dateRange, customStartDate, customEndDate]);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 border-b border-neutral-100 pb-5">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-neutral-900">
            Dashboard Overview
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            Real-time sales performance and operational overview of NORTHRE®.
          </p>
        </div>

        <DateRangeFilter 
          value={dateRange} 
          onChange={setDateRange}
          customStartDate={customStartDate}
          customEndDate={customEndDate}
          onCustomDateChange={(start, end) => {
            setCustomStartDate(start);
            setCustomEndDate(end);
          }}
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 text-neutral-400 animate-spin" />
        </div>
      ) : !data ? (
        <div className="text-center py-12 text-sm text-neutral-500">
          Waiting for valid date range input...
        </div>
      ) : (
        <>
          <DashboardMetrics metrics={data.metrics} />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <RevenueChart data={data.revenueChart} />
            </div>
            <div>
              <QuickAnalytics orderStats={data.orderStats} />
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <RecentOrdersTable orders={data.recentOrders} />
            </div>
            <div>
              <TopProductsList products={data.topProducts} />
            </div>
          </div>
          <RecentCustomersList customers={data.recentCustomers} />
        </>
      )}
    </div>
  );
}