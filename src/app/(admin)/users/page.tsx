"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Loader2,
  Search,
  Users,
  Shield,
  Award,
  MapPin,
  X,
  CheckCircle2,
  Edit,
  UserCheck,
} from "lucide-react";
import {
  getUsers,
  updateUserRole,
  toggleAffiliateStatus,
  UserProfile,
  UserRole,
} from "@/modules/users/users.service";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
  const [affiliateFilter, setAffiliateFilter] = useState<boolean | "all">("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modal State
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [editRole, setEditRole] = useState<UserRole>("customer");
  const [isAffiliate, setIsAffiliate] = useState(false);
  const [affiliateBadge, setAffiliateBadge] = useState("bronze");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getUsers({
        search,
        role: roleFilter,
        is_affiliate: affiliateFilter,
        page,
        limit: 10,
      });
      setUsers(res.data);
      setTotalPages(res.totalPages);
      setTotalCount(res.count);
    } catch (err: any) {
      console.error("Failed to load users:", err);
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, affiliateFilter, page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  const handleOpenDetail = (user: UserProfile) => {
    setSelectedUser(user);
    setEditRole(user.role);
    setIsAffiliate(user.is_affiliate);
    setAffiliateBadge(user.affiliate_badge || "bronze");
    setSuccessMsg(null);
    setErrorMsg(null);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser?.id) return;

    try {
      setUpdating(true);
      setErrorMsg(null);

      // Update role if changed
      if (editRole !== selectedUser.role) {
        await updateUserRole(selectedUser.id, editRole);
      }

      // Update affiliate if changed
      if (
        isAffiliate !== selectedUser.is_affiliate ||
        affiliateBadge !== selectedUser.affiliate_badge
      ) {
        await toggleAffiliateStatus(selectedUser.id, isAffiliate, affiliateBadge);
      }

      setSuccessMsg("User permissions updated successfully.");
      setSelectedUser((prev) =>
        prev
          ? {
              ...prev,
              role: editRole,
              is_affiliate: isAffiliate,
              affiliate_badge: isAffiliate ? affiliateBadge : null,
            }
          : null
      );
      fetchUsers();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update user.");
    } finally {
      setUpdating(false);
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case "admin":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <Shield className="h-3 w-3" /> Admin
          </span>
        );
      case "staff":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <UserCheck className="h-3 w-3" /> Staff
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-50 text-gray-600 border border-gray-200">
            Customer
          </span>
        );
    }
  };

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">
            Users & Roles
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            Manage user profiles, permissions, affiliate tiers, and saved addresses.
          </p>
        </div>
        <div className="text-xs sm:text-sm text-gray-600 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg w-fit">
          Total: <span className="font-semibold text-gray-900">{totalCount}</span> Users
        </div>
      </div>

      {/* Filter & Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search Name, Email, Phone..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value as any);
            setPage(1);
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="staff">Staff</option>
          <option value="customer">Customer</option>
        </select>

        <select
          value={String(affiliateFilter)}
          onChange={(e) => {
            const val = e.target.value;
            setAffiliateFilter(val === "all" ? "all" : val === "true");
            setPage(1);
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All Affiliate Status</option>
          <option value="true">Affiliates Only</option>
          <option value="false">Non-Affiliates</option>
        </select>
      </div>

      {/* User List Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center min-h-[300px]">
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="px-6 py-16 text-center text-sm text-gray-500">
            <Users className="mx-auto h-10 w-10 text-gray-300 mb-2" />
            No users found matching your search.
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Affiliate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          {user.avatar_url ? (
                            <img
                              src={user.avatar_url}
                              alt={user.full_name || "User"}
                              className="h-9 w-9 rounded-full object-cover border"
                            />
                          ) : (
                            <div className="h-9 w-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs uppercase">
                              {(user.full_name || user.email || "U").slice(0, 2)}
                            </div>
                          )}
                          <div>
                            <div className="font-semibold text-gray-900">
                              {user.full_name || "Unnamed User"}
                            </div>
                            <div className="text-xs text-gray-400 font-mono">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-600">
                        {user.phone_number || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{getRoleBadge(user.role)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.is_affiliate ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <Award className="h-3 w-3" />
                            {user.affiliate_badge ? user.affiliate_badge.toUpperCase() : "AFFILIATE"}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-400">
                        {user.created_at
                          ? new Date(user.created_at).toLocaleDateString("en-US", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleOpenDetail(user)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-semibold transition-colors"
                        >
                          <Edit className="h-3.5 w-3.5" /> Manage
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-gray-100">
              {users.map((user) => (
                <div key={user.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      {user.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt={user.full_name || "User"}
                          className="h-8 w-8 rounded-full object-cover border"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs uppercase">
                          {(user.full_name || user.email || "U").slice(0, 2)}
                        </div>
                      )}
                      <div>
                        <div className="font-semibold text-xs text-gray-900">
                          {user.full_name || "Unnamed User"}
                        </div>
                        <div className="text-[11px] text-gray-400 font-mono">{user.email}</div>
                      </div>
                    </div>
                    {getRoleBadge(user.role)}
                  </div>

                  <div className="flex justify-between items-center text-xs text-gray-500 pt-1">
                    <span>Phone: {user.phone_number || "-"}</span>
                    {user.is_affiliate && (
                      <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-emerald-600">
                        <Award className="h-3 w-3" />
                        {user.affiliate_badge?.toUpperCase()}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleOpenDetail(user)}
                    className="w-full py-2 bg-blue-50 text-blue-600 text-xs font-semibold rounded-lg flex items-center justify-center gap-1"
                  >
                    <Edit className="h-3.5 w-3.5" /> Manage User
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
                <span>
                  Page {page} of {totalPages}
                </span>
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

      {/* Modal Manage User */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-4 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto my-auto">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h2 className="text-base font-bold text-gray-900">
                  {selectedUser.full_name || "User Profile"}
                </h2>
                <p className="text-xs text-gray-400 font-mono">{selectedUser.email}</p>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {successMsg && (
              <div className="p-3 bg-green-50 text-green-700 text-xs rounded-lg flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 shrink-0" /> {successMsg}
              </div>
            )}
            {errorMsg && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg">{errorMsg}</div>
            )}

            <form onSubmit={handleSaveUser} className="space-y-4">
              {/* Role & Affiliate Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    System Role
                  </label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as UserRole)}
                    className="w-full p-2 border border-gray-300 rounded-lg text-xs bg-white focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="customer">Customer</option>
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Affiliate Badge Tier
                  </label>
                  <select
                    disabled={!isAffiliate}
                    value={affiliateBadge}
                    onChange={(e) => setAffiliateBadge(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg text-xs bg-white disabled:opacity-50 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="bronze">Bronze</option>
                    <option value="silver">Silver</option>
                    <option value="gold">Gold</option>
                    <option value="platinum">Platinum</option>
                  </select>
                </div>

                <div className="sm:col-span-2 flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="affiliate_status"
                    checked={isAffiliate}
                    onChange={(e) => setIsAffiliate(e.target.checked)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label
                    htmlFor="affiliate_status"
                    className="text-xs font-medium text-gray-700 select-none cursor-pointer"
                  >
                    Enable as Registered Affiliate Partner
                  </label>
                </div>
              </div>

              {/* Saved Addresses Section */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-gray-800 flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-gray-500" /> Saved Addresses (
                  {selectedUser.user_addresses?.length || 0})
                </span>
                {(!selectedUser.user_addresses || selectedUser.user_addresses.length === 0) ? (
                  <div className="p-3 bg-gray-50 rounded-lg text-xs text-gray-400 text-center">
                    No shipping addresses registered for this user yet.
                  </div>
                ) : (
                  <div className="border border-gray-200 rounded-lg divide-y divide-gray-100 text-xs max-h-40 overflow-y-auto">
                    {selectedUser.user_addresses.map((addr) => (
                      <div key={addr.id} className="p-3 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-gray-900 flex items-center gap-1.5">
                            {addr.label}
                            {addr.is_primary && (
                              <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 text-[10px] font-bold">
                                PRIMARY
                              </span>
                            )}
                          </span>
                          <span className="text-gray-500">{addr.phone_number}</span>
                        </div>
                        <p className="text-gray-600">{addr.full_address}</p>
                        <p className="text-gray-400 text-[11px]">
                          {[addr.city, addr.province, addr.postal_code].filter(Boolean).join(", ")}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="inline-flex items-center gap-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold disabled:opacity-50"
                >
                  {updating && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}