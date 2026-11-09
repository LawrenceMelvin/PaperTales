# Spec Delta: studio-page-planning-and-preview

## MODIFIED Requirements

### Requirement: First 5 pages generated free with blurred preview for pages 6 and beyond
When the creator confirms the page plan for a book with `N` pages, the system SHALL display Pages `6..N` in `BookViewer` with a frosted blur overlay and a choice-driven unlock dialog that allows creators to unlock via direct 1-click dynamic digital PayPal payment, token deduction, or physical softcover order.

#### Scenario: Expanding a 12-page book after confirming the page plan
- **WHEN** the creator clicks the confirmed generation CTA for a 12-page book with `0` tokens
- **THEN** the system preserves Page 1 Proof, generates full content and illustrations for Pages `2..5` at zero token cost for first-time customers, and renders Pages `6..12` in `BookViewer` with a blur overlay and an `"Unlock Pages 6–12"` button

#### Scenario: Unlocking blurred pages 6..N via PayPal or tokens
- **WHEN** the creator clicks `"Unlock Pages 6–12"` on a blurred spread and completes PayPal token checkout (or spends existing tokens)
- **THEN** the system deducts the required tokens for the paid pages (`N - 5`), generates the illustrations for Pages `6..N`, and unblurs all pages in `BookViewer`

#### Scenario: Unlocking blurred pages 6..N via direct digital PayPal checkout
- **WHEN** the creator clicks `"Unlock Pages 6–12"` on a blurred spread and selects the Direct Digital Book option with 1-click PayPal payment
- **THEN** the system initiates a PayPal checkout for the exact dynamically computed book price at 65% margin, generates any unrendered illustrations upon capture, unblurs all pages in `BookViewer`, and enables full review, AI chat editing, and 300 DPI PDF download
