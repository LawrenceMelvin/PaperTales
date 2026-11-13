# studio-page-planning-and-preview Specification

## Purpose
Governs the PaperTales Studio (`/studio`) conversational co-planning workflow after Master Page 1 Proof generation, the 5-free-pages + blurred locked preview lifecycle with PayPal/Token unlocking, clean interior book spread rendering without duplicate borders or watermarks, and strict opt-in protagonist and page-number defaults.

## Requirements

### Requirement: Mandatory post-Page-1 conversational planning and confirmation
After Master Page 1 Proof is generated, the system SHALL transition the creator back into the same AI chat thread (`"page_planning"` stage) to plan and confirm what Pages `2..N` will contain before generating the remaining pages.

#### Scenario: Planning unique pages for story, coloring, activity, math, or science books
- **WHEN** the creator clicks the primary expansion button after reviewing Master Page 1 Proof for a non-journal book
- **THEN** the AI chat outlines what each remaining page (`Pages 2..N`) will contain and look like and waits for explicit creator confirmation before enabling full generation

#### Scenario: Planning repeating or daily-varying pages for journals and notebooks
- **WHEN** the creator clicks the primary expansion button after reviewing Master Page 1 Proof for a journal or notebook
- **THEN** the AI chat asks whether Pages `2..N` should repeat the same layout or vary daily prompts, quotes, or spot illustrations and waits for explicit creator confirmation before enabling generation

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

### Requirement: No unrequested default protagonist injection
The system SHALL NOT inject `"Barnaby"` or `"Golden Retriever Puppy"` into chat state, page titles, story text, or image prompts unless the creator explicitly selected a Barnaby preset or named that character in the conversation.

#### Scenario: Creator designs a general animal coloring book without naming a protagonist
- **WHEN** the creator asks in chat for a coloring book of cute animals without mentioning Barnaby
- **THEN** the generated Page 1 Proof and subsequent pages contain only the creator's requested animals and title without referencing `"Barnaby the Golden Retriever Puppy"`

### Requirement: Clean interior page rendering without double borders, watermarks, or forced footers
The `BookViewer` component SHALL render interior pages without an outer CSS box border around AI illustrations, without technical `"300 DPI"` watermark badges, without empty `"CHAPTER"` headers when no story text exists, without page-number footers unless requested in chat, and formatted on archival warm paper backgrounds (`#FFFDF8`) with deep charcoal typography matching the Warm Sunlit Atelier design system.

#### Scenario: Rendering a coloring page with an AI-generated animal border
- **WHEN** `BookViewer` renders an interior coloring or illustration page
- **THEN** the illustration is displayed without a second outer CSS `border-slate-900` frame, without `"Crisp Vector Line-Art • Print Ready (300 DPI) • COLORING BOOK"`, and without `"Activity & Coloring Sheet | Page 1 Illustration"`

#### Scenario: Opt-in page numbers via chat
- **WHEN** the creator asks the AI helper in chat to include page numbers on the book pages
- **THEN** `showPageNumbers` is enabled on the book project and `BookViewer` displays the page number on interior pages

#### Scenario: Rendering interior spreads in Warm Atelier paper aesthetic
- **WHEN** the creator previews book spreads in `BookViewer` inside the Studio
- **THEN** the page canvas renders in warm ivory archival book paper with soft spine creases and charcoal ink text rather than dark slate panels

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
