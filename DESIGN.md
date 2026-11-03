# AEVUM — Visual Identity & Design System Specification

## 1. Visual Direction & Reference

**AEVUM — Art Across Ages** is a digital fine art gallery and curatorial exhibition platform. The visual aesthetic fuses the prestige and solemnity of classical grand European institutions (The Louvre, Kunsthistorisches Museum Vienna, The Met) with contemporary editorial minimalism and dark glassmorphic surfaces.

### Core Aesthetic Pillars

- **Royal Salon Hero:** Full-bleed deep crimson and gilded mahogany gallery atmosphere, subtle ambient depth parallax, and commanding typographic presence.
- **Ivory Editorial Art Journal:** Tactile parchment contrast (`#FAF6EF`) presenting classical sculpture and academic essays with generous negative space and disciplined asymmetric rhythm.
- **Nocturne Pavilion Curatorial Catalog:** Deep charcoal exhibition canvas (`#120F12`), recessed matte artwork presentations, satin antique brass accents, and fine gold borders.
- **Obsidian & Liquid Glass Surfaces:** Frosted backdrop blurs (`backdrop-filter: blur(12px)`), translucent dark acrylic cards, and accessible amber gold hover highlights.

---

## 2. Color Palette & Design Tokens

AEVUM implements a cohesive CSS Custom Properties token architecture in [`styles/style.css`](./styles/style.css):

### 2.1 Color Tokens

| Token                            | Value                       | Role                                           |
| -------------------------------- | --------------------------- | ---------------------------------------------- |
| `--color-aevum-charcoal`         | `#120F12`                   | Nocturne Pavilion primary background           |
| `--color-aevum-charcoal-card`    | `#181418`                   | Artwork card and modal dialog surface          |
| `--color-aevum-charcoal-surface` | `#1E191E`                   | Filter toolbars and elevated containers        |
| `--color-aevum-charcoal-border`  | `rgba(209, 175, 115, 0.22)` | Subtle antique brass structural borders        |
| `--color-aevum-parchment`        | `#FAF6EF`                   | Art Journal and Ivory Header background        |
| `--color-aevum-ink`              | `#1A1612`                   | High-contrast editorial text on light surfaces |
| `--color-aevum-gold`             | `#D1AF73`                   | Primary curatorial gold accent, active states  |
| `--color-aevum-brass`            | `#A68158`                   | Warm antique brass secondary accent            |
| `--color-aevum-crimson`          | `#3D0B14`                   | Royal Salon deep velvet red accent             |
| `--color-obsidian-bg`            | `#0A0D12`                   | Deep space obsidian foundation                 |
| `--color-text-primary`           | `#F1F5F9`                   | Primary readable text on dark surfaces         |
| `--color-text-secondary`         | `#94A3B8`                   | Subtitles, labels, and secondary metadata      |
| `--color-text-tertiary`          | `#64748B`                   | Captions and quiet curatorial annotations      |

---

## 3. Typographic Hierarchy

AEVUM enforces a strict three-tier typographic hierarchy:

1. **Brand Wordmark:**
   - **Font:** `Playfair Display`, Georgia, serif (`var(--font-aevum-wordmark)`)
   - **Usage:** Strictly reserved for the primary AEVUM wordmark (`.brand-text`, `.mobile-wordmark`).
2. **Curatorial Editorial Headings:**
   - **Font:** `Cormorant Garamond`, Garamond, serif (`var(--font-aevum-heading)`)
   - **Usage:** Section titles (_The Curated Collection_, _A World of Art & Antiquities_), department tabs, artwork titles, modal dossier headings, and prices.
   - **Weights:** Regular (400), Medium (500), Semi-bold (600).
3. **Functional Controls & Body Copy:**
   - **Font:** `Inter`, -apple-system, sans-serif (`var(--font-aevum-body)`)
   - **Usage:** Body text, search inputs, dropdown filters, metadata labels, button actions, and toast notices.
   - **Readability:** Set with comfortable line heights (1.5–1.6) and high contrast ratios exceeding WCAG AAA standards on both light and dark canvases.

---

## 4. Spacing, Elevation & Surfaces

- **Base Rhythm:** 4px / 8px / 16px / 24px / 32px / 48px / 64px scale (`var(--space-*)`).
- **Border Radii:** Controlled subtle curves (`--radius-sm: 4px`, `--radius-md: 8px`, `--radius-lg: 12px`). Round pills (`--radius-full: 9999px`) for department filters and badges.
- **Depth & Elevation:**
  - Standard cards: `0 8px 24px rgba(0, 0, 0, 0.45)`.
  - Recessed matting: `inset 0 2px 10px rgba(0, 0, 0, 0.70)` with radial obsidian gradient behind artwork images.
  - Modals & Drawers: `0 24px 64px rgba(0, 0, 0, 0.85)` with `backdrop-filter: blur(12px)`.

---

## 5. Interactive Components & Controls

- **Artwork Cards:** Feature a recessed obsidian mat, `object-fit: contain` rendering to preserve full sculpture heads and landscape margins, golden department badges, hover lift (`translateY(-4px)`), and two distinct actions:
  - _View Artwork:_ Opens the full Curatorial Dossier Modal dialog.
  - _Acquire Piece:_ Simulates acquisition into the local demonstration cart.
- **Department Tabs:** Horizontally scrollable pill tabs with live count indicators, active golden halo glow, and full bidirectional synchronization with the `#category-filter` select dropdown.
- **Curatorial Artwork Modal:** Accessible dialog (`role="dialog"`, `aria-modal="true"`) featuring focus trapping, `Escape` key dismissal, backdrop dismissal, and curatorial research dossiers.
- **Acquisitions Drawer:** Side-sliding cart drawer with item quantity controls, running demo total, clear cart action, and auto-dismissing toast notifications.

---

## 6. Accessibility & Responsive Engineering

- **Semantic Landmark Structure:** Exactly one `<h1>` per page view (`#hero-main-title`), followed by semantic `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<aside>`, and `<footer>`.
- **Form Controls:** Every text input and select element is linked to an accessible `<label>` via `id` and `for`.
- **Keyboard Navigation:** High-visibility `:focus-visible` golden focus rings (`2px solid #D1AF73`, `outline-offset: 3px`) across all interactive elements.
- **ARIA Live Regions:** Dynamic announcements powered by `#product-results-announcer`, `#cart-announcer`, and `#toasts`.
- **Reduced Motion (`prefers-reduced-motion: reduce`):** Disables parallax translation, smooth scroll transitions, and hero canvas animations, rendering all content fully visible instantly.
- **Viewport Testing:** Tested with zero horizontal overflow across all device viewports:
  - 320px (iPhone SE narrow)
  - 375px (iPhone SE2)
  - 390px (iPhone 14)
  - 430px (iPhone Pro Max)
  - 768px (Tablet portrait)
  - 1440px (Desktop wide)

---

## 7. Curatorial Truthfulness & Integrity Decisions

1. **Complete Artwork Visibility:** Abandoned aggressive `object-fit: cover` cropping in favor of `object-fit: contain` within recessed frames. Sculptures, chalices, and wide oil canvases are presented without artificial cropping.
2. **Honest Attribution:** Works without authenticated historical documentation are explicitly labeled `Attribution Pending Verification` rather than fabricating academic attributions.
3. **Preserved Watermarks:** Photographic watermarks present on research source files are preserved intact, accompanied by explicit curatorial reproduction notices.
4. **Educational Portfolio Pricing:** Clearly labeled as fictional portfolio values with non-commercial demo simulation.
