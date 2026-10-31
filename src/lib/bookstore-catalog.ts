import { BookGenre, BookProject } from "@/types/book";

export type BookstoreShelfCategory =
  | "all"
  | "cozy_hygge"
  | "mystery_creative"
  | "kids_adventure"
  | "anime_sketch"
  | "puzzles_brain"
  | "storybooks";

export interface BookstoreBookItem {
  id: string;
  title: string;
  subtitle: string;
  author: string;
  category: Exclude<BookstoreShelfCategory, "all">;
  categoryLabel: string;
  studioGenre: BookGenre;
  targetAge: string;
  trimSize: "6x9" | "8.5x8.5" | "8.5x11";
  interiorColor: "black_and_white" | "standard_color";
  pageCount: number;
  rating: number;
  reviewCount: number;
  bestsellerBadge?: string;
  spineColor: string;
  description: string;
  highlights: string[];
  coverImage: string;
  samplePages: string[];
  /** Relative path inside C:\Lawrence\KDP SKETCH BOOK for streaming the full print-ready PDF */
  sourcePdfRelativePath?: string;
  /** Optional relative image paths if compiled on-the-fly from PNGs */
  sourceImageRelativePaths?: string[];
}

export const BOOKSTORE_SHELVES: Array<{
  id: BookstoreShelfCategory;
  label: string;
  emoji: string;
  count?: number;
}> = [
  { id: "all", label: "All Editions", emoji: "📚" },
  { id: "cozy_hygge", label: "Cozy & Hygge", emoji: "🧣" },
  { id: "mystery_creative", label: "Mystery & Creative", emoji: "🔍" },
  { id: "kids_adventure", label: "Kids & Adventure", emoji: "🦁" },
  { id: "anime_sketch", label: "Anime & Adult Sketch", emoji: "🎨" },
  { id: "puzzles_brain", label: "Puzzles & Brain Games", emoji: "🧩" },
  { id: "storybooks", label: "Illustrated Storybooks", emoji: "🌟" },
];

