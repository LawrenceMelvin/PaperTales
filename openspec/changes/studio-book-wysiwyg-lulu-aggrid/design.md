# Design

## Context

See `proposal.md` for motivation and capability scope. Currently:
1. `BookViewer.tsx` renders in-page `Tweak Art` / `Tweak Cover` buttons and constrains cover/interior artwork inside padded containers (`max-h-[240px]`, `max-h-[360px]`). Flipping from `Index 0` (`max-w-[380px]`) to `Index 1` (`max-w-5xl`) causes the book container to visually expand.
2. `pdf-builder.ts` compiles a single PDF with double outer borders (`drawRectangle`) and puts the title + illustration on the same single sheet rather than matching the two-leaf spread of `BookViewer`, while `/api/paypal/capture-order` passes `"dummy_interior.pdf"` and `"dummy_cover.pdf"` to `submitLuluPrintJob`.
3. `OrderSummaryModal.tsx` slices Channel3 companion products to 2 items with no search input, and allows physical print checkout even when `book.cover?.isDesigned` is false.
4. `OrdersDataGrid.tsx` and `OrderTrackingGrid.tsx` use basic `AgGridReact` tables without AI copilot filtering, interactive KPI cross-filtering, or unit economics columns.

## Goals / Non-Goals

**Goals:**
- Deliver a pure, non-expanding 2-page virtual book experience (`BookViewer.tsx`) where `Index 0` shows `[Back Cover | Front Cover]` and `Index 1..N` shows interior spreads at the exact same scale, with edge-to-edge illustrations and an external `Edit This Page in Chat` button below the book.
- Ensure 1:1 WYSIWYG visual parity between `BookViewer` and downloaded PDFs (`pdf-builder.ts`), including support for `singleSidedColoring` bleed-guard pages for coloring books.
- Implement Lulu POD compliant separate Wraparound Cover PDF (`[Back Cover + Spine + Front Cover]` with `0.125"` bleed) and Interior-Only PDF compilation, plus front-cover validation (warning on PDF download, mandatory error on Physical Print checkout).
- Add live Channel3 catalog search and 4–6 product cards inside `OrderSummaryModal.tsx`.
- Upgrade `OrdersDataGrid.tsx` and `OrderTrackingGrid.tsx` with a Natural-Language AI Grid Copilot bar, KPI cross-filter pills, PayPal/Lulu/Channel3 unit economics columns, and 1-click Lulu webhook stage simulation.

**Non-Goals:**
- Replacing `pdf-lib` with a headless browser renderer (we achieve fast, deterministic serverless PDF rendering directly in `pdf-lib`).
- Changing the core "First 5 Pages Free" token pricing math (`$0.17/paid page`, `62%` margin).

## Decisions

### 1. External "Edit This Page in Chat" Reference Attachment Architecture
- **Choice**: Remove `artModalOpen` and all in-page `Tweak Art` / `Tweak Cover` buttons from `BookViewer.tsx`. Add an `onEditPageInChat(pageIndex: number)` prop triggered by a button in the pagination/control bar below the book.
- **How it works**: Clicking `Edit This Page in Chat` (or `Edit Cover in Chat` when `currentPageIndex === 0`) sets an `activePageReference` state in `src/app/studio/page.tsx` (`{ pageIndex, pageNumber, title, storyText, imagePrompt, imageUrl, isCover }`), switches `isDiscussionDone` to `false` (expanding the chat), and renders a removable **Page Reference Pill** directly above the chat `textarea`. When the user sends their next message, `handleSendMessage` includes `editingPageReference` in the request to `/api/ai/chat`. If the user asks to change the illustration or text of that referenced page/cover, `/api/ai/chat` returns a structured `pageEdit` (or `coverDraft`) payload and `studio/page.tsx` automatically regenerates that page's illustration via `/api/ai/image` and updates `book.pages[idx]` in place.
- **Alternatives considered**: Keeping a separate modal popup for art tweaks. Rejected because the user explicitly wants edits unified in the AI chat with the page automatically attached as a reference.

### 2. Constant Two-Page Virtual Book Footprint (`Index 0` = Back Cover + Front Cover)
- **Choice**: Render `Index 0` inside the exact same `spreadAspectClass` two-leaf container as `Index 1..N`.
  - **Left Leaf (`Index 0`)**: Renders the **Back Cover** matching the chosen `colorScheme`, displaying an AI-generated or customizable back-cover synopsis (`book.cover?.backCoverText`), a `"Single-Sided Marker & Paint Bleed-Guard Edition"` badge (when applicable), PaperTales AI colophon, and a Lulu POD ISBN/barcode graphic box.
  - **Right Leaf (`Index 0`)**: Renders the **Front Cover** with full-frame artwork (`w-full h-full object-cover` filling the cover illustration area without `max-h-[240px]` or nested box padding).
