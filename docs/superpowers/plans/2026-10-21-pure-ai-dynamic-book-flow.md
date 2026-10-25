# Pure AI Dynamic Book Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform PaperTales from a hardcoded coloring-book/journal generator into a purely dynamic, AI-driven publishing engine where the creator's chat consultation (genre, art style, page structure, color vs monochrome, trim size) directly and faithfully drives the generated pages, illustrations, UI badges, and Lulu POD specifications.

**Architecture:** 
1. The Chat Assistant extracts and retains `artStyle`, `bookType`, `pageStructure`, and `interiorColor` in `bookDraft`.
2. The Studio Page forwards these full consultation parameters to `/api/ai/story` and `/api/ai/image`.
3. The Story and Image Engines adapt dynamically—using full-color digital illustration prompts and alternating activity/fact schemas when requested, instead of hardcoded coloring-line-art string prefixes.
4. The Book Viewer and PDF Builder render adaptive labels and color layouts matching the agreed brief.
5. Lulu POD integration selects standard color (`FC.STD`) or black & white (`BW.STD`) packages based on the book's format.

**Tech Stack:** Next.js (App Router), TypeScript, OpenAI GPT-4.1 / gpt-image-2.5-sunburst, Pollinations.ai fallback, pdf-lib, Tailwind CSS.

---

## Global Constraints

- Never hardcode genre-specific string prefixes like `"Children's coloring book page outline..."` without checking `artStyle` and `interiorColor`.
- All consultation fields must flow seamlessly from `chat/route.ts` -> `studio/page.tsx` -> `story/route.ts` -> `image/route.ts`.
- Retain existing journal support while expanding full-featured support for `activity_book`, `science_book`, `storybook`, `math_book`, and `coloring_book`.
- Empirical verification before completion: verify with scratch scripts generating both a full-color science activity book and a monochrome coloring/journal book.

---

### Task 1: Unify Types & Chat State Synchronization

**Files:**
- Modify: `src/types/book.ts`
- Modify: `src/app/api/ai/chat/route.ts`
- Modify: `src/app/studio/page.tsx`

**Interfaces:**
- Consumes: User messages and design brief in chat.
- Produces: `BookDraft` containing `artStyle`, `genre` (including `activity_book`, `storybook`), `interiorColor` (`standard_color` vs `black_and_white`), and `pageStructure`.

- [x] **Step 1: Update Book Types**
  Add `artStyle?: string` to `BookDraft`, `BookProject`, and `ProjectState`. Ensure `genre` in `studio/page.tsx` includes all genres: `"coloring_book" | "storybook" | "memory_book" | "activity_book" | "math_book" | "science_book"`.

- [x] **Step 2: Update Chat Route Prompt & Schema**
  In `src/app/api/ai/chat/route.ts`:
  - Include `activity_book` and `storybook` in `SUPPORTED LANES`.
  - Add explicit instruction: *"If artStyle indicates colorful illustrations, vibrant colors, or full color, set `interiorColor: "standard_color"`. If line art, coloring pages, or sketches, set `interiorColor: "black_and_white"`."*
  - Add `"artStyle": string` into the `bookDraft` JSON schema.

- [x] **Step 3: Update Studio Page State Synchronization**
  In `src/app/studio/page.tsx`:
  - Capture `data.bookDraft.artStyle` and store it in state.
  - Forward `artStyle` and `interiorColor` in the request body for `/api/ai/story` (both in `handleDesignHeroPage` and `handleExpandFullSpread`).

---

### Task 2: Dynamic Story & Alternating Page Structure Engine

**Files:**
- Modify: `src/app/api/ai/story/route.ts`

**Interfaces:**
- Consumes: `artStyle`, `interiorColor`, `pageStructure`, `genre`, `trimSize`, `prompt`.
- Produces: `BookPage[]` where page types alternate (e.g. activity vs fact) and visual prompts match the creator's requested art style.

- [x] **Step 1: Dynamic System Prompt in `/api/ai/story`**
  Replace hardcoded `"Lead Publishing Engine for Storybooks & Coloring Adventures (8.5x8.5)"`:
  - Build a dynamic publishing system prompt that adapts to `genre`, `trimSize`, `artStyle`, and `pageStructure`.
  - If `pageStructure` requests alternating activities and facts, instruct the model:
    - Odd pages: Interactive space/science activity (e.g., word search, constellation maze, spaceship design challenge, planet quiz).
    - Even pages: Illustrated scientific discovery / fascinating fact with rich narrative caption.

