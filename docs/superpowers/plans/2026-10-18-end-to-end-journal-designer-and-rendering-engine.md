# End-to-End Journal Designer & Rendering Engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Connect the PaperTales chat consultation directly into OpenAI `gpt-4.1` story generation, interactive 3D BookViewer, and Lulu POD PDF compiler to seamlessly render creator-specified book specs—including empty lined layouts, robotic perimeter text borders (`"coding----coding"`), corner tech decorations, and true black & white interior printing.

**Architecture:** 
1. **Data Contract:** Extend `JournalPageData` and `BookDraftData` with `layoutType`, `borderText`, `borderStyle`, `cornerDecorations`, and `lineRuleSpacing`.
2. **AI Engine:** Pass the locked `designBrief` directly into OpenAI `gpt-4.1` via `/api/ai/story`, replacing conflicting hardcoded prompt examples with dynamic layout templates.
3. **Studio Orchestration:** Add a direct 1-click `"🎨 Design Master Page 1 Proof Now"` action right in the chat ready card, auto-triggering hero page generation with a live progress spinner.
4. **Book Viewer & PDF Renderer:** Render perimeter text borders (in monospace/Courier font), corner tech decorations (brackets/terminal tags), full-page empty lines, and strict monochrome styling.

**Tech Stack:** Next.js 14 App Router, TypeScript, OpenAI API (`gpt-4.1`), React, TailwindCSS, `pdf-lib` (with `StandardFonts.CourierBold` and perimeter rotation).

---

## Global Constraints

- **Language Matching:** All user-facing text and chat prompts remain strictly in English.
- **Explicit Approval:** No production code modifications execute without explicit user approval of this plan.
- **Empirical Verification:** Test API responses and build compilation (`npm run build`) before declaring completion.
- **Aesthetic Excellence:** Monospace/robotic borders and corner accents must feel crisp, balanced, and premium.

---

## Proposed Changes

### Component 1: Data Contracts (`src/types/book.ts`)

#### [MODIFY] `src/types/book.ts`
- Extend `JournalPageData`:
  ```ts
  export type JournalLayoutType = "empty_lined" | "guided_sections" | "classic_prompt";
  export type JournalBorderStyle = "robotic" | "modern" | "playful" | "none";
  export type JournalCornerDecorations = "tech_brackets" | "gears" | "minimal" | "none";
  export type JournalLineSpacing = "wide" | "college";

  export interface JournalPageData {
    dayNumber: number;
    datePlaceholder?: string;
    headerCategory?: string;
    moodTracker?: boolean;
    quote?: string;
    reflectionPrompt?: string;
    gratitudePrompts?: string[];
    doodlePrompt?: string;
    ruledLinesCount?: number;
    sections?: JournalSection[];
    // Extended design specs
    layoutType?: JournalLayoutType;
    borderText?: string;
    borderStyle?: JournalBorderStyle;
    cornerDecorations?: JournalCornerDecorations;
    lineRuleSpacing?: JournalLineSpacing;
  }
  ```

---

### Component 2: Chat Route Specifications (`src/app/api/ai/chat/route.ts`)

#### [MODIFY] `src/app/api/ai/chat/route.ts`
- Update `SYSTEM_PROMPT`:
  - Teach the designer persona to explicitly extract:
    - `borderText`: e.g. `"coding----coding"`
    - `borderStyle`: e.g. `"robotic"`, `"modern"`
    - `cornerDecorations`: e.g. `"tech_brackets"`, `"gears"`, `"none"`
    - `layoutType`: `"empty_lined"` when user specifies empty lines, blank lines, or no prompts; `"guided_sections"` when multi-sections requested; `"classic_prompt"` for single prompt.
    - `lineRuleSpacing`: `"college"` vs `"wide"`
    - `interiorColor`: `"black_and_white"` vs `"standard_color"`
  - Include these fields in `bookDraft` in the JSON schema.
- Update `ProjectState` interface to hold these fields.

---

### Component 3: Story Generation Engine (`src/app/api/ai/story/route.ts`)

#### [MODIFY] `src/app/api/ai/story/route.ts`
- Accept the extended design parameters in request body:
  `layoutType`, `borderText`, `borderStyle`, `cornerDecorations`, `lineRuleSpacing`, `interiorColor`.
- Detect `"empty_lined"` from `layoutType`, `prompt`, or `pageStructure` (e.g. regex for `empty\s*lined|blank\s*lines|no\s*prompts|open\s*space`).
- Dynamic System Prompt for OpenAI `gpt-4.1`:
  - If `layoutType === "empty_lined"`:
    - Instruct the model to output `"journalData.layoutType": "empty_lined"`, `"sections": null`, `"reflectionPrompt": null`, `"ruledLinesCount": 18`.
    - Provide a schema example matching empty lined format (no hardcoded "I will do" or "What I did").
  - If `layoutType === "guided_sections"`:
    - Output requested sections.
