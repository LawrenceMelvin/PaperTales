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
import {
  Sparkles,
  Wand2,
  RefreshCw,
  Sliders,
  Palette,
  BookHeart,
  Calculator,
  Atom,
  UploadCloud,
  X,
  Eye,
  Settings2,
  Image as ImageIcon,
} from "lucide-react";

type BookGenre = "coloring_book" | "memory_book" | "math_book" | "science_book";

interface GenreConfig {
  id: BookGenre;
  label: string;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  defaultPrompt: string;
  defaultCharacter: CharacterAnchor;
  presets: Array<{ label: string; prompt: string; character: CharacterAnchor }>;
}

const GENRE_LANES: GenreConfig[] = [
  {
    id: "coloring_book",
    label: "Coloring Book",
    badge: "300 DPI Vector Line-Art",
    icon: Palette,
    description: "Whimsical bedtime adventures with bold vector outlines ready for crayons",
    defaultPrompt: "Barnaby explores the Enchanted Forest and discovers magic crystal flowers",
    defaultCharacter: {
      name: "Barnaby",
      type: "Golden Retriever Puppy",
      traits: ["Wearing a cozy red scarf", "Floppy ears", "Curious tail wag"],
    },
    presets: [
      {
        label: "🚀 Space Puppy",
        prompt: "Barnaby the astronaut puppy visits Mars and builds a space castle",
        character: { name: "Barnaby", type: "Astronaut Puppy", traits: ["Space helmet", "Red scarf", "Jetpack"] },
      },
      {
        label: "🧁 Cupcake Dino",
        prompt: "Penny the baby dinosaur learns how to bake cupcakes with woodland birds",
        character: { name: "Penny", type: "Baby Brontosaurus", traits: ["Chef hat", "Pink apron", "Cheery smile"] },
      },
    ],
  },
  {
    id: "memory_book",
    label: "Family Keepsake",
    badge: "Milestones & Storybook Lane",
    icon: BookHeart,
    description: "Transform precious family moments, baby milestones & photos into keepsake chapters",
    defaultPrompt: "Our family's sunny beach road trip, building sandcastles, and stargazing by the campfire",
    defaultCharacter: {
      name: "Leo",
      type: "Curious Toddler",
      traits: ["Curly brown hair", "Blue sneakers", "Little star backpack"],
    },
    presets: [
      {
        label: "🏖️ Beach Summer",
        prompt: "Summer holiday memories at Sunny Cove, collecting sea shells and watching dolphins",
        character: { name: "Leo", type: "Beach Explorer", traits: ["Straw sunhat", "Seashell bucket", "Bright smile"] },
      },
      {
        label: "🎂 Birthday Milestones",
        prompt: "Celebrating Leo's big birthday party with Grandma's strawberry cake and backyard games",
        character: { name: "Leo", type: "Birthday Boy", traits: ["Glitter party hat", "Striped overalls", "Sparkling eyes"] },
      },
    ],
  },
  {
    id: "math_book",
    label: "Math & Logic Quest",
    badge: "Counting & Geometry Riddles",
    icon: Calculator,
    description: "Interactive counting puzzles, geometric shapes, and arithmetic word challenges",
    defaultPrompt: "Pixel the Fox unlocks Number Castle using counting keys, shape bridges, and logic stars",
    defaultCharacter: {
      name: "Pixel",
      type: "Clever Fox",
      traits: ["Round spectacles", "Explorer satchel", "Magic number chalk"],
    },
    presets: [
      {
        label: "🏰 Castle Keys",
        prompt: "Count the 3 golden keys, 5 geometric stones, and 8 starlight crystals to unlock the fortress",
        character: { name: "Pixel", type: "Math Wizard Fox", traits: ["Star-patterned cape", "Counting abacus", "Feather pen"] },
      },
      {
        label: "🎈 Balloon Bridge",
        prompt: "Solve addition riddles with 10 colorful balloons to reach Cloud Island",
        character: { name: "Pixel", type: "Sky Mathematician", traits: ["Aviator goggles", "Number notebook", "Compass"] },
      },
    ],
  },
  {
    id: "science_book",
    label: "Science Explorer",
    badge: "Space, Oceans & Dinosaurs",
    icon: Atom,
    description: "Astronomy, prehistoric fossils, deep ocean biology & kid-friendly STEM discoveries",
    defaultPrompt: "Professor Nova's cosmic voyage through Saturn's rings and deep bioluminescent ocean trenches",
    defaultCharacter: {
      name: "Professor Nova",
      type: "Young Explorer",
      traits: ["Lab goggles", "Starlight notebook", "Pocket magnifying lens"],
    },
    presets: [
      {
        label: "🪐 Saturn Voyage",
        prompt: "Explore the ice rings of Saturn and land on cratered moons",
        character: { name: "Professor Nova", type: "Cosmic Astronomer", traits: ["Apollo spacesuit", "Antenna headset", "Star map"] },
      },
      {
        label: "🦕 Dinosaur Dig",
        prompt: "Unearth Stegosaurus fossil bones in prehistoric sandstone quarries",
        character: { name: "Professor Nova", type: "Paleontologist", traits: ["Safari field hat", "Excavation brush", "Fossil field guide"] },
      },
    ],
  },
];

