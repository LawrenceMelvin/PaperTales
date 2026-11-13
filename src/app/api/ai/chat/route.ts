import { NextRequest, NextResponse } from "next/server";
import { EditingPageReference } from "@/types/book";

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

type DiscussionStage =
  | "discovery"
  | "designing"
  | "brief_review"
  | "concept_locked"
  | "page_planning"
  | "page_plan_confirmed"
  | "revising"
  | "cover_design";

interface ProjectState {
  title?: string;
  subtitle?: string;
  authorName?: string;
  genre?: string;
  pageCount?: number;
  trimSize?: string;
  characterName?: string;
  characterType?: string;
  characterTraits?: string[];
  prompt?: string;
  pageStructure?: string;
  layoutType?: "empty_lined" | "guided_sections" | "classic_prompt";
  borderText?: string;
  borderStyle?: "robotic" | "modern" | "playful" | "none";
  cornerDecorations?: "tech_brackets" | "gears" | "minimal" | "none";
  interiorColor?: "black_and_white" | "standard_color";
  artStyle?: string;
  showPageNumbers?: boolean;
  singleSidedColoring?: boolean;
  coverPrompt?: string;
  backCoverText?: string;
  coverColorScheme?: "midnight_black" | "midnight_glacier" | "warm_cream" | "storybook_vibrant" | "minimal_monochrome";
}

const VALID_STAGES: DiscussionStage[] = [
  "discovery",
  "designing",
  "brief_review",
  "concept_locked",
  "page_planning",
  "page_plan_confirmed",
  "revising",
  "cover_design",
];

const TITLE_PICK_PATTERN = /I (?:pick|choose) the (?:print-safe )?title:\s*["“](.+?)["”]/i;
const NEW_TITLE_REQUEST_PATTERN =
  /\b(new|different|other|more|another|change|rename|alternative)\b[^.?!]*\btitles?\b|\btitles?\b[^.?!]*\b(ideas|options|suggestions)\b/i;

/** Finds the most recent title the user explicitly locked in the conversation. */
function detectLockedTitle(messages: ChatMessage[]): string | null {
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    if (m.role !== "user") continue;
    const match = m.content.match(TITLE_PICK_PATTERN);
    if (match) return match[1].trim();
  }
  return null;
}

