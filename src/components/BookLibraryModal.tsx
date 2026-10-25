"use client";

import React, { useState, useEffect } from "react";
import { BookOpen, Sparkles, X, Palette, Coins, ArrowRight, Bookmark } from "lucide-react";
import { PRE_DESIGNED_LIBRARY, LibraryBookItem } from "@/lib/library-books";
import { BookProject } from "@/types/book";
import { getClientTokenBalance, deductClientTokens } from "@/lib/token-store";

interface BookLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBookForRemix: (book: BookProject, remixCost: number) => void;
  onOpenTokenModal: () => void;
}

export default function BookLibraryModal({
  isOpen,
  onClose,
  onSelectBookForRemix,
  onOpenTokenModal,
}: BookLibraryModalProps) {
  const [tokenBalance, setTokenBalance] = useState<number>(0);
  const [selectedBook, setSelectedBook] = useState<LibraryBookItem | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTokenBalance(getClientTokenBalance());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRemixClick = (item: LibraryBookItem) => {
    const currentBalance = getClientTokenBalance();
    if (currentBalance < item.remixCostTokens) {
      onOpenTokenModal();
      return;
    }

    // Deduct 1 token for remixing pre-designed library book
    deductClientTokens(item.remixCostTokens);

    const project: BookProject = {
      id: `book_remix_${Date.now()}`,
      title: item.title,
      subtitle: item.subtitle,
      authorName: "PaperTales Studio",
      genre: item.genre,
      targetAge: item.targetAge,
      character: {
        name: "Explorer",
        type: "Adventure Character",
        traits: ["Cap", "Backpack", "Compass"],
      },
      pageCount: item.pageCount,
      pages: item.previewPages.map((p) => ({
        pageNumber: p.pageNumber,
        title: p.title,
        storyText: p.storyText,
        imagePrompt: p.imagePrompt,
      })),
      format: {
        trimSize: item.genre === "science_book" ? "8.5x11" : "8.5x8.5",
        interiorColor: item.genre === "science_book" ? "standard_color" : "black_and_white",
        binding: "saddle_stitch",
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSelectBookForRemix(project, item.remixCostTokens);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-[#0a1122] border-2 border-sky-400/40 rounded-3xl shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-sky-400/20 flex items-center justify-between bg-gradient-to-r from-sky-950/40 via-transparent to-purple-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-400/15 border border-sky-400/30 text-sky-300 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                  Pre-Designed Book Library
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30">
                  AI Remix Studio
                </span>
              </div>
              <p className="text-xs text-[#a0b4c4]">
                Choose an existing masterpiece &amp; personalize names, storyline or art with Tokens
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Token Badge */}
            <div
              onClick={onOpenTokenModal}
              className="cursor-pointer flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-sky-400/40 text-xs font-bold text-sky-300 hover:border-sky-400 transition-all"
              title="Click to refill tokens"
            >
              <Coins className="w-3.5 h-3.5 text-purple-300 animate-pulse" />
              <span>{tokenBalance} Tokens</span>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center border border-white/10 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Library Grid */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 glacier-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PRE_DESIGNED_LIBRARY.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-sky-400/20 bg-[#0c1830]/70 p-4 sm:p-5 flex flex-col justify-between hover:border-sky-400/50 hover:bg-[#0c1830] transition-all group"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-sky-500/15 text-sky-300 border border-sky-400/25">
                      {item.genreLabel} &bull; Ages {item.targetAge}
                    </span>
                    <span className="text-[11px] font-bold text-emerald-400">
                      {item.pageCount} Pages Ready
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm sm:text-base font-bold text-white group-hover:text-sky-300 transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-sky-200/70 font-medium mt-0.5">
                      {item.subtitle}
                    </p>
                  </div>

                  <p className="text-xs text-[#94a3b8] leading-relaxed">
                    {item.description}
                  </p>

                  <div className="pt-2 border-t border-white/5 flex items-center gap-1.5 text-[11px] text-slate-400">
                    <Bookmark className="w-3 h-3 text-sky-400" />
                    <span>Sample page: &quot;{item.previewPages[0]?.title}&quot;</span>
                  </div>
                </div>

                <div className="pt-4 mt-3 border-t border-sky-400/15 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-300">
                    <Coins className="w-3.5 h-3.5" />
                    <span>{item.remixCostTokens} Token to Remix &amp; Tweak</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemixClick(item)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-400 to-sky-300 hover:from-sky-300 hover:to-white text-slate-950 font-bold text-xs shadow-md flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Remix in Studio &rarr;</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Info footer box */}
          <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-400/25 flex items-center justify-between text-xs text-sky-200">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-sky-400 shrink-0" />
              <span>
                Want to create a completely brand-new custom story? Initial brainstorming &amp; Page 1 design are <strong>100% Free</strong> in the Studio!
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-xs font-bold text-sky-300 hover:underline shrink-0 ml-4 cursor-pointer"
            >
              Start Blank Story &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
