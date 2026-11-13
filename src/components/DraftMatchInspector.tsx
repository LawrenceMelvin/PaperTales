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
      className={`w-full rounded-2xl border transition-all duration-200 mt-4 overflow-hidden bg-[#FFFDF9] text-[#1E2530] shadow-md ${
        result.passed
          ? "border-emerald-300"
          : "border-amber-300"
      }`}
    >
      {/* Header Bar */}
      <div className="px-5 py-3.5 bg-[#FAF6EE] flex items-center justify-between border-b border-[#E8DFD3]">
        <div className="flex items-center gap-3">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold ${
              result.passed
                ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                : "bg-amber-100 text-amber-800 border border-amber-300"
            }`}
          >
            {result.passed ? <ShieldCheck className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-[#1E2530]">
                AI vs. Draft Match Inspector
              </span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                  result.passed
                    ? "bg-emerald-50 text-emerald-900 border-emerald-300"
                    : "bg-amber-50 text-amber-900 border-amber-300"
                }`}
              >
                {result.passed
                  ? `100% Brief Match (${result.totalChecks}/${result.totalChecks} Passed)`
                  : `${result.score}/${result.totalChecks} Passed (Discrepancy Detected)`}
              </span>
            </div>
            <p className="text-[11px] text-[#5C5347]">
              Verifying active scenario: <strong className="text-amber-800">{scenario.name}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-[#5C5347] hover:text-[#1E2530] px-2.5 py-1 rounded-lg hover:bg-amber-100/50 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>{expanded ? "Hide Details" : "Inspect Checks"}</span>
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="text-[#5C5347] hover:text-[#1E2530] p-1 rounded-lg hover:bg-amber-100/50 transition-colors cursor-pointer"
              title="Close inspector"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Summary Strip (Always Visible) */}
      <div className="px-5 py-2.5 bg-white flex flex-wrap items-center gap-4 text-xs text-[#5C5347]">
        <div className="flex items-center gap-1.5">
          <span className="text-[#5C5347]">Trim:</span>
          <span className="font-semibold text-[#1E2530]">{book.format?.trimSize}</span>
          <span className="text-emerald-700">✓</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[#5C5347]">Color:</span>
          <span className="font-semibold text-[#1E2530]">
            {book.format?.interiorColor === "standard_color" ? "Full Color" : "Black & White"}
          </span>
          <span className="text-emerald-700">✓</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[#5C5347]">Page 1:</span>
          <span className="font-semibold text-[#1E2530]">{book.pages[0]?.title}</span>
        </div>
      </div>

      {/* Detailed Check Table (Collapsible) */}
      {expanded && (
        <div className="p-4 bg-[#FAF6EE] space-y-2 border-t border-[#E8DFD3]">
          {result.checks.map((c) => (
            <div
              key={c.id}
              className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs ${
                c.passed
                  ? "bg-emerald-50 border-emerald-200 text-emerald-950"
                  : "bg-amber-50 border-amber-200 text-amber-950"
              }`}
            >
              <div className="flex items-start gap-2.5">
                {c.passed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-semibold text-[#1E2530]">{c.label}</div>
                  <div className="text-[11px] text-[#5C5347] mt-0.5">
                    Expected: <span className="text-[#1E2530] font-medium">{c.expected}</span>
                  </div>
                </div>
              </div>

              <div className="sm:text-right text-[11px] font-mono text-[#1E2530] bg-white px-2.5 py-1.5 rounded-lg border border-[#E8DFD3] max-w-sm overflow-hidden text-ellipsis whitespace-nowrap">
                Actual: {c.actual}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
