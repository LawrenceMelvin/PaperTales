# PaperTales AI 📖✨
> **Co-Create Custom Story & Coloring Books with AI — Hold the Real Book in Your Hands.**  
> *Submitted to the [PayPal AI Hackathon 2026](https://paypalaihackathon.devpost.com/)*

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![Next.js 15](https://img.shields.io/badge/Next.js-15.1-black)](https://nextjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-22.14%20LTS-green)](https://nodejs.org/)
[![PayPal SDK](https://img.shields.io/badge/PayPal-JS%20SDK%20v6%20%7C%20Server%20v2.5-003087)](https://developer.paypal.com/)
[![AG Grid](https://img.shields.io/badge/AG%20Grid-v36.2-brightgreen)](https://www.ag-grid.com/)
[![Channel3](https://img.shields.io/badge/Channel3-Agentic%20Commerce-orange)](https://trychannel3.com/)

---

## 🌟 Overview & Problem Statement

Millions of parents, teachers, and children want to create personalized books—whether it's a child's bedtime adventure, a custom coloring book, or a classroom phonics journal. 

However, existing options are severely broken:
1. **Legacy Publishers (Wonderbly, Hooray Heroes):** Charge exorbitant prices (\$35–\$50+ per book) for rigid pre-drawn templates where users can only pick preset hair and skin tones.
2. **AI Wrappers:** Trap users in unwanted **\$20+/month subscription fatigue** for seasonal or one-off gifts, produce disjointed images with zero character consistency, and offer **zero physical printing capability**.

**PaperTales AI** bridges generative AI with programmable fintech and on-demand manufacturing:
* 🎨 **Co-Creation Studio with Character Anchor Lock:** Ensures consistent characters across every page spread.
* 🪙 **Flexible Token & Dynamic Pricing:** Transparent pay-as-you-go micro-tokens replace subscription fatigue.
* 📦 **Dual Fulfillment (Digital + Physical):** Instant 300 DPI vector PDF download OR professional saddle-stitch softcover printing delivered to the user's home via the **Lulu Print API**.
* 💳 **Deep PayPal Commerce Rails:** Transparent checkout with line-item breakdowns (AI compute + Lulu manufacturing + shipping), 1-click address retrieval (`shipping_preference: GET_FROM_FILE`), and webhook-driven fulfillment.

---

## 🚀 Key Features

### 1. Visual Character Consistency Anchor
Unlike generic prompt generators that change character designs on every page, PaperTales AI locks character traits (e.g., *Barnaby the Golden Retriever with a red scarf*) into the prompt seed pipeline for cohesive multi-page storytelling.

### 2. Deep "PayPal WITH AI" Integration
* **Dynamic Smart Orders:** The AI agent assesses project complexity (pages, trim size, binding) and dynamically calculates exact line items for the PayPal Orders API.
* **Friction-Free Shipping:** With `shipping_preference: GET_FROM_FILE`, the user's verified postal address is pulled directly from PayPal, removing address typing friction.
* **Instant Token Vault Refills:** Micro-token purchases powered by the modern PayPal JS SDK v6.

### 3. Physical Print-on-Demand via Lulu API
* Programmatically compiles 8.5" $\times$ 8.5" Square Softcover books adhering to Lulu package `0850X0850BWSTPB060UW444GXX` (60# uncoated white paper with 0.125" bleed).
* Queries `/print-job-cost-calculations/` for dynamic carrier shipping quotes.

---

## 🏆 Hackathon Sponsor Prize Qualifications

| Sponsor Prize Target | How PaperTales AI Integrates It |
| :--- | :--- |
| **Best Use of AG Grid (\$5,000 Cash)** | Powering the **Author & Teacher Operations Portal** (`/dashboard`) using `ag-grid-react` v36.2 for real-time order tracking, Lulu print job monitoring, and CSV export. |
| **Best Use of Agentic Commerce (\$5,000)** | Autonomous co-creation agent that negotiates book specs, computes manufacturing costs, and bundles matching physical companion supplies via Channel3 in a single PayPal checkout. |
| **Best Use of Channel3 (\$1,500 Cash)** | AI agentically searches and suggests curated physical art supplies (Crayola markers, colored pencils) directly inside the checkout drawer. |
| **Best Use of Render** | Production deployment of the full Next.js service on Render. |

---

## 🛠️ Tech Stack & Versioning

* **Framework:** Next.js 15.1 (App Router)
* **Frontend:** React 19, Tailwind CSS, Lucide Icons
* **Runtime:** Node.js v22.14 LTS
* **Payments:** `@paypal/react-paypal-js` v10.6.0 & `@paypal/paypal-server-sdk` v2.5.0
* **Data Grid:** `ag-grid-react` v36.2.0 & `ag-grid-community` v36.2.0
* **PDF Compilation:** `pdf-lib` v1.17.1 (300 DPI vector engine)
* **Manufacturing:** Lulu Print-on-Demand REST API (OAuth2)
* **E-Commerce Catalog:** Channel3 Agentic API

---

## ⚡ Quickstart for Judges

### 1. Clone & Install
```bash
git clone https://github.com/your-username/papertales-ai.git
cd papertales-ai
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
*(The repository includes automated fallback sandbox mock mode so judges can test every feature immediately without external API keys).*

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Verification & Demo Checklist

1. **Co-Creation Studio (`/studio`):**
   * Prompt a book (e.g., *"Space Explorer Puppy"*).
   * Customize the Character Anchor Lock traits.
   * Generate book spreads and preview the 2-page flipbook with live text editing.
2. **Instant PDF Compilation:** Click **Download PDF** to generate an 8.5x8.5 300 DPI vector PDF.
3. **Physical Print Checkout:** Click **Order Physical Print**, inspect the dynamic Lulu quote + Channel3 companion bundle, and launch the PayPal Sandbox checkout.
4. **AG Grid Operations Portal (`/dashboard`):** Inspect live orders, Lulu production statuses, tracking numbers, and test quick filtering and CSV export.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](./LICENSE) file for details. Fully open-source and compliant with Devpost submission guidelines.
