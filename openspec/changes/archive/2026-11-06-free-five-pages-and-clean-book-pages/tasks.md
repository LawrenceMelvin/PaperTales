# Tasks

## 1. Types & Token Store

- [x] 1.1 Update `src/types/book.ts` to add `isLocked?: boolean` on `BookPage` and `showPageNumbers?: boolean` on `BookProject`, and verify TypeScript compilation
- [x] 1.2 Update `src/lib/token-store.ts` to set `DEFAULT_INITIAL_TOKENS = 0` so the first 5 pages are free (`0` tokens) and pages `6..N` require PayPal/token unlock, and verify token store callers compile cleanly

## 2. AI Chat & Two-Tier Story Generation Endpoints

- [x] 2.1 Update `src/app/api/ai/chat/route.ts` to add `"page_planning"` and `"page_plan_confirmed"` stages, `isPagePlanConfirmed`, and `showPageNumbers`, and prevent injecting default `"Barnaby"` when unrequested
- [x] 2.2 Update `src/app/api/ai/story/route.ts` to remove hardcoded `"Barnaby"` defaults when no character was requested, preserve `existingPageOne` proof, generate full illustrations for free pages (`1..5`), mark pages `6..N` as `isLocked: true` without running paid image generation until unlocked, and support unlocking pages `6..N`

## 3. Studio Flow & Clean BookViewer Spreads

- [x] 3.1 Update `src/app/studio/page.tsx` to strip unrequested `"Barnaby"` state from chat/generation calls, wire the post-Page-1 `"page_planning"` chat flow and mandatory confirmation gate, generate Pages `1..5` free + Pages `6..N` locked, and auto-unlock & generate Pages `6..N` upon token deduction or PayPal checkout
- [x] 3.2 Update `src/components/BookViewer.tsx` to remove the outer CSS `border-2 border-slate-900` frame on illustrations, remove the `300 DPI` watermarks, hide empty chapter headers when no story text exists, make page footers opt-in via `book.showPageNumbers`, and render the frosted blur + `"Unlock Pages 6–N"` CTA overlay on locked pages (`pageNumber > 5`)

## 4. Verification

- [x] 4.1 Run `npm test` and `npm run build` to verify all unit tests and Next.js production build pass with zero errors
