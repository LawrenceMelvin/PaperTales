import { NextRequest, NextResponse } from "next/server";

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

type DiscussionStage = "discovery" | "designing" | "brief_review" | "concept_locked" | "revising";

interface ProjectState {
  title?: string;
  subtitle?: string;
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
}

const VALID_STAGES: DiscussionStage[] = ["discovery", "designing", "brief_review", "concept_locked", "revising"];

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
- memory_book: keepsakes, family archives, travelogues, journals, personal milestones.
- math_book: counting quests, puzzles, arithmetic word problems.
- science_book: space, fossils, ocean, STEM learning.

GENERAL RULES:
1. Greet ONLY on the very first assistant turn. Never repeat "Welcome to PaperTales".
2. Never invent themes, animals, characters, or page counts the creator did not mention. Offer options instead and let them choose.
3. Never assume the book is for a child. Only ask about a child if the creator says it is for a child.
4. Always respond directly to the creator's LATEST message first. If they asked a question, answer it. If they asked for a change, apply it.
5. Keep replies concise and warm (2-5 short sentences, or a short bulleted summary in brief_review). Ask at most 2 questions per turn.

THE DESIGN BRIEF (fill progressively in "designBrief"; use null for unknown fields):
- purpose: why the book exists (gift, personal journal, classroom, keepsake...)
- audience: who will use/read it
- bookType: journal, storybook, coloring book, workbook, photo keepsake...
- theme: subject matter / motifs
- artStyle: illustration style, line weight, mood, color vs black & white
- pageStructure: what a typical interior page contains (empty lined pages, prompts, ruled lines, borders, sections, story text + illustration...)
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
4. "concept_locked": ONLY when the creator explicitly approves the brief summary you presented (or explicitly asks to skip ahead and design now). Set isReadyForProof = true. Briefly confirm and say you're ready to design the free Master Page 1 proof.
5. "revising": the project is already locked or a proof already exists (see CURRENT PROJECT STATE) and the creator asks for a change. Apply the change to bookDraft/designBrief, confirm ONLY what changed (do not restate the whole brief or the title), list the edits in "changes", set requiresNewProof = true if the change affects visuals/content (theme, style, character, structure, title, genre, trim), and set isReadyForProof = true when the brief is still complete.

TITLE RULES:
- If a title is already locked (see CURRENT PROJECT STATE), do NOT restate or re-confirm it, and keep "titleOptions": [] unless the creator explicitly asks for new or different titles.

PRICING (only mention when relevant or asked): first 5 pages free; extra pages ~$0.17/page; Lulu print ~$4.14 + tracked shipping ~$5.69.
If the creator mentions a page or day count (e.g. "15 day journal", "30 pages"), set pageCount to that integer.

QUICK REPLIES: 2-3 short first-person phrases the creator might say next (e.g. "Soft watercolor style", "Add ruled lines with a daily prompt"). Never meta-instructions like "Pick a title".

COPYRIGHT: If a known franchise is referenced (Disney, Marvel, Pokemon, etc.), don't refuse. Fill "printAdvisory" with a print-safe homage title/character.

