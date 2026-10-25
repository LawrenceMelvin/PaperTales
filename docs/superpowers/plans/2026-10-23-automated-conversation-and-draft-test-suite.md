# Automated Conversation & Draft Verification Suite Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Provide 1-click test conversation scenarios in `/studio` that automatically populate the dialogue, lock the design brief, and generate Master Page 1, paired with a live "AI vs. Draft Match Inspector" and a headless CLI test runner (`npm run test:conversations`).

**Architecture:** 
1. `src/lib/test-scenarios.ts` serves as the centralized catalog of 5 rich, benchmark conversations and compliance assertion rules.
2. `scratch/verify-ai-conversations.mjs` runs headlessly against `/api/ai/story` to verify prompt and layout generation in CI/terminal.
3. `src/components/DraftMatchInspector.tsx` & `src/components/StudioTestBar.tsx` are integrated into `/studio` for 1-click browser testing and instant visual compliance checking.

**Tech Stack:** Next.js (App Router), React 19, TypeScript, Tailwind CSS (Glacier Glassmorphism), Node.js fetch / test assertions.

---

## Global Constraints

- Preserve all existing manual chat, editing, and book expansion capabilities.
- Test scenarios must be non-destructive (creators can clear or override them at any time).
- Match checks must verify:
  1. Art Style & Color Mode (`standard_color` vs `black_and_white` keywords).
  2. Format & Trim Size (`8.5x8.5`, `6x9`, `8.5x11`).
  3. Interior Page Layout (`empty_lined`, `guided_sections`, alternating activities/facts).
  4. Title & Character Anchor consistency.
- Adhere strictly to the project's Glacier Glassmorphism design tokens (`#0a0e1a` void background, `#7dd3fc` ice-blue, frosted blurs, subtle luminous borders).

---

### Task 1: Centralized Test Scenarios Matrix & Matching Logic

**Files:**
- Create: `src/lib/test-scenarios.ts`

**Interfaces:**
- Produces: 
  - `ConversationTestScenario` interface.
  - `CONVERSATION_TEST_SCENARIOS: ConversationTestScenario[]`.
  - `verifyDraftMatchesScenario(book: BookProject, scenario: ConversationTestScenario): MatchInspectionResult`.

- [ ] **Step 1: Write `src/lib/test-scenarios.ts` with types and 5 benchmark scenarios**

```typescript
import { BookProject } from "@/types/book";

export interface InspectionCheck {
  id: string;
  category: "art_style" | "trim_size" | "page_structure" | "title_character";
  label: string;
  passed: boolean;
  expected: string;
  actual: string;
}

export interface MatchInspectionResult {
  passed: boolean;
  score: number;
  totalChecks: number;
  checks: InspectionCheck[];
}

export interface ConversationTestScenario {
  id: string;
  name: string;
  icon: string;
  badge: string;
  description: string;
  brief: {
    title: string;
    genre: "coloring_book" | "storybook" | "memory_book" | "activity_book" | "math_book" | "science_book";
    trimSize: "8.5x8.5" | "6x9" | "8.5x11";
    interiorColor: "standard_color" | "black_and_white";
    artStyle: string;
    pageStructure: string;
    pageCount: number;
    character: {
      name: string;
      type: string;
      traits: string[];
    };
  };
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  expectedMatches: {
    expectedTitle: string;
    expectedLayoutType?: "empty_lined" | "guided_sections" | "classic_prompt";
    expectedColorMode: "standard_color" | "black_and_white";
    expectedImagePromptKeywords: string[];
    forbiddenImagePromptKeywords?: string[];
    expectedTrimSize: string;
  };
}
```

- [ ] **Step 2: Implement `verifyDraftMatchesScenario` in `src/lib/test-scenarios.ts`**
  - Compare `book.title` against `scenario.expectedMatches.expectedTitle`.
  - Compare `book.format.trimSize` against `scenario.expectedMatches.expectedTrimSize`.
  - Compare `book.format.interiorColor` against `scenario.expectedMatches.expectedColorMode`.
  - Check `page1.imagePrompt` for expected keywords (e.g. `vibrant full color` for color, `thick continuous bold black outlines` / `crayons` for coloring).
  - Verify `page1.journalData?.layoutType` for journal books.
  - Return aggregated `MatchInspectionResult`.

- [ ] **Step 3: Verify TypeScript compilation of `src/lib/test-scenarios.ts`**
  - Run: `npx tsc --noEmit`
  - Expected: PASS with 0 type errors.

