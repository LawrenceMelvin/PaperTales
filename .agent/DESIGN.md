# Design System: PaperTales AI (Nocturne Atelier)
**Stitch Project ID:** `9667959733469448334`  
**Stitch Theme:** `Nocturne Atelier`  
**Color Mode:** Dark / Midnight Celestial with Archival Parchment  

---

## 1. Visual Theme & Atmosphere
The design system embodies the intimacy of a midnight workshop and the wonder of master storytelling. It operates at the intersection of classical atelier bookbinding and responsive creative tooling. The aesthetic merges deep celestial darkness with tactile, sun-drenched archival parchment and warm metallic gilding.

* **Emotional Resonance:** Enchanting, reverent, and craftsman-grade. Inspires confidence in print production standards (300 DPI, bleed lines, archival permanence).
* **Design Movement:** **Celestial Editorial Glass & Tactile Skeuomorphism**. Deep obsidian foundations layered with frosted glass controls, illuminated parchment canvases, and embossed antique gold highlights.

---

## 2. Color Palette & Roles

### Midnight & Obsidian Foundations
* **Canvas Ground (`#090D16`):** The infinite celestial void substrate.
* **Surface Layer 1 (`#0D1322`):** Primary structural frames and backdrop containers.
* **Surface Layer 2 (`#141C2E`):** Interactive card backgrounds and elevated sheets.
* **Surface Layer 3 (`#1C263B`):** Hover states and active card highlights.

### Archival Tactile Parchment
* **Virgin Parchment (`#FBF7EE`):** Active book page spreads and live preview canvas.
* **Aged Rag (`#F4EBD9`):** Flyleaf dedications and historical chapter dividers.
* **Pressed Vellum (`#EFE5CE`):** Cardboard backing and cover inner flyleaves.
* **Ink Black (`#1A1A1A`):** High-fidelity monochrome vector linework for coloring pages and story copy.

### Metallic Gold Leaf & Accents
* **Antique Gold Foil (`#E5A93C`):** Primary action buttons, active toggles, and print badges.
* **Specular Gold Highlight (`#F3C668`):** Top border specular reflections and animated sparkles.
* **Debossed Gold Stroke (`#B88022`):** Outer perimeter borders and book crest frames.
* **Celestial Mist (`#6C82A6`):** Trim/bleed indicator lines, grid rulers, and secondary metadata.

---

## 3. Typography Rules
* **Headline & Title Displays:** `Playfair Display` (serif). Evokes centuries of master bookmaking, illuminated drop-caps, and literary prestige.
* **UI Controls & Body Copy:** `Plus Jakarta Sans` (sans-serif). Generous counters and geometric clarity for prompt editing, sliders, and telemetry.
* **Telemetry & Metadata:** `JetBrains Mono` / Monospace for DPI markers, token costs, and PayPal capture IDs.

---

## 4. Component Stylings

### Buttons
* **Primary (Gilded Press):**
  * Gradient: `linear-gradient(135deg, #F3C668 0%, #E5A93C 50%, #B88022 100%)`
  * Text: `#090D16` bold sans.
  * Inset highlight: `inset 0 1px 1px rgba(255, 255, 255, 0.4)`.
  * Glow on hover: `box-shadow: 0 0 24px 0 rgba(229, 169, 60, 0.45)`.
* **Secondary (Ethereal Frosted Glass):**
  * Background: `rgba(255, 255, 255, 0.05)` with `backdrop-filter: blur(16px)`.
  * Border: `1px solid rgba(229, 169, 60, 0.25)`.
  * Text: `#FBF7EE`.

### Cards & 3D Book Spreads
* **Floating 3D Book Spread:**
  * Backdrop: Virgin Parchment (`#FBF7EE`) with simulated central spine crease.
  * Shadow: `0 24px 64px -12px rgba(0, 0, 0, 0.85), 0 0 40px -10px rgba(229, 169, 60, 0.15)`.
  * Corner radius: 1rem on outer covers, 0px at interior binding gutter.
* **Frosted Glass Containers:**
  * Background: `rgba(13, 19, 34, 0.72)` with 20px blur.
  * Border: `1px solid rgba(229, 169, 60, 0.15)`.

### Mascot & Quoter Controls
* **Dynamic Page Slider:** Antique gold track with tactile coin-ridged gold thumb.
* **Token Pills:** Frosted obsidian chips with golden numeral highlights and live USD/INR conversions.
