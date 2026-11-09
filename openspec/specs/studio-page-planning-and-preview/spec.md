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
