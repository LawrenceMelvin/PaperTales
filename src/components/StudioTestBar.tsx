"use client";

import React, { useState } from "react";
import { ConversationTestScenario, CONVERSATION_TEST_SCENARIOS } from "@/lib/test-scenarios";
import { Sparkles, RotateCcw, ChevronDown, ChevronUp, CheckCircle2 } from "lucide-react";

interface StudioTestBarProps {
  activeScenarioId?: string;
  onSelectScenario: (scenario: ConversationTestScenario) => void;
  onReset: () => void;
  isLoading?: boolean;
}

export default function StudioTestBar({
  activeScenarioId,
  onSelectScenario,
  onReset,
  isLoading = false,
}: StudioTestBarProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="w-full mb-4 rounded-xl glacier-glass border border-sky-400/20 overflow-hidden shadow-lg transition-all duration-200">
      {/* Header Toggle */}
      <div className="px-4 py-2.5 bg-slate-950/60 flex items-center justify-between border-b border-sky-400/10">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-xs">
            🧪
          </div>
          <span className="text-xs font-bold text-sky-200 tracking-wide uppercase">
            Automated Test Scenarios
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-400/10 text-sky-300 border border-sky-400/20 hidden sm:inline">
            1-Click Consultation &amp; Draft Proof
          </span>
        </div>

        <div className="flex items-center gap-2">
          {activeScenarioId && (
            <button
              onClick={onReset}
              disabled={isLoading}
              className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-slate-800/50 transition-colors"
              title="Reset conversation and book canvas"
            >
              <RotateCcw className="w-3 h-3 text-slate-400" />
              <span>Reset</span>
            </button>
          )}

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-slate-400 hover:text-slate-200 p-1 rounded-md hover:bg-slate-800/40 transition-colors"
            aria-label="Toggle Test Scenarios"
          >
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Scenarios Horizontal Strip */}
      {isOpen && (
        <div className="p-3 bg-slate-900/30 flex flex-wrap gap-2 items-center">
          <span className="text-[11px] text-slate-400 font-medium mr-1 hidden md:inline">
            Fast-forward conversation:
          </span>

          {CONVERSATION_TEST_SCENARIOS.map((scenario) => {
            const isActive = activeScenarioId === scenario.id;
            return (
              <button
                key={scenario.id}
                onClick={() => onSelectScenario(scenario)}
                disabled={isLoading}
                className={`group relative text-left text-xs px-3 py-2 rounded-xl border transition-all duration-150 flex items-center gap-2 ${
                  isActive
                    ? "bg-sky-500/20 border-sky-400/60 text-white shadow-[0_0_15px_rgba(125,211,252,0.2)]"
                    : "bg-slate-950/40 border-slate-700/40 hover:border-sky-400/40 text-slate-300 hover:text-white"
                } ${isLoading ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
              >
                <span className="text-base leading-none">{scenario.icon}</span>
                <div className="flex flex-col">
                  <span className="font-semibold text-slate-200 group-hover:text-white flex items-center gap-1">
                    {scenario.name}
                    {isActive && <CheckCircle2 className="w-3 h-3 text-sky-400 inline" />}
                  </span>
                  <span className="text-[10px] text-slate-400 group-hover:text-sky-300">
                    {scenario.badge}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
