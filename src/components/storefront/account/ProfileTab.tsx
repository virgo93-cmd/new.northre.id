"use client";

import { useState } from "react";
import { Check, Mail, Pencil, Phone, UserRound, X } from "lucide-react";
import { CustomerProfile, updateCustomerProfileAction } from "@/modules/customer/customer.service";

interface ProfileTabProps {
  user: { id: string; email?: string };
  profile: CustomerProfile | null;
}

export function ProfileTab({ user, profile }: ProfileTabProps) {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [phone, setPhone] = useState(profile?.phone_number || "");

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setNotice("");
    try {
      const parts = fullName.trim().split(/\s+/);
      await updateCustomerProfileAction(user.id, {
        full_name: fullName.trim(),
        first_name: parts[0] || "",
        last_name: parts.slice(1).join(" "),
        phone_number: phone.trim(),
      });
      setNotice("Profil berhasil diperbarui.");
      setEditing(false);
    } catch (error: unknown) {
      setNotice(error instanceof Error ? error.message : "Profil belum berhasil disimpan.");
    } finally {
      setLoading(false);
    }
  };

  const fieldClass = "w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3.5 text-sm outline-none transition focus:border-black focus:ring-2 focus:ring-black/5";

  return (
    <div>
      <div className="flex flex-col justify-between gap-4 border-b border-neutral-100 pb-6 sm:flex-row sm:items-center">
        <div><h2 className="text-2xl font-semibold tracking-tight">Profil saya</h2><p className="mt-1 text-sm text-neutral-500">Pastikan informasi kontak kamu tetap akurat.</p></div>
        {!editing && <button type="button" onClick={() => setEditing(true)} className="inline-flex w-fit items-center gap-2 rounded-full bg-black px-5 py-3 text-xs font-semibold uppercase tracking-widest text-white"><Pencil className="h-3.5 w-3.5" /> Edit profil</button>}
      </div>

      {notice && <div className="mt-5 flex items-center gap-2 rounded-2xl bg-neutral-100 px-4 py-3 text-sm"><Check className="h-4 w-4" />{notice}</div>}

      {editing ? (
        <form onSubmit={save} className="mt-6 max-w-2xl space-y-5">
          <div><label className="mb-2 block text-xs font-semibold text-neutral-600">Nama lengkap</label><input value={fullName} onChange={(e) => setFullName(e.target.value)} required className={fieldClass} autoComplete="name" /></div>
          <div><label className="mb-2 block text-xs font-semibold text-neutral-600">Nomor WhatsApp</label><input value={phone} onChange={(e) => setPhone(e.target.value)} className={fieldClass} placeholder="08xxxxxxxxxx" autoComplete="tel" /></div>
          <div><label className="mb-2 block text-xs font-semibold text-neutral-600">Email</label><input value={profile?.email || user.email || ""} disabled className={`${fieldClass} bg-neutral-50 text-neutral-400`} /><p className="mt-2 text-xs text-neutral-400">Email mengikuti akun Google yang kamu gunakan.</p></div>
          <div className="flex gap-3 pt-2"><button disabled={loading} className="rounded-full bg-black px-6 py-3 text-xs font-semibold uppercase tracking-widest text-white disabled:opacity-50">{loading ? "Menyimpan..." : "Simpan"}</button><button type="button" onClick={() => setEditing(false)} className="inline-flex items-center gap-2 rounded-full border border-neutral-200 px-5 py-3 text-xs font-semibold"><X className="h-3.5 w-3.5" /> Batal</button></div>
        </form>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-[22px] bg-neutral-50 p-5"><UserRound className="mb-8 h-5 w-5 text-neutral-400" /><p className="text-xs text-neutral-400">Nama lengkap</p><p className="mt-1 text-sm font-semibold">{fullName || "Belum diisi"}</p></div>
          <div className="rounded-[22px] bg-neutral-50 p-5"><Phone className="mb-8 h-5 w-5 text-neutral-400" /><p className="text-xs text-neutral-400">Nomor WhatsApp</p><p className="mt-1 text-sm font-semibold">{phone || "Belum diisi"}</p></div>
          <div className="rounded-[22px] bg-neutral-50 p-5 sm:col-span-2"><Mail className="mb-8 h-5 w-5 text-neutral-400" /><p className="text-xs text-neutral-400">Email</p><p className="mt-1 truncate text-sm font-semibold">{profile?.email || user.email}</p></div>
        </div>
      )}
    </div>
  );
}
