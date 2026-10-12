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
    <div className="bg-gradient-to-br from-blue-50/80 via-indigo-50/50 to-purple-50/60 rounded-2xl border border-blue-200/80 p-4 shadow-sm relative overflow-hidden">
      {/* Mascot Header & Speech Bubble */}
      <div className="flex items-start gap-3">
        {/* Animated Mascot Avatar */}
        <div className="w-12 h-12 rounded-2xl bg-white border-2 border-blue-600 shadow-md flex items-center justify-center shrink-0 text-2xl select-none animate-bounce">
          🐶
        </div>

        {/* Speech Bubble */}
        <div className="flex-1 bg-white rounded-xl rounded-tl-none p-3.5 border border-blue-100 shadow-sm relative">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
              Barnaby&apos;s Dynamic Quote
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-extrabold">
                Agentic Commerce
              </span>
            </span>
            <span className="text-[10px] font-bold text-blue-600">62% Margin Model</span>
          </div>

          {quote.paidPages === 0 ? (
            <p className="text-xs text-slate-700 leading-relaxed">
              🎉 <strong>Hooray!</strong> All <strong>{quote.totalPages} pages</strong> of this book are <strong>100% FREE</strong> on the house! No tokens required to generate and download.
            </p>
          ) : (
            <p className="text-xs text-slate-700 leading-relaxed">
              🐾 <strong>First 5 pages are 100% FREE!</strong> For the remaining <strong>{quote.paidPages} pages</strong>, our compute cost is <strong>${quote.rawCogsUsd.toFixed(2)}</strong>. With our 62% creator margin, your total is just <strong>{quote.tokensRequired} tokens (${quote.priceUsd.toFixed(2)} / ~₹{quote.priceInrApprox})</strong>!
            </p>
          )}

          {/* Unit Economics Telemetry Breakdown */}
          <div className="mt-3 pt-2.5 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-[11px]">
            <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100">
              <span className="block text-[10px] text-slate-400 font-semibold">Free Gift</span>
              <span className="font-bold text-emerald-600 flex items-center justify-center gap-0.5">
                <Gift className="w-3 h-3" /> {quote.freePages} Pgs
              </span>
            </div>
            <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100">
              <span className="block text-[10px] text-slate-400 font-semibold">Compute COGS</span>
              <span className="font-bold text-slate-700 font-mono">
                ${quote.rawCogsUsd.toFixed(2)}
              </span>
            </div>
            <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100">
              <span className="block text-[10px] text-slate-400 font-semibold">Target Margin</span>
              <span className="font-bold text-blue-700 flex items-center justify-center gap-0.5 font-mono">
                <TrendingUp className="w-3 h-3" /> {quote.effectiveMarginPercent || 80}%
              </span>
            </div>
          </div>

          {/* Token Balance Notice & 1-Click Action */}
          {quote.paidPages > 0 && (
            <div className="mt-3 flex items-center justify-between bg-blue-50/70 p-2 rounded-lg border border-blue-200/60">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-800">
                <Coins className="w-3.5 h-3.5 text-amber-500" />
                <span>Vault: {userTokens} tokens</span>
                {needsMoreTokens && (
                  <span className="text-[10px] text-rose-600 font-bold">
                    (Need {quote.tokensRequired - userTokens} more)
                  </span>
                )}
              </div>

              {needsMoreTokens ? (
                <button
                  type="button"
                  onClick={onOpenTokenModal}
                  className="px-2.5 py-1 text-xs font-extrabold bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-xs transition-colors flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" /> Refill with PayPal
                </button>
              ) : (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  ✓ Ready to Generate
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
