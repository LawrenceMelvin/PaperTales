# PaperTales AI 📖✨

> **Co-Create Original Bedtime Stories & Coloring Books with AI — From Digital Canvas to Bound Keepsake.**  
> Built for the **PayPal AI Hackathon 2026**.

---

## 📖 About the Project

**PaperTales AI** is an agentic creative studio that bridges multi-agent generative AI with programmable fintech and on-demand physical book manufacturing. 

Parents, educators, and children can co-create personalized narrative adventures and coloring books, customize character designs, and instantly choose between digital vector PDF downloads or bookstore-grade, softcover physical books shipped directly to their doorstep.

### Key Capabilities

- **Character Anchor Lock:** Solves the classic generative image consistency problem by locking character appearance seeds and visual motifs across every page in the book.
- **Dynamic Pricing Engine:** Calculates transparent, pay-as-you-go pricing in real time based on page volume, illustration complexity, paper stock, and printing tier (with the first 5 pages always free).
- **Dual Fulfillment Rails:**
  - **Instant Digital Edition:** Generates 300 DPI print-ready vector PDF files with custom typography and clean coloring linework.
  - **Physical Print-on-Demand:** Seamlessly routes orders to **Lulu Direct POD** for perfect-bound 8.5" × 8.5" square softcover books on archival paper.
- **Agentic Commerce & Companion Art Kits:** Suggests matching physical art supplies (markers, colored pencils) tailored to the book's story themes via **Channel3**.
- **Deep PayPal Commerce:** 1-click dynamic checkout with full itemized line-item breakdown (AI compute + Lulu manufacturing + shipping), automatic shipping address retrieval, and webhook verification.
- **Operations & Order Dashboard:** Real-time production management and tracking powered by **AG Grid**.

---

## 🛠️ Tech Stack

| Category | Technology | Description |
| :--- | :--- | :--- |
| **Framework & Core** | [Next.js 15](https://nextjs.org/) (App Router) | React server components, modern routing, and high-performance SSR/SSG. |
| **UI & Styling** | [React 19](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/) | Responsive glacier-glass aesthetic with modern animations. |
| **Icons & Visuals** | [Lucide React](https://lucide.dev/), Canvas Confetti | Clean, lightweight UI icons and celebration effects. |
| **Payments & Rails** | [PayPal SDK](https://developer.paypal.com/) (`@paypal/react-paypal-js` & `@paypal/paypal-server-sdk`) | Dynamic order creation, instant vault refills, and webhook handling. |
| **Print-on-Demand** | [Lulu Direct REST API](https://developers.lulu.com/) | Real-time print cost estimation and automated print-job submission. |
| **Agentic Commerce** | [Channel3 API](https://trychannel3.com/) | Real-time product search and companion art supply bundles. |
| **Data Grid & Portal** | [AG Grid Community / React](https://www.ag-grid.com/) | Enterprise data grid for author order tracking and CSV reporting. |
| **PDF Generation** | [pdf-lib](https://pdf-lib.js.org/) | Client and server-side 300 DPI vector PDF compilation. |
| **AI Orchestration** | OpenAI / Gemini Models | Narrative storytelling, prompt structuring, and vector line art generation. |

---

## 🚀 Getting Started (Run Locally)

Follow these steps to clone, configure, and run PaperTales AI on your local machine.

### Prerequisites

- **Node.js:** v18.18+ or v20+ (Node v22 LTS recommended)
- **Package Manager:** `npm`, `pnpm`, or `yarn`
- **Git**

---

### 1. Clone the Repository

```bash
git clone https://github.com/LawrenceMelvin/PaperTales.git
cd PaperTales
```

---

### 2. Install Dependencies

```bash
npm install
```

---

### 3. Configure Environment Variables

Create a `.env.local` file by copying the sample configuration:

```bash
# On Linux / macOS / Git Bash:
cp .env.example .env.local

# On Windows PowerShell:
Copy-Item .env.example .env.local
```

Open `.env.local` and fill in your API credentials:

```env
# PayPal Developer Sandbox (https://developer.paypal.com/dashboard/)
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_paypal_sandbox_client_id
PAYPAL_CLIENT_SECRET=your_paypal_sandbox_client_secret
PAYPAL_ENVIRONMENT=sandbox

# Lulu Print-on-Demand Sandbox (https://developers.lulu.com/)
LULU_CLIENT_KEY=your_lulu_client_key
LULU_CLIENT_SECRET=your_lulu_client_secret
LULU_ENVIRONMENT=sandbox

# Channel3 Catalog (https://trychannel3.com/)
CHANNEL3_API_KEY=your_channel3_api_key

# AI Model Provider
GEMINI_API_KEY=your_gemini_api_key
OPENAI_API_KEY=your_openai_api_key
```

> **Note:** The application includes built-in mock fallbacks for all services, so you can explore the core UI and studio workflows even if some external API keys are not configured.

---

### 4. Run the Development Server

```bash
npm run dev
```

Open your browser and navigate to:

```
http://localhost:3000
```

---

### 5. Build for Production (Optional)

To verify production compilation and run the optimized build:

```bash
npm run build
npm start
```

---

## 📁 Key Routes

- `/` — Homepage featuring the dynamic economics engine, partner integrations, and studio overview.
- `/studio` — Interactive AI Co-Creation Studio with character anchor locks, spread editor, and live preview.
- `/dashboard` — Author & Order Operations Portal powered by AG Grid.

---

## 📄 License

This project is licensed under the **MIT License**.
