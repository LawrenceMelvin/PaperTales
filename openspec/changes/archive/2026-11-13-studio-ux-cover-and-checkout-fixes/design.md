# Design: Studio UX Contrast, AI Cover Fidelity & Checkout Recovery Fixes

## Context

PaperTales Studio (`/studio`) transitioned its canvas and `.glacier-glass` utility tokens in `src/app/globals.css` to the light Warm Sunlit Atelier palette (`#FFFDF9` ivory, `#FAF6EE` vellum), but several UI fragments and modals retained legacy dark-mode foreground classes (`text-white`, `text-emerald-100`, `text-sky-300`, `text-rose-200`). Simultaneously, book cover generation wrapped all image prompts in hardcoded children's illustration framing, PayPal checkout defaulted PDF unlocks to physical shipping with auto-selected Channel3 products, and closed PayPal popups left stale SDK button sessions behind. See `proposal.md` for motivation.

## Goals / Non-Goals

**Goals:**
- Achieve WCAG AA legibility across every step of the `/studio` flow (chat edit diffs, print-safe advisories, confirmation card headers, AI popover, and checkout/account modals) under the Warm Sunlit Atelier theme.
- Ensure book covers follow an interactive AI Helper proposal → user confirmation/customization loop, preserve literal user visual prompts and color choices (including true black `#0A0A0C`), and exclude barcodes, ISBNs, and Lulu print badges.
- Keep Channel3 companion art kits strictly opt-in (`null` by default), default `"Unlock & Download Full PDF"` to `"Instant Digital PDF"`, and prevent PayPal Sandbox popup close (`'x'`) or cross-border decline errors from blocking checkout.

**Non-Goals:**
- Changing the 65% profit margin pricing formulas, 5-free-pages eligibility logic, or 10% Lulu manufacturing commission.
- Replacing PayPal JS SDK or Lulu Direct API v2 integrations.
- Modifying non-Studio landing or pricing routes unless they share affected modal components (`TokenModal`, `OrderSummaryModal`).

## Decisions

### Decision 1: Warm Sunlit Atelier Contrast Unification Across Studio & Modals
- **Approach**: Audit and replace all light-on-light Tailwind classes across `src/app/studio/page.tsx` (`Changes Applied` pill, `Adopt Print-Safe` button, Suggested Titles header, loading/reference banners, and `Trim Size & Book Dimension:` header) and convert modal shells (`OrderSummaryModal`, `TokenModal`, `BookDetailsModal`, `BookLibraryModal`) plus `BookViewer`'s AI refine popover from dark-slate hybrid text to `#FFFDF9`/`#FAF6EE` cards with `#1E2530` headings/prices, `#5C5347` subtitles, `#E6DEC8` borders, and high-contrast `emerald-950` / `rose-900` / `amber-800` semantic badges.
- **Alternative Considered**: Reverting `.glacier-glass` to dark navy globally; rejected because it conflicts with the `site-visual-theme` specification requiring Warm Sunlit Atelier continuity across `/studio`.

### Decision 2: Interactive Cover Concept Proposal + Literal Cover Image Pipeline + Stale State Fix
- **Approach**:
  1. Introduce `"midnight_black"` (`#0A0A0C` canvas, `#F8FAFC` serif typography, `#FBBF24` gold accents) to `BookCoverColorScheme` across `BookViewer.tsx`, `pdf-builder.ts`, `studio/page.tsx`, and `chat/route.ts` (keeping dark brown `#2A1D13` only if warm brown is desired, or separating `midnight_black` cleanly).
  2. When entering cover creation (after page expansion or via cover tab), have the AI Helper present a **Cover Concept Proposal Card** detailing: (a) Cover Color Scheme, (b) Detailed Front Cover Design (artwork prompt + title/subtitle framing), and (c) Detailed Back Cover Design (book-specific back synopsis). The creator can approve with one click, edit fields inline, or chat a totally different cover idea before calling cover image generation.
  3. Separate cover prompt assembly (`isCover === true`) from interior children's coloring/illustration prompts in `src/app/api/ai/image/route.ts`: omit `"Children's book illustration... playful, colorful, delightful character expression"` when generating custom covers or adult/journal books, and add strict negative constraints (`NO text, NO letters, NO book titles inside the image`).
  4. In `src/app/api/ai/chat/route.ts`, instruct the model to copy explicit user cover descriptions verbatim into `coverDraft.coverPrompt` without morphing subjects into playful mascots. In `src/app/studio/page.tsx`, refactor `handleDesignBookCover(overrideDraft?)` so active cover chat edits pass the freshly returned `coverDraft` synchronously rather than reading un-flushed React state.
