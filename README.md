# AEVUM — Art Across Ages

**CorePro Software Development Using AI — Frontend Capstone Project**  
Repository: [https://github.com/m7devcore/shopboard](https://github.com/m7devcore/shopboard)  
Default Branch: `main`

---

## 1. Project Overview & Architecture

**AEVUM — Art Across Ages** is a digital fine art gallery and curatorial exhibition platform developed as part of the CorePro program. Built on an enterprise-grade vanilla TypeScript architecture, the application combines museum-quality editorial aesthetics with strict frontend software engineering standards.

### Dual-Mode Application Architecture

The platform supports two distinct modes accessible via URL query routing:

1. **Default Gallery Mode (`/`):**
   - **Identity:** AEVUM — Nocturne Pavilion & Royal Salon.
   - **Data Source:** High-fidelity local curated art records ([`src/modules/artworks/artworks.data.ts`](file:///C:/Mahmoud%20Alminavi/CorePro/shopboard/src/modules/artworks/artworks.data.ts)) with 16 canonical historical records across six curatorial departments (Paintings, Sculptures, Decorative Antiques, Ceramics & Glass, Prints & Editions, Curiosities).
   - **Resilience:** 100% self-contained and completely independent of external network availability.
2. **Course Compatibility Mode (`/index.html?mode=course`):**
   - **Identity:** ShopBoard Production Storefront (Day 2 & Day 3).
   - **Data Source:** Live REST API integration (`https://shopboard-api.vercel.app/api/products`) with runtime schema validation, wire-to-domain mapping (`toProduct`), out-of-stock handling, and async `LoadState` error/retry states.

---

## 2. Technology Stack & Toolchain

- **Bundler & Build Tool:** [Vite](https://vitejs.dev/) v8 (Vanilla TypeScript, optimized production asset bundling)
- **Language:** [TypeScript](https://www.typescriptlang.org/) v7 (Strict mode: `"strict": true`, `"noUnusedLocals": true`, `"noEmit": true`)
- **Markup:** Semantic HTML5 (Single `<h1>`, accessible landmarks, linked `<label>`s, native HTML validation, ARIA live regions)
- **Styling:** Mobile-first CSS3 with CSS Custom Properties, glassmorphism filters, zero `!important`, and full responsive media queries
- **Code Quality & Guardrails:**
  - `tsc --noEmit` for static type safety (zero `any`, zero unsafe `as`, zero `!`)
  - [Prettier](https://prettier.io/) for automated code formatting
  - [ESLint](https://eslint.org/) (Flat config v10) for linting and code hygiene
  - [Husky](https://typicode.github.io/husky/) & [lint-staged](https://github.com/lint-staged/lint-staged) for automated pre-commit quality enforcement
  - Built-in [Node.js Test Runner](https://nodejs.org/api/test.html) (`node:test`)
  - Zero-dependency Chrome DevTools Protocol (CDP) test harness for headless browser and responsive verification

---

## 3. Getting Started & Installation

### Prerequisites

- **Node.js**: v22.6+ or v26+ (supports native TypeScript execution for tests and native WebSocket for CDP browser tests)
- **npm**: v10+
- **Git**

### Installation

```bash
git clone https://github.com/m7devcore/shopboard.git
cd shopboard
npm install
```

### Running the Development Server

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

### Production Build & Preview

```bash
npm run build
npm run preview
```

---

## 4. Verification & Testing Commands

All quality gates run locally and must pass with zero errors:

| Command                   | Description                                                 | Tool                    |
| ------------------------- | ----------------------------------------------------------- | ----------------------- |
| `npm run typecheck`       | Static type checking with zero errors                       | `tsc --noEmit`          |
| `npm run lint`            | Code quality and hygiene linting                            | `eslint .`              |
| `npm run format:check`    | Code style and formatting check                             | `prettier --check .`    |
| `npm run format`          | Auto-format files to code style                             | `prettier --write .`    |
| `npm test`                | Automated unit test suite (38 passing tests)                | `node --test`           |
| `npm run build`           | Production client bundling to `dist/`                       | `vite build`            |
| `npm run test:browser`    | Course Mode browser interaction & API test suite            | CDP / Headless Chromium |
| `npm run test:gallery`    | Nocturne Pavilion Gallery interaction & modal test suite    | CDP / Headless Chromium |
| `npm run test:responsive` | Responsive overflow audit across 6 viewports (320px–1440px) | CDP / Headless Chromium |

---

## 5. Architectural Blueprint

The codebase adheres strictly to feature-based modular design:

```text
src/
├── main.ts                          # Bootstrap: initializes cart state, detects mode, routes catalog
├── ui.ts                            # UI Coordinator: event delegation, hero parallax, art journal observer
├── logic.ts                         # Pure logic barrel (filtering, sorting, cart calculations)
├── state.ts                         # Cart state barrel (localStorage synchronization)
├── data.ts                          # Original Day 2 digital products dataset (preserved for reference)
├── style.css                        # Design token system, AEVUM museum identity & glassmorphic styles
├── shared/
│   ├── api/client.ts                # Generic fetchJson<T> client, ApiError, runtime base URL resolver
│   └── ui/toast.ts                  # Centralized accessible toast notification renderer
└── modules/
    ├── artworks/                    # AEVUM Fine Art domain
    │   ├── artworks.data.ts         # 16 canonical artwork records with curatorial research metadata
    │   ├── artworks.types.ts        # Artwork, ArtworkCategory, CuratorialLicense, SaleStatus
    │   └── artworks.ui.ts           # Curatorial Artwork Details modal dialog & dossier renderer
    ├── catalog/                     # Application mode management
    │   └── catalog.mode.ts          # Dual-mode detection (Gallery vs Course Mode)
    ├── products/                    # Course ShopBoard catalog & REST API domain
    │   ├── products.api.ts          # ApiProduct wire types, runtime validators, toProduct() mapper
    │   ├── products.logic.ts        # Pure search, filter, sort, and grouping algorithms
    │   ├── products.types.ts        # Product, Category, CategoryFilter, SortOrder, LoadState
    │   └── products.ui.ts           # Nocturne Pavilion card grid, department tabs, toolbar delegation
    └── cart/                        # Shopping cart & acquisitions domain
        ├── cart.logic.ts            # Pure cart math (line totals, item counts, order sums)
        ├── cart.state.ts            # LocalStorage persistence, safe deserialization, mutations
        ├── cart.types.ts            # CartItem, Cart, AddableProduct
        └── cart.ui.ts               # Acquisitions sidebar drawer renderer and event handlers
```

---

## 6. Supported Features & User Experience

- **Royal Salon Hero:** Immersive full-bleed exhibition hall with subtle, damped ambient parallax depth on desktop (`prefers-reduced-motion` compliant).
- **Ivory Editorial Art Journal:** High-contrast parchment spread (`#FAF6EF`) presenting classical sculpture analysis and single-trigger scroll entrance observer.
- **Nocturne Pavilion Curatorial Catalog:**
  - 16 canonical exhibition pieces displayed across six curatorial departments.
  - Complete artwork image preservation using recessed obsidian matting and `object-fit: contain` (zero cropped sculpture heads or clipped landscape margins).
  - Bidirectional synchronization between horizontal department tabs and the dropdown select filter.
  - Real-time title search and case-insensitive keyword filtering.
  - Price sorting (ascending, descending, and restoration of default curatorial order).
  - Curatorial "Department in Preparation" placard when viewing upcoming departments (_Prints & Editions_, _Curiosities_).
- **Curatorial Artwork Details Modal:** Accessible modal dialog (`role="dialog"`, `aria-modal="true"`) featuring full curatorial dossier metadata, research summaries, intact watermark reproduction notices, focus trapping, and `Escape` key dismissal.
- **Acquisitions Drawer:** Side-sliding shopping cart drawer with quantity adjustments, running portfolio total, one-click Clear Cart action, and accessible auto-dismissing toast announcements.
- **Private Viewing Inquiries Form:** Accessible registration form with native HTML5 validation and feedback styling.

---

## 7. Portfolio & Educational Demonstrations (Limitations)

- **Fictional Acquisition Pricing:** All indicated values ($\ge \$80,000$ USD) represent educational portfolio demonstrations. Zero financial transactions, payment gateways, or commercial checkouts exist.
- **Archival Reproductions & Watermarks:** Photographic watermarks present on research source imagery (e.g. `@Artmajeur.com` on the Napoleon bust and `RIYAZI MUZAMMIL 2009` on the chased brass goblet) are preserved intact with explicit curatorial reproduction notices in accordance with ethical image standards.
- **Curatorial Attributions:** Artworks lacking verified primary-source provenance records are explicitly labeled `Attribution Pending Verification`.

---

## 8. License & Academic Attribution

Developed as an educational assignment for the **CorePro Software Development Using AI** program. All software architecture, TypeScript modules, styles, and test suites are authored for portfolio presentation.
