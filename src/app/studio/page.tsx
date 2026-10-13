"use client";

import React, { useState, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import BookViewer from "@/components/BookViewer";
import CharacterAnchorComponent from "@/components/CharacterAnchor";
import MascotQuoter from "@/components/MascotQuoter";
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

interface ChatMessageItem {
  id: string;
  role: "user" | "assistant";
  content: string;
  quickReplies?: string[];
  printAdvisory?: PrintAdvisoryData;
}

const INITIAL_MESSAGES: ChatMessageItem[] = [];

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

  // Chat conversation state
  const [messages, setMessages] = useState<ChatMessageItem[]>(INITIAL_MESSAGES);
  const [inputMessage, setInputMessage] = useState<string>("");
  const [isChatting, setIsChatting] = useState<boolean>(false);

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

  // Auto-scroll ref for chat thread
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  // Conversational AI Helper Message Handler (Powered by gpt-4o-mini)
  const handleSendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || isChatting) return;

    const userMsg: ChatMessageItem = {
      id: `msg_${Date.now()}`,
      role: "user",
      content: trimmed,
    };

    const newThread = [...messages, userMsg];
    setMessages(newThread);
    setInputMessage("");
    setIsChatting(true);

    // Fast path: If asking "what can you do" as the first message, return instant rich overview
    if (trimmed.toLowerCase().includes("what can you do") && messages.length === 0) {
      setTimeout(() => {
        const assistantMsg: ChatMessageItem = {
          id: `msg_${Date.now() + 1}`,
          role: "assistant",
          content:
            "Hi there! I'm PaperTales, your AI book creation copilot. I turn your ideas, family memories, recipes, and learning milestones into beautifully formatted, physical books delivered straight to your door!\n\nHere is what I can create with you:\n• 🍲 Family Recipe Heirlooms & Culinary Guides\n• 🎨 Custom Kids' Coloring Books (300 DPI vector linework ready for crayons)\n• 🎣 Dad's Fishing & Wilderness Knot Reference Guides\n• 📖 Guided Daily Habit & Mindfulness Planners\n• 🔢 Math & Logic Quests for young learners\n\n✨ Digital 300 DPI vector PDF downloads are 100% Free! We also match physical art supplies through Channel3 and print bookstore-grade softcover books via Lulu with seamless PayPal checkout.\n\nTell me: who is this book for, or choose an idea below to begin!",
          quickReplies: [
            "🍲 Mom's Sunday Kitchen Recipes",
            "🎨 Barnaby's Cosmic Space Adventures",
            "🎣 The Lakefront Fishing Journal",
            "📖 90 Days of Clarity Habit Journal",
          ],
        };
        setMessages([...newThread, assistantMsg]);
        setIsChatting(false);
      }, 300);
      return;
    }

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
        const assistantMsg: ChatMessageItem = {
          id: `msg_${Date.now() + 1}`,
          role: "assistant",
          content: data.reply,
          quickReplies: data.quickReplies || [],
          printAdvisory: data.printAdvisory,
        };
        setMessages([...newThread, assistantMsg]);

        // Automatically synchronize book draft parameters into studio state
        if (data.bookDraft) {
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
      }
    } catch (err) {
      console.error("AI Helper chat failed:", err);
    } finally {
      setIsChatting(false);
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
                    Meet <strong className="text-sky-300">PaperTales</strong> &bull; Powered by Groq LPU &amp; GPT-4o
                  </p>
                </div>
              </div>
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
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Copilot Online
                </span>
              </div>
            </div>

            {/* Conversation Thread */}
            <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
              {messages.length === 0 ? (
                <div className="py-8 px-4 flex flex-col items-center justify-center text-center space-y-4 rounded-xl bg-slate-900/40 border border-sky-400/15">
                  <div className="w-12 h-12 rounded-2xl bg-sky-400/20 border border-sky-400/30 text-sky-300 flex items-center justify-center shadow-lg">
                    <Sparkles className="w-6 h-6 text-sky-400" />
                  </div>
                  <div className="max-w-md space-y-1.5">
                    <h3 className="text-sm sm:text-base font-bold text-white">
                      What kind of personal book would you like to create?
                    </h3>
                    <p className="text-xs text-[#a0b4c4]">
                      Type your idea below, or click to explore what PaperTales AI can do.
                    </p>
                  </div>

                  {/* Clickable Starter Pills */}
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-1 max-w-xl">
                    <button
                      type="button"
                      onClick={() => handleSendMessage("Hey, PaperTales what can you do")}
                      disabled={isChatting}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-sky-500/25 hover:bg-sky-500/40 text-sky-200 border border-sky-400/50 flex items-center gap-2 transition-all hover:scale-102 active:scale-95 shadow-md"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                      <span>👋 Hey, PaperTales what can you do</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSendMessage("I want to design a family heirloom recipe book")}
                      disabled={isChatting}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-950/80 hover:bg-white/10 text-slate-300 border border-white/15 transition-all active:scale-95"
                    >
                      🍲 Family Recipe Book
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSendMessage("Help me create a custom children's coloring adventure book")}
                      disabled={isChatting}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-950/80 hover:bg-white/10 text-slate-300 border border-white/15 transition-all active:scale-95"
                    >
                      🎨 Kids Coloring Book
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSendMessage("I want to create a Dad's fishing and outdoor knots guide")}
                      disabled={isChatting}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-950/80 hover:bg-white/10 text-slate-300 border border-white/15 transition-all active:scale-95"
                    >
                      🎣 Dad&apos;s Fishing Guide
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSendMessage("I want to make a 90-day guided daily habit and clarity journal")}
                      disabled={isChatting}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-950/80 hover:bg-white/10 text-slate-300 border border-white/15 transition-all active:scale-95"
                    >
                      📖 Daily Habit Journal
                    </button>
                  </div>
                </div>
              ) : (
                messages.map((msg) => {
                  const isUser = msg.role === "user";
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
                            ? "bg-sky-500/20 border border-sky-400/40 text-white rounded-tr-xs"
                            : "bg-slate-900/80 border border-sky-400/25 text-white rounded-tl-xs space-y-3"
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

                        {/* Quick Replies for Assistant Messages */}
                        {!isUser && msg.quickReplies && msg.quickReplies.length > 0 && (
                          <div className="pt-2 border-t border-white/10 space-y-1.5">
                            <span className="text-[10px] uppercase font-bold text-sky-400 tracking-wider block">
                              Suggested Next Steps:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {msg.quickReplies.map((reply, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => handleSendMessage(reply)}
                                  disabled={isChatting}
                                  className="text-[11px] font-semibold bg-slate-950/80 hover:bg-sky-400/20 text-sky-200 border border-sky-400/25 px-2.5 py-1 rounded-lg transition-all active:scale-95 disabled:opacity-50"
                                >
                                  {reply}
                                </button>
                              ))}
                            </div>
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
                })
              )}

              {/* Chatting Loading Indicator */}
              {isChatting && (
                <div className="flex items-center gap-2 text-xs text-sky-300 italic py-1">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>PaperTales is brainstorming your book idea...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input Field */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(inputMessage);
              }}
              className="flex items-center gap-2 bg-slate-900/90 border border-sky-400/25 rounded-xl p-1.5"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask PaperTales, suggest a new story arc, or describe your child..."
                className="flex-1 bg-transparent px-3 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isChatting}
                className="px-4 py-2 rounded-lg glacier-btn text-[#001f2e] font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-40"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </form>

            {/* Assistance Configuration Controls (Lane Selector, Reference & Confirmation) */}
            <div className="pt-4 border-t border-sky-400/20 space-y-4">
              {/* 4 Creative Lanes */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#a0b4c4] mb-2">
                  Creative Book Lane
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {GENRE_LANES.map((lane) => {
                    const IconComponent = lane.icon;
                    const isSelected = selectedGenre === lane.id;
                    return (
                      <button
                        key={lane.id}
                        type="button"
                        onClick={() => handleSelectGenre(lane.id)}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? "bg-sky-400/20 border-sky-400 text-white shadow-sm ring-1 ring-sky-400/30"
                            : "bg-slate-950/50 border-sky-400/15 hover:border-sky-400/40 text-[#a0b4c4] hover:text-white"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <IconComponent className={`w-3.5 h-3.5 ${isSelected ? "text-sky-300" : "text-slate-400"}`} />
                          <span className="text-xs font-bold truncate">{lane.label}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 truncate">{lane.badge}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Reference Asset Uploader */}
              <div className="glacier-glass-subtle p-3 rounded-xl border border-sky-400/20 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-sky-400/15 border border-sky-400/30 text-sky-300 flex items-center justify-center shrink-0">
                    <ImageIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white">Reference Photo / Sketch (Optional)</h5>
                    <p className="text-[10px] text-[#a0b4c4]">Upload child photo, pet, or drawing to anchor character consistency</p>
                  </div>
                </div>

                {referenceImageUrl ? (
                  <div className="flex items-center gap-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={referenceImageUrl} alt="Reference" className="w-9 h-9 object-cover rounded-lg border border-sky-400/40" />
                    <span className="text-[10px] font-bold text-emerald-300">Grounding Active</span>
                    <button
                      type="button"
                      onClick={() => setReferenceImageUrl(null)}
                      className="text-red-400 hover:text-red-300 p-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer px-3 py-1.5 rounded-lg border border-sky-400/30 hover:border-sky-400 bg-slate-900/60 hover:bg-sky-400/10 text-xs text-sky-200 font-semibold flex items-center gap-1.5 transition-all">
                    <UploadCloud className="w-3.5 h-3.5 text-sky-400" />
                    <span>Upload Image</span>
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                )}
              </div>

              {/* Character & Page Settings */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#a0b4c4] mb-1">Protagonist Name</label>
                  <input
                    type="text"
                    value={character.name}
                    onChange={(e) => setCharacter({ ...character, name: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-lg bg-slate-900/70 border border-sky-400/20 text-white placeholder-slate-500 focus:outline-none focus:border-sky-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#a0b4c4] mb-1">Archetype / Species</label>
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

              {/* Mascot Quoter Component */}
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