- Propagate `borderText`, `borderStyle`, `cornerDecorations`, and `layoutType` to every page in `finalBookProject`.
- Update fallback generator to also generate clean empty lined pages with the border specs when AI call falls back.

---

### Component 4: Studio Page Orchestration (`src/app/studio/page.tsx`)

#### [MODIFY] `src/app/studio/page.tsx`
- Add state variables:
  - `borderText`, `borderStyle`, `cornerDecorations`, `layoutType`, `lineRuleSpacing`.
- Synchronize these fields from `data.bookDraft` in `handleSendMessage`.
- Pass these fields into `/api/ai/story` in both `handleDesignHeroPage` and `handleExpandFullSpread`.
- When the assistant sets `isReadyForProof: true`:
  - Provide a primary direct action button in the chat transition banner:
    `🎨 Design Master Page 1 Proof Now (Instant Free Preview)`.
  - When clicked, immediately trigger `handleDesignHeroPage()` with a visible loading spinner (`"PaperTales is designing your Master Page 1 proof with OpenAI..."`) and automatically smooth-scroll down to the Book Display once complete.

---

### Component 5: Interactive 3D Book Viewer (`src/components/BookViewer.tsx`)

#### [MODIFY] `src/components/BookViewer.tsx`
- In `renderJournalPage`:
  - **Perimeter Text Border:** If `page?.journalData?.borderText` exists:
    - Render a perimeter text frame running around the margins.
    - Top & bottom edges: repeating string (e.g. `coding----coding`).
    - Left & right edges: vertical oriented text with `[writing-mode:vertical-rl]`.
    - Apply `font-mono tracking-widest text-[9px] uppercase font-bold text-slate-800` when `borderStyle === "robotic"`.
  - **Corner Tech Accents:** If `cornerDecorations === "tech_brackets"`:
    - Render SVG corner brackets (`{ }`, `</>`) or tech nodes in the 4 corners.
  - **Empty Lined Layout:** If `layoutType === "empty_lined"`:
    - Render Day Header (`DAY 1`), Title (`My Coding Progress Log`), and Date.
    - Render 18-20 continuous clean ruled lines across the whole page.
    - Omit any unsolicited prompt text or section badges.
  - **Black & White Mode:** If `book.format.interiorColor === "black_and_white"`:
    - Use strict monochrome styling: black text, neutral slate borders, grayscale/white badges (replace amber/sky/emerald colors with crisp high-contrast black & white).
  - **Spread Harmony:**
    - When rendering Page 2 on a single-page hero proof, render a matching empty lined layout so the 2-page spread looks completely harmonious.

---

### Component 6: Lulu POD PDF Compiler (`src/lib/pdf-builder.ts`)

#### [MODIFY] `src/lib/pdf-builder.ts`
- In `drawJournalPage`:
  - **Monospace Font:** Embed `StandardFonts.CourierBold` for robotic tech journals.
  - **Perimeter Text:**
    - If `page.journalData?.borderText` is present:
      - Draw top edge repeating text using `CourierBold`.
      - Draw bottom edge repeating text.
      - Draw left edge rotated text (`degrees(90)`).
      - Draw right edge rotated text (`degrees(270)`).
  - **Corner Tech Accents:**
    - Draw corner brackets `{ }` in Courier Bold at `(safeMargin, height - safeMargin)` etc.
  - **Empty Lined Layout:**
    - If `layoutType === "empty_lined"`, draw continuous ruled lines from header to bottom margin without drawing section prompt text.
  - **Black & White:**
    - Ensure all text and lines use pure black and grayscale `rgb(0, 0, 0)` and `rgb(0.75, 0.75, 0.75)`.

---

## Verification Plan

### Automated Build & Diagnostics
1. Run diagnostic script: `node scratch/test-chat-diagnostics.mjs` to verify chat brief extraction with the new fields.
2. Run test story generation script to verify OpenAI `gpt-4.1` returns `empty_lined` pages with `borderText: "coding----coding"`, `borderStyle: "robotic"`, and `cornerDecorations: "tech_brackets"`.
3. Run project build: `npm run build` to ensure 0 TypeScript or lint errors.

### Manual Verification in Studio UI
1. Open `http://localhost:3000/studio`.
2. Follow the user's exact flow:
   - "I want to create 12 day journal book, where I can track my coding progress."
   - "Just me, I want the boder of the journal to say 'coding----coding' like this,"
   - "just empty lined pages"
   - "square size is good"
   - "I want the boding in a robatic format"
   - "I pick the title: 'My Coding Progress Log'"
   - "yes you can include some small tech themed illustrations"
   - "Looks perfect, let's design page 1"
3. Verify that:
   - A single click on `"Design Master Page 1 Proof Now"` immediately starts generation with a loading spinner.
   - The generated proof in `BookViewer` renders the robotic `"coding----coding"` perimeter border.
   - The 4 corners feature tech code brackets.
   - The page has clean empty ruled lines with no "I will do" or "What I did" prompts.
   - The interior is strict black and white.
   - Downloading the PDF proof produces a matching physical print PDF with the perimeter border and tech brackets.