export const BOOKSTORE_CATALOG: BookstoreBookItem[] = [
  // ===========================================================================
  // 1. COZY & HYGGE COLLECTION
  // ===========================================================================
  {
    id: "cozy-christmas",
    title: "Cozy Christmas Moments",
    subtitle: "A Bold & Easy Coloring Book with 50 Cute Holiday Scenes, Sweet Treats & Winter Days",
    author: "PaperTales Cozy Nest Press",
    category: "cozy_hygge",
    categoryLabel: "Cozy & Hygge",
    studioGenre: "coloring_book",
    targetAge: "Teens & Adults",
    trimSize: "8.5x8.5",
    interiorColor: "black_and_white",
    pageCount: 50,
    rating: 4.9,
    reviewCount: 142,
    bestsellerBadge: "Holiday Bestseller",
    spineColor: "#991b1b",
    description:
      "Snuggle up with 50 bold and easy hygge holiday coloring scenes — from crackling cabin fireplaces and gingerbread bakeries to festive hot cocoa mugs and snowy village corners.",
    highlights: [
      "50 single-sided bold & easy holiday illustrations",
      "Thick, clean outlines ideal for alcohol markers & colored pencils",
      "Square 8.5\" × 8.5\" KDP & Lulu bookstore trim size",
    ],
    coverImage: "/bookstore/cozy-christmas/cover.jpg",
    samplePages: [
      "/bookstore/cozy-christmas/page_1.jpg",
      "/bookstore/cozy-christmas/page_2.jpg",
      "/bookstore/cozy-christmas/page_3.jpg",
      "/bookstore/cozy-christmas/page_4.jpg",
    ],
    sourcePdfRelativePath: "cozy christmas/Cozy_Christmas_Family_Moments_Interior_KDP_Standard.pdf",
  },
  {
    id: "cozy-girl-days",
    title: "Cozy Girl Days",
    subtitle: "A Bold & Easy Coloring Book of Aesthetic Daily Rituals, Slow Mornings & Self-Care",
    author: "PaperTales Cozy Nest Press",
    category: "cozy_hygge",
    categoryLabel: "Cozy & Hygge",
    studioGenre: "coloring_book",
    targetAge: "Teens & Adults",
    trimSize: "8.5x8.5",
    interiorColor: "black_and_white",
    pageCount: 50,
    rating: 4.9,
    reviewCount: 198,
    bestsellerBadge: "Top Rated",
    spineColor: "#be185d",
    description:
      "Celebrate slow mornings, matcha cafes, rainy bedroom reading, vinyl records, and peaceful evening bubble baths in 50 aesthetic bold-line coloring spreads.",
    highlights: [
      "50 aesthetic lifestyle & self-care scenes",
      "Zero-bleed layout designed for markers and gel pens",
      "Includes morning routines, boutique cafes & cozy apartments",
    ],
    coverImage: "/bookstore/cozy-girl-days/cover.jpg",
    samplePages: [
      "/bookstore/cozy-girl-days/page_1.jpg",
      "/bookstore/cozy-girl-days/page_2.jpg",
      "/bookstore/cozy-girl-days/page_3.jpg",
      "/bookstore/cozy-girl-days/page_4.jpg",
    ],
    sourcePdfRelativePath: "cozy girl/Cozy_Girl_Days_Interior_KDP_Standard.pdf",
  },
  {
    id: "little-snuggle-moments",
    title: "Little Snuggle Moments Vol. 1",
    subtitle: "50 Cute Animal Hygge Scenes — Barista Bears, Baker Bunnies & Rainy Day Reading",
    author: "PaperTales Studio",
    category: "cozy_hygge",
    categoryLabel: "Cozy & Hygge",
    studioGenre: "coloring_book",
    targetAge: "All Ages",
    trimSize: "8.5x8.5",
    interiorColor: "black_and_white",
    pageCount: 50,
    rating: 4.8,
    reviewCount: 116,
    bestsellerBadge: "Fan Favorite",
    spineColor: "#b45309",
    description:
      "Meet adorable animal friends enjoying everyday cozy moments: a barista bear pouring latte art, a baker bunny kneading dough, a sleepy sloth in a hammock, and a hedgehog tending a greenhouse.",
    highlights: [
      "50 wholesome cute animal characters in cozy settings",
      "Super-clean vector-style outlines for stress-free coloring",
      "Perfect gift for kids, teens, and cozy coloring fans",
    ],
    coverImage: "/bookstore/little-snuggle-moments/cover.jpg",
    samplePages: [
      "/bookstore/little-snuggle-moments/page_1.jpg",
      "/bookstore/little-snuggle-moments/page_2.jpg",
      "/bookstore/little-snuggle-moments/page_3.jpg",
      "/bookstore/little-snuggle-moments/page_4.jpg",
    ],
    sourcePdfRelativePath: "Cozy drawing book/Little_Snuggle_Moments_Interior_100Pages.pdf",
  },

  // ===========================================================================
  // 2. MYSTERY & CREATIVE DRAWING
  // ===========================================================================
  {
    id: "cozy-detective",
    title: "Cozy Detective: Search, Find & Color",
    subtitle: "A 2-in-1 Hidden Objects & Relaxing Mystery Activity Book with 5 Illustrated Cases",
    author: "PaperTales Mystery Lab",
    category: "mystery_creative",
    categoryLabel: "Mystery & Creative",
    studioGenre: "math_book",
    targetAge: "Ages 8 to Adult",
    trimSize: "8.5x8.5",
    interiorColor: "black_and_white",
    pageCount: 50,
    rating: 4.9,
    reviewCount: 89,
    bestsellerBadge: "2-in-1 Mystery",
    spineColor: "#1e3a8a",
    description:
      "Put on your detective hat! Inspect 5 thrilling illustrated mystery cases, spot hidden clues in every room, solve whodunit riddles, and color the cozy crime-scene illustrations.",
    highlights: [
      "5 complete multi-page detective cases with clue checklists",
      "Combines I-Spy hidden object puzzles with bold coloring art",
      "Great for road trips, rainy afternoons, and puzzle lovers",
    ],
    coverImage: "/bookstore/cozy-detective/cover.jpg",
    samplePages: [
      "/bookstore/cozy-detective/page_1.jpg",
      "/bookstore/cozy-detective/page_2.jpg",
      "/bookstore/cozy-detective/page_3.jpg",
      "/bookstore/cozy-detective/page_4.jpg",
    ],
    sourcePdfRelativePath: "cozy detective/Cozy_Detective_Interior_KDP_Standard.pdf",
  },
  {
    id: "this-is-not",
    title: "This Is Not a Box! Creative Doodle Book",
    subtitle: "Turn Everyday Shapes into Outrageous Inventions — An Anti-Coloring Imagination Prompt Book",
    author: "PaperTales Creative Lab",
    category: "mystery_creative",
    categoryLabel: "Mystery & Creative",
    studioGenre: "coloring_book",
    targetAge: "Ages 6–14",
    trimSize: "8.5x11",
    interiorColor: "black_and_white",
    pageCount: 35,
    rating: 4.8,
    reviewCount: 74,
    bestsellerBadge: " Imagination Spark",
    spineColor: "#6d28d9",
    description:
      "That's not a keyhole, an ice cream cone, or a cloud — it's whatever your imagination turns it into! Each page gives young creators a starter shape and a hilarious creative challenge.",
    highlights: [
      "35 open-ended visual drawing prompts that build lateral thinking",
      "Large 8.5\" × 11\" sketchpad pages with starter line art",
      "Inspires kids to draw their own comics, monsters & inventions",
    ],
    coverImage: "/bookstore/this-is-not/cover.jpg",
    samplePages: [
      "/bookstore/this-is-not/page_1.jpg",
      "/bookstore/this-is-not/page_2.jpg",
      "/bookstore/this-is-not/page_3.jpg",
      "/bookstore/this-is-not/page_4.jpg",
    ],
    sourcePdfRelativePath: "This is not/KDP_Interior_8.5x11.pdf",
  },

  // ===========================================================================
  // 3. KIDS & ADVENTURE COLORING
  // ===========================================================================
  {
    id: "alphabet-adventure",
    title: "My First Big Alphabet Adventure",
    subtitle: "A to Z Bold Letter Tracing & Joyful Animal Coloring Pages for Early Learners",
    author: "PaperTales Kids",
    category: "kids_adventure",
    categoryLabel: "Kids & Adventure",
    studioGenre: "coloring_book",
    targetAge: "Ages 3–7",
    trimSize: "8.5x11",
    interiorColor: "black_and_white",
    pageCount: 27,
    rating: 4.9,
    reviewCount: 164,
    bestsellerBadge: "Preschool Pick",
    spineColor: "#0284c7",
    description:
      "Master every letter from A to Z with giant friendly illustrations! Perfect for toddlers, preschoolers, and kindergartners learning phonics and fine motor control.",
    highlights: [
      "Full A–Z alphabet spreads with bold, kid-friendly outlines",
      "Extra-large 8.5\" × 11\" pages easy for jumbo crayons",
      "Builds early letter recognition and vocabulary",
    ],
    coverImage: "/bookstore/alphabet-adventure/cover.jpg",
    samplePages: [
      "/bookstore/alphabet-adventure/page_1.jpg",
      "/bookstore/alphabet-adventure/page_2.jpg",
      "/bookstore/alphabet-adventure/page_3.jpg",
      "/bookstore/alphabet-adventure/page_4.jpg",
    ],
    sourcePdfRelativePath: "Alphabets/My First Big Alphabet Adventure.pdf",
  },
  {
    id: "zoo-adventure",
    title: "My Zoo Adventure Coloring Book",
    subtitle: "30 Wild Safari & Zoo Animal Scenes — Lions, Elephants, Pandas & Playful Monkeys",
    author: "PaperTales Kids",
    category: "kids_adventure",
    categoryLabel: "Kids & Adventure",
    studioGenre: "coloring_book",
    targetAge: "Ages 4–9",
    trimSize: "8.5x11",
    interiorColor: "black_and_white",
    pageCount: 30,
    rating: 4.8,
    reviewCount: 93,
    spineColor: "#15803d",
    description:
      "Take a thrilling safari through the zoo! Color 30 cheerful wildlife habitats featuring roaring lions, gentle giraffes, bamboo-munching pandas, and splashing hippos.",
    highlights: [
      "30 full-page zoo and safari animal illustrations",
      "Crisp black-and-white line art on 8.5\" × 11\" sheets",
      "Ideal birthday gift or classroom activity book",
    ],
    coverImage: "/bookstore/zoo-adventure/cover.jpg",
    samplePages: [
      "/bookstore/zoo-adventure/page_1.jpg",
      "/bookstore/zoo-adventure/page_2.jpg",
      "/bookstore/zoo-adventure/page_3.jpg",
      "/bookstore/zoo-adventure/page_4.jpg",
    ],
    sourcePdfRelativePath: "Zoo/MY ZOO ADVENTURE COLORING BOOK.pdf",
  },
  {
    id: "pirate-adventure",
    title: "Pirate & High Seas Adventure Coloring Book",
    subtitle: "25 Swashbuckling Treasure Maps, Galleon Ships, Krakens & Island Quests",
    author: "PaperTales Adventure Press",
    category: "kids_adventure",
    categoryLabel: "Kids & Adventure",
    studioGenre: "coloring_book",
    targetAge: "Ages 5–11",
    trimSize: "8.5x11",
    interiorColor: "black_and_white",
    pageCount: 25,
    rating: 4.7,
    reviewCount: 68,
    spineColor: "#0f766e",
    description:
      "Hoist the sails and set course for Treasure Island! Packed with 25 detailed pirate captains, hidden coves, compass roses, and legendary sea monsters.",
    highlights: [
      "25 action-packed pirate & ocean adventure scenes",
      "Includes intermediate shading details for older kids",
      "Print-ready 8.5\" × 11\" full-page illustrations",
    ],
    coverImage: "/bookstore/pirate-adventure/cover.jpg",
    samplePages: [
      "/bookstore/pirate-adventure/page_1.jpg",
      "/bookstore/pirate-adventure/page_2.jpg",
      "/bookstore/pirate-adventure/page_3.jpg",
      "/bookstore/pirate-adventure/page_4.jpg",
    ],
    sourcePdfRelativePath: "Pirates/Pirate Adventure Coloring Book.pdf",
  },

  // ===========================================================================
  // 4. ANIME & ADULT SKETCH / SHADING
  // ===========================================================================
  {
    id: "advance-shading",
    title: "Advance Shading & Coloring for Adults",
    subtitle: "30 Intricate Fine-Art Grayscale & Line-Art Studies for Mastering Light & Depth",
    author: "PaperTales Fine Art Studio",
    category: "anime_sketch",
    categoryLabel: "Anime & Adult Sketch",
    studioGenre: "coloring_book",
    targetAge: "Teens & Adults",
    trimSize: "8.5x11",
    interiorColor: "black_and_white",
    pageCount: 30,
    rating: 4.9,
    reviewCount: 108,
    bestsellerBadge: "Artist Edition",
    spineColor: "#334155",
    description:
      "Elevate your shading and blending technique with 30 expressive botanical, architectural, and portrait line-art studies crafted specifically for colored pencils and fine liners.",
    highlights: [
      "30 intermediate-to-advanced shading & crosshatch studies",
      "Designed for prismacolor pencils, graphite, and ink wash",
      "Full 8.5\" × 11\" studio artbook dimensions",
    ],
    coverImage: "/bookstore/advance-shading/cover.jpg",
    samplePages: [
      "/bookstore/advance-shading/page_1.jpg",
      "/bookstore/advance-shading/page_2.jpg",
      "/bookstore/advance-shading/page_3.jpg",
      "/bookstore/advance-shading/page_4.jpg",
    ],
    sourcePdfRelativePath: "Advance coloring book/Advance Coloring and shading.pdf",
  },
  {
    id: "jjk-sketchbook",
    title: "Sorcerer Chronicles: JJK Anime Sketch Book",
    subtitle: "50 Dynamic Manga Line-Art & Character Sketch Studies for Coloring & Inking",
    author: "PaperTales Manga Workshop",
    category: "anime_sketch",
    categoryLabel: "Anime & Adult Sketch",
    studioGenre: "coloring_book",
    targetAge: "Teens & Adults",
    trimSize: "8.5x11",
    interiorColor: "black_and_white",
    pageCount: 50,
    rating: 4.9,
    reviewCount: 215,
    bestsellerBadge: "Manga Fan Pick",
    spineColor: "#4c1d95",
    description:
      "50 high-contrast manga ink illustrations featuring iconic sorcerer poses, domain expansion scenes, and dynamic character line work cleaned at 300 DPI for alcohol markers.",
    highlights: [
      "50 cleaned 300 DPI manga sketch & coloring pages",
      "Dynamic action poses and detailed character portraits",
      "Full 8.5\" × 11\" collector edition layout",
    ],
    coverImage: "/bookstore/jjk-sketchbook/cover.jpg",
    samplePages: [
      "/bookstore/jjk-sketchbook/page_1.jpg",
      "/bookstore/jjk-sketchbook/page_2.jpg",
      "/bookstore/jjk-sketchbook/page_3.jpg",
      "/bookstore/jjk-sketchbook/page_4.jpg",
    ],
    sourcePdfRelativePath: "JJK/JJK Manuscript (50 Pages) - USE IN KDP.pdf",
  },
  {
    id: "one-piece-sketchbook",
    title: "Grand Line Legends: Straw Hat Sketch Book",
    subtitle: "25 Iconic Pirate Crew & Ship Line-Art Illustrations for Manga Artists & Fans",
    author: "PaperTales Manga Workshop",
    category: "anime_sketch",
    categoryLabel: "Anime & Adult Sketch",
    studioGenre: "coloring_book",
    targetAge: "Teens & Adults",
    trimSize: "8.5x11",
    interiorColor: "black_and_white",
    pageCount: 25,
    rating: 4.9,
    reviewCount: 176,
    bestsellerBadge: "Anime Collector",
    spineColor: "#b91c1c",
    description:
      "Set sail across the Grand Line with 25 crisp manga line-art portraits of legendary captains, swordsmen, ships, and emperors ready for your custom color palette.",
    highlights: [
      "25 full-page manga character & pirate ship illustrations",
      "Crisp black ink outlines for markers, watercolors, or pencils",
      "8.5\" × 11\" artbook format",
    ],
    coverImage: "/bookstore/one-piece-sketchbook/cover.jpg",
    samplePages: [
      "/bookstore/one-piece-sketchbook/page_1.jpg",
      "/bookstore/one-piece-sketchbook/page_2.jpg",
      "/bookstore/one-piece-sketchbook/page_3.jpg",
      "/bookstore/one-piece-sketchbook/page_4.jpg",
    ],
    sourcePdfRelativePath: "One piece sketch book/One Piece - Straw Hat Pirates.pdf",
  },
  {
    id: "kpop-sketch-collection",
    title: "K-Pop Idol Portrait Sketch Collection",
    subtitle: "Stylized Stage & Fashion Line-Art Portraits for Coloring & Shading Practice",
    author: "PaperTales Pop Studio",
    category: "anime_sketch",
    categoryLabel: "Anime & Adult Sketch",
    studioGenre: "coloring_book",
    targetAge: "Teens & Adults",
    trimSize: "8.5x11",
    interiorColor: "black_and_white",
    pageCount: 14,
    rating: 4.8,
    reviewCount: 61,
    spineColor: "#db2777",
    description:
      "Practice hair rendering, fashion textures, and portrait shading with this curated collection of K-Pop stage and editorial line-art sketches.",
    highlights: [
      "Detailed portrait & fashion line-art studies",
      "Great for practicing skin tones, hair highlights & fabric",
      "Instant 300 DPI digital PDF & softcover print edition",
    ],
    coverImage: "/bookstore/kpop-sketch-collection/cover.jpg",
    samplePages: [
      "/bookstore/kpop-sketch-collection/page_1.jpg",
      "/bookstore/kpop-sketch-collection/page_2.jpg",
      "/bookstore/kpop-sketch-collection/page_3.jpg",
      "/bookstore/kpop-sketch-collection/page_4.jpg",
    ],
    sourceImageRelativePaths: [
      "KPOP/Jennie 1.png",
      "KPOP/Jennie 2.png",
      "KPOP/Jennie 3.png",
      "KPOP/Jennie 4.png",
      "KPOP/Jennie 5.png",
      "KPOP/Jennie 6.png",
      "KPOP/Jennie 7.png",
    ],
  },

  // ===========================================================================
  // 5. PUZZLES, BRAIN GAMES & LOGBOOKS
  // ===========================================================================
  {
    id: "sudoku-120",
    title: "120 Very Hard Sudoku Puzzles",
    subtitle: "Master-Level Logic Grids with Complete Step-by-Step Solutions for Brain Training",
    author: "PaperTales Puzzle Guild",
    category: "puzzles_brain",
    categoryLabel: "Puzzles & Brain Games",
    studioGenre: "math_book",
    targetAge: "Teens & Adults",
    trimSize: "8.5x11",
    interiorColor: "black_and_white",
    pageCount: 60,
    rating: 4.8,
    reviewCount: 112,
    bestsellerBadge: "Brain Trainer",
    spineColor: "#0369a1",
    description:
      "Put your deductive reasoning to the ultimate test with 120 challenging Sudoku grids printed in a clean, wide-margin layout with full answer keys included at the back.",
    highlights: [
      "120 master-level Sudoku puzzles with full solutions",
      "Large, easy-to-read typography with generous pencil margins",
      "8.5\" × 11\" lay-flat workbook format",
    ],
    coverImage: "/bookstore/sudoku-120/cover.jpg",
    samplePages: [
      "/bookstore/sudoku-120/page_1.jpg",
      "/bookstore/sudoku-120/page_2.jpg",
      "/bookstore/sudoku-120/page_3.jpg",
      "/bookstore/sudoku-120/page_4.jpg",
    ],
    sourcePdfRelativePath: "sudoko puzzel/120_VERY_HARD_SUDOKU_PUZZELS.pdf",
  },
  {
    id: "wordsearch-102",
    title: "102 Hard Word Search Puzzles",
    subtitle: "Themed Vocabulary Challenges & Complete Solution Keys for Hours of Screen-Free Fun",
    author: "PaperTales Puzzle Guild",
    category: "puzzles_brain",
    categoryLabel: "Puzzles & Brain Games",
    studioGenre: "math_book",
    targetAge: "Ages 10 to Adult",
    trimSize: "8.5x11",
    interiorColor: "black_and_white",
    pageCount: 60,
    rating: 4.9,
    reviewCount: 134,
    spineColor: "#4338ca",
    description:
      "Sharpen your pattern recognition and vocabulary across 102 multi-directional word search grids covering science, travel, nature, history, and pop culture.",
    highlights: [
      "102 themed word search grids + complete solution section",
      "High-contrast large-print letters reduce eye strain",
      "Ideal travel companion or gift for puzzle enthusiasts",
    ],
    coverImage: "/bookstore/wordsearch-102/cover.jpg",
    samplePages: [
      "/bookstore/wordsearch-102/page_1.jpg",
      "/bookstore/wordsearch-102/page_2.jpg",
      "/bookstore/wordsearch-102/page_3.jpg",
      "/bookstore/wordsearch-102/page_4.jpg",
    ],
    sourcePdfRelativePath: "wordsearch/102_HARD_WORD_SEARCH_PUZZLES.pdf",
  },
  {
    id: "science-quiz",
    title: "Ultimate Science Quiz Challenge",
    subtitle: "Ordered STEM Trivia Questions by Difficulty — Physics, Space, Biology & Earth Science",
    author: "PaperTales STEM Press",
    category: "puzzles_brain",
    categoryLabel: "Puzzles & Brain Games",
    studioGenre: "science_book",
    targetAge: "Ages 8–16",
    trimSize: "8.5x11",
    interiorColor: "black_and_white",
    pageCount: 28,
    rating: 4.8,
    reviewCount: 57,
    spineColor: "#0d9488",
    description:
      "Test your scientific curiosity from Easy warm-ups to Olympiad-style brainteasers! Covers the solar system, human anatomy, chemistry reactions, and everyday physics.",
    highlights: [
      "Structured progression from Beginner to Advanced STEM trivia",
      "Great for family game nights, classrooms, and young scientists",
      "Includes answer key and fascinating science explanations",
    ],
    coverImage: "/bookstore/science-quiz/cover.jpg",
    samplePages: [
      "/bookstore/science-quiz/page_1.jpg",
      "/bookstore/science-quiz/page_2.jpg",
      "/bookstore/science-quiz/page_3.jpg",
      "/bookstore/science-quiz/page_4.jpg",
    ],
    sourcePdfRelativePath: "science_quiz_with_difficulty.pdf",
  },
  {
    id: "health-logbook",
    title: "365-Day Personal Health & Wellness Logbook",
    subtitle: "1-Year Structured Daily Tracker for Vitals, Nutrition, Sleep, Hydration & Fitness",
    author: "PaperTales Wellness Press",
    category: "puzzles_brain",
    categoryLabel: "Puzzles & Brain Games",
    studioGenre: "memory_book",
    targetAge: "Adults",
    trimSize: "8.5x11",
    interiorColor: "black_and_white",
    pageCount: 60,
    rating: 4.9,
    reviewCount: 82,
    spineColor: "#047857",
    description:
      "Stay consistent with your health goals all year long. Features clean, structured daily and weekly tracking tables for blood pressure, sleep quality, water intake, habits, and reflections.",
    highlights: [
      "Full 1-year structured health, habit & wellness logging templates",
      "Spacious 8.5\" × 11\" layout for easy daily writing",
      "Clean minimalist typography with progress summary pages",
    ],
    coverImage: "/bookstore/health-logbook/cover.jpg",
    samplePages: [
      "/bookstore/health-logbook/page_1.jpg",
      "/bookstore/health-logbook/page_2.jpg",
      "/bookstore/health-logbook/page_3.jpg",
      "/bookstore/health-logbook/page_4.jpg",
    ],
    sourcePdfRelativePath: "health_logbook_8.5x11_1year.pdf",
  },

  // ===========================================================================
  // 6. ILLUSTRATED STORYBOOKS
  // ===========================================================================
  {
    id: "lilys-cosmic-playground",
    title: "Lily's Cosmic Playground",
    subtitle: "An Illustrated Bedtime Journey Through Starlight Slides, Nebula Swings & Moonbeams",
    author: "PaperTales Storybook Press",
    category: "storybooks",
    categoryLabel: "Illustrated Storybooks",
    studioGenre: "science_book",
    targetAge: "Ages 4–9",
    trimSize: "8.5x8.5",
    interiorColor: "standard_color",
    pageCount: 24,
    rating: 5.0,
    reviewCount: 128,
    bestsellerBadge: "Illustrated Keepsake",
    spineColor: "#7e22ce",
    description:
      "When the stars blink awake, Lily blasts off to a magical playground among the constellations — sliding down Saturn's rings and playing hide-and-seek behind glowing comets.",
    highlights: [
      "Full-bleed illustrated bedtime storybook",
      "Inspires wonder about space, friendship, and big dreams",
      "Available as instant digital PDF or full-color keepsake softcover",
    ],
    coverImage: "/bookstore/lilys-cosmic-playground/cover.jpg",
    samplePages: [
      "/bookstore/lilys-cosmic-playground/page_1.jpg",
      "/bookstore/lilys-cosmic-playground/page_2.jpg",
      "/bookstore/lilys-cosmic-playground/page_3.jpg",
      "/bookstore/lilys-cosmic-playground/page_4.jpg",
    ],
    sourcePdfRelativePath: "Lily's Cosmic Playground story book.pdf",
  },
  {
    id: "nimbus-explorer-cloud",
    title: "Nimbus the Explorer Cloud",
    subtitle: "A Heartwarming Illustrated Tale of a Little Cloud Discovering Rainbows & Weather",
    author: "PaperTales Storybook Press",
    category: "storybooks",
    categoryLabel: "Illustrated Storybooks",
    studioGenre: "science_book",
    targetAge: "Ages 3–8",
    trimSize: "8.5x8.5",
    interiorColor: "standard_color",
    pageCount: 24,
    rating: 4.9,
    reviewCount: 104,
    bestsellerBadge: "Staff Pick",
    spineColor: "#0284c7",
    description:
      "Float across mountain peaks and sunlit oceans with Nimbus, a curious little cumulus cloud who learns how gentle rain helps gardens bloom and paints vibrant rainbows.",
    highlights: [
      "Richly illustrated story blending gentle science with bedtime warmth",
      "Square 8.5\" × 8.5\" picture book format",
      "Ready for instant digital reading or physical Lulu print delivery",
    ],
    coverImage: "/bookstore/nimbus-explorer-cloud/cover.jpg",
    samplePages: [
      "/bookstore/nimbus-explorer-cloud/page_1.jpg",
      "/bookstore/nimbus-explorer-cloud/page_2.jpg",
      "/bookstore/nimbus-explorer-cloud/page_3.jpg",
      "/bookstore/nimbus-explorer-cloud/page_4.jpg",
    ],
    sourcePdfRelativePath: "Nimbus the Explorer Cloud.pdf",
  },
];