---

### Task 2: Automated Headless CLI Verification Runner

**Files:**
- Create: `scratch/verify-ai-conversations.mjs`
- Modify: `package.json`

**Interfaces:**
- Consumes: `CONVERSATION_TEST_SCENARIOS` and `verifyDraftMatchesScenario` from `src/lib/test-scenarios.ts`.
- Calls: `/api/ai/story` via Node.js `fetch`.
- Produces: Formatted CLI report with exit code 0 or 1.

- [ ] **Step 1: Create `scratch/verify-ai-conversations.mjs`**
  - Iterate over the scenarios in `src/lib/test-scenarios.ts`.
  - Make HTTP POST requests to `http://localhost:3000/api/ai/story`.
  - Run `verifyDraftMatchesScenario` against the returned `book`.
  - Output ANSI colored table:
    - `✔ [Space Science Activity Book] - 4/4 Checks Passed (100% Match)`
    - `✔ [15-Day Content Creation Journal] - 4/4 Checks Passed (100% Match)`
    - etc.

- [ ] **Step 2: Add script to `package.json`**
  Add script:
  ```json
  "test:conversations": "node scratch/verify-ai-conversations.mjs"
  ```

- [ ] **Step 3: Run the CLI verification runner to test against existing API**
  - Run: `npm run test:conversations`
  - Expected: Output shows all 5 scenarios running and passing.

---

### Task 3: In-Studio Test Bar & Match Inspector Components

**Files:**
- Create: `src/components/StudioTestBar.tsx`
- Create: `src/components/DraftMatchInspector.tsx`
- Modify: `src/app/studio/page.tsx`

**Interfaces:**
- `StudioTestBarProps`:
  - `onSelectScenario: (scenario: ConversationTestScenario) => void`
  - `onReset: () => void`
  - `activeScenarioId?: string`
- `DraftMatchInspectorProps`:
  - `book: BookProject`
  - `scenario: ConversationTestScenario`
  - `onClose?: () => void`

- [ ] **Step 1: Create `src/components/StudioTestBar.tsx`**
  - Renders a sleek glacier-glass bar with badge `"🧪 Test Scenarios"`.
  - Displays pills for each scenario with their icon, name, and color badge.
  - Includes a "Reset to Blank" button to clear messages and book draft.

- [ ] **Step 2: Create `src/components/DraftMatchInspector.tsx`**
  - Evaluates `verifyDraftMatchesScenario(book, scenario)`.
  - Renders a visual card with:
    - Overall match badge (e.g. `100% Brief Match - All 4 checks verified`).
    - Individual check rows:
      - 🎨 **Art & Color:** Shows brief expectation vs page 1 prompt excerpt.
      - 📐 **Trim Size:** Shows brief expectation vs book format.
      - 📑 **Page Layout:** Shows structure (e.g. `empty_lined`, alternating activity).
      - 🏷️ **Title & Character Anchor:** Shows title and character traits match.

- [ ] **Step 3: Wire into `src/app/studio/page.tsx`**
  - Add state `activeScenario: ConversationTestScenario | null`.
  - Render `<StudioTestBar />` right above the chat header.
  - Implement `handleSelectScenario(scenario)`:
    - Sets `messages` to `scenario.messages`.
    - Sets `bookDraft` to `scenario.brief`.
    - Sets `designBrief` to `scenario.brief`.
    - Sets `discussionStage = "concept_locked"`.
    - Sets `isReadyForProof = true`.
    - Calls `handleDesignHeroPage(scenario.brief, scenario.messages)`.
  - Render `<DraftMatchInspector book={book} scenario={activeScenario} />` below the Master Page 1 Proof preview.

- [ ] **Step 4: Verify UI build and linting**
  - Run: `npm run build`
  - Expected: Clean compilation without errors.

---

### Task 4: Empirical Verification & End-to-End Validation

**Files:**
- Test via: `npm run test:conversations` and Dev Server check

- [ ] **Step 1: Execute `npm run test:conversations`**
  - Verify all 5 scenarios pass with 100% match.

- [ ] **Step 2: Verify in browser**
  - Start dev server: `npm run dev`
  - Open `/studio`
  - Click on "🚀 Space Science" -> confirm chat loads, Page 1 generates, and Match Inspector displays `100% Brief Match`.
  - Click on "📔 15-Day Journal" -> confirm empty-lined layout generates with spot art and passes Match Inspector.

- [ ] **Step 3: Final sanity check & commit plan**
