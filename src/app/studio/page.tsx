"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import BookViewer from "@/components/BookViewer";
import CharacterAnchorComponent from "@/components/CharacterAnchor";
import MascotQuoter from "@/components/MascotQuoter";
import TokenModal from "@/components/TokenModal";
import OrderSummaryModal from "@/components/OrderSummaryModal";
import BookDetailsModal from "@/components/BookDetailsModal";
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
  Bot,
  User,
  CheckCircle2,
  Printer,
  ChevronDown,
  Image as ImageIcon,
  BookOpen,
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
    defaultPrompt: "Barnaby visits the Sweet Dream Ice Cream Parlor and makes magical rainbow sundaes",
    defaultCharacter: {
      name: "Barnaby",
      type: "Golden Retriever Puppy",
      traits: ["Wearing a cozy red scarf", "Floppy ears", "Curious tail wag"],
    },
    presets: [
      {
        label: "🍦 Ice Cream Shop",
        prompt: "Barnaby visits the Sweet Dream Ice Cream Parlor and bakes giant waffle cones",
        character: { name: "Barnaby", type: "Golden Retriever Puppy", traits: ["Chef hat", "Red scarf", "Waffle spoon"] },
      },
      {
        label: "🚀 Space Puppy",
        prompt: "Barnaby the astronaut puppy visits Mars and builds a space castle",
        character: { name: "Barnaby", type: "Astronaut Puppy", traits: ["Space helmet", "Red scarf", "Jetpack"] },
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
  title: "Barnaby's Ice Cream Adventure",
  subtitle: "A Personalized AI Coloring Storybook",
  authorName: "Lawrence & Leo",
  genre: "coloring_book",
  targetAge: "4-8",
  character: GENRE_LANES[0].defaultCharacter,
  pages: [
    {
      pageNumber: 1,
      title: "The Ice Cream Discovery",
      storyText: "Barnaby the Golden Retriever Puppy skipped down Sunny Boulevard! Today he visited the famous Sweet Dream Ice Cream Parlor to craft the world's tallest waffle cone.",
      imagePrompt: "Clean black-and-white vector coloring line art: Delicious tall ice cream cone with crosshatch waffle texture, sweet cherry on top, and playful stars.",
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
  const [isPrintingPageOne, setIsPrintingPageOne] = useState<boolean>(false);

  // Confirmation state: Unlocks print proof button
  const [isConfirmed, setIsConfirmed] = useState<boolean>(true);

  // Reference photo / sketch upload
  const [referenceImageUrl, setReferenceImageUrl] = useState<string | null>(null);

  // Modals state
  const [tokenModalOpen, setTokenModalOpen] = useState<boolean>(false);
  const [orderModalOpen, setOrderModalOpen] = useState<boolean>(false);
  const [bookDetailsOpen, setBookDetailsOpen] = useState<boolean>(false);

  // Compute dynamic quote
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

  const handleConfirmAndGenerate = async () => {
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
        setIsConfirmed(true);

        // Smooth scroll to the Book Display below
        const displayEl = document.getElementById("book-display-section");
        if (displayEl) {
          displayEl.scrollIntoView({ behavior: "smooth" });
        }
      }
    } catch (err) {
      console.error("Book generation error:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrintFirstPage = async () => {
    setIsPrintingPageOne(true);
    try {
      // Create a 1-page single proof book project
      const pageOneProject: BookProject = {
        ...book,
        title: `${book.title} (Page 1 Proof)`,
        pages: [book.pages[0]],
        pageCount: 1,
      };

      const res = await fetch("/api/pdf/compile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pageOneProject),
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${book.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_page_1_proof.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (err) {
      console.error("Print Page 1 failed:", err);
    } finally {
      setIsPrintingPageOne(false);
    }
  };

  const handleDownloadFullPdf = async () => {
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

        <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
          {/* =========================================================================
              SECTION 1 (TOP): BOOK CREATOR ASSISTANCE (PAPERTALES)
              Directly matching user's sketch top container
              ========================================================================= */}
          <section className="glacier-glass rounded-2xl border border-sky-400/30 p-5 sm:p-7 shadow-2xl relative overflow-hidden space-y-6">
            {/* Header: Book Creator Assistance */}
            <div className="flex items-center justify-between border-b border-sky-400/20 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-400/20 border border-sky-400/30 text-sky-300 flex items-center justify-center shadow-sm">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                    Book Creator Assistance
                  </h2>
                  <p className="text-xs text-[#a0b4c4]">
                    Meet <strong className="text-sky-300">PaperTales</strong> &bull; Your AI Book Publishing Copilot
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Assistant Ready
              </span>
            </div>

            {/* Conversation Thread */}
            <div className="space-y-4">
              {/* Message 1 (User Bubble - Exactly as sketched) */}
              <div className="flex items-start justify-end gap-2.5">
                <div className="max-w-md sm:max-w-lg bg-sky-500/20 border border-sky-400/40 rounded-2xl rounded-tr-xs px-4 py-3 text-white shadow-md">
                  <p className="text-xs sm:text-sm font-semibold tracking-wide">
                    &ldquo;Hey, PaperTales what can you do&rdquo;
                  </p>
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-800 border border-sky-400/30 flex items-center justify-center text-sky-300 shrink-0">
                  <User className="w-4 h-4" />
                </div>
              </div>

              {/* Message 2 (PaperTales Assistant Bubble - Explaining Capabilities) */}
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-full bg-sky-400/20 border border-sky-400/40 flex items-center justify-center text-sky-300 shrink-0 mt-1">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="flex-1 bg-slate-900/80 border border-sky-400/25 rounded-2xl rounded-tl-xs p-4 sm:p-5 text-white shadow-lg space-y-4">
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-sky-200">
                      Hi there! I&apos;m PaperTales, your AI book creation assistant.
                    </h4>
                    <p className="text-xs text-[#a0b4c4] mt-1 leading-relaxed">
                      I turn your family memories, bedtime ideas, and learning milestones into beautifully illustrated, 
                      print-ready physical books delivered straight to your door. Here are the book lanes we can create:
                    </p>
                  </div>

                  {/* 4 Interactive Creative Lanes in Message Bubble */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {GENRE_LANES.map((lane) => {
                      const IconComponent = lane.icon;
                      const isSelected = selectedGenre === lane.id;
                      return (
                        <button
                          key={lane.id}
                          type="button"
                          onClick={() => handleSelectGenre(lane.id)}
                          className={`p-3 rounded-xl border text-left transition-all ${
                            isSelected
                              ? "bg-sky-400/20 border-sky-400 text-white shadow-sm ring-1 ring-sky-400/30"
                              : "bg-slate-950/50 border-sky-400/15 hover:border-sky-400/40 text-[#a0b4c4] hover:text-white"
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <IconComponent className={`w-4 h-4 ${isSelected ? "text-sky-300" : "text-slate-400"}`} />
                            <span className="text-xs font-bold leading-tight truncate">{lane.label}</span>
                            {isSelected && (
                              <span className="ml-auto text-[9px] font-bold px-1.5 py-0.2 rounded bg-sky-400 text-[#001f2e]">
                                Selected
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 font-medium line-clamp-2 leading-relaxed">
                            {lane.description}
                          </p>
                        </button>
                      );
                    })}
                  </div>

                  {/* Reference Image Note & Capabilities Pills */}
                  <div className="pt-1 flex flex-wrap items-center gap-2 text-[10px] text-[#a0b4c4]">
                    <span className="px-2 py-0.5 rounded-full bg-slate-950/80 border border-sky-400/20">
                      📸 Reference Photo Grounding
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-950/80 border border-sky-400/20">
                      🎁 First 5 Pages 100% Free
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-950/80 border border-sky-400/20">
                      🖨️ Lulu Express Print-on-Demand
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-950/80 border border-sky-400/20">
                      💳 PayPal 1-Click Checkout
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Assistance Configuration Controls (Prompt, Reference & Confirmation) */}
            <div className="pt-4 border-t border-sky-400/20 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* Left: Adventure Prompt & Presets (7 cols) */}
                <div className="md:col-span-7 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-[#a0b4c4]">
                      Describe Book Story / Milestone Prompt
                    </label>
                  </div>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={3}
                    className="w-full text-xs p-3 rounded-xl bg-slate-900/80 border border-sky-400/20 text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 font-medium"
                    placeholder={`e.g. ${activeGenreConfig.defaultPrompt}...`}
                  />

                  {/* Quick Preset Pills */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {activeGenreConfig.presets.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setPrompt(preset.prompt);
                          setCharacter(preset.character);
                        }}
                        className="text-[10px] font-semibold bg-slate-900/80 hover:bg-sky-400/20 text-[#a0b4c4] hover:text-sky-300 border border-sky-400/20 px-2 py-1 rounded-lg transition-all"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Right: Reference Asset Uploader (5 cols) */}
                <div className="md:col-span-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-white flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-sky-400" />
                      Reference Photo / Sketch (Optional)
                    </label>
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
                    <div className="flex items-center gap-3 p-2.5 bg-slate-950/70 rounded-xl border border-sky-400/30">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={referenceImageUrl}
                        alt="Reference anchor"
                        className="w-14 h-14 object-cover rounded-lg border border-sky-400/40"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-sky-300 truncate">Visual Grounding Active</p>
                        <p className="text-[10px] text-[#a0b4c4] line-clamp-2">
                          AI anchors character consistency &amp; linework to this reference.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="cursor-pointer flex flex-col items-center justify-center p-3 rounded-xl border border-dashed border-sky-400/30 hover:border-sky-400 bg-slate-900/40 hover:bg-sky-400/5 transition-all text-center">
                        <UploadCloud className="w-5 h-5 text-sky-400 mb-1" />
                        <span className="text-[11px] font-semibold text-sky-200">
                          Upload child photo, pet, or drawing
                        </span>
                        <span className="text-[9px] text-slate-500 mt-0.5">PNG, JPG up to 10MB</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                      <div className="flex items-center gap-1.5 mt-1.5">
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
              </div>

              {/* Character & Page Length Settings (Collapsible or Clean Row) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div>
                  <label className="block text-[11px] font-semibold text-[#a0b4c4] mb-1">Character Name</label>
                  <input
                    type="text"
                    value={character.name}
                    onChange={(e) => setCharacter({ ...character, name: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-lg bg-slate-900/70 border border-sky-400/20 text-white placeholder-slate-500 focus:outline-none focus:border-sky-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#a0b4c4] mb-1">Character Archetype</label>
                  <input
                    type="text"
                    value={character.type}
                    onChange={(e) => setCharacter({ ...character, type: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-lg bg-slate-900/70 border border-sky-400/20 text-white placeholder-slate-500 focus:outline-none focus:border-sky-400"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-semibold text-[#a0b4c4]">Book Length</label>
                    <span className="text-[10px] text-sky-300 font-bold">{pageCount} Pages (5 Free)</span>
                  </div>
                  <input
                    type="range"
                    min={5}
                    max={60}
                    step={1}
                    value={pageCount}
                    onChange={(e) => setPageCount(parseInt(e.target.value, 10))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400 mt-2"
                  />
                </div>
              </div>

              {/* Mascot & Economics Indicator */}
              <MascotQuoter
                quote={quote}
                userTokens={userTokens}
                onOpenTokenModal={() => setTokenModalOpen(true)}
              />

              {/* Confirmation Banner & Synthesis Trigger */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-sky-400/30 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white">
                      Confirm Book Details &amp; Pages
                    </h5>
                    <p className="text-[11px] text-[#a0b4c4]">
                      {activeGenreConfig.label} &bull; {pageCount} Pages &bull; Featuring {character.name} &bull;{" "}
                      {quote.tokensRequired === 0 ? "100% Free Gift" : `${quote.tokensRequired} Tokens`}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleConfirmAndGenerate}
                  disabled={isGenerating}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl glacier-btn text-[#001f2e] font-extrabold text-xs shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Synthesizing Pages with PaperTales...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Confirm Details &amp; Generate Spread</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </section>

          {/* =========================================================================
              SECTION 2 (BOTTOM): BOOK DISPLAY (BOOK PREVIEW DISPLAY)
              Directly positioned below the AI Assistance, matching user's sketch
              ========================================================================= */}
          <section id="book-display-section" className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-sky-400/20 border border-sky-400/30 text-sky-300 flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                    Book Display
                  </h3>
                  <p className="text-xs text-[#a0b4c4]">
                    Interactive two-page spread preview &bull; 8.5&quot; &times; 8.5&quot; Square
                  </p>
                </div>
              </div>
            </div>

            {/* The Live Book Viewer Spread & Action Buttons */}
            <BookViewer
              book={book}
              onPageUpdate={handlePageUpdate}
              onDownloadPdf={handleDownloadFullPdf}
              onPrintFirstPage={handlePrintFirstPage}
              onOpenBookDetails={() => setBookDetailsOpen(true)}
              onOrderPhysical={() => setOrderModalOpen(true)}
              isDownloading={isDownloadingPdf || isPrintingPageOne}
              isConfirmed={isConfirmed}
            />
          </section>
        </main>

        {/* Modals */}
        <BookDetailsModal
          isOpen={bookDetailsOpen}
          onClose={() => setBookDetailsOpen(false)}
          book={book}
        />

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
