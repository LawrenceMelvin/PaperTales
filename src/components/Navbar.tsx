"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import { Sparkles, Coins, LayoutDashboard, Calculator, Printer, BookOpen } from "lucide-react";
import { getClientTokenBalance } from "@/lib/token-store";

interface NavbarProps {
  onOpenTokenModal?: () => void;
  onOpenOrderTracking?: () => void;
}

export default function Navbar({ onOpenTokenModal, onOpenOrderTracking }: NavbarProps) {
  const [tokens, setTokens] = useState<number>(120);

  useEffect(() => {
    setTokens(getClientTokenBalance());

    const handleUpdate = () => {
      setTokens(getClientTokenBalance());
    };

    window.addEventListener("tokens_updated", handleUpdate);
    return () => window.removeEventListener("tokens_updated", handleUpdate);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#E8DFD3] bg-[#FFFDF9]/90 backdrop-blur-2xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 py-3.5 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="active:scale-95 transition-transform duration-150">
          <Logo size="md" />
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-7 text-xs font-semibold tracking-wide">
          <Link
            href="/studio"
            className="text-amber-800 hover:text-amber-950 transition-colors duration-150 flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            Studio Creator
          </Link>
          <Link
            href="/pricing"
            className="text-slate-600 hover:text-amber-700 transition-colors duration-150 flex items-center gap-1.5"
          >
            <Calculator className="w-3.5 h-3.5 text-amber-600" />
            Pricing Calculator
          </Link>
          <a
            href="/#ecosystem"
            className="text-slate-600 hover:text-amber-700 transition-colors duration-150 flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5 text-amber-600" />
            Lulu POD
          </a>
          <Link
            href="/bookstore"
            className="text-slate-600 hover:text-amber-700 transition-colors duration-150 flex items-center gap-1.5"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-600" />
            Bookstore &amp; Vault
          </Link>
        </nav>

        {/* Trailing Action Badges and CTAs */}
        <div className="flex items-center gap-3">
          {/* Token Status Pill */}
          <div
            onClick={onOpenTokenModal}
            className="cursor-pointer flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-300 text-amber-900 text-xs font-semibold shadow-sm hover:border-amber-400 transition-colors"
            title="Manage micro-tokens"
          >
            <Coins className="w-3.5 h-3.5 text-amber-600" />
            <span>{tokens} Tokens</span>
          </div>

          {/* Primary Header CTA */}
          <Link
            href="/studio"
            className="atelier-btn-primary font-bold text-xs px-4 py-2 rounded-xl active:scale-95 transition-all duration-150 flex items-center gap-1.5 shadow-md"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Start Co-Creating (5 Free Pages)</span>
            <span className="sm:hidden">5 Free Pages</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
