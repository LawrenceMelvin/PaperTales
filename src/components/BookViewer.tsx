"use client";

import React, { useState } from "react";
import { BookProject, BookPage } from "@/types/book";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Printer,
  Edit3,
  Check,
  Sparkles,
  BookOpen,
  PenTool,
  Info,
  FileCheck,
  Smile,
  Baby,
  Eye,
  RotateCcw,
  Loader2,
  Send,
  Palette,
  RefreshCw,
  X,
} from "lucide-react";
import { getClientTokenBalance, deductClientTokens } from "@/lib/token-store";

interface BookViewerProps {
  book: BookProject;
  onPageUpdate: (updatedPage: BookPage) => void;
  onDownloadPdf: () => void;
  onOrderPhysical: () => void;
  onPrintFirstPage?: () => void;
  onOpenBookDetails?: () => void;
  onOpenTokenModal?: () => void;
  isDownloading?: boolean;
  isConfirmed?: boolean;
}

export default function BookViewer({
  book,
  onPageUpdate,
  onDownloadPdf,
  onOrderPhysical,
  onPrintFirstPage,
  onOpenBookDetails,
  onOpenTokenModal,
  isDownloading,
  isConfirmed = true,
}: BookViewerProps) {
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  const [editingStory, setEditingStory] = useState<boolean>(false);
  const [editText, setEditText] = useState<string>("");
  const [mobilePageTab, setMobilePageTab] = useState<"story" | "art">("story");

  // Floating AI text refine states
  const [textSelection, setTextSelection] = useState<{
    text: string;
    top: number;
    left: number;
    visible: boolean;
  } | null>(null);
  const [isRefiningText, setIsRefiningText] = useState<boolean>(false);
  const [customInstruction, setCustomInstruction] = useState<string>("");
  const [previousStoryText, setPreviousStoryText] = useState<string | null>(null);
  const [refineFeedback, setRefineFeedback] = useState<string | null>(null);

  // Art tweak states
  const [artModalOpen, setArtModalOpen] = useState<boolean>(false);
  const [artPrompt, setArtPrompt] = useState<string>("");
  const [isGeneratingArt, setIsGeneratingArt] = useState<boolean>(false);
  const [artFeedback, setArtFeedback] = useState<string | null>(null);

  const totalPages = book.pages.length;
  const isCover = currentPageIndex === 0;
  const activePage = !isCover ? book.pages[currentPageIndex - 1] : null;

  const handleNext = () => {
    if (currentPageIndex < totalPages) {
      setCurrentPageIndex((prev) => prev + 1);
      setEditingStory(false);
      setTextSelection(null);
      setArtModalOpen(false);
    }
  };

  const handlePrev = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex((prev) => prev - 1);
      setEditingStory(false);
      setTextSelection(null);
      setArtModalOpen(false);
    }
  };

  const handleStoryMouseUp = () => {
    setTimeout(() => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed) {
        return;
      }
      const text = sel.toString().trim();
      if (text.length < 3) {
        return;
      }
      try {
        const range = sel.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        setTextSelection({
          text,
          top: Math.max(16, rect.top - 8),
          left: Math.max(160, Math.min(window.innerWidth - 180, rect.left + rect.width / 2)),
          visible: true,
        });
      } catch (e) {
        console.warn("Selection positioning error:", e);
      }
    }, 20);
  };

  const handleApplyRefine = async (instruction: string) => {
    if (!textSelection || !activePage) return;
    const balance = getClientTokenBalance();
    if (balance < 1) {
      setTextSelection(null);
      if (onOpenTokenModal) onOpenTokenModal();
      return;
    }

    setIsRefiningText(true);
    const targetSnippet = textSelection.text;
    const currentFullStory = activePage.storyText;

    try {
      const res = await fetch("/api/ai/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalText: targetSnippet,
          instruction,
          fullStoryText: currentFullStory,
          bookTitle: book.title,
          genre: book.genre,
        }),
      });

      const data = await res.json();
      if (data.success && data.refinedText) {
        deductClientTokens(1);
        setPreviousStoryText(currentFullStory);

        let updatedStory = currentFullStory;
        if (currentFullStory.includes(targetSnippet)) {
          updatedStory = currentFullStory.replace(targetSnippet, data.refinedText);
        } else {
          // Robust whitespace-agnostic replacement if browser collapsed newlines into spaces
          const escaped = targetSnippet
            .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
            .replace(/\s+/g, "\\s+");
          const regex = new RegExp(escaped);
          if (regex.test(currentFullStory)) {
            updatedStory = currentFullStory.replace(regex, data.refinedText);
          } else {
            const trimmedTarget = targetSnippet.trim();
            if (currentFullStory.includes(trimmedTarget)) {
              updatedStory = currentFullStory.replace(trimmedTarget, data.refinedText);
            } else {
              updatedStory = data.refinedText;
            }
          }
        }

        onPageUpdate({ ...activePage, storyText: updatedStory });
        setRefineFeedback(data.explanation || "Text polished with AI!");
        setTimeout(() => setRefineFeedback(null), 5000);
      }
    } catch (err) {
      console.error("Failed to refine story snippet:", err);
    } finally {
      setIsRefiningText(false);
      setTextSelection(null);
      setCustomInstruction("");
      window.getSelection()?.removeAllRanges();
    }
  };

  const handleUndoRefine = () => {
    if (previousStoryText && activePage) {
      onPageUpdate({ ...activePage, storyText: previousStoryText });
      setPreviousStoryText(null);
      setRefineFeedback("Restored previous text");
      setTimeout(() => setRefineFeedback(null), 3000);
    }
  };

  const handleTweakArt = async (customInstruction?: string) => {
    if (!activePage) return;
    const balance = getClientTokenBalance();
    if (balance < 2) {
      setArtModalOpen(false);
      if (onOpenTokenModal) onOpenTokenModal();
      return;
    }

    setIsGeneratingArt(true);
    try {
      const fullPrompt = customInstruction
        ? `${activePage.imagePrompt || "coloring page illustration"}, modification: ${customInstruction}`
        : `${activePage.imagePrompt || "coloring page illustration"}, fresh alternative composition`;

      const res = await fetch("/api/ai/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: fullPrompt,
          characterTraits: book.character?.traits?.join(", ") || "",
          pageNumber: activePage.pageNumber,
        }),
      });

      const data = await res.json();
      if (data.success) {
        deductClientTokens(2);
        if (data.imageUrl) {
          onPageUpdate({ ...activePage, imageUrl: data.imageUrl, svgData: undefined });
        } else if (data.svg) {
          onPageUpdate({ ...activePage, svgData: data.svg, imageUrl: undefined });
        }
        setArtFeedback("Artwork updated!");
        setTimeout(() => setArtFeedback(null), 4000);
      }
    } catch (err) {
      console.error("Failed to tweak art:", err);
    } finally {
      setIsGeneratingArt(false);
      setArtModalOpen(false);
      setArtPrompt("");
    }
  };

  const startEdit = (text: string) => {
    setEditText(text);
    setEditingStory(true);
  };

  const saveEdit = () => {
    if (activePage) {
      onPageUpdate({ ...activePage, storyText: editText });
    }
    setEditingStory(false);
  };

  const isIceCreamTheme =
    activePage?.title.toLowerCase().includes("ice") ||
    activePage?.title.toLowerCase().includes("cupcake") ||
    activePage?.storyText.toLowerCase().includes("ice cream") ||
    activePage?.storyText.toLowerCase().includes("biscuit");

  const isJournalOrTask =
    book.genre === "memory_book" ||
    /\b(journal|task|planner|log|coding|checklist|agenda|developer|notes)\b/i.test(book.title || "") ||
    Boolean(book.subtitle && /\b(journal|task|planner|log|coding|checklist|agenda|developer|notes)\b/i.test(book.subtitle)) ||
    Boolean(activePage?.title && /\b(day\s*\d+|task|log|checklist)\b/i.test(activePage.title));

  return (
    <div className="flex flex-col items-center w-full">
      {/* Top Header & Spread Status */}
      <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 px-1 sm:px-2 gap-2">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-base sm:text-xl font-extrabold text-white tracking-tight">
              {book.title}
            </h2>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-sky-400/20 text-sky-300 font-bold border border-sky-400/30">
              8.5&quot; &times; 8.5&quot; Square
            </span>
            {isConfirmed && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 flex items-center gap-1">
                <FileCheck className="w-3 h-3" /> Confirmed Proof
              </span>
            )}
          </div>
          <p className="text-xs text-[#a0b4c4] mt-0.5">
            By <strong className="text-white">{book.authorName}</strong> &bull; {book.pageCount} Pages &bull; Archival Saddle-Stitch POD
          </p>
        </div>

        {/* Quick actions top right */}
        <div className="flex items-center gap-2">
          <button
            onClick={onDownloadPdf}
            disabled={isDownloading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold glacier-glass-subtle hover:bg-slate-800 text-sky-300 border border-sky-400/30 rounded-xl shadow-sm transition-all active:scale-95"
            title="Download Full PDF"
          >
            <Download className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">{isDownloading ? "Compiling..." : "Download Full PDF"}</span>
            <span className="sm:hidden">PDF</span>
          </button>
        </div>
      </div>

      {/* Book Spread Viewport */}
      <div className="relative w-full min-h-[460px] sm:min-h-[520px] lg:min-h-[560px] glacier-glass rounded-2xl p-3 sm:p-6 lg:p-7 flex items-center justify-center border border-sky-400/25 shadow-2xl">
        {isCover ? (
          /* Cover Spread */
          <div className="w-full max-w-sm sm:max-w-md aspect-square bg-[#0f1524] rounded-r-2xl border border-sky-400/40 book-shadow flex flex-col justify-between p-6 sm:p-8 relative overflow-hidden text-white">
            <div className="absolute top-0 bottom-0 left-0 w-3 bg-gradient-to-r from-sky-400/40 to-sky-400/10" />

            <div className="text-center pt-2 sm:pt-4">
              <span className="text-[10px] sm:text-xs uppercase tracking-widest font-extrabold text-sky-300">
                Personalized Story &amp; Coloring
              </span>
              <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight mt-1 mb-1 font-serif">
                {book.title}
              </h1>
              {book.subtitle && <p className="text-xs font-medium text-[#a0b4c4]">{book.subtitle}</p>}
            </div>

            {/* Cover Graphic Frame */}
            <div className="w-full flex-1 my-3 sm:my-4 border-2 border-dashed border-sky-400/30 rounded-xl flex flex-col items-center justify-center p-4 bg-slate-900/60">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-sky-400/60 flex items-center justify-center mb-2 bg-slate-950">
                <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 text-sky-400" />
              </div>
              <p className="text-xs sm:text-sm font-bold text-white">Featuring {book.character.name}</p>
              <p className="text-[11px] text-[#a0b4c4] text-center max-w-[220px] mt-0.5">
                {book.character.type} &bull; {book.character.traits.join(", ")}
              </p>
            </div>

            <div className="flex items-center justify-between border-t border-white/10 pt-3 text-xs text-[#a0b4c4]">
              <span>Author: <strong className="text-white">{book.authorName}</strong></span>
              <span className="text-[10px] text-sky-300">PaperTales AI Studio</span>
            </div>
          </div>
        ) : (
          /* Interior 2-Page Spread */
          <div className="w-full h-full max-w-5xl flex flex-col sm:flex-row bg-white rounded-2xl border border-slate-300 book-shadow overflow-hidden text-slate-900">
            {/* Mobile Single-Page View Toggle (Only on small phone screens) */}
            <div className="sm:hidden flex border-b border-slate-200 bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setMobilePageTab("story")}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1 ${
                  mobilePageTab === "story" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-sky-600" />
                {isJournalOrTask ? `Daily Task Sheet` : `Reading Text`} (Page {activePage?.pageNumber})
              </button>
              <button
                type="button"
                onClick={() => setMobilePageTab("art")}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1 ${
                  mobilePageTab === "art" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"
                }`}
              >
                <PenTool className="w-3.5 h-3.5 text-sky-600" />
                {isJournalOrTask ? `Ruled Notes Page` : `Coloring Art`}
              </button>
            </div>

            {/* Left Page (Story & Reading Text OR Daily Task Sheet) */}
            <div
              className={`flex-1 p-5 sm:p-8 lg:p-10 flex flex-col justify-between border-b sm:border-b-0 sm:border-r border-slate-200 relative bg-amber-50/25 ${
                mobilePageTab === "art" ? "hidden sm:flex" : "flex"
              }`}
            >
              <div className="hidden sm:block absolute top-0 bottom-0 right-0 w-5 spine-gradient pointer-events-none" />

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {isJournalOrTask ? `Daily Task Plan` : `Chapter ${activePage?.pageNumber}`}
                </span>
                <h3 className="text-lg sm:text-2xl font-black font-serif text-slate-900 mt-1 mb-4">
                  {activePage?.title}
                </h3>

                {editingStory ? (
                  <div className="flex flex-col gap-2">
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      rows={6}
                      className="w-full text-sm p-3 rounded-xl border border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500 font-serif leading-relaxed text-slate-900"
                    />
                    <button
                      onClick={saveEdit}
                      className="self-end px-3 py-1.5 text-xs font-bold bg-sky-600 text-white rounded-lg flex items-center gap-1 shadow-sm"
                    >
                      <Check className="w-3.5 h-3.5" /> Save Story
                    </button>
                  </div>
                ) : (
                  <div className="group relative">
                    <div className="text-[11px] font-medium text-sky-600 mb-1 flex items-center gap-1 select-none">
                      <Sparkles className="w-3 h-3 text-sky-500" />
                      <span>Highlight any text to polish or rewrite with AI (1 🪙)</span>
                    </div>
                    <p
                      onMouseUp={handleStoryMouseUp}
                      onTouchEnd={handleStoryMouseUp}
                      className="text-sm sm:text-base lg:text-lg font-serif text-slate-800 leading-relaxed sm:leading-loose cursor-text selection:bg-sky-200 selection:text-sky-950 whitespace-pre-wrap"
                    >
                      {activePage?.storyText}
                    </p>
                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                      <button
                        onClick={() => startEdit(activePage?.storyText || "")}
                        className="sm:opacity-0 group-hover:opacity-100 transition-opacity text-xs text-sky-700 font-semibold flex items-center gap-1 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-200 w-fit"
                      >
                        <Edit3 className="w-3 h-3 text-sky-600" /> Manual Edit
                      </button>
                      {previousStoryText && (
                        <button
                          onClick={handleUndoRefine}
                          className="text-xs font-bold text-sky-600 hover:text-sky-800 flex items-center gap-1 bg-sky-50/80 px-2.5 py-1 rounded-lg border border-sky-300 w-fit transition-all active:scale-95"
                        >
                          <RotateCcw className="w-3 h-3" /> Undo AI Refinement
                        </button>
                      )}
                    </div>
                    {refineFeedback && (
                      <div className="mt-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg flex items-center gap-1.5 animate-in fade-in">
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>{refineFeedback}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-200/60 pt-3 mt-4">
                <span className="truncate max-w-[150px]">{book.title}</span>
                <span>{isJournalOrTask ? `Page ${activePage?.pageNumber} (Daily Checklist)` : `Page ${activePage?.pageNumber}`}</span>
              </div>
            </div>

            {/* Right Page (Ruled Journal Page OR Coloring Line-Art Illustration) */}
            <div
              className={`flex-1 p-5 sm:p-8 lg:p-10 flex flex-col justify-between relative bg-white ${
                mobilePageTab === "story" ? "hidden sm:flex" : "flex"
              }`}
            >
              <div className="hidden sm:block absolute top-0 bottom-0 left-0 w-5 spine-gradient pointer-events-none" />

              {isJournalOrTask ? (
                /* Authentic Printed Ruled Notebook & Journal Page */
                <div className="w-full flex-1 border border-slate-300/80 rounded-xl p-5 sm:p-7 flex flex-col justify-between bg-[#fafaf7] min-h-[280px] sm:min-h-[340px] shadow-inner relative">
                  {/* Journal Top Header */}
                  <div className="flex items-center justify-between border-b-2 border-slate-300 pb-2.5 mb-2">
                    <div>
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wider font-sans">
                        Daily Notes &amp; Reflection
                      </span>
                      <span className="text-[11px] text-sky-700 font-mono ml-2 font-bold">
                        Day {activePage?.pageNumber}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      Date: _______________
                    </div>
                  </div>

                  {/* Physical Printed Ruled Lines for Pen & Pencil Writing */}
                  <div className="flex-1 flex flex-col justify-between py-2 space-y-3.5">
                    {[...Array(8)].map((_, i) => (
                      <div
                        key={i}
                        className="w-full border-b border-slate-300/70 h-6 flex items-end"
                      >
                        <span className="text-[10px] text-slate-300 font-mono select-none pl-1">
                          {i === 0 ? "// Key notes, links or code thoughts:" : ""}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Bottom Daily Goal / Sign-off Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-300/80 text-[11px] text-slate-500 font-sans mt-2">
                    <span className="font-semibold text-slate-600">Daily Video Status:</span>
                    <span className="text-slate-500 font-mono">[ ] Recorded &bull; [ ] Published</span>
                  </div>
                </div>
              ) : (
                /* Vector coloring line art container */
                <div className="w-full flex-1 border-2 border-slate-900 rounded-xl p-4 flex flex-col items-center justify-center relative overflow-hidden bg-white min-h-[260px] sm:min-h-[320px]">
                  {/* Tweak art trigger button in top-right */}
                  <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setArtModalOpen(true)}
                    disabled={isGeneratingArt}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-900/90 hover:bg-slate-950 text-sky-300 border border-sky-400/40 shadow-md flex items-center gap-1.5 transition-all hover:scale-102 active:scale-95 cursor-pointer"
                  >
                    {isGeneratingArt ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-400" />
                    ) : (
                      <Palette className="w-3.5 h-3.5 text-sky-400" />
                    )}
                    <span>Tweak Art</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-400/20 text-sky-300 font-mono">
                      2 🪙
                    </span>
                  </button>
                </div>

                {/* Render customized illustration if generated, else fall back to theme template */}
                {activePage?.imageUrl ? (
                  <img
                    src={activePage.imageUrl}
                    alt={activePage.title}
                    className="w-full h-full max-h-[340px] object-contain"
                  />
                ) : activePage?.svgData ? (
                  <div
                    dangerouslySetInnerHTML={{ __html: activePage.svgData }}
                    className="w-full h-full flex items-center justify-center max-h-[340px]"
                  />
                ) : isIceCreamTheme ? (
                  /* Ice Cream Cone Vector Line Art (Matching User's Hand-drawn Sketch!) */
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" className="w-full h-full max-h-[340px]">
                    <rect width="400" height="400" fill="#FFFFFF" />
                    {/* Cloud or background sparkles */}
                    <circle cx="100" cy="80" r="14" fill="none" stroke="#111111" strokeWidth="2.5" />
                    <circle cx="310" cy="90" r="16" fill="none" stroke="#111111" strokeWidth="2.5" />
                    {/* Ice Cream Cloud / Scoop Tops */}
                    <path
                      d="M 120 180 C 110 130, 160 110, 200 110 C 240 110, 290 130, 280 180 Z"
                      fill="#FFFFFF"
                      stroke="#111111"
                      strokeWidth="5"
                    />
                    {/* Wavy bottom of the scoop */}
                    <path
                      d="M 115 180 Q 135 198 155 180 Q 175 198 200 180 Q 225 198 245 180 Q 265 198 285 180"
                      fill="none"
                      stroke="#111111"
                      strokeWidth="4.5"
                    />
                    {/* Delicious Cherry on Top */}
                    <circle cx="200" cy="90" r="16" fill="#FFFFFF" stroke="#111111" strokeWidth="4" />
                    <path d="M 205 76 Q 225 50 240 55" fill="none" stroke="#111111" strokeWidth="3" />
                    {/* Cone Triangle */}
                    <polygon points="125,185 275,185 200,340" fill="#FFFFFF" stroke="#111111" strokeWidth="5" />
                    {/* Crosshatch Waffle Pattern */}
                    <line x1="145" y1="185" x2="225" y2="340" stroke="#111111" strokeWidth="3" />
                    <line x1="175" y1="185" x2="215" y2="300" stroke="#111111" strokeWidth="3" />
                    <line x1="255" y1="185" x2="175" y2="340" stroke="#111111" strokeWidth="3" />
                    <line x1="225" y1="185" x2="185" y2="300" stroke="#111111" strokeWidth="3" />
                    {/* Label matching the sketch: Ice */}
                    <text
                      x="200"
                      y="375"
                      textAnchor="middle"
                      fontSize="22"
                      fontWeight="bold"
                      fill="#111111"
                      fontFamily="serif"
                      letterSpacing="2"
                    >
                      Ice Cream
                    </text>
                  </svg>
                ) : book.genre === "math_book" ? (
                  /* Math & Logic Quest Illustration */
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" className="w-full h-full max-h-[340px]">
                    <rect width="400" height="400" fill="#FFFFFF" />
                    {/* Geometric Castle Tower */}
                    <rect x="50" y="180" width="80" height="180" fill="none" stroke="#111111" strokeWidth="4" />
                    <polygon points="50,180 90,120 130,180" fill="none" stroke="#111111" strokeWidth="4" />
                    <rect x="270" y="180" width="80" height="180" fill="none" stroke="#111111" strokeWidth="4" />
                    <polygon points="270,180 310,120 350,180" fill="none" stroke="#111111" strokeWidth="4" />
                    {/* Archway */}
                    <path d="M 150 360 L 150 250 Q 200 190 250 250 L 250 360" fill="none" stroke="#111111" strokeWidth="4.5" />
                    {/* Number Keys / Counting Elements 1, 2, 3 */}
                    <circle cx="100" cy="70" r="24" fill="none" stroke="#111111" strokeWidth="3.5" />
                    <text x="100" y="78" textAnchor="middle" fontSize="26" fontWeight="bold" fill="#111111" fontFamily="sans-serif">1</text>
                    <circle cx="200" cy="50" r="24" fill="none" stroke="#111111" strokeWidth="3.5" />
                    <text x="200" y="58" textAnchor="middle" fontSize="26" fontWeight="bold" fill="#111111" fontFamily="sans-serif">2</text>
                    <circle cx="300" cy="70" r="24" fill="none" stroke="#111111" strokeWidth="3.5" />
                    <text x="300" y="78" textAnchor="middle" fontSize="26" fontWeight="bold" fill="#111111" fontFamily="sans-serif">3</text>
                    {/* Math Operator Stars */}
                    <text x="150" y="65" textAnchor="middle" fontSize="24" fontWeight="bold" fill="#111111">+</text>
                    <text x="250" y="65" textAnchor="middle" fontSize="24" fontWeight="bold" fill="#111111">=</text>
                    {/* Character solving the puzzle */}
                    <circle cx="200" cy="290" r="30" fill="none" stroke="#111111" strokeWidth="4" />
                    <circle cx="190" cy="285" r="4" fill="#111111" />
                    <circle cx="210" cy="285" r="4" fill="#111111" />
                    <path d="M 193 300 Q 200 310 207 300" fill="none" stroke="#111111" strokeWidth="3" />
                  </svg>
                ) : book.genre === "science_book" ? (
                  /* Science & Nature Explorer Illustration */
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" className="w-full h-full max-h-[340px]">
                    <rect width="400" height="400" fill="#FFFFFF" />
                    {/* Saturn and Orbit Rings */}
                    <ellipse cx="280" cy="110" rx="42" ry="42" fill="none" stroke="#111111" strokeWidth="4" />
                    <ellipse cx="280" cy="110" rx="75" ry="18" fill="none" stroke="#111111" strokeWidth="3.5" transform="rotate(-20 280 110)" />
                    {/* Rocket Shuttle */}
                    <path d="M 130 190 Q 170 140 210 200 Q 180 230 130 190 Z" fill="none" stroke="#111111" strokeWidth="4" />
                    <circle cx="170" cy="180" r="10" fill="none" stroke="#111111" strokeWidth="3" />
                    <path d="M 120 195 L 105 215 L 128 205" fill="none" stroke="#111111" strokeWidth="3.5" />
                    <path d="M 145 170 L 150 150 L 160 170" fill="none" stroke="#111111" strokeWidth="3.5" />
                    {/* Rocket Flame */}
                    <path d="M 105 215 Q 85 235 90 250 Q 110 235 120 220" fill="none" stroke="#111111" strokeWidth="3" />
                    {/* Moon surface & craters */}
                    <path d="M 0 370 Q 200 300 400 370" fill="none" stroke="#111111" strokeWidth="4" />
                    <ellipse cx="120" cy="350" rx="25" ry="10" fill="none" stroke="#111111" strokeWidth="3" />
                    <ellipse cx="260" cy="340" rx="35" ry="14" fill="none" stroke="#111111" strokeWidth="3" />
                    {/* Constellations */}
                    <polygon points="60,60 64,72 76,72 66,80 70,92 60,84 50,92 54,80 44,72 56,72" fill="none" stroke="#111111" strokeWidth="2.5" />
                    <polygon points="170,80 173,88 181,88 175,93 177,101 170,96 163,101 165,93 159,88 167,88" fill="none" stroke="#111111" strokeWidth="2" />
                  </svg>
                ) : book.genre === "memory_book" ? (
                  /* Memory Keepsake Illustration */
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" className="w-full h-full max-h-[340px]">
                    <rect width="400" height="400" fill="#FFFFFF" />
                    {/* Polaroid Style Photo Frame */}
                    <rect x="60" y="40" width="280" height="320" rx="12" fill="none" stroke="#111111" strokeWidth="4" />
                    <rect x="85" y="65" width="230" height="210" rx="6" fill="none" stroke="#111111" strokeWidth="3.5" />
                    {/* Sun in photo corner */}
                    <circle cx="120" cy="100" r="16" fill="none" stroke="#111111" strokeWidth="3" />
                    <line x1="120" y1="76" x2="120" y2="70" stroke="#111111" strokeWidth="3" />
                    <line x1="120" y1="124" x2="120" y2="130" stroke="#111111" strokeWidth="3" />
                    <line x1="96" y1="100" x2="90" y2="100" stroke="#111111" strokeWidth="3" />
                    <line x1="144" y1="100" x2="150" y2="100" stroke="#111111" strokeWidth="3" />
                    {/* Heart Ribbon */}
                    <path d="M 200 130 C 200 100, 160 100, 160 130 C 160 160, 200 190, 200 190 C 200 190, 240 160, 240 130 C 240 100, 200 100, 200 130 Z" fill="none" stroke="#111111" strokeWidth="3.5" />
                    {/* Beach Waves or Grass */}
                    <path d="M 85 240 Q 140 220 200 240 T 315 240" fill="none" stroke="#111111" strokeWidth="3" />
                    {/* Handwritten style caption lines */}
                    <line x1="100" y1="305" x2="300" y2="305" stroke="#111111" strokeWidth="2.5" strokeDasharray="6,4" />
                    <line x1="120" y1="330" x2="280" y2="330" stroke="#111111" strokeWidth="2" strokeDasharray="6,4" />
                  </svg>
                ) : (
                  /* Whimsical Forest Coloring Art (Barnaby & Friends) */
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" className="w-full h-full max-h-[340px]">
                    <rect width="400" height="400" fill="#FFFFFF" />
                    {/* Outer border & tree frames */}
                    <path d="M 30 380 Q 80 180 120 380" fill="none" stroke="#111111" strokeWidth="4" />
                    <path d="M 280 380 Q 330 180 370 380" fill="none" stroke="#111111" strokeWidth="4" />
                    {/* Ground hills */}
                    <path d="M 0 360 Q 200 320 400 360" fill="none" stroke="#111111" strokeWidth="4" />
                    {/* Barnaby Character Representation */}
                    <circle cx="200" cy="210" r="65" fill="#FFFFFF" stroke="#111111" strokeWidth="4.5" />
                    {/* Ears */}
                    <ellipse cx="145" cy="165" rx="20" ry="42" fill="#FFFFFF" stroke="#111111" strokeWidth="4" transform="rotate(-15 145 165)" />
                    <ellipse cx="255" cy="165" rx="20" ry="42" fill="#FFFFFF" stroke="#111111" strokeWidth="4" transform="rotate(15 255 165)" />
                    {/* Eyes & Nose */}
                    <circle cx="178" cy="200" r="8" fill="#111111" />
                    <circle cx="222" cy="200" r="8" fill="#111111" />
                    <polygon points="200,218 190,232 210,232" fill="#111111" />
                    <path d="M 190 236 Q 200 250 210 236" fill="none" stroke="#111111" strokeWidth="3.5" />
                    {/* Signature Scarf */}
                    <path d="M 150 268 Q 200 295 250 268 Q 200 280 150 268" fill="#FFFFFF" stroke="#111111" strokeWidth="4.5" />
                    {/* Floating butterflies / stars */}
                    <path d="M 80 120 Q 95 105 110 120 Q 95 135 80 120 Z" fill="none" stroke="#111111" strokeWidth="2.5" />
                    <path d="M 300 110 Q 315 95 330 110 Q 315 125 300 110 Z" fill="none" stroke="#111111" strokeWidth="2.5" />
                  </svg>
                )}

                <div className="absolute bottom-2 text-center text-[10px] font-semibold text-slate-400">
                  Crisp Vector Line-Art &bull; Print Ready (300 DPI) &bull; {book.genre.replace("_", " ").toUpperCase()}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-200/60 pt-3 mt-4">
              <span>{isJournalOrTask ? "Ruled Journal & Notes Spread" : "Activity & Coloring Sheet"}</span>
              <span>{isJournalOrTask ? "Lulu Print-Ready (300 DPI)" : `Page ${activePage?.pageNumber} Illustration`}</span>
            </div>
          </div>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between w-full max-w-md my-4 px-2">
        <button
          onClick={handlePrev}
          disabled={currentPageIndex === 0}
          className="flex items-center gap-1 px-3.5 py-2 text-xs font-semibold rounded-xl glacier-glass-subtle border border-sky-400/20 hover:border-sky-400/40 disabled:opacity-40 disabled:cursor-not-allowed text-[#a0b4c4] hover:text-white shadow-sm transition-all active:scale-95"
        >
          <ChevronLeft className="w-4 h-4" /> Previous
        </button>

        <span className="text-xs sm:text-sm font-bold text-sky-300 font-mono">
          {isCover ? "Book Cover" : `Spread ${currentPageIndex} of ${totalPages}`}
        </span>

        <button
          onClick={handleNext}
          disabled={currentPageIndex === totalPages}
          className="flex items-center gap-1 px-3.5 py-2 text-xs font-semibold rounded-xl glacier-glass-subtle border border-sky-400/20 hover:border-sky-400/40 disabled:opacity-40 disabled:cursor-not-allowed text-[#a0b4c4] hover:text-white shadow-sm transition-all active:scale-95"
        >
          Next <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Bottom Action Bar (Directly Matching the User's Hand-drawn Sketch) */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 pb-6 px-1">
        {/* Left: Book details button */}
        <button
          onClick={onOpenBookDetails}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 text-xs sm:text-sm font-bold rounded-xl glacier-glass-subtle hover:bg-slate-800 text-sky-200 border border-sky-400/30 shadow-md transition-all active:scale-95"
        >
          <Info className="w-4 h-4 text-sky-400" />
          <span>Book Details</span>
        </button>

        {/* Center / Secondary: Print First Page (Free Proof) */}
        {isConfirmed && onPrintFirstPage && (
          <button
            onClick={onPrintFirstPage}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl bg-slate-900/80 hover:bg-slate-800 text-emerald-300 border border-emerald-500/40 shadow-sm transition-all active:scale-95"
          >
            <Printer className="w-4 h-4 text-emerald-400" />
            <span>Print First Page (Free Proof)</span>
          </button>
        )}

        {/* Right: Order Physical Print */}
        <button
          onClick={onOrderPhysical}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 text-xs sm:text-sm font-extrabold glacier-btn text-[#001f2e] rounded-xl shadow-xl transition-all active:scale-95"
        >
          <Printer className="w-4 h-4 text-[#001f2e]" />
          <span>Order Physical Print</span>
        </button>
      </div>

      {/* Floating AI Text Refine Popover */}
      {textSelection?.visible && (
        <div
          style={{
            position: "fixed",
            top: `${textSelection.top}px`,
            left: `${textSelection.left}px`,
            transform: "translate(-50%, -100%)",
            zIndex: 60,
          }}
          className="glacier-glass rounded-2xl p-3 border border-sky-400/40 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 w-[300px] sm:w-[360px]"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-sky-200">
              <Sparkles className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
              <span>Refine with AI</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-400/20 text-sky-300 font-mono border border-sky-400/30">
                1 Token
              </span>
            </div>
            <button
              type="button"
              onClick={() => setTextSelection(null)}
              className="text-slate-400 hover:text-white p-0.5 rounded cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Snippet Preview */}
          <div className="text-[11px] text-slate-300 italic line-clamp-2 bg-slate-950/60 p-2 rounded-lg border border-white/10 mb-2.5">
            &ldquo;{textSelection.text}&rdquo;
          </div>

          {/* Preset Action Chips */}
          <div className="flex flex-wrap gap-1.5 mb-2.5">
            <button
              type="button"
              disabled={isRefiningText}
              onClick={() => handleApplyRefine("Make it playful, humorous, and full of giggles")}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-200 border border-sky-400/30 flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
            >
              <Smile className="w-3 h-3 text-sky-400" /> Playful
            </button>
            <button
              type="button"
              disabled={isRefiningText}
              onClick={() => handleApplyRefine("Simplify language for younger readers")}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
            >
              <Baby className="w-3 h-3 text-emerald-400" /> Simplify
            </button>
            <button
              type="button"
              disabled={isRefiningText}
              onClick={() => handleApplyRefine("Add rich sensory details and vivid imagery")}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-400/30 flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
            >
              <Eye className="w-3 h-3 text-purple-400" /> Sensory
            </button>
          </div>

          {/* Custom Instruction Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (customInstruction.trim()) {
                handleApplyRefine(customInstruction.trim());
              }
            }}
            className="flex items-center gap-1.5"
          >
            <input
              type="text"
              value={customInstruction}
              onChange={(e) => setCustomInstruction(e.target.value)}
              placeholder="Or type custom change..."
              disabled={isRefiningText}
              className="flex-1 bg-slate-900/90 text-xs text-white placeholder-slate-400 px-2.5 py-1.5 rounded-lg border border-sky-400/30 focus:outline-none focus:ring-1 focus:ring-sky-400"
            />
            <button
              type="submit"
              disabled={isRefiningText || !customInstruction.trim()}
              className="px-2.5 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center gap-1 disabled:opacity-50 transition-all cursor-pointer"
            >
              {isRefiningText ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
            </button>
          </form>
        </div>
      )}

      {/* Art Tweak Modal */}
      {artModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="glacier-glass rounded-2xl border border-sky-400/40 p-5 sm:p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-sky-400/20 text-sky-300 flex items-center justify-center border border-sky-400/30">
                  <Palette className="w-4 h-4 text-sky-400" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-extrabold text-white">
                    Tweak Illustration
                  </h4>
                  <p className="text-[11px] text-[#a0b4c4]">
                    Page {activePage?.pageNumber} Line Art &bull; 2 Tokens
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setArtModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Tell the AI Helper what visual elements you want added, removed, or modified for this page.
            </p>

            <div className="space-y-2">
              <input
                type="text"
                value={artPrompt}
                onChange={(e) => setArtPrompt(e.target.value)}
                placeholder="e.g. Add butterflies in background, make puppy wear a crown..."
                disabled={isGeneratingArt}
                className="w-full bg-slate-900/90 text-xs text-white placeholder-slate-400 p-3 rounded-xl border border-sky-400/30 focus:outline-none focus:ring-2 focus:ring-sky-400 font-sans"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
              <button
                type="button"
                disabled={isGeneratingArt}
                onClick={() => handleTweakArt()}
                className="w-full sm:w-1/2 py-2.5 px-3 text-xs font-bold rounded-xl glacier-glass-subtle hover:bg-slate-800 text-sky-200 border border-sky-400/30 flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-sky-400" />
                <span>Re-roll Scene (2 🪙)</span>
              </button>

              <button
                type="button"
                disabled={isGeneratingArt || !artPrompt.trim()}
                onClick={() => handleTweakArt(artPrompt.trim())}
                className="w-full sm:w-1/2 py-2.5 px-3 text-xs font-extrabold rounded-xl glacier-btn text-[#001f2e] flex items-center justify-center gap-1.5 shadow-lg transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {isGeneratingArt ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Drawing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Apply Tweak (2 🪙)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
