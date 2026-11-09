# lulu-cover-and-wysiwyg-pdf Specification Delta

## Purpose

Governs 1:1 WYSIWYG parity between the virtual `BookViewer` and compiled PDFs, single-sided coloring book bleed-guard pages, front+back wraparound cover spread rendering, mandatory front cover enforcement for physical print orders (and warning for digital PDFs), and Lulu POD separate Cover PDF (`Back + Spine + Front` with `0.125"` bleed) vs. Interior PDF compilation.

## ADDED Requirements

### Requirement: 1:1 WYSIWYG PDF parity with virtual book spreads
The PDF compiler (`pdf-builder.ts`) SHALL render interior pages and covers to visually match the two-page virtual book layout in `BookViewer` without drawing unrequested outer black rectangle frames around illustrations or combining separate left/right spread leaves onto a single cramped page.

#### Scenario: Downloading a storybook or coloring book PDF
- **WHEN** the creator downloads the full PDF for a storybook or coloring book
- **THEN** each spread renders the left leaf (title/story or single-sided bleed guard) and right leaf (full-frame illustration without an outer `drawRectangle` border) matching `BookViewer`

### Requirement: Single-sided coloring book bleed-guard PDF and spread rendering
When `singleSidedColoring` is enabled on a coloring book project, the system SHALL keep the back side of each coloring illustration sheet free of heavy artwork so markers and watercolor paints do not bleed into another illustration.

#### Scenario: Compiling a single-sided coloring book PDF
- **WHEN** `compileBookPdf` runs for a project with `singleSidedColoring: true`
- **THEN** each coloring illustration page is paired with a clean reverse/left bleed-guard page containing at most the page title or blank archival space

### Requirement: Digital PDF download warning and Physical Print mandatory cover error
The system SHALL warn the creator if they download a digital PDF before designing a Front Cover (`!book.cover?.isDesigned`), and SHALL block Physical Print checkout with a clear error message if a Front Cover has not been designed.

#### Scenario: Downloading Digital PDF without a designed Front Cover
- **WHEN** the creator clicks `Download Full PDF` while `book.cover?.isDesigned` is falsey
- **THEN** the system displays a warning dialog allowing the creator either to design the Front Cover first or proceed with an interior-only / default-cover PDF download

#### Scenario: Attempting Physical Print order without a designed Front Cover
- **WHEN** the creator opens Physical Print checkout (`fulfillmentType === "physical_print"`) while `book.cover?.isDesigned` is falsey
- **THEN** the system displays an error banner stating that a designed Front Cover is mandatory for Lulu physical manufacturing, disables the PayPal checkout button for physical print, and provides a one-click button to design the cover

### Requirement: Lulu POD separate Wraparound Cover PDF and Interior PDF generation
For physical print fulfillment via Lulu Direct API v2, the system SHALL compile two separate PDFs—a 1-page Wraparound Cover PDF (`[Back Cover + Spine + Front Cover]` with `0.125"` outer bleed) and an Interior-Only PDF—and pass their URLs to `submitLuluPrintJob`.

#### Scenario: Calculating Lulu wraparound cover dimensions and submitting print job
- **WHEN** a physical print order is captured via `/api/paypal/capture-order` or previewed via `/api/pdf/compile?mode=lulu_cover`
- **THEN** the cover PDF is sized to `(2 * TrimWidth + SpineWidth + 0.25")` width by `(TrimHeight + 0.25")` height (where `SpineWidth` is `0"` for saddle-stitch `< 32` pages or `(pageCount / 444) + 0.06"` for perfect bound `>= 32` pages) with the Back Cover on the left and Front Cover on the right, and `submitLuluPrintJob` receives distinct cover and interior PDF URLs
