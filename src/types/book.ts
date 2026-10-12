export interface CharacterAnchor {
  name: string;
  type: string; // e.g. "Golden Retriever Puppy", "Little Girl with Curly Hair"
  traits: string[]; // e.g. ["Blue astronaut helmet", "Red collar", "Star badge"]
  colorPalette?: string;
}

export interface BookPage {
  pageNumber: number;
  title: string;
  storyText: string;
  imagePrompt: string;
  imageUrl?: string; // High-contrast monochrome vector line art
  svgData?: string;
  isCover?: boolean;
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
    trimSize: "8.5x8.5" | "8.5x11";
    binding: "saddle_stitch" | "perfect_bound";
    interiorColor: "black_and_white" | "standard_color";
  };
  createdAt: string;
  updatedAt: string;
}
