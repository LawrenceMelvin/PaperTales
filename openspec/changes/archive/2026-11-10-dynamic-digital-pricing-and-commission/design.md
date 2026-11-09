# Design

## Context

See `proposal.md` for background. The current PaperTales commerce engine assumes that every book generated automatically subtracts 5 pages, and unlocking blurred pages requires buying token packs. This design introduces dynamic single-book digital purchasing at a 65% profit margin, restricts the trial 5-free-pages benefit to first-time customer accounts, and implements a 10% platform commission on physical Lulu printing.

## Goals / Non-Goals

**Goals:**
- Provide a clear, transparent customer tier check: First-time customers get their first book with 5 free pages; returning customers pay for all pages.
- Calibrate the pricing engine to an exact 65% profit margin over live compute costs ($0.10/page for Illustrated, $0.035/page for Words).
- Provide a dual-choice unlock modal on blurred spreads giving creators the option to buy the digital copy directly via PayPal without buying token packs.
- Provide immediate unblurring, review, AI chat editing, and 300 DPI vector PDF download upon digital purchase.
- Implement a 10% platform commission on Lulu physical softcover manufacturing, with automatic 100% credit for previous digital purchases.

**Non-Goals:**
- Requiring a compulsory user login/password or backend auth database (client-side persistence via localStorage provides frictionless checkout).
- Changing OpenAI image generation models or Lulu POD fulfillment endpoints.

## Decisions

### 1. Customer Eligibility Detection via Local Storage
- **Choice**: Introduce `isFirstTimeCustomer()` in `src/lib/token-store.ts` that inspects `papertales_first_book_claimed` and `papertales_orders`.
- **Rationale**: Keeps the zero-login, instant-creator onboarding experience intact while reliably separating new trial creators from returning creators.
- **Alternatives Considered**: Mandatory user accounts with passwords (rejected due to signup friction).

### 2. Recalibrating Dynamic Pricing to 65% Net Margin
- **Choice**: Update `PRICING_CONFIG` in `src/lib/pricing-calculator.ts`:
  - `TARGET_MARGIN: 0.65`
  - `PRICE_PER_ILLUSTRATED_PAGE_USD: 0.10` ($0.035 COGS / 0.35)
  - `PRICE_PER_WORDS_PAGE_USD: 0.035` ($0.011 COGS / 0.35)
- **Rationale**: Accurately reflects compute model costs with a transparent 65% gross profit margin.

### 3. Dual-Choice Unlock Modal in Studio
- **Choice**: When a user clicks a locked page spread or "Unlock Pages", render an `UnlockChoiceModal` component presenting:
  - **Option 1: Direct Digital Book ($ via PayPal)** with live dynamic quote.
  - **Option 2: Pay with Tokens** (or purchase bundle).
  - **Option 3: Order Physical Softcover**.
- **Rationale**: Empowers creators to choose whether they want an individual digital purchase or prefer token packages.

### 4. 10% Platform Commission & Digital Purchase Crediting
- **Choice**:
  - `luluCommission = Number(((luluQuote.unitPrintCost + luluQuote.shippingCost) * 0.10).toFixed(2))`
  - If `isDigitalUnlocked === true`, creation fee is credited ($0.00), so the creator only pays `unitPrintCost + shippingCost + luluCommission`.
- **Rationale**: Avoids double-charging creators who first unlock the digital book to review and edit before deciding to order a physical softcover keepsake.

### 5. Strict Separation of Internal Business Metrics vs. Customer Retail Presentation
- **Choice**: The 65% profit margin and 10% platform commission are computed internally for revenue optimization and dashboard tracking. The customer-facing UI never exposes these internal percentages:
  - Digital books are presented simply as retail pricing (e.g. `$1.90` or `$0.10/page`) without mentioning a 65% profit margin or model COGS.
  - Physical softcover checkout bundles the 10% platform fee directly into the print & binding retail total (`Print & Binding: $X.XX`, `Shipping: $X.XX`) without disclosing Lulu wholesale rates or commission fees.
- **Rationale**: Preserves proprietary business financials and avoids customer friction while maintaining transparent retail checkout.

## Risks / Trade-offs

- **[Risk]** Clearing browser cookies/cache resets first-time customer status.
  → **Mitigation**: Standard behavior for local web apps; once an order is placed, PayPal capture records persist in order history.
- **[Risk]** Creator wants to edit illustrations after direct digital purchase.
  → **Mitigation**: Unlocking marks `isBookUnlocked: true`, enabling full spread review and standard AI chat re-prompting without extra fees.
