import { BookProject } from "@/types/book";

export interface InspectionCheck {
  id: string;
  category: "art_style" | "trim_size" | "page_structure" | "title_character";
  label: string;
  passed: boolean;
  expected: string;
  actual: string;
}

export interface MatchInspectionResult {
  passed: boolean;
  score: number;
  totalChecks: number;
  checks: InspectionCheck[];
}

export interface ConversationTestScenario {
  id: string;
  name: string;
  icon: string;
  badge: string;
  description: string;
  brief: {
    title: string;
    genre: "coloring_book" | "storybook" | "memory_book" | "activity_book" | "math_book" | "science_book";
    trimSize: "8.5x8.5" | "6x9" | "8.5x11";
    interiorColor: "standard_color" | "black_and_white";
    artStyle: string;
    pageStructure: string;
    pageCount: number;
    character: {
      name: string;
      type: string;
      traits: string[];
    };
  };
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  expectedMatches: {
    expectedTitle: string;
    expectedLayoutType?: "empty_lined" | "guided_sections" | "classic_prompt";
    expectedColorMode: "standard_color" | "black_and_white";
    expectedImagePromptKeywords: string[];
    forbiddenImagePromptKeywords?: string[];
    expectedTrimSize: string;
  };
}

export const CONVERSATION_TEST_SCENARIOS: ConversationTestScenario[] = [
  {
    id: "science_space_color",
    name: "Space Science Activity Book",
    icon: "🚀",
    badge: "Full Color • 8.5x11 Workbook",
    description: "Alternating space activities and planetary discovery facts with vibrant colorful illustrations.",
    brief: {
      title: "Blast Off! Space Fun Activity Book",
      genre: "science_book",
      trimSize: "8.5x11",
      interiorColor: "standard_color",
      artStyle: "Playful, colorful illustrations",
      pageStructure: "Alternating activity and fact pages",
      pageCount: 2,
      character: {
        name: "Nova",
        type: "Astronaut Explorer",
        traits: ["Space helmet", "Star map notebook", "Explorer boots"],
      },
    },
    messages: [
      {
        role: "user",
        content: "I want to create a science activity book for my niece who loves space with colorful playful illustrations.",
      },
      {
        role: "assistant",
        content:
          "What an inspiring project! We can craft an engaging space exploration activity book. For the format, alternating between interactive activities and fascinating planetary facts works wonderfully. Would you prefer full-color digital illustrations sized in 8.5x11 workbook format?",
      },
      {
        role: "user",
        content: "Yes, full color illustrations, 8.5x11 workbook size, and alternating activity and fact pages.",
      },
      {
        role: "assistant",
        content:
          "Understood! We'll anchor the book with an astronaut guide named Nova. What title would you like for this keepsake?",
      },
      {
        role: "user",
        content: 'I pick the title: "Blast Off! Space Fun Activity Book"',
      },
      {
        role: "assistant",
        content:
          'Excellent! Here is your locked brief: Title: "Blast Off! Space Fun Activity Book", Genre: Science Activity Book, Trim: 8.5x11, Interior: Standard Color, Art Style: Playful, colorful illustrations, Structure: Alternating activity and fact pages.',
      },
      {
        role: "user",
        content: "Looks perfect, let's design page 1",
      },
    ],
    expectedMatches: {
      expectedTitle: "Blast Off! Space Fun Activity Book",
      expectedColorMode: "standard_color",
      expectedTrimSize: "8.5x11",
      expectedImagePromptKeywords: ["color", "vibrant", "illustration"],
      forbiddenImagePromptKeywords: ["strictly black and white line art ready for coloring with crayons"],
    },
  },
  {
    id: "journal_content_creation",
    name: "15-Day Content Creation Journal",
    icon: "📔",
    badge: "B&W • 8.5x8.5 Square Minimalist",
    description: "Daily habit-building journal with mostly empty lined writing pages and crisp spot illustrations.",
    brief: {
      title: "15 Days of Content Creation",
      genre: "memory_book",
      trimSize: "8.5x8.5",
      interiorColor: "black_and_white",
      artStyle: "Minimalist black and white spot illustrations",
      pageStructure: "Mostly empty lined pages for free writing with small spot illustration",
      pageCount: 15,
      character: {
        name: "Creator",
        type: "Content Creator",
        traits: ["Notebook", "Camera icon"],
      },
    },
    messages: [
      {
        role: "user",
        content: "I want to create a 15 day journal, for learning content creation",
      },
      {
        role: "assistant",
        content:
          "Great idea! A 15-day journal for learning content creation could help users build habits and track their progress. Who is this journal for? Would you prefer a clean modern look, or something more playful and creative?",
      },
      {
        role: "user",
        content: "for a beginner and I prefer clean modern look",
      },
      {
        role: "assistant",
        content:
          "It is! For the interior, we'll use ruled lines with a modern minimalist border on each page. Just to confirm, do you want the journal sized at 8.5x8.5 inches (a popular square format), or do you prefer something more traditional like 6x9? And is black & white interior okay, or would you like a touch of color?",
      },
      {
        role: "user",
        content: "mostly empty lined pages for free writing, I want to have some little illustration",
      },
      {
        role: "assistant",
        content:
          "Noted! We will focus on mostly empty lined pages for free writing, with a few small, tasteful illustrations. Would you like a different illustration for each day?",
      },
      {
        role: "user",
        content: "yes for each day different illustration and trim size is square",
      },
      {
        role: "assistant",
        content:
          "Great! Would you like illustrations related to content creation tools (like cameras, notebooks, microphones)? What title?",
      },
      {
        role: "user",
        content: 'I pick the title: "15 Days of Content Creation"',
      },
      {
        role: "assistant",
        content: "Nice choice! Do you want black and white illustrations and the same layout?",
      },
      {
        role: "user",
        content: "back and white, and yes I want to follow the same layout",
      },
    ],
    expectedMatches: {
      expectedTitle: "15 Days of Content Creation",
      expectedColorMode: "black_and_white",
      expectedTrimSize: "8.5x8.5",
      expectedLayoutType: "empty_lined",
      expectedImagePromptKeywords: ["line art", "black and white"],
    },
  },
  {
    id: "coloring_barnaby_puppy",
    name: "Barnaby's Bakery Coloring Book",
    icon: "🎨",
    badge: "Vector Line Art • 8.5x8.5 Square",
    description: "Classic bedtime coloring adventure with bold vector outlines ready for crayons and markers.",
    brief: {
      title: "Barnaby Bakes a Cake",
      genre: "coloring_book",
      trimSize: "8.5x8.5",
      interiorColor: "black_and_white",
      artStyle: "Thick continuous bold black outlines, coloring book style",
      pageStructure: "Full-page coloring adventure spreads",
      pageCount: 5,
      character: {
        name: "Barnaby",
        type: "Golden Retriever Puppy",
        traits: ["Cozy red scarf", "Floppy ears", "Baker chef hat"],
      },
    },
    messages: [
      {
        role: "user",
        content: "Let's make a coloring book about Barnaby the puppy baking giant treats at an enchanted bakery.",
      },
      {
        role: "assistant",
        content:
          "Barnaby's bakery adventure will make an adorable coloring book! We will design thick continuous bold black outlines ready for crayons on 8.5x8.5 square pages. What title would you like?",
      },
      {
        role: "user",
        content: 'I pick the title: "Barnaby Bakes a Cake"',
      },
      {
        role: "assistant",
        content:
          "Brief locked! We have Barnaby the Golden Retriever Puppy with a chef hat, 8.5x8.5 square coloring format, and bold outlines. Ready for Page 1?",
      },
      {
        role: "user",
        content: "Yes, design page 1!",
      },
    ],
    expectedMatches: {
      expectedTitle: "Barnaby Bakes a Cake",
      expectedColorMode: "black_and_white",
      expectedTrimSize: "8.5x8.5",
      expectedImagePromptKeywords: ["coloring", "outlines", "black", "line art"],
    },
  },
  {
    id: "math_logic_quest",
    name: "Pixel Fox's Math & Logic Quest",
    icon: "🧮",
    badge: "Riddles & Counting • 8.5x11 Letter",
    description: "Interactive STEM counting quest with geometric keys, bridges, and number challenges.",
    brief: {
      title: "Pixel the Fox and the Number Castle",
      genre: "math_book",
      trimSize: "8.5x11",
      interiorColor: "black_and_white",
      artStyle: "Clean geometric line art with numbers to trace and count",
      pageStructure: "Numbered counting quests and shape puzzles",
      pageCount: 5,
      character: {
        name: "Pixel",
        type: "Clever Fox",
        traits: ["Round spectacles", "Explorer satchel", "Magic number chalk"],
      },
    },
    messages: [
      {
        role: "user",
        content: "I want an interactive math and counting activity book for my 6 year old featuring Pixel the Fox.",
      },
      {
        role: "assistant",
        content:
          "A math adventure with Pixel the Fox is wonderful! We can build counting quests, Number Castle challenges, and geometric shape puzzles sized at 8.5x11 letter format. What title do you like?",
      },
      {
        role: "user",
        content: 'I pick the title: "Pixel the Fox and the Number Castle"',
      },
      {
        role: "assistant",
        content:
          'Title locked: "Pixel the Fox and the Number Castle". Clean line art with counting elements in 8.5x11 workbook size.',
      },
      {
        role: "user",
        content: "Looks great, let's design page 1 proof.",
      },
    ],
    expectedMatches: {
      expectedTitle: "Pixel the Fox and the Number Castle",
      expectedColorMode: "black_and_white",
      expectedTrimSize: "8.5x11",
      expectedImagePromptKeywords: ["Pixel"],
    },
  },
  {
    id: "memory_family_heirloom",
    name: "Sunny Cove Family Keepsake",
    icon: "🏖️",
    badge: "Nostalgic Keepsake • 6x9 Trade",
    description: "Precious family holiday milestones, beach memories, and heartfelt narrative storytelling.",
    brief: {
      title: "Sunny Cove: Our Summer of Wonders",
      genre: "memory_book",
      trimSize: "6x9",
      interiorColor: "standard_color",
      artStyle: "Soft watercolor digital painting, warm lighting",
      pageStructure: "Narrative memory chapters with illustrated vignettes",
      pageCount: 6,
      character: {
        name: "Leo",
        type: "Beach Explorer",
        traits: ["Straw sunhat", "Seashell bucket", "Bright smile"],
      },
    },
    messages: [
      {
        role: "user",
        content: "I want to preserve our summer holiday at Sunny Cove as a printed family keepsake book.",
      },
      {
        role: "assistant",
        content:
          "Memories of family vacations make timeless keepsakes. A 6x9 trade format feels like a classic bound memoir, with soft watercolor illustrations celebrating beach sandcastles and dolphin watching. Shall we use full color in 6x9 size?",
      },
      {
        role: "user",
        content: "Yes, full color watercolor illustrations, 6x9 trade size.",
      },
      {
        role: "user",
        content: 'I pick the title: "Sunny Cove: Our Summer of Wonders"',
      },
      {
        role: "assistant",
        content:
          'Locked: "Sunny Cove: Our Summer of Wonders", 6x9 Trade format, standard color interior with Leo the Beach Explorer.',
      },
      {
        role: "user",
        content: "Let's generate the first chapter proof.",
      },
    ],
    expectedMatches: {
      expectedTitle: "Sunny Cove: Our Summer of Wonders",
      expectedColorMode: "standard_color",
      expectedTrimSize: "6x9",
      expectedImagePromptKeywords: ["color", "illustration"],
      forbiddenImagePromptKeywords: ["strictly black and white line art ready for coloring with crayons"],
    },
  },
];

