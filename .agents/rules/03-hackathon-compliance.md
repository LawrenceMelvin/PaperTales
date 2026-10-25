# PayPal AI Hackathon 2026 Compliance & Scoring Guidelines
**Scope:** Global Project Rule for PaperTales AI  
**Trigger:** always_on  

## 1. Hackathon Overview & Deadlines
* **Event:** PayPal AI Hackathon 2026 (Hosted on Devpost)
* **Deadline:** November 12, 2026 at 12:00 PM PST (Prompt submission ahead of deadline)
* **Prize Pool:** $67,500+ in total cash & sponsor tracks
* **Key Award Targets:**
  * 🥇 Overall Grand Prize / First Place ($20,000+)
  * 🥈 Best Agentic Commerce Experience ($5,000)
  * 📊 Best Enterprise Data Experience with AG Grid ($5,000)
  * 🛍️ Best Channel3 Commerce Integration ($1,500)

## 2. Mandatory Eligibility Rules
1. **Open Source Requirement:**
   * Repository must contain an open-source license. PaperTales AI uses the standard **MIT License** at the project root (`LICENSE`).
   * No proprietary, inaccessible black-box dependencies.
2. **Mandatory PayPal Integration:**
   * Must include genuine PayPal payments flow:
     * Client SDK: `@paypal/react-paypal-js` for Smart Payment Buttons.
     * Server SDK: `@paypal/paypal-server-sdk` for server-side order creation (`/api/paypal/create-order`) and capture (`/api/paypal/capture-order`).
     * Use Sandbox credentials for judge testing with mock auto-approvals when keys are omitted.
3. **Substantial AI Workflow (Agentic Co-Creation):**
   * Must demonstrate meaningful AI beyond simple one-turn chat:
     * Multi-agent publishing workflow: Story Engine (Gemini/GPT-4o-mini) -> Character Consistency Anchor -> Vector Line Art (`gpt-image-2.5-flare`) -> 300 DPI PDF compiler.
     * Agentic Mascot Quoter: Autonomous sales rep quoting exact token costs & margins.
4. **Demo Video Requirements:**
   * Maximum video length: **Strictly under 3 minutes (< 180 seconds)**.
   * Hosted on YouTube (Unlisted or Public).
   * Script structure:
     * 0:00 - 0:30: Emotional hook (parents & kids co-creating bedtime books).
     * 0:30 - 1:15: Character Anchor lock + first 5 pages generation (100% Free).
     * 1:15 - 1:45: Interactive Barnaby mascot quoting 30 pages + 1-click PayPal Token Refill.
     * 1:45 - 2:30: Flipbook interactive viewer + Channel3 art supply bundle + AG Grid dashboard.
     * 2:30 - 3:00: Lulu physical print ordering & conclusion.
5. **Security & Cleanliness:**
   * Never commit `.env` or `.env.local` containing live API keys.
   * Keep tests passing: `npm test` and `npm run build` must cleanly succeed without errors.
