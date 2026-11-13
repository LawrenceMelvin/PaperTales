export interface CharacterAnchor {
  name: string;
  type: string; // e.g. "Golden Retriever Puppy", "Little Girl with Curly Hair"
  traits: string[]; // e.g. ["Blue astronaut helmet", "Red collar", "Star badge"]
  colorPalette?: string;
}

export interface JournalSection {
  title: string; // e.g. "I will do", "What I did", "Morning Focus"
  prompt?: string; // e.g. "What key tasks or coding goals will you tackle?"
  linesCount?: number; // e.g. 7 or 8 lines
  placeholder?: string; // e.g. "write what you plan to accomplish..."
}

export type JournalLayoutType = "empty_lined" | "guided_sections" | "classic_prompt";
export type JournalBorderStyle = "robotic" | "modern" | "playful" | "none";
export type JournalCornerDecorations = "tech_brackets" | "gears" | "minimal" | "none";
export type JournalLineSpacing = "wide" | "college";

export interface JournalPageData {
  dayNumber: number;
  datePlaceholder?: string;
  headerCategory?: string; // e.g. "Daily Action & Retrospective", "Coding Sprint Log"
  moodTracker?: boolean;
  quote?: string;
  reflectionPrompt?: string;
  gratitudePrompts?: string[];
  doodlePrompt?: string;
  ruledLinesCount?: number;
  sections?: JournalSection[]; // Dynamic multiple sections (e.g. Upper "I will do" / Lower "What I did")
  layoutType?: JournalLayoutType;
  borderText?: string; // e.g. "coding----coding"
  borderStyle?: JournalBorderStyle; // e.g. "robotic"
  cornerDecorations?: JournalCornerDecorations; // e.g. "tech_brackets"
  lineRuleSpacing?: JournalLineSpacing; // e.g. "college"
  hasIllustration?: boolean;
  illustrationPrompt?: string;
  illustrationPlacement?: "bottom_right" | "top_right";
}

export type BookCoverColorScheme =
  | "midnight_black"
  | "midnight_glacier"
  | "warm_cream"
  | "storybook_vibrant"
  | "minimal_monochrome";

export interface BookCoverDesign {
  title?: string;
  subtitle?: string;
  authorByline?: string;
  coverPrompt?: string;
  frontCoverDesign?: string;
  backCoverDesign?: string;
  backCoverText?: string;
  artStyle?: string;
  colorScheme?: BookCoverColorScheme;
  imageUrl?: string;
  isDesigned?: boolean;
}

export interface BookPage {
  pageNumber: number;
  title: string;
  storyText: string;
  imagePrompt: string;
  imageUrl?: string; // High-contrast monochrome vector line art
  svgData?: string;
  isCover?: boolean;
  isLocked?: boolean; // True when page > 5 is blurred/locked awaiting token or PayPal unlock
  journalData?: JournalPageData;
}

export type BookGenre =
  | "coloring_book"
  | "storybook"
  | "memory_book"
  | "activity_book"
  | "math_book"
  | "science_book";

export interface BookProject {
  id: string;
  title: string;
  subtitle?: string;
  authorName: string;
  genre: BookGenre;
  targetAge: string;
  character: CharacterAnchor;
  referenceImageUrl?: string;
  artStyle?: string;
  pageStructure?: string;
  showPageNumbers?: boolean;
  singleSidedColoring?: boolean;
  cover?: BookCoverDesign;
  pages: BookPage[];
  pageCount: number;
  format: {
    trimSize: "8.5x8.5" | "6x9" | "8.5x11";
    binding: "saddle_stitch" | "perfect_bound";
    interiorColor: "black_and_white" | "standard_color";
  };
  createdAt: string;
  updatedAt: string;
}

export interface EditingPageReference {
  pageIndex: number; // 0 = Cover, 1..N = Page 1..N
  pageNumber?: number; // 0 for cover, 1..N for interior pages
  title?: string;
  storyText?: string;
  imagePrompt?: string;
  imageUrl?: string;
  isCover?: boolean;
}

