"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import BookViewer from "@/components/BookViewer";
import TokenModal from "@/components/TokenModal";
import OrderSummaryModal from "@/components/OrderSummaryModal";
import BookDetailsModal from "@/components/BookDetailsModal";
import OrderTrackingGrid from "@/components/OrderTrackingGrid";
import BookLibraryModal from "@/components/BookLibraryModal";
import { BOOKSTORE_CATALOG, bookstoreItemToBookProject } from "@/lib/bookstore-catalog";

import { BookProject, BookPage, CharacterAnchor, BookCoverDesign, BookCoverColorScheme } from "@/types/book";
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

type BookGenre = "coloring_book" | "storybook" | "memory_book" | "activity_book" | "math_book" | "science_book";

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
  artStyle?: string;
  characterName?: string;
  characterType?: string;
  characterTraits?: string[];
  pageCount?: number;
  trimSize?: "6x9" | "8.5x8.5" | "8.5x11";
  pageStructure?: string;
  layoutType?: "empty_lined" | "guided_sections" | "classic_prompt";
  borderText?: string | null;
  borderStyle?: "robotic" | "modern" | "playful" | "none";
  cornerDecorations?: "tech_brackets" | "gears" | "minimal" | "none";
  interiorColor?: "black_and_white" | "standard_color";
  lineRuleSpacing?: "wide" | "college";
  showPageNumbers?: boolean;
  channel3Query?: string;
  recommendedAction?: "design_hero_page" | "plan_remaining_pages" | "expand_full_spread" | "design_book_cover";
  designerNote?: string;
}

interface CoverDraftData {
  title?: string | null;
  subtitle?: string | null;
  authorByline?: string | null;
  coverPrompt?: string | null;
  colorScheme?: BookCoverColorScheme | null;
  isReadyForCover?: boolean;
}

type DiscussionStage =
  | "discovery"
  | "designing"
  | "brief_review"
  | "concept_locked"
  | "page_planning"
  | "page_plan_confirmed"
  | "revising"
  | "cover_design";

interface DraftChange {
  field: string;
  from?: string | null;
  to: string;
}

const TRIM_SIZES = ["6x9", "8.5x8.5", "8.5x11"] as const;
const TITLE_PICK_PATTERN = /I (?:pick|choose) the (?:print-safe )?title:\s*["“](.+?)["”]/i;

