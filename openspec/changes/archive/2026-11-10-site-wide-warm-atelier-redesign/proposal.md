# Proposal: Site-Wide Warm Sunlit Atelier Redesign & Contrast Rectification

## Why

While the main landing page canvas was migrated to the Warm Sunlit Atelier design system, high-contrast readability defects remain on the landing page (specifically white typography and white glass buttons washing out against the ivory `#FFFDF9` canvas in the interactive 3D book section). Furthermore, the rest of the application (`/studio`, `/pricing`, `/dashboard`, and `/bookstore`) remains on the legacy dark nocturnal glacier palette (`#0a0e1a` with cyan neon accents). This creates jarring visual discontinuity across the user journey and makes text in several key areas unreadable.

Redesigning the 3D book showcase and extending the Warm Sunlit Atelier theme across all sub-pages establishes a cohesive, inviting, children's literature publishing experience with WCAG AA/AAA compliant text contrast, while leaving all underlying backend and economic logic untouched.

## What Changes

- **Main Page 3D Book (`Interactive3DBook.tsx`) Overhaul:**
  - Replace washed-out white text (`text-white`, `#a0b4c4`) on ivory backgrounds with high-contrast editorial charcoal (`#1E2530`) headings and readable body text.
  - Redesign the clashing dark slate 4-tab switcher bar (`bg-slate-900/80`) into a warm artisanal vellum container (`bg-[#FAF6EE]` / `border-[#E8DFD3]`) with honey-amber active tabs.
  - Fix white-on-white button contrast for the "Click to Open Interior Spread" trigger.
  - Restyle the 3D book covers with gilded foil embossing and luxury warm amber drop shadows.
  - Convert the open 2-page interior spread from dark navy to authentic printed archival cream paper (`bg-[#FFFDF8]`), charcoal text, and crisp monochrome vector line art.
- **Studio Redesign (`/studio`, `BookViewer.tsx`, modal dialogs):**
  - Transition the canvas from dark `#0a0e1a` to warm ivory `#FFFDF9`.
  - Style discussion cards, prompt inputs, character anchors, and genre lane tabs with warm vellum surfaces, amber highlights, and charcoal typography.
  - Update `BookViewer.tsx` to match the warm physical paper aesthetic.
  - Restyle Channel3 companion art kit cards, book details modal, and order confirmation modals with warm atelier tokens.
- **Pricing Route Redesign (`/pricing`, `PricingCalculator.tsx`):**
  - Migrate the page from dark glassmorphism to warm sunlit atelier parchment cards.
  - Update the dynamic pricing calculator (slider, margin gauge, and breakdown cards) with honey amber accents, retaining exact 62% margin logic and freemium rules.
- **Dashboard & Operations Portal (`/dashboard`, `OrdersDataGrid.tsx`):**
  - Update background and KPI metric stat cards to warm ivory/linen surfaces.
  - Align AG Grid styling with the light quartz atelier theme.
- **Bookstore Route (`/bookstore`):**
  - Migrate shelf selector pills, search bars, filter buttons, and book catalog grid to the warm sunlit palette.

## Capabilities

### New Capabilities
- `site-visual-theme`: Defines site-wide typography contrast, color tokens, and layout surfaces for the Warm Sunlit Atelier design system across all client-facing routes.

### Modified Capabilities
- `studio-page-planning-and-preview`: Updates UI visual presentation, theme styling, and component tokens for the studio co-creation studio and live preview reader without modifying any AI generation, editing, or state management logic.

## Impact

- **Affected Files:**
  - `src/components/Interactive3DBook.tsx`
  - `src/app/studio/page.tsx`
  - `src/components/BookViewer.tsx`
  - `src/app/pricing/page.tsx`
  - `src/components/PricingCalculator.tsx`
  - `src/app/dashboard/page.tsx`
  - `src/components/OrdersDataGrid.tsx`
  - `src/app/bookstore/page.tsx`
- **Zero Backend or Financial Impact:**
  - All PayPal checkout and capture endpoints (`/api/paypal/*`) remain untouched.
  - Lulu Print-on-Demand integration (`/api/lulu/*`) and PDF compiler (`/api/pdf/compile`) remain untouched.
  - Channel3 affiliate suggestions API (`/api/channel3/suggest`) remains untouched.
  - Economic formulas (first 5 free, $0.17/page, $0.065 COGS, 62% margin) remain strictly preserved.
