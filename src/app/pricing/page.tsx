"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import TokenModal from "@/components/TokenModal";
import PricingCalculator from "@/components/PricingCalculator";
import Logo from "@/components/Logo";
import {
  Sparkles,
  Sliders,
  Type,
  Image as ImageIcon,
  Printer,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
} from "lucide-react";

export default function PricingPage() {
  const [tokenModalOpen, setTokenModalOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen relative bg-[#0a0e1a] text-[#e0e8f0] overflow-x-hidden selection:bg-sky-500/30 selection:text-sky-200 font-sans">
      {/* Glacier Ambient Background Gradients */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[960px] h-[550px] bg-sky-400/10 rounded-full blur-[140px] opacity-60" />
        <div className="absolute top-[35%] -left-32 w-[650px] h-[650px] bg-sky-600/10 rounded-full blur-[160px] opacity-40" />
        <div className="absolute top-[65%] -right-32 w-[650px] h-[650px] bg-cyan-500/10 rounded-full blur-[180px] opacity-35" />
      </div>

      {/* Foreground Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar onOpenTokenModal={() => setTokenModalOpen(true)} />

        <main className="flex-1 space-y-20 md:space-y-28 pt-8 md:pt-14 pb-24">
          {/* Hero Header */}
          <section className="max-w-7xl mx-auto px-4 md:px-8 text-center flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glacier-glass-subtle border border-sky-400/30 text-sky-300 text-xs font-semibold mb-6 glacier-glow">
              <Sparkles className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
              <span>✦ Transparent Creator Economics • Zero Hidden Fees</span>
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
              <span className="text-sky-200">PayPal AI Rails</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white max-w-4xl tracking-tight leading-tight mb-5">
              Calculate Your Exact{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-cyan-200 to-sky-400">
                Manuscript Economics.
              </span>
            </h1>

            <p className="text-base md:text-lg text-[#a0b4c4] max-w-2xl leading-relaxed">
              No \$20/month subscription traps. You only pay for the AI compute model and physical paper you actually use. Customize your page count and format below.
            </p>
          </section>

          {/* Interactive Calculator Section */}
          <section className="max-w-7xl mx-auto px-4 md:px-8">
            <PricingCalculator />
          </section>

          {/* Why Different Book Types Cost Differently */}
          <section className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-sky-300">
                Compute &amp; Manufacturing Transparency
              </span>
              <h2 className="text-2xl md:text-4xl font-extrabold text-white mt-2">
                Why Do Different Books Cost Differently?
              </h2>
              <p className="text-sm md:text-base text-[#a0b4c4] mt-2">
                We believe in ethical, pass-through AI pricing. Here is how your money is divided:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1: Words Books */}
              <div className="p-6 md:p-8 rounded-2xl glacier-glass border border-sky-400/25 space-y-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-400/15 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
                  <Type className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Words &amp; Story Books</h3>
                  <p className="text-xs font-mono text-emerald-300 mt-0.5">$0.03 / page compute (62% margin)</p>
                </div>
                <p className="text-xs text-[#a0b4c4] leading-relaxed">
                  Best for family recipes, personal journals, memory lane stories, and reading books. Uses standard language models with lightweight text layout, keeping your digital or print cost ultra-affordable.
                </p>
                <ul className="space-y-2 text-xs text-slate-300 pt-2 border-t border-white/10">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Low GPU server overhead</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>100% Free 300 DPI vector PDF download</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>First 5 pages 100% free</span>
                  </li>
                </ul>
              </div>

              {/* Card 2: Image & Coloring Books */}
              <div className="p-6 md:p-8 rounded-2xl glacier-glass border border-sky-400/25 space-y-4">
                <div className="w-12 h-12 rounded-xl bg-purple-400/15 border border-purple-400/30 flex items-center justify-center text-purple-300">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Illustrated &amp; Coloring Books</h3>
                  <p className="text-xs font-mono text-purple-300 mt-0.5">$0.09 / page compute (62% margin)</p>
                </div>
                <p className="text-xs text-[#a0b4c4] leading-relaxed">
                  Best for children&apos;s coloring books, dad&apos;s fishing guides, and math puzzle quests. Generates 300 DPI vector linework and enforces character consistency seeds across every page spread.
                </p>
                <ul className="space-y-2 text-xs text-slate-300 pt-2 border-t border-white/10">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                    <span>High-res 300 DPI vector rendering</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                    <span>Character Anchor Lock pipeline</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                    <span>100% Free 300 DPI vector PDF download</span>
                  </li>
                </ul>
              </div>

              {/* Card 3: Lulu Physical Printing */}
              <div className="p-6 md:p-8 rounded-2xl glacier-glass border border-sky-400/25 space-y-4">
                <div className="w-12 h-12 rounded-xl bg-sky-400/15 border border-sky-400/30 flex items-center justify-center text-sky-300">
                  <Printer className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Lulu Archival Printing</h3>
                  <p className="text-xs font-mono text-sky-300 mt-0.5">$0.17 / page paper &amp; binding</p>
                </div>
                <p className="text-xs text-[#a0b4c4] leading-relaxed">
                  Bookstore-grade physical manufacturing. 8.5&quot; &times; 8.5&quot; square softcover bound on heavy 80# satin archival paper with a velvet-touch matte laminate cover.
                </p>
                <ul className="space-y-2 text-xs text-slate-300 pt-2 border-t border-white/10">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
                    <span>No ink bleed-through for coloring</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
                    <span>FSC certified, carbon neutral</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
                    <span>Shipped via certified regional POD</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Pricing FAQ Section */}
          <section className="max-w-5xl mx-auto px-4 md:px-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-extrabold text-white">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-xl glacier-glass-subtle border border-sky-400/20 space-y-2">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-sky-400 shrink-0" />
                  Is there a recurring monthly subscription?
                </h4>
                <p className="text-xs text-[#a0b4c4] leading-relaxed">
                  No. We completely reject monthly subscription fatigue. You only pay when you create or order a book. If you only make one holiday book a year, you only pay once.
                </p>
              </div>

              <div className="p-6 rounded-xl glacier-glass-subtle border border-sky-400/20 space-y-2">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-sky-400 shrink-0" />
                  How do the 5 free pages work?
                </h4>
                <p className="text-xs text-[#a0b4c4] leading-relaxed">
                  Every book created in our studio automatically deducts 5 pages from your billable count. A 24-page bedtime or recipe book only charges you for 19 pages.
                </p>
              </div>

              <div className="p-6 rounded-xl glacier-glass-subtle border border-sky-400/20 space-y-2">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-sky-400 shrink-0" />
                  Can I preview before paying?
                </h4>
                <p className="text-xs text-[#a0b4c4] leading-relaxed">
                  Yes! You can co-create, preview spreads, and edit every text and linework block in our live flipbook preview before placing an order.
                </p>
              </div>

              <div className="p-6 rounded-xl glacier-glass-subtle border border-sky-400/20 space-y-2">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-sky-400 shrink-0" />
                  How does PayPal 1-Click checkout work?
                </h4>
                <p className="text-xs text-[#a0b4c4] leading-relaxed">
                  With PayPal Smart Rails, your verified shipping address is pulled automatically so you don&apos;t have to manually type street addresses or credit card numbers.
                </p>
              </div>
            </div>

            {/* Bottom Call to Action */}
            <div className="mt-12 text-center">
              <Link
                href="/studio"
                className="glacier-btn inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-sm shadow-xl"
              >
                <Sparkles className="w-4 h-4" />
                <span>Start Co-Creating in the Studio</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="mt-12 bg-slate-950/80 border-t border-sky-400/20 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row justify-between items-center gap-6">
            <Link href="/" className="active:scale-95 transition-transform duration-150">
              <Logo size="sm" />
            </Link>

            <nav className="flex flex-wrap justify-center items-center gap-6 text-center text-xs text-[#a0b4c4]">
              <Link href="/pricing" className="text-sky-300 font-bold hover:underline">
                Pricing Calculator
              </Link>
              <Link href="/studio" className="hover:text-sky-300 transition-colors">
                Studio Atelier
              </Link>
              <Link href="/dashboard" className="hover:text-sky-300 transition-colors">
                AG Grid Orders
              </Link>
              <a href="/#ecosystem" className="hover:text-sky-300 transition-colors">
                Lulu POD Specs
              </a>
            </nav>

            <p className="text-xs text-[#a0b4c4] text-center md:text-right max-w-sm">
              &copy; 2026 PaperTales AI Inc. Transparent compute and print-on-demand pricing.
            </p>
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
