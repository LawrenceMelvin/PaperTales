"use client";

import React, { useState, useId } from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import TokenModal from "@/components/TokenModal";
import BackgroundScrollBook from "@/components/BackgroundScrollBook";
import {
  Sparkles,
  BookOpen,
  Printer,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sliders,
  Palette,
  FileText,
  Lock,
  Layers,
  Eye,
  PenTool,
  Clock,
  Award,
  Users,
  GraduationCap,
  Sparkle,
  Truck,
  ExternalLink,
  X,
} from "lucide-react";

export default function LandingPage() {
  const [tokenModalOpen, setTokenModalOpen] = useState(false);
  const [chapterModalOpen, setChapterModalOpen] = useState(false);
  const [vectorGuideActive, setVectorGuideActive] = useState(false);

  // Dynamic Economics Engine State
  const [pageCount, setPageCount] = useState<number>(24);
  const [selectedEdition, setSelectedEdition] = useState<"digital" | "physical" | "bundle">("physical");

  // Economic calculations matching Stitch Glacier Studio
  const billablePages = Math.max(0, pageCount - 5);
  let bindingCost = 0;
  let aiCost = 0;
  let margin = 0;
  let kitCost = 0;
  let totalOrder = 0;

  if (selectedEdition === "digital") {
    bindingCost = 0;
    aiCost = billablePages * 0.05;
    margin = 2.5;
    totalOrder = 4.99;
  } else if (selectedEdition === "physical") {
    bindingCost = billablePages * 0.17;
    aiCost = billablePages * 0.05;
    margin = (bindingCost + aiCost) * 1.62 + 2.5;
    totalOrder = bindingCost + aiCost + margin;
  } else {
    bindingCost = billablePages * 0.17;
    aiCost = billablePages * 0.05;
    margin = (bindingCost + aiCost) * 1.62 + 2.5;
    kitCost = 14.99;
    totalOrder = bindingCost + aiCost + margin + kitCost;
  }

  return (
    <div className="flex flex-col min-h-screen relative bg-[#0a0e1a] text-[#e0e8f0] overflow-x-hidden selection:bg-sky-500/30 selection:text-sky-200 font-sans">
      {/* Glacier Ambient Background Gradients / Aurora Frost */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[960px] h-[550px] bg-sky-400/10 rounded-full blur-[140px] opacity-60" />
        <div className="absolute top-[32%] -left-32 w-[650px] h-[650px] bg-sky-600/10 rounded-full blur-[160px] opacity-40" />
        <div className="absolute top-[65%] -right-32 w-[650px] h-[650px] bg-cyan-500/10 rounded-full blur-[180px] opacity-35" />
        <div className="absolute bottom-10 left-1/3 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[170px] opacity-30" />
      </div>

      {/* Ambient Transparent 3D Storybook & Vintage Stack in Page Background */}
      <BackgroundScrollBook />

      {/* Foreground Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar onOpenTokenModal={() => setTokenModalOpen(true)} />

        <main className="flex-1 space-y-24 md:space-y-36 pt-8 md:pt-14 pb-24">
          {/* ========================================================================= */}
          {/* HERO SECTION - THE ENCHANTING 3D CENTERPIECE                              */}
          {/* ========================================================================= */}
          <section className="max-w-7xl mx-auto px-4 md:px-8 text-center flex flex-col items-center" id="hero">
            {/* Top Prestige Laurel Pill */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glacier-glass-subtle border border-sky-400/30 text-sky-300 text-xs font-semibold mb-6 glacier-glow">
              <Sparkles className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
              <span>✦ The Premier Agentic Story &amp; Coloring Studio</span>
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
              <span className="text-sky-200">PayPal AI Hackathon 2026</span>
            </div>

            {/* Main Literary Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white max-w-5xl tracking-tight leading-tight mb-6">
              Turn Family Bedtime Whispers Into{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-cyan-200 to-sky-400 italic">
                Bound, Tangible
              </span>{" "}
              Keepsakes.
            </h1>

            {/* Editorial Subtitle */}
            <p className="text-base md:text-lg text-[#a0b4c4] max-w-3xl mb-10 leading-relaxed font-normal">
              Co-create original narrative adventures with our multi-agent AI editorial director, generate 300 DPI print-ready vector line art, and ship bookstore-grade 8.5x8.5 softcover editions to your doorstep.
            </p>

            {/* Dual Hero Actions */}
            <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
              <Link
                href="/studio"
                className="glacier-btn text-base font-bold px-8 py-4 rounded-xl flex items-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-xl"
              >
                <Sparkles className="w-4 h-4" />
                <span>Start Co-Creating (5 Free Pages)</span>
              </Link>
              <a
                href="#ecosystem"
                className="glacier-glass px-7 py-4 rounded-xl border border-sky-400/30 text-white hover:text-sky-300 hover:border-sky-400/60 text-base font-semibold flex items-center gap-2 transition-all shadow-lg"
              >
                <BookOpen className="w-4 h-4 text-sky-400" />
                <span>Explore Print Quality</span>
              </a>
            </div>

            {/* THE 3D BOOK ARTIFACT STAGE */}
            <div className="w-full relative max-w-5xl group floating-stage">
              {/* Glacier Light Halo Backdrop */}
              <div className="absolute inset-0 bg-sky-400/15 rounded-3xl filter blur-3xl transform scale-95 opacity-70" />

              {/* Book Perspective Container */}
              <div className="relative rounded-2xl overflow-hidden glacier-glass p-2 md:p-4 shadow-2xl border border-sky-400/25">
                {/* Perspective Floating Showcase Ribbon */}
                <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 bg-slate-900/80 backdrop-blur-md rounded-xl mb-3 border border-sky-400/20 gap-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-ping" />
                    <span className="text-xs font-bold text-sky-300 tracking-wider uppercase">
                      Live Spread Inspector
                    </span>
                    <span className="text-slate-600 text-xs">|</span>
                    <span className="text-xs font-medium text-[#a0b4c4]">
                      Chapter 1: Barnaby’s Starlight Adventure
                    </span>
                  </div>

                  {/* Interactive View State Controls */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setChapterModalOpen(true)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-sky-500/15 text-sky-300 border border-sky-400/30 hover:bg-sky-500/25 transition-all flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Preview Chapter 1 Text</span>
                    </button>
                    <button
                      onClick={() => setVectorGuideActive(!vectorGuideActive)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all flex items-center gap-1.5 ${
                        vectorGuideActive
                          ? "bg-sky-400/25 text-white border-sky-400 shadow-sm"
                          : "bg-slate-800/60 text-[#a0b4c4] hover:text-sky-300 border-sky-500/20"
                      }`}
                    >
                      <PenTool className="w-3.5 h-3.5" />
                      <span>{vectorGuideActive ? "✓ Vector Guides On" : "Toggle Vector Guides"}</span>
                    </button>
                  </div>
                </div>

                {/* Open Book Centerpiece Visual */}
                <div className="relative rounded-xl overflow-hidden aspect-[1.79/1] max-h-[580px] w-full border border-sky-400/20 shadow-inner bg-slate-950">
                  <Image
                    src="/storybook-centerpiece.png"
                    alt="Barnaby Starlight Adventure 3D Open Book Centerpiece"
                    fill
                    className="object-cover object-center transform group-hover:scale-[1.01] transition-transform duration-700"
                    priority
                  />

                  {/* Safe Margin Print Guides (Interactive Overlay) */}
                  <div
                    className={`absolute inset-0 pointer-events-none transition-opacity duration-300 border-4 border-dashed border-sky-400/70 m-4 sm:m-8 rounded-lg flex items-center justify-center bg-slate-950/40 backdrop-blur-xs ${
                      vectorGuideActive ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    <span className="glacier-glass text-sky-300 text-xs sm:text-sm font-bold px-4 py-2 rounded-full border border-sky-400/60 shadow-xl">
                      300 DPI Bleed Boundary • Gutter 0.25in Safe Print Area
                    </span>
                  </div>
                </div>

                {/* Bottom Stage Calibration Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-left">
                  <div className="p-3.5 rounded-xl glacier-glass-subtle border border-sky-400/20 flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-sky-400 shrink-0" />
                    <div>
                      <p className="text-[11px] text-[#a0b4c4]">Resolution</p>
                      <p className="text-xs sm:text-sm font-bold text-white">300 DPI Archival</p>
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl glacier-glass-subtle border border-sky-400/20 flex items-center gap-3">
                    <Award className="w-6 h-6 text-sky-400 shrink-0" />
                    <div>
                      <p className="text-[11px] text-[#a0b4c4]">Line Precision</p>
                      <p className="text-xs sm:text-sm font-bold text-white">100% Vector Lines</p>
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl glacier-glass-subtle border border-sky-400/20 flex items-center gap-3">
                    <Truck className="w-6 h-6 text-sky-400 shrink-0" />
                    <div>
                      <p className="text-[11px] text-[#a0b4c4]">Fulfillment</p>
                      <p className="text-xs sm:text-sm font-bold text-white">48-Hr Lulu Dispatch</p>
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl glacier-glass-subtle border border-sky-400/20 flex items-center gap-3">
                    <ShieldCheck className="w-6 h-6 text-sky-400 shrink-0" />
                    <div>
                      <p className="text-[11px] text-[#a0b4c4]">Quality Guarantee</p>
                      <p className="text-xs sm:text-sm font-bold text-white">0% AI Artifacts</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ========================================================================= */}
          {/* BARNABY'S REAL-TIME ECONOMICS ENGINE (INTERACTIVE PRICING CALCULATOR)      */}
          {/* ========================================================================= */}
          <section className="max-w-7xl mx-auto px-4 md:px-8" id="calculator">
            <div className="relative rounded-2xl p-6 md:p-12 glacier-glass overflow-hidden shadow-2xl border border-sky-400/25">
              {/* Watermark Glow */}
              <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-sky-400/10 rounded-full blur-3xl pointer-events-none" />

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                {/* Left Column: Dynamic Sliders & Format Selection */}
                <div className="lg:col-span-7 space-y-8">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glacier-glass-subtle text-sky-300 text-xs font-semibold border border-sky-400/20 mb-3">
                      <Sliders className="w-3.5 h-3.5" />
                      <span>Barnaby&apos;s Real-Time Economics Engine</span>
                    </div>
                    <h2 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight">
                      Configure Your Bespoke Manuscript
                    </h2>
                    <p className="text-sm md:text-base text-[#a0b4c4] mt-2">
                      Transparent creator-first pricing. Watch your billable page economics adjust dynamically with automatic free introductory pages.
                    </p>
                  </div>

                  {/* Page Count Slider Card */}
                  <div className="p-6 rounded-xl glacier-glass-subtle border border-sky-400/20 space-y-4">
                    <div className="flex justify-between items-center">
                      <label htmlFor="pageRange" className="text-sm font-semibold text-white flex items-center gap-2">
                        <span>Selected Book Volume</span>
                        <span className="text-xs text-sky-300 px-2 py-0.5 rounded-md bg-sky-400/15 border border-sky-400/30">
                          5 to 64 Pages
                        </span>
                      </label>
                      <span className="text-2xl font-black text-sky-300 font-mono">
                        {pageCount} <span className="text-sm font-normal text-[#a0b4c4]">Pages</span>
                      </span>
                    </div>

                    {/* Interactive Range Input */}
                    <input
                      id="pageRange"
                      type="range"
                      min={5}
                      max={64}
                      value={pageCount}
                      onChange={(e) => setPageCount(parseInt(e.target.value, 10))}
                      className="w-full h-2 bg-slate-800/80 rounded-lg appearance-none cursor-pointer slider-thumb accent-sky-400"
                    />

                    <div className="flex justify-between text-xs text-[#a0b4c4] font-medium">
                      <button
                        type="button"
                        onClick={() => setPageCount(5)}
                        className={`hover:text-sky-300 transition-colors ${pageCount === 5 ? "text-sky-300 font-bold" : ""}`}
                      >
                        5 Pages (Pocket Tale)
                      </button>
                      <button
                        type="button"
                        onClick={() => setPageCount(24)}
                        className={`hover:text-sky-300 transition-colors ${pageCount === 24 ? "text-sky-300 font-bold" : ""}`}
                      >
                        24 Pages (Standard Bedtime)
                      </button>
                      <button
                        type="button"
                        onClick={() => setPageCount(64)}
                        className={`hover:text-sky-300 transition-colors ${pageCount === 64 ? "text-sky-300 font-bold" : ""}`}
                      >
                        64 Pages (Epic Atelier)
                      </button>
                    </div>
                  </div>

                  {/* Edition Format Selector Toggles */}
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-[#a0b4c4] uppercase tracking-wider block">
                      Choose Publication Edition
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* Option 1: PDF */}
                      <button
                        type="button"
                        onClick={() => setSelectedEdition("digital")}
                        className={`p-4 rounded-xl text-left border transition-all flex flex-col justify-between ${
                          selectedEdition === "digital"
                            ? "border-2 border-sky-400 bg-sky-500/15 glacier-glow"
                            : "border-white/10 bg-slate-900/40 hover:border-sky-400/40"
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <FileText className="w-5 h-5 text-sky-400" />
                          <span className="text-xs font-bold text-slate-300">$4.99 Flat</span>
                        </div>
                        <div className="mt-3">
                          <p className="text-sm font-bold text-white">Digital PDF Only</p>
                          <p className="text-xs text-[#a0b4c4]">300 DPI Instant Vector</p>
                        </div>
                      </button>

                      {/* Option 2: Physical + PDF */}
                      <button
                        type="button"
                        onClick={() => setSelectedEdition("physical")}
                        className={`p-4 rounded-xl text-left border transition-all flex flex-col justify-between ${
                          selectedEdition === "physical"
                            ? "border-2 border-sky-400 bg-sky-500/15 glacier-glow"
                            : "border-white/10 bg-slate-900/40 hover:border-sky-400/40"
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <BookOpen className="w-5 h-5 text-sky-400" />
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-sky-400 text-slate-950 font-extrabold">
                            Recommended
                          </span>
                        </div>
                        <div className="mt-3">
                          <p className="text-sm font-bold text-sky-300">Lulu Softcover + PDF</p>
                          <p className="text-xs text-cyan-200/80">Archival Paper Print</p>
                        </div>
                      </button>

                      {/* Option 3: Full Atelier Bundle */}
                      <button
                        type="button"
                        onClick={() => setSelectedEdition("bundle")}
                        className={`p-4 rounded-xl text-left border transition-all flex flex-col justify-between ${
                          selectedEdition === "bundle"
                            ? "border-2 border-sky-400 bg-sky-500/15 glacier-glow"
                            : "border-white/10 bg-slate-900/40 hover:border-sky-400/40"
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <Palette className="w-5 h-5 text-sky-400" />
                          <span className="text-xs text-sky-300 font-semibold">+Channel3 Kit</span>
                        </div>
                        <div className="mt-3">
                          <p className="text-sm font-bold text-white">Full Atelier Bundle</p>
                          <p className="text-xs text-[#a0b4c4]">Book + 24 Artist Markers</p>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Free Promotion Banner */}
                  <div className="p-4 rounded-xl glacier-glass-subtle border border-sky-400/30 flex items-center gap-4">
                    <Sparkles className="w-7 h-7 text-sky-400 shrink-0" />
                    <div className="text-left">
                      <p className="text-sm font-bold text-sky-300">Introductory Atelier Gift Applied</p>
                      <p className="text-xs text-[#a0b4c4]">
                        Your first 5 story &amp; coloring pages are 100% complimentary on every generation.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Column: Live Billable Breakdown & Instant Checkout */}
                <div className="lg:col-span-5 p-6 md:p-8 rounded-xl glacier-glass border border-sky-400/25 shadow-xl space-y-6">
                  <h3 className="text-lg font-bold text-white border-b border-white/10 pb-4">
                    Real-Time Economic Breakdown
                  </h3>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between text-[#a0b4c4]">
                      <span>Total Page Volume</span>
                      <span className="text-white font-semibold">{pageCount} pgs</span>
                    </div>
                    <div className="flex justify-between text-sky-300 font-semibold">
                      <span>Introductory Free Gift</span>
                      <span>-5 pgs</span>
                    </div>
                    <div className="flex justify-between text-[#a0b4c4]">
                      <span>Net Billable Pages</span>
                      <span className="text-white font-semibold">{billablePages} pgs</span>
                    </div>

                    <div className="h-px bg-white/10 my-2" />

                    <div className="flex justify-between text-[#a0b4c4]">
                      <span>Paper &amp; Lulu Binding ($0.17/pg)</span>
                      <span className="text-white font-medium">${bindingCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-[#a0b4c4]">
                      <span>AI Vector Linework ($0.05/pg)</span>
                      <span className="text-white font-medium">${aiCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-[#a0b4c4]">
                      <span>Studio Sustainable Tier (62% margin)</span>
                      <span className="text-white font-medium">${margin.toFixed(2)}</span>
                    </div>
                    {selectedEdition === "bundle" && (
                      <div className="flex justify-between text-sky-300 font-semibold">
                        <span>Channel3 Companion Kit Add-on</span>
                        <span>$14.99</span>
                      </div>
                    )}
                  </div>

                  {/* Total Price Display */}
                  <div className="p-5 rounded-xl bg-slate-950/70 border border-sky-400/40 flex justify-between items-center glacier-glow">
                    <div>
                      <p className="text-xs text-[#a0b4c4]">Instant Order Total</p>
                      <p className="text-3xl font-black text-sky-300 font-mono">
                        ${totalOrder.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-400/15 text-sky-300 border border-sky-400/30">
                        Tax &amp; 300 DPI Validated
                      </span>
                    </div>
                  </div>

                  {/* Instant Checkout CTA */}
                  <div className="space-y-3 pt-2">
                    <Link
                      href="/studio"
                      className="w-full glacier-btn py-4 px-6 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-95 transition-all shadow-lg text-[#001f2e]"
                    >
                      <Lock className="w-4 h-4" />
                      <span>PayPal 1-Click Instant Checkout</span>
                    </Link>

                    <div className="flex items-center justify-center gap-4 text-xs text-[#a0b4c4] pt-2">
                      <span className="flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-sky-400" /> 256-Bit SSL
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-sky-400" /> 48h Print Guarantee
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-sky-400" /> Lulu Verified POD
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ========================================================================= */}
          {/* PHYSICAL PRINT & PARTNER ECOSYSTEM (LULU POD + CHANNEL3)                   */}
          {/* ========================================================================= */}
          <section className="max-w-7xl mx-auto px-4 md:px-8" id="ecosystem">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full glacier-glass-subtle text-sky-300 text-xs font-semibold border border-sky-400/20 mb-4">
                <Printer className="w-3.5 h-3.5" />
                <span>Craftsmanship &amp; Companion Art Ecosystem</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
                The Tangible Keepsake Experience
              </h2>
              <p className="text-base md:text-lg text-[#a0b4c4] mt-3">
                We bridge artificial intelligence with bookstore-quality tactile printmaking. In certified partnership with Lulu Print-on-Demand and Channel3 Artistry.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Product Showcase Image */}
              <div className="lg:col-span-7 relative group">
                <div className="rounded-2xl overflow-hidden border border-sky-400/25 glacier-glass shadow-2xl relative aspect-[1.34/1]">
                  <Image
                    src="/lulu-channel3-product.png"
                    alt="Product render of 8.5x8.5 softcover storybook and Channel3 art kit"
                    fill
                    className="object-cover transform group-hover:scale-[1.02] transition-transform duration-500"
                  />
                </div>
                {/* Tactile Badge Float */}
                <div className="absolute -bottom-4 right-6 p-4 rounded-xl glacier-glass border border-sky-400/40 shadow-xl hidden sm:flex items-center gap-3">
                  <BookOpen className="w-8 h-8 text-sky-400" />
                  <div>
                    <p className="text-sm font-bold text-white">8.5 × 8.5 in Softcover</p>
                    <p className="text-xs text-[#a0b4c4]">80# Archival Satin Interior</p>
                  </div>
                </div>
              </div>

              {/* Right Specification & Address Autofill Details */}
              <div className="lg:col-span-5 space-y-6">
                {/* Lulu Certified Specs Card */}
                <div className="p-6 rounded-2xl glacier-glass border border-sky-400/25 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-bold text-sky-300 flex items-center gap-2">
                      <Printer className="w-4 h-4" />
                      Lulu POD Print Specifications
                    </span>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-sky-400/20 text-sky-300 border border-sky-400/30">
                      Certified
                    </span>
                  </div>
                  <ul className="space-y-2.5 text-xs text-[#a0b4c4] leading-relaxed">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-white">Format:</strong> 8.5 × 8.5 inch perfect-bound square children&apos;s storybook.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-white">Interior Stock:</strong> 80# Satin archival paper (no ink bleed-through).
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-white">Cover Finish:</strong> Velvet-touch matte laminate with UV spine seal.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-white">Eco Commitment:</strong> FSC-certified, carbon-neutral regional printing.
                      </span>
                    </li>
                  </ul>
                </div>

                {/* Channel3 Companion Kit Card */}
                <div className="p-6 rounded-2xl glacier-glass border border-sky-400/25 space-y-3">
                  <span className="text-base font-bold text-sky-300 flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    Channel3 Companion Art Kit
                  </span>
                  <p className="text-xs text-[#a0b4c4] leading-relaxed">
                    Includes 24 custom dual-tip artist markers and mess-free crayons specially formulated for heavy archival paper stocks. Perfect for kids coloring in custom AI vector pages without smudges.
                  </p>
                </div>

                {/* PayPal One-Touch Autofill Simulation */}
                <div className="p-5 rounded-2xl glacier-glass border border-sky-400/20 space-y-3">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-[#a0b4c4] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                      PayPal One-Touch Address Autofill
                    </span>
                    <span className="text-sky-300 font-bold">Instant Dispatch</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-sky-400/15 border border-sky-400/30 flex items-center justify-center text-sky-300">
                        <Truck className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-white">Auto-detected Shipping Destination</p>
                        <p className="text-[11px] text-[#a0b4c4]">Verified Postal Coordinates • Global Routing</p>
                      </div>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-sky-400" />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ========================================================================= */}
          {/* DUAL AGENTIC WORKFLOWS SHOWCASE                                           */}
          {/* ========================================================================= */}
          <section className="max-w-7xl mx-auto px-4 md:px-8" id="studio">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full glacier-glass-subtle text-sky-300 text-xs font-semibold border border-sky-400/20 mb-4">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Dual Generative Directors</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
                Two Tailored Creative Studios
              </h2>
              <p className="text-base md:text-lg text-[#a0b4c4] mt-3">
                Whether bonding with your child at bedtime or orchestrating classroom literacy programs, our specialized agent pipelines adapt seamlessly.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Mode A: Family Bedtime Atelier */}
              <div className="p-8 rounded-2xl glacier-glass border border-sky-400/25 hover:border-sky-400/50 transition-all duration-300 relative group overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-sky-400/10 rounded-full blur-3xl pointer-events-none" />
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-sky-400/15 border border-sky-400/30 text-sky-300">
                    <Users className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-sky-300 uppercase tracking-wider">Mode A</span>
                    <h3 className="text-xl font-bold text-white">Family Bedtime Atelier</h3>
                  </div>
                </div>
                <p className="text-sm text-[#a0b4c4] mb-6 leading-relaxed">
                  Transform nighttime whispers into real published hard copies. Capture voice recordings of your child’s bedtime story ideas, upload personal portrait sketches, and generate cohesive chapter arcs.
                </p>
                <div className="space-y-3 pt-2">
                  <div className="p-3.5 rounded-xl bg-slate-900/50 border border-white/10 flex items-center gap-3">
                    <Sparkles className="w-4 h-4 text-sky-400 shrink-0" />
                    <span className="text-xs font-medium text-white">Voice-to-Story Audio Prompts with tone calibrator</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-900/50 border border-white/10 flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                    <span className="text-xs font-medium text-white">Consistent Character Faces (Barnaby, Luna, or your pet)</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-900/50 border border-white/10 flex items-center gap-3">
                    <PenTool className="w-4 h-4 text-sky-400 shrink-0" />
                    <span className="text-xs font-medium text-white">Simultaneous Story Spread + Coloring Sheet generation</span>
                  </div>
                </div>
                <div className="mt-8">
                  <Link
                    href="/studio"
                    className="inline-flex items-center gap-2 text-sm font-bold text-sky-300 hover:text-cyan-200 transition-colors"
                  >
                    <span>Launch Bedtime Atelier</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Mode B: Classroom & Educator Guild */}
              <div className="p-8 rounded-2xl glacier-glass border border-sky-400/25 hover:border-purple-400/50 transition-all duration-300 relative group overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-purple-400/15 border border-purple-400/30 text-purple-300">
                    <GraduationCap className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">Mode B</span>
                    <h3 className="text-xl font-bold text-white">Classroom &amp; Educator Guild</h3>
                  </div>
                </div>
                <p className="text-sm text-[#a0b4c4] mb-6 leading-relaxed">
                  Empower whole classrooms with tailored reading and coloring books. Connect grade-level vocabulary, curriculum objectives, and generate thirty unique student versions in a single batch.
                </p>
                <div className="space-y-3 pt-2">
                  <div className="p-3.5 rounded-xl bg-slate-900/50 border border-white/10 flex items-center gap-3">
                    <Award className="w-4 h-4 text-purple-300 shrink-0" />
                    <span className="text-xs font-medium text-white">Curriculum &amp; Lexile-Aligned Reading Themes (K-5)</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-900/50 border border-white/10 flex items-center gap-3">
                    <Palette className="w-4 h-4 text-purple-300 shrink-0" />
                    <span className="text-xs font-medium text-white">STEM Activity Worksheets &amp; Illustrated Coloring Pages</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-900/50 border border-white/10 flex items-center gap-3">
                    <Layers className="w-4 h-4 text-purple-300 shrink-0" />
                    <span className="text-xs font-medium text-white">AG Grid Batch Roster Ingestion with 1-Click CSV Export</span>
                  </div>
                </div>
                <div className="mt-8">
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 text-sm font-bold text-purple-300 hover:text-white transition-colors"
                  >
                    <span>Access Educator Guild Console</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* ========================================================================= */}
          {/* LIVE AG GRID PRODUCTION ORDER TICKER                                      */}
          {/* ========================================================================= */}
          <section className="max-w-7xl mx-auto px-4 md:px-8" id="order-grid">
            <div className="p-6 md:p-8 rounded-2xl glacier-glass border border-sky-400/25 shadow-xl">
              {/* Header & Live Stream Indicator */}
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6 border-b border-white/10 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                    <h3 className="text-xl font-bold text-white">Live AG Grid Production Stream</h3>
                  </div>
                  <p className="text-xs text-[#a0b4c4] mt-1">
                    Synchronized global print-on-demand queues and direct PDF digital exports.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[#a0b4c4] hidden md:inline">
                    Network Nodes: Lulu Raleigh, Lyon, Melbourne
                  </span>
                  <div className="px-3 py-1 rounded-full bg-sky-400/15 text-xs font-bold text-sky-300 border border-sky-400/30">
                    Live Feed
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto rounded-xl border border-sky-400/20 bg-slate-950/70">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/80 text-[#a0b4c4] font-semibold border-b border-white/10 uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Order ID</th>
                      <th className="py-3 px-4">Story Title</th>
                      <th className="py-3 px-4">Format &amp; Volume</th>
                      <th className="py-3 px-4">Production Node</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-[#e0e8f0]">
                    <tr className="hover:bg-sky-400/5 transition-colors">
                      <td className="py-3 px-4 font-mono text-sky-300 font-semibold">#PT-8942</td>
                      <td className="py-3 px-4 font-semibold text-white">&quot;Barnaby in Paris&quot;</td>
                      <td className="py-3 px-4 text-[#a0b4c4]">32 pgs • Softcover</td>
                      <td className="py-3 px-4">Lulu Lyon, France</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-400/15 text-sky-300 border border-sky-400/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" /> Dispatched
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[#a0b4c4]">3 mins ago</td>
                    </tr>
                    <tr className="hover:bg-sky-400/5 transition-colors">
                      <td className="py-3 px-4 font-mono text-sky-300 font-semibold">#PT-8941</td>
                      <td className="py-3 px-4 font-semibold text-white">&quot;Cosmo the Astronaut Cat&quot;</td>
                      <td className="py-3 px-4 text-[#a0b4c4]">18 pgs • PDF 300 DPI</td>
                      <td className="py-3 px-4">Atelier Cloud Engine</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-400/15 text-purple-300 border border-purple-400/30">
                          Downloaded
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[#a0b4c4]">7 mins ago</td>
                    </tr>
                    <tr className="hover:bg-sky-400/5 transition-colors">
                      <td className="py-3 px-4 font-mono text-sky-300 font-semibold">#PT-8940</td>
                      <td className="py-3 px-4 font-semibold text-white">&quot;The Secret Garden of Willow Creek&quot;</td>
                      <td className="py-3 px-4 text-[#a0b4c4]">48 pgs • Atelier Bundle</td>
                      <td className="py-3 px-4">Lulu Raleigh, USA</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-cyan-200 border border-sky-400/30">
                          Binding Spine (80#)
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[#a0b4c4]">12 mins ago</td>
                    </tr>
                    <tr className="hover:bg-sky-400/5 transition-colors">
                      <td className="py-3 px-4 font-mono text-sky-300 font-semibold">#PT-8939</td>
                      <td className="py-3 px-4 font-semibold text-white">&quot;Grade 2: Solar System Voyagers&quot;</td>
                      <td className="py-3 px-4 text-[#a0b4c4]">24 × 20 pgs • Softcover</td>
                      <td className="py-3 px-4">Lulu Melbourne, AUS</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-400/15 text-sky-300 border border-sky-400/30">
                          Batch Print Queue
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[#a0b4c4]">19 mins ago</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex flex-col sm:flex-row justify-between items-center text-xs text-[#a0b4c4] gap-3">
                <span>Displaying live stream of verified community orders</span>
                <Link
                  href="/dashboard"
                  className="text-sky-300 hover:text-white flex items-center gap-1 font-bold transition-colors"
                >
                  <span>Launch Full Author Console in AG Grid</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </section>
        </main>

        {/* SHARED COMPONENT: Footer */}
        <footer className="mt-12 bg-slate-950/80 border-t border-sky-400/20 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="p-1 rounded-xl bg-sky-400/10 border border-sky-400/20">
                <Image
                  src="/crest-logo.png"
                  alt="PaperTales AI Crest Logo"
                  width={32}
                  height={32}
                  className="h-7 w-auto object-contain"
                />
              </div>
              <span className="text-base font-bold text-white tracking-tight">
                PaperTales <span className="text-sky-300">AI</span>
              </span>
            </div>

            <nav className="flex flex-wrap justify-center items-center gap-6 text-center text-xs text-[#a0b4c4]">
              <a href="#ecosystem" className="hover:text-sky-300 transition-colors">Print Specifications</a>
              <a href="#ecosystem" className="hover:text-sky-300 transition-colors">Lulu Certification Guarantee</a>
              <a href="#calculator" className="hover:text-sky-300 transition-colors">Creator Economics ($0.17/pg)</a>
              <Link href="/studio" className="hover:text-sky-300 transition-colors">Studio Atelier</Link>
              <Link href="/dashboard" className="hover:text-sky-300 transition-colors">AG Grid Orders</Link>
            </nav>

            <p className="text-xs text-[#a0b4c4] text-center md:text-right max-w-sm">
              © 2026 PaperTales AI Inc. Archival 300 DPI Print Standards &amp; Certified Lulu POD Partner. PayPal AI Hackathon Showcase.
            </p>
          </div>
        </footer>
      </div>

      {/* Chapter 1 Story Text Modal */}
      {chapterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="glacier-glass max-w-lg w-full rounded-2xl p-6 border border-sky-400/30 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-sky-300 font-bold text-sm">
                <BookOpen className="w-4 h-4" />
                <span>Chapter 1: Barnaby’s Starlight Adventure</span>
              </div>
              <button
                onClick={() => setChapterModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="text-xs sm:text-sm text-[#e0e8f0] leading-relaxed space-y-3 font-serif">
              <p className="first-letter:text-3xl first-letter:font-bold first-letter:text-sky-300 first-letter:mr-1">
                Barnaby the fluffy golden retriever puppy stood beneath a velvet indigo sky, his cozy knitted scarf fluttering in the twilight breeze.
              </p>
              <p>
                As the smiling crescent moon peered over the silver fir trees, constellations twinkled like spilled sugar on a dark bakery tray. Barnaby let out a tiny, cheerful bark. Tonight, the magical star map was awake, leading to the secret whispering waterfall where wishing acorns grow.
              </p>
            </div>
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setChapterModalOpen(false)}
                className="glacier-btn px-4 py-2 rounded-lg text-xs font-bold"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Token Modal */}
      <TokenModal
        isOpen={tokenModalOpen}
        onClose={() => setTokenModalOpen(false)}
      />
    </div>
  );
}
