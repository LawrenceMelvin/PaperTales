"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import TokenModal from "@/components/TokenModal";
import OrderSummaryModal from "@/components/OrderSummaryModal";
import OrderTrackingGrid from "@/components/OrderTrackingGrid";
import {
  BOOKSTORE_CATALOG,
  BOOKSTORE_SHELVES,
  BookstoreBookItem,
  BookstoreShelfCategory,
  bookstoreItemToBookProject,
} from "@/lib/bookstore-catalog";
import { calculateBookQuote } from "@/lib/pricing-calculator";
import {
  BookOpen,
  Search,
  Sparkles,
  Download,
  Printer,
  Eye,
  Star,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  X,
  Package,
  Wand2,
  Layers,
  ShieldCheck,
} from "lucide-react";

export default function BookstorePage() {
  const [activeShelf, setActiveShelf] = useState<BookstoreShelfCategory>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [trimFilter, setTrimFilter] = useState<"all" | "8.5x8.5" | "8.5x11">("all");

  // Modals state
  const [tokenModalOpen, setTokenModalOpen] = useState<boolean>(false);
  const [orderTrackingOpen, setOrderTrackingOpen] = useState<boolean>(false);

  // Look Inside Preview Reader Modal
  const [previewBook, setPreviewBook] = useState<BookstoreBookItem | null>(null);
  const [previewSlideIdx, setPreviewSlideIdx] = useState<number>(0);

  // Checkout Modal State (Digital Copy vs Physical Hardcopy)
  const [checkoutBook, setCheckoutBook] = useState<BookstoreBookItem | null>(null);
  const [checkoutFulfillmentType, setCheckoutFulfillmentType] = useState<"digital_pdf" | "physical_print">(
    "digital_pdf"
  );

  // Track unlocked / purchased books from localStorage
  const [unlockedIds, setUnlockedIds] = useState<Record<string, boolean>>({});
  const [downloadingBookId, setDownloadingBookId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("papertales_orders");
      if (stored) {
        const orders = JSON.parse(stored);
        const map: Record<string, boolean> = {};
        for (const b of BOOKSTORE_CATALOG) {
          if (
            orders.some(
              (o: any) => o.bookId === `bookstore_${b.id}` || o.bookId === b.id || o.bookTitle === b.title
            )
          ) {
            map[b.id] = true;
          }
        }
        setUnlockedIds(map);
      }
    } catch {
      // ignore
    }
  }, []);

  const filteredBooks = useMemo(() => {
    return BOOKSTORE_CATALOG.filter((book) => {
      if (activeShelf !== "all" && book.category !== activeShelf) return false;
      if (trimFilter !== "all" && book.trimSize !== trimFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = book.title.toLowerCase().includes(q);
        const matchSub = book.subtitle.toLowerCase().includes(q);
        const matchDesc = book.description.toLowerCase().includes(q);
        const matchCat = book.categoryLabel.toLowerCase().includes(q);
        if (!matchTitle && !matchSub && !matchDesc && !matchCat) return false;
      }
      return true;
    });
  }, [activeShelf, trimFilter, searchQuery]);

  const handleOpenPreview = (book: BookstoreBookItem) => {
    setPreviewBook(book);
    setPreviewSlideIdx(0);
  };

  const handleOpenCheckout = (book: BookstoreBookItem, mode: "digital_pdf" | "physical_print") => {
    setCheckoutBook(book);
    setCheckoutFulfillmentType(mode);
  };

  const handleDirectDownloadPdf = async (book: BookstoreBookItem) => {
    setDownloadingBookId(book.id);
    try {
      const a = document.createElement("a");
      a.href = `/api/bookstore/asset?id=${encodeURIComponent(book.id)}`;
      a.download = `${book.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_print_ready.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } finally {
      setTimeout(() => setDownloadingBookId(null), 1200);
    }
  };

  const previewSlides = useMemo(() => {
    if (!previewBook) return [];
    return [
      { label: "Front Cover", url: previewBook.coverImage },
      ...previewBook.samplePages.map((url, idx) => ({
        label: `Interior Sample Page ${idx + 1}`,
        url,
      })),
    ];
  }, [previewBook]);

  return (
    <div className="flex flex-col min-h-screen bg-[#FFFDF9] text-[#1E2530] relative selection:bg-amber-200 selection:text-amber-900">
      {/* Sunlit Warm Atelier Ambient Glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-12 left-1/4 w-[800px] h-[550px] bg-amber-400/10 rounded-full blur-[160px] opacity-70" />
        <div className="absolute bottom-10 right-10 w-[650px] h-[650px] bg-orange-300/10 rounded-full blur-[180px] opacity-60" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar
          onOpenTokenModal={() => setTokenModalOpen(true)}
          onOpenOrderTracking={() => setOrderTrackingOpen(true)}
        />

        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* =====================================================================
              HERO BANNER: BOOKSTORE & VAULT
              ===================================================================== */}
          <section className="bg-[#FAF6EE] rounded-3xl border border-[#E8DFD3] p-6 sm:p-8 shadow-sm relative overflow-hidden">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2.5 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>PaperTales Curated Bookstore &amp; KDP Vault &bull; 18 Ready-to-Own Editions</span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-serif font-black text-[#1E2530] tracking-tight">
                  Bookstore &amp; Vault
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Browse our complete collection of studio-crafted coloring books, mystery quests, manga sketchbooks,
                  brain-training puzzles, and illustrated storybooks. Every edition is available as an{" "}
                  <strong className="text-amber-800">Instant 300 DPI Digital PDF</strong> (first 5 pages free!) or a{" "}
                  <strong className="text-purple-800">Physical Softcover Book</strong> printed &amp; shipped via Lulu POD.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setOrderTrackingOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-white hover:bg-amber-50 border border-[#E8DFD3] text-[#1E2530] text-xs font-bold flex items-center gap-2 transition-all active:scale-95 cursor-pointer shadow-xs"
                >
                  <Package className="w-4 h-4 text-amber-600" />
                  <span>My Orders (AG Grid)</span>
                </button>

                <Link
                  href="/studio"
                  className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 shadow-sm active:scale-95 transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Create Custom Book in AI Studio</span>
                </Link>
              </div>
            </div>

            {/* Search & Format Filter Bar */}
            <div className="mt-6 pt-5 border-t border-[#E8DFD3] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              {/* Search Box */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-amber-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search 18 books by title, cozy, detective, anime, sudoku, kids..."
                  className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-white border border-[#E8DFD3] text-xs sm:text-sm text-[#1E2530] placeholder-slate-400 focus:outline-none focus:border-amber-500"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Trim Size Filter Pills */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mr-1">
                  Trim Format:
                </span>
                {[
                  { id: "all", label: "All Formats" },
                  { id: "8.5x8.5", label: "8.5\" × 8.5\" Square" },
                  { id: "8.5x11", label: "8.5\" × 11\" Letter" },
                ].map((fmt) => (
                  <button
                    key={fmt.id}
                    type="button"
                    onClick={() => setTrimFilter(fmt.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      trimFilter === fmt.id
                        ? "bg-amber-600 border-amber-600 text-white shadow-xs"
                        : "bg-white border-[#E8DFD3] text-slate-600 hover:text-[#1E2530] hover:border-amber-300"
                    }`}
                  >
                    {fmt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Shelf Selector */}
            <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {BOOKSTORE_SHELVES.map((shelf) => {
                const isSel = activeShelf === shelf.id;
                const count =
                  shelf.id === "all"
                    ? BOOKSTORE_CATALOG.length
                    : BOOKSTORE_CATALOG.filter((b) => b.category === shelf.id).length;
                return (
                  <button
                    key={shelf.id}
                    type="button"
                    onClick={() => setActiveShelf(shelf.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border flex items-center gap-2 shrink-0 transition-all cursor-pointer ${
                      isSel
                        ? "bg-amber-600 border-amber-600 text-white shadow-xs ring-1 ring-amber-500"
                        : "bg-white border-[#E8DFD3] text-slate-600 hover:text-[#1E2530] hover:border-amber-300"
                    }`}
                  >
                    <span>{shelf.emoji}</span>
                    <span>{shelf.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                        isSel ? "bg-amber-700 text-white" : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* =====================================================================
              BOOKSTORE 3D SHELF GRID
              ===================================================================== */}
          {filteredBooks.length === 0 ? (
            <div className="bg-[#FAF6EE] rounded-3xl border border-[#E8DFD3] p-12 text-center space-y-3">
              <BookOpen className="w-10 h-10 text-amber-600 mx-auto opacity-75" />
              <h3 className="text-lg font-bold text-[#1E2530]">No books matched your filter</h3>
              <p className="text-xs text-slate-500">
                Try clearing your search query or switching to &ldquo;All Editions&rdquo;.
              </p>
              <button
                type="button"
                onClick={() => {
                  setActiveShelf("all");
                  setTrimFilter("all");
                  setSearchQuery("");
                }}
                className="px-4 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 border border-amber-300 text-amber-900 text-xs font-bold cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBooks.map((book) => {
                const quote = calculateBookQuote(book.pageCount);
                const digitalPrice = quote.priceUsd > 0 ? quote.priceUsd : 0.99;
                const estLuluPrintCost = book.interiorColor === "standard_color" ? 6.25 : 4.5;
                const hardcopyTotal = Number((digitalPrice + estLuluPrintCost).toFixed(2));
                const isUnlocked = Boolean(unlockedIds[book.id]);

                return (
                  <article
                    key={book.id}
                    className="bg-[#FAF6EE] rounded-3xl border border-[#E8DFD3] hover:border-amber-400/80 transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-md group"
                  >
                    <div>
                      {/* Top 3D Book Showcase Stage */}
                      <div className="relative pt-7 pb-6 px-6 bg-gradient-to-b from-[#F5EFE6] via-[#FAF6EE] to-[#FFFDF9] border-b border-[#E8DFD3] flex items-center justify-center">
                        {/* Category & Bestseller Badges */}
                        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10">
                          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/90 text-amber-900 border border-[#E8DFD3] shadow-2xs backdrop-blur-md">
                            {book.categoryLabel}
                          </span>
                          {book.bestsellerBadge && (
                            <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs backdrop-blur-md">
                              ★ {book.bestsellerBadge}
                            </span>
                          )}
                        </div>

                        {/* 3D Book Spine & Cover Container */}
                        <div
                          onClick={() => handleOpenPreview(book)}
                          className="cursor-pointer relative mt-4 transition-transform duration-500 group-hover:-translate-y-1.5 group-hover:rotate-[-1.5deg]"
                        >
                          {/* Book Spine Left Edge */}
                          <div
                            className="absolute top-1 bottom-1 -left-2.5 w-3 rounded-l-md shadow-inner"
                            style={{ backgroundColor: book.spineColor }}
                          />
                          {/* Layered Paper Page Edges on Right */}
                          <div className="absolute top-1.5 bottom-1.5 -right-2 w-2.5 bg-gradient-to-r from-slate-200 via-white to-slate-300 rounded-r-sm border-y border-r border-slate-400/60 shadow-md" />

                          {/* Front Cover Image */}
                          <div
                            className={`relative overflow-hidden rounded-r-xl rounded-l-xs border border-white/20 shadow-[0_18px_35px_rgba(0,0,0,0.75)] bg-slate-900 ${
                              book.trimSize === "8.5x8.5" ? "w-48 h-48" : "w-44 h-56"
                            }`}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={book.coverImage}
                              alt={book.title}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                            {/* Spine Fold Crease Highlight */}
                            <div className="absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-black/50 via-white/15 to-transparent pointer-events-none" />

                            {/* Hover "Look Inside" Pill */}
                            <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center p-3">
                              <span className="px-3.5 py-2 rounded-xl bg-amber-600 text-white font-black text-xs flex items-center gap-1.5 shadow-lg">
                                <Eye className="w-3.5 h-3.5" />
                                <span>Look Inside ({book.samplePages.length} Pages)</span>
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Bottom Specs Strip */}
                        <div className="absolute bottom-2.5 right-3 flex items-center gap-1.5">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/90 text-slate-600 border border-[#E8DFD3]">
                            {book.pageCount} Pages &bull; {book.trimSize}&quot;
                          </span>
                        </div>
                      </div>

                      {/* Book Metadata & Description */}
                      <div className="p-5 space-y-3">
                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <span>By {book.author}</span>
                          <span className="flex items-center gap-1 text-amber-600 font-bold">
                            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                            {book.rating.toFixed(1)}
                            <span className="text-slate-400 font-normal">({book.reviewCount})</span>
                          </span>
                        </div>

                        <div>
                          <h2 className="text-base sm:text-lg font-serif font-black text-[#1E2530] leading-snug group-hover:text-amber-800 transition-colors">
                            {book.title}
                          </h2>
                          <p className="text-xs text-amber-800/80 font-medium line-clamp-1 mt-0.5">
                            {book.subtitle}
                          </p>
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                          {book.description}
                        </p>

                        {/* Dynamic Page-Count Pricing Box */}
                        <div className="p-3 rounded-2xl bg-white border border-[#E8DFD3] space-y-2">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-emerald-700 font-bold flex items-center gap-1">
                              🎁 First 5 Pages Free Included
                            </span>
                            <span className="text-slate-500">
                              {quote.paidPages} Paid Pgs &times; ${quote.pricePerPageUsd}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 pt-1">
                            {/* Option A: Digital PDF Price */}
                            <div className="p-2 rounded-xl bg-purple-50 border border-purple-200">
                              <div className="text-[10px] font-bold text-purple-900 uppercase">
                                ⚡ Digital Copy (PDF)
                              </div>
                              <div className="text-sm font-black text-[#1E2530] mt-0.5">
                                ${digitalPrice.toFixed(2)}{" "}
                                <span className="text-[10px] font-normal text-slate-400">instant</span>
                              </div>
                            </div>

                            {/* Option B: Physical Hardcopy Price */}
                            <div className="p-2 rounded-xl bg-amber-50 border border-amber-200">
                              <div className="text-[10px] font-bold text-amber-900 uppercase">
                                📦 Printed Book
                              </div>
                              <div className="text-sm font-black text-[#1E2530] mt-0.5">
                                ${hardcopyTotal.toFixed(2)}{" "}
                                <span className="text-[10px] font-normal text-slate-400">+ ship</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons Footer */}
                    <div className="px-5 pb-5 pt-1 space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        {isUnlocked ? (
                          <button
                            type="button"
                            onClick={() => handleDirectDownloadPdf(book)}
                            disabled={downloadingBookId === book.id}
                            className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>
                              {downloadingBookId === book.id ? "Downloading..." : "Download PDF"}
                            </span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleOpenCheckout(book, "digital_pdf")}
                            className="py-2.5 px-3 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-300 text-purple-900 font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5 text-purple-700" />
                            <span>Buy Digital (${digitalPrice.toFixed(2)})</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleOpenCheckout(book, "physical_print")}
                          className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Order Hardcopy</span>
                        </button>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <button
                          type="button"
                          onClick={() => handleOpenPreview(book)}
                          className="text-[11px] font-bold text-amber-800 hover:text-amber-900 flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Look Inside Pages</span>
                        </button>

                        <Link
                          href={`/studio?remix=${encodeURIComponent(book.id)}`}
                          className="text-[11px] font-bold text-purple-800 hover:text-purple-900 flex items-center gap-1"
                        >
                          <Wand2 className="w-3.5 h-3.5" />
                          <span>Personalize in AI Studio &rarr;</span>
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </section>
          )}
        </main>

        {/* =====================================================================
            "LOOK INSIDE" INTERACTIVE PAGE FLIPPER MODAL
            ===================================================================== */}
        {previewBook && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in">
            <div className="bg-[#FAF6EE] w-full max-w-4xl rounded-3xl border-2 border-[#E8DFD3] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
              {/* Header */}
              <div className="px-6 py-4 bg-white border-b border-[#E8DFD3] flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-200 text-amber-800 flex items-center justify-center shrink-0">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm sm:text-base font-serif font-black text-[#1E2530] truncate">
                      {previewBook.title} — Look Inside Preview
                    </h3>
                    <p className="text-[11px] text-slate-500 truncate">
                      {previewBook.pageCount} Total Pages &bull; {previewBook.trimSize}&quot; Format &bull;{" "}
                      {previewSlides[previewSlideIdx]?.label}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setPreviewBook(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 flex items-center justify-center border border-[#E8DFD3] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body: Left Interactive Page Flipper + Right Book Details & Purchase */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                {/* Left 7 Cols: Page Viewer */}
                <div className="lg:col-span-7 flex flex-col items-center space-y-4">
                  <div className="relative w-full flex items-center justify-center bg-[#F5EFE6] rounded-2xl border border-[#E8DFD3] p-4 min-h-[340px] sm:min-h-[400px]">
                    <button
                      type="button"
                      onClick={() =>
                        setPreviewSlideIdx((prev) => (prev - 1 + previewSlides.length) % previewSlides.length)
                      }
                      className="absolute left-3 z-10 w-9 h-9 rounded-full bg-white hover:bg-amber-600 text-[#1E2530] hover:text-white border border-[#E8DFD3] flex items-center justify-center shadow-lg transition-all cursor-pointer"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>

                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={previewSlides[previewSlideIdx]?.url}
                      alt={previewSlides[previewSlideIdx]?.label}
                      className="max-h-[360px] w-auto object-contain rounded-lg shadow-2xl border border-white/15 bg-white"
                    />

                    <button
                      type="button"
                      onClick={() => setPreviewSlideIdx((prev) => (prev + 1) % previewSlides.length)}
                      className="absolute right-3 z-10 w-9 h-9 rounded-full bg-white hover:bg-amber-600 text-[#1E2530] hover:text-white border border-[#E8DFD3] flex items-center justify-center shadow-lg transition-all cursor-pointer"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Thumbnail Strip */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {previewSlides.map((slide, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setPreviewSlideIdx(idx)}
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                          previewSlideIdx === idx
                            ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                            : "bg-white text-slate-600 border-[#E8DFD3] hover:border-amber-300"
                        }`}
                      >
                        {idx === 0 ? "Cover" : `Page ${idx}`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Right 5 Cols: Details & Checkout Actions */}
                <div className="lg:col-span-5 space-y-4">
                  <div>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                      {previewBook.categoryLabel} &bull; {previewBook.targetAge}
                    </span>
                    <h4 className="text-lg sm:text-xl font-serif font-black text-[#1E2530] mt-2">
                      {previewBook.title}
                    </h4>
                    <p className="text-xs text-amber-800 font-medium mt-1">{previewBook.subtitle}</p>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {previewBook.description}
                  </p>

                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900">
                      Edition Highlights:
                    </span>
                    {previewBook.highlights.map((h, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-slate-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 space-y-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        const b = previewBook;
                        setPreviewBook(null);
                        if (unlockedIds[b.id]) {
                          handleDirectDownloadPdf(b);
                        } else {
                          handleOpenCheckout(b, "digital_pdf");
                        }
                      }}
                      className="w-full py-3 px-4 rounded-2xl bg-purple-50 hover:bg-purple-100 border-2 border-purple-300 text-purple-900 font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <Download className="w-4 h-4 text-purple-700" />
                      <span>
                        {unlockedIds[previewBook.id]
                          ? "Download Full 300 DPI PDF Now"
                          : `Buy Instant Digital Copy ($${Math.max(
                              0.99,
                              calculateBookQuote(previewBook.pageCount).priceUsd
                            ).toFixed(2)})`}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const b = previewBook;
                        setPreviewBook(null);
                        handleOpenCheckout(b, "physical_print");
                      }}
                      className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Order Physical Hardcopy (Lulu POD)</span>
                    </button>

                    <Link
                      href={`/studio?remix=${encodeURIComponent(previewBook.id)}`}
                      className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-amber-50 border border-[#E8DFD3] text-amber-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Wand2 className="w-3.5 h-3.5" />
                      <span>Personalize This Book in AI Studio</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            CHECKOUT MODAL (DIGITAL PDF OR LULU HARDCOPY)
            ===================================================================== */}
        {checkoutBook && (
          <OrderSummaryModal
            isOpen={Boolean(checkoutBook)}
            onClose={() => setCheckoutBook(null)}
            book={bookstoreItemToBookProject(checkoutBook)}
            initialFulfillmentType={checkoutFulfillmentType}
            onOrderCompleted={() => {
              setUnlockedIds((prev) => ({ ...prev, [checkoutBook.id]: true }));
            }}
            onDownloadPdf={() => {
              const b = checkoutBook;
              setUnlockedIds((prev) => ({ ...prev, [b.id]: true }));
              handleDirectDownloadPdf(b);
            }}
          />
        )}

        <TokenModal isOpen={tokenModalOpen} onClose={() => setTokenModalOpen(false)} />

        <OrderTrackingGrid isOpen={orderTrackingOpen} onClose={() => setOrderTrackingOpen(false)} />
      </div>
    </div>
  );
}
