# Design System: PaperTales AI — Glacier Glassmorphism Studio
**Stitch Asset ID:** `assets/7676357966924276963`  
**Stitch Theme Name:** `Glacier`  
**Stitch Project ID:** `9667959733469448334`  
**North Star:** *"Frozen Light"* — Ethereal depth through layered translucent surfaces. Dark, atmospheric, and premium.

---

## 1. Core Visual Philosophy
* **Atmosphere:** Ethereal translucent depth, pristine arctic frost, and glowing crystalline structures.
* **Aesthetic Movement:** **Glacier Glassmorphism**. Interfaces feel like finely crafted layers of frosted ice and crystalline glass floating over a deep nocturnal abyss.
* **Core Rule:** Never use opaque solid backgrounds on floating elements. Depth is achieved through blur intensity and opacity, not harsh drop shadows.

---

## 2. Color Palette & Functional Roles

| Token Name | Hex / RGBA | Functional Role in PaperTales AI |
| :--- | :--- | :--- |
| **Primary (Ice-Blue)** | `#7dd3fc` | Primary interactive elements, active links, glow rings, and progress markers. |
| **Background (Void)** | `#0a0e1a` | Deep nocturnal navy-black substrate. |
| **Surface Dim / Surface** | `#0f1524` | Foundation glass canvas layer. |
| **Surface Container** | `#141c2e` | Layer 1 glass panels (60% opacity + 16px blur). |
| **Surface High / Elevated** | `#1a2438` | Layer 2 elevated sheets (75% opacity + 24px blur). |
| **Tertiary (Soft Lavender)** | `#c8a0f0` | Secondary accents, AI badges, and token counter highlights. |
| **Text Primary (`on_surface`)** | `#e0e8f0` | Crisp high-contrast crystalline white for headlines and body text. |
| **Text Secondary (`on_surface_variant`)** | `#a0b4c4` | Muted ice-slate for subtitles, timestamps, and metadata. |
| **Outline / Border** | `rgba(125, 211, 252, 0.12)` | Subtle luminous hairline borders (8–15% opacity). |
| **Interactive Glow** | `rgba(125, 211, 252, 0.25)` | Focused states, active buttons, and hover coronas. |

---

## 3. Glassmorphic Surface Architecture

### Layer 0: The Deep Abyss
* `background: #0a0e1a`
* Solid, non-distracting background with subtle radial blue-violet glows.

### Layer 1: Standard Glass Panels (`.glacier-card`)
* `background: rgba(15, 21, 36, 0.6)`
* `backdrop-filter: blur(16px)`
* `border: 1px solid rgba(125, 211, 252, 0.12)`
* `box-shadow: 0 0 30px rgba(125, 211, 252, 0.05)`
* Corner radius: `12px` to `16px` (`rounded-xl` to `rounded-2xl`)

### Layer 2: Elevated Interactive Glass (`.glacier-card-elevated`)
* `background: rgba(15, 21, 36, 0.75)`
* `backdrop-filter: blur(24px)`
* `border: 1px solid rgba(125, 211, 252, 0.25)`
* `box-shadow: 0 16px 40px -8px rgba(0, 0, 0, 0.6), 0 0 25px rgba(125, 211, 252, 0.1)`

---

## 4. Typography & Geometry
* **Font Family:** `Inter` across all headings, controls, and body copy for sleek, modern, precision-engineered legibility.
* **Headlines:** Semibold / Bold (`font-semibold` / `font-extrabold`), slightly tracked (`tracking-tight`).
* **Body:** Regular weight (`font-normal` / `font-medium`), airy leading.
* **Curvature:** `ROUND_TWELVE` (12px / `rounded-xl`).
* **Buttons:** Semi-transparent ice-blue background with thin luminous border; opacity increases dynamically on hover.

---

## 5. Strict Design Rules (From Stitch MCP)
1. **Never use opaque solid backgrounds** on cards, modals, or floating controls.
2. **Keep borders subtle and luminous**, not heavy or structural.
3. **Limit glow effects to interactive states** (hover, focus, active).
