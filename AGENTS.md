# AEVUM / ShopBoard — Canonical Agent Instructions & Engineering Rules

## 1. Project Overview

AEVUM — Art Across Ages (built on the CorePro ShopBoard architecture) is an educational fine art gallery and digital exhibition storefront. It showcases clean, accessible, and responsive frontend architecture using strict TypeScript, feature-based modular design, dual-mode catalog architecture (AEVUM Nocturne Pavilion vs. Course Compatibility Mode), and modern web standards with zero external UI frameworks.

## 2. Technology Stack

- **Bundler & Dev Server:** Vite 8 (TypeScript + Vanilla Web Standards)
- **Language:** Strict TypeScript 7 (`"strict": true`, `"noUnusedLocals": true`, `"noEmit": true`)
- **Markup:** Semantic HTML5 (Single `<h1>`, accessible landmarks, linked `<label>`s, ARIA live regions)
- **Styles:** Mobile-first CSS3 (Strictly zero `!important`, CSS custom properties design tokens)
- **Quality & Guardrail Tools:** TypeScript (`tsc`), Prettier, ESLint 10, Husky 9, lint-staged 17, Node.js Test Runner (v22+)

## 3. Folder Structure & Architectural Blueprint

```text
├── index.html                           # Single HTML entry point (semantic landmarks, accessible regions)
├── tsconfig.json                        # Strict TypeScript configuration
├── package.json                         # Scripts, dependencies, lint-staged config
├── eslint.config.js                     # ESLint configuration
├── .prettierrc                          # Prettier code style configuration
├── .husky/                              # Git hooks (pre-commit invokes lint-staged)
├── DESIGN.md                            # Comprehensive design system & specification
├── README.md                            # Project documentation, setup, and mode guide
├── AGENTS.md                            # Canonical AI agent instructions (this document)
├── public/
│   ├── assets/
│   │   ├── catalog/                     # Curated exhibition artwork images (antiques, ceramics, paintings, sculptures)
│   │   ├── hero/                        # Royal Salon hero imagery (WebP responsive assets)
│   │   └── journal/                     # Art Journal editorial assets (Winged Victory WebP)
│   ├── favicon.svg                      # AEVUM monogram favicon
│   └── icons.svg                        # SVG symbol sprite definitions
├── src/
│   ├── main.ts                          # Application bootstrap & catalog mode routing
│   ├── ui.ts                            # UI coordinator (event delegation, viewfinder, parallax, observer)
│   ├── logic.ts                         # Logic barrel re-exporting product and cart calculation logic
│   ├── state.ts                         # State barrel re-exporting cart state operations
│   ├── data.ts                          # Preserved 12 digital products catalog for Course Mode reference
│   ├── style.css                        # Design token system & visual styles (Obsidian, Nocturne & Liquid Glass)
│   ├── shared/
│   │   ├── api/client.ts                # Generic fetchJson<T> client, ApiError, and API base URL resolution
│   │   └── ui/toast.ts                  # Centralized accessible toast notification system
│   └── modules/
│       ├── artworks/                    # AEVUM Fine Art Gallery domain
│       │   ├── artworks.data.ts         # 16 canonical artwork records with curatorial research metadata
│       │   ├── artworks.types.ts        # Artwork, ArtworkCategory, CuratorialLicense, SaleStatus types
│       │   └── artworks.ui.ts           # Curatorial Artwork Details modal dialog & dossier renderer
│       ├── catalog/                     # Application mode management
│       │   └── catalog.mode.ts          # Mode detection (Default Gallery vs Course Mode via query params)
│       ├── products/                    # Course ShopBoard catalog & REST API domain
│       │   ├── products.api.ts          # ApiProduct wire types, runtime validators, toProduct() mapper
│       │   ├── products.logic.ts        # Pure search, filter, sort, and grouping functions
│       │   ├── products.types.ts        # Product, Category, LoadState types
│       │   └── products.ui.ts           # Nocturne Pavilion card grid, department tabs, toolbar delegation
│       └── cart/                        # Shopping cart & acquisition state
│           ├── cart.logic.ts            # Pure cart math (line total, total items, line sum)
│           ├── cart.state.ts            # LocalStorage persistence, safe deserialization, cart operations
│           ├── cart.types.ts            # CartItem, Cart, AddableProduct types
│           └── cart.ui.ts               # Acquisitions sidebar drawer renderer and event handlers
└── tests/
    ├── cdp.mjs                          # Zero-dependency Chrome DevTools Protocol test harness
    ├── test-logic.mjs                   # Unit tests: pure filtering, sorting, and cart calculations
    ├── test-state.mjs                   # Unit tests: cart state operations and defensive localStorage handling
    ├── test-api.mjs                     # Unit tests: API client, schema validation, and toProduct mapper
    ├── test-browser-interaction.mjs     # Browser tests: Course Mode compatibility and interaction flows
    ├── test-gallery-interaction.mjs     # Browser tests: Nocturne Pavilion Gallery Mode regression suite
    └── test-mobile-responsive.mjs       # Responsive tests: zero horizontal overflow audit across 6 viewports
```

## 4. Where to Add New Features

