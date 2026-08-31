"use client";

import { useState } from "react";
import { CustomerProfile, updateCustomerProfileAction } from "@/modules/customer/customer.service";
import { User, Mail, Phone, Shield, Share2, Users, Award, Edit3, CheckCircle2, AlertCircle } from "lucide-react";

interface ProfileTabProps {
  user: {
    id: string;
    email?: string;
  };
  profile: CustomerProfile | null;
}

export function ProfileTab({ user, profile }: ProfileTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [firstName, setFirstName] = useState(profile?.first_name || "");
  const [lastName, setLastName] = useState(profile?.last_name || "");
  const [phoneNumber, setPhoneNumber] = useState(profile?.phone_number || "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      await updateCustomerProfileAction(user.id, {
        full_name: fullName,
        first_name: firstName,
        last_name: lastName,
        phone_number: phoneNumber,
      });
      setMessage({ type: "success", text: "Profile updated successfully." });
      setIsEditing(false);
    } catch (error: unknown) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Failed to update profile." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Edit Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-100">
        <div>
          <h2 className="text-xl font-black tracking-tight text-neutral-900 uppercase">Profile Details</h2>
          <p className="text-xs text-neutral-500 font-medium mt-1">
            Manage your personal data and view account credentials.
          </p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-sm"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
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

      {isEditing ? (
        <form onSubmit={handleUpdateProfile} className="space-y-4 bg-neutral-50 p-6 rounded-3xl border border-neutral-200">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Full Name (full_name)</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl text-sm font-semibold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">First Name (first_name)</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl text-sm font-semibold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Last Name (last_name)</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl text-sm font-semibold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Phone Number (phone_number)</label>
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl text-sm font-semibold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-5 py-2.5 bg-white border border-neutral-200 text-neutral-700 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          <div className="p-5 bg-neutral-50/60 rounded-2xl border border-neutral-200/70">
            <div className="flex items-center gap-2 text-neutral-400 mb-2">
              <User className="w-4 h-4 text-neutral-600" />
              <span className="text-[10px] font-bold uppercase tracking-widest">full_name</span>
            </div>
            <p className="text-sm font-bold text-neutral-900">{profile?.full_name || "-"}</p>
          </div>

          <div className="p-5 bg-neutral-50/60 rounded-2xl border border-neutral-200/70">
            <div className="flex items-center gap-2 text-neutral-400 mb-2">
              <Mail className="w-4 h-4 text-neutral-600" />
              <span className="text-[10px] font-bold uppercase tracking-widest">email</span>
            </div>
            <p className="text-sm font-bold text-neutral-900 truncate">{profile?.email || user.email}</p>
          </div>

          <div className="p-5 bg-neutral-50/60 rounded-2xl border border-neutral-200/70">
            <div className="flex items-center gap-2 text-neutral-400 mb-2">
              <User className="w-4 h-4 text-neutral-600" />
              <span className="text-[10px] font-bold uppercase tracking-widest">first_name / last_name</span>
            </div>
            <p className="text-sm font-bold text-neutral-900">{profile?.first_name || "-"} {profile?.last_name || ""}</p>
          </div>

          <div className="p-5 bg-neutral-50/60 rounded-2xl border border-neutral-200/70">
            <div className="flex items-center gap-2 text-neutral-400 mb-2">
              <Phone className="w-4 h-4 text-neutral-600" />
              <span className="text-[10px] font-bold uppercase tracking-widest">phone_number</span>
            </div>
            <p className="text-sm font-bold text-neutral-900">{profile?.phone_number || "-"}</p>
          </div>

          <div className="p-5 bg-neutral-50/60 rounded-2xl border border-neutral-200/70">
            <div className="flex items-center gap-2 text-neutral-400 mb-2">
              <Shield className="w-4 h-4 text-neutral-600" />
              <span className="text-[10px] font-bold uppercase tracking-widest">role</span>
            </div>
            <p className="text-sm font-bold text-neutral-900 uppercase">{profile?.role || "customer"}</p>
          </div>

          <div className="p-5 bg-neutral-50/60 rounded-2xl border border-neutral-200/70">
            <div className="flex items-center gap-2 text-neutral-400 mb-2">
              <Award className="w-4 h-4 text-neutral-600" />
              <span className="text-[10px] font-bold uppercase tracking-widest">is_affiliate / badge</span>
            </div>
            <p className="text-sm font-bold text-neutral-900">
              {profile?.is_affiliate ? `Active (${profile.affiliate_badge || "bronze"})` : "Not an Affiliate"}
            </p>
          </div>

          <div className="p-5 bg-neutral-50/60 rounded-2xl border border-neutral-200/70">
            <div className="flex items-center gap-2 text-neutral-400 mb-2">
              <Share2 className="w-4 h-4 text-neutral-600" />
              <span className="text-[10px] font-bold uppercase tracking-widest">referral_code</span>
            </div>
            <p className="text-sm font-bold text-neutral-900 font-mono">{profile?.referral_code || "-"}</p>
          </div>

          <div className="p-5 bg-neutral-50/60 rounded-2xl border border-neutral-200/70">
            <div className="flex items-center gap-2 text-neutral-400 mb-2">
              <Users className="w-4 h-4 text-neutral-600" />
              <span className="text-[10px] font-bold uppercase tracking-widest">referred_by</span>
            </div>
            <p className="text-sm font-bold text-neutral-900 font-mono truncate">{profile?.referred_by || "-"}</p>
          </div>

        </div>
      )}
    </div>
  );
}
