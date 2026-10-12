"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import TokenModal from "@/components/TokenModal";
import BackgroundScrollBook from "@/components/BackgroundScrollBook";
import {
  Sparkles,
  BookOpen,
  Printer,
  Coins,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Layers,
  ShoppingBag,
} from "lucide-react";

export default function LandingPage() {
  const [tokenModalOpen, setTokenModalOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen relative bg-[#090D16] text-slate-100 overflow-x-hidden selection:bg-amber-500/30 selection:text-amber-200">
      {/* Ambient Transparent 3D Storybook & Vintage Stack in Page Background */}
      <BackgroundScrollBook />

      {/* Foreground Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar onOpenTokenModal={() => setTokenModalOpen(true)} />

        <main className="flex-1">
          {/* Hero Section */}
          <section className="relative overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-32">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
              {/* Hackathon Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-300 text-xs font-bold mb-8 shadow-sm backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                <span>PayPal AI Hackathon 2026 Showcase Entry</span>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span className="font-semibold text-amber-300">Devpost</span>
              </div>

              {/* Headline */}
              <h1 className="font-editorial text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-5xl mx-auto leading-tight sm:leading-none">
                Co-Create Custom Storybooks with AI. <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-amber-200 via-amber-300 to-amber-500 bg-clip-text text-transparent drop-shadow-sm">
                  Hold the Real Book in Your Hands.
                </span>
              </h1>

              {/* Subtitle */}
              <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
                Say goodbye to rigid avatar templates and \$30/month subscription traps. Turn your child&apos;s wildest stories into crisp 300 DPI coloring books and physical softcovers delivered directly to your doorstep.
              </p>

              {/* Call to Actions */}
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/studio"
                  className="w-full sm:w-auto px-8 py-4 rounded-xl gilded-button text-sm font-extrabold flex items-center justify-center gap-2"
                >
                  Start Co-Creating (5 Free Pages)
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/dashboard"
                  className="w-full sm:w-auto px-7 py-4 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 border border-amber-500/30 font-bold text-sm backdrop-blur-md flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                >
                  <Layers className="w-4 h-4 text-amber-400" />
                  Author Orders Portal (AG Grid)
                </Link>
              </div>

              {/* Key Value Badges */}
              <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
                <div className="frosted-glass-card frosted-glass-card-hover p-4 rounded-2xl flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-400/15 text-amber-300 border border-amber-400/30 flex items-center justify-center shrink-0">
                    <Coins className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-100">Token-Based</h4>
                    <p className="text-[10px] text-slate-400">Zero subscription fatigue</p>
                  </div>
                </div>

                <div className="frosted-glass-card frosted-glass-card-hover p-4 rounded-2xl flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center justify-center shrink-0">
                    <Printer className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-100">Lulu Print POD</h4>
                    <p className="text-[10px] text-slate-400">Physical softcover delivery</p>
                  </div>
                </div>

                <div className="frosted-glass-card frosted-glass-card-hover p-4 rounded-2xl flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-sky-500/15 text-sky-300 border border-sky-500/30 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-100">PayPal Rails</h4>
                    <p className="text-[10px] text-slate-400">1-click address &amp; checkout</p>
                  </div>
                </div>

                <div className="frosted-glass-card frosted-glass-card-hover p-4 rounded-2xl flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center justify-center shrink-0">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-100">Channel3 Bundling</h4>
                    <p className="text-[10px] text-slate-400">Matching art supply kits</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Feature Comparison Section: Why PaperTales Wins */}
          <section className="py-20 bg-[#0D1322]/85 backdrop-blur-xl border-y border-amber-500/20">
            <div className="max-w-5xl mx-auto px-4 sm:px-6">
              <div className="text-center mb-14">
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-400 block mb-2">
                  Nocturne Atelier Publishing Standard
                </span>
                <h2 className="font-editorial text-3xl sm:text-4xl font-extrabold text-white">
                  The New Standard in Children&apos;s Book Publishing
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-3 max-w-xl mx-auto">
                  Comparing PaperTales AI with old legacy publishers and generic AI wrappers.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Old Legacy */}
                <div className="p-7 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">Legacy Publishers</span>
                    <h3 className="text-lg font-bold text-slate-300 mt-1 mb-4">Wonderbly &bull; Hooray Heroes</h3>
                    <ul className="text-xs text-slate-400 space-y-3">
                      <li className="flex items-start gap-2 text-rose-400">
                        <span>&times;</span> Rigid template avatars (preset hair &amp; skin)
                      </li>
                      <li className="flex items-start gap-2 text-rose-400">
                        <span>&times;</span> Expensive (\$35–\$50 per book + shipping)
                      </li>
                      <li className="flex items-start gap-2 text-rose-400">
                        <span>&times;</span> No custom coloring pages or prompts
                      </li>
                      <li className="flex items-start gap-2 text-rose-400">
                        <span>&times;</span> 10–14 days delivery wait
                      </li>
                    </ul>
                  </div>
                  <div className="mt-8 pt-4 border-t border-white/10 text-xs font-semibold text-slate-500">
                    Rigid Template Model
                  </div>
                </div>

                {/* Generic AI Wrappers */}
                <div className="p-7 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">AI Apps</span>
                    <h3 className="text-lg font-bold text-slate-300 mt-1 mb-4">Generic Prompt Wrappers</h3>
                    <ul className="text-xs text-slate-400 space-y-3">
                      <li className="flex items-start gap-2 text-amber-400">
                        <span>&times;</span> Forces \$20+/month subscription fatigue
                      </li>
                      <li className="flex items-start gap-2 text-amber-400">
                        <span>&times;</span> Inconsistent characters across pages
                      </li>
                      <li className="flex items-start gap-2 text-amber-400">
                        <span>&times;</span> Digital-only: No physical printing pipeline
                      </li>
                      <li className="flex items-start gap-2 text-amber-400">
                        <span>&times;</span> Broken margins and non-print PDFs
                      </li>
                    </ul>
                  </div>
                  <div className="mt-8 pt-4 border-t border-white/10 text-xs font-semibold text-slate-500">
                    Subscription Fatigue
                  </div>
                </div>

                {/* PaperTales AI */}
                <div className="p-7 rounded-2xl border-2 border-amber-400/80 bg-gradient-to-b from-[#141C2E] to-[#0D1322] shadow-2xl gold-glow flex flex-col justify-between relative">
                  <span className="absolute -top-3.5 right-6 text-[10px] font-extrabold px-3 py-1 rounded-full gilded-button shadow-md">
                    Recommended
                  </span>
                  <div>
                    <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider font-mono">Our Platform</span>
                    <h3 className="font-editorial text-2xl font-bold text-white mt-1 mb-4">PaperTales AI Studio</h3>
                    <ul className="text-xs text-slate-200 space-y-3">
                      <li className="flex items-start gap-2 text-amber-200 font-semibold">
                        <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                        Prompt co-creation &amp; visual consistency lock
                      </li>
                      <li className="flex items-start gap-2 text-amber-200 font-semibold">
                        <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                        Flexible micro-tokens &bull; No monthly subscriptions
                      </li>
                      <li className="flex items-start gap-2 text-amber-200 font-semibold">
                        <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                        Instant 300 DPI PDF OR Lulu softcover POD delivery
                      </li>
                      <li className="flex items-start gap-2 text-amber-200 font-semibold">
                        <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                        PayPal 1-click address capture &amp; dynamic checkout
                      </li>
                    </ul>
                  </div>
                  <div className="mt-8 pt-4 border-t border-amber-500/25">
                    <Link
                      href="/studio"
                      className="block text-center py-3 px-5 gilded-button rounded-xl font-extrabold text-xs shadow-lg transition-transform"
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
        <footer className="border-t border-amber-500/20 bg-[#090D16] py-10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
                <BookOpen className="w-3.5 h-3.5" />
              </div>
              <span className="font-bold text-white font-editorial text-sm">PaperTales AI</span>
              <span>&bull; Submitted to PayPal AI Hackathon 2026</span>
            </div>

            <div className="flex items-center gap-5">
              <Link href="/studio" className="hover:text-amber-300 transition-colors">Studio</Link>
              <Link href="/dashboard" className="hover:text-amber-300 transition-colors">AG Grid Dashboard</Link>
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-amber-300 transition-colors"
              >
                MIT License Repository
              </a>
            </div>
          </div>
        </footer>
      </div>

      {/* Token Modal */}
      <TokenModal
        isOpen={tokenModalOpen}
        onClose={() => setTokenModalOpen(false)}
      />
    </div>
  );
}
