"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp } from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import { RevenueChartItem } from "@/modules/dashboard/dashboard.service";

interface RevenueChartProps {
  data: RevenueChartItem[];
}

// Custom Tooltip Modern
function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-neutral-900 text-white px-3 py-2 rounded-lg shadow-xl border border-neutral-800 text-xs">
        <p className="text-neutral-400 font-medium mb-0.5">{label}</p>
        <p className="font-bold text-emerald-400">
          {formatRupiah(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
}

export default function RevenueChart({ data }: RevenueChartProps) {
  const totalWeekly = data.reduce((sum, d) => sum + d.amount, 0);

  return (
    <div className="bg-white rounded-xl border border-neutral-100 shadow-xs p-5 space-y-4">
      {/* Header Info */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4 text-emerald-500" /> Revenue (Last 7 Days)
          </h3>
          <p className="text-xs text-neutral-500">Daily gross settled revenue</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-neutral-900">
            {formatRupiah(totalWeekly)}
          </p>
          <p className="text-[11px] text-neutral-400">Weekly Total</p>
        </div>
      </div>

      {/* Modern Area Chart */}
      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#f1f5f9"
            />

            <XAxis
              dataKey="dayLabel"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94a3b8", fontSize: 11 }}
              dy={10}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94a3b8", fontSize: 10 }}
              tickFormatter={(value) => {
                if (value >= 1000000) return `${(value / 1000000).toFixed(0)}M`;
                if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
                return value;
              }}
              dx={-5}
            />

            <Tooltip content={<CustomTooltip />} />

            <Area
              type="monotone"
              dataKey="amount"
              stroke="#10b981"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#revenueGradient)"
              activeDot={{
                r: 6,
                style: { fill: "#10b981", stroke: "#ffffff", strokeWidth: 2 },
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}