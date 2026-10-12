"use client";

import React, { useState } from "react";
import { BookProject, BookPage } from "@/types/book";
import { ChevronLeft, ChevronRight, Download, Printer, Edit3, Check, Sparkles } from "lucide-react";

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
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto">
      {/* Top Controls Bar */}
      <div className="w-full flex items-center justify-between mb-4 px-2">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            {book.title}
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-200">
              8.5&quot; x 8.5&quot; Square
            </span>
          </h2>
          <p className="text-xs text-slate-500">By {book.authorName} &bull; {book.pageCount} Pages &bull; Saddle-Stitch Format</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onDownloadPdf}
            disabled={isDownloading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg shadow-sm transition-all"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            {isDownloading ? "Compiling..." : "Download PDF"}
          </button>
          <button
            onClick={onOrderPhysical}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white rounded-lg shadow-md transition-all shadow-blue-500/20"
          >
            <Printer className="w-3.5 h-3.5 text-sky-300" />
            Order Physical Print
          </button>
        </div>
      </div>

      {/* Book Spread Viewport */}
      <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] max-h-[520px] bg-slate-900/5 rounded-2xl p-4 sm:p-6 flex items-center justify-center border border-slate-200/80 shadow-inner">
        {isCover ? (
          /* Cover Spread */
          <div className="w-full max-w-md aspect-square bg-white rounded-r-xl border border-slate-300 book-shadow flex flex-col justify-between p-6 sm:p-8 relative overflow-hidden">
            <div className="absolute top-0 bottom-0 left-0 w-3 bg-gradient-to-r from-slate-400 to-slate-200" />
            
            <div className="text-center pt-4">
              <span className="text-[10px] uppercase tracking-widest font-extrabold text-blue-600">Personalized Story &amp; Coloring</span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1 mb-1 font-serif">{book.title}</h1>
              {book.subtitle && <p className="text-xs font-medium text-slate-500">{book.subtitle}</p>}
            </div>

            {/* Cover Graphic Frame */}
            <div className="w-full flex-1 my-4 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center p-4 bg-slate-50/50">
              <div className="w-20 h-20 rounded-full border-4 border-slate-800 flex items-center justify-center mb-2 bg-white">
                <Sparkles className="w-8 h-8 text-blue-600" />
              </div>
              <p className="text-xs font-bold text-slate-800">Featuring {book.character.name}</p>
              <p className="text-[11px] text-slate-500 text-center max-w-[200px] mt-0.5">
                {book.character.type} &bull; {book.character.traits.join(", ")}
              </p>
            </div>

            <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-xs text-slate-600">
              <span>Author: <strong>{book.authorName}</strong></span>
              <span className="text-[10px] text-slate-400">PaperTales AI Studio</span>
            </div>
          </div>
        ) : (
          /* Interior 2-Page Spread */
          <div className="w-full h-full max-w-3xl flex bg-white rounded-xl border border-slate-300 book-shadow overflow-hidden">
            {/* Left Page (Story & Reading Text) */}
            <div className="flex-1 p-6 sm:p-8 flex flex-col justify-between border-r border-slate-200 relative bg-amber-50/20">
              <div className="absolute top-0 bottom-0 right-0 w-4 spine-gradient pointer-events-none" />
              
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Chapter {activePage?.pageNumber}</span>
                <h3 className="text-xl font-bold font-serif text-slate-900 mt-0.5 mb-4">{activePage?.title}</h3>

                {editingStory ? (
                  <div className="flex flex-col gap-2">
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      rows={5}
                      className="w-full text-sm p-2.5 rounded-lg border border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-serif leading-relaxed"
                    />
                    <button
                      onClick={saveEdit}
                      className="self-end px-3 py-1 text-xs font-bold bg-blue-600 text-white rounded-md flex items-center gap-1 shadow-sm"
                    >
                      <Check className="w-3.5 h-3.5" /> Save Story
                    </button>
                  </div>
                ) : (
                  <div className="group relative">
                    <p className="text-sm sm:text-base font-serif text-slate-800 leading-relaxed">
                      {activePage?.storyText}
                    </p>
                    <button
                      onClick={() => startEdit(activePage?.storyText || "")}
                      className="opacity-0 group-hover:opacity-100 transition-opacity mt-2 text-xs text-blue-600 font-semibold flex items-center gap-1"
                    >
                      <Edit3 className="w-3 h-3" /> Edit Story Text
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100 pt-3">
                <span>{book.title}</span>
                <span>Page {activePage?.pageNumber}</span>
              </div>
            </div>

            {/* Right Page (Coloring Line-Art Illustration) */}
            <div className="flex-1 p-6 sm:p-8 flex flex-col justify-between relative bg-white">
              <div className="absolute top-0 bottom-0 left-0 w-4 spine-gradient pointer-events-none" />

              {/* Vector coloring line art container */}
              <div className="w-full flex-1 border-2 border-slate-900 rounded-lg p-3 flex flex-col items-center justify-center relative overflow-hidden bg-white">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 400 400"
                  className="w-full h-full max-h-[300px]"
                >
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

                <div className="absolute bottom-2 text-center text-[10px] font-semibold text-slate-400">
                  Crisp Vector Line-Art &bull; Print Ready (300 DPI)
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100 pt-3">
                <span>Coloring Activity Sheet</span>
                <span>Page {activePage?.pageNumber} Illustration</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Pagination & Navigation Footbar */}
      <div className="flex items-center gap-4 mt-4">
        <button
          onClick={handlePrev}
          disabled={currentPageIndex === 0}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 shadow-sm"
        >
          <ChevronLeft className="w-4 h-4" /> Previous
        </button>

        <span className="text-xs font-bold text-slate-600">
          {isCover ? "Book Cover" : `Spread ${currentPageIndex} of ${totalPages}`}
        </span>

        <button
          onClick={handleNext}
          disabled={currentPageIndex === totalPages}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 shadow-sm"
        >
          Next <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
