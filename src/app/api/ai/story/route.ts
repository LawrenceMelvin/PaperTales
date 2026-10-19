import { NextRequest, NextResponse } from "next/server";
import { BookPage, BookProject, CharacterAnchor, JournalSection } from "@/types/book";

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

function parseSectionHeuristics(promptText: string, pageStructureText?: string): JournalSection[] | null {
  const combined = `${promptText} ${pageStructureText || ""}`.toLowerCase();
  // Check for upper/lower section patterns like "I will do" and "what I did"
  const willDoMatch = /i\s*will\s*do/i.test(combined);
  const whatDidMatch = /what\s*i\s*did/i.test(combined);

  if (willDoMatch && whatDidMatch) {
    return [
      {
        title: "I will do",
        prompt: "What key tasks or coding goals will you focus on today?",
        linesCount: 8,
        placeholder: "write what you plan to accomplish...",
      },
      {
        title: "What I did",
        prompt: "What did you accomplish, learn, or resolve today?",
        linesCount: 8,
        placeholder: "write your evening reflection and accomplishments...",
      },
    ];
  }

  // Check for generic upper/lower or two sections
  if (/(two|2)\s*sections|upper\s*section.*lower\s*section/i.test(combined)) {
    const upperTitleMatch = combined.match(/upper\s*(?:section)?\s*(?:with\s*title)?\s*[:'"]?\s*([^,'"\n]+)/i);
    const lowerTitleMatch = combined.match(/lower\s*(?:section)?\s*(?:with\s*title)?\s*[:'"]?\s*([^,'"\n]+)/i);

    const upperTitle = upperTitleMatch?.[1]?.trim() || "Morning Intentions";
    const lowerTitle = lowerTitleMatch?.[1]?.trim() || "Evening Retrospective";

    return [
      {
        title: upperTitle,
        prompt: `Key focus for ${upperTitle}`,
        linesCount: 8,
        placeholder: "write your thoughts here...",
      },
      {
        title: lowerTitle,
        prompt: `Review and notes for ${lowerTitle}`,
        linesCount: 8,
        placeholder: "write your reflections here...",
      },
    ];
  }

  return null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      subtitle,
      prompt,
      pageStructure,
      layoutType: reqLayoutType,
      borderText: reqBorderText,
      borderStyle: reqBorderStyle,
      cornerDecorations: reqCornerDecorations,
      interiorColor: reqInteriorColor,
      lineRuleSpacing: reqLineRuleSpacing,
      authorName = "Little Author",
      targetAge = "4-8",
      genre = "coloring_book",
      trimSize,
      characterName = "Barnaby",
      characterType = "Golden Retriever Puppy",
      characterTraits = ["Wearing a cozy red scarf", "Floppy ears", "Curious tail wag"],
      referenceImageUrl,
      pageCount = 5,
      messages: incomingMessages,
    } = body;

    const conversationMessages = Array.isArray(incomingMessages) && incomingMessages.length > 0
      ? incomingMessages
          .filter((m: any) => m && (m.role === "user" || m.role === "assistant"))
          .map((m: any) => ({
            role: m.role as "user" | "assistant",
            content: typeof m.content === "string" ? m.content : ""
          }))
          .filter((m: any) => m.content.trim().length > 0)
      : [];

    const character: CharacterAnchor = {
      name: characterName,
      type: characterType,
      traits: Array.isArray(characterTraits) ? characterTraits : [characterTraits],
    };

    const count = Math.min(Math.max(pageCount, 1), 60);

    const isJournalMode =
      genre === "memory_book" ||
      trimSize === "6x9" ||
      /\b(journal|diary|planner|notes|reflection|inspiration|gratitude|log)\b/i.test(prompt || "") ||
      /\b(journal|diary|planner|inspiration|log)\b/i.test(title || "") ||
      conversationMessages.some(m => /\b(journal|diary|planner|log|lined pages)\b/i.test(m.content));

    const effectiveTrimSize = trimSize || (isJournalMode ? (genre === "coloring_book" ? "8.5x8.5" : "6x9") : "8.5x8.5");

    const openaiKey = process.env.OPENAI_API_KEY;
    const groqKey = process.env.GROQ_API_KEY;
    const hasOpenAI = Boolean(openaiKey && openaiKey.startsWith("sk-"));
    const hasGroq = Boolean(groqKey && groqKey.startsWith("gsk_"));

    const userMessages = conversationMessages.filter(m => m.role === "user");
    const userTextOnly = `${prompt || ""} ${pageStructure || ""} ${userMessages.map(m => m.content).join(" ")}`;
    const fullConversationText = `${prompt || ""} ${pageStructure || ""} ${conversationMessages.map(m => m.content).join(" ")}`;

    // Check if illustrations were requested
    const wantsIllustrations =
      /\b(illustration|illustrations|small drawing|drawings|icon|icons|clipart|spot art|tools?|camera|mic|microphone|notebook)\b/i.test(fullConversationText);

    // Heuristically detect sections or empty lined pages
    const detectedSections = parseSectionHeuristics(prompt || "", pageStructure);

    // Check if user specifically requested empty lined pages or free writing
    const isFreeWriting =
      reqLayoutType === "empty_lined" ||
      /\b(empty\s*lined|blank\s*lines|no\s*prompts|open\s*space|plain\s*lines|unlined|empty\s*pages|free\s*writing)\b/i.test(userTextOnly);

    const effectiveLayoutType: "empty_lined" | "guided_sections" | "classic_prompt" =
      isFreeWriting
        ? "empty_lined"
        : reqLayoutType ||
          (detectedSections
            ? "guided_sections"
            : "classic_prompt");

    // Strictly suppress quotes and mood trackers when user asks for empty lined / free writing
    const wantsQuotes =
      !isFreeWriting &&
      (/\b(add\s+quotes?|with\s+quotes?|inspirational\s+quote|include\s+quotes?)\b/i.test(userTextOnly) ||
       /\b(quote|quotes)\b/i.test(title || ""));

    const wantsMood =
      !isFreeWriting &&
      /\b(track\s+mood|with\s+mood|mood\s+tracker|track\s+my\s+mood)\b/i.test(userTextOnly);

    // Border text must ONLY be set if explicitly provided and concise (<= 30 chars), or matching a strict repeating token pattern
    let effectiveBorderText: string | undefined = undefined;
    if (reqBorderText && typeof reqBorderText === "string" && reqBorderText.trim().length <= 30 && !reqBorderText.includes(".")) {
      effectiveBorderText = reqBorderText.trim();
    } else {
      // Only match explicit short repetitive border tokens like "coding----coding" or "sprint----sprint"
      const tokenMatch = userTextOnly.match(/\b([a-zA-Z0-9]+----+[a-zA-Z0-9]+)\b/);
      if (tokenMatch && tokenMatch[1].length <= 25) {
        effectiveBorderText = tokenMatch[1];
      }
    }

    const effectiveBorderStyle: "robotic" | "modern" | "playful" | "none" =
      effectiveBorderText
        ? (reqBorderStyle || (/\brobotic|tech|monospace|code\b/i.test(userTextOnly) ? "robotic" : "modern"))
        : "none";

    const effectiveCornerDecorations: "tech_brackets" | "gears" | "minimal" | "none" =
      effectiveBorderStyle === "robotic"
        ? "tech_brackets"
        : (reqCornerDecorations && reqCornerDecorations !== "none" ? reqCornerDecorations : "none");

    const effectiveLineRuleSpacing: "wide" | "college" =
      reqLineRuleSpacing || (/\bwide\b/i.test(userTextOnly) ? "wide" : "college");

    const effectiveInteriorColor: "black_and_white" | "standard_color" =
      reqInteriorColor || "black_and_white";

    // Call high-capability LLM (OpenAI primary, Groq fallback)
    if (hasOpenAI || hasGroq) {
      try {
        const schemaExampleJournalData =
          effectiveLayoutType === "empty_lined"
            ? `{
        "dayNumber": 1,
        "headerCategory": "${title || "My Progress Log"}",
        "layoutType": "empty_lined",
        "borderText": ${effectiveBorderText ? `"${effectiveBorderText}"` : "null"},
        "borderStyle": "${effectiveBorderStyle}",
        "cornerDecorations": "${effectiveCornerDecorations}",
        "moodTracker": false,
        "quote": null,
        "reflectionPrompt": null,
        "ruledLinesCount": ${effectiveLineRuleSpacing === "wide" ? 15 : 19},
        "sections": null,
        "hasIllustration": ${wantsIllustrations ? "true" : "false"},
        "illustrationPrompt": ${wantsIllustrations ? '"Minimalist black and white line-art spot illustration of a vintage podcast microphone with sound waves, crisp outlines, pure white background, no shading"' : "null"},
        "illustrationPlacement": "bottom_right"
      }`
            : `{
        "dayNumber": 1,
        "headerCategory": "${title || "Daily Action & Retrospective"}",
        "layoutType": "${effectiveLayoutType}",
        "borderText": ${effectiveBorderText ? `"${effectiveBorderText}"` : "null"},
        "borderStyle": "${effectiveBorderStyle}",
        "cornerDecorations": "${effectiveCornerDecorations}",
        "moodTracker": ${wantsMood ? "true" : "false"},
        "quote": ${wantsQuotes ? '"Inspirational quote here"' : "null"},
        "reflectionPrompt": ${detectedSections ? "null" : '"What is one intention you want to set for today?"'},
        "ruledLinesCount": ${detectedSections ? "null" : "18"},
        "sections": ${
          detectedSections
            ? JSON.stringify(detectedSections)
            : `[
          { "title": "I will do", "prompt": "What key tasks or coding goals will you focus on today?", "linesCount": 8, "placeholder": "write what you plan to accomplish..." },
          { "title": "What I did", "prompt": "What did you accomplish, learn, or resolve today?", "linesCount": 8, "placeholder": "write your evening reflection and accomplishments..." }
        ]`
        },
        "hasIllustration": ${wantsIllustrations ? "true" : "false"},
        "illustrationPrompt": ${wantsIllustrations ? '"Minimalist black and white line-art spot illustration of a vintage microphone, clean outlines, no shading"' : "null"},
        "illustrationPlacement": "bottom_right"
      }`;

        const systemPrompt = isJournalMode
          ? `You are PaperTales' Professional Guided Journal & Planner Engine.
You generate personalized, physical printed journals formatted for Lulu POD (${effectiveTrimSize} format).

CREATOR'S JOURNAL SPECIFICATIONS:
- Journal Title: ${title || "Personal Reflection Journal"}
- Creator's Theme & Prompt: "${prompt || "A daily personal reflection journal"}"
- Page Structure Requested: "${pageStructure || (effectiveLayoutType === "empty_lined" ? "Empty lined pages" : "Organized according to prompt")}"
- Layout Type: ${effectiveLayoutType.toUpperCase()}
- Border Text: ${effectiveBorderText ? `"${effectiveBorderText}"` : "None"}
- Border Style: ${effectiveBorderStyle}
- Corner Accents: ${effectiveCornerDecorations}
- Total Days / Pages: ${count} day(s)
- Include Quotes: ${wantsQuotes ? "YES" : "NO"}
- Include Mood Tracker: ${wantsMood ? "YES" : "NO"}
- Include Daily Spot Illustrations: ${wantsIllustrations ? "YES (unique motif for each day)" : "NO"}

CRITICAL INSTRUCTIONS FOR GUIDED JOURNAL FORMAT:
${
  effectiveLayoutType === "empty_lined"
    ? `1. EMPTY LINED PAGES: The creator requested EMPTY LINED PAGES for free writing without unwanted reflection questions or split sections.
   - For every page: set "journalData.layoutType": "empty_lined", "journalData.sections": null, "journalData.reflectionPrompt": null.
   - Set "journalData.ruledLinesCount": ${effectiveLineRuleSpacing === "wide" ? 15 : 19}.
   - Set "journalData.headerCategory": "${title || "My Journal"}".`
    : `1. CUSTOM PAGE SECTIONS:
   - If specific page sections were requested, output them in "journalData.sections" for every page.
   - "headerCategory": A concise category title for the top header.
   - If NO specific sections were requested, provide a single "reflectionPrompt" with "ruledLinesCount": 18.`
}
2. CONCISE BREVITY: Keep text concise so it leaves ample space for writing lines.
3. DAILY SPOT ILLUSTRATIONS (imagePrompt):
${
  wantsIllustrations
    ? `   - The creator requested a unique small illustration for each day (e.g. content creation tools, tech icons, botanical elements, or character motifs).
   - For each page, provide a specific, descriptive "imagePrompt" describing that day's unique spot illustration (e.g. Day 1: "Minimalist black and white line art of a vintage podcast microphone with sound waves, crisp outlines, zero shading, pure white background", Day 2: "Minimalist black and white line art of a modern DSLR creator camera with lens ring, clean outlines, zero shading, pure white background", Day 3: "Minimalist line art of a creator notebook and fountain pen").
   - Set "journalData.hasIllustration": true, "journalData.illustrationPrompt": "...same as imagePrompt...", "journalData.illustrationPlacement": "bottom_right".`
    : `   - If no illustrations were requested, set "imagePrompt": null and "journalData.hasIllustration": false.`
}

OUTPUT SCHEMA (valid JSON only):
{
  "title": "Finalized journal title",
  "subtitle": "A short, descriptive subtitle",
  "pages": [
    {
      "pageNumber": 1,
      "title": "Day 1",
      "storyText": "Daily journal entry and action log",
      "journalData": ${schemaExampleJournalData},
      "imagePrompt": ${wantsIllustrations ? '"Minimalist black and white line art of a vintage podcast microphone, pure white background, crisp outlines, no shading"' : "null"}
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

        // Build messages payload for OpenAI / Groq with Direct Conversation Continuity
        const openAiMessages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
          { role: "system", content: systemPrompt }
        ];

        if (conversationMessages.length > 0) {
          openAiMessages.push(...conversationMessages);
          openAiMessages.push({
            role: "user",
            content: `The creator consultation is locked and finalized. Now, using 100% of the decisions and design agreements from our full conversation above, generate the physical book interior pages (page count: ${count}).

DIRECT CONTINUITY CHECKLIST:
1. Exact Page Layout: Honor the exact interior page structure discussed (e.g. empty lined pages with no unsolicited prompts, multi-section splits, or classic reflection prompts).
2. Daily Spot Illustrations: If we agreed on illustrations (e.g. unique daily tools like microphones, cameras, notebooks, or character scenes), describe each day's unique spot illustration in "imagePrompt" with specific subject, monochrome line-art style, zero shading, pure white background.
3. Borders & Accents: If borders (e.g. robotic repeating text) or corner decorations were agreed upon, include them.
4. Output valid JSON matching the schema.`
          });
        }

        let aiData: any = null;

        // 1. Primary: OpenAI (gpt-4.1)
        if (hasOpenAI) {
          const model = process.env.OPENAI_CHAT_MODEL || "gpt-4.1";
          try {
            const openAiRes = await fetch("https://api.openai.com/v1/chat/completions", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${openaiKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                model,
                messages: openAiMessages,
                temperature: 0.7,
                response_format: { type: "json_object" },
              }),
            });
            if (openAiRes.ok) {
              aiData = await openAiRes.json();
            }
          } catch (openAiErr) {
            console.warn("OpenAI story generation failed, falling back to Groq:", openAiErr);
          }
        }

        // 2. Fallback: Groq
        if (!aiData && hasGroq) {
          try {
            const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${groqKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                model: "openai/gpt-oss-120b",
                messages: openAiMessages,
                temperature: 0.7,
                response_format: { type: "json_object" },
              }),
            });
            if (groqRes.ok) {
              aiData = await groqRes.json();
            }
          } catch (groqErr) {
            console.warn("Groq story fallback failed:", groqErr);
          }
        }

async function generateOpenAiIllustration(
  prompt: string,
  apiKey?: string
): Promise<string | null> {
  if (!apiKey || !apiKey.startsWith("sk-")) return null;
  const preferredModels = [
    process.env.OPENAI_IMAGE_MODEL || "gpt-image-2.5-sunburst-2026-09-08",
    "gpt-image-2",
  ];

  for (const model of preferredModels) {
    try {
      const res = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          prompt,
          n: 1,
          size: "1024x1024",
        }),
        signal: AbortSignal.timeout(30000),
      });

      if (res.ok) {
        const data = await res.json();
        const item = data.data?.[0];
        if (item?.b64_json) {
          return `data:image/png;base64,${item.b64_json}`;
        }
        if (item?.url) {
          return item.url;
        }
      } else {
        const errText = await res.text();
        console.warn(`OpenAI image generation ${model} error:`, res.status, errText);
      }
    } catch (err) {
      console.warn(`OpenAI image generation ${model} failed:`, err);
    }
  }
  return null;
}

        if (aiData) {
          const rawContent = aiData.choices?.[0]?.message?.content;
          const parsed = JSON.parse(rawContent);

          if (parsed.pages && Array.isArray(parsed.pages) && parsed.pages.length > 0) {
            const pawPrintBorder = /\b(paw\s*prints?|paws?)\b/i.test(fullConversationText);
            const borderInstruction = pawPrintBorder
              ? "Decorative continuous playful paw-print border framing the outer edges of the page."
              : effectiveBorderText
              ? `Framed with a clean border (${effectiveBorderText}).`
              : "";

            const resolvedPages: BookPage[] = await Promise.all(
              parsed.pages.map(async (p: any, idx: number) => {
                const pNum = idx + 1;
                const pageTitle = p.title || (isJournalMode ? `Day ${pNum}` : `Chapter ${pNum}`);
                const pageStoryText = p.storyText || "";

                const hasIllustration = Boolean(
                  p.journalData?.hasIllustration ||
                  (p.imagePrompt &&
                    p.imagePrompt.trim().length > 5 &&
                    !p.imagePrompt.toLowerCase().includes("subtle, elegant decorative line-art border"))
                );

                const promptForImage = isJournalMode
                  ? hasIllustration
                    ? `Minimalist black and white line art vector spot illustration, crisp continuous thin black outlines, pure white background, zero shading, no solid dark fills, clean monochrome icon style: ${p.imagePrompt}`
                    : null
                  : `Children's coloring book page outline, thick continuous bold black outlines, zero shading, pure white background, no gradients, uncolored, strictly black and white line art ready for coloring with crayons. ${
                      p.imagePrompt || `${pageTitle} starring ${character.name} the ${character.type}`
                    }.${borderInstruction ? ` ${borderInstruction}` : ""}`;

                let pageIllustrationUrl: string | undefined = undefined;

                if (promptForImage) {
                  // Primary: OpenAI gpt-image-2.5-sunburst / gpt-image-2
                  if (hasOpenAI && openaiKey) {
                    pageIllustrationUrl = (await generateOpenAiIllustration(promptForImage, openaiKey)) || undefined;
                  }

                  // Resilient fallback: Pollinations line-art
                  if (!pageIllustrationUrl) {
                    pageIllustrationUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(
                      promptForImage
                    )}?width=1024&height=1024&nologo=true&seed=${100000 + pNum * 1337}`;
                  }
                }

              // Ensure sections requested by the creator are present (unless empty_lined layout is requested)
              let sectionsToUse: JournalSection[] | undefined = undefined;
              if (effectiveLayoutType !== "empty_lined") {
                if (p.journalData?.sections && Array.isArray(p.journalData.sections) && p.journalData.sections.length > 0) {
                  sectionsToUse = p.journalData.sections;
                } else if (detectedSections) {
                  sectionsToUse = detectedSections;
                }
              }

              return {
                pageNumber: pNum,
                title: pageTitle,
                storyText: pageStoryText,
                imagePrompt: p.imagePrompt || `Clean layout for ${pageTitle}`,
                imageUrl: pageIllustrationUrl,
                journalData: isJournalMode
                  ? {
                      dayNumber: p.journalData?.dayNumber || pNum,
                      datePlaceholder: p.journalData?.datePlaceholder || "Date: _______________",
                      headerCategory:
                        p.journalData?.headerCategory ||
                        title ||
                        (sectionsToUse ? "Daily Action & Retrospective" : "Daily Reflection & Mindset"),
                      moodTracker: effectiveLayoutType === "empty_lined" ? false : Boolean(p.journalData?.moodTracker),
                      quote: effectiveLayoutType === "empty_lined" ? undefined : (p.journalData?.quote || undefined),
                      reflectionPrompt:
                        effectiveLayoutType === "empty_lined"
                          ? undefined
                          : p.journalData?.reflectionPrompt || (sectionsToUse ? undefined : "What is one intention you want to cultivate today?"),
                      gratitudePrompts: effectiveLayoutType === "empty_lined" ? undefined : (p.journalData?.gratitudePrompts || undefined),
                      ruledLinesCount:
                        effectiveLayoutType === "empty_lined"
                          ? effectiveLineRuleSpacing === "wide"
                            ? 15
                            : 19
                          : p.journalData?.ruledLinesCount || (sectionsToUse ? undefined : 18),
                      sections: sectionsToUse,
                      layoutType: effectiveLayoutType,
                      borderText: effectiveBorderText,
                      borderStyle: effectiveBorderStyle,
                      cornerDecorations: effectiveCornerDecorations,
                      lineRuleSpacing: effectiveLineRuleSpacing,
                      hasIllustration: Boolean(pageIllustrationUrl),
                      illustrationPrompt: p.imagePrompt || p.journalData?.illustrationPrompt,
                      illustrationPlacement: p.journalData?.illustrationPlacement || "bottom_right",
                    }
                  : undefined,
              };
            })
          );

            const finalBookProject: BookProject = {
              id: `book_${Date.now().toString(36)}`,
              title: parsed.title || title || (isJournalMode ? "Daily Action Journal" : `${character.name}'s Custom Book`),
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
                interiorColor: effectiveInteriorColor,
              },
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };

            return NextResponse.json({ success: true, book: finalBookProject });
          }
        }
      } catch (aiErr) {
        console.warn("AI generation encountered error, falling back to dynamic template generator:", aiErr);
      }
    }

    // Dynamic Fallback Generator (Preserves creator's exact title, sections and prompt)
    const templates = GENRE_CHAPTER_TEMPLATES[genre] || GENRE_CHAPTER_TEMPLATES.coloring_book;
    const pages: BookPage[] = [];

    const pawPrintBorder = /\b(paw\s*prints?|paws?)\b/i.test(fullConversationText);
    const borderInstruction = pawPrintBorder
      ? "Decorative continuous playful paw-print border framing the outer edges of the page."
      : effectiveBorderText
      ? `Framed with a clean border (${effectiveBorderText}).`
      : "";

    for (let i = 0; i < count; i++) {
      const pNum = i + 1;
      const template = templates[i % templates.length];
      const pageTitle = isJournalMode ? `Day ${pNum}` : template.title;
      const storyText = isJournalMode ? "Daily journal entry and action log." : template.story(character.name, character.type);

      const fallbackIllustrationPrompt = isJournalMode
        ? wantsIllustrations
          ? `Minimalist black and white line art spot illustration of content creation tool, microphone, camera, or notebook, clean outlines, no shading, pure white background`
          : undefined
        : `Children's coloring book page outline, thick continuous bold black outlines, zero shading, pure white background, no gradients, uncolored, strictly black and white line art ready for coloring with crayons. ${template.scene(
            character.name,
            character.type
          )}.${borderInstruction ? ` ${borderInstruction}` : ""}`;

      let fallbackImageUrl: string | undefined = undefined;

      if (fallbackIllustrationPrompt) {
        if (hasOpenAI && openaiKey && i === 0) {
          fallbackImageUrl = (await generateOpenAiIllustration(fallbackIllustrationPrompt, openaiKey)) || undefined;
        }
        if (!fallbackImageUrl) {
          fallbackImageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(
            fallbackIllustrationPrompt
          )}?width=1024&height=1024&nologo=true&seed=${200000 + pNum * 777}`;
        }
      }

      pages.push({
        pageNumber: pNum,
        title: pageTitle,
        storyText: storyText,
        imagePrompt: fallbackIllustrationPrompt || `Page ${pNum} outline`,
        imageUrl: fallbackImageUrl,
        journalData: isJournalMode
          ? {
              dayNumber: pNum,
              datePlaceholder: "Date: _______________",
              headerCategory:
                title || (detectedSections ? "Daily Action & Retrospective" : "Daily Reflection & Mindset"),
              moodTracker: wantsMood,
              sections: effectiveLayoutType === "empty_lined" ? undefined : (detectedSections || undefined),
              reflectionPrompt:
                effectiveLayoutType === "empty_lined"
                  ? undefined
                  : detectedSections
                  ? undefined
                  : "What is one intention you want to cultivate today?",
              ruledLinesCount:
                effectiveLayoutType === "empty_lined"
                  ? effectiveLineRuleSpacing === "wide"
                    ? 15
                    : 19
                  : detectedSections
                  ? undefined
                  : 18,
              layoutType: effectiveLayoutType,
              borderText: effectiveBorderText,
              borderStyle: effectiveBorderStyle,
              cornerDecorations: effectiveCornerDecorations,
              lineRuleSpacing: effectiveLineRuleSpacing,
              hasIllustration: wantsIllustrations,
              illustrationPrompt: fallbackIllustrationPrompt,
              illustrationPlacement: "bottom_right",
            }
          : undefined,
      });
    }

    const fallbackTitle = title || (isJournalMode ? "Daily Action & Reflection Journal" : `${character.name}'s Big Adventure`);
    const fallbackSubtitle = subtitle || (isJournalMode ? "A 6\" x 9\" Personalized Reflection Journal" : "A Personalized AI Storybook");

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
        trimSize: effectiveTrimSize as any,
        binding: "saddle_stitch",
        interiorColor: effectiveInteriorColor,
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
