# Proposal: Studio UX Contrast, AI Cover Fidelity & Checkout Recovery Fixes

## Why

During end-to-end usage of PaperTales Studio (`/studio`), multiple interrelated UX, visual contrast, AI cover generation, and PayPal Sandbox checkout issues degrade usability and break user trust:
1. Legacy dark-mode utility classes (`text-emerald-100`, `text-white`, `text-sky-300`, `text-rose-200`) remain inside Warm Sunlit Atelier light cream/white components (`src/app/studio/page.tsx`, `OrderSummaryModal.tsx`, `TokenModal.tsx`, `BookDetailsModal.tsx`, `BookLibraryModal.tsx`, and the `BookViewer.tsx` AI refine popover), making the chat `"Changes Applied"` diff box, `"Trim Size & Book Dimension:"` label, warning banners, and checkout prices nearly invisible.
2. Clicking `"Unlock & Download Full PDF"` opens `OrderSummaryModal` defaulted to `"Physical Printed Book"` and auto-selects a Channel3 companion product (`products[0]`), inflating checkout totals with unrequested items and forcing physical shipping address validation (`GET_FROM_FILE`).
3. Cover image generation defaults to `"warm_cream"` and wraps every request in `"Children's book illustration... Playful, colorful illustrations, delightful character expression"` in `/api/ai/image` while `/api/ai/chat` rewrites user cover prompts, producing unrelated children's covers (or smiling coin mascots instead of a requested black-and-gold human scene) alongside unwanted print metadata (`'Personal Keepsake Edition'`, `'6" x 9" Lulu POD'`, `'Archival Softcover Keepsake'` box, `'Lulu Direct 300 DPI / ISBN'`, and a fake `'PAPER-TALES-AI'` barcode).
4. Closing the PayPal popup (`'x'`) early or checking out with cross-border Sandbox accounts triggers `"Transaction declined - To comply with international regulations"` (`generic-error`) and leaves `<PayPalButtons>` stuck on a dead session ID with no recovery path.

## What Changes

1. **Studio & Modal Contrast Unification (Warm Sunlit Atelier)**:
   - Replace all low-contrast light-on-light text in `src/app/studio/page.tsx` (`Changes Applied` green pill, Print-Safe advisory button, Suggested Book Titles, loading/reference banners, and `Trim Size & Book Dimension:` labels).
   - Restyle `OrderSummaryModal.tsx`, `TokenModal.tsx`, `BookDetailsModal.tsx`, `BookLibraryModal.tsx`, and `BookViewer.tsx` AI refine popover to the Warm Sunlit Atelier theme (`#FFFDF9` / `#FAF6EE` cards, `#1E2530` charcoal text, `#5C5347` muted text, warm amber/emerald accents, and legible rose alert banners).
2. **Digital PDF Default & Opt-In Channel3 Selection**:
   - Default `OrderSummaryModal` to the `"Instant Digital PDF"` (`digital_pdf`) tab when opened via `"Unlock & Download Full PDF"` (while keeping `"Physical Printed Book"` as the default for physical print triggers).
   - Initialize `selectedCompanion` to `null` across `OrderSummaryModal.tsx` and `studio/page.tsx` so Channel3 companion art products are strictly opt-in via explicit `+` selection.
3. **AI Helper Cover Concept Proposal, Prompt Fidelity & Clean Cover Spread**:
   - Have the AI Helper propose a detailed **Book Cover Concept** tailored to the book's actual topic—specifying **Cover Color Scheme** (including a true black `midnight_black` `#0A0A0C` option), **Front Cover Design in detail**, and **Back Cover Design in detail**—letting the user approve, add details, or request a different cover before cover generation runs.
   - Stop injecting `"Children's book illustration... Playful, colorful illustrations"` into cover (`isCover`) and non-children's image prompts in `/api/ai/image`, prohibit text inside cover artwork, preserve the user's literal cover description in `/api/ai/chat`, and pass updated `coverDraft` directly to `handleDesignBookCover(overrideDraft)`.
   - Remove `'Personal Keepsake Edition'`, `'6" x 9" Lulu POD'`, the `'Archival Softcover Keepsake'` box, `'Lulu Direct 300 DPI'`, `'ISBN 978-0-PT-AI-2026'`, and the `'PAPER-TALES-AI'` barcode from both `BookViewer.tsx` and `pdf-builder.ts`, replacing generic children's back-cover boilerplate with the book's actual synopsis.
4. **PayPal Popup Close (`'x'`) Recovery & Sandbox Decline Fallback**:
   - Set `shipping_preference: "NO_SHIPPING"` in `src/lib/paypal-client.ts` whenever physical shipping is not needed and assign unique timestamped `custom_id`s to orders.
   - Add `onCancel` handlers and `paypalRetryKey` session resets to `<PayPalButtons>` in `OrderSummaryModal.tsx`, `UnlockChoiceModal.tsx`, and `TokenModal.tsx`.
   - Render a `"Reset & Retry PayPal"` button and a `"Complete Sandbox Test Order"` fallback action if PayPal Sandbox returns a decline/error so testing is never dead-ended.

## Capabilities

### New Capabilities
- None (all requirements extend existing Atelier visual and Studio/Checkout capabilities).

### Modified Capabilities
- `site-visual-theme`: Extend accessible contrast and Warm Sunlit Atelier surface/ink rules across Studio chat diff indicators, Book Confirmation labels, and all Studio/Checkout modals (`OrderSummaryModal`, `TokenModal`, `BookDetailsModal`, `BookLibraryModal`, and `BookViewer` AI popover).
- `studio-page-planning-and-preview`: Add interactive AI Helper Cover Concept Proposal & user confirmation before cover generation, strict cover prompt fidelity with true black (`midnight_black`) support, clean front/back cover rendering without barcodes or Lulu metadata, opt-in Channel3 companion selection, Digital PDF tab default for `"Unlock & Download Full PDF"`, and resilient PayPal `'x'` close recovery + Sandbox decline fallback.

## Impact

- **UI Components**: `src/app/studio/page.tsx`, `src/components/BookViewer.tsx`, `src/components/OrderSummaryModal.tsx`, `src/components/UnlockChoiceModal.tsx`, `src/components/TokenModal.tsx`, `src/components/BookDetailsModal.tsx`, `src/components/BookLibraryModal.tsx`
- **AI & Backend APIs**: `src/app/api/ai/chat/route.ts`, `src/app/api/ai/image/route.ts`, `src/app/api/paypal/create-order/route.ts`
- **Libraries**: `src/lib/pdf-builder.ts`, `src/lib/paypal-client.ts`
