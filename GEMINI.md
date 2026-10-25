# PaperTales AI — Antigravity Steering Guide & Project Context

> **Project Identity:** PaperTales AI (PayPal AI Hackathon 2026)  
> **Repository:** [LawrenceMelvin/PaperTales](https://github.com/LawrenceMelvin/PaperTales)  
> **Core Mission:** Agentic Co-Creation Publishing Studio — From AI-assisted bedtime story & coloring book creation to 300 DPI vector PDFs and physical Lulu bookstore-grade softcover books.

---

## 1. 🛡️ Absolute Golden Rules

1. **Mandatory User Approval Before Code Changes:**
   - **NEVER** create, edit, delete, commit, or push code without explicit user confirmation.
   - Always propose a specification, plan, or diff first and pause for confirmation.
2. **Empirical Verification:**
   - Always verify changes with `npm test` and `npm run build` before claiming completion.
3. **Zero Secrets in Code:**
   - Never commit `.env` or `.env.local` containing live secrets.

---

## 2. 🛠️ Tech Stack & Approved Package Versions

* **Runtime & Package Manager:** Node.js v22.14.0+ (LTS) | npm 11.x
* **Framework:** Next.js 15.1.x (App Router only — no legacy Pages router)
* **Frontend:** React 19, TypeScript (strict mode enabled), Tailwind CSS v3.4.x
* **Icons & Animation:** Lucide React (`^0.475.0`), Canvas Confetti (`^1.9.4`)
* **Payments & Fintech:**
  * `@paypal/react-paypal-js` (`^10.6.0`) for client-side Smart Payment Buttons
  * `@paypal/paypal-server-sdk` (`^2.5.0`) for server-side order generation & capture
  * `@paypal/agent-toolkit` (`^1.11.0`) & `@paypal/mcp` (`^1.8.1`) for agentic workflows
* **Enterprise Data:** `ag-grid-react` & `ag-grid-community` (`^36.2.0`) with `ag-theme-quartz`
* **Agentic Commerce:** `@channel3/sdk` (`^4.1.0`) for themed art kit recommendations
* **PDF Compilation:** `pdf-lib` (`^1.17.1`) for 300 DPI print-ready vector PDF rendering
* **Print-on-Demand:** Lulu Direct REST API v2 for 8.5" × 11" saddle-stitch/perfect-bound softcovers

---

## 3. 🤖 AI Multi-Agent Pipeline & Model Guardrails

* **Monochrome Coloring Line Art:** `gpt-image-2.5-flare` (1024x1024 via `/v1/images/generations`)
  * Fast generation (~15-18s latency, ~$0.024/page compute cost).
  * Prompt style: Strict monochrome vector line art, thick continuous black outlines, zero shading, pure white background.
* **Prohibited Models:** ❌ `dall-e-2` and `dall-e-3` are retired on OpenAI API; never use them.
* **Story & Text Engine:** Gemini 2.0 Flash / GPT-4o-mini for outline generation and character anchor visual motifs.
* **Character Anchor Seed:** Locks character appearance parameters across all spreads to preserve visual consistency.

---

## 4. 💰 Dynamic Pricing & Economic Parameters

* **The "First 5 Free" Rule:** Every user gets the first 5 pages 100% free on the house.
* **Empirical COGS per Page:** **$0.065 USD (~₹5.40 INR)** (AI image + text + server compute buffer).
* **Target Net Profit Margin:** **Exact 62%**.
* **Retail Price per Paid Page:** **$0.17 USD (~₹14.50 INR)** per page above 5:
  $$\text{Paid Pages} = \max(0, \text{Total Pages} - 5)$$
  $$\text{Retail Price} = \text{Paid Pages} \times \$0.17$$
* **Net Profit per Paid Page:** **+$0.105 USD (~₹8.95 INR)**.
* **Mascot Quoter ("Barnaby"):** Dynamic non-aggressive sales quoter displaying transparent token costs from 5 up to 60+ pages.

---

## 5. 🎨 Design System: Glacier Glassmorphism

* **North Star:** *"Frozen Light"* — Ethereal translucent depth over a nocturnal abyss.
* **Palette:**
  * Primary (Ice Blue): `#7dd3fc`
  * Void Background: `#0a0e1a`
  * Foundation Surface: `#0f1524`
  * Glass Layer 1: `rgba(15, 21, 36, 0.60)` with `backdrop-filter: blur(16px)`
  * Glass Layer 2 (Elevated): `rgba(15, 21, 36, 0.75)` with `backdrop-filter: blur(24px)`
  * Luminous Border: `rgba(125, 211, 252, 0.12)`
* **Typography:** `Inter` across all headings and body copy.
* **Strict Rule:** Never use solid opaque backgrounds on cards, modals, or floating controls.

---

## 6. 📁 Key Routes

* `/` — Landing page with dynamic pricing simulator, economics breakdown, and partner showcase.
* `/studio` — Interactive AI Co-Creation Studio (character anchor, spread editor, live preview).
* `/dashboard` — Author & Print Operations Portal powered by AG Grid.
* `/api/paypal/create-order` & `/api/paypal/capture-order` — Orders v2 API transaction endpoints.
* `/api/channel3/suggest` — Companion art supply affiliate matching.
* `/api/lulu/cost-estimate` & `/api/lulu/print-job` — Lulu POD cost estimation & fulfillment.
