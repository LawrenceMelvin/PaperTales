"use client";

import React from "react";
import { X, BookOpen, Layers, CheckCircle2, Sparkles, Printer, User, Palette } from "lucide-react";
import { BookProject } from "@/types/book";
import { calculateBookQuote } from "@/lib/pricing-calculator";

interface BookDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: BookProject;
}

export default function BookDetailsModal({ isOpen, onClose, book }: BookDetailsModalProps) {
  if (!isOpen) return null;

  const quote = calculateBookQuote(book.pageCount);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl glacier-glass rounded-2xl border border-sky-400/30 shadow-2xl p-6 sm:p-7 text-white overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-sky-400/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-sky-400/20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-400/20 border border-sky-400/30 flex items-center justify-center text-sky-300">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black tracking-tight text-white">Book Specifications &amp; Details</h3>
              <p className="text-xs text-[#a0b4c4]">Technical print metadata &amp; character anchors</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-all border border-sky-400/20"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Details Grid */}
        <div className="py-5 space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          {/* Title & Author */}
          <div className="glacier-glass-subtle p-3.5 rounded-xl border border-sky-400/20 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400">Title &amp; Creator</span>
            <h4 className="text-sm sm:text-base font-extrabold text-white">{book.title}</h4>
            {book.subtitle && <p className="text-xs text-[#a0b4c4]">{book.subtitle}</p>}
            <p className="text-xs text-slate-300 pt-1">
              Author: <strong className="text-white">{book.authorName}</strong> &bull; Genre:{" "}
              <span className="capitalize text-sky-300">{book.genre.replace("_", " ")}</span>
            </p>
          </div>

          {/* Physical Specifications */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-sky-400/15">
              <span className="text-[10px] font-semibold text-slate-400 block">Trim Size</span>
              <span className="text-xs sm:text-sm font-bold text-white">8.5&quot; &times; 8.5&quot; Square</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-sky-400/15">
              <span className="text-[10px] font-semibold text-slate-400 block">Binding</span>
              <span className="text-xs sm:text-sm font-bold text-white">Archival Saddle-Stitch</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-sky-400/15 col-span-2 sm:col-span-1">
              <span className="text-[10px] font-semibold text-slate-400 block">Paper Stock</span>
              <span className="text-xs sm:text-sm font-bold text-white">60# Uncoated White</span>
            </div>
          </div>

          {/* Character Anchor Lock */}
          <div className="glacier-glass-subtle p-3.5 rounded-xl border border-sky-400/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1">
                <User className="w-3 h-3" /> Character Consistency Anchor
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                Locked Across All Pages
              </span>
            </div>
            <p className="text-xs font-semibold text-white">
              {book.character.name} &bull; <span className="text-[#a0b4c4]">{book.character.type}</span>
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {book.character.traits.map((trait, idx) => (
                <span
                  key={idx}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-sky-400/15 text-sky-200 border border-sky-400/25"
                >
                  {trait}
                </span>
              ))}
            </div>
            {book.referenceImageUrl && (
              <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={book.referenceImageUrl}
                  alt="Reference Anchor"
                  className="w-8 h-8 rounded object-cover border border-sky-400/40"
                />
                <span className="text-[11px] text-sky-300 font-medium">Grounded with Reference Photo Asset</span>
              </div>
            )}
          </div>

          {/* Economics & Pages Summary */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-sky-400/25 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400">Page Count &amp; Economics</span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between border-b border-white/10 pb-1">
                <span className="text-slate-400">Total Book Pages:</span>
                <span className="font-bold text-white">{quote.totalPages} pages</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-1">
                <span className="text-slate-400">Free Gift Pages:</span>
                <span className="font-bold text-emerald-300">5 pages ($0.00)</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-slate-400">AI Synthesis Tokens:</span>
                <span className="font-bold text-sky-300">{quote.tokensRequired} tokens</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-slate-400">Digital Price:</span>
                <span className="font-bold text-white">${quote.priceUsd.toFixed(2)} USD</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-4 border-t border-sky-400/20 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold glacier-btn text-[#001f2e] rounded-xl shadow-md transition-all active:scale-95"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