- **Alternative Considered**: Letting the client edit only the raw prompt string without AI proposal; rejected because the user requested the AI Helper to propose color + detailed front/back cover ideas for confirmation/refinement.

### Decision 3: Clean Cover Spread Rendering in `BookViewer.tsx` & `pdf-builder.ts`
- **Approach**: Remove `'Personal Keepsake Edition'`, `'6" x 9" Lulu POD'`, `'Archival Softcover Keepsake'` callout box, `'Lulu Direct 300 DPI'`, `'ISBN 978-0-PT-AI-2026'`, and the `'PAPER-TALES-AI'` barcode SVG/canvas primitives from both `BookViewer.tsx` and `src/lib/pdf-builder.ts`. Render `book.cover?.backCoverText` directly on the back cover instead of the hardcoded `"inspires young artists"` children's boilerplate, leaving barcode placement to Lulu Direct during print imposition.
- **Alternative Considered**: Hiding metadata only in `BookViewer.tsx`; rejected because the exported PDF in `pdf-builder.ts` would remain inconsistent with the Studio preview.

### Decision 4: Opt-In Channel3 Selection & Digital-First Unlock Routing
- **Approach**: Initialize `selectedCompanion` to `null` in `OrderSummaryModal.tsx` (replacing conditional `products[0]` pre-selection) and in `src/app/studio/page.tsx` companion fetch handlers so users must click `+` to add a companion art kit. Add an `orderModalInitialTab` state (`"digital_pdf" | "physical_print"`) in `studio/page.tsx`: `"Unlock & Download Full PDF"` opens `OrderSummaryModal` with `initialFulfillmentType="digital_pdf"`, whereas print buttons pass `"physical_print"`.

### Decision 5: PayPal Popup Close (`'x'`) Session Reset & Sandbox Decline Fallback
- **Approach**:
  1. In `src/lib/paypal-client.ts`, force `shipping_preference: "NO_SHIPPING"` whenever `requireShippingAddress` is `false` (digital PDF, token top-ups, and books without a selected physical companion), avoiding Sandbox's cross-border address compliance rejections on `GET_FROM_FILE`. Ensure `custom_id` uses a unique timestamp suffix (`..._${Date.now()}`) across `create-order/route.ts` and `TokenModal.tsx`.
  2. Add `onCancel` handlers and a `paypalRetryKey` counter prop (`key={paypalRetryKey}`) on `<PayPalButtons>` in `OrderSummaryModal.tsx`, `UnlockChoiceModal.tsx`, and `TokenModal.tsx` so closing `'x'` immediately clears processing spinners, unmounts the aborted PayPal iframe session, and renders a fresh session on retry.
  3. On PayPal `onError` or capture failure, display both `"Reset & Retry PayPal"` (incrementing `paypalRetryKey`) and `"Complete Sandbox Test Order"` (calling an explicit sandbox/demo completion handler that unlocks/downloads or credits tokens cleanly) when running against Sandbox.
- **Alternative Considered**: Disabling PayPal popup retries and requiring page reload; rejected because page reloads can lose unsaved studio edits.

## Risks / Trade-offs
- **LLM Prompt Following on Cover Redesigns** → Keep explicit verbatim extraction in `chat/route.ts` plus an editable Cover Prompt textarea on the Cover Concept Confirmation Card so users always see and can tweak the exact prompt sent to `/api/ai/image`.
- **Sandbox Fallback Security Scope** → Restrict the `"Complete Sandbox Test Order"` fallback button strictly to client-side/Sandbox test mode (`NEXT_PUBLIC_PAYPAL_ENV !== "production"` / non-live mode) so live production charges are never bypassed.
- **Tailwind Contrast Classes in Dark Custom Covers** → Inside `BookViewer.tsx` only (when previewing a dark cover such as `midnight_black`), light cover typography (`text-[#F8FAFC]`, `text-amber-300`) MUST remain light because the book cover surface itself is `#0A0A0C`, while surrounding Atelier UI controls stay dark-ink on `#FFFDF9`.
