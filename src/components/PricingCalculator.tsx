"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sliders,
  FileText,
  BookOpen,
  Palette,
  Sparkles,
  Lock,
  ShieldCheck,
  Clock,
  Award,
  Type,
  Image as ImageIcon,
} from "lucide-react";

interface PricingCalculatorProps {
  className?: string;
}

export default function PricingCalculator({ className = "" }: PricingCalculatorProps) {
  // Page Count State
  const [pageCount, setPageCount] = useState<number>(24);
  // Book Type: Words / Text Book vs. Illustrated / Coloring Book
  const [bookType, setBookType] = useState<"words" | "illustrated">("illustrated");
  // Edition: Digital PDF vs Physical Softcover vs Full Bundle
  const [selectedEdition, setSelectedEdition] = useState<"digital" | "physical" | "bundle">("physical");

  // Free Introductory Pages
  const billablePages = Math.max(0, pageCount - 5);

  // Dynamic Compute Rate per Page: $0.02 for Words vs $0.05 for Illustrated
  const aiRatePerPage = bookType === "words" ? 0.02 : 0.05;
  const digitalBasePrice = 0;

  let bindingCost = 0;
  let aiCost = 0;
  let margin = 0;
  let kitCost = 0;
  let totalOrder = 0;

  if (selectedEdition === "digital") {
    bindingCost = 0;
    aiCost = billablePages * aiRatePerPage;
    margin = 0;
    totalOrder = aiCost;
  } else if (selectedEdition === "physical") {
    bindingCost = billablePages * 0.17;
    aiCost = billablePages * aiRatePerPage;
    margin = (bindingCost + aiCost) * 1.62 + 2.5;
    totalOrder = bindingCost + aiCost + margin;
  } else {
    bindingCost = billablePages * 0.17;
    aiCost = billablePages * aiRatePerPage;
    margin = (bindingCost + aiCost) * 1.62 + 2.5;
    kitCost = 14.99;
    totalOrder = bindingCost + aiCost + margin + kitCost;
  }

  return (
    <div
      className={`relative rounded-3xl p-6 md:p-12 glacier-glass overflow-hidden shadow-2xl border border-sky-400/25 ${className}`}
    >
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
              Transparent creator-first pricing. Watch your billable economics adjust dynamically based on book type, volume, and printing format.
            </p>
          </div>

          {/* Book Content Type Selector: Words vs Illustrated */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-[#a0b4c4] uppercase tracking-wider block">
              1. Choose Book Content Type
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setBookType("words")}
                className={`p-4 rounded-xl text-left border transition-all flex items-start gap-3.5 ${
                  bookType === "words"
                    ? "border-2 border-sky-400 bg-sky-500/15 glacier-glow"
                    : "border-white/10 bg-slate-900/40 hover:border-sky-400/40"
                }`}
              >
                <div className="p-2 rounded-lg bg-sky-400/20 text-sky-300 shrink-0">
                  <Type className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-white">Words &amp; Story Book</p>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-400/15 text-emerald-300 border border-emerald-400/30">
                      $0.02/pg
                    </span>
                  </div>
                  <p className="text-xs text-[#a0b4c4] mt-1">
                    Family recipes, journals, memory lanes, text tales. Lightweight standard LLM compute.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setBookType("illustrated")}
                className={`p-4 rounded-xl text-left border transition-all flex items-start gap-3.5 ${
                  bookType === "illustrated"
                    ? "border-2 border-sky-400 bg-sky-500/15 glacier-glow"
                    : "border-white/10 bg-slate-900/40 hover:border-sky-400/40"
                }`}
              >
                <div className="p-2 rounded-lg bg-purple-400/20 text-purple-300 shrink-0">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-white">Illustrated &amp; Coloring Book</p>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-400/15 text-purple-300 border border-purple-400/30">
                      $0.05/pg
                    </span>
                  </div>
                  <p className="text-xs text-[#a0b4c4] mt-1">
                    300 DPI vector linework, custom coloring pages, character consistency anchor lock.
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Page Count Slider Card */}
          <div className="p-6 rounded-xl glacier-glass-subtle border border-sky-400/20 space-y-4">
            <div className="flex justify-between items-center">
              <label htmlFor="pageRange" className="text-sm font-semibold text-white flex items-center gap-2">
                <span>2. Selected Book Volume</span>
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
                24 Pages (Standard)
              </button>
              <button
                type="button"
                onClick={() => setPageCount(64)}
                className={`hover:text-sky-300 transition-colors ${pageCount === 64 ? "text-sky-300 font-bold" : ""}`}
              >
                64 Pages (Epic Volume)
              </button>
            </div>
          </div>

          {/* Edition Format Selector Toggles */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-[#a0b4c4] uppercase tracking-wider block">
              3. Choose Publication Edition
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
                  <FileText className="w-5 h-5 text-emerald-400" />
                  <span className="text-[10px] font-bold text-emerald-300 font-mono px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-400/30">
                    FREE PDF
                  </span>
                </div>
                <div className="mt-3">
                  <p className="text-sm font-bold text-white">Digital PDF Only</p>
                  <p className="text-xs text-[#a0b4c4]">100% Free Vector Download</p>
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
        <div className="lg:col-span-5 p-6 md:p-8 rounded-2xl glacier-glass border border-sky-400/25 shadow-xl space-y-6">
          <h3 className="text-lg font-bold text-white border-b border-white/10 pb-4">
            Real-Time Economic Breakdown
          </h3>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-[#a0b4c4]">
              <span>Book Content Model</span>
              <span className="text-white font-semibold capitalize">
                {bookType === "words" ? "Words & Story ($0.02/pg)" : "Vector & Images ($0.05/pg)"}
              </span>
            </div>
            <div className="flex justify-between text-[#a0b4c4]">
              <span>Total Page Volume</span>
              <span className="text-white font-semibold">{pageCount} pgs</span>
            </div>
            <div className="flex justify-between text-sky-300 font-semibold">
              <span>Introductory Free Gift</span>
              <span>-5 pgs ($0.00)</span>
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
              <span>AI Compute ({bookType === "words" ? "$0.02" : "$0.05"}/pg)</span>
              <span className="text-white font-medium">${aiCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[#a0b4c4]">
              <span>Studio Sustainable Tier</span>
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
              <p className="text-xs text-[#a0b4c4]">Estimated Total</p>
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

          {/* Instant Checkout / Studio Link CTA */}
          <div className="space-y-3 pt-2">
            <Link
              href="/studio"
              className="w-full glacier-btn py-4 px-6 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-95 transition-all shadow-lg text-[#001f2e]"
            >
              <Lock className="w-4 h-4" />
              <span>Launch Studio With This Specification</span>
            </Link>

            <div className="flex items-center justify-center gap-4 text-xs text-[#a0b4c4] pt-2">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-sky-400" /> 256-Bit SSL
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-sky-400" /> 48h Print Turnaround
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
  );
}
