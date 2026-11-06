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

async function generateOpenAiIllustration(
  prompt: string,
  apiKey?: string
): Promise<string | null> {
  if (!apiKey || !apiKey.startsWith("sk-")) return null;
  const preferredModels = [
    process.env.OPENAI_IMAGE_MODEL || "gpt-image-2.5-flare",
    "gpt-image-2.5-sunburst",
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
        signal: AbortSignal.timeout(45000),
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

async function generateGeminiIllustration(
  prompt: string,
  apiKey?: string
): Promise<string | null> {
  if (!apiKey || apiKey.startsWith("sb-") || apiKey.startsWith("test_")) return null;
  const modelsToTry = [
    process.env.GEMINI_IMAGE_MODEL || "gemini-3.1-flash-lite-image",
    "gemini-3.1-flash-image",
  ];

  for (const model of modelsToTry) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              responseModalities: ["IMAGE"],
            },
          }),
          signal: AbortSignal.timeout(30000),
        }
      );

      if (res.ok) {
        const data = await res.json();
        const part = data.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData?.data);
        if (part?.inlineData?.data) {
          const mime = part.inlineData.mimeType || "image/jpeg";
          return `data:${mime};base64,${part.inlineData.data}`;
        }
      } else {
        const errText = await res.text();
        console.warn(`Gemini image generation ${model} error:`, res.status, errText.slice(0, 300));
      }
    } catch (err) {
      console.warn(`Gemini image generation ${model} failed:`, err);
    }
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
      artStyle,
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
      characterName = "",
      characterType = "",
      characterTraits = [],
      referenceImageUrl,
      pageCount = 5,
      freePagesLimit,
      existingPageOne,
      unlockPagesOnly = false,
      existingPages,
      showPageNumbers = false,
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

    const userMessages = conversationMessages.filter(m => m.role === "user");
    const userTextOnly = `${prompt || ""} ${pageStructure || ""} ${userMessages.map(m => m.content).join(" ")}`;
    const fullConversationText = `${prompt || ""} ${pageStructure || ""} ${conversationMessages.map(m => m.content).join(" ")}`;

    const userMentionedBarnaby = /\bbarnaby\b/i.test(`${title || ""} ${userTextOnly}`);
    const sanitizedCharName =
      !userMentionedBarnaby && /^barnaby$/i.test((characterName || "").trim())
        ? ""
        : (characterName || "").trim();
    const sanitizedCharType =
      !userMentionedBarnaby && /golden retriever puppy/i.test((characterType || "").trim())
        ? ""
        : (characterType || "").trim();
    const rawTraits = Array.isArray(characterTraits) ? characterTraits : characterTraits ? [characterTraits] : [];
    const sanitizedTraits =
      !userMentionedBarnaby && rawTraits.some((t: any) => /red scarf/i.test(String(t)))
        ? []
        : rawTraits;

    const character: CharacterAnchor = {
      name: sanitizedCharName,
      type: sanitizedCharType,
      traits: sanitizedTraits,
    };

    const count = Math.min(Math.max(pageCount, 1), 60);

    const isJournalMode =
      /\b(journal|diary|planner|daily log|habit tracker|guided journal|daily action|reflection log|lined pages)\b/i.test(
        `${title || ""} ${prompt || ""} ${pageStructure || ""}`
      ) ||
      conversationMessages.some((m) =>
        /\b(journal|diary|planner|daily log|habit tracker|lined pages)\b/i.test(m.content)
      );

    const effectiveTrimSize = trimSize || (isJournalMode ? (genre === "coloring_book" ? "8.5x8.5" : "6x9") : "8.5x8.5");

    const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;
    const groqKey = process.env.GROQ_API_KEY;
    const hasGemini = Boolean(geminiKey && !geminiKey.startsWith("sb-") && !geminiKey.startsWith("test_"));
    const hasOpenAI = Boolean(openaiKey && openaiKey.startsWith("sk-"));
    const hasGroq = Boolean(groqKey && groqKey.startsWith("gsk_"));

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

    const isExplicitlyMonochrome =
      reqInteriorColor === "black_and_white" ||
      Boolean(artStyle && /\b(black and white|monochrome|line art|grayscale|coloring|black & white)\b/i.test(artStyle));

    const isColor =
      !isExplicitlyMonochrome &&
      (reqInteriorColor === "standard_color" ||
        Boolean(artStyle && /\b(color|colorful|vibrant|watercolor|pastel|painted|digital art|saturated)\b/i.test(artStyle)) ||
        userMessages.some((m) => /\b(full color|vibrant color|colorful|in color)\b/i.test(m.content)));

    const effectiveInteriorColor: "black_and_white" | "standard_color" =
      reqInteriorColor || (isColor ? "standard_color" : "black_and_white");

    const isActivityBook =
      genre === "activity_book" ||
      genre === "science_book" ||
      /\b(activity|activities|fact|facts|puzzle|maze|quiz|workbook|science activity)\b/i.test(`${prompt || ""} ${pageStructure || ""}`);

    const wantsStoryTextInColoring =
      genre !== "coloring_book" ||
      /\b(story|storybook|narrative|tale|bedtime|plot|chapters?|paragraph)\b/i.test(userTextOnly);

    const effectiveShowPageNumbers =
      Boolean(showPageNumbers) ||
      /\b(add|show|include|put|with|enable)\s+(page\s*numbers?|numbering)\b/i.test(userTextOnly);

    // Fast-path: Unlocking already-planned pages 6..N after token/PayPal checkout
    if (unlockPagesOnly && Array.isArray(existingPages) && existingPages.length > 0) {
      const unlockedPages: BookPage[] = await Promise.all(
        existingPages.map(async (p: BookPage, idx: number) => {
          const pNum = p.pageNumber || idx + 1;
          if (!p.isLocked && pNum <= 5) {
            return { ...p, isLocked: false };
          }
          const hasIllust = Boolean(
            p.journalData?.hasIllustration ||
              (!isJournalMode && p.imagePrompt && p.imagePrompt.trim().length > 0)
          );
          if (!hasIllust) {
            return { ...p, isLocked: false };
          }

          const promptForUnlockImage = isJournalMode
            ? `Minimalist black and white line art vector spot illustration, crisp continuous thin black outlines, pure white background, zero shading, no solid dark fills, clean monochrome icon style: ${p.imagePrompt}`
            : isColor
            ? `Children's book illustration, vibrant full color, ${artStyle || "playful colorful digital illustration"}, high detail, rich palette, delightful expression, cinematic lighting: ${p.imagePrompt}`
            : `Children's coloring book page outline, thick continuous bold black outlines, zero shading, pure white background, no gradients, uncolored, strictly black and white line art ready for coloring with crayons. ${p.imagePrompt}`;

          let unlockedImageUrl: string | undefined = p.imageUrl;
          // 1. Tier-1 Primary: Google Gemini 3.1 Flash Lite Image (uses GCP credits, ~3.3s)
          if (hasGemini && geminiKey) {
            unlockedImageUrl = (await generateGeminiIllustration(promptForUnlockImage, geminiKey)) || unlockedImageUrl;
          }
          // 2. Tier-2 Failover: OpenAI gpt-image-2.5-flare
          if (!unlockedImageUrl && hasOpenAI && openaiKey) {
            unlockedImageUrl = (await generateOpenAiIllustration(promptForUnlockImage, openaiKey)) || unlockedImageUrl;
          }
          if (!unlockedImageUrl) {
            unlockedImageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(
              promptForUnlockImage
            )}?width=1024&height=1024&nologo=true&seed=${100000 + pNum * 1337}`;
          }

          return {
            ...p,
            imageUrl: unlockedImageUrl,
            isLocked: false,
          };
        })
      );

      const unlockedBook: BookProject = {
        id: body.id || `book_${Date.now().toString(36)}`,
        title: title || "Custom Book",
        subtitle: subtitle || "A Personalized AI-Designed Book",
        authorName,
        genre,
        targetAge,
        character,
        referenceImageUrl: referenceImageUrl || undefined,
        artStyle: artStyle || (isColor ? "Playful, colorful illustrations" : "Black and white line art"),
        pageStructure: pageStructure || undefined,
        showPageNumbers: effectiveShowPageNumbers,
        pages: unlockedPages,
        pageCount: unlockedPages.length,
        format: {
          trimSize: effectiveTrimSize as any,
          binding: "saddle_stitch",
          interiorColor: effectiveInteriorColor,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      return NextResponse.json({ success: true, book: unlockedBook });
    }

    // Call high-capability LLM (Gemini primary, OpenAI backup, Groq fallback)
    if (hasGemini || hasOpenAI || hasGroq) {
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
          : `You are PaperTales' Professional Book Publishing Engine.
You generate personalized, professionally formatted book pages ready for physical printing on Lulu POD (${effectiveTrimSize} format).

CREATOR'S SPECIFICATIONS:
- Established Title: ${title || "Create an appropriate title based on prompt"}
- Genre / Lane: ${genre}
- Creator's Concept & Detailed Prompt: "${prompt || "A personalized adventure"}"
- Art Style: ${artStyle || (isColor ? "Playful, colorful illustrations" : "Black and white line art")}
- Interior Print Color: ${isColor ? "Standard Color (Full Color)" : "Black and White"}
- Page Structure Requested: "${pageStructure || "Follow creative story arc"}"
- Trim Size: ${effectiveTrimSize}
- Protagonist / Star: ${
              character.name
                ? `${character.name} (${character.type})${character.traits.length ? ` with traits: ${character.traits.join(", ")}` : ""}`
                : "No single fixed protagonist — feature the exact subjects/animals/scenes requested by the creator without inventing 'Barnaby'"
            }
- Total Pages to Generate: ${count} page(s)

CRITICAL INSTRUCTIONS:
1. STRICT ADHERENCE TO CREATOR'S THEME & PAGE STRUCTURE:
   - NEVER use the name "Barnaby" or "Golden Retriever Puppy" unless the creator explicitly requested Barnaby.
${
  isActivityBook
    ? `   - The creator requested an engaging, interactive activity and knowledge book (such as alternating activity pages and fascinating fact pages).
   - ODD PAGES (1, 3, 5...): Interactive learning activities, creative challenges, mission prep, or puzzles (e.g. "Mission 1: Design Your Spaceship", "Cosmic Maze", "Alien Word Code", "Planet Match Quiz"). Provide clear, exciting step-by-step instructions.
   - EVEN PAGES (2, 4, 6...): Fascinating, mind-blowing facts, deep-dive scientific discoveries, or storytelling explorations with engaging educational text.`
    : !wantsStoryTextInColoring
    ? `   - This is a pure coloring book without story paragraphs. Set "storyText": "" (empty string) on every page, and give each page a short, delightful title describing that page's coloring scene (e.g. "Playful Puppy & Friends", "Woodland Bunnies").`
    : `   - Carefully craft each page to match the creator's exact narrative theme, age group, and style.
   - Craft heartwarming, engaging page narratives following a cohesive plot arc${character.name ? ` starring ${character.name}` : ""}.`
}
2. VISUAL ART DESCRIPTIONS (for imagePrompt):
${
  isColor
    ? `   - For every page, write a vivid, descriptive visual prompt for a gorgeous, high-resolution children's book illustration in "${artStyle || "playful, colorful digital art"}". Describe the lighting, vibrant colors, composition, and key characters/objects without mentioning line art or coloring.`
    : `   - For every page, write a clear, descriptive visual prompt for 300 DPI high-contrast vector line art matching that exact page scene (pure white background, thick continuous black outlines, zero shading, ready for coloring). If the creator requested a decorative border inside the illustration (such as cute animals border, paw prints, stars, or floral frame), explicitly include that border description in "imagePrompt".`
}

OUTPUT SCHEMA (valid JSON only):
{
  "title": "Finalized creative book title",
  "subtitle": "A short, descriptive subtitle",
  "pages": [
    {
      "pageNumber": 1,
      "title": "Page or Activity Title",
      "storyText": "Full text printed on this page",
      "imagePrompt": "Detailed visual description of the illustration or activity visual for this page"
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

        // 1. Tier-1 Primary: Google Gemini 3.8 Flash (uses GCP credits)
        if (hasGemini && geminiKey) {
          const geminiModel = process.env.GEMINI_CHAT_MODEL || "gemini-3.8-flash";
          try {
            const geminiRes = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiKey}`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  systemInstruction: { parts: [{ text: systemPrompt }] },
                  contents: [
                    ...openAiMessages
                      .filter((m) => m.role === "user" || m.role === "assistant")
                      .map((m) => ({
                        role: m.role === "user" ? "user" : "model",
                        parts: [{ text: m.content }],
                      })),
                  ],
                  generationConfig: {
                    responseMimeType: "application/json",
                    temperature: 0.5,
                  },
                }),
                signal: AbortSignal.timeout(45000),
              }
            );

            if (geminiRes.ok) {
              const gData = await geminiRes.json();
              const raw = gData.candidates?.[0]?.content?.parts?.[0]?.text;
              if (raw) {
                const clean = raw.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
                aiData = { choices: [{ message: { content: clean } }] };
              }
            } else {
              const errBody = await geminiRes.text();
              console.warn(`Gemini story synthesis ${geminiModel} error:`, geminiRes.status, errBody.slice(0, 300));
            }
          } catch (geminiStoryErr) {
            console.warn("Gemini story synthesis failed, falling back to OpenAI/Groq:", geminiStoryErr);
          }
        }

        // 2. Tier-2 Backup: OpenAI (gpt-4.1)
        if (!aiData && hasOpenAI) {
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

                // Preserve approved Master Page 1 Proof when expanding to full book
                if (pNum === 1 && existingPageOne && (existingPageOne.imageUrl || existingPageOne.journalData)) {
                  return {
                    ...existingPageOne,
                    pageNumber: 1,
                    isLocked: false,
                  };
                }

                const isPageLocked = typeof freePagesLimit === "number" && pNum > freePagesLimit;
                const rawPageTitle = p.title || (isJournalMode ? `Day ${pNum}` : `Page ${pNum}`);
                const pageTitle =
                  !userMentionedBarnaby && /barnaby/i.test(rawPageTitle)
                    ? title || `Coloring Page ${pNum}`
                    : rawPageTitle;
                const pageStoryText = !wantsStoryTextInColoring && !isJournalMode ? "" : p.storyText || "";

                const hasIllustration = Boolean(
                  p.journalData?.hasIllustration ||
                  (p.imagePrompt &&
                    p.imagePrompt.trim().length > 5 &&
                    !p.imagePrompt.toLowerCase().includes("subtle, elegant decorative line-art border"))
                );

                const fallbackSceneDesc = character.name
                  ? `${pageTitle} starring ${character.name} the ${character.type}`
                  : `${pageTitle} (${prompt || title || "cute illustration"})`;

                const promptForImage = isJournalMode
                  ? hasIllustration
                    ? `Minimalist black and white line art vector spot illustration, crisp continuous thin black outlines, pure white background, zero shading, no solid dark fills, clean monochrome icon style: ${p.imagePrompt}`
                    : null
                  : isColor
                  ? `Children's book illustration, vibrant full color, ${artStyle || "playful colorful digital illustration"}, high detail, rich palette, delightful expression, cinematic lighting: ${
                      p.imagePrompt || fallbackSceneDesc
                    }`
                  : `Children's coloring book page outline, thick continuous bold black outlines, zero shading, pure white background, no gradients, uncolored, strictly black and white line art ready for coloring with crayons. ${
                      p.imagePrompt || fallbackSceneDesc
                    }.${borderInstruction ? ` ${borderInstruction}` : ""}`;

                let pageIllustrationUrl: string | undefined = undefined;

                if (promptForImage) {
                  if (!isPageLocked) {
                    // 1. Tier-1 Primary: Google Gemini 3.1 Flash Lite Image (~3.3s, uses GCP credits)
                    if (hasGemini && geminiKey) {
                      pageIllustrationUrl = (await generateGeminiIllustration(promptForImage, geminiKey)) || undefined;
                    }

                    // 2. Tier-2 Backup: OpenAI gpt-image-2.5-flare (only for unlocked/free pages 1..5)
                    if (!pageIllustrationUrl && hasOpenAI && openaiKey) {
                      pageIllustrationUrl = (await generateOpenAiIllustration(promptForImage, openaiKey)) || undefined;
                    }
                  }

                  // 3. Resilient fallback (also provides zero-cost preview behind frosted blur for locked pages 6..N)
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
                isLocked: isPageLocked,
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
              title: parsed.title || title || (isJournalMode ? "Daily Action Journal" : character.name ? `${character.name}'s Custom Book` : "Custom Coloring & Story Book"),
              subtitle: parsed.subtitle || subtitle || (isJournalMode ? "A 6\" x 9\" Personalized Reflection Journal" : "A Personalized AI-Designed Book"),
              authorName: authorName,
              genre: genre,
              targetAge: targetAge,
              character: character,
              referenceImageUrl: referenceImageUrl || undefined,
              artStyle: artStyle || (isColor ? "Playful, colorful illustrations" : "Black and white line art"),
              pageStructure: pageStructure || undefined,
              showPageNumbers: effectiveShowPageNumbers,
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
      if (pNum === 1 && existingPageOne && (existingPageOne.imageUrl || existingPageOne.journalData)) {
        pages.push({
          ...existingPageOne,
          pageNumber: 1,
          isLocked: false,
        });
        continue;
      }
      const isPageLocked = typeof freePagesLimit === "number" && pNum > freePagesLimit;
      const template = templates[i % templates.length];
      const fallbackCharName = character.name || "Friend";
      const fallbackCharType = character.type || "Explorer";
      const pageTitle = isJournalMode ? `Day ${pNum}` : !wantsStoryTextInColoring ? `${title || "Coloring"} - Page ${pNum}` : template.title;
      const storyText = isJournalMode
        ? "Daily journal entry and action log."
        : !wantsStoryTextInColoring
        ? ""
        : template.story(fallbackCharName, fallbackCharType);

      const spotIllustrationTopic =
        /\b(camera|mic|microphone|notebook|laptop|tools?)\b/i.test(fullConversationText)
          ? "content creation tool, microphone, camera, or notebook"
          : /\b(fitness|workout|gym)\b/i.test(fullConversationText)
          ? "fitness and wellness icon"
          : `${title || "journal"} reflection motif`;

      const fallbackSceneText = character.name
        ? template.scene(fallbackCharName, fallbackCharType)
        : `${prompt || title || "Cute animal friends scene"} (Page ${pNum})`;

      const fallbackIllustrationPrompt = isJournalMode
        ? wantsIllustrations
          ? `Minimalist black and white line art spot illustration of ${spotIllustrationTopic}, clean outlines, no shading, pure white background`
          : undefined
        : isColor
        ? `Children's book illustration, vibrant full color, ${artStyle || "playful colorful digital illustration"}, high detail, rich palette, delightful expression, cinematic lighting: ${fallbackSceneText}`
        : `Children's coloring book page outline, thick continuous bold black outlines, zero shading, pure white background, no gradients, uncolored, strictly black and white line art ready for coloring with crayons. ${fallbackSceneText}.${borderInstruction ? ` ${borderInstruction}` : ""}`;

      let fallbackImageUrl: string | undefined = undefined;

      if (fallbackIllustrationPrompt) {
        if (!isPageLocked && hasGemini && geminiKey && i === 0) {
          fallbackImageUrl = (await generateGeminiIllustration(fallbackIllustrationPrompt, geminiKey)) || undefined;
        }
        if (!isPageLocked && !fallbackImageUrl && hasOpenAI && openaiKey && i === 0) {
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
        isLocked: isPageLocked,
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

    const fallbackTitle = title || (isJournalMode ? "Daily Action & Reflection Journal" : character.name ? `${character.name}'s Big Adventure` : "Custom Coloring Book");
    const fallbackSubtitle = subtitle || (isJournalMode ? "A 6\" x 9\" Personalized Reflection Journal" : "A Personalized AI Book");

    const bookProject: BookProject = {
      id: `book_${Date.now().toString(36)}`,
      title: fallbackTitle,
      subtitle: fallbackSubtitle,
      authorName: authorName,
      genre: genre,
      targetAge: targetAge,
      character: character,
      referenceImageUrl: referenceImageUrl || undefined,
      artStyle: artStyle || (isColor ? "Playful, colorful illustrations" : "Black and white line art"),
      pageStructure: pageStructure || undefined,
      showPageNumbers: effectiveShowPageNumbers,
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
