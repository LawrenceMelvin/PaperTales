# Tasks

## 1. Book Types, AI Helper Single-Sided Coloring Consultation & Page Edit Context

- [x] 1.1 Update `src/types/book.ts` to add `singleSidedColoring?: boolean` on `BookProject`, `backCoverText?: string` on `BookCoverDesign`, and `EditingPageReference` interface for attaching a page/cover reference in chat; verify TypeScript compilation passes.
- [x] 1.2 Update `src/app/api/ai/chat/route.ts` to ask coloring book creators whether they want single-sided pages (paint/marker bleed-through protection), return `singleSidedColoring` in `bookDraft`, and support `editingPageReference` + `pageEdit` responses when a specific page or cover is attached in chat; verify with unit/API tests.
- [x] 1.3 Update `src/app/api/ai/image/route.ts` so `getCleanIllustrationPrompt` and Gemini `generationConfig` enforce square/full-frame edge-to-edge composition without narrow portrait letterboxing; verify image route tests pass.

## 2. Virtual Book Viewer: Remove In-Page Tweak Buttons, Constant 2-Page Spread & "Edit This Page in Chat"

- [x] 2.1 Refactor `src/components/BookViewer.tsx` to remove all in-page `Tweak Art`, `Tweak Cover`, `Design in Chat`, and daily motif `Tweak` buttons and the internal `artModalOpen` dialog, and render `Index 0` as a full 2-page `[Back Cover | Front Cover]` spread using the exact same `spreadAspectClass` container as interior spreads so opening the book never expands; verify visually and in component tests.
- [x] 2.2 Remove `max-h-[240px]` and `max-h-[360px]` image caps and inner box padding in `src/components/BookViewer.tsx` so Front Cover and Interior Right Page illustrations expand edge-to-edge, and render the Single-Sided Bleed-Guard left leaf when `book.singleSidedColoring` is enabled; verify `BookViewer` rendering.
- [x] 2.3 Add the `Edit This Page in Chat` (and `Edit Cover in Chat` on `Index 0`) button below the book in `src/components/BookViewer.tsx` and wire it in `src/app/studio/page.tsx` to attach a removable page reference chip above the chat input and apply AI page/cover edits directly to the referenced page; verify end-to-end in `src/app/studio/page.tsx`.

## 3. WYSIWYG PDF Parity, Single-Sided Coloring PDF, Lulu Wraparound Cover PDF & Cover Validation

- [x] 3.1 Refactor `src/lib/pdf-builder.ts` and `src/app/api/pdf/compile/route.ts` to support three modes: `wysiwyg_full` (matching the 2-page virtual book layout without outer black `drawRectangle` borders, respecting `singleSidedColoring`), `lulu_cover` (1-page `[Back Cover + Spine + Front Cover]` wraparound spread with `0.125"` bleed and dynamic spine formula), and `lulu_interior` (interior-only pages with `0.125"` bleed); verify with PDF compilation tests.
- [x] 3.2 Update `src/app/studio/page.tsx` and `src/components/OrderSummaryModal.tsx` to show a warning dialog when downloading a digital PDF without a designed Front Cover (`!book.cover?.isDesigned`) and strictly block Physical Print orders with an error banner and a `Design Front Cover` action when the cover is missing; update `src/app/api/paypal/capture-order/route.ts` to pass real compiled cover/interior URLs to `submitLuluPrintJob`; verify checkout and PDF guardrails.

## 4. Channel3 Checkout Search & AG Grid AI Operations Copilot

- [x] 4.1 Upgrade `src/components/OrderSummaryModal.tsx` to display up to 6 Channel3 companion recommendations and add a live Channel3 search bar that queries `/api/channel3/suggest?genre=...&query=...` so buyers can search and bundle any product at checkout; verify search and PayPal total updates.
- [x] 4.2 Upgrade `src/components/OrdersDataGrid.tsx`, `src/components/OrderTrackingGrid.tsx`, and `src/app/dashboard/page.tsx` with a Natural-Language AI Grid Copilot filter bar, interactive KPI cross-filtering, PayPal/Lulu/Channel3 unit economics columns (COGS `$0.065/pg`, Net Profit & `62%` Margin, Channel3 bundle), and a live Lulu stage-progression action button; verify `npm test` and `npm run build` pass.
