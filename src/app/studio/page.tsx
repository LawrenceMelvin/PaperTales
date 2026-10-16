"use client";

import React, { useState, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import BookViewer from "@/components/BookViewer";
import TokenModal from "@/components/TokenModal";
import OrderSummaryModal from "@/components/OrderSummaryModal";
import BookDetailsModal from "@/components/BookDetailsModal";
import OrderTrackingGrid from "@/components/OrderTrackingGrid";
import { BookProject, BookPage, CharacterAnchor } from "@/types/book";
import { CompanionProduct } from "@/types/order";
import { deductClientTokens, getClientTokenBalance } from "@/lib/token-store";
import { calculateBookQuote } from "@/lib/pricing-calculator";
import {
  Sparkles,
  Wand2,
  RefreshCw,
  Palette,
  BookHeart,
  Calculator,
  Atom,
  UploadCloud,
  X,
  Bot,
  User,
  CheckCircle2,
  Image as ImageIcon,
  BookOpen,
  Send,
  Plus,
  Check,
  ShoppingBag,
  ShieldCheck,
  AlertTriangle,
  Package,
  Coins,
  Paperclip,
  ArrowLeft,
  ArrowRight,
  MessageSquare,
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

interface PrintAdvisoryData {
  hasRisk: boolean;
  franchiseName?: string;
  safeTitle?: string;
  safeCharacter?: string;
  explanation?: string;
}

interface BookDraftData {
  title?: string;
  subtitle?: string;
  genre?: BookGenre;
  characterName?: string;
  characterType?: string;
  characterTraits?: string[];
  prompt?: string;
  pageCount?: number;
  channel3Query?: string;
  recommendedAction?: "design_hero_page" | "expand_full_spread";
  designerNote?: string;
}

interface ChatMessageItem {
  id: string;
  role: "user" | "assistant";
  content: string;
  discussionStage?: "discovery" | "brainstorming" | "concept_locked";
  isReadyForProof?: boolean;
  titleOptions?: string[];
  quickReplies?: string[];
  printAdvisory?: PrintAdvisoryData;
  bookDraft?: BookDraftData;
}

const INITIAL_MESSAGES: ChatMessageItem[] = [];

const INITIAL_BOOK: BookProject = {
  id: "book_initial",
  title: "Barnaby's Ice Cream Adventure",
  subtitle: "A Personalized AI Coloring Storybook",
  authorName: "",
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
  const [authorName, setAuthorName] = useState<string>("");
  const [targetAge, setTargetAge] = useState<string>("4-8");
  const [pageCount, setPageCount] = useState<number>(5);
  const [userTokens, setUserTokens] = useState<number>(12);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState<boolean>(false);
  const [isPrintingPageOne, setIsPrintingPageOne] = useState<boolean>(false);

  // Chat conversation state
  const [messages, setMessages] = useState<ChatMessageItem[]>(INITIAL_MESSAGES);
  const [inputMessage, setInputMessage] = useState<string>("");
  const [isChatting, setIsChatting] = useState<boolean>(false);
  const [isDiscussionDone, setIsDiscussionDone] = useState<boolean>(false);
  const [isEditingCharacterName, setIsEditingCharacterName] = useState<boolean>(false);

  // Live Channel3 companion products
  const [companionProducts, setCompanionProducts] = useState<CompanionProduct[]>([]);
  const [selectedCompanion, setSelectedCompanion] = useState<CompanionProduct | null>(null);

  // Confirmation state
  const [isConfirmed, setIsConfirmed] = useState<boolean>(true);

  // Reference photo / sketch upload
  const [referenceImageUrl, setReferenceImageUrl] = useState<string | null>(null);

  // Modals state
  const [tokenModalOpen, setTokenModalOpen] = useState<boolean>(false);
  const [orderModalOpen, setOrderModalOpen] = useState<boolean>(false);
  const [bookDetailsOpen, setBookDetailsOpen] = useState<boolean>(false);
  const [orderTrackingOpen, setOrderTrackingOpen] = useState<boolean>(false);

  // Dedicated ref strictly for the internal chat scroll container
  const chatScrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll strictly the internal chat container (never the outer studio window)
  useEffect(() => {
    if (chatScrollContainerRef.current) {
      chatScrollContainerRef.current.scrollTo({
        top: chatScrollContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isChatting]);

  // Compute dynamic quote
  const quote = calculateBookQuote(pageCount);
  const activeGenreConfig = GENRE_LANES.find((g) => g.id === selectedGenre) || GENRE_LANES[0];

  useEffect(() => {
    setUserTokens(getClientTokenBalance());
    const handleUpdate = () => setUserTokens(getClientTokenBalance());
    window.addEventListener("tokens_updated", handleUpdate);
    return () => window.removeEventListener("tokens_updated", handleUpdate);
  }, []);

  // Fetch initial Channel3 companion supplies
  useEffect(() => {
    async function loadInitialSupplies() {
      try {
        const res = await fetch(`/api/channel3/suggest?genre=${selectedGenre}`);
        const data = await res.json();
        if (data.success && data.products) {
          setCompanionProducts(data.products);
          setSelectedCompanion(data.products[0] || null);
        }
      } catch (err) {
        console.warn("Failed to load initial Channel3 items:", err);
      }
    }
    loadInitialSupplies();
  }, [selectedGenre]);

  const handleSelectGenre = (genreId: BookGenre) => {
    setSelectedGenre(genreId);
    const cfg = GENRE_LANES.find((g) => g.id === genreId) || GENRE_LANES[0];
    setPrompt(cfg.defaultPrompt);
    setCharacter(cfg.defaultCharacter);
    setBook((prev) => ({
      ...prev,
      genre: genreId,
      format: {
        ...prev.format,
        trimSize: genreId === "memory_book" ? "6x9" : "8.5x8.5",
      },
    }));
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

  // Conversational AI Helper Message Handler (Powered by Groq & GPT-4o)
  const handleSendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || isChatting) return;

    // Detect requested page count from user prompt (e.g. "proceed with 30 pages", "make it 24 pages", "30 pages")
    const pageMatch = trimmed.match(/\b(\d+)\s*pages?\b/i);
    let requestedPages = pageCount;
    if (pageMatch) {
      const parsed = parseInt(pageMatch[1], 10);
      if (parsed >= 4 && parsed <= 60) {
        requestedPages = parsed;
        setPageCount(parsed);
      }
    }

    const userMsg: ChatMessageItem = {
      id: `msg_${Date.now()}`,
      role: "user",
      content: trimmed,
    };

    const newThread = [...messages, userMsg];
    setMessages(newThread);
    setInputMessage("");
    setIsChatting(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newThread.map((m) => ({ role: m.role, content: m.content })),
          currentBook: book,
          referenceImageUrl: referenceImageUrl || undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        // Automatically synchronize book draft parameters into studio state
        if (data.bookDraft) {
          if (typeof data.bookDraft.pageCount === "number" && data.bookDraft.pageCount >= 4) {
            setPageCount(data.bookDraft.pageCount);
            requestedPages = data.bookDraft.pageCount;
          }
          if (data.bookDraft.genre) {
            setSelectedGenre(data.bookDraft.genre);
          }
          if (data.bookDraft.title) {
            setBook((prev) => ({
              ...prev,
              title: data.bookDraft.title,
              subtitle: data.bookDraft.subtitle || prev.subtitle,
              genre: data.bookDraft.genre || prev.genre,
            }));
          }
          if (data.bookDraft.prompt) {
            setPrompt(data.bookDraft.prompt);
          }
          if (data.bookDraft.characterName || data.bookDraft.characterType) {
            setCharacter({
              name: data.bookDraft.characterName || character.name,
              type: data.bookDraft.characterType || character.type,
              traits: data.bookDraft.characterTraits || character.traits,
            });
          }

          // Dynamically query Channel3 for smart companion supplies matching this story
          if (data.bookDraft.channel3Query) {
            try {
              const ch3Res = await fetch(
                `/api/channel3/suggest?genre=${data.bookDraft.genre || selectedGenre}&query=${encodeURIComponent(
                  data.bookDraft.channel3Query
                )}`
              );
              const ch3Data = await ch3Res.json();
              if (ch3Data.success && ch3Data.products && ch3Data.products.length > 0) {
                setCompanionProducts(ch3Data.products);
                setSelectedCompanion(ch3Data.products[0]);
              }
            } catch (ch3Err) {
              console.warn("Channel3 query failed:", ch3Err);
            }
          }
        }

        const assistantMsg: ChatMessageItem = {
          id: `msg_${Date.now() + 1}`,
          role: "assistant",
          content: data.reply,
          discussionStage: data.discussionStage || (data.isReadyForProof ? "concept_locked" : "brainstorming"),
          isReadyForProof: Boolean(data.isReadyForProof),
          titleOptions: data.titleOptions || [],
          quickReplies: data.quickReplies || [],
          printAdvisory: data.printAdvisory,
          bookDraft: data.bookDraft
            ? {
                ...data.bookDraft,
                pageCount: data.bookDraft.pageCount || requestedPages,
              }
            : undefined,
        };
        setMessages([...newThread, assistantMsg]);
      }
    } catch (err) {
      console.error("AI Helper chat failed:", err);
    } finally {
      setIsChatting(false);
    }
  };

  // Stage 1: Design Master Hero Page (Page 1 Proof) First - 100% Free Instant Preview
  const handleDesignHeroPage = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/ai/story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: book.title,
          subtitle: book.subtitle,
          prompt,
          authorName,
          targetAge,
          genre: selectedGenre,
          characterName: character.name,
          characterType: character.type,
          characterTraits: character.traits,
          referenceImageUrl: referenceImageUrl || undefined,
          pageCount: 1, // Single Hero Master Page
          trimSize: book.format.trimSize,
        }),
      });

      const data = await res.json();
      if (data.success && data.book) {
        setBook({
          ...data.book,
          title: data.book.title,
          pageCount: 1,
        });
        setIsConfirmed(false); // Hero proof ready for inspection

        // Smooth scroll to the Book Display below
        const displayEl = document.getElementById("book-display-section");
        if (displayEl) {
          displayEl.scrollIntoView({ behavior: "smooth" });
        }
      }
    } catch (err) {
      console.error("Hero page design failed:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Stage 2: Expand to Full Spread (e.g. 30 pages) based on approved hero template
  const handleExpandFullSpread = async () => {
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
          title: book.title,
          subtitle: book.subtitle,
          prompt,
          authorName,
          targetAge,
          genre: selectedGenre,
          characterName: character.name,
          characterType: character.type,
          characterTraits: character.traits,
          referenceImageUrl: referenceImageUrl || undefined,
          pageCount, // Full requested page count
          trimSize: book.format.trimSize,
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
      console.error("Full book expansion failed:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Direct alias for backward-compatible full generation
  const handleConfirmAndGenerate = handleExpandFullSpread;

  const handlePrintFirstPage = async () => {
    setIsPrintingPageOne(true);
    try {
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
        <Navbar
          onOpenTokenModal={() => setTokenModalOpen(true)}
          onOpenOrderTracking={() => setOrderTrackingOpen(true)}
        />

        <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
          {/* =========================================================================
              SECTION 1 (TOP): BOOK CREATOR ASSISTANCE (PAPERTALES)
              Interactive AI Assistant Copilot powered by Groq & GPT-4o
              ========================================================================= */}
          {/* =========================================================================
              SECTION 1: BOOK CREATOR ASSISTANCE
              Two-Phase Interaction:
              - Phase 1 (Discussion Canvas): Matches wireframe sketch
              - Phase 2 (Confirmation Card): Rendered once book discussion is done
              ========================================================================= */}
          {!isDiscussionDone ? (
            /* =====================================================================
               PHASE 1: BOOK CREATOR ASSISTANCE (DISCUSSION & BRAINSTORMING CANVAS)
               ===================================================================== */
            <section className="rounded-3xl border-2 border-sky-400/80 bg-[#091122]/90 p-5 sm:p-7 shadow-2xl relative flex flex-col justify-between min-h-[480px] sm:min-h-[520px]">
              {/* Header: BOOK CREATOR ASSISTANCE */}
              <div className="flex items-center justify-between border-b border-sky-400/20 pb-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-base sm:text-lg font-black tracking-wider text-sky-400 uppercase select-none">
                    BOOK CREATOR ASSISTANCE
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  {messages.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setIsDiscussionDone(true)}
                      className="text-[11px] font-bold px-3 py-1 rounded-full bg-sky-500/20 hover:bg-sky-500/30 text-sky-200 border border-sky-400/40 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-sm"
                    >
                      <span>Review Book Setup</span>
                      <ArrowRight className="w-3.5 h-3.5 text-sky-400" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setOrderTrackingOpen(true)}
                    className="text-[11px] font-bold px-3 py-1 rounded-full glacier-glass hover:bg-slate-800 text-sky-200 border border-sky-400/40 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-sm"
                  >
                    <Package className="w-3.5 h-3.5 text-sky-400" />
                    <span className="hidden sm:inline">AG Grid Orders</span>
                  </button>
                  <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Copilot Online
                  </span>
                </div>
              </div>

              {/* Chat Canvas & Conversation */}
              <div className="flex-1 flex flex-col justify-between">
                {messages.length === 0 ? (
                  /* Initial Clean Canvas: Matches wireframe sketch with starter bubble on the right */
                  <div className="flex-1 flex flex-col justify-end items-end py-12 px-2 sm:px-6 space-y-4">
                    <button
                      type="button"
                      onClick={() => handleSendMessage("hey papertales, what can you do")}
                      disabled={isChatting}
                      className="px-5 py-2.5 rounded-2xl border-2 border-sky-400/80 bg-[#0c1c38]/90 hover:bg-[#11274e] text-sky-200 text-xs sm:text-sm font-semibold shadow-md transition-all hover:scale-102 active:scale-95 cursor-pointer"
                    >
                      hey papertales, what can you do
                    </button>
                  </div>
                ) : (
                  /* Conversation Thread with Messages (Internal scroll container) */
                  <div ref={chatScrollContainerRef} className="space-y-4 max-h-[380px] overflow-y-auto pr-2 py-4 glacier-scrollbar">
                    {messages.map((msg, index) => {
                      const isUser = msg.role === "user";
                      const lastAssistantIndex = messages.map((m) => m.role).lastIndexOf("assistant");
                      const isLatestAssistant = !isUser && index === lastAssistantIndex;

                      return (
                        <div key={msg.id} className={`flex items-start gap-2.5 ${isUser ? "justify-end" : "justify-start"}`}>
                          {!isUser && (
                            <div className="w-8 h-8 rounded-full bg-sky-400/20 border border-sky-400/40 flex items-center justify-center text-sky-300 shrink-0 mt-1">
                              <Sparkles className="w-4 h-4" />
                            </div>
                          )}

                          <div
                            className={`max-w-xl rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-lg ${
                              isUser
                                ? "bg-sky-500/20 border-2 border-sky-400/80 text-white rounded-tr-xs"
                                : "bg-slate-900/90 border border-sky-400/30 text-white rounded-tl-xs space-y-3"
                            }`}
                          >
                            <p className="whitespace-pre-wrap">{msg.content}</p>

                            {/* Print-Safe & Copyright Advisory Card */}
                            {!isUser && msg.printAdvisory?.hasRisk && (
                              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-400/40 text-xs space-y-2.5 animate-in fade-in">
                                <div className="flex items-center gap-2 text-amber-300 font-bold">
                                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                                  <span>
                                    Print-on-Demand Factory Notice ({msg.printAdvisory.franchiseName || "Trademark Detected"})
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-300 leading-relaxed">
                                  {msg.printAdvisory.explanation ||
                                    "If printing a physical copy through Lulu POD, industrial print facilities may flag exact trademarked names. You can adopt our print-safe homage title or keep your original choice!"}
                                </p>
                                <div className="flex flex-wrap gap-2 pt-1">
                                  {msg.printAdvisory.safeTitle && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (msg.printAdvisory?.safeTitle) {
                                          setBook((prev) => ({
                                            ...prev,
                                            title: msg.printAdvisory!.safeTitle!,
                                            character: msg.printAdvisory!.safeCharacter
                                              ? { ...prev.character, name: msg.printAdvisory!.safeCharacter! }
                                              : prev.character,
                                          }));
                                          handleSendMessage(`I choose the print-safe title: "${msg.printAdvisory.safeTitle}"`);
                                        }
                                      }}
                                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-400/40 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-sm"
                                    >
                                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                                      <span>Adopt Safe: &quot;{msg.printAdvisory.safeTitle}&quot;</span>
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      handleSendMessage("Keep my original character and book title, send to print queue");
                                    }}
                                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-amber-200 border border-amber-400/30 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                                  >
                                    <span>Keep Original &amp; Proceed to Print</span>
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* Interactive Title Options Suggested by Copilot */}
                            {!isUser && msg.titleOptions && msg.titleOptions.length > 0 && (
                              <div className="pt-2.5 border-t border-sky-400/20 space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-[11px] font-bold text-sky-300 flex items-center gap-1.5 uppercase tracking-wider">
                                    <BookOpen className="w-3.5 h-3.5 text-sky-400" />
                                    <span>Suggested Book Titles (Click to Pick):</span>
                                  </span>
                                  <span className="text-[10px] text-slate-400">Tap to select</span>
                                </div>
                                <div className="grid grid-cols-1 gap-1.5">
                                  {msg.titleOptions.map((titleOpt, tIdx) => {
                                    const isSelected = book.title === titleOpt;
                                    return (
                                      <button
                                        key={tIdx}
                                        type="button"
                                        onClick={() => {
                                          setBook((prev) => ({ ...prev, title: titleOpt }));
                                          handleSendMessage(`I pick the title: "${titleOpt}"`);
                                        }}
                                        disabled={isChatting}
                                        className={`w-full text-left text-xs font-semibold px-3 py-2 rounded-xl border transition-all flex items-center justify-between gap-2 cursor-pointer ${
                                          isSelected
                                            ? "bg-sky-500/25 border-sky-400 text-sky-200 ring-1 ring-sky-400/50 shadow-sm"
                                            : "bg-slate-950/70 border-sky-400/20 hover:border-sky-400/60 hover:bg-sky-400/10 text-slate-200"
                                        }`}
                                      >
                                        <span className="truncate">{titleOpt}</span>
                                        <span className="text-[10px] text-sky-400 shrink-0 font-bold px-2 py-0.5 rounded-full bg-sky-400/15 border border-sky-400/30">
                                          {isSelected ? "Selected ✓" : "Pick Title →"}
                                        </span>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {/* Quick Replies for Assistant Messages */}
                            {!isUser && msg.quickReplies && msg.quickReplies.length > 0 && (() => {
                              const cleanReplies = msg.quickReplies.filter((r) => {
                                const trimmed = r.trim().toLowerCase();
                                if (/^(pick\s*a\s*title|choose\s*a\s*title|select\s*a\s*title)/i.test(trimmed)) return false;
                                if (/provide\s*child/i.test(trimmed)) return false;
                                return true;
                              });

                              if (cleanReplies.length === 0) return null;

                              return (
                                <div className="pt-2 border-t border-white/10 space-y-1.5">
                                  <span className="text-[10px] uppercase font-bold text-sky-400 tracking-wider block">
                                    Suggested Next Steps:
                                  </span>
                                  <div className="flex flex-wrap gap-1.5">
                                    {cleanReplies.map((reply, idx) => (
                                      <button
                                        key={idx}
                                        type="button"
                                        onClick={() => handleSendMessage(reply)}
                                        disabled={isChatting}
                                        className="text-[11px] font-semibold bg-slate-950/80 hover:bg-sky-400/20 text-sky-200 border border-sky-400/25 px-2.5 py-1 rounded-lg transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                                      >
                                        {reply}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              );
                            })()}

                            {/* Transition Prompt to Confirmation Card on Latest Turn: when concept is locked or title is picked */}
                            {isLatestAssistant && (msg.isReadyForProof || msg.discussionStage === "concept_locked" || (book.title && book.title === msg.bookDraft?.title && book.title !== INITIAL_BOOK.title)) && (
                              <div className="pt-2.5 border-t border-sky-400/20 flex flex-wrap items-center justify-between gap-2 animate-in fade-in">
                                <span className="text-[11px] text-sky-300 font-medium">
                                  ✨ Concept ready! Review your book specs and design your free master proof.
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setIsDiscussionDone(true)}
                                  className="px-3.5 py-1.5 rounded-xl bg-sky-400 text-slate-950 font-bold text-xs hover:bg-sky-300 transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 shadow"
                                >
                                  <span>Review Book Specs &amp; Master Proof &rarr;</span>
                                </button>
                              </div>
                            )}
                          </div>

                          {isUser && (
                            <div className="w-8 h-8 rounded-full bg-slate-800 border border-sky-400/30 flex items-center justify-center text-sky-300 shrink-0 mt-1">
                              <User className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Chatting Loading Indicator */}
                    {isChatting && (
                      <div className="flex items-center gap-2 text-xs text-sky-300 italic py-1">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>PaperTales is brainstorming your book idea...</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Bottom Input Bar: Matches wireframe sketch with rounded blue border, att button & send button */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage(inputMessage);
                  }}
                  className="mt-4 flex items-end gap-2 border-2 border-sky-400/80 bg-[#070e1c] rounded-2xl p-1.5 sm:p-2 shadow-inner"
                >
                  <textarea
                    rows={1}
                    value={inputMessage}
                    onChange={(e) => {
                      setInputMessage(e.target.value);
                      e.target.style.height = "auto";
                      e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(inputMessage);
                      }
                    }}
                    placeholder="Ask papertales, suggest a new story arc or describe a child ..."
                    className="flex-1 bg-transparent px-3 py-1.5 text-xs sm:text-sm text-white placeholder-sky-300/40 focus:outline-none resize-none max-h-32 leading-relaxed glacier-scrollbar"
                  />

                  {/* Attached photo indicator */}
                  {referenceImageUrl && (
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-sky-500/20 border border-sky-400/40 text-[10px] text-sky-200">
                      <ImageIcon className="w-3 h-3 text-sky-400" />
                      <span className="max-w-[70px] truncate">Photo</span>
                      <button
                        type="button"
                        onClick={() => setReferenceImageUrl(null)}
                        className="text-red-400 hover:text-red-300 ml-0.5 cursor-pointer"
                        title="Remove photo"
                      >
                        &times;
                      </button>
                    </div>
                  )}

                  {/* Attachment button (Just the clean paperclip symbol, no "att" text) */}
                  <label
                    title="Upload reference photo or sketch"
                    className="border-2 border-sky-400/80 hover:bg-sky-400/20 text-sky-300 p-2 rounded-xl cursor-pointer transition-all active:scale-95 flex items-center justify-center shrink-0"
                  >
                    <Paperclip className="w-4 h-4 text-sky-400" />
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>

                  {/* Send button ("send") */}
                  <button
                    type="submit"
                    disabled={!inputMessage.trim() || isChatting}
                    className="border-2 border-sky-400/80 bg-sky-500/20 hover:bg-sky-400 hover:text-slate-950 text-sky-300 font-bold px-4 py-1 rounded-xl text-xs sm:text-sm transition-all active:scale-95 disabled:opacity-40 cursor-pointer shrink-0"
                  >
                    send
                  </button>
                </form>
              </div>
            </section>
          ) : (
            /* =====================================================================
               PHASE 2: BOOK CONFIRMATION CARD (POST-DISCUSSION VIEW)
               Matches exact layout and styling of user's second screenshot
               ===================================================================== */
            <section className="rounded-2xl border-2 border-sky-500/60 bg-[#091122]/95 p-5 sm:p-7 shadow-2xl relative space-y-4 sm:space-y-5 animate-in fade-in">
              {/* Top Navigation bar */}
              <div className="flex items-center justify-between border-b border-sky-400/20 pb-3">
                <button
                  type="button"
                  onClick={() => setIsDiscussionDone(false)}
                  className="text-xs text-sky-300 hover:text-white flex items-center gap-1.5 font-semibold px-2.5 py-1 rounded-lg hover:bg-sky-400/10 transition-all cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Discussion</span>
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setOrderTrackingOpen(true)}
                    className="text-[11px] font-bold px-3 py-1 rounded-full glacier-glass hover:bg-slate-800 text-sky-200 border border-sky-400/40 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-sm"
                  >
                    <Package className="w-3.5 h-3.5 text-sky-400" />
                    <span>AG Grid Orders</span>
                  </button>
                  <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    Ready for Master Proof
                  </span>
                </div>
              </div>

              {/* Identity Row: Title, Genre Pill, Protagonist & Pages / 100% Free Gift */}
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h2 className="text-base sm:text-xl font-black text-white tracking-tight">
                      {book.title || "Barnaby's Ice Cream Adventure"}
                    </h2>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#122840] text-[#38bdf8] border border-[#1e486d]">
                      {activeGenreConfig.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-[#94a3b8] flex-wrap">
                    <span>Protagonist:</span>
                    {isEditingCharacterName ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={character.name}
                          onChange={(e) => setCharacter((prev) => ({ ...prev, name: e.target.value }))}
                          className="bg-[#0b1324] border border-sky-400 text-white px-2.5 py-0.5 rounded-lg text-xs font-bold focus:outline-none focus:ring-1 focus:ring-sky-400"
                          placeholder="Child's name"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") setIsEditingCharacterName(false);
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setIsEditingCharacterName(false)}
                          className="text-[10px] bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 px-2 py-0.5 rounded-md border border-sky-400/40 font-bold cursor-pointer"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <span className="flex items-center gap-1.5">
                        <strong className="text-white font-bold">{character.name || "Barnaby"}</strong>
                        <button
                          type="button"
                          onClick={() => setIsEditingCharacterName(true)}
                          className="text-[10px] text-sky-400 hover:text-sky-300 underline font-semibold cursor-pointer"
                        >
                          (Change Child's Name)
                        </button>
                      </span>
                    )}
                    <span>({character.type || "Explorer"})</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-base sm:text-lg font-black text-white block">
                    {pageCount} Pages
                  </span>
                  <span className="text-xs text-[#34d399] font-bold block">
                    {quote.tokensRequired === 0 ? "100% Free Gift" : `${quote.tokensRequired} Tokens`}
                  </span>
                </div>
              </div>

              {/* LANE Selector: Coloring Book | Family Keepsake | Math & Logic Quest | Science Explorer */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-1">
                <span className="text-xs font-bold uppercase tracking-wider text-[#94a3b8] shrink-0 mr-1">
                  LANE:
                </span>
                {GENRE_LANES.map((lane) => {
                  const isSel = selectedGenre === lane.id;
                  return (
                    <button
                      key={lane.id}
                      type="button"
                      onClick={() => handleSelectGenre(lane.id)}
                      className={`text-xs font-bold px-3.5 py-1.5 rounded-xl border transition-all shrink-0 cursor-pointer ${
                        isSel
                          ? "bg-[#0c2842] border-[#38bdf8] text-[#38bdf8] ring-1 ring-[#38bdf8]/40 shadow-sm"
                          : "bg-[#101a2e] border-white/10 text-[#94a3b8] hover:text-white hover:border-sky-400/30"
                      }`}
                    >
                      {lane.label}
                    </button>
                  );
                })}
              </div>

              {/* Reference Photo / Sketch (Optional) Box */}
              <div className="p-3 rounded-xl bg-[#0e182a] border border-[#1e3450] flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-[#14233c] border border-[#1f375c] text-[#38bdf8] flex items-center justify-center shrink-0">
                    <ImageIcon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-white truncate">
                      Reference Photo / Sketch (Optional)
                    </p>
                    <p className="text-[11px] text-[#94a3b8] truncate">
                      {referenceImageUrl ? "Grounding character visual likeness" : "Upload photo or pet drawing"}
                    </p>
                  </div>
                </div>

                {referenceImageUrl ? (
                  <div className="flex items-center gap-2 shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={referenceImageUrl}
                      alt="Reference"
                      className="w-8 h-8 object-cover rounded-lg border border-sky-400/40"
                    />
                    <button
                      type="button"
                      onClick={() => setReferenceImageUrl(null)}
                      className="text-red-400 hover:text-red-300 p-1 cursor-pointer"
                      title="Remove reference photo"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer px-3.5 py-1.5 rounded-lg border border-[#1f3d67] hover:border-sky-400 bg-[#11223b] hover:bg-sky-400/10 text-xs text-sky-200 font-semibold flex items-center gap-2 transition-all shrink-0">
                    <UploadCloud className="w-3.5 h-3.5 text-sky-400" />
                    <span>Upload Image</span>
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                )}
              </div>

              {/* Trim Size & Dimension Selector */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="font-bold text-white">Trim Size &amp; Book Dimension:</span>
                  <span className="text-[11px] font-bold text-sky-300">
                    Lulu POD Industry Standard
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    {
                      id: "6x9",
                      name: "6\" × 9\" Digest",
                      desc: "Daily Journals, Reflections & Notes",
                    },
                    {
                      id: "8.5x8.5",
                      name: "8.5\" × 8.5\" Square",
                      desc: "Bedtime Storybooks & Coloring",
                    },
                    {
                      id: "8.5x11",
                      name: "8.5\" × 11\" Letter",
                      desc: "Large Activity & Workbooks",
                    },
                  ].map((dim) => {
                    const isSel = (book.format?.trimSize || "8.5x8.5") === dim.id;
                    return (
                      <button
                        key={dim.id}
                        type="button"
                        onClick={() =>
                          setBook((prev) => ({
                            ...prev,
                            format: { ...prev.format, trimSize: dim.id as any },
                          }))
                        }
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          isSel
                            ? "bg-[#0c2842] border-[#38bdf8] text-white shadow-sm ring-1 ring-[#38bdf8]/40"
                            : "bg-[#101a2e] border-white/10 hover:border-sky-400/30 text-slate-300"
                        }`}
                      >
                        <div className="text-xs sm:text-sm font-bold flex items-center justify-between">
                          <span>{dim.name}</span>
                          {isSel && <span className="text-sky-300 text-[10px] font-bold">✓ Active</span>}
                        </div>
                        <div
                          className={`text-[10px] mt-0.5 truncate ${
                            isSel ? "text-sky-300 font-semibold" : "text-slate-400"
                          }`}
                        >
                          {dim.desc}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Book Length: 4 Preset Grid & Slider */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="font-bold text-white">Book Length:</span>
                  <span className="text-xs font-bold text-sky-300">
                    🎁 5 Free Pages Included
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { pages: 5, label: "5 Pages", tag: "Free" },
                    { pages: 12, label: "12 Pages", tag: "7 Tokens" },
                    { pages: 24, label: "24 Pages", tag: "19 Tokens" },
                    { pages: 30, label: "30 Pages", tag: "25 Tokens" },
                  ].map((preset) => {
                    const isSel = pageCount === preset.pages;
                    return (
                      <button
                        key={preset.pages}
                        type="button"
                        onClick={() => setPageCount(preset.pages)}
                        className={`py-2.5 px-3 rounded-xl border text-center transition-all cursor-pointer ${
                          isSel
                            ? "bg-[#0c2842] border-[#38bdf8] text-white shadow-sm ring-1 ring-[#38bdf8]/40"
                            : "bg-[#101a2e] border-white/10 hover:border-sky-400/30 text-slate-300"
                        }`}
                      >
                        <div className="text-xs sm:text-sm font-bold">{preset.label}</div>
                        <div className={`text-[10px] mt-0.5 ${isSel ? "text-sky-300 font-semibold" : "text-slate-400"}`}>
                          {preset.tag}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Slider */}
                <div className="flex items-center gap-3 pt-1">
                  <input
                    type="range"
                    min={5}
                    max={60}
                    step={1}
                    value={pageCount}
                    onChange={(e) => setPageCount(parseInt(e.target.value, 10))}
                    className="flex-1 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#38bdf8]"
                  />
                  <span className="text-xs font-bold text-sky-300 w-14 text-right">
                    {pageCount} pgs
                  </span>
                </div>
              </div>

              {/* Designer Recommendation Banner */}
              <div className="p-3 rounded-xl bg-[#0b1c30] border border-[#1a385c] flex items-start gap-2.5 text-xs text-sky-200">
                <Sparkles className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed text-slate-200">
                  <strong className="text-white">Designer Recommendation:</strong> Let&apos;s design your Master Page 1 Proof first for free to check layout and visual style before creating all {pageCount} pages.
                </p>
              </div>

              {/* Stage 1 Master Page CTA Button */}
              {book.pages.length === 1 ? (
                <div className="space-y-2 pt-1">
                  <button
                    type="button"
                    onClick={handleExpandFullSpread}
                    disabled={isGenerating}
                    className="w-full py-3.5 px-5 rounded-2xl bg-[#7dd3fc] hover:bg-[#a0e3ff] text-[#001f2e] font-black text-sm sm:text-base shadow-xl flex items-center justify-center gap-2.5 transition-all hover:brightness-105 active:scale-98 disabled:opacity-50 cursor-pointer"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-[#001f2e]" />
                        <span>Expanding to Full {pageCount}-Page Spread...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-[#001f2e]" />
                        <span>✨ Looks Great! Expand to Full {pageCount}-Page Spread</span>
                      </>
                    )}
                  </button>
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={handleDesignHeroPage}
                      disabled={isGenerating}
                      className="text-xs text-[#a0b4c4] hover:text-sky-300 underline font-medium cursor-pointer"
                    >
                      🔄 Redesign Master Page 1 Proof
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleDesignHeroPage}
                  disabled={isGenerating}
                  className="w-full py-3.5 px-5 rounded-2xl bg-[#7dd3fc] hover:bg-[#a0e3ff] text-[#001f2e] font-black text-sm sm:text-base shadow-xl flex items-center justify-center gap-2.5 transition-all hover:brightness-105 active:scale-98 disabled:opacity-50 cursor-pointer"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-[#001f2e]" />
                      <span>Designing Master Page 1 Proof...</span>
                    </>
                  ) : (
                    <>
                      <Palette className="w-4 h-4 text-[#001f2e]" />
                      <span>🎨 Design Master Page 1 First (Instant Free Preview)</span>
                    </>
                  )}
                </button>
              )}
            </section>
          )}

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
                    Interactive two-page spread preview &bull;{" "}
                    {book.format?.trimSize === "6x9"
                      ? "6\" × 9\" US Trade Digest Journal"
                      : book.format?.trimSize === "8.5x11"
                      ? "8.5\" × 11\" Letter Workbook"
                      : "8.5\" × 8.5\" Square Storybook"}
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
              onOpenTokenModal={() => setTokenModalOpen(true)}
              isDownloading={isDownloadingPdf || isPrintingPageOne}
              isConfirmed={isConfirmed}
            />

            {/* =========================================================================
                CHANNEL3 AGENTIC COMMERCE COMPANION SUPPLIES (MATCHED BY AI HELPER)
                ========================================================================= */}
            {companionProducts.length > 0 && (
              <div className="glacier-glass rounded-2xl border border-sky-400/25 p-4 sm:p-5 shadow-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-sky-400" />
                    <div>
                      <h4 className="text-xs sm:text-sm font-extrabold text-white">
                        AI-Matched Physical Art Supplies (Channel3 Agentic Commerce)
                      </h4>
                      <p className="text-[11px] text-[#a0b4c4]">
                        Curated supplies matching {book.title} &bull; Ships with your book
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-400/20 text-sky-300 border border-sky-400/30">
                    Live Merchant Catalog
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {companionProducts.slice(0, 3).map((item) => {
                    const isSelected = selectedCompanion?.id === item.id;
                    return (
                      <div
                        key={item.id}
                        onClick={() => setSelectedCompanion(isSelected ? null : item)}
                        className={`cursor-pointer p-3 rounded-xl border text-xs flex items-center gap-3 transition-all ${
                          isSelected
                            ? "bg-sky-500/20 border-sky-400 shadow-md ring-1 ring-sky-400/30"
                            : "bg-slate-900/60 border-white/10 hover:border-sky-400/30"
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-12 h-12 object-cover rounded-lg border border-white/10 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-white truncate text-xs">{item.title}</p>
                          <p className="text-[11px] text-sky-300 font-semibold mt-0.5">
                            ${item.price.toFixed(2)}{" "}
                            <span className="text-[#a0b4c4] font-normal text-[10px]">
                              via {item.retailerDomain || item.brand}
                            </span>
                          </p>
                        </div>
                        <button
                          type="button"
                          className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all ${
                            isSelected ? "bg-sky-400 text-slate-950 font-bold" : "border border-slate-600 text-slate-400"
                          }`}
                        >
                          {isSelected ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
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

        <OrderTrackingGrid
          isOpen={orderTrackingOpen}
          onClose={() => setOrderTrackingOpen(false)}
        />
      </div>
    </div>
  );
}