/**
 * Validates a generated BookProject against a ConversationTestScenario
 */
export function verifyDraftMatchesScenario(
  book: BookProject,
  scenario: ConversationTestScenario
): MatchInspectionResult {
  const checks: InspectionCheck[] = [];
  const expected = scenario.expectedMatches;
  const p1 = book.pages[0];

  // 1. Title Check
  const titleMatches =
    book.title.trim().toLowerCase() === expected.expectedTitle.trim().toLowerCase();
  checks.push({
    id: "title_match",
    category: "title_character",
    label: "Book Title",
    passed: titleMatches,
    expected: expected.expectedTitle,
    actual: book.title,
  });

  // 2. Character Name Check
  const charMatches =
    book.character.name.trim().toLowerCase() === scenario.brief.character.name.trim().toLowerCase();
  checks.push({
    id: "character_match",
    category: "title_character",
    label: "Character Anchor",
    passed: charMatches,
    expected: `${scenario.brief.character.name} (${scenario.brief.character.type})`,
    actual: `${book.character.name} (${book.character.type})`,
  });

  // 3. Trim Size Check
  const actualTrim = book.format?.trimSize || "8.5x8.5";
  const trimMatches = actualTrim === expected.expectedTrimSize;
  checks.push({
    id: "trim_size_match",
    category: "trim_size",
    label: "Trim Size",
    passed: trimMatches,
    expected: expected.expectedTrimSize,
    actual: actualTrim,
  });

  // 4. Color Mode Check
  const actualColor = book.format?.interiorColor || "black_and_white";
  const colorMatches = actualColor === expected.expectedColorMode;
  checks.push({
    id: "color_mode_match",
    category: "art_style",
    label: "Interior Color Mode",
    passed: colorMatches,
    expected: expected.expectedColorMode === "standard_color" ? "Standard Color (Full Color)" : "Black & White",
    actual: actualColor === "standard_color" ? "Standard Color (Full Color)" : "Black & White",
  });

  // 5. Image Prompt Keywords Check (ensures visual prompt aligns with requested style)
  const imagePrompt = (p1?.imagePrompt || "").toLowerCase();
  const hasRequiredKeywords =
    expected.expectedImagePromptKeywords.length === 0 ||
    expected.expectedImagePromptKeywords.some((kw) => imagePrompt.includes(kw.toLowerCase()));
  const hasForbiddenKeywords =
    expected.forbiddenImagePromptKeywords &&
    expected.forbiddenImagePromptKeywords.some((kw) => imagePrompt.includes(kw.toLowerCase()));

  const promptPassed = hasRequiredKeywords && !hasForbiddenKeywords;
  checks.push({
    id: "image_prompt_match",
    category: "art_style",
    label: "Page 1 Illustration Prompt",
    passed: Boolean(promptPassed),
    expected: `Contains: [${expected.expectedImagePromptKeywords.join(", ")}]${
      expected.forbiddenImagePromptKeywords ? ` | Lacks: [${expected.forbiddenImagePromptKeywords.join(", ")}]` : ""
    }`,
    actual: p1?.imagePrompt
      ? p1.imagePrompt.slice(0, 120) + (p1.imagePrompt.length > 120 ? "..." : "")
      : "No image prompt generated",
  });

  // 6. Page Layout / Structure Check (for journals or activity books)
  if (expected.expectedLayoutType) {
    const actualLayout = p1?.journalData?.layoutType;
    const layoutMatches = actualLayout === expected.expectedLayoutType;
    checks.push({
      id: "layout_type_match",
      category: "page_structure",
      label: "Journal Interior Layout",
      passed: layoutMatches,
      expected: expected.expectedLayoutType,
      actual: actualLayout || "standard_story",
    });
  }

  const passedCount = checks.filter((c) => c.passed).length;
  const allPassed = passedCount === checks.length;

  return {
    passed: allPassed,
    score: passedCount,
    totalChecks: checks.length,
    checks,
  };
}
