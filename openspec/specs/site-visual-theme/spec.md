# site-visual-theme Specification

## Purpose

Enforces high-contrast, accessible typography and a unified Warm Sunlit Atelier visual theme across all public and authenticated client-facing routes of PaperTales AI.

## Requirements

### Requirement: Accessible typography contrast across all page canvases
All textual headings, subtitles, labels, and interactive button text SHALL meet or exceed WCAG AA contrast standards (minimum 4.5:1 for body copy and 3.0:1 for large headlines) against their containing surface backgrounds. Pure white text (`#ffffff` or `text-white`) SHALL NOT be rendered directly over light ivory, cream, or transparent glass surfaces.

#### Scenario: Displaying hero and book showcase headlines on light canvas
- **WHEN** the main landing page renders the 3D book inspector or hero section
- **THEN** section headlines and descriptive body paragraphs render in deep editorial charcoal ink (`#1E2530` / `text-slate-900`) with legible contrast against the warm ivory `#FFFDF9` canvas

#### Scenario: Rendering interactive button labels on light controls
- **WHEN** a user views an action button over a translucent or light background (such as "Click to Open Interior Spread")
- **THEN** the button label text and associated icons render with high-contrast foreground color (`#1E2530` or bold amber) rather than washed-out white

#### Scenario: Rendering Studio chat edit confirmations and inline banners
- **WHEN** the Studio chat renders a `"Changes Applied"` diff pill, `"Adopt Print-Safe"` advisory button, `"Suggested Next Steps"`, or page-editing status banner on light cream or white surfaces
- **THEN** headings, old-to-new change summaries, and interactive buttons use high-contrast dark emerald (`#064E3B` / `text-emerald-950`), amber (`text-amber-800`), or charcoal (`#1E2530`) typography rather than pale pastel text on light fills

#### Scenario: Rendering Studio Book Confirmation Card trim size headers
- **WHEN** the Studio renders the post-discussion Book Confirmation Card over a `#FAF6EE` vellum surface
- **THEN** the `"Trim Size & Book Dimension:"` label renders in deep charcoal (`#1E2530`) and `"Lulu POD Industry Standard"` renders in high-contrast amber (`text-amber-700`)

#### Scenario: Rendering Studio checkout and utility modals in Warm Sunlit Atelier theme
- **WHEN** the user opens `OrderSummaryModal`, `TokenModal`, `BookDetailsModal`, `BookLibraryModal`, or the `BookViewer` AI refine popover
- **THEN** all modal containers, section cards, alert banners, and itemized prices render on Warm Sunlit Atelier `#FFFDF9` / `#FAF6EE` surfaces with `#1E2530` charcoal headlines, `#5C5347` muted text, and accessible dark-ink contrast for all amounts and warnings

### Requirement: Artisanal physical book aesthetic in 3D book inspector
The interactive 3D book inspector on the landing page SHALL present realistic artisanal print book aesthetics matching physical Lulu softcover publications, featuring warm tactile controls, gilded borders, and archival paper interior spreads.

#### Scenario: Switching book presets in the inspector
- **WHEN** the user selects between family recipe, coloring book, fishing guide, or bespoke journal presets
- **THEN** the selector renders in an artisanal vellum tray with amber-gold active highlighting and legible charcoal tabs

#### Scenario: Opening the 3D book to inspect interior pages
- **WHEN** the user clicks to open the 3D book cover
- **THEN** the interior spreads display archival cream paper (`#FFFDF8`), charcoal typography, and monochrome vector illustrations reflecting real printed books rather than dark navy digital cards

### Requirement: Unified Warm Sunlit Atelier theme across all sub-pages
All primary navigation routes—including `/studio`, `/pricing`, `/dashboard`, and `/bookstore`—SHALL adhere to the Warm Sunlit Atelier design system, utilizing warm ivory foundations (`#FFFDF9`), vellum surface cards (`#FAF6EE`), and honey-amber action elements.

#### Scenario: Navigating to the Studio, Pricing, Dashboard, or Bookstore
- **WHEN** the user navigates from the home page to `/studio`, `/pricing`, `/dashboard`, or `/bookstore`
- **THEN** each page displays the warm ivory canvas and complementary vellum cards, maintaining visual continuity without reverting to nocturnal void backgrounds
