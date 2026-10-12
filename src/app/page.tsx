"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import TokenModal from "@/components/TokenModal";
import ScrollOpeningBook from "@/components/ScrollOpeningBook";
import {
  Sparkles,
  BookOpen,
  Printer,
  Coins,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Palette,
  HeartHandshake,
  Layers,
  ShoppingBag,
} from "lucide-react";

export default function LandingPage() {
  const [tokenModalOpen, setTokenModalOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar onOpenTokenModal={() => setTokenModalOpen(true)} />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28 bg-gradient-to-b from-white via-slate-50 to-blue-50/30">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            {/* Hackathon Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/80 border border-blue-200 text-blue-800 text-xs font-bold mb-6 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-spin" />
              <span>PayPal AI Hackathon 2026 Showcase Entry</span>
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
              <span className="font-semibold text-blue-600">Devpost</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight sm:leading-none">
              Co-Create Custom Books with AI. <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-blue-700 via-sky-600 to-indigo-700 bg-clip-text text-transparent">
                Hold the Real Book in Your Hands.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
              Say goodbye to rigid avatar templates and \$30/month subscription traps. Turn your child&apos;s wildest stories into crisp 300 DPI coloring books and physical paperbacks delivered to your doorstep.
            </p>

            {/* Call to Actions */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <Link
                href="/studio"
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-extrabold text-sm shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
              >
                Start Co-Creating (Free Tokens)
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/dashboard"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold text-sm shadow-sm flex items-center justify-center gap-2 transition-all"
              >
                <Layers className="w-4 h-4 text-indigo-600" />
                Author Orders Portal (AG Grid)
              </Link>
            </div>

            {/* Interactive Scroll-Opening 3D Storybook */}
            <div className="mt-8 sm:mt-12 w-full">
              <ScrollOpeningBook />
            </div>

            {/* Key Value Badges */}
            <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto text-left">
              <div className="bg-white/80 backdrop-blur-sm p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                  <Coins className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Token-Based</h4>
                  <p className="text-[10px] text-slate-500">No monthly subscriptions</p>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <Printer className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Lulu Print-on-Demand</h4>
                  <p className="text-[10px] text-slate-500">Physical paperback delivery</p>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">PayPal Rails</h4>
                  <p className="text-[10px] text-slate-500">1-click address &amp; checkout</p>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Channel3 Bundling</h4>
                  <p className="text-[10px] text-slate-500">Companion art supplies</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Comparison: Why PaperTales Wins */}
        <section className="py-16 bg-white border-y border-slate-200/80">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                The New Standard in Children&apos;s Book Publishing
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-xl mx-auto">
                Comparing PaperTales AI with old legacy publishers and generic AI wrappers.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Old Legacy */}
              <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Legacy Publishers</span>
                  <h3 className="text-lg font-bold text-slate-700 mt-1 mb-3">Wonderbly &bull; Hooray Heroes</h3>
                  <ul className="text-xs text-slate-600 space-y-2.5">
                    <li className="flex items-start gap-2 text-rose-600">
                      <span>&times;</span> Rigid template avatars (preset hair &amp; skin)
                    </li>
                    <li className="flex items-start gap-2 text-rose-600">
                      <span>&times;</span> Expensive (\$35–\$50 per book + shipping)
                    </li>
                    <li className="flex items-start gap-2 text-rose-600">
                      <span>&times;</span> No custom coloring pages or prompts
                    </li>
                    <li className="flex items-start gap-2 text-rose-600">
                      <span>&times;</span> 10–14 days delivery wait
                    </li>
                  </ul>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-200 text-xs font-semibold text-slate-400">
                  Fixed Gift Model
                </div>
              </div>

              {/* Generic AI Wrappers */}
              <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">AI Apps</span>
                  <h3 className="text-lg font-bold text-slate-700 mt-1 mb-3">Generic Prompt Wrappers</h3>
                  <ul className="text-xs text-slate-600 space-y-2.5">
                    <li className="flex items-start gap-2 text-amber-600">
                      <span>&times;</span> Forces \$20+/month subscription fatigue
                    </li>
                    <li className="flex items-start gap-2 text-amber-600">
                      <span>&times;</span> Inconsistent characters across pages
                    </li>
                    <li className="flex items-start gap-2 text-amber-600">
                      <span>&times;</span> Digital-only: No physical printing pipeline
                    </li>
                    <li className="flex items-start gap-2 text-amber-600">
                      <span>&times;</span> Broken margins and non-print PDFs
                    </li>
                  </ul>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-200 text-xs font-semibold text-slate-400">
                  Subscription Fatigue
                </div>
              </div>

              {/* PaperTales AI */}
              <div className="p-6 rounded-2xl border-2 border-blue-600 bg-blue-50/30 shadow-lg flex flex-col justify-between relative">
                <span className="absolute -top-3 right-5 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-blue-600 text-white shadow-sm">
                  Recommended
                </span>
                <div>
                  <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Our Platform</span>
                  <h3 className="text-xl font-black text-slate-900 mt-1 mb-3">PaperTales AI Studio</h3>
                  <ul className="text-xs text-slate-800 space-y-2.5">
                    <li className="flex items-start gap-2 text-emerald-700 font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      Full prompt co-creation &amp; visual consistency lock
                    </li>
                    <li className="flex items-start gap-2 text-emerald-700 font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      Flexible token packs &bull; No monthly subscriptions
                    </li>
                    <li className="flex items-start gap-2 text-emerald-700 font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      Instant 300 DPI PDF OR Lulu softcover POD delivery
                    </li>
                    <li className="flex items-start gap-2 text-emerald-700 font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      PayPal 1-click address capture &amp; dynamic checkout
                    </li>
                  </ul>
                </div>
                <div className="mt-6 pt-4 border-t border-blue-200">
                  <Link
                    href="/studio"
                    className="block text-center py-2.5 px-4 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-bold text-xs shadow-md transition-colors"
                  >
                    Create Your First Book &rarr;
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-600" />
            <span className="font-bold text-slate-800">PaperTales AI</span>
            <span>&bull; Built for PayPal AI Hackathon 2026</span>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/studio" className="hover:text-blue-600 transition-colors">Studio</Link>
            <Link href="/dashboard" className="hover:text-blue-600 transition-colors">AG Grid Dashboard</Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-blue-600 transition-colors"
            >
              MIT License Repository
            </a>
          </div>
        </div>
      </footer>

      {/* Token Modal */}
      <TokenModal
        isOpen={tokenModalOpen}
        onClose={() => setTokenModalOpen(false)}
      />
    </div>
  );
}
