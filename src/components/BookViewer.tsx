"use client";

import React, { useState } from "react";
import { BookProject, BookPage } from "@/types/book";
import { ChevronLeft, ChevronRight, Download, Printer, Edit3, Check, Sparkles, BookOpen, PenTool } from "lucide-react";

interface BookViewerProps {
  book: BookProject;
  onPageUpdate: (updatedPage: BookPage) => void;
  onDownloadPdf: () => void;
  onOrderPhysical: () => void;
  isDownloading?: boolean;
}

export default function BookViewer({
  book,
  onPageUpdate,
  onDownloadPdf,
  onOrderPhysical,
  isDownloading,
}: BookViewerProps) {
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  const [editingStory, setEditingStory] = useState<boolean>(false);
  const [editText, setEditText] = useState<string>("");
  const [mobilePageTab, setMobilePageTab] = useState<"story" | "art">("story");

  const totalPages = book.pages.length;
  const isCover = currentPageIndex === 0;
  const activePage = !isCover ? book.pages[currentPageIndex - 1] : null;

  const handleNext = () => {
    if (currentPageIndex < totalPages) {
      setCurrentPageIndex((prev) => prev + 1);
      setEditingStory(false);
    }
  };

  const handlePrev = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex((prev) => prev - 1);
      setEditingStory(false);
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

  return (
    <div className="flex flex-col items-center w-full">
      {/* Top Controls Bar */}
      <div className="w-full flex flex-col md:flex-row items-start md:items-center justify-between mb-4 px-1 sm:px-2 gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-base sm:text-xl font-extrabold text-white tracking-tight">
              {book.title}
            </h2>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-sky-400/20 text-sky-300 font-bold border border-sky-400/30">
              8.5&quot; × 8.5&quot; Square
            </span>
          </div>
          <p className="text-xs text-[#a0b4c4] mt-0.5">
            By <strong className="text-white">{book.authorName}</strong> &bull; {book.pageCount} Pages &bull; Archival Saddle-Stitch POD
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={onDownloadPdf}
            disabled={isDownloading}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold glacier-glass-subtle hover:bg-slate-800 text-sky-300 border border-sky-400/30 rounded-xl shadow-sm transition-all active:scale-95"
          >
            <Download className="w-3.5 h-3.5 text-sky-400" />
            <span>{isDownloading ? "Compiling..." : "Download PDF"}</span>
          </button>
          <button
            onClick={onOrderPhysical}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold glacier-btn text-[#001f2e] rounded-xl shadow-md transition-all active:scale-95"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Order Physical Print</span>
          </button>
        </div>
      </div>

      {/* Book Spread Viewport */}
      <div className="relative w-full min-h-[460px] sm:min-h-[520px] lg:min-h-[580px] glacier-glass rounded-2xl p-3 sm:p-6 lg:p-8 flex items-center justify-center border border-sky-400/25 shadow-2xl">
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
                Reading Text (Page {activePage?.pageNumber})
              </button>
              <button
                type="button"
                onClick={() => setMobilePageTab("art")}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1 ${
                  mobilePageTab === "art" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"
                }`}
              >
                <PenTool className="w-3.5 h-3.5 text-sky-600" />
                Coloring Art
              </button>
            </div>

            {/* Left Page (Story & Reading Text) */}
            <div
              className={`flex-1 p-5 sm:p-8 lg:p-10 flex flex-col justify-between border-b sm:border-b-0 sm:border-r border-slate-200 relative bg-amber-50/25 ${
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
                    <p className="text-sm sm:text-base lg:text-lg font-serif text-slate-800 leading-relaxed sm:leading-loose">
                      {activePage?.storyText}
                    </p>
                    <button
                      onClick={() => startEdit(activePage?.storyText || "")}
                      className="sm:opacity-0 group-hover:opacity-100 transition-opacity mt-3 text-xs text-sky-700 font-semibold flex items-center gap-1 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-200 w-fit"
                    >
                      <Edit3 className="w-3 h-3 text-sky-600" /> Edit Story Text
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-200/60 pt-3 mt-4">
                <span className="truncate max-w-[150px]">{book.title}</span>
                <span>Page {activePage?.pageNumber}</span>
              </div>
            </div>

            {/* Right Page (Coloring Line-Art Illustration) */}
            <div
              className={`flex-1 p-5 sm:p-8 lg:p-10 flex flex-col justify-between relative bg-white ${
                mobilePageTab === "story" ? "hidden sm:flex" : "flex"
              }`}
            >
              <div className="hidden sm:block absolute top-0 bottom-0 left-0 w-5 spine-gradient pointer-events-none" />

              {/* Vector coloring line art container */}
              <div className="w-full flex-1 border-2 border-slate-900 rounded-xl p-4 flex flex-col items-center justify-center relative overflow-hidden bg-white min-h-[260px] sm:min-h-[320px]">
                {book.genre === "math_book" ? (
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

              <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-200/60 pt-3 mt-4">
                <span>Activity &amp; Coloring Sheet</span>
                <span>Page {activePage?.pageNumber} Illustration</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Pagination & Navigation Footbar */}
      <div className="flex items-center justify-between w-full max-w-md mt-4 px-2">
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
    </div>
  );
}