1. **Fine Art Gallery Features (Artworks, Salons, Exhibition Metadata):**
   - Add data and schema models to `src/modules/artworks/artworks.data.ts` and `artworks.types.ts`.
   - Add modal and curatorial presentation components to `src/modules/artworks/artworks.ui.ts`.
2. **Course REST API & Product Storefront:**
   - Add endpoint consumers and mappers to `src/modules/products/products.api.ts`.
   - Add pure filtering/sorting algorithms to `src/modules/products/products.logic.ts`.
   - Add catalog card and toolbar interaction handlers to `src/modules/products/products.ui.ts`.
3. **Acquisitions & Shopping Cart:**
   - Add pure calculation logic to `src/modules/cart/cart.logic.ts`.
   - Add state mutations and safe storage schema handlers to `src/modules/cart/cart.state.ts`.
   - Add drawer rendering and interactive controls to `src/modules/cart/cart.ui.ts`.
4. **Application Mode & Routing:**
   - Configure query parameters and runtime mode selection in `src/modules/catalog/catalog.mode.ts`.
   - Bootstrap mode initialization in `src/main.ts`.
5. **Cross-Cutting Utilities:**
   - Shared network logic belongs in `src/shared/api/`.
   - Shared toast notifications belong in `src/shared/ui/`.

## 5. Code Conventions & Strict TypeScript Hygiene

1. **Strict TypeScript:** Prohibited in authored TypeScript: `any`, unsafe `as` type assertions, and postfix `!` non-null assertions. Use type guards (`isRecord`, `isCategory`), proper DOM narrowing (`instanceof HTMLElement`), and discriminated unions (`LoadState`).
2. **Array Immutability:** Never mutate input arrays in pure logic functions. Always shallow-copy (`[...products]`) before sorting or filtering.
3. **Strict DOM Ownership:** Only UI modules touch DOM globals (`window`, `document`, `querySelector`, `innerHTML`, `addEventListener`). Pure logic modules must remain 100% deterministic and runnable in bare Node.js.
4. **Event Delegation:** Never register event listeners inside rendering functions. Register event listeners once on stable container elements (`#products-grid`, `#cart-items-container`, `#gallery-department-tabs`) using event delegation (`event.target.closest()`).
5. **Defensive Storage & API Parsing:** Wrap all `JSON.parse()` calls in `try...catch`. Validate shapes at runtime via schema guards before committing to application state.
6. **Mobile-First CSS:** Author styles starting at mobile viewports with `min-width` media queries. Zero `!important` permitted. Ensure zero horizontal page overflow across all viewports (320px to 1440px).

## 6. Rules Derived from Real Project AI Mistakes

These enforceable rules address specific failure modes observed during previous AI agent sprints in this codebase:

### Rule A — Ground Truth Artwork Availability

- **Mistake Observed:** An AI agent arbitrarily marked two canonical artworks (`aevum-sculpture-03` and `aevum-object-04`) as "Unavailable / Out of Stock" without user instruction, inventing false acquisition histories.
- **Enforceable Rule:** All 16 canonical gallery artworks must remain active (`inStock: true`, `saleStatus: "In Exhibition"`) unless the user explicitly requests otherwise. Never invent sales, acquisitions, or provenance states. Preserve the Course Mode out-of-stock behavior completely separate from the Gallery collection.

### Rule B — Code-to-Report Reconciliation Before Reporting

- **Mistake Observed:** An AI agent generated an audit report claiming artwork title mismatches (e.g. "Napoleon in His Study" vs. bust) when the actual TypeScript source code already contained the correct descriptive titles.
- **Enforceable Rule:** Always inspect the actual source files and running DOM before generating reports or asserting defects. Distinguish Markdown documentation mistakes from actual codebase bugs.

### Rule C — Mode Isolation & Zero API Leakage

- **Mistake Observed:** AI implementations allowed course API wire assumptions (such as `price_cents` or network failure handling) to leak into the local gallery catalog, causing the gallery to fail when the external API was unreachable.
- **Enforceable Rule:** Default Gallery Mode (`/`) must remain 100% autonomous, local, and resilient against network outages. The external course REST API (`https://shopboard-api.vercel.app`) belongs strictly to Course Mode (`/index.html?mode=course`). Network timeouts on the external API must never crash or disable the gallery.

### Rule D — Living Interface Synchronization

- **Mistake Observed:** As features progressed from planning to completion (e.g. Curated Collection gallery, department filters, Art Journal), navigation links, badges, and Hero CTA copy remained stale ("Upcoming", "In Curation", or displaying placeholder toasts).
- **Enforceable Rule:** When an exhibition section or department becomes active, update all corresponding interface elements: navigation links must scroll to or filter the section, badges must reflect live exhibition status, and CTAs must directly enter active experiences.

## 7. Testing & Quality Verification

Run every verification command before submitting:

```bash
npm run typecheck         # Verify 0 TypeScript errors (tsc --noEmit)
npm run lint              # Verify 0 ESLint errors and warnings
npm run format:check      # Verify Prettier code style
npm test                  # Run Node.js unit tests (logic, state, api)
npm run build             # Verify Vite production build succeeds
npm run test:browser      # Verify Course Mode compatibility (Chromium CDP)
npm run test:gallery      # Verify Nocturne Pavilion Gallery Mode (Chromium CDP)
npm run test:responsive   # Verify zero horizontal overflow (320px–1440px)
```
