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
  isBookUnlocked?: boolean;
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
  isBookUnlocked = false,
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

  const is6x9 = book.format?.trimSize === "6x9";
  const is85x11 = book.format?.trimSize === "8.5x11";
  const isSquare = !is6x9 && !is85x11;

  const spreadAspectClass = is6x9
    ? "sm:aspect-[4/3] max-w-4xl"
    : is85x11
    ? "sm:aspect-[17/11] max-w-5xl"
    : "sm:aspect-[2/1] max-w-5xl";

  const coverAspectClass = is6x9
    ? "aspect-[6/9] max-w-[280px] sm:max-w-[320px]"
    : is85x11
    ? "aspect-[8.5/11] max-w-[300px] sm:max-w-[340px]"
    : "aspect-square max-w-[320px] sm:max-w-[380px]";

  const isJournal =
    is6x9 ||
    book.genre === "memory_book" ||
    Boolean(activePage?.journalData) ||
    /\b(journal|diary|planner|reflection|gratitude|notes)\b/i.test(book.title || "");

  const renderJournalPage = (
    page: BookPage | null | undefined,
    pNum: number,
    isRightPage: boolean
  ) => {
    const isBlackAndWhite = book.format?.interiorColor === "black_and_white";
    const sections = page?.journalData?.sections;
    const hasSections = Boolean(sections && sections.length > 0);
    const layoutType =
      page?.journalData?.layoutType ||
      (hasSections ? "guided_sections" : (page?.journalData?.reflectionPrompt ? "classic_prompt" : "empty_lined"));
    const isEmptyLined = layoutType === "empty_lined";
    const hasQuote = !isEmptyLined && Boolean(page?.journalData?.quote && page.journalData.quote.trim() !== "");
    const showMood = !isEmptyLined && Boolean(page?.journalData?.moodTracker);
    const rawBorder = page?.journalData?.borderText;
    const borderText =
      rawBorder && typeof rawBorder === "string" && rawBorder.trim().length <= 30 && !rawBorder.includes(".")
        ? rawBorder.trim()
        : undefined;
    const borderStyle = page?.journalData?.borderStyle || "none";
    const cornerDecorations = page?.journalData?.cornerDecorations || "none";
    const isRobotic = borderStyle === "robotic" || cornerDecorations === "tech_brackets";
    const lineRuleSpacing = page?.journalData?.lineRuleSpacing || "college";

    const headerTitle =
      page?.journalData?.headerCategory ||
      book.title ||
      (hasSections ? "Daily Action & Retrospective" : "Daily Coding Log");

    const reflectionText =
      page?.journalData?.reflectionPrompt ||
      page?.storyText ||
      (isRightPage
        ? "What went well today, and what are you looking forward to tomorrow?"
        : "What small action or focus can you cultivate today toward your goal?");

    const linesCount = isEmptyLined
      ? page?.journalData?.ruledLinesCount || (lineRuleSpacing === "wide" ? 15 : 19)
      : hasQuote
      ? 14
      : 19;

    // Repeating perimeter text string helper
    const repeatBorder = (txt: string, count: number) => Array(count).fill(txt).join("  —  ");

    return (
      <div
        className={`flex-1 p-4 sm:p-6 lg:p-7 flex flex-col justify-between relative bg-[#fffdfa] ${
          isRightPage
            ? mobilePageTab === "story"
              ? "hidden sm:flex"
              : "flex"
            : mobilePageTab === "art"
            ? "hidden sm:flex"
            : "flex border-b sm:border-b-0 sm:border-r border-slate-200"
        }`}
      >
        {/* Spine shadow */}
        <div
          className={`hidden sm:block absolute top-0 bottom-0 ${
            isRightPage ? "left-0" : "right-0"
          } w-5 spine-gradient pointer-events-none`}
        />

        {/* Outer Perimeter Vertical Borders (Left & Right margins) */}
        {borderText && (
          <>
            <div
              className={`hidden sm:flex absolute left-1 top-8 bottom-8 items-center justify-center pointer-events-none select-none [writing-mode:vertical-rl] rotate-180 text-[8px] sm:text-[8.5px] uppercase font-bold text-slate-500/70 overflow-hidden whitespace-nowrap max-w-[14px] ${
                isRobotic ? "font-mono tracking-widest" : "tracking-wider"
              }`}
            >
              {repeatBorder(borderText, 4)}
            </div>
            <div
              className={`hidden sm:flex absolute right-1 top-8 bottom-8 items-center justify-center pointer-events-none select-none [writing-mode:vertical-rl] text-[8px] sm:text-[8.5px] uppercase font-bold text-slate-500/70 overflow-hidden whitespace-nowrap max-w-[14px] ${
                isRobotic ? "font-mono tracking-widest" : "tracking-wider"
              }`}
            >
              {repeatBorder(borderText, 4)}
            </div>
          </>
        )}

        <div className="flex-1 flex flex-col justify-between space-y-2 z-10 px-1 sm:px-2">
          {/* Top Perimeter Text Border Banner (if present) */}
          {borderText && (
            <div className="flex items-center justify-between border-b border-slate-300 pb-1 -mt-1 overflow-hidden select-none">
              {cornerDecorations === "tech_brackets" ? (
                <span className="font-mono text-[9px] font-black text-slate-800 bg-slate-100 border border-slate-400 px-1 py-0.2 rounded shrink-0">
                  &lt;code_day_{pNum}&gt;
                </span>
              ) : (
                <span className="text-[9px] text-slate-400 font-mono shrink-0">{"//"}</span>
              )}
              <div
                className={`flex-1 text-center truncate px-2 text-[8.5px] uppercase font-bold text-slate-600/80 ${
                  isRobotic ? "font-mono tracking-widest" : "tracking-wider"
                }`}
              >
                {repeatBorder(borderText, 5)}
              </div>
              {cornerDecorations === "tech_brackets" ? (
                <span className="font-mono text-[9px] font-black text-slate-800 bg-slate-100 border border-slate-400 px-1 py-0.2 rounded shrink-0">
                  &lt;/code_day_{pNum}&gt;
                </span>
              ) : (
                <span className="text-[9px] text-slate-400 font-mono shrink-0">{"//"}</span>
              )}
            </div>
          )}

          {/* Header Row: Day & Date Placeholder */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div className="flex items-center gap-2">
              <span
                className={`text-[11px] font-extrabold uppercase px-2 py-0.5 rounded-md tracking-wider ${
                  isBlackAndWhite
                    ? "bg-slate-900 text-white font-mono"
                    : "bg-amber-100 text-amber-900"
                }`}
              >
                Day {pNum}
              </span>
              <span
                className={`text-xs font-semibold text-slate-800 truncate max-w-[220px] ${
                  isRobotic ? "font-mono font-bold" : ""
                }`}
              >
                {headerTitle}
              </span>
            </div>
            <div
              className={`text-xs text-slate-500 font-mono ${
                isBlackAndWhite ? "font-bold" : ""
              }`}
            >
              {page?.journalData?.datePlaceholder || "Date: _______________"}
            </div>
          </div>

          {/* Daily Mood Tracker (Rendered only if requested) */}
          {showMood && !isEmptyLined && (
            <div className="flex items-center justify-between bg-amber-50/60 border border-amber-200/50 rounded-xl px-3 py-1 text-xs">
              <span className="font-bold text-amber-950 text-[11px] tracking-wide">
                Today&apos;s Mood:
              </span>
              <div className="flex items-center gap-2 text-sm sm:text-base">
                <span title="Radiant" className="cursor-pointer hover:scale-125 transition-transform">☀️</span>
                <span title="Joyful" className="cursor-pointer hover:scale-125 transition-transform">😊</span>
                <span title="Peaceful" className="cursor-pointer hover:scale-125 transition-transform">🌿</span>
                <span title="Pensive" className="cursor-pointer hover:scale-125 transition-transform">💭</span>
                <span title="Creative" className="cursor-pointer hover:scale-125 transition-transform">🎨</span>
              </div>
            </div>
          )}

          {/* Daily Inspiration Quote Card (ONLY if present) */}
          {hasQuote && !isEmptyLined && (
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50/30 border border-amber-200/70 shadow-xs relative">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block mb-0.5">
                Daily Inspiration
              </span>
              <p className="text-xs sm:text-sm font-serif italic text-slate-800 leading-snug">
                &ldquo;{page?.journalData?.quote}&rdquo;
              </p>
            </div>
          )}

          {/* Main Writing Area (Empty Lined, Sections, or Single Prompt) */}
          <div className="flex-1 flex flex-col justify-between relative min-h-[260px]">
            {/* 1. EMPTY LINED LAYOUT (Pure clean ruled lines across the whole page) */}
            {isEmptyLined ? (
              <div className="flex-1 flex flex-col justify-between py-1 min-h-[260px]">
                {Array.from({ length: linesCount }).map((_, i) => (
                  <div
                    key={i}
                    className="w-full border-b border-slate-300/80 h-5 sm:h-5.5 flex items-end"
                  >
                    {i === 0 && (
                      <span className="text-[10px] text-slate-400 font-mono italic select-none pl-1">
                        {isRobotic
                          ? "// log goals, milestones, snippets & progress here..."
                          : "write your thoughts, plans and progress here..."}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : hasSections ? (
              /* 2. DYNAMIC MULTI-SECTION LAYOUT (e.g. Upper "I will do" / Lower "What I did") */
              <div className="flex-1 flex flex-col justify-between py-1 space-y-3 min-h-[260px]">
                {sections!.map((section, sIdx) => {
                  const secLines = section.linesCount || 7;
                  const isFirst = sIdx === 0;
                  return (
                    <div key={sIdx} className="flex-1 flex flex-col justify-between">
                      {/* Section Header */}
                      <div className="flex items-center justify-between pb-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-md tracking-wider ${
                              isBlackAndWhite
                                ? "bg-slate-100 text-slate-900 border border-slate-800 font-mono"
                                : isFirst
                                ? "bg-sky-100 text-sky-950 border border-sky-300"
                                : "bg-emerald-100 text-emerald-950 border border-emerald-300"
                            }`}
                          >
                            {section.title}
                          </span>
                          {section.prompt && (
                            <span className="text-[11px] font-medium text-slate-600 truncate max-w-[220px]">
                              {section.prompt}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Ruled lines for this section */}
                      <div className="flex-1 flex flex-col justify-between">
                        {Array.from({ length: secLines }).map((_, lIdx) => (
                          <div
                            key={lIdx}
                            className="w-full border-b border-slate-300/80 h-5 sm:h-5.5 flex items-end"
                          >
                            {lIdx === 0 && (
                              <span className="text-[10px] text-slate-400 font-serif italic select-none pl-1">
                                {section.placeholder || `write your thoughts for ${section.title.toLowerCase()}...`}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* 3. CLASSIC SINGLE-PROMPT FULL SPREAD */
              <>
                <div className="pt-0.5">
                  <p className="text-xs sm:text-sm font-bold text-slate-800 leading-snug">
                    {reflectionText}
                  </p>
                </div>

                {/* Full College-Ruled Writing Lines (18-19 lines) */}
                <div className="flex-1 flex flex-col justify-between py-1 min-h-[220px]">
                  {Array.from({ length: linesCount }).map((_, i) => (
                    <div
                      key={i}
                      className="w-full border-b border-slate-300/80 h-5 sm:h-6 flex items-end"
                    >
                      {i === 0 && (
                        <span className="text-[10px] text-slate-400 font-serif italic select-none pl-1">
                          write your thoughts here...
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Daily Themed Spot Illustration (Bottom-Right Outer Corner) */}
            {page?.imageUrl && (
              <div className="absolute right-1 bottom-1 z-20 flex flex-col items-center select-none pointer-events-auto">
                <div className="group relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl border border-slate-300/80 bg-white/95 shadow-xs p-1.5 flex items-center justify-center transition-all hover:scale-105 hover:shadow-md">
                  <img
                    src={page.imageUrl}
                    alt={page.imagePrompt || `Day ${pNum} illustration`}
                    className="w-full h-full object-contain filter contrast-125"
                  />
                  {/* Quick button to tweak art */}
                  {!isRightPage && (
                    <button
                      type="button"
                      onClick={() => setArtModalOpen(true)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-2 -right-2 px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-slate-900 text-sky-300 border border-sky-400/50 shadow flex items-center gap-1 cursor-pointer"
                      title="Tweak this day's illustration (2 🪙)"
                    >
                      <Palette className="w-2.5 h-2.5 text-sky-400" />
                      <span>Tweak</span>
                    </button>
                  )}
                </div>
                <span className="text-[8.5px] font-mono text-slate-500 font-semibold mt-0.5 tracking-tight">
                  Day {pNum} Motif
                </span>
              </div>
            )}
          </div>

          {/* Bottom Perimeter Text Border Banner (if present) */}
          {borderText && (
            <div className="flex items-center justify-between border-t border-slate-300 pt-1 -mb-1 overflow-hidden select-none">
              {cornerDecorations === "tech_brackets" ? (
                <span className="font-mono text-[9px] font-black text-slate-800 bg-slate-100 border border-slate-400 px-1 py-0.2 rounded shrink-0">
                  [0x{pNum.toString(16).padStart(2, "0")}]
                </span>
              ) : (
                <span className="text-[9px] text-slate-400 font-mono shrink-0">{"//"}</span>
              )}
              <div
                className={`flex-1 text-center truncate px-2 text-[8.5px] uppercase font-bold text-slate-600/80 ${
                  isRobotic ? "font-mono tracking-widest" : "tracking-wider"
                }`}
              >
                {repeatBorder(borderText, 5)}
              </div>
              {cornerDecorations === "tech_brackets" ? (
                <span className="font-mono text-[9px] font-black text-slate-800 bg-slate-100 border border-slate-400 px-1 py-0.2 rounded shrink-0">
                  _EOF
                </span>
              ) : (
                <span className="text-[9px] text-slate-400 font-mono shrink-0">{"//"}</span>
              )}
            </div>
          )}

          {/* Page Footer */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-200/70 pt-2">
            <span className="truncate max-w-[160px] font-medium">{book.title}</span>
            <span className="font-mono font-bold">Page {pNum}</span>
          </div>
        </div>
      </div>
    );
  };

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
              {is6x9
                ? '6" × 9" Digest Journal'
                : is85x11
                ? '8.5" × 11" Letter'
                : '8.5" × 8.5" Square'}
            </span>
            {isConfirmed && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 flex items-center gap-1">
                <FileCheck className="w-3 h-3" /> Confirmed Proof
              </span>
            )}
          </div>
          <p className="text-xs text-[#a0b4c4] mt-0.5">
            {book.authorName && book.authorName.trim() !== "" && book.authorName !== "Lawrence & Leo" ? (
              <>By <strong className="text-white">{book.authorName}</strong> &bull; </>
            ) : (
              <>Personal Keepsake Edition &bull; </>
            )}
            {book.pageCount} Pages &bull; Archival Saddle-Stitch POD
          </p>
        </div>

        {/* Quick actions top right */}
        <div className="flex items-center gap-2">
          <button
            onClick={onDownloadPdf}
            disabled={isDownloading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold glacier-glass-subtle hover:bg-slate-800 text-sky-300 border border-sky-400/30 rounded-xl shadow-sm transition-all active:scale-95 cursor-pointer"
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
          <div
            className={`w-full ${coverAspectClass} bg-[#0f1524] rounded-r-2xl border border-sky-400/40 book-shadow flex flex-col justify-between p-6 sm:p-8 relative overflow-hidden text-white transition-all duration-300`}
          >
            <div className="absolute top-0 bottom-0 left-0 w-3 bg-gradient-to-r from-sky-400/40 to-sky-400/10" />

            <div className="text-center pt-2 sm:pt-4">
              <span className="text-[10px] sm:text-xs uppercase tracking-widest font-extrabold text-sky-300">
                {isJournal ? "Personalized Reflection Journal" : "Personalized Story & Coloring"}
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1 mb-1 font-serif">
                {book.title}
              </h1>
              {book.subtitle && <p className="text-xs font-medium text-[#a0b4c4]">{book.subtitle}</p>}
            </div>

            {/* Cover Graphic Frame */}
            <div className="w-full flex-1 my-3 sm:my-4 border-2 border-dashed border-sky-400/30 rounded-xl flex flex-col items-center justify-center p-4 bg-slate-900/60">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-sky-400/60 flex items-center justify-center mb-2 bg-slate-950">
                <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-sky-400" />
              </div>
              <p className="text-xs sm:text-sm font-bold text-white">Featuring {book.character.name}</p>
              <p className="text-[11px] text-[#a0b4c4] text-center max-w-[220px] mt-0.5">
                {book.character.type} &bull; {book.character.traits.join(", ")}
              </p>
            </div>

            <div className="flex items-center justify-between border-t border-white/10 pt-3 text-xs text-[#a0b4c4]">
              <span>
                {book.authorName && book.authorName.trim() !== "" && book.authorName !== "Lawrence & Leo" ? (
                  <>Author: <strong className="text-white">{book.authorName}</strong></>
                ) : (
                  <strong className="text-white">Personal Keepsake Edition</strong>
                )}
              </span>
              <span className="text-[10px] text-sky-300 font-mono">
                {is6x9 ? '6" × 9" Lulu POD' : is85x11 ? '8.5" × 11" Lulu POD' : '8.5" × 8.5" Lulu POD'}
              </span>
            </div>
          </div>
        ) : (
          /* Interior 2-Page Spread */
          <div className={`w-full h-full ${spreadAspectClass} flex flex-col sm:flex-row bg-white rounded-2xl border border-slate-300 book-shadow overflow-hidden text-slate-900 transition-all duration-300`}>
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
                {isJournal ? `Day ${activePage?.pageNumber || 1}` : `Reading Text`}
              </button>
              <button
                type="button"
                onClick={() => setMobilePageTab("art")}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1 ${
                  mobilePageTab === "art" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"
                }`}
              >
                <PenTool className="w-3.5 h-3.5 text-sky-600" />
                {isJournal ? `Day ${(activePage?.pageNumber || 1) + 1}` : `Coloring Art`}
              </button>
            </div>

            {isJournal ? (
              /* Authentic Consistent 2-Page Journal Spread (Both sides look balanced and identical!) */
              <>
                {renderJournalPage(activePage, activePage?.pageNumber || 1, false)}
                {renderJournalPage(
                  book.pages[currentPageIndex] || (activePage ? {
                    ...activePage,
                    pageNumber: (activePage.pageNumber || 1) + 1,
                    title: `Day ${(activePage.pageNumber || 1) + 1}`,
                    imageUrl: activePage.imageUrl
                      ? activePage.imageUrl.replace(/seed=\d+/, `seed=${100000 + ((activePage.pageNumber || 1) + 1) * 1337}`)
                      : undefined,
                    journalData: activePage.journalData ? {
                      ...activePage.journalData,
                      dayNumber: (activePage.journalData.dayNumber || 1) + 1,
                    } : undefined,
                  } : null),
                  (activePage?.pageNumber || 1) + 1,
                  true
                )}
              </>
            ) : (
              /* Standard Story & Coloring Spread */
              <>
                {/* Left Page (Story & Reading Text) */}
                <div
                  className={`flex-1 p-5 sm:p-7 lg:p-8 flex flex-col justify-between border-b sm:border-b-0 sm:border-r border-slate-200 relative bg-[#fffdfa] ${
                    mobilePageTab === "art" ? "hidden sm:flex" : "flex"
                  }`}
                >
                  <div className="hidden sm:block absolute top-0 bottom-0 right-0 w-5 spine-gradient pointer-events-none" />
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Chapter {activePage?.pageNumber}
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

                    <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-200/60 pt-3 mt-4">
                      <span className="truncate max-w-[150px]">{book.title}</span>
                      <span>Page {activePage?.pageNumber}</span>
                    </div>
                  </div>
                </div>

                {/* Right Page (Coloring Line-Art Illustration) */}
                <div
                  className={`flex-1 p-5 sm:p-8 lg:p-10 flex flex-col justify-between relative bg-white ${
                    mobilePageTab === "story" ? "hidden sm:flex" : "flex"
                  }`}
                >
                  <div className="hidden sm:block absolute top-0 bottom-0 left-0 w-5 spine-gradient pointer-events-none" />

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
                ) : book.title?.toLowerCase().includes("doctor") || book.title?.toLowerCase().includes("career") || activePage?.title?.toLowerCase().includes("doctor") ? (
                  /* Doctor & Career Adventure Vector Line Art */
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" className="w-full h-full max-h-[340px]">
                    <rect width="400" height="400" fill="#FFFFFF" />
                    {/* Medical Cross Badge */}
                    <rect x="175" y="30" width="50" height="50" rx="8" fill="none" stroke="#111111" strokeWidth="4" />
                    <line x1="200" y1="40" x2="200" y2="70" stroke="#111111" strokeWidth="5" />
                    <line x1="185" y1="55" x2="215" y2="55" stroke="#111111" strokeWidth="5" />
                    {/* Stethoscope */}
                    <path d="M 140 100 C 140 210, 260 210, 260 100" fill="none" stroke="#111111" strokeWidth="5" />
                    <circle cx="140" cy="95" r="8" fill="#111111" />
                    <circle cx="260" cy="95" r="8" fill="#111111" />
                    <path d="M 200 182 L 200 240 Q 200 280 235 280" fill="none" stroke="#111111" strokeWidth="4.5" />
                    <circle cx="245" cy="280" r="22" fill="#FFFFFF" stroke="#111111" strokeWidth="5" />
                    <circle cx="245" cy="280" r="10" fill="none" stroke="#111111" strokeWidth="3" />
                    {/* Doctor Clipboard / Patient Chart */}
                    <rect x="90" y="240" width="80" height="110" rx="6" fill="#FFFFFF" stroke="#111111" strokeWidth="4" />
                    <rect x="110" y="230" width="40" height="15" rx="3" fill="#FFFFFF" stroke="#111111" strokeWidth="3" />
                    <line x1="105" y1="265" x2="155" y2="265" stroke="#111111" strokeWidth="3" />
                    <line x1="105" y1="285" x2="155" y2="285" stroke="#111111" strokeWidth="3" />
                    <line x1="105" y1="305" x2="140" y2="305" stroke="#111111" strokeWidth="3" />
                    {/* Label */}
                    <text x="200" y="375" textAnchor="middle" fontSize="18" fontWeight="bold" fill="#111111" fontFamily="sans-serif">
                      Doctor&apos;s Checkup &bull; Color Me In!
                    </text>
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

              <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-200/60 pt-3 mt-4">
                <span>Activity & Coloring Sheet</span>
                <span>Page {activePage?.pageNumber} Illustration</span>
              </div>
            </div>
          </>
        )}
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
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 text-xs sm:text-sm font-bold rounded-xl glacier-glass-subtle hover:bg-slate-800 text-sky-200 border border-sky-400/30 shadow-md transition-all active:scale-95 cursor-pointer"
        >
          <Info className="w-4 h-4 text-sky-400" />
          <span>Book Details</span>
        </button>

        {/* Center-Left: Print First Page (Free Proof) */}
        {isConfirmed && onPrintFirstPage && (
          <button
            onClick={onPrintFirstPage}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl bg-slate-900/80 hover:bg-slate-800 text-emerald-300 border border-emerald-500/40 shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-emerald-400" />
            <span>Print First Page (Free Proof)</span>
          </button>
        )}

        {/* Center-Right: Download Full PDF */}
        {isConfirmed && onDownloadPdf && (
          <button
            onClick={onDownloadPdf}
            disabled={isDownloading}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all active:scale-95 cursor-pointer ${
              isBookUnlocked
                ? "bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-400/40"
                : "bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-400/40"
            }`}
          >
            {isDownloading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Preparing PDF...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-current" />
                <span>{isBookUnlocked ? "Download Full PDF" : "Unlock & Download Full PDF"}</span>
              </>
            )}
          </button>
        )}

        {/* Right: Order Physical Print */}
        <button
          onClick={onOrderPhysical}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 text-xs sm:text-sm font-extrabold glacier-btn text-[#001f2e] rounded-xl shadow-xl transition-all active:scale-95 cursor-pointer"
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
