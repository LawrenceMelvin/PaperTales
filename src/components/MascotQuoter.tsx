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
    <div className="glacier-glass rounded-2xl border border-sky-400/25 p-4 shadow-xl relative overflow-hidden">
      {/* Watermark subtle glow */}
      <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-sky-400/10 rounded-full blur-2xl pointer-events-none" />

      {/* Mascot Header & Speech Bubble */}
      <div className="flex items-start gap-3">
        {/* Animated Mascot Avatar */}
        <div className="w-12 h-12 rounded-2xl bg-slate-900 border-2 border-sky-400 shadow-lg shadow-sky-500/20 flex items-center justify-center shrink-0 text-2xl select-none animate-bounce">
          🐶
        </div>

        {/* Speech Bubble */}
        <div className="flex-1 bg-slate-900/80 rounded-xl rounded-tl-none p-3.5 border border-sky-400/20 shadow-md relative">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-black text-white flex items-center gap-1.5">
              Barnaby&apos;s Dynamic Quote
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-sky-400/20 text-sky-300 font-extrabold border border-sky-400/30">
                Agentic Commerce
              </span>
            </span>
            <span className="text-[10px] font-bold text-sky-300">62% Margin Model</span>
          </div>

          {quote.paidPages === 0 ? (
            <p className="text-xs text-[#e0e8f0] leading-relaxed">
              🎉 <strong>Hooray!</strong> All <strong>{quote.totalPages} pages</strong> of this book are <strong>100% FREE</strong> on the house! No tokens required to generate and download.
            </p>
          ) : (
            <p className="text-xs text-[#e0e8f0] leading-relaxed">
              🐾 <strong>First 5 pages are 100% FREE!</strong> For the remaining <strong>{quote.paidPages} pages</strong>, our compute cost is <strong>${quote.rawCogsUsd.toFixed(2)}</strong>. With our 62% creator margin, your total is just <strong>{quote.tokensRequired} tokens (${quote.priceUsd.toFixed(2)} / ~₹{quote.priceInrApprox})</strong>!
            </p>
          )}

          {/* Unit Economics Telemetry Breakdown */}
          <div className="mt-3 pt-2.5 border-t border-sky-400/15 grid grid-cols-3 gap-2 text-center text-[11px]">
            <div className="bg-slate-950/60 p-1.5 rounded-lg border border-sky-400/10">
              <span className="block text-[10px] text-[#a0b4c4] font-semibold">Free Gift</span>
              <span className="font-bold text-sky-300 flex items-center justify-center gap-0.5">
                <Gift className="w-3 h-3 text-sky-400" /> {quote.freePages} Pgs
              </span>
            </div>
            <div className="bg-slate-950/60 p-1.5 rounded-lg border border-sky-400/10">
              <span className="block text-[10px] text-[#a0b4c4] font-semibold">Compute COGS</span>
              <span className="font-bold text-white font-mono">
                ${quote.rawCogsUsd.toFixed(2)}
              </span>
            </div>
            <div className="bg-slate-950/60 p-1.5 rounded-lg border border-sky-400/10">
              <span className="block text-[10px] text-[#a0b4c4] font-semibold">Target Margin</span>
              <span className="font-bold text-cyan-200 flex items-center justify-center gap-0.5 font-mono">
                <TrendingUp className="w-3 h-3 text-sky-400" /> {quote.effectiveMarginPercent || 80}%
              </span>
            </div>
          </div>

          {/* Token Check Prompt */}
          {needsMoreTokens && (
            <div className="mt-2.5 flex items-center justify-between bg-sky-950/50 p-2 rounded-lg border border-sky-400/30">
              <span className="text-[11px] text-sky-200">
                You have {userTokens} tokens (Need {quote.tokensRequired})
              </span>
              <button
                type="button"
                onClick={onOpenTokenModal}
                className="text-[11px] font-bold text-[#001f2e] bg-sky-300 hover:bg-sky-200 px-2 py-0.5 rounded shadow-sm transition-all"
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
