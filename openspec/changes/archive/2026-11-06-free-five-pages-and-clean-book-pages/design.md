# Design

## Context

See `proposal.md` for motivation and `specs/studio-page-planning-and-preview/spec.md` for behavioral requirements. Currently in `src/app/studio/page.tsx`, `handleExpandFullSpread` checks `balance < quote.tokensRequired` before making any API call, blocking creators from receiving their first 5 free pages. In addition, `character` state defaults to `GENRE_LANES[0].defaultCharacter` (`Barnaby`), polluting unrelated books, and `BookViewer.tsx` wraps right-hand illustrations in a `border-2 border-slate-900` container with hardcoded `300 DPI` watermarks and page footers.

## Goals / Non-Goals

**Goals:**
- Keep 100% of post-Page-1 planning inside the existing continuous AI chat thread (`messages` state in `src/app/studio/page.tsx`).
- Enforce mandatory user confirmation of the Page `2..N` plan before generating pages beyond Page 1.
- Deliver Pages `1..5` completely free (`0` tokens) while rendering Pages `6..N` blurred (`isLocked: true`) in `BookViewer` until unlocked via tokens/PayPal, avoiding paid OpenAI image generation calls for Pages `6..N` until unlocked.
- Strip unrequested `"Barnaby"` defaults, outer CSS illustration borders, `300 DPI` watermarks, empty chapter labels, and unrequested page footers.

**Non-Goals:**
- Changing the pricing formula in `src/lib/pricing-calculator.ts` (`FREE_PAGES_TIER = 5`, `1 token = 1 paid page above 5`).
- Changing Lulu POD or Channel3 API contracts.

## Decisions

1. **Discussion Stage Extension (`"page_planning"` -> `"page_plan_confirmed"`):**
   - In `/api/ai/chat/route.ts` and `src/app/studio/page.tsx`, add `"page_planning"` and `"page_plan_confirmed"` to `DiscussionStage`.
   - When `hasProof === true && !hasFullBook`, clicking `"✨ Looks Great! Plan Remaining Pages in Chat"` opens the chat thread (`setIsDiscussionDone(false)`) and triggers an assistant turn in `"page_planning"` stage that proposes the page-by-page plan for Pages `2..N` (or for journals/notebooks, asks whether Pages `2..N` repeat the identical template or vary daily prompts/quotes/spot art).
   - Once the creator confirms the plan in chat, the AI sets `discussionStage = "page_plan_confirmed"` and `isPagePlanConfirmed = true`, surfacing the `"✨ Confirm & Generate (First 5 Pages Free)"` CTA button.

2. **Two-Tier Generation in `/api/ai/story/route.ts` (`freePagesLimit` & `unlockPagesOnly`):**
   - When generating after plan confirmation (`freePagesLimit = 5` when not yet unlocked), `/api/ai/story` generates the structured page definitions (`title`, `storyText`, `imagePrompt`, `journalData`) for all `1..N` pages so narrative/journal continuity spans the full book:
     - **Page 1:** Preserves the already-approved Master Page 1 Proof (`existingPageOne`) so Page 1's artwork is never overwritten or regenerated unnecessarily.
     - **Pages 2..5:** Generates full AI illustrations (`generateOpenAiIllustration` / fallback) for free.
     - **Pages 6..N:** Marks `isLocked: true` and skips paid image generation until unlocked.
   - When the creator clicks `"Unlock Pages 6–N"` and pays/spends tokens, `/studio` calls `/api/ai/story` (or `/api/ai/image` per locked page) to populate illustrations for Pages `6..N` and clears `isLocked`.

3. **Neutral Character & Page Number Defaults:**
   - Track `hasUserSelectedCharacter` in `src/app/studio/page.tsx` (or initialize `character` to `{ name: "", type: "", traits: [] }` when using chat) so `"Barnaby"` is only used if the user explicitly picks a Barnaby preset or names Barnaby.
   - Remove default `characterName = "Barnaby"` from `/api/ai/story/route.ts`.
   - Add `showPageNumbers?: boolean` to `BookProject` and `bookDraft` (default `false`); only render page number footers in `BookViewer.tsx` when `book.showPageNumbers === true`.

## Risks / Trade-offs

- **[Risk] Unlocking a large book (e.g. 20 locked pages) takes several seconds to generate images for pages 6..20** → **Mitigation:** Immediately deduct tokens and show a clear `"Unlocking & Illustrating Pages 6–N..."` loading state on the viewer, or for journals without spot illustrations, unblur instantaneously in client state.
