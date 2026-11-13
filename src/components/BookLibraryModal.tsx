"use client";

import React, { useState, useEffect } from "react";
import { BookOpen, Sparkles, X, Palette, Coins, ArrowRight, Bookmark } from "lucide-react";
import { PRE_DESIGNED_LIBRARY, LibraryBookItem } from "@/lib/library-books";
import { BookProject } from "@/types/book";
import { useAuth } from "@/components/AuthProvider";

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
  const { tokenBalance } = useAuth();
  const [selectedBook, setSelectedBook] = useState<LibraryBookItem | null>(null);

  if (!isOpen) return null;

  const handleRemixClick = (item: LibraryBookItem) => {
    if (tokenBalance < item.remixCostTokens) {
      onOpenTokenModal();
      return;
    }

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/55 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-[#FFFDF9] border-2 border-[#E8DFD3] rounded-3xl shadow-2xl overflow-hidden text-[#1E2530]">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-[#E8DFD3] flex items-center justify-between bg-[#FAF6EE]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black font-serif text-[#1E2530] tracking-tight">
                  Pre-Designed Book Library
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                  AI Remix Studio
                </span>
              </div>
              <p className="text-xs text-[#5C5347]">
                Choose an existing masterpiece &amp; personalize names, storyline or art with Tokens
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Token Badge */}
            <div
              onClick={onOpenTokenModal}
              className="cursor-pointer flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-amber-300 text-xs font-bold text-amber-900 hover:border-amber-500 transition-all shadow-2xs"
              title="Click to refill tokens"
            >
              <Coins className="w-3.5 h-3.5 text-amber-600" />
              <span>{tokenBalance} Tokens</span>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white hover:bg-[#FAF6EE] text-slate-500 hover:text-[#1E2530] flex items-center justify-center border border-[#E8DFD3] transition-colors cursor-pointer"
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
                className="rounded-2xl border border-[#E8DFD3] bg-[#FAF6EE] p-4 sm:p-5 flex flex-col justify-between hover:border-amber-400 hover:bg-white transition-all group shadow-xs"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                      {item.genreLabel} &bull; Ages {item.targetAge}
                    </span>
                    <span className="text-[11px] font-bold text-emerald-700">
                      {item.pageCount} Pages Ready
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm sm:text-base font-bold font-serif text-[#1E2530] group-hover:text-amber-800 transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-amber-800 font-medium mt-0.5">
                      {item.subtitle}
                    </p>
                  </div>

                  <p className="text-xs text-[#5C5347] leading-relaxed">
                    {item.description}
                  </p>

                  <div className="pt-2 border-t border-[#E8DFD3] flex items-center gap-1.5 text-[11px] text-[#5C5347]">
                    <Bookmark className="w-3 h-3 text-amber-600" />
                    <span>Sample page: &quot;{item.previewPages[0]?.title}&quot;</span>
                  </div>
                </div>

                <div className="pt-4 mt-3 border-t border-[#E8DFD3] flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-900">
                    <Coins className="w-3.5 h-3.5 text-amber-600" />
                    <span>{item.remixCostTokens} Token to Remix &amp; Tweak</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemixClick(item)}
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Remix in Studio &rarr;</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Info footer box */}
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 flex items-center justify-between text-xs text-amber-950">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                Want to create a completely brand-new custom story? Initial brainstorming &amp; Page 1 design are <strong>100% Free</strong> in the Studio!
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-xs font-bold text-amber-800 hover:underline shrink-0 ml-4 cursor-pointer"
            >
              Start Blank Story &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
