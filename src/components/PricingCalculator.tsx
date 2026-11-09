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

import { PRICING_CONFIG } from "@/lib/pricing-calculator";

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
  const billablePages = Math.max(0, pageCount - PRICING_CONFIG.FREE_PAGES_TIER);

  // Dynamic Compute Rate per Page: $0.03 for Words vs $0.09 for Illustrated (62% margin)
  const aiRatePerPage =
    bookType === "words"
      ? PRICING_CONFIG.PRICE_PER_WORDS_PAGE_USD
      : PRICING_CONFIG.PRICE_PER_ILLUSTRATED_PAGE_USD;
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
      className={`relative rounded-3xl p-6 md:p-12 bg-[#FAF6EE] border border-[#E8DFD3] overflow-hidden shadow-lg ${className}`}
    >
      {/* Watermark Glow */}
      <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Dynamic Sliders & Format Selection */}
        <div className="lg:col-span-7 space-y-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-amber-800 text-xs font-semibold mb-3 shadow-xs">
              <Sliders className="w-3.5 h-3.5 text-amber-600" />
              <span>Barnaby&apos;s Real-Time Economics Engine</span>
            </div>
            <h2 className="text-2xl md:text-4xl font-serif font-extrabold text-[#1E2530] tracking-tight">
              Configure Your Bespoke Manuscript
            </h2>
            <p className="text-sm md:text-base text-slate-600 mt-2">
              Transparent creator-first pricing. Watch your billable economics adjust dynamically based on book type, volume, and printing format.
            </p>
          </div>

          {/* Book Content Type Selector: Words vs Illustrated */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              1. Choose Book Content Type
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setBookType("words")}
                className={`p-4 rounded-xl text-left border transition-all flex items-start gap-3.5 ${
                  bookType === "words"
                    ? "border-2 border-amber-500 bg-amber-50/70 shadow-xs"
                    : "border-[#E8DFD3] bg-white hover:border-amber-300"
                }`}
              >
                <div className="p-2 rounded-lg bg-amber-100 text-amber-800 shrink-0">
                  <Type className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-[#1E2530]">Words &amp; Story Book</p>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                      ${PRICING_CONFIG.PRICE_PER_WORDS_PAGE_USD.toFixed(2)}/pg
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Family recipes, journals, memory lanes, text tales. Lightweight standard LLM compute.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setBookType("illustrated")}
                className={`p-4 rounded-xl text-left border transition-all flex items-start gap-3.5 ${
                  bookType === "illustrated"
                    ? "border-2 border-amber-500 bg-amber-50/70 shadow-xs"
                    : "border-[#E8DFD3] bg-white hover:border-amber-300"
                }`}
              >
                <div className="p-2 rounded-lg bg-amber-100 text-amber-800 shrink-0">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-[#1E2530]">Illustrated &amp; Coloring Book</p>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-300">
                      ${PRICING_CONFIG.PRICE_PER_ILLUSTRATED_PAGE_USD.toFixed(2)}/pg
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    300 DPI vector linework, custom coloring pages, character consistency anchor lock.
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Page Count Slider Card */}
          <div className="p-6 rounded-xl bg-white border border-[#E8DFD3] shadow-xs space-y-4">
            <div className="flex justify-between items-center">
              <label htmlFor="pageRange" className="text-sm font-semibold text-[#1E2530] flex items-center gap-2">
                <span>2. Selected Book Volume</span>
                <span className="text-xs text-amber-800 px-2 py-0.5 rounded-md bg-amber-100/70 border border-amber-300/60 font-semibold">
                  5 to 64 Pages
                </span>
              </label>
              <span className="text-2xl font-black text-amber-700 font-mono">
                {pageCount} <span className="text-sm font-normal text-slate-500">Pages</span>
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
              className="w-full h-2 bg-[#E8DFD3] rounded-lg appearance-none cursor-pointer accent-amber-600"
            />

            <div className="flex justify-between text-xs text-slate-500 font-medium">
              <button
                type="button"
                onClick={() => setPageCount(5)}
                className={`hover:text-amber-700 transition-colors ${pageCount === 5 ? "text-amber-700 font-bold" : ""}`}
              >
                5 Pages (Pocket Tale)
              </button>
              <button
                type="button"
                onClick={() => setPageCount(24)}
                className={`hover:text-amber-700 transition-colors ${pageCount === 24 ? "text-amber-700 font-bold" : ""}`}
              >
                24 Pages (Standard)
              </button>
              <button
                type="button"
                onClick={() => setPageCount(64)}
                className={`hover:text-amber-700 transition-colors ${pageCount === 64 ? "text-amber-700 font-bold" : ""}`}
              >
                64 Pages (Epic Volume)
              </button>
            </div>
          </div>

          {/* Edition Format Selector Toggles */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              3. Choose Publication Edition
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Option 1: PDF */}
              <button
                type="button"
                onClick={() => setSelectedEdition("digital")}
                className={`p-4 rounded-xl text-left border transition-all flex flex-col justify-between ${
                  selectedEdition === "digital"
                    ? "border-2 border-amber-500 bg-amber-50/70 shadow-xs"
                    : "border-[#E8DFD3] bg-white hover:border-amber-300"
                }`}
              >
                <div className="flex justify-between items-start">
                  <FileText className="w-5 h-5 text-emerald-600" />
                  <span className="text-[10px] font-bold text-emerald-800 font-mono px-2 py-0.5 rounded bg-emerald-100 border border-emerald-300">
                    FREE PDF
                  </span>
                </div>
                <div className="mt-3">
                  <p className="text-sm font-bold text-[#1E2530]">Digital PDF Only</p>
                  <p className="text-xs text-slate-500">100% Free Vector Download</p>
                </div>
              </button>

              {/* Option 2: Physical + PDF */}
              <button
                type="button"
                onClick={() => setSelectedEdition("physical")}
                className={`p-4 rounded-xl text-left border transition-all flex flex-col justify-between ${
                  selectedEdition === "physical"
                    ? "border-2 border-amber-500 bg-amber-50/70 shadow-xs"
                    : "border-[#E8DFD3] bg-white hover:border-amber-300"
                }`}
              >
                <div className="flex justify-between items-start">
                  <BookOpen className="w-5 h-5 text-amber-700" />
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-600 text-white font-extrabold">
                    Recommended
                  </span>
                </div>
                <div className="mt-3">
                  <p className="text-sm font-bold text-amber-900">Lulu Softcover + PDF</p>
                  <p className="text-xs text-slate-500">Archival Paper Print</p>
                </div>
              </button>

              {/* Option 3: Full Atelier Bundle */}
              <button
                type="button"
                onClick={() => setSelectedEdition("bundle")}
                className={`p-4 rounded-xl text-left border transition-all flex flex-col justify-between ${
                  selectedEdition === "bundle"
                    ? "border-2 border-amber-500 bg-amber-50/70 shadow-xs"
                    : "border-[#E8DFD3] bg-white hover:border-amber-300"
                }`}
              >
                <div className="flex justify-between items-start">
                  <Palette className="w-5 h-5 text-amber-700" />
                  <span className="text-xs text-amber-800 font-semibold">+Channel3 Kit</span>
                </div>
                <div className="mt-3">
                  <p className="text-sm font-bold text-[#1E2530]">Full Atelier Bundle</p>
                  <p className="text-xs text-slate-500">Book + 24 Artist Markers</p>
                </div>
              </button>
            </div>
          </div>

          {/* Free Promotion Banner */}
          <div className="p-4 rounded-xl bg-amber-50/90 border border-amber-200/80 flex items-center gap-4">
            <Sparkles className="w-7 h-7 text-amber-600 shrink-0" />
            <div className="text-left">
              <p className="text-sm font-bold text-amber-900">Introductory Atelier Gift Applied</p>
              <p className="text-xs text-slate-600">
                Your first 5 story &amp; coloring pages are 100% complimentary on every generation.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Live Billable Breakdown & Instant Checkout */}
        <div className="lg:col-span-5 p-6 md:p-8 rounded-2xl bg-white border border-[#E8DFD3] shadow-md space-y-6">
          <h3 className="text-lg font-serif font-bold text-[#1E2530] border-b border-[#E8DFD3] pb-4">
            Real-Time Economic Breakdown
          </h3>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Book Content Model</span>
              <span className="text-[#1E2530] font-semibold capitalize">
                {bookType === "words"
                  ? `Words & Story ($${PRICING_CONFIG.PRICE_PER_WORDS_PAGE_USD.toFixed(2)}/pg)`
                  : `Vector & Images ($${PRICING_CONFIG.PRICE_PER_ILLUSTRATED_PAGE_USD.toFixed(2)}/pg)`}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Total Page Volume</span>
              <span className="text-[#1E2530] font-semibold">{pageCount} pgs</span>
            </div>
            <div className="flex justify-between text-emerald-700 font-semibold">
              <span>Introductory Free Gift</span>
              <span>-{PRICING_CONFIG.FREE_PAGES_TIER} pgs ($0.00)</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Net Billable Pages</span>
              <span className="text-[#1E2530] font-semibold">{billablePages} pgs</span>
            </div>

            <div className="h-px bg-[#E8DFD3] my-2" />

            <div className="flex justify-between text-slate-600">
              <span>Paper &amp; Lulu Binding ($0.17/pg)</span>
              <span className="text-[#1E2530] font-medium">${bindingCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>
                AI Compute ({bookType === "words" ? `$${PRICING_CONFIG.PRICE_PER_WORDS_PAGE_USD.toFixed(2)}` : `$${PRICING_CONFIG.PRICE_PER_ILLUSTRATED_PAGE_USD.toFixed(2)}`}/pg)
              </span>
              <span className="text-[#1E2530] font-medium">${aiCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Studio Sustainable Tier</span>
              <span className="text-[#1E2530] font-medium">${margin.toFixed(2)}</span>
            </div>
            {selectedEdition === "bundle" && (
              <div className="flex justify-between text-amber-800 font-semibold">
                <span>Channel3 Companion Kit Add-on</span>
                <span>$14.99</span>
              </div>
            )}
          </div>

          {/* Total Price Display */}
          <div className="p-5 rounded-xl bg-[#FAF6EE] border border-amber-300/80 flex justify-between items-center shadow-xs">
            <div>
              <p className="text-xs text-slate-500 font-medium">Estimated Total</p>
              <p className="text-3xl font-black text-amber-800 font-mono">
                ${totalOrder.toFixed(2)}
              </p>
            </div>
            <div className="text-right">
              <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300">
                Tax &amp; 300 DPI Validated
              </span>
            </div>
          </div>

          {/* Instant Checkout / Studio Link CTA */}
          <div className="space-y-3 pt-2">
            <Link
              href="/studio"
              className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white py-4 px-6 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
            >
              <Lock className="w-4 h-4" />
              <span>Launch Studio With This Specification</span>
            </Link>

            <div className="flex items-center justify-center gap-4 text-xs text-slate-500 pt-2">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" /> 256-Bit SSL
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-600" /> 48h Print Turnaround
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-amber-600" /> Lulu Verified POD
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
