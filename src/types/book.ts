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

export interface BookPage {
  pageNumber: number;
  title: string;
  storyText: string;
  imagePrompt: string;
  imageUrl?: string; // High-contrast monochrome vector line art
  svgData?: string;
  isCover?: boolean;
  journalData?: JournalPageData;
}

export interface BookProject {
  id: string;
  title: string;
  subtitle?: string;
  authorName: string;
  genre: "coloring_book" | "storybook" | "memory_book" | "activity_book" | "math_book" | "science_book";
  targetAge: string;
  character: CharacterAnchor;
  referenceImageUrl?: string;
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
