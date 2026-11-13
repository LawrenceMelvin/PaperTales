# Spec Delta: studio-page-planning-and-preview

## ADDED Requirements

### Requirement: AI Helper Cover Concept Proposal and user confirmation before cover generation
Before generating final book cover artwork, the AI Helper SHALL propose a structured Cover Concept tailored to the book's topic—specifying the cover background color, detailed front cover design, and detailed back cover design—and wait for user confirmation, additions, or redesign instructions.

#### Scenario: Proposing a topic-matched cover concept for user approval
- **WHEN** the creator enters cover design after planning interior pages
- **THEN** the AI Helper presents a Cover Concept Proposal with the proposed background color (including a true black `#0A0A0C` option), detailed front cover visual description, and detailed back cover description, allowing the creator to approve, edit details, or request a completely different design

#### Scenario: Creator modifies or replaces the proposed cover concept
- **WHEN** the creator replies with custom cover requirements (such as a true black background with specific golden imagery)
- **THEN** the system updates the pending cover concept color and prompt verbatim without discarding the request and either asks for confirmation or generates using those exact parameters

### Requirement: Exact cover prompt fidelity without forced children's style or embedded text
Cover image generation SHALL honor the creator's explicit visual description and selected color scheme directly without injecting children's storybook styles or generating rendered title or author text inside the artwork.

#### Scenario: Generating a custom non-children's cover from an explicit prompt
- **WHEN** the creator requests a cover design for a daily logbook or custom adult theme (such as `"a black cover with a golden man standing in the bottom middle and money pouring on him"`)
- **THEN** the image generation pipeline preserves the requested subject, composition, and true black background without converting the subject into a playful children's mascot or embedding invented book titles inside the image

### Requirement: Clean front and back book cover spread without barcodes or print metadata
The front and back book cover spread in both the interactive viewer and PDF export SHALL omit `'Personal Keepsake Edition'`, trim-size print labels (`'6" x 9" Lulu POD'`), `'Archival Softcover Keepsake'` callout boxes, `'Lulu Direct 300 DPI'`, placeholder ISBN text, and barcodes.

#### Scenario: Inspecting or exporting a generated book cover spread
- **WHEN** the creator views the front and back cover spread in the Studio preview or exports the print-ready PDF
- **THEN** the front cover displays only the book title, optional subtitle, cover artwork, and author byline (if provided), and the back cover displays only the book title and topic-tailored synopsis over the confirmed cover color without barcodes or Lulu metadata

### Requirement: Opt-in Channel3 companion products and Digital PDF default on Unlock & Download
Checkout SHALL keep companion art supply add-ons unselected by default until explicitly picked by the user, and clicking `"Unlock & Download Full PDF"` SHALL open checkout defaulted to `"Instant Digital PDF"`.

#### Scenario: Opening checkout from Unlock & Download Full PDF
- **WHEN** the creator clicks `"Unlock & Download Full PDF"` for a locked book
- **THEN** the checkout modal opens with `"Instant Digital PDF"` selected by default and zero Channel3 companion items pre-selected in the order total

#### Scenario: Explicitly opting into a companion art kit add-on
- **WHEN** the creator clicks the add button (`+`) on a Channel3 companion product in checkout
- **THEN** only that chosen companion product is added to the itemized breakdown and total amount

### Requirement: Resilient PayPal popup close recovery and Sandbox decline fallback
Checkout SHALL reset PayPal session state cleanly whenever the buyer closes the PayPal popup early (`'x'`), avoid cross-border Sandbox shipping-address blocks on digital/token orders, and provide an interactive Sandbox fallback recovery option if PayPal Sandbox declines a transaction.

#### Scenario: Buyer closes the PayPal popup before completing payment
- **WHEN** the creator closes the PayPal checkout window via `'x'` and retries payment
- **THEN** the checkout modal cancels the prior modal processing lock, mounts a fresh PayPal checkout session so payment can proceed immediately without stale session errors

#### Scenario: PayPal Sandbox declines a transaction due to international compliance checks
- **WHEN** PayPal Sandbox returns a decline or order/capture error during digital, token, or print checkout
- **THEN** the checkout modal displays clear recovery actions to reset and retry PayPal or complete a `"Sandbox Test Order"` fallback so fulfillment and PDF/book unlocking remain testable
