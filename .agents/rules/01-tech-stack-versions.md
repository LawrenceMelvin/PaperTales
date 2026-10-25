# Technical Standards & Approved Versions
**Scope:** Global Project Rule for PaperTales AI  
**Trigger:** always_on  

## 1. Approved Runtime & Framework Versions
* **Runtime:** Node.js v22.14.0+ (Active LTS) | npm 11.x
* **Framework:** Next.js 15 (App Router only — no legacy Pages router)
* **UI & Styling:** React 19, Tailwind CSS v3.4+, Lucide React icons
* **Language:** TypeScript with strict type checking enabled (`strict: true`)

## 2. AI Model Selection & Strict Guardrails
* **Active Image Generation Model:** `gpt-image-2.5-flare` (via `/v1/images/generations` at 1024x1024)
  * Fast generation latency (~15-18s)
  * Token-based billing: ~780-820 output tokens per image (~$0.0236 USD / ~₹2.01 INR)
  * Prompt style: Strict monochrome vector line art, thick continuous black outlines, zero shading, pure white background.
* **PROHIBITED / DEPRECATED Models:**
  * ❌ NEVER use or suggest `dall-e-2` or `dall-e-3` (Officially retired on OpenAI API).
* **Story & Text Model:** Gemini 2.0 Flash / GPT-4o-mini for rapid story outlines and character anchor seeds.

## 3. Approved Package Versions
* `@paypal/react-paypal-js`: `^10.6.0` (Client-side PayPal Buttons)
* `@paypal/paypal-server-sdk`: `^2.5.0` (Server-side orders & captures)
* `ag-grid-react` & `ag-grid-community`: `^36.2.0` (Theme: `ag-theme-quartz`)
* `pdf-lib`: `^1.17.1` (300 DPI vector PDF assembly adhering to 0.125" bleed)
