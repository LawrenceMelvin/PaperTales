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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-[#FFFDF9] rounded-3xl border border-[#E8DFD3] shadow-2xl p-6 sm:p-7 text-[#1E2530] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E8DFD3]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black font-serif tracking-tight text-[#1E2530]">Book Specifications &amp; Details</h3>
              <p className="text-xs text-[#5C5347]">Technical print metadata &amp; character anchors</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#FAF6EE] hover:bg-amber-100/70 text-slate-500 hover:text-[#1E2530] flex items-center justify-center transition-all border border-[#E8DFD3] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Details Grid */}
        <div className="py-5 space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          {/* Title & Author */}
          <div className="bg-[#FAF6EE] p-3.5 rounded-xl border border-[#E8DFD3] space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">Title &amp; Creator</span>
            <h4 className="text-sm sm:text-base font-extrabold text-[#1E2530] font-serif">{book.title}</h4>
            {book.subtitle && <p className="text-xs text-[#5C5347]">{book.subtitle}</p>}
            <p className="text-xs text-[#5C5347] pt-1">
              {book.authorName ? (
                <>
                  Author: <strong className="text-[#1E2530]">{book.authorName}</strong> &bull;{" "}
                </>
              ) : null}
              Genre: <span className="capitalize text-amber-800 font-semibold">{book.genre.replace("_", " ")}</span>
            </p>
          </div>

          {/* Physical Specifications */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            <div className="p-3 rounded-xl bg-[#FAF6EE] border border-[#E8DFD3]">
              <span className="text-[10px] font-semibold text-[#5C5347] block">Trim Size</span>
              <span className="text-xs sm:text-sm font-bold text-[#1E2530]">
                {book.format?.trimSize === "6x9"
                  ? '6" × 9" Digest'
                  : book.format?.trimSize === "8.5x11"
                  ? '8.5" × 11" Letter'
                  : '8.5" × 8.5" Square'}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-[#FAF6EE] border border-[#E8DFD3]">
              <span className="text-[10px] font-semibold text-[#5C5347] block">Binding</span>
              <span className="text-xs sm:text-sm font-bold text-[#1E2530]">Archival Softcover</span>
            </div>
            <div className="p-3 rounded-xl bg-[#FAF6EE] border border-[#E8DFD3] col-span-2 sm:col-span-1">
              <span className="text-[10px] font-semibold text-[#5C5347] block">Paper Stock</span>
              <span className="text-xs sm:text-sm font-bold text-[#1E2530]">60# Uncoated White</span>
            </div>
          </div>

          {/* Character Anchor Lock */}
          <div className="bg-[#FAF6EE] p-3.5 rounded-xl border border-[#E8DFD3] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1">
                <User className="w-3 h-3" /> Character Consistency Anchor
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-300">
                Locked Across All Pages
              </span>
            </div>
            <p className="text-xs font-semibold text-[#1E2530]">
              {book.character.name || "Custom Theme"} {book.character.type ? <>&bull; <span className="text-[#5C5347]">{book.character.type}</span></> : null}
            </p>
            {book.character.traits.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {book.character.traits.map((trait, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-white text-[#1E2530] border border-[#E8DFD3]"
                  >
                    {trait}
                  </span>
                ))}
              </div>
            )}
            {book.referenceImageUrl && (
              <div className="flex items-center gap-2 pt-2 border-t border-[#E8DFD3]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={book.referenceImageUrl}
                  alt="Reference Anchor"
                  className="w-8 h-8 rounded object-cover border border-amber-300"
                />
                <span className="text-[11px] text-amber-800 font-medium">Grounded with Reference Photo Asset</span>
              </div>
            )}
          </div>

          {/* Pages & Pricing Summary */}
          <div className="p-3.5 rounded-xl bg-[#FAF6EE] border border-[#E8DFD3] space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">Page Count &amp; Pricing Summary</span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between border-b border-[#E8DFD3] pb-1">
                <span className="text-[#5C5347]">Total Book Pages:</span>
                <span className="font-bold text-[#1E2530]">{quote.totalPages} pages</span>
              </div>
              <div className="flex justify-between border-b border-[#E8DFD3] pb-1">
                <span className="text-[#5C5347]">Free Starter Pages:</span>
                <span className="font-bold text-emerald-700">{quote.freePages} pages ($0.00)</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-[#5C5347]">AI Synthesis Tokens:</span>
                <span className="font-bold text-amber-800">{quote.tokensRequired} tokens</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-[#5C5347]">Digital Edition:</span>
                <span className="font-bold text-[#1E2530]">${quote.priceUsd.toFixed(2)} USD</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-4 border-t border-[#E8DFD3] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
