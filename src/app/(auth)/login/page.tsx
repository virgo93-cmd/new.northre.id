"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Package, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        // Tambahan parameter ini memaksa Google selalu menampilkan layar pilih akun
        queryParams: {
          prompt: "consent",
        },
      },
    });

    if (error) {
      setError(error.message || "Failed to sign in with Google.");
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-5rem)] flex items-center justify-center px-4 sm:px-6 py-20">
      <div className="relative w-full max-w-[420px] bg-white border border-neutral-200/60 rounded-3xl pt-20 pb-8 px-8 sm:px-10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.08)]">
        
        {/* Floating Circular Logo (Shadow removed) */}
        <div className="absolute -top-14 left-1/2 -translate-x-1/2 w-28 h-28 rounded-full bg-white border-4 border-white flex items-center justify-center overflow-hidden">
          <img
            src="/fav.png"
            alt="Logo"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Header Title */}
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-xl font-bold tracking-tight text-neutral-900 uppercase">Customer Portal</h1>
          <p className="text-xs text-neutral-500 tracking-wide">
            Secure, passwordless access via your Google account.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3.5 mb-6 text-xs rounded-xl font-medium text-center">
            {error}
          </div>
        )}

        {/* Google Auth Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full group relative flex items-center justify-center gap-3.5 border border-neutral-300/80 bg-white py-4 px-6 rounded-2xl text-xs font-bold uppercase tracking-[0.15em] text-neutral-800 hover:bg-neutral-900 hover:text-white hover:border-neutral-900 transition-all duration-300 disabled:opacity-50 cursor-pointer shadow-xs active:scale-[0.98]"
        >
          <svg className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>{isLoading ? "CONNECTING..." : "CONTINUE WITH GOOGLE"}</span>
        </button>

        {/* Guest Track Order Section */}
        <div className="mt-8 pt-6 border-t border-neutral-100 text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-3">
            Shopping without an account?
          </p>
          <Link
            href="/track-order"
            className="group flex items-center justify-center gap-2 w-full border border-neutral-200 text-neutral-800 py-3.5 px-4 rounded-2xl text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-neutral-100 hover:border-neutral-300 transition-all duration-200"
          >
            <Package className="w-4 h-4 text-neutral-500 group-hover:text-black transition-colors" />
            <span>TRACK YOUR ORDER</span>
            <ArrowRight className="w-3.5 h-3.5 text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

      </div>
    </div>
  );
}