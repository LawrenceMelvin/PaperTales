# Dynamic Book & Journal Layout Engine Implementation Plan

> **Goal:** Support dynamic, creator-specified interior page layouts (such as upper section "I will do" and lower section "what I did", custom headers, and multi-prompt spreads) across the entire PaperTales pipeline: AI Chat Copilot -> Story Generator -> 3D Book Viewer -> Lulu POD PDF Compiler.

---

## 1. Root Cause Summary

| Component | Current Limitation | Required Fix |
|---|---|---|
| **Data Contract (`types/book.ts`)** | `JournalPageData` only supports a single `reflectionPrompt` and `ruledLinesCount`. | Add `sections?: JournalSection[]` (`title`, `prompt`, `linesCount`, `placeholder`) and dynamic `headerCategory`. |
| **Story Engine (`api/ai/story/route.ts`)** | Defaults to Groq `gpt-oss-120b`; rigid schema only generates a single prompt + 18 lines; ignores user section requests. | Prioritize OpenAI `gpt-4.1` (Groq fallback); extract sections from `prompt` and `pageStructure`; return dynamic `sections` in `journalData`. |
| **Chat Route (`api/ai/chat/route.ts`)** | `designBrief` extracts `pageStructure`, but `bookDraft` does not expose it as a dedicated field for the story engine. | Expose `pageStructure` in `bookDraft` and ensure `bookDraft.prompt` summarizes section structure clearly. |
| **Studio Page (`studio/page.tsx`)** | Calls `/api/ai/story` with `prompt` only, without passing structured `pageStructure` or tracking section updates. | Store and forward `pageStructure` from chat to `/api/ai/story` during Master Proof generation & full spread expansion. |
| **Book Viewer (`BookViewer.tsx`)** | Hardcodes `"Daily Reflection & Mindset"`, `"Today's Mood"`, and a single 18-line block with `"write your thoughts here..."`. | Dynamically render `sections`: Section 1 header + lines, clean divider, Section 2 header + lines; dynamic header category; conditional mood tracker. |
| **PDF Compiler (`lib/pdf-builder.ts`)** | Draws only a single reflection title and fills lines to the bottom margin. | Draw each section with its title, calculate vertical line spacing per section, and render divider so printed copy matches viewer. |

---

## 2. Step-by-Step Execution Plan

### Task 1: Data Contract Upgrades (`src/types/book.ts`)
- Define `JournalSection`:
  ```ts
  export interface JournalSection {
    title: string;          // e.g. "I will do", "What I did"
    prompt?: string;        // e.g. "List today's priorities and commitments"
    linesCount?: number;    // e.g. 7 or 8 lines
    placeholder?: string;   // e.g. "write what you will do today..."
  }
  ```
- Extend `JournalPageData`:
  ```ts
  export interface JournalPageData {
    dayNumber: number;
    datePlaceholder?: string;
    headerCategory?: string;  // e.g. "Action & Retrospective"
    moodTracker?: boolean;    // false if task-oriented unless requested
    quote?: string;
    reflectionPrompt?: string;
    gratitudePrompts?: string[];
    doodlePrompt?: string;
    ruledLinesCount?: number;
    sections?: JournalSection[]; // dynamic sections
  }
  ```

### Task 2: Story Generator Engine Overhaul (`src/app/api/ai/story/route.ts`)
- **Model Selection:**
  - Prioritize OpenAI `gpt-4.1` (or `gpt-4o`) via `OPENAI_API_KEY`, using Groq as fallback.
- **Request Body & Prompt Engineering:**
  - Accept `pageStructure?: string` in POST body.
  - In `systemPrompt` for journals:
    - Instruct the model to inspect `prompt` and `pageStructure` for requested sections (e.g. upper "I will do", lower "what I did", morning/evening, habit/gratitude).
    - If sections are detected, output:
      ```json
      "sections": [
        { "title": "I will do", "prompt": "Key focus & commitments for today", "linesCount": 8, "placeholder": "commitments for today..." },
        { "title": "What I did", "prompt": "Evening retrospective & achievements", "linesCount": 8, "placeholder": "what was accomplished..." }
      ]
      ```
    - Set `headerCategory` matching the theme.
    - Set `moodTracker: false` for task/action journals unless creator requested mood.
- **Story Output Parsing:**
  - Map `journalData.sections` and `journalData.headerCategory` directly into each resolved page.
- **Smart Fallback:**
  - If AI call fails or returns empty, inspect `prompt`: if keywords like `"I will do"` and `"what I did"` (or upper/lower sections) are present, construct the 2 sections dynamically in the fallback generator.

### Task 3: Chat Route & Studio Page State Sync
- In `src/app/api/ai/chat/route.ts`:
  - Add `pageStructure?: string` to `bookDraft` in schema and output.
- In `src/app/studio/page.tsx`:
  - Add `pageStructure` state (defaulting to undefined).
  - When `data.bookDraft.pageStructure` arrives from chat, save it to state.
  - In `handleDesignHeroPage` and `handleExpandFullSpread`, pass `pageStructure` into the fetch body for `/api/ai/story`.

### Task 4: Dynamic Book Viewer (`src/components/BookViewer.tsx`)
- In `renderJournalPage`:
  - Check for `page?.journalData?.sections && page.journalData.sections.length > 0`:
    - **Header:** Render `page.journalData.headerCategory || book.subtitle || "Daily Reflection"`.
    - **Mood Tracker:** Render only if `page.journalData.moodTracker === true`.
    - **Sections Loop:**
      - For each section, render:
        - Section Title badge/pill (e.g. Amber/Sky badge with title `"I WILL DO"`).
        - Optional section prompt/subtitle.
        - Ruled lines allocated for that section (`linesCount || 7`), with `placeholder` on the first line.
      - Render subtle horizontal divider between sections.
  - If no sections exist, preserve the classic single prompt + 19 ruled lines layout for full backward compatibility.

### Task 5: PDF Compiler Multi-Section Layout (`src/lib/pdf-builder.ts`)
- In `src/lib/pdf-builder.ts`:
  - In `drawJournalPage`:
    - Check if `page.journalData?.sections` has items.
    - If yes:
      - Draw dynamic `headerCategory`.
      - Loop through sections, drawing:
        1. Section title in bold (`timesBold`, size 10).
        2. Optional section prompt in italic.
        3. Ruled lines for the section with standard 20pt spacing.
        4. Advance `currentY` with margin before the next section.
    - If no: draw classic single prompt + bottom-limit ruled lines.

### Task 6: Comprehensive Verification & Automated Tests
1. **API & End-to-End Test (`scratch/test-section-generation.mjs`):**
   - Query `/api/ai/story` with prompt: `"15-day coding journal, upper section 'I will do', lower section 'What I did'"`.
   - Verify response has `journalData.sections` with the 2 exact titles.
   - Test PDF compile with the generated book data to ensure valid PDF binary is emitted.
2. **TypeScript Compilation:**
   - Run `npx tsc --noEmit` and ensure 0 errors.
3. **Visual Verification:**
   - Inspect `/studio` in dev server to verify both left and right spreads render the upper and lower sections cleanly.
