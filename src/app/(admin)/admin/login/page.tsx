"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const router = useRouter();
  const supabase = createClient();

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      // 1. Login ke Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        throw new Error(authError.message);
      }

      if (!authData.user) {
        throw new Error("Gagal mengotentikasi pengguna.");
      }

      // 2. Ambil data role dari tabel profiles
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", authData.user.id)
        .single();

      if (profileError || !profile) {
        await supabase.auth.signOut();
        throw new Error("Gagal memvalidasi izin profil.");
      }

      // 3. Verifikasi apakah akun merupakan admin
      if (profile.role !== "admin") {
        await supabase.auth.signOut();
        throw new Error("Akses ditolak. Akun ini tidak memiliki hak akses admin.");
      }

      // 4. Redirect ke Admin Dashboard
      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setErrorMessage(err.message || "Terjadi kesalahan saat login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-neutral-100 px-4">
      <div className="w-full max-w-md bg-white border border-neutral-200 rounded-lg p-8 shadow-sm">
        
        {/* Logo & Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative h-10 w-44 mb-3">
            <Image
              src="/northre_logo.png"
              alt="NORTHRE"
              fill
              priority
              sizes="176px"
              className="object-contain"
            />
          </div>
          <span className="text-xs uppercase tracking-widest text-neutral-500 font-semibold">
            Admin Panel Access
          </span>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-md">
            {errorMessage}
          </div>
        )}

        {/* Form Login */}
        <form onSubmit={handleAdminLogin} className="space-y-5">
          <div>
            <label className="block text-xs uppercase font-bold tracking-wider text-neutral-700 mb-2">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@northre.id"
              className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-md text-sm text-black focus:outline-none focus:border-black transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs uppercase font-bold tracking-wider text-neutral-700 mb-2">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-md text-sm text-black focus:outline-none focus:border-black transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black hover:bg-neutral-800 text-white text-xs uppercase font-bold tracking-widest py-3 rounded-md transition-colors duration-200 disabled:opacity-50 mt-2 cursor-pointer"
          >
            {loading ? "Verifying..." : "Sign In to Admin"}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-neutral-400">
          NORTHRE® Internal Systems
        </div>

      </div>
    </div>
  );
}