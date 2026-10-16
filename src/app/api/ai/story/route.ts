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
      trimSize,
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

    const isJournalMode =
      genre === "memory_book" ||
      trimSize === "6x9" ||
      /\b(journal|diary|planner|notes|reflection|inspiration|gratitude)\b/i.test(prompt || "") ||
      /\b(journal|diary|planner|inspiration)\b/i.test(title || "");

    const effectiveTrimSize = trimSize || (isJournalMode ? "6x9" : "8.5x8.5");

    const groqKey = process.env.GROQ_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;
    const useGroq = Boolean(groqKey && groqKey.startsWith("gsk_"));
    const apiKey = useGroq ? groqKey : openaiKey;

    const wantsQuotes =
      /\b(quote|quotes|inspirational|motivational|inspiration)\b/i.test(prompt || "") ||
      /\b(quote|quotes|inspiration)\b/i.test(title || "");

    // Try AI LLM generation first (Groq LPU or OpenAI GPT-4o-mini)
    if (apiKey) {
      try {
        const apiUrl = useGroq
          ? "https://api.groq.com/openai/v1/chat/completions"
          : "https://api.openai.com/v1/chat/completions";
        const model = useGroq ? "openai/gpt-oss-120b" : "gpt-4o-mini";

        const systemPrompt = isJournalMode
          ? `You are PaperTales' Professional Guided Journal & Planner Engine.
You generate personalized, physical printed journals formatted for Lulu POD (${effectiveTrimSize} format).

CREATOR'S JOURNAL SPECIFICATIONS:
- Journal Title: ${title || "Personal Reflection Journal"}
- Creator's Theme & Prompt: "${prompt || "A daily personal reflection journal"}"
- Total Days / Pages: ${count} day(s)
- Include Quotes: ${wantsQuotes ? "YES (include inspirational quotes)" : "NO (do NOT include quotes; user wants clean reflection and maximum straight writing lines)"}

CRITICAL INSTRUCTIONS FOR GUIDED JOURNAL FORMAT:
1. STRUCTURED DAILY SPREAD:
   - For every page, assign a Day Title (e.g. "Day 1: Setting the Intent", "Day 2: Finding Clarity").
   - "quote": ${wantsQuotes ? "An uplifting, thought-provoking quote fitting the day's theme (max 110 characters)." : "null"}
   - "reflectionPrompt": A warm, specific guided journaling prompt (STRICT LIMIT: max 120 characters) or daily focus.
   - "gratitudePrompts": Optional array of 3 short prompts or empty array.
   - "ruledLinesCount": 18
2. CONCISE BREVITY: Keep text concise so it leaves ample space for 18-20 college-ruled writing lines.
3. imagePrompt: Describe a subtle decorative border frame matching the creator's theme (e.g. botanical leaves, geometric lines, or cat outlines) framing the outer edges of the page, clean line-art, zero dark fills, pure white background.

OUTPUT SCHEMA (valid JSON only):
{
  "title": "Finalized journal title",
  "subtitle": "A short, descriptive subtitle",
  "pages": [
    {
      "pageNumber": 1,
      "title": "Day 1: Setting the Intent",
      "storyText": "Today is the beginning of your journey.",
      "journalData": {
        "dayNumber": 1,
        "quote": ${wantsQuotes ? '"Inspirational quote here"' : 'null'},
        "reflectionPrompt": "What is one intention you want to set for today?",
        "ruledLinesCount": 18
      },
      "imagePrompt": "Subtle, elegant decorative line-art border framing the outer edges of the page"
    }
  ]
}`
          : `You are PaperTales' Lead Publishing Engine for Storybooks & Coloring Adventures.
You generate personalized, professionally formatted book pages ready for physical printing on Lulu POD (8.5" x 8.5" square book format).

CREATOR'S SPECIFICATIONS:
- Established Title: ${title || "Create an appropriate title based on prompt"}
- Format / Lane: ${genre}
- Creator's Concept & Detailed Prompt: "${prompt || "A personalized adventure"}"
- Protagonist / Star: ${character.name} (${character.type}) with traits: ${character.traits.join(", ")}
- Total Pages to Generate: ${count} page(s)

CRITICAL INSTRUCTIONS:
1. STRICT ADHERENCE TO CREATOR'S STORY THEME:
   - Carefully craft each page to match the creator's exact narrative theme, age group, and style.
   - Craft heartwarming, engaging page narratives following a cohesive plot arc starring ${character.name}.
2. VISUAL LINE-ART DESCRIPTIONS (for imagePrompt):
   - For every page, write a clear, descriptive visual prompt for 300 DPI high-contrast vector line art matching that exact page scene (pure white background, thick continuous black borders, zero shading, ready for coloring).

OUTPUT SCHEMA (valid JSON only):
{
  "title": "Finalized creative book title",
  "subtitle": "A short, descriptive subtitle",
  "pages": [
    {
      "pageNumber": 1,
      "title": "Page or Chapter Title",
      "storyText": "Full text printed on this page",
      "imagePrompt": "Detailed visual description of the line-art illustration or scene for this page"
    }
  ]
}`;

        let aiData: any = null;
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
          aiData = await aiRes.json();
        } else if (useGroq && openaiKey && openaiKey.startsWith("sk-")) {
          // Fall back to OpenAI if Groq fails
          const openAiRes = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${openaiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "gpt-4o-mini",
              messages: [{ role: "system", content: systemPrompt }],
              temperature: 0.7,
              response_format: { type: "json_object" },
            }),
          });
          if (openAiRes.ok) {
            aiData = await openAiRes.json();
          }
        }

        if (aiData) {
          const rawContent = aiData.choices?.[0]?.message?.content;
          const parsed = JSON.parse(rawContent);

          if (parsed.pages && Array.isArray(parsed.pages) && parsed.pages.length > 0) {
            const resolvedPages: BookPage[] = parsed.pages.map((p: any, idx: number) => {
              const pNum = idx + 1;
              const pageTitle = p.title || (isJournalMode ? `Day ${pNum}` : `Chapter ${pNum}`);
              const pageStoryText = p.storyText || "";

              // For journals: generate a decorative animal coloring border framing a clean white center
              // For storybooks: generate the full scene vector line-art
              const promptForImage = isJournalMode
                ? `Children's coloring page decorative border with cute cartoon animal outlines (kittens, puppies, bunnies) framing a large clean empty white rectangular center space, thick continuous black outlines, zero shading, pure white background, no solid dark fills, strict monochrome vector line art, ready for coloring.`
                : `Children's coloring book page outline, thick continuous bold black outlines, zero shading, pure white background, no gradients, ${
                    p.imagePrompt || `${pageTitle} starring ${character.name} the ${character.type}`
                  }. Strict monochrome black and white vector line art, ready for coloring.`;

              const pageIllustrationUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(
                promptForImage
              )}?width=1024&height=1024&nologo=true&seed=${100000 + pNum * 1337}`;

              return {
                pageNumber: pNum,
                title: pageTitle,
                storyText: pageStoryText,
                imagePrompt: p.imagePrompt || `Clean layout for ${pageTitle}`,
                imageUrl: pageIllustrationUrl,
                journalData: p.journalData || (isJournalMode ? {
                  dayNumber: pNum,
                  datePlaceholder: "Date: _______________",
                  quote: "Every day holds a new spark of wonder.",
                  reflectionPrompt: "What made you smile or think today?",
                  gratitudePrompts: ["One thing I enjoyed", "Someone who made a difference", "A hope for tomorrow"],
                  ruledLinesCount: 6,
                } : undefined),
              };
            });

            const finalBookProject: BookProject = {
              id: `book_${Date.now().toString(36)}`,
              title: parsed.title || title || (isJournalMode ? "Daily Inspiration Journal" : `${character.name}'s Custom Book`),
              subtitle: parsed.subtitle || subtitle || (isJournalMode ? "A 6\" x 9\" Personalized Reflection Journal" : "A Personalized AI-Designed Book"),
              authorName: authorName,
              genre: genre,
              targetAge: targetAge,
              character: character,
              referenceImageUrl: referenceImageUrl || undefined,
              pages: resolvedPages,
              pageCount: resolvedPages.length,
              format: {
                trimSize: effectiveTrimSize as any,
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
      const template = templates[i % templates.length];
      const pageTitle = template.title;
      const storyText = template.story(character.name, character.type);

      pages.push({
        pageNumber: pNum,
        title: pageTitle,
        storyText: storyText,
        imagePrompt: `Clean vector line-art outline for ${character.name} - Page ${pNum}`,
        imageUrl: `https://image.pollinations.ai/prompt/${encodeURIComponent(
          `Children's coloring book page outline, thick continuous bold black outlines, zero shading, pure white background, no gradients, ${template.scene(
            character.name,
            character.type
          )}. Strict monochrome vector line art, ready for coloring.`
        )}?width=1024&height=1024&nologo=true&seed=${200000 + pNum * 777}`,
      });
    }

    const fallbackTitle = title || `${character.name}'s Big Adventure`;
    const fallbackSubtitle = subtitle || `A Personalized AI Storybook`;

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
