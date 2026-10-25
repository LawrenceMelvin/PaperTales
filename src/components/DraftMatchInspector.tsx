"use client";

import React, { useState } from "react";
import { BookProject } from "@/types/book";
import { ConversationTestScenario, verifyDraftMatchesScenario } from "@/lib/test-scenarios";
import { CheckCircle2, AlertTriangle, ShieldCheck, ChevronDown, ChevronUp, Sparkles, X } from "lucide-react";

interface DraftMatchInspectorProps {
  book: BookProject;
  scenario: ConversationTestScenario;
  onClose?: () => void;
}

export default function DraftMatchInspector({
  book,
  scenario,
  onClose,
}: DraftMatchInspectorProps) {
  const [expanded, setExpanded] = useState(false);
  const result = verifyDraftMatchesScenario(book, scenario);

  return (
    <div
      className={`w-full rounded-2xl border transition-all duration-200 mt-4 overflow-hidden ${
        result.passed
          ? "glacier-glass border-emerald-500/30 shadow-[0_0_25px_rgba(16,185,129,0.15)]"
          : "glacier-glass border-amber-500/30 shadow-[0_0_25px_rgba(245,158,11,0.15)]"
      }`}
    >
      {/* Header Bar */}
      <div className="px-5 py-3.5 bg-slate-950/70 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold ${
              result.passed
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
            }`}
          >
            {result.passed ? <ShieldCheck className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">
                AI vs. Draft Match Inspector
              </span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                  result.passed
                    ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                    : "bg-amber-500/10 text-amber-300 border-amber-500/30"
                }`}
              >
                {result.passed
                  ? `100% Brief Match (${result.totalChecks}/${result.totalChecks} Passed)`
                  : `${result.score}/${result.totalChecks} Passed (Discrepancy Detected)`}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Verifying active scenario: <strong className="text-sky-300">{scenario.name}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-slate-400 hover:text-white px-2.5 py-1 rounded-lg hover:bg-slate-800/40 flex items-center gap-1 transition-colors"
          >
            <span>{expanded ? "Hide Details" : "Inspect Checks"}</span>
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800/40 transition-colors"
              title="Close inspector"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Summary Strip (Always Visible) */}
      <div className="px-5 py-2.5 bg-slate-900/40 flex flex-wrap items-center gap-4 text-xs text-slate-300">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400">Trim:</span>
          <span className="font-semibold text-white">{book.format?.trimSize}</span>
          <span className="text-emerald-400">✓</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400">Color:</span>
          <span className="font-semibold text-white">
            {book.format?.interiorColor === "standard_color" ? "Full Color" : "Black & White"}
          </span>
          <span className="text-emerald-400">✓</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400">Page 1:</span>
          <span className="font-semibold text-white">{book.pages[0]?.title}</span>
        </div>
      </div>

      {/* Detailed Check Table (Collapsible) */}
      {expanded && (
        <div className="p-4 bg-slate-950/40 space-y-2 border-t border-white/5">
          {result.checks.map((c) => (
            <div
              key={c.id}
              className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs ${
                c.passed
                  ? "bg-emerald-950/15 border-emerald-500/20 text-slate-200"
                  : "bg-amber-950/20 border-amber-500/30 text-amber-200"
              }`}
            >
              <div className="flex items-start gap-2.5">
                {c.passed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-semibold text-white">{c.label}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Expected: <span className="text-slate-200">{c.expected}</span>
                  </div>
                </div>
              </div>

              <div className="sm:text-right text-[11px] font-mono text-slate-300 bg-slate-900/60 px-2.5 py-1.5 rounded-lg border border-white/5 max-w-sm overflow-hidden text-ellipsis whitespace-nowrap">
                Actual: {c.actual}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