OUTPUT: a single flat JSON object with exactly these keys:
{
  "reply": string,
  "discussionStage": "discovery" | "designing" | "brief_review" | "concept_locked" | "revising",
  "isReadyForProof": boolean,
  "titleOptions": [],
  "designBrief": { "purpose": string|null, "audience": string|null, "bookType": string|null, "theme": string|null, "artStyle": string|null, "pageStructure": string|null, "pageCount": number|null, "trimSize": string|null, "title": string|null },
  "missingFields": string[],
  "changes": [ { "field": string, "from": string|null, "to": string } ],
  "requiresNewProof": boolean,
  "bookDraft": {
    "title": string, "subtitle": string,
    "genre": "coloring_book" | "memory_book" | "math_book" | "science_book",
    "characterName": string, "characterType": string, "characterTraits": string[],
    "prompt": "Detailed visual + content description of the book that reflects the full current brief",
    "pageStructure": "Summary of page interior structure, sections, prompts, or line layouts requested",
    "layoutType": "empty_lined" | "guided_sections" | "classic_prompt",
    "borderText": string | null,
    "borderStyle": "robotic" | "modern" | "playful" | "none",
    "cornerDecorations": "tech_brackets" | "gears" | "minimal" | "none",
    "interiorColor": "black_and_white" | "standard_color",
    "pageCount": number, "trimSize": "6x9" | "8.5x8.5" | "8.5x11",
    "recommendedAction": "design_hero_page",
    "designerNote": string,
    "channel3Query": "search query for companion supplies"
  },
  "quickReplies": string[],
  "printAdvisory": { "hasRisk": boolean, "franchiseName": string|null, "safeTitle": string|null, "safeCharacter": string|null, "explanation": string|null }
}
"changes" is [] unless discussionStage is "revising". Output valid JSON only, no markdown.`;

function buildStateMessage(state: ProjectState | undefined, lockedTitle: string | null, hasProof: boolean): string {
  const lines = [
    "CURRENT PROJECT STATE (source of truth for the studio; apply the creator's edits on top of this):",
    `- Locked title: ${lockedTitle ? `"${lockedTitle}"` : "none yet"}`,
    `- Page 1 proof already generated: ${hasProof ? "YES (any visual/content change requires a new proof)" : "no"}`,
  ];
  if (state) {
    if (state.genre) lines.push(`- Lane/genre: ${state.genre}`);
    if (state.pageCount) lines.push(`- Page count: ${state.pageCount}`);
    if (state.trimSize) lines.push(`- Trim size: ${state.trimSize}`);
    if (state.characterName || state.characterType)
      lines.push(`- Character/protagonist: ${state.characterName || "?"} (${state.characterType || "?"})`);
    if (state.pageStructure) lines.push(`- Requested page interior structure & sections: ${state.pageStructure}`);
    if (state.layoutType) lines.push(`- Interior page layout type: ${state.layoutType}`);
    if (state.borderText) lines.push(`- Perimeter border text: "${state.borderText}"`);
    if (state.borderStyle) lines.push(`- Border font/style: ${state.borderStyle}`);
    if (state.cornerDecorations) lines.push(`- Corner decorations: ${state.cornerDecorations}`);
    if (state.interiorColor) lines.push(`- Interior print color: ${state.interiorColor}`);
    if (state.prompt) lines.push(`- Current book description: ${state.prompt}`);
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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages: ChatMessage[] = Array.isArray(body.messages) ? body.messages : [];
    const projectState: ProjectState | undefined = body.projectState;
    const hasProof = Boolean(body.hasProof);

    const openaiKey = process.env.OPENAI_API_KEY;
    const groqKey = process.env.GROQ_API_KEY;
    const hasOpenAI = Boolean(openaiKey && openaiKey.startsWith("sk-"));
    const hasGroq = Boolean(groqKey && groqKey.startsWith("gsk_"));

    if (!hasOpenAI && !hasGroq) {
      return NextResponse.json(
        { success: false, error: "Neither OPENAI_API_KEY nor GROQ_API_KEY is configured" },
        { status: 500 }
      );
    }

    const lockedTitle: string | null = detectLockedTitle(messages) || body.lockedTitle || null;
    const latestUser = [...messages].reverse().find((m) => m.role === "user")?.content || "";
    const userWantsNewTitles = NEW_TITLE_REQUEST_PATTERN.test(latestUser);

    const formattedMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "system", content: buildStateMessage(projectState, lockedTitle, hasProof) },
      ...messages.map((m) => ({ role: m.role, content: m.content })),
    ];

    let parsed: any = null;
    let engineUsed = "unknown";

    // 1. OpenAI is the primary designer model.
    if (hasOpenAI) {
      const model = process.env.OPENAI_CHAT_MODEL || "gpt-4.1";
      try {
        parsed = await callModel("https://api.openai.com/v1/chat/completions", openaiKey!, model, formattedMessages);
        if (parsed) engineUsed = `openai-${model}`;
      } catch (err) {
        console.warn("OpenAI attempt failed, falling back to Groq:", err);
      }
    }

    // 2. Groq fallback.
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

    // Never lock while required brief fields are still missing (unless already revising a proofed book).
    if (stage === "concept_locked" && missingFields.length > 0 && !hasProof) {
      stage = "brief_review";
      isReadyForProof = false;
    }
    if (stage === "discovery" || stage === "designing" || stage === "brief_review") {
      isReadyForProof = false;
    }
    if (stage === "concept_locked") isReadyForProof = true;

    // Title guard: no repeated title suggestions once a title is locked.
    let titleOptions: string[] = Array.isArray(parsed.titleOptions) ? parsed.titleOptions.slice(0, 3) : [];
    if (lockedTitle && !userWantsNewTitles) titleOptions = [];

    const bookDraft = parsed.bookDraft ? { ...parsed.bookDraft } : undefined;
    if (bookDraft && lockedTitle && !userWantsNewTitles && !bookDraft.title) {
      bookDraft.title = lockedTitle;
    }

    const changes = Array.isArray(parsed.changes) ? parsed.changes : [];
    const requiresNewProof = hasProof && (Boolean(parsed.requiresNewProof) || changes.length > 0);

    return NextResponse.json({
      success: true,
      reply: parsed.reply,
      discussionStage: stage,
      isReadyForProof,
      titleOptions,
      designBrief: parsed.designBrief || null,
      missingFields,
      changes,
      requiresNewProof,
      lockedTitle,
      bookDraft,
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
