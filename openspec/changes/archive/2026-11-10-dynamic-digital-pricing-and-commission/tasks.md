# Tasks: Dynamic Digital Pricing, First Book Free & Platform Commission

## 1. Pricing Engine & First-Time Customer Eligibility

- [x] 1.1 Implement `isFirstTimeCustomer()` and `markFirstBookClaimed()` in `src/lib/token-store.ts` and verify customer state persistence
- [x] 1.2 Update `PRICING_CONFIG` in `src/lib/pricing-calculator.ts` to 65% target margin ($0.10/pg illustrated, $0.035/pg words) and support conditional 5-page deduction for first-time customers
- [x] 1.3 Add platform physical commission helper `calculateLuluCommission(printCost, shippingCost)` in `src/lib/pricing-calculator.ts` and verify exact 10% calculation

## 2. Dual-Choice Unlock Modal & Direct Digital Purchase

- [x] 2.1 Create `UnlockChoiceModal.tsx` in `src/components/` offering Track 1 (Direct Digital Book via PayPal), Track 2 (Pay with Tokens), and Track 3 (Order Physical) displaying clean retail prices without exposing internal margins
- [x] 2.2 Update `BookViewer.tsx` locked spread click handler to open `UnlockChoiceModal` with dynamic digital retail price and verify modal trigger
- [x] 2.3 Integrate direct PayPal digital capture handler in `src/app/studio/page.tsx` that marks the book unlocked, unblurs all spreads, persists the order, and activates editing/review rights

## 3. Physical Softcover 10% Commission & Digital Purchase Crediting

- [x] 3.1 Update `OrderSummaryModal.tsx` to seamlessly bundle the 10% platform commission into the physical printing fee, displaying clean customer retail line items without disclosing internal wholesale Lulu costs or commission rates
- [x] 3.2 Update `OrderSummaryModal.tsx` to automatically credit digital creation fees when the creator has already unlocked the digital edition, charging only physical printing, shipping, and commission
- [x] 3.3 Verify PayPal order payload in `src/app/api/paypal/create-order/route.ts` reflects the calibrated grand total with commission and credit adjustments

## 4. Verification & Smoke Testing

- [x] 4.1 Update `test-core.mjs` test assertions to validate 65% target margin, first-time vs returning customer quotes, and 10% physical commission
- [x] 4.2 Run `npm run build` and verify that all App Router pages compile cleanly with zero TypeScript errors
- [x] 4.3 Run `npm test` and verify that 100% of core backend smoke tests pass with exit code 0