- **Rationale**: Eliminates the jarring width expansion when flipping from Cover to Spread 1 and prepares both Front and Back covers for Lulu's wraparound cover PDF.

### 3. Lulu POD Separate Wraparound Cover PDF vs. Interior PDF & WYSIWYG Layout
- **Choice**: Refactor `src/lib/pdf-builder.ts` into three clean export modes exposed via `/api/pdf/compile`:
  1. `mode: "wysiwyg_full"` (default for user `Download Full PDF`): Generates the Back & Front Cover spread followed by 2-page WYSIWYG interior spreads (Left Leaf = Title/Story or Single-Sided Bleed Guard; Right Leaf = Full-bleed/full-frame illustration **without** the outer `drawRectangle` border).
  2. `mode: "lulu_cover"`: Generates a single-page wraparound spread PDF with exact Lulu mathematical dimensions:
     - `bleed = 0.125"` (`9 pt` on all 4 edges)
     - `spineWidth = pageCount >= 32 ? ((pageCount / 444) + 0.06) : 0` (in inches, converted to points at `72 pt/in`)
     - `totalWidth = (2 * trimWidth) + spineWidth + 0.25"`
     - `totalHeight = trimHeight + 0.25"`
     - Left region = Back Cover, Center region = Spine (with vertical rotated title if `pageCount >= 32`), Right region = Front Cover.
  3. `mode: "lulu_interior"`: Generates only the interior leaves with `0.125"` bleed (`trimWidth + 0.25"` by `trimHeight + 0.25"`), inserting blank/bleed-guard reverse pages when `book.singleSidedColoring` is true.
- In `/api/paypal/capture-order`, construct real `/api/pdf/compile?mode=lulu_interior&bookId=...` and `/api/pdf/compile?mode=lulu_cover&bookId=...` URLs and pass them to `submitLuluPrintJob`.

### 4. Single-Sided Coloring Book Consultation & Rendering
- **Choice**: Add `singleSidedColoring?: boolean` to `BookProject` and `BookDraftData`. Update `SYSTEM_PROMPT` in `/api/ai/chat/route.ts` so that for `coloring_book` projects, the AI Helper asks whether the creator wants single-sided pages (to protect against marker, paint, and watercolor bleed-through). When `singleSidedColoring` is `true`, the left leaf of each spread shows a clean "Bleed-Guard Reverse Sheet" (with optional lightweight page title/header and a subtle marker-safe indicator in preview, and a clean bleed-safe back sheet in PDF).

### 5. AG Grid AI Operations Copilot & Unit Economics
- **Choice**: Enhance `OrdersDataGrid.tsx` and `OrderTrackingGrid.tsx` with:
  - **Natural-Language AI Grid Copilot Bar**: Users can type queries like `"Show physical orders in production"`, `"Orders with Channel3 art bundle"`, `"High margin orders"`, or `"Reset filters"`, or click preset AI prompt pills. The copilot parses intent (locally + via `/api/ai/paypal-agent` when needed) and calls `gridRef.current.api.setFilterModel(...)` / `applyColumnState(...)` while displaying a live AI financial summary banner.
  - **Unit Economics Columns**: Add calculated columns for **AI COGS** (`$0.065 × pages`), **Net Margin %** (with visual progress bar & `62%` target badge), **Channel3 Bundle**, and an interactive **Simulate Lulu Stage** action button in each row so hackathon judges can watch live order progression (`paid` → `in_production` → `shipped` → `delivered`) and see KPI cards + grid aggregations update instantaneously.

## Risks / Trade-offs

- **[Risk] Gemini image generation returning non-square aspect ratios on page redesigns** → **Mitigation**: Explicitly include `"square 1:1 full-bleed composition filling the entire frame edge-to-edge, no outer margins or letterboxing"` in `getCleanIllustrationPrompt` (`src/app/api/ai/image/route.ts`) and use `w-full h-full object-cover` inside a square aspect container in `BookViewer.tsx`.
- **[Risk] Users attempting physical print checkout before designing a cover** → **Mitigation**: In `OrderSummaryModal.tsx`, when `fulfillmentType === "physical_print"` and `!book.cover?.isDesigned`, render a prominent error callout (`"Front Cover is mandatory for physical Lulu printing"`), hide/disable the PayPal button for physical mode, and provide a `Design Front Cover in Studio` button that closes the modal and triggers cover design. For `digital_pdf` or `Download Full PDF`, show a non-blocking warning confirmation modal with `Download Anyway` vs. `Design Cover First`.