const SYSTEM_PROMPT = `You are PaperTales, a senior personal book designer and art director. You help creators design physical printed books (Lulu print-on-demand, PayPal checkout).
You behave like a real human designer in a paid consultation: curious, specific, opinionated when helpful, and you NEVER rush the client into production.

SUPPORTED LANES (bookDraft.genre):
- coloring_book: 300 DPI vector line art, clean outlines, no dark fills. Also used for guided journals/planners with illustrated borders.
- activity_book: interactive science/nature/space learning, mazes, word searches, puzzles, observation games, and alternating activity/fact pages.
- science_book: space, astronomy, paleontology/fossils, ocean, STEM learning, exploration missions.
- math_book: counting quests, logic puzzles, arithmetic word problems.
- storybook: rich children's bedtime tales, narrative journeys, character adventures.
- memory_book: keepsakes, family archives, travelogues, journals, personal milestones.

GENERAL RULES:
1. Greet ONLY on the very first assistant turn. Never repeat "Welcome to PaperTales".
2. Never invent themes, animals, characters, or page counts the creator did not mention. NEVER use "Barnaby" or "Golden Retriever Puppy" unless the creator explicitly named Barnaby. If the creator did not specify a single named character, set bookDraft.characterName = "", bookDraft.characterType = "", and bookDraft.characterTraits = [].
3. Never assume the book is for a child. Only ask about a child if the creator says it is for a child.
4. Always respond directly to the creator's LATEST message first. If they asked a question, answer it. If they asked for a change, apply it.
5. Keep replies concise and warm (2-5 short sentences, or a clear bulleted breakdown when in brief_review or page_planning). Ask at most 2 questions per turn.
6. Page numbers are hidden by default (bookDraft.showPageNumbers = false). Set bookDraft.showPageNumbers = true ONLY if the creator explicitly asks to include or show page numbers on the pages.
7. Single-Sided Coloring Bleed-Guard: For coloring_book lane, proactively ask during designing or page planning whether the creator wants Single-Sided Coloring Pages (leaving the reverse side of each coloring sheet blank/bleed-guard so watercolor, paint, and markers never bleed through to the next drawing). If they say yes, set bookDraft.singleSidedColoring = true. Provide quickReplies: ["Yes, single-sided (marker & paint safe)", "Double-sided with story/titles on left"].
8. Attached Page Reference Editing: If the creator attached a specific page or cover to edit (see CURRENT PROJECT STATE: Editing Attached Reference), prioritize fulfilling their requested change for that specific page or cover.
   - If they request text changes or illustration changes to that page, return "pageEdit": { "pageNumber": number, "title"?: string, "storyText"?: string, "imagePrompt"?: string, "regenerateArt"?: boolean }.
   - If the attached reference is the Front Cover (pageNumber === 0), update "coverDraft".
   - Acknowledge the update directly and set discussionStage = "revising".

COLOR & PRINT GUIDELINES:
- interiorColor: If the creator requested colorful illustrations, vibrant colors, watercolors, digital painting, or full color, ALWAYS set interiorColor to "standard_color". If the book is a coloring book, monochrome journal, sketch, or black & white line art, set interiorColor to "black_and_white".

THE DESIGN BRIEF (fill progressively in "designBrief"; use null for unknown fields):
- purpose: why the book exists (gift, personal journal, classroom, keepsake...)
- audience: who will use/read it
- bookType: journal, storybook, coloring book, activity book, workbook, photo keepsake...
- theme: subject matter / motifs
- artStyle: illustration style, line weight, mood, color vs black & white
- pageStructure: what a typical interior page contains (e.g. alternating activity and fact pages, guided sections, empty lined pages, prompts, borders...)
- pageCount: integer
- trimSize: "6x9" (journals/novels), "8.5x8.5" (picture/coloring books), or "8.5x11" (workbooks/activity)
- title: the chosen title (only once the creator has picked or written one)
REQUIRED before the brief can be locked: purpose, audience, bookType, theme, artStyle, pageStructure, pageCount, title.
"missingFields" MUST list every REQUIRED field that is still null.

STAGES ("discussionStage"):
1. "discovery": the creator has only a vague idea. Ask about purpose/audience and the kind of book. Offer 3 example directions as quickReplies.
2. "designing": progressively fill the brief. Each turn, acknowledge what they said, add a brief designer suggestion, and ask about the 1-2 most important missing fields (e.g. art style options, what goes on each page, how many pages/days).
   - Offer exactly 3 tailored title options in "titleOptions" ONCE theme and bookType are known and no title is chosen yet. Otherwise "titleOptions" MUST be [].
   - Picking a title fills the title field only. It does NOT finish the consultation if other required fields are missing.
3. "brief_review": all required fields are filled. Present a short bulleted summary of the full brief and ask the creator to approve it or request changes. quickReplies should include an approval phrase like "Looks perfect, let's design page 1" and a change option.
4. "concept_locked": ONLY when the creator explicitly approves the brief summary you presented (or explicitly asks to skip ahead and design now) AND Page 1 proof has NOT been generated yet. Set isReadyForProof = true. Briefly confirm and say you're ready to design the free Master Page 1 proof.
5. "page_planning": Page 1 proof is ALREADY generated (see CURRENT PROJECT STATE: Page 1 proof already generated = YES) and the creator is ready to plan the remaining pages (Pages 2..N) or discussing what the other pages will contain and look like.
   - MANDATORY BEFORE GENERATING PAGES 2..N: Never skip directly to generating the remaining pages without first presenting the plan for Pages 2..N and getting explicit user confirmation!
   - For STORYBOOKS, COLORING BOOKS, ACTIVITY BOOKS, MATH, or SCIENCE BOOKS: Present a concise page-by-page plan for Pages 2..N (what each page will have and what its illustration/activity will look like) matching the approved Page 1 style and borders. Ask the creator if they want to change or add details to any page, or confirm the plan. Provide quickReplies like ["Confirm page plan & generate book", "Let's customize a few pages first"].
   - For JOURNALS or NOTEBOOKS: Ask and confirm how the creator wants Pages 2..N to flow — e.g. keep the exact same page template/lines on every page, OR rotate unique daily prompts, quotes, or spot illustrations on each page — and summarize the plan. Provide quickReplies like ["Confirm: keep the same layout on all pages", "Confirm: vary daily prompts on each page"].
   - While presenting or refining the plan in "page_planning", set isPagePlanConfirmed = false and requiresNewProof = false.
6. "page_plan_confirmed": Page 1 proof is ALREADY generated, you ALREADY presented the Page 2..N plan (or journal page structure options), and the creator's latest message explicitly CONFIRMS/APPROVES the plan for the remaining pages.
   - Set discussionStage = "page_plan_confirmed", isPagePlanConfirmed = true, requiresNewProof = false, and bookDraft.recommendedAction = "expand_full_spread".
   - Remind them that the first 5 pages will be generated 100% free right now (and any pages beyond 5 will appear as a blurred preview ready to unlock anytime).
7. "revising": Page 1 proof already exists and the creator asks to change the visual layout, border, page number visibility, or art style of Page 1 itself. Apply the change to bookDraft/designBrief, confirm ONLY what changed, list the edits in "changes", and set requiresNewProof = true so they can redesign Page 1 proof.
8. "cover_design": All interior pages are ALREADY generated (see CURRENT PROJECT STATE: Full interior pages generated = YES), OR the creator asks to design/customize the Front Book Cover in this same conversation.
   - Reference the book's exact title, subject matter, and interior tone/style from the project (do NOT default to website cream colors or unrelated children's mascots unless the book itself is a children's book).
   - Always pitch a clear Cover Concept Proposal for confirmation covering three parts:
     1) Cover Color ("colorScheme": "midnight_black" | "midnight_glacier" | "warm_cream" | "storybook_vibrant" | "minimal_monochrome"),
     2) Detailed Front Cover Design ("coverPrompt": pure visual artwork description, zero rendered text/letters inside the artwork),
     3) Detailed Back Cover Design / Blurb ("backCoverText": 1-3 concise sentences matching the book's topic).
   - If the user explicitly describes a custom cover scene (e.g., "black cover with golden man standing in the bottom middle and money pouring on him"), copy their exact visual subject, placement, colors, and mood verbatim into "coverPrompt" without substituting different characters or styles, and pick the matching "colorScheme" (e.g. "midnight_black" for pure/jet black covers).
   - Populate "coverDraft" and set coverDraft.isReadyForCover = true as soon as you propose a concept or the creator describes/approves one. Set bookDraft.recommendedAction = "design_book_cover".

TITLE RULES:
- If a title is already locked (see CURRENT PROJECT STATE), do NOT restate or re-confirm it, and keep "titleOptions": [] unless the creator explicitly asks for new or different titles.

PRICING (only mention when relevant or asked): first 5 pages free; extra pages ~$0.17/page; Lulu print ~$4.14 + tracked shipping ~$5.69.
If the creator mentions a page or day count (e.g. "15 day journal", "30 pages"), set pageCount to that integer.

QUICK REPLIES: 2-3 short first-person phrases the creator might say next (e.g. "Playful colorful illustrations", "Alternating activity and fact pages"). Never meta-instructions like "Pick a title".

COPYRIGHT: If a known franchise is referenced (Disney, Marvel, Pokemon, etc.), don't refuse. Fill "printAdvisory" with a print-safe homage title/character.

OUTPUT: a single flat JSON object with exactly these keys:
{
  "reply": string,
  "discussionStage": "discovery" | "designing" | "brief_review" | "concept_locked" | "page_planning" | "page_plan_confirmed" | "revising" | "cover_design",
  "isReadyForProof": boolean,
  "isPagePlanConfirmed": boolean,
  "titleOptions": [],
  "designBrief": { "purpose": string|null, "audience": string|null, "bookType": string|null, "theme": string|null, "artStyle": string|null, "pageStructure": string|null, "pageCount": number|null, "trimSize": string|null, "title": string|null },
  "missingFields": string[],
  "changes": [ { "field": string, "from": string|null, "to": string } ],
  "requiresNewProof": boolean,
  "bookDraft": {
    "title": string, "subtitle": string,
    "genre": "coloring_book" | "storybook" | "memory_book" | "activity_book" | "math_book" | "science_book",
    "artStyle": string,
    "characterName": string, "characterType": string, "characterTraits": string[],
    "prompt": "Detailed visual + content description of the book that reflects the full current brief and page plan",
    "pageStructure": "Summary of page interior structure, page-by-page plan, sections, prompts, or line layouts requested",
    "layoutType": "empty_lined" | "guided_sections" | "classic_prompt",
    "borderText": string | null,
    "borderStyle": "robotic" | "modern" | "playful" | "none",
    "cornerDecorations": "tech_brackets" | "gears" | "minimal" | "none",
    "interiorColor": "black_and_white" | "standard_color",
    "showPageNumbers": boolean,
    "singleSidedColoring": boolean,
    "pageCount": number, "trimSize": "6x9" | "8.5x8.5" | "8.5x11",
    "recommendedAction": "design_hero_page" | "plan_remaining_pages" | "expand_full_spread" | "design_book_cover",
    "designerNote": string,
    "channel3Query": "search query for companion supplies"
  },
  "pageEdit": {
    "pageNumber": number,
    "title"?: string,
    "storyText"?: string,
    "imagePrompt"?: string,
    "regenerateArt"?: boolean
  } | null,
  "coverDraft": {
    "title": string | null,
    "subtitle": string | null,
    "authorByline": string | null,
    "coverPrompt": "Detailed visual prompt for the front cover artwork matching the book's topic (preserving exact user scene requests verbatim, no text inside image)" | null,
    "backCoverText": "Concise 1-3 sentence back cover blurb matching the book's exact topic" | null,
    "colorScheme": "midnight_black" | "midnight_glacier" | "warm_cream" | "storybook_vibrant" | "minimal_monochrome" | null,
    "isReadyForCover": boolean
  },
  "quickReplies": string[],
  "printAdvisory": { "hasRisk": boolean, "franchiseName": string|null, "safeTitle": string|null, "safeCharacter": string|null, "explanation": string|null }
}
"changes" is [] unless discussionStage is "revising", "page_planning", "page_plan_confirmed", or "cover_design". Output valid JSON only, no markdown.`;

