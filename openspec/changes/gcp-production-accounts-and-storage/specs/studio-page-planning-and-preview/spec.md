# Spec Delta

## ADDED Requirements

### Requirement: Sign-in gate after Master Page 1 proof
After an anonymous creator's Master Page 1 proof is generated, the studio SHALL prompt them to sign in with Google before page planning, proof redesign, or page expansion continues. The prompt SHALL show the generated proof and explain that signing in saves the character and book. Dismissing the prompt SHALL keep the proof visible but SHALL NOT allow further generation.

#### Scenario: Anonymous creator finishes the master proof
- **WHEN** an anonymous creator's Master Page 1 proof finishes generating
- **THEN** a sign-in prompt appears alongside the proof offering "Continue with Google"

#### Scenario: Creator signs in from the gate
- **WHEN** the creator completes Google Sign-In from the gate
- **THEN** the prompt closes, the proof and chat history remain, and the studio continues to the page-planning step without a page reload

#### Scenario: Creator dismisses the gate
- **WHEN** the creator dismisses the sign-in prompt and clicks a generation action
- **THEN** the sign-in prompt reappears and no generation request is made

### Requirement: Studio books auto-save to the account
For signed-in creators, the studio SHALL automatically save the book draft, including chat-derived plan, character anchor, and generated pages, to their account. It SHALL restore the latest draft when they return on any device.

#### Scenario: Returning on another device
- **WHEN** a signed-in creator who generated a master proof and 5 pages on one device opens `/studio` on another device
- **THEN** their latest book draft, including the proof and generated pages, is restored

## MODIFIED Requirements

### Requirement: First 5 pages generated free with blurred preview for pages 6 and beyond
When the creator confirms the page plan for a book with `N` pages, the system SHALL display Pages `6..N` in `BookViewer` with a frosted blur overlay and a choice-driven unlock dialog that allows creators to unlock via direct 1-click dynamic digital PayPal payment, token deduction, or physical softcover order. Token deduction and payment verification SHALL occur on the server before any paid page is generated.

#### Scenario: Expanding a 12-page book after confirming the page plan
- **WHEN** the creator clicks the confirmed generation CTA for a 12-page book with `0` tokens
- **THEN** the system preserves Page 1 Proof, generates full content and illustrations for Pages `2..5` at zero token cost for first-time customers, and renders Pages `6..12` in `BookViewer` with a blur overlay and an `"Unlock Pages 6–12"` button

#### Scenario: Unlocking blurred pages 6..N via PayPal or tokens
- **WHEN** the creator clicks `"Unlock Pages 6–12"` on a blurred spread and completes PayPal token checkout (or spends existing tokens)
- **THEN** the server atomically deducts the required tokens for the paid pages (`N - 5`) before generation, generates the illustrations for Pages `6..N`, and unblurs all pages in `BookViewer`

#### Scenario: Unlocking blurred pages 6..N via direct digital PayPal checkout
- **WHEN** the creator clicks `"Unlock Pages 6–12"` on a blurred spread and selects the Direct Digital Book option with 1-click PayPal payment
- **THEN** the system initiates a PayPal checkout for the exact dynamically computed book price at 65% margin, generates any unrendered illustrations upon capture, unblurs all pages in `BookViewer`, and enables full review, AI chat editing, and 300 DPI PDF download

#### Scenario: Unlock with insufficient server balance
- **WHEN** the creator chooses token unlock but their server-side balance is below `N - 5`
- **THEN** no pages are generated, the pages stay blurred, and the unlock dialog offers a token pack or direct PayPal purchase
