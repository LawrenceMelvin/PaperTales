# Proposal

## Why

The PaperTales Studio virtual book preview (`BookViewer`) currently contains floating in-page "Tweak Art" / "Tweak Cover" buttons that clutter the physical book simulation, constrains cover and redesigned page images inside padded boxes rather than edge-to-edge frames, expands in width when flipping from the Front Cover to Spread 1, and produces a downloaded PDF (`pdf-builder.ts`) that does not visually match the two-page virtual book or separate the wraparound cover from the interior pages as required by Lulu Print-on-Demand. Furthermore, coloring book creators need a single-sided printing option to prevent paint and marker bleed-through, checkout needs live Channel3 catalog search beyond two static suggestions, and the AG Grid operations portal needs AI-driven natural-language filtering and PayPal/Lulu/Channel3 unit economics to maximize hackathon sponsor impact.

## What Changes

- **Remove In-Book Tweak Controls & Add "Edit This Page in Chat" Below Book**:
  - Remove all floating `Tweak Art 2 🪙`, `Tweak Cover`, `Design in Chat`, and daily motif `Tweak` buttons and the standalone art tweak modal from inside the book pages and cover in `BookViewer.tsx`.
  - Add an external **`Edit This Page in Chat`** (or **`Edit Cover in Chat`** on Index 0) button below the book next to the pagination bar that attaches the active page or cover as a structured reference chip in the Studio AI chat with its page number, title, story/prompt details, and current image so the creator can conversational-edit that specific page.
- **Full-Frame Edge-to-Edge Illustrations & Non-Expanding Virtual Book**:
  - Remove restrictive height caps (`max-h-[360px]`, `max-h-[240px]`) and inner box frames on both the Front Cover and Interior Right Pages so generated artwork expands edge-to-edge within the page leaf, and enforce square/full-frame aspect ratios in `/api/ai/image`.
  - Lock `BookViewer` to a consistent two-page spread footprint across both the Cover (`Index 0`: Back Cover on left leaf, Front Cover on right leaf) and Interior Spreads (`Index 1..N`) so opening the book never visually expands or jumps in size.
- **Single-Sided Coloring Book Bleed-Guard Option**:
  - Update the Studio AI Helper (`/api/ai/chat`) to ask coloring book creators whether they want **Single-Sided Coloring Pages** (leaving the reverse side of each coloring page blank/framed to prevent paint and marker bleed-through).
  - Support `singleSidedColoring` in `BookProject`, `BookViewer`, and `pdf-builder.ts`.
- **Front Cover Validation & Lulu POD Wraparound Cover vs. Interior PDF Separation**:
  - Display a warning confirmation when downloading a digital PDF without a designed Front Cover (`!book.cover?.isDesigned`), and strictly block Physical Print orders in Studio and `OrderSummaryModal` with an actionable error until a Front Cover is designed.
  - Upgrade `pdf-builder.ts` and `/api/pdf/compile` so downloaded PDFs match the virtual book 1:1 (WYSIWYG without double outer rectangle borders) and support separate Lulu-compliant **Wraparound Cover PDF** (`[Back Cover + Spine + Front Cover]` with `0.125"` bleed) and **Interior-Only PDF** generation for `submitLuluPrintJob`.
- **Channel3 Product Search & Expanded Recommendations in Checkout**:
  - Expand initial companion suggestions in `OrderSummaryModal` from 2 to 4–6 items and add an interactive Channel3 search bar so users can search and bundle any specific art supply or gift item from the Channel3 API during checkout.
- **AG Grid AI Operations Copilot & Unit Economics Dashboard**:
  - Upgrade `OrdersDataGrid.tsx` (`/dashboard`) and `OrderTrackingGrid.tsx` (`My Orders` modal) with a natural-language **AI Grid Copilot** filter/query bar, interactive KPI cross-filtering, and unit economics columns (COGS `$0.065/pg`, Retail `$0.17/pg`, 62% Net Profit Margin, Lulu POD cost, Channel3 affiliate attribution, and live Lulu stage simulation).

## Capabilities

### New Capabilities
- `lulu-cover-and-wysiwyg-pdf`: Governs 1:1 WYSIWYG parity between the virtual `BookViewer` and compiled PDFs, single-sided coloring book bleed-guard pages, front+back wraparound cover spread rendering, mandatory front cover enforcement for physical print orders (and warning for digital PDFs), and Lulu POD separate Cover PDF (`Back + Spine + Front` with `0.125"` bleed) vs. Interior PDF compilation.
- `channel3-checkout-and-aggrid-analytics`: Governs live Channel3 product search and multi-item recommendation browsing inside `OrderSummaryModal`, plus the AG Grid AI Operations Copilot, interactive KPI cross-filtering, and PayPal/Lulu/Channel3 unit economics telemetry in `OrdersDataGrid` and `OrderTrackingGrid`.

### Modified Capabilities
- `studio-page-planning-and-preview`: Adds requirements for pure virtual book rendering without in-page tweak buttons, constant two-page spread dimensions across cover and interior spreads, edge-to-edge illustration framing, the external "Edit This Page in Chat" reference attachment workflow, and AI Helper consultation for single-sided coloring book pages.

## Impact

- **Types**: `src/types/book.ts` (`singleSidedColoring`, `backCoverSynopsis` on `BookCoverDesign`, page reference chat attachment types) and `src/types/order.ts`.
- **Components**:
  - `src/components/BookViewer.tsx`
  - `src/components/OrderSummaryModal.tsx`
  - `src/components/OrdersDataGrid.tsx`
  - `src/components/OrderTrackingGrid.tsx`
- **Pages & API Routes**:
  - `src/app/studio/page.tsx`
  - `src/app/dashboard/page.tsx`
  - `src/app/api/ai/chat/route.ts`
  - `src/app/api/ai/image/route.ts`
  - `src/app/api/pdf/compile/route.ts`
  - `src/app/api/paypal/capture-order/route.ts`
  - `src/lib/pdf-builder.ts`
  - `src/lib/lulu-client.ts`
