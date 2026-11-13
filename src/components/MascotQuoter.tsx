"use client";

import React from "react";
import { BookQuote } from "@/lib/pricing-calculator";
import { Sparkles, Coins, Gift, TrendingUp } from "lucide-react";

interface MascotQuoterProps {
  quote: BookQuote;
  userTokens: number;
  onOpenTokenModal: () => void;
}

export default function MascotQuoter({
  quote,
  userTokens,
  onOpenTokenModal,
}: MascotQuoterProps) {
  const needsMoreTokens = userTokens < quote.tokensRequired;

  return (
    <div className="bg-[#FFFDF9] rounded-2xl border border-[#E8DFD3] p-4 shadow-md relative overflow-hidden text-[#1E2530]">
      {/* Mascot Header & Speech Bubble */}
      <div className="flex items-start gap-3">
        {/* Mascot Avatar */}
        <div className="w-12 h-12 rounded-2xl bg-amber-100 border-2 border-amber-400 shadow-sm flex items-center justify-center shrink-0 text-2xl select-none">
          🐶
        </div>

        {/* Speech Bubble */}
        <div className="flex-1 bg-[#FAF6EE] rounded-xl rounded-tl-none p-3.5 border border-[#E8DFD3] shadow-xs relative">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-black text-[#1E2530] flex items-center gap-1.5">
              Dynamic Book Quote
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-extrabold border border-amber-300">
                Transparent Pricing
              </span>
            </span>
          </div>

          {quote.paidPages === 0 ? (
            <p className="text-xs text-[#5C5347] leading-relaxed">
              🎉 <strong>Hooray!</strong> All <strong>{quote.totalPages} pages</strong> of this book are <strong>100% FREE</strong> on the house! No tokens required to generate and download.
            </p>
          ) : (
            <p className="text-xs text-[#5C5347] leading-relaxed">
              ✨ <strong>First 5 pages are 100% FREE!</strong> For the remaining <strong>{quote.paidPages} pages</strong>, your total is just{" "}
              <strong className="text-[#1E2530]">{quote.tokensRequired} tokens (${quote.priceUsd.toFixed(2)} / ~₹{quote.priceInrApprox})</strong>!
            </p>
          )}

          {/* Breakdown */}
          <div className="mt-3 pt-2.5 border-t border-[#E8DFD3] grid grid-cols-3 gap-2 text-center text-[11px]">
            <div className="bg-white p-1.5 rounded-lg border border-[#E8DFD3]">
              <span className="block text-[10px] text-[#5C5347] font-semibold">Free Gift</span>
              <span className="font-bold text-emerald-800 flex items-center justify-center gap-0.5">
                <Gift className="w-3 h-3 text-emerald-700" /> {quote.freePages} Pgs
              </span>
            </div>
            <div className="bg-white p-1.5 rounded-lg border border-[#E8DFD3]">
              <span className="block text-[10px] text-[#5C5347] font-semibold">Paid Pages</span>
              <span className="font-bold text-[#1E2530] font-mono">
                {quote.paidPages} Pgs
              </span>
            </div>
            <div className="bg-white p-1.5 rounded-lg border border-[#E8DFD3]">
              <span className="block text-[10px] text-[#5C5347] font-semibold">Retail Total</span>
              <span className="font-bold text-amber-800 flex items-center justify-center gap-0.5 font-mono">
                <TrendingUp className="w-3 h-3 text-amber-700" /> ${quote.priceUsd.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Token Check Prompt */}
          {needsMoreTokens && (
            <div className="mt-2.5 flex items-center justify-between bg-amber-50 p-2 rounded-lg border border-amber-300">
              <span className="text-[11px] text-amber-950 font-medium">
                You have {userTokens} tokens (Need {quote.tokensRequired})
              </span>
              <button
                type="button"
                onClick={onOpenTokenModal}
                className="text-[11px] font-bold text-white bg-amber-600 hover:bg-amber-700 px-2.5 py-1 rounded-md shadow-xs transition-all cursor-pointer"
              >
                + Refill Tokens
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