const INITIAL_BOOK: BookProject = {
  id: "book_initial",
  title: "Barnaby's Adventure in the Magic Forest",
  subtitle: "A Personalized AI Coloring Storybook",
  authorName: "Lawrence & Leo",
  genre: "coloring_book",
  targetAge: "4-8",
  character: GENRE_LANES[0].defaultCharacter,
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
  const [selectedGenre, setSelectedGenre] = useState<BookGenre>("coloring_book");
  const [book, setBook] = useState<BookProject>(INITIAL_BOOK);
  const [character, setCharacter] = useState<CharacterAnchor>(GENRE_LANES[0].defaultCharacter);
  const [prompt, setPrompt] = useState<string>(GENRE_LANES[0].defaultPrompt);
  const [authorName, setAuthorName] = useState<string>("Lawrence & Leo");
  const [targetAge, setTargetAge] = useState<string>("4-8");
  const [pageCount, setPageCount] = useState<number>(5);
  const [userTokens, setUserTokens] = useState<number>(12);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState<boolean>(false);

  // Reference photo / sketch upload
  const [referenceImageUrl, setReferenceImageUrl] = useState<string | null>(null);

  // Mobile segmented view switcher
  const [mobileStudioTab, setMobileStudioTab] = useState<"controls" | "preview">("controls");

  // Modals state
  const [tokenModalOpen, setTokenModalOpen] = useState<boolean>(false);
  const [orderModalOpen, setOrderModalOpen] = useState<boolean>(false);

  // Compute dynamic quote for ANY page count
  const quote = calculateBookQuote(pageCount);

  const activeGenreConfig = GENRE_LANES.find((g) => g.id === selectedGenre) || GENRE_LANES[0];

  useEffect(() => {
    setUserTokens(getClientTokenBalance());
    const handleUpdate = () => setUserTokens(getClientTokenBalance());
    window.addEventListener("tokens_updated", handleUpdate);
    return () => window.removeEventListener("tokens_updated", handleUpdate);
  }, []);

  const handleSelectGenre = (genreId: BookGenre) => {
    setSelectedGenre(genreId);
    const cfg = GENRE_LANES.find((g) => g.id === genreId) || GENRE_LANES[0];
    setPrompt(cfg.defaultPrompt);
    setCharacter(cfg.defaultCharacter);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setReferenceImageUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

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
          genre: selectedGenre,
          characterName: character.name,
          characterType: character.type,
          characterTraits: character.traits,
          referenceImageUrl: referenceImageUrl || undefined,
          pageCount,
        }),
      });

      const data = await res.json();
      if (data.success && data.book) {
        setBook(data.book);
        if (quote.tokensRequired > 0) {
          deductClientTokens(quote.tokensRequired);
        }
        // Auto switch to preview on mobile so user immediately sees results!
        setMobileStudioTab("preview");
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
    <div className="flex flex-col min-h-screen bg-[#0a0e1a] text-[#e0e8f0] relative selection:bg-sky-500/30 selection:text-sky-200">
      {/* Ambient Glacier Aurora Frost in Studio Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-10 left-1/4 w-[800px] h-[600px] bg-sky-400/10 rounded-full blur-[160px] opacity-60" />
        <div className="absolute bottom-10 right-10 w-[650px] h-[650px] bg-purple-500/10 rounded-full blur-[180px] opacity-40" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar onOpenTokenModal={() => setTokenModalOpen(true)} />

        {/* Full-width Workstation Canvas (max-w-[1920px] avoids empty side black voids on wide monitors) */}
        <main className="flex-1 w-full max-w-[1920px] mx-auto px-3 sm:px-6 lg:px-8 xl:px-12 py-4 sm:py-6">
          {/* Mobile View Switcher Pill Bar (Sticky on mobile < lg) */}
          <div className="lg:hidden flex items-center p-1 bg-slate-900/90 rounded-xl border border-sky-400/25 mb-4 backdrop-blur-md sticky top-16 z-30 shadow-lg">
            <button
              type="button"
              onClick={() => setMobileStudioTab("controls")}
              className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                mobileStudioTab === "controls"
                  ? "bg-sky-400 text-[#001f2e] shadow-md font-extrabold"
                  : "text-[#a0b4c4] hover:text-white"
              }`}
            >
              <Settings2 className="w-3.5 h-3.5" />
              Studio &amp; Prompts
            </button>
            <button
              type="button"
              onClick={() => setMobileStudioTab("preview")}
              className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                mobileStudioTab === "preview"
                  ? "bg-sky-400 text-[#001f2e] shadow-md font-extrabold"
                  : "text-[#a0b4c4] hover:text-white"
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              Live Book View ({book.pages.length} Pgs)
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 xl:gap-8 items-start">
            {/* Left Panel: Creator Prompt Controls */}
            <div
              className={`lg:col-span-5 xl:col-span-4 space-y-4 ${
                mobileStudioTab === "preview" ? "hidden lg:block" : "block"
              }`}
            >
              <div className="glacier-glass rounded-2xl border border-sky-400/25 p-4 sm:p-5 shadow-xl space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-sky-400/15 border border-sky-400/30 text-sky-300 flex items-center justify-center">
                      <Wand2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-white">AI Creator Studio</h3>
                      <p className="text-[11px] text-[#a0b4c4]">First 5 pages free &bull; Scale up to 60 pgs</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Active Copilot
                  </span>
                </div>

                {/* 4 Creative Genre Lanes Selector */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#a0b4c4] mb-2">
                    Creative Lane / Book Genre
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {GENRE_LANES.map((lane) => {
                      const IconComponent = lane.icon;
                      const isSelected = selectedGenre === lane.id;
                      return (
                        <button
                          key={lane.id}
                          type="button"
                          onClick={() => handleSelectGenre(lane.id)}
                          className={`p-2.5 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                            isSelected
                              ? "bg-sky-400/20 border-sky-400 text-white shadow-sm ring-1 ring-sky-400/30"
                              : "bg-slate-900/60 border-sky-400/15 hover:border-sky-400/40 text-[#a0b4c4] hover:text-white"
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <IconComponent className={`w-4 h-4 ${isSelected ? "text-sky-300" : "text-slate-400"}`} />
                            <span className="text-xs font-bold leading-tight truncate">{lane.label}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-medium line-clamp-1">
                            {lane.badge}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Reference Photo / Sketch Uploader */}
                <div className="glacier-glass-subtle p-3.5 rounded-xl border border-sky-400/20">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-sky-400" />
                      <label className="text-xs font-bold text-white">Reference Photo / Sketch (Optional)</label>
                    </div>
                    {referenceImageUrl && (
                      <button
                        type="button"
                        onClick={() => setReferenceImageUrl(null)}
                        className="text-[10px] text-red-400 hover:text-red-300 flex items-center gap-0.5"
                      >
                        <X className="w-3 h-3" /> Remove
                      </button>
                    )}
                  </div>

                  {referenceImageUrl ? (
                    <div className="flex items-center gap-3 p-2 bg-slate-950/70 rounded-lg border border-sky-400/30">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={referenceImageUrl}
                        alt="Reference anchor"
                        className="w-12 h-12 object-cover rounded-md border border-sky-400/40"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-sky-300 truncate">Visual Grounding Active</p>
                        <p className="text-[10px] text-[#a0b4c4] truncate">AI uses reference for consistent character &amp; art</p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="cursor-pointer flex flex-col items-center justify-center p-3 rounded-lg border border-dashed border-sky-400/30 hover:border-sky-400 bg-slate-900/40 hover:bg-sky-400/5 transition-all text-center">
                        <UploadCloud className="w-5 h-5 text-sky-400 mb-1" />
                        <span className="text-[11px] font-semibold text-sky-200">
                          Upload child photo, pet, or drawing
                        </span>
                        <span className="text-[9px] text-slate-500 mt-0.5">PNG, JPG, or WEBP up to 10MB</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                      {/* Quick Sample Reference Loaders */}
                      <div className="flex items-center gap-1.5 mt-2">
                        <span className="text-[9px] text-slate-500">Quick sample:</span>
                        <button
                          type="button"
                          onClick={() => setReferenceImageUrl("https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&auto=format&fit=crop&q=60")}
                          className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900 text-[#a0b4c4] hover:text-sky-300 border border-sky-400/20"
                        >
                          🐶 Pet Puppy
                        </button>
                        <button
                          type="button"
                          onClick={() => setReferenceImageUrl("https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&auto=format&fit=crop&q=60")}
                          className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900 text-[#a0b4c4] hover:text-sky-300 border border-sky-400/20"
                        >
                          👧 Child Portrait
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Story Prompt */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-[#a0b4c4]">
                      {activeGenreConfig.label} Narrative Prompt
                    </label>
                  </div>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={2}
                    className="w-full text-xs p-3 rounded-xl bg-slate-900/70 border border-sky-400/20 text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 font-medium"
                    placeholder={`e.g. ${activeGenreConfig.defaultPrompt}...`}
                  />

                  {/* Preset Prompt Pills */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {activeGenreConfig.presets.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setPrompt(preset.prompt);
                          setCharacter(preset.character);
                        }}
                        className="text-[10px] font-semibold bg-slate-900/60 hover:bg-sky-400/20 text-[#a0b4c4] hover:text-sky-300 border border-sky-400/20 px-2 py-0.5 rounded-full transition-all"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dynamic Page Count Selector with Slider & Presets */}
                <div className="glacier-glass-subtle p-3.5 rounded-xl border border-sky-400/20">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-sky-400" />
                      <label className="text-xs font-bold text-white">
                        Book Length: <span className="text-sky-300 text-sm font-black font-mono">{pageCount} Pages</span>
                      </label>
                    </div>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-sky-400/20 text-sky-300 border border-sky-400/30">
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
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400 slider-thumb mb-2.5"
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
                            ? "border-sky-400 bg-sky-500/20 text-sky-300 shadow-sm"
                            : "border-white/10 hover:border-sky-400/30 text-[#a0b4c4] bg-slate-900/40"
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
                    <label className="block text-[11px] font-semibold text-[#a0b4c4] mb-1">Author Name(s)</label>
                    <input
                      type="text"
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-lg bg-slate-900/70 border border-sky-400/20 text-white placeholder-slate-500 focus:outline-none focus:border-sky-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#a0b4c4] mb-1">Target Age</label>
                    <select
                      value={targetAge}
                      onChange={(e) => setTargetAge(e.target.value)}
                      className="w-full text-xs px-2.5 py-2 rounded-lg bg-slate-900/70 border border-sky-400/20 text-white focus:outline-none focus:border-sky-400"
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
                  className="w-full py-3.5 rounded-xl glacier-btn text-[#001f2e] font-extrabold text-xs shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
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
                        ? `Generate ${activeGenreConfig.label} (100% Free Gift)`
                        : `Generate ${quote.totalPages}-Page ${activeGenreConfig.label} (${quote.tokensRequired} Tokens / $${quote.priceUsd.toFixed(2)})`}
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Right Panel: Interactive Book Viewer & Actions */}
            <div
              className={`lg:col-span-7 xl:col-span-8 flex flex-col justify-start ${
                mobileStudioTab === "controls" ? "hidden lg:flex" : "flex"
              }`}
            >
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
    </div>
  );
}
