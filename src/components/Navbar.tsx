"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import { Sparkles, Coins, LayoutDashboard, Calculator, Printer, BookOpen } from "lucide-react";
import { getClientTokenBalance } from "@/lib/token-store";

interface NavbarProps {
  onOpenTokenModal?: () => void;
}

export default function Navbar({ onOpenTokenModal }: NavbarProps) {
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
    <header className="sticky top-0 z-50 w-full border-b border-sky-400/15 bg-[#0a0e1a]/75 backdrop-blur-2xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 py-3 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="active:scale-95 transition-transform duration-150">
          <Logo size="md" />
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-7 text-xs font-semibold tracking-wide">
          <Link
            href="/studio"
            className="text-sky-300 hover:text-white transition-colors duration-150 flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            Studio Creator
          </Link>
          <a
            href="/#calculator"
            className="text-[#a0b4c4] hover:text-sky-300 transition-colors duration-150 flex items-center gap-1.5"
          >
            <Calculator className="w-3.5 h-3.5" />
            Pricing Calculator
          </a>
          <a
            href="/#ecosystem"
            className="text-[#a0b4c4] hover:text-sky-300 transition-colors duration-150 flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            Lulu POD
          </a>
          <Link
            href="/dashboard"
            className="text-[#a0b4c4] hover:text-sky-300 transition-colors duration-150 flex items-center gap-1.5"
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-purple-300" />
            AG Grid Orders
          </Link>
        </nav>

        {/* Trailing Action Badges and CTAs */}
        <div className="flex items-center gap-3">
          {/* Token Status Pill */}
          <div
            onClick={onOpenTokenModal}
            className="cursor-pointer flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/70 border border-sky-400/30 text-sky-300 text-xs font-semibold shadow-inner hover:border-sky-400/60 transition-colors"
            title="Manage micro-tokens"
          >
            <Coins className="w-3.5 h-3.5 text-purple-300 animate-pulse" />
            <span>{tokens} Tokens</span>
          </div>

          {/* Primary Header CTA */}
          <Link
            href="/studio"
            className="glacier-btn font-bold text-xs px-4 py-2 rounded-xl active:scale-95 transition-all duration-150 flex items-center gap-1.5 shadow-md"
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
