"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import BookViewer from "@/components/BookViewer";
import CharacterAnchorComponent from "@/components/CharacterAnchor";
import MascotQuoter from "@/components/MascotQuoter";
import TokenModal from "@/components/TokenModal";
import OrderSummaryModal from "@/components/OrderSummaryModal";
import { BookProject, BookPage, CharacterAnchor } from "@/types/book";
import { deductClientTokens, getClientTokenBalance } from "@/lib/token-store";
import { calculateBookQuote } from "@/lib/pricing-calculator";
import { Sparkles, Wand2, RefreshCw, Sliders } from "lucide-react";

const INITIAL_CHARACTER: CharacterAnchor = {
  name: "Barnaby",
  type: "Golden Retriever Puppy",
  traits: ["Wearing a cozy red scarf", "Floppy ears", "Curious tail wag"],
};

const DEFAULT_BOOK: BookProject = {
  id: "book_initial",
  title: "Barnaby's Adventure in the Magic Forest",
  subtitle: "A Personalized AI Coloring Storybook",
  authorName: "Lawrence & Leo",
  genre: "coloring_book",
  targetAge: "4-8",
  character: INITIAL_CHARACTER,
  pages: [
    {
      pageNumber: 1,
      title: "The Big Morning Discovery",
      storyText: "Barnaby the Golden Retriever Puppy woke up with excitement! Today was the day to explore the Enchanted Whispering Woods with his cozy red scarf.",
      imagePrompt: "Clean black-and-white vector coloring line art: Barnaby with his scarf packing a tiny explorer backpack.",
    },
    {
      pageNumber: 2,
      title: "Across the Greenwood Bridge",
      storyText: "With cheerful paws, Barnaby crossed a charming stone bridge over a babbling stream while two friendly frogs smiled from lily pads.",
      imagePrompt: "Clean black-and-white vector coloring line art: Barnaby crossing a rustic arched bridge over rippling water.",
    },
    {
      pageNumber: 3,
      title: "Professor Hoot's Compass",
      storyText: "High in a giant oak tree, Professor Hoot flapped his magnificent wings and gifted Barnaby an enchanted star compass.",
      imagePrompt: "Clean black-and-white vector coloring line art: A wise giant owl perching on a hollow tree holding a star compass.",
    },
    {
      pageNumber: 4,
      title: "The Secret Crystal Meadow",
      storyText: "The compass led to a sunny clearing of singing crystal flowers. Barnaby wagged his tail as colorful butterflies danced all around.",
      imagePrompt: "Clean black-and-white vector coloring line art: Barnaby sniffing sparkling giant blossom petals surrounded by fireflies.",
    },
    {
      pageNumber: 5,
      title: "Picnic with Forest Friends",
      storyText: "Gentle bunnies and hedgehogs joined for a sweet honey biscuit feast under a giant mushroom canopy.",
      imagePrompt: "Clean black-and-white vector coloring line art: Barnaby sharing treats on a checkered blanket with tiny rabbits.",
    },
  ],
  pageCount: 5,
  format: {
    trimSize: "8.5x8.5",
    binding: "saddle_stitch",
    interiorColor: "black_and_white",
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export default function StudioPage() {
  const [book, setBook] = useState<BookProject>(DEFAULT_BOOK);
  const [character, setCharacter] = useState<CharacterAnchor>(INITIAL_CHARACTER);
  const [prompt, setPrompt] = useState<string>("Barnaby explores the Enchanted Forest and discovers magic crystal flowers");
  const [authorName, setAuthorName] = useState<string>("Lawrence & Leo");
  const [targetAge, setTargetAge] = useState<string>("4-8");
  const [pageCount, setPageCount] = useState<number>(5);
  const [userTokens, setUserTokens] = useState<number>(12);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState<boolean>(false);

  // Modals state
  const [tokenModalOpen, setTokenModalOpen] = useState<boolean>(false);
  const [orderModalOpen, setOrderModalOpen] = useState<boolean>(false);

  // Compute dynamic quote for ANY page count
  const quote = calculateBookQuote(pageCount);

  useEffect(() => {
    setUserTokens(getClientTokenBalance());
    const handleUpdate = () => setUserTokens(getClientTokenBalance());
    window.addEventListener("tokens_updated", handleUpdate);
    return () => window.removeEventListener("tokens_updated", handleUpdate);
  }, []);

  const handleGenerateBook = async () => {
    if (quote.tokensRequired > 0) {
      const balance = getClientTokenBalance();
      if (balance < quote.tokensRequired) {
        setTokenModalOpen(true);
        return;
      }
    }

    setIsGenerating(true);
    try {
      const res = await fetch("/api/ai/story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          authorName,
          targetAge,
          genre: "coloring_book",
          characterName: character.name,
          characterType: character.type,
          characterTraits: character.traits,
          pageCount,
        }),
      });

      const data = await res.json();
      if (data.success && data.book) {
        setBook(data.book);
        if (quote.tokensRequired > 0) {
          deductClientTokens(quote.tokensRequired);
        }
      }
    } catch (err) {
      console.error("Book generation error:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPdf = async () => {
    setIsDownloadingPdf(true);
    try {
      const res = await fetch("/api/pdf/compile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(book),
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${book.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_print_ready.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (err) {
      console.error("PDF download failed:", err);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handlePageUpdate = (updatedPage: BookPage) => {
    setBook((prev) => ({
      ...prev,
      pages: prev.pages.map((p) => (p.pageNumber === updatedPage.pageNumber ? updatedPage : p)),
    }));
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/60">
      <Navbar onOpenTokenModal={() => setTokenModalOpen(true)} />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Panel: Creator Prompt Controls */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Wand2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Co-Creation Prompt Studio</h3>
                  <p className="text-[11px] text-slate-500">First 5 pages free &bull; Unlimited dynamic scaling &bull; 62% margin</p>
                </div>
              </div>

              {/* Story Prompt */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Book Idea / Adventure Prompt</label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={2}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  placeholder="e.g. A space-traveling puppy discovering star meadows..."
                />

                {/* Preset Prompt Pills */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPrompt("Barnaby the astronaut puppy visits Mars and builds a space castle");
                      setCharacter({ name: "Barnaby", type: "Astronaut Puppy", traits: ["Space helmet", "Red scarf", "Jetpack"] });
                    }}
                    className="text-[10px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full"
                  >
                    🚀 Space Puppy
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPrompt("Penny the baby dinosaur learns how to bake cupcakes with woodland birds");
                      setCharacter({ name: "Penny", type: "Baby Brontosaurus", traits: ["Chef hat", "Pink apron", "Cheery smile"] });
                    }}
                    className="text-[10px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full"
                  >
                    🧁 Cupcake Dino
                  </button>
                </div>
              </div>

              {/* Dynamic Page Count Selector with Slider & Presets (Unlimited Scaling) */}
              <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-blue-600" />
                    <label className="text-xs font-bold text-slate-800">
                      Book Length: <span className="text-blue-700 text-sm font-extrabold">{pageCount} Pages</span>
                    </label>
                  </div>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    5 Pages Free
                  </span>
                </div>

                {/* Range Slider for arbitrary selection */}
                <input
                  type="range"
                  min={5}
                  max={60}
                  step={1}
                  value={pageCount}
                  onChange={(e) => setPageCount(parseInt(e.target.value, 10))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 mb-2.5"
                />

                {/* Quick Presets Pills */}
                <div className="flex flex-wrap gap-1">
                  {[5, 15, 25, 30, 46, 60].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setPageCount(count)}
                      className={`px-2 py-1 text-[11px] font-bold rounded-lg border transition-all ${
                        pageCount === count
                          ? "border-blue-600 bg-blue-600 text-white shadow-xs"
                          : "border-slate-200 hover:border-slate-300 text-slate-700 bg-white"
                      }`}
                    >
                      {count === 5 ? "5 (Free)" : `${count} Pgs`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Interactive Mascot Quoter Component */}
              <MascotQuoter
                quote={quote}
                userTokens={userTokens}
                onOpenTokenModal={() => setTokenModalOpen(true)}
              />

              {/* Author & Settings */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Author Name(s)</label>
                  <input
                    type="text"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Target Age</label>
                  <select
                    value={targetAge}
                    onChange={(e) => setTargetAge(e.target.value)}
                    className="w-full text-xs px-2.5 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="2-4">Ages 2-4 (Simple)</option>
                    <option value="4-8">Ages 4-8 (Balanced)</option>
                    <option value="8-12">Ages 8-12 (Detailed)</option>
                  </select>
                </div>
              </div>

              {/* Character Anchor Lock Component */}
              <CharacterAnchorComponent
                character={character}
                onChange={(updated) => setCharacter(updated)}
              />

              {/* Generate Book Action */}
              <button
                onClick={handleGenerateBook}
                disabled={isGenerating}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-700 via-sky-600 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white font-extrabold text-xs shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Synthesizing Story &amp; Line-Art...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    {quote.tokensRequired === 0
                      ? "Generate Book (100% Free Gift)"
                      : `Generate ${quote.totalPages}-Page Book (${quote.tokensRequired} Tokens / $${quote.priceUsd.toFixed(2)})`}
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Panel: Interactive Book Viewer & Actions */}
          <div className="lg:col-span-7 flex flex-col justify-start">
            <BookViewer
              book={book}
              onPageUpdate={handlePageUpdate}
              onDownloadPdf={handleDownloadPdf}
              onOrderPhysical={() => setOrderModalOpen(true)}
              isDownloading={isDownloadingPdf}
            />
          </div>
        </div>
      </main>

      {/* Modals */}
      <TokenModal
        isOpen={tokenModalOpen}
        onClose={() => setTokenModalOpen(false)}
      />

      <OrderSummaryModal
        isOpen={orderModalOpen}
        onClose={() => setOrderModalOpen(false)}
        book={book}
      />
    </div>
  );
}