function buildStateMessage(
  state: ProjectState | undefined,
  lockedTitle: string | null,
  hasProof: boolean,
  hasFullBook: boolean,
  hasCover: boolean,
  hasPlannedPages: boolean,
  editingPageReference?: EditingPageReference
): string {
  const lines = [
    "CURRENT PROJECT STATE (source of truth for the studio; apply the creator's edits on top of this):",
    `- Locked title: ${lockedTitle ? `"${lockedTitle}"` : "none yet"}`,
    `- Page 1 proof already generated: ${hasProof ? "YES (Before generating remaining pages, guide the creator through 'page_planning' and wait for their confirmation to move to 'page_plan_confirmed')" : "no"}`,
    `- Page 2..N plan already presented in chat: ${hasPlannedPages ? "YES" : "no"}`,
    `- Full interior pages generated: ${hasFullBook ? "YES (all interior pages are generated! Guide the creator to design/refine the Front Book Cover in stage 'cover_design')" : "no"}`,
    `- Front Book Cover already generated: ${hasCover ? "YES (creator can tweak the cover or interior)" : "no"}`,
  ];
  if (editingPageReference) {
    lines.push(
      `- Editing Attached Reference: ${editingPageReference.isCover ? "Front Book Cover (Index 0)" : `Page ${editingPageReference.pageNumber} ("${editingPageReference.title}")`}`
    );
    if (editingPageReference.storyText) lines.push(`- Attached page story text: "${editingPageReference.storyText}"`);
    if (editingPageReference.imagePrompt) lines.push(`- Attached page illustration prompt: "${editingPageReference.imagePrompt}"`);
  }
  if (state) {
    if (state.genre) lines.push(`- Lane/genre: ${state.genre}`);
    if (state.pageCount) lines.push(`- Page count: ${state.pageCount}`);
    if (state.trimSize) lines.push(`- Trim size: ${state.trimSize}`);
    if (state.authorName) lines.push(`- Author byline: ${state.authorName}`);
    if (state.characterName)
      lines.push(`- Character/protagonist: ${state.characterName} (${state.characterType || ""})`);
    if (state.artStyle) lines.push(`- Art style: ${state.artStyle}`);
    if (state.pageStructure) lines.push(`- Requested page interior structure & sections: ${state.pageStructure}`);
    if (state.layoutType) lines.push(`- Interior page layout type: ${state.layoutType}`);
    if (state.borderText) lines.push(`- Perimeter border text: "${state.borderText}"`);
    if (state.borderStyle) lines.push(`- Border font/style: ${state.borderStyle}`);
    if (state.cornerDecorations) lines.push(`- Corner decorations: ${state.cornerDecorations}`);
    if (state.interiorColor) lines.push(`- Interior print color: ${state.interiorColor}`);
    if (state.showPageNumbers !== undefined) lines.push(`- Show page numbers on pages: ${state.showPageNumbers ? "YES" : "NO"}`);
    if (state.singleSidedColoring !== undefined) lines.push(`- Single-sided coloring pages (bleed-guard): ${state.singleSidedColoring ? "YES" : "NO"}`);
    if (state.prompt) lines.push(`- Current book description: ${state.prompt}`);
    if (state.coverPrompt) lines.push(`- Current cover artwork prompt: ${state.coverPrompt}`);
    if (state.coverColorScheme) lines.push(`- Current cover color scheme: ${state.coverColorScheme}`);
  }
  return lines.join("\n");
}

