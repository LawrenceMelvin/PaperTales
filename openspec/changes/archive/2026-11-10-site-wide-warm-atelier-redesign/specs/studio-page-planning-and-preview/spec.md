# Spec Delta: studio-page-planning-and-preview

## MODIFIED Requirements

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
