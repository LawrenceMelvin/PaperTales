# Tasks

## 1. Studio Chat & Confirmation Card Contrast Fixes

- [x] 1.1 Update the `"Changes Applied"` diff pill, `"Adopt Print-Safe"` advisory button, `"Suggested Next Steps"` header, and chat loading/page-reference banners in `src/app/studio/page.tsx` to use high-contrast Warm Sunlit Atelier dark-ink classes (`text-emerald-950`, `bg-emerald-50/90`, `text-emerald-800`, `bg-emerald-700 text-white`, `text-amber-800`, `text-[#1E2530]`), and verify no pale `emerald-100/200/300` or `sky-200/300` text remains on light backgrounds.
- [x] 1.2 Fix the `"Trim Size & Book Dimension:"` (`text-[#1E2530]`) and `"Lulu POD Industry Standard"` (`text-amber-700`) header classes inside the Book Confirmation Card in `src/app/studio/page.tsx`, plus any contrast leftovers in `CharacterAnchor.tsx`, `DraftMatchInspector.tsx`, and `MascotQuoter.tsx`, verifying legibility over `#FAF6EE`.
- [x] 1.3 Update the floating `"Refine with AI"` popover buttons in `src/components/BookViewer.tsx` (`text-sky-900`, `text-emerald-900`, `text-purple-900`) so actions on `.glacier-glass` meet WCAG AA contrast.

## 2. Warm Sunlit Atelier Checkout & Studio Modals + Digital PDF Default

- [x] 2.1 Convert `src/components/OrderSummaryModal.tsx` from dark-slate hybrid classes (`text-white`, `text-rose-200`, `bg-slate-900/40`) to Warm Sunlit Atelier (`#FFFDF9` / `#FAF6EE` surfaces, `#1E2530` headlines & itemized prices `$2.50`/`$6.38`/`$5.69`, `#5C5347` muted labels, `#E6DEC8` borders, readable `bg-rose-50 text-rose-900` warnings), and verify every price and alert banner is clearly readable.
- [x] 2.2 Convert `src/components/TokenModal.tsx`, `src/components/BookDetailsModal.tsx`, and `src/components/BookLibraryModal.tsx` to consistent Warm Sunlit Atelier high-contrast styling and verify zero `text-white` exists over `.glacier-glass` / cream backgrounds.
- [x] 2.3 Add `orderModalInitialTab` state (`"digital_pdf" | "physical_print"`) in `src/app/studio/page.tsx` so clicking `"Unlock & Download Full PDF"` opens `OrderSummaryModal` defaulted to `"Instant Digital PDF"`, while physical print buttons default to `"Physical Printed Book"`; verify both entry points open on the expected tab.

## 3. Opt-In Channel3 Companion Selection

- [x] 3.1 Update `src/components/OrderSummaryModal.tsx` and `src/app/studio/page.tsx` companion fetch handlers so `selectedCompanion` initializes to `null` instead of `products[0]`, ensuring users only add a companion item and price when clicking `+`; verify checkout totals exclude Channel3 items by default.

## 4. AI Helper Cover Concept Proposal, Prompt Fidelity & Clean Cover Spread

- [x] 4.1 Add `"midnight_black"` (`#0A0A0C` canvas, `#F8FAFC` serif text, `#FBBF24` accents) across cover color scheme types and styling in `src/components/BookViewer.tsx`, `src/lib/pdf-builder.ts`, `src/app/studio/page.tsx`, and `src/app/api/ai/chat/route.ts`, and verify true black renders cleanly rather than dark brown `#2A1D13`.
- [x] 4.2 Implement the AI Helper Cover Concept Proposal & user confirmation UI in `src/app/studio/page.tsx` and `src/app/api/ai/chat/route.ts` so the AI proposes a topic-matched cover color scheme, detailed front cover visual design, and detailed back cover design/synopsis, letting the creator approve, refine, or replace the cover before generating artwork; verify chat updates flow cleanly through `handleDesignBookCover(overrideDraft)` without stale React state.
- [x] 4.3 Refactor `src/app/api/ai/image/route.ts` prompt assembly for covers (`isCover === true`) and non-children's books to preserve the creator's exact visual description verbatim without forcing `"Children's book illustration... Playful, colorful illustrations, delightful character expression"` and to forbid rendered text inside cover artwork; verify unit/API prompt generation fidelity for custom dark/gold prompts.
- [x] 4.4 Remove `'Personal Keepsake Edition'`, trim-size print labels (`'6" x 9" Lulu POD'`), the `'Archival Softcover Keepsake'` callout box, `'Lulu Direct 300 DPI'`, `'ISBN 978-0-PT-AI-2026'`, the fake `'PAPER-TALES-AI'` barcode, and hardcoded children's back-cover boilerplate from `src/components/BookViewer.tsx` and `src/lib/pdf-builder.ts`, rendering `book.cover?.backCoverText` instead; verify both live preview and compiled PDF output omit those elements.

## 5. PayPal Popup Close Recovery & Sandbox Decline Fallback

- [x] 5.1 Update `src/lib/paypal-client.ts` and `src/app/api/paypal/create-order/route.ts` to set `shipping_preference: "NO_SHIPPING"` when physical shipping is not required and generate unique timestamped `custom_id` values across token and book orders; verify order payloads in unit tests.
- [x] 5.2 Add `onCancel` handlers and `paypalRetryKey` reset keys to `<PayPalButtons>` in `src/components/OrderSummaryModal.tsx`, `src/components/UnlockChoiceModal.tsx`, and `src/components/TokenModal.tsx`, plus `"Reset & Retry PayPal"` and Sandbox-only `"Complete Sandbox Test Order"` recovery buttons when PayPal Sandbox declines/errors; verify closing `'x'` resets cleanly for immediate retry.

## 6. Integration Verification & Build Checks

- [x] 6.1 Run `npm test` and confirm all unit and integration tests pass cleanly with zero regressions.
- [x] 6.2 Run `npm run build` and verify the production Next.js build succeeds with zero TypeScript or bundler errors.
