"use client";

import React from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import {
  Sparkles,
  Coins,
  LayoutDashboard,
  Calculator,
  Printer,
  BookOpen,
  LogIn,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

interface NavbarProps {
  onOpenTokenModal?: () => void;
  onOpenOrderTracking?: () => void;
}

export default function Navbar({ onOpenTokenModal }: NavbarProps) {
  const { isAnonymous, profile, tokenBalance, signInWithGoogle, signOut } = useAuth();

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
        <div className="flex items-center gap-2.5">
          {/* Token Status Pill */}
          <div
            onClick={onOpenTokenModal}
            className="cursor-pointer flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-300 text-amber-900 text-xs font-semibold shadow-sm hover:border-amber-400 transition-colors"
            title="Manage micro-tokens"
          >
            <Coins className="w-3.5 h-3.5 text-amber-600" />
            <span>{tokenBalance} Tokens</span>
          </div>

          {/* Auth / User Menu */}
          {isAnonymous ? (
            <button
              onClick={() => signInWithGoogle()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 bg-white/80 hover:bg-white text-slate-700 text-xs font-semibold transition-colors"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign in</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard"
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white/80 hover:bg-white text-slate-700 text-xs font-semibold transition-colors"
                title="My Orders & Print Jobs"
              >
                {profile?.photoUrl ? (
                  <img
                    src={profile.photoUrl}
                    alt={profile.displayName || "User"}
                    className="w-4 h-4 rounded-full"
                  />
                ) : (
                  <LayoutDashboard className="w-3.5 h-3.5 text-amber-600" />
                )}
                <span className="max-w-[90px] truncate">
                  {profile?.displayName?.split(" ")[0] || "Account"}
                </span>
              </Link>
              <button
                onClick={() => signOut()}
                className="p-1.5 rounded-lg border border-slate-200 bg-white/80 hover:bg-red-50 hover:text-red-600 text-slate-500 transition-colors"
                title="Sign out"
                aria-label="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

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
