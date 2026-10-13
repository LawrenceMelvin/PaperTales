# Groq AI Dual-Engine, Print-Safe Advisory & AG Grid Order Tracker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate Groq AI (`openai/gpt-oss-120b` and `20b`) for sub-second, zero-cost story synthesis and text refinements, add transparent copyright & Lulu print-safe user advisory with choice controls, and build an enterprise AG Grid order & fulfillment tracking dashboard.

**Architecture:**
1. **Groq Dual-Engine Provider:** In `/api/ai/refine` and `/api/ai/chat`, check `GROQ_API_KEY` first (ultra-low latency, free tier), falling back to OpenAI `gpt-4o-mini`.
2. **Transparent Print-Safety & Copyright Advisory:** Copilot detects known trademarked characters and returns transparent advisory with 1-click "Adopt Print-Safe Title" or "Keep Original & Send to Print".
3. **AG Grid Order & Fulfillment Tracker:** New component `src/components/OrderTrackingGrid.tsx` with `ag-theme-quartz-dark` and order persistence in `src/lib/order-store.ts`, accessible from Studio navbar and Order Modal.

**Tech Stack:** Next.js 15, React 19, TypeScript, Groq API (LPUs), AG Grid Community 36, Tailwind CSS, Lucide React, PayPal JavaScript SDK.

## Global Constraints
- Maintain Glacier Glass dark aesthetic (`ag-theme-quartz-dark`, `glacier-glass`, `text-sky-300`).
- No new npm packages needed (`ag-grid-react` and `ag-grid-community` are already installed).
- Strictly typed in TypeScript (`npx tsc --noEmit` must pass with 0 errors).
- Explicit user approval required before any code modifications.

---

### Task 1: Create Order Persistence Store & Types for AG Grid

**Files:**
- Create: `src/lib/order-store.ts`
- Modify: `src/types/order.ts`

**Interfaces:**
- Consumes:
  - `BookProject` from `@/types/book`
- Produces:
  - `PublishOrder` interface with `printRiskStatus: "safe" | "custom_requested"` and `fulfillmentStatus: "proof_confirmed" | "sent_to_lulu" | "printing" | "shipped"`
  - `getClientOrders(): PublishOrder[]`
  - `addClientOrder(order: PublishOrder): void`
  - `seedDefaultOrders(): void`

- [x] **Step 1: Extend `src/types/order.ts` with `PublishOrder`**
  Add:
  ```ts
  export interface PublishOrder {
    id: string;
    bookTitle: string;
    authorName: string;
    genre: string;
    characterName: string;
    pageCount: number;
    printRiskStatus: "safe" | "custom_requested";
    fulfillmentStatus: "proof_confirmed" | "sent_to_lulu" | "printing" | "shipped";
    luluJobId?: string;
    trackingUrl?: string;
    paypalTxnId?: string;
    totalAmountUsd: number;
    tokensUsed: number;
    createdAt: string;
  }
  ```

- [x] **Step 2: Implement `src/lib/order-store.ts`**
  Implement localStorage storage with sample orders so the AG Grid displays realistic data immediately:
  - Sample 1: "Leo's Spider Web-Weaver" (🟢 Print-Safe Verified, Shipped)
  - Sample 2: "Barnaby's Whispering Woods" (🟢 Print-Safe Verified, Printing)
  - Sample 3: "Elsa's Frost Kingdom" (🟡 User Custom Requested, Sent to Lulu)

---

### Task 3: Wire Groq AI & Print-Safe Advisory into `/api/ai/chat/route.ts`

**Files:**
- Modify: `src/app/api/ai/chat/route.ts`

**Interfaces:**
- Consumes:
  - `process.env.GROQ_API_KEY`
  - `process.env.OPENAI_API_KEY`
- Produces:
  - Structured `printAdvisory` in response JSON:
    ```ts
    printAdvisory?: {
      hasRisk: boolean;
      franchiseName?: string;
      safeTitle?: string;
      safeCharacter?: string;
      explanation?: string;
    }
    ```

