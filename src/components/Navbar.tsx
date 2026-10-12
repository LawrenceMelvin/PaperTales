"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, Sparkles, Coins, LayoutDashboard } from "lucide-react";
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
    <header className="sticky top-0 z-40 w-full border-b border-amber-500/20 bg-[#090D16]/80 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 flex items-center justify-center text-[#090D16] shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform border border-amber-300/40">
            <BookOpen className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-editorial font-bold text-xl tracking-tight text-white group-hover:text-amber-200 transition-colors">
                PaperTales
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-extrabold border border-amber-400/30">
                AI
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">PayPal Commerce &bull; Lulu Print POD</p>
          </div>
        </Link>

        {/* Navigation links */}
        <nav className="hidden md:flex items-center gap-2">
          <Link
            href="/studio"
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-amber-300 hover:bg-white/5 rounded-lg transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Co-Creation Studio
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-amber-300 hover:bg-white/5 rounded-lg transition-colors"
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-sky-400" />
            Author Dashboard
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30 font-bold">
              AG Grid
            </span>
          </Link>
        </nav>

        {/* Action Controls & Token Balance */}
        <div className="flex items-center gap-3">
          {/* Token Vault Badge */}
          <div className="flex items-center gap-2 bg-[#141C2E]/90 border border-amber-500/25 pl-3 pr-1.5 py-1 rounded-full shadow-inner">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
              <Coins className="w-4 h-4 text-amber-400 animate-pulse" />
              <span className="text-amber-300 font-mono">{tokens}</span>
              <span className="text-slate-400 font-normal text-[11px]">tokens</span>
            </div>
            <button
              onClick={onOpenTokenModal}
              className="px-2.5 py-0.5 text-xs font-bold rounded-full gilded-button shadow-sm"
              title="Refill tokens with PayPal"
            >
              + Refill
            </button>
          </div>

          <Link
            href="/studio"
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-white/10 hover:bg-white/15 border border-white/20 rounded-xl transition-all hover:scale-[1.02]"
          >
            Open Studio &rarr;
          </Link>
        </div>
      </div>
    </header>
  );
}
