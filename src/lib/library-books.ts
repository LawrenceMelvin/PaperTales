import { BookProject } from "@/types/book";

export interface LibraryBookItem {
  id: string;
  title: string;
  subtitle: string;
  genre: "coloring_book" | "memory_book" | "math_book" | "science_book" | "activity_book" | "storybook";
  genreLabel: string;
  targetAge: string;
  coverImage?: string;
  description: string;
  pageCount: number;
  remixCostTokens: number;
  previewPages: Array<{
    pageNumber: number;
    title: string;
    storyText: string;
    imagePrompt: string;
  }>;
}

export const PRE_DESIGNED_LIBRARY: LibraryBookItem[] = [
  {
    id: "lib-space-odyssey",
    title: "Blast Off! Space Fun Activity Book",
    subtitle: "Alternating Cosmic Activities & Fascinating Planetary Facts",
    genre: "science_book",
    genreLabel: "Science Explorer",
    targetAge: "5-10",
    description: "Journey through the solar system with solar mazes, astronaut trivia, rocket coloring, and rover facts.",
    pageCount: 20,
    remixCostTokens: 1,
    previewPages: [
      {
        pageNumber: 1,
        title: "Countdown to Launch",
        storyText: "3... 2... 1... BLAST OFF! Your rocket clears Earth's atmosphere. Did you know astronauts experience zero gravity within just 8 minutes of launch?",
        imagePrompt: "Clean vector coloring line art: Sleek Saturn V rocket soaring into starry orbit, friendly astronaut waving from window.",
      },
      {
        pageNumber: 2,
        title: "Astronaut Gear Check (Spot the Difference)",
        storyText: "Can you spot the 5 differences between Commander Luna's helmet and her backup spacesuit gear? Space suits have 14 layers to protect against extreme heat and cold!",
        imagePrompt: "Clean vector coloring line art: Two side-by-side astronaut suits with minor fun differences like badge shapes and tool pockets.",
      },
      {
        pageNumber: 3,
        title: "The Red Planet Rover Maze",
        storyText: "Help the Mars Rover navigate through Olympus Mons crater to find the hidden ice cave! Mars has the tallest volcano in the entire Solar System.",
        imagePrompt: "Clean vector coloring line art: Mars rover rover navigating a twisty red rock maze on Mars surface.",
      },
    ],
  },
  {
    id: "lib-ice-cream-pup",
    title: "Barnaby's Ice Cream Adventure",
    subtitle: "A Whimsical Story & Coloring Journey Down Sunny Boulevard",
    genre: "coloring_book",
    genreLabel: "Coloring Book",
    targetAge: "3-7",
    description: "Follow Barnaby the Golden Retriever Puppy as he visits the Sweet Dream Ice Cream Parlor to bake giant waffle cones.",
    pageCount: 12,
    remixCostTokens: 1,
    previewPages: [
      {
        pageNumber: 1,
        title: "The Ice Cream Discovery",
        storyText: "Barnaby the Golden Retriever Puppy skipped down Sunny Boulevard! Today he visited the famous Sweet Dream Ice Cream Parlor to craft the world's tallest waffle cone.",
        imagePrompt: "Clean vector coloring line art: Barnaby pup wearing a chef hat, carrying a tall 5-scoop ice cream cone with crosshatch waffle texture.",
      },
      {
        pageNumber: 2,
        title: "Across the Greenwood Bridge",
        storyText: "With cheerful paws, Barnaby crossed a charming stone bridge over a babbling stream while two friendly frogs smiled from lily pads.",
        imagePrompt: "Clean vector coloring line art: Barnaby crossing a rustic arched bridge over rippling water.",
      },
      {
        pageNumber: 3,
        title: "Professor Hoot's Compass",
        storyText: "High in a giant oak tree, Professor Hoot flapped his magnificent wings and gifted Barnaby an enchanted star compass.",
        imagePrompt: "Clean vector coloring line art: A wise giant owl perching on a hollow tree holding a star compass.",
      },
    ],
  },
  {
    id: "lib-dino-detectives",
    title: "Dino Detectives: Prehistoric Math Quest",
    subtitle: "Solve Jurassic Puzzles, Count Fossil Clues & Color Giants",
    genre: "math_book",
    genreLabel: "Math & Logic Quest",
    targetAge: "6-9",
    description: "Join Detective Rex as you solve footprint counting riddles, secret fossil addition codes, and prehistoric mysteries.",
    pageCount: 16,
    remixCostTokens: 1,
    previewPages: [
      {
        pageNumber: 1,
        title: "The Mystery of the Giant Footprints",
        storyText: "Detective Rex arrived at Fern Valley! He counted 3 sets of giant triceratops tracks and 2 pterodactyl prints. How many prints in total?",
        imagePrompt: "Clean vector coloring line art: Cute detective T-Rex holding a magnifying glass inspecting muddy 3-toed footprints.",
      },
      {
        pageNumber: 2,
        title: "Fossil Dig Site Code",
        storyText: "Uncover the hidden amber crystals! Add up the numbers hidden on each rock stratum to unlock the secret paleontologist chest.",
        imagePrompt: "Clean vector coloring line art: Cross-section of a fossil dig site with ammonites, numbered rocks, and pickaxes.",
      },
    ],
  },
  {
    id: "lib-underwater-kingdom",
    title: "Marina's Coral Reef Keepsake Journal",
    subtitle: "Family Memories, Ocean Notes & Whimsical Watercolor Scenes",
    genre: "memory_book",
    genreLabel: "Family Keepsake",
    targetAge: "All Ages",
    description: "An ocean-inspired keepsake journal for jotting down childhood memories, family vacation moments, and sea creature observations.",
    pageCount: 24,
    remixCostTokens: 1,
    previewPages: [
      {
        pageNumber: 1,
        title: "Welcome to the Sunlit Shallows",
        storyText: "Gentle turquoise ripples dance over the coral garden. Write down your favorite memory from our summer seaside journey here.",
        imagePrompt: "Whimsical pastel coloring line art: Playful sea turtles and clownfish swimming around a vibrant coral reef.",
      },
    ],
  },
];