- [x] **Step 1: Add Groq API call logic with `openai/gpt-oss-120b`**
  Check `process.env.GROQ_API_KEY`:
  If present, point to `https://api.groq.com/openai/v1/chat/completions` with model `openai/gpt-oss-120b`. If missing, fall back to OpenAI `gpt-4o-mini`.

- [x] **Step 2: Add Print-Safe Advisory extraction to system prompt**
  Instruct the model to detect trademarks (Spider-Man, Frozen, Pokemon, etc.) and suggest print-safe homages while honoring the user's intent.

---

### Task 4: Wire Groq AI into `/api/ai/refine/route.ts`

**Files:**
- Modify: `src/app/api/ai/refine/route.ts`

**Interfaces:**
- Consumes:
  - `process.env.GROQ_API_KEY`
  - `process.env.OPENAI_API_KEY`
- Produces:
  - Sub-second refinement responses (< 350ms) using `openai/gpt-oss-20b`

- [x] **Step 1: Update API call to check Groq first**
  Prioritize Groq's `openai/gpt-oss-20b` for ultra-low latency text micro-refinements, with seamless fallback to OpenAI `gpt-4o-mini`.

---

### Task 5: Build AG Grid Order Tracking Dashboard Component

**Files:**
- Create: `src/components/OrderTrackingGrid.tsx`

**Interfaces:**
- Consumes:
  - `ag-grid-react`
  - `ag-grid-community`
  - `getClientOrders()` from `@/lib/order-store`
- Produces:
  - `<OrderTrackingGrid isOpen={boolean} onClose={() => void} />`
  - Columns:
    - Order ID (monospace badge)
    - Date
    - Book Title
    - Character
    - Print Safety Badge (Custom cell renderer with 🟢 Safe vs 🟡 Custom Requested)
    - Fulfillment Status (Custom badge: Confirmed, Printing, Shipped)
    - Tracking Link
    - Actions (PDF Download, Re-print)

- [x] **Step 1: Implement `src/components/OrderTrackingGrid.tsx`**
  Import `ag-grid-community/styles/ag-grid.css` and `ag-grid-community/styles/ag-theme-quartz.css`.
  Configure `ag-theme-quartz-dark` styling with Glacier Glass container.
  Add search filter input and CSV export button using `gridApi.exportDataAsCsv()`.

---

### Task 6: Integrate Advisory & AG Grid Modal into Studio Page

**Files:**
- Modify: `src/app/studio/page.tsx`

**Interfaces:**
- Consumes:
  - `<OrderTrackingGrid />`
  - `printAdvisory` from `/api/ai/chat`
- Produces:
  - 1-Click "Adopt Print-Safe Title" vs "Keep Original Title" buttons in Copilot chat thread
  - "📦 Track Orders" button in Studio header / Navbar
  - Automatic order creation on successful PayPal checkout

- [x] **Step 1: Add Print Advisory UI card to chat message renderer**
  When `msg.printAdvisory?.hasRisk` is true, render a friendly advisory card with:
  - Button 1: *"✨ Adopt Print-Safe: [safeTitle]"*
  - Button 2: *"🛡️ Keep Original '[franchiseName]' & Send to Print"*

- [x] **Step 2: Add Order Tracker Trigger to Navbar & Order Modal**
  Add "📦 Track Orders (AG Grid)" pill in header to open `<OrderTrackingGrid />`.

---

### Task 7: Empirical Verification & Typecheck

**Files:**
- Test: `npx tsc --noEmit`
- Test: Verify local dev server at `http://localhost:3000/studio`

- [x] **Step 1: Run TypeScript strict typecheck**
  Run: `npx tsc --noEmit`
  Expected: Clean compilation with 0 errors.

- [x] **Step 2: Test Groq Chat & Refine Endpoints**
  Test with curl/PowerShell:
  - `/api/ai/chat` returns Groq 120b response with print advisory.
  - `/api/ai/refine` returns Groq 20b response in < 400ms.

- [x] **Step 3: Test AG Grid Rendering in Browser**
  Open `http://localhost:3000/studio`, click "Track Orders", verify AG Grid loads dark theme, renders rows, sorts, and filters cleanly.
