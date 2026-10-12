"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, Sparkles, Coins, ShoppingBag, LayoutDashboard, Printer } from "lucide-react";
import { getClientTokenBalance } from "@/lib/token-store";

interface NavbarProps {
  onOpenTokenModal?: () => void;
}

export default function Navbar({ onOpenTokenModal }: NavbarProps) {
  const [tokens, setTokens] = useState<number>(12);

  useEffect(() => {
    setTokens(getClientTokenBalance());

    const handleUpdate = () => {
      setTokens(getClientTokenBalance());
    };

    window.addEventListener("tokens_updated", handleUpdate);
    return () => window.removeEventListener("tokens_updated", handleUpdate);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xl tracking-tight text-slate-900">PaperTales</span>
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold border border-blue-200">AI</span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium">PayPal Commerce &bull; Lulu POD</p>
          </div>
        </Link>

        {/* Navigation links */}
        <nav className="hidden md:flex items-center gap-1">
          <Link
            href="/studio"
            className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold text-slate-700 hover:text-blue-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Sparkles className="w-4 h-4 text-blue-600" />
            Co-Creation Studio
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold text-slate-700 hover:text-blue-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <LayoutDashboard className="w-4 h-4 text-indigo-600" />
            Author Dashboard
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-bold">AG Grid</span>
          </Link>
        </nav>

        {/* Action Controls & Token Balance */}
        <div className="flex items-center gap-3">
          {/* Token Vault Badge */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/90 pl-3 pr-1.5 py-1 rounded-full shadow-sm">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <Coins className="w-4 h-4 text-amber-500 animate-pulse" />
              <span>{tokens}</span>
              <span className="text-slate-400 font-normal">tokens</span>
            </div>
            <button
              onClick={onOpenTokenModal}
              className="px-2 py-0.5 text-xs font-semibold bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white rounded-full transition-all shadow-sm"
              title="Refill tokens with PayPal"
            >
              + Refill
            </button>
          </div>

          <Link
            href="/studio"
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-blue-600 rounded-lg shadow-sm transition-all"
          >
            Create Book
          </Link>
        </div>
      </div>
    </header>
  );
}
