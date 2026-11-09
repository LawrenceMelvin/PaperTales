# Tasks: Site-Wide Warm Sunlit Atelier Redesign

## 1. Landing Page 3D Book & Contrast Rectification

- [x] 1.1 Update `Interactive3DBook.tsx` section header, badge, and subtitle to high-contrast charcoal ink (`#1E2530`) and verify visual contrast against the ivory canvas
- [x] 1.2 Redesign the 4-tab book type switcher in `Interactive3DBook.tsx` into a warm vellum tray (`bg-[#FAF6EE]`, `border-[#E8DFD3]`) with amber-gold active highlighting and verify interactive switching
- [x] 1.3 Fix action button contrast in `Interactive3DBook.tsx` so "Click to Open Interior Spread" and "Design This in Studio" have bold, legible typography and verify button hover states
- [x] 1.4 Restyle 3D book cover and open 2-page interior spread in `Interactive3DBook.tsx` with archival cream paper (`bg-[#FFFDF8]`), charcoal text, and crisp monochrome vector linework, and verify spread toggling

## 2. Studio Route Warm Atelier Migration

- [x] 2.1 Update `src/app/studio/page.tsx` outer container from dark void (`#0a0e1a`) to warm ivory (`#FFFDF9`) and replace dark aurora glows with soft amber ambient lighting
- [x] 2.2 Restyle Studio copilot discussion canvas, genre lane tabs, character anchor card, and prompt inputs with warm vellum surfaces and charcoal typography
- [x] 2.3 Update `src/components/BookViewer.tsx` to render interior pages on warm cream archival book paper with subtle spine crease shadows
- [x] 2.4 Update Channel3 companion product cards, book details modal, and order confirmation modals in Studio to match the warm atelier palette

## 3. Pricing Route Warm Atelier Migration

- [x] 3.1 Update `src/app/pricing/page.tsx` canvas and hero typography to warm ivory and editorial charcoal ink
- [x] 3.2 Update `src/components/PricingCalculator.tsx` slider, tier breakdown cards, and margin gauge to warm atelier tokens while preserving exact 62% profit margin calculations

## 4. Dashboard & Bookstore Routes Warm Atelier Migration

- [x] 4.1 Update `src/app/dashboard/page.tsx` and `src/components/OrdersDataGrid.tsx` with warm ivory canvas, vellum KPI metric cards, and clean AG Grid light quartz styling
- [x] 4.2 Update `src/app/bookstore/page.tsx` shelf category pills, search bar, and catalog cards to the warm sunlit aesthetic

## 5. Verification & Smoke Testing

- [x] 5.1 Run `npm run build` and verify that all App Router pages compile with zero TypeScript or JSX errors
- [x] 5.2 Run `npm test` and verify that 100% of core backend smoke tests pass (PayPal orders, Lulu quotes, PDF compiler, dynamic pricing at 62% margin)
