# Proposal

## Why

In the PaperTales Studio (`/studio`), clicking `"Looks Great! Expand (12 Pgs)"` after reviewing the Master Page 1 Proof immediately triggers a token/PayPal payment gate instead of honoring the platform's core **"First 5 Pages Free"** rule and skips creator involvement in planning what Pages `2..N` will contain and look like. Additionally, interior pages currently inject a hardcoded `"Barnaby the Golden Retriever Puppy"` character when the creator never asked for one, render a duplicate outer CSS border around AI-generated borders, and display unwanted technical watermarks (`"Crisp Vector Line-Art • Print Ready (300 DPI) • COLORING BOOK"`) and default page footers (`"Activity & Coloring Sheet | Page 1 Illustration"`).

## What Changes

- **Mandatory Post-Page-1 Co-Planning in Continuous AI Chat**:
  - After Master Page 1 Proof is generated, clicking the primary CTA re-opens the same AI chat thread in stage `"page_planning"`.
  - For **Storybooks, Coloring Books, Activity Books, Math, and Science Books**, the AI outlines what each remaining page (`Pages 2..N`) will contain and look like, allows the creator to tweak or add details per page, and requires explicit user confirmation (`"page_plan_confirmed"`) before unlocking full book generation.
  - For **Journals and Notebooks**, the AI discusses how Pages `2..N` should progress (repeating the identical layout vs. varying daily prompts, quotes, or spot illustrations) and requires explicit user confirmation before unlocking generation.
- **First 5 Pages Free + Blurred Locked Pages `6..N` Preview**:
  - Set `DEFAULT_INITIAL_TOKENS = 0` so the "First 5 Pages Free" tier is the single transparent free allowance.
  - When the creator confirms the page plan and generates a book of `N` pages (`N > 5`), keep Master Page 1 Proof intact, generate Pages `2..5` in full (text + AI illustrations) for **0 tokens**, and generate Pages `6..N` as locked preview pages (`isLocked: true`) with their planned text/structure but without spending OpenAI image generation compute until unlocked.
  - Render Pages `6..N` in `BookViewer` with a frosted glass blur overlay (`backdrop-blur-md`) and an **"Unlock Pages 6–N"** PayPal/Token CTA that deducts tokens (or opens `TokenModal` for PayPal checkout) and automatically generates the remaining illustrations and unblurs Pages `6..N` upon payment.
- **Eliminate Unrequested `"Barnaby"` Defaults**:
  - Do not pass default `"Barnaby"` / `"Golden Retriever Puppy"` / `"Wearing a cozy red scarf"` character state into `/api/ai/chat` or `/api/ai/story` unless the creator actually selected or mentioned that character in the conversation.
- **Clean Interior Book Spreads (`BookViewer`)**:
  - Remove the outer CSS `border-2 border-slate-900` frame on the right-hand illustration container so AI-drawn borders (e.g., cute animal borders) do not appear inside a second box border.
  - Remove the `'Crisp Vector Line-Art • Print Ready (300 DPI) • COLORING BOOK'` and `'Vibrant Full-Color • Print Ready (300 DPI)'` watermark text inside the book page.
  - Remove `'Activity & Coloring Sheet'`, `'Page 1 Illustration'`, and default page number footers from interior pages; make page numbers opt-in via `showPageNumbers?: boolean` (default `false`), enabled only when requested in chat.
  - Hide `'CHAPTER 1'` and the `'Highlight any text to polish or rewrite with AI'` banner when a page has no story text (e.g., pure coloring books).

## Capabilities

### New Capabilities
- `studio-page-planning-and-preview`: Covers the post-Page-1 conversational planning and mandatory confirmation workflow (for both unique-page books and repeating/guided journals), the 5-free-pages + blurred `6..N` preview lifecycle with PayPal/Token unlocking, clean interior page rendering without double borders or technical watermarks, and strict opt-in protagonist/page-number defaults.

### Modified Capabilities
<!-- None — no existing specs in openspec/specs/ -->

## Impact

- `src/types/book.ts`: Add `isLocked?: boolean` on `BookPage`, `showPageNumbers?: boolean` on `BookProject`, and new discussion stages (`"page_planning" | "page_plan_confirmed"`).
- `src/lib/token-store.ts`: Change `DEFAULT_INITIAL_TOKENS` from `12` to `0`.
- `src/app/api/ai/chat/route.ts`: Support `"page_planning"` and `"page_plan_confirmed"` stages, `isPagePlanConfirmed`, `showPageNumbers`, and avoid injecting unrequested default protagonists.
- `src/app/api/ai/story/route.ts`: Remove hardcoded `"Barnaby"` fallbacks when the user did not specify a character; support `freePagesLimit` (generating full images for pages `1..5` while preserving Page 1 proof and marking `6..N` as `isLocked: true`) and `unlockOnly` mode to generate images for pages `6..N` after payment.
- `src/app/studio/page.tsx`: Connect the post-Page-1 planning flow, mandatory confirmation gate, free 5-page expansion, and automatic post-PayPal unlock of pages `6..N`.
- `src/components/BookViewer.tsx`: Remove outer CSS box border on illustrations, remove `300 DPI` watermarks and default page footers, hide empty chapter headers on pure coloring pages, and render the frosted blur + unlock CTA overlay on locked pages (`pageNumber > 5`).