/**
 * Converts a BookstoreBookItem into a BookProject compatible with OrderSummaryModal,
 * Lulu POD cost estimator, and the AI Co-Creation Studio.
 */
export function bookstoreItemToBookProject(item: BookstoreBookItem): BookProject {
  return {
    id: `bookstore_${item.id}`,
    title: item.title,
    subtitle: item.subtitle,
    authorName: item.author,
    genre: item.studioGenre,
    targetAge: item.targetAge,
    character: {
      name: item.title.split(" ")[0] || "Explorer",
      type: item.categoryLabel,
      traits: item.highlights.slice(0, 2),
    },
    pageCount: item.pageCount,
    cover: {
      title: item.title,
      subtitle: item.subtitle,
      authorByline: item.author,
      coverPrompt: item.description,
      colorScheme: "midnight_glacier",
      imageUrl: item.coverImage,
      isDesigned: true,
    },
    pages: item.samplePages.map((imgUrl, idx) => ({
      pageNumber: idx + 1,
      title: `${item.title} — Page ${idx + 1}`,
      storyText: item.description,
      imagePrompt: item.subtitle,
      imageUrl: imgUrl,
    })),
    format: {
      trimSize: item.trimSize,
      interiorColor: item.interiorColor,
      binding: item.pageCount > 32 ? "perfect_bound" : "saddle_stitch",
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