- [x] **Step 2: Remove Hardcoded Coloring Image Prefix**
  In `src/app/api/ai/story/route.ts` (around lines 582–589):
  - Check `isColor = reqInteriorColor === "standard_color" || /color|vibrant|painting/i.test(artStyle || "")`.
  - If `isColor`:
    Prompt prefix: `"Children's book illustration, vibrant full color, playful digital artwork, rich color palette, cinematic lighting, high resolution, detailed scene: "`
  - If `!isColor`:
    Prompt prefix: `"Children's coloring book page outline, thick continuous bold black outlines, zero shading, pure white background, strictly black and white line art ready for coloring with crayons: "`

---

### Task 3: Dynamic Image Generation & Tweak Art API

**Files:**
- Modify: `src/app/api/ai/image/route.ts`
- Modify: `src/components/BookViewer.tsx`

**Interfaces:**
- Consumes: `prompt`, `artStyle`, `interiorColor`, `characterTraits`.
- Produces: Full-color image URL or monochrome line art URL depending on book specifications.

- [x] **Step 1: Refactor `getCleanColoringPrompt` to `getCleanIllustrationPrompt`**
  In `src/app/api/ai/image/route.ts`:
  - Accept `artStyle` and `interiorColor` in request body.
  - Dynamically format prompt: if `interiorColor === "standard_color"` or `artStyle` indicates color, generate rich full-color children's art prompt instead of forcing black-and-white coloring page outlines.

- [x] **Step 2: Update `handleTweakArt` in `BookViewer.tsx`**
  - Pass the book's `artStyle` and `interiorColor: book.format.interiorColor` to `/api/ai/image`.
  - Default tweak prompt to `${activePage.imagePrompt || "children's illustration"}` rather than `"coloring page illustration"`.

---

### Task 4: Dynamic Book Viewer UI & Badges

**Files:**
- Modify: `src/components/BookViewer.tsx`

**Interfaces:**
- Consumes: `book.genre`, `book.format.interiorColor`, `activePage`.
- Produces: Clean, contextual page titles, badges, and card borders.

- [x] **Step 1: Dynamic Page Header Titles**
  Replace hardcoded `Chapter {activePage?.pageNumber}`:
  - If activity book: display `"Activity {pNum}"` or `activePage.title`.
  - If journal: display `"Day {pNum}"`.
  - If storybook: display `"Chapter {pNum}"`.

- [x] **Step 2: Dynamic Image Badges & Footers**
  Replace hardcoded `"Crisp Vector Line-Art • Print Ready (300 DPI) • SCIENCE BOOK"` and `"Activity & Coloring Sheet"`:
  - If `interiorColor === "standard_color"`:
    Badge: `"Vibrant Full-Color • Print Ready (300 DPI) • {GENRE}"`
    Footer: `"Illustrated Page • Page {pNum}"`
  - If `interiorColor === "black_and_white"`:
    Badge: `"Crisp Vector Line-Art • Print Ready (300 DPI) • {GENRE}"`
    Footer: `"Coloring & Activity Sheet • Page {pNum}"`

---

### Task 5: Dynamic PDF Builder & Lulu POD Color Package

**Files:**
- Modify: `src/lib/pdf-builder.ts`
- Modify: `src/lib/lulu-client.ts`

**Interfaces:**
- Consumes: `BookProject` with `trimSize` and `interiorColor`.
- Produces: Print-ready PDF without hardcoded coloring book cover labels, and accurate Lulu package ID (`FC.STD` for color, `BW.STD` for black and white).

- [x] **Step 1: Dynamic Category Header in PDF Builder**
  In `src/lib/pdf-builder.ts`:
  - Replace `isJournal ? "PERSONAL REFLECTION JOURNAL" : "PERSONALIZED COLORING & STORYBOOK"` with dynamic category header based on `book.genre` and `book.format.interiorColor`.

- [x] **Step 2: Color Package Support in Lulu Client**
  In `src/lib/lulu-client.ts`:
  - Add Lulu Full Color packages:
    - `SQUARE_COLOR: "0850X0850.FC.STD.PB.060UW444.GXX"`
    - `LETTER_COLOR: "0850X1100.FC.STD.PB.060UW444.GXX"`
  - In `calculateLuluQuote`, select package dynamically based on `interiorColor` and `trimSize`.

---

### Task 6: Verification & End-to-End Test

**Files:**
- Create: `scratch/test-dynamic-ai-flow.mjs`

- [x] **Step 1: Run End-to-End Generation Test Script**
  Simulate the user's exact flow:
  1. Science Activity Book with "Playful, colorful illustrations" and "alternating activity and fact pages".
  2. Verify Page 1 generated has colorful image prompt / image URL, activity title, and `standard_color` format.
  3. Verify a separate test for a Coloring Book generates clean vector line art.