async function callModel(
  url: string,
  key: string,
  model: string,
  messages: Array<{ role: string; content: string }>
): Promise<any | null> {
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model, messages, temperature: 0.6, response_format: { type: "json_object" } }),
  });

  if (res.ok) {
    const data = await res.json();
    const raw = data.choices?.[0]?.message?.content;
    return raw ? JSON.parse(raw) : null;
  }

  // Groq sometimes returns 400 with a nearly-valid "failed_generation"; attempt a light repair.
  const errText = await res.text();
  try {
    const rawGen = JSON.parse(errText)?.error?.failed_generation;
    if (typeof rawGen === "string") return JSON.parse(rawGen.replace(/\},\s*\{/g, "},"));
  } catch {
    // fall through
  }
  console.error(`Model ${model} failed with status ${res.status}:`, errText.slice(0, 500));
  return null;
}

async function callGeminiChat(
  key: string,
  model: string,
  systemInstructions: string,
  messages: Array<{ role: string; content: string }>
): Promise<any | null> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
  const contents = messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }],
    }));

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: systemInstructions }],
      },
      contents,
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.4,
      },
    }),
  });

  if (res.ok) {
    const data = await res.json();
    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (raw) {
      try {
        const clean = raw.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
        return JSON.parse(clean);
      } catch (parseErr) {
        console.warn("Gemini JSON parse failed, raw output:", raw.slice(0, 300));
      }
    }
  } else {
    const errText = await res.text();
    console.warn(`Gemini chat ${model} failed (${res.status}):`, errText.slice(0, 300));
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages: ChatMessage[] = Array.isArray(body.messages) ? body.messages : [];
    const projectState: ProjectState | undefined = body.projectState;
    const hasProof = Boolean(body.hasProof);
    const hasFullBook = Boolean(body.hasFullBook);
    const hasCover = Boolean(body.hasCover);
    const hasPlannedPages = Boolean(body.hasPlannedPages);
    const editingPageReference: EditingPageReference | undefined = body.editingPageReference;

    const geminiKey = process.env.GEMINI_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;
    const groqKey = process.env.GROQ_API_KEY;
    const hasGemini = Boolean(geminiKey && !geminiKey.startsWith("sb-") && !geminiKey.startsWith("test_"));
    const hasOpenAI = Boolean(openaiKey && openaiKey.startsWith("sk-"));
    const hasGroq = Boolean(groqKey && groqKey.startsWith("gsk_"));

    if (!hasGemini && !hasOpenAI && !hasGroq) {
      return NextResponse.json(
        { success: false, error: "Neither GEMINI_API_KEY, OPENAI_API_KEY, nor GROQ_API_KEY is configured" },
        { status: 500 }
      );
    }

    const lockedTitle: string | null = detectLockedTitle(messages) || body.lockedTitle || null;
    const latestUser = [...messages].reverse().find((m) => m.role === "user")?.content || "";
    const userWantsNewTitles = NEW_TITLE_REQUEST_PATTERN.test(latestUser);
    const allUserText = messages
      .filter((m) => m.role === "user")
      .map((m) => m.content)
      .join(" ");
    const userMentionedBarnaby = /\bbarnaby\b/i.test(allUserText);

    // Strip any unrequested Barnaby defaults from incoming projectState
    const sanitizedState: ProjectState | undefined = projectState
      ? {
          ...projectState,
          characterName:
            !userMentionedBarnaby && /^barnaby$/i.test(projectState.characterName || "")
              ? ""
              : projectState.characterName,
          characterType:
            !userMentionedBarnaby && /golden retriever puppy/i.test(projectState.characterType || "")
              ? ""
              : projectState.characterType,
          characterTraits:
            !userMentionedBarnaby &&
            Array.isArray(projectState.characterTraits) &&
            projectState.characterTraits.some((t) => /red scarf/i.test(t))
              ? []
              : projectState.characterTraits,
        }
      : undefined;

    const formattedMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "system",
        content: buildStateMessage(
          sanitizedState,
          lockedTitle,
          hasProof,
          hasFullBook,
          hasCover,
          hasPlannedPages,
          editingPageReference
        ),
      },
      ...messages.map((m) => ({ role: m.role, content: m.content })),
    ];

    let parsed: any = null;
    let engineUsed = "unknown";

    // 1. Google Gemini is the Tier-1 primary designer model (uses creator GCP credits).
    if (hasGemini) {
      const geminiModel = process.env.GEMINI_CHAT_MODEL || "gemini-3.8-flash";
      const combinedSystem = `${SYSTEM_PROMPT}\n\n${buildStateMessage(
        sanitizedState,
        lockedTitle,
        hasProof,
        hasFullBook,
        hasCover,
        hasPlannedPages,
        editingPageReference
      )}`;
      try {
        parsed = await callGeminiChat(geminiKey!, geminiModel, combinedSystem, messages);
        if (parsed) engineUsed = `gemini-${geminiModel}`;
      } catch (err) {
        console.warn("Gemini attempt failed, falling back to OpenAI/Groq:", err);
      }
    }

    // 2. OpenAI is the Tier-2 backup.
    if (!parsed && hasOpenAI) {
      const model = process.env.OPENAI_CHAT_MODEL || "gpt-4.1";
      try {
        parsed = await callModel("https://api.openai.com/v1/chat/completions", openaiKey!, model, formattedMessages);
        if (parsed) engineUsed = `openai-${model}`;
      } catch (err) {
        console.warn("OpenAI attempt failed, falling back to Groq:", err);
      }
    }

    // 3. Groq fallback.
    if (!parsed && hasGroq) {
      try {
        parsed = await callModel(
          "https://api.groq.com/openai/v1/chat/completions",
          groqKey!,
          "openai/gpt-oss-120b",
          formattedMessages
        );
        if (parsed) engineUsed = "groq-gpt-oss-120b";
      } catch (err) {
        console.error("Groq fallback failed:", err);
      }
    }

    if (!parsed) {
      return NextResponse.json(
        { success: false, error: "Unable to get a valid design consultation response. Please try again." },
        { status: 500 }
      );
    }

    // ---- Server-side guards ----
    let stage: DiscussionStage = VALID_STAGES.includes(parsed.discussionStage) ? parsed.discussionStage : "designing";
    const missingFields: string[] = Array.isArray(parsed.missingFields) ? parsed.missingFields : [];
    let isReadyForProof = Boolean(parsed.isReadyForProof);
    let isPagePlanConfirmed = Boolean(parsed.isPagePlanConfirmed);

    // Check if the user is initiating the post-Page-1 planning step
    const isInitiatingPagePlanning =
      hasProof &&
      !hasFullBook &&
      /\b(plan\s+(the\s+)?remaining\s+pages|what\s+the\s+other\s+pages\s+will\s+have|let'?s\s+plan\s+pages\s+2)\b/i.test(
        latestUser
      );

    // Check if user is explicitly confirming the page plan after planning has started
    const isConfirmingPagePlan =
      hasProof &&
      !hasFullBook &&
      hasPlannedPages &&
      !isInitiatingPagePlanning &&
      /\b(confirm|looks?\s*(great|good|perfect|awesome)|generate\s*(all|the|book|pages|journal)|approve|yes|keep\s+the\s+same\s+layout|vary\s+daily\s+prompts|proceed)\b/i.test(
        latestUser
      );

    if (isInitiatingPagePlanning) {
      stage = "page_planning";
      isPagePlanConfirmed = false;
    } else if (isConfirmingPagePlan || stage === "page_plan_confirmed") {
      if (hasProof && !hasFullBook) {
        if (!hasPlannedPages && !isConfirmingPagePlan) {
          // Enforce at least one planning turn before confirmation
          stage = "page_planning";
          isPagePlanConfirmed = false;
        } else {
          stage = "page_plan_confirmed";
          isPagePlanConfirmed = true;
        }
      }
    } else if (hasProof && !hasFullBook && stage === "concept_locked") {
      stage = hasPlannedPages ? "page_plan_confirmed" : "page_planning";
      isPagePlanConfirmed = hasPlannedPages;
    }

    // If all interior pages are already generated, default into cover_design stage unless revising interior
    const userMentionsCover = /\b(cover|front\s*page|author\s*byline|byline|subtitle|tagline|midnight|warm\s*cream|vibrant|monochrome|emblem)\b/i.test(latestUser);
    if (hasFullBook && (stage === "concept_locked" || stage === "brief_review" || userMentionsCover)) {
      stage = "cover_design";
    }

    // Never lock while required brief fields are still missing (unless already revising a proofed book).
    if (stage === "concept_locked" && missingFields.length > 0 && !hasProof) {
      stage = "brief_review";
      isReadyForProof = false;
    }
    if (stage === "discovery" || stage === "designing" || stage === "brief_review") {
      isReadyForProof = false;
      isPagePlanConfirmed = false;
    }
    if (stage === "concept_locked") isReadyForProof = true;

    // Title guard: no repeated title suggestions once a title is locked.
    let titleOptions: string[] = Array.isArray(parsed.titleOptions) ? parsed.titleOptions.slice(0, 3) : [];
    if (lockedTitle && !userWantsNewTitles) titleOptions = [];

    const bookDraft = parsed.bookDraft ? { ...parsed.bookDraft } : undefined;
    if (bookDraft && lockedTitle && !userWantsNewTitles && !bookDraft.title) {
      bookDraft.title = lockedTitle;
    }

    // Sanitize Barnaby out of bookDraft if user never mentioned Barnaby
    if (bookDraft && !userMentionedBarnaby) {
      if (/^barnaby$/i.test(bookDraft.characterName || "")) {
        bookDraft.characterName = "";
      }
      if (/golden retriever puppy/i.test(bookDraft.characterType || "")) {
        bookDraft.characterType = "";
      }
      if (Array.isArray(bookDraft.characterTraits) && bookDraft.characterTraits.some((t: string) => /red scarf/i.test(t))) {
        bookDraft.characterTraits = [];
      }
    }

    // Detect explicit page number request in chat
    const wantsPageNumbers = /\b(add|show|include|put|with|enable)\s+(page\s*numbers?|numbering)\b/i.test(allUserText);
    const hidePageNumbers = /\b(no|remove|hide|without)\s+(page\s*numbers?|numbering)\b/i.test(latestUser);
    if (bookDraft) {
      if (hidePageNumbers) {
        bookDraft.showPageNumbers = false;
      } else if (wantsPageNumbers || sanitizedState?.showPageNumbers) {
        bookDraft.showPageNumbers = true;
      } else if (bookDraft.showPageNumbers === undefined) {
        bookDraft.showPageNumbers = false;
      }

      // Detect single-sided coloring bleed-guard preferences
      const wantsSingleSided = /\b(single[- ]sided|bleed[- ]guard|marker[- ]safe|paint[- ]safe|leave\s+back\s+blank)\b/i.test(allUserText);
      const wantsDoubleSided = /\b(double[- ]sided|both\s+sides|no\s+blank\s+pages)\b/i.test(latestUser);
      if (wantsDoubleSided) {
        bookDraft.singleSidedColoring = false;
      } else if (wantsSingleSided || sanitizedState?.singleSidedColoring || parsed.bookDraft?.singleSidedColoring) {
        bookDraft.singleSidedColoring = true;
      } else if (bookDraft.singleSidedColoring === undefined) {
        bookDraft.singleSidedColoring = false;
      }
    }

    const changes = Array.isArray(parsed.changes) ? parsed.changes : [];

    // Check if the user is approving Page 1 or planning/confirming the full book
    const isApprovingOrExpanding =
      isInitiatingPagePlanning ||
      isConfirmingPagePlan ||
      stage === "page_planning" ||
      stage === "page_plan_confirmed" ||
      /\b(looks?\s*(great|good|perfect|awesome|nice)|generate\s*(all|the|full)|expand|all\s*\d+\s*pages|proceed|approve|full\s*book|rest\s*of\s*the\s*pages)\b/i.test(
        latestUser
      );
    const visualChanges = changes.filter(
      (c: any) =>
        c?.field &&
        ![
          "pageCount",
          "pages",
          "pageStructure",
          "authorName",
          "authorByline",
          "coverPrompt",
          "cover",
          "colorScheme",
        ].includes(String(c.field))
    );

    const requiresNewProof =
      hasProof &&
      !hasFullBook &&
      !isApprovingOrExpanding &&
      stage !== "cover_design" &&
      (Boolean(parsed.requiresNewProof) || visualChanges.length > 0);

    if (bookDraft) {
      if (hasFullBook || stage === "cover_design") {
        bookDraft.recommendedAction = "design_book_cover";
      } else if (stage === "page_plan_confirmed" || isPagePlanConfirmed) {
        bookDraft.recommendedAction = "expand_full_spread";
      } else if (hasProof && !requiresNewProof) {
        bookDraft.recommendedAction = "plan_remaining_pages";
      }
    }

    const wantsBlackCover = /\b(black\s+cover|jet\s+black|pure\s+black|pitch\s+black|midnight\s+black|black\s+background)\b/i.test(
      latestUser
    );
    const hasExplicitCoverScene =
      (stage === "cover_design" || userMentionsCover) &&
      latestUser.trim().length > 15 &&
      /\b(with|standing|pouring|background|center|middle|bottom|top|gold|golden|man|woman|figure|emblem|minimal|cover|scene|illustration|dark|black|white|cream)\b/i.test(
        latestUser
      ) &&
      !/^(approve|confirm|looks good|generate|design it|yes)/i.test(latestUser.trim());

    const resolvedCoverScheme = wantsBlackCover
      ? "midnight_black"
      : parsed.coverDraft?.colorScheme || projectState?.coverColorScheme || "warm_cream";

    const coverDraft = parsed.coverDraft
      ? {
          title: parsed.coverDraft.title || bookDraft?.title || lockedTitle || projectState?.title || null,
          subtitle: parsed.coverDraft.subtitle || bookDraft?.subtitle || projectState?.subtitle || null,
          authorByline: parsed.coverDraft.authorByline || projectState?.authorName || null,
          coverPrompt: hasExplicitCoverScene
            ? latestUser.trim()
            : parsed.coverDraft.coverPrompt ||
              (stage === "cover_design" ? latestUser : null) ||
              projectState?.coverPrompt ||
              null,
          backCoverText:
            parsed.coverDraft.backCoverText ||
            projectState?.backCoverText ||
            null,
          colorScheme: resolvedCoverScheme,
          isReadyForCover:
            Boolean(parsed.coverDraft.isReadyForCover) ||
            stage === "cover_design" ||
            (hasFullBook && userMentionsCover),
        }
      : stage === "cover_design" || (hasFullBook && userMentionsCover)
      ? {
          title: bookDraft?.title || lockedTitle || projectState?.title || null,
          subtitle: bookDraft?.subtitle || projectState?.subtitle || null,
          authorByline: projectState?.authorName || null,
          coverPrompt: latestUser || projectState?.coverPrompt || projectState?.prompt || null,
          backCoverText: projectState?.backCoverText || null,
          colorScheme: resolvedCoverScheme,
          isReadyForCover: true,
        }
      : null;

    return NextResponse.json({
      success: true,
      reply: parsed.reply,
      discussionStage: stage,
      isReadyForProof,
      isPagePlanConfirmed,
      titleOptions,
      designBrief: parsed.designBrief || null,
      missingFields,
      changes,
      requiresNewProof,
      lockedTitle,
      bookDraft,
      coverDraft,
      pageEdit: parsed.pageEdit || null,
      quickReplies: Array.isArray(parsed.quickReplies) ? parsed.quickReplies : [],
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
