import Link from "next/link";
import { ArrowUpRight, User, Users } from "lucide-react";
import { RecentCustomerItem } from "@/modules/dashboard/dashboard.service";

interface RecentCustomersProps {
  customers: RecentCustomerItem[];
}

export default function RecentCustomersList({ customers }: RecentCustomersProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden">
      <div className="p-5 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
            <Users className="h-4 w-4 text-indigo-500" /> New Customers
          </h3>
          <p className="text-xs text-gray-500">Recently registered buyer accounts</p>
        </div>
        <Link
          href="/users"
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          View All <ArrowUpRight size={14} />
        </Link>
      </div>

      {customers.length === 0 ? (
        <div className="py-10 flex flex-col items-center justify-center text-center space-y-2">
          <User className="h-8 w-8 text-gray-300" />
          <p className="text-xs font-medium text-gray-500">No customers registered yet</p>
          <p className="text-[11px] text-gray-400 max-w-xs">
            Newly registered customer profiles will appear here.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {customers.map((cust) => {
            const displayName = cust.full_name || "Anonymous User";
            const initial = displayName.charAt(0).toUpperCase();

            return (
              <div
                key={cust.id}
                className="p-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-9 w-9 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs shrink-0 overflow-hidden">
                    {cust.avatar_url ? (
                      <img
                        src={cust.avatar_url}
                        alt={displayName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      initial
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-900 truncate">
                      {displayName}
                    </p>
                    <p className="text-[11px] text-gray-500 truncate">
                      {cust.email || "No email"}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0 pl-3">
                  <span className="text-[11px] text-gray-400">
                    {new Date(cust.created_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}