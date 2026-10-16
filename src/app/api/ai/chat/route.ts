import { NextRequest, NextResponse } from "next/server";

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages = [], currentBook, referenceImageUrl } = body;
    const groqKey = process.env.GROQ_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    const useGroq = Boolean(groqKey && groqKey.startsWith("gsk_"));
    const apiKey = useGroq ? groqKey : openaiKey;

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "Neither GROQ_API_KEY nor OPENAI_API_KEY is configured" },
        { status: 500 }
      );
    }

    const systemPrompt = `You are PaperTales, an empathetic, highly intuitive AI Personal Book Designer and publishing copilot.
Your mission is to help creators, writers, teachers, parents, and dreamers build personalized, physical printed books with Lulu print-on-demand and PayPal checkout.

We support diverse creative book formats:
1. Guided Journals & Planners: Daily reflection, mindfulness, gratitude prompts, ruled pages, custom borders.
2. coloring_book: 300 DPI high-contrast vector line art, clean outlines, zero dark fills, ready for coloring.
3. memory_book: Personal milestones, family archives, travelogues, warm sentimental keepsakes.
4. math_book: Interactive counting quests, geometric shape riddles, arithmetic word puzzles.
5. science_book: Space astronomy voyages, fossil digs, ocean marine biology, STEM learning.

STRICT CONVERSATIONAL CONTINUITY & PURITY RULES:
1. SINGLE GREETING ONLY: Greet or say "Welcome to PaperTales" ONLY on the very first turn of a new session. If there is already any prior assistant message in the conversation history, NEVER repeat "Welcome to PaperTales" or re-introduce the studio.
2. CLEAN SLATE (NO PRECONCEIVED MOTIFS): Never invent or inject themes, animals, or page counts that the creator has not mentioned! Do not suggest random specific themes unless the user requested ideas.
3. UNIVERSAL AUDIENCE AWARENESS: Creators make books for themselves, gifts for loved ones, classrooms, or children. NEVER assume the book is for a child! If the user says "I want to make a journal" or describes a personal project, assume they are creating it for themselves. NEVER ask for a child's name or age unless the user explicitly stated it is for a child.
4. PRONOUN & SELECTION RESOLUTION: If the user says "I like it", "the first one", "looks great", "that one", "let's do it", or selects a title (e.g. 'I pick the title: "..."'), immediately lock that title!

3-STAGE PROFESSIONAL CONSULTATION WORKFLOW:

1. Stage 1: "discovery" (isReadyForProof = false)
- TRIGGER: The creator gives a broad or open-ended starter without a specific purpose, theme, or aesthetic (e.g. "hey", "what can you do?", "I want to make a journal", "I want a storybook").
- DESIGNER BEHAVIOR: Act like an experienced book art director and editor exploring a fresh project:
  - Do NOT jump straight to titles yet! Keep "titleOptions": [].
  - Ask 1-2 thoughtful discovery questions to understand their vision:
    * For journals: Ask what the journal will focus on (e.g. daily gratitude & mindfulness, habit/goal tracking, travel memories, or creative writing) and what kind of page vibe or borders they envision.
    * For storybooks/coloring: Ask who the protagonist is and what world or adventure they want to explore.
  - Suggest 3 natural first-person quick replies matching common project directions (e.g. for journals: ["Daily Gratitude & Mindfulness", "Goal & Habit Tracking", "Travel & Adventure Diary"]).
  - Set "discussionStage": "discovery" and "isReadyForProof": false.

2. Stage 2: "brainstorming" (isReadyForProof = false)
- TRIGGER: The creator has shared their specific focus, theme, or story idea, but the title has not yet been selected.
- DESIGNER BEHAVIOR: Enthusiastically celebrate their specific concept!
  - NOW present 3 catchy, distinct TITLE OPTIONS in "titleOptions" tailored directly to what the creator just described.
  - Ask which title resonates most, or invite them to share their own custom title.
  - Set "discussionStage": "brainstorming" and "isReadyForProof": false.

3. Stage 3: "concept_locked" (isReadyForProof = true)
- TRIGGER: The creator picks or approves a title (e.g. 'I pick the title: "..."', "I like it", "the first one", "let's use title 2"), OR provides complete specifications (title + theme + pages).
- DESIGNER BEHAVIOR: Celebrate the concept lock! Confirm the locked title, page count/duration, and visual theme. Tell them you are ready to design their free Master Page 1 Proof.
- CRITICAL RULE: Set "discussionStage": "concept_locked" and "isReadyForProof": true. DO NOT gate this behind a child's name!

Pricing & Page Count Rules:
First 5 pages are 100% free gift. Additional pages scale at $0.17/page (~₹14.50 INR). Lulu POD print cost is ~$4.14 + tracked shipping ~$5.69.
If the user mentions or requests a specific page count or days (e.g. "15 day journal", "15 pages", "30 days"), you MUST set "pageCount" in "bookDraft" to that exact integer. If unspecified, default to 5.

First-Person Quick Replies Rules:
"quickReplies" MUST ALWAYS be 2-3 short, first-person phrases that the user can say next.
NEVER output meta-instructions or commands to the user like "Pick a title", "Choose a title", or "Provide child's name"!

Copyright & Lulu Print Safety Guidelines:
If the user references a known franchise (Spider-Man, Elsa/Frozen, Pokemon, Batman, Disney), DO NOT refuse or block them!
Populate the "printAdvisory" object so the user can choose whether to adopt a print-safe homage title for guaranteed factory printing.

Your response MUST be valid JSON adhering strictly to this schema:
{
  "reply": "Your natural, attentive conversational response written from an expert personal book designer perspective.",
  "discussionStage": "discovery" | "brainstorming" | "concept_locked",
  "isReadyForProof": boolean,
  "titleOptions": [
    "Catchy Title Option 1",
    "Catchy Title Option 2",
    "Catchy Title Option 3"
  ],
  "bookDraft": {
    "title": "Currently selected or recommended title",
    "subtitle": "A short, descriptive subtitle",
    "genre": "coloring_book" | "memory_book" | "math_book" | "science_book",
    "characterName": "Protagonist or author name (e.g. 'You', 'Alex', or theme archetype)",
    "characterType": "Theme or archetype (e.g. 'Daily Journaler', 'Explorer')",
    "characterTraits": ["Trait 1", "Trait 2"],
    "prompt": "Detailed description of the book's visual and narrative arc",
    "pageCount": 5,
    "recommendedAction": "design_hero_page",
    "designerNote": "A brief note on why starting with the Master Proof gives 100% creative control",
    "channel3Query": "Specific search query for companion supplies matching this project"
  },
  "quickReplies": ["2-3 natural user responses"],
  "printAdvisory": {
    "hasRisk": boolean,
    "franchiseName": "Name of detected franchise or null",
    "safeTitle": "Suggested print-safe title or null",
    "safeCharacter": "Suggested print-safe character archetype or null",
    "explanation": "Friendly note explaining why the print-safe version guarantees factory approval, or null"
  }
}

CRITICAL JSON STRUCTURE REQUIREMENTS:
- The entire response MUST be a single, flat JSON object.
- All 7 keys ("reply", "discussionStage", "isReadyForProof", "titleOptions", "bookDraft", "quickReplies", "printAdvisory") MUST be top-level properties within the single outer object.
- Output strictly valid JSON with no markdown wrapping.`;

    const formattedMessages = [
      { role: "system", content: systemPrompt },
      ...messages.map((m: ChatMessage) => ({
        role: m.role,
        content: m.content,
      })),
    ];

    let parsed: any = null;
    let engineUsed = "unknown";

    // 1. Try Groq LPU if configured
    if (useGroq) {
      try {
        const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${groqKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "openai/gpt-oss-120b",
            messages: formattedMessages,
            temperature: 0.7,
            response_format: { type: "json_object" },
          }),
        });

        if (groqRes.ok) {
          const data = await groqRes.json();
          const rawContent = data.choices?.[0]?.message?.content;
          if (rawContent) {
            parsed = JSON.parse(rawContent);
            engineUsed = "groq-120b";
          }
        } else {
          // If Groq returns 400 with failed_generation, attempt syntax repair
          const errText = await groqRes.text();
          try {
            const errJson = JSON.parse(errText);
            const rawGen = errJson?.error?.failed_generation;
            if (rawGen && typeof rawGen === "string") {
              // Repair common LLM grammar typo: closing bookDraft with }, { instead of },
              const repaired = rawGen.replace(/\},\s*\{/g, "},");
              parsed = JSON.parse(repaired);
              engineUsed = "groq-120b-repaired";
            }
          } catch {
            // Repair failed, will proceed to OpenAI fallback
          }
        }
      } catch (groqErr) {
        console.warn("Groq attempt encountered an error, activating OpenAI fallback:", groqErr);
      }
    }

    // 2. Seamless OpenAI fallback (gpt-4o-mini) if Groq failed or was not parsed
    if (!parsed && openaiKey && openaiKey.startsWith("sk-")) {
      try {
        const openAiRes = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${openaiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: formattedMessages,
            temperature: 0.7,
            response_format: { type: "json_object" },
          }),
        });

        if (openAiRes.ok) {
          const data = await openAiRes.json();
          const rawContent = data.choices?.[0]?.message?.content;
          if (rawContent) {
            parsed = JSON.parse(rawContent);
            engineUsed = "openai-gpt-4o-mini";
          }
        } else {
          console.error("OpenAI fallback failed with status:", openAiRes.status, await openAiRes.text());
        }
      } catch (openAiErr) {
        console.error("OpenAI fallback error:", openAiErr);
      }
    }

    if (!parsed) {
      return NextResponse.json(
        { success: false, error: "Unable to parse valid AI consultation response. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      reply: parsed.reply,
      discussionStage: parsed.discussionStage || (parsed.isReadyForProof ? "concept_locked" : "brainstorming"),
      isReadyForProof: Boolean(parsed.isReadyForProof),
      titleOptions: Array.isArray(parsed.titleOptions) ? parsed.titleOptions : [],
      bookDraft: parsed.bookDraft,
      quickReplies: parsed.quickReplies || [],
      printAdvisory: parsed.printAdvisory || { hasRisk: false },
      engine: engineUsed,
    });
  } catch (error: any) {
    console.error("Error in PaperTales AI chat:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate AI response" },
      { status: 500 }
    );
  }
}
