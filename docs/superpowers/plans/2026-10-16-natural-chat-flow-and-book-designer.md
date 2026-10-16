# Natural Chat Flow & Universal Book Designer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the PaperTales AI Copilot into a fluid, ChatGPT-grade book design consultant that supports all book types (personal journals, adult books, gifts, workbooks, children's stories), eliminates repetitive welcomes, fixes broken quick replies, and seamlessly transitions to the Master Proof when a title is chosen.

**Architecture:** 
1. Redesign the conversational prompt and state transitions in `/api/ai/chat/route.ts` to support universal audiences, single-greeting rules, natural pronoun resolution ("I like it"), and immediate concept locking upon title selection.
2. Refactor `StudioPage` in `src/app/studio/page.tsx` to prevent redundant quick replies, eliminate conversational dead-ends, and provide an instant, accessible progression path to the Master Proof.
3. Validate end-to-end multi-turn conversations via an automated test script and verify production build.

**Tech Stack:** Next.js 15 (App Router), React 19, TypeScript, Groq LPU / OpenAI GPT-4o-mini, Tailwind CSS.

---

## Global Constraints
- Strictly preserve existing PayPal SDK checkout, Lulu POD integration, AG Grid tracking, and Channel3 companion features.
- Maintain full type safety and zero TypeScript build errors (`npm run build`).
- Do not write, edit, delete, or commit code without explicit user confirmation.

---

### Task 1: Conversational System Prompt & State Machine Overhaul in Chat Route

**Files:**
- Modify: `src/app/api/ai/chat/route.ts:25-115`
- Test: `test-chat-flow.mjs` (scratch script)

**Interfaces:**
- Consumes: `{ messages: ChatMessage[], currentBook: BookProject, referenceImageUrl?: string }`
- Produces: `{ reply: string, discussionStage: "discovery" | "brainstorming" | "concept_locked", isReadyForProof: boolean, titleOptions: string[], bookDraft: BookDraftData, quickReplies: string[], printAdvisory: PrintAdvisoryData }`

- [x] **Step 1: Write test script to verify current failures (duplicate greeting, child bias, stuck title lock)**
Create `scratch/test-chat-diagnostics.mjs` that simulates the 3-turn user conversation from the screenshots and verifies:
1. Turn 1: "hey papertales, what can you do"
2. Turn 2: "I want to create a 15 day journal with cat borders"
3. Turn 3: "I pick the title: 'Purr-fect 15-Day Adventure Journal'"

- [x] **Step 2: Run test script to observe the failures**
Run: `node scratch/test-chat-diagnostics.mjs`
Expected: Turn 2 returns duplicate "Welcome to PaperTales" and references "child", Turn 3 returns `isReadyForProof: false` (stuck loop).

- [x] **Step 3: Update System Prompt in `src/app/api/ai/chat/route.ts`**
Implement the following prompt upgrades:
1. Single Greeting Rule
2. Universal Audience & Genre Support
3. Conversational Intent & Pronoun Resolution
4. Immediate Concept Locking (`isReadyForProof: true`)
5. Actionable First-Person Quick Replies

- [x] **Step 4: Re-run test script to verify all 4 criteria pass**
Run: `node scratch/test-chat-diagnostics.mjs`
Expected: Turn 2 has no duplicate welcome and no child assumption; Turn 3 returns `isReadyForProof: true` with locked concept.

---

### Task 2: Studio UI & Chat Interaction Refinement

**Files:**
- Modify: `src/app/studio/page.tsx:780-865`

**Interfaces:**
- Consumes: Chat API responses (`titleOptions`, `quickReplies`, `isReadyForProof`)
- Produces: Smooth user selection, visual confirmation, and clear progression to Master Proof.

- [x] **Step 1: Sanitize and Filter Redundant Quick Replies**
Filter out any quick replies that say "Pick a title" or repeat already-rendered interactive title buttons.

- [x] **Step 2: Instant Title Selection & State Advancement**
When the user clicks a title card (`titleOpt`):
1. Immediately update `book.title` and `isConfirmed = false`.
2. Send natural conversational confirmation: `"I choose the title: "${titleOpt}". Let's finalize the concept."`
3. If `titleOpt` matches, visually show `Selected ✓` and highlight the card.

- [x] **Step 3: Add Always-Visible Manual Advancement Escape Hatch**
In `src/app/studio/page.tsx`, if concept is locked or title matches, render:
`[Review Book Specs & Master Proof →]` so the user is never trapped in an endless loop.

- [x] **Step 4: Smart Defaults for Adult & Journal Projects**
Ensure `targetAge` and `authorName` default gracefully:
- If journal mode or adult creator: `targetAge = "All Ages"` and `authorName = "You"`.

---

### Task 3: Full End-to-End Build & Visual Verification

**Files:**
- Test: Local verification via browser subagent or dev server

- [x] **Step 1: Run TypeScript compiler check**
Run: `npx tsc --noEmit`
Expected: Zero type errors (Exited with code 0).

- [x] **Step 2: Verify End-to-End Test Suite**
Run: `node scratch/test-chat-diagnostics.mjs` and `node scratch/test-like-it.mjs`
Expected: Passed all turns.creen.
