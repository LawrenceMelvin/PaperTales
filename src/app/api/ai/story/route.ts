import { NextRequest, NextResponse } from "next/server";
import { BookPage, BookProject, CharacterAnchor } from "@/types/book";

interface ChapterTemplate {
  title: string;
  story: (name: string, type: string) => string;
  scene: (name: string, type: string) => string;
}

const GENRE_CHAPTER_TEMPLATES: Record<string, ChapterTemplate[]> = {
  coloring_book: [
    {
      title: "The Big Morning Discovery",
      story: (name, type) => `${name} the ${type} woke up with excitement! Today was the day to explore the Enchanted Whispering Woods.`,
      scene: (name, type) => `${name} packing a tiny explorer backpack next to a sunny bedroom window with playful butterflies.`,
    },
    {
      title: "Into the Greenwood Path",
      story: (name, type) => `With cheerful paws, ${name} trotted down the winding stone path bordered by singing bluebells.`,
      scene: (name, type) => `${name} crossing a charming wooden bridge over a babbling brook with friendly frogs watching.`,
    },
    {
      title: "The Gentle Giant Owl",
      story: (name, type) => `High in an ancient oak tree, Professor Hoot flapped his grand feathered wings and offered a magic brass compass.`,
      scene: (name, type) => `${name} looking up at a wise giant owl perched on a twisted tree branch holding a glowing star map.`,
    },
    {
      title: "The Secret Crystal Meadow",
      story: (name, type) => `The compass guided ${name} to a hidden clearing where giant crystal blossoms hummed like musical wind chimes.`,
      scene: (name, type) => `${name} happily sniffing sparkling giant geometric flower petals surrounded by dancing fireflies.`,
    },
    {
      title: "A Shared Picnic with Friends",
      story: (name, type) => `Soon, woodland bunnies and gentle hedgehogs joined for a merry feast of sweet honey biscuits.`,
      scene: (name, type) => `${name} sitting on a checkered picnic blanket sharing sweet treats with two tiny rabbits under a mushroom cap.`,
    },
    {
      title: "Sweet Dreams Under Starlight",
      story: (name, type) => `As twilight painted the sky with silver stars, ${name} curled up warmly, dreaming of tomorrow's new grand adventure.`,
      scene: (name, type) => `${name} fast asleep on a cloud of soft clover under a smiling crescent moon and constellation stars.`,
    },
  ],
  memory_book: [
    {
      title: "The Day We First Welcomed You",
      story: (name, type) => `From the moment you entered our lives, ${name} the sweet ${type}, every corner of our home filled with pure joy and laughter.`,
      scene: (name, type) => `${name} arriving in a cozy doorway surrounded by loving family hands, welcome ribbons, and squeaky toys.`,
    },
    {
      title: "Little Steps & Big Discoveries",
      story: (name, type) => `Do you remember when ${name} took those first wobbly steps? Every leaf in the backyard was an incredible treasure!`,
      scene: (name, type) => `${name} exploring the green garden lawn, playfully chasing a floating autumn dandelion leaf.`,
    },
    {
      title: "Sunny Days at the Beach",
      story: (name, type) => `Golden sunshine, crashing salty waves, and sandy paws. We built sandcastles together and raced the incoming tide until sunset.`,
      scene: (name, type) => `${name} happily splashing in shallow ocean waves beside a towering sandcastle with seashell flags.`,
    },
    {
      title: "The Kitchen Baking Adventure",
      story: (name, type) => `Flour was on our noses and batter was on our aprons! ${name} kept loyal watch as delicious holiday treats baked in the warm oven.`,
      scene: (name, type) => `${name} sitting beside a rustic kitchen counter with bowls, cookie cutters, and cheerful flour footprints.`,
    },
    {
      title: "The Grand Birthday Surprise",
      story: (name, type) => `Party hats, singing loved ones, and the biggest celebration! We blew out the candles and made a wish for a lifetime of hugs.`,
      scene: (name, type) => `${name} wearing a celebratory party hat in front of a layered birthday cake with glowing candles and balloons.`,
    },
    {
      title: "Treasured Forever in Our Hearts",
      story: (name, type) => `No matter how many seasons pass, every memory of ${name} is etched in gold within our family's storybook lane.`,
      scene: (name, type) => `${name} nestled warmly on a plush armchair surrounded by framed family photos and cozy heart quilts.`,
    },
  ],
  math_book: [
    {
      title: "The 3 Golden Keys to Number Castle",
      story: (name, type) => `${name} stood before Number Castle. The door had 3 locks! Can you count the 3 golden keys hanging on the wall? (1... 2... 3!)`,
      scene: (name, type) => `${name} standing before a whimsical castle gate with 3 distinctly numbered giant keys (1, 2, 3) to count and color.`,
    },
    {
      title: "Crossing the 5 Stepping Stones",
      story: (name, type) => `To cross the whispering river, ${name} must hop across 5 geometric stones: Circle, Triangle, Square, Pentagon, and Star!`,
      scene: (name, type) => `${name} hopping on 5 numbered floating geometric stepping stones over a calm river with water lilies.`,
    },
    {
      title: "Counting 8 Starlight Crystals",
      story: (name, type) => `Inside the cavern, ${name} discovered crystal stalactites. "Look! 4 purple crystals + 4 blue crystals = 8 radiant gems in total!"`,
      scene: (name, type) => `${name} pointing a flashlight at 8 sparkling crystal clusters grouped in sets of four on a rocky cave ceiling.`,
    },
    {
      title: "The Clock Tower Pattern Riddle",
      story: (name, type) => `Tick-tock! The clock showed 3 o'clock, then 6 o'clock, then 9 o'clock. Can ${name} figure out what comes next? It's 12!`,
      scene: (name, type) => `${name} looking up at a cheerful giant steampunk clock face with gears and Roman numerals to trace and color.`,
    },
    {
      title: "The 10 Balloon Sky Bridge",
      story: (name, type) => `Up into the sky! ${name} counted 10 helium balloons. If 2 balloons are yellow and 8 are blue, how many balloons carry us?`,
      scene: (name, type) => `${name} floating gently in a basket held by 10 numbered round balloons floating through fluffy cartoon clouds.`,
    },
    {
      title: "The Math Quest Champion Ribbon",
      story: (name, type) => `You did it! ${name} solved every puzzle with sharp logic and counting mastery. You are an official Math Explorer Champion!`,
      scene: (name, type) => `${name} standing proudly on a 1st place podium holding a giant number ribbon and graduation medal.`,
    },
  ],
  science_book: [
    {
      title: "Blast Off: Leaving Earth's Atmosphere",
      story: (name, type) => `3... 2... 1... Liftoff! ${name} soared through Earth's troposphere into outer space, where gravity drops to zero!`,
      scene: (name, type) => `${name} in an astronaut space suit peering out a rocket shuttle window watching planet Earth curve below.`,
    },
    {
      title: "The Rings of Giant Saturn",
      story: (name, type) => `Whizzing through the solar system, ${name} marvelled at Saturn. Did you know its rings are made of billions of chunks of ice and rock?`,
      scene: (name, type) => `${name} waving from a spacecraft near giant ringed planet Saturn with shooting stars and craters.`,
    },
    {
      title: "Deep Sea Bioluminescence",
      story: (name, type) => `Diving deep into the twilight ocean trenches, ${name} met jellyfish and anglerfish that produce their own natural glowing light!`,
      scene: (name, type) => `${name} in a yellow submersible sub witnessing glowing jellyfish, sea turtles, and coral reefs.`,
    },
    {
      title: "Photosynthesis: How Plants Eat Sunshine",
      story: (name, type) => `In the ancient rainforest, ${name} learned the superpower of leaves: converting sunlight, water, and air into sweet oxygen for us to breathe!`,
      scene: (name, type) => `${name} examining an oversized tropical leaf with magnifying glass showing veins, water drops, and sunshine beams.`,
    },
    {
      title: "Fossil Dig: Dinosaurs of the Mesozoic",
      story: (name, type) => `Armed with a gentle brush and magnifying lens, ${name} uncovered the skeleton of a mighty Stegosaurus preserved in sandstone for 150 million years!`,
      scene: (name, type) => `${name} digging in an archaeological sand quarry brushing the skeleton plates of a friendly Stegosaurus fossil.`,
    },
    {
      title: "Junior Scientist of the Universe",
      story: (name, type) => `From the tiniest atom to the vastest galaxy, ${name} discovered that curious questions are the superpower of all great scientists!`,
      scene: (name, type) => `${name} in a laboratory with telescope, microscope, beakers, and star charts, holding a Junior Scientist badge.`,
    },
  ],
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      subtitle,
      prompt,
      authorName = "Little Author",
      targetAge = "4-8",
      genre = "coloring_book",
      characterName = "Barnaby",
      characterType = "Golden Retriever Puppy",
      characterTraits = ["Wearing a cozy red scarf", "Floppy ears", "Curious tail wag"],
      referenceImageUrl,
      pageCount = 5,
    } = body;

    const character: CharacterAnchor = {
      name: characterName,
      type: characterType,
      traits: Array.isArray(characterTraits) ? characterTraits : [characterTraits],
    };

    const count = Math.min(Math.max(pageCount, 1), 60);

    const groqKey = process.env.GROQ_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;
    const useGroq = Boolean(groqKey && groqKey.startsWith("gsk_"));
    const apiKey = useGroq ? groqKey : openaiKey;

    // Detect if the prompt/title is a Task Book, Journal, Planner, or Coding Log
    const isTaskOrJournal =
      Boolean(prompt && /\b(task|todo|to-do|journal|planner|habit|log|coding|checklist|agenda|guide|lesson)\b/i.test(prompt)) ||
      Boolean(title && /\b(task|journal|planner|habit|coding|log)\b/i.test(title));

    // Try AI LLM generation first (Groq LPU or OpenAI GPT-4o-mini)
    if (apiKey) {
      try {
        const apiUrl = useGroq
          ? "https://api.groq.com/openai/v1/chat/completions"
          : "https://api.openai.com/v1/chat/completions";
        const model = useGroq ? "openai/gpt-oss-120b" : "gpt-4o-mini";

        const systemPrompt = `You are PaperTales' Lead Publishing Engine.
You generate personalized, professionally formatted book pages ready for physical printing on Lulu POD (8.5" x 8.5" square book format).

CREATOR'S SPECIFICATIONS:
- Established Title: ${title || "Create an appropriate title based on prompt"}
- Format / Lane: ${genre}
- Creator's Concept & Detailed Prompt: "${prompt || "A personalized adventure"}"
${isTaskOrJournal ? "" : `- Protagonist: ${character.name} (${character.type}) with traits: ${character.traits.join(", ")}`}
- Total Pages to Generate: ${count} page(s)

CRITICAL INSTRUCTIONS FOR FORMAT & THEME:
${
  isTaskOrJournal
    ? `1. THIS IS A STRUCTURED TASK BOOK / JOURNAL / DAILY CODING LOG.
   - HERO MASTER PROOF MANDATE: Page 1 MUST be "Day 1: Kickoff & First Lines of Code" (or Day 1 of the requested challenge/journal). DO NOT generate an introduction, title dedication, or book ownership page! The creator is previewing the daily recurring template.
   - For every page, assign a Day or Milestone title (e.g. "Day 1: Kickoff & First Lines of Code").
   - STRICT OBEDIENCE & MINIMALISM: Follow the creator's exact layout requirements strictly. If the creator asked for checklist items and normal daily writing lines, output ONLY what the creator requested.
   - VERTICAL CHECKLIST FORMAT: Every checklist item MUST start on its own separate line with "[ ] " (e.g.
[ ] Did Coding
[ ] Making Coding Videos
   ). NEVER combine multiple checklist items onto the same line!
   - RULED WRITING LINES: If the creator requested normal lines to write on or a journal section, generate clean horizontal ruled blank lines separated by newlines:
__________________________________________________
__________________________________________________
__________________________________________________
__________________________________________________
   - NO BLOAT: DO NOT invent or inject unrequested sections (such as "Daily Briefing", "Practical Tips", "Reflection", or motivational mascot quotes) unless explicitly requested in the prompt.
   - NO UNREQUESTED MASCOTS: Do NOT quote or invent mascots (like Robo Buddy or Barnaby) for a task book or coding journal unless the creator explicitly asked for a character.
   - For imagePrompt: Describe clean physical ruled lined paper with subtle margin header for daily notes, ready for physical printing on 8.5" x 8.5" paper.`
    : `1. THIS IS A CREATIVE STORYBOOK / COLORING BOOK / LEARNING QUEST.
   - Craft heartwarming, engaging page narratives following a cohesive plot arc starring ${character.name}.
   - For imagePrompt: Describe high-contrast, clean 300 DPI vector line-art with thick continuous borders, zero shading, pure white background ready for coloring.`
}

OUTPUT SCHEMA:
You MUST respond with valid JSON adhering to this exact schema:
{
  "title": "Finalized creative book title",
  "subtitle": "A short, descriptive subtitle",
  "pages": [
    {
      "pageNumber": 1,
      "title": "Page or Day Title",
      "storyText": "Full text printed on this page (tasks, checklist, narrative story, or coding lesson)",
      "imagePrompt": "Detailed visual description of the line-art illustration or task badge for this page"
    }
  ]
}
Generate exactly ${count} page(s).`;

        const aiRes = await fetch(apiUrl, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model,
            messages: [{ role: "system", content: systemPrompt }],
            temperature: 0.7,
            response_format: { type: "json_object" },
          }),
        });

        if (aiRes.ok) {
          const aiData = await aiRes.json();
          const rawContent = aiData.choices?.[0]?.message?.content;
          const parsed = JSON.parse(rawContent);

          if (parsed.pages && Array.isArray(parsed.pages) && parsed.pages.length > 0) {
            const resolvedPages: BookPage[] = parsed.pages.map((p: any, idx: number) => {
              const pNum = idx + 1;
              let pageTitle = p.title || `Day ${pNum}`;
              let pageStoryText = p.storyText;

              // Ensure task books always show the Day 1 template instead of an introduction page
              if (isTaskOrJournal) {
                if (pageTitle.toLowerCase().includes("introduction") || pageTitle.toLowerCase().includes("preface")) {
                  pageTitle = `Day ${pNum}: Kickoff & First Lines of Code`;
                }
                if (!pageStoryText || !pageStoryText.includes("[ ]")) {
                  pageStoryText = `[ ] Did Coding\n[ ] Making Coding Videos\n\n__________________________________________________\n__________________________________________________\n__________________________________________________\n__________________________________________________`;
                }
              }

              return {
                pageNumber: pNum,
                title: pageTitle,
                storyText: pageStoryText || `Task and exercises for Day ${pNum}.`,
                imagePrompt: p.imagePrompt || `Clean layout for Day ${pNum}`,
                imageUrl: undefined, // Let BookViewer render the clean physical ruled journal spread
              };
            });

            const finalBookProject: BookProject = {
              id: `book_${Date.now().toString(36)}`,
              title: parsed.title || title || `${character.name}'s Custom Book`,
              subtitle: parsed.subtitle || subtitle || `A Personalized AI-Designed Book`,
              authorName: authorName,
              genre: genre,
              targetAge: targetAge,
              character: character,
              referenceImageUrl: referenceImageUrl || undefined,
              pages: resolvedPages,
              pageCount: resolvedPages.length,
              format: {
                trimSize: "8.5x8.5",
                binding: "saddle_stitch",
                interiorColor: "black_and_white",
              },
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };

            return NextResponse.json({ success: true, book: finalBookProject });
          }
        }
      } catch (aiErr) {
        console.warn("AI generation failed, falling back to dynamic template generator:", aiErr);
      }
    }

    // Dynamic Fallback Generator (Preserves creator's exact title, character and prompt)
    const templates = GENRE_CHAPTER_TEMPLATES[genre] || GENRE_CHAPTER_TEMPLATES.coloring_book;
    const pages: BookPage[] = [];

    for (let i = 0; i < count; i++) {
      const pNum = i + 1;
      let pageTitle = `Day ${pNum}: Kickoff & First Lines of Code`;
      let storyText = `[ ] Did Coding\n[ ] Making Coding Videos\n\n__________________________________________________\n__________________________________________________\n__________________________________________________\n__________________________________________________`;

      if (!isTaskOrJournal) {
        const template = templates[i % templates.length];
        pageTitle = template.title;
        storyText = template.story(character.name, character.type);
      }

      pages.push({
        pageNumber: pNum,
        title: pageTitle,
        storyText: storyText,
        imagePrompt: isTaskOrJournal
          ? `Clean developer badge or terminal window for Day ${pNum}`
          : `Clean vector line-art outline for ${character.name} - Page ${pNum}`,
        imageUrl: isTaskOrJournal
          ? `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="100%" height="100%"><rect width="500" height="500" fill="%230b1324" rx="24"/><rect x="20" y="20" width="460" height="460" fill="%230f1b33" stroke="%2338bdf8" stroke-width="3" rx="16"/><circle cx="50" cy="50" r="8" fill="%23ef4444"/><circle cx="75" cy="50" r="8" fill="%23f59e0b"/><circle cx="100" cy="50" r="8" fill="%2310b981"/><text x="250" y="55" font-family="monospace" font-size="14" fill="%237dd3fc" text-anchor="middle" font-weight="bold">terminal ~ coding-task-day-${pNum}</text><line x1="20" y1="75" x2="480" y2="75" stroke="%231e3a5f" stroke-width="2"/><text x="45" y="140" font-family="monospace" font-size="16" fill="%2338bdf8" font-weight="bold">$ cat daily_checklist.md</text><text x="45" y="190" font-family="sans-serif" font-size="16" fill="%23ffffff">[x] 1. Did Coding</text><text x="45" y="240" font-family="sans-serif" font-size="16" fill="%23ffffff">[x] 2. Making Coding Videos</text><line x1="45" y1="310" x2="455" y2="310" stroke="%2338bdf8" stroke-dasharray="6,4" stroke-width="2"/><text x="250" y="370" font-family="sans-serif" font-size="16" fill="%2334d399" text-anchor="middle" font-weight="bold">Day ${pNum}: Coding Progress</text><text x="250" y="410" font-family="sans-serif" font-size="13" fill="%2394a3b8" text-anchor="middle">PaperTales Personal Task Edition</text></svg>`
          : `https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&auto=format&fit=crop&q=60`,
      });
    }

    const fallbackTitle =
      title ||
      (isTaskOrJournal
        ? `15-Day Coding Quest: Daily Developer Task Book`
        : `${character.name}'s Big Adventure in the Magic Forest`);

    const fallbackSubtitle =
      subtitle ||
      (isTaskOrJournal
        ? `Daily Checklist & Ruled Log Book`
        : `A Personalized AI Coloring Storybook`);

    const bookProject: BookProject = {
      id: `book_${Date.now().toString(36)}`,
      title: fallbackTitle,
      subtitle: fallbackSubtitle,
      authorName: authorName,
      genre: genre,
      targetAge: targetAge,
      character: character,
      referenceImageUrl: referenceImageUrl || undefined,
      pages: pages,
      pageCount: pages.length,
      format: {
        trimSize: "8.5x8.5",
        binding: "saddle_stitch",
        interiorColor: "black_and_white",
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({ success: true, book: bookProject });
  } catch (error: any) {
    console.error("Error generating book story:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate book" },
      { status: 500 }
    );
  }
}
