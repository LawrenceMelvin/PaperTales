# Design: Site-Wide Warm Sunlit Atelier Redesign

## Context

The initial redesign effort migrated `src/app/page.tsx` canvas tokens to the Warm Sunlit Atelier theme. However, embedded sub-components (notably `Interactive3DBook.tsx`) still retain hardcoded white typography and dark slate pills designed for the legacy `#0a0e1a` background, creating severe contrast drop-offs. Additionally, secondary routes (`/studio`, `/pricing`, `/dashboard`, `/bookstore`) still use the legacy dark glacier layout. 

See `proposal.md` for motivation and scope boundaries.

## Goals / Non-Goals

**Goals:**
- Attain WCAG AA/AAA compliant text contrast (minimum 4.5:1 ratio for body copy, 14:1+ for main headings) across all surfaces.
- Transform `Interactive3DBook.tsx` into a tactile, realistic physical book experience with archival linen/paper spreads.
- Harmonize `/studio`, `/pricing`, `/dashboard`, and `/bookstore` under the warm ivory `#FFFDF9` canvas with vellum cards (`#FAF6EE`), crisp charcoal typography (`#1E2530`), and honey-amber action elements.
- Maintain seamless responsiveness across mobile, tablet, and desktop viewports.

**Non-Goals:**
- Modifying any server-side logic (`/api/paypal/*`, `/api/lulu/*`, `/api/channel3/*`, `/api/pdf/*`).
- Changing book creation state machines, AI prompts, or dynamic pricing formulas.
- Altering the economic parameters (first 5 free, $0.17/page, $0.065 COGS, 62% margin).

## Decisions

### Decision 1: Shared Surface Token Architecture
- **Approach:** Standardize all page containers on `min-h-screen bg-[#FFFDF9] text-[#1E2530] font-sans`. Replace dark aurora background blobs (`bg-sky-400/10`, `bg-purple-500/10`) with soft sunlit ambient blurs (`bg-amber-400/10`, `bg-orange-300/10`, `blur-[140px]`).
- **Surface Hierarchy:**
  - Base canvas: `#FFFDF9` (warm ivory)
  - Card/container surface: `#FAF6EE` (warm linen) with border `#E8DFD3`
  - Elevated/interactive card: `#F5EFE6` (vellum) with subtle warm shadow
  - Primary button: `bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold shadow-md shadow-amber-500/20`
  - Secondary button: `bg-white border border-[#E8DFD3] text-[#1E2530] hover:bg-[#FAF6EE] hover:border-amber-400 font-bold shadow-sm`
- **Alternatives Considered:** Complete dark mode toggle. *Rejected* because children's storybook publishing and print physical proofs are inherently physical paper and ink media.

### Decision 2: 3D Book Inspector Realistic Paper Interior
- **Approach:** When `isOpen` is toggled in `Interactive3DBook.tsx`, the two interior pages will render on archival cream book paper (`bg-[#FFFDF8]` with subtle paper texture and inner crease shadow). Typography will render in deep charcoal `#1E2530` and dark sepia `#78350F`. SVG vector line-art will use crisp black-and-white vector strokes matching real Lulu coloring book pages.
- **Alternatives Considered:** Keeping dark interior pages. *Rejected* because dark interior pages look like software screens rather than physical softcover books ready for crayon coloring.

### Decision 3: Studio Workflow Contrast & Component Styling
- **Approach:** In `/studio`:
  - Discussion and planning canvas: Ivory background with vellum card boundaries (`#FAF6EE`), amber active indicators, and high-contrast dark text.
  - Page count slider: Honey-amber accent (`accent-amber-500`) with cream track.
  - Channel3 companion art kit cards: Warm white cards with amber pricing badges and subtle border hover rings.
  - WYSIWYG `BookViewer.tsx`: Render interior spreads with archival paper styling, crisp page edges, and soft book shadows.

### Decision 4: Dashboard & Bookstore Harmonization
- **Approach:**
  - In `/dashboard`: Switch KPI metric cards from dark glass to warm vellum cards. Ensure the AG Grid renders with `ag-theme-quartz` in light mode with clean borders.
  - In `/bookstore`: Convert dark category shelf selector pills into warm linen pills, with active category in rich amber-gold.

## Risks / Trade-offs

- **[Risk: AG Grid contrast in light mode]** → Mitigation: Use standard `ag-theme-quartz` without dark mode overrides, ensuring header backgrounds and cell text have clear contrast.
- **[Risk: Legacy CSS classes in older components]** → Mitigation: Preserve helper mappings in `globals.css` (e.g. `.glacier-card`, `.glacier-btn`) that map cleanly to warm atelier equivalents as fallbacks.
- **[Risk: Interactive state regressions in Studio]** → Mitigation: Only touch layout/container Tailwind classes, leaving all state hooks (`useState`, `useEffect`), handlers, and API fetch calls completely untouched.

## Migration Plan

1. **Step 1:** Update `src/components/Interactive3DBook.tsx` (contrast and realistic paper interior).
2. **Step 2:** Update `src/app/studio/page.tsx` and `src/components/BookViewer.tsx`.
3. **Step 3:** Update `src/app/pricing/page.tsx` and `src/components/PricingCalculator.tsx`.
4. **Step 4:** Update `src/app/dashboard/page.tsx` and `src/components/OrdersDataGrid.tsx`.
5. **Step 5:** Update `src/app/bookstore/page.tsx`.
6. **Step 6:** Run `npm run build` and `npm test` to empirically verify zero build errors and 100% test pass rate.