interface ChatMessageItem {
  id: string;
  role: "user" | "assistant";
  content: string;
  discussionStage?: DiscussionStage;
  isReadyForProof?: boolean;
  isPagePlanConfirmed?: boolean;
  requiresNewProof?: boolean;
  changes?: DraftChange[];
  titleOptions?: string[];
  quickReplies?: string[];
  printAdvisory?: PrintAdvisoryData;
  bookDraft?: BookDraftData;
  coverDraft?: CoverDraftData;
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
  const [character, setCharacter] = useState<CharacterAnchor>({ name: "", type: "", traits: [] });
  const [prompt, setPrompt] = useState<string>("");
  const [artStyle, setArtStyle] = useState<string>("Playful, colorful illustrations");
  const [pageStructure, setPageStructure] = useState<string>("");
  const [layoutType, setLayoutType] = useState<"empty_lined" | "guided_sections" | "classic_prompt">("classic_prompt");
  const [borderText, setBorderText] = useState<string | null>(null);
  const [borderStyle, setBorderStyle] = useState<"robotic" | "modern" | "playful" | "none">("none");
  const [cornerDecorations, setCornerDecorations] = useState<"tech_brackets" | "gears" | "minimal" | "none">("none");
  const [lineRuleSpacing, setLineRuleSpacing] = useState<"wide" | "college">("college");
  const [showPageNumbers, setShowPageNumbers] = useState<boolean>(false);
  const [authorName, setAuthorName] = useState<string>("");
  const [targetAge, setTargetAge] = useState<string>("4-8");
  const [pageCount, setPageCount] = useState<number>(5);
  const [userTokens, setUserTokens] = useState<number>(0);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isGeneratingCover, setIsGeneratingCover] = useState<boolean>(false);
  const [isUnlockingPages, setIsUnlockingPages] = useState<boolean>(false);
  const [pendingUnlockAfterPayment, setPendingUnlockAfterPayment] = useState<boolean>(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState<boolean>(false);
  const [isPrintingPageOne, setIsPrintingPageOne] = useState<boolean>(false);
  const [activeViewerPageIndex, setActiveViewerPageIndex] = useState<number>(0);

  // Chat conversation state
  const [messages, setMessages] = useState<ChatMessageItem[]>(INITIAL_MESSAGES);
  const [inputMessage, setInputMessage] = useState<string>("");
  const [isChatting, setIsChatting] = useState<boolean>(false);
  const [isDiscussionDone, setIsDiscussionDone] = useState<boolean>(false);
  const [isEditingCharacterName, setIsEditingCharacterName] = useState<boolean>(false);

  // Proof, Page Plan & Cover lifecycle: tracks Page 1 proof -> Page 2..N Plan & Confirmation -> Full Interior Pages -> Front Book Cover
  const [hasProof, setHasProof] = useState<boolean>(false);
  const [isProofStale, setIsProofStale] = useState<boolean>(false);
  const [hasPlannedPages, setHasPlannedPages] = useState<boolean>(false);
  const [isPagePlanConfirmed, setIsPagePlanConfirmed] = useState<boolean>(false);
  const [hasFullBook, setHasFullBook] = useState<boolean>(false);
  const [hasCover, setHasCover] = useState<boolean>(false);
  const [coverPrompt, setCoverPrompt] = useState<string>("");
  const [coverColorScheme, setCoverColorScheme] = useState<BookCoverColorScheme>("midnight_glacier");
  const [lockedTitle, setLockedTitle] = useState<string | null>(null);

  // Live Channel3 companion products
  const [companionProducts, setCompanionProducts] = useState<CompanionProduct[]>([]);
  const [selectedCompanion, setSelectedCompanion] = useState<CompanionProduct | null>(null);

  // Confirmation state
  const [isConfirmed, setIsConfirmed] = useState<boolean>(true);
  const [isBookUnlocked, setIsBookUnlocked] = useState<boolean>(false);

  // Sync unlock status if previously purchased, and check for ?remix=<bookId> from Bookstore
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const remixId = params.get("remix");
      if (remixId) {
        const found = BOOKSTORE_CATALOG.find((b) => b.id === remixId);
        if (found) {
          const remixed = bookstoreItemToBookProject(found);
          setBook(remixed);
          setSelectedGenre(found.studioGenre);
          setPageCount(found.pageCount);
          setHasProof(true);
          setIsProofStale(false);
          setHasFullBook(true);
          setHasCover(true);
          setIsDiscussionDone(false);
          setMessages((prev) => {
            if (prev.some((m) => m.id.startsWith("msg_bookstore_remix_"))) return prev;
            return [
              ...prev,
              {
                id: `msg_bookstore_remix_${Date.now()}`,
                role: "assistant",
                content: `📚 **Loaded "${found.title}" from Bookstore & Vault!**\n\nAll ${found.pageCount} pages and the front cover are loaded in the preview below. Still in our same chat — tell me how you'd like to personalize the character, title, cover, or pages!`,
                quickReplies: [
                  "Personalize the cover title & author name",
                  "Change the main character to my child",
                  "Tweak Page 1 illustration",
                ],
                discussionStage: "cover_design",
                isReadyForProof: true,
              },
            ];
          });
        }
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("papertales_orders");
      if (stored) {
        const orders = JSON.parse(stored);
        if (orders.some((o: any) => o.bookId === book.id || o.bookTitle === book.title)) {
          setIsBookUnlocked(true);
        }
      }
    } catch {
      // ignore
    }
  }, [book.id, book.title]);

  // Reference photo / sketch upload
  const [referenceImageUrl, setReferenceImageUrl] = useState<string | null>(null);

  // Modals state
  const [tokenModalOpen, setTokenModalOpen] = useState<boolean>(false);
  const [orderModalOpen, setOrderModalOpen] = useState<boolean>(false);
  const [bookDetailsOpen, setBookDetailsOpen] = useState<boolean>(false);
  const [orderTrackingOpen, setOrderTrackingOpen] = useState<boolean>(false);
  const [bookLibraryOpen, setBookLibraryOpen] = useState<boolean>(false);

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
        if (!res.ok) return;
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) return;
        const data = await res.json();
        if (data && data.success && Array.isArray(data.products)) {
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
    if (hasProof && genreId !== selectedGenre) setIsProofStale(true);
    setSelectedGenre(genreId);
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

    const pickedTitle = trimmed.match(TITLE_PICK_PATTERN)?.[1]?.trim() || null;
    const effectiveLockedTitle = pickedTitle || lockedTitle;
    if (pickedTitle) setLockedTitle(pickedTitle);

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
          projectState: {
            title: book.title !== INITIAL_BOOK.title ? book.title : undefined,
            subtitle: book.subtitle,
            authorName: authorName || book.cover?.authorByline || undefined,
            genre: selectedGenre,
            pageCount,
            trimSize: book.format.trimSize,
            characterName: character.name || undefined,
            characterType: character.type || undefined,
            characterTraits: character.traits.length > 0 ? character.traits : undefined,
            pageStructure: pageStructure || undefined,
            showPageNumbers,
            prompt: hasProof || effectiveLockedTitle ? prompt : undefined,
            coverPrompt: coverPrompt || book.cover?.coverPrompt || undefined,
            coverColorScheme: coverColorScheme || book.cover?.colorScheme || undefined,
          },
          hasProof,
          hasPlannedPages,
          hasFullBook,
          hasCover,
          lockedTitle: effectiveLockedTitle,
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
          const draftTrim = TRIM_SIZES.includes(data.bookDraft.trimSize) ? data.bookDraft.trimSize : null;
          if (data.bookDraft.title || draftTrim || data.bookDraft.showPageNumbers !== undefined) {
            if (typeof data.bookDraft.showPageNumbers === "boolean") {
              setShowPageNumbers(data.bookDraft.showPageNumbers);
            }
            setBook((prev) => ({
              ...prev,
              title: data.bookDraft.title || prev.title,
              subtitle: data.bookDraft.subtitle || prev.subtitle,
              genre: data.bookDraft.genre || prev.genre,
              showPageNumbers:
                typeof data.bookDraft.showPageNumbers === "boolean"
                  ? data.bookDraft.showPageNumbers
                  : prev.showPageNumbers,
              format: draftTrim ? { ...prev.format, trimSize: draftTrim } : prev.format,
            }));
          }
          if (data.bookDraft.prompt) {
            setPrompt(data.bookDraft.prompt);
          }
          if (data.bookDraft.pageStructure) {
            setPageStructure(data.bookDraft.pageStructure);
          } else if (data.designBrief?.pageStructure) {
            setPageStructure(data.designBrief.pageStructure);
          }
          if (data.bookDraft.layoutType) {
            setLayoutType(data.bookDraft.layoutType);
          }
          if (data.bookDraft.borderText !== undefined) {
            setBorderText(data.bookDraft.borderText);
          }
          if (data.bookDraft.borderStyle) {
            setBorderStyle(data.bookDraft.borderStyle);
          }
          if (data.bookDraft.cornerDecorations) {
            setCornerDecorations(data.bookDraft.cornerDecorations);
          }
          if (data.bookDraft.lineRuleSpacing) {
            setLineRuleSpacing(data.bookDraft.lineRuleSpacing);
          }
          if (data.bookDraft.interiorColor) {
            setBook((prev) => ({
              ...prev,
              format: { ...prev.format, interiorColor: data.bookDraft.interiorColor! },
            }));
          }
          if (data.bookDraft.artStyle) {
            setArtStyle(data.bookDraft.artStyle);
            setBook((prev) => ({
              ...prev,
              artStyle: data.bookDraft.artStyle,
            }));
          }
          if (data.bookDraft.characterName !== undefined || data.bookDraft.characterType !== undefined) {
            setCharacter({
              name: data.bookDraft.characterName ?? "",
              type: data.bookDraft.characterType ?? "",
              traits: Array.isArray(data.bookDraft.characterTraits) ? data.bookDraft.characterTraits : [],
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

        // Synchronize coverDraft into cover state when designing or revising the cover
        if (data.coverDraft) {
          if (data.coverDraft.coverPrompt) {
            setCoverPrompt(data.coverDraft.coverPrompt);
          }
          if (data.coverDraft.colorScheme) {
            setCoverColorScheme(data.coverDraft.colorScheme);
          }
          if (data.coverDraft.authorByline) {
            setAuthorName(data.coverDraft.authorByline);
          }
          setBook((prev) => ({
            ...prev,
            title: data.coverDraft.title || prev.title,
            subtitle: data.coverDraft.subtitle || prev.subtitle,
            authorName: data.coverDraft.authorByline || prev.authorName,
            cover: {
              ...prev.cover,
              title: data.coverDraft.title || prev.cover?.title || prev.title,
              subtitle: data.coverDraft.subtitle || prev.cover?.subtitle || prev.subtitle,
              authorByline: data.coverDraft.authorByline || prev.cover?.authorByline || prev.authorName,
              coverPrompt: data.coverDraft.coverPrompt || prev.cover?.coverPrompt || coverPrompt,
              colorScheme: data.coverDraft.colorScheme || prev.cover?.colorScheme || coverColorScheme,
            },
          }));
        }

        if (data.lockedTitle) setLockedTitle(data.lockedTitle);
        if (hasProof && !hasFullBook && data.requiresNewProof) setIsProofStale(true);
        if (data.discussionStage === "page_planning" || data.discussionStage === "page_plan_confirmed") {
          setHasPlannedPages(true);
        }
        if (data.discussionStage === "page_plan_confirmed" || data.isPagePlanConfirmed) {
          setIsPagePlanConfirmed(true);
        }

        const assistantMsg: ChatMessageItem = {
          id: `msg_${Date.now() + 1}`,
          role: "assistant",
          content: data.reply,
          discussionStage: data.discussionStage || (hasFullBook ? "cover_design" : "designing"),
          isReadyForProof: Boolean(data.isReadyForProof),
          isPagePlanConfirmed: Boolean(data.isPagePlanConfirmed || data.discussionStage === "page_plan_confirmed"),
          requiresNewProof: Boolean(data.requiresNewProof),
          changes: Array.isArray(data.changes) ? data.changes : [],
          titleOptions: data.titleOptions || [],
          quickReplies: data.quickReplies || [],
          printAdvisory: data.printAdvisory,
          bookDraft: data.bookDraft
            ? {
                ...data.bookDraft,
                pageCount: data.bookDraft.pageCount || requestedPages,
              }
            : undefined,
          coverDraft: data.coverDraft || undefined,
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
      const effectiveTitle = book.title !== INITIAL_BOOK.title ? book.title : lockedTitle || "";
      const res = await fetch("/api/ai/story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: effectiveTitle,
          subtitle: book.subtitle !== INITIAL_BOOK.subtitle ? book.subtitle : "",
          prompt,
          pageStructure: pageStructure || undefined,
          layoutType,
          borderText: borderText || undefined,
          borderStyle,
          cornerDecorations,
          interiorColor: book.format.interiorColor,
          artStyle,
          lineRuleSpacing,
          showPageNumbers,
          authorName,
          targetAge,
          genre: selectedGenre,
          characterName: character.name,
          characterType: character.type,
          characterTraits: character.traits,
          referenceImageUrl: referenceImageUrl || undefined,
          pageCount: 1, // Single Hero Master Page
          trimSize: book.format.trimSize,
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await res.json();
      if (data.success && data.book) {
        setBook((prev) => ({
          ...data.book,
          title: data.book.title,
          cover: prev.cover,
          pageCount: 1,
        }));
        setIsConfirmed(false); // Hero proof ready for inspection
        setHasProof(true);
        setIsProofStale(false);
        setHasPlannedPages(false);
        setIsPagePlanConfirmed(false);
        setHasFullBook(false);
        setActiveViewerPageIndex(1); // Show Master Page 1 immediately

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

  // Stage 1.5: Transition into the same AI chat thread to co-plan & confirm Pages 2..N before generating
  const handleStartPagePlanning = () => {
    setIsDiscussionDone(false);
    handleSendMessage(
      `Page 1 proof looks great! Before we generate the remaining pages, let's plan what Pages 2 to ${pageCount} will have and look like so I can review and confirm.`
    );
  };

  // Stage 2: Expand to Full Spread (First 5 Pages 100% Free + Pages 6..N Blurred Preview until Unlocked)
  const handleExpandFullSpread = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/ai/story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: book.title,
          subtitle: book.subtitle,
          prompt,
          pageStructure: pageStructure || undefined,
          layoutType,
          borderText: borderText || undefined,
          borderStyle,
          cornerDecorations,
          interiorColor: book.format.interiorColor,
          artStyle,
          lineRuleSpacing,
          showPageNumbers,
          authorName,
          targetAge,
          genre: selectedGenre,
          characterName: character.name,
          characterType: character.type,
          characterTraits: character.traits,
          referenceImageUrl: referenceImageUrl || undefined,
          pageCount, // Full requested page count (e.g. 12 pages)
          freePagesLimit: isBookUnlocked ? pageCount : 5, // First 5 pages are 100% free; pages 6..N are locked/blurred
          existingPageOne: book.pages[0], // Keep approved Master Page 1 Proof intact
          trimSize: book.format.trimSize,
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await res.json();
      if (data.success && data.book) {
        setBook((prev) => ({
          ...data.book,
          cover: prev.cover,
        }));
        if (pageCount <= 5) {
          setIsBookUnlocked(true);
        }
        setIsConfirmed(true);
        setHasProof(true);
        setIsProofStale(false);
        setHasFullBook(true);
        setActiveViewerPageIndex(1);

        // Append a cover design & preview summary in the SAME continuous chat thread
        const generatedCount = data.book.pages?.length || pageCount;
        const lockedCount = Math.max(0, generatedCount - 5);
        const isJournalBook =
          data.book.format?.trimSize === "6x9" ||
          selectedGenre === "memory_book" ||
          Boolean(data.book.pages?.some((p: any) => p.journalData));

        const coverInviteMsg: ChatMessageItem = {
          id: `msg_cover_invite_${Date.now()}`,
          role: "assistant",
          content:
            lockedCount > 0 && !isBookUnlocked
              ? `🎉 **Your first 5 pages of "${data.book.title}" are generated for FREE!**\n\nPages 1–5 are ready to explore below, and Pages 6–${generatedCount} are shown in blurred preview mode (you can unlock them anytime right on the page).\n\nWould you also like to design your **Front Book Cover** right here in our chat?`
              : `🎉 All ${generatedCount} interior pages of "${data.book.title}" are now generated!\n\nNext step: let's design your **Front Book Cover** right here in our chat. How would you like your cover to look?`,
          discussionStage: "cover_design",
          quickReplies: isJournalBook
            ? [
                "Minimalist line-art emblem cover on warm cream paper",
                "Midnight glacier cover with bold title & tech border",
                "Vibrant storybook cover with custom author byline",
              ]
            : [
                character.name
                  ? `Vibrant hero cover starring ${character.name}`
                  : `Vibrant illustrated cover for "${data.book.title}"`,
                "Minimalist monochrome line-art cover ready to color",
                "Midnight glacier edition with golden starlight frame",
              ],
          coverDraft: {
            title: data.book.title,
            subtitle: data.book.subtitle,
            authorByline: authorName || data.book.authorName || null,
            coverPrompt: character.name
              ? `Book cover illustration for "${data.book.title}" featuring ${character.name} (${character.type}), ${artStyle || prompt}`
              : `Book cover illustration for "${data.book.title}", ${artStyle || prompt}`,
            colorScheme: "midnight_glacier",
            isReadyForCover: true,
          },
        };

        setMessages((prev) => [...prev, coverInviteMsg]);
        setIsDiscussionDone(true);

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

  // Unlock blurred pages 6..N once tokens are available or purchased via PayPal
  const executeUnlockRemainingPages = async (tokensToDeduct: number) => {
    setIsUnlockingPages(true);
    try {
      if (tokensToDeduct > 0) {
        deductClientTokens(tokensToDeduct);
      }
      const res = await fetch("/api/ai/story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: book.id,
          title: book.title,
          subtitle: book.subtitle,
          prompt,
          pageStructure: pageStructure || undefined,
          artStyle,
          interiorColor: book.format.interiorColor,
          showPageNumbers: book.showPageNumbers,
          authorName,
          targetAge,
          genre: selectedGenre,
          characterName: character.name,
          characterType: character.type,
          characterTraits: character.traits,
          trimSize: book.format.trimSize,
          unlockPagesOnly: true,
          existingPages: book.pages,
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      if (data.success && data.book) {
        setBook((prev) => ({
          ...prev,
          pages: data.book.pages,
        }));
      } else {
        setBook((prev) => ({
          ...prev,
          pages: prev.pages.map((p) => ({ ...p, isLocked: false })),
        }));
      }
      setIsBookUnlocked(true);
    } catch (err) {
      console.error("Failed to unlock remaining pages:", err);
      setBook((prev) => ({
        ...prev,
        pages: prev.pages.map((p) => ({ ...p, isLocked: false })),
      }));
      setIsBookUnlocked(true);
    } finally {
      setIsUnlockingPages(false);
      setPendingUnlockAfterPayment(false);
    }
  };

  const handleUnlockRemainingPages = () => {
    const lockedPagesCount = Math.max(0, book.pages.length - 5);
    const tokensNeeded = lockedPagesCount > 0 ? lockedPagesCount : quote.tokensRequired;
    const balance = getClientTokenBalance();
    if (balance < tokensNeeded) {
      setPendingUnlockAfterPayment(true);
      setTokenModalOpen(true);
      return;
    }
    executeUnlockRemainingPages(tokensNeeded);
  };

  // Auto-unlock remaining pages immediately after user buys tokens in TokenModal
  useEffect(() => {
    if (!pendingUnlockAfterPayment) return;
    const lockedPagesCount = Math.max(0, book.pages.length - 5);
    const tokensNeeded = lockedPagesCount > 0 ? lockedPagesCount : quote.tokensRequired;
    if (userTokens >= tokensNeeded && tokensNeeded > 0) {
      setTokenModalOpen(false);
      executeUnlockRemainingPages(tokensNeeded);
    }
  }, [userTokens, pendingUnlockAfterPayment]);

  // Stage 3: Design Front Book Cover using decisions from the same AI chat
  const handleDesignBookCover = async (overrideCoverDraft?: CoverDraftData) => {
    setIsGeneratingCover(true);
    try {
      const effectiveCoverTitle = overrideCoverDraft?.title || book.cover?.title || book.title;
      const effectiveCoverSubtitle = overrideCoverDraft?.subtitle || book.cover?.subtitle || book.subtitle;
      const effectiveCoverAuthor =
        overrideCoverDraft?.authorByline || book.cover?.authorByline || authorName || book.authorName;
      const effectiveScheme: BookCoverColorScheme =
        overrideCoverDraft?.colorScheme || book.cover?.colorScheme || coverColorScheme || "midnight_glacier";

      const rawCoverPrompt =
        overrideCoverDraft?.coverPrompt ||
        coverPrompt ||
        book.cover?.coverPrompt ||
        `Front book cover centerpiece artwork for "${effectiveCoverTitle}" — ${prompt || book.subtitle || "custom edition"}`;

      const isMonochromeCover =
        effectiveScheme === "minimal_monochrome" ||
        /\b(monochrome|black and white|line art|coloring cover)\b/i.test(rawCoverPrompt);

      const res = await fetch("/api/ai/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Front book cover centerpiece illustration (no text inside image), ${rawCoverPrompt}`,
          characterTraits: character.traits.join(", "),
          pageNumber: 0,
          artStyle: isMonochromeCover
            ? "Clean high-contrast black and white line art emblem, pure white background"
            : artStyle || "Playful, vibrant book cover illustration",
          interiorColor: isMonochromeCover ? "black_and_white" : "standard_color",
        }),
      });

      const data = await res.json();
      const generatedCoverUrl = data.success && data.imageUrl ? data.imageUrl : book.pages[0]?.imageUrl;

      const updatedCover: BookCoverDesign = {
        title: effectiveCoverTitle,
        subtitle: effectiveCoverSubtitle,
        authorByline: effectiveCoverAuthor,
        coverPrompt: rawCoverPrompt,
        artStyle: isMonochromeCover ? "Monochrome line-art cover" : artStyle,
        colorScheme: effectiveScheme,
        imageUrl: generatedCoverUrl,
        isDesigned: true,
      };

      setBook((prev) => ({
        ...prev,
        title: effectiveCoverTitle || prev.title,
        subtitle: effectiveCoverSubtitle || prev.subtitle,
        authorName: effectiveCoverAuthor || prev.authorName,
        cover: updatedCover,
      }));
      setHasCover(true);
      setActiveViewerPageIndex(0); // Flip BookViewer directly to the Front Cover (index 0)

      // Smooth scroll to the Book Display below so the user sees the new cover
      const displayEl = document.getElementById("book-display-section");
      if (displayEl) {
        displayEl.scrollIntoView({ behavior: "smooth" });
      }
    } catch (err) {
      console.error("Book cover generation failed:", err);
    } finally {
      setIsGeneratingCover(false);
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
    if (!isBookUnlocked) {
      setOrderModalOpen(true);
      return;
    }

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

  const handleCoverUpdate = (updatedCover: BookCoverDesign) => {
    setBook((prev) => ({
      ...prev,
      cover: updatedCover,
    }));
    setHasCover(Boolean(updatedCover.isDesigned));
    if (updatedCover.coverPrompt) setCoverPrompt(updatedCover.coverPrompt);
    if (updatedCover.colorScheme) setCoverColorScheme(updatedCover.colorScheme);
  };

  const handleDesignCoverInChat = () => {
    setIsDiscussionDone(false);
    // Only append the cover design prompt if the latest message isn't already the cover invite
    setMessages((prev) => {
      const last = prev[prev.length - 1];
      if (last && last.discussionStage === "cover_design") return prev;
      return [
        ...prev,
        {
          id: `msg_cover_focus_${Date.now()}`,
          role: "assistant",
          content: `🎨 **Let's design or refine the Front Book Cover for "${book.title}"!**\n\nStill in our same conversation — tell me what scene, colors, subtitle, or author byline you'd like on the cover, or pick an option below:`,
          quickReplies: [
            `Heroic cover of ${character.name} with "${book.title}"`,
            "Magical glowing night-sky cover with stars",
            "Warm storybook cover with author byline",
            "Generate Front Book Cover now",
          ],
          discussionStage: "cover_design",
          isReadyForProof: true,
        },
      ];
    });
    setTimeout(() => {
      const chatInput = document.querySelector("textarea") as HTMLTextAreaElement | null;
      if (chatInput) chatInput.focus();
    }, 100);
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
                  <Link
                    href="/bookstore"
                    className="text-[11px] font-bold px-3 py-1 rounded-full bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-400/40 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-sm"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-purple-300" />
                    <span>📚 Bookstore &amp; Vault</span>
                  </Link>
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
                    <span className="hidden sm:inline">My Orders</span>
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
                  /* Initial Clean Canvas: Consumer-grade inspiration starters */
                  <div className="flex-1 flex flex-col justify-center items-center py-6 px-2 sm:px-6 space-y-4">
                    <div className="text-center space-y-1">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-400/20 text-sky-300 text-[11px] font-medium">
                        <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                        <span>AI Book Co-Creation Studio</span>
                      </div>
                      <p className="text-xs text-slate-400 max-w-sm pt-1">
                        Pick an inspiration starter below or type any book idea into the chat:
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-lg">
                      <button
                        type="button"
                        onClick={() =>
                          handleSendMessage(
                            "Let's create Barnaby's Bakery Coloring Book: an 8.5x8.5 square coloring book about a cheerful little bear baking pastries"
                          )
                        }
                        disabled={isChatting}
                        className="p-3 rounded-xl border border-sky-400/25 bg-[#0c1c38]/70 hover:bg-[#11274e] hover:border-sky-400/60 text-left transition-all group cursor-pointer shadow-sm active:scale-98"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">🎨</span>
                          <span className="text-xs font-semibold text-slate-200 group-hover:text-white">
                            Barnaby&apos;s Bakery
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">8.5×8.5 Square Coloring Book</p>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleSendMessage(
                            "Create a Space Science Activity Book: full color 8.5x11 workbook exploring planets and fun space facts"
                          )
                        }
                        disabled={isChatting}
                        className="p-3 rounded-xl border border-sky-400/25 bg-[#0c1c38]/70 hover:bg-[#11274e] hover:border-sky-400/60 text-left transition-all group cursor-pointer shadow-sm active:scale-98"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">🚀</span>
                          <span className="text-xs font-semibold text-slate-200 group-hover:text-white">
                            Space Science Quest
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">8.5×11 Full Color Activity Book</p>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleSendMessage(
                            "Create a 15-Day Content Creation Journal: minimalist black & white 8.5x8.5 daily planner and prompt journal"
                          )
                        }
                        disabled={isChatting}
                        className="p-3 rounded-xl border border-sky-400/25 bg-[#0c1c38]/70 hover:bg-[#11274e] hover:border-sky-400/60 text-left transition-all group cursor-pointer shadow-sm active:scale-98"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">📔</span>
                          <span className="text-xs font-semibold text-slate-200 group-hover:text-white">
                            Content Creator Journal
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">8.5×8.5 Minimalist Prompt Journal</p>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSendMessage("hey papertales, what can you do")}
                        disabled={isChatting}
                        className="p-3 rounded-xl border border-sky-400/25 bg-[#0c1c38]/70 hover:bg-[#11274e] hover:border-sky-400/60 text-left transition-all group cursor-pointer shadow-sm active:scale-98"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">✨</span>
                          <span className="text-xs font-semibold text-slate-200 group-hover:text-white">
                            Ask Anything
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">&quot;Hey PaperTales, what can you do?&quot;</p>
                      </button>
                    </div>
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

                            {/* Applied edits (revision turns) */}
                            {!isUser && msg.changes && msg.changes.length > 0 && (
                              <div className="pt-2.5 border-t border-emerald-400/20 space-y-1.5">
                                <span className="text-[10px] uppercase font-bold text-emerald-300 tracking-wider flex items-center gap-1.5">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                  Changes Applied
                                </span>
                                <div className="flex flex-wrap gap-1.5">
                                  {msg.changes.map((c, cIdx) => (
                                    <span
                                      key={cIdx}
                                      className="text-[11px] px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-400/30 text-emerald-100"
                                    >
                                      <strong className="capitalize">{c.field}:</strong>{" "}
                                      {c.from ? <span className="line-through text-slate-400">{c.from}</span> : null}
                                      {c.from ? " → " : ""}
                                      {c.to}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Interactive Title Options Suggested by Copilot (latest reply only, until a title is locked) */}
                            {isLatestAssistant && msg.titleOptions && msg.titleOptions.length > 0 && (
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

                            {/* Stage-aware Action CTA on Latest Assistant Turn (Page 1 Proof -> Full Interior Expansion -> Book Cover Design) */}
                            {isLatestAssistant &&
                              (hasFullBook ||
                                msg.discussionStage === "cover_design" ||
                                Boolean(msg.coverDraft?.isReadyForCover) ||
                                msg.isReadyForProof ||
                                msg.requiresNewProof ||
                                hasProof) && (
                                <div className="pt-2.5 border-t border-sky-400/20 flex flex-wrap items-center justify-between gap-2 animate-in fade-in">
                                  {hasFullBook ||
                                  msg.discussionStage === "cover_design" ||
                                  Boolean(msg.coverDraft?.isReadyForCover) ? (
                                    <>
                                      <span className="text-[11px] text-sky-300 font-medium">
                                        {hasCover
                                          ? "✨ Cover updated in chat! Regenerate your Front Book Cover to see changes."
                                          : "🎨 Interior pages complete! Generate your Front Book Cover from our chat now."}
                                      </span>
                                      <div className="flex items-center gap-2">
                                        <button
                                          type="button"
                                          onClick={() => handleDesignBookCover(msg.coverDraft)}
                                          disabled={isGeneratingCover}
                                          className="px-3.5 py-1.5 rounded-xl bg-sky-400 text-slate-950 font-bold text-xs hover:bg-sky-300 transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 shadow disabled:opacity-50"
                                        >
                                          {isGeneratingCover ? (
                                            <>
                                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                              <span>Designing Book Cover...</span>
                                            </>
                                          ) : (
                                            <span>
                                              {hasCover
                                                ? "🎨 Regenerate Book Cover →"
                                                : "🎨 Generate Front Book Cover Now →"}
                                            </span>
                                          )}
                                        </button>
                                      </div>
                                    </>
                                  ) : hasProof && !msg.requiresNewProof && !isProofStale ? (
                                    msg.isPagePlanConfirmed || isPagePlanConfirmed ? (
                                      <>
                                        <span className="text-[11px] text-emerald-300 font-medium">
                                          ✅ Page plan confirmed! Generate your book now (First 5 pages 100% Free).
                                        </span>
                                        <div className="flex items-center gap-2">
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setIsDiscussionDone(true);
                                              handleExpandFullSpread();
                                            }}
                                            disabled={isGenerating}
                                            className="px-3.5 py-1.5 rounded-xl bg-sky-400 text-slate-950 font-bold text-xs hover:bg-sky-300 transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 shadow disabled:opacity-50"
                                          >
                                            {isGenerating ? (
                                              <>
                                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                                <span>Generating Pages (First 5 Free)...</span>
                                              </>
                                            ) : (
                                              <span>
                                                ✨ Confirm &amp; Generate ({pageCount} Pgs &bull; First 5 Free) →
                                              </span>
                                            )}
                                          </button>
                                        </div>
                                      </>
                                    ) : hasPlannedPages || msg.discussionStage === "page_planning" ? (
                                      <>
                                        <span className="text-[11px] text-sky-300 font-medium">
                                          📋 Review the page plan above — reply to customize any page, or confirm to generate:
                                        </span>
                                        <div className="flex items-center gap-2">
                                          <button
                                            type="button"
                                            onClick={() =>
                                              handleSendMessage(
                                                `I confirm this plan for all ${pageCount} pages! Let's generate the book.`
                                              )
                                            }
                                            disabled={isChatting || isGenerating}
                                            className="px-3.5 py-1.5 rounded-xl bg-emerald-400 text-slate-950 font-bold text-xs hover:bg-emerald-300 transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 shadow disabled:opacity-50"
                                          >
                                            <span>✅ Confirm Page Plan in Chat →</span>
                                          </button>
                                        </div>
                                      </>
                                    ) : (
                                      <>
                                        <span className="text-[11px] text-emerald-300 font-medium">
                                          ✨ Master Page 1 proof is ready! Let&apos;s plan what Pages 2–{pageCount} will have and look like.
                                        </span>
                                        <div className="flex items-center gap-2">
                                          <button
                                            type="button"
                                            onClick={handleStartPagePlanning}
                                            disabled={isChatting || isGenerating}
                                            className="px-3.5 py-1.5 rounded-xl bg-sky-400 text-slate-950 font-bold text-xs hover:bg-sky-300 transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 shadow disabled:opacity-50"
                                          >
                                            <span>✨ Looks Great! Plan Remaining ({pageCount}) Pages →</span>
                                          </button>
                                        </div>
                                      </>
                                    )
                                  ) : (
                                    <>
                                      <span className="text-[11px] text-sky-300 font-medium">
                                        {msg.requiresNewProof || isProofStale
                                          ? "✏️ Edits applied! Redesign your Master Page 1 proof to see them."
                                          : "✨ Concept ready! Design your free Master Page 1 proof now with OpenAI."}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setIsDiscussionDone(true);
                                          handleDesignHeroPage();
                                        }}
                                        disabled={isGenerating}
                                        className="px-3.5 py-1.5 rounded-xl bg-sky-400 text-slate-950 font-bold text-xs hover:bg-sky-300 transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 shadow disabled:opacity-50"
                                      >
                                        {isGenerating ? (
                                          <>
                                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                            <span>Designing Master Proof...</span>
                                          </>
                                        ) : (
                                          <span>
                                            {msg.requiresNewProof || isProofStale
                                              ? "🎨 Redesign Master Proof with Edits →"
                                              : "🎨 Design Master Page 1 Proof Now (Free) →"}
                                          </span>
                                        )}
                                      </button>
                                    </>
                                  )}
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
                  <Link
                    href="/bookstore"
                    className="text-[11px] font-bold px-3 py-1 rounded-full bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-400/40 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-sm"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-purple-300" />
                    <span>📚 Bookstore &amp; Vault</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => setOrderTrackingOpen(true)}
                    className="text-[11px] font-bold px-3 py-1 rounded-full glacier-glass hover:bg-slate-800 text-sky-200 border border-sky-400/40 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-sm"
                  >
                    <Package className="w-3.5 h-3.5 text-sky-400" />
                    <span>My Orders</span>
                  </button>
                  <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    {hasFullBook && hasCover
                      ? "Book & Cover Complete"
                      : hasFullBook
                      ? "Interior Complete • Ready for Cover"
                      : hasProof && !isProofStale
                      ? "Page 1 Proof Ready"
                      : "Ready for Master Proof"}
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
                        <strong className="text-white font-bold">
                          {character.name || "Custom Theme (No Fixed Protagonist)"}
                        </strong>
                        <button
                          type="button"
                          onClick={() => setIsEditingCharacterName(true)}
                          className="text-[10px] text-sky-400 hover:text-sky-300 underline font-semibold cursor-pointer"
                        >
                          {character.name ? "(Change Name)" : "(Add Protagonist Name)"}
                        </button>
                      </span>
                    )}
                    {character.type ? <span>({character.type})</span> : null}
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
                        onClick={() => {
                          if (hasProof && (book.format?.trimSize || "8.5x8.5") !== dim.id) setIsProofStale(true);
                          setBook((prev) => ({
                            ...prev,
                            format: { ...prev.format, trimSize: dim.id as any },
                          }));
                        }}
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

              {/* Dynamic Stage Recommendation Banner */}
              <div className="p-3 rounded-xl bg-[#0b1c30] border border-[#1a385c] flex items-start gap-2.5 text-xs text-sky-200">
                <Sparkles className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed text-slate-200">
                  {hasFullBook && !hasCover ? (
                    <>
                      <strong className="text-white">Final Step — Front Book Cover:</strong> All {book.pages.length} interior pages are ready! Now let&apos;s design your custom Front Book Cover using our same AI chat or generate it right below.
                    </>
                  ) : hasFullBook && hasCover ? (
                    <>
                      <strong className="text-emerald-300">Book &amp; Front Cover Complete:</strong> Your {book.pages.length}-page book and custom Front Cover are ready! Preview the spreads below, tweak any page or cover in chat, or export your 300 DPI PDF.
                    </>
                  ) : hasProof && !isProofStale ? (
                    isPagePlanConfirmed ? (
                      <>
                        <strong className="text-emerald-300">Page Plan Confirmed:</strong> Click below to generate your{" "}
                        {pageCount}-page book! Your <strong className="text-white">first 5 pages are 100% free</strong>,
                        and pages 6–{pageCount} will appear in a blurred preview ready to unlock anytime.
                      </>
                    ) : (
                      <>
                        <strong className="text-white">Master Page 1 Proof Ready:</strong> Check Page 1 below! Next,
                        let&apos;s plan &amp; confirm what Pages 2–{pageCount} will have and look like in our AI chat
                         before generating your first 5 free pages.
                      </>
                    )
                  ) : (
                    <>
                      <strong className="text-white">Designer Recommendation:</strong> Let&apos;s design your Master Page 1 Proof first for free to check layout and visual style before creating all {pageCount} pages.
                    </>
                  )}
                </p>
              </div>

              {/* Stale proof warning: edits from the discussion aren't in the current proof yet */}
              {hasProof && !hasFullBook && isProofStale && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-400/40 flex items-start gap-2.5 text-xs animate-in fade-in">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <p className="leading-relaxed text-amber-100">
                    <strong className="text-amber-200">Your recent edits aren&apos;t in this proof yet.</strong> Redesign
                    Master Page 1 to apply them before expanding the full book.
                  </p>
                </div>
              )}

              {/* Multi-Stage Primary CTA Buttons */}
              {hasFullBook && !hasCover ? (
                <div className="space-y-2.5 pt-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={handleDesignCoverInChat}
                      className="py-3 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border-2 border-sky-400/80 text-sky-200 font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
                    >
                      <MessageSquare className="w-4 h-4 text-sky-400" />
                      <span>💬 Customize Cover in Same AI Chat</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDesignBookCover()}
                      disabled={isGeneratingCover || isGenerating}
                      className="py-3 px-4 rounded-2xl bg-[#7dd3fc] hover:bg-[#a0e3ff] text-[#001f2e] font-black text-xs sm:text-sm shadow-xl flex items-center justify-center gap-2 transition-all hover:brightness-105 active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                      {isGeneratingCover ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-[#001f2e]" />
                          <span>Designing Front Cover...</span>
                        </>
                      ) : (
                        <>
                          <Palette className="w-4 h-4 text-[#001f2e]" />
                          <span>🎨 Generate Front Book Cover Now</span>
                        </>
                      )}
                    </button>
                  </div>

                  {pageCount !== book.pages.length && (
                    <div className="text-center">
                      <button
                        type="button"
                        onClick={handleExpandFullSpread}
                        disabled={isGenerating}
                        className="text-xs text-sky-300 hover:text-sky-200 underline font-semibold cursor-pointer"
                      >
                        ✨ Update Interior to {pageCount} Pages
                      </button>
                    </div>
                  )}
                </div>
              ) : hasFullBook && hasCover ? (
                <div className="space-y-2.5 pt-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={handleDesignCoverInChat}
                      className="py-3 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border-2 border-sky-400/80 text-sky-200 font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
                    >
                      <MessageSquare className="w-4 h-4 text-sky-400" />
                      <span>💬 Tweak Cover or Pages in AI Chat</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDesignBookCover()}
                      disabled={isGeneratingCover || isGenerating}
                      className="py-3 px-4 rounded-2xl bg-[#7dd3fc] hover:bg-[#a0e3ff] text-[#001f2e] font-black text-xs sm:text-sm shadow-xl flex items-center justify-center gap-2 transition-all hover:brightness-105 active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                      {isGeneratingCover ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-[#001f2e]" />
                          <span>Regenerating Front Cover...</span>
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-4 h-4 text-[#001f2e]" />
                          <span>🔄 Regenerate Front Book Cover</span>
                        </>
                      )}
                    </button>
                  </div>

                  {pageCount !== book.pages.length && (
                    <div className="text-center">
                      <button
                        type="button"
                        onClick={handleExpandFullSpread}
                        disabled={isGenerating}
                        className="text-xs text-sky-300 hover:text-sky-200 underline font-semibold cursor-pointer"
                      >
                        ✨ Expand / Update Interior ({pageCount} Pgs)
                      </button>
                    </div>
                  )}
                </div>
              ) : hasProof && !isProofStale ? (
                <div className="space-y-2.5 pt-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        setIsDiscussionDone(false);
                        const chatInput = document.querySelector("textarea") as HTMLTextAreaElement | null;
                        if (chatInput) {
                          chatInput.focus();
                        }
                      }}
                      className="py-3 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border-2 border-sky-400/80 text-sky-200 font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
                    >
                      <MessageSquare className="w-4 h-4 text-sky-400" />
                      <span>💬 Continue in Chat to Make Changes</span>
                    </button>

                    <button
                      type="button"
                      onClick={isPagePlanConfirmed ? handleExpandFullSpread : handleStartPagePlanning}
                      disabled={isGenerating || isChatting}
                      className="py-3 px-4 rounded-2xl bg-[#7dd3fc] hover:bg-[#a0e3ff] text-[#001f2e] font-black text-xs sm:text-sm shadow-xl flex items-center justify-center gap-2 transition-all hover:brightness-105 active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                      {isGenerating ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-[#001f2e]" />
                          <span>Generating Pages (First 5 Free)...</span>
                        </>
                      ) : isPagePlanConfirmed ? (
                        <>
                          <Sparkles className="w-4 h-4 text-[#001f2e]" />
                          <span>✨ Confirm &amp; Generate ({pageCount} Pgs &bull; First 5 Free)</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 text-[#001f2e]" />
                          <span>✨ Looks Great! Plan &amp; Expand ({pageCount} Pgs)</span>
                        </>
                      )}
                    </button>
                  </div>

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
                      <span>
                        {isProofStale
                          ? "🎨 Redesign Master Page 1 with Your Edits (Free)"
                          : "🎨 Design Master Page 1 First (Instant Free Preview)"}
                      </span>
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
              onCoverUpdate={handleCoverUpdate}
              onDesignCoverInChat={handleDesignCoverInChat}
              activePageIndex={activeViewerPageIndex}
              onPageIndexChange={setActiveViewerPageIndex}
              onDownloadPdf={handleDownloadFullPdf}
              onPrintFirstPage={handlePrintFirstPage}
              onOpenBookDetails={() => setBookDetailsOpen(true)}
              onOrderPhysical={() => setOrderModalOpen(true)}
              onOpenTokenModal={() => setTokenModalOpen(true)}
              onUnlockRemainingPages={handleUnlockRemainingPages}
              isUnlockingPages={isUnlockingPages}
              isDownloading={isDownloadingPdf || isPrintingPageOne}
              isConfirmed={hasProof}
              isBookUnlocked={isBookUnlocked}
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
          onOrderCompleted={() => {
            setIsBookUnlocked(true);
          }}
          onDownloadPdf={() => {
            setIsBookUnlocked(true);
            setTimeout(() => {
              handleDownloadFullPdf();
            }, 100);
          }}
        />

        <OrderTrackingGrid
          isOpen={orderTrackingOpen}
          onClose={() => setOrderTrackingOpen(false)}
        />

        <BookLibraryModal
          isOpen={bookLibraryOpen}
          onClose={() => setBookLibraryOpen(false)}
          onOpenTokenModal={() => {
            setBookLibraryOpen(false);
            setTokenModalOpen(true);
          }}
          onSelectBookForRemix={(remixedBook, remixCost) => {
            setBook(remixedBook);
            setHasProof(true);
            setIsProofStale(false);
            setHasFullBook(remixedBook.pages.length > 1);
            setHasCover(Boolean(remixedBook.cover?.isDesigned));
            setIsDiscussionDone(true);
            setPageCount(remixedBook.pages.length);
            // Append guidance message into the chat assistant
            setMessages((prev) => [
              ...prev,
              {
                id: `msg_remix_${Date.now()}`,
                role: "assistant",
                content: `✨ **Loaded "${remixedBook.title}" from the Book Library!** (${remixCost} Token applied).\n\nYou can now customize characters, adjust story scenes, or tweak any page layout. What would you like to personalize?`,
                quickReplies: [
                  "Change protagonist to my child",
                  "Make a fun tweak to Page 1",
                  "Keep the story and let's expand",
                ],
              },
            ]);
          }}
        />
      </div>
    </div>
  );
}
