# Proposal

## Why

Currently, all users get 5 free pages for every book created, and unlocking blurred pages (pages 6..N) forces users to buy token packs rather than directly purchasing the exact book digitally. Additionally, creators need the ability to purchase the digital copy at a transparent 65% net profit margin over AI compute cost, review and edit it, and optionally upgrade to a physical Lulu softcover where PaperTales collects a 10% commission without charging twice for digital creation.

## What Changes

- **First-Time Customer Free Tier Limit**: The complimentary 5 free pages offer is strictly limited to first-time customers on their very first book. Returning creators and subsequent books are charged for 100% of generated pages.
- **Dynamic Pricing Engine (65% Target Margin)**: Calibrate the pricing engine to an exact 65% profit margin over live OpenAI compute COGS ($0.10/page for Illustrated linework, $0.035/page for Words & Storybooks).
- **Dual-Choice Unblur & Unlock Modal**: When pages 6..N are blurred in Studio, users can choose:
  - **Track 1: Direct Digital Book ($ via PayPal)**: 1-click checkout for the exact dynamic price of the book. Upon capture, all pages unblur immediately, granting full permissions to review, edit in AI chat, and download the 300 DPI vector PDF.
  - **Track 2: Pay with Tokens**: Deduct from an existing token balance or purchase creator token bundles.
- **Physical Book 10% Commission & Digital Credit**:
  - Physical softcover checkout takes a 10% platform commission on Lulu manufacturing costs (`(unitPrintCost + shippingCost) * 0.10`).
  - If a creator already purchased the digital book, their digital creation price is 100% credited, so they only pay the physical manufacturing cost plus the 10% commission.
- **Strict Business Data Privacy (No Margin/Commission Exposure)**: Zero customer-facing exposure of internal profit margins or commission percentages. All consumer UI, checkout modals, and invoice summaries present clean retail line items ("Digital Edition", "Archival Printing & Bookbinding", "Standard Shipping") with no mention of "65% margin" or "10% commission". These metrics remain strictly private to backend economics and the author/operator portal.

## Capabilities

### New Capabilities
- `dynamic-pricing-and-commission`: Dynamic 65% profit margin calculation, first-time customer eligibility tracking, and Lulu physical POD 10% platform commission accounting.

### Modified Capabilities
- `studio-page-planning-and-preview`: Extends the blurred locked preview lifecycle to support direct 1-click digital PayPal unlocks, immediate spread unblurring with review/edit capabilities, and digital credits toward physical softcover upgrades.

## Impact
- `src/lib/pricing-calculator.ts`: Target margin updated to 65% ($0.10/pg illustrated, $0.035/pg words), first-time customer logic, and physical commission formulas.
- `src/lib/token-store.ts`: Customer purchase history and first-book claimed tracking in localStorage.
- `src/components/BookViewer.tsx` & `src/app/studio/page.tsx`: Unlock choice modal (Direct PayPal vs Tokens), immediate spread unblurring, and edit-after-purchase flow.
- `src/components/OrderSummaryModal.tsx`: Digital credit calculation for physical softcovers and 10% commission breakdown.
- `test-core.mjs`: Test assertions updated to verify 65% target margin and 10% physical commission.
