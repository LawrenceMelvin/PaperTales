# Sponsor Integrations & Prize Tracks
**Scope:** Global Project Rule for PaperTales AI  
**Trigger:** always_on  

## 1. AG Grid Integration ($5,000 Sponsor Prize)
* **Packages:** `ag-grid-react` & `ag-grid-community` version `^36.2.0`.
* **Theme:** Modern `ag-theme-quartz` with high contrast, responsive design.
* **Component:** `src/components/OrdersDataGrid.tsx` on the `/dashboard` route.
* **Key Grid Capabilities:**
  * Real-time search and multi-column filtering (Order ID, Customer, Book Title, Page Count, Status, Lulu Print Job).
  * Custom cell renderers: Status chips (Free Tier, Paid, Processing, Printed), currency formatting, tracking link pills.
  * AG Grid Quick Filter & CSV Export for studio print operators.
  * Direct judge showcase demonstrating high-performance, enterprise-grade data handling.

## 2. Channel3 Agentic Commerce ($1,500 & $5,000 Category)
* **Concept:** Autonomous AI affiliate shopping agent that contextualizes the coloring book story and recommends relevant physical art supplies.
* **API Route:** `src/app/api/channel3/suggest/route.ts`.
* **Smart Matching Logic:**
  * Detects story themes (e.g., Space, Dinosaurs, Safari, Superheroes).
  * Bundles physical art kits (Crayola 64-pack crayons, Dual-tip washable brush markers, themed stickers, metallic gel pens).
  * Returns product name, image, price, affiliate link, and reason for recommendation.
  * One-click checkout integration directly alongside digital and Lulu print options.

## 3. Lulu Print-on-Demand Integration
* **Concept:** High-quality physical softcover print fulfillment delivered directly to the child's home.
* **API Routes:**
  * `src/app/api/lulu/cost-estimate/route.ts`: Live shipping and print estimation.
  * `src/app/api/lulu/print-job/route.ts`: Submits 300 DPI print-ready interior and cover PDFs to Lulu Print API v2.
* **Specifications:**
  * Size: 8.5 x 11 inches (US Letter)
  * Binding: Saddle-stitch (for < 32 pages) or Perfect Bound (32+ pages)
  * Interior Color: Black & white standard 60# uncoated white paper (ideal for crayons and coloring markers).

## 4. Render Cloud Deployment
* **Platform:** Render Web Service (Node.js LTS / Docker).
* **Build Command:** `npm run build`
* **Start Command:** `npm start`
* **Health Check Route:** `/api/health`
* **Required Environment Variables:**
  * `NEXT_PUBLIC_PAYPAL_CLIENT_ID`
  * `PAYPAL_CLIENT_SECRET`
  * `PAYPAL_ENVIRONMENT` (`sandbox` or `production`)
  * `OPENAI_API_KEY`
  * `GEMINI_API_KEY`
  * `LULU_CLIENT_KEY` / `LULU_CLIENT_SECRET`
